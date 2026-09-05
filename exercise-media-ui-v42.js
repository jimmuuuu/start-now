// START/NOW v42 — deterministic real exercise media UI.
// Shows only curated media from exercise-media-manifest-v42.js. Never generates exercise art.
(() => {
  const SN = window.SN36;
  const MEDIA = window.START_NOW_EXERCISE_MEDIA;
  if (!MEDIA) return;
  let patching = false;

  const esc = value => typeof escapeHtml === 'function' ? escapeHtml(String(value ?? '')) : String(value ?? '');
  const currentExercise = () => SN?.active?.exercises?.[Number(SN.active.index || 0)] || state?.activeWorkout?.exercises?.[Number(state?.workoutIndex || 0)] || null;
  const currentIndex = () => SN?.active?.exercises?.length ? Number(SN.active.index || 0) : Number(state?.workoutIndex || 0);

  function meta(ex) {
    try { return SN?.meta?.(ex) || {}; } catch (_) { return {}; }
  }

  function primaryLabel(ex) {
    const m = meta(ex);
    const values = [m.primary || ex?.primaryMuscle || ex?.muscle, ...(m.secondary || []).slice(0, 2)].filter(Boolean);
    return [...new Set(values)].join(', ') || 'Exercise';
  }

  function workoutSummary(ex) {
    const range = SN?.repRange?.(ex) || { min: ex?.reps || 10, max: ex?.reps || 10 };
    const sets = ex?.originalPlannedSets || ex?.sets?.length || ex?.sets || 3;
    const reps = range.min === range.max ? `${range.max} reps` : `${range.min}-${range.max} reps`;
    const rest = SN?.active?.rest?.durationSeconds || SN?.restPrefs?.()?.seconds || 90;
    return `${sets} sets • ${reps} • Rest ${Math.round(rest)} sec`;
  }

  function unavailableMarkup(ex, reason = 'Exercise demonstration unavailable') {
    return `<div class="sn-v42-unavailable">
      <div class="sn-v42-no-media" aria-hidden="true"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="11" y="14" width="42" height="34" rx="6"/><path d="M22 27h20M24 38l8-8 8 8"/></svg></div>
      <strong>${esc(reason)}</strong>
      <span>${esc(ex?.name || 'Exercise')}</span>
      <small>No substitute is shown unless Level Up Fitness has a verified match for this exact movement.</small>
    </div>`;
  }

  function imagePairMarkup(ex, result) {
    const [start, finish] = result.entry.media || [];
    if (!start || !finish) return unavailableMarkup(ex);
    return `<div class="sn-v42-demo-pair" data-v42-pair>
      <div class="sn-v42-frame-stack" aria-label="${esc(ex?.name || 'Exercise')} start and finish demonstration">
        <img class="sn-v42-frame sn-v42-frame-start" src="${esc(start)}" alt="${esc(ex?.name || 'Exercise')} starting position" decoding="async" loading="eager" data-v42-media>
        <img class="sn-v42-frame sn-v42-frame-finish" src="${esc(finish)}" alt="${esc(ex?.name || 'Exercise')} finishing position" decoding="async" loading="eager" data-v42-media>
        <div class="sn-v42-loading" data-v42-loading><i></i><i></i><span>Loading demonstration…</span></div>
        <div class="sn-v42-phase"><span>START</span><b>↔</b><span>FINISH</span></div>
      </div>
      <small class="sn-v42-source">Verified media • ${esc(result.entry.sourceExerciseName || result.entry.source || '')}</small>
    </div>`;
  }

  function videoMarkup(ex, result) {
    const url = result.entry.media?.[0] || result.entry.src;
    return `<div class="sn-v42-video-wrap"><video class="sn-v42-video" src="${esc(url)}" autoplay muted loop playsinline preload="metadata" aria-label="${esc(ex?.name || 'Exercise')} demonstration" data-v42-media></video><div class="sn-v42-loading" data-v42-loading><i></i><i></i><span>Loading demonstration…</span></div></div>`;
  }

  function singleImageMarkup(ex, result) {
    const url = result.entry.media?.[0] || result.entry.src;
    return `<div class="sn-v42-image-wrap"><img class="sn-v42-image" src="${esc(url)}" alt="${esc(ex?.name || 'Exercise')} demonstration" loading="eager" decoding="async" data-v42-media><div class="sn-v42-loading" data-v42-loading><i></i><i></i><span>Loading demonstration…</span></div></div>`;
  }

  function mediaMarkup(ex, result) {
    if (result.status !== 'ready' || !result.entry) return unavailableMarkup(ex);
    if (result.entry.type === 'video' || result.entry.type === 'gif') return videoMarkup(ex, result);
    if (result.entry.type === 'image') return singleImageMarkup(ex, result);
    if (result.entry.type === 'image-pair') return imagePairMarkup(ex, result);
    return unavailableMarkup(ex);
  }

  function card(ex, compact = false) {
    const result = MEDIA.resolve(ex);
    return `<section class="sn-v42-card ${compact ? 'compact' : ''}" data-v42-exercise="${esc(MEDIA.canonicalId(ex))}">
      <div class="sn-v42-head"><div><span>EXERCISE GUIDE</span><strong>${esc(ex?.name || 'Exercise')}</strong></div></div>
      <div class="sn-v42-media">${mediaMarkup(ex, result)}</div>
      <div class="sn-v42-primary"><span>PRIMARY</span><strong>${esc(primaryLabel(ex))}</strong></div>
      ${compact ? '' : `<div class="sn-v42-workout-meta"><strong>${esc(ex?.name || 'Exercise')}</strong><span>${esc(workoutSummary(ex))}</span></div>`}
    </section>`;
  }

  function bindMedia(card, ex) {
    if (!card) return;
    const result = MEDIA.resolve(ex, { quiet: true });
    const nodes = [...card.querySelectorAll('[data-v42-media]')];
    if (!nodes.length || result.status !== 'ready') return;
    const loader = card.querySelector('[data-v42-loading]');
    let loaded = 0;
    let failed = false;
    const ready = () => {
      loaded += 1;
      if (!failed && loaded >= nodes.length) {
        loader?.classList.add('done');
        card.querySelector('[data-v42-pair]')?.classList.add('ready');
      }
    };
    const fail = event => {
      if (failed) return;
      failed = true;
      const url = event.currentTarget?.currentSrc || event.currentTarget?.src || null;
      MEDIA.markBroken(result.canonicalId, url, 'Asset failed to load');
      MEDIA.audit();
      const holder = card.querySelector('.sn-v42-media');
      if (holder) holder.innerHTML = unavailableMarkup(ex, 'Exercise demonstration unavailable');
      console.warn('[Exercise Media] Asset URL failed', { exercise: ex?.name, canonicalId: result.canonicalId, url });
    };
    nodes.forEach(node => {
      if (node.tagName === 'VIDEO') {
        node.addEventListener('loadeddata', ready, { once: true });
        node.addEventListener('error', fail, { once: true });
        node.play?.().catch(() => {});
      } else {
        if (node.complete && node.naturalWidth > 0) ready();
        else {
          node.addEventListener('load', ready, { once: true });
          node.addEventListener('error', fail, { once: true });
        }
      }
    });
  }

  function previousExercise() {
    const index = currentIndex();
    if (index <= 0) return;
    if (SN?.active?.exercises?.length) {
      SN.active.index = index - 1;
      SN.write?.(SN.keys.active, SN.active);
    } else state.workoutIndex = index - 1;
    render();
  }

  function detailTips(ex) {
    try {
      const tips = SN?.mistakes?.(ex) || [];
      if (tips.length) return tips.slice(0, 3);
    } catch (_) {}
    return [ex?.cue || 'Use a controlled range of motion and keep your setup stable.'];
  }

  function detailSteps(ex) {
    const m = meta(ex);
    const text = String(m.instructions || ex?.cue || '').trim();
    if (!text) return ['Set up in a stable position.', 'Use a controlled range of motion.', 'Stop the set if your form starts to break down.'];
    const sentences = text.split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(Boolean);
    return sentences.length > 1 ? sentences.slice(0, 4) : [text];
  }

  function installStyles() {
    if (document.getElementById('sn-v42-styles')) return;
    const style = document.createElement('style');
    style.id = 'sn-v42-styles';
    style.textContent = `
      .workout-screen>.exercise-visual,.sn-exercise-focus-panel,.sn-v38-exercise-visual,.sn-v39-exercise-visual,.sn-v40-card,.sn-v41-card{display:none!important}
      .sn-workout-screen>.sn-coach-tip{display:none!important}
      .sn-v42-card{margin:14px 0 18px;border:1px solid var(--line);border-radius:24px;background:var(--surface);overflow:hidden;box-shadow:0 12px 30px rgba(17,24,39,.055)}
      .sn-v42-head{display:flex;align-items:end;justify-content:space-between;gap:12px;padding:15px 17px 10px}.sn-v42-head>div{display:grid;gap:3px}.sn-v42-head span{font-size:9px;font-weight:900;letter-spacing:.11em;color:var(--blue)}.sn-v42-head strong{font-size:17px;color:var(--text)}.sn-v42-head small{font-size:8px;font-weight:900;letter-spacing:.08em;color:var(--muted)}
      .sn-v42-media{aspect-ratio:16/9;min-height:190px;background:#f8fafc;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}
      .sn-v42-demo-pair,.sn-v42-video-wrap,.sn-v42-image-wrap{width:100%;height:100%;min-height:190px;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative}
      .sn-v42-frame-stack{position:relative;width:100%;height:100%;min-height:190px;overflow:hidden;background:#f8fafc}.sn-v42-frame{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;opacity:0}.sn-v42-frame-start{opacity:1}.sn-v42-demo-pair.ready .sn-v42-frame-start{animation:snV42Start 3.2s ease-in-out infinite}.sn-v42-demo-pair.ready .sn-v42-frame-finish{animation:snV42Finish 3.2s ease-in-out infinite}@keyframes snV42Start{0%,42%{opacity:1}52%,90%{opacity:0}100%{opacity:1}}@keyframes snV42Finish{0%,42%{opacity:0}52%,90%{opacity:1}100%{opacity:0}}
      .sn-v42-phase{position:absolute;right:10px;bottom:10px;display:flex;align-items:center;gap:5px;padding:5px 8px;border-radius:999px;background:rgba(17,24,39,.76);color:#fff;font-size:7px;font-weight:900;letter-spacing:.07em}.sn-v42-phase b{font-size:11px;color:#93c5fd}.sn-v42-source{position:absolute;left:10px;bottom:10px;max-width:65%;padding:5px 7px;border-radius:8px;background:rgba(17,24,39,.72);color:#fff;font-size:7px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;z-index:4}
      .sn-v42-video,.sn-v42-image{display:block;width:100%;height:100%;max-height:330px;object-fit:contain;background:#f8fafc}
      .sn-v42-loading{position:absolute;inset:0;z-index:5;display:grid;place-items:center;align-content:center;gap:8px;padding:24px;background:#f8fafc;transition:opacity .18s ease}.sn-v42-loading.done{opacity:0;pointer-events:none}.sn-v42-loading i{display:block;height:12px;border-radius:999px;background:linear-gradient(90deg,#eef2f7,#dfe6ee,#eef2f7);background-size:200% 100%;animation:snV42Pulse 1.1s linear infinite}.sn-v42-loading i:nth-child(1){width:54%}.sn-v42-loading i:nth-child(2){width:38%}.sn-v42-loading span{font-size:10px;color:#94a3b8;font-weight:750}@keyframes snV42Pulse{to{background-position:-200% 0}}
      .sn-v42-primary{display:flex;gap:8px;align-items:baseline;padding:12px 16px 10px}.sn-v42-primary span{font-size:9px;font-weight:900;letter-spacing:.09em;color:var(--muted)}.sn-v42-primary strong{font-size:12px;color:var(--text)}
      .sn-v42-workout-meta{display:grid;gap:3px;padding:0 16px 10px}.sn-v42-workout-meta strong{font-size:14px;color:var(--text)}.sn-v42-workout-meta span{font-size:11px;color:var(--muted)}
      .sn-v42-unavailable{width:100%;min-height:190px;display:grid;place-items:center;align-content:center;text-align:center;gap:5px;padding:24px;color:var(--text)}.sn-v42-no-media{width:58px;height:58px;border-radius:18px;background:rgba(59,130,246,.08);color:var(--blue);display:grid;place-items:center;margin-bottom:4px}.sn-v42-no-media svg{width:32px;height:32px}.sn-v42-unavailable strong{font-size:14px}.sn-v42-unavailable span{font-size:12px;color:var(--muted)}.sn-v42-unavailable small{max-width:330px;font-size:10px;line-height:1.45;color:var(--muted)}
      .sn-v42-prev-row{display:grid;margin:10px 0}.sn-v42-prev{min-height:46px!important;font-weight:850!important}.sn-v42-prev:disabled{opacity:.38}
      .sn-v42-card.compact{margin:10px 0 16px;box-shadow:none}.sn-v42-card.compact .sn-v42-head{padding:12px 14px 9px}.sn-v42-card.compact .sn-v42-workout-meta{display:none}.sn-v42-card.compact .sn-v42-media,.sn-v42-card.compact .sn-v42-demo-pair,.sn-v42-card.compact .sn-v42-frame-stack,.sn-v42-card.compact .sn-v42-unavailable{min-height:165px}
      .sn-v42-detail-stack{display:grid;gap:10px;margin:0 0 14px}.sn-v42-detail{padding:15px 16px;border:1px solid var(--line);border-radius:18px;background:var(--surface)}.sn-v42-detail h3{margin:0 0 8px;font-size:13px}.sn-v42-detail p{margin:0;color:var(--muted);font-size:12px;line-height:1.55}.sn-v42-detail ol,.sn-v42-detail ul{margin:0;padding-left:18px;color:var(--muted);font-size:12px;line-height:1.55}.sn-v42-detail li+li{margin-top:5px}.sn-v42-muscle-tags{display:flex;gap:6px;flex-wrap:wrap}.sn-v42-muscle-tags span{padding:6px 9px;border-radius:999px;background:rgba(59,130,246,.09);color:var(--text);font-size:11px;font-weight:750}
      @media(max-width:560px){.sn-v42-media,.sn-v42-demo-pair,.sn-v42-frame-stack,.sn-v42-unavailable{min-height:165px}.sn-v42-head strong{font-size:15px}.sn-v42-card{border-radius:20px}.sn-v42-source{max-width:58%}}
      .dark .sn-v42-card{box-shadow:0 12px 30px rgba(0,0,0,.2)}.dark .sn-v42-media,.dark .sn-v42-frame-stack,.dark .sn-v42-video,.dark .sn-v42-image,.dark .sn-v42-loading{background:#111827}
      @media (prefers-reduced-motion:reduce){.sn-v42-demo-pair.ready .sn-v42-frame-start,.sn-v42-demo-pair.ready .sn-v42-frame-finish{animation:none}.sn-v42-demo-pair.ready .sn-v42-frame-start{opacity:1}.sn-v42-demo-pair.ready .sn-v42-frame-finish{opacity:0}}
    `;
    document.head.appendChild(style);
  }

  function patchWorkout() {
    if (patching || state?.page !== 'activeWorkout') return;
    const screen = document.querySelector('.workout-screen');
    const ex = currentExercise();
    if (!screen || !ex) return;
    const canonical = MEDIA.canonicalId(ex);
    const existing = screen.querySelector('.sn-v42-card');
    const prev = screen.querySelector('#snV42Previous');
    if (existing?.dataset?.v42Exercise === canonical && prev && prev.disabled === (currentIndex() <= 0)) return;

    patching = true;
    try {
      screen.querySelectorAll(':scope > .exercise-visual,.sn-exercise-focus-panel,.sn-v38-exercise-visual,.sn-v39-exercise-visual,.sn-v40-card,.sn-v41-card,.sn-v42-card').forEach(node => node.remove());
      const anchor = screen.querySelector('.sn-exercise-head') || screen.querySelector('.exercise-title');
      if (anchor) {
        anchor.insertAdjacentHTML(anchor.classList.contains('sn-exercise-head') ? 'afterend' : 'beforebegin', card(ex));
        bindMedia(screen.querySelector('.sn-v42-card'), ex);
      }
      screen.querySelectorAll('.sn-prev-row,.sn-v38-prev-row,.sn-v39-prev-row,.sn-v40-prev-row,.sn-v41-prev-row,.sn-v42-prev-row').forEach(node => node.remove());
      const actions = screen.querySelector('.sn-workout-actions') || screen.querySelector('.workout-actions');
      if (actions) {
        const row = document.createElement('div');
        row.className = 'sn-v42-prev-row';
        row.innerHTML = `<button class="secondary sn-v42-prev" id="snV42Previous" ${currentIndex() <= 0 ? 'disabled' : ''}>← Previous exercise</button>`;
        actions.insertAdjacentElement('beforebegin', row);
        row.querySelector('#snV42Previous')?.addEventListener('click', previousExercise);
      }
    } finally { patching = false; }
  }

  function patchExerciseModal() {
    const modal = document.querySelector('#snProductModal .sn-modal');
    if (!modal || modal.dataset.v42MediaPatched === '1') return;
    const title = modal.querySelector('.sn-modal-head h2')?.textContent?.trim();
    if (!title) return;
    const ex = exerciseLibrary.find(item => String(item.name).toLowerCase() === title.toLowerCase());
    if (!ex) return;
    modal.dataset.v42MediaPatched = '1';
    modal.querySelectorAll('.sn-v38-exercise-visual,.sn-v39-exercise-visual,.sn-v40-card,.sn-v40-instruction-stack,.sn-v41-card,.sn-v41-detail-stack').forEach(node => node.remove());
    modal.querySelector('.sn-modal-head')?.insertAdjacentHTML('afterend', card(ex, true));
    bindMedia(modal.querySelector('.sn-v42-card'), ex);

    const m = meta(ex);
    [...modal.querySelectorAll('.sn-detail-block')]
      .filter(block => ['How to do it', 'Works', 'Common mistakes'].includes(block.querySelector('h3')?.textContent?.trim()))
      .forEach(block => block.remove());

    if (!modal.querySelector('.sn-v42-detail-stack')) {
      const stack = document.createElement('div');
      stack.className = 'sn-v42-detail-stack';
      stack.innerHTML = `<div class="sn-v42-detail"><h3>Primary muscles</h3><div class="sn-v42-muscle-tags"><span>${esc(m.primary || ex.muscle || 'Exercise')}</span>${(m.secondary || []).slice(0, 3).map(x => `<span>${esc(x)}</span>`).join('')}</div></div>
        <div class="sn-v42-detail"><h3>How to perform it</h3><ol>${detailSteps(ex).map(step => `<li>${esc(step)}</li>`).join('')}</ol></div>
        <div class="sn-v42-detail"><h3>Form tips</h3><ul>${detailTips(ex).map(tip => `<li>${esc(tip)}</li>`).join('')}</ul></div>`;
      modal.querySelector('.sn-v42-card')?.insertAdjacentElement('afterend', stack);
    }
  }

  installStyles();
  MEDIA.audit();
  const observer = new MutationObserver(() => queueMicrotask(() => { patchWorkout(); patchExerciseModal(); }));
  const root = document.getElementById('app');
  if (root) observer.observe(root, { childList: true, subtree: true });
  observer.observe(document.body, { childList: true, subtree: true });
  patchWorkout();
  patchExerciseModal();
})();
