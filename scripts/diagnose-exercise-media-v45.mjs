import fs from 'node:fs/promises';

const SOURCE_FILES = ['app.js', 'exercise-library-extra.js'];
const PROVIDER_API = 'https://oss.exercisedb.dev/api/v1/exercises';
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const normalize = value => String(value || '')
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/\btricep\b/g, 'triceps')
  .replace(/\bbicep\b/g, 'biceps')
  .replace(/\bpushups?\b/g, 'push up')
  .replace(/\bpullups?\b/g, 'pull up')
  .replace(/\bchinups?\b/g, 'chin up')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim().replace(/\s+/g, ' ')
  .split(' ')
  .map(t => ({raises:'raise',curls:'curl',rows:'row',extensions:'extension',presses:'press',flyes:'fly',flys:'fly',lunges:'lunge',squats:'squat'}[t] || t))
  .join(' ');

const signature = value => normalize(value).split(' ').filter(Boolean).sort().join(' ');

function extract(source) {
  const rows=[];
  const re=/\{\s*(?:"?id"?)\s*:\s*["']([^"']+)["']\s*,\s*(?:"?name"?)\s*:\s*["']([^"']+)["']\s*,\s*(?:"?muscle"?)\s*:\s*["']([^"']+)["'][^{}]*?\}/g;
  let m;
  while ((m=re.exec(source))) rows.push({id:m[1], name:m[2], muscle:m[3]});
  return rows;
}

async function getExercises() {
  const rows=[];
  for (const file of SOURCE_FILES) rows.push(...extract(await fs.readFile(file,'utf8')));
  const unique=[...new Map(rows.map(x=>[x.id,x])).values()];
  if (unique.length !== 250) throw new Error(`Expected 250 exercises, extracted ${unique.length}`);
  return unique;
}

async function getAliases() {
  const src=await fs.readFile('scripts/build-exercise-media-map-v44.mjs','utf8');
  const start=src.indexOf('const ALIASES = {');
  const end=src.indexOf('\n};', start);
  if (start < 0 || end < 0) return {};
  const objectText=src.slice(src.indexOf('{',start), end+2);
  return Function(`"use strict"; return (${objectText});`)();
}

let lastApiCall=0;
async function apiFetch(url) {
  const minGap=300;
  const gap=Date.now()-lastApiCall;
  if (gap < minGap) await sleep(minGap-gap);
  for (let attempt=0; attempt<8; attempt++) {
    const res=await fetch(url,{headers:{Accept:'application/json'}});
    lastApiCall=Date.now();
    if (res.status !== 429) return res;
    const retryAfter=Number(res.headers.get('retry-after')||0);
    const wait=retryAfter>0 ? retryAfter*1000 : Math.min(15000,1500*(attempt+1));
    await res.body?.cancel?.();
    console.warn(`[diag] rate limited; waiting ${wait}ms`);
    await sleep(wait);
  }
  throw new Error('ExerciseDB rate limit persisted');
}

async function getProvider() {
  const rows=[];
  const seen=new Set();
  let after='';
  for (let page=0; page<100; page++) {
    const u=new URL(PROVIDER_API);
    u.searchParams.set('limit','25');
    if (after) u.searchParams.set('after',after);
    const res=await apiFetch(u);
    if (!res.ok) throw new Error(`Provider page ${page+1} failed: ${res.status}`);
    const json=await res.json();
    const data=Array.isArray(json)?json:(json.data||json.results||[]);
    for (const row of data) if (row?.exerciseId && !seen.has(row.exerciseId)) {seen.add(row.exerciseId);rows.push(row);}
    const meta=json.meta||json.metadata||{};
    const next=meta.nextCursor||json.nextCursor||null;
    const hasNext=typeof meta.hasNextPage==='boolean' ? meta.hasNextPage : !!next;
    if (!hasNext || !next) break;
    after=next;
  }
  if (rows.length < 1400) throw new Error(`Only ${rows.length} provider exercises loaded`);
  return rows.filter(x=>x?.name&&x?.exerciseId&&x?.gifUrl);
}

function equipmentHint(name) {
  const n=normalize(name);
  const pairs=[
    ['smith',['smith machine']],['dumbbell',['dumbbell']],['barbell',['barbell']],['ez bar',['ez barbell','ez bar']],
    ['kettlebell',['kettlebell']],['cable',['cable']],['rope ',['cable']],['machine',['leverage machine','machine']],
    ['band ',['band','resistance band']],['stability ball',['stability ball']],['swiss ball',['stability ball']],
    ['bodyweight',['body weight']],['push up',['body weight']],['pull up',['body weight']],['chin up',['body weight']],
    ['plank',['body weight']],['landmine',['barbell']],['trap bar',['trap bar']],['medicine ball',['medicine ball']]
  ];
  for (const [needle,vals] of pairs) if (n.includes(needle)) return vals;
  return [];
}

