/**
 * Where an added public-domain book goes in the library: form, era and one of
 * the existing Houses -> Shelves (src/data/libraryTaxonomy.ts), decided from the
 * catalogue's subjects, bookshelves, language and dates.
 *
 * Deterministic rules first. Only when the rules have no real signal ("low"
 * confidence) and the AI switch is on (PUBLIC_BOOK_AI_CLASSIFY=1, production
 * only) is a model asked to choose among the same shelves; its answer is used
 * only if it names one of them. The model sees catalogue metadata only (title,
 * author, dates, subjects), never reader data. Development and tests use a mock.
 */
import type { CatalogueWork, PublicPlacement } from '../../../public/lab/public-books.js'

/** The Houses and Shelves as in libraryTaxonomy.ts (a test keeps them identical). */
export const HOUSES: Record<string, { title: string; sub: string; hue: number }> = {
  philosophy: { title: 'Philosophy', sub: 'What is real, how to live', hue: 215 },
  politics: { title: 'Politics & The State', sub: 'Power, liberty, foundations', hue: 90 },
  drama: { title: 'Drama', sub: 'The plays, in four Shakespearean modes and a Greek tradition', hue: 265 },
  novel: { title: 'Fiction', sub: 'Novels and stories, by tradition', hue: 25 },
  epic: { title: 'Poetry & Epic', sub: 'From Gilgamesh to Milton', hue: 35 },
  scripture: { title: 'Scripture & Devotion', sub: 'Sacred texts and contemplatives', hue: 230 },
  history: { title: 'History', sub: 'The first historians', hue: 60 },
  strategy: { title: 'War & Strategy', sub: 'The art of conflict, and its history', hue: 355 },
}

export const SHELVES: Record<string, { house: string; title: string; sub: string; hue: number }> = {
  'plato': { house: 'philosophy', title: "Plato's Dialogues", sub: 'Six conversations around Socrates', hue: 225 },
  'aristotle': { house: 'philosophy', title: 'Aristotle', sub: 'Ethics, politics, poetics', hue: 90 },
  'stoics': { house: 'philosophy', title: 'The Stoics', sub: 'Epictetus and Marcus Aurelius', hue: 25 },
  'christian-philosophy': { house: 'philosophy', title: 'Christian Tradition', sub: 'Augustine, à Kempis, Kierkegaard', hue: 230 },
  'modern-philosophy': { house: 'philosophy', title: 'Modern Philosophy', sub: 'Descartes through Nietzsche', hue: 215 },
  'on-the-state': { house: 'politics', title: 'On the State', sub: 'Constitutions, sovereignty, federalism', hue: 90 },
  'on-power': { house: 'politics', title: 'On Power & Tyranny', sub: 'Machiavelli, Marx, and the dramatists', hue: 355 },
  'on-liberty': { house: 'politics', title: 'On Liberty', sub: 'Rousseau, Wollstonecraft, Mill', hue: 90 },
  'founding-docs': { house: 'politics', title: 'Founding Documents', sub: 'Magna Carta, US founding, Federalist', hue: 90 },
  'shakespeare-tragedy': { house: 'drama', title: 'Shakespeare — Tragedies', sub: 'Hamlet, Lear, Othello, Macbeth & co.', hue: 355 },
  'shakespeare-comedy': { house: 'drama', title: 'Shakespeare — Comedies', sub: 'Romances, farces, problem plays', hue: 150 },
  'shakespeare-history': { house: 'drama', title: 'Shakespeare — Histories', sub: 'The English chronicle plays', hue: 265 },
  'greek-tragedy': { house: 'drama', title: 'Greek Tragedy', sub: 'Aeschylus, Sophocles, Euripides', hue: 300 },
  'modern-drama': { house: 'drama', title: 'Modern Drama', sub: "Goethe's Faust", hue: 265 },
  'russian-novels': { house: 'novel', title: 'The Russians', sub: 'Dostoevsky and Tolstoy', hue: 355 },
  'english-novels': { house: 'novel', title: '19th-Century English Novels', sub: 'Austen to Conrad', hue: 265 },
  'american-novels': { house: 'novel', title: 'American Novels', sub: 'Melville and Chopin', hue: 200 },
  'modernist-novels': { house: 'novel', title: 'Modernism', sub: 'A new century, a new sentence', hue: 25 },
  'nordic-novels': { house: 'novel', title: 'Nordic Novels', sub: 'Jacobsen and Lagerlöf', hue: 90 },
  'gothic-novels': { house: 'novel', title: 'The Gothic', sub: 'Doubles, monsters, dark houses', hue: 265 },
  'satirical-novels': { house: 'novel', title: 'Satire', sub: 'Voltaire and the philosophical tale', hue: 35 },
  'adventure': { house: 'novel', title: 'Adventure', sub: 'Journeys, wagers and the open sea', hue: 60 },
  'detective-fiction': { house: 'novel', title: 'Detective Fiction', sub: 'Cases, clues and the logic of inference', hue: 265 },
  'ancient-epics': { house: 'epic', title: 'Ancient Epics', sub: 'Gilgamesh, Homer, Virgil', hue: 35 },
  'sacred-epics': { house: 'epic', title: 'Sacred Epics', sub: 'Dante and Milton', hue: 265 },
  'medieval-epics': { house: 'epic', title: 'Medieval Epics', sub: 'Beowulf', hue: 200 },
  'bible-and-devotion': { house: 'scripture', title: 'Bible & Devotion', sub: 'Scripture, and the books read alongside it', hue: 230 },
  'ancient-history': { house: 'history', title: 'Ancient History', sub: 'The first historians', hue: 60 },
  'on-war': { house: 'strategy', title: 'On War', sub: 'A cross-shelf, from Sun Tzu to Tolstoy', hue: 355 },
  'strategy': { house: 'strategy', title: 'Strategy', sub: 'The art of conflict', hue: 35 },
}

