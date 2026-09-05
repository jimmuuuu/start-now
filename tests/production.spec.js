const {test,expect}=require('@playwright/test');

async function open(page, {signedIn=false, fail=false, remote={}}={}) {
  await page.addInitScript(({signedIn,fail,remote})=>{
    sessionStorage.setItem('sn_onboarding_seen_v36','1');
    if (!localStorage.getItem('sn_user_profile_v36')) localStorage.setItem('sn_user_profile_v36',JSON.stringify({experience:'Beginner',days:['Monday'],goal:'Build muscle',location:'Gym',duration:45}));
    window.cloudTest={fail,remote,writes:[],signedOut:false};
    window.testUser=signedIn?{id:'test-user',email:'athlete@example.test'}:null;
  },{signedIn,fail,remote});
  await page.route('**/third-party/supabase.js*',route=>route.fulfill({contentType:'text/javascript',body:`
    window.supabase={createClient(){return {
      auth:{getSession:async()=>({data:{session:window.testUser?{user:window.testUser}:null}}),onAuthStateChange:callback=>{window.cloudTest.authEvent=callback},signOut:async()=>{window.cloudTest.signedOut=true;return {error:null}},signInWithPassword:async()=>({error:{message:'Invalid login credentials'}}),resetPasswordForEmail:async(email)=>{cloudTest.resetEmail=email;return {error:null}},updateUser:async()=>{cloudTest.passwordUpdated=true;return {error:null}},signUp:async()=>({data:{session:null},error:null})},
      from(table){let mutation=null; const q={select(){return q},eq(){return q},order(){return q},range(){return q},maybeSingle(){return q},upsert(value){mutation=value;return q},delete(){return q},in(){return q},then(resolve){if(mutation)window.cloudTest.writes.push({table,value:mutation});resolve({error:window.cloudTest.fail?{message:'Service unavailable'}:null,data:table==='profiles'?{app_settings:{start_now_backup:{storage:window.cloudTest.remote}}}:[]})}};return q}
    }}};` }));
  await page.goto('/');
  await expect.poll(()=>page.evaluate(()=>!!window.SN_AUTH)).toBe(true);
  await page.getByRole('button',{name:'Profile',exact:true}).click();
}

test('account and legal controls are usable; auth error and keyboard close work',async({page})=>{
  await open(page);
  await page.getByRole('button',{name:'Sign in',exact:true}).click();
  await page.getByLabel('Email',{exact:true}).fill('athlete@example.test');
  await page.getByLabel('Password',{exact:true}).fill('wrong-password');
  await page.locator('#snAuthSubmit').click();
  await expect(page.locator('#snAuthError')).toContainText('Invalid login credentials');
  await page.keyboard.press('Escape');
  await expect(page.locator('#snAuthModal')).toBeHidden();
  await expect(page.locator('#snSignIn')).toBeFocused();
  await expect(page.getByRole('link',{name:'Privacy',exact:true})).toBeVisible();
  await expect(page.getByRole('link',{name:'Support',exact:true})).toBeVisible();
});

test('failed backup prevents destructive sign-out and keeps error status after render',async({page})=>{
  await open(page,{signedIn:true,fail:true});
  await page.evaluate(()=>localStorage.setItem('sn_custom_workouts',JSON.stringify([{id:'unsynced',name:'Keep this',days:[],exercises:[]}])));
  expect(await page.evaluate(()=>SN_AUTH.signOut())).toBe(false);
  expect(await page.evaluate(()=>cloudTest.signedOut)).toBe(false);
  expect(await page.evaluate(()=>localStorage.getItem('sn_custom_workouts'))).toContain('Keep this');
  await page.evaluate(()=>render());
  await expect(page.locator('#snCloudStatus')).toContainText('Device copy is safe');
});

test('remote deletion markers remove local history and plans without resurrection',async({page})=>{
  await open(page,{signedIn:true,fail:true});
  await page.evaluate(()=>{
    SN36.upsertWorkout({id:'deleted-plan',name:'Old plan',days:[],exercises:[]});
    SN36.addSession({id:'deleted-session',timestamp:Date.now(),workoutName:'Old workout',completedSets:1});
    cloudTest.remote={sn_deleted_workout_ids:'["deleted-plan"]',sn_deleted_session_ids:'["deleted-session"]'};
    cloudTest.fail=false;
  });
  expect(await page.evaluate(()=>SN_AUTH.syncNow())).toBe(true);
  expect(await page.evaluate(()=>SN36.workouts().some(w=>w.id==='deleted-plan'))).toBe(false);
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('sn_progress_sessions')))).toEqual([]);
});

