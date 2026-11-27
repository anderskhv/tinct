/**
 * Danish titles and author names readers search by (Anders, 13 Nov 2026: "ensure search works in
 * Danish, so 'Den lille prinsesse' actually works"). The catalogue carries them as `localTitles.da`
 * and `localAuthors.da`; the library search ranks them as titles and authors' names, folding
 * æ/ae, ø/o/oe and å/a/aa. Only titles that differ from the English one are listed.
 *
 * Every title is either the one Tinct's own Danish text already uses (`source` names the file
 * under app/public, and danishTitles.test.ts checks the title is in it) or a long-established
 * Danish title (`source: 'established'`), with `checked` naming a page that shows a Danish edition
 * or reference under that title where one was found. Never invent one: a title not certain is
 * left out and listed for Anders to check instead. A book with no Danish edition under any title
 * carries the title Anders approved for it (`source: 'approved'`, with the date beside it). (Saxo, the bookshop Anders suggested, refuses
 * automated lookups, so it could not be checked from here on 2026-11-13.)
 *
 * The catalogue gives a book its Danish titles only while it has a Danish edition readers can open
 * (preReader/catalogue.ts), so the whole list stays here and each book is found by its Danish title
 * from the day its Danish edition publishes.
 */
export interface DanishTitle {
  /** The Danish titles; the first is the one to show. */
  titles: string[]
  /** A file under app/public whose Danish text uses the first title, 'established', or 'approved' (by Anders, where no Danish edition exists). */
  source: string
  /** A page showing a Danish edition or reference work under the title, where one was found. */
  checked?: string
}

const repo = (bookId: string) => `data/onboarding/${bookId}.da.json`

