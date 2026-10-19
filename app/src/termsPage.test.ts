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
    expect(privacy).toContain('Last updated: 19 October 2026')
    // Crops of an own PDF's formulas, figures and tables for its Tinct text (16 Oct 2026): made and kept on the device.
    expect(privacyText).toContain('When a PDF you added reads as Tinct text, pictures of its formulas, figures and tables are cut from its pages on your device and kept with it in your browser; they are not stored in your account or sent anywhere unless you ask about one.')
    // Uploaded profile photos (SOCIAL_PHOTO_UPLOADS on, 10 Oct 2026): stored, stripped, reviewed, replaced.
    expect(privacy).toContain('If you upload a picture or a background, we store it with Cloudflare, with its location and camera details removed.')
    expect(privacy).toContain('A person at Tinct looks at each uploaded photo before other readers can see it')
  })

  // The library header keeps a small copy of the reader's own picture on the device (src/cards/avatarCache.ts, 19 Oct 2026).
  it('privacy: names the small copy of the reader\'s own picture kept in the browser', () => {
    expect(privacyText).toContain('offline and cache data (including a small copy of your own profile picture, so the library can show it at once)')
    expect(privacyText).toContain('Signing out removes your reading data and the device identifier from the browser.')
  })

  // Highlights and notes in an own PDF kept with the book in the account (margin reader PR 1a, 14 Oct 2026).
  it('privacy: says a PDF\'s highlights and notes are kept with the book in the account and deleted with it', () => {
    expect(privacyText).toContain('The highlights and notes you make in a PDF you added (the passage, where it is on the page, its colour and your note) are kept in your browser and, if you are signed in and the book is in your account, privately with it in your account with Cloudflare (R2), so they show on your other devices; they are deleted with the book.')
  })

  // The margin's kept answers in an own PDF, kept with the book in the account (margin reader PR 2, 15 Oct 2026).
  it('privacy: says the answers kept in a PDF\'s margin are kept with the book in the account and deleted with it', () => {
    expect(privacyText).toContain('The answers kept in the margin of a PDF you added (the passage, your questions and the companion\'s answers, and a quiz\'s questions and how you answered) are kept the same way, in your browser and, if you are signed in and the book is in your account, privately with it in your account with Cloudflare (R2); they are deleted with the book.')
  })

  // A signed-out guest's Talk trial runs through Tinct's relay (Anders, 16 Oct 2026).
  it("privacy: says a guest's Talk passes through Tinct's server unstored, one a day of two minutes", () => {
    expect(privacyText).not.toContain('Your voice is streamed directly from your device to xAI')
    expect(privacyText).toContain("Your voice is streamed from your device to xAI (see below) to produce the spoken reply; if you are not signed in, it passes through Tinct's server on the way, which neither stores nor reads it, and the conversation is limited to one a day of two minutes. Tinct does not store the audio.")
  })

  // Own-book covers stored with the account copy (2026-10-09).
  it('privacy: says a small image of an own book\'s cover is kept privately with its account copy and deleted with it', () => {
    expect(privacyText).toContain('You can remove it from your books at any time, and it is deleted when your account is deleted. A small image of the book\'s cover is kept privately with that copy, so your other devices show it, and is deleted with the book.')
  })

  // Recognising the text of a scanned PDF (Premium; approved by Anders on 9 Oct 2026). True while
  // the switch is off too: the feature exists in code and is only used when a reader asks.
  it('privacy: recognising a scanned PDF’s text: what goes to xAI, where the text is kept, when it is deleted', () => {
    expect(privacyText).toContain('If you choose Listen, the text being read is sent to xAI to make the audio, which is stored privately in your account and deleted with the book. If you have Premium and ask Tinct to recognise the text of a scanned PDF you added, images of its pages are sent to xAI to recognise the text; the text is stored privately in your account and deleted with the book, and the page images are deleted once their text is recognised.')
    expect(privacyText).toContain('xAI also produces the narration voices, writes Modern English editions of public-domain books from book text only, and recognises the text of scanned PDFs Premium readers add, from images of their pages.')
    expect(privacyText).not.toContain('xAI also produces the narration voices and writes Modern English editions of public-domain books, from book text only.')
    expect(privacyText).toContain('file storage (R2) for audio, for the PDF and EPUB files signed-in readers add and the text recognised from scanned ones and for a copy of your Google photo if you choose it')
    expect(privacyText).toContain('the PDF and EPUB files you added and any audio, recaps and recognised text made from them')
  })

  // Before you start on an own PDF (margin reader primer, 14 Oct 2026): what is sent, where the overview is kept, when it goes.
  it('privacy: Before you start sends the unit\'s text, keeps the overview with the book, and deletes it with the book and the account', () => {
    expect(privacyText).toContain('For Before you start on a PDF you added, the text of the chapter or section you are reading (or of the whole file if it has no contents list) is sent the same way: if you are signed in, automatically as soon as you open the PDF, so the overview is ready when you tap it, and otherwise when you open Before you start. The overview is kept with the book so it is not made again: in your browser and, if the book is in your account, privately in your account, only for you, until you redo it or remove the book.')
    expect(privacyText).toContain('the PDF and EPUB files you added and any audio, recaps and recognised text made from them, the Before you start overviews made of them, analytics and usage records')
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
