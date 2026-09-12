"""Manually authored recognition copy for Marcus Aurelius's Meditations.

Covers all twelve Books in both English editions. This is a private
notebook, not a dialogue or a novel with a cast: almost nobody in it
"participates" in anything on the page. Most entries are Reference --
a teacher thanked in a single Book 1 paragraph, a philosopher cited to
make a point, a name in one of Marcus's own recurring "and where are
they now?" lists of the dead. Two entries are Major because the book
returns to them with sustained, substantive attention across multiple
Books rather than a single citation: Socrates (the recurring standard
of a life lived well, discussed at length in Books 3, 7 and 11) and
Antoninus Pius, Marcus's adoptive father, whose Book 6 character
portrait is the single longest sustained description of any person in
the work. Eleven of Book 1's named teachers get the book's next tier
down, Supporting, for the same reason Apology gave Socrates's friends
that tier: each receives Marcus's own dedicated paragraph of personal
memory, not just a citation.

Six genuine namesake collisions, all resolved by location-scoped
binding in build_meditations.py rather than a shared global alias:

- "Verus" names two different men: Marcus's paternal grandfather
  (1:0, the book's opening line) and Marcus's father, who died when
  Marcus was a small child (8:23, in the "Lucilla buried Verus"
  couplet -- see below). Lucius Verus, Marcus's co-emperor, is never
  named "Verus" anywhere in the text.
- "Antoninus" (bare, without "Pius") names Marcus's father twice --
  once as a backward reference within the same 8:23 sentence that
  first says "Antoninus Pius" -- but also names Marcus himself twice,
  self-referentially, at 6:22 ("how this word Antoninus is written")
  and 6:35 ("my city and country, as I am Antoninus, is Rome").
  Per editorial policy's instruction not to cast a treatise's author
  as a character, Marcus's self-references are deliberately left
  unbound; only the 8:23 backward reference to his father binds to
  Antoninus Pius.
- "Maximus" names two different men: Claudius Maximus, the Stoic
  teacher of Book 1 (1:11, then bare at 1:12 and 1:13), and an
  unrelated household figure paired with "Secunda" in Book 8's
  vanitas list of paired deaths (8:23) -- clearly not the revered
  teacher, given the company he keeps there (Epitynchanus, Diotimus,
  Celer, Charax, Eudaemon).
- "Cato" and "Scipio" (4:27) are both left entirely unbound. Book
  1:10 names a "Cato" unambiguously -- grouped with Thrasea,
  Helvidius, Dio and Brutus, the standard ancient roll-call of
  Republican libertas exemplars, this is Cato the Younger. But 4:27's
  bare "Cato" and "Scipio" sit in an undifferentiated chronological
  list of once-famous, now-forgotten Roman names (Camillus, Caeso,
  Volesius, Leonnatus; Scipio, Cato; then Augustus, Hadrian,
  Antoninus Pius) with no epithet to say which Cato or which Scipio
  is meant, and no scholarly consensus resolves it either. Per the
  namesake check, an occurrence that can't be resolved from the text
  itself stays unbound rather than guessing.
- "Severus" names Marcus's "brother" Severus, the teacher of 1:10,
  but also appears once more in Book 10's private list of obscure
  contemporary namesakes (10:29, "when Xenophon, of Crito, or
  Severus"). Nothing in that list-context ties it back to the Book 1
  figure, so 10:29's Severus is left unbound rather than assumed to
  be the same man.
- "Fabius" (bare, 4:41, an unidentified name in another vanitas list)
  and "Fabius Catulinus" (12:19, a distinct named figure) resolve
  cleanly via longest-span-first matching on the full two-word phrase
  -- no location scoping needed, unlike the collisions above.

Alexander is a clean three-way split, not a collision: "Alexander the
Grammarian" (1:6) and "Alexander the Platonic"/"the Platonist" (1:8)
are two named teachers, each always accompanied by his distinguishing
epithet in the text; every other, unadorned "Alexander" (3:2, 6:21,
8:2, 9:27, 10:25) is Alexander the Great. All three resolve through
plain global aliases and longest-span-first -- the full epithet always
outscores the bare name at the same position.

Diacritic/spelling variants: this translation (Meric Casaubon's, by
way of a public-domain Gutenberg text) renders several names with
ae/oe ligatures in original-en that modern-en spells out in full
(AElig/OElig -> ae/oe), and one name modern-en corrects a Gutenberg
transcription slip in: original-en's "Cadiciant's" (a stray letter --
should be "Cadicianus's") is preserved as printed, and both spellings
are given as aliases.
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
    # --- Major: sustained, whole-book presence ---
    ('socrates', 'Socrates',
     "The Athenian philosopher, invoked throughout as the standard of a "
     "life well lived: his equanimity in the face of death (Book 3), a "
     "sustained inquiry into what actually made him admirable rather than "
     "merely famous (Book 7), and a cluster of anecdotes about his "
     "poverty, his wife Xanthippe, and his refusal to fetch an innocent "
     "man for the Thirty Tyrants (Book 11).",
     'Socrates', 'major'),
    ('antoninus-pius', 'Antoninus Pius',
     "Marcus's adoptive father and predecessor as emperor. Book 6 gives "
     "him the work's longest sustained character portrait -- his "
     "patience, freedom from vanity, thoroughness, and equanimity under "
     "criticism -- held up as the standard Marcus measures himself "
     "against elsewhere (Books 4, 8, 10). Marcus was born Marcus Annius "
     "Verus and took the name Antoninus on adoption; a handful of bare "
     "\"Antoninus\" mentions elsewhere in the text are Marcus referring "
     "to himself, not to his father, and are not bound to this entry.",
     'Antoninus Pius', 'major'),

    # --- Supporting: Book 1's dedicated teacher portraits ---
    ('verus-grandfather', 'Verus (Marcus’s grandfather)',
     "Marcus's paternal grandfather, credited in the book's opening line "
     "with teaching him gentleness and freedom from anger. A second, "
     "unrelated \"Verus\" is Marcus's father, named later in Book 8.",
     '', 'supporting'),
    ('diognetus', 'Diognetus',
     "A teacher credited with turning young Marcus away from superstition "
     "and showmen's tricks and toward philosophy, and with introducing "
     "him to Bacchius, Tandasis, and Marcianus.",
     'Diognetus', 'supporting'),
    ('rusticus', 'Junius Rusticus',
     "The teacher Marcus credits with first convincing him his life "
     "needed correction, with steering him away from showy rhetoric and "
     "toward plain writing, and with giving him his own copy of "
     "Epictetus's discourses.",
     'Rusticus', 'supporting'),
    ('apollonius', 'Apollonius',
     "A Stoic teacher praised for combining unshakeable steadiness with "
     "warmth, and for taking favors from friends without becoming "
     "beholden to them.",
     'Apollonius', 'supporting'),
    ('sextus', 'Sextus',
     "A teacher praised for running his household with paternal warmth "
     "and for combining Stoic even-temperedness with genuine tenderness.",
     'Sextus', 'supporting'),
    ('alexander-grammarian', 'Alexander the Grammarian',
     "A grammar teacher credited with correcting others' language "
     "tactfully -- by supplying the right word in reply, never by "
     "pointing out the mistake directly. Not to be confused with "
     "Alexander the Platonist (also thanked in Book 1) or with Alexander "
     "the Great, named elsewhere in the book.",
     'Alexander the Grammarian', 'supporting'),
    ('fronto', 'Fronto',
     "A teacher credited with warning Marcus how much envy, fraud, and "
     "hypocrisy attend absolute power, and how little natural affection "
     "the highborn often have.",
     'Fronto', 'supporting'),
    ('alexander-platonist', 'Alexander the Platonist',
     "A Platonist teacher credited with teaching Marcus not to plead "
     "\"I have no time\" to friends who needed him. Not to be confused "
     "with Alexander the Grammarian (also thanked in Book 1) or with "
     "Alexander the Great, named elsewhere in the book.",
     'Alexander the Platonic|Alexander the Platonist', 'supporting'),
    ('catulus', 'Catulus',
     "A teacher credited with teaching Marcus not to dismiss a friend's "
     "complaint even when unfair, and to speak well of his own teachers, "
     "as he had heard was the practice of Domitius and Athenodotus.",
     'Catulus', 'supporting'),
    ('severus-brother', 'Severus',
     "Marcus's \"brother\" (an honorific, not a blood relation) credited "
     "with introducing him to the examples of Thrasea, Helvidius, Cato, "
     "Dio, and Brutus, and with kindling his early ideal of a "
     "commonwealth governed by equal law. A second, unrelated bare "
     "\"Severus\" appears once more in Book 10's private list of "
     "namesakes (10:29); nothing there ties it back to this figure, so "
     "that occurrence is left unbound rather than assumed to be the "
     "same man.",
     '', 'supporting'),
    ('claudius-maximus', 'Claudius Maximus',
     "A Stoic teacher praised for self-command, cheerfulness under "
     "hardship, and a manner so consistently upright that no one who knew "
     "him ever felt looked down on. A second, unrelated \"Maximus\" -- "
     "clearly a household figure, not this revered teacher -- appears "
     "once in Book 8's list of paired deaths (8:23).",
     'Claudius Maximus', 'supporting'),

    # --- Reference: Book 1's family and teachers, named in passing ---
    ('bacchius', 'Bacchius',
     "One of the teachers Diognetus first brought Marcus to hear.",
     'Bacchius'),
    ('tandasis', 'Tandasis',
     "One of the teachers Diognetus first brought Marcus to hear, named "
     "alongside Marcianus.",
     'Tandasis'),
    ('marcianus', 'Marcianus',
     "One of the teachers Diognetus first brought Marcus to hear, named "
     "alongside Tandasis.",
     'Marcianus'),
    ('domitius', 'Domitius',
     "Cited, alongside Athenodotus, as an example of someone who spoke "
     "well of his own teachers on every occasion -- the practice Catulus "
     "taught Marcus to imitate.",
     'Domitius'),
    ('athenodotus', 'Athenodotus',
     "Cited, alongside Domitius, as an example of someone who spoke well "
     "of his own teachers on every occasion -- the practice Catulus "
     "taught Marcus to imitate.",
     'Athenodotus'),
    ('thrasea', 'Thrasea',
     "Thrasea Paetus, the Roman senator executed under Nero for his "
     "principled opposition to imperial tyranny -- one of the exemplars "
     "of libertas that Severus introduced Marcus to.",
     'Thrasea'),
    ('helvidius', 'Helvidius',
     "Helvidius Priscus, the Roman senator and Stoic executed under "
     "Vespasian for defying imperial authority -- one of the exemplars of "
     "libertas that Severus introduced Marcus to.",
     'Helvidius'),
    ('dio', 'Dio',
     "Traditionally identified as Dio of Syracuse, the associate of Plato "
     "who tried to install philosophical rule there -- one of the "
     "exemplars of libertas that Severus introduced Marcus to, named "
     "alongside Brutus and Cato.",
     'Dio'),
    ('brutus', 'Brutus',
     "Marcus Junius Brutus, leader of the conspiracy against Julius "
     "Caesar -- one of the exemplars of libertas that Severus introduced "
     "Marcus to.",
     'Brutus'),
    ('cato-the-younger', 'Cato',
     "Cato the Younger, the Stoic senator and fierce opponent of Julius "
     "Caesar who became the standard Roman symbol of principled "
     "resistance to tyranny -- one of the exemplars of libertas that "
     "Severus introduced Marcus to (1:10), named alongside Thrasea, "
     "Helvidius, Dio, and Brutus. A second, unrelated bare \"Cato\" "
     "appears in Book 4's undifferentiated list of forgotten Roman names "
     "(4:27, alongside an equally unbound \"Scipio\"); nothing there "
     "distinguishes which Cato is meant, so that occurrence is left "
     "unbound rather than assumed to be this same man.",
     '', 'reference'),
    ('benedicta', 'Benedicta',
     "Named as a woman Marcus reports he never had any involvement with, "
     "in a passage thanking the gods for the restraint of his youth.",
     'Benedicta'),
    ('theodotus', 'Theodotus',
     "Named alongside Benedicta as someone Marcus reports he never had "
     "any involvement with, in a passage thanking the gods for the "
     "restraint of his youth.",
     'Theodotus'),
    ('chryses', 'Chryses',
     "The priest of Apollo from the opening of Homer's Iliad, who prays "
     "for his daughter's return on the seashore and is answered. Marcus "
     "cites him as a precedent for a dream that once resolved a physical "
     "complaint of his own.",
     'Chryses'),

    # --- Book 3-4: Book 3's mortality catalog and Book 4's vanitas lists ---
    ('hippocrates', 'Hippocrates',
     "The celebrated Greek physician, cited as proof that even a healer "
     "of many is not spared his own death.",
     'Hippocrates'),
    ('pompey', 'Pompey',
     "Pompey the Great, the Roman general, cited twice as an example of a "
     "great conqueror who nonetheless had to die like anyone else, "
     "grouped both times with Alexander and Julius Caesar.",
     'Pompeius|Pompey'),
    ('caius-julius-caesar', 'Julius Caesar',
     "Named \"Caius Caesar\" (and, once, bare \"Caius\"), cited twice as "
     "an example of a great conqueror who nonetheless had to die like "
     "anyone else, grouped both times with Alexander and Pompey.",
     'Caius Caesar|Caius Cæsar|Caius'),
    ('heraclitus', 'Heraclitus',
     "The philosopher of universal flux and periodic world-conflagration, "
     "cited repeatedly (Books 3, 4, 6) both for his death -- from dropsy, "
     "an irony given his own theories about fire and water -- and for "
     "his teaching that even sleepers contribute to the world's workings.",
     'Heraclitus'),
    ('democritus', 'Democritus',
     "The atomist philosopher, cited as proof that even a great mind is "
     "not spared an undignified death -- killed, Marcus says, by lice.",
     'Democritus'),
    ('phalaris', 'Phalaris',
     "The tyrant of Acragas, proverbial in antiquity for cruelty, cited "
     "as an example of the intolerable use of power alongside Nero.",
     'Phalaris'),
    ('nero', 'Nero',
     "The Roman emperor notorious for tyranny, cited alongside Phalaris "
     "as an example of the intolerable use of power.",
     'Nero'),
    ('cadicianus', 'Cadicianus',
     "An otherwise unidentified name in a list of once-familiar Romans "
     "now forgotten, alongside Fabius, Julianus, and Lepidus. Original-en "
     "prints \"Cadiciant's,\" a Gutenberg transcription slip for "
     "\"Cadicianus's\"; both spellings are aliased and the slip is left "
     "as printed, not corrected.",
     'Cadicianus|Cadiciant'),
    ('fabius-obscure', 'Fabius (Book 4)',
     "An otherwise unidentified name in a list of once-familiar Romans "
     "now forgotten, alongside Cadicianus, Julianus, and Lepidus. A "
     "different, fully named \"Fabius Catulinus\" appears later, in "
     "Book 12's separate list.",
     'Fabius'),
    ('julianus', 'Julianus',
     "An otherwise unidentified name in a list of once-familiar Romans "
     "now forgotten, alongside Cadicianus, Fabius, and Lepidus.",
     'Julianus'),
    ('lepidus', 'Lepidus',
     "An otherwise unidentified name in a list of once-familiar Romans "
     "now forgotten, alongside Cadicianus, Fabius, and Julianus.",
     'Lepidus'),
    ('camillus', 'Camillus',
     "Marcus Furius Camillus, the early Roman general and statesman "
     "sometimes called Rome's \"second founder,\" cited as the first name "
     "in a chronological list of once-famous Romans now fading into "
     "obscurity.",
     'Camillus'),
    ('caeso', 'Caeso',
     "An early, semi-legendary Roman name in the same list of once-famous "
     "Romans now forgotten, alongside Volesius and Leonnatus.",
     'Cæso|Caeso'),
    ('volesius', 'Volesius',
     "An early, semi-legendary Roman name in the same list of once-famous "
     "Romans now forgotten, alongside Caeso and Leonnatus.",
     'Volesius'),
    ('leonnatus', 'Leonnatus',
     "One of Alexander the Great's Macedonian generals, cited in the same "
     "list of once-famous names now forgotten, alongside Caeso and "
     "Volesius.",
     'Leonnatus'),
    ('augustus', 'Augustus',
     "Rome's first emperor, cited repeatedly as an example of a once "
     "supremely powerful figure now reduced to a name in a list -- his "
     "whole court (Book 8) and household (Book 8) are cited as an example "
     "of the death of an entire retinue.",
     'Augustus'),
    ('agathon', 'Agathon',
     "The Athenian tragic poet, a character in Plato's Symposium. Marcus "
     "quotes a saying attributed to him about minding one's own conduct "
     "rather than others' faults.",
     'Agathos|Agathon'),
    ('cecrops', 'Cecrops',
     "The legendary founding king of Athens. Marcus quotes an unnamed "
     "saying, \"beloved city of Cecrops,\" as a model for how he ought to "
     "address the world itself.",
     'Cecrops'),
    ('vespasian', 'Vespasian',
     "The Roman emperor, cited as an example of a bygone age whose people "
     "did all the same ordinary things people do now -- marrying, "
     "quarreling, dying -- and are now entirely gone.",
     'Vespasian'),
    ('trajan', 'Trajan',
     "The Roman emperor, cited alongside Vespasian as an example of a "
     "bygone age now entirely gone.",
     'Trajan'),

    # --- Book 5-7 ---
    ('alexander-the-great', 'Alexander the Great',
     "The Macedonian conqueror, cited repeatedly (Books 3, 6, 8, 9, 10) "
     "as the paradigm case of a life of vast worldly power that ends, "
     "like any other, in death -- once compared directly to the mule "
     "driver who died alongside him.",
     'Alexander of Macedon|Alexander'),
    ('crates', 'Crates',
     "The Cynic philosopher, cited for a (lost) remark about Xenocrates.",
     'Crates'),
    ('xenocrates', 'Xenocrates',
     "The philosopher and head of Plato's Academy, the subject of a "
     "(lost) remark by Crates that Marcus tells the reader to look up.",
     'Xenocrates'),
    ('aesculapius', 'Aesculapius',
     "The god of healing and medicine. Marcus asks rhetorically whether "
     "Aesculapius oversteps his own function the way a person might "
     "overstep theirs.",
     'Aesculapius', 'reference', 'cultural-figure'),
    ('chrysippus', 'Chrysippus',
     "The Stoic philosopher and systematizer of the school, cited twice "
     "(Books 6, 7) -- once for a joke he made about a bad line being part "
     "of a larger comedy.",
     'Chrysippus'),
    ('philistio', 'Philistio',
     "An otherwise unidentified name among a catalog of the dead of every "
     "profession, alongside Phoebus and Origanion.",
     'Philistio'),
    ('phoebus', 'Phoebus',
     "An otherwise unidentified name among a catalog of the dead of every "
     "profession, alongside Philistio and Origanion -- likely an ordinary "
     "person bearing the god Apollo's epithet as a name, not the god "
     "himself.",
     'Phœbus|Phoebus'),
    ('origanion', 'Origanion',
     "An otherwise unidentified name among a catalog of the dead of every "
     "profession, alongside Philistio and Phoebus.",
     'Origanion'),
    ('eudoxus', 'Eudoxus',
     "The Greek astronomer and mathematician, cited in a catalog of great "
     "minds now dead, alongside Hipparchus and Archimedes.",
     'Eudoxus'),
    ('hipparchus', 'Hipparchus',
     "The Greek astronomer, cited in the same catalog of great minds now "
     "dead, alongside Eudoxus and Archimedes.",
     'Hipparchus'),
    ('archimedes', 'Archimedes',
     "The Greek mathematician and engineer, cited in the same catalog of "
     "great minds now dead, alongside Eudoxus and Hipparchus.",
     'Archimedes'),
    ('menippus', 'Menippus',
     "The Cynic satirist, cited as an example of those who mocked the "
     "brevity and fragility of human life, and who are themselves now "
     "just as dead as everyone else.",
     'Menippus'),
    ('antisthenes', 'Antisthenes',
     "The Cynic philosopher and associate of Socrates, cited for a "
     "one-line saying about the cost of good and bad deeds becoming "
     "known.",
     'Antisthenes'),
    ('leon-of-salamis', 'Leon of Salamis',
     "The Athenian whom the Thirty Tyrants ordered Socrates to arrest; "
     "Socrates's refusal, at personal risk, is cited as one of the acts "
     "that made him admirable. Named here by the epithet \"Salaminius,\" "
     "the Salaminian.",
     'Salaminius'),
    ('plato', 'Plato',
     "The philosopher, cited repeatedly (Books 7, 9, 10, 11) as an "
     "authority -- his view that no soul errs willingly, his ideal "
     "\"commonwealth\" used as a byword for an unrealistic political "
     "hope, and, alongside Hesiod, as a source for the myth of the "
     "Isles of the Blessed.",
     'Plato'),
    ('epicurus', 'Epicurus',
     "The philosopher of atomism and pleasure, cited repeatedly (Books 7, "
     "9, 10) as the representative of the view Marcus argues against -- "
     "that the world is mere accidental atoms rather than governed by "
     "providence -- though Marcus notes that even on Epicurus's own terms "
     "his conclusions about death still hold.",
     'Epicurus'),

    # --- Book 8: household, court, and the "paired deaths" catalog ---
    ('africanus', 'Africanus',
     "Scipio Africanus, the Roman general who defeated Hannibal, cited "
     "alongside Augustus as proof that no man, however famous, is "
     "remembered forever.",
     'Africanus'),
    ('faustina', 'Faustina',
     "Faustina the Elder, wife of Antoninus Pius, cited in Book 8's list "
     "of paired deaths: she predeceased her husband, who himself died "
     "afterward.",
     'Faustina'),
    ('hadrian', 'Hadrian',
     "The Roman emperor and Antoninus Pius's predecessor, cited "
     "repeatedly (Books 4, 8, 10) as an example of a once-supreme figure "
     "now merely a name -- his whole court, his household attendants, "
     "and his own death are each cited in turn.",
     'Adrianus|Hadrian'),
    ('celer', 'Celer',
     "Named first in a chain of paired deaths in Hadrian's circle -- "
     "\"first Celer, [then] Hadrian; then Hadrian himself\" -- suggesting "
     "Celer predeceased the emperor he served.",
     'Celer'),
    ('charax', 'Charax',
     "One of the once-\"austere\" figures Marcus lists as now dead and "
     "mostly forgotten, alongside Demetrius the Platonic and Eudaemon.",
     'Charax'),
    ('demetrius-the-platonic', 'Demetrius the Platonic',
     "One of the once-\"austere\" figures Marcus lists as now dead and "
     "mostly forgotten, alongside Charax and Eudaemon. A different, "
     "fully named \"Demetrius Phalereus\" appears later, in Book 9.",
     'Demetrius the Platonic'),
    ('eudaemon', 'Eudaemon',
     "One of the once-\"austere\" figures Marcus lists as now dead and "
     "mostly forgotten, alongside Charax and Demetrius the Platonic.",
     'Eudaemon'),
    ('secunda', 'Secunda',
     "Named in Book 8's list of paired deaths -- \"Secunda, Maximus; then "
     "Secunda herself\" -- suggesting she outlived a household figure "
     "named Maximus before dying in turn.",
     'Secunda'),
    ('maximus-household', 'Maximus (Book 8)',
     "An unidentified household figure named in Book 8's list of paired "
     "deaths, alongside Secunda -- not the revered Stoic teacher Claudius "
     "Maximus of Book 1, given the company he keeps here (Epitynchanus, "
     "Diotimus, Celer, Charax, Eudaemon).",
     '', 'reference'),
    ('epitynchanus', 'Epitynchanus',
     "Named in Book 8's list of paired deaths -- \"Epitynchanus, "
     "Diotimus; then Epitynchanus himself\" -- suggesting he outlived "
     "Diotimus before dying in turn.",
     'Epitynchanus'),
    ('diotimus', 'Diotimus',
     "Named twice in Book 8 as a companion of the powerful now dead: "
     "paired with Epitynchanus in the list of successive deaths (8:23), "
     "and named again, alongside Chabrias, as one of Hadrian's attendants "
     "who lingered by his tomb (8:34).",
     'Diotimus'),
    ('lucilla', 'Lucilla',
     "Traditionally identified as Domitia Lucilla, Marcus's mother. "
     "Opens Book 8's list of paired deaths: \"Lucilla buried Verus; then "
     "was Lucilla herself buried by others\" -- read as Marcus's mother "
     "outliving his father before dying in turn.",
     'Lucilla'),
    ('verus-father', 'Verus (Marcus’s father)',
     "Traditionally identified as Marcus's own father, who died when "
     "Marcus was a small child, in the couplet \"Lucilla buried Verus; "
     "then was Lucilla herself buried by others\" (8:23) -- read as "
     "Marcus's mother outliving his father before dying in turn. A "
     "second, unrelated \"Verus\" is Marcus's paternal grandfather, named "
     "in the book's opening line.",
     '', 'reference'),
    ('senate', 'The Senate',
     "The Roman Senate, cited among the institutions Augustus is "
     "recorded as having carefully managed.",
     'Senate', 'reference', 'group'),
    ('agrippa', 'Agrippa',
     "Marcus Vipsanius Agrippa, Augustus's general and son-in-law, cited "
     "as part of the entire vanished court of Augustus.",
     'Agrippa'),
    ('areus', 'Areus',
     "Arius Didymus, the philosopher and close friend of Augustus, cited "
     "as part of the entire vanished court of Augustus.",
     'Areus'),
    ('maecenas', 'Maecenas',
     "Gaius Maecenas, Augustus's celebrated patron and advisor, cited as "
     "part of the entire vanished court of Augustus.",
     'Mæcenas|Maecenas'),
    ('the-pompeys', 'The Pompeys',
     "The family of Pompey the Great, cited as an example of an entire "
     "once-powerful lineage that eventually runs out, quoting an "
     "epitaph: \"He was the last of his own kindred.\"",
     'Pompeys', 'reference', 'family'),
    ('panthea', 'Panthea',
     "Named, alongside Pergamus, as an attendant who supposedly lingered "
     "by a master's tomb -- cited by Marcus as a foolish example of "
     "misplaced devotion to the dead.",
     'Panthea'),
    ('pergamus', 'Pergamus',
     "Named, alongside Panthea, as an attendant who supposedly lingered "
     "by a master's tomb -- cited by Marcus as a foolish example of "
     "misplaced devotion to the dead.",
     'Pergamus'),
    ('chabrias', 'Chabrias',
     "Named, alongside Diotimus, as one of Hadrian's attendants who "
     "supposedly lingered by the emperor's tomb -- cited by Marcus as a "
     "foolish example of misplaced devotion to the dead.",
     'Chabrias'),

    # --- Book 9-10 ---
    ('demetrius-phalereus', 'Demetrius Phalereus',
     "Demetrius of Phalerum, the Athenian statesman and philosopher who "
     "governed Athens under Macedonian oversight, cited alongside "
     "Alexander and Philip as an example of political men whose "
     "self-command Marcus refuses to imitate. A different, otherwise "
     "unidentified \"Demetrius the Platonic\" appears earlier, in Book 8.",
     'Demetrius Phalereus'),
    ('philip-of-macedon', 'Philip of Macedon',
     "Alexander the Great's father, cited twice (Books 9, 10) alongside "
     "Alexander as an example of a once-supreme ruler whose entire court "
     "is now merely a name in a list.",
     'Philippus|Philip'),
    ('hesiod', 'Hesiod',
     "The early Greek poet, cited alongside Plato as a source for the "
     "myth of the Isles of the Blessed (the Elysian Fields).",
     'Hesiod'),
    ('croesus', 'Croesus',
     "The legendarily wealthy king of Lydia, cited alongside Hadrian, "
     "Antoninus Pius, Philip, and Alexander as an example of a "
     "once-supreme figure whose entire court is now merely a name in a "
     "list.",
     'Crœsus|Croesus'),
    ('satyro', 'Satyro',
     "An unidentified contemporary of Marcus's, the first in a private "
     "list of paired names (10:29) whose exact point of comparison -- to "
     "Socraticus and Eutyches, or Hymen -- is not recoverable from the "
     "text.",
     'Satyro'),
    ('socraticus', 'Socraticus',
     "An unidentified figure paired with Satyro in Marcus's private list "
     "of comparisons (10:29), alongside Eutyches or Hymen.",
     'Socraticus'),
    ('eutyches', 'Eutyches',
     "An unidentified figure paired with Satyro in Marcus's private list "
     "of comparisons (10:29), alongside Socraticus or Hymen.",
     'Eutyches'),
    ('hymen', 'Hymen',
     "An unidentified figure paired with Satyro in Marcus's private list "
     "of comparisons (10:29) -- likely a person bearing the name of the "
     "Greek marriage-god as a personal name, rather than the god "
     "himself.",
     'Hymen'),
    ('euphrates', 'Euphrates',
     "Possibly Euphrates of Tyre, a Stoic philosopher of Marcus's own era "
     "praised by other contemporary writers, though the text gives no "
     "detail beyond the bare name in this private list of comparisons "
     "(10:29), paired with Eutychio and Sylvanus.",
     'Euphrates'),
    ('eutychio', 'Eutychio',
     "An unidentified figure paired with Euphrates in Marcus's private "
     "list of comparisons (10:29), alongside Sylvanus.",
     'Eutychio'),
    ('sylvanus', 'Sylvanus',
     "An unidentified figure paired with Euphrates in Marcus's private "
     "list of comparisons (10:29), alongside Eutychio.",
     'Sylvanus'),
    ('alciphron', 'Alciphron',
     "An unidentified figure in Marcus's private list of comparisons "
     "(10:29), paired with Tropaeophorus.",
     'Alciphron'),
    ('tropaeophorus', 'Tropaeophorus',
     "An unidentified figure paired with Alciphron in Marcus's private "
     "list of comparisons (10:29).",
     'Tropaeophorus'),
    ('xenophon', 'Xenophon',
     "The Athenian historian and associate of Socrates, cited as one "
     "half of the closing pair in Marcus's private list of comparisons "
     "(10:29), alongside Crito or Severus.",
     'Xenophon'),
    ('crito', 'Crito',
     "Socrates's friend, present at his death in Plato's dialogues, cited "
     "as one of the figures Xenophon is compared to in Marcus's private "
     "list of comparisons (10:29).",
     'Crito'),

    # --- Book 11 ---
    ('empedocles', 'Empedocles',
     "The philosopher whose image of the soul as a perfect, "
     "self-sufficient sphere Marcus borrows twice (Books 11, 12) as a "
     "model for the ideal disposition of the mind.",
     'Empedocles'),
    ('phocion', 'Phocion',
     "The Athenian statesman noted for showing his critics their errors "
     "gently rather than scornfully -- cited as a model for how to "
     "respond to those who hate or contemn you, so long as the anecdote "
     "isn't exaggerated.",
     'Phocion'),
    ('diogenes', 'Diogenes',
     "The Cynic philosopher, cited twice (Books 8, 11) as an example of "
     "genuine philosophical seriousness -- once for having earned, "
     "through his own directness, the liberty later claimed by Old "
     "Comedy.",
     'Diogenes'),
    ('hercules', 'Hercules',
     "The mythical hero, invoked as \"the guide and leader of the Muses\" "
     "as the source of a tenth maxim about not resenting that wicked "
     "people exist.",
     'Hercules', 'reference', 'cultural-figure'),
    ('perdiccas', 'Perdiccas',
     "Traditionally identified as Perdiccas II, king of Macedon and a "
     "contemporary of Socrates, said to have invited Socrates to his "
     "court -- an invitation Socrates is quoted here as having declined.",
     'Perdiccas'),
    ('xanthippe', 'Xanthippe',
     "Socrates's wife, named in an anecdote about Socrates good-naturedly "
     "wearing an animal skin after she took his clothes away.",
     'Xanthippe'),

    # --- Book 12 ---
    ('fabius-catulinus', 'Fabius Catulinus',
     "An otherwise unidentified Roman named in Book 12's list of "
     "vanished examples of \"vehement prosecution in worldly matters,\" "
     "alongside Lucius Lupus, Stertinius, Tiberius, and Velius Rufus. A "
     "different, unrelated bare \"Fabius\" appears earlier, in Book 4's "
     "separate list.",
     'Fabius Catulinus'),
    ('lucius-lupus', 'Lucius Lupus',
     "An otherwise unidentified Roman named in the same Book 12 list, "
     "alongside Fabius Catulinus, Stertinius, Tiberius, and Velius "
     "Rufus.",
     'Lucius Lupus'),
    ('stertinius', 'Stertinius',
     "An otherwise unidentified Roman named in the same Book 12 list, "
     "alongside Fabius Catulinus, Lucius Lupus, Tiberius, and Velius "
     "Rufus.",
     'Stertinius'),
    ('tiberius', 'Tiberius',
     "The Roman emperor who spent his final years in seclusion at "
     "Capreae (Capri), named in the same Book 12 list as an example of "
     "\"vehement prosecution in worldly matters\" now vanished.",
     'Tiberius'),
    ('velius-rufus', 'Velius Rufus',
     "An otherwise unidentified Roman named in the same Book 12 list, "
     "alongside Fabius Catulinus, Lucius Lupus, and Stertinius.",
     'Velius Rufus'),
]:
    add(*row)

# --- Cultural-figure and family kinds passed explicitly above where the
# five-item tuple already ended in a kind override (aesculapius, hercules,
# the-pompeys, senate) -- add() unpacks all remaining fields positionally.

path = Path(__file__).resolve().parent / 'editorial.json'
path.write_text(json.dumps(dict(
    bookId='meditations',
    contentVersion='2026-09-12.1',
    coverage=(
        'All twelve Books in both English editions. A private notebook, not '
        'a dialogue or novel -- almost every entry is Reference, a teacher '
        'thanked in one Book 1 paragraph or a name in one of Marcus\'s own '
        'recurring "where are they now" lists. Two entries are Major for '
        'sustained engagement across multiple Books: Socrates and Antoninus '
        'Pius. Eleven Book 1 teachers are Supporting for a dedicated '
        'personal-memory paragraph each. Five genuine namesake collisions '
        '("Verus", "Antoninus", "Maximus", "Cato", "Severus") resolved by '
        'location-scoped binding; two of them (Cato, plus an unrelated bare '
        '"Scipio" alongside it) leave one occurrence deliberately unbound '
        'rather than guessed; see build_meditations.py and README.md.'
    ),
    entities=entities,
), indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
print(f'Wrote {len(entities)} entities to {path}')

ids = [e['id'] for e in entities]
assert len(ids) == len(set(ids)), 'duplicate entity ids'
