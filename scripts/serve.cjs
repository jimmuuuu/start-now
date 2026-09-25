// Local verification server. Production hosts should serve dist over HTTPS.
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
function createServer(directory) {
  const root = path.resolve(directory);
  const mime = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json",
    ".webmanifest": "application/manifest+json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".mp4": "video/mp4",
  };
  return http.createServer((req, res) => {
    try {
      const name = decodeURIComponent(
        new URL(req.url, "http://localhost").pathname,
      );
      const file = path.resolve(
        root,
        "." + (name.endsWith("/") ? name + "index.html" : name),
      );
      if (
        !file.startsWith(root + path.sep) ||
        name.split("/").some((part) => part.startsWith(".")) ||
        !fs.existsSync(file) ||
        !fs.statSync(file).isFile()
      ) {
        res.writeHead(404);
        res.end("Not found");
        return;
      }
      res.writeHead(200, {
        "Content-Type": mime[path.extname(file)] || "application/octet-stream",
        "Cache-Control": "no-cache",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      });
      fs.createReadStream(file).pipe(res);
    } catch {
      res.writeHead(400);
      res.end("Bad request");
    }
  });
}
module.exports = createServer;
if (require.main === module) {
  const directory = process.argv[2] || ".";
  createServer(directory).listen(
    Number(process.env.PORT || 4173),
    "127.0.0.1",
    () => console.log(`Serving ${path.resolve(directory)}`),
  );
}
