/**
 * Which links Tinct's server may open for "import an article" (routes/importArticle.ts).
 *
 * Only a public web page: http or https, the default port, no user name or password in the link, and a
 * host that is a public name or a public IP address. Loopback, private, link-local (including the cloud
 * metadata address 169.254.169.254), carrier-grade NAT, multicast and reserved ranges are refused, in
 * IPv4 and IPv6 (and IPv4 written inside IPv6), as are single-label names and the local-network suffixes
 * (localhost, .local, .internal, .home.arpa, .lan). Every redirect is checked again (articleFetch.ts).
 *
 * The WHATWG URL parser already turns the other spellings of an IPv4 address (2130706433, 0x7f.1,
 * 0177.0.0.1) into dotted decimal and compresses IPv6, so the checks below see one form. A public name
 * that resolves to a private address is left to Cloudflare, whose Workers cannot reach private networks.
 */

export type UrlRefusal = 'bad_url' | 'blocked_host'
export type CheckedUrl = { ok: true; url: URL } | { ok: false; code: UrlRefusal }

/** Hosts Tinct serves itself: importing them would only loop back into the Worker. */
export const OWN_HOSTS = ['tinct.app', 'tinct.ahvelplund.workers.dev']

const BLOCKED_SUFFIXES = ['localhost', 'local', 'internal', 'home.arpa', 'lan', 'intranet', 'localdomain', 'onion', 'test', 'invalid', 'example']

function ipv4Parts(host: string): number[] | null {
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host)
  if (!m) return null
  const parts = m.slice(1).map(Number)
  return parts.every(n => n <= 255) ? parts : null
}

/** True for an IPv4 address outside the public unicast space. */
export function isPrivateIPv4(parts: number[]): boolean {
  const [a, b, c] = parts
  return a === 0 // "this network"
    || a === 10
    || (a === 100 && b >= 64 && b <= 127) // carrier-grade NAT
    || a === 127
    || (a === 169 && b === 254) // link-local, cloud metadata
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 0 && (c === 0 || c === 2))
    || (a === 192 && b === 88 && c === 99)
    || (a === 192 && b === 168)
    || (a === 198 && (b === 18 || b === 19))
    || (a === 198 && b === 51 && c === 100)
    || (a === 203 && b === 0 && c === 113)
    || a >= 224 // multicast, reserved, broadcast
}

/** The eight 16-bit groups of an IPv6 address (without brackets), or null. */
function ipv6Groups(host: string): number[] | null {
  let text = host
  // An IPv4 tail ("::ffff:1.2.3.4"); the URL parser normally rewrites it as hex already.
  const tail = /^(.*:)(\d{1,3}(?:\.\d{1,3}){3})$/.exec(text)
  if (tail) {
    const v4 = ipv4Parts(tail[2])
    if (!v4) return null
    text = tail[1] + ((v4[0] << 8) | v4[1]).toString(16) + ':' + ((v4[2] << 8) | v4[3]).toString(16)
  }
  const halves = text.split('::')
  if (halves.length > 2) return null
  const read = (part: string) => (part ? part.split(':') : []).map(g => (/^[0-9a-f]{1,4}$/i.test(g) ? parseInt(g, 16) : NaN))
  const head = read(halves[0])
  const rest = halves.length === 2 ? read(halves[1]) : []
  if ([...head, ...rest].some(Number.isNaN)) return null
  const missing = 8 - head.length - rest.length
  if (halves.length === 1 ? missing !== 0 : missing < 1) return null
  return [...head, ...Array(halves.length === 2 ? missing : 0).fill(0), ...rest]
}

/** True for an IPv6 address outside the public unicast space (or one that carries a private IPv4 address). */
export function isPrivateIPv6(groups: number[]): boolean {
  const [g0, g1, g2, , , g5, g6, g7] = groups
  const v4 = [g6 >> 8, g6 & 255, g7 >> 8, g7 & 255]
  if (groups.slice(0, 6).every(g => g === 0)) return true // ::, ::1 and the old IPv4-compatible form
  if (groups.slice(0, 5).every(g => g === 0) && g5 === 0xffff) return isPrivateIPv4(v4) // ::ffff:a.b.c.d
  if (g0 === 0x64 && g1 === 0xff9b) return isPrivateIPv4(v4) // NAT64
  if ((g0 & 0xfe00) === 0xfc00) return true // unique local fc00::/7
  if ((g0 & 0xffc0) === 0xfe80) return true // link-local fe80::/10
  if ((g0 & 0xff00) === 0xff00) return true // multicast
  if (g0 === 0x2001 && g1 === 0x0db8) return true // documentation
  if (g0 === 0x2002) return isPrivateIPv4([g1 >> 8, g1 & 255, g2 >> 8, g2 & 255]) // 6to4
  if (g0 === 0x2001 && g1 === 0) return true // Teredo
  return false
}

/** True when a host (as `URL.hostname` gives it) is not a public internet host Tinct may open. */
export function isBlockedHost(hostname: string, ownHosts: string[] = OWN_HOSTS): boolean {
  const host = hostname.toLowerCase().replace(/\.+$/, '')
  if (!host) return true
  if (host.startsWith('[')) {
    const groups = ipv6Groups(host.slice(1, -1))
    return !groups || isPrivateIPv6(groups)
  }
  const v4 = ipv4Parts(host)
  if (v4) return isPrivateIPv4(v4)
  // A name that looks numeric but did not parse as IPv4 is not a real host.
  if (/^[\d.]+$/.test(host) || /^0x/i.test(host)) return true
  if (!host.includes('.')) return true
  const labels = host.split('.')
  if (BLOCKED_SUFFIXES.some(suffix => host === suffix || host.endsWith('.' + suffix))) return true
  if (labels.some(label => !label || label.length > 63)) return true
  return ownHosts.some(own => host === own || host.endsWith('.' + own))
}

/** A link a reader gave, checked: the parsed URL, or why it is refused. */
export function checkArticleUrl(raw: unknown, ownHosts: string[] = OWN_HOSTS): CheckedUrl {
  if (typeof raw !== 'string') return { ok: false, code: 'bad_url' }
  const text = raw.trim()
  if (!text || text.length > 2048 || /\s/.test(text)) return { ok: false, code: 'bad_url' }
  let url: URL
  try { url = new URL(text) } catch { return { ok: false, code: 'bad_url' } }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return { ok: false, code: 'bad_url' }
  if (url.username || url.password) return { ok: false, code: 'bad_url' }
  // Only the default port: a page on a public site never needs another, and it keeps the server from probing ports.
  if (url.port) return { ok: false, code: 'blocked_host' }
  if (isBlockedHost(url.hostname, ownHosts)) return { ok: false, code: 'blocked_host' }
  url.hash = ''
  return { ok: true, url }
}
