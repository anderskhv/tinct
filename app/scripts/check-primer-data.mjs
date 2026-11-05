// Primer data check (5 Nov 2026): the import contract in PRIMER-CONTENT-FORMAT.md plus the Structure ranges.
// Run from app/ after a build (the default edition per book comes from dist/lab/catalogue.json):
//   node scripts/check-primer-data.mjs
// Checks, against the local editions in public/data/editions:
//  - every file: schema, field limits, word counts, no retired `takeaway`, English opening = book-openers.json;
//  - every passage link: the edition, chapter and paragraph exist and the paragraph contains the quote;
//  - every Structure item: its title starts with the range recorded in scripts/primer-structure-ranges.json
//    (en and da), the recorded chapters are contiguous, do not overlap and lie within the edition, only front
//    matter is left before the first range, and the range label resolves to the same chapters in the default
//    edition's contents (and in the Danish edition's, where it numbers chapters the same way).
// Exit code 1 on any error. Warnings name ranges whose unit the contents do not show (checked by the table only).
import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'

const root = process.cwd()
const dataDir = path.join(root, 'public/lab/library_2/primer-data')
const editionsDir = path.join(root, 'public/data/editions')
const shardsDir = path.join(root, 'public/data/editions-chapters')
const table = JSON.parse(fs.readFileSync(path.join(root, 'scripts/primer-structure-ranges.json'), 'utf8'))
const catalogue = JSON.parse(fs.readFileSync(path.join(root, 'dist/lab/catalogue.json'), 'utf8'))
const openers = new Map(JSON.parse(fs.readFileSync(path.join(root, 'public/lab/library_2/book-openers.json'), 'utf8')).books.map(b => [b.workId, b.opening]))
const books = new Map(catalogue.books.map(b => [b.id, b]))
const errors = [], warnings = [], tails = []
const err = (file, msg) => errors.push(`${file}: ${msg}`)
const ws = s => s.replace(/\s+/g, ' ').trim()
const words = s => ws(s).split(' ').filter(Boolean).length
const sha = s => createHash('sha256').update(s).digest('hex')

const editionCache = new Map()
function edition(workId, key) {
  const id = `${workId}-${key}`
  if (!editionCache.has(id)) {
    const file = path.join(editionsDir, id + '.json')
    if (!fs.existsSync(file)) editionCache.set(id, null)
    else {
      const chapters = JSON.parse(fs.readFileSync(file, 'utf8')).chapters
      // Contents sections ("Book 1 — …", "Volume 1 > Part 2") are part of what a reader sees, so they join the title.
      const section = new Map()
      const manifest = path.join(shardsDir, id, 'manifest.json')
      const walk = (list, prefix) => (list || []).forEach(s => {
        const name = prefix ? `${prefix}, ${s.title}` : s.title
        ;(s.chapters || []).forEach(n => section.set(n, name))
        walk(s.sections, name)
      })
      if (fs.existsSync(manifest)) walk(JSON.parse(fs.readFileSync(manifest, 'utf8')).sections, '')
      editionCache.set(id, chapters.map(c => ({ number: c.number, title: c.title || '', paragraphs: c.paragraphs, shown: [section.get(c.number), c.title].filter(Boolean).join(', ') })))
    }
  }
  return editionCache.get(id)
}

// ---- range labels -------------------------------------------------------------------------------------------
const UNITS = {
  chapter: 'chapter', chapters: 'chapter', kapitel: 'chapter', kapitler: 'chapter',
  act: 'act', acts: 'act', akt: 'act', akter: 'act', scene: 'scene', scenes: 'scene',
  book: 'book', books: 'book', bog: 'book', bøger: 'book', part: 'part', parts: 'part', del: 'part', dele: 'part',
  volume: 'volume', bind: 'volume', letter: 'letter', letters: 'letter', brev: 'letter', breve: 'letter',
  section: 'section', sections: 'section', afsnit: 'section', essay: 'essay', essays: 'essay',
  episode: 'episode', episodes: 'episode', stasimon: 'stasimon', fitt: 'fitt', fitts: 'fitt',
  canto: 'canto', cantos: 'canto', sang: 'canto', problema: 'problema', meditation: 'meditation', meditations: 'meditation',
  clause: 'clause', clauses: 'clause', bestemmelse: 'clause',
}
const NUMBER_WORDS = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10,
  en: 1, to: 2, tre: 3, fire: 4, fem: 5, seks: 6, syv: 7, otte: 8, ni: 9, ti: 10, elleve: 11, tolv: 12, tretten: 13, fjorten: 14, femten: 15,
  første: 1, anden: 2, andet: 2, tredje: 3, fjerde: 4, femte: 5, sjette: 6, syvende: 7, ottende: 8, niende: 9, tiende: 10,
  ellevte: 11, tolvte: 12, trettende: 13, fjortende: 14, femtende: 15,
}
const roman = s => {
  if (!/^[ivxlc]+$/i.test(s)) return null
  const v = { i: 1, v: 5, x: 10, l: 50, c: 100 }; let n = 0
  const t = s.toLowerCase()
  for (let i = 0; i < t.length; i++) { const a = v[t[i]], b = v[t[i + 1]] || 0; n += a < b ? -a : a }
  return n
}
const numberOf = tok => /^\d+$/.test(tok) ? Number(tok) : NUMBER_WORDS[tok.toLowerCase()] ?? roman(tok)
const TEXT_SYNONYMS = { appendiks: 'appendix', digtet: 'digt' }
const norm = s => ws(s.toLowerCase().replace(/[’‘]/g, "'").replace(/[“”]/g, '"')).replace(/^(the|a|an) /, '')
/**
 * "Act III, scene 7" -> [['act',3],['scene',7]]; "Første akt" -> [['act',1]]; unknown words are ignored.
 * With `bare`, a title that only opens with a number ("1 — The Fate…", "No. 12 — …", "IV. Position…") gives ['*', n].
 */
