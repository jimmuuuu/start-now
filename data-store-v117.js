// START/NOW v117 — canonical workout/session models, migration, and shared selectors.
(() => {
  const SN = window.SN36;
  if (!SN) return;

  const SCHEMA_VERSION = 2;
  const WORKOUTS_KEY = "sn_custom_workouts";
  const DELETED_WORKOUTS_KEY = "sn_deleted_workout_ids";
  const DELETED_SESSIONS_KEY = "sn_deleted_session_ids";
  const clone = value => JSON.parse(JSON.stringify(value));
  const text = value => String(value ?? "").trim();
  const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const unique = values => [...new Set((values || []).map(text).filter(Boolean))];
  const library = () => typeof exerciseLibrary !== "undefined" && Array.isArray(exerciseLibrary) ? exerciseLibrary : [];

  function libraryExercise(value) {
    const suppliedId = text(value?.exerciseId || value?.id);
    if (suppliedId) {
      const byId = library().find(item => text(item.id) === suppliedId);
      if (byId) return byId;
    }
    const suppliedName = text(value?.name).toLowerCase();
    return suppliedName ? library().find(item => text(item.name).toLowerCase() === suppliedName) || null : null;
  }

  function stableExerciseId(value) {
    const match = libraryExercise(value);
    return text(value?.exerciseId || value?.id || match?.id) || `exercise-${SN.slug(value?.name || "unknown")}`;
  }

  function specificPrimaryMuscle(value, fallback) {
    const primary = text(fallback) || "Other";
    if (primary !== "Legs") return primary;
    const name = text(value?.name).toLowerCase();
    if (/leg curl|romanian deadlift|stiff[- ]leg|good morning|nordic/.test(name)) return "Hamstrings";
    if (/calf|tibialis/.test(name)) return "Calves";
    if (/hip thrust|glute bridge|glute drive|kickback|hip abduction/.test(name)) return "Glutes";
    if (/leg press|hack squat|pendulum squat|front squat|goblet squat|split squat|bulgarian|step[- ]?up|step[- ]?down|lunge|squat|leg extension/.test(name)) return "Quads";
    return primary;
  }

  function muscleGroups(value) {
    const match = libraryExercise(value);
    const groups = value?.muscleGroups && typeof value.muscleGroups === "object" ? value.muscleGroups : {};
    const primary = specificPrimaryMuscle(value, groups.primary || value?.primaryMuscle || match?.muscle || value?.muscle);
    const secondary = unique(groups.secondary || value?.secondaryMuscles || SN.secondary(primary));
    return { primary, secondary: secondary.filter(muscle => muscle !== primary) };
  }

  function normalizeExercise(value = {}, context = {}) {
    const match = libraryExercise(value);
    const source = { ...(match || {}), ...(value || {}) };
    const id = stableExerciseId(source);
    const groups = muscleGroups(source);
    const occurrence = Math.max(1, number(context.occurrence, 1));
    const workoutExerciseId = text(source.workoutExerciseId) ||
      (context.workoutId ? `${context.workoutId}:${id}:${occurrence}` : `${id}:${occurrence}`);
    const range = SN.repRange(source);
    return {
      ...source,
      id,
      exerciseId: id,
      workoutExerciseId,
      name: text(source.name || match?.name) || "Exercise",
      muscle: groups.primary,
      primaryMuscle: groups.primary,
      secondaryMuscles: [...groups.secondary],
      muscleGroups: groups,
      sets: Math.max(1, number(source.sets, 3)),
      reps: Math.max(1, number(source.reps ?? source.repMax, range.max)),
      repMin: range.min,
      repMax: range.max
    };
  }

  function normalizeWorkout(value = {}, index = 0) {
    const name = text(value.name) || "Workout";
    const id = text(value.id) || `legacy-${SN.slug(name)}-${number(value.createdAt, index + 1)}`;
    const occurrences = new Map();
    const exercises = (Array.isArray(value.exercises) ? value.exercises : []).map(exercise => {
      const exerciseId = stableExerciseId(exercise);
      const occurrence = (occurrences.get(exerciseId) || 0) + 1;
      occurrences.set(exerciseId, occurrence);
      return normalizeExercise(exercise, { workoutId: id, occurrence });
    });
    return {
      ...value,
      schemaVersion: SCHEMA_VERSION,
      id,
      name,
      days: unique(value.days).filter(day => SN.days.includes(day)),
      exercises,
      updatedAt: number(value.updatedAt || value.createdAt, Date.now())
    };
  }

  function normalizeSet(value = {}) {
    return {
      ...value,
      weight: Math.max(0, number(value.weight)),
      reps: Math.max(0, number(value.reps)),
      done: Boolean(value.done)
    };
  }

  function normalizeResult(value = {}, context = {}) {
    const exercise = normalizeExercise(value, context);
    const sets = (Array.isArray(value.sets) ? value.sets : []).map(normalizeSet);
    const completed = sets.filter(set => set.done);
    const completedSets = sets.length ? completed.length : Math.max(0, number(value.completedSets));
    const volume = sets.length ? completed.reduce((total, set) => total + set.weight * set.reps, 0) : Math.max(0, number(value.volume));
    return {
      ...exercise,
      sets,
      completedSets,
      plannedSets: Math.max(1, number(value.plannedSets || value.originalPlannedSets || sets.length, exercise.sets)),
      bestWeight: sets.length ? Math.max(0, ...completed.map(set => set.weight)) : Math.max(0, number(value.bestWeight)),
      volume: Math.round(volume),
      note: SN.normalizeExerciseNote(value.note).trim()
    };
  }

  function normalizeSession(value = {}, index = 0) {
    const timestamp = number(value.timestamp || value.completedAt);
    if (timestamp <= 0) return null;
    const workoutId = text(value.workoutId || value.planId) || `legacy-${SN.slug(value.workoutName || value.planName || "workout")}`;
    const occurrences = new Map();
    const exercises = (Array.isArray(value.exercises) ? value.exercises : []).map(exercise => {
      const exerciseId = stableExerciseId(exercise);
      const occurrence = (occurrences.get(exerciseId) || 0) + 1;
      occurrences.set(exerciseId, occurrence);
      return normalizeResult(exercise, { workoutId, occurrence });
    });
    const completedSets = exercises.length ? exercises.reduce((sum, exercise) => sum + exercise.completedSets, 0) : Math.max(0, number(value.completedSets));
    const plannedSets = exercises.length ? exercises.reduce((sum, exercise) => sum + exercise.plannedSets, 0) : Math.max(completedSets, number(value.plannedSets));
    const volume = exercises.length ? exercises.reduce((sum, exercise) => sum + exercise.volume, 0) : Math.max(0, number(value.volume));
    return {
      ...value,
      schemaVersion: SCHEMA_VERSION,
      id: text(value.id) || `session-${timestamp}-${workoutId}-${index + 1}`,
      timestamp,
      startedAt: number(value.startedAt, timestamp),
      workoutId,
      workoutName: text(value.workoutName || value.planName) || "Workout",
      status: value.status === "incomplete" || completedSets === 0 ? "incomplete" : "completed",
      exercises,
      completedSets,
      plannedSets,
      completion: plannedSets ? Math.round(completedSets / plannedSets * 100) : 0,
      volume: Math.round(volume),
      updatedAt: number(value.updatedAt, timestamp)
    };
  }

  function readArray(key) {
    const value = SN.read(key, []);
    return Array.isArray(value) ? value : [];
  }

  function mergeByStableId(remote, local, normalizer) {
    const merged = new Map();
    [...(remote || []), ...(local || [])].forEach((item, index) => {
      const normalized = normalizer(item, index);
      if (!normalized?.id) return;
      const existing = merged.get(normalized.id);
      if (!existing || number(normalized.updatedAt || normalized.timestamp) >= number(existing.updatedAt || existing.timestamp)) {
        merged.set(normalized.id, normalized);
      }
    });
    return [...merged.values()];
  }

  function workouts() {
    const deleted = new Set(readArray(DELETED_WORKOUTS_KEY).map(String));
    return readArray(WORKOUTS_KEY).map(normalizeWorkout).filter(workout => !deleted.has(workout.id));
  }

  function allSessions() {
    const deleted = new Set(readArray(DELETED_SESSIONS_KEY).map(String));
    return readArray(SN.keys.sessions).map(normalizeSession).filter(session => session && !deleted.has(session.id)).sort((a, b) => a.timestamp - b.timestamp);
  }

  function completedSessions() {
    return allSessions().filter(session => session.status === "completed");
  }

  function announce(type, detail = {}) {
    window.dispatchEvent(new CustomEvent("startnow:datachange", { detail: { type, ...detail } }));
  }

  function saveWorkouts(values, options = {}) {
    const normalized = (values || []).map(normalizeWorkout);
    const saved = SN.write(WORKOUTS_KEY, normalized);
    if (saved && typeof state !== "undefined") state.customWorkouts = clone(normalized);
    if (saved && !options.silent) SN.syncStats?.();
    if (saved && !options.silent) announce("workouts", { ids: normalized.map(workout => workout.id) });
    return saved;
  }

  function saveSessions(values, options = {}) {
    const normalized = (values || []).map(normalizeSession).filter(Boolean).slice(-365);
    const saved = SN.write(SN.keys.sessions, normalized);
    if (saved && !options.silent) SN.syncStats?.();
    if (saved && !options.silent) announce("sessions", { ids: normalized.map(session => session.id) });
    return saved;
  }

  function scheduleMap(values = workouts()) {
    const result = new Map();
    values.forEach(workout => workout.days.forEach(day => {
      if (!result.has(day)) result.set(day, workout);
    }));
    return result;
  }

  function scheduledWorkout(day = SN.todayName()) {
    return scheduleMap().get(day) || null;
  }

  function dayKey(value) {
    const date = new Date(value);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function streaks(rows = completedSessions(), plans = workouts()) {
    const completed = new Set(rows.map(session => dayKey(session.timestamp)));
    const schedule = scheduleMap(plans);
    if (!completed.size) return { current: 0, longest: 0 };
    const scheduledDays = new Set(schedule.keys());
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const earliest = new Date(Math.min(...rows.map(session => session.timestamp)));
    earliest.setHours(0, 0, 0, 0);
    let longest = 0;
    let run = 0;
    for (let date = new Date(earliest); date <= today; date.setDate(date.getDate() + 1)) {
      const isTrainingDay = !scheduledDays.size || scheduledDays.has(SN.days[date.getDay()]);
      if (!isTrainingDay) continue;
      if (completed.has(dayKey(date))) run += 1;
      else if (date < today) run = 0;
      longest = Math.max(longest, run);
    }
    let current = 0;
    for (let date = new Date(today), scanned = 0; scanned < 366; date.setDate(date.getDate() - 1), scanned += 1) {
      const isTrainingDay = !scheduledDays.size || scheduledDays.has(SN.days[date.getDay()]);
      if (!isTrainingDay) continue;
      const done = completed.has(dayKey(date));
      if (date.getTime() === today.getTime() && !done) continue;
      if (!done) break;
      current += 1;
    }
    return { current, longest };
  }

  function muscleActivity(rows = completedSessions()) {
    const totals = new Map();
    rows.forEach(session => session.exercises.forEach(exercise => {
      if (!exercise.completedSets) return;
      const groups = muscleGroups(exercise);
      const primary = totals.get(groups.primary) || { muscle: groups.primary, primarySets: 0, secondarySets: 0, activity: 0 };
      primary.primarySets += exercise.completedSets;
      primary.activity += exercise.completedSets;
      totals.set(groups.primary, primary);
      groups.secondary.forEach(muscle => {
        const secondary = totals.get(muscle) || { muscle, primarySets: 0, secondarySets: 0, activity: 0 };
        secondary.secondarySets += exercise.completedSets;
        secondary.activity += exercise.completedSets * 0.5;
        totals.set(muscle, secondary);
      });
    }));
    return [...totals.values()].sort((a, b) => b.activity - a.activity || a.muscle.localeCompare(b.muscle));
  }

  function summary(rows = completedSessions()) {
    const completedSets = rows.reduce((sum, session) => sum + session.completedSets, 0);
    return {
      workouts: rows.length,
      completedSets,
      volume: rows.reduce((sum, session) => sum + session.volume, 0),
      durationMinutes: rows.reduce((sum, session) => sum + number(session.durationMinutes), 0),
      streaks: streaks(rows),
      muscles: muscleActivity(rows)
    };
  }

  SN.keys.workouts = WORKOUTS_KEY;
  SN.normalizeExercise = normalizeExercise;
  SN.normalizeWorkout = normalizeWorkout;
  SN.normalizeSession = normalizeSession;
  SN.exerciseId = stableExerciseId;
  SN.exerciseMatches = (a, b) => Boolean(a && b && stableExerciseId(a) === stableExerciseId(b));
  SN.workouts = workouts;
  SN.saveWorkouts = saveWorkouts;
  SN.allSessions = allSessions;
  SN.sessions = completedSessions;
  SN.saveSessions = saveSessions;
  SN.addSession = session => {
    const normalized = normalizeSession(session, allSessions().length);
    if (!normalized) return false;
    const deleted = new Set(readArray(DELETED_SESSIONS_KEY).map(String));
    if (deleted.delete(normalized.id)) SN.write(DELETED_SESSIONS_KEY, [...deleted]);
    return saveSessions([...allSessions().filter(item => item.id !== normalized.id), normalized]);
  };
  SN.updateSession = (id, changes) => {
    const rows = allSessions();
    const index = rows.findIndex(session => session.id === id);
    if (index < 0) return false;
    rows[index] = normalizeSession({ ...rows[index], ...(changes || {}), id, updatedAt: Date.now() }, index);
    return saveSessions(rows);
  };
  SN.deleteSession = id => {
    const deleted = new Set(readArray(DELETED_SESSIONS_KEY).map(String));
    deleted.add(String(id));
    SN.write(DELETED_SESSIONS_KEY, [...deleted].slice(-500));
    return saveSessions(allSessions().filter(session => session.id !== id));
  };
  SN.upsertWorkout = workout => {
    const rows = workouts();
    const index = rows.findIndex(item => item.id === workout?.id);
    const next = normalizeWorkout({ ...(index >= 0 ? rows[index] : {}), ...workout, updatedAt: Date.now() }, index >= 0 ? index : rows.length);
    const deleted = new Set(readArray(DELETED_WORKOUTS_KEY).map(String));
    if (deleted.delete(next.id)) SN.write(DELETED_WORKOUTS_KEY, [...deleted]);
    if (index >= 0) rows[index] = next; else rows.push(next);
    return saveWorkouts(rows);
  };
  SN.deleteWorkout = id => {
    const deleted = new Set(readArray(DELETED_WORKOUTS_KEY).map(String));
    deleted.add(String(id));
    SN.write(DELETED_WORKOUTS_KEY, [...deleted].slice(-200));
    return saveWorkouts(workouts().filter(workout => workout.id !== id));
  };
  SN.scheduleMap = scheduleMap;
  SN.scheduledWorkout = scheduledWorkout;
  SN.streaks = streaks;
  SN.streak = rows => streaks(rows || completedSessions()).current;
  SN.muscleActivity = muscleActivity;
  SN.summary = summary;
  SN.mergeWorkouts = (remote, local) => mergeByStableId(remote, local, normalizeWorkout);
  SN.mergeSessions = (remote, local) => mergeByStableId(remote, local, normalizeSession).sort((a, b) => a.timestamp - b.timestamp).slice(-365);
  SN.previousWorkout = workout => completedSessions().filter(session => session.workoutId === workout?.id).sort((a, b) => b.timestamp - a.timestamp)[0] || null;
  SN.syncStats = () => {
    const rows = completedSessions();
    const streak = streaks(rows).current;
    const best = Math.max(number(localStorage.getItem(SN.keys.bestStreak)), streak);
    localStorage.setItem("sn_streak", String(streak));
    localStorage.setItem("sn_completed", String(rows.length));
    localStorage.setItem(SN.keys.bestStreak, String(best));
    if (typeof state !== "undefined") {
      state.streak = streak;
      state.completedWorkouts = rows.length;
    }
    return { sessions: rows, streak, best };
  };

  const originalSaveCustomWorkouts = window.saveCustomWorkouts;
  if (typeof originalSaveCustomWorkouts === "function") {
    window.saveCustomWorkouts = function() {
      if (typeof state !== "undefined") {
        const savedById = new Map(workouts().map(workout => [workout.id, workout]));
        state.customWorkouts = state.customWorkouts.map((workout, index) => {
          const normalized = normalizeWorkout(workout, index);
          const saved = savedById.get(normalized.id);
          const comparable = value => JSON.stringify({ ...value, schemaVersion: undefined, updatedAt: undefined });
          normalized.updatedAt = saved && comparable(saved) === comparable(normalized) ? saved.updatedAt : Date.now();
          return normalized;
        });
      }
      const result = originalSaveCustomWorkouts.apply(this, arguments);
      announce("workouts", { ids: state.customWorkouts.map(workout => workout.id) });
      return result;
    };
  }

  const migratedWorkouts = workouts();
  const migratedSessions = allSessions();
  saveWorkouts(migratedWorkouts, { silent: true });
  saveSessions(migratedSessions, { silent: true });
  if (typeof state !== "undefined") state.customWorkouts = clone(migratedWorkouts);
  SN.syncStats();

  window.addEventListener("storage", event => {
    if (![WORKOUTS_KEY, SN.keys.sessions].includes(event.key)) return;
    if (event.key === WORKOUTS_KEY && typeof state !== "undefined") state.customWorkouts = workouts();
    SN.syncStats();
    announce(event.key === WORKOUTS_KEY ? "workouts" : "sessions", { external: true });
  });

  window.START_NOW_DATA = {
    version: "v118",
    schemaVersion: SCHEMA_VERSION,
    deletedSessionsKey: DELETED_SESSIONS_KEY,
    normalizeExercise,
    normalizeWorkout,
    normalizeSession,
    workouts,
    sessions: completedSessions,
    allSessions,
    saveWorkouts,
    saveSessions,
    scheduleMap,
    scheduledWorkout,
    streaks,
    muscleActivity,
    summary,
    mergeWorkouts: SN.mergeWorkouts,
    mergeSessions: SN.mergeSessions
  };
})();
