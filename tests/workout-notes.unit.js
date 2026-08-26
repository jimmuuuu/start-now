const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

class MemoryStorage {
  constructor() { this.values = new Map(); }
  getItem(key) { return this.values.has(key) ? this.values.get(key) : null; }
  setItem(key, value) { this.values.set(key, String(value)); }
  removeItem(key) { this.values.delete(key); }
  clear() { this.values.clear(); }
}

const context = {
  window: {},
  localStorage: new MemoryStorage(),
  console,
  state: { customWorkouts: [] },
  exerciseLibrary: [],
  showToast() {}
};
vm.createContext(context);
vm.runInContext(fs.readFileSync('product-core-v36.js', 'utf8'), context);

const SN = context.window.SN36;
const exercise = { id: 'chest-press', name: 'Chest Press' };

SN.saveSessions([
  { timestamp: 1000, exercises: [{ ...exercise, note: 'Seat 3 felt best.' }] },
  { timestamp: 2000, exercises: [{ ...exercise, note: '' }] }
]);

assert.equal(SN.previousExerciseNote(exercise).note, 'Seat 3 felt best.');

const draftNote = SN.normalizeExerciseNote('A'.repeat(510));
assert.equal(draftNote.length, 500);
SN.write(SN.keys.active, { exercises: [{ ...exercise, note: draftNote }] });
assert.equal(SN.read(SN.keys.active, null).exercises[0].note.length, 500);

SN.saveSessions([
  ...SN.sessions(),
  { timestamp: 3000, exercises: [{ ...exercise, note: draftNote.trim() }] }
]);
assert.equal(SN.previousExerciseNote(exercise).note.length, 500);

const workoutSource = fs.readFileSync('product-workout-v36.js', 'utf8');
assert.match(workoutSource, /id="snExerciseNote"/);
assert.match(workoutSource, /note:SN\.normalizeExerciseNote\(ex\.note\)\.trim\(\)/);
assert.match(workoutSource, /document\.getElementById\("snExerciseNote"\).*saveActive\(\)/s);

console.log('Exercise note persistence checks passed.');
