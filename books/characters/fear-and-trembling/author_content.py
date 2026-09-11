"""Manually authored recognition copy for Fear and Trembling.

Covers the Preface, Exordium, Eulogy on Abraham, Preliminary Expectoration,
and Problemata I-III, plus the Epilogue, in both English editions.

Two spelling notes, not namesake issues: the original prints the Latin
"Cartesius" and the pseudonymous signature "Johannes de silentio" (lower
case s); the modern edition prints "Descartes" and "Johannes de Silentio"
(capital S). Both forms are carried as aliases on the same entities. The
original also drifts from "Agnete" (7:27-29) to "Agnes" (7:30 onward) for
the same girl within its own telling, and capitalizes "Merman" before
lower-casing it at 7:30; the modern edition uses "Agnes" and lower-case
"merman" throughout. All forms are carried as aliases.

The one real namesake collision in this book is "Sarah": Abraham's wife
throughout the Exordium, Eulogy, and Problema III's frame, and a wholly
different Sarah -- daughter of Raguel and Edna in the Book of Tobit --
within Kierkegaard's own digression at 7:40-7:46. See build_fear_and_
trembling.py for the location-scoped rule that keeps them apart, and the
package README for the full paragraph-by-paragraph accounting.
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
    ('cartesius', 'René Descartes',
     "The philosopher, praised in the Preface for having doubted honestly and for confining his method's claims to himself -- unlike, in Johannes de Silentio's telling, the philosophers of the present age.",
     'Cartesius|Descartes'),
    ('johannes-de-silentio', 'Johannes de Silentio',
     'The pseudonym under which this book is written and signed; "the present author" who speaks throughout in the first person.',
     'Johannes de silentio|Johannes de Silentio'),
    ('abraham', 'Abraham',
     'The patriarch whose willingness to sacrifice Isaac at God\'s command is this book\'s subject throughout: the "father of faith" whom Johannes de Silentio admires but cannot understand.',
     'Abraham', 'central'),
    ('isaac', 'Isaac',
     "Abraham's son, born to Sarah in her old age against expectation, and the one Abraham is commanded to sacrifice on Mount Moriah.",
     'Isaac', 'major'),
    ('sarah', 'Sarah',
     "Abraham's wife, who bore Isaac in her old age; in Problema III, one of the three -- with Eliezer and Isaac -- from whom Abraham conceals his undertaking.",
     '', 'major'),
    ('sarah-tobit', 'Sarah (Book of Tobit)',
     "A different Sarah: the daughter of Raguel and Edna in the Book of Tobit, given to seven husbands who each died on the wedding night before Tobias married her and survived. Kierkegaard calls her a heroine.",
     '', 'major'),
    ('hagar', 'Hagar',
     "Abraham's concubine, mother of his son Ishmael, whom Abraham drove out into the wilderness -- recalled in the Exordium's third retelling and again in Problema II.",
     'Hagar'),
    ('eliezer', 'Eliezer',
     "Abraham's faithful servant, named in the Exordium and again in Problema III as one of the three from whom Abraham conceals his undertaking on the way to Moriah.",
     'Eliezer', 'supporting'),
    ('moses', 'Moses',
     'Recalled for having struck the rock with his staff without believing, contrasted with Abraham and Sarah\'s belief in the promise.',
     'Moses'),
    ('jacob', 'Jacob',
     "Abraham's grandson, recalled as having had twelve sons and yet loving one -- Joseph -- as Abraham loved his only Isaac.",
     'Jacob'),
    ('noureddin', 'Noureddin',
     'A caliph of the Arabian Nights, invoked alongside Aladdin as an example of one who merely holds a magic ring of power, indifferent to how he came by it.',
     'Noureddin'),
    ('aladdin', 'Aladdin',
     'The Arabian Nights hero, invoked alongside Noureddin as an example of one who merely holds a magic ring of power, indifferent to how he came by it.',
     'Aladdin'),
    ('orpheus', 'Orpheus',
     'The legendary musician, recalled as having been deceived by the gods with an airy phantom in place of his beloved -- Johannes de Silentio\'s image for getting nothing without working.',
     'Orpheus'),
    ('miltiades', 'Miltiades',
     'The Athenian general at Marathon, whose famous triumphs, Johannes de Silentio notes, thousands knew by heart while only one man -- Themistocles, though unnamed here -- lost sleep over them.',
     'Miltiades'),
    ('christ', 'Jesus Christ',
     "Recalled as the one the rich young man met on his way, and later as the one it would be sweet to imagine walking the promised land -- forgetting how dreadful it actually was to have sat at table with God.",
     'Christ'),
    ('hegel', 'G. W. F. Hegel',
     'The philosopher whose account of the single individual, the ethical, and inwardness Johannes de Silentio repeatedly takes up and disputes, faulting him above all for speaking of Abraham as a father of faith.',
     'Hegel'),
    ('esau', 'Esau',
     "Jacob's brother, recalled only for the strength of his appetite, to which the knight of infinite resignation's wife-imagined roast lamb dinner is compared.",
     'Esau'),
    ('daub', 'Karl Daub',
     'The German theologian, quoted on the strange thoughts of a lone sentry standing watch by a powder magazine on a stormy night.',
     'Daub'),
    ('herod', 'Herod',
     "Named alongside Pilate as a figure a young maiden's naive religious assurance might run to and sway with her prayers.",
     'Herod'),
    ('pilate', 'Pontius Pilate',
     "Named alongside Herod as a figure a young maiden's naive religious assurance might run to and sway with her prayers.",
     'Pilate'),
    ('boileau', 'Nicolas Boileau',
     'The French critic, quoted on how a fool always finds a bigger fool to admire him.',
     'Boileau'),
    ('agamemnon', 'Agamemnon',
     'The Greek commander at Aulis, who must sacrifice his daughter Iphigenia to obtain a favorable wind for the fleet -- Johannes de Silentio\'s recurring tragic-hero counterpart to Abraham.',
     'Agamemnon', 'supporting'),
    ('iphigenia', 'Iphigenia',
     "Agamemnon's daughter, sacrificed (in Euripides's play) to secure the fleet's passage to Troy -- the tragic-hero's counterpart to Isaac, who unlike Isaac is told, weeps, and understands.",
     'Iphigenia', 'supporting'),
    ('jephthah', 'Jephthah',
     "The judge of Israel who, bound by his own vow, sacrifices his daughter after she is granted two months to mourn her lost youth -- another of the tragic-hero counterparts to Abraham.",
     'Jephthah', 'supporting'),
    ('brutus', 'Lucius Junius Brutus',
     "The Roman consul who, entrusted with judgment as a father, is said to have ordered the execution of his own son for treason against the young republic -- a third tragic-hero counterpart to Abraham.",
     'Brutus', 'supporting'),
    ('shakespeare', 'William Shakespeare',
     'Addressed directly ("great Shakespeare") as the poet who could say anything, wondered at for never having given voice to Abraham\'s particular anguish -- and named again as the author of Richard III.',
     'Shakespeare'),
    ('pythagoras', 'Pythagoras',
     "The Greek philosopher, cited for the saying that the odd number is more perfect than the even, and later for having chosen death over breaking his habitual silence.",
     'Pythagoras'),
    ('judas', 'Judas Iscariot',
     'Recalled as having sold his Lord for thirty pieces of silver -- the standard of contempt Johannes de Silentio measures against one who cheapens the story of Abraham by dwelling only on its outcome.',
     'Judas'),
    ('mary', 'The Virgin Mary',
     'Mother of Jesus, held up as another figure made great not by favor alone but by the distress, anguish, and paradox that favor brought her.',
     'Mary'),
    ('rousseau', 'Jean-Jacques Rousseau',
     'Cited for a kind of misdirected love -- loving distant Kaffirs in place of one\'s actual neighbor -- that Johannes de Silentio compares to loving an abstracted "God."',
     'Rousseau'),
    ('socrates', 'Socrates',
     'The Athenian philosopher, called the most interesting man who ever lived; his ironic reply to his own death sentence is discussed at length as the model of a fitting last word for an intellectual tragic hero.',
     'Socrates'),
    ('cain', 'Cain',
     "The first murderer, invoked to distinguish Abraham from him: Abraham does not hate Isaac as Cain hated Abel, which is precisely what makes Abraham's willingness a sacrifice rather than a murder.",
     'Cain'),
    ('master-jakel', 'Master Jakel',
     'A stock puppet-theatre showman figure (comparable to Punch), invoked as a type for the sectarian who gathers a few admiring friends and mistakes them for the universal.',
     'Master Jakel'),
    ('aristotle', 'Aristotle',
     "The philosopher, cited from the Poetics on recognition and reversal in tragedy, and from the Politics for the story of the bridegroom of Delphi used later in the same chapter.",
     'Aristotle'),
    ('euripides', 'Euripides',
     "The Greek tragedian, whose Iphigenia in Aulis supplies the Agamemnon example Johannes de Silentio analyzes at length.",
     'Euripides'),
    ('clytemnestra', 'Clytemnestra',
     "Agamemnon's wife and Iphigenia's mother, whose tears (and an old servant's disclosure to her) are part of the aesthetic apparatus of the Iphigenia story.",
     'Clytemnestra', 'supporting'),
    ('amor', 'Amor (Cupid)',
     'The god of love in the myth of Cupid and Psyche, who leaves Psyche with the warning that her child will be divine only if she keeps his identity secret.',
     'Amor'),
    ('psyche', 'Psyche',
     "Amor's beloved in the myth, warned that betraying his secret will cost her child its divinity -- Johannes de Silentio's image for how silence itself can be great.",
     'Psyche'),
    ('lessing', 'Gotthold Ephraim Lessing',
     'The German critic and dramatist, thanked for his brief remarks on a possible Christian drama in the Hamburg Dramaturgy, and praised for never claiming to have understood more than he had.',
     'Lessing'),
    ('elizabeth', 'Queen Elizabeth I',
     "The English queen, who signed the Earl of Essex's death warrant for the sake of the state -- and who, on learning too late that he had in fact sent her the ring she'd waited for, is said to have died in silence.",
     'Queen Elizabeth|Elizabeth'),
    ('essex', 'Robert Devereux, Earl of Essex',
     "Elizabeth I's favorite, whose death warrant she signed; his ring, sent to beg her mercy, was withheld from her by a lady-in-waiting's malice.",
     'Essex'),
    ('axel', 'Axel',
     'One half of the title pair of Oehlenschläger\'s tragedy Axel and Valborg, invoked as an example of lovers whom heaven itself separates equally, unlike the bridegroom of Delphi.',
     'Axel'),
    ('valborg', 'Valborg',
     'The other half of the title pair of Oehlenschläger\'s tragedy Axel and Valborg, invoked as an example of lovers whom heaven itself separates equally, unlike the bridegroom of Delphi.',
     'Valborg'),
    ('laban', 'Laban',
     "Jacob's father-in-law in Genesis, invoked as a type for the man in poetry who abandons one woman for her more \"ideal\" sister and thereby confuses trivial substitution for real passionate collision.",
     'Laban'),
    ('agnete', 'Agnete (Agnes)',
     "The innocent girl of the Danish legend of Agnete and the Merman, whose steady, believing gaze -- in Johannes de Silentio's retelling -- disarms the Merman's power to seduce her.",
     'Agnete|Agnes', 'major'),
    ('merman', 'The Merman',
     "The seducer of the legend of Agnete and the Merman; Johannes de Silentio reworks the story twice, once as a demonic figure conquered by Agnete's innocence, once as a genuinely repentant figure who might be saved by her love.",
     'Merman|merman', 'major'),
    ('gloster', 'Gloster (Richard III)',
     "Shakespeare's Richard, Duke of Gloucester and later Richard III, called the most demonic figure Shakespeare ever portrayed, made a demon by an inability to bear the compassion shown him from childhood for his deformity.",
     'Gloster|Gloucester|Richard the Third', 'supporting'),
    ('cumberland', 'Richard Cumberland',
     'The English playwright; "Cumberland\'s Jew" refers to Sheva, the sympathetic Jewish character of Cumberland\'s 1794 play The Jew, cited here as another demonic figure despite doing what is good.',
     'Cumberland'),
    ('baggesen', 'Jens Baggesen',
     "The Danish poet, quoted on the immortality of a mediocre city poet named Kildevalle: \"if he becometh immortal, then become we all so.\"",
     'Baggesen'),
    ('faust', 'Faust',
     "The doubter of German legend; Johannes de Silentio proposes his own version, one who loves Margaret but stays silent about his doubt out of sympathy for mankind, sacrificing himself for the universal.",
     'Faust', 'major'),
    ('goethe', 'Johann Wolfgang von Goethe',
     "The poet, whose interpretation of Faust Johannes de Silentio finds lacking in psychological insight into doubt's own inner conversations.",
     'Goethe'),
    ('mephistopheles', 'Mephistopheles',
     "The demon of Goethe's Faust, whose \"concave mirror\" is contrasted with the clear, innocent way Johannes de Silentio's own imagined Faust sees Margaret.",
     'Mephistopheles'),
    ('margaret', 'Margaret (Gretchen)',
     "Faust's beloved in Goethe's drama, seen here in her full innocence rather than through Mephistopheles's distorting mirror.",
     'Margaret'),
    ('aristophanes', 'Aristophanes',
     'The Greek comic playwright, imagined as the one who might, on purely ethical grounds, let laughter pass judgment on a bewildered age.',
     'Aristophanes'),
    ('munchausen', 'Baron Munchausen',
     'The legendary teller of tall tales, invoked as the contrast to a man who has genuinely undergone spiritual trial: one can tell the difference by listening through the line of what is said.',
     'Munchausen'),
    ('tamerlane', 'Tamerlane',
     'The conqueror, whose power to terrify with his armies is compared to what Faust\'s doubt could do to men\'s security, if he chose to speak it.',
     'Tamerlane'),
    ('gregorius-riminensis', 'Gregory of Rimini',
     'The medieval theologian nicknamed "tortor infantium" ("torturer of infants") for holding that unbaptized children are damned -- a nickname Johannes de Silentio borrows, calling himself "tortor heroum," a torturer of heroes.',
     'Gregorius Riminensis|Gregory of Rimini'),
    ('tobias', 'Tobias',
     "The young man of the Book of Tobit who marries Sarah, knowing the demon that killed her seven previous husbands on their wedding nights, and survives.",
     'Tobias', 'supporting'),
    ('raguel', 'Raguel',
     "Sarah's father in the Book of Tobit, who has a grave dug in the night in case Tobias too should die, and asks a maid to check whether he lives.",
     'Raguel'),
    ('edna', 'Edna',
     "Sarah's mother in the Book of Tobit, who prepares the bridal chamber, weeps with her daughter, and blesses her before the wedding night.",
     'Edna'),
    ('longus', 'Longus',
     'The Greek author of the pastoral romance Daphnis and Chloe, cited (as "Longi Pastoralia") for the line that no one has ever escaped Love, nor will, so long as beauty exists and eyes can see.',
     'Longi|Longus'),
    ('achilles', 'Achilles',
     'Named among those present at Aulis -- with Clytemnestra, Iphigenia, and the chorus -- whose grief and argument the tragic hero Agamemnon must, and does, face and answer.',
     'Achilles'),
    ('edward-iv', 'Edward IV',
     "The English king, quoted (in German) lamenting, on hearing of his brother Clarence's murder, that no one had pleaded for him -- the outcry Abraham is spared, since no one else can even argue with him.",
     'Edward IV'),
    ('clarence', 'George, Duke of Clarence',
     "Edward IV's brother, whose murder -- from Shakespeare's Richard III -- prompts the king's lament that no one had pleaded on his behalf.",
     'Clarence'),
    ('calchas', 'Calchas',
     "The seer who, in Euripides's play, is the one who actually draws the knife against Iphigenia -- not Agamemnon himself, which is why Agamemnon's silence does not demean him.",
     'Calchas'),
    ('diogenes-laertius', 'Diogenes Laërtius',
     'The ancient biographer of philosophers, cited by book and section number ("Book 8, §39") as the source for the anecdote of Pythagoras choosing death over breaking silence.',
     'Diogenes'),
    ('plato', 'Plato',
     "Cited for having \"poetically dispersed\" Socrates across so many dialogues that scholars differ on which of Socrates's lines should count as his decisive last word.",
     'Plato'),
    ('heraclitus', 'Heraclitus',
     'The Greek philosopher of flux ("the dark Heraclitus"), who deposited his writings in the temple of Diana and held that one cannot step twice into the same river -- a saying his own disciple then took further still.',
     'Heraclitus'),
]:
    add(*row)

ids = [e['id'] for e in entities]
assert len(ids) == len(set(ids)), 'duplicate id'

BASE = Path(__file__).resolve().parent
(BASE / 'editorial.json').write_text(json.dumps(dict(
    bookId='fear-and-trembling',
    contentVersion='2026-09-11.1',
    coverage=(
        'The Preface, Exordium, Eulogy on Abraham, Preliminary Expectoration, Problemata '
        'I-III, and Epilogue, in both English editions. Named biblical, classical, literary '
        'and historical figures Johannes de Silentio cites or retells by name. "Sarah" is the '
        'one real namesake collision: Abraham\'s wife everywhere except the Book of Tobit '
        'digression (7:40-7:46), where it names a different Sarah, daughter of Raguel and '
        'Edna -- see build_fear_and_trembling.py and the README. "Kildevalle," a mediocre '
        'city poet named only in a quotation from Baggesen, could not be resolved from the '
        'text alone and is deliberately left unbound; see README.'
    ),
    entities=entities,
), ensure_ascii=False, indent=2) + '\n')

if __name__ == '__main__':
    print(f'{len(entities)} entities written to editorial.json')
