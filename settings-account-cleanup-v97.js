// Keeps Settings/Profile quieter for signed-in users while cloud backup continues in the background.
(() => {
  function removeSignedInBackupCard() {
    if (!window.SN_CLOUD_USER) return;
    document.getElementById("snAccountCard")?.remove();
  }

  const appRoot = document.getElementById("app");
  if (appRoot) {
    new MutationObserver(removeSignedInBackupCard).observe(appRoot, { childList: true, subtree: true });
  }

  removeSignedInBackupCard();
})();
