import fs from 'node:fs/promises';

const SOURCE='https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
const diagnostic=JSON.parse(await fs.readFile('EXERCISE_MEDIA_DIAGNOSTIC_V45.json','utf8'));
const unresolved=diagnostic.rows.filter(row=>!row.safeMatch);

const normalize=value=>String(value||'')
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
const signature=v=>normalize(v).split(' ').filter(Boolean).sort().join(' ');

const EXPLICIT={
  'farmer-carry':["Farmer's Walk"],
  'barbell-overhead-press':['Military Press','Standing Military Press'],
  'seated-barbell-press':['Seated Barbell Military Press'],
  'face-pull':['Face Pull'],
  'plank':['Plank'],
  'assisted-pull-up':['Machine-Assisted Pull-Up'],
  'band-pull-apart':['Band Pull Apart'],
  'pec-deck-fly':['Butterfly'],
  'triceps-pushdown':['Triceps Pushdown'],
  'lat-pulldown':['Wide-Grip Lat Pulldown'],
  'leg-press':['Leg Press'],
  'upright-row':['Upright Barbell Row'],
  'landmine-press':['Single-Arm Landmine Press'],
  'machine-high-row':['Leverage High Row'],
  'cable-row':['Seated Cable Rows'],
  'preacher-curl':['Preacher Curl'],
  'wrist-curl':['Palms-Up Barbell Wrist Curl Over A Bench'],
  'reverse-wrist-curl':['Palms-Down Wrist Curl Over A Bench'],
  'behind-the-back-wrist-curl':['Standing Palms-Up Barbell Behind The Back Wrist Curl'],
  'front-squat':['Front Barbell Squat'],
  'bulgarian-split-squat':['Single Leg Barbell Squat'],
  'seated-leg-curl':['Seated Leg Curl'],
  'lying-leg-curl':['Lying Leg Curls'],
  'nordic-hamstring-curl':['Natural Glute Ham Raise'],
  'cable-pull-through':['Pull Through'],
  '45-degree-back-extension':['Hyperextensions (Back Extensions)'],
  'barbell-hip-thrust':['Barbell Hip Thrust'],
  'glute-bridge':['Butt Lift (Bridge)'],
  'single-leg-glute-bridge':['Single Leg Glute Bridge'],
  'cable-glute-kickback':['Cable Kickback'],
  'donkey-kick':['Donkey Kicks'],
  'fire-hydrant':['Fire Hydrant'],
  'standing-calf-raise':['Standing Calf Raises'],
  'machine-calf-raise':['Standing Calf Raises'],
  'crunch':['Crunches'],
  'sit-up':['3/4 Sit-Up'],
  'bicycle-crunch':['Air Bike'],
  'bird-dog':['Bird Dog'],
  'side-plank':['Side Bridge'],
  'hanging-knee-raise':['Hanging Leg Raise'],
  'ab-wheel-rollout':['Ab Roller'],
  'stability-ball-crunch':['Exercise Ball Crunch'],
  'russian-twist':['Russian Twist'],
  'medicine-ball-slam':['Medicine Ball Slam'],
  'treadmill-walk':['Walking, Treadmill'],
  'treadmill-run':['Running, Treadmill'],
  'stationary-bike':['Bicycling, Stationary'],
  'elliptical':['Elliptical Trainer'],
  'rowing-machine':['Rowing, Stationary'],
  'ski-erg':['SkiErg']
};

function appEquipment(name){
  const n=normalize(name);
  if(n.includes('smith'))return['machine'];
  if(n.includes('dumbbell'))return['dumbbell'];
  if(n.includes('barbell')||n.includes('ez bar'))return['barbell','e-z curl bar'];
  if(n.includes('kettlebell'))return['kettlebells'];
  if(n.includes('cable')||n.includes('pushdown')||n.includes('pulldown')||n.includes('face pull'))return['cable'];
  if(n.includes('band '))return['bands'];
  if(n.includes('machine')||n.includes('leg press')||n.includes('hack squat')||n.includes('pec deck')||n.includes('leg extension')||n.includes('leg curl'))return['machine'];
  if(n.includes('push up')||n.includes('pull up')||n.includes('plank')||n.includes('bird dog')||n.includes('bodyweight'))return['body only'];
  return[];
}
function equipmentOK(app,source){const need=appEquipment(app.name);if(!need.length)return true;const have=normalize(source.equipment||'');return need.some(n=>have===normalize(n)||have.includes(normalize(n))||normalize(n).includes(have));}
function score(a,b){const A=new Set(normalize(a).split(' ')),B=new Set(normalize(b).split(' '));const same=[...A].filter(x=>B.has(x)).length;return same/(new Set([...A,...B]).size||1);}

const res=await fetch(SOURCE);
if(!res.ok)throw new Error(`Free Exercise DB fetch failed ${res.status}`);
const provider=await res.json();
if(!Array.isArray(provider)||provider.length<800)throw new Error(`Unexpected backup dataset size ${provider?.length}`);

const rows=[];
for(const app of unresolved){
  const names=[app.name,...(EXPLICIT[app.id]||[])];
  const exact=provider.filter(p=>equipmentOK(app,p)&&names.some(n=>normalize(n)===normalize(p.name)||signature(n)===signature(p.name)));
  let match=null,reason=null;
  if(exact.length===1){match=exact[0];reason='exact/explicit public-domain name match';}
  else if(exact.length>1){
    const same=exact.filter(p=>normalize(p.name)===normalize(app.name));
    if(same.length===1){match=same[0];reason='exact app-name public-domain match';}
  }
  const top=provider.filter(p=>equipmentOK(app,p)).map(p=>({p,s:score(app.name,p.name)})).sort((a,b)=>b.s-a.s).slice(0,7).map(({p,s})=>({id:p.id,name:p.name,equipment:p.equipment,images:p.images,score:Number(s.toFixed(4))}));
  rows.push({id:app.id,name:app.name,match:match?{id:match.id,name:match.name,equipment:match.equipment,images:match.images}:null,reason,topCandidates:top});
}
const matched=rows.filter(x=>x.match),missing=rows.filter(x=>!x.match);
const out={generatedAt:new Date().toISOString(),source:'Free Exercise DB (Unlicense/public domain)',inputUnresolved:unresolved.length,matched:matched.length,stillUnresolved:missing.length,rows};
await fs.writeFile('EXERCISE_MEDIA_BACKUP_DIAGNOSTIC_V46.json',JSON.stringify(out,null,2),'utf8');
await fs.writeFile('EXERCISE_MEDIA_BACKUP_DIAGNOSTIC_V46.md',`# Public-domain backup media diagnostic v46\n\n- ExerciseDB-unresolved input: **${unresolved.length}**\n- Safely matched to Free Exercise DB start/end media: **${matched.length}**\n- Still unresolved: **${missing.length}**\n\nThese matches are start/end JPG pairs from the public-domain Free Exercise DB. They can be converted into local looping GIFs without AI generation.\n\n## Matched\n${matched.map(x=>`- ✓ ${x.name} → ${x.match.name} (${x.match.id})`).join('\n')||'None'}\n\n## Still unresolved\n${missing.map(x=>`- ${x.name} (${x.id}) — ${x.topCandidates.slice(0,4).map(c=>`${c.name} [${c.equipment||'unknown'}]`).join(' | ')}`).join('\n')||'None'}\n`,'utf8');
console.log(`[backup] input=${unresolved.length} matched=${matched.length} unresolved=${missing.length}`);
