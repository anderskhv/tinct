import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

// tinct.app/terms: the Terms of Service Anders approved (docs/terms-draft-2026-10-05.md),
// published as public/terms.html in the privacy page's design.
const html = readFileSync('public/terms.html', 'utf8')
const privacy = readFileSync('public/privacy.html', 'utf8')
const draft = readFileSync('../docs/terms-draft-2026-10-05.md', 'utf8')

const decode = (s: string) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
const text = (s: string) => decode(s.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim()
const approved = draft.split('\n---\n')[1]
  .split('\n')
  .filter(line => line.trim() && !line.startsWith('**Terms of Service**') && !line.startsWith('Last updated'))
  .map(line => line.replace(/^#{2,3} /, '').replace(/\*\*/g, '').trim())
const main = html.slice(html.indexOf('<main'), html.indexOf('</main>'))
const published = [...main.matchAll(/<(h2|h3|p)\b[^>]*>([\s\S]*?)<\/\1>/g)]
  .filter(match => !/class="(eyebrow|updated)"/.test(match[0]))
  .map(match => text(match[2]))

describe('/terms', () => {
  it('publishes the approved text exactly, every heading and paragraph in order', () => {
    expect(approved.length).toBeGreaterThan(30)
    expect(published).toEqual(approved)
  })

  it('carries none of the draft-only notes', () => {
    expect(main).not.toMatch(/draft|for Anders|Not live|\[date|mockup|Changes from the mockup/i)
    expect(html).toContain('Last updated: 8 October 2026')
  })

  it('numbers the sections 1-10 and anchors each one, so "Terms §4" can link to #section-4', () => {
    const ids = [...main.matchAll(/<section id="(section-\d+)">\s*<h2>(\d+)\./g)].map(match => [match[1], match[2]])
    expect(ids).toEqual(Array.from({ length: 10 }, (_, i) => [`section-${i + 1}`, String(i + 1)]))
    expect(main).toMatch(/<section id="section-4">\s*<h2>4\. Your content and your responsibility for it<\/h2>/)
    // Reporting and removal: a subsection of §4, anchored under it and linked from it.
    const section4 = main.slice(main.indexOf('<section id="section-4">'), main.indexOf('<section id="section-5">'))
    expect(section4).toContain('<h3 id="section-4-reporting">Reporting and removal</h3>')
    expect(section4).toContain('href="#section-4-reporting"')
  })

  it('uses the privacy page design: same stylesheet, fonts, header and footer', () => {
    const block = (page: string, start: string, end: string) => page.slice(page.indexOf(start), page.indexOf(end, page.indexOf(start)) + end.length)
    expect(block(html, '<style>', '</style>')).toBe(block(privacy, '<style>', '</style>'))
    expect(block(html, '<header', '</header>')).toBe(block(privacy, '<header', '</header>'))
    for (const tag of privacy.match(/<link rel="(?:preload|stylesheet|icon)"[^>]*>/g)!) expect(html).toContain(tag)
    expect(html).toContain('<meta name="theme-color" content="#ece7db">')
    const footer = block(html, '<footer', '</footer>')
    for (const href of ['/read', '/about', '/privacy', 'mailto:contact@tinct.app']) expect(footer).toContain(`href="${href}"`)
  })

  it('is self-canonical and indexable, with one h1 and no script (CSP script-src self)', () => {
    expect(html).toContain('<link rel="canonical" href="https://tinct.app/terms">')
    expect(html).toContain('<meta name="robots" content="index, follow">')
    expect(html).toMatch(/<title>Terms of Service — Tinct<\/title>/)
    expect((html.match(/<meta name="description" content="([^"]+)"/)?.[1] ?? '').length).toBeGreaterThanOrEqual(80)
    expect(html.match(/<h1\b/g)).toHaveLength(1)
    expect(html).not.toMatch(/<script\b|\son[a-z]+=/i)
  })

  // Published on its own since 2026-10-08, whatever the AI allowance switch says.
  it('is in the sitemap, built and committed', () => {
    const { buildSitemap } = require('../scripts/generate-sitemap.cjs') as { buildSitemap(books: unknown[], state: object, next: object): string }
    expect(buildSitemap([], {}, {})).toContain('<loc>https://tinct.app/terms</loc>')
    expect(readFileSync('public/sitemap.xml', 'utf8')).toContain('<loc>https://tinct.app/terms</loc>')
  })
})

// Talk and Catch me up on a reader's own book (2026-10-08, after legal review).
describe('own books and the AI features', () => {
  const privacyText = text(privacy)
  it('privacy: names what of an own book each AI feature sends, where the recap is kept, and no training', () => {
    expect(privacyText).not.toContain('Only the passages you ask about are sent to the AI companion, as with any question.')
    expect(privacyText).toContain('Your place in it (the chapter and paragraph, or the page of a PDF, when you read there, and how far through you are, never its title or text) is kept privately in your account too, so it opens where you left off on your other devices; it is deleted with the book.')
    expect(privacyText).toContain('When you use the AI features on a book you added, the relevant text is sent to the provider that powers the feature, as with any book: the passages you ask about, the text around a selection you ask to explain, the chapter being read aloud, the passage you are on while a Talk conversation is open, and, for Catch me up, the chapters you have read so far, one at a time. The recap and narration are kept privately in your account, only for you, and deleted when you remove the book. Nothing from your own books is used to train AI models.')
    // The rest of the own-books paragraph stays.
    expect(privacyText).toContain('If you choose Listen, the text being read is sent to xAI to make the audio')
    expect(privacy).toContain('Last updated: 9 October 2026')
  })

  // Own-book covers stored with the account copy (2026-10-09).
  it('privacy: says a small image of an own book\'s cover is kept privately with its account copy and deleted with it', () => {
    expect(privacyText).toContain('You can remove it from your books at any time, and it is deleted when your account is deleted. A small image of the book\'s cover is kept privately with that copy, so your other devices show it, and is deleted with the book.')
  })

  it('terms §4: own books are processed on the reader’s instruction; the compensation follows Danish law (v3.1)', () => {
    const section4 = published.slice(published.indexOf('4. Your content and your responsibility for it'), published.indexOf('Reporting and removal'))
    expect(section4).toContain('If you add your own books, the AI features process their text on your instruction and only for you. Keep a lawful copy of any book you add.')
    expect(section4).not.toContain('You agree to compensate Tinct for losses caused by your breach of this section, as far as the law allows.')
    expect(section4).toContain('If someone makes a claim against Tinct because of your content or your breach of these terms, you compensate us for the loss and reasonable costs you are responsible for under the general rules of Danish law.')
    expect(published.join(' ')).not.toContain('arise from your content or from your breach of these terms')
  })
})

// In-app account deletion (Anders, 2026-10-09: "Ideally right away in the app").
describe('privacy: account deletion', () => {
  const privacyText = text(privacy)
  it('says the account is deleted at once in Settings → Account, what goes, and that email still works', () => {
    expect(privacyText).toContain('You can delete your account and all associated data yourself in Settings → Account → Delete account. Deletion happens immediately')
    expect(privacyText).toContain('an active subscription is cancelled at once')
    expect(privacyText).toContain('You can also ask for deletion by writing to contact@tinct.app; it is completed within 30 days of the request.')
    expect(privacyText).not.toContain('You may request deletion of your account and all associated data by writing to')
    expect(privacyText).toContain('Deletion: delete your account and all associated data in Settings → Account, or ask us to.')
  })
})

describe('privacy: retention', () => {
  const privacyText = text(privacy)
  it('says the email send record and the reader-data change history are deleted after 24 months, like analytics', () => {
    expect(privacyText).toContain('Account and reading data are kept for as long as your account exists. Analytics events, usage records, the record of the emails we have sent you and the history of changes to your reading data are kept for 24 months and then deleted automatically.')
    expect(privacyText).not.toContain('Analytics events and usage records are kept for 24 months')
  })
})
