// START/NOW v36 — redraw once after every enhancement is installed.
(() => {
  try {
    window.SN36?.syncStats?.();
    render();
    document.documentElement.dataset.startNowVersion = "product-v36";
  } catch (error) {
    console.error("Level Up Fitness v36 bootstrap failed", error);
    const toastNode = document.getElementById("toast");
    if (toastNode) {
      toastNode.textContent = "Level Up Fitness had trouble loading an upgrade. Refresh once to retry.";
      toastNode.classList.add("show");
      setTimeout(() => toastNode.classList.remove("show"), 5000);
    }
  }
})();
