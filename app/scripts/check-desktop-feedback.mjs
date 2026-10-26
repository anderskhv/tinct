// Run the production reader interaction checks against isolated built files in CI.
import { createServer } from 'node:http'
import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import path from 'node:path'

const dist = path.resolve('dist')
const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1')
  const file = path.resolve(dist, '.' + (url.pathname === '/reader' ? '/app.html' : url.pathname))
  if (!file.startsWith(dist + path.sep)) { res.writeHead(403); res.end(); return }
  try {
    const body = await fs.readFile(file)
    const mime = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.woff2':'font/woff2', '.svg':'image/svg+xml', '.wasm':'application/wasm' }[path.extname(file)] || 'application/octet-stream'
    res.writeHead(200, { 'Content-Type': mime }); res.end(body)
  } catch { res.writeHead(404); res.end() }
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
try {
  for (const script of ['check-shared-reader-menu.mjs', 'check-shared-reader-position.mjs', 'check-reader-source-parity.mjs']) {
    await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [`scripts/${script}`], { stdio:'inherit', env: { ...process.env,
        TINCT_ORIGIN:`http://127.0.0.1:${server.address().port}`,
        TINCT_POSITION_OUTPUT:'artifacts/desktop-feedback/position', TINCT_PARITY_OUTPUT:'artifacts/desktop-feedback/parity',
      } })
      child.on('error', reject)
      child.on('exit', code => code === 0 ? resolve() : reject(new Error(`${script} exited ${code}`)))
    })
  }
} finally { await new Promise(resolve => server.close(resolve)) }
