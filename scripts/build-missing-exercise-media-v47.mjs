import fs from 'node:fs/promises';

const SOURCE_FILES = ['app.js', 'exercise-library-extra.js'];
const INPUT = 'EXERCISE_MEDIA_BACKUP_DIAGNOSTIC_V46.json';
const OUTPUT = 'missing-exercise-media.json';

function extractExercises(source) {
  const rows = [];
  const re = /\{\s*(?:"?id"?)\s*:\s*["']([^"']+)["']\s*,\s*(?:"?name"?)\s*:\s*["']([^"']+)["']\s*,\s*(?:"?muscle"?)\s*:\s*["']([^"']+)["'][^{}]*?\}/g;
  let m;
  while ((m = re.exec(source))) rows.push({ id: m[1], name: m[2], muscle: m[3] });
  return rows;
}

function equipmentFromName(name) {
  const n = String(name || '').toLowerCase();
  if (/smith/.test(n)) return 'Smith Machine';
  if (/cable|pushdown|pulldown|face pull|wood chop|pallof/.test(n)) return 'Cable';
  if (/dumbbell/.test(n)) return 'Dumbbell';
  if (/barbell|ez-bar|ez bar/.test(n)) return 'Barbell';
  if (/kettlebell/.test(n)) return 'Kettlebell';
  if (/trap bar/.test(n)) return 'Trap Bar';
  if (/band/.test(n)) return 'Resistance Band';
  if (/medicine ball/.test(n)) return 'Medicine Ball';
  if (/battle rope|jump rope/.test(n)) return 'Rope';
  if (/sled/.test(n)) return 'Sled';
  if (/treadmill/.test(n)) return 'Treadmill';
  if (/stationary bike|recumbent bike/.test(n)) return 'Bike';
  if (/elliptical/.test(n)) return 'Elliptical';
  if (/stair climber|stepmill/.test(n)) return 'Stair Machine';
  if (/rowing machine/.test(n)) return 'Rowing Machine';
  if (/ski erg/.test(n)) return 'SkiErg';
  if (/machine|leg press|hack squat|pec deck|preacher curl|glute drive|leg extension|leg curl|hip abduction|hip adduction|pendulum squat/.test(n)) return 'Machine';
  if (/push-up|push up|plank|bird dog|dead bug|hollow|sit-up|sit up|crunch|v-up|toe touch|wall sit|donkey kick|fire hydrant|frog pump|glute bridge|dead hang|towel hang/.test(n)) return 'Bodyweight';
  return 'Gym';
}

const app = [];
for (const file of SOURCE_FILES) app.push(...extractExercises(await fs.readFile(file, 'utf8')));
const byId = new Map(app.map(ex => [ex.id, ex]));

const audit = JSON.parse(await fs.readFile(INPUT, 'utf8'));
const unresolved = audit.rows.filter(row => !row.match);
if (unresolved.length !== audit.stillUnresolved) throw new Error(`Expected ${audit.stillUnresolved} unresolved rows, found ${unresolved.length}`);
if (unresolved.length !== 107) throw new Error(`Expected 107 unresolved exercises, found ${unresolved.length}`);

const output = unresolved.map(row => {
  const ex = byId.get(row.id);
  if (!ex) throw new Error(`Missing app metadata for ${row.id}`);
  return {
    appId: ex.id,
    appName: ex.name,
    equipment: equipmentFromName(ex.name),
    primaryMuscles: [ex.muscle],
    aliases: [],
    status: 'missing'
  };
});

await fs.writeFile(OUTPUT, JSON.stringify(output, null, 2) + '\n');
console.log(`[media] wrote ${OUTPUT} with ${output.length} exercises`);
