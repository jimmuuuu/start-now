// START/NOW v32 — make the anatomy image load reliably across browsers.
(() => {
  const SOURCES = [
    "https://jimmuuuu.github.io/start-now/assets/muscle_anatomy_base.webp?v=32",
    "https://cdn.jsdelivr.net/gh/jimmuuuu/start-now@main/assets/muscle_anatomy_base.webp",
    "https://github.com/jimmuuuu/start-now/raw/refs/heads/main/assets/muscle_anatomy_base.webp"
  ];

  function attach(img) {
    if (!img || img.dataset.snFallbackReady === "1") return;
    img.dataset.snFallbackReady = "1";
    let index = 0;

    const tryNext = () => {
      if (index >= SOURCES.length) {
        img.style.display = "none";
        return;
      }
      img.src = SOURCES[index++];
    };

    img.addEventListener("error", tryNext);
    img.addEventListener("load", () => {
      img.style.display = "block";
      const overlay = img.parentElement?.querySelector(".sn-anatomy-overlay");
      if (overlay) overlay.style.display = "block";
    });

    tryNext();
  }

  function apply() {
    document.querySelectorAll(".sn-anatomy-img").forEach(attach);
  }

  apply();
  const observer = new MutationObserver(apply);
  observer.observe(document.documentElement, { childList: true, subtree: true });
})();
