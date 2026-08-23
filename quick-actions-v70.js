// START/NOW v77 — one owner for Home Quick Actions; existing destination screens are reused.
(() => {
  const SN = window.SN36;
  if (!SN || typeof state === 'undefined' || typeof render !== 'function') return;

  const esc = value => typeof escapeHtml === 'function'
    ? escapeHtml(String(value ?? ''))
    : String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  const fallbackIcons = {
    zap:'<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    bookOpen:'<path d="M2 5.5A3.5 3.5 0 0 1 5.5 2H11v17H5.5A3.5 3.5 0 0 0 2 22.5z"/><path d="M22 5.5A3.5 3.5 0 0 0 18.5 2H13v17h5.5a3.5 3.5 0 0 1 3.5 3.5z"/>',
    calendarDays:'<path d="M8 2v4M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/>',
    chart:'<path d="M3 3v18h18"/><path d="m7 16 4-5 4 3 5-7"/>',
    arrowLeft:'<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>'
  };

  function icon(name, size=24, strokeWidth=2.2) {
    if (window.START_NOW_ICONS?.icon) return window.START_NOW_ICONS.icon(name, '', size, strokeWidth);
    const body = fallbackIcons[name] || fallbackIcons.zap;
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
  }

  const actions = [
    {id:'quickWorkout', title:'Quick Workout', subtitle:'Train now', icon:'zap', tone:'coral'},
    {id:'exerciseLibrary', title:'Exercise Library', subtitle:'Browse exercises', icon:'bookOpen', tone:'bluebg'},
    {id:'calendar', title:'Workout Calendar', subtitle:'History & streaks', icon:'calendarDays', tone:'limebg'},
    {id:'myStats', title:'My Stats', subtitle:'See your numbers', icon:'chart', tone:'goldbg'}
  ];

  const routeMap = {
    quickWorkout:'quickWorkout',
    exerciseLibrary:'exerciseLibrary',
    calendar:'calendar',
    myStats:'myStats'
  };

  function installStyles() {
    if (document.getElementById('sn70-styles')) return;
    const style = document.createElement('style');
    style.id = 'sn70-styles';
    style.textContent = `
      .sn70-quick-actions{margin:22px 0}.sn70-head{margin:0 2px 10px}.sn70-head strong{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#2F6DF6}
      .sn70-quick-actions .tiles{margin:0}.sn70-quick-actions .tile{cursor:pointer;pointer-events:auto;position:relative;transition:transform .16s ease,box-shadow .16s ease}.sn70-quick-actions .tile:hover{transform:translateY(-2px);box-shadow:0 12px 24px rgba(20,25,35,.10)}.sn70-quick-actions .tile:active{transform:scale(.985)}.sn70-quick-actions .tile:focus-visible{outline:3px solid rgba(47,109,246,.28);outline-offset:3px}
      .sn70-icon{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;background:rgba(255,255,255,.18);color:#fff}.sn70-quick-actions .limebg .sn70-icon{background:rgba(38,48,13,.10);color:#26300D}.sn70-quick-actions .goldbg .sn70-icon{background:rgba(62,44,3,.10);color:#3E2C03}.sn70-quick-actions .tile strong{margin-top:14px}
      .sn70-page{padding-bottom:28px}.sn70-top{display:flex;align-items:center;gap:12px;margin-bottom:18px}.sn70-back{width:42px;height:42px;border-radius:14px;border:1px solid var(--line);background:var(--surface);color:var(--text);display:grid;place-items:center}.sn70-top .eyebrow{margin:0}.sn70-top h1{font-size:30px;line-height:1.05;margin:4px 0 0;letter-spacing:-1px}
      .sn70-stat-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:14px}.sn70-stat{padding:16px}.sn70-stat span,.sn70-stat small{display:block}.sn70-stat span{font-size:10px;font-weight:800;color:#64748B;letter-spacing:.06em;text-transform:uppercase}.sn70-stat strong{font-size:27px;line-height:1.05;display:block;margin:7px 0 4px}.sn70-stat small{font-size:10px;color:var(--muted)}
      .sn70-section{padding:16px;margin-top:12px}.sn70-section h2{font-size:19px;margin:0 0 13px}.sn70-row{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:10px 0;border-top:1px solid var(--line)}.sn70-row:first-of-type{border-top:0}.sn70-row strong,.sn70-row small{display:block}.sn70-row strong{font-size:12px}.sn70-row small{font-size:9px;color:var(--muted);margin-top:2px}.sn70-empty{padding:22px 12px;text-align:center;color:var(--muted);font-size:12px}
      @media(max-width:620px){.sn70-top h1{font-size:27px}}
    `;
    document.head.appendChild(style);
  }

  function renderHomeActions() {
    if (state.page !== 'home') return;
    const oldTiles = document.querySelector('.sn70-quick-actions .tiles, .tiles');
    if (!oldTiles) return;

    let section = oldTiles.closest('.sn70-quick-actions');
    if (!section) {
      const outerLegacy = oldTiles.closest('.sn60-quick-actions');
      section = document.createElement('section');
      section.className = 'sn70-quick-actions';
      if (outerLegacy) outerLegacy.replaceWith(section);
      else oldTiles.replaceWith(section);
    }

    section.innerHTML = `<div class="sn70-head"><strong>Quick Actions</strong></div><div class="tiles">${actions.map(item => `
      <button type="button" class="tile ${item.tone}" data-sn70-action="${item.id}" aria-label="${esc(item.title)} — ${esc(item.subtitle)}">
        <div class="sn70-icon">${icon(item.icon,28)}</div>
        <strong>${esc(item.title)}</strong><span>${esc(item.subtitle)}</span>
      </button>`).join('')}</div>`;

    section.querySelectorAll('[data-sn70-action]').forEach(button => {
      button.onclick = event => {
        event.preventDefault();
        openAction(button.dataset.sn70Action);
      };
    });
  }

  function openAction(id) {
    const target = routeMap[id];
    if (!target) {
      console.error('[Quick Actions] Unknown action', id);
      return false;
    }

    if (target === 'exerciseLibrary') state.__quickActionLibraryReturn = 'home';
    state.page = target;
    render();
    window.scrollTo({top:0,left:0,behavior:'auto'});
    return true;
  }

  function deriveBestLifts(sessions) {
    const map = new Map();
    sessions.forEach(session => (session.exercises || []).forEach(ex => {
      const weights = (ex.sets || []).filter(set => set.done).map(set => Number(set.weight) || 0);
      const best = Math.max(Number(ex.bestWeight) || 0, ...weights, 0);
      if (!best) return;
      const key = ex.id || ex.name;
      const current = map.get(key);
      if (!current || best > current.weight) map.set(key,{name:ex.name || 'Exercise',weight:best});
    }));
    return [...map.values()].sort((a,b) => b.weight-a.weight).slice(0,5);
  }

  function renderStats() {
    installStyles();
    const sessions = SN.sessions?.() || [];
    const minutes = sessions.reduce((sum,row) => sum + (Number(row.durationMinutes) || 0),0);
    const sets = sessions.reduce((sum,row) => sum + (Number(row.completedSets) || 0),0);
    const volume = sessions.reduce((sum,row) => sum + (Number(row.volume) || 0),0);
    const grades = sessions.map(row => Number(row.grade)).filter(Number.isFinite);
    const avg = grades.length ? Math.round(grades.reduce((a,b) => a+b,0) / grades.length) : null;
    const prs = sessions.reduce((sum,row) => sum + (Array.isArray(row.prs) ? row.prs.length : 0),0);
    const streaks = window.START_NOW_WORKOUT_CALENDAR?.calculateStreaks?.() || {
      current:Number(state.streak) || 0,
      longest:Number(localStorage.getItem(SN.keys?.bestStreak || 'sn_best_streak_v36')) || 0
    };
    const lifts = deriveBestLifts(sessions);

    app.innerHTML = `<section class="sn70-page"><div class="sn70-top"><button type="button" class="sn70-back" id="sn70Back" aria-label="Back">${icon('arrowLeft',21,2.3)}</button><div><div class="eyebrow">DETAILED NUMBERS</div><h1>My Stats</h1></div></div><div class="sn70-stat-grid"><div class="card sn70-stat"><span>Workouts completed</span><strong>${sessions.length}</strong><small>all logged sessions</small></div><div class="card sn70-stat"><span>Total training time</span><strong>${minutes}</strong><small>minutes</small></div><div class="card sn70-stat"><span>Total completed sets</span><strong>${sets}</strong><small>logged sets</small></div><div class="card sn70-stat"><span>Total volume</span><strong>${Math.round(volume).toLocaleString()}</strong><small>lb</small></div><div class="card sn70-stat"><span>Current streak</span><strong>${streaks.current}</strong><small>scheduled workouts</small></div><div class="card sn70-stat"><span>Longest streak</span><strong>${streaks.longest}</strong><small>scheduled workouts</small></div><div class="card sn70-stat"><span>Average workout grade</span><strong>${avg===null?'—':`${avg}%`}</strong><small>${grades.length?'logged grades':'no grade history yet'}</small></div><div class="card sn70-stat"><span>PRs recorded</span><strong>${prs}</strong><small>personal records</small></div></div><section class="card sn70-section"><h2>Strongest logged lifts</h2>${lifts.length ? lifts.map(lift => `<div class="sn70-row"><span><strong>${esc(lift.name)}</strong></span><b>${Math.round(lift.weight)} lb</b></div>`).join('') : '<div class="sn70-empty">Complete weighted sets to build your strongest-lifts list.</div>'}</section></section>`;
    document.getElementById('sn70Back')?.addEventListener('click',() => { state.page='home'; render(); });
  }

  installStyles();

  // Home rendering is the only place this module owns markup. It wraps the final Home renderer
  // once, after active-plan/rest-day enhancements are already installed.
  if (typeof renderHome === 'function') {
    const previousHome = renderHome;
    window.renderHome = function(...args) {
      const result = previousHome.apply(this,args);
      renderHomeActions();
      return result;
    };
  }

  // My Stats is the only extra route implemented by this module.
  const previousRender = window.render;
  window.render = function(...args) {
    if (state.page === 'myStats') {
      if (typeof navActive === 'function') navActive();
      renderStats();
      return;
    }
    return previousRender.apply(this,args);
  };

  // Preserve context-aware Back behavior for the existing Exercise Library.
  document.addEventListener('click', event => {
    if (state.page !== 'exerciseLibrary' || state.__quickActionLibraryReturn !== 'home') return;
    const back = event.target.closest?.('#snBack');
    if (!back) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    state.__quickActionLibraryReturn = null;
    state.page = 'home';
    render();
  }, true);

  // The center + should open Quick Workout, not start the scheduled workout.
  document.addEventListener('click', event => {
    if (!event.target.closest?.('#quickStart')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    openAction('quickWorkout');
  }, true);

  if (state.page === 'home') renderHomeActions();

  window.START_NOW_QUICK_ACTIONS = {
    version:'v77',
    actions,
    openAction,
    renderStats,
    renderHomeActions
  };
})();
