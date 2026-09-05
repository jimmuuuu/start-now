import fs from 'node:fs/promises';

const MISSING_FILE='missing-exercise-media.json';
const EX_DB_FILE='EXERCISE_MEDIA_DIAGNOSTIC_V45.json';
const FREE_DB_FILE='EXERCISE_MEDIA_BACKUP_DIAGNOSTIC_V46.json';
const OUT_JSON='EXERCISE_MEDIA_ADDITIONAL_AUDIT_V49.json';
const OUT_MD='EXERCISE_MEDIA_ADDITIONAL_AUDIT_V49.md';
const STAGED_MAP='exercise-media-map-pending-v49.json';

const normalize=v=>String(v||'')
  .toLowerCase()
  .replace(/&/g,' and ')
  .replace(/\btricep\b/g,'triceps')
  .replace(/\bbicep\b/g,'biceps')
  .replace(/\bpushups?\b/g,'push up')
  .replace(/\bpullups?\b/g,'pull up')
  .replace(/\bchinups?\b/g,'chin up')
  .replace(/\bflies\b|\bflyes\b|\bflys\b/g,'fly')
  .replace(/\bcurls\b/g,'curl')
  .replace(/\brows\b/g,'row')
  .replace(/\braises\b/g,'raise')
  .replace(/\bextensions\b/g,'extension')
  .replace(/\blunges\b/g,'lunge')
  .replace(/\bsquats\b/g,'squat')
  .replace(/\bergo?meter\b/g,'erg')
  .replace(/[^a-z0-9]+/g,' ')
  .trim().replace(/\s+/g,' ');
const tokens=v=>normalize(v).split(' ').filter(Boolean);
const signature=v=>tokens(v).sort().join(' ');
const jaccard=(a,b)=>{const A=new Set(tokens(a)),B=new Set(tokens(b));const both=[...A].filter(x=>B.has(x)).length;return both/(new Set([...A,...B]).size||1);};

const STRICT_ALIASES={
  'wide-grip-push-up':['push up wide','wide hand push up'],
  'standing-dumbbell-shoulder-press':['dumbbell standing overhead press','standing dumbbell press'],
  'arnold-press':['dumbbell arnold press','arnold dumbbell press'],
  'assisted-pull-up':['assisted pull up','machine assisted pull up','lever assisted pull up'],
  'single-arm-lat-pulldown':['one arm lat pulldown','cable one arm pulldown'],
  'pendlay-row':['barbell pendlay row'],
  'underhand-barbell-row':['barbell reverse grip bent over row','reverse grip barbell row'],
  't-bar-row':['t bar row with handle','lever t bar row'],
  'chest-supported-t-bar-row':['lying t bar row'],
  'conventional-deadlift':['barbell deadlift'],
  'rack-pull':['barbell rack pull'],
  'smith-machine-shrug':['smith shrug'],
  'alternating-dumbbell-curl':['dumbbell alternate biceps curl','dumbbell alternating biceps curl'],
  'rope-hammer-curl':['cable hammer curl with rope','cable hammer curl with rope attachment'],
  'rope-triceps-pushdown':['triceps pushdown rope attachment','cable pushdown with rope attachment'],
  'v-bar-pushdown':['triceps pushdown v bar attachment','cable triceps pushdown v bar'],
  'reverse-grip-pushdown':['reverse grip triceps pushdown','cable reverse grip pushdown'],
  'ez-bar-skull-crusher':['ez bar skullcrusher','ez bar skull crusher'],
  'smith-machine-hip-thrust':['smith hip raise','smith machine hip thrust'],
  'cable-glute-kickback':['one legged cable kickback','cable kickback'],
  'cable-wood-chop':['standing cable wood chop','cable woodchop'],
  'landmine-rotation':['landmine 180','landmine 180s'],
  'battle-rope-waves':['battling ropes','battle ropes'],
  'medicine-ball-slam':['medicine ball overhead slam','medicine ball slam'],
  'incline-treadmill-walk':['walking on incline treadmill','incline treadmill walk'],
  'ski-erg':['ski ergometer','ski erg']
};

