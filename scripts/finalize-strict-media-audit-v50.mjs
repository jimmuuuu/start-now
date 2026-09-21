import fs from 'node:fs/promises';

const audit=JSON.parse(await fs.readFile('EXERCISE_MEDIA_ADDITIONAL_AUDIT_V49.json','utf8'));
const staged=JSON.parse(await fs.readFile('exercise-media-map-pending-v49.json','utf8'));

// Final human-safety/accuracy review: do not approve a provider equipment variant
// when START/NOW's generic exercise name does not establish that same setup.
const DEMOTE={
  't-bar-row':'START/NOW says generic T-Bar Row, while the staged provider match is a lever-machine T-bar row. Because the app does not specify that machine setup, this is not strict enough to auto-approve.'
};

const approved=staged.filter(x=>!DEMOTE[x.appId]);
const demoted=staged.filter(x=>DEMOTE[x.appId]).map(x=>({...x,verified:false,reviewStatus:'needs-explicit-review',reviewReason:DEMOTE[x.appId]}));
const approvedIds=new Set(approved.map(x=>x.appId));
const originalMissing=audit.rows.filter(r=>!r.approvedMatch).map(r=>r.appId);
const missingIds=new Set([...originalMissing,...demoted.map(x=>x.appId)]);
const allRows=audit.rows.map(r=>{
  if(DEMOTE[r.appId]) return {...r,approvedMatch:null,finalStatus:'missing',finalReviewReason:DEMOTE[r.appId]};
  if(approvedIds.has(r.appId)) return {...r,finalStatus:'approved'};
  return {...r,finalStatus:'missing'};
});
const missing=allRows.filter(r=>missingIds.has(r.appId));

const counts={
  totalExercises:250,
  exerciseDBApproved:85+approved.length,
  freeExerciseDBApproved:58,
  newlyApprovedExerciseDB:approved.length,
  workoutXApproved:0,
  moveBaseApproved:0,
  wgerApproved:0,
  otherLicensedApproved:0,
  stillMissing:missing.length,
  accountedDemonstrations:250-missing.length,
  accountedCoveragePercent:Number(((250-missing.length)/250*100).toFixed(2)),
  verifiedWorkingGifCount:85+approved.length,
  verifiedWorkingGifPercent:Number(((85+approved.length)/250*100).toFixed(2))
};

const out={
  generatedAt:new Date().toISOString(),
  standard:'strict same-exercise, same-equipment-setup where specified; no approximate movement approval',
  counts,
  approvedMappings:approved,
  demotedMappings:demoted,
  rows:allRows,
  remainingMissing:missing.map(x=>({appId:x.appId,appName:x.appName,equipment:x.equipment,primaryMuscles:x.primaryMuscles,status:'missing'}))
};
await fs.writeFile('exercise-media-map-pending-v50.json',JSON.stringify(approved,null,2)+'\n');
await fs.writeFile('EXERCISE_MEDIA_FINAL_AUDIT_V50.json',JSON.stringify(out,null,2)+'\n');

const md=`# START/NOW Exercise Media Audit — strict final pass v50\n\nNo live app files are changed by this audit. These mappings remain staged on the audit branch.\n\n## Coverage\n\n- Total exercises: **250**\n- ExerciseDB approved GIFs: **${counts.exerciseDBApproved}** (${85} existing + ${approved.length} newly approved)\n- Free Exercise DB approved start/end demonstrations: **58**\n- MoveBase approved: **0**\n- WorkoutX approved: **0**\n- wger approved: **0**\n- Other licensed sources approved: **0**\n- Still missing: **${counts.stillMissing}**\n- Accounted accurate demonstrations: **${counts.accountedDemonstrations} / 250 (${counts.accountedCoveragePercent}%)**\n- Verified working GIFs specifically: **${counts.verifiedWorkingGifCount} / 250 (${counts.verifiedWorkingGifPercent}%)**\n\n## Final strictness correction\n${demoted.length?demoted.map(x=>`- ${x.appExercise}: ${x.reviewReason}`).join('\n'):'None'}\n\n## Newly approved ExerciseDB GIFs\n${approved.map(x=>`- ✓ ${x.appExercise} → ${x.providerExerciseId}`).join('\n')||'None'}\n\n## Still missing\n${missing.map(x=>`- ${x.appName}`).join('\n')||'None'}\n`;
await fs.writeFile('EXERCISE_MEDIA_FINAL_AUDIT_V50.md',md);
console.log(`[v50] approved new=${approved.length} demoted=${demoted.length} remaining=${missing.length} accounted=${counts.accountedDemonstrations}/250`);
