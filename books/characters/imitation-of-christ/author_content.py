"""Manually authored recognition copy for Thomas a Kempis's The Imitation
of Christ.

Covers all 114 chapters (the four Books' chapters are numbered
sequentially 1-114 in the edition files, restarting as "Chapter 1" only
in each Book's own display title) in both English editions. This is a
devotional treatise addressed throughout to God/Christ as "Thou," with
almost no narrative cast -- matching the automation queue's own note for
this book ("Scriptural and saintly references; no cast"). Per editorial
policy's guidance for treatises, nearly every bound entry is Reference: a
patriarch or apostle invoked once as an example, a saint quoted for a
maxim.

The one structural wrinkle: Book IV (chapters 97-114, "Of the Sacrament")
is formatted as an explicit two-voice dialogue, each section headed "The
Voice of the Disciple" or "The Voice of Christ" -- the same convention
that gives Walden's Chapter 12 its capitalized "Hermit"/"Poet" speaker
tags. Per editorial policy's instruction to classify a dialogue's
participants by their part in it: **Christ** (also addressed and named
constantly throughout Books I-III, "Christ"/"Jesus"/"the Son of Man") is
Central -- the book is literally titled after him, and much of Books
III-IV is written as his own first-person counsel ("My Son..."). **The
Disciple** is Major: a named, explicitly labelled interlocutor whose
voice alternates with Christ's through the whole of Book IV, but never
named or labelled outside it (in Books I-III the same first-person voice
is the ordinary, unnamed-narrator convention of Meditations/Confessions/
Walden).

No genuine namesake collisions. The book's real editorial hazard is a
different one entirely: this edition prints scripture citations as
separate, dedicated footnote-list paragraphs -- 76 of 774 paragraphs in
each edition consist of nothing but reference strings like "(1) Job vii.
1 (Vulg.). (2) 1 Corinthians x. 13." A large share of this book's
candidate proper nouns (Matthew, Mark, Luke, John, Romans, Corinthians,
Philippians, Hebrews, James, Acts, Psalm(s), Genesis, Exodus, Leviticus,
Numbers, Deuteronomy, Joshua, Samuel, Kings, Chronicles, Job,
Ecclesiastes, Proverbs, Isaiah, Jeremiah, Ezekiel, Nahum, Zechariah,
Zephaniah, Revelation, and the Vulgate/Wisdom/Canticles abbreviations
"Vulg.," "Wisd.," "Cant.") are book-title citations, not people, per
editorial policy's "person or not" check -- and are never bound, even
where the cited book happens to share its title with a real person
(Matthew, Luke, John, James, and 1 Peter are all traditionally credited
to real evangelists/apostles who *do* get their own entries elsewhere in
this package, bound only where the running prose itself names them as
agents, e.g. "as the Evangelist Luke hath it," never where the same bare
word appears only inside a footnote citation string). Every
Bible-book-named entity in this package (David, Solomon, Noah, Joshua,
Samuel, Moses, Job, Luke, John the Baptist, Paul, Peter) is therefore
bound by a location-scoped custom `bind()` match rather than a global
alias, so that a footnote citation elsewhere in the book (e.g. "1 Samuel"
or "1 Peter ii. 11") is never mistaken for a fresh person-mention.
"""
import json
from pathlib import Path

entities = []


def add(id, name, body, aliases='', category='reference', kind='person'):
    entities.append(dict(
        id=id, name=name, body=body,
        aliases=aliases.split('|') if aliases else [],
        category=category, kind=kind, subtitle='', snapshots=[],
    ))