export const DANISH_TITLES: Record<string, DanishTitle> = {
  // Titles of Tinct's own Danish introductions (onboarding `title`).
  'apology': { titles: ['Sokrates’ forsvarstale', 'Sokrates forsvarstale'], source: repo('apology') },
  'crito': { titles: ['Kriton'], source: repo('crito') },
  'grimms-fairy-tales': { titles: ['Grimms eventyr'], source: repo('grimms-fairy-tales') },
  'pinocchio': { titles: ['Pinocchios eventyr'], source: repo('pinocchio') },
  'the-art-of-war': { titles: ['Krigskunsten', 'Kunsten at føre krig'], source: repo('the-art-of-war'), checked: 'https://nextory.com/at-en/book/kunsten-at-fre-krig-den-vigtigste-bog-om-strategi-verden-endnu-har-set-339897' },
  'the-manual': { titles: ['Håndbogen'], source: repo('the-manual') },
  'frederick-douglass': { titles: ['Beretning om Frederick Douglass’ liv', 'Beretning om Frederick Douglass liv'], source: repo('frederick-douglass') },
  'oedipus-at-colonus': { titles: ['Ødipus i Kolonos'], source: repo('oedipus-at-colonus') },
  'us-founding-documents': { titles: ['USA\'s grundlæggende dokumenter', 'USA’s grundlæggende dokumenter'], source: repo('us-founding-documents') },
  // Named by the Danish introductions' own text.
  'crime-and-punishment': { titles: ['Forbrydelse og straf'], source: repo('crime-and-punishment') },
  'odyssey': { titles: ['Odysseen'], source: repo('odyssey') },
  'iliad': { titles: ['Iliaden'], source: repo('iliad') },
  'the-aeneid': { titles: ['Æneiden'], source: repo('iliad') },
  'bible': { titles: ['Bibelen'], source: repo('imitation-of-christ') },
  'the-prince': { titles: ['Fyrsten'], source: repo('the-art-of-war') },
  'divine-comedy': { titles: ['Den guddommelige komedie'], source: repo('divine-comedy') },
  'pride-and-prejudice': { titles: ['Stolthed og fordom'], source: repo('pride-and-prejudice') },
  'paradise-lost': { titles: ['Det tabte paradis'], source: repo('frankenstein') },
  'the-republic': { titles: ['Staten'], source: 'established' },
  'symposium': { titles: ['Symposion'], source: repo('symposium') },
  'phaedo': { titles: ['Faidon'], source: repo('phaedo') },
  'phaedrus': { titles: ['Faidros'], source: repo('phaedrus') },
  'poetics': { titles: ['Poetikken'], source: repo('poetics') },
  'aristotle-politics': { titles: ['Politikken'], source: repo('aristotle-politics') },
  'nicomachean-ethics': { titles: ['Den nikomacheiske etik'], source: repo('nicomachean-ethics') },
  'oedipus-rex': { titles: ['Kong Ødipus'], source: 'established' },
  'beyond-good-and-evil': { titles: ['Hinsides godt og ondt'], source: repo('beyond-good-and-evil') },
  'genealogy-of-morals': { titles: ['Moralens genealogi'], source: repo('genealogy-of-morals') },
  'fear-and-trembling': { titles: ['Frygt og Bæven'], source: repo('fear-and-trembling') },
  'social-contract': { titles: ['Samfundspagten'], source: repo('social-contract') },
  'werther': { titles: ['Den unge Werthers lidelser'], source: repo('frankenstein') },
  'confessions': { titles: ['Bekendelser'], source: repo('confessions') },
  'master-and-margarita': { titles: ['Mesteren og Margarita'], source: repo('master-and-margarita') },
  'don-quixote': { titles: ['Don Quijote'], source: 'data/editions/don-quixote-modern-da.json' },
  'gilgamesh': { titles: ['Gilgamesh-eposet'], source: repo('gilgamesh') },
  'descartes-meditations': { titles: ['Meditationer over den første filosofi'], source: repo('descartes-meditations') },
  'utilitarianism': { titles: ['Utilitarismen'], source: 'established' },
  'arabian-nights': { titles: ['Tusind og én nat', 'Tusind og en nat'], source: 'lab/library_2/primer-data/arabian-nights.da.json' },
  'king-lear': { titles: ['Kong Lear'], source: repo('king-lear') },
  'the-tempest': { titles: ['Stormen'], source: repo('winters-tale') },
  'romeo-and-juliet': { titles: ['Romeo og Julie'], source: repo('romeo-and-juliet') },
  'merchant-of-venice': { titles: ['Købmanden i Venedig'], source: repo('merchant-of-venice') },
  'taming-of-the-shrew': { titles: ['Trold kan tæmmes'], source: repo('taming-of-the-shrew') },
  'twelfth-night': { titles: ['Helligtrekongersaften'], source: repo('comedy-of-errors') },
  'henry-v': { titles: ['Henrik V'], source: repo('henry-iv-part-2') },
  'antony-and-cleopatra': { titles: ['Antonius og Kleopatra'], source: repo('antony-and-cleopatra') },
  'merry-wives-of-windsor': { titles: ['De muntre koner i Windsor'], source: repo('merry-wives-of-windsor') },
  // Long-established Danish titles (none of Tinct's Danish text names them yet).
  'a-little-princess': { titles: ['Den lille prinsesse'], source: 'established' },
  'the-secret-garden': { titles: ['Den hemmelige have'], source: 'established' },
  'meditations': { titles: ['Selvbetragtninger'], source: 'established' },
  'brothers-karamazov': { titles: ['Brødrene Karamasov'], source: 'established' },
  'war-and-peace': { titles: ['Krig og fred'], source: 'established' },
  'great-expectations': { titles: ['Store forventninger'], source: 'established' },
  'sense-and-sensibility': { titles: ['Fornuft og følelse'], source: 'established' },
  'wuthering-heights': { titles: ['Stormfulde højder'], source: 'established' },
  'alice-in-wonderland': { titles: ['Alice i Eventyrland'], source: 'established' },
  'jungle-book': { titles: ['Junglebogen'], source: 'established' },
  'around-the-world-80-days': { titles: ['Jorden rundt i 80 dage'], source: 'established' },
  'heart-of-darkness': { titles: ['Mørkets hjerte'], source: 'established' },
  'to-the-lighthouse': { titles: ['Til fyret'], source: 'established' },
  'ivan-ilyich': { titles: ['Ivan Iljitjs død'], source: 'established' },
  'notes-from-underground': { titles: ['Kældermennesket', 'Kældermennesket: optegnelser fra en undergrund', 'Optegnelser fra undergrunden'], source: 'established', checked: 'https://litteratursiden.dk/anmeldelser/kaeldermennesket-af-fjodor-m-dostojevskij' },
  'jekyll-and-hyde': { titles: ['Dr. Jekyll og Mr. Hyde'], source: 'established' },
  'communist-manifesto': { titles: ['Det kommunistiske manifest'], source: 'established' },
    'peloponnesian-war': { titles: ['Den peloponnesiske krig'], source: 'established', checked: 'https://www.igl.ku.dk/aigis/2016,1/AS-Thuk4.pdf' },
  'imitation-of-christ': { titles: ['Kristi efterfølgelse', 'Om Kristi efterfølgelse', 'Fire bøger om Kristi efterfølgelse'], source: 'established', checked: 'https://lex.dk/Thomas_%C3%A0_Kempis' },
  'on-liberty': { titles: ['Om friheden'], source: 'established' },
  'kant-groundwork': { titles: ['Grundlæggelse af moralens metafysik'], source: 'established' }, // Hans Reitzels Klassikere (Danish translation 1993); no page found to cite
  'oresteia': { titles: ['Orestien'], source: 'established' },
  'bacchae': { titles: ['Bakkantinderne'], source: 'established' },
  'midsummer': { titles: ['En skærsommernats drøm', 'Skærsommernatsdrøm'], source: 'established' },
  'much-ado-about-nothing': { titles: ['Stor ståhej for ingenting'], source: 'established' },
  'winters-tale': { titles: ['Et vintereventyr'], source: 'established' },
  'as-you-like-it': { titles: ['Som man behager'], source: 'established' },
  'measure-for-measure': { titles: ['Lige for lige'], source: 'established' },
  'henry-iv-part-2': { titles: ['Henrik IV'], source: 'established' },
  // Looked up for /nudansk (Anders, 27 Nov 2026: "use what the normal Danish title is", never our own translation),
  // in the Royal Library's catalogue (soeg.kb.dk) and lex.dk. Four books on that page have no Danish edition under
  // any title that could be found (Church's two Homer retellings, Hawthorne's two volumes as one book, Nesbit's
  // Shakespeare stories); Anders approved the four titles at the end of this list on 27 Nov 2026.
  'hume-enquiry': { titles: ['En undersøgelse af den menneskelige forstand', 'En undersøgelse af den menneskelige erkendelse'], source: repo('hume-enquiry'), checked: 'https://da.wikipedia.org/wiki/David_Hume' },
  // Lembcke (1867) and Brunse (Samlede skuespil 2, 2012) both call it Tvillingerne.
  'comedy-of-errors': { titles: ['Tvillingerne'], source: repo('comedy-of-errors'), checked: 'https://lex.dk/William_Shakespeare' },
  'wind-in-the-willows': { titles: ['Vinden i piletræerne'], source: 'established', checked: 'https://lex.dk/Vinden_i_piletr%C3%A6erne' },
  // The last full translation (Ella Willy Nielsen, Hernov 1972); the 1946 and 1952 editions' titles find it too.
  'merry-adventures-of-robin-hood': { titles: ['Den vidtberømte Robin Hood og hans muntre eventyr', 'Robin Hood og hans lystige eventyr', 'Robin Hood'], source: 'established', checked: 'https://soeg.kb.dk/primaws/rest/pub/pnxs?q=title,contains,vidtber%C3%B8mte%20Robin%20Hood&vid=45KBDK_KGL:KGL&tab=Everything&scope=MyInst_and_CI&lang=da&limit=10&offset=0' },
  // Bodil Holm's translation (Hernov 1991), catalogued with "Originaltitel: The story of King Arthur and his knights".
  'story-of-king-arthur-and-his-knights': { titles: ['Kong Arthur og ridderne af det runde bord'], source: 'established', checked: 'https://soeg.kb.dk/primaws/rest/pub/pnxs?q=title,contains,Kong%20Arthur%20og%20ridderne%20af%20det%20runde%20bord&vid=45KBDK_KGL:KGL&tab=Everything&scope=MyInst_and_CI&lang=da&limit=8&offset=0' },
  // No Danish edition found under any title; titles approved by Anders, 27 Nov 2026 ("yes to your Danish titles").
  'iliad-for-boys-and-girls': { titles: ['Iliaden fortalt for børn'], source: 'approved' },
  'odyssey-for-boys-and-girls': { titles: ['Odysseen fortalt for børn'], source: 'approved' },
  // Tinct's Danish text of the book calls the first volume Vidunderbogen.
  'wonder-book-and-tanglewood-tales': { titles: ['Vidunderbogen og Tanglewood-fortællinger', 'Vidunderbogen'], source: 'approved' },
  'beautiful-stories-from-shakespeare': { titles: ['Smukke fortællinger fra Shakespeare'], source: 'approved' },
}

