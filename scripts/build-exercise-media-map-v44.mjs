import fs from 'node:fs/promises';

const SOURCE_FILES = ['app.js', 'exercise-library-extra.js'];
const API = 'https://oss.exercisedb.dev/api/v1/exercises';
const OUTPUT_JS = 'exercise-media-map-v44.js';
const OUTPUT_REPORT = 'EXERCISE_MEDIA_COVERAGE_V44.md';

const ALIASES = {
  'chest-press':['lever chest press','machine chest press'],
  'incline-press':['lever incline chest press','incline chest press'],
  'cable-fly':['cable crossover'],
  'shoulder-press':['lever shoulder press','machine shoulder press'],
  'lateral-raise':['dumbbell lateral raise','side lateral raise'],
  'triceps-pushdown':['triceps pushdown'],
  'lat-pulldown':['cable wide grip lat pulldown','wide grip lat pulldown'],
  'seated-row':['cable seated row','seated cable row'],
  'reverse-fly':['dumbbell reverse fly','reverse fly'],
  'biceps-curl':['dumbbell biceps curl','dumbbell bicep curl'],
  'hammer-curl':['dumbbell hammer curl','hammer curl'],
  'leg-press':['sled 45 degrees leg press','leg press'],
  'leg-extension':['lever leg extension','leg extension'],
  'leg-curl':['lever lying leg curl','lying leg curl'],
  'calf-raise':['lever standing calf raise','standing calf raise'],
  'hip-abduction':['lever seated hip abduction','seated hip abduction'],
  'cable-crunch':['cable kneeling crunch','cable crunch'],
  'romanian-deadlift':['barbell romanian deadlift','romanian deadlift'],
  'barbell-romanian-deadlift':['barbell romanian deadlift','romanian deadlift'],
  'dumbbell-romanian-deadlift':['dumbbell romanian deadlift'],
  'barbell-bench-press':['barbell bench press'],
  'dumbbell-bench-press':['dumbbell bench press'],
  'incline-barbell-bench-press':['barbell incline bench press'],
  'incline-dumbbell-bench-press':['dumbbell incline bench press','incline dumbbell bench press'],
  'machine-chest-press':['lever chest press','machine chest press'],
  'smith-machine-bench-press':['smith bench press','smith machine bench press'],
  'smith-machine-incline-press':['smith incline bench press','smith machine incline bench press'],
  'seated-dumbbell-shoulder-press':['dumbbell seated shoulder press','seated dumbbell shoulder press'],
  'standing-dumbbell-shoulder-press':['dumbbell standing shoulder press','standing dumbbell shoulder press'],
  'barbell-overhead-press':['barbell standing military press','barbell shoulder press','barbell overhead press'],
  'machine-shoulder-press':['lever shoulder press','machine shoulder press'],
  'smith-machine-shoulder-press':['smith shoulder press','smith machine shoulder press'],
  'cable-lateral-raise':['cable lateral raise'],
  'dumbbell-front-raise':['dumbbell front raise','front dumbbell raise'],
  'cable-front-raise':['cable front raise'],
  'plate-front-raise':['plate front raise'],
  'machine-lateral-raise':['lever lateral raise','machine lateral raise'],
  'face-pull':['cable rear delt row face pull','face pull'],
  'rear-delt-cable-fly':['cable rear delt fly','rear delt cable fly'],
  'machine-reverse-fly':['lever reverse fly','machine reverse fly'],
  'barbell-row':['barbell bent over row','bent over barbell row'],
  'dumbbell-row':['dumbbell bent over row','bent over dumbbell row'],
  'one-arm-dumbbell-row':['dumbbell one arm bent over row','one arm dumbbell row'],
  'rope-triceps-pushdown':['cable rope pushdown','triceps pushdown rope attachment'],
  'straight-bar-pushdown':['cable straight bar pushdown','triceps pushdown'],
  'v-bar-pushdown':['cable v bar pushdown','triceps pushdown v bar'],
  'single-arm-pushdown':['cable one arm triceps pushdown','single arm pushdown'],
  'reverse-grip-pushdown':['cable reverse grip triceps pushdown','reverse grip pushdown'],
  'overhead-cable-triceps-extension':['cable overhead triceps extension'],
  'rope-overhead-extension':['cable rope overhead triceps extension'],
  'dumbbell-overhead-triceps-extension':['dumbbell standing triceps extension','standing dumbbell triceps extension'],
  'single-arm-dumbbell-triceps-extension':['dumbbell one arm triceps extension','single arm dumbbell triceps extension'],
  'barbell-curl':['barbell curl'],
  'ez-bar-curl':['ez barbell curl','ez bar curl'],
  'dumbbell-curl':['dumbbell biceps curl','dumbbell bicep curl'],
  'preacher-curl':['ez barbell preacher curl','preacher curl'],
  'machine-preacher-curl':['lever preacher curl','machine preacher curl'],
  'back-squat':['barbell full squat','barbell squat'],
  'front-squat':['barbell front chest squat','front barbell squat','front squat'],
  'goblet-squat':['dumbbell goblet squat','goblet squat'],
  'hack-squat':['sled hack squat','hack squat'],
  'smith-machine-squat':['smith squat','smith machine squat'],
  'walking-lunge':['walking lunge'],
  'reverse-lunge':['dumbbell rear lunge','reverse lunge'],
  'forward-lunge':['dumbbell lunge','forward lunge'],
  'barbell-hip-thrust':['barbell hip thrust'],
  'smith-machine-hip-thrust':['smith hip thrust','smith machine hip thrust'],
  'dumbbell-hip-thrust':['dumbbell hip thrust'],
  'glute-bridge':['glute bridge'],
  'standing-calf-raise':['lever standing calf raise','standing calf raise'],
  'seated-calf-raise':['lever seated calf raise','seated calf raise'],
  'leg-press-calf-raise':['sled calf press on leg press','calf press on leg press'],
  'plank':['front plank','plank']
};

