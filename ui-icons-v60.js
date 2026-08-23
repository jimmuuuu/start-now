// START/NOW v76 — consistent SVG UI icons; Home tiles now permanently use Quick Actions.
(() => {
  const ICONS = {
    calendarDays: '<path d="M8 2v4M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
    dumbbell: '<path d="M6 9v6M4 10v4M18 9v6M20 10v4M6 12h12"/>',
    chart: '<path d="M3 3v18h18"/><path d="m7 16 4-5 4 3 5-7"/>',
    trendingUp: '<path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    trophy: '<path d="M8 21h8M12 17v4"/><path d="M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M7 6H4a2 2 0 0 0 2 4h1M17 6h3a2 2 0 0 1-2 4h-1"/>',
    flame: '<path d="M12 22c4 0 7-3 7-7 0-2.6-1.3-5-3.5-7.4-.4 2-1.4 3.3-3 4.2.4-3.5-1.2-6.8-4.1-9.8.2 3.6-3.4 6.1-3.4 10.3C5 17.8 8 22 12 22z"/><path d="M9.7 16.5c0 1.6 1 2.8 2.4 2.8 1.6 0 2.7-1.2 2.7-2.8 0-1.1-.6-2.2-1.6-3.2-.2 1-.7 1.7-1.5 2.1.1-1.4-.4-2.6-1.4-3.7.1 1.7-.6 3-0.6 4.8z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    bookOpen: '<path d="M2 5.5A3.5 3.5 0 0 1 5.5 2H11v17H5.5A3.5 3.5 0 0 0 2 22.5z"/><path d="M22 5.5A3.5 3.5 0 0 0 18.5 2H13v17h5.5a3.5 3.5 0 0 1 3.5 3.5z"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    house: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    lightbulb: '<path d="M9 18h6M10 22h4"/><path d="M8.5 14.5A6 6 0 1 1 15.5 14.5C14.6 15.3 14 16.4 14 18h-4c0-1.6-.6-2.7-1.5-3.5z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>'
  };

  function icon(name, className = '', size = 24, strokeWidth = 2.2) {
    const body = ICONS[name] || ICONS.dumbbell;
    return `<svg class="sn60-icon ${className}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
  }

  // v76: this is now the canonical Home-card definition. The old Today / Workouts /
  // Progress / Achievements definitions were removed so they cannot be resurrected by decorate().
  const quickLinks = [
    { title: 'Quick Workout', subtitle: 'Train now', icon: 'zap', action: 'quickWorkout', tone: 'coral' },
    { title: 'Exercise Library', subtitle: 'Browse exercises', icon: 'bookOpen', action: 'exerciseLibrary', tone: 'bluebg' },
    { title: 'Workout Calendar', subtitle: 'History & streaks', icon: 'calendarDays', action: 'calendar', tone: 'limebg' },
    { title: 'My Stats', subtitle: 'See your numbers', icon: 'chart', action: 'myStats', tone: 'goldbg' }
  ];

  function installStyles() {
    if (document.getElementById('sn60-icon-styles')) return;
    const style = document.createElement('style');
    style.id = 'sn60-icon-styles';
    style.textContent = `
      .sn60-icon{display:block;flex:0 0 auto}
      .sn60-quick-icon-wrap{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.18);color:#fff}
      .tile.limebg .sn60-quick-icon-wrap{background:rgba(38,48,13,.10);color:#26300d}
      .tile.goldbg .sn60-quick-icon-wrap{background:rgba(62,44,3,.10);color:#3e2c03}
      .tile .sn60-quick-icon-wrap + strong{margin-top:14px}
      .sn60-quick-actions{margin-top:18px}.sn60-quick-actions-head{margin:0 2px 10px;font-size:12px;font-weight:850;letter-spacing:.12em;text-transform:uppercase;color:#2F6DF6}
      .card-label .sn60-icon,.streak .sn60-icon{width:18px;height:18px}
      .workout-icon .sn60-icon{width:22px;height:22px;margin:auto}
      .create-workout-btn,.sn60-icon-label{display:inline-flex;align-items:center;gap:7px}
      .nav-icon{display:grid;place-items:center}
      .nav-icon .sn60-icon{width:22px;height:22px}
      .nav-fab .sn60-icon{width:26px;height:26px;margin:auto}
      .day.done .sn60-icon,.activity-dot .sn60-icon{width:14px;height:14px;margin:auto}
      .reason strong .sn60-icon{display:inline-block;vertical-align:-3px;margin-right:7px;width:18px;height:18px}
      .sn-library-search .sn60-icon{width:18px;height:18px}

      .streak-card .fire{display:grid;place-items:center}
      .streak-card .streak-fire{display:block;font-size:34px;line-height:1;transform:translateY(-1px)}

      .achievement-mini{position:relative}
      .achievement-mini .milestone-icon{width:46px;height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;transition:transform .18s ease,background .18s ease,color .18s ease}
      .achievement-mini .milestone-icon .sn60-icon{width:26px;height:26px}
      .achievement-mini.locked{opacity:.68;background:var(--surface)}
      .achievement-mini.locked strong,.achievement-mini.locked small{color:var(--muted)}
      .achievement-mini.locked .milestone-icon{background:#F1F3F5;color:#9AA1AA}
      .achievement-mini.completed{opacity:1;border-color:rgba(47,109,246,.12);box-shadow:0 7px 18px rgba(25,35,55,.045)}
      .achievement-mini.completed .milestone-icon-coral{background:rgba(255,90,87,.12);color:#E74D4A}
      .achievement-mini.completed .milestone-icon-gold{background:rgba(242,182,49,.16);color:#C88C08}
      .achievement-mini.completed .milestone-icon-blue{background:rgba(47,109,246,.12);color:#2F6DF6}
      .achievement-mini.completed .milestone-icon{transform:translateY(-1px)}
      .milestone-complete{position:absolute;top:8px;right:8px;width:22px;height:22px;border-radius:999px;display:grid;place-items:center;background:#EFF8D8;color:#6F9D14}
      .milestone-complete .sn60-icon{width:13px;height:13px}
      .dark .achievement-mini.locked .milestone-icon{background:#25292E;color:#7F8790}
      .dark .milestone-complete{background:#29321E;color:#B7E34A}

      @media(max-width:390px){
        .achievement-mini{grid-template-columns:50px 1fr!important}
        .achievement-mini .milestone-icon{grid-row:1/3;margin:0;align-self:center;width:44px;height:44px}
        .achievement-mini .milestone-icon .sn60-icon{width:25px;height:25px}
      }
    `;
    document.head.appendChild(style);
  }

  function openQuickAction(action) {
    if (window.START_NOW_QUICK_ACTIONS?.openAction) {
      window.START_NOW_QUICK_ACTIONS.openAction(action);
      return;
    }
    if (typeof state === 'undefined' || typeof render !== 'function') return;
    state.page = action;
    render();
  }

  function renderQuickLinks() {
    let tiles = document.querySelector('.sn70-quick-actions .tiles') || document.querySelector('.tiles');
    if (!tiles) return;

    let section = tiles.closest('.sn70-quick-actions, .sn60-quick-actions');
    if (!section) {
      section = document.createElement('section');
      section.className = 'sn60-quick-actions';
      tiles.replaceWith(section);
      section.innerHTML = '<div class="sn60-quick-actions-head">Quick Actions</div><div class="tiles"></div>';
      tiles = section.querySelector('.tiles');
    }

    // If quick-actions-v70 already owns the section, leave its heading/style intact and only
    // guarantee that the four canonical actions are present.
    tiles.innerHTML = quickLinks.map(item => `
      <button type="button" class="tile ${item.tone}" data-sn70-action="${item.action}" aria-label="${item.title} — ${item.subtitle}">
        <div class="sn60-quick-icon-wrap">${icon(item.icon, 'quick-card-icon', 28, 2.2)}</div>
        <strong>${item.title}</strong><span>${item.subtitle}</span>
      </button>`).join('');

    tiles.querySelectorAll('[data-sn70-action]').forEach(btn => {
      btn.onclick = event => {
        event.preventDefault();
        openQuickAction(btn.dataset.sn70Action);
      };
    });
  }

  function replaceReasonIcon(strong, name, label) {
    strong.innerHTML = `${icon(name, '', 18, 2.2)}${label}`;
  }

  function cleanLeadingSymbol(text) {
    return String(text || '').replace(/^[^A-Za-z0-9]+\s*/, '').trim();
  }

  function decorate() {
    installStyles();

    document.querySelectorAll('[data-sn-icon]').forEach(node => {
      node.innerHTML = icon(node.dataset.snIcon, '', Number(node.dataset.snSize || 22), Number(node.dataset.snStroke || 2.2));
    });

    // v76: decoration may run many times, but it can only render the NEW Quick Actions now.
    renderQuickLinks();

    const planLabel = document.querySelector('.plan-card .card-label');
    if (planLabel) planLabel.innerHTML = `${icon('dumbbell', '', 18)}<span>Today’s plan</span>`;

    const planStreak = document.querySelector('.plan-card .streak');
    if (planStreak && typeof state !== 'undefined') planStreak.innerHTML = `${icon('flame', '', 18)}<span>${state.streak} day streak</span>`;

    // Intentional exception: the motivational live streak card uses the actual fire emoji.
    const liveStreakFire = document.querySelector('.streak-card .fire');
    if (liveStreakFire) liveStreakFire.innerHTML = '<span class="streak-fire" aria-hidden="true">🔥</span>';

    document.querySelectorAll('.day.done').forEach(day => {
      day.innerHTML = icon('check', '', 14, 2.5);
      day.setAttribute('aria-label', 'Completed');
    });

    const tip = document.querySelector('.tip strong');
    if (tip && /Daily Tip/i.test(tip.textContent)) tip.innerHTML = `${icon('lightbulb', '', 17)}<span>Daily Tip</span>`;

    const create = document.querySelector('.create-workout-btn');
    if (create && /Create/i.test(create.textContent)) create.innerHTML = `${icon('plus', '', 17)}<span>Create</span>`;

    document.querySelectorAll('.workout-icon').forEach(node => node.innerHTML = icon('dumbbell', '', 22));
    document.querySelectorAll('.delete-workout').forEach(node => node.innerHTML = icon('more', '', 20));

    document.querySelectorAll('.metric').forEach(metric => {
      if (/Current Streak/i.test(metric.querySelector('small')?.textContent || '')) {
        const span = metric.querySelector('span:last-child');
        if (span) span.innerHTML = `<span class="sn60-icon-label">days ${icon('flame', '', 16)}</span>`;
      }
    });

    document.querySelectorAll('.reason strong').forEach(strong => {
      const text = cleanLeadingSymbol(strong.textContent);
      if (/Consistency Starter|Consistency/i.test(text)) replaceReasonIcon(strong, 'flame', text);
      else if (/First Five/i.test(text)) replaceReasonIcon(strong, 'trophy', text);
      else if (/Progress Tracker|Progress/i.test(text)) replaceReasonIcon(strong, 'trendingUp', text);
      else if (/Completion/i.test(text)) replaceReasonIcon(strong, 'check', text);
    });

    const searchMark = document.querySelector('.sn-library-search > span');
    if (searchMark) searchMark.innerHTML = icon('search', '', 18);
  }

  installStyles();
  window.START_NOW_ICONS = { version: 'v76', icon, quickLinks, decorate };

  if (typeof render === 'function') {
    const priorRender = render;
    window.render = function(...args) {
      const result = priorRender.apply(this, args);
      decorate();
      return result;
    };
  }

  decorate();
})();