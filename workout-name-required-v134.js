// START/NOW v134 — user-created quick workouts must be named by the user.
(() => {
  const originalStartWorkout = window.startWorkout;
  if (typeof originalStartWorkout !== 'function') return;

  let pending = null;
  let modal = null;

  function isQuickWorkoutThatNeedsName(workout) {
    if (!workout || workout.builtIn === true || workout.__snUserNamed === true) return false;

    const id = String(workout.id || '');
    const name = String(workout.name || '').trim();

    // Any unnamed user-created workout must be named before it starts.
    if (!name) return true;

    // Quick Workout currently supplies automatic labels such as "Quick Workout"
    // and "Full body Quick Workout". Those are app-generated, not user-chosen.
    return /^quick-(manual|surprise)-/i.test(id);
  }

  function installStyles() {
    if (document.getElementById('sn134-workout-name-styles')) return;
    const style = document.createElement('style');
    style.id = 'sn134-workout-name-styles';
    style.textContent = `
      .sn134-name-backdrop{position:fixed;inset:0;z-index:10050;display:grid;place-items:center;padding:20px;background:rgba(15,23,42,.48);backdrop-filter:blur(5px)}
      .sn134-name-backdrop[hidden]{display:none!important}
      .sn134-name-modal{width:min(100%,430px);border:1px solid var(--line,#E7E7E3);border-radius:24px;background:var(--surface,#fff);color:var(--text,#171717);box-shadow:0 24px 70px rgba(15,23,42,.24);padding:22px}
      .sn134-name-kicker{display:block;margin-bottom:6px;color:#3B82F6;font-size:11px;font-weight:900;letter-spacing:.09em;text-transform:uppercase}
      .sn134-name-modal h2{margin:0;font-size:25px;line-height:1.08;letter-spacing:-.6px}
      .sn134-name-modal p{margin:9px 0 18px;color:var(--muted,#73767C);font-size:13px;line-height:1.45}
      .sn134-name-label{display:grid;gap:7px;font-size:11px;font-weight:850;color:var(--text,#171717)}
      .sn134-name-input{width:100%;box-sizing:border-box;height:50px;border:1px solid var(--line,#D9DCE2);border-radius:14px;padding:0 14px;background:var(--surface,#fff);color:var(--text,#171717);font:inherit;font-size:16px;font-weight:700;outline:none;-webkit-text-size-adjust:100%}
      .sn134-name-input:focus{border-color:#7BA7FF;box-shadow:0 0 0 3px rgba(59,130,246,.12)}
      .sn134-name-error{min-height:18px;margin:7px 0 0!important;color:#D92D20!important;font-size:11px!important;font-weight:750}
      .sn134-name-actions{display:grid;grid-template-columns:1fr 1.5fr;gap:9px;margin-top:13px}
      .sn134-name-actions button{min-height:46px;border-radius:14px;font:inherit;font-size:13px;font-weight:850;cursor:pointer}
      .sn134-name-cancel{border:1px solid var(--line,#D9DCE2);background:var(--surface,#fff);color:var(--text,#171717)}
      .sn134-name-start{border:0;background:linear-gradient(135deg,#FF5A5F,#FF3D44);color:#fff;box-shadow:0 10px 22px rgba(255,90,95,.2)}
      .dark .sn134-name-modal,.dark .sn134-name-input,.dark .sn134-name-cancel{background:#202327}
      @media(max-width:520px){.sn134-name-backdrop{align-items:end;padding:12px}.sn134-name-modal{border-radius:22px}.sn134-name-actions{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function ensureModal() {
    installStyles();
    if (modal?.isConnected) return modal;

    modal = document.createElement('div');
    modal.className = 'sn134-name-backdrop';
    modal.id = 'sn134WorkoutNameModal';
    modal.hidden = true;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'sn134WorkoutNameTitle');
    modal.innerHTML = `
      <section class="sn134-name-modal">
        <span class="sn134-name-kicker">NEW WORKOUT</span>
        <h2 id="sn134WorkoutNameTitle">Name your workout</h2>
        <p>Choose the name you want to see on Home, in your history, and anywhere this workout appears.</p>
        <label class="sn134-name-label" for="sn134WorkoutName">
          Workout name
          <input class="sn134-name-input" id="sn134WorkoutName" maxlength="40" autocomplete="off" placeholder="Example: Saturday Push" />
        </label>
        <p class="sn134-name-error" id="sn134WorkoutNameError" aria-live="polite"></p>
        <div class="sn134-name-actions">
          <button type="button" class="sn134-name-cancel" id="sn134CancelName">Cancel</button>
          <button type="button" class="sn134-name-start" id="sn134StartNamed">Start Workout →</button>
        </div>
      </section>
    `;
    document.body.appendChild(modal);

    const input = modal.querySelector('#sn134WorkoutName');
    const error = modal.querySelector('#sn134WorkoutNameError');

    function close() {
      modal.hidden = true;
      pending = null;
      input.value = '';
      error.textContent = '';
    }

    function submit() {
      if (!pending) return;
      const name = input.value.trim();
      if (!name) {
        error.textContent = 'Enter a workout name to continue.';
        input.focus();
        return;
      }

      const { workout, args, thisArg } = pending;
      const namedWorkout = {
        ...workout,
        name,
        __snUserNamed: true
      };

      modal.hidden = true;
      pending = null;
      input.value = '';
      error.textContent = '';
      originalStartWorkout.call(thisArg || window, namedWorkout, ...args);
    }

    modal.querySelector('#sn134CancelName').addEventListener('click', close);
    modal.querySelector('#sn134StartNamed').addEventListener('click', submit);
    input.addEventListener('input', () => {
      if (input.value.trim()) error.textContent = '';
    });
    input.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault();
        submit();
      }
    });
    modal.addEventListener('keydown', event => {
      if (event.key === 'Escape') close();
    });

    return modal;
  }

  function requestName(workout, args, thisArg) {
    const node = ensureModal();
    const input = node.querySelector('#sn134WorkoutName');
    const error = node.querySelector('#sn134WorkoutNameError');
    pending = { workout, args, thisArg };
    input.value = '';
    error.textContent = '';
    node.hidden = false;
    requestAnimationFrame(() => input.focus());
  }

  window.startWorkout = function(workout, ...args) {
    if (isQuickWorkoutThatNeedsName(workout)) {
      requestName(workout, args, this);
      return false;
    }
    return originalStartWorkout.call(this, workout, ...args);
  };

  window.START_NOW_WORKOUT_NAMING = {
    version: 'v134',
    needsName: isQuickWorkoutThatNeedsName,
    open: workout => requestName(workout, [], window)
  };
})();
