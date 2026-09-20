const {test,expect}=require('@playwright/test');

async function open(page){
  // Layout fixtures only: no external media/network availability dependency.
  await page.route('https://raw.githubusercontent.com/**',route=>route.fulfill({contentType:'image/png',body:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=','base64')}));
  await page.goto('/');
  await expect(page.locator('#app')).not.toBeEmpty();
}
async function fits(page){
  const overflow=await page.evaluate(()=>[...document.querySelectorAll('#app *, .sn-modal *, .sn-auth-sheet *')].filter(e=>{
    const r=e.getBoundingClientRect(),s=getComputedStyle(e);
    return r.width>0&&r.height>0&&s.position!=='absolute'&&s.position!=='fixed'&&(r.right>innerWidth+1||r.left< -1);
  }).map(e=>({class:e.className,id:e.id})).slice(0,8));
  expect(overflow).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
}
for(const width of [320,375,390,430,1280]) test(`polished screens and sheets fit ${width}px in both themes`,async({page})=>{
  await page.setViewportSize({width,height:844});await open(page);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const dark of [false,true]){
    await page.evaluate(dark=>{document.documentElement.classList.toggle('dark',dark);state.customWorkouts=[{id:'long-title',name:'Upper body strength and conditioning',days:[dayName()],exercises:[{...exerciseLibrary[0],sets:1}]}];saveCustomWorkouts()},dark);
    for(const route of ['home','workouts','progress','profile','exerciseLibrary','quickWorkout','calendar','myStats']){
      await page.evaluate(route=>{state.page=route;render()},route);await fits(page);
    }
    await page.evaluate(()=>startWorkout({id:'polish',name:'Upper body with a long workout title',days:[],exercises:[{...exerciseLibrary[0],name:'Single Arm Incline Dumbbell Bench Press',sets:1}]}));
    await fits(page);
    await page.locator('#snAddExerciseToWorkout').click();
    await expect(page.locator('#snProductModal')).toBeVisible();await fits(page);
    const modal=await page.locator('#snProductModal .sn-modal').boundingBox();expect(modal.y).toBeGreaterThanOrEqual(0);expect(modal.y+modal.height).toBeLessThanOrEqual(844);
    await page.keyboard.press('Escape');await expect(page.locator('#snProductModal')).toHaveCount(0);
    await page.evaluate(()=>{state.page='profile';render()});await page.locator('#snSignIn').click();await expect(page.getByLabel('Email',{exact:true})).toBeFocused();await fits(page);await page.keyboard.press('Escape');await expect(page.locator('#snAuthModal')).toBeHidden();
  }
  expect(errors).toEqual([]);
});

test('library search keeps focus, filters stay labelled, navigation identifies its section',async({page})=>{
  await open(page);await page.getByRole('button',{name:'Workouts',exact:true}).click();await page.locator('#snLibraryLaunch').click();
  await page.getByRole('textbox',{name:'Search exercises'}).pressSequentially('bench');
  await expect(page.getByRole('textbox',{name:'Search exercises'})).toBeFocused();
  await expect(page.getByRole('textbox',{name:'Search exercises'})).toHaveValue('bench');
  await expect(page.getByLabel('Filter by muscle')).toBeVisible();
  await expect(page.locator('[data-page="workouts"]')).toHaveAttribute('aria-current','page');
});

test('sheet traps keyboard focus, restores opener and prevents backdrop wheel scrolling',async({page})=>{
  await open(page);await page.evaluate(()=>startWorkout({id:'keys',name:'Keyboard workout',days:[],exercises:[{...exerciseLibrary[0],sets:3}]}));
  const opener=page.locator('#snAddExerciseToWorkout');await opener.click();
  const modal=page.locator('#snProductModal'),sheet=modal.locator('.sn-modal');
  await expect(sheet).toHaveAttribute('role','dialog');
  const close=modal.getByRole('button',{name:'Close',exact:true});await close.focus();await page.keyboard.press('Shift+Tab');
  expect(await sheet.evaluate(el=>el.contains(document.activeElement))).toBe(true);
  const y=await page.evaluate(()=>scrollY);await page.mouse.move(2,2);await page.mouse.wheel(0,500);await page.waitForTimeout(100);expect(await page.evaluate(()=>scrollY)).toBe(y);
  await page.keyboard.press('Escape');await expect(modal).toHaveCount(0);await expect(opener).toBeFocused();
  // An idle timer must not cover the notes field, even when the keyboard opens.
  expect(await page.locator('#snRestTimer').evaluate(el=>getComputedStyle(el).position)).toBe('static');
});

test('sign in, workout, sign out and sign back in preserve history through the auth adapter',async({page})=>{
  const user={id:'polish-user',email:'athlete@example.test'};let signedIn=false,backup={};
  await page.route('**/third-party/supabase.js*',route=>route.fulfill({contentType:'text/javascript',body:`
    window.supabase={createClient(){let notify;return {
      auth:{getSession:async()=>({data:{session:${signedIn?JSON.stringify({user}):'null'}}}),onAuthStateChange:cb=>{notify=cb},signInWithPassword:async()=>{await window.testAuthState(true);notify('SIGNED_IN',${JSON.stringify({user})});return {error:null}},signOut:async()=>{await window.testAuthState(false);return {error:null}}},
      from(table){let value;const q={select(){return q},eq(){return q},order(){return q},range(){return q},maybeSingle(){return q},upsert(v){value=v;return q},delete(){return q},in(){return q},async then(resolve){resolve(await window.testDatabase(table,value))}};return q}
    }}};`}));
  await page.exposeFunction('testAuthState',value=>{signedIn=value});
  await page.exposeFunction('testDatabase',(table,value)=>{
    if(table==='profiles'&&value?.app_settings)backup=value.app_settings;
    return {error:null,data:table==='profiles'?{app_settings:backup}:[]};
  });
  await open(page);
  async function signIn(){
    await page.getByRole('button',{name:'Profile',exact:true}).click();await page.locator('#snSignIn').click();
    await page.getByLabel('Email',{exact:true}).fill(user.email);await page.getByLabel('Password',{exact:true}).fill('test-password-only');
    await page.locator('#snAuthSubmit').click();await expect.poll(()=>page.evaluate(()=>window.SN_CLOUD_USER?.id)).toBe(user.id);
    await expect(page.locator('#snAuthModal')).toBeHidden();
  }
  await signIn();
  await page.evaluate(()=>startWorkout({id:'auth-flow',name:'Auth regression workout',days:[],exercises:[{...exerciseLibrary[0],sets:1}]}));
  await page.getByLabel('Weight for set 1').fill('20');await page.getByLabel('Reps for set 1').fill('8');await page.locator('#snExerciseNote').fill('Keep this note');await page.locator('[data-complete-set="0"]').click();
  page.once('dialog',d=>d.accept());await page.locator('#snFinishEarly').click();await expect(page.locator('#snSummaryHome')).toBeVisible();
  await page.getByRole('button',{name:'Profile',exact:true}).click();await expect.poll(()=>page.evaluate(()=>SN_AUTH.syncNow())).toBe(true);
  page.once('dialog',d=>d.accept());await Promise.all([page.waitForEvent('load'),page.locator('#snSignOut').click()]);await expect(page.locator('#app')).not.toBeEmpty();
  await expect.poll(()=>signedIn).toBe(false);await expect.poll(()=>page.evaluate(()=>!!window.SN_AUTH)).toBe(true);
  await signIn();await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('sn_progress_sessions')||'[]').some(s=>s.workoutName==='Auth regression workout'))).toBe(true);
});
