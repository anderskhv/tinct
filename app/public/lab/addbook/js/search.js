// Shared by the worker and the standalone Node verification. No app dependencies.
// "on" too: "seneca on anger" finds L'Estrange's "...Benefits, Anger and Clemency" (an exact title still counts it).
const STOP = new Set(['a', 'an', 'the', 'of', 'and', 'in', 'to', 'by', 'for', 'on']);
// Letters NFKD does not decompose, so "Kobenhavn" finds "København" and "strasse" finds "Straße".
const FOLD = {'ø':'o','æ':'ae','œ':'oe','ß':'ss','ł':'l','đ':'d','ð':'d','þ':'th','ı':'i'};
// Spellings and abbreviations that mean the same name or title, applied to the index and the
// query alike, after folding (whole words only): "tolstoi" finds Tolstoy, "dr faustus" Doctor Faustus.
const VARIANTS = [
  ['tolstoi|tolstoj', 'tolstoy'],
  ['tchekhov|tchekoff|tchehov|tchekov|chekov|chekhoff|cechov', 'chekhov'],
  ['vergil', 'virgil'],
  ['koran|kuran', 'quran'],
  ['dr', 'doctor'],
  ['st', 'saint'],
  ['lao tzu|lao tse|lao tsze|lao tseu|laotse|laotzu|lao zi', 'laozi'],
  ['tao teh king|tao te king|tao teh ching', 'tao te ching'],
  ['80', 'eighty'],
  ['20 000|20000', 'twenty thousand'],
  ['1001', 'thousand and one'],
  ['goncharoff', 'goncharov'],
  ['tourgenieff|turgenieff|turgeniev', 'turgenev'],
  ['bhagavadgita', 'bhagavad gita'],
  ['mobydick', 'moby dick'],
];
const VARIANT_OF = new Map(VARIANTS.flatMap(([from, to]) => from.split('|').map(f => [f, to])));
// One pass for the whole table; longer spellings first, so "tao teh king" wins over a shorter one.
const VARIANT = new RegExp(`(?<=^| )(?:${[...VARIANT_OF.keys()].sort((a, b) => b.length - a.length).join('|')})(?= |$)`, 'g');
export function normalize(value) {
  let out = value.toLowerCase().replace(/[øæœßłđðþı]/g, c => FOLD[c]).normalize('NFKD').replace(/\p{M}/gu, '')
    // A letter on each side of an apostrophe is one word: "Qur'an" is "quran", "Gulliver's" "gullivers".
    .replace(/(\p{L})['’ʼ](\p{L})/gu, '$1$2')
    .replace(/dostoyevsky|dostoievski|dostoievsky|dostoevskii|dostoyevski/g, 'dostoevsky')
    .replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  return out.replace(VARIANT, word => VARIANT_OF.get(word));
}
// Other titles readers know a work by (hand-checked; title and author tested after normalize).
// They rank as titles, in the catalogue and for Tinct's own books alike. A Tinct registry book
// can carry its own as `altTitles`.
export const ALT_TITLES = [
  [/^notre dame de paris\b/, /hugo/, ['The Hunchback of Notre Dame']],
  [/^(the )?divine comedy\b(?!.*\b(purgatorio|purgatory|paradiso|paradise)\b)|^dantes inferno|^the vision of hell/, /dante/, ['Inferno', "Dante's Inferno"]],
  [/^capital( a critique|$)/, /marx/, ['Das Kapital']],
  [/^the song celestial/, /(?:)/, ['Bhagavad Gita']],
  [/^(the )?quran\b/, /(?:)/, ['Quran', 'Holy Quran']],
  [/^the (holy )?bible\b|^the king james (version of the )?bible/, /various|anonymous|^$/, ['King James Bible', 'Holy Bible', 'KJV']],
  [/^(the )?confessions$/, /augustine/, ['The Confessions of Saint Augustine']],
  [/^les miserables/, /hugo/, ['Les Mis']],
  [/^(the )?adventures of huckleberry finn/, /twain|clemens/, ['Huck Finn']],
  [/^thus spake zarathustra/, /nietzsche/, ['Thus Spoke Zarathustra']],
  [/^(the )?tao te ching/, /laozi/, ['Tao Te Ching', 'Daodejing']],
  [/^(the )?communist manifesto|^manifesto of the communist party/, /marx/, ['The Communist Manifesto']],
  [/^on the origin of species/, /darwin/, ['The Origin of Species']],
  [/^oedipus (rex|tyrannus|the king|king of thebes)$/, /sophocles/, ['Oedipus Rex', 'Oedipus the King', 'Oedipus Tyrannus']],
  [/^(the )?(manual|enchiridion|handbook)$/, /epictetus/, ['Enchiridion', 'The Handbook']],
  [/^the federalist( papers)?$/, /hamilton|madison|publius|various/, ['The Federalist Papers', 'The Federalist']],
  // Seneca's letters: Penguin's selection is "Letters from a Stoic"; the Latin and the older English names.
  [/^(moral letters to lucilius|epistulae morales( ad lucilium)?|(the )?epistles of (lucius annaeus )?seneca|letters to lucilius)\b/, /seneca/,
    ['Letters from a Stoic', 'Moral Letters to Lucilius', 'Epistulae Morales ad Lucilium', 'Moral Epistles', 'Letters to Lucilius', 'Letters on Ethics']],
  // Seneca's dialogues printed by themselves, under their English or Latin names.
  [/^((on|of) the shortness of life|de brevitate vitae)$/, /seneca/, ['On the Shortness of Life', 'De Brevitate Vitae']],
  [/^((on|of) anger|de ira)$/, /seneca/, ['On Anger', 'De Ira']],
  [/^((of )?peace of mind|(on|of) (the )?tranquillity of (the )?mind|de tranquillitate animi)$/, /seneca/, ['Peace of Mind', 'On the Tranquillity of the Mind', 'De Tranquillitate Animi']],
  [/^((on|of) (a |the )?happy life|de vita beata)$/, /seneca/, ['On the Happy Life', 'De Vita Beata']],
  [/^((the )?meditations|(the )?thoughts)( of( the emperor)? marcus( aurelius)?( antoninus)?)?$|^marcus aurelius$/, /marcus aurelius/, ['Meditations', 'To Himself']],
  [/^(on|of) the nature of things$|^de rerum natura$/, /lucretius/, ['On the Nature of Things', 'De Rerum Natura']],
  [/^(the )?city of god\b|^de civitate dei\b/, /augustin/, ['The City of God', 'De Civitate Dei']],
  [/^(the )?consolation of philosophy$|^de (philosophiae )?consolatione( philosophiae)?$/, /boethius|boet/, ['The Consolation of Philosophy', 'De Consolatione Philosophiae']],
  [/^(the )?prince$|^il principe$/, /machiavel/, ['The Prince', 'Il Principe']],
  [/^(the )?analects\b/, /confucius/, ['The Analects', 'Lunyu']],
  [/^(the )?nicomachean ethics\b/, /aristotle/, ['Nicomachean Ethics', 'Ethics']],
  [/^(pascals )?pensees$|^(the )?thoughts of blaise pascal$/, /pascal/, ['Pensées', 'Thoughts']],
  [/^(the )?sorrows of young werther$|^die leiden des jungen werthers?\b/, /goethe/, ['The Sorrows of Young Werther', 'Werther']],
  [/^(les )?fleurs du mal$|^(the )?flowers of evil$/, /baudelaire/, ['The Flowers of Evil', 'Les Fleurs du mal']],
  [/^(a )?discourse (on|of) (the )?method\b|^discours de la methode\b/, /descartes/, ['Discourse on the Method', 'Discours de la méthode']],
  [/^(the )?social contract$|^du contrat social\b/, /rousseau/, ['The Social Contract', 'Du contrat social']],
];
/**
 * Works printed inside a collection, from its table of contents (checked against the Gutenberg
 * text, 2026-10-08): [title, author, [[name, Wikidata work or null, other names]]]. A query for one
 * finds the collection (its words rank as title words) and the row says "Includes <name>"
 * (includedWork). The Wikidata work lends its fame (sitelinks, from the work priors) to the
 * author card's best-known works. Hand-checked; add a collection only from its own contents.
 */
export const CONTAINED_WORKS = [
  // Gutenberg 64576, Aubrey Stewart (1889).
  [/^minor dialogues\b/, /seneca/, [
    ['On Providence', 'Q2264770', ['Of Providence', 'De Providentia']],
    ['On the Firmness of the Wise Man', 'Q16548949', ['On Constancy', 'De Constantia Sapientis']],
    ['On Anger', 'Q3704115', ['Of Anger', 'De Ira']],
    ['To Marcia, On Consolation', null, ['Of Consolation to Marcia', 'Ad Marciam']],
    ['On the Happy Life', 'Q1180753', ['Of a Happy Life', 'On a Happy Life', 'De Vita Beata']],
    ['On Leisure', 'Q1180722', ['Of Leisure', 'De Otio']],
    ['Peace of Mind', 'Q3704175', ['Of Peace of Mind', 'On the Tranquillity of the Mind', 'On Tranquillity of Mind', 'De Tranquillitate Animi']],
    ['On the Shortness of Life', 'Q1180596', ['Of the Shortness of Life', 'De Brevitate Vitae']],
    ['To Helvia, On Consolation', 'Q11862232', ['Of Consolation to Helvia', 'To Mother Helvia', 'Ad Helviam']],
    ['To Polybius, On Consolation', 'Q2879649', ['Of Consolation to Polybius', 'Ad Polybium']],
    ['On Clemency', null, ['Of Clemency', 'De Clementia']],
  ]],
  // Gutenberg 56075, Roger L'Estrange's abstract (1882): its title names its four parts (an
  // abstract, so not under their Latin names: "de ira" finds the whole dialogue in Minor Dialogues).
  [/^senecas morals of a happy life benefits anger and clemency$/, /seneca/, [
    ['On the Happy Life', 'Q1180753', ['Of a Happy Life', 'On a Happy Life']],
    ['On Benefits', null, ['Of Benefits']],
    ['On Anger', 'Q3704115', ['Of Anger']],
    ['On Clemency', null, ['Of Clemency']],
  ]],
  // Gutenberg 57999, Frank Justus Miller (1907).
  [/^(the )?tragedies of seneca$/, /seneca/, [
    ['Oedipus', null, []], ['Phoenissae', null, ['The Phoenician Women']], ['Medea', null, []],
    ['Hercules Furens', null, ['Mad Hercules', 'The Madness of Hercules']], ['Phaedra', null, ['Hippolytus', 'Phaedra or Hippolytus']],
    ['Hercules Oetaeus', null, ['Hercules on Oeta']], ['Thyestes', 'Q3990982', []], ['Troades', null, ['The Trojan Women', 'The Daughters of Troy']],
    ['Agamemnon', 'Q15059087', []], ['Octavia', null, []],
  ]],
  // Gutenberg 46058, Ella Isabel Harris (1899): its subtitle names both.
  [/^two tragedies of seneca$/, /seneca/, [['Medea', null, []], ['The Daughters of Troy', null, ['Troades', 'The Trojan Women']]]],
];
const ANY_CONTAINED = new RegExp(CONTAINED_WORKS.map(([titleRe]) => titleRe.source).join('|'));
/** The works printed inside a collection: [{title, wikidata, aliases}], from its title and author names. */
export function containedWorksFor(title, authors, norm = normalize) {
  const t = norm(title || '');
  if (!ANY_CONTAINED.test(t)) return [];
  const a = norm(authors || '');
  return CONTAINED_WORKS.filter(([titleRe, authorRe]) => titleRe.test(t) && authorRe.test(a))
    .flatMap(entry => entry[2].map(([name, wikidata, aliases]) => ({title: name, wikidata, aliases})));
}
/**
 * The work inside a collection a query asks for ("seneca on anger" in Minor Dialogues: "On Anger"),
 * or '': every query word that is not the author's (or a stop word) is a word of one of the
 * contained work's names (the last may be the start of one), and the collection's own title
 * does not already hold them all.
 */
export function includedWork(title, authors, query) {
  const contained = containedWorksFor(title, authors);
  if (!contained.length) return '';
  const author = new Set(tokens(authors || ''));
  const terms = [...new Set(tokens(query || ''))].filter(t => !STOP.has(t) && !author.has(t));
  if (!terms.length) return '';
  const own = new Set(tokens(title || ''));
  if (terms.every(t => own.has(t))) return '';
  const holds = names => names.some(name => { const list = tokens(name); return terms.every((t, i) => list.includes(t) || (i === terms.length - 1 && t.length >= 3 && list.some(w => w.startsWith(t)))); });
  return contained.find(work => holds([work.title, ...work.aliases]))?.title || '';
}
/** The curated other titles of a work, from its title and author names. */
const ANY_ALT_TITLE = new RegExp(ALT_TITLES.map(([titleRe]) => titleRe.source).join('|'));
export function altTitlesFor(title, authors, norm = normalize) {
  const t = norm(title || '');
  if (!ANY_ALT_TITLE.test(t)) return [];
  const found = ALT_TITLES.filter(([titleRe]) => titleRe.test(t));
  const a = norm(authors || '');
  return found.filter(([, authorRe]) => authorRe.test(a)).flatMap(entry => entry[2]);
}
const tokens = value => normalize(value).split(' ').filter(Boolean);
// Exact-title ranking ignores a leading article in any catalogue language ("The Odyssey" = "Odyssey").
const ARTICLE = /^(the|a|an|le|la|les|l|un|une|der|die|das|ein|eine|el|los|las|il|lo|gli|o|os|as|de|het|een|den|det|en|et|ett) /;
const core = value => value.replace(ARTICLE, '');
export function near(a, b, limit = 1) {
  if (Math.abs(a.length - b.length) > limit) return false;
  // Bounded Damerau-Levenshtein, including an adjacent transposition.
  let prev2, prev = Array.from({length: b.length + 1}, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(row[j - 1] + 1, prev[j] + 1, prev[j - 1] + (a[i - 1] !== b[j - 1]));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) row[j] = Math.min(row[j], prev2[j - 2] + 1);
    }
    if (Math.min(...row) > limit) return false;
    prev2 = prev; prev = row;
  }
  return prev[b.length] <= limit;
}
// Names as readers write them (search audit, 2026-10-08). The catalogue keeps library forms that
// lost their order: "Roger, Sir L'Estrange" is Sir Roger L'Estrange, "Leo, graf Tolstoy" is Leo
// Tolstoy, "Agénor, comte de Gasparin" Agénor de Gasparin, "Emperor of Rome Marcus Aurelius"
// Marcus Aurelius. A form that already reads right ("Alfred Tennyson, Baron Tennyson") is kept.
const COURTESY = /^(.+?), (Sir|Dame|Lady|Mrs\.?) (\S.*)$/;
const NOBLE = /^(.+?), (?:graf|gräfin|count|countess|comte|comtesse|vicomte|baron|baronne|freiherr|marquis|marquise|duc|duke|conde|conte) (\S.*)$/i;
const PARTICLE = /^(de|von|van|di|da|du|del|della|le|la|zu)\b/i;
export function cleanName(name) {
  const text = String(name ?? '').trim().replace(/^(?:Emperor|Empress|King|Queen) of [A-Z][a-z]+ (?=\S)/, '');
  const saint = /^of (.+?), Saint (\S.*)$/.exec(text);
  if (saint) return `Saint ${saint[2]} of ${saint[1]}`;
  const courtesy = COURTESY.exec(text);
  if (courtesy && !courtesy[3].includes(',')) return `${courtesy[2]} ${courtesy[1]} ${courtesy[3]}`;
  const noble = NOBLE.exec(text);
  if (noble && !noble[2].includes(',') && (!noble[1].includes(' ') || PARTICLE.test(noble[2]))) return `${noble[1]} ${noble[2]}`;
  return text;
}
// Titles as readers write them: no "[sic]", no trailing full stop ("The vision of hell."), no
// Wikisource edition label ("Pericles (1925) Yale", "Tragedies of Seneca (1907) Miller"), and the few the libraries misspell.
const TITLE_FIXES = {'Bleak-House': 'Bleak House'};
const ABBREVIATIONS = new Set(['etc', 'esq', 'vol', 'viz', 'ibid', 'co', 'no', 'jr', 'sr', 'mr', 'mrs', 'dr', 'st', 'bros', 'ltd']);
export function cleanTitle(title) {
  const text = String(title ?? '').replace(/\s*\[sic\]/gi, '').replace(/\s*\(\d{4}\)\s*\p{Lu}\p{L}+$/u, '')
    .replace(/(?<![\p{L}.])(\p{L}{3,})\.$/u, (all, word) => ABBREVIATIONS.has(word.toLowerCase()) ? all : word).trim();
  return TITLE_FIXES[text] || text;
}
// A Wikisource work is in its wiki's language: German Wikisource's "Die Abstammung des Menschen"
// is not English, whatever its record says.
const WIKI_LANGUAGE = /^ws:([a-z]{2,3}):/;
/** A catalogue work's languages, as the search reads them (raw or hydrated record). */
export function languagesOf(w) {
  const languages = w.language?.length ? w.language : ['und'];
  const wiki = WIKI_LANGUAGE.exec(w.id || '')?.[1];
  return wiki && wiki !== 'en' && !languages.includes(wiki) ? [wiki] : languages;
}
// The catalogue omits empty fields to stay small; restore the shape every consumer expects.
// Each person's name is cleaned (cleanName); the library's form stays one of their other names.
const person = p => {
  const out = {birthYear: null, deathYear: null, aliases: [], ...p};
  const name = cleanName(out.name);
  if (name !== out.name) { out.aliases = [...out.aliases, out.name]; out.name = name; }
  return out;
};
export function hydrate(works) {
  for (const w of works) {
    w.authors = (w.authors || []).map(person); w.translators = (w.translators || []).map(person);
    w.subjects ||= []; w.bookshelves ||= []; w.altTitles ||= []; w.tinctIds ||= []; w.onTinct ||= false;
    w.title = cleanTitle(w.title); w.language = languagesOf(w); w.subtitle ??= null; w.firstPublishedYear ??= null; w.originalLanguage ??= null;
    for (const e of w.editions) {
      e.authors = (e.authors || []).map(person); e.translators = (e.translators || []).map(person);
      e.title = e.title ? cleanTitle(e.title) : ''; e.subjects ||= []; e.bookshelves ||= []; e.language ||= ['und'];
      e.epubUrl ??= null; e.coverUrl ??= null; e.sourceUrl ??= null; e.subtitle ??= null; e.popularity ??= 0;
    }
  }
  return works;
}
/**
 * Work priors (addbooks/scripts/build-work-priors.mjs, shipped as data/work-priors.json): for each
 * catalogue work Wikidata identifies, the work it is an edition of (`wikidata`, so editions in other
 * sources and translations are known to be one work), the number of Wikimedia sites with a page on
 * that work (`sitelinks`, a fame signal for works without Gutenberg downloads, such as Wikisource's
 * Moral Letters to Lucilius) and the work's English name, kept as another title. Missing priors leave
 * the catalogue as it was. Returns `works`.
 */
