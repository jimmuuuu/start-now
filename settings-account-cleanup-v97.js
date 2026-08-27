// Keeps Settings/Profile quiet without interrupting the cloud account renderer.
(() => {
  const style = document.createElement("style");
  style.textContent = "#snAccountCard, .sn-legal-links { display: none !important; }";
  document.head.appendChild(style);

  // Clear the duplicate nodes produced by the previous cleanup script once.
  function clearLegacyDuplicates() {
    document.querySelectorAll("#snAccountCard, .sn-legal-links").forEach(node => node.remove());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", clearLegacyDuplicates, { once: true });
  } else {
    clearLegacyDuplicates();
  }
})();
