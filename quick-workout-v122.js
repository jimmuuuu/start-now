// START/NOW v122 — Quick Workout with native per-exercise sets/reps editing.
(() => {
  const SN = window.SN36;
  const MEDIA = window.START_NOW_EXERCISE_MEDIA;
  if (!SN) return;

  const qw = {
    mode: null,
    selected: [],
    prescriptions: {},
    openPrescription: null,
    query: '',
    muscle: 'All',
    equipment: 'All',
    surprise: { time: '30', focus: 'Full body', equipment: 'Full gym', generated: null, actualFocus: null }
  };

  const esc = value => typeof escapeHtml === 'function'
    ? escapeHtml(String(value ?? ''))
    : String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  const ICONS = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    play: '<path d="m8 5 11 7-11 7z"/>',
    sparkles: '<path d="m12 3-1.2 3.2L7.5 7.5l3.3 1.3L12 12l1.2-3.2 3.3-1.3-3.3-1.3z"/><path d="m5 14-.8 2.1L2 17l2.2.9L5 20l.8-2.1L8 17l-2.2-.9zM19 13l-.9 2.4-2.4.9 2.4.9L19 20l.9-2.8 2.4-.9-2.4-.9z"/>',
    arrowLeft: '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    chevronUp: '<path d="m18 15-6-6-6 6"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    refresh: '<path d="M20 7h-5V2"/><path d="M20 7a8 8 0 1 0 1.2 7"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    sliders: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>'
  };

  function icon(name, size = 22, strokeWidth = 2.2) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.plus}</svg>`;
  }

  function clamp(value, min, max, fallback) {
    const n = Number(value);
    if (!Number.isFinite(n)) return fallback;
    return Math.max(min, Math.min(max, Math.round(n)));
  }

  function exerciseId(ex) {
    return String(ex?.id || SN.exerciseId(ex));
  }

  function equipment(ex) {
    return String(SN.meta?.(ex)?.equipment || ex.equipment || 'Gym');
  }

  function prescription(id, ex) {
    const saved = qw.prescriptions[id];
    if (saved) return saved;
    return {
      sets: clamp(ex?.sets, 1, 8, 3),
      reps: clamp(ex?.reps ?? ex?.repMax, 1, 50, 10)
    };
  }

  function setPrescription(id, key, value, ex) {
    const current = prescription(id, ex);
    qw.prescriptions[id] = {
      ...current,
      [key]: key === 'sets'
        ? clamp(value, 1, 8, current.sets)
        : clamp(value, 1, 50, current.reps)
    };
  }

  function applyPrescription(ex) {
    const id = exerciseId(ex);
    const values = prescription(id, ex);
    return {
      ...ex,
      sets: values.sets,
      reps: values.reps,
      repMin: values.reps,
      repMax: values.reps
    };
  }

  function installStyles() {
    if (document.getElementById('sn66-styles')) return;
    const style = document.createElement('style');
    style.id = 'sn66-styles';
    style.textContent = `
      .sn66-page{padding-bottom:28px}.sn66-top{display:flex;align-items:center;gap:12px;margin-bottom:18px}.sn66-back{width:42px;height:42px;border-radius:14px;border:1px solid var(--line);background:var(--surface);color:var(--text);display:grid;place-items:center}.sn66-top .eyebrow{margin:0}.sn66-top h1{font-size:30px;line-height:1.05;margin:4px 0 0;letter-spacing:-1px}
      .sn66-modes{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px}.sn66-mode{border:1px solid var(--line);background:var(--surface);border-radius:18px;padding:16px;text-align:left;color:var(--text);cursor:pointer;min-height:138px;transition:transform .15s ease,border-color .15s ease,background .15s ease}.sn66-mode:hover{transform:translateY(-1px)}.sn66-mode.active{border-color:#BFD6FF;background:#F7FAFF}.sn66-mode-icon{width:42px;height:42px;border-radius:13px;background:#EEF4FF;color:#2F6DF6;display:grid;place-items:center;margin-bottom:14px}.sn66-mode strong,.sn66-mode span{display:block}.sn66-mode strong{font-size:15px}.sn66-mode span{font-size:11px;color:var(--muted);margin-top:5px;line-height:1.35}
      .sn66-panel{padding:16px;margin-top:12px}.sn66-panel h2{font-size:20px;margin:0 0 5px}.sn66-panel>p{margin:0 0 14px;color:var(--muted);font-size:12px;line-height:1.45}
      .sn66-tools{display:grid;grid-template-columns:1fr 132px 150px;gap:8px;margin-bottom:10px}.sn66-search{display:flex;align-items:center;gap:8px;border:1px solid var(--line);border-radius:13px;padding:0 11px;background:var(--surface)}.sn66-search input,.sn66-tools select{width:100%;height:42px;border:0;background:transparent;color:var(--text);outline:0;font:inherit;font-size:16px;-webkit-text-size-adjust:100%}.sn66-tools select{border:1px solid var(--line);border-radius:13px;padding:0 9px;background:var(--surface)}
      .sn66-selected-list{display:grid;gap:7px;margin:12px 0}.sn66-selected-row{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:10px;align-items:center;border:1px solid var(--line);border-radius:14px;padding:10px 11px;background:var(--surface)}.sn66-selected-row.editing{border-color:#9FC3FF;background:#F8FBFF}.sn66-selected-main{min-width:0;border:0;background:transparent;color:var(--text);padding:0;text-align:left;cursor:pointer}.sn66-selected-main strong,.sn66-selected-main small,.sn66-selected-main em{display:block}.sn66-selected-main strong{font-size:12px}.sn66-selected-main small{font-size:9px;color:var(--muted);margin-top:3px}.sn66-selected-main em{font-style:normal;font-size:9px;color:#2F6DF6;font-weight:850;margin-top:5px}.sn66-order{display:flex;gap:5px}.sn66-order button{width:31px;height:31px;border-radius:9px;border:1px solid var(--line);background:#F7F9FB;color:#64748B;display:grid;place-items:center}.sn66-order button:disabled{opacity:.3}
      .sn66-rx-editor{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr auto;gap:9px;align-items:end;padding:11px;margin-top:2px;border-radius:12px;border:1px solid #D7E4F7;background:#F3F8FF}.sn66-rx-field{display:grid;gap:5px;font-size:9px;font-weight:850;text-transform:uppercase;letter-spacing:.04em;color:#667085}.sn66-stepper{display:grid;grid-template-columns:34px minmax(42px,1fr) 34px;align-items:center;overflow:hidden;border:1px solid var(--line);border-radius:10px;background:var(--surface)}.sn66-stepper button{height:36px;border:0;background:transparent;color:#2F6DF6;display:grid;place-items:center}.sn66-stepper input{width:100%;height:36px;border:0;border-left:1px solid var(--line);border-right:1px solid var(--line);background:transparent;color:var(--text);text-align:center;font:inherit;font-size:13px;font-weight:850;outline:0;-moz-appearance:textfield}.sn66-stepper input::-webkit-outer-spin-button,.sn66-stepper input::-webkit-inner-spin-button{-webkit-appearance:none;margin:0}.sn66-rx-done{height:38px;border:0;border-radius:10px;padding:0 14px;background:#2F6DF6;color:#fff;font-size:10px;font-weight:850}
      .sn66-results{display:grid;gap:6px;max-height:330px;overflow:auto}.sn66-ex-row{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:9px 2px;border-bottom:1px solid var(--line)}.sn66-ex-row strong,.sn66-ex-row small{display:block}.sn66-ex-row strong{font-size:12px}.sn66-ex-row small{font-size:9px;color:var(--muted);margin-top:3px}.sn66-add{width:34px;height:34px;border-radius:10px;border:1px solid #D5E3FA;background:#F4F8FF;color:#2F6DF6;display:grid;place-items:center}.sn66-add.added{background:#EEF7D9;border-color:#D7E9AD;color:#6E981C}
      .sn66-existing{display:grid;gap:9px}.sn66-existing-row{display:grid;grid-template-columns:40px 1fr auto;gap:11px;align-items:center;border:1px solid var(--line);border-radius:15px;background:var(--surface);padding:12px;text-align:left;color:var(--text)}.sn66-existing-icon{width:38px;height:38px;border-radius:12px;background:#F2F6FF;color:#2F6DF6;display:grid;place-items:center}.sn66-existing-row strong,.sn66-existing-row small{display:block}.sn66-existing-row strong{font-size:13px}.sn66-existing-row small{font-size:10px;color:var(--muted);margin-top:3px}.sn66-existing-row b{font-size:11px;color:#2F6DF6}
      .sn66-question{margin-top:15px}.sn66-question>strong{display:block;font-size:12px;margin-bottom:8px}.sn66-options{display:flex;flex-wrap:wrap;gap:7px}.sn66-option{border:1px solid var(--line);background:var(--surface);color:var(--text);border-radius:999px;padding:8px 11px;font-size:11px;font-weight:700}.sn66-option.active{border-color:#AFCBFF;background:#EEF5FF;color:#245AA8}.sn66-generate{width:100%;margin-top:17px;border:0;border-radius:15px;background:#2F6DF6;color:#fff;padding:14px 16px;font-size:14px;font-weight:800}.sn66-preview{margin-top:14px;border-top:1px solid var(--line);padding-top:14px}.sn66-preview-head{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:9px}.sn66-preview-head h3{font-size:17px;margin:0}.sn66-verified{font-size:9px;font-weight:800;color:#6C981B;background:#F1F8DD;border-radius:999px;padding:6px 8px}.sn66-preview-list{display:grid;gap:7px}.sn66-preview-row{display:grid;grid-template-columns:28px 1fr auto;align-items:center;gap:9px;border:1px solid var(--line);border-radius:13px;padding:9px 10px}.sn66-preview-num{width:26px;height:26px;border-radius:9px;background:#F3F6FA;display:grid;place-items:center;font-size:10px;font-weight:800}.sn66-preview-row strong,.sn66-preview-row small{display:block}.sn66-preview-row strong{font-size:11px}.sn66-preview-row small{font-size:9px;color:var(--muted);margin-top:2px}.sn66-preview-row b{font-size:9px;color:#6C981B}.sn66-preview-actions{display:grid;grid-template-columns:1fr 1.6fr;gap:8px;margin-top:10px}.sn66-secondary,.sn66-start{border-radius:13px;padding:12px 13px;font-size:12px;font-weight:800}.sn66-secondary{border:1px solid var(--line);background:var(--surface);color:var(--text);display:flex;justify-content:center;align-items:center;gap:6px}.sn66-start{border:0;background:#FF5A57;color:white}.sn66-start:disabled{opacity:.4}
      .sn66-empty{padding:22px 12px;text-align:center;color:var(--muted);font-size:12px}.sn66-save-card{margin-top:14px;padding:16px}.sn66-save-card h3{font-size:18px;margin:0 0 5px}.sn66-save-card p{font-size:11px;color:var(--muted);margin:0 0 12px}.sn66-save-actions{display:grid;grid-template-columns:1.4fr 1fr;gap:8px}.sn66-save-actions button{border-radius:13px;padding:11px 12px;font-size:11px;font-weight:800}.sn66-save-primary{border:0;background:#2F6DF6;color:#fff}.sn66-save-skip{border:1px solid var(--line);background:var(--surface);color:var(--text)}
      .dark .sn66-mode.active{background:#16253B}.dark .sn66-mode-icon,.dark .sn66-existing-icon,.dark .sn66-add{background:#1B2A42}.dark .sn66-order button{background:#24282D}.dark .sn66-selected-row.editing,.dark .sn66-rx-editor{background:#16253B;border-color:#29466C}
      @media(max-width:620px){.sn66-modes{grid-template-columns:1fr}.sn66-mode{min-height:0;display:grid;grid-template-columns:44px 1fr;column-gap:12px}.sn66-mode-icon{grid-row:1/3;margin:0}.sn66-tools{grid-template-columns:1fr}.sn66-top h1{font-size:27px}.sn66-preview-actions{grid-template-columns:1fr}.sn66-rx-editor{grid-template-columns:1fr 1fr}.sn66-rx-done{grid-column:1/-1;width:100%}}
    `;
    document.head.appendChild(style);
  }

  function verifiedForGenerator(ex) {
    if (!ex?.name || !ex?.muscle) return false;
    const meta = SN.meta?.(ex);
    if (!meta?.instructions) return false;
    return MEDIA?.resolve?.(ex, { quiet: true })?.status === 'ready';
  }

  function equipmentMatches(ex, choice) {
    const value = equipment(ex).toLowerCase();
    if (choice === 'Full gym') return true;
    if (choice === 'Machines') return /machine|smith|cable/.test(value);
    if (choice === 'Dumbbells') return /dumbbell/.test(value);
    if (choice === 'Bodyweight') return /bodyweight/.test(value);
    return true;
  }

  const FOCUS_MUSCLES = {
    'Upper body': new Set(['Chest','Back','Shoulders','Rear Delts','Biceps','Triceps','Traps']),
    'Lower body': new Set(['Legs','Quads','Hamstrings','Glutes','Calves']),
    'Push': new Set(['Chest','Shoulders','Triceps']),
    'Pull': new Set(['Back','Rear Delts','Biceps','Traps']),
    'Legs': new Set(['Legs','Quads','Hamstrings','Glutes','Calves'])
  };

  function focusMatches(ex, focus) {
    if (focus === 'Full body' || focus === 'Surprise me') return true;
    return FOCUS_MUSCLES[focus]?.has(ex.muscle) || false;
  }

  function shuffle(array) {
    const out = [...array];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  function diversifiedPick(candidates, count, focus) {
    const selected = [];
    const usedIds = new Set();
    const add = ex => {
      const id = exerciseId(ex);
      if (!id || usedIds.has(id) || selected.length >= count) return;
      usedIds.add(id);
      selected.push(ex);
    };

    if (focus === 'Full body') {
      const buckets = [
        candidates.filter(ex => ['Chest','Shoulders','Triceps'].includes(ex.muscle)),
        candidates.filter(ex => ['Back','Rear Delts','Biceps','Traps'].includes(ex.muscle)),
        candidates.filter(ex => ['Legs','Quads','Hamstrings','Glutes','Calves'].includes(ex.muscle))
      ];
      buckets.forEach(bucket => add(shuffle(bucket)[0]));
    } else {
      const byMuscle = new Map();
      candidates.forEach(ex => {
        if (!byMuscle.has(ex.muscle)) byMuscle.set(ex.muscle, []);
        byMuscle.get(ex.muscle).push(ex);
      });
      shuffle([...byMuscle.values()]).forEach(bucket => add(shuffle(bucket)[0]));
    }
    shuffle(candidates).forEach(add);
    return selected.slice(0, count);
  }

  function generatedWorkout() {
    const surpriseFocuses = ['Full body','Upper body','Lower body','Push','Pull','Legs'];
    const actualFocus = qw.surprise.focus === 'Surprise me'
      ? surpriseFocuses[Math.floor(Math.random() * surpriseFocuses.length)]
      : qw.surprise.focus;
    const count = ({'15':3,'30':4,'45':5,'60+':6})[qw.surprise.time] || 4;
    const sets = qw.surprise.time === '15' ? 2 : 3;
    const candidates = exerciseLibrary.filter(ex => verifiedForGenerator(ex) && equipmentMatches(ex, qw.surprise.equipment) && focusMatches(ex, actualFocus));
    const picked = diversifiedPick(candidates, count, actualFocus).map(ex => ({...ex, sets:Math.min(sets, Math.max(1, Number(ex.sets) || sets))}));
    qw.surprise.actualFocus = actualFocus;
    qw.surprise.generated = picked;
    return picked;
  }

  function startQuick(workout, source) {
    if (!workout?.exercises?.length || typeof startWorkout !== 'function') return;
    const copy = {
      ...workout,
      id:`quick-${source}-${Date.now()}`,
      days:[],
      builtIn:false,
      exercises:workout.exercises.map(ex => ({...ex}))
    };
    startWorkout(copy);
  }

  function selectedExercises() {
    return qw.selected.map(id => exerciseLibrary.find(ex => exerciseId(ex) === id)).filter(Boolean);
  }

  function filteredBuildExercises() {
    const q = qw.query.trim().toLowerCase();
    return exerciseLibrary.filter(ex => (!q || `${ex.name} ${ex.muscle} ${equipment(ex)}`.toLowerCase().includes(q)) && (qw.muscle === 'All' || ex.muscle === qw.muscle) && (qw.equipment === 'All' || equipment(ex) === qw.equipment));
  }

  function renderBuildResults(filtered = filteredBuildExercises()) {
    return filtered.slice(0,120).map(ex => {
      const id = exerciseId(ex);
      const added = qw.selected.includes(id);
      return `<div class="sn66-ex-row"><div><strong>${esc(ex.name)}</strong><small>${esc(ex.muscle)} • ${esc(equipment(ex))}</small></div><button class="sn66-add ${added?'added':''}" data-add="${esc(id)}" aria-label="${added?'Added':'Add'} ${esc(ex.name)}">${added?icon('check',16,2.5):icon('plus',16)}</button></div>`;
    }).join('');
  }

  function prescriptionEditor(ex, id) {
    const values = prescription(id, ex);
    return `<div class="sn66-rx-editor" data-rx-editor="${esc(id)}">
      <label class="sn66-rx-field">Sets<span class="sn66-stepper"><button type="button" data-rx-step="sets" data-delta="-1">${icon('minus',15)}</button><input type="number" min="1" max="8" inputmode="numeric" value="${values.sets}" data-rx-input="sets" aria-label="Sets for ${esc(ex.name)}"><button type="button" data-rx-step="sets" data-delta="1">${icon('plus',15)}</button></span></label>
      <label class="sn66-rx-field">Reps<span class="sn66-stepper"><button type="button" data-rx-step="reps" data-delta="-1">${icon('minus',15)}</button><input type="number" min="1" max="50" inputmode="numeric" value="${values.reps}" data-rx-input="reps" aria-label="Reps for ${esc(ex.name)}"><button type="button" data-rx-step="reps" data-delta="1">${icon('plus',15)}</button></span></label>
      <button type="button" class="sn66-rx-done" data-rx-done>Done</button>
    </div>`;
  }

  function selectedRow(ex, i, total) {
    const id = exerciseId(ex);
    const values = prescription(id, ex);
    const open = qw.openPrescription === id;
    return `<div class="sn66-selected-row ${open?'editing':''}" data-selected-id="${esc(id)}">
      <button type="button" class="sn66-selected-main" data-edit-prescription="${esc(id)}" aria-expanded="${open?'true':'false'}">
        <strong>${i+1}. ${esc(ex.name)}</strong>
        <small>${esc(ex.muscle)} • ${esc(equipment(ex))}</small>
        <em>${values.sets} sets × ${values.reps} reps • Tap to edit</em>
      </button>
      <div class="sn66-order">
        <button data-move="up" data-id="${esc(id)}" ${i===0?'disabled':''} aria-label="Move ${esc(ex.name)} up">${icon('chevronUp',15)}</button>
        <button data-move="down" data-id="${esc(id)}" ${i===total-1?'disabled':''} aria-label="Move ${esc(ex.name)} down">${icon('chevronDown',15)}</button>
        <button data-remove="${esc(id)}" aria-label="Remove ${esc(ex.name)}">${icon('x',15)}</button>
      </div>
      ${open ? prescriptionEditor(ex,id) : ''}
    </div>`;
  }

  function bindBuildAddButtons() {
    document.querySelectorAll('.sn66-results [data-add]').forEach(btn => btn.addEventListener('click', () => {
      const id = btn.dataset.add;
      if (!qw.selected.includes(id)) {
        qw.selected.push(id);
        const ex = exerciseLibrary.find(item => exerciseId(item) === id);
        if (ex && !qw.prescriptions[id]) qw.prescriptions[id] = prescription(id, ex);
      }
      renderQuickWorkout();
    }));
  }

  function refreshBuildResults() {
    const results = document.querySelector('.sn66-results');
    if (!results) return;
    results.innerHTML = renderBuildResults();
    bindBuildAddButtons();
  }

  function renderBuild() {
    const muscles = ['All', ...[...new Set(exerciseLibrary.map(ex => ex.muscle).filter(Boolean))].sort()];
    const equipments = ['All', ...[...new Set(exerciseLibrary.map(equipment).filter(Boolean))].sort()];
    const filtered = filteredBuildExercises();
    const selected = selectedExercises();
    return `<section class="card sn66-panel"><h2>Create workout</h2><p>Add the exercises you want, reorder them, then start when you're ready. Tap a selected exercise to choose its sets and reps. This workout stays separate from your weekly schedule.</p><div class="sn66-tools"><label class="sn66-search">${icon('search',17)}<input id="sn66Search" type="search" inputmode="search" enterkeyhint="search" autocomplete="off" autocorrect="off" spellcheck="false" placeholder="Search exercises" value="${esc(qw.query)}"></label><select id="sn66Muscle">${muscles.map(m=>`<option ${m===qw.muscle?'selected':''}>${esc(m)}</option>`).join('')}</select><select id="sn66Equipment">${equipments.map(v=>`<option ${v===qw.equipment?'selected':''}>${esc(v)}</option>`).join('')}</select></div>${selected.length?`<div class="sn66-selected-list">${selected.map((ex,i)=>selectedRow(ex,i,selected.length)).join('')}</div>`:''}<div class="sn66-results">${renderBuildResults(filtered)}</div><button class="sn66-start" id="sn66StartBuild" ${selected.length?'':'disabled'}>Start Workout</button></section>`;
  }

  function renderExisting() {
    const saved = state.customWorkouts || [];
    return `<section class="card sn66-panel"><h2>Choose existing</h2><p>Train one of your saved workouts now without changing its normal schedule.</p>${saved.length?`<div class="sn66-existing">${saved.map(w=>`<button class="sn66-existing-row" data-existing="${esc(String(w.id))}"><span class="sn66-existing-icon">${icon('play',17)}</span><span><strong>${esc(w.name)}</strong><small>${w.exercises?.length || 0} exercises • ${(w.days||[]).length ? esc(w.days.join(', ')) : 'Not scheduled'}</small></span><b>Start →</b></button>`).join('')}</div>`:`<div class="sn66-empty">You don't have any saved workouts yet. Use <strong>Create workout</strong> to make a one-off session.</div>`}</section>`;
  }

  function optionButtons(values, current, key) {
    return `<div class="sn66-options">${values.map(value=>`<button class="sn66-option ${value===current?'active':''}" data-surprise-key="${key}" data-surprise-value="${esc(value)}">${esc(value)}</button>`).join('')}</div>`;
  }

  function renderSurprise() {
    const generated = qw.surprise.generated || [];
    return `<section class="card sn66-panel"><h2>Surprise me</h2><p>Level Up Fitness will build a beginner-friendly quick session using only exercises that already have verified exercise data and approved media.</p><div class="sn66-question"><strong>How much time do you have?</strong>${optionButtons(['15','30','45','60+'],qw.surprise.time,'time')}</div><div class="sn66-question"><strong>What do you want to train?</strong>${optionButtons(['Full body','Upper body','Lower body','Push','Pull','Legs','Surprise me'],qw.surprise.focus,'focus')}</div><div class="sn66-question"><strong>What equipment do you have?</strong>${optionButtons(['Full gym','Machines','Dumbbells','Bodyweight'],qw.surprise.equipment,'equipment')}</div><button class="sn66-generate" id="sn66Generate">${generated.length?'Generate another workout':'Generate workout'}</button>${generated.length?`<div class="sn66-preview"><div class="sn66-preview-head"><h3>${esc(qw.surprise.actualFocus)} Quick Workout</h3><span class="sn66-verified">Verified media only</span></div><div class="sn66-preview-list">${generated.map((ex,i)=>`<div class="sn66-preview-row"><span class="sn66-preview-num">${i+1}</span><div><strong>${esc(ex.name)}</strong><small>${esc(ex.muscle)} • ${esc(equipment(ex))} • ${ex.sets} sets</small></div><b>MEDIA ✓</b></div>`).join('')}</div><div class="sn66-preview-actions"><button class="sn66-secondary" id="sn66Shuffle">${icon('refresh',15)} Shuffle again</button><button class="sn66-start" id="sn66StartSurprise">Start ${esc(qw.surprise.actualFocus)} Workout</button></div></div>`:`<div class="sn66-empty" id="sn66SurpriseEmpty"></div>`}</section>`;
  }

  function renderQuickWorkout() {
    installStyles();
    app.innerHTML = `<section class="sn66-page"><div class="sn66-top"><button class="sn66-back" id="sn66Back" aria-label="Back">${icon('arrowLeft',21,2.3)}</button><div><div class="eyebrow">TRAIN NOW</div><h1>Quick Workout</h1></div></div><div class="sn66-modes"><button class="sn66-mode ${qw.mode==='build'?'active':''}" data-mode="build"><span class="sn66-mode-icon">${icon('plus',22)}</span><strong>Create workout</strong><span>Build a one-off session</span></button><button class="sn66-mode ${qw.mode==='existing'?'active':''}" data-mode="existing"><span class="sn66-mode-icon">${icon('play',22)}</span><strong>Saved workouts</strong><span>Start one of your saved workouts</span></button><button class="sn66-mode ${qw.mode==='surprise'?'active':''}" data-mode="surprise"><span class="sn66-mode-icon">${icon('sparkles',22)}</span><strong>Quick pick</strong><span>Let Level Up Fitness build one for you</span></button></div>${qw.mode==='build'?renderBuild():qw.mode==='existing'?renderExisting():qw.mode==='surprise'?renderSurprise():''}</section>`;

    document.getElementById('sn66Back')?.addEventListener('click',()=>{ state.page='home'; render(); });
    document.querySelectorAll('[data-mode]').forEach(btn=>btn.addEventListener('click',()=>{ qw.mode=btn.dataset.mode; qw.openPrescription=null; renderQuickWorkout(); }));

    if (qw.mode === 'build') {
      const search = document.getElementById('sn66Search');
      if (search) search.addEventListener('input',()=>{ qw.query=search.value; refreshBuildResults(); });
      document.getElementById('sn66Muscle')?.addEventListener('change',e=>{ qw.muscle=e.target.value; renderQuickWorkout(); });
      document.getElementById('sn66Equipment')?.addEventListener('change',e=>{ qw.equipment=e.target.value; renderQuickWorkout(); });
      bindBuildAddButtons();

      document.querySelectorAll('[data-edit-prescription]').forEach(btn=>btn.addEventListener('click',()=>{
        const id=btn.dataset.editPrescription;
        qw.openPrescription=qw.openPrescription===id?null:id;
        renderQuickWorkout();
      }));

      document.querySelectorAll('[data-rx-step]').forEach(btn=>btn.addEventListener('click',()=>{
        const editor=btn.closest('[data-rx-editor]');
        const id=editor?.dataset.rxEditor;
        const ex=exerciseLibrary.find(item=>exerciseId(item)===id);
        if(!id||!ex)return;
        const key=btn.dataset.rxStep;
        const current=prescription(id,ex);
        setPrescription(id,key,current[key]+Number(btn.dataset.delta||0),ex);
        renderQuickWorkout();
      }));

      document.querySelectorAll('[data-rx-input]').forEach(input=>input.addEventListener('change',()=>{
        const editor=input.closest('[data-rx-editor]');
        const id=editor?.dataset.rxEditor;
        const ex=exerciseLibrary.find(item=>exerciseId(item)===id);
        if(!id||!ex)return;
        setPrescription(id,input.dataset.rxInput,input.value,ex);
        renderQuickWorkout();
      }));

      document.querySelectorAll('[data-rx-done]').forEach(btn=>btn.addEventListener('click',()=>{
        qw.openPrescription=null;
        renderQuickWorkout();
      }));

      document.querySelectorAll('[data-remove]').forEach(btn=>btn.addEventListener('click',()=>{
        const id=btn.dataset.remove;
        qw.selected=qw.selected.filter(item=>item!==id);
        delete qw.prescriptions[id];
        if(qw.openPrescription===id)qw.openPrescription=null;
        renderQuickWorkout();
      }));

      document.querySelectorAll('[data-move]').forEach(btn=>btn.addEventListener('click',()=>{
        const id=btn.dataset.id,index=qw.selected.indexOf(id),delta=btn.dataset.move==='up'?-1:1,next=index+delta;
        if(index<0||next<0||next>=qw.selected.length)return;
        [qw.selected[index],qw.selected[next]]=[qw.selected[next],qw.selected[index]];
        renderQuickWorkout();
      }));

      document.getElementById('sn66StartBuild')?.addEventListener('click',()=>{
        const exercises=selectedExercises().map(applyPrescription);
        if(exercises.length) startQuick({name:'Quick Workout',exercises},'manual');
      });
    }

    if (qw.mode === 'existing') {
      document.querySelectorAll('[data-existing]').forEach(btn=>btn.addEventListener('click',()=>{
        const workout=(state.customWorkouts||[]).find(w=>String(w.id)===btn.dataset.existing);
        if(workout) startQuick(workout,'existing');
      }));
    }

    if (qw.mode === 'surprise') {
      document.querySelectorAll('[data-surprise-key]').forEach(btn=>btn.addEventListener('click',()=>{
        qw.surprise[btn.dataset.surpriseKey]=btn.dataset.surpriseValue;
        qw.surprise.generated=null;
        qw.surprise.actualFocus=null;
        renderQuickWorkout();
      }));
      const generate = () => {
        const picked=generatedWorkout();
        renderQuickWorkout();
        if(!picked.length){
          const empty=document.getElementById('sn66SurpriseEmpty');
          if(empty) empty.textContent='There are not enough verified exercises for those filters yet. Try Full gym or a broader training focus.';
        }
      };
      document.getElementById('sn66Generate')?.addEventListener('click',generate);
      document.getElementById('sn66Shuffle')?.addEventListener('click',generate);
      document.getElementById('sn66StartSurprise')?.addEventListener('click',()=>{
        const exercises=(qw.surprise.generated||[]).map(ex=>({...ex}));
        if(exercises.length) startQuick({name:`${qw.surprise.actualFocus} Quick Workout`,exercises},'surprise');
      });
    }
  }

  function latestQuickSession() {
    const latest = [...(SN.sessions?.() || [])].sort((a,b)=>Number(b.timestamp)-Number(a.timestamp))[0];
    if (!latest || Date.now()-Number(latest.timestamp) > 10*60*1000) return null;
    return /^quick-(manual|surprise)-/.test(String(latest.workoutId || '')) ? latest : null;
  }

  function saveQuickSession(session) {
    const exercises = (session.exercises || []).map(logged => {
      const base = exerciseLibrary.find(ex => SN.exerciseId(ex) === logged.id || String(ex.id) === String(logged.id));
      if (!base) return null;
      const firstDone = (logged.sets || []).find(set => set.done);
      return { ...base, sets:Math.max(1,Number(logged.plannedSets)||Number(base.sets)||3), reps:Number(logged.repMax)||Number(base.reps)||10, weight:Number(firstDone?.weight ?? base.weight ?? 0) };
    }).filter(Boolean);
    if (!exercises.length) return false;
    const workout = { id:`saved-quick-${Date.now()}`, name:session.workoutName || 'Quick Workout', builtIn:false, days:[], exercises };
    state.customWorkouts.push(workout);
    if (typeof saveCustomWorkouts === 'function') saveCustomWorkouts();
    else localStorage.setItem('sn_custom_workouts',JSON.stringify(state.customWorkouts));
    return true;
  }

  function enhanceSummary() {
    if (state.page !== 'summary' || document.querySelector('.sn66-save-card')) return;
    const session = latestQuickSession();
    if (!session) return;
    const card = document.createElement('section');
    card.className = 'card sn66-save-card';
    card.innerHTML = `<h3>Save this workout?</h3><p>Keep this quick workout in My Workouts. Saving it will not add it to your weekly schedule.</p><div class="sn66-save-actions"><button class="sn66-save-primary" id="sn66SaveQuick">Save to My Workouts</button><button class="sn66-save-skip" id="sn66SkipSave">Not now</button></div>`;
    document.querySelector('#app')?.appendChild(card);
    document.getElementById('sn66SaveQuick')?.addEventListener('click',()=>{
      if(saveQuickSession(session)) card.innerHTML='<h3>Saved to My Workouts</h3><p>You can schedule it later from the Workouts tab if you want.</p>';
    });
    document.getElementById('sn66SkipSave')?.addEventListener('click',()=>card.remove());
  }

  installStyles();
  const priorRender = window.render;
  window.render = function(...args) {
    if (state.page === 'quickWorkout') { navActive?.(); renderQuickWorkout(); return; }
    const result = priorRender.apply(this,args);
    enhanceSummary();
    return result;
  };

  if (state.page === 'quickWorkout') renderQuickWorkout();
  window.START_NOW_QUICK_WORKOUT = {
    version:'v122',
    render:renderQuickWorkout,
    generate:generatedWorkout,
    prescription:(id)=>qw.prescriptions[String(id)] || null
  };
})();
