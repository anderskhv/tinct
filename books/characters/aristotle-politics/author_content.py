"""Manually authored recognition copy for Aristotle's Politics.

Covers all eight Books in both English editions. A systematic treatise
citing lawgivers, tyrants, and named revolutions to make its argument --
per editorial policy's guidance for treatises, almost every entry is
Reference. Two entries are Major for sustained, argued-with engagement
across multiple Books rather than a single citation: Socrates and Plato,
whose Republic and Laws are the target of most of Book 2 and are
revisited in Books 4 and 7.

This translation (an older, Bekker/Jowett-apparatus edition surviving in
original-en as a Gutenberg scan) carries a serious, repeated source
defect: editorial footnotes, page headers, and cross-reference citations
("Cp. N. Eth. iv. i", "Bekker's 2nd ed.", running headers like "Sparta:
Inequality of Property") are bled directly into the running paragraph
text at dozens of points, and OCR has mangled a number of words (Bernays
-> "Beriiays"/"Beriiays", Diocles -> "Diodes", Bekker's -> "Btkker's").
modern-en, translated fresh from a clean source, does not carry this
contamination. Two consequences follow, both left as printed per the
hard constraint against editing edition files: (1) "Aristotle" appears
twice in original-en (7:39, 8:3) as a footnote annotator's own
third-person cross-reference to the author, not as Aristotle naming
himself in his own prose -- neither location is bound to any entity;
(2) at 5:59 the corrupted text drops the name "Sardanapalus" entirely
(the sentence that names him in modern-en survives only as a fragment
in original-en), so that entity is bound in modern-en only.

The book earns its own queue warning ("watch city-versus-person") many
times over. Nine genuine namesake collisions are resolved below, all but
two by location-scoped binding in build_aristotle_politics.py:

- **Dionysius** covers two tyrants of Syracuse, father and son: Dionysius
  I (1:41, 3:70, 5:19, 5:21, 5:29, 5:49, 5:67) and Dionysius II, named
  explicitly "the younger" at 5:59, whom Dion later expels (5:59, 5:61,
  5:63 x2).
- **Periander** covers two different tyrants: Periander of Corinth --
  named in full at 5:67, and identifiable everywhere else by the
  "cut off the tallest ears of corn" anecdote he shares with Thrasybulus
  of Miletus (3:54 x2, 5:52) or by the Cypselid dynasty list (5:75, 5:76)
  -- and Periander of Ambracia, named in full ("Periander, the tyrant of
  Ambracia") at 5:54, and identifiable by the city name in the same
  sentence at 5:15. Corinth's Periander carries the global alias
  "Periander"; Ambracia's two locations are excluded from it and bound
  separately.
- **Thrasybulus** covers two different men: Thrasybulus of Miletus, the
  tyrant who received Periander's corn-field advice (3:54 x2, 5:52), and
  Thrasybulus of Syracuse, Hiero's brother and successor as tyrant,
  driven out after eleven months (5:63, 5:76). Neither carries a global
  alias.
- **Pausanias** covers three different men, all bare "Pausanias" in the
  text: a Spartan king who tried to curb the ephors and was later
  accused of reaching for personal power (5:2, 7:57, both using the
  title "king Pausanias"); the regent who commanded at Plataea, named
  with the explicit epithet "general in the Persian War" (5:26); and the
  bodyguard who assassinated Philip of Macedon, identified by the
  surrounding Philip/Attalus narrative rather than an epithet (5:54).
  None carries a global alias.
- **Cleisthenes** covers two men, grandfather and grandson: Cleisthenes
  of Sicyon, the Orthagorid tyrant (5:74, 5:78, identifiable by the
  surrounding Sicyon narrative), and Cleisthenes of Athens, the
  democratic reformer (3:5, 6:11, identifiable by "at Athens" in the
  same sentence). Neither carries a global alias.
- **Timophanes** covers two different men: an otherwise unidentified
  wealthy citizen of Mitylene whose daughters occasion a revolution
  (5:14), and the Corinthian general who seized a tyranny with his
  mercenaries (5:22) -- the brother the celebrated liberator Timoleon
  later killed for it, though Aristotle does not name Timoleon here.
  Neither carries a global alias.
- **Amyntas**, **Chares**, and **Pheidon** are clean splits, not really
  collisions: each pair is distinguished by an epithet attached directly
  to one or both names ("Amyntas the little" vs. bare "Amyntas" at 5:54;
  "Chares" bare at 5:21 vs. "Chares the Parian" at 1:40; "Pheidon" bare
  at 5:49 vs. "Pheidon the Corinthian" at 2:22), so plain global aliases
  and longest-span-first resolve every mention correctly with no location
  scoping needed.
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
    # --- Major: Book 2's sustained target and its author ---
    ('socrates', 'Socrates',
     "As the speaker in Plato's Republic and Laws, the source of the "
     "community-of-women-and-property proposals that occupy most of "
     "Book 2's opening critique, and of the cyclical theory of "
     "constitutional change Aristotle rebuts at the close of Book 5.",
     'Socrates', 'major'),
    ('plato', 'Plato',
     "Author of the Republic and the Laws, whose proposed constitutions "
     "are examined at length in Book 2 and revisited in Books 4 and 7; "
     "cited by name as the author distinct from his speaker Socrates.",
     'Plato', 'major'),

    # --- Book 1 ---
    ('hesiod', 'Hesiod',
     "The early Greek poet, quoted for the line \"First house and wife "
     "and an ox for the plough.\"",
     'Hesiod'),
    ('charondas', 'Charondas',
     "The lawgiver of Catana, cited in Book 1 for a term he used for "
     "household members and, in Book 2, for the laws he gave his own "
     "and other Chalcidian cities in Italy and Sicily.",
     'Charondas'),
    ('epimenides-cretan', 'Epimenides the Cretan',
     "Cited for a term he used for household members, alongside "
     "Charondas.",
     'Epimenides the Cretan'),
    ('homer', 'Homer',
     "The poet, quoted repeatedly (Books 1, 3, 4) -- on the Cyclopes' "
     "households, on the \"tribeless, lawless, hearthless\" man outside "
     "the state, and on Agamemnon's power over Achilles.",
     'Homer'),
    ('solon', 'Solon',
     "The Athenian lawgiver, quoted in Book 1 on the limitlessness of "
     "wealth, and credited in Book 2 with laws against unlimited "
     "land ownership and with reshaping the Athenian constitution by "
     "opening the law courts to all citizens.",
     'Solon'),
    ('midas', 'Midas',
     "The legendary king whose golden touch is cited as an example of "
     "wealth that cannot feed a man.",
     'Midas'),
    ('theodectes', 'Theodectes',
     "The tragedian whose play Helen is quoted for a line about noble "
     "birth.",
     'Theodectes'),
    ('daedalus', 'Daedalus',
     "The legendary craftsman, whose self-moving statues are cited as "
     "an image of tools needing no servants to operate them.",
     'Daedalus'),
    ('hephaestus', 'Hephaestus',
     "The god of craftsmanship, whose self-moving tripods are cited "
     "alongside the statues of Daedalus as an image of tools needing no "
     "servants.",
     'Hephaestus', 'reference', 'cultural-figure'),
    ('amasis', 'Amasis',
     "The Egyptian king, whose saying about his footpan is cited as an "
     "example of ceremony distinguishing a ruler from his subjects.",
     'Amasis'),
    ('gorgias', 'Gorgias',
     "The rhetorician, cited in Book 1 for enumerating the virtues, and "
     "again in Book 3 (as \"Gorgias of Leontini\") for his ironic remark "
     "that citizens, like kettles, are manufactured by magistrates.",
     'Gorgias|Gorgias of Leontini'),
    ('chares-parian', 'Chares of Paros',
     "One of the writers on tillage and planting Aristotle cites. A "
     "different, unrelated \"Chares\" -- a political intermediary, not "
     "this agricultural writer -- appears later, in Book 5.",
     'Chares the Parian|Chares of Paros'),
    ('apollodorus-lemnos', 'Apollodorus of Lemnos',
     "One of the writers on tillage and planting Aristotle cites, "
     "alongside Chares of Paros.",
     'Apollodorus the Lemnian|Apollodorus of Lemnos'),
    ('thales-miletus', 'Thales',
     "The philosopher, cited for his olive-press monopoly, told as an "
     "anecdote about how philosophers could be rich if they chose. Book "
     "2 also reports (and calls chronologically inconsistent) a "
     "tradition making a \"Thales\" the teacher of Lycurgus and Zaleucus "
     "-- most likely the same figure invoked by a strained legendary "
     "genealogy rather than a second, unnamed person.",
     'Thales'),

    # --- Book 2 ---
    ('cleisthenes-athens', 'Cleisthenes of Athens',
     "The Athenian reformer who, after the expulsion of the tyrants, "
     "enrolled strangers, slaves, and resident aliens into new tribes "
     "(3:5) and later strengthened the democracy by similar measures "
     "(6:11). A different, unrelated Cleisthenes -- his maternal "
     "grandfather, the tyrant of Sicyon -- appears in Book 5.",
     '', 'reference'),
    ('pheidon-corinthian', 'Pheidon the Corinthian',
     "An ancient legislator credited with the view that the number of "
     "citizen families should remain fixed. A different, unrelated "
     "Pheidon -- a king of Argos who became a tyrant -- appears in Book "
     "5.",
     'Pheidon the Corinthian'),
    ('hippodamus', 'Hippodamus',
     "The son of Euryphon, of Miletus: inventor of the grid-plan city "
     "and layout of the Piraeus, and the first non-statesman to write on "
     "the ideal constitution -- his own three-class model occupies most "
     "of Book 2's discussion of him.",
     'Hippodamus'),
    ('lycurgus', 'Lycurgus',
     "The traditional lawgiver of Sparta, credited with its constitution "
     "and common meals, said to have studied the Cretan constitution "
     "during King Charilaus's minority.",
     'Lycurgus'),
    ('charilaus', 'Charilaus',
     "The Spartan king whose minority Lycurgus is said to have guarded "
     "before traveling to Crete (2:53). A later reference to \"the "
     "tyranny of Charilaus at Lacedaemon\" (5:78) is puzzling, since "
     "nothing elsewhere calls this legitimate king a tyrant; it is bound "
     "here as the same figure for lack of any textual signal of a "
     "second Charilaus, but the description does not obviously fit him.",
     'Charilaus'),
    ('minos', 'Minos',
     "The legendary king of Crete, credited with the laws still followed "
     "by its subject population and with Crete's naval empire; said to "
     "have died in Sicily. Cited again in Book 7 alongside Sesostris as "
     "an ancient founder of a warrior-versus-husbandmen class system.",
     'Minos'),
    ('ephialtes', 'Ephialtes',
     "The Athenian statesman who, with Pericles, curtailed the power of "
     "the Areopagus.",
     'Ephialtes'),
    ('pericles', 'Pericles',
     "The Athenian statesman who, with Ephialtes, curtailed the power of "
     "the Areopagus and instituted payment for jury service.",
     'Pericles'),
    ('zaleucus', 'Zaleucus',
     "The lawgiver who gave laws to the Epizephyrian Locrians.",
     'Zaleucus'),
    ('onomacritus', 'Onomacritus',
     "A Locrian by birth trained in Crete, sometimes credited (on "
     "chronologically dubious authority) as the first legislator with "
     "any special skill, and placed by that same tradition as Thales's "
     "teacher.",
     'Onomacritus'),
    ('philolaus-corinthian', 'Philolaus the Corinthian',
     "A Theban legislator of the Corinthian Bacchiad family, who left "
     "Corinth for Thebes out of horror at his mother Halcyone's "
     "incestuous passion for him, and there gave the Thebans their "
     "\"Laws of Adoption.\"",
     'Philolaus'),
    ('diocles-olympic-victor', 'Diocles',
     "The Olympic victor and lover of Philolaus, who left Corinth with "
     "him over the same scandal that drove Philolaus away. Original-en "
     "prints the OCR-mangled \"Diodes\"; both spellings are aliased and "
     "the error is left as printed.",
     'Diocles|Diodes'),
    ('halcyone', 'Halcyone',
     "Diocles's mother, whose incestuous passion for her son drove him "
     "and Philolaus from Corinth to Thebes.",
     'Halcyone'),
    ('draco', 'Draco',
     "The Athenian lawgiver, noted only for the severity of his "
     "penalties.",
     'Draco'),
    ('pittacus', 'Pittacus',
     "Elected leader (an aesymnetia, or elective tyranny) by the "
     "Mitylenaeans against exiles led by Antimenides and the poet "
     "Alcaeus; also cited as a lawgiver for a law doubling penalties for "
     "drunken violence.",
     'Pittacus'),
    ('antimenides', 'Antimenides',
     "One of the leaders of the exiles the Mitylenaeans elected Pittacus "
     "to oppose, named alongside the poet Alcaeus, his brother.",
     'Antimenides'),
    ('alcaeus-poet', 'Alcaeus',
     "The poet, one of the leaders of the exiles opposed to Pittacus, "
     "quoted denouncing his own city for making the low-born Pittacus "
     "tyrant.",
     'Alcaeus'),
    ('androdamas-rhegium', 'Androdamas of Rhegium',
     "Gave laws to the Chalcidians of Thrace, chiefly concerning "
     "homicide and heiresses.",
     'Androdamas of Rhegium'),
    ('phaleas-chalcedon', 'Phaleas of Chalcedon',
     "The first to propose that citizens of a state should have equal "
     "possessions; his equalization scheme and its limits occupy a long "
     "stretch of Book 2.",
     'Phaleas'),
    ('eubulus', 'Eubulus',
     "Talked Autophradates out of besieging Atarneus by pointing out the "
     "cost of the siege against the price of simply leaving.",
     'Eubulus'),
    ('autophradates', 'Autophradates',
     "The besieger of Atarneus whom Eubulus talked out of the siege.",
     'Autophradates'),
    ('diophantus', 'Diophantus',
     "Introduced the plan at Athens under which artisans engaged on "
     "public works are treated as public slaves.",
     'Diophantus'),

    # --- Book 3 ---
    ('jason-pherae', 'Jason',
     "Quoted for the remark that he \"felt hungry when he was not a "
     "tyrant\" -- unable to bear living as a private citizen.",
     'Jason'),
    ('euripides', 'Euripides',
     "The tragedian, quoted on the special education of princes (Book "
     "3), on living \"according to one's fancy\" as democratic license "
     "(Book 5), and elsewhere cited among those who scourged Decamnichus "
     "at Archelaus's court (Book 5).",
     'Euripides'),
    ('lycophron-sophist', 'Lycophron',
     "The sophist, quoted for defining law as merely \"a surety to one "
     "another of justice,\" a merely conventional guarantee rather than "
     "a maker of good citizens.",
     'Lycophron'),
    ('achilles', 'Achilles',
     "The Homeric hero, cited complaining of Agamemnon's treating him "
     "\"like some dishonoured stranger.\"",
     'Achilles', 'reference', 'cultural-figure'),
    ('agamemnon', 'Agamemnon',
     "The Homeric king, cited both for dishonouring Achilles and, "
     "elsewhere, for his prayer wishing for ten wise counsellors.",
     'Agamemnon', 'reference', 'cultural-figure'),
    ('antisthenes', 'Antisthenes',
     "The Cynic philosopher, whose fable of the lions and the hares -- "
     "\"where are your claws?\" -- is cited against demands for equality "
     "from the unequal.",
     'Antisthenes'),
    ('heracles', 'Heracles',
     "The legendary hero, said in myth to have been left behind by the "
     "Argonauts for fear he would overpower the rest of the crew -- an "
     "image for ostracism.",
     'Heracles', 'reference', 'cultural-figure'),
    ('periander-corinth', 'Periander of Corinth',
     "The tyrant of Corinth, son of Cypselus, named in full at 5:67 as "
     "\"the great master\" of the arts of tyranny; identifiable "
     "elsewhere by the corn-field anecdote he shares with Thrasybulus of "
     "Miletus (3:54, 5:52) and by the Cypselid dynasty's reign lengths "
     "(5:75, 5:76, forty-four years, ending in 5:76's note that he was "
     "\"a great soldier\"). A different, unrelated Periander -- the "
     "tyrant of Ambracia -- is named in full elsewhere in Book 5.",
     'Periander'),
    ('thrasybulus-miletus', 'Thrasybulus of Miletus',
     "The tyrant of Miletus who received, via a herald, Periander of "
     "Corinth's wordless advice to cut down the tallest ears of corn -- "
     "meaning the leading citizens. A different, unrelated Thrasybulus "
     "-- Hiero's brother and successor as tyrant of Syracuse -- appears "
     "later in Book 5.",
     '', 'reference'),
    ('dionysius-i', 'Dionysius I',
     "The tyrant of Syracuse, cited repeatedly across Books 1, 3, and 5: "
     "asking the Syracusans for a bodyguard as his first step to power "
     "(3:70), rising by denouncing the rich (5:19), installed by "
     "Hipparinus (5:21), the Locrian marriage connection blamed for "
     "ruining that city (5:29), grouped among demagogues-turned-tyrant "
     "(5:49), and taxing his subjects into poverty within five years "
     "(5:67). His son and successor, Dionysius II, is a different, "
     "explicitly \"younger\" Dionysius named later in Book 5.",
     '', 'reference'),

    # --- Book 4 ---
    ('phocylides', 'Phocylides',
     "The gnomic poet, quoted praying for a middling competence.",
     'Phocylides'),
    ('telecles-milesian', 'Telecles the Milesian',
     "Cited for a constitution in which citizens deliberate by turns "
     "rather than as a single body.",
     'Telecles the Milesian'),

    # --- Book 5 ---
    ('lysander', 'Lysander',
     "The Spartan, said to have attempted to overthrow the Spartan "
     "monarchy.",
     'Lysander'),
    ('king-pausanias', 'Pausanias (Spartan king)',
     "A king of Sparta who attempted to overthrow the ephoralty (5:2) "
     "and whom the Lacedaemonians later accused of trying to seize "
     "personal power in the state (7:57, both places naming him "
     "explicitly as \"king\"). Two different, unrelated men also named "
     "Pausanias appear elsewhere in Book 5: the regent who commanded at "
     "Plataea, and Philip of Macedon's assassin.",
     '', 'reference'),
    ('gelo', 'Gelo',
     "The tyrant of Syracuse whose rise followed a period of democratic "
     "disorder there; his and his brother Hiero's dynasty is cited as "
     "the longest-lasting Syracusan tyranny, and its fall into a tyranny "
     "\"distributed\" among the family is discussed alongside Dionysius "
     "II's fall.",
     'Gelo'),
    ('cleomenes-lacedaemonian', 'Cleomenes',
     "The Lacedaemonian king whose defeat of the Argives in the "
     "\"Battle of the Seventh Day\" forced Argos to admit some of its "
     "subject population to citizenship.",
     'Cleomenes the Lacedaemonian|Cleomenes'),
    ('heracleodorus', 'Heracleodorus',
     "His accession to office at Oreum overthrew the oligarchy there and "
     "changed it into a constitutional, democratic government.",
     'Heracleodorus'),
    ('paches', 'Paches',
     "The Athenian who took Mitylene in the war that followed a dispute "
     "there about heiresses.",
     'Paches'),
    ('timophanes-mitylene', 'Timophanes (Mitylene)',
     "A wealthy citizen of Mitylene whose two daughters, sought by "
     "Doxander for his own sons and refused, occasioned a revolution. A "
     "different, unrelated Timophanes -- the Corinthian general who "
     "seized a tyranny -- appears later in Book 5.",
     '', 'reference'),
    ('doxander', 'Doxander',
     "Wanted Timophanes's daughters for his sons; rejected, he stirred "
     "up revolution and, as Athenian proxenus, drew in Athenian "
     "interference at Mitylene.",
     'Doxander'),
    ('mnaseas', 'Mnaseas',
     "The father of Mnason, on one side of the Phocian heiress dispute "
     "that began the Sacred War.",
     'Mnaseas'),
    ('mnason', 'Mnason',
     "The son of Mnaseas, on one side of the Phocian heiress dispute "
     "that began the Sacred War.",
     'Mnason'),
    ('euthycrates', 'Euthycrates',
     "The father of Onomarchus, on the other side of the Phocian "
     "heiress dispute that began the Sacred War.",
     'Euthycrates'),
    ('onomarchus', 'Onomarchus',
     "The son of Euthycrates, on the other side of the Phocian heiress "
     "dispute that began the Sacred War.",
     'Onomarchus'),
    ('phoxus-chalcis', 'Phoxus',
     "The tyrant of Chalcis, killed by the people acting together with "
     "the notables, who then seized the government for themselves.",
     'Phoxus'),
    ('peisistratus', 'Peisistratus',
     "The Athenian tyrant, who rose by leading a faction against the men "
     "of the plain; his rule and his sons' (the Peisistratidae) is "
     "cited repeatedly as an example of both tyranny's origins and its "
     "fall, and, in one anecdote, of a tyrant submitting to trial before "
     "the Areopagus.",
     'Peisistratus'),
    ('peisistratidae', 'The Peisistratidae',
     "Peisistratus's family and dynasty at Athens, whose downfall -- "
     "provoked by the insult to Harmodius's sister -- and whose "
     "building projects (the temple of Olympian Zeus) are both cited.",
     'Peisistratidae', 'reference', 'family'),
    ('theagenes-megara', 'Theagenes',
     "The tyrant of Megara, who won popular favour by slaughtering the "
     "cattle of the wealthy.",
     'Theagenes'),
    ('daphnaeus', 'Daphnaeus',
     "One of the rich men whose denunciation by Dionysius I won him the "
     "people's confidence on his way to tyranny.",
     'Daphnaeus'),
    ('lygdamis-naxos', 'Lygdamis',
     "A member of the oligarchy at Naxos who championed the oppressed "
     "people and afterward became tyrant himself.",
     'Lygdamis'),
    ('basilidae', 'The Basilidae',
     "The family that ruled Erythrae well but was eventually deposed "
     "for the narrowness of its oligarchy.",
     'Basilidae', 'reference', 'family'),
    ('charicles', 'Charicles',
     "Led the dominant faction among the Thirty at Athens, an example of "
     "a demagogue operating within a small oligarchy.",
     'Charicles'),
    ('phrynichus', 'Phrynichus',
     "Led the dominant faction among the Four Hundred at Athens, an "
     "example of a demagogue operating within a small oligarchy.",
     'Phrynichus'),
    ('simos-larissa', 'Simos',
     "Held the government at Larissa along with the Aleuadae family.",
     'Simos'),
    ('aleuadae', 'The Aleuadae',
     "The ruling family of Larissa, who held the government there "
     "alongside Simos.",
     'Aleuadae', 'reference', 'family'),
    ('iphiades', 'Iphiades',
     "Associated with the political clubs that held power at Abydos.",
     'Iphiades'),
    ('cleotimus', 'Cleotimus',
     "Introduced Chalcidian colonists at Amphipolis and then stirred "
     "them up against the rich.",
     'Cleotimus'),
    ('hipparinus', 'Hipparinus',
     "Installed Dionysius I as tyrant at Syracuse.",
     'Hipparinus'),
    ('chares-general', 'Chares',
     "A political intermediary whose negotiation at Aegina became the "
     "occasion for an attempt to revolutionize the state there -- almost "
     "certainly the well-known Athenian general and mercenary "
     "commander, though the text gives no epithet to confirm it. A "
     "different, unrelated \"Chares of Paros,\" an agricultural writer, "
     "is named in full in Book 1.",
     'Chares'),
    ('timophanes-corinth', 'Timophanes (Corinth)',
     "The Corinthian general who, given command of mercenaries, made "
     "himself tyrant -- the brother the celebrated liberator Timoleon "
     "later killed for it, though Aristotle does not name Timoleon here. "
     "A different, unrelated Timophanes -- an ordinary wealthy citizen "
     "of Mitylene -- appears earlier in Book 5.",
     '', 'reference'),
    ('diagoras-eretria', 'Diagoras',
     "Overturned the oligarchy of the knights at Eretria after being "
     "wronged in a marriage dispute.",
     'Diagoras'),
    ('eurytion', 'Eurytion',
     "Punished at Heraclea on a charge of adultery in a judgment "
     "executed in a spirit of party rather than justice, provoking "
     "revolution.",
     'Eurytion'),
    ('archias-thebes', 'Archias',
     "Punished at Thebes on a charge of adultery in a judgment executed "
     "in a spirit of party rather than justice, provoking revolution.",
     'Archias'),
    ('partheniae', 'The Partheniae',
     "The illegitimate sons of the Spartan peers, who attempted a "
     "revolution at Sparta and, once detected, were sent away to "
     "colonize Tarentum.",
     'Partheniae', 'reference', 'group'),
    ('cinadon', 'Cinadon',
     "A brave man excluded from Sparta's honours, who conspired against "
     "the Spartans under Agesilaus.",
     'Cinadon'),
    ('agesilaus', 'Agesilaus',
     "The Spartan king under whom Cinadon conspired against the "
     "Spartans.",
     'Agesilaus'),
    ('tyrtaeus', 'Tyrtaeus',
     "The poet whose \"Good Order\" is cited as evidence that citizens "
     "ruined by the Messenian War wanted a redistribution of land.",
     'Tyrtaeus'),
    ('pausanias-regent', 'Pausanias (the regent)',
     "Named as \"general in the Persian War,\" cited as an example of an "
     "individual great enough to want to rule alone. Two different, "
     "unrelated men also named Pausanias appear elsewhere in Book 5: a "
     "Spartan king, and Philip of Macedon's assassin.",
     '', 'reference'),
    ('hanno-carthage', 'Hanno',
     "A Carthaginian, cited alongside Pausanias as an example of an "
     "individual great enough to want to rule alone.",
     'Hanno'),
    ('codrus', 'Codrus',
     "Cited as a king who prevented his state from being enslaved in "
     "war, an example of royalty earned by benefiting one's people.",
     'Codrus'),
    ('cyrus-great', 'Cyrus',
     "Cyrus the Great, cited as a king who gave his country freedom "
     "(5:50), and again as an example of a general who successfully "
     "attacked a monarch he despised -- his grandfather Astyages, whose "
     "power he judged worn out by soft living (5:59).",
     'Cyrus'),
    ('pheidon-argos', 'Pheidon',
     "A king of Argos who became a tyrant, cited among rulers who "
     "extended hereditary power into outright tyranny. A different, "
     "unrelated Pheidon -- an ancient legislator -- is named in full "
     "(\"Pheidon the Corinthian\") in Book 2.",
     'Pheidon'),
    ('phalaris', 'Phalaris',
     "The tyrant of Acragas, cited as an example of a tyrant who rose "
     "from holding a great office rather than from being a demagogue.",
     'Phalaris'),
    ('panaetius-leontini', 'Panaetius',
     "Rose from demagogue to tyrant at Leontini; later cited again as an "
     "example of an oligarchy that changed directly into a tyranny.",
     'Panaetius'),
    ('cypselus', 'Cypselus',
     "The tyrant of Corinth and father of Periander, who rose as a "
     "demagogue, ruled without ever needing a bodyguard, and founded the "
     "Cypselid dynasty (thirty years' reign, then Periander's "
     "forty-four); his family's costly public offerings are cited as a "
     "device for keeping subjects poor and occupied.",
     'Cypselus'),
    ('harmodius', 'Harmodius',
     "The public dishonour of his sister, and the insult to himself, "
     "provoked the attack on the Peisistratidae that he and Aristogeiton "
     "carried out.",
     'Harmodius'),
    ('aristogeiton', 'Aristogeiton',
     "Joined Harmodius in the attack on the Peisistratidae, for "
     "Harmodius's sake.",
     'Aristogeiton'),
    ('periander-ambracia', 'Periander of Ambracia',
     "The tyrant of Ambracia, expelled by the people acting with "
     "conspirators (5:15) and named in full (\"Periander, the tyrant of "
     "Ambracia\") as the target of a conspiracy provoked by an obscene "
     "question he asked a favourite youth (5:54). A different, "
     "unrelated Periander -- the tyrant of Corinth -- is Book 5's other, "
     "far more frequently cited Periander.",
     '', 'reference'),
    ('philip-macedon', 'Philip',
     "Philip II of Macedon, attacked by his own guard Pausanias after "
     "being permitted to suffer an insult from Attalus and his friends.",
     'Philip'),
    ('pausanias-assassin', 'Pausanias (assassin of Philip)',
     "Attacked Philip of Macedon after being permitted to suffer an "
     "insult from Attalus and his friends -- the historical assassin of "
     "Philip II, identified here by the surrounding narrative rather "
     "than an epithet. Two different, unrelated men also named "
     "Pausanias appear elsewhere in Book 5: a Spartan king, and the "
     "regent who commanded at Plataea.",
     '', 'reference'),
    ('attalus', 'Attalus',
     "Insulted Pausanias, with the friends who joined him, provoking the "
     "attack on Philip of Macedon.",
     'Attalus'),
    ('amyntas-little', 'Amyntas the Little',
     "Attacked by Derdas after boasting of having enjoyed Derdas's "
     "youth. A different, unrelated Amyntas -- Archelaus's own son -- "
     "is named later in the same passage.",
     'Amyntas the little|Amyntas the Little'),
    ('derdas', 'Derdas',
     "Attacked Amyntas the Little after being boasted of.",
     'Derdas'),
    ('evagoras-cyprus', 'Evagoras',
     "The king of Cyprus, slain by a eunuch avenging the eunuch's wife, "
     "whom Evagoras's own son had carried off.",
     'Evagoras of Cyprus|Evagoras'),
    ('crataeus', 'Crataeus',
     "Attacked and killed Archelaus, ostensibly over a broken marriage "
     "promise involving Archelaus's daughters, though Aristotle judges "
     "the real cause was Crataeus's disgust at their intimate "
     "connection.",
     'Crataeus'),
    ('archelaus-macedon', 'Archelaus',
     "The Macedonian king killed by Crataeus; the subject of several "
     "further conspiracies recounted in Book 5 (Hellanocrates, "
     "Decamnichus) arising from broken promises and personal insults.",
     'Archelaus'),
    ('sirrhas', 'Sirrhas',
     "The enemy Archelaus was fighting when he married his elder "
     "daughter to the king of Elymaea for military support.",
     'Sirrhas'),
    ('arrhibaeus', 'Arrhibaeus',
     "Named alongside Sirrhas as an enemy Archelaus was fighting when he "
     "married his elder daughter to the king of Elymaea for military "
     "support.",
     'Arrhibaeus'),
    ('amyntas-son-of-archelaus', 'Amyntas (son of Archelaus)',
     "Archelaus's own son, married to Archelaus's younger daughter in "
     "hope of avoiding a quarrel with the son of Cleopatra. A different, "
     "unrelated Amyntas the Little is named earlier in the same "
     "passage.",
     '', 'reference'),
    ('cleopatra-macedon', 'Cleopatra',
     "A Macedonian royal woman, mother of the son Archelaus hoped to "
     "keep from quarrelling with his own son Amyntas -- not the later, "
     "far better-known queen of Egypt.",
     'Cleopatra'),
    ('hellanocrates-larissa', 'Hellanocrates of Larissa',
     "Archelaus's lover, who conspired against him after Archelaus "
     "failed to keep his promise of restoring him to his own country.",
     'Hellanocrates of Larissa'),
    ('parrhon', 'Parrhon',
     "Killed Cotys with Heracleides of Aenos to avenge their father.",
     'Parrhon'),
    ('heracleides-aenos', 'Heracleides of Aenos',
     "Killed Cotys with Parrhon to avenge their father.",
     'Heracleides of Aenos'),
    ('cotys-thrace', 'Cotys',
     "The Thracian king killed by Parrhon and Heracleides of Aenos in "
     "revenge for their father, and mutilated Adamas as a child, "
     "provoking Adamas's own later revolt.",
     'Cotys'),
    ('adamas', 'Adamas',
     "Revolted from Cotys in revenge for being mutilated by him as a "
     "child.",
     'Adamas'),
    ('megacles-mitylene', 'Megacles',
     "Attacked and killed the Penthalidae at Mitylene with his friends, "
     "after they had gone about the city assaulting people with clubs.",
     'Megacles'),
    ('penthalidae', 'The Penthalidae',
     "A ruling clan at Mitylene, killed by Megacles and his friends "
     "after going about assaulting people with clubs.",
     'Penthalidae', 'reference', 'family'),
    ('smerdis', 'Smerdis',
     "Beaten and torn from his wife by Penthilus, whom he later killed "
     "in revenge.",
     'Smerdis'),
    ('penthilus', 'Penthilus',
     "Beat Smerdis and tore him from his wife, and was later killed by "
     "him in revenge.",
     'Penthilus'),
    ('decamnichus', 'Decamnichus',
     "Led the assassins in the conspiracy against Archelaus, enraged "
     "after Archelaus handed him over to Euripides to be scourged for "
     "a remark about the poet's bad breath.",
     'Decamnichus'),
    ('artapanes', 'Artapanes',
     "Conspired against and killed Xerxes, fearing he would be blamed "
     "for hanging Darius without orders.",
     'Artapanes'),
    ('xerxes', 'Xerxes',
     "The Persian king, killed by Artapanes; also cited among rulers "
     "whose empires the Persian king (an earlier, unnamed reference) "
     "crushed rebellious former subjects.",
     'Xerxes'),
    ('darius-son-of-xerxes', 'Darius',
     "Hanged, apparently on Artapanes's own initiative rather than "
     "Xerxes's orders -- probably Xerxes's own son of this name, "
     "distinct from Darius I \"the Great.\"",
     'Darius'),
    ('sardanapalus', 'Sardanapalus',
     "The legendary Assyrian king, slain by a courtier who saw him "
     "carding wool among his women -- an example of contempt as a "
     "motive for conspiracy. Named only in modern-en; original-en's "
     "text is corrupted at this point and never supplies the name (see "
     "the package README).",
     'Sardanapalus'),
    ('dion', 'Dion',
     "Attacked and expelled his own relative Dionysius II out of "
     "contempt for his drunkenness, landing with only a small force on "
     "the principle that even a quick death would be an honourable "
     "risk.",
     'Dion'),
    ('dionysius-ii', 'Dionysius II',
     "Dionysius I's son and successor as tyrant of Syracuse, explicitly "
     "called \"the younger Dionysius,\" attacked out of contempt and "
     "then expelled by his own relative Dion.",
     '', 'reference'),
    ('astyages', 'Astyages',
     "Cyrus's grandfather and the Median king Cyrus overthrew, his power "
     "judged worn out by an effeminate life.",
     'Astyages'),
    ('seuthes-thracian', 'Seuthes',
     "A Thracian who conspired against Amadocus, the ruler whose general "
     "he was.",
     'Seuthes the Thracian|Seuthes'),
    ('amadocus', 'Amadocus',
     "The Thracian ruler against whom his own general Seuthes "
     "conspired.",
     'Amadocus'),
    ('mithridates', 'Mithridates',
     "Conspired against Ariobarzanes out of a mix of contempt and love "
     "of gain.",
     'Mithridates'),
    ('ariobarzanes', 'Ariobarzanes',
     "The ruler against whom his own subordinate Mithridates conspired.",
     'Ariobarzanes'),
    ('theopompus', 'Theopompus',
     "The Spartan king who further limited royal power (chiefly by "
     "establishing the Ephoralty), reasoning that a reduced but more "
     "durable kingship was a better inheritance for his sons than a "
     "greater but less secure one.",
     'Theopompus'),
    ('hiero', 'Hiero',
     "Gelo's brother and successor as tyrant of Syracuse, whose spies "
     "and informers are cited as a model of tyrannical surveillance; "
     "succeeded in turn by his own brother Thrasybulus.",
     'Hiero'),
    ('thrasybulus-syracuse', 'Thrasybulus (Syracuse)',
     "Hiero's brother, who flattered Gelo's son into excess in order to "
     "rule through him, provoking the family conspiracy that ended the "
     "dynasty (5:63); he later succeeded Hiero as tyrant in his own "
     "right, only to be driven out within eleven months (5:76). A "
     "different, unrelated Thrasybulus of Miletus is Book 5's other, far "
     "more frequently cited Thrasybulus.",
     '', 'reference'),
    ('myron-sicyon', 'Myron',
     "The tyrant of Sicyon whose rule gave way to that of Cleisthenes of "
     "Sicyon.",
     'Myron'),
    ('cleisthenes-sicyon', 'Cleisthenes of Sicyon',
     "The Orthagorid tyrant of Sicyon, respected for his military "
     "ability and said to have crowned the judge who ruled against him "
     "in the games. His rule followed Myron's (5:78) within the "
     "century-long Orthagorid tyranny (5:74). A different, unrelated "
     "Cleisthenes -- his own grandson, the Athenian democratic reformer "
     "-- appears in Books 3 and 6.",
     '', 'reference'),
    ('antileon-chalcis', 'Antileon',
     "His tyranny at Chalcis is cited as an example of a tyranny "
     "changing into an oligarchy.",
     'Antileon'),
    ('cleander-gela', 'Cleander',
     "His tyranny at Gela is cited as an example of an oligarchy "
     "changing into a tyranny.",
     'Cleander'),
    ('anaxilaus-rhegium', 'Anaxilaus',
     "His tyranny at Rhegium is cited as an example of an oligarchy "
     "changing into a tyranny.",
     'Anaxilaus'),
    ('orthagoras', 'Orthagoras',
     "Founder of the century-long Orthagorid tyranny at Sicyon, the "
     "longest-lasting of all -- attributed to the family's moderation "
     "and general observance of the laws.",
     'Orthagoras'),
    ('cypselidae', 'The Cypselidae',
     "The tyrant dynasty of Corinth founded by Cypselus, lasting "
     "seventy-three and a half years across Cypselus, Periander, and "
     "Psammetichus.",
     'Cypselidae', 'reference', 'family'),
    ('psammetichus-corinth', 'Psammetichus',
     "Son of Gordius, the third and last of the Cypselid tyrants of "
     "Corinth, reigning three years after Periander.",
     'Psammetichus'),

    # --- Book 6 ---
    ('oxylus', 'Oxylus',
     "Credited with an early law forbidding a man to borrow against a "
     "fixed portion of his property.",
     'Oxylus'),

    # --- Book 7 ---
    ('archilochus', 'Archilochus',
     "The poet, cited on the pleasures of leisure that follow the toil "
     "of war.",
     'Archilochus'),
    ('hippocrates-physician', 'Hippocrates',
     "The physician, cited as an example of a kind of \"greatness\" -- "
     "excellence in one's function -- that has nothing to do with "
     "physical size.",
     'Hippocrates'),
    ('stentor', 'Stentor',
     "The Homeric herald proverbial for a loud voice, invoked as a "
     "comparison for what statesmen wanting only more citizens would "
     "need.",
     'Stentor', 'reference', 'cultural-figure'),
    ('sesostris', 'Sesostris',
     "The legendary Egyptian king credited with founding the "
     "warrior-versus-husbandmen class system later found in Egypt and "
     "Crete.",
     'Sesostris'),
    ('italus', 'Italus',
     "The legendary king of Oenotria after whom Italy is said to be "
     "named; credited with converting the Oenotrians from shepherds to "
     "husbandmen and founding their common meals.",
     'Italus'),
    ('scylax', 'Scylax',
     "Cited for his claim that Indian kings hold no marked superiority "
     "over their subjects.",
     'Scylax'),
    ('thibron', 'Thibron',
     "Among the writers on the Spartan constitution who praised its "
     "legislator for the power hard training won the Lacedaemonians.",
     'Thibron'),
    ('theodorus-tragic-actor', 'Theodorus',
     "The tragic actor, who would not let any other actor -- however "
     "minor -- perform before him, since audiences grow fond of the "
     "first voice they hear.",
     'Theodorus'),

    # --- Book 8 ---
    ('odysseus', 'Odysseus',
     "The Homeric hero, quoted on the pleasure of a banquet with music.",
     'Odysseus', 'reference', 'cultural-figure'),
    ('musaeus', 'Musaeus',
     "The legendary poet, quoted on song as one of the pleasantest "
     "things.",
     'Musaeus'),
    ('olympus-musician', 'Olympus',
     "A musician (or composer) whose melodies are cited as proof that "
     "music can inspire real enthusiasm and moral feeling.",
     'Olympus'),
    ('pauson', 'Pauson',
     "A painter whose work young men should not be encouraged to look "
     "at, contrasted unfavourably with Polygnotus.",
     'Pauson'),
    ('polygnotus', 'Polygnotus',
     "A painter praised for expressing moral character in his work, "
     "contrasted favourably with Pauson.",
     'Polygnotus'),
    ('archytas', 'Archytas',
     "Credited with inventing the child's rattle -- a toy for the infant "
     "mind, as musical education is a toy for children of a larger "
     "growth.",
     'Archytas'),
    ('philoxenus', 'Philoxenus',
     "A dithyrambic poet who, having tried to compose his Tales in the "
     "Dorian mode, found it impossible and fell back into the more "
     "suitable Phrygian.",
     'Philoxenus'),
    ('thrasippus', 'Thrasippus',
     "Dedicated a tablet commemorating his sponsorship of a chorus for "
     "Ecphantides, cited as evidence of the flute's popularity at "
     "Athens.",
     'Thrasippus'),
    ('ecphantides', 'Ecphantides',
     "The Old Comedy poet for whom Thrasippus furnished a chorus.",
     'Ecphantides'),
    ('athene', 'Athene',
     "The goddess, said in myth to have invented the flute and then "
     "thrown it away, on the reasoning (Aristotle's own gloss) that "
     "flute-playing contributes nothing to the mind.",
     'Athene', 'reference', 'cultural-figure'),
]:
    add(*row)

path = Path(__file__).resolve().parent / 'editorial.json'
path.write_text(json.dumps(dict(
    bookId='aristotle-politics',
    contentVersion='2026-09-12.1',
    coverage=(
        'All eight Books in both English editions. A systematic treatise, '
        'not a dialogue -- per editorial policy\'s guidance for treatises, '
        'almost every entry is Reference. Two entries are Major for '
        'sustained, argued-with engagement across multiple Books: Socrates '
        'and Plato, the target of most of Book 2. Nine genuine namesake '
        'collisions (Dionysius, Periander, Thrasybulus, Pausanias x3, '
        'Cleisthenes, Timophanes, plus the clean epithet-resolved splits '
        'Amyntas/Chares/Pheidon) are resolved in build_aristotle_politics.py '
        'and documented in README.md, alongside a serious source defect: '
        'original-en\'s Gutenberg/Bekker-apparatus text bleeds editorial '
        'footnotes and page headers into the running prose at many points, '
        'accounting for the two "Aristotle" self-citations excluded as '
        'apparatus and the one entity (Sardanapalus) present in modern-en '
        'only.'
    ),
    entities=entities,
), indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
print(f'Wrote {len(entities)} entities to {path}')

ids = [e['id'] for e in entities]
assert len(ids) == len(set(ids)), 'duplicate entity ids'
