const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "www");
const allowedFileTypes = new Set([".html", ".css", ".js", ".json", ".webmanifest", ".svg", ".png", ".jpg", ".jpeg", ".webp"]);
const allowedDirs = new Set(["assets", "third-party"]);
const excludedNames = new Set([".git", ".github", "android", "ios", "node_modules", "scripts", "tests", "www"]);

function resetDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
}

function copyFile(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

function copyDir(from, to) {
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);
    if (entry.isDirectory()) {
      copyDir(source, target);
      continue;
    }
    copyFile(source, target);
  }
}

resetDir(outDir);

for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  if (excludedNames.has(entry.name)) continue;
  const source = path.join(root, entry.name);
  const target = path.join(outDir, entry.name);

  if (entry.isDirectory()) {
    if (allowedDirs.has(entry.name)) copyDir(source, target);
    continue;
  }

  if (allowedFileTypes.has(path.extname(entry.name))) {
    copyFile(source, target);
  }
}

console.log("Prepared native web assets in www");