function pairs(text, { bare = false } = {}) {
  const toks = text.replace(/[—:;.,()]/g, ' ').split(/\s+/).filter(Boolean)
  const out = []; let pendingNumber = null, pendingUnit = null
  for (const tok of toks) {
    const unit = UNITS[tok.toLowerCase()]
    const n = unit ? null : numberOf(tok)
    if (unit) { if (pendingNumber != null) { out.push([unit, pendingNumber]); pendingNumber = null } else pendingUnit = unit }
    else if (n != null && pendingUnit) { out.push([pendingUnit, n]); pendingUnit = null }
    // A number before its unit is an ordinal or number word ("Første akt", "Third episode"), never a year or a digit.
    else if (n != null && !/^\d+$/.test(tok) && !roman(tok) && !/^(en|to|ni|ti)$/i.test(tok)) pendingNumber = n
    else pendingNumber = null
  }
  if (bare && !out.length) {
    const lead = text.match(/^\s*(?:No\.?\s*)?(\d+)\b/) || text.match(/^\s*([IVXLC]+)\.\s/)
    if (lead) out.push(['*', numberOf(lead[1])])
  }
  return out
}
const isRangeNumber = s => numberOf(s) != null
/** A label -> [startEndpoint, endEndpoint] strings. */
function endpoints(label) {
  if (label.includes(' – ')) { const [a, b] = label.split(' – '); return [inner(a)[0], inner(b)[1]] }
  const joined = label.match(/^(.*?) (?:and|og|to|til) (.*)$/)
  if (joined) {
    let [a, b] = [joined[1], joined[2]]
    // "Third and fourth episodes", "Anden og tredje akt": the unit sits on the second half only.
    if (!pairs(a).length && numberOf(a.split(' ')[0]) != null) { const unit = b.split(' ').slice(1).join(' '); a = `${a} ${unit}` }
    return [inner(a.split(', ')[0])[0], inner(b)[1]]
  }
  return inner(label)
}
/** Unspaced ranges: "Chapters 1–11", "Books Two–Three", "Genesis–Deuteronomy". */
function inner(s) {
  const m = s.match(/(\S+)–(\S+)/)
  if (!m) return [s, s]
  if (isRangeNumber(m[1]) && isRangeNumber(m[2])) return [s.replace(m[0], m[1]), s.replace(m[0], m[2])]
  const [a, b] = s.split('–'); return [a.trim(), b.trim()]
}
function matcher(endpoint, chapters, numbered) {
  const [unitPart, textPart] = endpoint.includes(': ') ? endpoint.split(': ') : [endpoint, null]
  const shownUnits = new Set(chapters.flatMap(c => pairs(c.shown, { bare: true }).map(p => p[0])))
  // Unnumbered chapter titles ("Sara", "Story of the Door") count by position, which only stands for chapters.
  const want = pairs(unitPart).filter(([u]) => shownUnits.has(u) || shownUnits.has('*') || (!shownUnits.size && numbered === false && u === 'chapter'))
  const text = norm(TEXT_SYNONYMS[norm(textPart ?? unitPart)] ?? (textPart ?? unitPart))
  if (!want.length && pairs(unitPart).length && !textPart) return null // unit not shown in the contents
  return c => {
    if (want.length) {
      const have = pairs(c.shown, { bare: true })
      const own = have.length ? have : (numbered ? [] : [['*', c.number]])
      const ok = want.every(([u, n]) => own.some(([hu, hn]) => (hu === u || hu === '*') && hn === n))
      if (!ok) return false
      return textPart ? norm(c.shown).includes(norm(textPart)) : true
    }
    return norm(c.shown).includes(text)
  }
}
/** The chapters a label covers, searching from `from` (the chapter after the previous range); null if unverifiable. */
function resolve(label, chapters, fromIndex) {
  const numbered = chapters.some(c => pairs(c.shown, { bare: true }).length)
  const [a, b] = endpoints(label)
  const ma = matcher(a, chapters, numbered), mb = matcher(b, chapters, numbered)
  if (!ma || !mb) return null
  const start = chapters.findIndex((c, i) => i >= fromIndex && ma(c))
  if (start < 0) return { error: `start "${a}" not found` }
  let end = -1
  for (let i = start; i < chapters.length; i++) if (mb(chapters[i])) end = i; else if (end >= 0) break
  if (end < 0) return { error: `end "${b}" not found` }
  return { first: chapters[start].number, last: chapters[end].number }
}
const FRONT = /^(preface|prologue|prolog|introduction|the introduction|indledning|dedication|letter of dedication|preface to the reader|synopsis|prelude|forord|tilegnelse)/i

