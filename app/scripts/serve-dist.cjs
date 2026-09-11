/**
 * A small static server over `dist/` that mirrors the Worker's lab routing
 * for screenshots: files are served as they are, and any path without a
 * file extension falls back to `dist/app.html` (the built SPA shell that
 * `npm run build` renames from index.html).
 *
 * Usage: node scripts/serve-dist.cjs [port] [distDir]
 */

const http = require('node:http')
const { createReadStream, existsSync, statSync } = require('node:fs')
const path = require('node:path')

const PORT = Number(process.argv[2] || 3011)
const DIST = path.resolve(process.argv[3] || path.join(__dirname, '..', 'dist'))

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.webmanifest': 'application/manifest+json',
}

function send(res, file) {
  const ext = path.extname(file).toLowerCase()
  res.writeHead(200, { 'Content-Type': TYPES[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' })
  createReadStream(file).pipe(res)
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://127.0.0.1:${PORT}`)
  let pathname = decodeURIComponent(url.pathname)
  if (pathname.startsWith('/api/')) {
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end('{"error":"no api in the static server"}')
    return
  }
  if (pathname === '/') pathname = '/app.html'
  const candidate = path.join(DIST, pathname)
  if (candidate.startsWith(DIST) && existsSync(candidate) && statSync(candidate).isFile()) {
    send(res, candidate)
    return
  }
  if (!path.extname(pathname)) {
    send(res, path.join(DIST, 'app.html'))
    return
  }
  res.writeHead(404)
  res.end('not found')
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`serving ${DIST} at http://127.0.0.1:${PORT}`)
})