export type Form = 'drama' | 'novel' | 'short-stories' | 'epic' | 'philosophy' | 'political' | 'history' | 'scripture' | 'strategy'
export type Era = 'antiquity' | 'medieval' | 'early-modern' | 'modern' | 'contemporary'

export interface Classification {
  form: Form
  era: Era | null
  year: number | null
  shelfIds: string[]
  houseIds: string[]
  /** "rule": a subject or bookshelf decided it; "low": a default; "ai": the model chose. */
  confidence: 'rule' | 'low' | 'ai'
}

/** The year the work belongs to: first publication, else the author's lifetime. */
export function workYear(work: Pick<CatalogueWork, 'firstPublishedYear' | 'authors'>): number | null {
  if (Number.isFinite(work.firstPublishedYear)) return work.firstPublishedYear as number
  const author = work.authors?.[0]
  if (Number.isFinite(author?.deathYear)) return (author!.deathYear as number) - 5
  if (Number.isFinite(author?.birthYear)) return (author!.birthYear as number) + 40
  return null
}

export function eraOf(year: number | null): Era | null {
  if (year === null) return null
  if (year < 500) return 'antiquity'
  if (year < 1500) return 'medieval'
  if (year < 1800) return 'early-modern'
  if (year < 1900) return 'modern'
  return 'contemporary'
}

const has = (text: string, pattern: RegExp) => pattern.test(text)

