// START/NOW v75 — direct Quick Action routing with stable Quick Workout + Exercise Library screens.
(() => {
  const SN = window.SN36;
  if (!SN || typeof state === 'undefined' || typeof window.render !== 'function') return;

  const esc = value => typeof escapeHtml === 'function'
    ? escapeHtml(String(value ?? ''))
    : String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  const ICONS = {
    zap:'<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    bookOpen:'<path d="M2 5.5A3.5 3.5 0 0 1 5.5 2H11v17H5.5A3.5 3.5 0 0 0 2 22.5z"/><path d="M22 5.5A3.5 3.5 0 0 0 18.5 2H13v17h5.5a3.5 3.5 0 0 1 3.5 3.5z"/>',
    calendar:'<path d="M8 2v4M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18"/>',
    chart:'<path d="M3 3v18h18"/><path d="m7 16 4-5 4 3 5-7"/>',
    arrowLeft:'<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
    search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>'
  };

  function icon(name,size=24,strokeWidth=2.2){
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name]||ICONS.zap}</svg>`;
  }

  const actions = [
    {id:'quickWorkout',title:'Quick Workout',subtitle:'Train now',icon:'zap',tone:'coral'},
    {id:'exerciseLibrary',title:'Exercise Library',subtitle:'Browse exercises',icon:'bookOpen',tone:'bluebg'},
    {id:'calendar',title:'Workout Calendar',subtitle:'History & streaks',icon:'calendar',tone:'limebg'},
    {id:'myStats',title:'My Stats',subtitle:'See your numbers',icon:'chart',tone:'goldbg'}
  ];

  const libraryState = { query:'', muscle:'All', equipment:'All' };

  function installStyles(){
    if(document.getElementById('sn70-styles')) return;
    const style=document.createElement('style');
    style.id='sn70-styles';
    style.textContent=`
      .sn70-quick-actions{margin:22px 0;position:relative;isolation:isolate}.sn70-head{margin:0 2px 10px}.sn70-head strong{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#2F6DF6}
      .sn70-quick-actions .tiles{margin:0}.sn70-quick-actions .tile{cursor:pointer;pointer-events:auto;position:relative;transition:transform .16s ease,box-shadow .16s ease}.sn70-quick-actions .tile:hover{transform:translateY(-2px);box-shadow:0 12px 24px rgba(20,25,35,.10)}.sn70-quick-actions .tile:active{transform:scale(.985)}
      .sn70-icon{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;background:rgba(255,255,255,.18);color:#fff}.sn70-quick-actions .limebg .sn70-icon{background:rgba(38,48,13,.10);color:#26300D}.sn70-quick-actions .goldbg .sn70-icon{background:rgba(62,44,3,.10);color:#3E2C03}.sn70-quick-actions .tile strong{margin-top:14px}
      .sn70-page{padding-bottom:28px}.sn70-top{display:flex;align-items:center;gap:12px;margin-bottom:18px}.sn70-back{width:42px;height:42px;border-radius:14px;border:1px solid var(--line);background:var(--surface);color:var(--text);display:grid;place-items:center}.sn70-top .eyebrow{margin:0}.sn70-top h1{font-size:30px;line-height:1.05;margin:4px 0 0;letter-spacing:-1px}
      .sn70-stat-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:14px}.sn70-stat{padding:16px}.sn70-stat span,.sn70-stat small{display:block}.sn70-stat span{font-size:10px;font-weight:800;color:#64748B;letter-spacing:.06em;text-transform:uppercase}.sn70-stat strong{font-size:27px;line-height:1.05;display:block;margin:7px 0 4px}.sn70-stat small{font-size:10px;color:var(--muted)}
      .sn70-section{padding:16px;margin-top:12px}.sn70-section h2{font-size:19px;margin:0 0 13px}.sn70-row{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:10px 0;border-top:1px solid var(--line)}.sn70-row:first-of-type{border-top:0}.sn70-row strong,.sn70-row small{display:block}.sn70-row strong{font-size:12px}.sn70-row small{font-size:9px;color:var(--muted);margin-top:2px}.sn70-empty{padding:22px 12px;text-align:center;color:var(--muted);font-size:12px}
      .sn75-library-page{padding-bottom:30px}.sn75-library-top{display:flex;align-items:center;gap:12px;margin-bottom:16px}.sn75-library-top h1{font-size:28px;line-height:1.05;margin:4px 0 0}.sn75-library-search{height:48px;border:1px solid var(--line);border-radius:14px;background:var(--surface);display:flex;align-items:center;gap:9px;padding:0 13px}.sn75-library-search input{border:0;outline:0;background:transparent;color:var(--text);width:100%;font:inherit}.sn75-library-filters{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:9px 0 13px}.sn75-library-filters select{min-height:42px;border:1px solid var(--line);border-radius:12px;background:var(--surface);color:var(--text);padding:0 11px;font:inherit;font-size:11px}.sn75-library-list{display:grid;gap:7px}.sn75-library-item{display:grid;grid-template-columns:42px 1fr auto;align-items:center;gap:10px;border:1px solid var(--line);border-radius:14px;background:var(--surface);color:var(--text);padding:10px;text-align:left}.sn75-library-item .sn75-library-icon{width:40px;height:40px;border-radius:11px;background:rgba(59,130,246,.08);color:var(--blue);display:grid;place-items:center}.sn75-library-item strong,.sn75-library-item small{display:block}.sn75-library-item strong{font-size:12px}.sn75-library-item small{font-size:9px;color:var(--muted);margin-top:3px}.sn75-library-item b{color:var(--blue)}
      @media(max-width:620px){.sn70-top h1{font-size:27px}.sn75-library-top h1{font-size:26px}}
    `;
    document.head.appendChild(style);
  }

  function enhanceHome(){
    const oldTiles=document.querySelector('.tiles');
    if(!oldTiles) return;
    let section=oldTiles.closest('.sn70-quick-actions');
    if(!section){
      section=document.createElement('section');
      section.className='sn70-quick-actions';
      oldTiles.replaceWith(section);
    }
    section.innerHTML=`<div class="sn70-head"><strong>Quick Actions</strong></div><div class="tiles">${actions.map(item=>`<button type="button" class="tile ${item.tone}" data-sn70-action="${item.id}" aria-label="${esc(item.title)} — ${esc(item.subtitle)}"><div class="sn70-icon">${icon(item.icon,28)}</div><strong>${esc(item.title)}</strong><span>${esc(item.subtitle)}</span></button>`).join('')}</div>`;
    section.querySelectorAll('[data-sn70-action]').forEach(btn=>{
      btn.onclick=event=>{
        event.preventDefault();
        openAction(btn.dataset.sn70Action);
      };
    });
  }

  function renderQuickWorkout(){
    const module=window.START_NOW_QUICK_WORKOUT;
    if(!module || typeof module.render!=='function'){
      console.error('[Quick Actions] Quick Workout module missing');
      showToast?.('Quick Workout could not open.');
      return false;
    }
    state.page='quickWorkout';
    try{
      module.render();
      const page=document.querySelector('#app .sn66-page');
      if(!page) throw new Error('Quick Workout did not mount');
      const cards=[...page.querySelectorAll('.sn66-mode')];
      const copy=[
        ['Build workout','Create a one-off workout'],
        ['Choose existing','Train one of your saved workouts'],
        ['Surprise me','Let START/NOW build one']
      ];
      cards.slice(0,3).forEach((card,index)=>{
        card.querySelector('strong')?.replaceChildren(copy[index][0]);
        card.querySelector('span:last-child')?.replaceChildren(copy[index][1]);
      });
      window.scrollTo({top:0,left:0,behavior:'auto'});
      return true;
    }catch(error){
      console.error('[Quick Actions] Quick Workout render failed',error);
      state.page='home';
      return false;
    }
  }

  function renderExerciseLibrary(){
    state.page='exerciseLibrary';
    const muscles=['All',...SN.unique(exerciseLibrary.map(ex=>ex.muscle)).sort()];
    const equipmentValues=['All',...SN.unique(exerciseLibrary.map(ex=>SN.equipment(ex))).sort()];
    const q=libraryState.query.trim().toLowerCase();
    const filtered=exerciseLibrary.filter(ex=>{
      const text=`${ex.name} ${ex.muscle} ${SN.equipment(ex)}`.toLowerCase();
      return (!q||text.includes(q)) &&
        (libraryState.muscle==='All'||ex.muscle===libraryState.muscle) &&
        (libraryState.equipment==='All'||SN.equipment(ex)===libraryState.equipment);
    });

    app.innerHTML=`<section class="sn75-library-page"><div class="sn75-library-top"><button type="button" class="sn70-back" id="sn75LibraryBack" aria-label="Back">${icon('arrowLeft',21,2.3)}</button><div><div class="eyebrow">EXERCISE LIBRARY</div><h1>Find an exercise</h1></div></div><label class="sn75-library-search">${icon('search',18)}<input id="sn75LibrarySearch" type="search" placeholder="Search exercise or muscle" value="${esc(libraryState.query)}"></label><div class="sn75-library-filters"><select id="sn75MuscleFilter">${muscles.map(value=>`<option ${value===libraryState.muscle?'selected':''}>${esc(value)}</option>`).join('')}</select><select id="sn75EquipmentFilter">${equipmentValues.map(value=>`<option ${value===libraryState.equipment?'selected':''}>${esc(value)}</option>`).join('')}</select></div><div class="sn75-library-list">${filtered.length?filtered.slice(0,180).map(ex=>`<button type="button" class="sn75-library-item" data-sn75-exercise="${esc(SN.exerciseId(ex))}"><span class="sn75-library-icon">${icon('bookOpen',19)}</span><span><strong>${esc(ex.name)}</strong><small>${esc(ex.muscle)} • ${esc(SN.equipment(ex))}</small></span><b>›</b></button>`).join(''):`<div class="card sn70-empty">No exercises match those filters.</div>`}</div></section>`;

    document.getElementById('sn75LibraryBack')?.addEventListener('click',()=>{
      state.page='home';
      render();
    });
    const search=document.getElementById('sn75LibrarySearch');
    search?.addEventListener('input',()=>{
      libraryState.query=search.value;
      renderExerciseLibrary();
      const next=document.getElementById('sn75LibrarySearch');
      next?.focus();
      next?.setSelectionRange?.(next.value.length,next.value.length);
    });
    document.getElementById('sn75MuscleFilter')?.addEventListener('change',event=>{
      libraryState.muscle=event.target.value;
      renderExerciseLibrary();
    });
    document.getElementById('sn75EquipmentFilter')?.addEventListener('change',event=>{
      libraryState.equipment=event.target.value;
      renderExerciseLibrary();
    });
    document.querySelectorAll('[data-sn75-exercise]').forEach(button=>button.addEventListener('click',()=>{
      const ex=exerciseLibrary.find(item=>SN.exerciseId(item)===button.dataset.sn75Exercise);
      if(ex && typeof SN.openExerciseDetail==='function') SN.openExerciseDetail(ex);
    }));
    window.scrollTo({top:0,left:0,behavior:'auto'});
    return true;
  }

  function openAction(id){
    if(id==='quickWorkout'){
      if(!renderQuickWorkout()){
        state.page='home';
        render();
      }
      return;
    }
    if(id==='exerciseLibrary'){
      renderExerciseLibrary();
      return;
    }
    if(id==='calendar'){
      state.page='calendar';
      render();
      return;
    }
    if(id==='myStats'){
      state.page='myStats';
      renderStats();
    }
  }

  function deriveBestLifts(sessions){
    const map=new Map();
    sessions.forEach(session=>(session.exercises||[]).forEach(ex=>{
      const weights=(ex.sets||[]).filter(set=>set.done).map(set=>Number(set.weight)||0);
      const best=Math.max(Number(ex.bestWeight)||0,...weights,0);
      if(!best) return;
      const key=ex.id||ex.name,current=map.get(key);
      if(!current||best>current.weight) map.set(key,{name:ex.name||'Exercise',weight:best});
    }));
    return [...map.values()].sort((a,b)=>b.weight-a.weight).slice(0,5);
  }

  function renderStats(){
    installStyles();
    const sessions=SN.sessions?.()||[];
    const minutes=sessions.reduce((s,x)=>s+(Number(x.durationMinutes)||0),0);
    const sets=sessions.reduce((s,x)=>s+(Number(x.completedSets)||0),0);
    const volume=sessions.reduce((s,x)=>s+(Number(x.volume)||0),0);
    const grades=sessions.map(s=>Number(s.grade)).filter(Number.isFinite);
    const avg=grades.length?Math.round(grades.reduce((a,b)=>a+b,0)/grades.length):null;
    const prs=sessions.reduce((s,x)=>s+(Array.isArray(x.prs)?x.prs.length:0),0);
    const streaks=window.START_NOW_WORKOUT_CALENDAR?.calculateStreaks?.()||{current:Number(state.streak)||0,longest:Number(localStorage.getItem(SN.keys?.bestStreak||'sn_best_streak_v36'))||0};
    const lifts=deriveBestLifts(sessions);
    app.innerHTML=`<section class="sn70-page"><div class="sn70-top"><button class="sn70-back" id="sn70Back" aria-label="Back">${icon('arrowLeft',21,2.3)}</button><div><div class="eyebrow">DETAILED NUMBERS</div><h1>My Stats</h1></div></div><div class="sn70-stat-grid"><div class="card sn70-stat"><span>Workouts completed</span><strong>${sessions.length}</strong><small>all logged sessions</small></div><div class="card sn70-stat"><span>Total training time</span><strong>${minutes}</strong><small>minutes</small></div><div class="card sn70-stat"><span>Total completed sets</span><strong>${sets}</strong><small>logged sets</small></div><div class="card sn70-stat"><span>Total volume</span><strong>${Math.round(volume).toLocaleString()}</strong><small>lb</small></div><div class="card sn70-stat"><span>Current streak</span><strong>${streaks.current}</strong><small>scheduled workouts</small></div><div class="card sn70-stat"><span>Longest streak</span><strong>${streaks.longest}</strong><small>scheduled workouts</small></div><div class="card sn70-stat"><span>Average workout grade</span><strong>${avg===null?'—':`${avg}%`}</strong><small>${grades.length?'logged grades':'no grade history yet'}</small></div><div class="card sn70-stat"><span>PRs recorded</span><strong>${prs}</strong><small>personal records</small></div></div><section class="card sn70-section"><h2>Strongest logged lifts</h2>${lifts.length?lifts.map(l=>`<div class="sn70-row"><span><strong>${esc(l.name)}</strong></span><b>${Math.round(l.weight)} lb</b></div>`).join(''):'<div class="sn70-empty">Complete weighted sets to build your strongest-lifts list.</div>'}</section></section>`;
    document.getElementById('sn70Back')?.addEventListener('click',()=>{state.page='home';render();});
    window.scrollTo({top:0,left:0,behavior:'auto'});
  }

  installStyles();

  const previousRender=window.render;
  window.render=function(...args){
    if(state.page==='quickWorkout'){
      renderQuickWorkout();
      return;
    }
    if(state.page==='exerciseLibrary'){
      renderExerciseLibrary();
      return;
    }
    if(state.page==='myStats'){
      renderStats();
      return;
    }
    const result=previousRender.apply(this,args);
    if(state.page==='home') enhanceHome();
    return result;
  };

  // Bottom center + uses the exact same modern Quick Workout renderer.
  const quickStart=document.getElementById('quickStart');
  if(quickStart){
    quickStart.addEventListener('click',event=>{
      event.preventDefault();
      event.stopImmediatePropagation();
      openAction('quickWorkout');
    },true);
  }

  if(state.page==='home') enhanceHome();
  window.START_NOW_QUICK_ACTIONS={
    version:'v75',
    actions,
    openAction,
    renderStats,
    renderExerciseLibrary,
    renderQuickWorkout
  };
})();
