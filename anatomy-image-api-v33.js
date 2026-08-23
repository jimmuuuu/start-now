// START/NOW v33 — load anatomy artwork through GitHub's public API and convert it to an in-page data URL.
(() => {
  const API_URL = "https://api.github.com/repos/jimmuuuu/start-now/contents/assets/muscle_anatomy_base.webp?ref=main";
  let dataUrlPromise = null;

  function getDataUrl() {
    if (dataUrlPromise) return dataUrlPromise;
    dataUrlPromise = fetch(API_URL, { headers: { Accept: "application/vnd.github+json" } })
      .then(response => {
        if (!response.ok) throw new Error(`GitHub image request failed: ${response.status}`);
        return response.json();
      })
      .then(payload => {
        if (!payload?.content) throw new Error("GitHub image content was empty");
        const base64 = payload.content.replace(/\s/g, "");
        return `data:image/webp;base64,${base64}`;
      });
    return dataUrlPromise;
  }

  async function attach(img) {
    if (!img || img.dataset.snApiImage === "1") return;
    img.dataset.snApiImage = "1";
    try {
      const dataUrl = await getDataUrl();
      img.onerror = null;
      img.src = dataUrl;
      img.style.display = "block";
      const overlay = img.parentElement?.querySelector(".sn-anatomy-overlay");
      if (overlay) overlay.style.display = "block";
    } catch (error) {
      console.error("START/NOW anatomy image failed to load", error);
      img.dataset.snApiImage = "0";
    }
  }

  function apply() {
    document.querySelectorAll(".sn-anatomy-img").forEach(attach);
  }

  apply();
  new MutationObserver(apply).observe(document.documentElement, { childList: true, subtree: true });
})();
