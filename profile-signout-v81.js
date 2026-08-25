// START/NOW v81 — profile sign-out action.
(() => {
  const priorProfile = window.renderProfile;
  if (typeof priorProfile !== "function") return;

  function ensureStyles(){
    if (document.getElementById("snProfileSignOutStyles")) return;
    const style = document.createElement("style");
    style.id = "snProfileSignOutStyles";
    style.textContent = `
      .sn-profile-signout-wrap{margin:18px 0 34px;padding:0 2px}
      .sn-profile-signout{
        width:100%;min-height:54px;border-radius:16px;border:1px solid rgba(255,90,95,.28);
        background:rgba(255,90,95,.08);color:#ff5a5f;font:inherit;font-weight:800;font-size:15px;
        display:flex;align-items:center;justify-content:center;gap:9px;cursor:pointer;
        transition:transform .15s ease,background .15s ease,border-color .15s ease;
      }
      .sn-profile-signout:hover{background:rgba(255,90,95,.12);border-color:rgba(255,90,95,.45)}
      .sn-profile-signout:active{transform:scale(.99)}
      .sn-profile-signout svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      .dark .sn-profile-signout{background:rgba(255,90,95,.10)}
    `;
    document.head.appendChild(style);
  }

  async function signOut(){
    if (!window.confirm("Sign out of START/NOW?")) return;

    try {
      // Use a real auth client automatically when one is connected to the app.
      if (window.supabase?.auth?.signOut) {
        const result = await window.supabase.auth.signOut();
        if (result?.error) throw result.error;
        window.location.reload();
        return;
      }
      if (window.SN_AUTH?.signOut) {
        await window.SN_AUTH.signOut();
        window.location.reload();
        return;
      }

      // START/NOW is currently running as a local-only prototype with no auth provider.
      // Do not delete workout/history data just to simulate a sign-out.
      window.showToast?.("Account sign-out will work once login is connected.");
    } catch (error) {
      console.error("START/NOW sign out failed", error);
      window.showToast?.("Couldn’t sign out. Try again.");
    }
  }

  window.renderProfile = function(...args){
    const result = priorProfile.apply(this, args);
    ensureStyles();
    const root = document.getElementById("app");
    if (!root || root.querySelector("#snSignOut")) return result;

    const wrap = document.createElement("div");
    wrap.className = "sn-profile-signout-wrap";
    wrap.innerHTML = `
      <button class="sn-profile-signout" id="snSignOut" type="button">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M10 17l5-5-5-5"></path>
          <path d="M15 12H3"></path>
          <path d="M14 3h4a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-4"></path>
        </svg>
        <span>Sign out</span>
      </button>`;
    root.appendChild(wrap);
    wrap.querySelector("#snSignOut").addEventListener("click", signOut);
    return result;
  };
})();
