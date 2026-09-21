const realFetch = globalThis.fetch;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
let lastApiCall = 0;

globalThis.fetch = async (input, init = {}) => {
  const url = String(input instanceof URL ? input.href : input);
  if (!url.startsWith('https://oss.exercisedb.dev/api/v1/exercises')) {
    return realFetch(input, init);
  }

  // The public ExerciseDB endpoint throttles rapid cursor pagination.
  // Space requests out and honor 429 Retry-After instead of silently producing a partial map.
  const minGapMs = 250;
  const gap = Date.now() - lastApiCall;
  if (gap < minGapMs) await sleep(minGapMs - gap);

  for (let attempt = 0; attempt < 7; attempt++) {
    const response = await realFetch(input, init);
    lastApiCall = Date.now();
    if (response.status !== 429) return response;

    const retryAfter = Number(response.headers.get('retry-after') || 0);
    const waitMs = retryAfter > 0 ? retryAfter * 1000 : Math.min(15000, 1000 * (attempt + 1));
    console.warn(`[media] ExerciseDB rate limited; retrying in ${waitMs}ms (attempt ${attempt + 1}/7)`);
    await response.body?.cancel?.();
    await sleep(waitMs);
  }

  throw new Error('ExerciseDB remained rate limited after 7 retries');
};

await import('./build-exercise-media-map-v44.mjs');
