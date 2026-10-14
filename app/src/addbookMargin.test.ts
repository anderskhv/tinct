/**
 * The PDF reader's margin, PR 1a (docs/margin/BRIEF.md): the pure rules in
 * public/lab/addbook/js/margin.js and the offline dictionary loader in
 * public/lab/addbook/js/dictionary.js (a mirror of services/dictionary.ts).
 * No network and no AI: the dictionary reads from a fake fetch.
 */
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const ROOT = resolve(__dirname, '../..') + '/'
type Rect = { left: number; top: number; right: number; bottom: number }
type Mark = { id: string; u?: number; at?: number; gone?: boolean; page?: number; note?: string; color?: string }
interface MarginApi {
  placeBar(o: { first: Rect; last?: Rect; frame: Rect; w: number; h?: number; phone?: boolean }): { left: number; top: number; width: number; below: boolean; tip: number }
  placeMore(o: { bar: Rect & { below: boolean }; dots: Rect; frame: Rect; w: number; h: number; phone?: boolean }): { left: number; top: number; below: boolean }
  placeCard(o: { first: Rect; last?: Rect; frame: Rect; w: number; h: number; phone?: boolean }): { left: number; top: number; width: number; below: boolean }
  typedChar(e: Partial<KeyboardEvent>, o?: { inField?: boolean }): string | null
  oneWord(text: string): string | null
  nameMidSentence(word: string, before: string): boolean
  copyQuote(o: { text: string; title: string; page: number }): string
  defaultColor(prefs: { hlColor?: string } | null, colors: string[][]): string
  chooseColor(prefs: Record<string, unknown>, key: string): Record<string, unknown>
  mergeMarks(...sets: Mark[][]): Mark[]
  splitMarks(list: Mark[]): { live: Mark[]; gone: Mark[] }
  tombstone(id: string, at?: number): Mark
  sameMarks(a: Mark[], b: Mark[]): boolean
  parseLookup(raw: string, word: string): { word: string; pos: string; line: string } | null
  html: { cut(text: string, max?: number): string; barHtml(state: string, o: Record<string, unknown>): string; moreHtml(o: Record<string, unknown>): string; noteHtml(o: { quote: string; note?: string }): string }
}
interface DictionaryApi {
  normalize(word: string): string
  stemCandidates(word: string): string[]
  createDictionary(o: { fetchImpl: (url: string) => Promise<Response>; cachesImpl?: null }): { lookup(word: string): Promise<{ word: string; definitions: string[]; resolvedFrom?: string } | null> }
}
let M: MarginApi
let D: DictionaryApi
beforeAll(() => {
  require(ROOT + 'app/public/lab/addbook/js/margin.js')
  require(ROOT + 'app/public/lab/addbook/js/dictionary.js')
  M = (globalThis as unknown as { TinctMargin: MarginApi }).TinctMargin
  D = (globalThis as unknown as { TinctDictionary: DictionaryApi }).TinctDictionary
})
const COLORS = [['gold', 'Gold', 'rgba(232,196,92,.42)', '#e9cf86'], ['rose', 'Rose', 'rgba(232,118,128,.30)', '#eba7ad'], ['sage', 'Sage', 'rgba(108,178,108,.32)', '#a9d0a3'], ['sky', 'Sky', 'rgba(96,148,226,.30)', '#a6c2ee'], ['lavender', 'Lavender', 'rgba(156,116,222,.30)', '#c6b0ee']]
const box = (left: number, top: number, right: number, bottom: number): Rect => ({ left, top, right, bottom })
const FRAME = box(0, 56, 1280, 800)