export function applyPriors(works, priors) {
  const table = priors?.works;
  if (!table) return works;
  for (const w of works) {
    const p = table[w.id];
    if (!p) continue;
    w.wikidata = p[0]; w.sitelinks = p[1] || 0;
    if (p[2] && !(w.altTitles ||= []).includes(p[2])) w.altTitles.push(p[2]);
  }
  return works;
}
/**
 * How well known a work is, on the scale of log10 Gutenberg downloads: its downloads, or its
 * Wikimedia sitelinks when they say more. Fitted on the 1,430 Gutenberg works the priors link
 * (2026-10-08): the median work with 3 sitelinks has about 10^2.9 downloads, with 10 about 10^3.2,
 * with 20-40 about 10^3.4-3.9 and with 80+ about 10^4.3, so 2.4 + 0.9 log10(1 + sitelinks).
 */
export const fame = w => Math.max(Math.log10(1 + (w.popularity || 0)), w.sitelinks > 0 ? 2.4 + 0.9 * Math.log10(1 + w.sitelinks) : 0);
/**
 * Fame with a tiebreak for works read about as often: a work with a page on 20 or more Wikimedia
 * sites gains a tenth of log10 sitelinks, so Persuasion (46 sites) ranks above Love and Freindship (7),
 * though Gutenberg counts their downloads alike. What the ranking and the author card's works use.
 */
