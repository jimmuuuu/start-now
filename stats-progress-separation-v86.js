// START/NOW v86 — make My Stats and Progress intentionally different products.
// My Stats = lifetime record book. Progress = change over time and period comparisons.
(() => {
  if (typeof state === 'undefined' || typeof render !== 'function') return;

  const PROGRESS_KEY = 'sn_progress_sessions';
  const DAY = 24 * 60 * 60 * 1000;
  const ALLOWED_WINDOWS = [7, 30, 90];

  const esc = value => typeof escapeHtml === 'function'
    ? escapeHtml(String(value ?? ''))
    : String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));

  function loadSessions() {
    try {
      const rows = JSON.parse(localStorage.getItem(PROGRESS_KEY));
      return (Array.isArray(rows) ? rows : [])
        .filter(row => Number.isFinite(Number(row?.timestamp)))
        .sort((a, b) => Number(a.timestamp) - Number(b.timestamp));
    } catch {
      return [];
    }
  }

  function n(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  }

  function sum(rows, getter) {
    return rows.reduce((total, row) => total + n(getter(row)), 0);
  }

  function average(rows, getter) {
    if (!rows.length) return null;
    const values = rows.map(getter).map(Number).filter(Number.isFinite);
    if (!values.length) return null;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  function fmt(value) {
    return Math.round(n(value)).toLocaleString();
  }

  function fmtMinutes(value) {
    const minutes = Math.round(n(value));
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest ? `${hours}h ${rest}m` : `${hours}h`;
  }

  function gradeLetter(score) {
    if (score === null || !Number.isFinite(Number(score))) return '—';
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  function dateLabel(timestamp) {
    return new Date(Number(timestamp)).toLocaleDateString(undefined, {month:'short', day:'numeric'});
  }

  function getScheduledTarget() {
    try {
      const days = new Set((state.customWorkouts || []).flatMap(workout => workout.days || []));
      return days.size || 4;
    } catch {
      return 4;
    }
  }

  function rowsInWindow(rows, days, previous = false) {
    const end = Date.now() - (previous ? days * DAY : 0);
    const start = end - days * DAY;
    return rows.filter(row => {
      const timestamp = Number(row.timestamp);
      return timestamp >= start && timestamp < end;
    });
  }

  function percentChange(current, previous) {
    current = n(current);
    previous = n(previous);
    if (previous === 0) return current === 0 ? 0 : null;
    return ((current - previous) / previous) * 100;
  }

  function deltaMarkup(change, mode = 'percent') {
    if (change === null || !Number.isFinite(Number(change))) {
      return '<span class="sn86-delta neutral">new baseline</span>';
    }
    const rounded = Math.round(change);
    if (rounded === 0) return '<span class="sn86-delta neutral">no change</span>';
    const positive = rounded > 0;
    const symbol = positive ? '↑' : '↓';
    const text = mode === 'points' ? `${Math.abs(rounded)} pts` : `${Math.abs(rounded)}%`;
    return `<span class="sn86-delta ${positive ? 'up' : 'down'}">${symbol} ${text}</span>`;
  }

  function lastSevenDays(rows) {
    const today = new Date();
    const result = [];
    for (let offset = 6; offset >= 0; offset--) {
      const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset);
      const start = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
      const end = start + DAY;
      const count = rows.filter(row => Number(row.timestamp) >= start && Number(row.timestamp) < end).length;
      result.push({
        label: date.toLocaleDateString(undefined, {weekday:'narrow'}),
        full: date.toLocaleDateString(undefined, {weekday:'short', month:'short', day:'numeric'}),
        count,
        today: offset === 0
      });
    }
    return result;
  }

  function muscleTotals(rows) {
    const totals = new Map();
    rows.forEach(session => (session.exercises || []).forEach(exercise => {
      const muscle = exercise.muscle || 'Other';
      totals.set(muscle, (totals.get(muscle) || 0) + n(exercise.completedSets));
    }));
    return [...totals.entries()].sort((a, b) => b[1] - a[1]);
  }

  function bestLifts(rows) {
    const map = new Map();
    rows.forEach(session => (session.exercises || []).forEach(exercise => {
      const completedWeights = (exercise.sets || [])
        .filter(set => set?.done)
        .map(set => n(set.weight));
      const best = Math.max(n(exercise.bestWeight), ...completedWeights, 0);
      if (!best) return;
      const key = exercise.id || exercise.name || 'exercise';
      const current = map.get(key);
      if (!current || best > current.weight) {
        map.set(key, {
          name: exercise.name || 'Exercise',
          muscle: exercise.muscle || 'Other',
          weight: best,
          timestamp: Number(session.timestamp)
        });
      }
    }));
    return [...map.values()].sort((a, b) => b.weight - a.weight);
  }

  function installStyles() {
    if (document.getElementById('sn86-separation-styles')) return;
    const style = document.createElement('style');
    style.id = 'sn86-separation-styles';
    style.textContent = `
      .sn86-purpose{margin:-5px 0 18px;color:var(--muted);font-size:12px;line-height:1.5;max-width:430px}
      .sn86-range{display:flex;gap:6px;padding:4px;border:1px solid var(--line);border-radius:14px;background:var(--surface);width:max-content;margin:-4px 0 16px}
      .sn86-range button{border:0;background:transparent;color:var(--muted);font-weight:800;font-size:11px;padding:8px 11px;border-radius:10px}
      .sn86-range button.active{background:var(--text);color:var(--surface)}
      .sn86-change-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}
      .sn86-change-card{padding:15px;min-height:118px}.sn86-change-card>span:first-child{display:block;font-size:10px;font-weight:900;letter-spacing:.07em;text-transform:uppercase;color:var(--muted)}
      .sn86-change-card strong{display:block;font-size:27px;line-height:1.05;margin:10px 0 8px;letter-spacing:-.7px}.sn86-change-card strong small{font-size:12px;color:var(--muted);letter-spacing:0}
      .sn86-delta{display:inline-flex;align-items:center;width:max-content;border-radius:999px;padding:5px 8px;font-size:10px;font-weight:900}.sn86-delta.up{background:#EEF8DD;color:#628C15}.sn86-delta.down{background:#FFF0F0;color:#C94B50}.sn86-delta.neutral{background:#F0F1F2;color:#747980}
      .sn86-comparison-note{font-size:10px;color:var(--muted);margin:0 0 12px}
      .sn86-trend-card{padding:17px;margin-top:14px}.sn86-trend-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.sn86-trend-head h2{font-size:19px;margin:3px 0 0}.sn86-trend-head span{font-size:10px;color:var(--muted);font-weight:700}
      .sn86-mini-chart{height:160px;display:grid;grid-auto-flow:column;grid-auto-columns:minmax(34px,1fr);gap:8px;align-items:end;margin-top:16px;padding-top:12px;border-top:1px solid var(--line);overflow-x:auto}
      .sn86-bar-wrap{height:132px;display:grid;grid-template-rows:1fr auto;gap:7px;align-items:end;justify-items:center;min-width:34px}.sn86-bar-track{width:100%;max-width:36px;height:104px;border-radius:10px;background:#F0F1ED;display:flex;align-items:flex-end;overflow:hidden}.sn86-bar-fill{width:100%;min-height:6px;border-radius:9px 9px 0 0;background:linear-gradient(180deg,#78A9FF,#3B82F6)}.sn86-bar-fill.coral{background:linear-gradient(180deg,#FF8A8D,var(--coral))}.sn86-bar-wrap small{font-size:9px;color:var(--muted);font-weight:700}
      .sn86-change-list{display:grid;margin-top:12px}.sn86-change-row{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;padding:11px 0;border-top:1px solid var(--line)}.sn86-change-row:first-child{border-top:0}.sn86-change-row strong{display:block;font-size:12px}.sn86-change-row small{display:block;margin-top:3px;font-size:10px;color:var(--muted)}
      .sn86-baseline{margin-top:14px;padding:13px 14px;border-radius:14px;background:#F4F7FB;color:#546171;font-size:12px;line-height:1.5}
      .sn86-lifetime-banner{padding:15px 16px;border:1px solid var(--line);border-radius:16px;background:var(--surface);margin:-3px 0 14px}.sn86-lifetime-banner strong{display:block;font-size:12px}.sn86-lifetime-banner span{display:block;color:var(--muted);font-size:10px;margin-top:4px;line-height:1.45}
      .sn86-stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.sn86-stat-card{padding:15px;min-height:108px}.sn86-stat-card span{display:block;font-size:9px;font-weight:900;letter-spacing:.07em;text-transform:uppercase;color:var(--muted)}.sn86-stat-card strong{display:block;font-size:26px;line-height:1.05;margin:9px 0 5px}.sn86-stat-card small{display:block;color:var(--muted);font-size:9px}
      .sn86-section{padding:16px;margin-top:12px}.sn86-section h2{font-size:18px;margin:0 0 12px}.sn86-record-row{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;padding:10px 0;border-top:1px solid var(--line)}.sn86-record-row:first-of-type{border-top:0}.sn86-record-row strong,.sn86-record-row small{display:block}.sn86-record-row strong{font-size:12px}.sn86-record-row small{font-size:9px;color:var(--muted);margin-top:3px}.sn86-record-row b{font-size:13px}
      .sn86-average-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.sn86-average{padding:11px;border:1px solid var(--line);border-radius:13px;text-align:center;background:var(--surface)}.sn86-average strong{display:block;font-size:18px}.sn86-average span{display:block;margin-top:4px;font-size:9px;color:var(--muted)}
      .sn86-grade-dist{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}.sn86-grade-box{border:1px solid var(--line);border-radius:12px;padding:10px 5px;text-align:center}.sn86-grade-box strong{display:block;font-size:18px}.sn86-grade-box span{font-size:9px;color:var(--muted)}
      .sn86-empty{padding:20px 10px;text-align:center;color:var(--muted);font-size:11px}
      .dark .sn86-range button.active{background:#F4F4F1;color:#121314}.dark .sn86-delta.up{background:#1D2A18;color:#B8DC83}.dark .sn86-delta.down{background:#311C1E;color:#FF9EA2}.dark .sn86-delta.neutral{background:#25282B;color:#A6AAB0}.dark .sn86-bar-track{background:#24272A}.dark .sn86-baseline{background:#18202A;color:#B9C4D1}
      @media(max-width:390px){.sn86-change-card strong,.sn86-stat-card strong{font-size:23px}.sn86-average-grid{grid-template-columns:1fr}.sn86-grade-dist{gap:4px}}
    `;
    document.head.appendChild(style);
  }

  function progressSummary(current, previous, metrics) {
    if (!current.length) return 'No workouts are logged in this time window yet. Finish a workout and this page will start measuring change.';
    if (!previous.length) return 'You are building your first comparison baseline. Once another full period is logged, START/NOW will show what changed.';

    const workoutChange = metrics.workoutChange;
    const gradeChange = metrics.gradeChange;
    const volumeChange = metrics.volumeChange;

    if (gradeChange !== null && gradeChange >= 3 && workoutChange !== null && workoutChange >= 0) {
      return 'Workout quality is trending up while your training frequency is holding steady or improving.';
    }
    if (workoutChange !== null && workoutChange > 10 && volumeChange !== null && volumeChange > 10) {
      return 'You are training more often and logging more total work than in the previous period.';
    }
    if (workoutChange !== null && workoutChange < -10 && gradeChange !== null && gradeChange > 0) {
      return 'You logged fewer workouts, but your average workout grade improved. Use both signals when judging the period.';
    }
    return 'Your progress is mixed across the period. Use the comparisons below to see exactly what moved instead of relying on one total number.';
  }

  function renderProgressSeparated() {
    installStyles();
    const all = loadSessions();
    const requested = Number(state.__sn86ProgressWindow || 30);
    const days = ALLOWED_WINDOWS.includes(requested) ? requested : 30;
    state.__sn86ProgressWindow = days;

    const current = rowsInWindow(all, days, false);
    const previous = rowsInWindow(all, days, true);
    const currentVolume = sum(current, row => row.volume);
    const previousVolume = sum(previous, row => row.volume);
    const currentGrade = average(current, row => row.grade);
    const previousGrade = average(previous, row => row.grade);
    const currentAvgVolume = current.length ? currentVolume / current.length : 0;
    const previousAvgVolume = previous.length ? previousVolume / previous.length : 0;

    const workoutChange = percentChange(current.length, previous.length);
    const volumeChange = percentChange(currentVolume, previousVolume);
    const gradeChange = currentGrade !== null && previousGrade !== null ? currentGrade - previousGrade : null;
    const avgVolumeChange = percentChange(currentAvgVolume, previousAvgVolume);

    const target = getScheduledTarget();
    const weekRows = rowsInWindow(all, 7, false);
    const adherence = Math.min(100, Math.round((weekRows.length / Math.max(1, target)) * 100));
    const weekDays = lastSevenDays(all);
    const muscles = muscleTotals(current).slice(0, 6);
    const muscleSetTotal = muscles.reduce((total, [, sets]) => total + sets, 0) || 1;
    const recent = current.slice(-8);
    const maxVolume = Math.max(1, ...recent.map(row => n(row.volume)));

    const metrics = {workoutChange, volumeChange, gradeChange, avgVolumeChange};

    app.innerHTML = `
      <div class="topbar"><div class="logo">START/<span>NOW</span></div><button class="avatar" data-go="profile">MG</button></div>
      <div class="progress-title-row">
        <div><div class="eyebrow">TRENDS & CHANGE</div><h1 class="page-title compact-title">Progress</h1></div>
        <div class="progress-grade-pill"><strong>${days}</strong><span>DAY VIEW</span></div>
      </div>
      <p class="sn86-purpose">Progress answers one question: <strong>how is your training changing?</strong> Everything here is tied to a time window or comparison—not lifetime totals.</p>

      <div class="sn86-range" aria-label="Progress time range">
        ${ALLOWED_WINDOWS.map(option => `<button type="button" class="${option === days ? 'active' : ''}" data-sn86-window="${option}">${option}D</button>`).join('')}
      </div>
      <p class="sn86-comparison-note">Comparing the latest ${days} days with the ${days} days immediately before them.</p>

      <section class="sn86-change-grid">
        <div class="card sn86-change-card"><span>Workout frequency</span><strong>${current.length}<small> sessions</small></strong>${deltaMarkup(workoutChange)}</div>
        <div class="card sn86-change-card"><span>Training volume</span><strong>${fmt(currentVolume)}<small> lb</small></strong>${deltaMarkup(volumeChange)}</div>
        <div class="card sn86-change-card"><span>Avg workout grade</span><strong>${currentGrade === null ? '—' : `${Math.round(currentGrade)}%`}</strong>${deltaMarkup(gradeChange, 'points')}</div>
        <div class="card sn86-change-card"><span>Volume per workout</span><strong>${fmt(currentAvgVolume)}<small> lb</small></strong>${deltaMarkup(avgVolumeChange)}</div>
      </section>

      <section class="card progress-section-card consistency-card">
        <div class="progress-section-head"><div><span class="section-kicker lime">CONSISTENCY</span><h2>Weekly pace</h2></div><div class="progress-ring-small" style="--progress:${adherence * 3.6}deg"><span>${adherence}%</span></div></div>
        <div class="activity-week">
          ${weekDays.map(day => `<div class="activity-day ${day.count ? 'active' : ''} ${day.today ? 'today' : ''}" title="${esc(day.full)}"><div class="activity-dot">${day.count ? '✓' : ''}</div><span>${esc(day.label)}</span></div>`).join('')}
        </div>
        <p class="sn86-baseline">${esc(progressSummary(current, previous, metrics))}</p>
      </section>

      <section class="card sn86-trend-card">
        <div class="sn86-trend-head"><div><span class="section-kicker blue">TRAINING LOAD</span><h2>Volume trend</h2></div><span>last ${recent.length} in window</span></div>
        ${recent.length ? `<div class="sn86-mini-chart" aria-label="Training volume trend">${recent.map(row => {
          const height = Math.max(6, Math.round((n(row.volume) / maxVolume) * 100));
          return `<div class="sn86-bar-wrap" title="${fmt(row.volume)} lb"><div class="sn86-bar-track"><div class="sn86-bar-fill" style="height:${height}%"></div></div><small>${dateLabel(row.timestamp)}</small></div>`;
        }).join('')}</div>` : '<div class="sn86-empty">No workout volume in this period yet.</div>'}
      </section>

      <section class="card sn86-trend-card">
        <div class="sn86-trend-head"><div><span class="section-kicker coral-text">WORKOUT QUALITY</span><h2>Grade trend</h2></div><span>session by session</span></div>
        ${recent.length ? `<div class="sn86-mini-chart" aria-label="Workout grade trend">${recent.map(row => {
          const grade = Math.max(0, Math.min(100, n(row.grade)));
          return `<div class="sn86-bar-wrap" title="${grade}%"><div class="sn86-bar-track"><div class="sn86-bar-fill coral" style="height:${Math.max(6, grade)}%"></div></div><small>${dateLabel(row.timestamp)}</small></div>`;
        }).join('')}</div>` : '<div class="sn86-empty">No workout grades in this period yet.</div>'}
      </section>

      <section class="card progress-section-card">
        <div class="progress-section-head"><div><span class="section-kicker gold">TRAINING BALANCE</span><h2>Muscle focus</h2></div><span class="section-meta">selected period</span></div>
        ${muscles.length ? `<div class="muscle-progress-list">${muscles.map(([muscle, sets]) => {
          const share = Math.round((sets / muscleSetTotal) * 100);
          return `<div class="muscle-progress-row"><div class="muscle-progress-label"><span>${esc(muscle)}</span><strong>${share}% of sets</strong></div><div class="muscle-progress-track"><div class="muscle-progress-fill" style="width:${share}%"></div></div></div>`;
        }).join('')}</div>` : '<div class="sn86-empty">Log completed sets to see how your training is distributed.</div>'}
      </section>

      <section class="card progress-section-card">
        <div class="progress-section-head"><div><span class="section-kicker blue">PERIOD COMPARISON</span><h2>What changed</h2></div><span class="section-meta">vs previous ${days}D</span></div>
        <div class="sn86-change-list">
          <div class="sn86-change-row"><div><strong>Workout frequency</strong><small>${current.length} now vs ${previous.length} before</small></div>${deltaMarkup(workoutChange)}</div>
          <div class="sn86-change-row"><div><strong>Total training volume</strong><small>${fmt(currentVolume)} lb now vs ${fmt(previousVolume)} lb before</small></div>${deltaMarkup(volumeChange)}</div>
          <div class="sn86-change-row"><div><strong>Average workout quality</strong><small>${currentGrade === null ? '—' : `${Math.round(currentGrade)}%`} now vs ${previousGrade === null ? '—' : `${Math.round(previousGrade)}%`} before</small></div>${deltaMarkup(gradeChange, 'points')}</div>
        </div>
        <p class="progress-helper">A higher training volume is not automatically better. This screen shows change so you can judge it alongside workout quality and consistency.</p>
      </section>
    `;

    document.querySelectorAll('[data-sn86-window]').forEach(button => {
      button.addEventListener('click', () => {
        state.__sn86ProgressWindow = Number(button.dataset.sn86Window);
        renderProgressSeparated();
        window.scrollTo({top:0, left:0, behavior:'auto'});
      });
    });

    if (typeof bindCommon === 'function') bindCommon();
  }

  function renderStatsSeparated() {
    installStyles();
    const rows = loadSessions();
    const totalMinutes = sum(rows, row => row.durationMinutes);
    const totalSets = sum(rows, row => row.completedSets);
    const totalVolume = sum(rows, row => row.volume);
    const avgGrade = average(rows, row => row.grade);
    const bestGrade = rows.length ? Math.max(...rows.map(row => n(row.grade))) : null;
    const lifts = bestLifts(rows);
    const muscles = muscleTotals(rows).slice(0, 5);
    const uniqueExercises = new Set(rows.flatMap(row => (row.exercises || []).map(exercise => exercise.id || exercise.name).filter(Boolean))).size;
    const streaks = window.START_NOW_WORKOUT_CALENDAR?.calculateStreaks?.() || {
      current: n(state.streak),
      longest: n(localStorage.getItem('sn_best_streak_v36'))
    };

    const avgMinutes = rows.length ? totalMinutes / rows.length : 0;
    const avgSets = rows.length ? totalSets / rows.length : 0;
    const avgVolume = rows.length ? totalVolume / rows.length : 0;
    const distribution = {A:0, B:0, C:0, D:0, F:0};
    rows.forEach(row => {
      const letter = gradeLetter(n(row.grade));
      if (Object.prototype.hasOwnProperty.call(distribution, letter)) distribution[letter] += 1;
    });

    app.innerHTML = `
      <section class="sn70-page">
        <div class="sn70-top"><button type="button" class="sn70-back" id="sn86StatsBack" aria-label="Back">←</button><div><div class="eyebrow">LIFETIME RECORD</div><h1>My Stats</h1></div></div>
        <p class="sn86-purpose">My Stats is your <strong>all-time record book</strong>: totals, averages, bests, and records. It does not try to tell you whether you are improving.</p>
        <div class="sn86-lifetime-banner"><strong>All-time logged data</strong><span>No 7-day or 30-day window. No comparison with a previous period. These numbers accumulate for as long as you use START/NOW.</span></div>

        <div class="sn86-stat-grid">
          <div class="card sn86-stat-card"><span>Total workouts</span><strong>${rows.length}</strong><small>all logged sessions</small></div>
          <div class="card sn86-stat-card"><span>Total training time</span><strong>${fmtMinutes(totalMinutes)}</strong><small>lifetime time logged</small></div>
          <div class="card sn86-stat-card"><span>Total completed sets</span><strong>${fmt(totalSets)}</strong><small>lifetime sets</small></div>
          <div class="card sn86-stat-card"><span>Lifetime volume</span><strong>${fmt(totalVolume)}</strong><small>lb logged</small></div>
          <div class="card sn86-stat-card"><span>Average grade</span><strong>${avgGrade === null ? '—' : `${Math.round(avgGrade)}%`}</strong><small>across all workouts</small></div>
          <div class="card sn86-stat-card"><span>Best workout grade</span><strong>${bestGrade === null ? '—' : `${Math.round(bestGrade)}%`}</strong><small>all-time best session</small></div>
          <div class="card sn86-stat-card"><span>Longest streak</span><strong>${n(streaks.longest)}</strong><small>all-time scheduled streak</small></div>
          <div class="card sn86-stat-card"><span>Exercises tracked</span><strong>${uniqueExercises}</strong><small>unique logged exercises</small></div>
        </div>

        <section class="card sn86-section">
          <h2>Per-workout averages</h2>
          <div class="sn86-average-grid">
            <div class="sn86-average"><strong>${Math.round(avgMinutes)}m</strong><span>time / workout</span></div>
            <div class="sn86-average"><strong>${Math.round(avgSets)}</strong><span>sets / workout</span></div>
            <div class="sn86-average"><strong>${fmt(avgVolume)}</strong><span>volume / workout</span></div>
          </div>
        </section>

        <section class="card sn86-section">
          <h2>All-time strongest logged lifts</h2>
          ${lifts.length ? lifts.slice(0, 5).map(lift => `<div class="sn86-record-row"><div><strong>${esc(lift.name)}</strong><small>${esc(lift.muscle)} • best logged ${dateLabel(lift.timestamp)}</small></div><b>${fmt(lift.weight)} lb</b></div>`).join('') : '<div class="sn86-empty">Complete weighted sets to build your all-time lift records.</div>'}
        </section>

        <section class="card sn86-section">
          <h2>Workout grade distribution</h2>
          <div class="sn86-grade-dist">
            ${Object.entries(distribution).map(([letter, count]) => `<div class="sn86-grade-box"><strong>${letter}</strong><span>${count} workout${count === 1 ? '' : 's'}</span></div>`).join('')}
          </div>
        </section>

        <section class="card sn86-section">
          <h2>Most trained muscle groups — all time</h2>
          ${muscles.length ? muscles.map(([muscle, sets]) => `<div class="sn86-record-row"><div><strong>${esc(muscle)}</strong><small>completed sets across all history</small></div><b>${fmt(sets)} sets</b></div>`).join('') : '<div class="sn86-empty">Complete workouts to build your lifetime muscle-group totals.</div>'}
        </section>
      </section>
    `;

    document.getElementById('sn86StatsBack')?.addEventListener('click', () => {
      state.page = 'home';
      render();
      window.scrollTo({top:0, left:0, behavior:'auto'});
    });
  }

  installStyles();

  // Progress is now a trend/comparison screen rather than a second stats dashboard.
  window.renderProgress = renderProgressSeparated;

  // Intercept My Stats after all older render wrappers so the lifetime record-book version owns the route.
  const previousRender = window.render;
  window.render = function(...args) {
    if (state.page === 'myStats') {
      try {
        if (typeof navActive === 'function') navActive();
        renderStatsSeparated();
        return;
      } catch (error) {
        console.error('[START/NOW v86] Stats separation failed; falling back.', error);
      }
    }

    const result = previousRender.apply(this, args);
    if (state.page === 'home') {
      const statsSubtitle = document.querySelector('[data-sn70-action="myStats"] span:last-child');
      if (statsSubtitle) statsSubtitle.textContent = 'Lifetime records';
    }
    return result;
  };

  window.START_NOW_STATS_PROGRESS_V86 = {
    version:'v86',
    renderProgress:renderProgressSeparated,
    renderStats:renderStatsSeparated
  };
})();