describe('the selection bar’s place', () => {
  it('desktop: 56px above the first line, 20px left of the selection start, the tip at the selection', () => {
    const p = M.placeBar({ first: box(300, 400, 600, 420), last: box(100, 440, 400, 460), frame: FRAME, w: 360, h: 44 })
    expect(p).toMatchObject({ left: 280, top: 344, below: false })
    expect(p.tip).toBe(60)
  })
  it('clamps 16px inside the reader on both sides', () => {
    expect(M.placeBar({ first: box(5, 400, 50, 420), frame: FRAME, w: 360 }).left).toBe(16)
    expect(M.placeBar({ first: box(1200, 400, 1270, 420), frame: FRAME, w: 360 }).left).toBe(1280 - 16 - 360)
  })
  it('with less than 64px above the selection: 12px below its last line, tip up', () => {
    const p = M.placeBar({ first: box(300, 100, 600, 118), last: box(100, 140, 400, 160), frame: FRAME, w: 360, h: 44 })
    expect(p).toMatchObject({ top: 172, below: true })
    // At exactly 64px of room it stays above.
    expect(M.placeBar({ first: box(300, 120, 600, 138), frame: FRAME, w: 360 }).below).toBe(false)
  })
  it('a taller bar (Ask on three lines) grows upward from where the menu ends, and never leaves the reader', () => {
    expect(M.placeBar({ first: box(300, 400, 600, 420), frame: FRAME, w: 520, h: 84 }).top).toBe(304)
    // A selection filling the screen: the bar stays inside, 16px from the bottom.
    const p = M.placeBar({ first: box(300, 60, 600, 80), last: box(300, 790, 600, 810), frame: FRAME, w: 360, h: 44 })
    expect(p.top).toBe(800 - 16 - 44)
  })
  it('a selection across two pages: one bar, at the first line', () => {
    const p = M.placeBar({ first: box(300, 700, 600, 720), last: box(300, 760, 600, 780), frame: FRAME, w: 360, h: 44 })
    expect(p.top).toBe(644)
  })
  it('phone: 10px from each edge, 12px below the last line with its tip up; above the first line when there is no room', () => {
    const phone = box(0, 96, 390, 810)
    expect(M.placeBar({ first: box(200, 300, 380, 316), last: box(10, 330, 120, 346), frame: phone, w: 0, phone: true })).toMatchObject({ left: 10, width: 370, top: 358, below: true })
    expect(M.placeBar({ first: box(200, 700, 380, 716), last: box(10, 760, 120, 776), frame: phone, w: 0, phone: true })).toMatchObject({ top: 700 - 12 - 48, below: false })
  })
})

describe('More, the Define card and the note editor', () => {
  const bar = { ...box(280, 344, 640, 388), below: false }
  it('desktop More sits 8px above the bar, aligned to the dots; below it when there is no room above', () => {
    expect(M.placeMore({ bar, dots: box(500, 349, 534, 383), frame: FRAME, w: 300, h: 330 })).toEqual({ left: 380, top: 396, below: true })
    expect(M.placeMore({ bar: { ...box(280, 544, 640, 588), below: false }, dots: box(500, 549, 534, 583), frame: FRAME, w: 300, h: 330 })).toEqual({ left: 380, top: 206, below: false })
  })
  it('below a bar that is below the selection, and the phone list below its bar', () => {
    expect(M.placeMore({ bar: { ...box(280, 300, 640, 344), below: true }, dots: box(500, 305, 534, 339), frame: FRAME, w: 300, h: 330 }).top).toBe(352)
    const p = M.placeMore({ bar: { ...box(10, 358, 380, 406), below: true }, dots: box(200, 362, 234, 402), frame: box(0, 96, 390, 810), w: 210, h: 280, phone: true })
    expect(p).toEqual({ left: 112, top: 414, below: true })
  })
  it('the Define card is 360px, above the word with 12px to spare, else below it; on the phone the full width less 20px', () => {
    expect(M.placeCard({ first: box(400, 500, 470, 520), frame: FRAME, w: 360, h: 200 })).toEqual({ left: 340, top: 288, width: 360, below: false })
    // The word on the first lines of the screen: the card flips below it.
    expect(M.placeCard({ first: box(400, 120, 470, 140), frame: FRAME, w: 360, h: 200 })).toEqual({ left: 340, top: 152, width: 360, below: true })
    expect(M.placeCard({ first: box(100, 300, 160, 316), frame: box(0, 96, 390, 810), w: 360, h: 220, phone: true })).toEqual({ left: 10, top: 328, width: 370, below: true })
  })
})

