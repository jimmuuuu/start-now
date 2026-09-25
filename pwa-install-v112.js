/* Installation is a deliberate settings action; upgrades preserve active sessions. */
(() => {
  let prompt=null,registration=null;
  const isStandalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
  window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();prompt=event;});
  window.addEventListener('appinstalled',()=>{prompt=null;showToast('START/NOW installed.');});
  async function install(){
    if(isStandalone()){showToast('START/NOW is already installed.');return;}
    if(prompt){await prompt.prompt();await prompt.userChoice;prompt=null;return;}
    const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
    UI.sheet('Install START/NOW','<p class="sheet-copy">'+(ios?'In Safari, tap Share, then Add to Home Screen.':'Open your browser’s menu and choose Install app or Add to Home Screen. In Safari on iPhone, use Share → Add to Home Screen.')+'</p>');
  }
  async function checkForUpdate(){try{await registration?.update();}catch{/* Offline users keep their installed shell. */}}
  if('serviceWorker' in navigator)window.addEventListener('load',async()=>{
    try{
      registration=await navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'});
      await checkForUpdate();
    }catch(error){console.warn('Offline installation unavailable',error);}
  },{once:true});
  window.START_NOW_PWA={install,isStandalone,checkForUpdate};
})();
