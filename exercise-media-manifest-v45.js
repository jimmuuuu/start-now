/* START/NOW v45 — verified real-person exercise media registry.
 *
 * The original public exercise photos are supplied by Free Exercise DB.
 * This base registry deliberately starts unresolved; complete-exercise-media-v105.js
 * then supplies the exact, reviewed photo pair for every app exercise from that
 * public dataset. Keeping the registry and the source map separate lets the
 * existing resolver audit and broken-asset handling remain intact.
 */
(() => {
  const idOf = ex => String(ex?.id || window.SN36?.exerciseId?.(ex) || '').trim();
  const resolve = ex => ({
    status: 'missing',
    internalId: idOf(ex),
    canonicalId: idOf(ex),
    entry: null,
    failureReason: 'No verified exercise media entry'
  });
  const audit = () => {
    const library = typeof exerciseLibrary !== 'undefined' && Array.isArray(exerciseLibrary) ? exerciseLibrary : [];
    const rows = library.map(ex => ({ id: idOf(ex), internalId: idOf(ex), name: ex.name, status: 'missing' }));
    const report = {
      total: rows.length,
      matched: 0,
      verified: 0,
      missing: rows.length,
      broken: 0,
      coverage: 0,
      rows,
      missingExercises: rows,
      brokenExercises: []
    };
    window.START_NOW_EXERCISE_MEDIA_AUDIT = report;
    return report;
  };
  const broken = new Map();
  window.START_NOW_EXERCISE_MEDIA = {
    version: 'v45',
    provider: 'Free Exercise DB',
    sourceUrl: 'https://github.com/yuhonas/free-exercise-db',
    manifest: Object.create(null),
    canonicalId: idOf,
    resolve,
    audit,
    report: audit,
    markBroken(ex, url, reason = 'Asset failed to load') { broken.set(idOf(typeof ex === 'string' ? { id: ex } : ex), { url, reason }); },
    clearBroken(ex) { broken.delete(idOf(typeof ex === 'string' ? { id: ex } : ex)); }
  };
})();
