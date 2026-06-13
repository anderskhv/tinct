const fs = require('fs')
const path = require('path')

const APP_DIR = path.resolve(__dirname, '../..')
const TAXONOMY = path.join(APP_DIR, 'src/data/libraryTaxonomy.ts')
const READ_DIR = path.join(APP_DIR, 'public/read')

const PATH_ID_ALIASES = { 'much-ado': 'much-ado-about-nothing' }
const BIBLE_ORDER = [
  'bible-genesis', 'bible-exodus', 'bible-joshua', 'bible-judges',
  'bible-1-samuel', 'bible-2-samuel', 'bible-1-kings',
  'bible-job', 'bible-psalms', 'bible-proverbs', 'bible-ecclesiastes', 'bible-song-of-solomon',
  'bible-isaiah', 'bible-jeremiah', 'bible-lamentations', 'bible-ezekiel', 'bible-daniel',
  'bible-hosea', 'bible-amos', 'bible-jonah', 'bible-micah',
  'bible-matthew', 'bible-mark', 'bible-luke', 'bible-john', 'bible-acts',
  'bible-romans', 'bible-hebrews', 'bible-revelation',
]

function extractJson(src, constName, open) {
  const start = src.indexOf(`export const ${constName}`)
  if (start === -1) throw new Error(`Could not find ${constName} in libraryTaxonomy.ts`)
  const eq = src.indexOf('=', start)
  const from = src.indexOf(open, eq)
  const close = open === '[' ? ']' : '}'
  const rest = src.slice(from)
  const endIdx = rest.search(new RegExp(`\\n\\${close}`))
  if (endIdx === -1) throw new Error(`Could not find end of ${constName}`)
  return JSON.parse(rest.slice(0, endIdx + 2))
}