/**
 * Danish spellings of authors' names, keyed by the registry's `author`; the first source is
 * Tinct's own Danish introductions, which use them throughout.
 */
export const DANISH_AUTHOR_NAMES: Record<string, string[]> = {
  'Plato': ['Platon'],
  'Aristotle': ['Aristoteles'],
  'Sophocles': ['Sofokles'],
  'Aeschylus': ['Aischylos'],
  'Epictetus': ['Epiktet'],
  'Herodotus': ['Herodot'],
  'Thucydides': ['Thukydid'],
  'Augustine': ['Augustin'],
  'Virgil': ['Vergil'],
  'Leo Tolstoy': ['Lev Tolstoj'],
  'Fyodor Dostoevsky': ['Fjodor Dostojevskij'],
  'Jacob and Wilhelm Grimm': ['Jacob og Wilhelm Grimm', 'Brødrene Grimm'],
  // King John is Johan uden Land in Danish (Magna Carta's author line on /nudansk).
  'Anonymous (sealed by King John)': ['Anonym (beseglet af kong Johan uden Land)'],
}

/** A book's Danish titles, first the one to show, or []. */
export function danishTitlesFor(bookId: string): string[] {
  return DANISH_TITLES[bookId]?.titles ?? []
}

/** The Danish spellings of an author's name, or []. */
export function danishAuthorNamesFor(author: string): string[] {
  return DANISH_AUTHOR_NAMES[author.trim()] ?? []
}