/** The rules. Order matters: the first form whose words appear decides. */
export function classifyByRules(work: CatalogueWork): Classification {
  const text = [...(work.subjects || []), ...(work.bookshelves || [])].join(' | ').toLowerCase()
  const author = (work.authors || []).map(person => person.name).join(' ').toLowerCase()
  const title = (work.title || '').toLowerCase()
  const languages = work.language || []
  const year = workYear(work)
  const era = eraOf(year)
  let form: Form | null = null
  let shelf: string | null = null
  let confident = true

  if (has(text, /\bdrama\b|tragedies|comedies|comedy plays|plays\/films|\bplays\b|historical drama/)) form = 'drama'
  else if (has(text, /\bpoetry\b|\bpoems\b|\bepic\b|ballads|\bverse\b|sonnets/)) form = 'epic'
  else if (has(text, /short stories|tales\b/)) form = 'short-stories'
  else if (has(text, /fiction|novels|stories|romance|fairy tales|bildungsroman/)) form = 'novel'
  else if (has(text, /military art|art of war|strategy|tactics|warfare/)) form = 'strategy'
  else if (has(text, /philosophy|ethics|metaphysics|\blogic\b|stoic|epistemology/)) form = 'philosophy'
  else if (has(text, /political|politics|government|constitution|democracy|\bliberty\b|socialism|communism|\bstate, the\b/)) form = 'political'
  else if (has(text, /\bbible\b|religion|spirituality|christian|theology|devotion|sermons|prayer|koran|mysticism|buddhis/)) form = 'scripture'
  else if (has(text, /history|biograph|\bwar\b|travel/)) form = 'history'

  switch (form) {
    case 'drama':
      if (/shakespeare/.test(author)) shelf = has(text, /comed/) ? 'shakespeare-comedy' : has(text, /histor|kings and rulers/) ? 'shakespeare-history' : 'shakespeare-tragedy'
      else if (era === 'antiquity' || has(text, /greek drama|aeschylus|sophocles|euripides|tragedies, greek/)) shelf = 'greek-tragedy'
      else shelf = 'modern-drama'
      break
    case 'epic':
      if (era === 'antiquity' || has(text, /classical|greek poetry|latin poetry|homer|virgil/)) shelf = 'ancient-epics'
      else if (has(text, /christian|religious|sacred|bible|hymns|devotional/)) shelf = 'sacred-epics'
      else if (era === 'medieval' || has(text, /medieval|middle english|old english|arthurian|romances/)) shelf = 'medieval-epics'
      else { shelf = 'sacred-epics'; confident = false }
      break
    case 'novel':
    case 'short-stories':
      if (has(text, /detective|mystery|crime/)) shelf = 'detective-fiction'
      else if (has(text, /horror|gothic|ghost|vampire|supernatural/)) shelf = 'gothic-novels'
      else if (has(text, /satire|satirical|humorous|humour|humor\b/)) shelf = 'satirical-novels'
      else if (has(text, /adventure|sea stories|western stories|voyages|pirates|science fiction/)) shelf = 'adventure'
      else if (languages.includes('ru') || has(text, /russia/)) shelf = 'russian-novels'
      else if (languages.some(l => ['da', 'sv', 'no', 'nb', 'fi', 'is'].includes(l)) || has(text, /danish|swedish|norwegian|finnish|icelandic|scandinavian/)) shelf = 'nordic-novels'
      else if (has(text, /american/)) shelf = 'american-novels'
      else if (year !== null && year >= 1900) shelf = 'modernist-novels'
      else if (has(text, /english|british|england|london/)) shelf = 'english-novels'
      else { shelf = year !== null && year >= 1900 ? 'modernist-novels' : 'english-novels'; confident = false }
      break
    case 'strategy':
      shelf = has(text, /strategy|art of war|tactics|military art/) ? 'strategy' : 'on-war'
      break
    case 'philosophy':
      if (/\bplato\b/.test(author)) shelf = 'plato'
      else if (/aristotle/.test(author)) shelf = 'aristotle'
      else if (has(text, /stoic/) || /epictetus|seneca|marcus aurelius/.test(author)) shelf = 'stoics'
      else if (has(text, /christian|theology|religio/)) shelf = 'christian-philosophy'
      else shelf = 'modern-philosophy'
      break
    case 'political':
      if (has(text, /constitution|federalist|founding|declaration of independence/) || /constitution|federalist/.test(title)) shelf = 'founding-docs'
      else if (has(text, /liberty|rights|women|suffrage|freedom/)) shelf = 'on-liberty'
      else if (has(text, /tyranny|despotism|power|revolution|socialism|communism|anarchism/)) shelf = 'on-power'
      else shelf = 'on-the-state'
      break
    case 'scripture':
      shelf = 'bible-and-devotion'
      break
    case 'history':
      shelf = has(text, /\bwar\b|military|warfare|battles/) ? 'on-war' : 'ancient-history'
      break
    default:
      // No subject or bookshelf says what this is: a default the AI may replace.
      form = 'novel'
      shelf = year !== null && year >= 1900 ? 'modernist-novels' : 'english-novels'
      confident = false
  }
  return { form: form!, era, year, shelfIds: [shelf!], houseIds: [SHELVES[shelf!].house], confidence: confident ? 'rule' : 'low' }
}