test('quota failure preserves active workout and does not show a completion summary',async({page})=>{
  await open(page);
  await page.evaluate(()=>startWorkout({id:'quota',name:'Storage test',days:[],exercises:[{...exerciseLibrary[0],sets:1}]}));
  await page.getByLabel('Weight for set 1').fill('20');
  await page.getByLabel('Reps for set 1').fill('10');
  await page.locator('[data-complete-set="0"]').click();
  await page.evaluate(()=>{
    const original=Storage.prototype.setItem;
    Storage.prototype.setItem=function(key,value){if(key==='sn_progress_sessions')throw new DOMException('Full','QuotaExceededError');return original.call(this,key,value)};
  });
  page.once('dialog',d=>d.accept());
  await page.locator('#snFinishEarly').click();
  expect(await page.evaluate(()=>state.page)).toBe('activeWorkout');
  expect(await page.evaluate(()=>localStorage.getItem('sn_active_workout_v36'))).toContain('Storage test');
  await expect(page.locator('#toast')).toContainText('could not be saved');
});

for(const width of [320,375,430,1280]) test(`main pages fit ${width}px without runtime errors`,async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width,height:844});await open(page);
  for(const name of ['Home','Workouts','Progress','Profile']) {
    await page.getByRole('button',{name,exact:true}).click();
    await expect(page.locator('#app')).not.toBeEmpty();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('production service worker supports first-install offline reload',async({browser})=>{
  const context=await browser.newContext({serviceWorkers:'allow',viewport:{width:390,height:844}});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>sessionStorage.setItem('sn_onboarding_seen_v36','1'));
  await page.goto('http://127.0.0.1:4173/');
  await page.evaluate(()=>navigator.serviceWorker.ready);
  await expect.poll(()=>page.evaluate(()=>!!navigator.serviceWorker.controller)).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('#app')).not.toBeEmpty();
  await page.getByRole('button',{name:'Profile',exact:true}).click();
  await expect(page.locator('.profile-card')).toBeVisible();
  expect(errors).toEqual([]);
  await context.close();
});

test('training level editing persists and hostile profile text is not interpreted as HTML',async({page})=>{
  await open(page);
  await page.getByRole('button',{name:/Training level/}).click();
  await page.locator('#snLevelSelect').selectOption('Advanced');
  await page.locator('#snLevelApplyPlan').uncheck();
  await page.getByRole('button',{name:'Save training level'}).click();
  await page.reload();
  await page.getByRole('button',{name:'Profile',exact:true}).click();
  await expect(page.getByRole('button',{name:/Training level/})).toContainText('Advanced');
  await page.evaluate(()=>{SN36.saveProfile({...SN36.profile(),experience:'<img src=x onerror="window.injected=true">'});render()});
  expect(await page.evaluate(()=>!!window.injected)).toBe(false);
  await expect(page.locator('.sn-profile-level img')).toHaveCount(0);
});

test('password reset request and recovery form complete through the auth client',async({page})=>{
  await open(page);
  await page.locator('#snSignIn').click();
  await page.getByRole('button',{name:'Forgot password?'}).click();
  await page.getByLabel('Email',{exact:true}).fill('athlete@example.test');
  await page.getByRole('button',{name:'Send reset link'}).click();
  expect(await page.evaluate(()=>cloudTest.resetEmail)).toBe('athlete@example.test');
  await page.evaluate(()=>cloudTest.authEvent('PASSWORD_RECOVERY',null));
  await expect(page.getByRole('heading',{name:'Choose a new password'})).toBeVisible();
  await page.getByLabel('Password',{exact:true}).fill('updated-password');
  await page.getByRole('button',{name:'Save password',exact:true}).click();
  expect(await page.evaluate(()=>cloudTest.passwordUpdated)).toBe(true);
});

test('expired account session isolates its unsynced device data from guest mode',async({page})=>{
  await open(page,{signedIn:true,fail:true});
  await page.evaluate(()=>localStorage.setItem('sn_custom_workouts',JSON.stringify([{id:'private-plan',name:'Private plan',days:[],exercises:[]}])));
  // The next load simulates an expired signed-in session.
  await page.addInitScript(()=>{window.testUser=null});
  await Promise.all([page.waitForEvent('domcontentloaded'), page.evaluate(()=>cloudTest.authEvent('SIGNED_OUT',null))]);
  await expect.poll(()=>page.evaluate(()=>localStorage.getItem('sn_cloud_owner'))).toBeNull();
  await expect.poll(()=>page.evaluate(()=>SN36.workouts().some(w=>w.id==='private-plan'))).toBe(false);
  expect(await page.evaluate(()=>localStorage.getItem('sn_cloud_archive_test-user'))).toContain('Private plan');
});

test('unverified substitute movements are never presented as verified demonstrations',async({page})=>{
  await open(page);
  const results=await page.evaluate(()=>['burpee','dumbbell-thruster','dead-hang','ski-erg','cable-hip-abduction'].map(id=>START_NOW_EXERCISE_MEDIA.resolve({id,name:id},{quiet:true})));
  for(const result of results) expect(result.status).not.toBe('ready');
});
