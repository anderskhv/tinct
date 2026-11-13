/**
 * Danish titles and author names readers search by (Anders, 13 Nov 2026: "ensure search works in
 * Danish, so 'Den lille prinsesse' actually works"). The catalogue carries them as `localTitles.da`
 * and `localAuthors.da`; the library search ranks them as titles and authors' names, folding
 * æ/ae, ø/o/oe and å/a/aa. Only titles that differ from the English one are listed.
 *
 * Every title is either the one Tinct's own Danish text already uses (`source` names the file
 * under app/public, and danishTitles.test.ts checks the title is in it) or a long-established
 * Danish title (`source: 'established'`). Never invent one: a title not certain is left out and
 * listed for Anders to check instead.
 */
export interface DanishTitle {
  /** The Danish titles; the first is the one to show. */
  titles: string[]
  /** A file under app/public whose Danish text uses the first title, or 'established'. */
  source: string
}

const repo = (bookId: string) => `data/onboarding/${bookId}.da.json`

export const DANISH_TITLES: Record<string, DanishTitle> = {
  // Titles of Tinct's own Danish introductions (onboarding `title`).
  'apology': { titles: ['Sokrates’ forsvarstale', 'Sokrates forsvarstale'], source: repo('apology') },
  'crito': { titles: ['Kriton'], source: repo('crito') },
  'grimms-fairy-tales': { titles: ['Grimms eventyr'], source: repo('grimms-fairy-tales') },
  'pinocchio': { titles: ['Pinocchios eventyr'], source: repo('pinocchio') },
  'the-art-of-war': { titles: ['Krigskunsten', 'Kunsten at føre krig'], source: repo('the-art-of-war') },
  'the-manual': { titles: ['Håndbogen'], source: repo('the-manual') },
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
  'the-republic': { titles: ['Staten'], source: repo('phaedrus') },
  'symposium': { titles: ['Symposion'], source: repo('symposium') },
  'phaedo': { titles: ['Faidon'], source: repo('phaedo') },
  'phaedrus': { titles: ['Faidros'], source: repo('phaedrus') },
  'poetics': { titles: ['Poetikken'], source: repo('poetics') },
  'aristotle-politics': { titles: ['Politikken'], source: repo('aristotle-politics') },
  'nicomachean-ethics': { titles: ['Den nikomacheiske etik'], source: repo('nicomachean-ethics') },
  'oedipus-rex': { titles: ['Kong Ødipus'], source: repo('poetics') },
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
  'utilitarianism': { titles: ['Utilitarismen'], source: repo('utilitarianism') },
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
  'jekyll-and-hyde': { titles: ['Dr. Jekyll og Mr. Hyde'], source: 'established' },
  'communist-manifesto': { titles: ['Det kommunistiske manifest'], source: 'established' },
  'wealth-of-nations': { titles: ['Nationernes velstand'], source: 'established' },
  'peloponnesian-war': { titles: ['Den peloponnesiske krig'], source: 'established' },
  'imitation-of-christ': { titles: ['Kristi efterfølgelse', 'Om Kristi efterfølgelse'], source: 'established' },
  'on-liberty': { titles: ['Om friheden'], source: 'established' },
  'kant-groundwork': { titles: ['Grundlæggelse af moralens metafysik'], source: 'established' },
  'oresteia': { titles: ['Orestien'], source: 'established' },
  'bacchae': { titles: ['Bakkantinderne'], source: 'established' },
  'midsummer': { titles: ['En skærsommernats drøm', 'Skærsommernatsdrøm'], source: 'established' },
  'much-ado-about-nothing': { titles: ['Stor ståhej for ingenting'], source: 'established' },
  'winters-tale': { titles: ['Et vintereventyr'], source: 'established' },
  'as-you-like-it': { titles: ['Som man behager'], source: 'established' },
  'measure-for-measure': { titles: ['Lige for lige'], source: 'established' },
  'henry-iv-part-2': { titles: ['Henrik IV, del 2', 'Henrik IV'], source: 'established' },
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
}

/** A book's Danish titles, first the one to show, or []. */
export function danishTitlesFor(bookId: string): string[] {
  return DANISH_TITLES[bookId]?.titles ?? []
}

/** The Danish spellings of an author's name, or []. */
export function danishAuthorNamesFor(author: string): string[] {
  return DANISH_AUTHOR_NAMES[author.trim()] ?? []
}
