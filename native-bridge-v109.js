(() => {
  function isNative() {
    return Boolean(window.Capacitor?.isNativePlatform?.() || window.Capacitor?.getPlatform?.() === "android");
  }

  function clickFirst(selector) {
    const button = document.querySelector(selector);
    if (!button || button.offsetParent === null) return false;
    button.click();
    return true;
  }

  function closeTopModal() {
    const modal = document.querySelector("#snProductModal, .sn-modal-backdrop");
    if (!modal) return false;
    const close = modal.querySelector("[data-close], .sn-auth-close, button[aria-label='Close']");
    if (close) close.click();
    else modal.remove();
    return true;
  }

  function goHome() {
    if (typeof state === "undefined" || typeof render !== "function") return false;
    if (state.page === "home") return false;
    state.page = "home";
    render();
    return true;
  }

  async function handleBackButton() {
    if (closeTopModal()) return;
    if (clickFirst("#snBack, .sn63-back, #sn70Back, #sn86StatsBack, #exitWorkout")) return;
    if (goHome()) return;
    await window.Capacitor?.Plugins?.App?.exitApp?.();
  }

  function start() {
    if (!isNative()) return;
    window.Capacitor?.Plugins?.App?.addListener?.("backButton", handleBackButton);
    document.documentElement.classList.add("sn-native");
  }

  window.START_NOW_NATIVE = { handleBackButton, isNative };
  start();
})();
