// START/NOW v65 — home Quick Actions, lightweight Quick Workout, and detailed My Stats.
(() => {
  const SN = window.SN36;
  const quickState = { mode: null, selected: [], query: '', muscle: 'All' };

  const esc = value => typeof escapeHtml === 'function'
    ? escapeHtml(String(value ?? ''))
    : String(value ?? '').replace(/[&<>'\"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[ch]));

  const ICONS = {
    zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    bookOpen: '<path d="M2 5.5A3.5 3.5 0 0 1 5.5 2H11v17H5.5A3.5 3.5 0 0 0 2 22.5z"/><path d="M22 5.5A3.5 3.5 0 0 0 18.5 2H13v17h5.5a3.5 3.5 0 0 1 3.5 3.5z"/>',
    calendarDays: '<path d="M8 2v4M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>',
    chart: '<path d="M3 3v18h18"/><path d="m7 16 4-5 4 3 5-7"/>',
    arrowLeft: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    play: '<path d="m8 5 11 7-11 7z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    layers: '<path d="m12 2 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/>',
    trophy: '<path d="M8 21h8M12 17v4"/><path d="M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M7 6H4a2 2 0 0 0 2 4h1M17 6h3a2 2 0 0 1-2 4h-1"/>'
  };

  function icon(name, size = 24, strokeWidth = 2.2) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.zap}</svg>`;
  }

  const quickActions = [
    { id:'quickWorkout', title:'Quick Workout', subtitle:'Train now', icon:'zap', tone:'coral' },
    { id:'exerciseLibrary', title:'Exercise Library', subtitle:'Browse exercises', icon:'bookOpen', tone:'bluebg' },
    { id:'calendar', title:'Workout Calendar', subtitle:'History & streaks', icon:'calendarDays', tone:'limebg' },
    { id:'myStats', title:'My Stats', subtitle:'See your numbers', icon:'chart', tone:'goldbg' }
  ];

  function installStyles() {
    if (document.getElementById('sn65-styles')) return;
    const style = document.createElement('style');
    style.id = 'sn65-styles';
    style.textContent = `
      .sn65-quick-actions{margin:22px 0}
      .sn65-quick-head{display:flex;align-items:center;justify-content:space-between;margin:0 2px 10px}
      .sn65-quick-head strong{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#2F6DF6}
      .sn65-quick-actions .tiles{margin:0}
      .sn65-quick-actions .tile{cursor:pointer;transition:transform .16s ease,box-shadow .16s ease}
      .sn65-quick-actions .tile:hover{transform:translateY(-2px);box-shadow:0 12px 24px rgba(20,25,35,.10)}
      .sn65-quick-actions .tile:active{transform:scale(.985)}
      .sn65-quick-icon{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;background:rgba(255,255,255,.18);color:#fff}
      .sn65-quick-actions .limebg .sn65-quick-icon{background:rgba(38,48,13,.10);color:#26300D}
      .sn65-quick-actions .goldbg .sn65-quick-icon{background:rgba(62,44,3,.10);color:#3E2C03}
      .sn65-quick-actions .tile strong{margin-top:14px}
      .sn65-page{padding-bottom:28px}
      .sn65-page-top{display:flex;align-items:center;gap:12px;margin-bottom:18px}
      .sn65-back{width:42px;height:42px;border-radius:14px;border:1px solid var(--line);background:var(--surface);color:var(--text);display:grid;place-items:center}
      .sn65-page-top .eyebrow{margin:0}.sn65-page-top h1{font-size:30px;line-height:1.05;margin:4px 0 0;letter-spacing:-1px}
      .sn65-choice-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px}
      .sn65-choice{border:1px solid var(--line);background:var(--surface);border-radius:18px;padding:16px;text-align:left;color:var(--text);cursor:pointer;min-height:138px}
      .sn65-choice:hover,.sn65-choice.active{border-color:#BFD6FF;background:#F7FAFF}
      .sn65-choice-icon{width:42px;height:42px;border-radius:13px;background:#EEF4FF;color:#2F6DF6;display:grid;place-items:center;margin-bottom:14px}
      .sn65-choice strong,.sn65-choice span{display:block}.sn65-choice strong{font-size:15px}.sn65-choice span{font-size:11px;color:var(--muted);margin-top:5px;line-height:1.35}
      .sn65-panel{padding:16px;margin-top:12px}.sn65-panel h2{font-size:20px;margin:0 0 5px}.sn65-panel>p{margin:0 0 14px;color:var(--muted);font-size:12px;line-height:1.45}
      .sn65-workout-list{display:grid;gap:9px}.sn65-workout-row{display:flex;align-items:center;gap:12px;border:1px solid var(--line);border-radius:15px;background:var(--surface);padding:12px;text-align:left;color:var(--text);cursor:pointer}
      .sn65-workout-row>span:first-child{width:38px;height:38px;border-radius:12px;background:#F2F6FF;color:#2F6DF6;display:grid;place-items:center;flex:0 0 auto}.sn65-workout-row>span:nth-child(2){flex:1;min-width:0}.sn65-workout-row strong,.sn65-workout-row small{display:block}.sn65-workout-row strong{font-size:13px}.sn65-workout-row small{font-size:10px;color:var(--muted);margin-top:3px}.sn65-workout-row b{font-size:11px;color:#2F6DF6}
      .sn65-picker-tools{display:grid;grid-template-columns:1fr 145px;gap:8px;margin-bottom:10px}.sn65-picker-tools label{display:flex;align-items:center;gap:8px;border:1px solid var(--line);border-radius:13px;padding:0 11px;background:var(--surface)}
      .sn65-picker-tools input,.sn65-picker-tools select{width:100%;height:42px;border:0;background:transparent;color:var(--text);outline:0;font:inherit;font-size:12px}.sn65-picker-tools select{border:1px solid var(--line);border-radius:13px;padding:0 10px;background:var(--surface)}
      .sn65-selected{display:flex;flex-wrap:wrap;gap:7px;margin:10px 0 13px}.sn65-selected button{border:1px solid #D7E4FA;background:#F4F8FF;color:#214F91;border-radius:999px;padding:7px 9px;font-size:10px}
      .sn65-exercise-results{display:grid;gap:7px;max-height:360px;overflow:auto;padding-right:2px}.sn65-exercise-row{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;border-bottom:1px solid var(--line);padding:9px 2px}.sn65-exercise-row strong,.sn65-exercise-row small{display:block}.sn65-exercise-row strong{font-size:12px}.sn65-exercise-row small{font-size:9px;color:var(--muted);margin-top:3px}.sn65-exercise-row button{width:34px;height:34px;border-radius:10px;border:1px solid #D5E3FA;background:#F4F8FF;color:#2F6DF6;display:grid;place-items:center}
      .sn65-start{width:100%;margin-top:14px;border:0;border-radius:15px;background:#FF5A57;color:#fff;padding:14px 16px;font-size:14px;font-weight:800}.sn65-start:disabled{opacity:.4}
      .sn65-stat-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:14px}.sn65-stat{padding:16px}.sn65-stat span,.sn65-stat small{display:block}.sn65-stat span{font-size:10px;font-weight:800;color:#64748B;letter-spacing:.06em;text-transform:uppercase}.sn65-stat strong{font-size:27px;line-height:1.05;display:block;margin:7px 0 4px}.sn65-stat small{font-size:10px;color:var(--muted)}
      .sn65-stats-section{padding:16px;margin-top:12px}.sn65-stats-section h2{font-size:19px;margin:0 0 13px}.sn65-lift-row,.sn65-muscle-row{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:10px 0;border-top:1px solid var(--line)}.sn65-lift-row:first-of-type,.sn65-muscle-row:first-of-type{border-top:0}.sn65-lift-row strong,.sn65-lift-row small{display:block}.sn65-lift-row strong{font-size:12px}.sn65-lift-row small{font-size:9px;color:var(--muted);margin-top:2px}.sn65-lift-row b{font-size:12px}.sn65-muscle-row>div:first-child{min-width:0}.sn65-muscle-label{display:flex;justify-content:space-between;gap:10px;font-size:10px;margin-bottom:5px}.sn65-bar{height:7px;background:#EEF1F4;border-radius:999px;overflow:hidden}.sn65-bar i{display:block;height:100%;background:#2F6DF6;border-radius:inherit}.sn65-empty{padding:22px 12px;text-align:center;color:var(--muted);font-size:12px}
      .dark .sn65-choice:hover,.dark .sn65-choice.active,.dark .sn65-quick-actions .tile{box-shadow:none}.dark .sn65-choice-icon,.dark .sn65-workout-row>span:first-child,.dark .sn65-exercise-row button{background:#1B2A42}
      @media(max-width:620px){.sn65-choice-grid{grid-template-columns:1fr}.sn65-choice{min-height:0;display:grid;grid-template-columns:44px 1fr;column-gap:12px}.sn65-choice-icon{grid-row:1/3;margin:0}.sn65-picker-tools{grid-template-columns:1fr}.sn65-page-top h1{font-size:27px}}
    `;
    document.head.appendChild(style);
  }

  function cloneExercise(ex) { return {...ex}; }
  function workoutCopy(workout) { return { ...workout, id:`quick-${workout.id || Date.now()}-${Date.now()}`, days:[], quick:true, exercises:(workout.exercises || []).map(cloneExercise) }; }
  function startExisting(workout) { if (workout?.exercises?.length && typeof startWorkout === 'function') startWorkout(workoutCopy(workout)); }
  function startManual() {
    if (!quickState.selected.length || typeof startWorkout !== 'function') return;
    const chosen = quickState.selected.map(id => exerciseLibrary.find(ex => String(ex.id) === id)).filter(Boolean).map(cloneExercise);
    if (chosen.length) startWorkout({ id:`quick-manual-${Date.now()}`, name:'Quick Workout', days:[], quick:true, exercises:chosen });
  }

  function renderQuickWorkout() {
    const muscles = ['All', ...[...new Set(exerciseLibrary.map(ex => ex.muscle).filter(Boolean))].sort()];
    const q = quickState.query.trim().toLowerCase();
    const filtered = exerciseLibrary.filter(ex => (!q || `${ex.name} ${ex.muscle} ${SN?.meta?.(ex)?.equipment || ''}`.toLowerCase().includes(q)) && (quickState.muscle === 'All' || ex.muscle === quickState.muscle));
    const existing = [defaultWorkout, ...(state.customWorkouts || [])];
    app.innerHTML = `<section class="sn65-page"><div class="sn65-page-top"><button class="sn65-back" id="sn65Back">${icon('arrowLeft',21,2.3)}</button><div><div class="eyebrow">TRAIN NOW</div><h1>Quick Workout</h1></div></div><div class="sn65-choice-grid"><button class="sn65-choice ${quickState.mode==='manual' && quickState.selected.length===0?'active':''}" data-mode="empty"><span class="sn65-choice-icon">${icon('plus',22)}</span><strong>Start empty workout</strong><span>Build a one-off session without changing your schedule.</span></button><button class="sn65-choice ${quickState.mode==='existing'?'active':''}" data-mode="existing"><span class="sn65-choice-icon">${icon('play',22)}</span><strong>Choose existing workout</strong><span>Train one of your saved workouts right now.</span></button><button class="sn65-choice ${quickState.mode==='manual' && quickState.selected.length>0?'active':''}" data-mode="manual"><span class="sn65-choice-icon">${icon('search',21)}</span><strong>Choose exercises manually</strong><span>Pick exactly what you want to train today.</span></button></div>${quickState.mode==='existing' ? `<section class="card sn65-panel"><h2>Existing workouts</h2><p>Starting one here does not reschedule your weekly plan.</p><div class="sn65-workout-list">${existing.map(w=>`<button class="sn65-workout-row" data-existing="${esc(w.id)}"><span>${icon('play',17)}</span><span><strong>${esc(w.name)}</strong><small>${w.exercises?.length || 0} exercises</small></span><b>Start →</b></button>`).join('')}</div></section>` : ''}${quickState.mode==='manual' ? `<section class="card sn65-panel"><h2>${quickState.selected.length ? 'Build your workout' : 'Empty quick workout'}</h2><p>Add at least one exercise, then start. This session stays separate from your weekly schedule.</p><div class="sn65-picker-tools"><label>${icon('search',17)}<input id="sn65Search" placeholder="Search exercises" value="${esc(quickState.query)}"></label><select id="sn65Muscle">${muscles.map(m=>`<option ${m===quickState.muscle?'selected':''}>${esc(m)}</option>`).join('')}</select></div>${quickState.selected.length?`<div class="sn65-selected">${quickState.selected.map(id=>{const ex=exerciseLibrary.find(x=>String(x.id)===id);return ex?`<button data-remove="${esc(id)}">${esc(ex.name)} ×</button>`:''}).join('')}</div>`:''}<div class="sn65-exercise-results">${filtered.slice(0,50).map(ex=>`<div class="sn65-exercise-row"><span><strong>${esc(ex.name)}</strong><small>${esc(ex.muscle || 'Exercise')} • ${esc(SN?.meta?.(ex)?.equipment || 'Equipment')}</small></span><button data-add="${esc(ex.id)}" aria-label="Add ${esc(ex.name)}">${quickState.selected.includes(String(ex.id))?icon('check',17,2.5):icon('plus',17)}</button></div>`).join('')}</div><button class="sn65-start" id="sn65Start" ${quickState.selected.length?'':'disabled'}>Start Quick Workout →</button></section>` : ''}</section>`;
    document.getElementById('sn65Back').onclick = () => { state.page='home'; quickState.mode=null; render(); };
    document.querySelectorAll('[data-mode]').forEach(btn => btn.onclick = () => { if (btn.dataset.mode === 'existing') quickState.mode='existing'; else { quickState.mode='manual'; if (btn.dataset.mode === 'empty') quickState.selected=[]; } renderQuickWorkout(); });
    document.querySelectorAll('[data-existing]').forEach(btn => btn.onclick = () => { const workout = existing.find(w => String(w.id) === btn.dataset.existing); if (workout) startExisting(workout); });
    const search = document.getElementById('sn65Search'); if (search) search.oninput = () => { quickState.query=search.value; renderQuickWorkout(); document.getElementById('sn65Search')?.focus(); };
    const muscle = document.getElementById('sn65Muscle'); if (muscle) muscle.onchange = () => { quickState.muscle=muscle.value; renderQuickWorkout(); };
    document.querySelectorAll('[data-add]').forEach(btn => btn.onclick = () => { const id=String(btn.dataset.add); if (!quickState.selected.includes(id)) quickState.selected.push(id); renderQuickWorkout(); });
    document.querySelectorAll('[data-remove]').forEach(btn => btn.onclick = () => { quickState.selected=quickState.selected.filter(id=>id!==String(btn.dataset.remove)); renderQuickWorkout(); });
    document.getElementById('sn65Start')?.addEventListener('click', startManual);
  }

  function deriveBestLifts(sessions) {
    const map = new Map();
    sessions.forEach(session => (session.exercises || []).forEach(ex => { const weights=(ex.sets||[]).filter(set=>set.done).map(set=>Number(set.weight)||0); const best=Math.max(Number(ex.bestWeight)||0,...weights,0); if(!best)return; const key=ex.id||ex.name,current=map.get(key); if(!current||best>current.weight)map.set(key,{name:ex.name||'Exercise',muscle:ex.muscle||'Other',weight:best}); }));
    return [...map.values()].sort((a,b)=>b.weight-a.weight);
  }
  function muscleTotals(sessions) {
    const map=new Map(); sessions.forEach(session=>(session.exercises||[]).forEach(ex=>{const sets=Number(ex.completedSets)||(ex.sets||[]).filter(s=>s.done).length||0,muscle=ex.muscle||'Other';map.set(muscle,(map.get(muscle)||0)+sets);})); return [...map.entries()].sort((a,b)=>b[1]-a[1]);
  }
  function renderStats() {
    const sessions=SN?.sessions?.()||[],totalMinutes=sessions.reduce((s,x)=>s+(Number(x.durationMinutes)||0),0),totalSets=sessions.reduce((s,x)=>s+(Number(x.completedSets)||0),0),totalVolume=sessions.reduce((s,x)=>s+(Number(x.volume)||0),0),grades=sessions.map(s=>Number(s.grade)).filter(Number.isFinite),avgGrade=grades.length?Math.round(grades.reduce((a,b)=>a+b,0)/grades.length):null,prCount=sessions.reduce((s,x)=>s+(Array.isArray(x.prs)?x.prs.length:0),0),streaks=window.START_NOW_WORKOUT_CALENDAR?.calculateStreaks?.()||{current:Number(state.streak)||0,longest:Number(localStorage.getItem(SN?.keys?.bestStreak||'sn_best_streak_v36'))||0},overall=SN?.overallGrade?.()||null,lifts=deriveBestLifts(sessions).slice(0,5),muscles=muscleTotals(sessions).slice(0,6),maxMuscle=Math.max(1,...muscles.map(x=>x[1]));
    app.innerHTML=`<section class="sn65-page"><div class="sn65-page-top"><button class="sn65-back" id="sn65Back">${icon('arrowLeft',21,2.3)}</button><div><div class="eyebrow">DETAILED NUMBERS</div><h1>My Stats</h1></div></div><div class="sn65-stat-grid"><div class="card sn65-stat"><span>Workouts completed</span><strong>${sessions.length}</strong><small>all logged sessions</small></div><div class="card sn65-stat"><span>Total training time</span><strong>${totalMinutes}</strong><small>minutes</small></div><div class="card sn65-stat"><span>Total completed sets</span><strong>${totalSets}</strong><small>logged sets</small></div><div class="card sn65-stat"><span>Total volume</span><strong>${Math.round(totalVolume).toLocaleString()}</strong><small>lb from completed weighted sets</small></div><div class="card sn65-stat"><span>Current streak</span><strong>${streaks.current}</strong><small>scheduled workouts</small></div><div class="card sn65-stat"><span>Longest streak</span><strong>${streaks.longest}</strong><small>scheduled workouts</small></div><div class="card sn65-stat"><span>Average workout grade</span><strong>${avgGrade===null?'—':`${avgGrade}%`}</strong><small>${grades.length?'logged workout grades':'no grade history yet'}</small></div><div class="card sn65-stat"><span>PRs recorded</span><strong>${prCount}</strong><small>saved personal records</small></div><div class="card sn65-stat"><span>30-day consistency</span><strong>${overall&&Number.isFinite(Number(overall.adherence))?`${Math.round(Number(overall.adherence))}%`:'—'}</strong><small>schedule adherence</small></div></div><section class="card sn65-stats-section"><h2>Strongest logged lifts</h2>${lifts.length?lifts.map(l=>`<div class="sn65-lift-row"><span><strong>${esc(l.name)}</strong><small>${esc(l.muscle)}</small></span><b>${Math.round(l.weight)} lb</b></div>`).join(''):`<div class="sn65-empty">Complete weighted sets to build your strongest-lifts list.</div>`}</section><section class="card sn65-stats-section"><h2>Muscle-group training</h2>${muscles.length?muscles.map(([muscle,sets])=>`<div class="sn65-muscle-row"><div><div class="sn65-muscle-label"><span>${esc(muscle)}</span><strong>${sets} sets</strong></div><div class="sn65-bar"><i style="width:${Math.round(sets/maxMuscle*100)}%"></i></div></div></div>`).join(''):`<div class="sn65-empty">Your muscle-group distribution will appear after you log workouts.</div>`}</section></section>`; document.getElementById('sn65Back').onclick=()=>{state.page='home';render();};
  }

  function openAction(id) { if(id==='quickWorkout'){quickState.mode=null;state.page='quickWorkout';render();return;} if(id==='exerciseLibrary'){state.__quickActionLibraryReturn='home';state.page='exerciseLibrary';render();return;} if(id==='calendar'){state.page='calendar';render();return;} if(id==='myStats'){state.page='myStats';render();} }
  function enhanceHome() {
    const oldTiles=document.querySelector('.tiles'); if(!oldTiles)return; let section=oldTiles.closest('.sn65-quick-actions'); if(!section){section=document.createElement('section');section.className='sn65-quick-actions';oldTiles.replaceWith(section);} section.innerHTML=`<div class="sn65-quick-head"><strong>Quick Actions</strong></div><div class="tiles">${quickActions.map(item=>`<button class="tile ${item.tone}" data-quick-action="${item.id}" aria-label="${esc(item.title)} — ${esc(item.subtitle)}"><div class="sn65-quick-icon">${icon(item.icon,28,2.2)}</div><strong>${esc(item.title)}</strong><span>${esc(item.subtitle)}</span></button>`).join('')}</div>`; section.querySelectorAll('[data-quick-action]').forEach(btn=>btn.onclick=()=>openAction(btn.dataset.quickAction));
    const plan=document.querySelector('.plan-card'),insight=document.querySelector('.sn-home-insights'),streak=document.querySelector('.streak-card'),focus=[...document.querySelectorAll('.section-card,.card')].find(card=>/muscle focus|recovery focus/i.test(card.textContent||'')),anchor=insight||plan; if(anchor&&section!==anchor.nextElementSibling)anchor.insertAdjacentElement('afterend',section); if(streak&&section.nextElementSibling!==streak)section.insertAdjacentElement('afterend',streak); if(focus&&streak&&streak.nextElementSibling!==focus)streak.insertAdjacentElement('afterend',focus);
  }

  installStyles();
  const previousRender=window.render;
  window.render=function(...args){ if(state.page==='quickWorkout'){if(typeof navActive==='function')navActive();renderQuickWorkout();return;} if(state.page==='myStats'){if(typeof navActive==='function')navActive();renderStats();return;} const result=previousRender.apply(this,args); if(state.page==='home')enhanceHome(); return result; };
  document.addEventListener('click',event=>{if(state.page!=='exerciseLibrary'||!state.__quickActionLibraryReturn)return;const back=event.target.closest?.('#snBack');if(!back)return;event.preventDefault();event.stopImmediatePropagation();state.page=state.__quickActionLibraryReturn;state.__quickActionLibraryReturn=null;render();},true);
  if(state.page==='home')enhanceHome();
  window.START_NOW_QUICK_ACTIONS={version:'v65',actions:quickActions,renderQuickWorkout,renderStats};
})();