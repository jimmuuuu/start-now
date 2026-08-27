// START/NOW v108 — keep Train as the universal quick-workout entry and remove the duplicate Home shortcut.
(() => {
  const QA = window.START_NOW_QUICK_ACTIONS;
  if (!QA || !Array.isArray(QA.actions)) return;

  const duplicateIndex = QA.actions.findIndex(action => action?.id === 'quickWorkout');
  if (duplicateIndex >= 0) QA.actions.splice(duplicateIndex, 1);

  if (!document.getElementById('sn108-home-action-styles')) {
    const style = document.createElement('style');
    style.id = 'sn108-home-action-styles';
    style.textContent = `
      .sn70-quick-actions .tiles{
        grid-template-columns:repeat(3,minmax(0,1fr))!important;
      }
      @media(max-width:390px){
        .sn70-quick-actions .tiles{gap:8px!important}
        .sn70-quick-actions .tile{padding:12px 8px!important;min-height:104px!important}
        .sn70-quick-actions .tile strong{font-size:12px!important}
        .sn70-quick-actions .tile span{font-size:10px!important}
      }
    `;
    document.head.appendChild(style);
  }

  function refreshHomeActions() {
    if (typeof state !== 'undefined' && state.page === 'home') {
      QA.renderHomeActions?.();
    }
  }

  refreshHomeActions();

  window.START_NOW_HOME_ACTION_DEDUPE = {
    version: 'v108',
    refresh: refreshHomeActions
  };
})();
