const {test,expect}=require('@playwright/test');

test.beforeEach(async({page})=>{
  await page.addInitScript(()=>{
    sessionStorage.setItem('sn_onboarding_seen_v36','1');
    localStorage.setItem('sn_user_profile_v36',JSON.stringify({experience:'Beginner',days:['Monday'],goal:'Build muscle',location:'Gym',duration:45}));
  });
});

test('startup waits for the final renderer before showing a screen',async({page})=>{
  await page.addInitScript(()=>{
    const descriptor=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
    window.startupWrites=[];
    Object.defineProperty(Element.prototype,'innerHTML',{...descriptor,set(value){if(this.id==='app')window.startupWrites.push(new Error().stack);descriptor.set.call(this,value);}});
  });
  let release;
  const gate=new Promise(resolve=>release=resolve);
  let reached;
  const pending=new Promise(resolve=>reached=resolve);
  await page.route('**/product-bootstrap-v36.js*',async route=>{reached();await gate;await route.continue();});
  const navigation=page.goto('/');
  await pending;
  try { expect(await page.evaluate(()=>window.startupWrites)).toEqual([]);await expect(page.locator('#app')).toBeEmpty(); }
  finally { release(); }
  await navigation;
  await expect(page.locator('#app')).not.toBeEmpty();
  await expect(page.getByRole('heading',{name:'No workout scheduled'})).toBeVisible();
});

test('library search retains focus across consecutive keystrokes',async({page})=>{
  await page.goto('/');
  await page.evaluate(()=>{state.page='exerciseLibrary';render();});
  await page.locator('#snLibrarySearch').click();
  for(const letter of 'bench'){
    await page.keyboard.type(letter);
    await expect(page.locator('#snLibrarySearch')).toBeFocused();
  }
  await expect(page.locator('#snLibrarySearch')).toHaveValue('bench');
});

test('builder Done click survives a changed prescription field',async({page})=>{
  await page.goto('/');
  await page.locator('#quickStart').click();
  await page.locator('[data-mode="build"]').click();
  await page.locator('.sn66-results [data-add]').first().click();
  await page.getByRole('button',{name:/Selected exercises/}).click();
  await page.locator('[data-edit-prescription]').first().click();
  await page.locator('[data-rx-input="sets"]').fill('5');
  await page.locator('[data-rx-done]').click();
  await expect(page.locator('[data-rx-editor]')).toHaveCount(0);
  await expect(page.locator('.sn66-selected-main')).toContainText('5 sets');
});

test('leg swaps use canonical muscle groups and preserve logged sets',async({page})=>{
  await page.goto('/');
  const candidate=await page.evaluate(()=>{
    const base=exerciseLibrary.find(ex=>/leg press/i.test(ex.name));
    const candidate=exerciseLibrary.find(ex=>ex.id!==base.id&&SN36.normalizeExercise(ex).muscle==='Quads');
    startWorkout({id:'swap-check',name:'Swap check',days:[],exercises:[{...base,sets:1}]});
    return candidate.id;
  });
  await page.locator('#snSwapExercise').click();
  await expect(page.locator(`[data-swap="${candidate}"]`)).toBeVisible();
  await page.getByRole('button',{name:'Close swap exercise'}).click();
  await page.getByLabel('Weight for set 1').fill('50');
  await page.getByLabel('Reps for set 1').fill('10');
  await page.locator('[data-complete-set="0"]').click();
  const before=await page.evaluate(()=>JSON.stringify(SN36.active.exercises));
  await page.locator('#snSwapExercise').click();
  await page.locator(`[data-swap="${candidate}"]`).click();
  expect(await page.evaluate(()=>JSON.stringify(SN36.active.exercises))).toBe(before);
  await expect(page.locator('#toast')).toContainText('completed sets');
});

test('empty reps cannot be marked completed',async({page})=>{
  await page.goto('/');
  await page.evaluate(()=>startWorkout({id:'empty-reps',name:'Empty reps',days:[],exercises:[{...exerciseLibrary[0],sets:1}]}));
  await page.locator('[data-complete-set="0"]').click();
  expect(await page.evaluate(()=>SN36.active.exercises[0].sets[0].done)).toBe(false);
});

test('failed preferences save keeps the form and entered values',async({page})=>{
  await page.goto('/');
  await page.evaluate(()=>SN36.openPreferences());
  await page.locator('#snPrefAvoid').fill('keep my input');
  await page.evaluate(()=>{
    const original=Storage.prototype.setItem;
    Storage.prototype.setItem=function(key,value){if(key==='sn_user_profile_v36')throw new DOMException('Full','QuotaExceededError');return original.call(this,key,value);};
  });
  await page.locator('#snSavePrefs').click();
  await expect(page.locator('#snPrefAvoid')).toHaveValue('keep my input');
  await expect(page.locator('#toast')).not.toContainText('Preferences saved');
});

test('cancelling deletion does not delete the workout on the next save',async({page})=>{
  await page.goto('/');
  await page.evaluate(()=>{
    SN36.upsertWorkout({id:'keep-plan',name:'Keep plan',days:[],exercises:[exerciseLibrary[0]]});
    state.page='workouts';render();
  });
  page.once('dialog',dialog=>dialog.dismiss());
  await page.locator('[data-delete-workout="keep-plan"]').click();
  await page.evaluate(()=>saveCustomWorkouts());
  expect(await page.evaluate(()=>SN36.workouts().some(w=>w.id==='keep-plan'))).toBe(true);
  await page.reload();
  expect(await page.evaluate(()=>SN36.workouts().some(w=>w.id==='keep-plan'))).toBe(true);
});