export function placementFor(shelfIds: string[]): PublicPlacement[] {
  return shelfIds.filter(id => SHELVES[id]).map(id => {
    const shelf = SHELVES[id], house = HOUSES[shelf.house]
    return { houseId: shelf.house, houseTitle: house.title, houseSubtitle: house.sub, houseHue: house.hue, shelfId: id, shelfTitle: shelf.title, shelfSubtitle: shelf.sub, shelfHue: shelf.hue }
  })
}

/** The model call: catalogue metadata in, one shelf id out. Injected so tests and development never call a provider. */
export type ShelfChooser = (input: { title: string; author: string; year: number | null; subjects: string[]; shelves: Array<{ id: string; title: string; sub: string }> }) => Promise<string | null>

export const CLASSIFY_MODEL = 'claude-haiku-4-5'

/** The production chooser (Anthropic). Never used unless PUBLIC_BOOK_AI_CLASSIFY=1 and the key is set. */
export function anthropicShelfChooser(apiKey: string, fetchImpl: typeof fetch = fetch): ShelfChooser {
  return async input => {
    const list = input.shelves.map(shelf => `${shelf.id}: ${shelf.title} (${shelf.sub})`).join('\n')
    const response = await fetchImpl('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: CLASSIFY_MODEL,
        max_tokens: 20,
        system: 'You place public-domain books on a library shelf. Answer with one shelf id from the list and nothing else.',
        messages: [{ role: 'user', content: `Book: ${input.title}\nAuthor: ${input.author || 'unknown'}\nYear: ${input.year ?? 'unknown'}\nSubjects: ${input.subjects.slice(0, 20).join('; ') || 'none'}\n\nShelves:\n${list}` }],
      }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok) return null
    const data = await response.json() as { content?: Array<{ type: string; text?: string }> }
    const text = (data.content || []).map(part => part.text || '').join('').trim().toLowerCase()
    return text.split(/\s+/)[0] || null
  }
}

/** Rules, then (only for a low-confidence default) the chooser, if one is given. */
export async function classifyWork(work: CatalogueWork, chooser?: ShelfChooser | null): Promise<Classification> {
  const result = classifyByRules(work)
  if (result.confidence !== 'low' || !chooser) return result
  try {
    const shelves = Object.entries(SHELVES).map(([id, shelf]) => ({ id, title: shelf.title, sub: shelf.sub }))
    const choice = await chooser({ title: work.title, author: (work.authors || []).map(p => p.name).join(', '), year: result.year, subjects: [...(work.subjects || []), ...(work.bookshelves || [])], shelves })
    if (!choice || !SHELVES[choice]) return result
    const house = SHELVES[choice].house
    const form: Form = house === 'politics' ? 'political' : house === 'novel' ? (result.form === 'short-stories' ? 'short-stories' : 'novel') : house as Form
    return { ...result, form, shelfIds: [choice], houseIds: [house], confidence: 'ai' }
  } catch {
    return result
  }
}
