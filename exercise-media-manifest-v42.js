// START/NOW v42 — deterministic, real exercise-media manifest.
// No AI images. No runtime exercise search. Internal exercise ID -> approved static media.
(() => {
  const SOURCE_ROOT = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
  const SOURCE_NAME = 'Free Exercise DB';
  const BROKEN_KEY = 'sn_exercise_media_broken_v42';

  const slug = value => String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_');

  // Only aliases that are intentionally equivalent in START/NOW are collapsed.
  // Distinct variations (Smith vs barbell, seated vs standing, cable vs dumbbell, etc.) stay distinct.
  const INTERNAL_TO_CANONICAL = {
    'chest-press': 'machine_chest_press',
    'machine-chest-press': 'machine_chest_press',
    'incline-press': 'machine_incline_chest_press',
    'cable-fly': 'cable_crossover',
    'shoulder-press': 'machine_shoulder_press',
    'machine-shoulder-press': 'machine_shoulder_press',
    'lateral-raise': 'dumbbell_lateral_raise',
    'dumbbell-lateral-raise': 'dumbbell_lateral_raise',
    'triceps-pushdown': 'cable_triceps_pushdown',
    'lat-pulldown': 'lat_pulldown',
    'seated-row': 'seated_cable_row',
    'cable-row': 'seated_cable_row',
    'biceps-curl': 'dumbbell_biceps_curl',
    'dumbbell-curl': 'dumbbell_biceps_curl',
    'hammer-curl': 'dumbbell_hammer_curl',
    'leg-press': 'leg_press',
    'leg-extension': 'leg_extension',
    'leg-curl': 'lying_leg_curl',
    'lying-leg-curl': 'lying_leg_curl',
    'calf-raise': 'standing_calf_raise',
    'standing-calf-raise': 'standing_calf_raise',
    'romanian-deadlift': 'barbell_romanian_deadlift',
    'barbell-romanian-deadlift': 'barbell_romanian_deadlift',
    'plank': 'plank',
    'cable-crunch': 'cable_crunch'
  };

  // Used only for legacy/custom exercise objects that have no stable internal ID.
  const LEGACY_NAME_TO_CANONICAL = {
    'chest press': 'machine_chest_press',
    'machine chest press': 'machine_chest_press',
    'incline press': 'machine_incline_chest_press',
    'cable fly': 'cable_crossover',
    'shoulder press': 'machine_shoulder_press',
    'machine shoulder press': 'machine_shoulder_press',
    'lateral raise': 'dumbbell_lateral_raise',
    'triceps pushdown': 'cable_triceps_pushdown',
    'tricep pushdown': 'cable_triceps_pushdown',
    'lat pulldown': 'lat_pulldown',
    'seated row': 'seated_cable_row',
    'seated cable row': 'seated_cable_row',
    'biceps curl': 'dumbbell_biceps_curl',
    'bicep curl': 'dumbbell_biceps_curl',
    'dumbbell curl': 'dumbbell_biceps_curl',
    'hammer curl': 'dumbbell_hammer_curl',
    'leg press': 'leg_press',
    'leg extension': 'leg_extension',
    'leg curl': 'lying_leg_curl',
    'lying leg curl': 'lying_leg_curl',
    'calf raise': 'standing_calf_raise',
    'standing calf raise': 'standing_calf_raise',
    'romanian deadlift': 'barbell_romanian_deadlift',
    'barbell romanian deadlift': 'barbell_romanian_deadlift',
    'plank': 'plank',
    'cable crunch': 'cable_crunch'
  };

  const pair = (sourceId, sourceExerciseName, note = '') => ({
    verified: true,
    type: 'image-pair',
    source: SOURCE_NAME,
    sourceId,
    sourceExerciseName,
    note,
    media: [
      `${SOURCE_ROOT}${encodeURIComponent(sourceId)}/0.jpg`,
      `${SOURCE_ROOT}${encodeURIComponent(sourceId)}/1.jpg`
    ]
  });

  // Curated only after checking the source movement/equipment. Missing is preferred over a wrong demo.
  const MANIFEST = {
    machine_chest_press: pair('Leverage_Chest_Press', 'Leverage Chest Press'),
    machine_incline_chest_press: pair('Leverage_Incline_Chest_Press', 'Leverage Incline Chest Press'),
    cable_crossover: pair('Cable_Crossover', 'Cable Crossover'),
    machine_shoulder_press: pair('Machine_Shoulder_Military_Press', 'Machine Shoulder (Military) Press'),
    dumbbell_lateral_raise: pair('Side_Lateral_Raise', 'Side Lateral Raise'),
    cable_triceps_pushdown: pair('Triceps_Pushdown', 'Triceps Pushdown'),
    lat_pulldown: pair('Wide-Grip_Lat_Pulldown', 'Wide-Grip Lat Pulldown', 'START/NOW generic Lat Pulldown uses the standard wide-grip pulldown demonstration; grip-specific variants remain separate.'),
    seated_cable_row: pair('Seated_Cable_Rows', 'Seated Cable Rows'),
    dumbbell_biceps_curl: pair('Dumbbell_Bicep_Curl', 'Dumbbell Bicep Curl'),
    dumbbell_hammer_curl: pair('Hammer_Curls', 'Hammer Curls'),
    leg_press: pair('Leg_Press', 'Leg Press'),
    leg_extension: pair('Leg_Extensions', 'Leg Extensions'),
    lying_leg_curl: pair('Lying_Leg_Curls', 'Lying Leg Curls'),
    standing_calf_raise: pair('Standing_Calf_Raises', 'Standing Calf Raises'),
    plank: pair('Plank', 'Plank'),
    cable_crunch: pair('Cable_Crunch', 'Cable Crunch'),

    barbell_bench_press: pair('Barbell_Bench_Press_-_Medium_Grip', 'Barbell Bench Press - Medium Grip'),
    dumbbell_bench_press: pair('Dumbbell_Bench_Press', 'Dumbbell Bench Press'),
    incline_barbell_bench_press: pair('Barbell_Incline_Bench_Press_-_Medium_Grip', 'Barbell Incline Bench Press - Medium Grip'),
    incline_dumbbell_bench_press: pair('Incline_Dumbbell_Press', 'Incline Dumbbell Press'),
    push_up: pair('Pushups', 'Pushups'),
    chest_dip: pair('Dips_-_Chest_Version', 'Dips - Chest Version'),

    seated_dumbbell_shoulder_press: pair('Dumbbell_Shoulder_Press', 'Dumbbell Shoulder Press'),
    barbell_overhead_press: pair('Barbell_Shoulder_Press', 'Barbell Shoulder Press'),
    dumbbell_front_raise: pair('Front_Dumbbell_Raise', 'Front Dumbbell Raise'),
    face_pull: pair('Face_Pull', 'Face Pull'),

    rope_triceps_pushdown: pair('Triceps_Pushdown_-_Rope_Attachment', 'Triceps Pushdown - Rope Attachment'),
    rope_overhead_extension: pair('Cable_Rope_Overhead_Triceps_Extension', 'Cable Rope Overhead Triceps Extension'),
    dumbbell_overhead_triceps_extension: pair('Standing_Dumbbell_Triceps_Extension', 'Standing Dumbbell Triceps Extension'),
    close_grip_bench_press: pair('Close-Grip_Barbell_Bench_Press', 'Close-Grip Barbell Bench Press'),
    bench_dip: pair('Bench_Dips', 'Bench Dips'),
    triceps_dip: pair('Dips_-_Triceps_Version', 'Dips - Triceps Version'),

    barbell_row: pair('Bent_Over_Barbell_Row', 'Bent Over Barbell Row'),
    dumbbell_row: pair('Bent_Over_Two-Dumbbell_Row', 'Bent Over Two-Dumbbell Row'),
    one_arm_dumbbell_row: pair('One-Arm_Dumbbell_Row', 'One-Arm Dumbbell Row'),
    conventional_deadlift: pair('Barbell_Deadlift', 'Barbell Deadlift'),
    barbell_romanian_deadlift: pair('Romanian_Deadlift', 'Romanian Deadlift'),
    sumo_deadlift: pair('Sumo_Deadlift', 'Sumo Deadlift'),
    good_morning: pair('Good_Morning', 'Good Morning'),
    barbell_shrug: pair('Barbell_Shrug', 'Barbell Shrug'),
    dumbbell_shrug: pair('Dumbbell_Shrug', 'Dumbbell Shrug'),

    barbell_curl: pair('Barbell_Curl', 'Barbell Curl'),
    ez_bar_curl: pair('EZ-Bar_Curl', 'EZ-Bar Curl'),
    preacher_curl: pair('Preacher_Curl', 'Preacher Curl'),
    machine_preacher_curl: pair('Machine_Preacher_Curls', 'Machine Preacher Curls'),

    back_squat: pair('Barbell_Squat', 'Barbell Squat'),
    front_squat: pair('Front_Barbell_Squat', 'Front Barbell Squat'),
    goblet_squat: pair('Goblet_Squat', 'Goblet Squat'),
    hack_squat: pair('Hack_Squat', 'Hack Squat'),
    bodyweight_squat: pair('Bodyweight_Squat', 'Bodyweight Squat'),
    walking_lunge: pair('Bodyweight_Walking_Lunge', 'Bodyweight Walking Lunge'),

    barbell_hip_thrust: pair('Barbell_Hip_Thrust', 'Barbell Hip Thrust'),
    leg_press_calf_raise: pair('Calf_Press_On_The_Leg_Press_Machine', 'Calf Press On The Leg Press Machine'),
    hanging_leg_raise: pair('Hanging_Leg_Raise', 'Hanging Leg Raise')
  };

  function rawInternalId(ex) {
    return String(ex?.id || window.SN36?.exerciseId?.(ex) || '').trim();
  }

  function canonicalId(ex) {
    const internal = rawInternalId(ex);
    if (internal) return INTERNAL_TO_CANONICAL[internal] || slug(internal);
    const normalizedName = String(ex?.name || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
    return LEGACY_NAME_TO_CANONICAL[normalizedName] || slug(ex?.name || 'exercise');
  }

  function brokenMap() {
    try { return JSON.parse(sessionStorage.getItem(BROKEN_KEY) || '{}') || {}; }
    catch (_) { return {}; }
  }

  function markBroken(exOrCanonical, url, reason = 'Media failed to load') {
    const canonical = typeof exOrCanonical === 'string' ? exOrCanonical : canonicalId(exOrCanonical);
    const broken = brokenMap();
    broken[canonical] = { url: url || null, reason, at: Date.now() };
    try { sessionStorage.setItem(BROKEN_KEY, JSON.stringify(broken)); } catch (_) {}
    console.warn('[Exercise Media]', { canonicalId: canonical, failureReason: reason, url: url || null });
  }

  function clearBroken(exOrCanonical) {
    const canonical = typeof exOrCanonical === 'string' ? exOrCanonical : canonicalId(exOrCanonical);
    const broken = brokenMap();
    delete broken[canonical];
    try { sessionStorage.setItem(BROKEN_KEY, JSON.stringify(broken)); } catch (_) {}
  }

  function resolve(ex, { quiet = false } = {}) {
    const internalId = rawInternalId(ex) || '(legacy/no-id)';
    const canonical = canonicalId(ex);
    const entry = MANIFEST[canonical] || null;
    const broken = brokenMap()[canonical] || null;
    const result = broken
      ? { status: 'broken', internalId, canonicalId: canonical, entry, failureReason: broken.reason, broken }
      : entry
        ? { status: 'ready', internalId, canonicalId: canonical, entry }
        : { status: 'missing', internalId, canonicalId: canonical, entry: null, failureReason: 'No verified media entry for canonical exercise ID' };

    if (!quiet) {
      console.info('[Exercise Media]', {
        exerciseDisplayed: ex?.name || 'Exercise',
        internalId,
        canonicalId: canonical,
        assetFound: result.status === 'ready',
        assetType: entry?.type || null,
        source: entry?.source || null,
        sourceExercise: entry?.sourceExerciseName || null,
        failureReason: result.status === 'ready' ? null : result.failureReason
      });
    }
    return result;
  }

  function audit() {
    const library = Array.isArray(window.exerciseLibrary) ? window.exerciseLibrary : (typeof exerciseLibrary !== 'undefined' && Array.isArray(exerciseLibrary) ? exerciseLibrary : []);
    const broken = brokenMap();
    const rows = library.map(ex => {
      const canonical = canonicalId(ex);
      const entry = MANIFEST[canonical] || null;
      const brokenInfo = broken[canonical] || null;
      return {
        internalId: rawInternalId(ex),
        name: ex.name,
        canonicalId: canonical,
        status: brokenInfo ? 'broken' : entry ? 'verified' : 'missing',
        type: entry?.type || null,
        source: entry?.source || null,
        sourceId: entry?.sourceId || null,
        sourceExerciseName: entry?.sourceExerciseName || null,
        failureReason: brokenInfo?.reason || (!entry ? 'No verified media entry' : null)
      };
    });
    const report = {
      total: rows.length,
      verified: rows.filter(row => row.status === 'verified').length,
      missing: rows.filter(row => row.status === 'missing').length,
      broken: rows.filter(row => row.status === 'broken').length,
      rows,
      missingExercises: rows.filter(row => row.status === 'missing'),
      brokenExercises: rows.filter(row => row.status === 'broken')
    };
    window.START_NOW_EXERCISE_MEDIA_AUDIT = report;
    window.START_NOW_EXERCISES_NEEDING_MEDIA = report.missingExercises;
    window.START_NOW_BROKEN_EXERCISE_MEDIA = report.brokenExercises;
    return report;
  }

  function report() {
    const result = audit();
    console.group('[Exercise Media Audit v42]');
    console.info(`Total exercises: ${result.total}`);
    console.info(`Verified demonstrations: ${result.verified}`);
    console.info(`Missing demonstrations: ${result.missing}`);
    console.info(`Broken demonstrations: ${result.broken}`);
    if (result.missingExercises.length) console.table(result.missingExercises);
    if (result.brokenExercises.length) console.table(result.brokenExercises);
    console.groupEnd();
    return result;
  }

  window.START_NOW_EXERCISE_MEDIA = {
    version: 42,
    provider: SOURCE_NAME,
    manifest: MANIFEST,
    internalToCanonical: INTERNAL_TO_CANONICAL,
    legacyAliases: LEGACY_NAME_TO_CANONICAL,
    canonicalId,
    resolve,
    audit,
    report,
    markBroken,
    clearBroken,
    sourceUrl: sourceId => `${SOURCE_ROOT}${encodeURIComponent(sourceId)}/`
  };

  // Enumerate the entire app library once. This does not load any media files.
  queueMicrotask(() => {
    const result = audit();
    console.info(`[Exercise Media v42] ${result.verified}/${result.total} exercises have deterministic verified media; ${result.missing} use the safe fallback; ${result.broken} known broken this session.`);
  });
})();