const normalize = value => String(value || '')
  .toLowerCase()
  .replace(/&/g,' and ')
  .replace(/\btricep\b/g,'triceps')
  .replace(/\bbicep\b/g,'biceps')
  .replace(/\bpushups?\b/g,'push up')
  .replace(/\bpullups?\b/g,'pull up')
  .replace(/\bchinups?\b/g,'chin up')
  .replace(/[^a-z0-9]+/g,' ')
  .trim().replace(/\s+/g,' ')
  .split(' ')
  .map(t=>({raises:'raise',curls:'curl',rows:'row',extensions:'extension',presses:'press',flyes:'fly',flys:'fly',lunges:'lunge',squats:'squat'}[t]||t))
  .join(' ');

function extract(source){
  const rows=[];
  const re=/\{\s*(?:"?id"?)\s*:\s*["']([^"']+)["']\s*,\s*(?:"?name"?)\s*:\s*["']([^"']+)["']\s*,\s*(?:"?muscle"?)\s*:\s*["']([^"']+)["'][^{}]*?\}/g;
  let m; while((m=re.exec(source))) rows.push({id:m[1],name:m[2],muscle:m[3]});
  return rows;
}

async function appExercises(){
  const all=[];
  for(const file of SOURCE_FILES) all.push(...extract(await fs.readFile(file,'utf8')));
  const unique=[...new Map(all.map(x=>[x.id,x])).values()];
  if(unique.length!==250) throw new Error(`Expected 250 exercises, extracted ${unique.length}`);
  return unique;
}

async function providerExercises(){
  const out=[];
  let after='';
  const seen=new Set();
  for(let page=0;page<100;page++){
    const u=new URL(API);
    u.searchParams.set('limit','25');
    if(after) u.searchParams.set('after',after);
    const res=await fetch(u,{headers:{Accept:'application/json'}});
    if(!res.ok) throw new Error(`ExerciseDB page ${page+1} failed: ${res.status}`);
    const json=await res.json();
    const data=Array.isArray(json)?json:(json.data||json.results||[]);
    if(!Array.isArray(data)) throw new Error('Unexpected ExerciseDB response shape');
    for(const row of data){ if(row?.exerciseId&&!seen.has(row.exerciseId)){seen.add(row.exerciseId);out.push(row);} }
    const meta=json.meta||json.metadata||{};
    const next=meta.nextCursor||json.nextCursor||null;
    const hasNext=typeof meta.hasNextPage==='boolean'?meta.hasNextPage:!!next;
    if(!hasNext||!next) break;
    if(next===after) throw new Error('ExerciseDB pagination cursor repeated');
    after=next;
  }
  if(out.length<1000) throw new Error(`ExerciseDB pagination returned only ${out.length} unique exercises`);
  console.log(`[media] provider total=${out.length}`);
  return out.filter(x=>x?.gifUrl&&x?.name&&x?.exerciseId);
}

