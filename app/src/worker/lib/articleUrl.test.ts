import { describe, expect, it } from 'vitest'
import { checkArticleUrl, isBlockedHost } from './articleUrl'

const refused = (raw: string) => { const r = checkArticleUrl(raw); return r.ok ? null : r.code }

describe('article links Tinct may open (SSRF guard)', () => {
  it('accepts public http and https pages and drops the fragment', () => {
    const r = checkArticleUrl('  https://www.example.org/2026/11/otters?ref=home#comments ')
    expect(r.ok && r.url.href).toBe('https://www.example.org/2026/11/otters?ref=home')
    expect(checkArticleUrl('http://blog.example.co.uk/post').ok).toBe(true)
    expect(checkArticleUrl('https://93.184.215.14/page').ok).toBe(true)
    expect(checkArticleUrl('https://[2606:2800:21f:cb07:6820:80da:af6b:8b2c]/').ok).toBe(true)
  })

  it('refuses what is not a single http(s) link', () => {
    for (const raw of ['', 'not a link', 'https://exa mple.org/', 'ftp://example.org/file', 'file:///etc/passwd', 'javascript:alert(1)', 'data:text/html,hi', 'https://user:pass@example.org/', 'x'.repeat(10) + 'https://example.org/' + 'a'.repeat(2100)])
      expect(refused(raw)).toBe('bad_url')
    expect(refused(42 as unknown as string)).toBe('bad_url')
  })

  it('refuses localhost and local-network names', () => {
    for (const raw of ['http://localhost/', 'http://LOCALHOST./admin', 'http://app.localhost/', 'http://printer.local/', 'http://metadata.google.internal/computeMetadata/v1/', 'http://router.home.arpa/', 'http://nas.lan/', 'http://intranet/', 'http://metadata/'])
      expect(refused(raw)).toBe('blocked_host')
  })

  it('refuses private, loopback, link-local and metadata IPv4 in every spelling', () => {
    for (const raw of ['http://127.0.0.1/', 'http://127.1.2.3/', 'http://2130706433/', 'http://0x7f000001/', 'http://0177.0.0.1/', 'http://0.0.0.0/', 'http://10.0.0.5/', 'http://172.16.0.1/', 'http://172.31.255.255/', 'http://192.168.1.1/', 'http://169.254.169.254/latest/meta-data/', 'http://100.64.0.1/', 'http://224.0.0.1/', 'http://255.255.255.255/'])
      expect(refused(raw)).toBe('blocked_host')
    expect(isBlockedHost('172.15.0.1')).toBe(false)
    expect(isBlockedHost('172.32.0.1')).toBe(false)
  })

  it('refuses IPv6 loopback, unique-local, link-local and IPv4 carried inside IPv6', () => {
    for (const raw of ['http://[::1]/', 'http://[::]/', 'http://[0:0:0:0:0:0:0:1]/', 'http://[fd00::1]/', 'http://[fc00:1::2]/', 'http://[fe80::1]/', 'http://[ff02::1]/', 'http://[::ffff:127.0.0.1]/', 'http://[::ffff:169.254.169.254]/', 'http://[::ffff:10.0.0.1]/', 'http://[64:ff9b::a9fe:a9fe]/', 'http://[2002:7f00:1::]/'])
      expect(refused(raw)).toBe('blocked_host')
  })

  it('refuses ports other than the default and Tinct itself', () => {
    expect(refused('http://example.org:8080/')).toBe('blocked_host')
    expect(refused('https://example.org:22/')).toBe('blocked_host')
    expect(checkArticleUrl('https://example.org:443/').ok).toBe(true)
    expect(refused('https://tinct.app/api/user-books')).toBe('blocked_host')
    expect(refused('https://www.tinct.app/')).toBe('blocked_host')
  })
})