for row in [
    # --- Central ---
    ('christ', 'Christ',
     "Jesus Christ, the book's central figure and its constant "
     "addressee, spoken to as \"Thou\" throughout and also named "
     "directly, over a hundred times, as Christ, Jesus, and the Son of "
     "Man. Much of Books III and IV is written as his own first-person "
     "counsel to the reader (\"My Son...\"), and Book IV's alternating "
     "\"Voice of Christ\" sections give him an explicit speaking part in "
     "its staged dialogue with the Disciple.",
     'Christ|Jesus|Son of Man', 'central', 'religious-figure'),

    # --- Major: the dialogue's other named voice ---
    ('the-disciple', 'the Disciple',
     "The book's other named voice: the reader's own persona, addressed "
     "by Christ as \"My Son\" and speaking in turn, given an explicit "
     "label -- \"The Voice of the Disciple\" -- heading alternating "
     "sections throughout Book IV's staged dialogue on the Eucharist. In "
     "Books I-III the same first-person voice is the ordinary, unnamed-"
     "narrator convention of a devotional treatise, and is not labelled.",
     'the Disciple|Disciple', 'major', 'dramatic-role'),

    # --- Reference: the Trinity's third person, named separately from Christ ---
    ('holy-spirit', 'the Holy Ghost',
     "The Holy Ghost, the third person of the Trinity, invoked several "
     "times for the peace, grace, and consolation he brings, and named "
     "once by his Greek title, \"the Paraclete.\" original-en's \"Holy "
     "Ghost\" is modern-en's \"Holy Spirit\" throughout; both phrasings "
     "are aliased so the entity binds in both editions.",
     'Holy Ghost|Holy Spirit|Paraclete', 'reference', 'religious-figure'),

    # --- Reference: biblical and scriptural persons, bound only where the
    # running prose itself names them as agents (see module docstring) ---
    ('john-baptist', 'John the Baptist',
     "The forerunner of Christ, invoked twice as a model of holiness "
     "(\"the holiness of holy John the Baptist\") and of joyful humility "
     "before Christ's presence.",
     '', 'reference', 'religious-figure'),
    ('job-person', 'Job',
     "The patriarch of the Book of Job, quoted directly once as \"holy "
     "Job\" on God's visiting and testing him -- distinct from the "
     "book's many footnote citations of \"Job\" as a scriptural source, "
     "which are never bound (see module docstring).",
     '', 'reference', 'religious-figure'),
    ('luke-evangelist', 'Luke',
     "The evangelist, named once in the running prose as the source of "
     "a Gospel saying (\"as the Evangelist Luke hath it\"), distinct "
     "from the book's many footnote citations of the Gospel of Luke, "
     "which are never bound.",
     '', 'reference', 'religious-figure'),
    ('moses', 'Moses',
     "The lawgiver, invoked several times: the children of Israel's "
     "plea that he, not God directly, should speak to them; his resort "
     "to the tabernacle for counsel; and his building of the ark of the "
     "covenant to house the tables of the law.",
     '', 'reference', 'religious-figure'),
    ('samuel-prophet', 'Samuel',
     "The prophet, invoked once as a model of humble receptivity to "
     "God's voice (\"rather with Samuel the prophet, I beseech Thee\").",
     '', 'reference', 'religious-figure'),
    ('solomon', 'Solomon',
     "The king of Israel, invoked once for the seven years he spent "
     "building his temple, as a point of comparison for the reader's "
     "own preparation to receive the Eucharist.",
     '', 'reference', 'religious-figure'),
    ('noah', 'Noah',
     "The patriarch, invoked once for the hundred years he spent "
     "building the ark, as the same point of comparison.",
     '', 'reference', 'religious-figure'),
    ('joshua', 'Joshua',
     "The leader of Israel, invoked once for having been deceived by "
     "the Gibeonites after failing to ask counsel of God first -- a "
     "warning against trusting outward appearances.",
     '', 'reference', 'religious-figure'),
    ('david', 'David',
     "The king and psalmist, invoked once for dancing before the Ark of "
     "God and composing the Psalms, as an example of wholehearted "
     "devotion.",
     '', 'reference', 'religious-figure'),
    ('paul-apostle', 'Paul',
     "The apostle, invoked four times: for teaching that God makes a "
     "way to escape temptation, that true approval comes from God alone, "
     "for having been caught up to the third heaven yet still called to "
     "suffer, and for striving to please all men for the sake of their "
     "salvation.",
     '', 'reference', 'religious-figure'),
    ('peter-apostle', 'Peter',
     "The apostle, invoked once (\"the blessed Apostle Peter "
     "beseecheth\") for teaching that Christ's faithful should live as "
     "strangers and pilgrims in the world.",
     '', 'reference', 'religious-figure'),

    # --- Reference: New Testament persons, no footnote-citation risk ---
    ('mary-magdalene', 'Mary Magdalene',
     "Named once in full as rising quickly from her grief when Martha "
     "told her Jesus had come and called for her, and again, unnamed "
     "beyond the bare \"Mary,\" as one of the sisters of Bethany whom the "
     "crowds came to see alongside the raised Lazarus -- the same "
     "traditional identification of Mary of Bethany with Mary Magdalene "
     "this genre of devotional writing generally assumes.",
     'Mary Magdalene|Mary', 'reference', 'religious-figure'),
    ('virgin-mary', 'the Virgin Mary',
     "The mother of Christ, named in full once, as the model of faith "
     "and purity with which the Disciple longs to receive the Eucharist, "
     "as she once received the angel's tidings of the Incarnation.",
     'Virgin Mary', 'reference', 'religious-figure'),
    ('martha', 'Martha',
     "Sister of Mary and Lazarus at Bethany, who tells Mary that Jesus "
     "has come and calls for her, and who receives the crowd that comes "
     "to see the raised Lazarus.",
     'Martha', 'reference', 'religious-figure'),
    ('lazarus', 'Lazarus',
     "The brother of Martha and Mary at Bethany, raised from the dead by "
     "Jesus; the crowds who came to Bethany, the text notes, came not "
     "for Jesus's sake but to see him.",
     'Lazarus', 'reference', 'religious-figure'),
    ('zacchaeus', 'Zacchaeus',
     "The tax collector who welcomed Jesus into his house, invoked as a "
     "model for the Disciple's own desire to receive Christ worthily in "
     "Holy Communion.",
     'Zacchaeus', 'reference', 'religious-figure'),
    ('abraham', 'Abraham',
     "The patriarch, invoked once as the Disciple hopes to be \"numbered "
     "among the children of Abraham\" through receiving Communion.",
     'Abraham', 'reference', 'religious-figure'),
    ('satan', 'Satan',
     "The devil, named once as the source of the evil suggestions that "
     "trouble those preparing for Holy Communion.",
     'Satan', 'reference', 'religious-figure'),
    ('adam-biblical', 'Adam',
     "The first man, named once as the source, through his Fall, of the "
     "corruption of human nature inherited by all his descendants.",
     'Adam', 'reference', 'religious-figure'),
    ('eve-biblical', 'Eve',
     "The first woman, named once via the phrase \"the exiled sons of "
     "Eve,\" for humanity's shared exile and mourning in this life.",
     'Eve', 'reference', 'religious-figure'),

    # --- Reference: saints cited for a maxim, no footnote-citation risk ---
    ('francis-of-assisi', 'St. Francis',
     "Francis of Assisi, quoted once for his teaching on humility: "
     "\"What each one is in Thine eyes, so much he is, and no more.\"",
     'Francis', 'reference', 'person'),
    ('laurence-martyr', 'Laurence',
     "The early Christian martyr, cited once for overcoming his love of "
     "the world and of his own priestly master, Sixtus, for the love of "
     "Christ.",
     'Laurence', 'reference', 'person'),
    ('sixtus-pope', 'Sixtus',
     "Pope Sixtus II, named once as the \"chief priest\" and beloved "
     "master whom Laurence calmly let be taken from him for the love of "
     "God.",
     'Sixtus', 'reference', 'person'),
    ('agatha-saint', 'St. Agatha',
     "The early Christian martyr, named once in an editorial footnote "
     "identifying the source of a quoted line as her own words, rather "
     "than a scriptural citation.",
     'Agatha', 'reference', 'person'),
]:
    add(*row)


ID = 'imitation-of-christ'
CONTENT_VERSION = '2026-09-12.1'

editorial = dict(
    bookId=ID,
    contentVersion=CONTENT_VERSION,
    entities=entities,
    coverage=(
        "26 entities: 1 central (Christ), 1 major (the Disciple, Book "
        "IV's other named dialogue voice), 24 reference. No namesake "
        "collisions. The book's real editorial hazard is footnote "
        "citations: 76 of 774 paragraphs in each edition are dedicated "
        "scripture-citation strings (e.g. '(1) Job vii. 1 (Vulg.).'); "
        "every Bible-book-named entity here (David, Solomon, Noah, "
        "Joshua, Samuel, Moses, Job, Luke, John the Baptist, Paul, "
        "Peter) is bound by a location-scoped custom bind() match to "
        "the exact prose location where the text names them as an "
        "agent, never by a global alias that could sweep up an "
        "unrelated footnote citation of the same bare word elsewhere."
    ),
)

if __name__ == '__main__':
    out = Path(__file__).resolve().parent / 'editorial.json'
    out.write_text(json.dumps(editorial, indent=2, ensure_ascii=False) + '\n')
    print(f"Wrote {out} with {len(entities)} entities")
