import fs from 'node:fs/promises';

const APP_FILES = ['app.js', 'exercise-library-extra.js'];
const API_URL = 'https://oss.exercisedb.dev/api/v1/exercises?limit=2000&offset=0';
const OUTPUT_JS = 'exercise-media-map-v43.js';
const OUTPUT_REPORT = 'EXERCISE_MEDIA_COVERAGE_V43.md';

// Explicit only: these are intentional wording/variation matches, never fuzzy auto-approval.
const MANUAL_PROVIDER_NAMES = {
  'chest-press': ['lever chest press', 'machine chest press'],
  'incline-press': ['lever incline chest press', 'incline chest press'],
  'cable-fly': ['cable crossover'],
  'shoulder-press': ['lever shoulder press', 'machine shoulder press'],
  'lateral-raise': ['dumbbell lateral raise', 'side lateral raise'],
  'triceps-pushdown': ['triceps pushdown'],
  'lat-pulldown': ['cable wide grip lat pulldown', 'wide grip lat pulldown'],
  'seated-row': ['cable seated row', 'seated cable row'],
  'reverse-fly': ['dumbbell reverse fly', 'reverse fly'],
  'biceps-curl': ['dumbbell biceps curl', 'dumbbell bicep curl'],
  'hammer-curl': ['dumbbell hammer curl', 'hammer curl'],
  'leg-press': ['sled 45 degrees leg press', 'leg press'],
  'leg-extension': ['lever leg extension', 'leg extension'],
  'leg-curl': ['lever lying leg curl', 'lying leg curl'],
  'calf-raise': ['lever standing calf raise', 'standing calf raise'],
  'hip-abduction': ['lever seated hip abduction', 'seated hip abduction'],
  'cable-crunch': ['cable kneeling crunch', 'cable crunch'],
  'romanian-deadlift': ['barbell romanian deadlift', 'romanian deadlift'],
  'barbell-romanian-deadlift': ['barbell romanian deadlift', 'romanian deadlift'],
  'dumbbell-romanian-deadlift': ['dumbbell romanian deadlift'],
  'barbell-bench-press': ['barbell bench press'],
  'dumbbell-bench-press': ['dumbbell bench press'],
  'incline-barbell-bench-press': ['barbell incline bench press'],
  'incline-dumbbell-bench-press': ['dumbbell incline bench press', 'incline dumbbell bench press'],
  'machine-chest-press': ['lever chest press', 'machine chest press'],
  'smith-machine-bench-press': ['smith bench press', 'smith machine bench press'],
  'smith-machine-incline-press': ['smith incline bench press', 'smith machine incline bench press'],
  'seated-dumbbell-shoulder-press': ['dumbbell seated shoulder press', 'seated dumbbell shoulder press'],
  'standing-dumbbell-shoulder-press': ['dumbbell standing shoulder press', 'standing dumbbell shoulder press'],
  'barbell-overhead-press': ['barbell standing military press', 'barbell shoulder press', 'barbell overhead press'],
  'machine-shoulder-press': ['lever shoulder press', 'machine shoulder press'],
  'smith-machine-shoulder-press': ['smith shoulder press', 'smith machine shoulder press'],
  'face-pull': ['cable rear delt row face pull', 'face pull'],
  'barbell-row': ['barbell bent over row', 'bent over barbell row'],
  'dumbbell-row': ['dumbbell bent over row', 'bent over dumbbell row'],
  'one-arm-dumbbell-row': ['dumbbell one arm bent over row', 'one arm dumbbell row'],
  'rope-triceps-pushdown': ['cable rope pushdown', 'triceps pushdown rope attachment'],
  'straight-bar-pushdown': ['cable straight bar pushdown', 'triceps pushdown'],
  'v-bar-pushdown': ['cable v bar pushdown', 'triceps pushdown v bar'],
  'single-arm-pushdown': ['cable one arm triceps pushdown', 'single arm pushdown'],
  'overhead-cable-triceps-extension': ['cable overhead triceps extension'],
  'rope-overhead-extension': ['cable rope overhead triceps extension'],
  'dumbbell-overhead-triceps-extension': ['dumbbell standing triceps extension', 'standing dumbbell triceps extension'],
  'barbell-curl': ['barbell curl'],
  'ez-bar-curl': ['ez barbell curl', 'ez bar curl'],
  'dumbbell-curl': ['dumbbell biceps curl', 'dumbbell bicep curl'],
  'preacher-curl': ['ez barbell preacher curl', 'preacher curl'],
  'machine-preacher-curl': ['lever preacher curl', 'machine preacher curl'],
  'back-squat': ['barbell full squat', 'barbell squat'],
  'front-squat': ['barbell front chest squat', 'front barbell squat', 'front squat'],
  'goblet-squat': ['dumbbell goblet squat', 'goblet squat'],
  'hack-squat': ['sled hack squat', 'hack squat'],
  'smith-machine-squat': ['smith squat', 'smith machine squat'],
  'walking-lunge': ['walking lunge'],
  'reverse-lunge': ['dumbbell rear lunge', 'reverse lunge'],
  'forward-lunge': ['dumbbell lunge', 'forward lunge'],
  'barbell-hip-thrust': ['barbell hip thrust'],
  'smith-machine-hip-thrust': ['smith hip thrust', 'smith machine hip thrust'],
  'dumbbell-hip-thrust': ['dumbbell hip thrust'],
  'standing-calf-raise': ['lever standing calf raise', 'standing calf raise'],
  'seated-calf-raise': ['lever seated calf raise', 'seated calf raise'],
  'leg-press-calf-raise': ['sled calf press on leg press', 'calf press on leg press'],
  'plank': ['front plank', 'plank']
};

