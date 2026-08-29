const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const coreSource = fs.readFileSync(path.join(root, 'product-core-v36.js'), 'utf8');
const dataSource = fs.readFileSync(path.join(root, 'data-store-v117.js'), 'utf8');

function storage(seed = {}) {
  const values = new Map(Object.entries(seed));
  return {
    get length() { return values.size; },
    key(index) { return [...values.keys()][index] ?? null; },
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
    snapshot() { return Object.fromEntries(values); }
  };
}

function boot(localStorage) {
  const listeners = new Map();
  const context = {
    console,
    Date,
    Map,
    Set,
    localStorage,
    showToast() {},
    state: { customWorkouts: [], streak: 0, completedWorkouts: 0 },
    exerciseLibrary: [
      { id: 'bench-press', name: 'Bench Press', muscle: 'Chest', sets: 3, reps: 10, cue: 'Control the bar.' },
      { id: 'row', name: 'Row', muscle: 'Back', sets: 3, reps: 10, cue: 'Pull with the back.' }
    ],
    CustomEvent: class CustomEvent { constructor(type, options = {}) { this.type = type; this.detail = options.detail; } },
    addEventListener(type, handler) { const rows = listeners.get(type) || []; rows.push(handler); listeners.set(type, rows); },
    dispatchEvent(event) { (listeners.get(event.type) || []).forEach(handler => handler(event)); return true; },
    saveCustomWorkouts() { localStorage.setItem('sn_custom_workouts', JSON.stringify(context.state.customWorkouts)); }
  };
  context.window = context;
  vm.createContext(context);
  vm.runInContext(coreSource, context, { filename: 'product-core-v36.js' });
  vm.runInContext(dataSource, context, { filename: 'data-store-v117.js' });
  return context;
}

const monday = new Date('2026-08-24T12:00:00Z').getTime();
const seed = storage({
  sn_custom_workouts: JSON.stringify([{
    name: 'Push Day',
    days: ['Monday', 'Notaday'],
    createdAt: 100,
    exercises: [
      { name: 'Bench Press', muscle: 'Wrong copied label', sets: 3, reps: 10 },
      { id: 'bench-press', name: 'Bench Press', muscle: 'Chest', sets: 2, reps: 8 }
    ]
  }]),
  sn_progress_sessions: JSON.stringify([
    { timestamp: 'invalid', workoutName: 'Bad row', exercises: [] },
    {
      id: 'session-one',
      timestamp: monday,
      workoutId: 'legacy-push-day-100',
      workoutName: 'Push Day',
      exercises: [{ id: 'bench-press', name: 'Bench Press', muscle: 'Chest', sets: [{ weight: 100, reps: 10, done: true }] }]
    },
    {
      id: 'empty-session',
      timestamp: monday + 1000,
      workoutId: 'legacy-push-day-100',
      workoutName: 'Push Day',
      exercises: [{ id: 'row', name: 'Row', muscle: 'Back', sets: [{ weight: 80, reps: 10, done: false }] }]
    }
  ])
});

let app = boot(seed);
let SN = app.SN36;
let workouts = SN.workouts();
let sessions = SN.sessions();

assert.equal(workouts.length, 1, 'one workout migrates');
assert.equal(workouts[0].id, 'legacy-push-day-100', 'missing workout ID receives a persisted stable ID');
assert.deepEqual([...workouts[0].days], ['Monday'], 'invalid schedule days are removed');
assert.equal(workouts[0].exercises[0].exerciseId, 'bench-press', 'library identity replaces name matching');
assert.equal(workouts[0].exercises[0].muscle, 'Chest', 'library muscle metadata repairs copied display text');
assert.notEqual(workouts[0].exercises[0].workoutExerciseId, workouts[0].exercises[1].workoutExerciseId, 'repeated exercises keep unique workout instance IDs');
assert.equal(workouts[0].exercises[0].exerciseId, workouts[0].exercises[1].exerciseId, 'repeated exercises retain the same canonical exercise ID');

