import fs from 'node:fs/promises';

const load = JSON.parse(await fs.readFile('EXERCISE_MEDIA_LOAD_CHECK_V45.json','utf8'));
const backup = JSON.parse(await fs.readFile('EXERCISE_MEDIA_BACKUP_DIAGNOSTIC_V46.json','utf8'));

const total = Number(load.totalExercises || 0);
const workingGifs = Number(load.workingGifUrls || 0);
const broken = Number(load.brokenGifUrls || 0);
const pendingBackupPairs = Number(backup.matched || 0); // start/end JPG pairs are NOT counted as GIFs yet.
const remainingWithoutApprovedMedia = Number(backup.stillUnresolved || 0);

console.log(`[coverage-gate] total=${total}`);
console.log(`[coverage-gate] working GIFs=${workingGifs}`);
console.log(`[coverage-gate] broken GIFs=${broken}`);
console.log(`[coverage-gate] approved public-domain image pairs awaiting GIF conversion=${pendingBackupPairs}`);
console.log(`[coverage-gate] still without approved media=${remainingWithoutApprovedMedia}`);

if (total !== 250) {
  throw new Error(`Expected the complete 250-exercise START/NOW library, found ${total}.`);
}

if (workingGifs !== total || broken !== 0 || remainingWithoutApprovedMedia !== 0 || pendingBackupPairs !== 0) {
  throw new Error(`FAIL — exercise GIF coverage is not 100%. Working GIFs: ${workingGifs}/${total}; broken: ${broken}; backup pairs not yet GIFs: ${pendingBackupPairs}; still unresolved: ${remainingWithoutApprovedMedia}.`);
}

console.log(`PASS — 100% exercise media coverage (${workingGifs}/${total}), 0 broken, 0 missing.`);