const normalize = value => String(value || '')
  .toLowerCase()
  .replace(/&/g, ' and ')
  .replace(/\btricep\b/g, 'triceps')
  .replace(/\bbicep\b/g, 'biceps')
  .replace(/\bpushups?\b/g, 'push up')
  .replace(/\bpullups?\b/g, 'pull up')
  .replace(/\bchinups?\b/g, 'chin up')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim()
  .replace(/\s+/g, ' ')
  .split(' ')
  .map(token => ({raises:'raise',curls:'curl',rows:'row',extensions:'extension',presses:'press',flyes:'fly',flys:'fly',lunges:'lunge',squats:'squat'}[token] || token))
  .join(' ');

const inferEquipment = name => {
  const n = normalize(name);
  const checks = [
    ['smith', ['smith machine']],
    ['dumbbell', ['dumbbell']],
    ['barbell', ['barbell']],
    ['ez bar', ['ez barbell','ez bar']],
    ['kettlebell', ['kettlebell']],
    ['cable', ['cable']],
    ['rope ', ['cable']],
    ['machine', ['leverage machine','machine']],
    ['band ', ['band','resistance band']],
    ['trx', ['body weight','suspension']],
    ['stability ball', ['stability ball']],
    ['swiss ball', ['stability ball']],
    ['bodyweight', ['body weight']],
    ['push up', ['body weight']],
    ['pull up', ['body weight']],
    ['chin up', ['body weight']],
    ['plank', ['body weight']],
    ['dip', ['body weight','assisted']],
    ['ab wheel', ['wheel roller','body weight']],
    ['landmine', ['barbell']],
    ['trap bar', ['trap bar','barbell']],
    ['plate ', ['weighted','other']]
  ];
  for (const [needle, values] of checks) if (n.includes(needle)) return values;
  return [];
};

function extractExercises(source) {
  const out = [];
  const re = /\{\s*(?:"?id"?)\s*:\s*["']([^"']+)["']\s*,\s*(?:"?name"?)\s*:\s*["']([^"']+)["']\s*,\s*(?:"?muscle"?)\s*:\s*["']([^"']+)["'][^{}]*?\}/g;
  let m;
  while ((m = re.exec(source))) out.push({ id:m[1], name:m[2], muscle:m[3] });
  return out;
}

async function getAllExercises() {
  const all = [];
  for (const file of APP_FILES) {
    const text = await fs.readFile(file, 'utf8');
    all.push(...extractExercises(text));
  }
  const deduped = [...new Map(all.map(ex => [ex.id, ex])).values()];
  if (deduped.length < 200) throw new Error(`Exercise extraction found only ${deduped.length}. Expected the full app library.`);
  return deduped;
}

async function getProvider() {
  const res = await fetch(API_URL, { headers:{Accept:'application/json'} });
  if (!res.ok) throw new Error(`ExerciseDB request failed: ${res.status}`);
  const json = await res.json();
  const rows = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : Array.isArray(json?.results) ? json.results : [];
  if (rows.length < 1000) throw new Error(`ExerciseDB returned only ${rows.length} rows; refusing to generate a partial map.`);
  return rows.filter(row => row?.exerciseId && row?.name && row?.gifUrl);
}