assert.equal(sessions.length, 1, 'invalid and zero-set sessions do not count as completed history');
assert.equal(SN.allSessions().length, 2, 'an incomplete valid session remains recoverable without affecting stats');
assert.equal(sessions[0].volume, 1000, 'session volume is derived from completed sets');
assert.equal(SN.summary().workouts, 1, 'summary uses canonical completed sessions');
assert.equal(SN.summary().completedSets, 1, 'summary set total is canonical');
assert.equal(SN.muscleActivity()[0].muscle, 'Chest', 'primary muscle activity comes from canonical metadata');
assert.ok(SN.muscleActivity().some(item => item.muscle === 'Triceps' && item.secondarySets === 1), 'secondary muscle activity is derived consistently');
assert.equal(SN.exerciseMatches({ id: 'bench-a', name: 'Same Name' }, { id: 'bench-b', name: 'Same Name' }), false, 'stable IDs prevent false name matches');
const aggregateOnly = SN.normalizeSession({ id: 'legacy-aggregate', timestamp: monday, workoutId: 'legacy', completedSets: 4, plannedSets: 6, volume: 900, exercises: [] });
assert.equal(aggregateOnly.status, 'completed', 'legacy aggregate-only sessions remain completed');
assert.equal(aggregateOnly.volume, 900, 'legacy aggregate totals survive migration');

SN.upsertWorkout({ ...workouts[0], name: 'Renamed Push', days: ['Tuesday'] });
assert.equal(SN.workouts()[0].name, 'Renamed Push', 'editing keeps the workout identity');
assert.equal(SN.scheduleMap().has('Monday'), false, 'editing immediately removes the old scheduled day');
assert.equal(SN.scheduleMap().get('Tuesday').id, workouts[0].id, 'editing immediately updates the shared schedule');
assert.equal(SN.previousWorkout(SN.workouts()[0]).id, 'session-one', 'history remains connected after a display-name edit');

SN.deleteWorkout(workouts[0].id);
assert.equal(SN.workouts().length, 0, 'deleting a template updates the workout source');
assert.equal(SN.scheduleMap().size, 0, 'deleting a template updates schedule-derived features');
assert.equal(SN.sessions().length, 1, 'deleting a template preserves completed historical facts');
assert.deepEqual(JSON.parse(seed.getItem('sn_deleted_workout_ids')), [workouts[0].id], 'workout deletion persists a cloud-sync tombstone');

SN.updateSession('session-one', { exercises: [{ id: 'bench-press', name: 'Bench Press', sets: [{ weight: 110, reps: 10, done: true }] }] });
assert.equal(SN.summary().volume, 1100, 'editing a session recalculates every derived total');
SN.deleteSession('session-one');
assert.equal(SN.summary().workouts, 0, 'deleting a session removes it from all derived totals');
assert.equal(app.state.completedWorkouts, 0, 'legacy state mirrors the canonical session count');
assert.deepEqual(JSON.parse(seed.getItem('sn_deleted_session_ids')), ['session-one'], 'session deletion persists a cloud-sync tombstone');

app = boot(seed);
SN = app.SN36;
assert.equal(SN.workouts().length, 0, 'canonical data survives a full app reload');
assert.equal(SN.sessions().length, 0, 'session edits/deletes survive a full app reload');
assert.ok(JSON.parse(seed.getItem('sn_progress_sessions')).every(row => row.schemaVersion === 2), 'persisted records are migrated to the current schema');

const remoteOlder = [{ id: 'shared', name: 'Remote old', updatedAt: 10, exercises: [] }];
const localNewer = [{ id: 'shared', name: 'Local new', updatedAt: 20, exercises: [] }];
assert.equal(SN.mergeWorkouts(remoteOlder, localNewer)[0].name, 'Local new', 'cloud merge resolves stable IDs by update time');

console.log('Unified data model tests passed.');
