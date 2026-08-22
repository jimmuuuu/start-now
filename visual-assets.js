// Clearer workout visuals for START/NOW: a recognizable chest-press machine and a cleaner muscle-focus figure.
(() => {
  function installVisualStyles() {
    if (document.getElementById("sn-visual-styles")) return;
    const style = document.createElement("style");
    style.id = "sn-visual-styles";
    style.textContent = `
      .machine-art{height:170px;display:flex;align-items:flex-end;justify-content:center;position:relative;z-index:1}
      .sn-machine-wrap{width:100%;height:100%;display:flex;align-items:flex-end;justify-content:center}
      .sn-machine-svg{width:100%;max-width:235px;height:100%;overflow:visible}
      .body-visual{display:flex;align-items:center;justify-content:center;min-height:220px}
      .sn-body-wrap{width:100%;max-width:170px;margin:auto;position:relative}
      .sn-body-svg{display:block;width:100%;height:auto;overflow:visible}
      .sn-body-label{margin-top:6px;text-align:center;color:var(--muted);font-size:10px;font-weight:800;letter-spacing:.04em}
      .dark .sn-machine-svg,.dark .sn-body-svg{filter:drop-shadow(0 8px 18px rgba(0,0,0,.24))}
    `;
    document.head.appendChild(style);
  }

  function machineMarkup() {
    return `
      <div class="sn-machine-wrap" aria-label="Chest press machine">
        <svg class="sn-machine-svg" viewBox="0 0 270 215" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Chest press gym machine">
          <defs>
            <linearGradient id="snMetal" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#f5f6f8"/><stop offset=".32" stop-color="#bec5cd"/><stop offset=".58" stop-color="#f8f9fa"/><stop offset="1" stop-color="#8f98a3"/>
            </linearGradient>
            <linearGradient id="snPad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#34383d"/><stop offset="1" stop-color="#121417"/>
            </linearGradient>
            <filter id="snShadow" x="-30%" y="-30%" width="160%" height="180%"><feDropShadow dx="0" dy="9" stdDeviation="8" flood-color="#000" flood-opacity=".25"/></filter>
          </defs>
          <ellipse cx="139" cy="197" rx="92" ry="10" fill="#000" opacity=".16"/>
          <g filter="url(#snShadow)">
            <path d="M55 184 H104" stroke="#8d949d" stroke-width="10" stroke-linecap="round"/>
            <path d="M165 184 H220" stroke="#8d949d" stroke-width="10" stroke-linecap="round"/>
            <rect x="72" y="52" width="12" height="134" rx="6" fill="url(#snMetal)"/>
            <rect x="181" y="29" width="12" height="157" rx="6" fill="url(#snMetal)"/>
            <path d="M78 48 C103 17 157 13 187 34" fill="none" stroke="url(#snMetal)" stroke-width="12" stroke-linecap="round"/>
            <path d="M82 62 C112 38 151 34 181 47" fill="none" stroke="#9da5ae" stroke-width="3" opacity=".7"/>

            <rect x="105" y="92" width="13" height="88" rx="6" fill="url(#snMetal)"/>
            <rect x="117" y="145" width="53" height="11" rx="5" fill="#8c939c"/>
            <rect x="121" y="119" width="39" height="61" rx="10" fill="url(#snPad)"/>
            <rect x="118" y="83" width="34" height="46" rx="9" fill="url(#snPad)"/>

            <rect x="197" y="78" width="28" height="91" rx="5" fill="#30343a"/>
            <g fill="#17191c">
              <rect x="199" y="84" width="24" height="10" rx="2"/><rect x="199" y="97" width="24" height="10" rx="2"/><rect x="199" y="110" width="24" height="10" rx="2"/><rect x="199" y="123" width="24" height="10" rx="2"/><rect x="199" y="136" width="24" height="10" rx="2"/><rect x="199" y="149" width="24" height="10" rx="2"/>
            </g>
            <rect x="208" y="61" width="4" height="112" rx="2" fill="#aeb5bd"/>
            <rect x="201" y="151" width="7" height="9" rx="2" fill="#FF5A5F"/>

            <path d="M83 55 L63 98" stroke="url(#snMetal)" stroke-width="9" stroke-linecap="round"/>
            <path d="M185 47 L207 91" stroke="url(#snMetal)" stroke-width="9" stroke-linecap="round"/>
            <path d="M65 98 H39" stroke="#202328" stroke-width="8" stroke-linecap="round"/>
            <path d="M207 91 H237" stroke="#202328" stroke-width="8" stroke-linecap="round"/>
            <rect x="34" y="88" width="9" height="22" rx="4" fill="#111317"/>
            <rect x="235" y="81" width="9" height="22" rx="4" fill="#111317"/>
          </g>
        </svg>
      </div>`;
  }

  function bodyMarkup() {
    return `
      <div class="sn-body-wrap" aria-label="Front body muscle focus">
        <svg class="sn-body-svg" viewBox="0 0 180 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Human body with chest and shoulders highlighted">
          <defs>
            <linearGradient id="snMuscle" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4f8df7"/><stop offset="1" stop-color="#2f6df6"/></linearGradient>
          </defs>
          <circle cx="90" cy="28" r="20" fill="#f4f5f6" stroke="#8e949c" stroke-width="3"/>
          <path d="M66 55 C75 48 82 50 90 54 C98 50 105 48 114 55 L132 77 L120 113 L113 153 L106 218 L96 239 H84 L74 218 L67 153 L60 113 L48 77 Z" fill="#f6f7f8" stroke="#8e949c" stroke-width="3" stroke-linejoin="round"/>
          <path d="M49 77 L26 108 L18 104 L39 66 L61 55" fill="#f6f7f8" stroke="#8e949c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M131 77 L154 108 L162 104 L141 66 L119 55" fill="#f6f7f8" stroke="#8e949c" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>

          <path d="M67 57 C74 52 82 53 90 58 C98 53 106 52 113 57 L119 77 C110 88 101 93 90 93 C79 93 70 88 61 77 Z" fill="url(#snMuscle)" opacity=".96"/>
          <path d="M60 61 C50 62 43 69 39 79 L49 94 C57 90 63 82 67 73 Z" fill="url(#snMuscle)"/>
          <path d="M120 61 C130 62 137 69 141 79 L131 94 C123 90 117 82 113 73 Z" fill="url(#snMuscle)"/>

          <path d="M72 104 C78 110 84 113 90 113 C96 113 102 110 108 104" fill="none" stroke="#c5c9ce" stroke-width="2"/>
          <path d="M90 114 V149" stroke="#d0d3d7" stroke-width="2"/>
          <path d="M67 154 L83 219" stroke="#c5c9ce" stroke-width="2"/>
          <path d="M113 154 L97 219" stroke="#c5c9ce" stroke-width="2"/>
        </svg>
        <div class="sn-body-label">BLUE = TODAY’S FOCUS</div>
      </div>`;
  }

  installVisualStyles();

  if (typeof machineSvg === "function") machineSvg = () => machineMarkup();
  if (typeof bodySvg === "function") bodySvg = () => bodyMarkup();

  function patchCurrentScreen() {
    document.querySelectorAll(".machine-art").forEach(el => { el.innerHTML = machineMarkup(); });
    document.querySelectorAll(".body-visual").forEach(el => { el.innerHTML = bodyMarkup(); });
  }

  // Re-render once after all feature scripts are loaded so the current-plan Home screen also uses the new visuals.
  if (typeof render === "function") {
    try { render(); } catch (_) { patchCurrentScreen(); }
  } else {
    patchCurrentScreen();
  }
})();
