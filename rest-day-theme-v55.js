// START/NOW v55 — robust rest-day visual override. Loaded last.
(() => {
  function moonSvg() {
    return `<svg viewBox="0 0 280 220" role="img" aria-label="Crescent moon and stars for recovery">
      <defs>
        <linearGradient id="sn55Moon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#A7C7FF"/>
          <stop offset="48%" stop-color="#5B8FF9"/>
          <stop offset="100%" stop-color="#2563EB"/>
        </linearGradient>
        <radialGradient id="sn55Sky" cx="52%" cy="44%" r="72%">
          <stop offset="0%" stop-color="#F8FBFF"/>
          <stop offset="100%" stop-color="#DBEAFE"/>
        </radialGradient>
        <filter id="sn55Shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="9" flood-color="#2563EB" flood-opacity=".18"/>
        </filter>
      </defs>
      <path d="M29 58 C55 18 111 4 171 17 C225 29 257 69 252 119 C248 166 211 199 158 205 C106 211 56 191 31 154 C10 122 9 87 29 58 Z" fill="url(#sn55Sky)"/>
      <g filter="url(#sn55Shadow)">
        <path d="M159 31 C121 43 97 76 97 115 C97 154 121 181 157 191 C124 199 87 189 65 162 C40 131 40 87 64 55 C87 25 124 14 159 20 C149 23 139 27 131 34 C141 33 151 32 159 31 Z" fill="url(#sn55Moon)"/>
        <path d="M155 191 C184 188 211 175 231 151 C219 177 198 197 171 207 C145 217 115 216 90 207 C112 206 136 201 155 191 Z" fill="#AFCBFF" opacity=".9"/>
        <ellipse cx="86" cy="88" rx="10" ry="14" fill="#DBEAFE" opacity=".55"/>
        <ellipse cx="78" cy="120" rx="8" ry="10" fill="#BFDBFE" opacity=".45"/>
        <ellipse cx="104" cy="156" rx="11" ry="7" fill="#DBEAFE" opacity=".38"/>
        <circle cx="95" cy="61" r="5" fill="#EAF2FF" opacity=".6"/>
      </g>
      <path d="M184 48 L190 64 L206 70 L190 76 L184 92 L178 76 L162 70 L178 64 Z" fill="#2563EB"/>
      <path d="M222 91 L226 102 L237 106 L226 110 L222 121 L218 110 L207 106 L218 102 Z" fill="#60A5FA"/>
      <path d="M51 42 L55 52 L65 56 L55 60 L51 70 L47 60 L37 56 L47 52 Z" fill="#3B82F6"/>
      <circle cx="220" cy="45" r="4" fill="#93C5FD"/>
      <circle cx="241" cy="129" r="3.5" fill="#60A5FA"/>
      <circle cx="46" cy="146" r="3.5" fill="#93C5FD"/>
      <circle cx="201" cy="137" r="3" fill="#FFFFFF" stroke="#BFDBFE" stroke-width="1.5"/>
      <path d="M57 184 C82 174 103 175 122 185 C140 194 161 196 188 188" fill="none" stroke="#A7C7F5" stroke-width="5" stroke-linecap="round" opacity=".8"/>
    </svg>`;
  }

  function installStyles() {
    if (document.getElementById("sn55-rest-theme-styles")) return;
    const style = document.createElement("style");
    style.id = "sn55-rest-theme-styles";
    style.textContent = `
      .sn55-rest-card{border-color:#DCE8FB!important;box-shadow:0 16px 36px rgba(37,99,235,.08)!important}
      .sn55-rest-card .primary,
      .sn55-rest-card .sn53-rest-button,
      .sn55-rest-card .sn54-rest-button,
      .sn55-rest-card .sn55-rest-button{
        background:linear-gradient(135deg,#2F6DF6 0%,#2563EB 100%)!important;
        border-color:#2563EB!important;color:#fff!important;
        box-shadow:0 10px 22px rgba(37,99,235,.22)!important;
      }
      .sn55-rest-card .sn53-rest-meta span,
      .sn55-rest-card .sn54-rest-meta span{background:#EFF6FF!important;border:1px solid #DBEAFE!important;color:#285EA8!important}
      .sn55-rest-art{display:flex!important;align-items:center!important;justify-content:center!important;min-height:205px!important;margin:-18px -18px -16px -4px!important}
      .sn55-rest-art svg{width:245px!important;max-width:145%!important;height:auto!important;display:block!important}
      .sn55-rest-page .primary{background:linear-gradient(135deg,#2F6DF6 0%,#2563EB 100%)!important;border-color:#2563EB!important}
      .sn55-rest-page .sn53-rest-hero,.sn55-rest-page .sn54-rest-hero{border-color:#DCE8FB!important}
      .sn55-rest-page .sn53-rest-hero svg,.sn55-rest-page .sn54-rest-hero svg{width:255px!important;max-width:78%!important;height:auto!important}
      .sn55-rest-page .sn53-recovery-item,.sn55-rest-page .sn54-recovery-item{background:#F8FBFF!important;border-color:#DCE8FB!important}
      .sn55-rest-page .sn53-activity-list i,.sn55-rest-page .sn54-activity-list i{background:#60A5FA!important}
      .sn55-rest-page .sn53-coach,.sn55-rest-page .sn54-coach{background:#EFF6FF!important;border-color:#D7E6FF!important}
      @media(max-width:640px){
        .sn55-rest-card .plan-grid{grid-template-columns:minmax(0,1fr) 145px!important}
        .sn55-rest-art{min-height:170px!important;margin:-12px -16px -12px -8px!important}
        .sn55-rest-art svg{width:205px!important;max-width:165%!important}
      }
    `;
    document.head.appendChild(style);
  }

  function apply() {
    installStyles();
    const plan = document.querySelector('.plan-card');
    if (plan && /Rest Day/i.test(plan.querySelector('h2')?.textContent || '')) {
      plan.classList.add('sn55-rest-card');
      const oldArt = plan.querySelector('.sn53-rest-art,.sn54-rest-art,.sn55-rest-art');
      if (oldArt) {
        oldArt.className = 'sn55-rest-art';
        oldArt.innerHTML = moonSvg();
      }
      const button = plan.querySelector('#sn53ViewRecovery,#sn54ViewRecovery,.sn53-rest-button,.sn54-rest-button,.primary');
      if (button) button.classList.add('sn55-rest-button');
    }

    const restPage = document.querySelector('.sn53-rest-page,.sn54-rest-page');
    if (restPage) {
      restPage.classList.add('sn55-rest-page');
      const heroArt = restPage.querySelector('.sn53-rest-hero svg,.sn54-rest-hero svg');
      if (heroArt) heroArt.outerHTML = moonSvg();
    }
  }

  const observer = new MutationObserver(() => apply());
  observer.observe(document.getElementById('app') || document.body, { childList:true, subtree:true });
  queueMicrotask(apply);
  setTimeout(apply, 100);
})();