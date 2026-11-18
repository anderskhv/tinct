import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { handleSeoAndStaticRequest, withTryDemo, TRY_DEMO_SCRIPT } from './worker/routes/seo'
import { CARDS_COPY } from './cards/cardsCopy'
import { TRIAL_DAYS } from './worker/lib/aiAllowance'
import { LAB_COPY } from './lab/labCopy'
import { firstSentenceWords, revealScrollBy } from './lab/tryDemo/tryDemo'
import { LAB_EXPLAIN_PROMPT } from './companion/companionRequest'
import { parseChapterNotesBeats } from './chapterNotes'

// The Try page (docs/try-page/BRIEF.md): unlisted at /try, built, not launched.
const page = readFileSync('public/try.html', 'utf8')
const script = readFileSync('public/lab/try/try.js', 'utf8')
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ')

function worker(cookie?: string) {
  const env = {
    ASSETS: {
      fetch: async (request: Request) => new URL(request.url).pathname === '/try'
        ? new Response(page, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
        : new Response('nf', { status: 404 }),
    },
  }
  const ctx = { waitUntil: () => {} } as unknown as ExecutionContext
  return (pathname: string) => handleSeoAndStaticRequest(new Request(`https://tinct.app${pathname}`, cookie ? { headers: { Cookie: cookie } } : undefined), env as never, ctx)
}

describe('/try is unlisted', () => {
  it('says noindex in the page and in the header', async () => {
    expect(page).toContain('<meta name="robots" content="noindex, nofollow">')
    const response = await worker()('/try')
    expect(response.status).toBe(200)
    expect(response.headers.get('X-Robots-Tag')).toBe('noindex, nofollow')
    expect(response.headers.get('Content-Security-Policy')).toContain("script-src 'self'")
  })

  it('is not in the sitemap, robots.txt or the llms files', () => {
    for (const file of ['public/sitemap.xml', 'public/robots.txt', 'public/llms.txt', 'public/llms-full.txt']) {
      expect(readFileSync(file, 'utf8'), file).not.toMatch(/tinct\.app\/try\b|["'(\s]\/try\b/)
    }
  })

  it('nothing in the app, the public pages or the emails links to it', () => {
    const offenders: string[] = []
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const file = join(dir, name)
        if (statSync(file).isDirectory()) { if (!['node_modules', 'read', 'data', 'covers', 'try'].includes(name)) walk(file); continue }
        if (!/\.(tsx?|jsx?|html|cjs|mjs|json)$/.test(name) || /\.test\.|try\.html$|tryPage/.test(name)) continue
        const body = readFileSync(file, 'utf8')
        if (/href=["'`]\/try\b|['"`]\/try['"`?#]|tinct\.app\/try\b/.test(body)) offenders.push(file)
      }
    }
    walk('src'); walk('public')
    // The Worker's own route and the frame's demo check name the path; nothing else may.
    expect(offenders.filter(file => !/worker[\\/]routes[\\/]seo\.ts$/.test(file))).toEqual([])
  })

  it('sends a signed-in reader to the app before rendering: the cookie at the Worker, a kept session in the head', async () => {
    const response = await worker('tinct_auth=1')('/try')
    expect(response.status).toBe(302)
    expect(response.headers.get('Location')).toBe('/app')
    // The guard is the head's first script, before any stylesheet or content.
    expect(page.indexOf('/lab/try/try-guard.js')).toBeLessThan(page.indexOf('<link'))
    const guard = readFileSync('public/lab/try/try-guard.js', 'utf8')
    expect(guard).toContain("location.replace('/app')")
    expect(guard).toContain('-auth-token')
  })

  it('has one address', async () => {
    for (const path of ['/try.html', '/try/']) {
      const response = await worker()(path)
      expect(response.status).toBe(301)
      expect(response.headers.get('Location')).toBe('/try')
    }
  })
})

describe('/try content', () => {
  it('takes its prices from the code: $5 a month, $50 a year, a free first month', () => {
    const monthly = CARDS_COPY.monthlyPrice.match(/\$\d+/)![0]
    const yearly = CARDS_COPY.yearlyPrice.match(/\$\d+/)![0]
    expect(page).toContain(`<span class="try-amount" data-price="month">${monthly}</span>`)
    expect(page).toContain(`<span data-price="year">${yearly}</span> a year`)
    expect(TRIAL_DAYS).toBe(30)
    expect(page).toContain('First month free')
  })

  it("answers 'Which AI do you use?' as the privacy notice does: Anthropic for the companion, xAI for Talk and narration", () => {
    const privacy = text(readFileSync('public/privacy.html', 'utf8'))
    expect(privacy).toContain("powered by Anthropic's Claude")
    expect(privacy).toContain("Talk (spoken conversation) is powered by xAI's Grok")
    expect(privacy).toContain('xAI also produces the narration voices')
    const answer = text(page.slice(page.indexOf('Which AI do you use?'), page.indexOf('</details>', page.indexOf('Which AI do you use?'))))
    expect(answer).toContain('Claude by Anthropic')
    expect(answer).toContain("xAI's Grok")
    expect(answer).not.toMatch(/train/i)
    expect(page).toContain('<a href="/privacy">privacy statement</a>')
  })

  it('has the footer of the public pages, with /copyright', () => {
    for (const href of ['/library', '/privacy', '/terms', 'mailto:contact@tinct.app', '/copyright']) expect(page).toContain(`href="${href}"`)
  })

  it('reuses the reader’s listening prompt word for word', () => {
    expect(script).toContain(`audioTitle: '${LAB_COPY.accountTitleAudio}'`)
    expect(script).toContain(`audioBody: '${LAB_COPY.accountBodyAudio}'`)
  })

  it('never uses mono and keeps sentence case on buttons', () => {
    const css = readFileSync('public/lab/try/try.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '')
    expect(css).not.toMatch(/mono|uppercase|letter-spacing:\s*[1-9]/i)
  })
})

describe('the scripted answers (written ahead of time, never generated in development)', () => {
  const data = JSON.parse(readFileSync('public/lab/try/meditations-2.json', 'utf8'))

  it('Explain has the house shape: a lead sentence, then at most two short paragraphs, about 100 words', () => {
    expect(LAB_EXPLAIN_PROMPT).toContain('About 100 words or fewer')
    const paragraphs = data.explain.answer.split(/\n\n/)
    expect(paragraphs.length).toBeLessThanOrEqual(3)
    expect(data.explain.answer.split(/\s+/).length).toBeLessThanOrEqual(100)
    expect(paragraphs[0].split(/(?<=\.)\s/)[0].split(/\s+/).length).toBeLessThanOrEqual(25)
  })

  it('the Summary parses as a chapter card: four beats, short titles, at most 40 words each', () => {
    const beats = parseChapterNotesBeats(data.summary)!
    expect(beats).toHaveLength(4)
    for (const beat of beats) {
      expect(beat.title.split(/\s+/).length).toBeLessThanOrEqual(5)
      expect(beat.text.split(/\s+/).length).toBeLessThanOrEqual(40)
    }
  })

  it('the scripted passage is the first sentence of Book 2 in the original edition', () => {
    const edition = JSON.parse(readFileSync('public/data/editions/meditations-original-en.json', 'utf8'))
    const chapters = edition.chapters ?? edition
    const chapter = (Array.isArray(chapters) ? chapters : Object.values(chapters)).find((item: { number?: number; chapterNumber?: number }) => (item.number ?? item.chapterNumber) === 2) as { paragraphs: Array<string | { text: string }> }
    const first = chapter.paragraphs[0]
    const paragraph = typeof first === 'string' ? first : first.text
    const words = paragraph.split(/\s+/).filter(Boolean)
    const range = firstSentenceWords(paragraph)!
    expect(words.slice(range.fromWord, range.toWord + 1).join(' ')).toBe(data.explain.selection)
  })
})

describe('the reader in demo mode', () => {
  it('gets its demo script first in the head, only for /reader?demo=try', () => {
    const html = '<!doctype html><html><head><script src="/assets/reader-boot.js"></script></head><body></body></html>'
    const demo = withTryDemo(new URL('https://tinct.app/reader?demo=try'), html)
    expect(demo.indexOf(TRY_DEMO_SCRIPT)).toBeGreaterThan(0)
    expect(demo.indexOf(TRY_DEMO_SCRIPT)).toBeLessThan(demo.indexOf('reader-boot'))
    expect(withTryDemo(new URL('https://tinct.app/reader?book=meditations'), html)).toBe(html)
    expect(withTryDemo(new URL('https://tinct.app/reader?demo=other'), html)).toBe(html)
  })

  it('the demo script runs only when /try frames it, and holds storage in memory', () => {
    const demo = readFileSync('public/lab/try/reader-demo.js', 'utf8')
    expect(demo).toContain("params.get('demo') !== 'try'")
    expect(demo).toContain("window.parent.location.pathname === '/try'")
    expect(demo).toMatch(/defineProperty\(window, 'localStorage'/)
    expect(demo).toMatch(/defineProperty\(window, 'sessionStorage'/)
    expect(demo).toContain("headers.set('X-Tinct-Surface', 'try')")
  })

  it('firstSentenceWords skips a section number and stops at the first full stop', () => {
    expect(firstSentenceWords('1. Begin the morning. All these things')).toEqual({ fromWord: 1, toWord: 3 })
    expect(firstSentenceWords('No number here, and no stop')).toEqual({ fromWord: 0, toWord: 5 })
  })

  it('an open margin card that grows past the frame scrolls in, but never past its own top', () => {
    const frame = { top: 60, bottom: 600 }
    expect(revealScrollBy(frame, { top: 300, bottom: 500 })).toBe(0)
    expect(revealScrollBy(frame, { top: 300, bottom: 700 })).toBe(116)
    expect(revealScrollBy(frame, { top: 200, bottom: 1200 })).toBe(84)
    expect(revealScrollBy(frame, { top: 110, bottom: 900 })).toBe(0)
  })
})