// ---- files --------------------------------------------------------------------------------------------------
const ALLOWED = { top: ['schemaVersion', 'workId', 'language', 'revision', 'origin', 'authoredOn', 'opening', 'structure', 'people', 'context', 'notice'],
  structure: ['title', 'text'], people: ['name', 'role', 'text'], context: ['title', 'level', 'text', 'passages'], notice: ['text', 'why', 'passages'],
  passage: ['editionKey', 'chapterNumber', 'paragraphIndex', 'quote'] }
const LIMITS = { structure: [2, 6], people: [0, 8], context: [0, 4], notice: [2, 6] }
const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json')).sort()
let passageCount = 0, rangeCount = 0, checkedByContents = 0
for (const file of files) {
  const j = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf8'))
  const [workId, language] = file.replace(/\.json$/, '').split('.')
  if (j.workId !== workId || j.language !== language) err(file, 'file name does not match workId/language')
  if (!books.has(workId)) err(file, 'not a catalogue id')
  if (j.schemaVersion !== 1 || j.origin !== 'codex-app' || !Number.isInteger(j.revision)) err(file, 'schemaVersion/origin/revision')
  for (const k of Object.keys(j)) if (!ALLOWED.top.includes(k)) err(file, `unknown field ${k}`)
  if (JSON.stringify(j).includes('"takeaway"')) err(file, 'retired takeaway field present')
  if (j.opening != null) {
    const n = words(j.opening); if (n < 60 || n > 90) err(file, `opening has ${n} words`)
    if (language === 'en' && openers.has(workId) && sha(j.opening) !== sha(openers.get(workId))) err(file, 'English opening differs from book-openers.json')
  }
  for (const [row, [min, max]] of Object.entries(LIMITS)) {
    const items = j[row] || []
    if (items.length < min || items.length > max) err(file, `${row} has ${items.length} items (allowed ${min}–${max})`)
    items.forEach((item, i) => {
      for (const k of Object.keys(item)) if (!ALLOWED[row].includes(k)) err(file, `${row}[${i}] unknown field ${k}`)
      for (const k of ['text', 'why', 'title', 'role', 'name']) if (typeof item[k] === 'string' && words(item[k]) > 80) err(file, `${row}[${i}].${k} over 80 words`)
      for (const k of ['text', 'why', 'title']) if (typeof item[k] === 'string' && /[<>*_`]|\]\(|https?:/.test(item[k])) err(file, `${row}[${i}].${k} is not plain text`)
      if (row === 'context' && !['essential', 'recommended', 'optional'].includes(item.level)) err(file, `context[${i}] level`)
      for (const [p, passage] of (item.passages || []).entries()) {
        passageCount++
        const where = `${row}[${i}].passages[${p}]`
        for (const k of Object.keys(passage)) if (!ALLOWED.passage.includes(k)) err(file, `${where} unknown field ${k}`)
        const n = words(passage.quote || ''); if (n < 3 || n > 25) err(file, `${where} quote has ${n} words`)
        const ed = edition(workId, passage.editionKey)
        const chapter = ed?.find(c => c.number === passage.chapterNumber)
        const paragraph = chapter?.paragraphs?.[passage.paragraphIndex]
        if (!ed) err(file, `${where} edition ${passage.editionKey} missing`)
        else if (!chapter) err(file, `${where} chapter ${passage.chapterNumber} missing`)
        else if (typeof paragraph !== 'string') err(file, `${where} paragraph ${passage.paragraphIndex} missing`)
        else if (!ws(paragraph).includes(ws(passage.quote))) err(file, `${where} quote not in ${passage.editionKey} ch ${passage.chapterNumber} ¶${passage.paragraphIndex}: "${passage.quote}"`)
      }
    })
  }
  // Structure ranges.
  const entry = table[workId]
  if (!entry) { err(file, 'no Structure ranges recorded'); continue }
  if (entry.items.length !== j.structure.length) { err(file, `${j.structure.length} Structure items, ${entry.items.length} ranges recorded`); continue }
  const book = books.get(workId)
  const ed = edition(workId, book.defaultEditionKey)
  const units = entry.paragraphs ? ed[0].paragraphs.map((p, i) => ({ number: i, title: p })) : ed
  const numbers = units.map(u => u.number)
  entry.items.forEach((item, i) => {
    const title = j.structure[i].title, label = item[language]
    if (!(title === label || title.startsWith(label + ' · '))) err(file, `structure[${i}] "${title}" does not start with "${label}"`)
    if (language !== 'en') return
    rangeCount++
    const at = numbers.indexOf(item.first), end = numbers.indexOf(item.last)
    if (at < 0 || end < 0 || end < at) return err(file, `structure[${i}] ${item.first}–${item.last} outside the edition (${numbers[0]}–${numbers.at(-1)})`)
    if (i === 0 && at > 0) {
      const skipped = units.slice(0, at)
      if (!entry.paragraphs && !skipped.every(u => FRONT.test(u.title))) err(file, `chapters before the first range are not front matter: ${skipped.map(u => u.title).join(' | ')}`)
    }
    if (i > 0 && numbers.indexOf(entry.items[i - 1].last) + 1 !== at) err(file, `structure[${i}] does not follow on from structure[${i - 1}] (gap or overlap)`)
    if (i === entry.items.length - 1 && end < units.length - 1) tails.push(`${workId}: after "${label}" ${units.length - 1 - end} unit(s) left uncovered (${units.slice(end + 1).map(u => entry.paragraphs ? `¶${u.number}` : u.title).join(' | ').slice(0, 140)})`)
    if (entry.paragraphs) {
      // Clauses: the label's numbers must be the clause numbers that open the first and last paragraphs.
      const nums = [...label.matchAll(/\d+/g)].map(m => Number(m[0]))
      const clause = n => Number((units[numbers.indexOf(n)].title.match(/^(\d+)\./) || [])[1])
      if (clause(item.last) !== nums.at(-1) || (nums.length > 1 && clause(item.first) !== nums[0] && item.first !== 0)) err(file, `structure[${i}] clause numbers do not match "${label}"`)
      checkedByContents++
      return
    }
    const got = resolve(label, ed, i === 0 ? 0 : numbers.indexOf(entry.items[i - 1].last) + 1)
    if (!got) warnings.push(`${workId} "${label}": unit not shown in the contents; recorded chapters ${item.first}–${item.last} used`)
    else if (got.error || got.first !== item.first || got.last !== item.last) {
      const msg = `structure[${i}] "${label}" ${got.error || `resolves to ${got.first}–${got.last}, recorded ${item.first}–${item.last}`}`
      // A label left as supplied (already a range) is reported, not failed; a range added here must resolve.
      if (item.kept) warnings.push(`${workId} ${msg} (supplied label, left as is)`); else err(file, msg)
    }
    else checkedByContents++
    // The Danish label against the Danish edition, where that edition numbers its chapters the same way.
    const da = edition(workId, 'modern-da')
    const sameNumbers = da && da.map(c => c.number).join() === ed.map(c => c.number).join()
    if (i === 0 && da && !sameNumbers) warnings.push(`${workId}.da: modern-da has ${da.length} chapters against the default edition's ${ed.length}; the Danish ranges follow the default edition`)
    if (!item.kept && sameNumbers) {
      const dGot = resolve(item.da, da, i === 0 ? 0 : numbers.indexOf(entry.items[i - 1].last) + 1)
      // Ranges follow the default edition (Anders, 5 Nov 2026); where the Danish edition's contents disagree, say so.
      if (dGot && !dGot.error && (dGot.first !== item.first || dGot.last !== item.last)) warnings.push(`${workId}.da "${item.da}": the modern-da contents give ${dGot.first}–${dGot.last}, the default edition ${item.first}–${item.last}`)
      else if (dGot?.error) err(`${workId}.da.json`, `structure[${i}] "${item.da}" in modern-da: ${dGot.error}`)
    }
  })
}
for (const id of books.keys()) if (!files.includes(`${id}.en.json`)) warnings.push(`${id}: catalogue book without a primer`)
console.log(`PRIMER_FILES ${files.length} · passages ${passageCount} · structure ranges ${rangeCount} (${checkedByContents} resolved against the contents)`)
for (const t of tails) console.log('TAIL ' + t)
for (const w of warnings) console.log('WARN ' + w)
for (const e of errors) console.log('ERROR ' + e)
console.log(errors.length ? `PRIMER_CHECK_FAIL ${errors.length} error(s)` : 'PRIMER_CHECK_PASS')
process.exit(errors.length ? 1 : 0)