export const renown = w => fame(w) + (w.sitelinks >= 20 ? 0.1 * Math.log10(1 + w.sitelinks) : 0);
/**
 * What Tinct's own books borrow from the catalogue works that are the same book, so the
 * library ranks them with this engine as the catalogue would: the best-read copy's popularity,
 * the authors' other names ("Samuel Langhorne Clemens"), the works' other titles and translators.
 * A work is the same book when the catalogue matched it (`tinctIds`), when the book names its
 * id (`workIds`), or when it has the same title (without a leading article) by an author of that
 * surname. `books`: [{id, title, author, workIds?}]. Returns {[book id]: borrowed}.
 */
export function borrowFor(books, works) {
  const key = title => core(normalize(title || ''));
  const surname = author => normalize(String(author || '').split(/[,;&(]| and /)[0]).split(' ').filter(Boolean).pop() || '';
  const byTitle = new Map(), byWork = new Map(), byTinct = new Map();
  for (const b of books) {
    const k = key(b.title);
    if (!byTitle.has(k)) byTitle.set(k, []);
    byTitle.get(k).push(b);
    for (const id of b.workIds || []) byWork.set(id, b);
    byTinct.set(b.id, b);
  }
  const found = new Map();
  for (const w of works) {
    const matches = new Set([...(w.tinctIds || []).map(id => byTinct.get(id)), byWork.get(w.id)].filter(Boolean));
    const sameTitle = byTitle.get(key(w.title));
    if (sameTitle) {
      const names = new Set((w.authors || []).flatMap(p => [p.name, ...(p.aliases || [])]).flatMap(n => normalize(n).split(' ')));
      for (const b of sameTitle) if (names.has(surname(b.author))) matches.add(b);
    }
    for (const b of matches) { if (!found.has(b.id)) found.set(b.id, []); found.get(b.id).push(w); }
  }
  const out = {};
  for (const [id, list] of found) {
    const book = byTinct.get(id);
    const unique = values => [...new Set(values.filter(Boolean))];
    out[id] = {
      popularity: Math.max(...list.map(w => w.popularity || 0)),
      aliases: unique(list.flatMap(w => (w.authors || []).flatMap(p => [p.name, ...(p.aliases || [])]))).filter(n => n !== book.author),
      titles: unique(list.flatMap(w => [w.title, ...(w.altTitles || [])])).filter(t => t !== book.title),
      translators: unique(list.flatMap(w => (w.translators || []).map(p => p.name))),
    };
  }
  return out;
}
// Ranking (Anders, 2026-10-07): tiers first, then popularity within a tier.
//   1  the title starts with the query, or a title word is a query word; and, when the query
//      is an author's name ("dostoevsky", "jane austen", see authorQuery), that author's books
//   2  a title word starts with a query word ("faust" -> "Faustus")   2.5 a title word is a near spelling
//   3  the author's own name has the word, or a word starting with it   3.5 a near spelling
//   4  a translator, the subtitle, a subject or a bookshelf             4.5 a near spelling
//   5  only another name of an author or translator ("Faust, Frederick Schiller" for Max Brand).
//      Counted only when that one name holds at least two of a query's words ("frederick faust"):
//      a single word found only there is dropped, so "faust" does not list Max Brand's westerns.
// Every query word must be found somewhere; a work's tier is that of its best-placed word.
// Within a tier: English first when no language is chosen, then a score of fame (Gutenberg
// downloads, or Wikimedia sitelinks from the work priors when they say more; see fame) plus
// the share of the query's words the title holds, the share found in the author's own name
// ("shakespeare sonnets" puts Shakespeare's Sonnets above other sonnets), and a bonus when a
// title is exactly the query (an author's own book, for their name, counts as title and exact),
// so "meditations marcus" puts Meditations by Marcus Aurelius above small editions titled "Marcus Aurelius".
// A volume or part ("Vol. 2 (of 6)", "Part 3") loses a little unless the query asks for one.
// For an author's name, a book other authors share loses SHARED_PENALTY, and Gutenberg's quotation
// and picture selections of an author rank last in the tier (see INDEX).
// The author a name query means (search audit, 2026-10-08): the person the matching works name,
// told apart by full name and life dates, whose books are read most ("hume": David Hume, not
// Fergus Hume; "dante": Dante Alighieri, not Dante Gabriel Rossetti). Only their books rank as
// the author's; books by someone the query names only by a given or middle name ("Dante" Gabriel
// Rossetti, George "Adam" Smith, "Homer" Greene) are left out, others of that surname follow the
// books that name the author in their title. A near spelling or the start of a long name counts
// ("nietzche", "shakespear").
// Weak matches are left out when strong ones exist: once any work has every query word in its
// title or author's name (or is the author's), works holding a word only in a translator, a
// subject, a shelf or another name are dropped ("crime and punishment" lists no criminology).
// Gutenberg's indexes and compilations of its own files are not books and are never listed (COMPILATION).
// A respelling of a person's own name among their other names ("Tchekhov" for Anton Chekhov,
// a near spelling of the name) counts as their name; a pen name stays tier 5.
const TITLE = 1, AUTHOR = 2, OTHER = 3;
// [exact word, word starting with it, near spelling, two edits away] for each field. Two edits
// count only in a title ("oddysey"): a name or a subject two letters off is another word.
const TIER = {[TITLE]: [1, 2, 2.5, 2.5], [AUTHOR]: [3, 3, 3.5, Infinity], [OTHER]: [4, 4, 4.5, Infinity]};
const EXACT = 0, PREFIX = 1, NEAR = 2, NEAR2 = 3;
const TITLE_COVER = [1, 0.75, 0.6, 0.6];
const ALIAS_TIER = 5, INDEX_TIER = 4.9;
// A title that is exactly the query ("La divina commedia") outweighs a 300-fold popularity gap.
const EXACT_TITLE = 2.5;
// A work a collection holds that is exactly the query ("on the shortness of life" in Minor Dialogues):
// less than a title of its own, so Euripides' "Medea" stays above Seneca's tragedies for "medea".
const INSIDE_EXACT = 1.5;
const AUTHOR_COVER = 3, VOLUME_PENALTY = 1.5;
// For an author's name, a book several authors share (an anthology, a selection with commentary,
// an adaptation) ranks below the author's own books.
const SHARED_PENALTY = 2;
// Gutenberg's own lists of a library (its indexes, quotation and picture selections) come last in their tier.
// The words a person is called by: the first and last of their name, without "minor", "the elder"…
// ("Plato", "Pliny", "Seneca", "Austen"), not a middle name ("Homer" in Charles Homer Haskins).
const SUFFIX = new Set(['minor', 'maior', 'major', 'elder', 'younger', 'the', 'jr', 'sr']);
function nameEnds(list) {
  const name = list.slice();
  while (name.length > 1 && SUFFIX.has(name[name.length - 1])) name.pop();
  return name.length ? [name[0], name[name.length - 1]] : [];
}
const INDEX = /^(quotes and images from|widgers quotations from)\b/;
const COMPILATION = /^(index of (the )?project gutenberg|complete project gutenberg works of|project gutenberg compilation of)\b/;
// A person's name words for telling people apart (identity), not particles.
const NAME_PARTICLE = new Set(['de', 'von', 'van', 'der', 'den', 'di', 'da', 'du', 'del', 'della', 'la', 'le', 'of', 'the', 'saint']);
const VOLUME = /\b(vol(ume)?s?\.?|part|book|tome|chapters?|series)\s+([0-9]+|[ivxlc]+|one|two|three|four|five)\b|\(of \d+\)/i;
const ASKS_FOR_VOLUME = /\b(vol|volume|part|book|tome|chapter|series|\d+)\b/;
export function createSearch(works) {
  const inverted = new Map(), vocabByLength = new Map();
  const add = (token, id) => {
    let ids = inverted.get(token);
    if (!ids) {
      inverted.set(token, ids = []);
      if (!vocabByLength.has(token.length)) vocabByLength.set(token.length, []);
      vocabByLength.get(token.length).push(token);
    }
    ids.push(id);
  };
  const people = w => [...w.editions.flatMap(e => e.authors), ...w.editions.flatMap(e => e.translators)];
  // Names, subjects and shelves repeat across thousands of works: normalize each text once while indexing.
  const normCache = new Map(), spelling = new Map();
  const norm = text => { let out = normCache.get(text); if (out === undefined) normCache.set(text, out = normalize(text)); return out; };
  const words = text => text ? norm(text).split(' ').filter(Boolean) : [];
  // Is alias word `t` a near spelling of one of this person's own name words?
  const respelled = (own, t) => {
    const key = own.join(' ') + '|' + t;
    let out = spelling.get(key);
    if (out === undefined) spelling.set(key, out = t.length >= 4 && own.some(o => o[0] === t[0] && near(o, t, 2)));
    return out;
  };
  const docs = works.map((w, id) => {
    const title = core(norm(w.title || ''));
    if (COMPILATION.test(title)) return {skip: true};
    // Each word with the best field it appears in.
    const field = new Map();
    const put = (text, f) => { for (const t of words(text)) if (!(field.get(t) <= f)) field.set(t, f); };
    const names = (w.authors || []).map(p => p.name).join(' ');
    const titles = [w.title, ...w.editions.map(e => e.title), ...(w.altTitles || []), ...altTitlesFor(w.title, names, norm)];
    titles.forEach(t => put(t, TITLE));
    // The works a collection holds (CONTAINED_WORKS) rank as its title words.
    const inside = containedWorksFor(w.title, names, norm).flatMap(c => [c.title, ...c.aliases]);
    inside.forEach(t => put(t, TITLE));
    const authors = w.editions.flatMap(e => e.authors);
    authors.forEach(p => put(p.name, AUTHOR));
    w.editions.flatMap(e => e.translators).forEach(p => put(p.name, OTHER));
    [w.subtitle, ...w.subjects, ...w.bookshelves].forEach(t => put(t, OTHER));
    for (const t of field.keys()) add(t, id);
    // Other names are indexed so a multi-word query can find them; their words rank only as tier 5.
    const aliasWords = new Set(), spelled = new Set();
    for (const p of people(w)) {
      const own = authors.includes(p) ? words(p.name).filter(t => t.length >= 4) : [];
      for (const a of p.aliases || []) for (const t of words(a)) {
        if (field.has(t)) continue;
        if (own.length && respelled(own, t)) { field.set(t, AUTHOR); spelled.add(t); }
        else aliasWords.add(t);
      }
    }
    for (const t of aliasWords) add(t, id);
    for (const t of spelled) add(t, id);
    // Each author once, with their name's words (respellings included) and the words they are called by.
    const persons = [];
    for (const p of authors) {
      const name = norm(p.name || '');
      if (!name || persons.some(q => q.name === name)) continue;
      const list = name.split(' ');
      const own = list.filter(t => t.length >= 4);
      const respellings = (p.aliases || []).flatMap(a => words(a)).filter(t => !list.includes(t) && own.length && respelled(own, t));
      persons.push({name, words: new Set([...list, ...respellings]), ends: new Set([...nameEnds(list), ...respellings]), last: nameEnds(list).pop(),
        born: Number.isFinite(p.birthYear) ? p.birthYear : null, died: Number.isFinite(p.deathYear) ? p.deathYear : null, person: p});
    }
    return {field, persons, titles: [...new Set(titles.filter(Boolean).map(t => core(norm(t))))], inside: [...new Set(inside.map(t => core(norm(t))))], own: new Set(words(w.title)),
      author: new Set([...authors.flatMap(p => words(p.name)), ...spelled]), volume: VOLUME.test(w.title), index: INDEX.test(title),
      shared: new Set(authors.map(p => p.name)).size > 1};
  });
  normCache.clear(); spelling.clear();
  const expansionCache = new Map();
  function expand(term) {
    if (expansionCache.has(term)) return expansionCache.get(term);
    const matches = new Map();
    if (inverted.has(term)) matches.set(term, EXACT);
    const limit = term.length >= 7 ? 2 : 1;
    // Prefixes allow incremental typing. Never turn short words into fuzzy noise.
    for (let length = term.length; length <= term.length + 8; length++) {
      for (const word of vocabByLength.get(length) || []) {
        if (term.length >= 3 && word !== term && word.startsWith(term)) matches.set(word, PREFIX);
      }
    }
    if (term.length >= 4) {
      // One edit first; two (for long words) only when nothing nearer is known: "oddysey" finds
      // "odyssey", but "sapiens", a word the catalogue has, does not also find "spies" or "salient".
      for (const edits of limit > 1 ? [1, 2] : [1]) {
        if (edits === 2 && matches.size) break;
        // Seven letters: two edits only within a word of that length that begins and ends alike.
        const tight = edits > 1 && term.length < 8;
        for (let length = term.length - (tight ? 0 : edits); length <= term.length + (tight ? 0 : edits); length++) {
          for (const word of vocabByLength.get(length) || []) {
            if (tight && (word[0] !== term[0] || word[1] !== term[1] || word[length - 1] !== term[length - 1])) continue;
            if (!matches.has(word) && near(term, word, edits)) matches.set(word, edits > 1 ? NEAR2 : NEAR);
          }
        }
      }
    }
    if (expansionCache.size > 150) expansionCache.clear();
    expansionCache.set(term, matches);
    return matches;
  }
  // Tier 5: one other name of the work's people that holds at least two query words,
  // including every word `missing` (found nowhere else). Infinity when there is none.
  function aliasTier(w, expansions, missing) {
    if (expansions.length < 2) return Infinity;
    for (const p of people(w)) for (const a of p.aliases || []) {
      const words = new Set(tokens(a));
      const holds = expansions.map(expansion => [...expansion].some(([t, kind]) => kind !== NEAR2 && words.has(t)));
      if (holds.filter(Boolean).length >= 2 && missing.every(i => holds[i])) return ALIAS_TIER;
    }
    return Infinity;
  }
  return function search(query, filters = {}, limit = 24) {
    const started = performance.now();
    const normalized = core(normalize(query));
    const askedVolume = ASKS_FOR_VOLUME.test(normalized);
    const allTokens = [...new Set(tokens(query))];
    const meaningful = allTokens.filter(t => !STOP.has(t));
    const terms = meaningful.length ? meaningful : allTokens;
    const expansions = terms.map(expand);
    const preferEnglish = !filters.language;
    let candidates;
    if (terms.length) {
      const sets = expansions.map(expansion => {
        const ids = new Set();
        for (const token of expansion.keys()) for (const id of inverted.get(token) || []) ids.add(id);
        return ids;
      }).sort((a, b) => a.size - b.size);
      candidates = [...sets[0]].filter(id => sets.every(set => set.has(id)));
    } else candidates = works.map((_, i) => i).filter(i => !docs[i].skip);
    // Does a query word (its expansion) hit one of these name words? Exactly; by a near spelling, for
    // words of six letters or more ("nietzche", not "emma" for Emmy); or as the start of a name at
    // most two letters longer, for words of five or more ("shakespear").
    const hitsName = (i, set) => {
      for (const [token, kind] of expansions[i]) if (set.has(token) && (kind === EXACT || (kind === NEAR && terms[i].length >= 6) || (kind === PREFIX && terms[i].length >= 5 && token.length - terms[i].length <= 2))) return true;
      return false;
    };
    const ranked = [];
    for (const id of candidates) {
      const w = works[id];
      if (filters.language && !w.language.includes(filters.language)) continue;
      if (filters.standardOnly && w.quality !== 'clean') continue;
      if (filters.source && !w.editions.some(e => e.source === filters.source)) continue;
      if (filters.subject && ![...w.subjects, ...w.bookshelves].includes(filters.subject)) continue;
      const doc = docs[id];
      let tier = terms.length ? Infinity : 1, worst = terms.length ? 0 : 1, cover = 0, authorCover = 0, titleWord = false;
      const missing = [];
      expansions.forEach((expansion, i) => {
        let best = Infinity, inTitle = 0, inAuthor = 0;
        for (const [token, kind] of expansion) {
          const f = doc.field.get(token);
          if (!f || TIER[f][kind] === Infinity) continue;
          best = Math.min(best, TIER[f][kind]);
          if (f === TITLE) { inTitle = Math.max(inTitle, TITLE_COVER[kind]); if (kind === EXACT) titleWord = true; }
          if (f === AUTHOR) inAuthor = Math.max(inAuthor, TITLE_COVER[kind]);
        }
        if (best === Infinity) missing.push(i);
        else worst = Math.max(worst, best);
        tier = Math.min(tier, best);
        cover += inTitle; authorCover += inAuthor;
      });
      if (missing.length) {
        const alias = aliasTier(w, expansions, missing);
        if (alias === Infinity) continue;
        // Two query words in one other name are a strong match (a pen name), though it ranks last.
        tier = Math.min(tier, alias); worst = Math.max(worst, 3);
      }
      let exact = !!normalized && doc.titles.includes(normalized);
      if (exact || (normalized && doc.titles.some(t => t.startsWith(normalized + ' ')))) tier = 1;
      // The query less the work's author's words ("seneca letters from a stoic", "medea seneca"):
      // a title that is the rest counts as exact; a work the collection holds, a little less.
      const rest = core(allTokens.filter(t => !doc.author.has(t)).join(' '));
      if (!exact && rest && rest !== normalized && doc.titles.includes(rest)) exact = true;
      // (Only for a work the title does not already name: "...Benefits, Anger and Clemency" is a title match.)
      const insideExact = !exact && !!rest && doc.inside.includes(rest) && !rest.split(' ').every(t => STOP.has(t) || doc.own.has(t));
      const byAuthor = terms.length > 0 && (terms.every(t => doc.author.has(t)) || terms.every((_, i) => hitsName(i, doc.author)));
      // The authors the query names (every word in one person's name).
      const persons = byAuthor ? doc.persons.filter(p => terms.every((_, i) => hitsName(i, p.words))) : [];
      // Weak: a query word found only by a near spelling outside the title, or only outside the title
      // and author with no query word in the title ("A searchlight on Germany" for "crime and
      // punishment"; Shaw's "The Dark Lady of the Sonnets" stays for "shakespeare sonnets").
      const weak = worst >= 4.5 || (worst >= 4 && !titleWord);
      ranked.push({id, fame: renown(w), wikidata: w.wikidata || null, sitelinks: w.sitelinks || 0, tier, worst, weak, cover, authorCover, exact, insideExact, byAuthor, persons, index: doc.index, volume: doc.volume, shared: doc.shared});
    }
    // The query is an author's name when more matching works carry it as their author's own
    // name than as a title ("dostoevsky", "jane austen"; not "faust"): then the author's books
    // rank with the title matches, as if their titles were the query.
    const titled = ranked.filter(r => r.tier === 1 && !r.byAuthor).length;
    const authorQuery = ranked.filter(r => r.byAuthor).length > titled;
    const author = authorQuery ? identify(ranked, terms, hitsName) : null;
    let list = ranked;
    if (author) {
      list = [];
      for (const r of ranked) {
        r.identity = r.persons.some(p => author.persons.has(p));
        if (author.dominant && !r.identity) {
          // Someone else the query names only by a given or middle name: not what was asked for.
          if (r.byAuthor && !r.persons.some(p => terms.length === 1 ? hitsName(0, new Set([p.last])) : terms.every((_, i) => hitsName(i, p.ends)))) continue;
          // Any other work must hold every query word in its title ("Adam Smith" by Hirst, not
          // "John Henry Smith" by Frederick Upham Adams).
          if (!r.byAuthor && r.worst > 2) continue;
        }
        list.push(r);
      }
    }
    // Weak matches go when strong ones exist.
    if (terms.length && list.some(r => r.identity || r.worst <= 3)) list = list.filter(r => r.identity || !r.weak);
    for (const r of list) {
      if (author && r.identity) { r.tier = 1; r.cover = terms.length; r.exact = true; r.authorCover = 0; }
      // For an author's name, books that name them in their title follow the author's own.
      // (A title that is the query keeps its place: Austen's "Emma" for "emma".)
      else if (author && !r.exact) r.tier = Math.max(r.tier, 1.5);
      if (r.index) r.tier = Math.max(r.tier, INDEX_TIER);
      const w = works[r.id];
      r.english = preferEnglish && w.language.includes('en') ? 1 : 0;
      r.score = 3 * r.cover / Math.max(1, terms.length) + AUTHOR_COVER * r.authorCover / Math.max(1, terms.length) + (r.exact ? EXACT_TITLE : r.insideExact ? INSIDE_EXACT : 0)
        - (r.volume && !askedVolume ? VOLUME_PENALTY : 0) - (r.identity && r.shared ? SHARED_PENALTY : 0)
        + r.fame + (w.quality === 'clean' ? 0.4 : 0);
    }
    list.sort((a, b) => a.tier - b.tier || b.english - a.english || b.score - a.score
      || works[a.id].title.localeCompare(works[b.id].title) || works[a.id].id.localeCompare(works[b.id].id));
    // The author the query names, for an author card: their name as their best-read book gives it,
    // their other names and dates, and their works among the results (`works`).
    let named = null;
    if (author) {
      const own = list.filter(r => r.identity);
      const first = own[0]?.persons.find(p => author.persons.has(p));
      const records = [...author.persons].map(p => p.person);
      const dated = records.find(p => Number.isFinite(p.birthYear) && Number.isFinite(p.deathYear)) || first?.person || {};
      named = {name: first?.person.name || records[0]?.name || '', names: [...new Set(records.flatMap(p => [p.name, ...(p.aliases || [])]))],
        birthYear: dated.birthYear ?? null, deathYear: dated.deathYear ?? null, works: new Set(own.map(r => works[r.id]))};
    }
    return {total: list.length, results: list.slice(0, limit).map(({id}) => works[id]), author: named, elapsedMs: Math.round((performance.now() - started) * 10) / 10};
  };
}
/**
 * The person a name query means: the matching works' authors gathered into people (one full name,
 * or the same life dates and a shared name word: "Seneca" and "Lucius Annaeus Seneca"), each scored
 * by how widely their matching works are known (the Wikimedia sitelinks of their distinct Wikidata
 * works, from the work priors), then by how much they are read (sum of 10^fame): Gutenberg's
 * download counts alone put Fergus Hume's thrillers above David Hume. People the query calls by their first
 * or last name come first ("dante" is what Dante Alighieri is called; "adam" is a middle name).
 * Returns {persons: Set of the chosen person's entries, dominant} or null.
 */
function identify(ranked, terms, hitsName) {
  const people = [];
  const shares = (a, b) => [...a.words].some(t => t.length >= 4 && !NAME_PARTICLE.has(t) && b.words.has(t));
  const within = (a, b) => [...a.words].every(t => b.words.has(t)) || [...b.words].every(t => a.words.has(t));
  // One person: a shared name word, no date that differs, and a date in common (or one name inside
  // the other with the same last name: "Homer" is not Charles Homer Haskins).
  const same = (a, b) => shares(a, b) && (a.born === null || b.born === null || a.born === b.born) && (a.died === null || b.died === null || a.died === b.died)
    && ((a.born !== null && a.born === b.born) || (a.died !== null && a.died === b.died) || (within(a, b) && a.last === b.last));
  for (const r of ranked) {
    if (!r.byAuthor) continue;
    for (const p of r.persons) {
      let group = people.find(g => g.names.has(p.name) || g.members.some(q => same(p, q)));
      if (!group) people.push(group = {names: new Set(), members: [], persons: new Set(), works: new Set(), wikidata: new Set(), known: 0, read: 0, called: false});
      group.names.add(p.name); group.members.push(p); group.persons.add(p);
      if (!group.works.has(r.id)) {
        group.works.add(r.id); group.read += 10 ** r.fame;
        if (r.wikidata && !group.wikidata.has(r.wikidata)) { group.wikidata.add(r.wikidata); group.known += r.sitelinks; }
      }
      if (terms.every((_, i) => hitsName(i, p.ends))) group.called = true;
    }
  }
  if (!people.length) return null;
  const pool = people.some(g => g.called) ? people.filter(g => g.called) : people;
  const chosen = pool.reduce((best, g) => g.known > best.known || (g.known === best.known && g.read > best.read) ? g : best);
  // Clearly the one meant: Wikimedia knows their works at least three times as widely as anyone
  // else's the query names. Only then are the others' books left out (above).
  chosen.dominant = chosen.known > 0 && people.every(g => g === chosen || chosen.known >= 3 * g.known);
  return chosen;
}
