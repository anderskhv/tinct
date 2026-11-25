import { describe, expect, it } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { handleSeoAndStaticRequest, withTryDemo, TRY_DEMO_SCRIPT } from './worker/routes/seo'
import { CARDS_COPY } from './cards/cardsCopy'
import { TRIAL_DAYS } from './worker/lib/aiAllowance'
import { firstSentenceWords } from './lab/tryDemo/tryDemo'
import { LAB_EXPLAIN_PROMPT } from './companion/companionRequest'
import { parseChapterNotesBeats } from './chapterNotes'

// The Try page (docs/try-page/BRIEF.md), the About page at /about since 19 Nov 2026 (Anders); /try redirects there.
const page = readFileSync('public/about.html', 'utf8')
const script = readFileSync('public/lab/try/try.js', 'utf8')
const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ')

function worker(cookie?: string) {
  const env = {
    ASSETS: {
      fetch: async (request: Request) => new URL(request.url).pathname === '/about'
        ? new Response(page, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
        : new Response('nf', { status: 404 }),
    },
  }
  const ctx = { waitUntil: () => {} } as unknown as ExecutionContext
  return (pathname: string) => handleSeoAndStaticRequest(new Request(`https://tinct.app${pathname}`, cookie ? { headers: { Cookie: cookie } } : undefined), env as never, ctx)
}

describe('/about is the Try page, and /try redirects to it', () => {
  it('is indexable: no noindex in the page or the header, self-canonical, one h1, the brand promise in its titles', async () => {
    expect(page).not.toMatch(/name="robots"/)
    const response = await worker()('/about')
    expect(response.status).toBe(200)
    expect(response.headers.get('X-Robots-Tag')).toBeNull()
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=300, stale-while-revalidate=86400')
    expect(response.headers.get('Content-Security-Policy')).toContain("script-src 'self'")
    const html = await response.text()
    expect(html).toContain('<h1 class="try-headline">Read and listen anywhere, with help always at hand.</h1>')
    expect(page).toContain('<link rel="canonical" href="https://tinct.app/about">')
    expect(page).toContain('<meta property="og:url" content="https://tinct.app/about">')
    expect(page).toContain('<title>About Tinct — No text is beyond you</title>')
    expect(page).toContain('<meta property="og:title" content="About Tinct — No text is beyond you">')
    expect(page.match(/<h1\b/g)).toHaveLength(1)
  })

  it('/try, /try.html and /try/ redirect permanently to /about, keeping the query string', async () => {
    for (const path of ['/try', '/try.html', '/try/']) {
      const response = await worker()(path)
      expect(response.status, path).toBe(301)
      expect(response.headers.get('Location'), path).toBe('/about')
    }
    const ad = await worker()('/try?ref=launch&utm_source=x')
    expect(ad.status).toBe(301)
    expect(ad.headers.get('Location')).toBe('/about?ref=launch&utm_source=x')
  })

  it('does not send a signed-in reader away (no Worker redirect, no head guard)', async () => {
    const response = await worker('tinct_auth=1')('/about')
    expect(response.status).toBe(200)
    expect(response.headers.get('Location')).toBeNull()
    expect(page).not.toMatch(/try-guard|location\.replace/)
  })

  it('/about is in the sitemap; /try is not in the sitemap, robots.txt or the llms files', () => {
    expect(readFileSync('public/sitemap.xml', 'utf8')).toContain('<loc>https://tinct.app/about</loc>')
    for (const file of ['public/sitemap.xml', 'public/robots.txt', 'public/llms.txt', 'public/llms-full.txt']) {
      expect(readFileSync(file, 'utf8'), file).not.toMatch(/tinct\.app\/try\b|["'(\s]\/try\b/)
    }
  })

  it('nothing in the app, the public pages or the emails links to /try: links name /about', () => {
    const offenders: string[] = []
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const file = join(dir, name)
        if (statSync(file).isDirectory()) { if (!['node_modules', 'read', 'data', 'covers', 'try'].includes(name)) walk(file); continue }
        if (!/\.(tsx?|jsx?|html|cjs|mjs|json)$/.test(name) || /\.test\.|tryPage/.test(name)) continue
        const body = readFileSync(file, 'utf8')
        if (/href=["'`]\/try\b|['"`]\/try['"`?#]|tinct\.app\/try\b/.test(body)) offenders.push(file)
      }
    }
    walk('src'); walk('public')
    // The Worker's own redirect names the path; nothing else may.
    expect(offenders.filter(file => !/worker[\\/]routes[\\/]seo\.ts$/.test(file))).toEqual([])
  })
})

describe('/about content', () => {
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

})

describe('the reader plays itself (Anders, 19 Nov 2026)', () => {
  const frames = [...script.matchAll(/\['(\d\d)', (\d), \d+\]/g)].map(match => ({ file: match[1], step: Number(match[2]) }))

  it('shows four steps in the order the frames play them, and asks the visitor to do nothing', () => {
    const titles = [...script.matchAll(/\{ title: '((?:[^'\\]|\\.)*)'|\{ title: "([^"]+)"/g)].map(match => match[1] ?? match[2])
    expect(titles).toEqual(['Explain anything', "Read it in today's words", 'Hear it as you read', 'Get the gist in a minute'])
    expect(page).toContain('<span data-try-title>Explain anything</span>')
    expect(frames.map(frame => frame.step)).toEqual([...frames.map(frame => frame.step)].sort())
    expect(new Set(frames.map(frame => frame.step))).toEqual(new Set([0, 1, 2, 3]))
    expect(page).not.toMatch(/data-try-item|data-try-hint|data-try-limit|<iframe/)
  })

  it('has a desktop and a phone frame for every moment it plays', () => {
    for (const { file } of frames) for (const kind of ['desktop', 'phone']) {
      expect(statSync(`public/lab/try/frames/${kind}-${file}.webp`).size, `${kind}-${file}`).toBeGreaterThan(1000)
    }
  })

  it('opens Meditations Book 2 from the frames, and the library from its action', () => {
    expect([...page.matchAll(/href="(\/reader\?[^"]+)"/g)].map(match => match[1])).toEqual(['/reader?book=meditations&amp;chapter=1'])
    expect(page).toContain('href="/library" data-try-start>Start reading</a>')
    expect(page).not.toContain('try-closing')
    expect(page).toContain('<a class="try-pill try-pill--cream try-only-phone" href="/library">Start reading</a>')
    expect(page).toContain('<a class="try-phone-more" href="#pricing">')
  })

  it('calls nothing and scrolls nothing', () => {
    expect(script).not.toMatch(/fetch\(|XMLHttpRequest|sendBeacon|postMessage|scrollTo|scrollBy|scrollIntoView|scrollTop\s*=/)
  })
})
