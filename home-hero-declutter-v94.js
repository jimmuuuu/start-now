// Removes extra hero subtitle copy so Home stays focused across all account states.
(() => {
  if (typeof renderHome !== "function") return;

  const previousRenderHome = renderHome;
  renderHome = function () {
    previousRenderHome();
    document.querySelector(".hero-copy p")?.remove();
  };

  if (window.state?.page === "home") render?.();
})();