function equipment(row) {return (row.equipments || [row.equipment].filter(Boolean)).map(normalize);}
function equipmentOK(ex,row) {
  const need=equipmentHint(ex.name);
  if (!need.length) return true;
  const have=equipment(row);
  if (!have.length) return true;
  return need.some(n=>have.some(h=>h.includes(n)||n.includes(h)));
}

function targetKey(row) {return [...(row.targetMuscles||[])].map(normalize).sort().join('|');}
function equipmentKey(row) {return equipment(row).sort().join('|');}
function duplicateKey(row) {return `${normalize(row.name)}::${equipmentKey(row)}::${targetKey(row)}`;}

function score(a,b) {
  const A=new Set(normalize(a).split(' '));
  const B=new Set(normalize(b).split(' '));
  const both=[...A].filter(x=>B.has(x)).length;
  return both/(new Set([...A,...B]).size||1);
}

function compact(row) {
  return {
    exerciseId:row.exerciseId,
    name:row.name,
    gifUrl:row.gifUrl,
    equipments:row.equipments||[],
    targetMuscles:row.targetMuscles||[],
    bodyParts:row.bodyParts||[]
  };
}

const exercises=await getExercises();
const aliases=await getAliases();
const provider=await getProvider();
console.log(`[diag] app=${exercises.length} provider=${provider.length}`);

const report=[];
for (const ex of exercises) {
  const desired=[ex.name,...(aliases[ex.id]||[])];
  const exactNorm=provider.filter(r=>equipmentOK(ex,r)&&desired.some(d=>normalize(d)===normalize(r.name)));
  const exactSig=provider.filter(r=>equipmentOK(ex,r)&&desired.some(d=>signature(d)===signature(r.name)));
  const union=[...new Map([...exactNorm,...exactSig].map(r=>[r.exerciseId,r])).values()];
  const groups=[...new Map(union.map(r=>[duplicateKey(r),[]])).keys()].map(key=>union.filter(r=>duplicateKey(r)===key));

  let safe=null;
  let reason='';
  if (groups.length===1 && groups[0].length) {
    safe=[...groups[0]].sort((a,b)=>String(a.exerciseId).localeCompare(String(b.exerciseId)))[0];
    reason=groups[0].length>1?'equivalent duplicate provider rows':'exact/approved name or token-order match';
  } else if (groups.length>1) {
    const exactNameGroups=groups.filter(g=>g.some(r=>normalize(r.name)===normalize(ex.name)));
    if (exactNameGroups.length===1) {
      safe=[...exactNameGroups[0]].sort((a,b)=>String(a.exerciseId).localeCompare(String(b.exerciseId)))[0];
      reason='exact app-name group chosen over alias groups';
    }
  }

  const top=provider
    .filter(r=>equipmentOK(ex,r))
    .map(r=>({r,s:score(ex.name,r.name)}))
    .sort((a,b)=>b.s-a.s)
    .slice(0,12)
    .map(x=>({...compact(x.r),score:Number(x.s.toFixed(4)),signature:signature(x.r.name)}));

  report.push({
    id:ex.id,name:ex.name,muscle:ex.muscle,
    desiredNames:desired,
    safeMatch:safe?compact(safe):null,
    safeReason:safe?reason:null,
    ambiguousGroups:groups.length>1?groups.map(g=>g.map(compact)):[],
    topCandidates:top
  });
}

const safe=report.filter(x=>x.safeMatch);
const unresolved=report.filter(x=>!x.safeMatch);
const json={generatedAt:new Date().toISOString(),total:report.length,safeMatched:safe.length,unresolved:unresolved.length,coverage:Number((safe.length/report.length*100).toFixed(2)),rows:report};
await fs.writeFile('EXERCISE_MEDIA_DIAGNOSTIC_V45.json',JSON.stringify(json,null,2),'utf8');
await fs.writeFile('EXERCISE_MEDIA_DIAGNOSTIC_V45.md',`# Exercise media diagnostic v45\n\n- Total: **${report.length}**\n- Safely matched without fuzzy guessing: **${safe.length}**\n- Needs explicit review: **${unresolved.length}**\n- Safe coverage: **${json.coverage}%**\n\n## Needs explicit review\n${unresolved.map(x=>`- **${x.name}** (${x.id}) — ${x.topCandidates.slice(0,5).map(c=>`${c.name} [${(c.equipments||[]).join(', ')}]`).join(' | ')}`).join('\n')}\n`,'utf8');
console.log(`[diag] safe=${safe.length} unresolved=${unresolved.length} coverage=${json.coverage}%`);