const MOVEMENT_GROUPS=[
  ['press',['press']],['fly',['fly','crossover']],['row',['row']],['pulldown',['pulldown']],['pushdown',['pushdown','pressdown']],
  ['curl',['curl']],['extension',['extension']],['squat',['squat']],['lunge',['lunge']],['deadlift',['deadlift']],['raise',['raise']],
  ['thrust',['thrust','hip raise']],['bridge',['bridge']],['carry',['carry','walk']],['plank',['plank','bridge']],['crunch',['crunch']],
  ['situp',['sit up']],['pushup',['push up']],['pullup',['pull up']],['kickback',['kickback']],['walk',['walk']],['run',['run']],
  ['rotation',['rotation','twist','180']],['slam',['slam']],['rope',['rope']],['erg',['erg']],['hang',['hang']]
];
function movement(name){const n=normalize(name);for(const [key,terms] of MOVEMENT_GROUPS) if(terms.some(t=>n.includes(t))) return key;return null;}

function appEquipment(name){
  const n=normalize(name);
  if(n.includes('smith'))return['smith machine','machine'];
  if(n.includes('dumbbell'))return['dumbbell'];
  if(n.includes('barbell'))return['barbell'];
  if(n.includes('ez bar'))return['ez barbell','e z curl bar','barbell'];
  if(n.includes('kettlebell'))return['kettlebell','kettlebells'];
  if(n.includes('cable')||n.includes('pushdown')||n.includes('pulldown')||n.includes('face pull'))return['cable'];
  if(n.includes('band'))return['band','bands','resistance band'];
  if(n.includes('medicine ball'))return['medicine ball'];
  if(n.includes('battle rope'))return['rope'];
  if(n.includes('sled'))return['sled','sled machine'];
  if(n.includes('treadmill'))return['treadmill','leverage machine','machine'];
  if(n.includes('bike'))return['stationary bike','bike','leverage machine','machine'];
  if(n.includes('elliptical'))return['elliptical machine','elliptical'];
  if(n.includes('stair'))return['stepmill machine','machine'];
  if(n.includes('ski erg'))return['skierg machine','ski erg'];
  if(n.includes('machine')||n.includes('leg press')||n.includes('hack squat')||n.includes('pec deck')||n.includes('leg extension')||n.includes('leg curl')||n.includes('pendulum squat'))return['machine','leverage machine','sled machine'];
  if(n.includes('push up')||n.includes('pull up')||n.includes('plank')||n.includes('bird dog')||n.includes('hollow')||n.includes('sit up')||n.includes('crunch')||n.includes('dead hang')||n.includes('towel hang'))return['body weight','body only','none'];
  return[];
}
function equipmentCompatible(appName, providerEquipment){
  const need=appEquipment(appName); if(!need.length)return true;
  const have=(Array.isArray(providerEquipment)?providerEquipment:[providerEquipment]).filter(Boolean).map(normalize);
  if(!have.length)return true;
  return need.some(n=>have.some(h=>h.includes(normalize(n))||normalize(n).includes(h)));
}

const MUSCLE_MAP={
  Chest:['chest','pectorals','pectoralis'],Back:['back','lats','latissimus','upper back'],Shoulders:['shoulders','delts','deltoid'],
  'Rear Delts':['rear delts','posterior deltoid','delts'],Biceps:['biceps'],Triceps:['triceps'],Forearms:['forearms'],
  Quads:['quads','quadriceps'],Hamstrings:['hamstrings'],Glutes:['glutes','gluteus'],Calves:['calves'],Core:['abs','abdominals','obliques','core'],
  Legs:['quads','quadriceps','hamstrings','glutes','calves','upper legs'],Cardio:['cardiovascular system','cardio']
};
function muscleCompatible(appMuscles, providerMuscles){
  const needs=(appMuscles||[]).flatMap(m=>MUSCLE_MAP[m]||[normalize(m)]).map(normalize);
  const have=(providerMuscles||[]).map(x=>normalize(typeof x==='string'?x:(x?.name_en||x?.name||''))).filter(Boolean);
  if(!needs.length||!have.length)return true;
  return needs.some(n=>have.some(h=>h.includes(n)||n.includes(h)));
}
function isStrictAlias(app, candidate){return (STRICT_ALIASES[app.appId]||[]).some(a=>normalize(a)===normalize(candidate));}
function sameMovement(appName,candidateName){const a=movement(appName),b=movement(candidateName);return !a||!b||a===b;}
function confidence(app,c){
  if(normalize(app.appName)===normalize(c.name))return 100;
  if(signature(app.appName)===signature(c.name))return 100;
  if(isStrictAlias(app,c.name))return 99;
  let s=Math.round(jaccard(app.appName,c.name)*75);
  if(equipmentCompatible(app.appName,c.equipment||c.equipments))s+=10;
  if(muscleCompatible(app.primaryMuscles,c.muscles||c.targetMuscles||c.bodyParts))s+=10;
  if(sameMovement(app.appName,c.name))s+=5; else s-=25;
  return Math.max(0,Math.min(98,s));
}