function providerEquipment(row) {
  const arr = Array.isArray(row.equipments) ? row.equipments : row.equipment ? [row.equipment] : [];
  return arr.map(normalize);
}

function equipmentCompatible(ex, row) {
  const needed = inferEquipment(ex.name);
  if (!needed.length) return true;
  const have = providerEquipment(row);
  if (!have.length) return true;
  return needed.some(n => have.some(h => h.includes(n) || n.includes(h)));
}

function exactCandidates(ex, provider) {
  const desired = new Set([normalize(ex.name), ...(MANUAL_PROVIDER_NAMES[ex.id] || []).map(normalize)]);
  return provider.filter(row => desired.has(normalize(row.name)) && equipmentCompatible(ex, row));
}

function tokenScore(a, b) {
  const A = new Set(normalize(a).split(' '));
  const B = new Set(normalize(b).split(' '));
  const both = [...A].filter(x => B.has(x)).length;
  const union = new Set([...A,...B]).size || 1;
  return both / union;
}

function topCandidates(ex, provider) {
  return provider
    .filter(row => equipmentCompatible(ex, row))
    .map(row => ({row, score:tokenScore(ex.name, row.name)}))
    .sort((a,b) => b.score-a.score)
    .slice(0,5)
    .map(x => `${x.row.name} [${(x.row.equipments||[]).join(', ')}] ${(x.score*100).toFixed(0)}%`);
}

async function verifyGif(url) {
  try {
    const res = await fetch(url, { method:'GET', headers:{Range:'bytes=0-1023'} });
    if (!res.ok && res.status !== 206) return {ok:false,status:res.status};
    const type = res.headers.get('content-type') || '';
    await res.body?.cancel?.();
    return {ok:/image\/gif/i.test(type) || /octet-stream/i.test(type),status:res.status,type};
  } catch (error) {
    return {ok:false,error:String(error?.message||error)};
  }
}

function buildRuntimeFile(map, report) {
  const json = JSON.stringify(map, null, 2);
  return `// START/NOW v43 — generated deterministic ExerciseDB GIF map.\n// DO NOT hand-edit generated entries; edit scripts/build-exercise-media-map.mjs overrides instead.\n(() => {\n  const MAP = ${json};\n  const BROKEN = new Map();\n  const idOf = ex => String(ex?.id || window.SN36?.exerciseId?.(ex) || '').trim();\n  const resolve = ex => {\n    const id = idOf(ex);\n    const entry = MAP[id] || null;\n    const broken = BROKEN.get(id);\n    const result = broken ? {status:'broken',internalId:id,entry,failureReason:broken.reason} : entry ? {status:'ready',internalId:id,entry} : {status:'missing',internalId:id,entry:null,failureReason:'No approved GIF mapping'};\n    console.info('[Exercise Media]', {exerciseDisplayed:ex?.name||'Exercise',internalId:id,assetFound:result.status==='ready',assetType:entry?.type||null,source:entry?.source||null,providerExerciseId:entry?.providerExerciseId||null,providerName:entry?.providerName||null,failureReason:result.status==='ready'?null:result.failureReason});\n    return result;\n  };\n  const audit = () => {\n    const library = typeof exerciseLibrary !== 'undefined' && Array.isArray(exerciseLibrary) ? exerciseLibrary : [];\n    const rows = library.map(ex => { const r=resolve(ex); return {id:idOf(ex),name:ex.name,status:r.status,providerName:r.entry?.providerName||null,gifUrl:r.entry?.src||null}; });\n    const result={total:rows.length,matched:rows.filter(x=>x.status==='ready').length,missing:rows.filter(x=>x.status==='missing').length,broken:rows.filter(x=>x.status==='broken').length,coverage:rows.length?Math.round(rows.filter(x=>x.status==='ready').length/rows.length*10000)/100:0,rows};\n    window.START_NOW_EXERCISE_MEDIA_AUDIT=result; return result;\n  };\n  window.START_NOW_EXERCISE_MEDIA = {version:43,provider:'ExerciseDB V1',manifest:MAP,resolve,audit,report(){const r=audit();console.group('[Exercise Media Audit v43]');console.info('Total exercises:',r.total);console.info('GIF matched:',r.matched);console.info('Missing GIFs:',r.missing);console.info('Broken GIFs:',r.broken);console.info('Coverage:',r.coverage+'%');if(r.missing||r.broken)console.table(r.rows.filter(x=>x.status!=='ready'));console.groupEnd();return r;},markBroken(ex,url,reason='GIF failed to load'){const id=typeof ex==='string'?ex:idOf(ex);BROKEN.set(id,{url,reason});console.warn('[Exercise Media]',{internalId:id,failureReason:reason,url});},clearBroken(ex){BROKEN.delete(typeof ex==='string'?ex:idOf(ex));}};\n  queueMicrotask(()=>window.START_NOW_EXERCISE_MEDIA.audit());\n})();\n`;
}

