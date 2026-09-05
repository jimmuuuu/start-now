// START/NOW v137 — installable PWA bootstrap, updates, and install guidance.
(() => {
  const VERSION = 'v137';
  const SW_URL = './sw.js?v=pwa-v137';
  const DISMISS_KEY = 'sn_pwa_install_dismissed_until';
  let deferredPrompt = null;
  let installBanner = null;
  let reloadingForUpdate = false;

  const isStandalone = () =>
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  const isIOS = () => /iphone|ipad|ipod/i.test(window.navigator.userAgent || '');

  const dismissedForNow = () => {
    const until = Number(localStorage.getItem(DISMISS_KEY) || 0);
    return Number.isFinite(until) && until > Date.now();
  };

  const dismissForAWeek = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now() + 7 * 24 * 60 * 60 * 1000));
  };

  const ensureStyles = () => {
    if (document.getElementById('snPwaStyles')) return;
    const style = document.createElement('style');
    style.id = 'snPwaStyles';
    style.textContent = `
      .sn-pwa-install {
        position: fixed;
        left: 16px;
        right: 16px;
        bottom: calc(92px + env(safe-area-inset-bottom));
        z-index: 9997;
        max-width: 520px;
        margin: 0 auto;
        display: grid;
        grid-template-columns: 46px minmax(0,1fr) auto;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border: 1px solid rgba(255,90,95,.24);
        border-radius: 18px;
        background: color-mix(in srgb, var(--card, #fff) 94%, transparent);
        color: var(--text, #111);
        box-shadow: 0 16px 42px rgba(0,0,0,.18);
        backdrop-filter: blur(18px);
        -webkit-backdrop-filter: blur(18px);
      }
      .sn-pwa-install img { width: 46px; height: 46px; border-radius: 12px; display: block; }
      .sn-pwa-copy { min-width: 0; }
      .sn-pwa-copy strong { display: block; font-size: 14px; line-height: 1.2; }
      .sn-pwa-copy small { display: block; margin-top: 3px; opacity: .7; font-size: 12px; line-height: 1.3; }
      .sn-pwa-actions { display: flex; align-items: center; gap: 6px; }
      .sn-pwa-install button {
        appearance: none;
        border: 0;
        border-radius: 12px;
        min-height: 40px;
        padding: 0 13px;
        font: inherit;
        font-size: 13px;
        font-weight: 800;
        cursor: pointer;
      }
      .sn-pwa-install .sn-pwa-primary { background: #ff5a5f; color: #fff; }
      .sn-pwa-install .sn-pwa-dismiss { background: transparent; color: inherit; padding: 0 8px; opacity: .65; }
      .sn-pwa-help-backdrop {
        position: fixed;
        inset: 0;
        z-index: 10020;
        display: grid;
        place-items: end center;
        padding: 18px;
        padding-bottom: calc(18px + env(safe-area-inset-bottom));
        background: rgba(0,0,0,.48);
      }
      .sn-pwa-help {
        width: min(100%, 480px);
        border-radius: 24px;
        background: var(--card, #fff);
        color: var(--text, #111);
        padding: 22px;
        box-shadow: 0 22px 70px rgba(0,0,0,.3);
      }
      .sn-pwa-help h2 { margin: 0 0 8px; font-size: 22px; }
      .sn-pwa-help p { margin: 0 0 16px; line-height: 1.5; opacity: .78; }
      .sn-pwa-help ol { margin: 0 0 18px; padding-left: 22px; line-height: 1.55; }
      .sn-pwa-help button {
        width: 100%;
        border: 0;
        border-radius: 14px;
        min-height: 48px;
        background: #ff5a5f;
        color: #fff;
        font: inherit;
        font-weight: 800;
      }
      @media (max-width: 430px) {
        .sn-pwa-install { grid-template-columns: 42px minmax(0,1fr); }
        .sn-pwa-install img { width: 42px; height: 42px; border-radius: 11px; }
        .sn-pwa-actions { grid-column: 1 / -1; justify-content: flex-end; }
      }
    `;
    document.head.appendChild(style);
  };

  const hideBanner = () => {
    installBanner?.remove();
    installBanner = null;
  };

  const showIOSHelp = () => {
    if (document.getElementById('snPwaHelp')) return;
    ensureStyles();
    const backdrop = document.createElement('div');
    backdrop.id = 'snPwaHelp';
    backdrop.className = 'sn-pwa-help-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    backdrop.setAttribute('aria-label', 'Install Level Up Fitness');
    backdrop.innerHTML = `
      <div class="sn-pwa-help">
        <h2>Install Level Up Fitness</h2>
        <p>Add Level Up Fitness to your Home Screen so it opens full-screen like an app.</p>
        <ol>
          <li>Tap the browser <strong>Share</strong> button.</li>
          <li>Choose <strong>Add to Home Screen</strong>.</li>
          <li>Tap <strong>Add</strong>.</li>
        </ol>
        <button type="button" data-sn-pwa-close>Got it</button>
      </div>
    `;
    backdrop.addEventListener('click', event => {
      if (event.target === backdrop || event.target.closest('[data-sn-pwa-close]')) backdrop.remove();
    });
    document.body.appendChild(backdrop);
  };

  const showBanner = mode => {
    if (isStandalone() || dismissedForNow() || installBanner) return;
    ensureStyles();
    const banner = document.createElement('aside');
    banner.className = 'sn-pwa-install';
    banner.setAttribute('aria-label', 'Install Level Up Fitness');
    banner.innerHTML = `
      <img src="./assets/pwa/icon-192.png" alt="" aria-hidden="true">
      <div class="sn-pwa-copy">
        <strong>Install Level Up Fitness</strong>
        <small>${mode === 'native' ? 'Use it full-screen from your Home Screen.' : 'Add it to your Home Screen and use it like an app.'}</small>
      </div>
      <div class="sn-pwa-actions">
        <button type="button" class="sn-pwa-dismiss" data-sn-pwa-dismiss>Not now</button>
        <button type="button" class="sn-pwa-primary" data-sn-pwa-install>${mode === 'native' ? 'Install' : 'How'}</button>
      </div>
    `;
    banner.querySelector('[data-sn-pwa-dismiss]').addEventListener('click', () => {
      dismissForAWeek();
      hideBanner();
    });
    banner.querySelector('[data-sn-pwa-install]').addEventListener('click', async () => {
      if (mode === 'native' && deferredPrompt) {
        const prompt = deferredPrompt;
        deferredPrompt = null;
        try {
          await prompt.prompt();
          await prompt.userChoice;
        } catch (error) {
          console.warn('Level Up Fitness install prompt failed', error);
        }
        hideBanner();
      } else {
        showIOSHelp();
      }
    });
    document.body.appendChild(banner);
    installBanner = banner;
  };

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    showBanner('native');
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    localStorage.removeItem(DISMISS_KEY);
    hideBanner();
  });

  if (isIOS() && !isStandalone()) {
    window.setTimeout(() => showBanner('ios'), 1600);
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const hadController = Boolean(navigator.serviceWorker.controller);
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (!hadController || reloadingForUpdate) return;
          reloadingForUpdate = true;
          window.location.reload();
        }, { once: true });

        const registration = await navigator.serviceWorker.register(SW_URL, {
          scope: './',
          updateViaCache: 'none'
        });
        registration.waiting?.postMessage({ type: 'SKIP_WAITING' });
        await registration.update();
      } catch (error) {
        console.warn('Level Up Fitness service worker registration failed', error);
      }
    }, { once: true });
  }

  window.START_NOW_PWA = {
    version: VERSION,
    isStandalone,
    install() {
      if (deferredPrompt) return showBanner('native');
      return showIOSHelp();
    }
  };
})();
