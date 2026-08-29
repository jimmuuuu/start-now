// START/NOW v36 — shared product data, persistence, grading, PR and streak helpers.
(() => {
  const SN = window.SN36 = window.SN36 || {};
  SN.keys = {sessions:"sn_progress_sessions",active:"sn_active_workout_v36",rest:"sn_rest_preferences_v36",profile:"sn_user_profile_v36",bestStreak:"sn_best_streak_v36"};
  SN.days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  SN.dayOrder = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  SN.num = (v,f=0) => Number.isFinite(Number(v)) ? Number(v) : f;
  SN.clamp = (v,min=0,max=100) => Math.max(min,Math.min(max,SN.num(v,min)));
  SN.round1 = v => Math.round(SN.num(v)*10)/10;
  SN.slug = v => String(v||"exercise").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  SN.normalizeExerciseNote = value => String(value??"").slice(0,500);
  SN.unique = a => [...new Set((a||[]).filter(Boolean))];
  SN.read = (key,fallback) => { try { const v=JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch { return fallback; } };
  SN.write = (key,value) => { try { localStorage.setItem(key,JSON.stringify(value)); return true; } catch(e) { console.error("START/NOW save failed",e); showToast?.("Couldn’t save. Check browser storage."); return false; } };
  SN.sessions = () => { const v=SN.read(SN.keys.sessions,[]); return Array.isArray(v)?v.filter(s=>SN.num(s?.timestamp)>0):[]; };
  SN.saveSessions = sessions => SN.write(SN.keys.sessions,(sessions||[]).slice(-365));
  SN.profile = () => SN.read(SN.keys.profile,null);
  SN.saveProfile = p => SN.write(SN.keys.profile,p);
  SN.restPrefs = () => ({autoStart:true,seconds:90,...SN.read(SN.keys.rest,{})});
  SN.saveRestPrefs = p => SN.write(SN.keys.rest,p);
  SN.dayKey = value => { const d=new Date(value); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; };
  SN.todayName = () => SN.days[new Date().getDay()];
  SN.formatDate = ts => new Date(ts).toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"});
  SN.formatShortDate = ts => new Date(ts).toLocaleDateString(undefined,{month:"short",day:"numeric"});
  SN.greeting = () => { const h=new Date().getHours(); return h<12?"Good morning":h<18?"Good afternoon":h<21?"Good evening":"Good night"; };
  SN.exerciseId = ex => ex?.id || SN.slug(ex?.name);
  SN.exerciseMatches = (a,b) => !!a&&!!b&&(SN.exerciseId(a)===SN.exerciseId(b)||String(a.name||"").toLowerCase()===String(b.name||"").toLowerCase());
  SN.repRange = ex => { const max=Math.max(1,SN.num(ex?.repMax ?? ex?.reps,10)); const min=Math.max(1,SN.num(ex?.repMin,max>=20?max:Math.max(1,max-2))); return {min:Math.min(min,max),max:Math.max(min,max)}; };
  SN.repLabel = ex => { const r=SN.repRange(ex); return r.min===r.max?`${r.max}`:`${r.min}-${r.max}`; };

  SN.equipment = ex => {
    const n=String(ex?.name||"").toLowerCase();
    if(/smith/.test(n)) return "Smith Machine";
    if(/cable|pushdown|pulldown|face pull|wood chop|pallof/.test(n)) return "Cable";
    if(/dumbbell/.test(n)) return "Dumbbell";
    if(/barbell|ez-bar|ez bar/.test(n)) return "Barbell";
    if(/kettlebell/.test(n)) return "Kettlebell";
    if(/machine|leg press|hack squat|pec deck|preacher curl machine|glute drive|leg extension|leg curl|hip abduction|hip adduction/.test(n)) return "Machine";
    if(/push-up|push up|plank|bird dog|dead bug|bodyweight|bear crawl|donkey kick|glute bridge|wall shoulder|towel row/.test(n)) return "Bodyweight";
    if(/treadmill|bike|elliptical|stair|rowing machine|ski erg|jump rope/.test(n)) return "Cardio";
    return "Gym";
  };
  SN.secondary = muscle => ({Chest:["Triceps","Shoulders"],Back:["Biceps","Rear Delts"],Shoulders:["Triceps","Upper Back"],"Rear Delts":["Upper Back","Shoulders"],Biceps:["Forearms"],Triceps:["Shoulders"],Legs:["Quads","Hamstrings","Glutes"],Quads:["Glutes","Hamstrings"],Hamstrings:["Glutes","Lower Back"],Glutes:["Hamstrings","Quads"],Calves:["Lower Legs"],Core:["Obliques","Lower Back"],"Full Body":["Core","Legs"],Cardio:["Legs","Core"]}[muscle]||[]);
  SN.meta = ex => { const equipment=SN.equipment(ex); const home=equipment==="Bodyweight"||/backpack|bottle|towel/.test(String(ex?.name||"").toLowerCase()); return {primary:ex?.muscle||"Other",secondary:SN.secondary(ex?.muscle||"Other"),equipment,location:home?"Home / Gym":"Gym",instructions:ex?.cue||"Use a comfortable range of motion and move every rep with control."}; };
  SN.mistakes = ex => { const m=ex?.muscle||"Other"; if(m==="Chest")return["Letting the shoulders roll forward","Bouncing or shortening the range of motion"]; if(m==="Back")return["Shrugging instead of pulling with the back","Using momentum to move the weight"]; if(["Quads","Legs"].includes(m))return["Rushing the bottom position","Letting the knees collapse inward"]; if(["Hamstrings","Glutes"].includes(m))return["Rounding the lower back","Turning a hinge into a squat"]; if(["Biceps","Triceps"].includes(m))return["Moving the elbows too much","Using body momentum"]; return["Rushing the lowering phase","Using a load that makes form break down"]; };
  SN.alternatives = (ex,limit=6) => exerciseLibrary.filter(c=>!SN.exerciseMatches(c,ex)&&c.muscle===ex.muscle).sort((a,b)=>(SN.equipment(b)===SN.equipment(ex))-(SN.equipment(a)===SN.equipment(ex))).slice(0,limit);
  SN.exerciseHistory = ex => SN.sessions().filter(s=>(s.exercises||[]).some(e=>SN.exerciseMatches(e,ex))).sort((a,b)=>b.timestamp-a.timestamp);
  SN.previousExercise = ex => { const s=SN.exerciseHistory(ex)[0]; const result=(s?.exercises||[]).find(e=>SN.exerciseMatches(e,ex)); return result?{session:s,result}:null; };
  SN.previousExerciseNote = ex => {
    for (const session of SN.exerciseHistory(ex)) {
      const result=(session.exercises||[]).find(e=>SN.exerciseMatches(e,ex));
      const note=SN.normalizeExerciseNote(result?.note).trim();
      if(note) return {session,result,note};
    }
    return null;
  };
  SN.previousWorkout = workout => SN.sessions().filter(s=>s.workoutId===workout?.id||s.workoutName===workout?.name).sort((a,b)=>b.timestamp-a.timestamp)[0]||null;
  SN.formatSets = result => (result?.sets||[]).filter(s=>s.done).slice(0,4).map(s=>SN.num(s.weight)>0?`${SN.round1(s.weight)} lb × ${SN.num(s.reps)}`:`${SN.num(s.reps)} reps`).join(" • ")||"No completed sets last time";

  SN.progression = ex => {
    const history=SN.exerciseHistory(ex).slice(0,2), range=SN.repRange(ex);
    if(!history.length) return {title:"Build a baseline",detail:`Use a manageable load and aim for ${range.min}-${range.max} controlled reps. START/NOW will compare this next time.`};
    const current=(history[0].exercises||[]).find(e=>SN.exerciseMatches(e,ex)), sets=(current?.sets||[]).filter(s=>s.done);
    if(!sets.length) return {title:"Complete the planned sets",detail:"Keep the load comfortable and focus on finishing the working sets with good form."};
    const avg=sets.reduce((a,s)=>a+SN.num(s.reps),0)/sets.length, weight=Math.max(0,...sets.map(s=>SN.num(s.weight)));
    let twice=false; if(history.length>1){ const p=(history[1].exercises||[]).find(e=>SN.exerciseMatches(e,ex)); const ps=(p?.sets||[]).filter(s=>s.done); twice=ps.length>0&&ps.every(s=>SN.num(s.reps)>=range.max); }
    const weighted=weight>0&&!(["Bodyweight","Cardio"].includes(SN.equipment(ex)));
    if(weighted&&sets.every(s=>SN.num(s.reps)>=range.max)&&twice){ const inc=/leg press|hack squat|deadlift|squat/i.test(ex.name)?10:5; return {title:"Small weight increase may be ready",detail:`You reached the top of the range in two recent sessions. If your form felt solid, try ${weight+inc} lb and stay within ${range.min}-${range.max} reps.`,weight:weight+inc}; }
    if(avg<range.max) return {title:"Progress with reps first",detail:`Keep roughly the same load and try to add a controlled rep where you can until you reach ${range.max}.`};
    return {title:"Repeat a strong performance",detail:"Keep the load steady and make the reps clean and consistent. You do not need to increase weight every workout."};
  };

  SN.gradeLetter = score => { score=Math.round(SN.clamp(score)); if(score>=97)return"A+";if(score>=93)return"A";if(score>=90)return"A-";if(score>=87)return"B+";if(score>=83)return"B";if(score>=80)return"B-";if(score>=77)return"C+";if(score>=73)return"C";if(score>=70)return"C-";if(score>=60)return"D";return"F"; };
  SN.setTargetScore = (ex,set) => { if(!set.done)return 0; const r=SN.repRange(ex),reps=SN.num(set.reps); if(reps>=r.min&&reps<=r.max)return 100; if(reps<r.min)return SN.clamp((reps/r.min)*100); return Math.max(75,100-(reps-r.max)*5); };
  SN.performanceScore = (session,prior) => { if(!prior)return 82; let values=[]; (session.exercises||[]).forEach(ex=>{const old=(prior.exercises||[]).find(e=>SN.exerciseMatches(e,ex));if(!old)return;const v=(ex.sets||[]).filter(s=>s.done).reduce((a,s)=>a+SN.num(s.weight)*SN.num(s.reps),0);const pv=(old.sets||[]).filter(s=>s.done).reduce((a,s)=>a+SN.num(s.weight)*SN.num(s.reps),0);if(!pv)return;const ratio=v/pv;values.push(ratio>=1.03?100:ratio>=.95?90:ratio>=.85?78:65);}); return values.length?Math.round(values.reduce((a,b)=>a+b,0)/values.length):82; };
  SN.calculateGrade = session => { const prior=SN.sessions().filter(s=>s.workoutId===session.workoutId).sort((a,b)=>b.timestamp-a.timestamp)[0]||null;let planned=0,done=0,target=0,targetN=0,exerciseDone=0,logging=0;(session.exercises||[]).forEach((ex,i)=>{const p=ex.originalPlannedSets||ex.plannedSets||ex.sets?.length||1;planned+=p;const ds=(ex.sets||[]).slice(0,p).filter(s=>s.done);done+=ds.length;if(ds.length)exerciseDone+=i<2?1.15:1;ds.forEach(s=>{target+=SN.setTargetScore(ex,s);targetN++;if(SN.num(s.reps)>0)logging++;});});const completion=planned?done/planned*100:0, repTarget=targetN?target/targetN:0, exerciseMax=(session.exercises||[]).reduce((a,_,i)=>a+(i<2?1.15:1),0), exerciseCompletion=exerciseMax?exerciseDone/exerciseMax*100:0, logScore=done?logging/done*100:0,performance=SN.performanceScore(session,prior);const score=Math.round(completion*.45+repTarget*.25+exerciseCompletion*.15+performance*.10+logScore*.05);return {score:SN.clamp(score),letter:SN.gradeLetter(score),completion:Math.round(completion),repTarget:Math.round(repTarget),exerciseCompletion:Math.round(exerciseCompletion),performance:Math.round(performance),logging:Math.round(logScore),planned,done}; };

  SN.detectPRs = (session,priorSessions) => { const prs=[];(session.exercises||[]).forEach(ex=>{const old=priorSessions.flatMap(s=>s.exercises||[]).filter(e=>SN.exerciseMatches(e,ex)), oldSets=old.flatMap(e=>(e.sets||[]).filter(s=>s.done));const sets=(ex.sets||[]).filter(s=>s.done);if(!sets.length)return;const maxW=Math.max(...sets.map(s=>SN.num(s.weight)),0),oldW=Math.max(0,...oldSets.map(s=>SN.num(s.weight)));if(maxW>0&&maxW>oldW)prs.push({type:"Heaviest weight",exercise:ex.name,value:`${SN.round1(maxW)} lb`});const est=Math.max(...sets.map(s=>SN.num(s.weight)*(1+SN.num(s.reps)/30)),0),oldEst=Math.max(0,...oldSets.map(s=>SN.num(s.weight)*(1+SN.num(s.reps)/30)));if(est>0&&est>oldEst*1.01)prs.push({type:"Estimated strength PR",exercise:ex.name,value:`~${Math.round(est)} lb`});const vol=sets.reduce((a,s)=>a+SN.num(s.weight)*SN.num(s.reps),0),oldVol=Math.max(0,...old.map(e=>SN.num(e.volume)));if(vol>0&&vol>oldVol)prs.push({type:"Exercise volume PR",exercise:ex.name,value:`${Math.round(vol).toLocaleString()} lb`});});const oldWorkoutVol=Math.max(0,...priorSessions.filter(s=>s.workoutId===session.workoutId).map(s=>SN.num(s.volume)));if(session.volume>0&&session.volume>oldWorkoutVol)prs.push({type:"Workout volume PR",exercise:session.workoutName,value:`${Math.round(session.volume).toLocaleString()} lb`});return prs.slice(0,8); };

  SN.scheduleDays = () => new Set((state.customWorkouts||[]).flatMap(w=>w.days||[]));
  SN.streak = sessions => { const completed=new Set((sessions||SN.sessions()).map(s=>SN.dayKey(s.timestamp))),schedule=SN.scheduleDays();if(!completed.size)return 0;let d=new Date(),streak=0;for(let i=0;i<365;i++){const name=SN.days[d.getDay()],key=SN.dayKey(d);if(schedule.size&&schedule.has(name)){if(i===0&&!completed.has(key)){d.setDate(d.getDate()-1);continue;}if(completed.has(key))streak++;else break;}else if(!schedule.size){if(i===0&&!completed.has(key)){d.setDate(d.getDate()-1);continue;}if(completed.has(key))streak++;else break;}d.setDate(d.getDate()-1);}return streak; };
  SN.syncStats = () => { const sessions=SN.sessions(),streak=SN.streak(sessions),best=Math.max(SN.num(localStorage.getItem(SN.keys.bestStreak)),0,streak);localStorage.setItem("sn_streak",String(streak));localStorage.setItem("sn_completed",String(sessions.length));localStorage.setItem(SN.keys.bestStreak,String(best));state.streak=streak;state.completedWorkouts=sessions.length;return {sessions,streak,best}; };
  SN.overallGrade = () => { const all=SN.sessions().sort((a,b)=>a.timestamp-b.timestamp),recent=all.slice(-12);if(!recent.length)return null;let weighted=0,total=0;recent.forEach((s,i)=>{const w=i+1;weighted+=SN.num(s.grade,75)*w;total+=w;});const quality=weighted/total,schedule=SN.scheduleDays();let adherence=100;if(schedule.size){const cutoff=Date.now()-30*86400000,done=new Set(all.filter(s=>s.timestamp>=cutoff).map(s=>SN.dayKey(s.timestamp)));let planned=0,hit=0;for(let d=new Date(cutoff);d<=new Date();d.setDate(d.getDate()+1)){if(schedule.has(SN.days[d.getDay()])){planned++;if(done.has(SN.dayKey(d)))hit++;}}adherence=planned?hit/planned*100:100;}const score=Math.round(quality*.82+adherence*.18);return {score,letter:SN.gradeLetter(score),quality:Math.round(quality),adherence:Math.round(adherence)}; };
})();