describe('typing with a selection opens Ask', () => {
  it('takes a printable key, not Cmd/Ctrl/Alt (zoom keys stay the reader’s), not space, not in a field', () => {
    expect(M.typedChar({ key: 'W' })).toBe('W')
    expect(M.typedChar({ key: '?' })).toBe('?')
    expect(M.typedChar({ key: 'é' })).toBe('é')
    for (const e of [{ key: '+', ctrlKey: true }, { key: '-', metaKey: true }, { key: '0', ctrlKey: true }, { key: 'k', metaKey: true }, { key: 'a', altKey: true }, { key: ' ' }, { key: 'Escape' }, { key: 'Enter' }, { key: 'ArrowDown' }, { key: 'Tab' }, { key: 'a', isComposing: true }])
      expect(M.typedChar(e), JSON.stringify(e)).toBeNull()
    expect(M.typedChar({ key: 'a' }, { inField: true })).toBeNull()
  })
  it('a one-word selection opens Define; a capitalised word mid-sentence is a name', () => {
    expect(M.oneWord(' variance, ')).toBe('variance')
    expect(M.oneWord('well-known')).toBe('well-known')
    expect(M.oneWord('two words')).toBeNull()
    expect(M.oneWord('x')).toBeNull()
    expect(M.oneWord('1.2')).toBeNull()
    expect(M.nameMidSentence('Stirling', 'you will need ')).toBe(true)
    expect(M.nameMidSentence('Stirling', 'the factorial. ')).toBe(false)
    expect(M.nameMidSentence('Stirling', '')).toBe(false)
    expect(M.nameMidSentence('variance', 'the mean and ')).toBe(false)
  })
})

describe('Copy quote', () => {
  it('copies the passage, then the title and page', () => {
    expect(M.copyQuote({ text: '  r is the sum of\nN independent  variables ', title: 'Probability and Inference', page: 12 }))
      .toBe('“r is the sum of N independent variables”\n— Probability and Inference, p. 12')
    expect(M.copyQuote({ text: 'Only the passage', title: '', page: 0 })).toBe('“Only the passage”')
  })
  it('a quoted passage in a card is cut at 120 characters with …', () => {
    const long = 'word '.repeat(40)
    const cut = M.html.cut(long)
    expect(cut.length).toBeLessThanOrEqual(120)
    expect(cut.endsWith('…')).toBe(true)
    expect(M.html.cut('short one')).toBe('short one')
  })
})

describe('the highlight dot’s colour', () => {
  it('is the last colour chosen, else the first; choosing one makes it the default the reader saves', () => {
    expect(M.defaultColor(null, COLORS)).toBe('gold')
    expect(M.defaultColor({ hlColor: 'teal' }, COLORS)).toBe('gold')
    const prefs = { trim: true, hlColor: 'gold' }
    const next = M.chooseColor(prefs, 'sky')
    expect(next).toEqual({ trim: true, hlColor: 'sky' })
    expect(prefs.hlColor).toBe('gold')
    // Saved and read back (the reader stores prefs as JSON).
    expect(M.defaultColor(JSON.parse(JSON.stringify(next)), COLORS)).toBe('sky')
  })
  it('the bar shows the default in the dot; the colours state offers every existing colour, the default pressed', () => {
    const menu = M.html.barHtml('menu', { colors: COLORS, current: 'sage' })
    expect(menu).toContain('--hl-current:#a9d0a3')
    expect(menu).toContain('aria-label="Highlight in Sage"')
    const colors = M.html.barHtml('colors', { colors: COLORS, current: 'sage' })
    expect(colors.match(/class="mr-swatch"/g)).toHaveLength(5)
    expect(colors).toContain('data-color="sage" style="background:#a9d0a3" aria-label="Sage" aria-pressed="true"')
  })
  it('PR 1a: Simplify and the 1b rows stay out of the reader, the fixture shows them', () => {
    const reader = M.html.barHtml('menu', { colors: COLORS, current: 'gold' }) + M.html.moreHtml({})
    expect(reader).not.toMatch(/Simplify|Fact-check|Counterpoint|Quiz me|Share as image/)
    expect(reader).toMatch(/Define[\s\S]*<hr>[\s\S]*Copy quote/)
    const fixture = M.html.barHtml('menu', { colors: COLORS, current: 'gold', all: true }) + M.html.moreHtml({ all: true })
    for (const name of ['Simplify', 'Fact-check', 'Counterpoint', 'Quiz me', 'Share as image']) expect(fixture).toContain(name)
    expect(M.html.moreHtml({ phone: true })).not.toContain('The word, as this text uses it')
  })
})