function loadTaxonomy() {
  const src = fs.readFileSync(TAXONOMY, 'utf8')
  return {
    bookMeta: extractJson(src, 'LIBRARY_BOOK_META', '['),
    shelves: extractJson(src, 'LIBRARY_SHELVES', '{'),
    houses: extractJson(src, 'LIBRARY_HOUSES', '['),
  }
}

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function stripTags(s) {
  return String(s ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function summaryIds(readDir = READ_DIR) {
  if (!fs.existsSync(readDir)) return []
  return fs.readdirSync(readDir)
    .filter(name => fs.existsSync(path.join(readDir, name, 'summary.html')))
    .sort()
}

function summaryFallback(id, readDir = READ_DIR) {
  const file = path.join(readDir, id, 'summary.html')
  const html = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : ''
  const rawTitle = html.match(/<title>([^<]+)<\/title>/i)?.[1] || id
  const title = stripTags(rawTitle)
    .replace(/\s+Summary.*$/i, '')
    .replace(/\s+by\s+.+$/i, '')
    .replace(/\s+\|\s+Tinct$/i, '')
  const hook = stripTags(html.match(/<p\s+class=["']hook["']>([\s\S]*?)<\/p>/i)?.[1] || '')
  const rawDescription = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i)?.[1] || ''
  const description = hook || rawDescription.replace(/^A clear guide to .+?'s ([^:]+: .*)$/i, 'A clear guide to $1')
  return {
    id,
    title,
    author: '',
    year: '',
    ySort: 9999,
    form: '',
    era: '',
    blurb: description,
    themes: [],
    shelves: id.startsWith('bible-') ? ['bible-and-devotion'] : [],
  }
}

function truncate(value, max = 132) {
  const text = stripTags(value)
  if (text.length <= max) return text
  const cut = text.slice(0, max + 1)
  const boundary = Math.max(cut.lastIndexOf(' '), cut.lastIndexOf('—'), cut.lastIndexOf(':'))
  return `${cut.slice(0, boundary > max * 0.65 ? boundary : max).replace(/[,\s;:—-]+$/, '')}...`
}

function primaryHouseFor(shelves, houses) {
  for (const house of houses) {
    if (shelves.some(shelfId => house.shelves.includes(shelfId))) return house.id
  }
  return ''
}

function sharedCount(a, b) {
  const bSet = new Set(b)
  return a.filter(value => bSet.has(value)).length
}

function bibleAffinity(currentId, candidateId) {
  if (currentId === 'bible' && candidateId.startsWith('bible-')) {
    const anchor = new Set(['bible-genesis', 'bible-psalms', 'bible-matthew'])
    return anchor.has(candidateId) ? 95 : 60
  }
  if (!currentId.startsWith('bible-') || !candidateId.startsWith('bible-')) return 0
  const currentIndex = BIBLE_ORDER.indexOf(currentId)
  const candidateIndex = BIBLE_ORDER.indexOf(candidateId)
  if (currentIndex === -1 || candidateIndex === -1) return 40
  const matthewIndex = BIBLE_ORDER.indexOf('bible-matthew')
  const sameTestament = (currentIndex < matthewIndex && candidateIndex < matthewIndex) || (currentIndex >= matthewIndex && candidateIndex >= matthewIndex)
  return Math.max(20, 100 - Math.abs(currentIndex - candidateIndex) * 12) + (sameTestament ? 30 : 0)
}

function relatedBooksFor(bookId, options = {}) {
  const readDir = options.readDir || READ_DIR
  const limit = options.limit || 3
  const { bookMeta, shelves, houses } = loadTaxonomy()
  const taxByPathId = new Map()
  for (const meta of bookMeta) {
    const id = PATH_ID_ALIASES[meta.id] || meta.id
    taxByPathId.set(id, { ...meta, id })
  }

  const ids = summaryIds(readDir)
  const byId = new Map(ids.map(id => [id, { ...summaryFallback(id, readDir), ...(taxByPathId.get(id) || {}) }]))
  const current = byId.get(bookId)
  if (!current) return []

  const currentShelves = current.shelves || []
  const currentThemes = current.themes || []
  const currentHouse = primaryHouseFor(currentShelves, houses)

  return [...byId.values()]
    .filter(candidate => candidate.id !== bookId)
    .map(candidate => {
      const candidateShelves = candidate.shelves || []
      const sameShelf = sharedCount(currentShelves, candidateShelves)
      const sameThemes = sharedCount(currentThemes, candidate.themes || [])
      const candidateHouse = primaryHouseFor(candidateShelves, houses)
      const yearDistance = Math.abs((current.ySort || 0) - (candidate.ySort || 0))
      const score =
        sameShelf * 100 +
        bibleAffinity(bookId, candidate.id) +
        (currentHouse && currentHouse === candidateHouse ? 25 : 0) +
        (current.form && current.form === candidate.form ? 8 : 0) +
        sameThemes * 5 +
        Math.max(0, 5 - Math.min(5, Math.floor(yearDistance / 500)))
      return { candidate, score }
    })
    .filter(item => item.score > 0 || currentShelves.length === 0)
    .sort((a, b) => b.score - a.score || (a.candidate.ySort || 9999) - (b.candidate.ySort || 9999) || a.candidate.title.localeCompare(b.candidate.title))
    .slice(0, limit)
    .map(({ candidate }) => {
      const shelfId = (candidate.shelves || [])[0]
      const shelf = shelfId ? shelves[shelfId] : null
      return {
        id: candidate.id,
        href: `/read/${candidate.id}/summary`,
        label: shelf ? shelf.title : 'From the library',
        title: candidate.title,
        description: truncate(candidate.blurb || `${candidate.title} by ${candidate.author}`),
      }
    })
}

function renderReadNextSection(bookId, options = {}) {
  const related = relatedBooksFor(bookId, options)
  if (related.length === 0) return ''
  return `    <h2 class="section">Read <em>next</em></h2>
    <div class="guides read-next">
${related.map(item => `      <a href="${item.href}" class="guide-card">
        <div class="guide-label">${esc(item.label)}</div>
        <div class="guide-title">${esc(item.title)}</div>
        <div class="guide-desc">${esc(item.description)}</div>
      </a>`).join('\n')}
    </div>
`
}

module.exports = { relatedBooksFor, renderReadNextSection }
