const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const document = { addEventListener() {}, getElementById() { return null; } };
const SN = {
  active: { index: 0, exercises: [] },
  exerciseId: exercise => exercise.id,
  exerciseMatches: (a, b) => a?.id === b?.id,
  equipment: exercise => exercise.equipment || 'Gym',
  meta: exercise => ({ primary: exercise.muscle, secondary: exercise.secondaryMuscles || [], equipment: exercise.equipment || 'Gym' })
};
const context = { window: { SN36: SN }, document, exerciseLibrary: [], setTimeout() {}, render() {} };
vm.runInNewContext(fs.readFileSync('swap-exercise-v90.js', 'utf8'), context);
const engine = context.window.START_NOW_SWAP_ENGINE;
const ex = (id, name, muscle, equipment = 'Gym') => ({ id, name, muscle, equipment });

assert.equal(engine.isCorrelatedSwap(ex('lat', 'Lat Pulldown', 'Back'), ex('pullup', 'Pull-Up', 'Back')), true);
assert.equal(engine.isCorrelatedSwap(ex('lat', 'Lat Pulldown', 'Back'), ex('row', 'Seated Row', 'Back')), false);
assert.equal(engine.isCorrelatedSwap(ex('curl', 'Leg Curl', 'Hamstrings'), ex('rdl', 'Romanian Deadlift', 'Hamstrings')), false);
assert.equal(engine.isCorrelatedSwap(ex('curl', 'Leg Curl', 'Hamstrings'), ex('nordic', 'Nordic Hamstring Curl', 'Hamstrings')), true);
assert.equal(engine.isCorrelatedSwap(ex('pushdown', 'Triceps Pushdown', 'Triceps'), ex('overhead', 'Overhead Cable Triceps Extension', 'Triceps')), false);
assert.equal(engine.isCorrelatedSwap(ex('pushdown', 'Triceps Pushdown', 'Triceps'), ex('rope', 'Rope Triceps Pushdown', 'Triceps')), true);
assert.equal(engine.isCorrelatedSwap(ex('fly', 'Cable Fly', 'Chest'), ex('bench', 'Barbell Bench Press', 'Chest')), false);
assert.equal(engine.isCorrelatedSwap(ex('fly', 'Cable Fly', 'Chest'), ex('pec', 'Pec Deck Fly', 'Chest')), true);
assert.equal(engine.isCorrelatedSwap(ex('abduct', 'Hip Abduction', 'Glutes'), ex('thrust', 'Hip Thrust', 'Glutes')), false);
assert.equal(engine.isCorrelatedSwap(ex('abduct', 'Hip Abduction', 'Glutes'), ex('band', 'Band Hip Abduction', 'Glutes')), true);
assert.equal(engine.isCorrelatedSwap(ex('press', 'Chest Press', 'Chest'), ex('row', 'Seated Row', 'Back')), false);

SN.active = { index: 0, exercises: [ex('lat', 'Lat Pulldown', 'Back'), ex('pullup', 'Pull-Up', 'Back')] };
const ranked = engine.eligibleExercises(ex('lat', 'Lat Pulldown', 'Back'), [
  ex('pullup', 'Pull-Up', 'Back'),
  ex('neutral-pulldown', 'Neutral-Grip Lat Pulldown', 'Back', 'Cable'),
  ex('row', 'Cable Row', 'Back', 'Cable')
]);
assert.deepEqual(ranked.map(item => item.id), ['neutral-pulldown'], 'used and unrelated movements are excluded');
console.log('Swap relevance tests passed');
