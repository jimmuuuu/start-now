const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {execFileSync} = require('node:child_process');
const root = path.resolve(__dirname, '..');
const out = path.join(root, 'dist');
// Keep the checked-in browser dependency tied to the reproducible npm lockfile.
const vendor = fs.readFileSync(path.join(root,'node_modules/@supabase/supabase-js/dist/umd/supabase.js'));
if (vendor.toString().replace(/\r\n/g,'\n') !== fs.readFileSync(path.join(root,'third-party/supabase.js'),'utf8').replace(/\r\n/g,'\n')) throw new Error('Supabase browser bundle differs from the installed lockfile; update third-party/supabase.js');
const index = fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts = [...index.matchAll(/<script src="([^"?]+)[^"]*"/g)].map(m=>m[1]);
for (const file of scripts) {
  if (/^https?:/.test(file)) throw new Error(`Unpinned remote runtime: ${file}`);
  execFileSync(process.execPath,['--check',path.join(root,file)]);
}
if (process.argv.includes('--check')) { console.log(`${scripts.length} active scripts passed syntax checks`); process.exit(0); }
fs.mkdirSync(out,{recursive:true});
const files = fs.readdirSync(root).filter(f=>/\.(js|css|html|webmanifest)$/.test(f));
for (const f of files) fs.copyFileSync(path.join(root,f),path.join(out,f));
for (const dir of ['assets','third-party']) fs.cpSync(path.join(root,dir),path.join(out,dir),{recursive:true});
// Give every active script/style a content-derived URL, including edits to older modules.
const versioned = index.replace(/((?:src|href)=")([^"?]+)(?:\?[^" ]*)?"/g,(all,prefix,file)=>{
  const source = path.join(root,file);
  if (!fs.existsSync(source) || !fs.statSync(source).isFile()) return all;
  const hash = crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex').slice(0,12);
  return `${prefix}${file}?v=${hash}"`;
});
fs.writeFileSync(path.join(out,'index.html'),versioned);
const manifest = JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
const shell = [...new Set(['./','./index.html','./privacy.html','./support.html','./assets/fonts/inter-latin-wght-normal.woff2',...manifest.icons.map(icon=>icon.src),...[...versioned.matchAll(/(?:src|href)="([^"#]+)"/g)].map(m=>'./'+m[1])])];
let sw = fs.readFileSync(path.join(root,'sw.js'),'utf8');
const hash = crypto.createHash('sha256').update(versioned).digest('hex').slice(0,12);
sw = sw.replace(/const CACHE_NAME = [^;]+;/,`const CACHE_NAME = 'start-now-shell-${hash}';`).replace(/const APP_SHELL = \[[\s\S]*?\];/,`const APP_SHELL = ${JSON.stringify(shell,null,2)};`);
fs.writeFileSync(path.join(out,'sw.js'),sw);
console.log(`Production build: ${scripts.length} checked scripts, content-versioned assets, complete offline shell → dist`);
