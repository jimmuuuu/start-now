// START/NOW v62 — Home-style streak badge, muted until the 7-day achievement is earned.
(() => {
  function installStyles(){
    if(document.getElementById('sn62-streak-achievement-styles')) return;
    const style=document.createElement('style');
    style.id='sn62-streak-achievement-styles';
    style.textContent=`
      .achievement-mini[data-achievement-id="streak-7"].locked{opacity:.68;background:var(--surface)}
      .achievement-mini[data-achievement-id="streak-7"].locked strong,
      .achievement-mini[data-achievement-id="streak-7"].locked small{color:var(--muted)}
      .achievement-mini .milestone-icon.milestone-icon-home-streak{
        width:54px;height:54px;border-radius:50%;display:grid;place-items:center;
        margin:0 auto 12px;transform:none;transition:background .18s ease,filter .18s ease,opacity .18s ease;
      }
      .achievement-mini[data-achievement-id="streak-7"].locked .milestone-icon-home-streak{
        background:#F1F3F5;color:inherit;filter:grayscale(1);opacity:.52;
      }
      .achievement-mini[data-achievement-id="streak-7"].completed .milestone-icon-home-streak{
        background:#F1F9DD;color:inherit;filter:none;opacity:1;
      }
      .milestone-icon-home-streak .streak-fire{
        display:block;font-size:34px;line-height:1;transform:translateY(-1px)
      }
      .dark .achievement-mini[data-achievement-id="streak-7"].locked .milestone-icon-home-streak{
        background:#25292E;filter:grayscale(1);opacity:.5;
      }
      .dark .achievement-mini[data-achievement-id="streak-7"].completed .milestone-icon-home-streak{
        background:#29321E;filter:none;opacity:1;
      }
      @media(max-width:390px){
        .achievement-mini .milestone-icon.milestone-icon-home-streak{
          width:54px;height:54px;margin:0;align-self:center
        }
      }
    `;
    document.head.appendChild(style);
  }

  function apply(){
    installStyles();
    const card=document.querySelector('[data-achievement-id="streak-7"]');
    if(!card) return;
    const icon=card.querySelector('.milestone-icon');
    if(!icon) return;
    icon.removeAttribute('data-sn-icon');
    icon.removeAttribute('data-sn-size');
    icon.removeAttribute('data-sn-stroke');
    icon.classList.remove('milestone-icon-coral');
    icon.classList.add('milestone-icon-home-streak');
    icon.innerHTML='<span class="streak-fire" aria-hidden="true">🔥</span>';
  }

  installStyles();

  if(typeof render==='function'){
    const previousRender=render;
    window.render=function(...args){
      const result=previousRender.apply(this,args);
      apply();
      return result;
    };
  }

  apply();
  window.START_NOW_STREAK_ACHIEVEMENT={version:'v62',apply};
})();
