// START/NOW v80 — explicit skip option for routine-template onboarding.
(() => {
  const STYLE_ID = "snTemplateSkipStyles";
  const SKIP_ID = "snTemplateSkip";

  function ensureStyles() {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .sn-template-skip-wrap {
        margin-top: 14px;
        padding-top: 12px;
        border-top: 1px solid var(--line, #e8e8e4);
        text-align: center;
      }
      .sn-template-skip {
        width: 100%;
        min-height: 44px;
        border: 1px solid var(--line, #e8e8e4);
        border-radius: 14px;
        background: transparent;
        color: var(--text, #171717);
        font: inherit;
        font-weight: 700;
        cursor: pointer;
      }
      .sn-template-skip:hover {
        background: rgba(59, 130, 246, 0.06);
        border-color: rgba(59, 130, 246, 0.35);
      }
      .sn-template-skip:focus-visible {
        outline: 3px solid rgba(59, 130, 246, 0.25);
        outline-offset: 2px;
      }
      .sn-template-skip-note {
        margin: 7px 4px 0;
        color: var(--muted, #7b7d83);
        font-size: 12px;
        line-height: 1.35;
      }
    `;
    document.head.appendChild(style);
  }

  function isRoutineTemplateModal(modal) {
    if (!modal) return false;
    const eyebrow = modal.querySelector(".sn-modal-head span");
    return eyebrow?.textContent?.trim() === "ROUTINE TEMPLATES";
  }

  function addSkipOption() {
    const modal = document.getElementById("snProductModal");
    if (!isRoutineTemplateModal(modal) || modal.querySelector(`#${SKIP_ID}`)) return;

    const panel = modal.querySelector(".sn-modal");
    const list = modal.querySelector(".sn-template-list");
    if (!panel || !list) return;

    ensureStyles();

    const wrap = document.createElement("div");
    wrap.className = "sn-template-skip-wrap";
    wrap.innerHTML = `
      <button type="button" class="sn-template-skip" id="${SKIP_ID}">Skip — I’ll build my own</button>
      <p class="sn-template-skip-note">You can create and schedule your own workouts from the Workouts tab.</p>
    `;

    list.insertAdjacentElement("afterend", wrap);

    document.getElementById(SKIP_ID)?.addEventListener("click", () => {
      modal.remove();
      if (typeof showToast === "function") showToast("Build your routine your way");
    });
  }

  const observer = new MutationObserver(addSkipOption);
  observer.observe(document.body, { childList: true, subtree: true });
  addSkipOption();
})();