function equipmentHint(name){
  const n=normalize(name);
  const pairs=[['smith',['smith machine']],['dumbbell',['dumbbell']],['barbell',['barbell']],['ez bar',['ez barbell','ez bar']],['kettlebell',['kettlebell']],['cable',['cable']],['rope ',['cable']],['machine',['leverage machine','machine']],['band ',['band','resistance band']],['stability ball',['stability ball']],['swiss ball',['stability ball']],['bodyweight',['body weight']],['push up',['body weight']],['pull up',['body weight']],['chin up',['body weight']],['plank',['body weight']],['landmine',['barbell']]];
  for(const [needle,values] of pairs) if(n.includes(needle)) return values;
  return [];
}
function providerEquipment(row){return (row.equipments||[row.equipment].filter(Boolean)).map(normalize);}
function equipmentOK(ex,row){const need=equipmentHint(ex.name);if(!need.length)return true;const have=providerEquipment(row);if(!have.length)return true;return need.some(n=>have.some(h=>h.includes(n)||n.includes(h)));}
function exact(ex,provider){const names=new Set([normalize(ex.name),...(ALIASES[ex.id]||[]).map(normalize)]);return provider.filter(r=>names.has(normalize(r.name))&&equipmentOK(ex,r));}
function score(a,b){const A=new Set(normalize(a).split(' ')),B=new Set(normalize(b).split(' '));const same=[...A].filter(x=>B.has(x)).length;return same/(new Set([...A,...B]).size||1);}
function suggestions(ex,provider){return provider.filter(r=>equipmentOK(ex,r)).map(r=>({r,s:score(ex.name,r.name)})).sort((a,b)=>b.s-a.s).slice(0,6).map(x=>`${x.r.name} [${(x.r.equipments||[]).join(',')}] ${Math.round(x.s*100)}%`);}

async function gifWorks(url){
  try{
    const res=await fetch(url,{headers:{Range:'bytes=0-2047'}});
    const type=res.headers.get('content-type')||'';
    await res.body?.cancel?.();
    return {ok:(res.ok||res.status===206)&&(/gif/i.test(type)||/octet-stream/i.test(type)),status:res.status,type};
  }catch(e){return {ok:false,error:String(e?.message||e)};}
}

function runtime(map){return `// START/NOW v44 — generated deterministic ExerciseDB GIF map.\n(() => {\nconst MAP=${JSON.stringify(map,null,2)};\nconst broken=new Map();\nconst idOf=ex=>String(ex?.id||window.SN36?.exerciseId?.(ex)||'').trim();\nfunction resolve(ex,{quiet=false}={}){const id=idOf(ex),entry=MAP[id]||null,b=broken.get(id);const r=b?{status:'broken',internalId:id,entry,failureReason:b.reason}:entry?{status:'ready',internalId:id,entry}:{status:'missing',internalId:id,entry:null,failureReason:'No approved GIF mapping'};if(!quiet)console.info('[Exercise Media]',{exerciseDisplayed:ex?.name||'Exercise',internalId:id,assetFound:r.status==='ready',assetType:entry?.type||null,source:entry?.source||null,providerExerciseId:entry?.providerExerciseId||null,providerName:entry?.providerName||null,failureReason:r.status==='ready'?null:r.failureReason});return r;}\nfunction audit(){const lib=typeof exerciseLibrary!=='undefined'&&Array.isArray(exerciseLibrary)?exerciseLibrary:[];const rows=lib.map(ex=>{const r=resolve(ex,{quiet:true});return{id:idOf(ex),name:ex.name,status:r.status,providerName:r.entry?.providerName||null,gifUrl:r.entry?.src||null};});const matched=rows.filter(x=>x.status==='ready').length;const out={total:rows.length,matched,missing:rows.filter(x=>x.status==='missing').length,broken:rows.filter(x=>x.status==='broken').length,coverage:rows.length?Math.round(matched/rows.length*10000)/100:0,rows};window.START_NOW_EXERCISE_MEDIA_AUDIT=out;return out;}\nwindow.START_NOW_EXERCISE_MEDIA={version:44,provider:'ExerciseDB V1',manifest:MAP,resolve,audit,report(){const r=audit();console.group('[Exercise Media Audit v44]');console.info('Total exercises:',r.total);console.info('GIF matched:',r.matched);console.info('Missing GIFs:',r.missing);console.info('Broken GIFs:',r.broken);console.info('Coverage:',r.coverage+'%');if(r.missing||r.broken)console.table(r.rows.filter(x=>x.status!=='ready'));console.groupEnd();return r;},markBroken(ex,url,reason='GIF failed to load'){const id=typeof ex==='string'?ex:idOf(ex);broken.set(id,{url,reason});console.warn('[Exercise Media]',{internalId:id,failureReason:reason,url});},clearBroken(ex){broken.delete(typeof ex==='string'?ex:idOf(ex));}};queueMicrotask(audit);\n})();\n`;}