async function fetchJson(url,{retries=4}={}){
  let err;
  for(let i=0;i<retries;i++){
    try{
      const res=await fetch(url,{headers:{Accept:'application/json','User-Agent':'START-NOW-media-audit/1.0'}});
      if(res.status===429){const wait=Math.max(1500,Number(res.headers.get('retry-after')||2)*1000);await res.body?.cancel?.();await new Promise(r=>setTimeout(r,wait));continue;}
      if(!res.ok)throw new Error(`${res.status} ${res.statusText}`);
      return await res.json();
    }catch(e){err=e;await new Promise(r=>setTimeout(r,1000*(i+1)));}
  }
  throw err;
}

async function workoutXCatalog(){
  const url='https://workoutxapp.com/exercises/index.html';
  const res=await fetch(url,{headers:{'User-Agent':'START-NOW-media-audit/1.0'}});
  if(!res.ok)throw new Error(`WorkoutX catalog ${res.status}`);
  const html=await res.text();
  const found=[]; const seen=new Set();
  const re=/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while((m=re.exec(html))){
    const text=m[2].replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/&#39;|&apos;/g,"'").replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
    const href=m[1];
    if(!text||text.length>100||!href.includes('/exercises/'))continue;
    const key=normalize(text); if(!key||seen.has(key))continue;seen.add(key);found.push({name:text,href:new URL(href,url).toString(),source:'WorkoutX'});
  }
  if(found.length<1000)throw new Error(`WorkoutX catalog parse returned only ${found.length} exercise names`);
  return found;
}

async function wgerCatalog(){
  const all=[]; let url='https://wger.de/api/v2/exerciseinfo/?limit=200&format=json'; let pages=0;
  while(url&&pages<20){
    const json=await fetchJson(url); pages++;
    all.push(...(json.results||[]));
    url=json.next||null;
  }
  const out=[];
  for(const row of all){
    const translations=row.translations||[];
    const en=translations.find(t=>t.language===2)||translations.find(t=>String(t.language).toLowerCase()==='english')||translations[0];
    const name=en?.name||row.name; if(!name)continue;
    const videos=(row.videos||[]).map(v=>({url:v.video||v.url||v.file||'',license:v.license_title||v.license?.full_name||v.license?.name||v.license||'',author:v.license_author||''})).filter(v=>v.url);
    const images=(row.images||[]).map(i=>({url:i.image||i.url||'',license:i.license_title||i.license?.full_name||i.license?.name||i.license||'',author:i.license_author||''})).filter(i=>i.url);
    out.push({source:'wger',providerExerciseId:String(row.id??row.uuid??''),name,equipment:(row.equipment||[]).map(e=>e?.name||e).filter(Boolean),muscles:[...(row.muscles||[]),...(row.muscles_secondary||[])],videos,images});
  }
  return out;
}

async function urlLoads(url){
  if(!url)return false;
  try{const res=await fetch(url,{headers:{Range:'bytes=0-1024','User-Agent':'START-NOW-media-audit/1.0'}});await res.body?.cancel?.();return res.ok||res.status===206;}catch{return false;}
}
function acceptableOpenLicense(label){const n=normalize(label);return n.includes('cc by')||n.includes('creative commons attribution')||n.includes('public domain')||n.includes('cc0');}

const missing=JSON.parse(await fs.readFile(MISSING_FILE,'utf8'));
const exdb=JSON.parse(await fs.readFile(EX_DB_FILE,'utf8'));
const freedb=JSON.parse(await fs.readFile(FREE_DB_FILE,'utf8'));
if(missing.length!==107)throw new Error(`Expected 107 missing exercises, got ${missing.length}`);

