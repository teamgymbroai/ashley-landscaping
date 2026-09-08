import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = 'C:/Users/NDK Home/projects/ashley-landscaping/site';
const PORT = Number(process.argv[2] || 7788);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.xml': 'application/xml', '.txt': 'text/plain', '.json': 'application/json',
};

http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.normalize(path.join(ROOT, p));
  if (!f.replace(/\\/g, '/').startsWith(ROOT)) { res.writeHead(403).end(); return; }
  fs.readFile(f, (e, buf) => {
    if (e) { res.writeHead(404, { 'Content-Type': 'text/plain' }).end('404'); return; }
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream',
      // nothing here may be cached: a stale index.html is exactly the trap
      // that had the wrong build showing for two rounds of feedback
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      'Expires': '0',
    });
    res.end(buf);
  });
}).listen(PORT, () => console.log('serving ' + ROOT + ' on http://localhost:' + PORT));
