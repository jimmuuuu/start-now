// Keeps Home focused by removing repeated filler copy across account states.
(() => {
  if (typeof renderHome !== "function") return;

  function cleanHomeCopy() {
    document.querySelector(".hero-copy p")?.remove();
    document.querySelector("#app > .tip")?.remove();
  }

  const previousRenderHome = renderHome;
  renderHome = function () {
    previousRenderHome();
    cleanHomeCopy();
  };

  if (window.state?.page === "home") render?.();
})();