let wx=[],wger=[],moveBaseStatus={queried:false};
try{wx=await workoutXCatalog();}catch(e){moveBaseStatus.workoutXError=String(e?.message||e);}
try{wger=await wgerCatalog();}catch(e){moveBaseStatus.wgerError=String(e?.message||e);}
try{
  const res=await fetch('https://api.movebase.fr/api/v1/exercises?limit=1',{headers:{Accept:'application/json','User-Agent':'START-NOW-media-audit/1.0'}});
  moveBaseStatus={...moveBaseStatus,queried:true,httpStatus:res.status,authRequired:res.status===401||res.status===403};
  await res.body?.cancel?.();
}catch(e){moveBaseStatus={...moveBaseStatus,queried:true,error:String(e?.message||e)};}

const exRows=new Map(exdb.rows.map(r=>[r.id,r]));
const freeRows=new Map(freedb.rows.map(r=>[r.id,r]));
const staged=[]; const results=[];

for(const app of missing){
  const candidates=[];
  const ex=exRows.get(app.appId);
  for(const c of (ex?.topCandidates||[]).slice(0,8)) candidates.push({source:'ExerciseDB',providerExerciseId:c.exerciseId,name:c.name,equipment:c.equipments||[],muscles:[...(c.targetMuscles||[]),...(c.bodyParts||[])],mediaUrl:c.gifUrl,mediaType:'gif'});
  const fr=freeRows.get(app.appId);
  for(const c of (fr?.topCandidates||[]).slice(0,7)) candidates.push({source:'Free Exercise DB',providerExerciseId:c.id,name:c.name,equipment:c.equipment?[c.equipment]:[],muscles:[],mediaUrl:null,mediaType:'start-end-images',images:c.images||[]});
  for(const c of wx.map(x=>({x,s:jaccard(app.appName,x.name)})).sort((a,b)=>b.s-a.s).slice(0,6)) candidates.push({source:'WorkoutX',providerExerciseId:null,name:c.x.name,equipment:[],muscles:[],mediaUrl:null,mediaType:'gif-via-api',catalogUrl:c.x.href});
  for(const c of wger.map(x=>({x,s:jaccard(app.appName,x.name)})).sort((a,b)=>b.s-a.s).slice(0,8)) candidates.push({...c.x,mediaType:c.x.videos.length?'video':c.x.images.length?'image':'none',mediaUrl:c.x.videos[0]?.url||c.x.images[0]?.url||null});

  const dedup=[...new Map(candidates.map(c=>[`${c.source}:${c.providerExerciseId||normalize(c.name)}`,c])).values()]
    .map(c=>({...c,confidence:confidence(app,c)}))
    .sort((a,b)=>b.confidence-a.confidence);

  let approved=null;
  for(const c of dedup){
    const nameEquivalent=normalize(app.appName)===normalize(c.name)||signature(app.appName)===signature(c.name)||isStrictAlias(app,c.name);
    if(!nameEquivalent||!equipmentCompatible(app.appName,c.equipment)||!muscleCompatible(app.primaryMuscles,c.muscles)||!sameMovement(app.appName,c.name))continue;
    if(c.source==='ExerciseDB'&&c.mediaUrl){
      if(await urlLoads(c.mediaUrl)){approved={...c,verified:true,verificationBasis:'strict name/alias + equipment + muscle + movement + GIF load'};break;}
    }
    if(c.source==='wger'&&c.videos?.length){
      const licensed=c.videos.find(v=>acceptableOpenLicense(v.license));
      if(licensed&&await urlLoads(licensed.url)){approved={...c,mediaUrl:licensed.url,mediaType:'video',verified:true,verificationBasis:`strict name/alias + equipment + muscle + movement + licensed wger video (${licensed.license})`};break;}
    }
  }

  if(approved){
    staged.push({appExercise:app.appName,appId:app.appId,provider:approved.source,providerExerciseId:approved.providerExerciseId,mediaUrl:approved.mediaUrl,mediaType:approved.mediaType,verified:true,verificationBasis:approved.verificationBasis});
  }
  results.push({...app,approvedMatch:approved?{source:approved.source,providerExerciseId:approved.providerExerciseId,name:approved.name,equipment:approved.equipment,muscles:approved.muscles,mediaUrl:approved.mediaUrl,mediaType:approved.mediaType,confidence:approved.confidence,verificationBasis:approved.verificationBasis}:null,topCandidates:dedup.slice(0,3).map(c=>({source:c.source,providerExerciseId:c.providerExerciseId,name:c.name,equipment:c.equipment,muscles:c.muscles,confidence:c.confidence,mediaType:c.mediaType,mediaUrl:c.mediaUrl||null,decision:(approved&&c.source===approved.source&&c.providerExerciseId===approved.providerExerciseId&&c.name===approved.name)?'APPROVE':c.confidence>=90?'REVIEW':'REJECT / NOT EXACTLY VERIFIED'}))});
}

