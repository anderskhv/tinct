"""Manually authored recognition copy for Augustine's Confessions.

Covers all thirteen Books in both English editions. Like Meditations, this
is a private address -- here spoken entirely to God as "Thou," never to a
reader -- so per editorial policy's guidance for treatises ("cited thinkers
normally remain references"), most entries are Reference: a philosopher
cited to make a point, a biblical patriarch invoked in an exegetical aside,
a pagan god named once in a mocking list. Unlike Meditations, though,
Books 1-9 are genuine autobiographical narrative with a real recurring
human cast -- friends, a mother, a bishop -- so several entries earn
Major or Supporting for sustained, substantive presence on the page.

Central: **Augustine** himself, the narrator and author, whose conversion
the entire work recounts. He never names himself in the running text (he
addresses "Thou" throughout) -- per editorial policy's instruction not to
cast a treatise's or memoir's own narrator as a spoken-of character, this
entry carries no bindable alias and zero mentions, the same treatment
Meditations gives Marcus Aurelius.

Major (sustained, substantive presence across multiple Books rather than a
single scene): **Monnica** (Augustine's mother, present from Book 1 through
her death narrated at length in Book 9, though her proper name appears
only once, in Book 9's closing memorial -- elsewhere always "my mother");
**Alypius** (closest friend from Thagaste through the Milan conversion,
with his own Book 6 gambling-addiction narrative); **Nebridius** (fellow
seeker across Books 4, 6, 7, and 9); **Ambrose** (Bishop of Milan, whose
preaching unlocks Scripture for Augustine and who is shown defending his
church against imperial pressure in Book 9).

Supporting (a recurring or locally significant participant, without the
sustained multi-Book weight of Major): **Patricius** (Augustine's father,
a brief but real Book 9 portrait), **Adeodatus** (Augustine's son, present
at Cassiacum and baptism), **Simplicianus** (the priest whose account of
Victorinus precipitates Book 8), **Victorinus** (the converted rhetorician
whose story Simplicianus tells), **Pontitianus** (whose account of Antony
triggers the garden crisis), and **Faustus** (the Manichaean bishop whose
disappointing meeting begins Augustine's break with the sect).

No genuine namesake collisions were found -- unlike Aristotle's Politics or
Meditations, this translation names no two different people with the same
bare word anywhere in the text. The one near-collision, Paul/Saul/Paulus at
8:10, resolves without any location-scoped bind() at all: "Paulus" (the
converting Roman proconsul, Sergius Paulus) and "Paul"/"Saul" (the apostle,
renamed from Saul) are different letter-strings that never overlap under
word-boundary-safe matching, since the "-us" ending breaks the boundary
before "Paul" could match inside "Paulus." See build_confessions.py, which
needs no bind() override at all -- reviewed_aliases.bind is used directly.
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
    ('augustine', 'Augustine',
     "The book's narrator and author, recounting his own conversion from "
     "Manichaean belief and worldly ambition to Christian faith across "
     "Books 1-9, then turning to memory, time, and Genesis in Books "
     "10-13. He addresses the entire work to God as \"Thou\" and never "
     "names himself in the running text; per editorial policy, a "
     "memoir's own narrator is not cast as a spoken-of character, so "
     "this entry carries no bindable alias.",
     '', 'central', 'person'),

    # --- Major: sustained, multi-Book presence ---
    ('monnica', 'Monnica',
     "Augustine's mother, a devout Christian whose prayers and tears run "
     "through the narrative from his boyhood to her death at Ostia, "
     "narrated at length in Book 9 as the book's most sustained portrait "
     "of grief and consolation. Named once, in the closing lines of "
     "Book 9's memorial to her; everywhere else she is \"my mother.\"",
     'Monnica', 'major', 'person'),
    ('alypius', 'Alypius',
     "Augustine's closest friend from Thagaste, a fellow student and "
     "later a legal officer of notable integrity, who follows him "
     "through Manichaeism, Milan, and conversion, and is baptized "
     "alongside him. His own struggle with an addiction to the "
     "gladiatorial games is narrated at length in Book 6.",
     'Alypius', 'major', 'person'),
    ('nebridius', 'Nebridius',
     "A friend from Carthage who leaves his family estate to join "
     "Augustine and Alypius in Milan, sharing their restless search for "
     "truth and wisdom; he recurs across Books 4, 6, 7, and 9 as a "
     "fellow seeker rather than a settled believer.",
     'Nebridius', 'major', 'person'),
    ('ambrose', 'Ambrose',
     "Bishop of Milan, whose sermons on the figurative interpretation "
     "of Scripture free Augustine from his Manichaean objections to the "
     "Old Testament and set him on the path to conversion; also shown "
     "defending Milan's church against imperial pressure in Book 9.",
     'Ambrose', 'major', 'person'),

    # --- Supporting: recurring or locally significant participants ---
    ('patricius', 'Patricius',
     "Augustine's father, a citizen of Thagaste of modest means and, "
     "for most of his life, no religion; he is baptized shortly before "
     "his death, recounted briefly in Book 9. Named twice, both in "
     "Book 9's memorial passage; elsewhere he is \"my father.\"",
     'Patricius', 'supporting', 'person'),
    ('adeodatus', 'Adeodatus',
     "Augustine's son, born to him in his youth by an unnamed mistress; "
     "present at the Cassiacum retreat before Augustine's baptism and "
     "baptized alongside him and Alypius.",
     'Adeodatus', 'supporting', 'person'),
    ('simplicianus', 'Simplicianus',
     "An elderly priest in Milan, spiritual father to Ambrose, whom "
     "Augustine consults about Platonist philosophy; his account of the "
     "rhetorician Victorinus's conversion, in Book 8, becomes the "
     "example that shames Augustine into confronting his own "
     "hesitation.",
     'Simplicianus', 'supporting', 'person'),
    ('victorinus', 'Victorinus',
     "A famous Roman rhetorician and translator of Platonist texts "
     "whose late-life conversion to Christianity, publicly professed "
     "despite his eminence, is recounted by Simplicianus in Book 8 as "
     "an example Augustine measures himself against.",
     'Victorinus', 'supporting', 'person'),
    ('pontitianus', 'Pontitianus',
     "An African compatriot and imperial court official who visits "
     "Augustine and Alypius in Milan and tells them of Antony of the "
     "desert and of two officials who abandoned their careers on "
     "reading Antony's life; his story precipitates the garden crisis "
     "of Book 8.",
     'Pontitianus', 'supporting', 'person'),
    ('faustus', 'Faustus',
     "The Manichaean sect's celebrated bishop, long awaited by "
     "Augustine as the man who could resolve his doubts about "
     "Manichaean cosmology; their meeting in Carthage (Book 5) reveals "
     "Faustus as eloquent but ignorant of the sciences he was supposed "
     "to have mastered, beginning Augustine's break with the sect.",
     'Faustus', 'supporting', 'person'),

    # --- Reference: classical literature and mythology ---
    ('aeneas', 'Aeneas',
     "The hero of Virgil's Aeneid, whose wanderings Augustine studied "
     "and wept over as a schoolboy while remaining dry-eyed over his "
     "own spiritual death, an example of misdirected sympathy he "
     "condemns in Book 1.",
     'Aeneas', 'reference', 'literary-figure'),
    ('dido', 'Dido',
     "The queen of Carthage in Virgil's Aeneid, whose death for love "
     "Augustine was taught to weep over as a schoolboy.",
     'Dido', 'reference', 'literary-figure'),
    ('creusa', 'Creusa',
     "Aeneas's wife in Virgil's Aeneid, lost and searched for amid the "
     "fall of Troy; cited among the school poetry Augustine studied.",
     'Creusa', 'reference', 'literary-figure'),
    ('homer', 'Homer',
     "The Greek epic poet, source of the school texts -- studied in "
     "the original Greek, which young Augustine hated -- that he "
     "contrasts with his ease at Latin poetry.",
     'Homer', 'reference', 'person'),
    ('virgil', 'Virgil',
     "The Roman poet whose Aeneid supplied the school text, and the "
     "sympathetic tears over Dido, that Augustine recalls with unease "
     "in Book 1.",
     'Virgil', 'reference', 'person'),
    ('terence', 'Terence',
     "The Roman comic playwright; Augustine cites a scene from his "
     "Eunuchus, in which a young man is incited to seduction by a "
     "painting of Jove's affair with Danae, as evidence of how pagan "
     "literature dignified vice by attaching it to the gods.",
     'Terence', 'reference', 'person'),
    ('jove', 'Jove',
     "The chief god of the Roman pantheon, also called Jupiter. "
     "Augustine cites Terence's staging of Jove's seduction of Danae, "
     "and later a mocking list of Jove, Juno, and other gods, as "
     "examples of a religion built on stories no one would tolerate "
     "from a human being.",
     'Jove|Jupiter', 'reference', 'cultural-figure'),
    ('danae', 'Danae',
     "A mythological princess visited by Jove in a shower of gold, in "
     "the story from Terence's Eunuchus that Augustine cites as pagan "
     "literature glamorizing vice by making it divine.",
     'Danae', 'reference', 'literary-figure'),
    ('juno', 'Juno',
     "The Roman pantheon's queen of the gods, invoked in Augustine's "
     "Book 1 catalogue of the deities his schoolboy poetry required "
     "him to praise.",
     'Juno', 'reference', 'cultural-figure'),
    ('venus', 'Venus',
     "The Roman goddess of love, named among the pagan deities "
     "Augustine says his astrological and poetic education dignified "
     "without question.",
     'Venus', 'reference', 'cultural-figure'),
    ('saturn', 'Saturn',
     "A god of the Roman pantheon, listed among the planetary deities "
     "Augustine's youthful, astrology-minded studies took for granted.",
     'Saturn', 'reference', 'cultural-figure'),
    ('mars', 'Mars',
     "The Roman god of war, listed among the pantheon Augustine's early "
     "education treated as unremarkable fact.",
     'Mars', 'reference', 'cultural-figure'),
    ('minerva', 'Minerva',
     "The Roman goddess of wisdom and craft, named in Book 8's list of "
     "pagan deities Augustine mocks for offering no serious philosophy, "
     "only fables no better than Egypt's animal-gods.",
     'Minerva', 'reference', 'cultural-figure'),
    ('neptune', 'Neptune',
     "The Roman god of the sea, named in the same mocking list of "
     "pagan deities in Book 8.",
     'Neptune', 'reference', 'cultural-figure'),
    ('anubis', 'Anubis',
     "The Egyptian jackal-headed god, cited by Augustine alongside the "
     "Roman pantheon as an example of gods no wiser or worthier than "
     "animals.",
     'Anubis', 'reference', 'cultural-figure'),
    ('pylades', 'Pylades',
     "One half of the legendary pair of devoted friends (with Orestes) "
     "each said to have been willing to die for the other, cited in "
     "Book 4 as Augustine measures his own grief and dread of death "
     "after a friend's loss.",
     'Pylades', 'reference', 'literary-figure'),
    ('orestes', 'Orestes',
     "The other half of the legendary friendship with Pylades, cited "
     "alongside him in Book 4.",
     'Orestes', 'reference', 'literary-figure'),
    ('medea', 'Medea',
     "The sorceress of classical tragedy, invoked by way of the line "
     "\"Medea flying\" as an example of how even morally troubling "
     "poetry can be more honestly enjoyed than false philosophy.",
     'Medea', 'reference', 'literary-figure'),
    ('catiline', 'Catiline',
     "The Roman conspirator Lucius Sergius Catilina, cited in Book 2 "
     "as an example of evil done for its own sake rather than for any "
     "gain, a puzzle Augustine uses to examine his own boyhood theft "
     "of pears.",
     'Catiline', 'reference', 'person'),
    ('cicero', 'Cicero',
     "The Roman orator and philosopher, whose dialogue Hortensius "
     "(read at nineteen) turned Augustine's ambition toward the love "
     "of wisdom itself; named later, in Books 5 and 8, as Tully.",
     'Cicero|Tully', 'reference', 'person'),
    ('seneca', 'Seneca',
     "The Roman Stoic philosopher, a few of whose books the Manichaean "
     "bishop Faustus had read -- part of the thin secular learning "
     "Augustine found beneath Faustus's famed eloquence.",
     'Seneca', 'reference', 'person'),
    ('hippocrates', 'Hippocrates',
     "The ancient Greek physician; the unnamed doctor of Book 4 cites "
     "his own early study of Hippocrates as proof he abandoned "
     "astrology only after real expertise, not ignorance.",
     'Hippocrates', 'reference', 'person'),
    ('aristotle', 'Aristotle',
     "The Greek philosopher. Augustine reads the Categories (which he "
     "calls \"the ten Predicaments\") alone and unaided at about "
     "twenty, only later realizing that a treatise he found so lucid "
     "could say nothing true about God, the one substance to which "
     "none of its categories apply.",
     'Aristotle', 'reference', 'person'),
    ('epicurus', 'Epicurus',
     "The Greek philosopher of pleasure, whose creed Augustine says he "
     "would have endorsed in his more skeptical Milan years but for "
     "his belief in the soul's survival after death, which Epicurean "
     "materialism could not accommodate.",
     'Epicurus', 'reference', 'person'),

    # --- Reference: biblical and scriptural figures ---
    ('adam', 'Adam',
     "The first man of Genesis, cited repeatedly as the origin of "
     "inherited sin and, in Book 13, in Augustine's allegorical "
     "reading of the creation narrative.",
     'Adam', 'reference', 'religious-figure'),
    ('eve', 'Eve',
     "The first woman of Genesis, named alongside Adam in Augustine's "
     "discussions of the Fall and, in Book 13, of the allegorical "
     "Bride.",
     'Eve', 'reference', 'religious-figure'),
    ('solomon', 'Solomon',
     "The biblical king credited with the wisdom books, quoted "
     "(unnamed as author but identified by tradition) in Augustine's "
     "warning against vain curiosity in Book 3.",
     'Solomon', 'reference', 'religious-figure'),
    ('abraham', 'Abraham',
     "The patriarch of Genesis, cited among the Old Testament figures "
     "whose righteousness Augustine defends against Manichaean "
     "objections, and invoked again via \"Abraham's bosom\" in Book 9.",
     'Abraham', 'reference', 'religious-figure'),
    ('isaac', 'Isaac',
     "The patriarch of Genesis, cited alongside Abraham and Jacob as "
     "righteous under a law suited to his own time, and again in "
     "Book 10 as an old, nearly blind man blessing his sons by inward "
     "rather than outward sight.",
     'Isaac', 'reference', 'religious-figure'),
    ('jacob', 'Jacob',
     "The patriarch of Genesis, cited among the Old Testament "
     "righteous and, in Book 10, blessing his grandsons through Joseph "
     "despite his own blindness.",
     'Jacob', 'reference', 'religious-figure'),
    ('moses', 'Moses',
     "The lawgiver and traditional author of Genesis, cited among the "
     "Old Testament righteous in Book 3 and made the subject of "
     "sustained exegetical address in Books 11 and 12, where Augustine "
     "questions what Moses meant and intended by the creation account.",
     'Moses', 'reference', 'religious-figure'),
    ('david', 'David',
     "The biblical king and psalmist, cited among the Old Testament "
     "righteous, as the author of the Psalms sung in church (Books "
     "9-10), and as an example of self-reproach over a small desire "
     "(his craving for water in battle, recalled in Book 10).",
     'David', 'reference', 'religious-figure'),
    ('esau', 'Esau',
     "Jacob's brother in Genesis, cited as an example of being led "
     "astray by appetite (his sale of his birthright for lentils, "
     "recalled in Book 10) and, earlier, in Augustine's discussion of "
     "divine foreknowledge and justice (Book 7).",
     'Esau', 'reference', 'religious-figure'),
    ('mary', 'Mary',
     "The Virgin Mary, mother of Christ; Augustine recalls that his "
     "Manichaean beliefs once made him unable to accept that Christ "
     "could be born of her without being defiled by flesh.",
     'Mary', 'reference', 'religious-figure'),
    ('paul', 'Paul',
     "The apostle, cited repeatedly in Books 7 and 8 for his epistles "
     "on grace and the divided will, and again in Book 13's closing "
     "exegesis of his letters. Formerly named Saul, he took the name "
     "Paul, tradition held, in honor of the proconsul Paulus's "
     "conversion.",
     'Paul|Saul', 'reference', 'religious-figure'),
    ('onesiphorus', 'Onesiphorus',
     "A disciple commended in Paul's epistles for aiding him without "
     "shame during his imprisonment, cited in Book 13's allegorical "
     "reading of Philippians on the fruits of charity.",
     'Onesiphorus', 'reference', 'religious-figure'),
    ('epaphroditus', 'Epaphroditus',
     "The Philippian messenger who carried the congregation's gift to "
     "the imprisoned Paul, named in Book 13's exegesis of Philippians.",
     'Epaphroditus', 'reference', 'religious-figure'),
    ('isaiah', 'Isaiah',
     "The Old Testament prophet; Ambrose recommends Augustine begin "
     "his scriptural reading with Isaiah, as the prophet who most "
     "clearly foreshadows the Gospel and the calling of the Gentiles.",
     'Isaiah', 'reference', 'religious-figure'),
    ('noah', 'Noah',
     "The patriarch of Genesis, cited in Book 10 as having been "
     "permitted by God to eat any kind of flesh, part of Augustine's "
     "examination of his own struggle with the pleasure of eating.",
     'Noah', 'reference', 'religious-figure'),
    ('elijah', 'Elijah',
     "The prophet, cited twice: in Book 10, fed on flesh by God "
     "without sin, an example distinguishing lawful food from sinful "
     "appetite; in Book 13, fed by a widow who deliberately gave to a "
     "man of God, contrasted with the raven's unwitting gift, to "
     "illustrate the difference between a gift and its fruit.",
     'Elijah', 'reference', 'religious-figure'),
    ('tobias', 'Tobias',
     "The blind father of the book of Tobit, cited in Book 10 as, "
     "though physically sightless, teaching his son the way of life "
     "by an inward light.",
     'Tobias', 'reference', 'religious-figure'),
    ('joseph', 'Joseph',
     "The son of Jacob in Genesis, named in Book 10 as the father of "
     "the grandsons Jacob blessed with crossed hands despite his own "
     "blindness.",
     'Joseph', 'reference', 'religious-figure'),

    # --- Reference: figures from Augustine's own life and era ---
    ('manichaeus', 'Manichaeus',
     "Mani, the third-century Persian founder of Manichaeism, whose "
     "own scientific claims about the heavens Augustine tested against "
     "-- and found contradicted by -- ordinary astronomical "
     "calculation, a first crack in his faith in the sect.",
     'Manichaeus', 'reference', 'person'),
    ('helpidius', 'Helpidius',
     "A Catholic disputant at Carthage whose arguments against the "
     "Manichees, made from Scripture itself, unsettled Augustine's "
     "confidence in Manichaean answers.",
     'Helpidius', 'reference', 'person'),
    ('symmachus', 'Symmachus',
     "Prefect of Rome, who tests and appoints Augustine to the public "
     "rhetoric chair at Milan, the position that brings him within "
     "reach of Ambrose's preaching.",
     'Symmachus', 'reference', 'person'),
    ('vindicianus', 'Vindicianus',
     "A perceptive old proconsul and former physician who tries, "
     "gently and by personal example, to talk the young Augustine out "
     "of belief in astrology.",
     'Vindicianus', 'reference', 'person'),
    ('firminus', 'Firminus',
     "An educated acquaintance whose precise birth-time, compared with "
     "that of a household slave born at the same hour but living a "
     "wholly different life, becomes Augustine's own decisive argument "
     "against astrology.",
     'Firminus', 'reference', 'person'),
    ('hierius', 'Hierius',
     "A Roman orator Augustine never met but admired at a distance on "
     "reputation alone, cited in Book 4 as an example of the "
     "difference between being praised and being known.",
     'Hierius', 'reference', 'person'),
    ('photinus', 'Photinus',
     "A fourth-century bishop condemned as a heretic for denying "
     "Christ's divinity; Augustine recalls once holding a view of "
     "Christ close to Photinus's, as merely a man of surpassing "
     "wisdom.",
     'Photinus', 'reference', 'person'),
    ('cyprian', 'Cyprian',
     "The third-century bishop and martyr of Carthage; Monnica stops "
     "for a night's prayer at a seaside shrine kept in his memory, on "
     "the voyage where Augustine escapes to Rome without her.",
     'Cyprian', 'reference', 'person'),
    ('paulus-proconsul', 'Paulus',
     "Sergius Paulus, the Roman proconsul converted by the apostle's "
     "preaching in Acts; Augustine repeats the tradition (of doubtful "
     "accuracy) that the apostle took the name \"Paul\" in honor of "
     "this convert.",
     'Paulus', 'reference', 'person'),
    ('julian', 'Julian',
     "The fourth-century Roman emperor known as Julian the Apostate; "
     "his edict barring Christians from teaching rhetoric forced "
     "Victorinus to choose between his profession and his newly "
     "professed faith, a story told by Simplicianus in Book 8.",
     'Julian', 'reference', 'person'),
    ('justina', 'Justina',
     "Mother of the child-emperor Valentinian and an Arian "
     "sympathizer, whose persecution of Ambrose over control of a "
     "Milan church (Book 9) the devout, including Monnica, resist by "
     "keeping vigil.",
     'Justina', 'reference', 'person'),
    ('valentinian', 'Valentinian',
     "The child Roman emperor in whose name his mother Justina "
     "presses her Arian demands against Ambrose in Milan.",
     'Valentinian', 'reference', 'person'),
    ('gervasius', 'Gervasius',
     "One of two martyrs whose long-lost bodies Ambrose recovers by "
     "vision in Book 9, an event that includes a well-attested healing "
     "and turns public sentiment against Justina's persecution.",
     'Gervasius', 'reference', 'person'),
    ('protasius', 'Protasius',
     "The second of the two martyrs discovered with Gervasius, named "
     "together with him in Book 9.",
     'Protasius', 'reference', 'person'),
    ('euodius', 'Euodius',
     "A young fellow-citizen of Thagaste, a former officer of the "
     "court converted and baptized before Augustine, who joins "
     "Augustine and his household on the journey back toward Africa.",
     'Euodius', 'reference', 'person'),
    ('romanianus', 'Romanianus',
     "A wealthy fellow-townsman of Thagaste, considered by Augustine "
     "and his friends for the shared household of philosophical "
     "retirement they once planned, in Book 6.",
     'Romanianus', 'reference', 'person'),
    ('verecundus', 'Verecundus',
     "A Milanese friend, married and so unable to join the Cassiacum "
     "retreat, who lends Augustine's group his country house for it "
     "instead; he dies a Christian shortly after, a fact Augustine "
     "records with grateful relief in Book 9.",
     'Verecundus', 'reference', 'person'),
    ('antony', 'Antony',
     "Antony of the Desert, the Egyptian ascetic whose Life, read "
     "aloud by Pontitianus's account, drives two imperial officials to "
     "abandon their careers on the spot and becomes the story that "
     "finally breaks Augustine's resistance in the Book 8 garden "
     "scene.",
     'Antony', 'reference', 'person'),
    ('athanasius', 'Athanasius',
     "Bishop of Alexandria, remembered for having his lector recite "
     "the Psalms with so little melodic inflection that it was closer "
     "to speaking than singing -- a stricter model of church music "
     "Augustine weighs against his own delight in it (Book 10).",
     'Athanasius', 'reference', 'person'),
    ('anaximenes', 'Anaximenes',
     "The pre-Socratic philosopher who held air to be the first "
     "principle of all things; named only within Augustine's "
     "rhetorical questioning of the elements in Book 10 (\"the whole "
     "air with his inhabitants answered, Anaximenes was deceived\").",
     'Anaximenes', 'reference', 'person'),
]:
    add(*row)


ID = 'confessions'
CONTENT_VERSION = '2026-09-12.1'

editorial = dict(
    bookId=ID,
    contentVersion=CONTENT_VERSION,
    entities=entities,
    coverage=(
        "73 entities: 1 central (Augustine, the narrator, never named -- "
        "no bindable alias), 4 major (Monnica, Alypius, Nebridius, "
        "Ambrose), 6 supporting (Patricius, Adeodatus, Simplicianus, "
        "Victorinus, Pontitianus, Faustus), 62 reference. No genuine "
        "namesake collisions -- build_confessions.py needs no bind() "
        "override; the Paul/Saul/Paulus near-collision at 8:10 resolves "
        "by distinct spelling under word-boundary matching alone. This "
        "translation shows no footnote-apparatus contamination between "
        "editions, unlike Aristotle's Politics."
    ),
)

if __name__ == '__main__':
    out = Path(__file__).resolve().parent / 'editorial.json'
    out.write_text(json.dumps(editorial, indent=2, ensure_ascii=False) + '\n')
    print(f"Wrote {out} with {len(entities)} entities")
