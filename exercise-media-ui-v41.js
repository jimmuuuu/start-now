// START/NOW v41 — real exercise media UI. No generated exercise diagrams or machine art.
(() => {
  const SN = window.SN36;
  const MEDIA = window.START_NOW_EXERCISE_MEDIA;
  if (!MEDIA) return;
  let patching = false;
  let requestToken = 0;

  const esc = value => typeof escapeHtml === 'function' ? escapeHtml(String(value ?? '')) : String(value ?? '');
  const exerciseId = ex => MEDIA.exerciseId(ex);
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

  function loaderCard(ex, compact = false) {
    return `<section class="sn-v41-card ${compact ? 'compact' : ''}" data-v41-exercise="${esc(exerciseId(ex))}">
      <div class="sn-v41-head"><div><span>EXERCISE GUIDE</span><strong>${esc(ex?.name || 'Exercise')}</strong></div></div>
      <div class="sn-v41-media"><div class="sn-v41-loading" role="status" aria-label="Loading exercise demonstration"><i></i><i></i><i></i></div></div>
      <div class="sn-v41-primary"><span>PRIMARY</span><strong>${esc(primaryLabel(ex))}</strong></div>
      ${compact ? '' : `<div class="sn-v41-workout-meta"><strong>${esc(ex?.name || 'Exercise')}</strong><span>${esc(workoutSummary(ex))}</span></div><div class="sn-v41-cue"><span>COACH CUE</span><p>${esc(ex?.cue || meta(ex).instructions || 'Use a controlled range of motion and keep your setup consistent.')}</p></div>`}
    </section>`;
  }

  function attributionMarkup(result) {
    const m = result?.media || {};
    const bits = ['Media via wger'];
    if (m.author) bits.push(m.author);
    if (m.license) bits.push(m.license);
    const href = m.licenseUrl || m.authorUrl;
    return href
      ? `<a class="sn-v41-attribution" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${esc(bits.join(' • '))}</a>`
      : `<span class="sn-v41-attribution">${esc(bits.join(' • '))}</span>`;
  }

  function unavailableMarkup(ex, message = 'Exercise demonstration unavailable') {
    return `<div class="sn-v41-unavailable"><div class="sn-v41-no-media" aria-hidden="true"><svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="11" y="14" width="42" height="34" rx="6"/><path d="M22 27h20M24 38l8-8 8 8"/></svg></div><strong>${esc(message)}</strong><span>${esc(ex?.name || 'Exercise')}</span><small>Instructions, sets, reps, rest time, coach cue, and muscles are still available below.</small></div>`;
  }

  function renderResult(card, ex, result) {
    if (!card?.isConnected) return;
    const holder = card.querySelector('.sn-v41-media');
    if (!holder) return;
    if (result?.status !== 'ready' || !result?.media?.url) {
      holder.innerHTML = unavailableMarkup(ex, 'Exercise demonstration unavailable');
      return;
    }
    const m = result.media;
    if (m.type === 'video') {
      holder.innerHTML = `<div class="sn-v41-media-inner"><video class="sn-v41-video" src="${esc(m.url)}" autoplay muted loop playsinline preload="metadata" aria-label="${esc(ex?.name || 'Exercise')} demonstration"></video>${attributionMarkup(result)}</div>`;
      const video = holder.querySelector('video');
      video?.addEventListener('error', () => {
        MEDIA.invalidate(ex);
        holder.innerHTML = unavailableMarkup(ex, 'Exercise demonstration unavailable');
      }, { once: true });
      video?.play?.().catch(() => {});
      return;
    }
    holder.innerHTML = `<div class="sn-v41-media-inner"><img class="sn-v41-image" src="${esc(m.url)}" loading="lazy" decoding="async" alt="${esc(ex?.name || 'Exercise')} demonstration">${attributionMarkup(result)}</div>`;
    holder.querySelector('img')?.addEventListener('error', () => {
      MEDIA.invalidate(ex);
      holder.innerHTML = unavailableMarkup(ex, 'Exercise demonstration unavailable');
    }, { once: true });
  }

  async function hydrateCard(card, ex) {
    const token = ++requestToken;
    const cached = MEDIA.peek(ex);
    if (cached?.status === 'ready' || cached?.status === 'unavailable') renderResult(card, ex, cached);
    try {
      const result = await MEDIA.get(ex);
      if (token > requestToken || !card?.isConnected || card.dataset.v41Exercise !== exerciseId(ex)) return;
      renderResult(card, ex, result);
    } catch (_) {}
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

  function installStyles() {
    if (document.getElementById('sn-v41-styles')) return;
    const style = document.createElement('style');
    style.id = 'sn-v41-styles';
    style.textContent = `
      .workout-screen>.exercise-visual,.sn-exercise-focus-panel,.sn-v38-exercise-visual,.sn-v39-exercise-visual,.sn-v40-card{display:none!important}
      .sn-v41-card{margin:14px 0 18px;border:1px solid var(--line);border-radius:24px;background:var(--surface);overflow:hidden;box-shadow:0 12px 30px rgba(17,24,39,.055)}
      .sn-v41-head{display:flex;align-items:end;justify-content:space-between;padding:15px 17px 10px}.sn-v41-head>div{display:grid;gap:3px}.sn-v41-head span{font-size:9px;font-weight:900;letter-spacing:.11em;color:var(--blue)}.sn-v41-head strong{font-size:17px;color:var(--text)}
      .sn-v41-media{aspect-ratio:16/9;min-height:190px;background:linear-gradient(180deg,rgba(148,163,184,.055),rgba(59,130,246,.025));display:flex;align-items:center;justify-content:center;overflow:hidden}
      .sn-v41-media-inner{width:100%;height:100%;min-height:190px;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative}.sn-v41-video,.sn-v41-image{display:block;width:100%;height:100%;max-height:330px;object-fit:contain;background:#f8fafc}.sn-v41-attribution{position:absolute;left:10px;bottom:8px;max-width:calc(100% - 20px);padding:4px 7px;border-radius:8px;background:rgba(17,24,39,.72);color:#fff!important;font-size:8px!important;line-height:1.3;text-decoration:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .sn-v41-primary{display:flex;gap:8px;align-items:baseline;padding:12px 16px 10px}.sn-v41-primary span,.sn-v41-cue span{font-size:9px;font-weight:900;letter-spacing:.09em;color:var(--muted)}.sn-v41-primary strong{font-size:12px;color:var(--text)}
      .sn-v41-workout-meta{display:grid;gap:3px;padding:0 16px 10px}.sn-v41-workout-meta strong{font-size:14px;color:var(--text)}.sn-v41-workout-meta span{font-size:11px;color:var(--muted)}
      .sn-v41-cue{padding:12px 16px 15px;border-top:1px solid var(--line)}.sn-v41-cue p{margin:5px 0 0;font-size:12px;line-height:1.5;color:var(--muted)}
      .sn-v41-loading{width:100%;height:100%;min-height:190px;display:grid;place-items:center;align-content:center;gap:9px;padding:22px}.sn-v41-loading i{display:block;height:12px;border-radius:999px;background:linear-gradient(90deg,rgba(148,163,184,.13),rgba(148,163,184,.3),rgba(148,163,184,.13));background-size:200% 100%;animation:snV41Pulse 1.2s linear infinite}.sn-v41-loading i:nth-child(1){width:58%}.sn-v41-loading i:nth-child(2){width:38%}.sn-v41-loading i:nth-child(3){width:48%}@keyframes snV41Pulse{to{background-position:-200% 0}}
      .sn-v41-unavailable{min-height:190px;display:grid;place-items:center;align-content:center;text-align:center;gap:5px;padding:24px;color:var(--text)}.sn-v41-no-media{width:58px;height:58px;border-radius:18px;background:rgba(59,130,246,.08);color:var(--blue);display:grid;place-items:center;margin-bottom:4px}.sn-v41-no-media svg{width:32px;height:32px}.sn-v41-unavailable strong{font-size:14px}.sn-v41-unavailable span{font-size:12px;color:var(--muted)}.sn-v41-unavailable small{max-width:320px;font-size:10px;line-height:1.45;color:var(--muted)}
      .sn-v41-prev-row{display:grid;margin:10px 0}.sn-v41-prev{min-height:46px!important;font-weight:850!important}.sn-v41-prev:disabled{opacity:.38}
      .sn-v41-card.compact{margin:10px 0 16px;box-shadow:none}.sn-v41-card.compact .sn-v41-head{padding:12px 14px 9px}.sn-v41-card.compact .sn-v41-workout-meta,.sn-v41-card.compact .sn-v41-cue{display:none}.sn-v41-card.compact .sn-v41-media,.sn-v41-card.compact .sn-v41-media-inner,.sn-v41-card.compact .sn-v41-loading,.sn-v41-card.compact .sn-v41-unavailable{min-height:165px}
      .sn-v41-detail-stack{display:grid;gap:10px;margin:0 0 14px}.sn-v41-detail{padding:15px 16px;border:1px solid var(--line);border-radius:18px;background:var(--surface)}.sn-v41-detail h3{margin:0 0 8px;font-size:13px}.sn-v41-detail p{margin:0;color:var(--muted);font-size:12px;line-height:1.55}.sn-v41-detail ul{margin:0;padding-left:18px;color:var(--muted);font-size:12px;line-height:1.55}.sn-v41-detail li+li{margin-top:5px}.sn-v41-muscle-tags{display:flex;gap:6px;flex-wrap:wrap}.sn-v41-muscle-tags span{padding:6px 9px;border-radius:999px;background:rgba(59,130,246,.09);color:var(--text);font-size:11px;font-weight:750}
      @media(max-width:560px){.sn-v41-media,.sn-v41-media-inner,.sn-v41-loading,.sn-v41-unavailable{min-height:165px}.sn-v41-head strong{font-size:15px}.sn-v41-attribution{font-size:7px!important}.sn-v41-card{border-radius:20px}}
      .dark .sn-v41-card{box-shadow:0 12px 30px rgba(0,0,0,.2)}.dark .sn-v41-video,.dark .sn-v41-image{background:#111827}
    `;
    document.head.appendChild(style);
  }

  function patchWorkout() {
    if (patching || state?.page !== 'activeWorkout') return;
    const screen = document.querySelector('.workout-screen');
    const ex = currentExercise();
    if (!screen || !ex) return;
    const id = exerciseId(ex);
    const existing = screen.querySelector('.sn-v41-card');
    const prev = screen.querySelector('#snV41Previous');
    if (existing?.dataset?.v41Exercise === id && prev && prev.disabled === (currentIndex() <= 0)) return;

    patching = true;
    try {
      screen.querySelectorAll(':scope > .exercise-visual,.sn-exercise-focus-panel,.sn-v38-exercise-visual,.sn-v39-exercise-visual,.sn-v40-card,.sn-v41-card').forEach(n => n.remove());
      const anchor = screen.querySelector('.sn-exercise-head') || screen.querySelector('.exercise-title');
      if (anchor) {
        anchor.insertAdjacentHTML(anchor.classList.contains('sn-exercise-head') ? 'afterend' : 'beforebegin', loaderCard(ex));
        hydrateCard(screen.querySelector('.sn-v41-card'), ex);
      }
      screen.querySelectorAll('.sn-prev-row,.sn-v38-prev-row,.sn-v39-prev-row,.sn-v40-prev-row,.sn-v41-prev-row').forEach(n => n.remove());
      const actions = screen.querySelector('.sn-workout-actions') || screen.querySelector('.workout-actions');
      if (actions) {
        const row = document.createElement('div');
        row.className = 'sn-v41-prev-row';
        row.innerHTML = `<button class="secondary sn-v41-prev" id="snV41Previous" ${currentIndex() <= 0 ? 'disabled' : ''}>← Previous exercise</button>`;
        actions.insertAdjacentElement('beforebegin', row);
        row.querySelector('#snV41Previous')?.addEventListener('click', previousExercise);
      }
    } finally { patching = false; }
  }

  function detailTips(ex) {
    try {
      const tips = SN?.mistakes?.(ex) || [];
      if (tips.length) return tips.slice(0, 3);
    } catch (_) {}
    return [ex?.cue || 'Use a controlled range of motion and keep your setup stable.'];
  }

  function patchExerciseModal() {
    const modal = document.querySelector('#snProductModal .sn-modal');
    if (!modal || modal.dataset.v41MediaPatched === '1') return;
    const title = modal.querySelector('.sn-modal-head h2')?.textContent?.trim();
    if (!title) return;
    const ex = exerciseLibrary.find(item => String(item.name).toLowerCase() === title.toLowerCase());
    if (!ex) return;
    modal.dataset.v41MediaPatched = '1';
    modal.querySelectorAll('.sn-v38-exercise-visual,.sn-v39-exercise-visual,.sn-v40-card,.sn-v40-instruction-stack').forEach(n => n.remove());
    modal.querySelector('.sn-modal-head')?.insertAdjacentHTML('afterend', loaderCard(ex, true));
    hydrateCard(modal.querySelector('.sn-v41-card'), ex);

    const m = meta(ex);
    const oldBlocks = [...modal.querySelectorAll('.sn-detail-block')];
    oldBlocks.filter(b => ['How to do it', 'Works', 'Common mistakes'].includes(b.querySelector('h3')?.textContent?.trim())).forEach(b => b.remove());
    const stack = document.createElement('div');
    stack.className = 'sn-v41-detail-stack';
    const secondary = Array.isArray(m.secondary) ? m.secondary : [];
    const tips = detailTips(ex);
    stack.innerHTML = `<div class="sn-v41-detail"><h3>Primary muscles</h3><div class="sn-v41-muscle-tags"><span>${esc(m.primary || ex.muscle || 'Exercise')}</span>${secondary.slice(0,3).map(x => `<span>${esc(x)}</span>`).join('')}</div></div><div class="sn-v41-detail"><h3>How to perform it</h3><p>${esc(m.instructions || ex.cue || 'Use a controlled range of motion and follow the demonstrated movement.')}</p></div><div class="sn-v41-detail"><h3>Form tips</h3><ul>${tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul></div>`;
    modal.querySelector('.sn-v41-card')?.insertAdjacentElement('afterend', stack);
  }

  installStyles();
  const observer = new MutationObserver(() => queueMicrotask(() => { patchWorkout(); patchExerciseModal(); }));
  const root = document.getElementById('app');
  if (root) observer.observe(root, { childList: true, subtree: true });
  observer.observe(document.body, { childList: true, subtree: true });
  patchWorkout();
  patchExerciseModal();
})();
