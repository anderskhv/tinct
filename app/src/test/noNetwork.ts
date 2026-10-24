import net from 'node:net'

// Every Vitest worker starts without a real network escape hatch. Tests may
// replace fetch with an explicit in-memory response, but an omitted mock must
// fail immediately rather than call a production or provider endpoint.
globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url
  const method = init?.method ?? (input instanceof Request ? input.method : 'GET')
  // Strip query strings, URL credentials and fragments from failure output.
  // A future mistaken request must not print a token embedded in its URL.
  let endpoint = '[invalid URL]'
  try {
    const parsed = new URL(url, 'http://unit.invalid')
    endpoint = `${parsed.origin === 'http://unit.invalid' ? '' : parsed.origin}${parsed.pathname}`
  } catch { /* Keep the safe placeholder. */ }
  throw new Error(`Real network is blocked in Vitest: ${method} ${endpoint}`)
}

// SDKs may bypass fetch and use Node's http/https client. Both ultimately
// connect through Socket; block them too, including loopback, in unit tests.
net.Socket.prototype.connect = function (): net.Socket {
  throw new Error('Real socket is blocked in Vitest')
} as typeof net.Socket.prototype.connect
