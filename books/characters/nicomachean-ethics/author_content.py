"""Manually authored recognition copy for Aristotle's Nicomachean Ethics.

10 Books (edition chapters 1-10, "Book 1" through "Book 10"), 1195
paragraphs, identical structure in both English editions. Like the other
Aristotelian treatise already in this queue (Politics), this is a
lecture-course argument with no narrative or staged dialogue: Aristotle
never appears as a character, and nothing here is dramatized. Per
editorial policy's guidance for treatises -- "cited thinkers normally
remain references... without inventing a fictional cast" -- every one of
the 57 entries below is Reference. There is no Central, Major, or
Supporting entry.

The cast is a large flat list of names cited as examples, authorities,
or targets of a quoted maxim:

- Philosophers and scientists: Socrates, Plato, Heraclitus, Empedocles,
  Anaxagoras, Thales, Eudoxus, Speusippus, Protagoras, Pythagoreans (a
  named school, bound as a group).
- Poets and playwrights, quoted or cited by name for a specific line or
  play: Homer, Hesiod, Euripides, Aeschylus, Sophocles, Agathon,
  Epicharmus, Anaxandrides, Evenus, Theodectes, Carcinus, Theognis,
  Simonides, Demodocus (a historical gnomic poet -- see note below, not
  Homer's fictional bard of the same name).
- Statesmen, lawgivers, and one general: Solon, Anacharsis, Pittacus,
  Bias, Pericles, Brasidas.
- Craftsmen cited for their skill: Phidias, Polyclitus.
- Legendary/historical figures cited as a byword: Sardanapalus (luxury),
  Phalaris (cruelty), Milo (an athlete's appetite), Xenophantus (an
  anecdote about uncontrollable laughter).
- Homeric and tragic figures, quoted or cited directly: Hector, Priam,
  Diomedes, Polydamas, Odysseus, Calypso, Helen, Glaucus, Agamemnon,
  Thetis, Neoptolemus, Philoctetes, Alcmaeon, Merope, Niobe, Cercyon,
  Rhadamanthus, Endymion.
- Deities, quoted or invoked: Zeus, Aphrodite.
- The Sophists, a named group cited collectively for their teaching
  practices and fees (bound as a group, distinct from Protagoras, who is
  named individually).

No genuine namesake collision was found -- unlike Hume's two Alexanders
and two Catos the automation queue warns treatises can hide, every name
here that recurs (Homer, Socrates, Plato, Euripides, Heraclitus,
Empedocles, Speusippus, Eudoxus, Phalaris, Theognis, Diomedes/Tydides)
was checked at every occurrence and names the same person throughout.
The real editorial hazards in this book are three, all resolved from the
text itself and documented at length in the README:

1. "Demus" (8, 66), "and those of the same tribe, or Demus" -- this is
   Aristotle's own technical term for a deme (an Athenian political/
   territorial subdivision), not a person; no entity is authored for it.
2. "Alope" (7, 68), "Cercyon in the Alope of Carcinus" -- a play title
   (Carcinus's now-lost tragedy Alope), not a person; Cercyon, the
   character within it, is bound, but Alope is not, since the text
   never names her as an agent, only as the title of the work.
3. Two edition-specific naming choices are aliased so the same entity
   binds in both: original-en's "Ulysses"/modern-en's "Odysseus";
   original-en's "Jupiter"/"Jove" and modern-en's "Zeus"; original-en's
   "Venus" and modern-en's "Aphrodite"; original-en's own inconsistent
   spelling "Anexagoras" once and "Anaxagoras" once (modern-en uses
   "Anaxagoras" both times) -- all bound under one entity per referent
   with every spelling aliased.

Demonyms and generic groups are deliberately left unbound throughout:
Lacedaemonians/Spartans, Persians, Celts, Cretans, Scythians, Argives,
Sicyonians, Milesians/Miletians, Athenians. Place names that could be
mistaken for persons are also left alone: Pontus, Euripus (a strait,
"change not like the Euripus"), Hermaeum (a battle site), Miletus.
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
    # --- Reference: philosophers and scientists ---
    ('socrates', 'Socrates',
     "Cited repeatedly as holding that no one can knowingly act against "
     "what he judges best -- that apparent wrongdoing must really be "
     "ignorance -- a view Aristotle examines in detail and partly "
     "rejects when analysing weakness of will (imperfect self-control); "
     "also cited for his habit of denying commonly-held opinions, and "
     "for having thought courage itself was a kind of knowledge.",
     'Socrates', 'reference', 'person'),
    ('plato', 'Plato',
     "Cited three times: for raising the question whether reasoning "
     "should proceed from first principles or toward them, for holding "
     "that children should be trained from infancy to feel pleasure and "
     "pain at the right objects, and for the argument (used against "
     "identifying pleasure with the chief good) that a life of pleasure "
     "combined with practical wisdom is more choice-worthy than pleasure "
     "alone.",
     'Plato', 'reference', 'person'),
    ('heraclitus', 'Heraclitus',
     "Cited three times: for the saying that it is harder to fight "
     "pleasure than anger, as an example of someone who holds his own "
     "opinions as firmly as others hold demonstrated knowledge, and for "
     "observing that different creatures find different things pleasant "
     "(an ass would rather have hay than gold).",
     'Heraclitus', 'reference', 'person'),
    ('empedocles', 'Empedocles',
     "Cited three times: his verses are the example of words repeated "
     "without being truly understood (as men of imperfect self-control "
     "recite moral maxims without really knowing them), and he is cited "
     "for holding the opposite view to Heraclitus, that like seeks like.",
     'Empedocles', 'reference', 'person'),
    ('anaxagoras', 'Anaxagoras',
     "Cited twice: alongside Thales as a byword for a man who is "
     "\"scientific\" (wise about lofty, difficult matters) but not "
     "practically wise about his own affairs, and again for his view "
     "that the happy man is not necessarily rich or powerful, and would "
     "not be surprised to seem a strange man to the multitude, who judge "
     "only by outward things. original-en spells the name two different "
     "ways for the same person, \"Anexagoras\" at the first occurrence "
     "and \"Anaxagoras\" at the second (a source inconsistency, not "
     "corrected here); modern-en spells it \"Anaxagoras\" both times.",
     'Anaxagoras|Anexagoras', 'reference', 'person'),
    ('thales', 'Thales',
     "Cited alongside Anaxagoras as a byword for a man wise about lofty, "
     "difficult, wonderful matters, but not practically wise, since such "
     "men do not concern themselves with what is good for human beings.",
     'Thales', 'reference', 'person'),
    ('eudoxus', 'Eudoxus',
     "Cited twice for his argument that pleasure is the chief good, "
     "since all creatures, rational and irrational, pursue it -- an "
     "argument Aristotle says was taken seriously mainly because Eudoxus "
     "was known for his own exceptional self-mastery, so he was trusted "
     "not to be merely rationalizing a love of pleasure.",
     'Eudoxus', 'reference', 'person'),
    ('speusippus', 'Speusippus',
     "Cited twice: as a philosopher who followed the Pythagoreans in "
     "ranking \"the One\" among goods, and again for his own argument "
     "(which Aristotle rejects) that pleasure is opposed to pain without "
     "being its exact contrary, the way the greater part of a quantity "
     "is opposed to, but not the exact contrary of, the lesser.",
     'Speusippus', 'reference', 'person'),
    ('protagoras', 'Protagoras',
     "Cited for his practice of letting a student who had just finished "
     "learning from him set, by his own private estimate, the price of "
     "the instruction received.",
     'Protagoras', 'reference', 'person'),

    # --- Reference: a named philosophical school, bound as a group ---
    ('pythagoreans', 'the Pythagoreans',
     "The followers of Pythagoras, cited three times for specific "
     "doctrines: that \"the One\" belongs among the class of goods, "
     "that evil belongs to the class of the unlimited and good to the "
     "limited, and that justice is simple reciprocity (\"that which "
     "reciprocates with another\") -- a view Aristotle examines and "
     "qualifies rather than accepts outright.",
     'Pythagoreans', 'reference', 'group'),

    # --- Reference: poets and playwrights ---
    ('homer', 'Homer',
     "Quoted or cited by name more than any other figure in the book: "
     "for lines describing Hector, Diomedes, and the girdle of "
     "Aphrodite; for calling a man \"godlike\" and Zeus \"Father\" and "
     "Agamemnon \"shepherd of the people\"; for a saying about two men "
     "going together being wiser than one; for a natural desire "
     "described in the Odyssey; and for the comic poem Margites, cited "
     "for a line about a man skilled in nothing.",
     'Homer', 'reference', 'person'),
    ('hesiod', 'Hesiod',
     "Quoted for verses distinguishing the man who reasons for himself, "
     "the man who takes good advice, and the man who does neither and "
     "is useless.",
     'Hesiod', 'reference', 'person'),
    ('euripides', 'Euripides',
     "Cited or quoted four times: for a line from a lost play in which "
     "Alcmaeon excuses his matricide by compulsion, for physical "
     "speculation on why the earth loves rain and the sky loves to "
     "rain, for a character's complaint about being called meddlesome "
     "for looking after the common good, and as an author who "
     "encourages people to reason about friendship in purely physical "
     "terms.",
     'Euripides', 'reference', 'person'),
    ('aeschylus', 'Aeschylus',
     "Cited for the story that he was accused of revealing the secrets "
     "of the Eleusinian Mysteries without realizing he was doing "
     "anything wrong -- an example of a man ignorant of what he is "
     "doing.",
     'Aeschylus', 'reference', 'person'),
    ('sophocles', 'Sophocles',
     "Cited for his play Philoctetes, in which the character "
     "Neoptolemus is praised for breaking his promise to Odysseus rather "
     "than persist in a lie -- Aristotle's example of a case where "
     "failing to \"stick to one's resolve\" is actually praiseworthy.",
     'Sophocles', 'reference', 'person'),
    ('agathon', 'Agathon',
     "Quoted twice: for the line that not even a god can make undone "
     "what has already been done, and for the observation that art and "
     "fortune love each other, and each is loved by the other.",
     'Agathon', 'reference', 'person'),
    ('epicharmus', 'Epicharmus',
     "Cited for the likely retort that people who explain a benefactor's "
     "greater affection for the one he benefits by comparing it to a "
     "creditor's concern for a debtor are judging others by their own "
     "low character.",
     'Epicharmus', 'reference', 'person'),
    ('anaxandrides', 'Anaxandrides',
     "Quoted for a mocking line about a city that \"willed\" a law it "
     "cares nothing for -- Aristotle's illustration of how a man of "
     "imperfect self-control resembles a community with good laws it "
     "never actually follows.",
     'Anaxandrides', 'reference', 'person'),
    ('evenus', 'Evenus',
     "Quoted for the couplet that long practice becomes, in the end, "
     "very nature -- cited on how habituated vice can come to resemble "
     "an unchangeable natural disposition.",
     'Evenus', 'reference', 'person'),
    ('theodectes', 'Theodectes',
     "Cited for his tragedy on Philoctetes, in which the hero, "
     "wounded by the viper, endures pain that would excuse anyone's "
     "loss of self-control -- distinct from Sophocles' own separate "
     "play on the same hero, cited elsewhere in the book.",
     'Theodectes', 'reference', 'person'),
    ('carcinus', 'Carcinus',
     "Cited for his tragedy Alope, in which the character Cercyon "
     "struggles, in a similarly excusable way, against overwhelming "
     "pain.",
     'Carcinus', 'reference', 'person'),
    ('theognis', 'Theognis',
     "Cited twice: for the idea that living with good people improves "
     "one's own virtue by practice, and for the observation that if "
     "talking and writing alone could make men good, such men would "
     "have earned very great rewards for it by now.",
     'Theognis', 'reference', 'person'),
    ('simonides', 'Simonides',
     "Cited for a maxim about generosity which the liberal man, valuing "
     "wealth so little that he can easily be wronged by it, does not "
     "relish.",
     'Simonides', 'reference', 'person'),
    ('demodocus', 'Demodocus',
     "A gnomic poet, quoted for his saying that the people of Miletus "
     "\"are not fools, but they do just the kind of things that fools "
     "do\" -- Aristotle's comparison for the man of imperfect "
     "self-control, who is not unjust but does unjust things. This is "
     "the historical poet, distinct from the fictional bard of the same "
     "name who sings at the Phaeacian court in Homer's Odyssey (not "
     "otherwise mentioned in this book).",
     'Demodocus', 'reference', 'person'),

    # --- Reference: statesmen, lawgivers, a general ---
    ('solon', 'Solon',
     "Cited three times: for advising that no man be called happy until "
     "his life has ended, and for the considered opinion that the happy "
     "are those of moderate means who have done noble deeds and lived "
     "with self-mastery.",
     'Solon', 'reference', 'person'),
    ('anacharsis', 'Anacharsis',
     "Cited for the saying that amusement should be pursued in order to "
     "work seriously afterward, not the reverse -- used to argue that "
     "happiness cannot consist in amusement.",
     'Anacharsis', 'reference', 'person'),
    ('pittacus', 'Pittacus',
     "Cited as an example of a ruler appointed by common agreement, in "
     "the discussion of communities that share unity of sentiment about "
     "who should hold power.",
     'Pittacus', 'reference', 'person'),
    ('bias', 'Bias',
     "Quoted for the saying \"Rule will show what a man is\" -- cited to "
     "support the claim that justice, uniquely among the virtues, is "
     "fully tested only in a person's dealings with others.",
     'Bias', 'reference', 'person'),
    ('pericles', 'Pericles',
     "Cited, with \"men of that stamp,\" as an example of practical "
     "wisdom: someone able to see what is good for himself and for "
     "people in general.",
     'Pericles', 'reference', 'person'),
    ('brasidas', 'Brasidas',
     "The Spartan general, cited for the practice of sacrificing to him "
     "as a hero after his death -- Aristotle's example of a "
     "\"conventional\" rather than a universally natural form of "
     "justice.",
     'Brasidas', 'reference', 'person'),

    # --- Reference: craftsmen cited for skill ---
    ('phidias', 'Phidias',
     "The sculptor, cited alongside Polyclitus as an example of someone "
     "called \"scientific\" or expert in the narrower sense of having "
     "brought a particular art to the highest accuracy.",
     'Phidias', 'reference', 'person'),
    ('polyclitus', 'Polyclitus',
     "The sculptor, cited alongside Phidias for the same reason. "
     "original-en spells the name \"Polycleitus,\" modern-en "
     "\"Polyclitus\"; both are aliased.",
     'Polycleitus|Polyclitus', 'reference', 'person'),

    # --- Reference: legendary/historical figures cited as a byword ---
    ('sardanapalus', 'Sardanapalus',
     "The legendary Assyrian king, cited as a byword for a life of "
     "sensual indulgence: \"many of the great share the tastes of "
     "Sardanapalus.\"",
     'Sardanapalus', 'reference', 'person'),
    ('phalaris', 'Phalaris',
     "The tyrant of Agrigentum, notorious for cruelty, cited twice as "
     "an example of a brutish, unnatural desire (to eat a child) that "
     "goes beyond ordinary vice altogether.",
     'Phalaris', 'reference', 'person'),
    ('milo', 'Milo',
     "The champion athlete, cited as an example of how a fixed "
     "quantity can be too much for one person and too little for "
     "another: a food ration too small for Milo would be too much for "
     "a beginner.",
     'Milo', 'reference', 'person'),
    ('xenophantus', 'Xenophantus',
     "Cited for an anecdote about bursting into uncontrollable, "
     "continuous laughter while trying to suppress it -- one of several "
     "examples of excusable failure to withstand overwhelming pleasure "
     "or pain.",
     'Xenophantus', 'reference', 'person'),

    # --- Reference: Homeric and tragic figures ---
    ('hector', 'Hector',
     "Quoted twice from the Iliad: boasting that Polydamas will be the "
     "first to reproach him if he retreats, and warning that any "
     "soldier found cowering will not escape; also cited, via Priam's "
     "praise of him as \"more than mortal,\" as Aristotle's example of "
     "the superhuman, heroic virtue that stands opposite brutishness.",
     'Hector', 'reference', 'literary-figure'),
    ('priam', 'Priam',
     "The Trojan king, cited for his praise of Hector as godlike, and "
     "twice more as the example of a man whose great prosperity ended "
     "in the depths of misfortune in old age -- Aristotle's test case "
     "for whether such a life can still be called happy.",
     'Priam', 'reference', 'literary-figure'),
    ('diomedes', 'Diomedes',
     "The Greek hero, quoted from the Iliad boasting of what Hector "
     "will one day say of him (under his patronymic, \"Tydides\"), and "
     "cited for trading his golden armor for Glaucus's bronze -- "
     "Aristotle's example of a voluntary, not unjust, exchange. "
     "original-en spells the name \"Diomed,\" modern-en \"Diomedes\"; "
     "both, plus the patronymic \"Tydides,\" are aliased.",
     'Diomed|Diomedes|Tydides', 'reference', 'literary-figure'),
    ('polydamas', 'Polydamas',
     "Named in Hector's own boast, quoted from the Iliad, as the man "
     "who will be first to blame him if he retreats in disgrace.",
     'Polydamas', 'reference', 'literary-figure'),
    ('odysseus', 'Odysseus',
     "Cited three times: as the object of Calypso's advice to steer "
     "clear of a dangerous strait, and, under his Latin name Ulysses in "
     "original-en (Odysseus in modern-en), as the man who persuades "
     "Neoptolemus to lie in Sophocles' Philoctetes.",
     'Ulysses|Odysseus', 'reference', 'literary-figure'),
    ('calypso', 'Calypso',
     "The nymph of the Odyssey, cited for advising Odysseus to steer "
     "his ship clear of dangerous smoke and surge -- Aristotle's "
     "illustration of aiming away from whichever extreme is more "
     "dangerous, to be safely nearer the mean.",
     'Calypso', 'reference', 'literary-figure'),
    ('helen', 'Helen',
     "Cited via the old counsellors of Troy, who resolved to send her "
     "away despite her beauty -- Aristotle's model for how one should "
     "treat pleasure, as too dangerous a judge to trust.",
     'Helen', 'reference', 'literary-figure'),
    ('glaucus', 'Glaucus',
     "The Lycian ally of Troy, cited for trading his golden armor to "
     "Diomedes for bronze armor worth only a ninth as much -- "
     "Aristotle's example of a man who cannot be said to have been "
     "treated unjustly, since he gave his own property away freely.",
     'Glaucus', 'reference', 'literary-figure'),
    ('agamemnon', 'Agamemnon',
     "The commander of the Greek forces at Troy, cited via Homer's "
     "epithet for him, \"shepherd of the people\" -- Aristotle's "
     "illustration of the paternal, protective relationship a good king "
     "has toward his subjects.",
     'Agamemnon', 'reference', 'literary-figure'),
    ('thetis', 'Thetis',
     "The sea-goddess, mother of Achilles, cited via Homer for never "
     "mentioning to Zeus the favors she had done him -- Aristotle's "
     "example of how the great-minded man is pleased to recall the "
     "kindnesses he has done others but not those done to himself.",
     'Thetis', 'reference', 'literary-figure'),
    ('neoptolemus', 'Neoptolemus',
     "The son of Achilles, in Sophocles' Philoctetes, praised for "
     "breaking his promise to Odysseus (to deceive Philoctetes) rather "
     "than persist in a shameful lie -- Aristotle's example of a "
     "praiseworthy departure from a resolution.",
     'Neoptolemus', 'reference', 'literary-figure'),
    ('philoctetes', 'Philoctetes',
     "The wounded hero, the title figure of two separate lost or "
     "surviving tragedies cited in this book (Sophocles' and "
     "Theodectes'), whose agony from a viper's bite is Aristotle's "
     "example of pain severe enough to excuse a loss of self-control.",
     'Philoctetes', 'reference', 'literary-figure'),
    ('alcmaeon', 'Alcmaeon',
     "The matricide of Greek legend, cited via a lost play of "
     "Euripides in which he pleads compulsion for killing his mother -- "
     "Aristotle's example of an act for which no plea of compulsion "
     "should really be accepted.",
     'Alcmaeon', 'reference', 'literary-figure'),
    ('merope', 'Merope',
     "A tragic mother of legend who very nearly killed her own son, "
     "mistaking him for an enemy -- Aristotle's example of the kind of "
     "ignorance of a particular fact (who one is striking) that can "
     "make an action involuntary.",
     'Merope', 'reference', 'literary-figure'),
    ('niobe', 'Niobe',
     "The mythical queen who, in her excessive pride, quarreled even "
     "with the gods over her children -- Aristotle's example of a good "
     "and natural affection (love of one's children) carried to a "
     "blameworthy excess.",
     'Niobe', 'reference', 'literary-figure'),
    ('cercyon', 'Cercyon',
     "A character in Carcinus's lost tragedy Alope, cited alongside "
     "Philoctetes as an example of a man struggling, excusably, against "
     "overwhelming pain.",
     'Cercyon', 'reference', 'literary-figure'),
    ('rhadamanthus', 'Rhadamanthus',
     "The mythical judge of the underworld, cited for the maxim "
     "attributed to him, \"if a man should suffer what he hath done, "
     "then there would be straightforward justice\" -- a simple "
     "reciprocity Aristotle argues does not actually match either kind "
     "of particular justice he has defined. original-en uses only the "
     "adjective \"Rhadamanthian\" (rule); modern-en uses the bare "
     "possessive \"Rhadamanthus'\"; both are aliased.",
     'Rhadamanthian|Rhadamanthus', 'reference', 'literary-figure'),
    ('endymion', 'Endymion',
     "The youth of myth granted eternal sleep, cited as the image of "
     "utter inactivity: the gods cannot be imagined to \"sleep their "
     "time away like Endymion,\" since some kind of working, even if "
     "only contemplation, must belong to any living being.",
     'Endymion', 'reference', 'literary-figure'),

    # --- Reference: deities ---
    ('zeus', 'Zeus',
     "Cited or quoted four times: as the god to whom Thetis never "
     "mentioned her own kindnesses, in a quoted line from Euripides "
     "([Jove/Zeus] hates the meddlesome), as the title Homer gives to "
     "kingly paternal rule (\"Homer names Jupiter Father\"), and for the "
     "point that even Zeus does not receive every kind of sacrifice "
     "without distinction. original-en uses \"Jupiter\" and, once, "
     "\"Jove\"; modern-en uses \"Zeus\" throughout; all three are "
     "aliased.",
     'Jupiter|Jove|Zeus', 'reference', 'cultural-figure'),
    ('aphrodite', 'Aphrodite',
     "Quoted, via her epithet \"Cyprus-born goddess, weaver of "
     "deceits,\" as the example of a passion (lust) more insidious and "
     "therefore more disgraceful than open anger. original-en uses "
     "\"Venus,\" modern-en \"Aphrodite\"; both are aliased.",
     'Venus|Aphrodite', 'reference', 'cultural-figure'),

    # --- Reference: a named group of teachers, distinct from Protagoras ---
    ('sophists', 'the Sophists',
     "The professional teachers of rhetoric and argument, cited twice: "
     "for the practice of taking fees in advance and then failing to "
     "deliver on inflated promises, and, in the closing chapter, for "
     "claiming to teach statesmanship while never having produced a "
     "single actual statesman, confusing it with rhetoric, and treating "
     "legislation as a mere matter of compiling admired laws rather "
     "than a skill requiring practical judgment. modern-en capitalizes "
     "\"Sophists\" at its first occurrence but lowercases \"sophists\" "
     "at the other two (an internal inconsistency within that edition, "
     "not corrected here); both cases are aliased.",
     'Sophists|sophists', 'reference', 'group'),
]:
    add(*row)

editorial = dict(
    bookId='nicomachean-ethics',
    contentVersion='2026-09-12.1',
    entities=entities,
    coverage=(
        "57 entities, all Reference -- a lecture-course treatise per "
        "editorial policy's guidance ('cited thinkers normally remain "
        "references'), with no narrative or staged dialogue of its own "
        "and so no Central or Major entry; Aristotle himself is never "
        "named and gets no entry. No genuine namesake collision found "
        "despite the automation queue's caution that treatises can hide "
        "one (Hume's two Alexanders and two Catos): every recurring name "
        "(Homer, Socrates, Plato, Euripides, Heraclitus, Empedocles, "
        "Speusippus, Eudoxus, Phalaris, Theognis, Diomedes/Tydides) "
        "names the same person at every occurrence. Two named groups "
        "(the Pythagoreans, the Sophists) are bound as 'group' kind, "
        "distinct from individually-named members (Protagoras). Two "
        "'person or not' resolutions: 'Demus' (8, 66) is Aristotle's own "
        "technical term for a political subdivision, not a person; "
        "'Alope' (7, 68) is a play's title, not a character -- only "
        "Cercyon, the character within it, is bound. Edition-specific "
        "naming choices are aliased under one entity each: Ulysses/"
        "Odysseus, Jupiter+Jove/Zeus, Venus/Aphrodite, and "
        "original-en's own inconsistent Anexagoras/Anaxagoras spelling."
    ),
)

if __name__ == '__main__':
    out = Path(__file__).resolve().parent / 'editorial.json'
    out.write_text(json.dumps(editorial, indent=2, ensure_ascii=False) + '\n')
    print(f"Wrote {out} with {len(entities)} entities")
