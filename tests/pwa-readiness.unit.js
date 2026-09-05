const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file));
const text = file => read(file).toString('utf8');

const manifest = JSON.parse(text('manifest.webmanifest'));
assert.strictEqual(manifest.name, 'Level Up Fitness');
assert.strictEqual(manifest.start_url, './');
assert.strictEqual(manifest.scope, './');
assert.ok(['standalone', 'fullscreen'].includes(manifest.display), 'Manifest must launch as an app');
assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 3, 'Manifest needs install icons');

const iconBySize = size => manifest.icons.find(icon => String(icon.sizes).split(/\s+/).includes(size));
assert.ok(iconBySize('192x192'), '192x192 PWA icon is required');
assert.ok(iconBySize('512x512'), '512x512 PWA icon is required');
assert.ok(manifest.icons.some(icon => String(icon.purpose || '').split(/\s+/).includes('maskable')), 'Maskable PWA icon is required');

function pngSize(relativePath) {
  const clean = relativePath.replace(/^\.\//, '');
  const file = read(clean);
  assert.strictEqual(file.subarray(1, 4).toString('ascii'), 'PNG', `${clean} must be a PNG`);
  return { width: file.readUInt32BE(16), height: file.readUInt32BE(20) };
}

for (const icon of manifest.icons) {
  const clean = icon.src.replace(/^\.\//, '');
  assert.ok(fs.existsSync(path.join(root, clean)), `Missing manifest icon: ${clean}`);
  const declared = String(icon.sizes || '').match(/^(\d+)x(\d+)$/);
  if (declared) {
    const actual = pngSize(icon.src);
    assert.strictEqual(actual.width, Number(declared[1]), `${clean} width does not match manifest`);
    assert.strictEqual(actual.height, Number(declared[2]), `${clean} height does not match manifest`);
  }
}

const index = text('index.html');
assert.match(index, /rel="manifest"[^>]+manifest\.webmanifest/, 'index.html must link the manifest');
assert.match(index, /rel="apple-touch-icon"/, 'iOS Home Screen icon is required');
assert.match(index, /pwa-install-v112\.js/, 'PWA install bootstrap must be loaded');
assert.doesNotMatch(index, /getRegistrations\(\)[\s\S]{0,300}unregister\(/, 'App updates must not unregister the installed PWA');

const bootstrap = text('pwa-install-v112.js');
assert.match(bootstrap, /serviceWorker\.register/, 'PWA bootstrap must register the service worker');
assert.match(bootstrap, /beforeinstallprompt/, 'PWA bootstrap must support native install prompting');
assert.match(bootstrap, /Add to Home Screen/, 'PWA bootstrap must include iOS install guidance');

const sw = text('sw.js');
for (const eventName of ['install', 'activate', 'fetch']) {
  assert.match(sw, new RegExp(`addEventListener\\(['"]${eventName}['"]`), `Service worker is missing ${eventName} handling`);
}
assert.match(sw, /cache:\s*['"]no-store['"]/, 'Navigation fetches should bypass stale HTTP cache');
assert.match(sw, /caches\.match/, 'Service worker needs an offline cache fallback');

const appleIcon = path.join(root, 'assets/pwa/apple-touch-icon.png');
assert.ok(fs.existsSync(appleIcon), 'Apple touch icon is missing');
const appleSize = pngSize('./assets/pwa/apple-touch-icon.png');
assert.deepStrictEqual(appleSize, { width: 180, height: 180 }, 'Apple touch icon must be 180x180');

console.log('PWA readiness checks passed.');