describe('a PDF’s highlights and notes on two devices', () => {
  const hl = (id: string, u: number, extra: Partial<Mark> = {}) => ({ id, page: 1, at: 1, u, color: 'gold', ...extra })
  it('is a union by id', () => {
    const merged = M.mergeMarks([hl('aaaa', 1)], [hl('bbbb', 2)])
    expect(merged.map(m => m.id).sort()).toEqual(['aaaa', 'bbbb'])
  })
  it('the newer edit of the same highlight wins, from either side', () => {
    const older = hl('aaaa', 10, { note: 'first' }), newer = hl('aaaa', 20, { note: 'second', color: 'sky' })
    expect(M.mergeMarks([older], [newer])).toEqual([newer])
    expect(M.mergeMarks([newer], [older])).toEqual([newer])
    // Records from before edits were stamped use their creation time.
    expect(M.mergeMarks([{ id: 'cccc', at: 5, page: 1 }], [hl('cccc', 6)])).toEqual([hl('cccc', 6)])
  })
  it('a removal is a tombstone: it beats older edits, loses to a newer one, and wins a tie', () => {
    const gone = M.tombstone('aaaa', 30)
    expect(gone).toEqual({ id: 'aaaa', gone: true, u: 30 })
    expect(M.mergeMarks([hl('aaaa', 20)], [gone])).toEqual([gone])
    expect(M.mergeMarks([gone], [hl('aaaa', 40)])).toEqual([hl('aaaa', 40)])
    expect(M.mergeMarks([hl('aaaa', 30)], [gone])).toEqual([gone])
    expect(M.splitMarks(M.mergeMarks([gone, hl('bbbb', 1)]))).toEqual({ live: [hl('bbbb', 1)], gone: [gone] })
  })
  it('both devices arrive at the same set whatever the order (no data lost on a conflict)', () => {
    const a = [hl('aaaa', 1), hl('bbbb', 5, { note: 'mine' }), M.tombstone('dddd', 9)]
    const b = [hl('bbbb', 4), hl('cccc', 3), hl('dddd', 2)]
    const ab = M.mergeMarks(a, b), ba = M.mergeMarks(b, a)
    expect(M.sameMarks(ab, ba)).toBe(true)
    expect(JSON.stringify(ab)).toBe(JSON.stringify(ba))
    expect(ab.find(m => m.id === 'bbbb')?.note).toBe('mine')
    expect(ab.find(m => m.id === 'dddd')?.gone).toBe(true)
    expect(ab.some(m => m.id === 'cccc')).toBe(true)
    // Merging again changes nothing.
    expect(M.mergeMarks(ab, ab)).toEqual(ab)
    expect(M.mergeMarks(ab, a, b)).toEqual(ab)
  })
  it('ignores records without an id', () => {
    expect(M.mergeMarks([{ id: '' }, null as unknown as Mark, hl('aaaa', 1)])).toEqual([hl('aaaa', 1)])
  })
})

describe('the note editor', () => {
  it('quotes the passage (cut), offers Remove highlight and Save note; Save waits for words', () => {
    const empty = M.html.noteHtml({ quote: 'an approximation for the factorial function' })
    expect(empty).toContain('“an approximation for the factorial function”')
    expect(empty).toContain('placeholder="Add a note…"')
    expect(empty).toMatch(/data-m="remove">Remove highlight<\/button><button type="button" class="mr-bar__item" data-m="save" disabled>Save note/)
    expect(M.html.noteHtml({ quote: 'x', note: 'Try <b>' })).toContain('>Try &lt;b&gt;</textarea>')
  })
})

describe('Define with the companion (the existing contextual define, parsed as the book reader does)', () => {
  it('reads a definition, a person or a place', () => {
    expect(M.parseLookup('{"kind":"definition","definition":"Noun. How widely values spread."}', 'variance')).toEqual({ word: 'variance', pos: 'noun', line: 'How widely values spread.' })
    expect(M.parseLookup('{"kind":"person","name":"Stirling","importance":"minor","subtitle":"a Scottish mathematician","body":"Named for the approximation."}', 'Stirling')).toEqual({ word: 'Stirling', pos: 'a Scottish mathematician', line: 'Named for the approximation.' })
    expect(M.parseLookup('```json\n{"kind":"place","name":"Edinburgh","description":"A city."}\n```', 'Edinburgh')).toEqual({ word: 'Edinburgh', pos: '', line: 'A city.' })
    expect(M.parseLookup('{"kind":"other"}', 'x')).toBeNull()
    expect(M.parseLookup('{broken', 'x')).toBeNull()
    expect(M.parseLookup('', 'x')).toBeNull()
  })
})