function report(exercises,matched,missing,broken){const aliases=matched.filter(x=>normalize(x.ex.name)!==normalize(x.row.name)).length;const pct=(matched.length/exercises.length*100).toFixed(2);return `# START/NOW Exercise GIF Coverage — v44\n\n- Total exercises: **${exercises.length}**\n- GIF matched: **${matched.length}**\n- Alias/name-variant matches: **${aliases}**\n- Backup/local media: **0**\n- Missing GIFs: **${missing.length}**\n- Broken GIFs: **${broken.length}**\n- Coverage: **${pct}%**\n\n## Missing\n${missing.length?missing.map(x=>`- ${x.ex.name} (${x.ex.id}) — ${x.reason}`).join('\n'):'None'}\n\n## Broken\n${broken.length?broken.map(x=>`- ${x.ex.name} (${x.ex.id}) — ${JSON.stringify(x.check)}`).join('\n'):'None'}\n\n## Matched\n${matched.map(x=>`- ✓ ${x.ex.name} → ${x.row.name} (${x.row.exerciseId})`).join('\n')}\n`;}

const exercises=await appExercises();
const provider=await providerExercises();
console.log(`[media] app total=${exercises.length}`);
const matched=[],missing=[];
for(const ex of exercises){const c=exact(ex,provider);if(c.length===1)matched.push({ex,row:c[0]});else if(c.length>1){const same=c.filter(r=>normalize(r.name)===normalize(ex.name));if(same.length===1)matched.push({ex,row:same[0]});else missing.push({ex,reason:`ambiguous: ${c.map(r=>r.name).join(' | ')}`,suggestions:suggestions(ex,provider)});}else missing.push({ex,reason:'no exact/approved alias match',suggestions:suggestions(ex,provider)});}
if(missing.length){console.error(`[media] unresolved=${missing.length}`);for(const x of missing)console.error(`MISS ${x.ex.id} :: ${x.ex.name}\n  ${x.suggestions.join(' || ')}`);process.exit(1);}
const broken=[];
for(let i=0;i<matched.length;i+=12)await Promise.all(matched.slice(i,i+12).map(async x=>{x.check=await gifWorks(x.row.gifUrl);if(!x.check.ok)broken.push(x);}));
if(broken.length){console.error(`[media] broken=${broken.length}`);for(const x of broken)console.error(`BROKEN ${x.ex.id} :: ${x.ex.name} -> ${x.row.gifUrl} ${JSON.stringify(x.check)}`);process.exit(1);}
const map=Object.fromEntries(matched.sort((a,b)=>a.ex.id.localeCompare(b.ex.id)).map(({ex,row})=>[ex.id,{type:'gif',src:row.gifUrl,source:'ExerciseDB V1',providerExerciseId:row.exerciseId,providerName:row.name,equipments:row.equipments||[],targetMuscles:row.targetMuscles||[],approved:true}]));
await fs.writeFile(OUTPUT_JS,runtime(map),'utf8');
await fs.writeFile(OUTPUT_REPORT,report(exercises,matched,missing,broken),'utf8');
console.log(`PASS — 100% exercise media coverage (${matched.length}/${exercises.length}).`);
