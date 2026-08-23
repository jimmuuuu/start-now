// START/NOW v41 — deterministic real exercise media provider.
// Uses pre-made media from the public wger exercise database. No AI generation.
(() => {
  const API = 'https://wger.de/api/v2/exerciseinfo/';
  const CACHE_KEY = 'sn_exercise_media_v41';
  const CACHE_VERSION = 1;
  const UNAVAILABLE_RETRY_MS = 7 * 24 * 60 * 60 * 1000;
  const memory = new Map();

  const normalize = value => String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');

  const slug = value => normalize(value).replace(/\s+/g, '-');
  const exerciseId = ex => ex?.id || window.SN36?.exerciseId?.(ex) || slug(ex?.name || 'exercise');

  // Safe aliases only. We only accept a provider exercise when one of its names/aliases
  // exactly matches one of these normalized names. Fuzzy search is discovery, not approval.
  const ALIASES = {
    'chest-press': ['Chest Press', 'Machine Chest Press', 'Seated Chest Press'],
    'machine-chest-press': ['Machine Chest Press', 'Chest Press', 'Seated Chest Press'],
    'incline-press': ['Incline Press', 'Incline Chest Press', 'Incline Machine Press'],
    'cable-fly': ['Cable Fly', 'Cable Crossover', 'Standing Cable Fly'],
    'shoulder-press': ['Shoulder Press', 'Seated Shoulder Press', 'Machine Shoulder Press'],
    'machine-shoulder-press': ['Machine Shoulder Press', 'Seated Machine Shoulder Press'],
    'lateral-raise': ['Lateral Raise', 'Dumbbell Lateral Raise'],
    'dumbbell-lateral-raise': ['Dumbbell Lateral Raise', 'Lateral Raise'],
    'triceps-pushdown': ['Triceps Pushdown', 'Tricep Pushdown', 'Cable Triceps Pushdown', 'Triceps Pressdown', 'Cable Pushdown'],
    'rope-triceps-pushdown': ['Rope Triceps Pushdown', 'Rope Pushdown', 'Cable Rope Triceps Pushdown'],
    'lat-pulldown': ['Lat Pulldown', 'Wide Grip Lat Pulldown', 'Cable Lat Pulldown'],
    'seated-row': ['Seated Row', 'Seated Cable Row', 'Cable Seated Row'],
    'cable-row': ['Cable Row', 'Seated Cable Row', 'Seated Row'],
    'reverse-fly': ['Reverse Fly', 'Reverse Pec Deck', 'Rear Delt Fly'],
    'biceps-curl': ['Biceps Curl', 'Bicep Curl', 'Dumbbell Biceps Curl'],
    'dumbbell-curl': ['Dumbbell Curl', 'Dumbbell Biceps Curl', 'Biceps Curl'],
    'hammer-curl': ['Hammer Curl', 'Dumbbell Hammer Curl'],
    'barbell-curl': ['Barbell Curl', 'Barbell Biceps Curl'],
    'leg-press': ['Leg Press', '45 Degree Leg Press', 'Machine Leg Press'],
    'leg-extension': ['Leg Extension', 'Machine Leg Extension'],
    'leg-curl': ['Leg Curl', 'Lying Leg Curl', 'Seated Leg Curl', 'Machine Leg Curl'],
    'seated-leg-curl': ['Seated Leg Curl', 'Machine Seated Leg Curl'],
    'lying-leg-curl': ['Lying Leg Curl', 'Prone Leg Curl'],
    'calf-raise': ['Calf Raise', 'Standing Calf Raise'],
    'standing-calf-raise': ['Standing Calf Raise', 'Calf Raise'],
    'seated-calf-raise': ['Seated Calf Raise'],
    'hip-abduction': ['Hip Abduction', 'Machine Hip Abduction', 'Seated Hip Abduction'],
    'plank': ['Plank', 'Front Plank'],
    'cable-crunch': ['Cable Crunch', 'Kneeling Cable Crunch'],
    'romanian-deadlift': ['Romanian Deadlift', 'Barbell Romanian Deadlift', 'RDL'],
    'barbell-romanian-deadlift': ['Barbell Romanian Deadlift', 'Romanian Deadlift', 'RDL'],
    'dumbbell-romanian-deadlift': ['Dumbbell Romanian Deadlift', 'Dumbbell RDL'],
    'barbell-bench-press': ['Barbell Bench Press', 'Bench Press'],
    'dumbbell-bench-press': ['Dumbbell Bench Press'],
    'smith-machine-bench-press': ['Smith Machine Bench Press', 'Smith Bench Press'],
    'push-up': ['Push Up', 'Push-Up', 'Pushup'],
    'pull-up': ['Pull Up', 'Pull-Up', 'Pullup'],
    'chin-up': ['Chin Up', 'Chin-Up'],
    'bodyweight-squat': ['Bodyweight Squat', 'Air Squat'],
    'reverse-lunge': ['Reverse Lunge', 'Backward Lunge'],
    'walking-lunge': ['Walking Lunge'],
    'face-pull': ['Face Pull', 'Cable Face Pull']
  };

  function acceptedNames(ex) {
    const id = exerciseId(ex);
    const values = [ex?.name, ...(ALIASES[id] || [])].filter(Boolean);
    return [...new Set(values.map(normalize).filter(Boolean))];
  }

  function loadCache() {
    try {
      const raw = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (raw?.version === CACHE_VERSION && raw.entries) return raw;
    } catch (_) {}
    return { version: CACHE_VERSION, entries: {} };
  }

  function saveCache(cache) {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch (_) {}
  }

  function providerNames(item) {
    const out = [];
    for (const translation of item?.translations || []) {
      if (translation?.name) out.push(translation.name);
      for (const alias of translation?.aliases || []) {
        if (alias?.alias) out.push(alias.alias);
      }
    }
    return [...new Set(out.map(normalize).filter(Boolean))];
  }

  function exactMatch(item, accepted) {
    const provider = new Set(providerNames(item));
    return accepted.some(name => provider.has(name));
  }

  function sortMainThenId(a, b) {
    return Number(!!b?.is_main) - Number(!!a?.is_main) || Number(a?.id || 0) - Number(b?.id || 0);
  }

  function attribution(media) {
    return {
      license: media?.license_title || null,
      licenseUrl: media?.license_object_url || null,
      author: media?.license_author || null,
      authorUrl: media?.license_author_url || null
    };
  }

  function chooseMedia(item) {
    // Pre-made videos first. Then only images that the provider does not mark as AI-generated.
    const videos = [...(item?.videos || [])]
      .filter(v => typeof v?.video === 'string' && /^https?:\/\//i.test(v.video))
      .sort(sortMainThenId);
    if (videos.length) {
      const v = videos[0];
      return {
        type: 'video', url: v.video, mediaId: v.uuid || v.id,
        width: v.width || null, height: v.height || null, duration: v.duration || null,
        ...attribution(v)
      };
    }

    const images = [...(item?.images || [])]
      .filter(img => img?.is_ai_generated !== true && typeof img?.image === 'string' && /^https?:\/\//i.test(img.image))
      .sort(sortMainThenId);
    if (images.length) {
      const img = images[0];
      const url = img?.thumbnails?.medium || img.image;
      return { type: 'image', url, mediaId: img.uuid || img.id, ...attribution(img) };
    }
    return null;
  }

  function bestCandidate(results, accepted) {
    return (results || []).find(item => exactMatch(item, accepted) && chooseMedia(item)) || null;
  }

  async function fetchSearch(query, signal) {
    const params = new URLSearchParams({
      name__search: query,
      language__code: 'en',
      limit: '12'
    });
    const response = await fetch(`${API}?${params}`, {
      method: 'GET', mode: 'cors', credentials: 'omit', signal,
      headers: { Accept: 'application/json' }
    });
    if (!response.ok) throw new Error(`wger returned ${response.status}`);
    const json = await response.json();
    return Array.isArray(json) ? json : (json?.results || []);
  }

  async function resolveFresh(ex, signal) {
    const accepted = acceptedNames(ex);
    const queries = [...new Set([ex?.name, ...(ALIASES[exerciseId(ex)] || [])].filter(Boolean))];
    for (const query of queries.slice(0, 4)) {
      const results = await fetchSearch(query, signal);
      const match = bestCandidate(results, accepted);
      if (!match) continue;
      const media = chooseMedia(match);
      if (!media) continue;
      const providerName = (match.translations || []).find(t => accepted.includes(normalize(t?.name)))?.name
        || (match.translations || [])[0]?.name || ex?.name || 'Exercise';
      return {
        status: 'ready', provider: 'wger', providerExerciseId: match.uuid || match.id,
        providerName, resolvedAt: Date.now(), media
      };
    }
    return { status: 'unavailable', provider: 'wger', checkedAt: Date.now() };
  }

  async function get(ex, options = {}) {
    const id = exerciseId(ex);
    if (memory.has(id) && !options.force) return memory.get(id);
    const cache = loadCache();
    const cached = cache.entries[id];
    if (!options.force && cached?.status === 'ready') {
      memory.set(id, cached);
      return cached;
    }
    if (!options.force && cached?.status === 'unavailable' && Date.now() - Number(cached.checkedAt || 0) < UNAVAILABLE_RETRY_MS) {
      memory.set(id, cached);
      return cached;
    }

    const promise = resolveFresh(ex, options.signal)
      .then(result => {
        const next = loadCache();
        next.entries[id] = result;
        saveCache(next);
        memory.set(id, result);
        return result;
      })
      .catch(error => {
        if (error?.name === 'AbortError') throw error;
        console.warn('[START/NOW v41] Exercise media lookup failed', id, error);
        return { status: 'error', provider: 'wger', message: 'Exercise demonstration unavailable' };
      });
    memory.set(id, promise);
    const result = await promise;
    memory.set(id, result);
    return result;
  }

  function peek(ex) {
    const id = typeof ex === 'string' ? ex : exerciseId(ex);
    const value = memory.get(id);
    if (value && typeof value.then !== 'function') return value;
    return loadCache().entries[id] || null;
  }

  function invalidate(ex) {
    const id = typeof ex === 'string' ? ex : exerciseId(ex);
    memory.delete(id);
    const cache = loadCache();
    delete cache.entries[id];
    saveCache(cache);
  }

  window.START_NOW_EXERCISE_MEDIA = {
    provider: 'wger', get, peek, invalidate, exerciseId, aliases: ALIASES,
    clearCache() { localStorage.removeItem(CACHE_KEY); memory.clear(); }
  };
})();