describe('the offline dictionary loader (mirrors services/dictionary.ts)', () => {
  it('normalises exactly as the app does', () => {
    expect(D.normalize('  “Variance,” ')).toBe('variance')
    expect(D.normalize('Ship’s')).toBe("ship's")
    expect(D.normalize('in­ter­est')).toBe('interest')
    expect(D.normalize('ﬁnal')).toBe('final')
    expect(D.normalize('123')).toBe('')
    expect(D.stemCandidates('running')).toEqual(['runn', 'runne', 'run'])
    expect(D.stemCandidates('variances')).toEqual(['varianc', 'variance'])
    expect(D.stemCandidates('studies')).toContain('study')
  })
  it('the same normalisation and stems as services/dictionary.ts, line for line', () => {
    const ts = readFileSync(ROOT + 'app/src/services/dictionary.ts', 'utf8')
    const js = readFileSync(ROOT + 'app/public/lab/addbook/js/dictionary.js', 'utf8')
    const normal = /\.normalize\('NFKC'\)\.trim\(\)\.toLowerCase\(\)\.replace\(\/\[‘’\]\/g, "'"\)\.replace\(\/\\u00ad\/g, ''\)\.replace\(\/\^\[\^\\p\{L\}\]\+\|\[\^\\p\{L\}\]\+\$\/gu, ''\)/
    expect(ts).toMatch(normal)
    expect(js).toMatch(normal)
    const suffixes = (src: string) => [...src.matchAll(/endsWith\('([^']+)'\)/g)].map(m => m[1])
    expect(suffixes(js)).toEqual(suffixes(ts))
  })
  it('looks up the archaic supplement first, then the letter, then stems; caches only what downloaded', async () => {
    const files: Record<string, Record<string, string[]>> = {
      v: { variance: ['In statistics, the square of the standard deviation.', 'The fact of being different.', 'Official permission to depart from a rule.', 'A fourth sense.'] },
      t: { thou: ['the letter t shard'] },
      archaic: { thou: ['you (as subject)'] },
    }
    const calls: string[] = []
    let offline = false
    const fetchImpl = async (url: string) => {
      calls.push(url)
      if (offline) throw new TypeError('offline')
      const letter = /\/data\/dict\/(\w+)\.json$/.exec(url)![1]
      return files[letter] ? new Response(JSON.stringify(files[letter])) : new Response('nope', { status: 404 })
    }
    const dict = D.createDictionary({ fetchImpl, cachesImpl: null })
    expect(await dict.lookup('Thou')).toEqual({ word: 'thou', definitions: ['you (as subject)'] })
    expect(await dict.lookup('variance')).toMatchObject({ word: 'variance' })
    expect(await dict.lookup('variances')).toEqual({ word: 'variance', resolvedFrom: 'variances', definitions: files.v.variance })
    expect(calls.filter(u => u.endsWith('/archaic.json'))).toHaveLength(1)
    expect(calls.filter(u => u.endsWith('/v.json'))).toHaveLength(1)
    // Offline: what was downloaded is still there; a letter never downloaded finds nothing, and is tried again later.
    offline = true
    expect(await dict.lookup('variance')).toMatchObject({ word: 'variance' })
    expect(await dict.lookup('quantum')).toBeNull()
    offline = false
    files.q = { quantum: ['a discrete amount'] }
    expect(await dict.lookup('quantum')).toEqual({ word: 'quantum', definitions: ['a discrete amount'] })
    expect(await dict.lookup('— 12 —')).toBeNull()
  })
})

describe('the installed copy', () => {
  it('app/public/lab/addbook ships the margin files of addbooks/web/src unchanged', () => {
    for (const file of ['js/margin.js', 'js/dictionary.js', 'js/margin-fixture.js', 'css/margin.css', 'margin-fixture.html'])
      expect(readFileSync(ROOT + 'app/public/lab/addbook/' + file, 'utf8'), file).toBe(readFileSync(ROOT + 'addbooks/web/src/' + file, 'utf8'))
  })
  it('css/margin.css keeps the reference stylesheet, its values and its guards block, unchanged', () => {
    const css = readFileSync(ROOT + 'app/public/lab/addbook/css/margin.css', 'utf8')
    const reference = readFileSync(ROOT + 'docs/margin/margin-reference.css', 'utf8')
    expect(css).toContain(reference.slice(reference.indexOf('/* ---------- tokens per look')))
    expect(css).toContain('/* ---------- guards: these prevent the common breakages; keep them ---------- */')
  })
})
