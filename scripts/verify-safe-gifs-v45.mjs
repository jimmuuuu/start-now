import fs from 'node:fs/promises';

const diagnostic = JSON.parse(await fs.readFile('EXERCISE_MEDIA_DIAGNOSTIC_V45.json','utf8'));
const rows = diagnostic.rows.filter(row => row.safeMatch?.gifUrl);
const results = [];

async function verify(row) {
  const url = row.safeMatch.gifUrl;
  try {
    const response = await fetch(url, { headers: { Range: 'bytes=0-2047', Accept: 'image/gif,*/*' } });
    const type = response.headers.get('content-type') || '';
    const ok = (response.ok || response.status === 206) && (/image\/gif/i.test(type) || /octet-stream/i.test(type));
    await response.body?.cancel?.();
    return { id: row.id, name: row.name, providerName: row.safeMatch.name, url, ok, status: response.status, contentType: type };
  } catch (error) {
    return { id: row.id, name: row.name, providerName: row.safeMatch.name, url, ok: false, error: String(error?.message || error) };
  }
}

for (let i=0; i<rows.length; i+=10) {
  results.push(...await Promise.all(rows.slice(i,i+10).map(verify)));
}

const working = results.filter(x=>x.ok);
const broken = results.filter(x=>!x.ok);
const report = {
  generatedAt: new Date().toISOString(),
  totalExercises: diagnostic.total,
  safelyMapped: rows.length,
  workingGifUrls: working.length,
  brokenGifUrls: broken.length,
  stillUnmapped: diagnostic.unresolved,
  verifiedRuntimeCoveragePercent: Number((working.length/diagnostic.total*100).toFixed(2)),
  results
};

await fs.writeFile('EXERCISE_MEDIA_LOAD_CHECK_V45.json', JSON.stringify(report,null,2),'utf8');
await fs.writeFile('EXERCISE_MEDIA_LOAD_CHECK_V45.md', `# Exercise GIF load check v45\n\n- Total exercises: **${report.totalExercises}**\n- Safely mapped to provider GIF: **${report.safelyMapped}**\n- GIF URLs that loaded successfully: **${report.workingGifUrls}**\n- Broken mapped GIF URLs: **${report.brokenGifUrls}**\n- Still without approved mapping: **${report.stillUnmapped}**\n- Confirmed working-GIF coverage: **${report.verifiedRuntimeCoveragePercent}%**\n\n## Broken\n${broken.length ? broken.map(x=>`- ${x.name} → ${x.providerName} — ${x.status || x.error}`).join('\n') : 'None'}\n`,'utf8');

console.log(`[load-check] working=${working.length}/${rows.length}; broken=${broken.length}; overall=${report.verifiedRuntimeCoveragePercent}%`);
if (broken.length) process.exitCode = 1;