function markdown(exercises, matched, missing, broken) {
  const aliasCount = matched.filter(x => normalize(x.ex.name) !== normalize(x.row.name)).length;
  const pct = exercises.length ? ((matched.length / exercises.length) * 100).toFixed(2) : '0.00';
  return `# START/NOW Exercise GIF Coverage — v43\n\nGenerated from the app's complete exercise definitions and the official ExerciseDB V1 free dataset.\n\n- Total exercises: **${exercises.length}**\n- GIF matched: **${matched.length}**\n- Alias/name-variant matches: **${aliasCount}**\n- Backup/local media: **0**\n- Missing GIFs: **${missing.length}**\n- Broken GIFs during build check: **${broken.length}**\n- Coverage: **${pct}%**\n\n## Missing\n${missing.length ? missing.map(x=>`- ${x.ex.name} (${x.ex.id}) — ${x.reason}`).join('\n') : 'None'}\n\n## Broken\n${broken.length ? broken.map(x=>`- ${x.ex.name} (${x.ex.id}) — ${x.check.status||x.check.error||'failed'}`).join('\n') : 'None'}\n\n## Matched\n${matched.map(x=>`- ✓ ${x.ex.name} → ${x.row.name} (${x.row.exerciseId})`).join('\n')}\n`;
}

async function main() {
  const exercises = await getAllExercises();
  const provider = await getProvider();
  console.log(`[media] app exercises=${exercises.length}; provider exercises=${provider.length}`);

  const matched = [];
  const missing = [];
  for (const ex of exercises) {
    const candidates = exactCandidates(ex, provider);
    if (candidates.length === 1) matched.push({ex,row:candidates[0]});
    else if (candidates.length > 1) {
      const exactName = candidates.filter(row => normalize(row.name) === normalize(ex.name));
      if (exactName.length === 1) matched.push({ex,row:exactName[0]});
      else missing.push({ex,reason:`Ambiguous approved-name match (${candidates.map(x=>x.name).join(' | ')})`,top:topCandidates(ex,provider)});
    } else missing.push({ex,reason:'No exact or explicitly approved provider-name match',top:topCandidates(ex,provider)});
  }

  if (missing.length) {
    console.error(`\n[media] ${missing.length} exercises still need explicit provider-name approval:`);
    for (const item of missing) console.error(`- ${item.ex.id} :: ${item.ex.name}\n  candidates: ${item.top.join(' || ')}`);
    process.exitCode = 1;
    return;
  }

  const broken = [];
  const concurrency = 12;
  for (let i=0;i<matched.length;i+=concurrency) {
    await Promise.all(matched.slice(i,i+concurrency).map(async item => {
      const check = await verifyGif(item.row.gifUrl);
      item.check = check;
      if (!check.ok) broken.push({...item,check});
    }));
  }

  if (broken.length) {
    console.error(`\n[media] ${broken.length} mapped GIF URLs failed the build-time load check.`);
    for (const item of broken) console.error(`- ${item.ex.id} :: ${item.ex.name} -> ${item.row.gifUrl} (${JSON.stringify(item.check)})`);
    process.exitCode = 1;
    return;
  }

  const map = Object.fromEntries(matched.sort((a,b)=>a.ex.id.localeCompare(b.ex.id)).map(({ex,row}) => [ex.id, {
    type:'gif',
    src:row.gifUrl,
    source:'ExerciseDB V1',
    providerExerciseId:row.exerciseId,
    providerName:row.name,
    equipments:row.equipments || [],
    targetMuscles:row.targetMuscles || [],
    approved:true
  }]));

  await fs.writeFile(OUTPUT_JS, buildRuntimeFile(map), 'utf8');
  await fs.writeFile(OUTPUT_REPORT, markdown(exercises,matched,missing,broken), 'utf8');
  console.log(`PASS — 100% exercise media coverage (${matched.length}/${exercises.length}).`);
}

main().catch(error => { console.error(error); process.exit(1); });