const remaining=results.filter(r=>!r.approvedMatch);
const counts={
  totalExercises:250,
  existingExerciseDBApproved:exdb.safeMatched,
  existingFreeExerciseDBApproved:freedb.matched,
  newlyApproved:staged.length,
  newlyApprovedExerciseDB:staged.filter(x=>x.provider==='ExerciseDB').length,
  newlyApprovedWger:staged.filter(x=>x.provider==='wger').length,
  workoutXApproved:0,
  moveBaseApproved:0,
  stillMissing:remaining.length,
  coverage:250-remaining.length,
  coveragePercent:Number(((250-remaining.length)/250*100).toFixed(2))
};
const out={generatedAt:new Date().toISOString(),sourceNotes:{WorkoutX:'Public catalog names checked. Production GIF access requires authenticated API use; catalog-only hits are candidates, not approvals.',MoveBase:'API probed without credentials. Per-exercise audit requires RapidAPI authentication; no unauthenticated media was approved.',wger:'Public API checked. Only strict-equivalent matches with a loadable video and an explicit open license are auto-approved.',ExerciseDB:'Existing provider candidates rechecked using strict aliases/equipment/muscle/movement; loadable GIF required for any new approval.',FreeExerciseDB:'Existing public-domain start/end candidates included for comparison only; v49 does not auto-promote unresolved approximate matches.'},moveBaseStatus,counts,stagedMappings:staged,rows:results};
await fs.writeFile(OUT_JSON,JSON.stringify(out,null,2)+'\n');
await fs.writeFile(STAGED_MAP,JSON.stringify(staged,null,2)+'\n');

const md=`# START/NOW Additional Exercise Media Audit — v49\n\n## Coverage\n\n- Total START/NOW exercises: **250**\n- Existing ExerciseDB approved: **${counts.existingExerciseDBApproved}**\n- Existing Free Exercise DB approved: **${counts.existingFreeExerciseDBApproved}**\n- Newly approved from deeper ExerciseDB aliases: **${counts.newlyApprovedExerciseDB}**\n- Newly approved from wger licensed videos: **${counts.newlyApprovedWger}**\n- WorkoutX approved in this run: **0** (catalog checked; API key required before production media approval)\n- MoveBase approved in this run: **0** (API authentication required)\n- Still missing after this run: **${counts.stillMissing}**\n- Total accounted coverage: **${counts.coverage} / 250 (${counts.coveragePercent}%)**\n\n> This report does not claim 100% unless every remaining exercise has a predetermined, accurate, licensed and loadable demonstration.\n\n## Newly approved mappings\n${staged.length?staged.map(x=>`- ✓ **${x.appExercise}** → ${x.provider}: ${x.providerExerciseId||''} (${x.mediaType})`).join('\n'):'None'}\n\n## Still missing\n${remaining.map(x=>`- **${x.appName}** (${x.appId})`).join('\n')||'None'}\n\n## Candidate review\n${results.map(r=>`### ${r.appName}\n${r.topCandidates.map((c,i)=>`${i+1}. ${c.source} — ${c.name} — confidence ${c.confidence}% — **${c.decision}**`).join('\n')}`).join('\n\n')}\n`;
await fs.writeFile(OUT_MD,md);
console.log(`[v49] WorkoutX names=${wx.length} wger=${wger.length} newlyApproved=${staged.length} remaining=${remaining.length}`);
