"""The Republic — entity declarations for build_generic.py.

Existing bodies (socrates through niceratus, the-guardians, the-den,
philosopher-kings) are carried over verbatim from the previously released
13-card package. New entries close gaps found in a full-text name audit:
named interlocutors and relatives in the Book I household scene, the
Leontius anecdote (Book IV), the Er myth cast (Book X), and a corrected
split of the person Gyges from the ring/thought-experiment object he is
attached to (previously conflated under one 'ring-of-gyges' personification
card, which caused the Gyges name in Book II to render ring-thought-
experiment copy before the ring is even introduced in the same paragraph).
"""

BOOK_ID = 'the-republic'
LANGUAGE = 'en'
CONTENT_VERSION = 2
EDITIONS = ['original-en', 'modern-en']

ENTITIES = [
    {
        'id': 'socrates', 'kind': 'person', 'storyRole': 'central',
        'aliases': ['Socrates'],
        'subtitle': '',
        'body': "The philosopher who narrates and drives the entire dialogue, drawn into a discussion of justice at the house of the elderly Cephalus. His questioning method gradually pushes the conversation from a simple definition of justice toward the design of an ideal city.",
    },
    {
        'id': 'glaucon', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Glaucon'],
        'subtitle': '',
        'body': "Plato's brother, an ambitious and combative young man who presses Socrates to defend justice against the strongest possible case for injustice. Much of the dialogue's construction of the ideal city is addressed directly to him.",
    },
    {
        'id': 'adeimantus', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Adeimantus'],
        'subtitle': '',
        'body': "Another of Plato's brothers, more measured than Glaucon but no less serious about the challenge he poses to Socrates. He reinforces Glaucon's demand that justice be shown worth choosing for its own sake.",
    },
    {
        'id': 'thrasymachus', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Thrasymachus'],
        'subtitle': '',
        'body': "A sophist from Chalcedon who bursts into the conversation to argue, forcefully and with open contempt for his companions, that justice is simply whatever serves the interest of the stronger. His confrontation with Socrates sets the terms the rest of the dialogue must answer.",
    },
    {
        'id': 'polemarchus', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Polemarchus'],
        'subtitle': '',
        'body': "Son of Cephalus and host of the household where the conversation takes place. He inherits his father's argument about justice once the older man withdraws from the discussion.",
    },
    {
        'id': 'cephalus', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Cephalus'],
        'subtitle': '',
        'body': "A wealthy elderly resident of the Piraeus, in whose house the dialogue opens. His own reflections on old age and honesty give the conversation its first, simple definition of justice before he retires from the discussion.",
    },
    {
        'id': 'cleitophon', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Cleitophon'],
        'subtitle': '',
        'body': "A companion of Thrasymachus who briefly speaks up in his support during the argument over justice's definition. He appears only in passing before the sophist takes over the argument himself.",
    },
    {
        'id': 'lysias', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Lysias'],
        'subtitle': '',
        'body': "An orator and one of Cephalus's sons, mentioned as present in the house at the dialogue's opening. He does not take part in the philosophical discussion himself.",
    },
    {
        'id': 'niceratus', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Niceratus'],
        'subtitle': '',
        'body': "Son of the Athenian general Nicias, named among the young men gathered at Cephalus's house for the conversation. Like several others present, he is a listener rather than a speaker in the recorded dialogue.",
    },
    {
        'id': 'the-guardians', 'kind': 'personification', 'storyRole': 'major',
        'aliases': ['guardians'],
        'subtitle': '',
        'body': "The class of rulers and defenders Socrates proposes for his ideal city, bred and educated from youth for wisdom, courage, and complete devotion to the common good. Their strict upbringing and shared way of life are meant to keep private interest from ever overriding the city's.",
    },
    {
        'id': 'the-den', 'kind': 'personification', 'storyRole': 'major',
        'aliases': ['den'],
        'subtitle': '',
        'body': "Socrates's image of prisoners chained since childhood in an underground cave, mistaking shadows on a wall for the whole of reality. Their difficult ascent toward the light outside stands for the philosopher's own long education toward the truth.",
    },
    {
        'id': 'philosopher-kings', 'kind': 'personification', 'storyRole': 'major',
        'aliases': ['philosopher kings', 'philosophers become kings'],
        'subtitle': '',
        'body': "Socrates's proposal that the ideal city can only be realized if philosophers become its rulers, or its rulers take up philosophy in earnest. The idea is presented as a paradox even Socrates expects his listeners to resist.",
    },
    # -- New: Book I household scene --
    {
        'id': 'euthydemus-brother', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Euthydemus'],
        'subtitle': '',
        'body': "Another of Cephalus's sons and a brother of Polemarchus and Lysias, named among those present when the conversation begins. He is not recorded speaking in the dialogue.",
    },
    {
        'id': 'charmantides', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Charmantides'],
        'subtitle': '',
        'body': "A guest from Paeania named among the company gathered at Cephalus's house at the start of the dialogue. He takes no recorded part in the discussion.",
    },
    {
        'id': 'aristonymus', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Aristonymus'],
        'subtitle': '',
        'body': "Named only as the father of Cleitophon in the roll call of guests at Cephalus's house. He does not appear in the dialogue himself.",
    },
    {
        'id': 'ariston', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Ariston'],
        'subtitle': '',
        'body': "The father of Glaucon and Adeimantus (and, historically, of Plato himself), named in the dialogue only through the patronymic used to introduce his sons. He does not appear as a speaker.",
    },
    {
        'id': 'lysanias', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Lysanias'],
        'subtitle': '',
        'body': "Cephalus's father, mentioned when Cephalus contrasts his own management of the family estate with his father's and grandfather's. He does not appear as a speaker.",
    },
    # -- New: Leontius anecdote (Book IV) --
    {
        'id': 'leontius', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Leontius'],
        'subtitle': '',
        'body': "An Athenian whose experience Socrates recalls as a story: coming up from the Piraeus, he passed some bodies lying by the executioner's wall. He is used as an example while Socrates discusses the parts of the soul.",
    },
    {
        'id': 'aglaion', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Aglaion'],
        'subtitle': '',
        'body': "Named only as the father of Leontius in the anecdote Socrates recounts about a struggle between appetite and reason.",
    },
    # -- New: Gyges split from the ring object --
    {
        'id': 'gyges', 'kind': 'person', 'storyRole': 'supporting',
        'aliases': ['Gyges'],
        'subtitle': '',
        'body': "A legendary shepherd in the service of the king of Lydia, said to be an ancestor of King Croesus. Glaucon invokes him by name to open a thought experiment about whether anyone would still choose to act justly if they could act without ever facing consequences.",
    },
    {
        'id': 'ring-of-gyges', 'kind': 'object', 'storyRole': 'supporting',
        'aliases': ['ring of Gyges'],
        'subtitle': '',
        'body': "A ring that grants its wearer invisibility, the centerpiece of a thought experiment Glaucon poses about whether anyone would stay just if they could commit any wrong without ever being caught. The story asks whether justice is valued for itself or only for its reputation.",
    },
    # -- New: Myth of Er cast (Book X) --
    {
        'id': 'er', 'kind': 'person', 'storyRole': 'major',
        'aliases': ['Er'],
        'subtitle': '',
        'body': "A Pamphylian soldier whose body is found intact ten days after he was killed in battle. Socrates presents his account of what he witnessed as the closing story of the dialogue, offered as a vision of what happens to souls after death rather than a philosophical argument.",
    },
    {
        'id': 'armenius', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Armenius'],
        'subtitle': '',
        'body': "Named only as Er's father in Socrates's introduction of the closing story.",
    },
    {
        'id': 'ardiaeus', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Ardiaeus'],
        'subtitle': '',
        'body': "A tyrant of a city in Pamphylia named within Er's account as a byword among the souls Er observes, said to have lived long before Er's own time.",
    },
    {
        'id': 'necessity', 'kind': 'deity', 'storyRole': 'supporting',
        'aliases': ['Necessity'],
        'subtitle': '',
        'body': "The figure on whose spindle, in Er's account, the revolutions of the heavens turn. The Fates are described as her daughters, attending the spindle she holds on her knees.",
    },
    {
        'id': 'lachesis', 'kind': 'deity', 'storyRole': 'supporting',
        'aliases': ['Lachesis'],
        'subtitle': '',
        'body': "One of the three Fates in Er's account, daughters of Necessity, described singing of the past as the souls Er observes make their choices.",
    },
    {
        'id': 'clotho', 'kind': 'deity', 'storyRole': 'reference',
        'aliases': ['Clotho'],
        'subtitle': '',
        'body': "One of the three Fates in Er's account, daughters of Necessity, described singing of the present and touching the outer circle of the spindle.",
    },
    {
        'id': 'atropos', 'kind': 'deity', 'storyRole': 'reference',
        'aliases': ['Atropos'],
        'subtitle': '',
        'body': "One of the three Fates in Er's account, daughters of Necessity, described singing of the future and guiding the inner circles of the spindle.",
    },
    # -- Historical, Homeric, mythological and philosophical figures cited in argument --
    # Production diagnostics (docs/reader-feedback-2026-09-14.md) confirmed at least one
    # of these (Themistocles) as a genuinely missing/broken click target, not a stylistic
    # omission, so this batch treats every named figure in the source as in scope rather
    # than excluding single-mention allusions.
    {
        'id': 'themistocles', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Themistocles'],
        'subtitle': 'Athenian statesman',
        'body': "An Athenian statesman Socrates cites for a sharp retort: told he owed his fame only to being Athenian, Themistocles replied that neither would he, born a Seriphian, have been famous, nor would his critic, born an Athenian.",
    },
    {
        'id': 'zeus', 'kind': 'deity', 'storyRole': 'reference',
        'aliases': ['Zeus', 'Jupiter'],
        'subtitle': 'King of the gods',
        'body': "Cited repeatedly in the Book II–III critique of poetry, including stories Socrates says should not be told to the young: Zeus's treatment of Hephaestus.",
    },
    {
        'id': 'apollo', 'kind': 'deity', 'storyRole': 'reference',
        'aliases': ['Apollo', 'Phoebus'],
        'subtitle': 'God of prophecy and music',
        'body': "Cited in the poetry critique (his role at Thetis's wedding, as told by Aeschylus) and as the superior of the satyr Marsyas in a contest of instruments; also invoked as Phoebus, the god whose oracle Socrates says he trusts.",
    },
    {
        'id': 'hephaestus', 'kind': 'deity', 'storyRole': 'reference',
        'aliases': ['Hephaestus'],
        'subtitle': 'Smith-god',
        'body': "Cited in the poetry critique for two stories Socrates says should not be repeated to the young: his mother Hera's binding, and his trapping Ares and Aphrodite in a chain.",
    },
    {
        'id': 'aphrodite', 'kind': 'deity', 'storyRole': 'reference',
        'aliases': ['Aphrodite', 'Venus'],
        'subtitle': 'Goddess of love',
        'body': "Cited in the poetry critique as one of the pair Hephaestus traps in a chain.",
    },
    {
        'id': 'ares', 'kind': 'deity', 'storyRole': 'reference',
        'aliases': ['Ares', 'Mars'],
        'subtitle': 'God of war',
        'body': "Cited in the poetry critique as one of the pair Hephaestus traps in a chain.",
    },
    {
        'id': 'artemis', 'kind': 'deity', 'storyRole': 'reference',
        'aliases': ['Artemis'],
        'subtitle': 'Huntress goddess',
        'body': "Identified with the Thracian goddess Bendis, in whose honor the festival that opens the dialogue is held.",
    },
    {
        'id': 'athena', 'kind': 'deity', 'storyRole': 'reference',
        'aliases': ['Athene', 'Athena'],
        'subtitle': 'Goddess of wisdom and war',
        'body': "Cited in the poetry critique as one of the gods poets wrongly blame for instigating the gods' quarrels and for the treaty-breaking of Pandarus.",
    },
    {
        'id': 'persephone', 'kind': 'deity', 'storyRole': 'reference',
        'aliases': ['Persephone'],
        'subtitle': 'Queen of the underworld',
        'body': "Named in a quoted line about the dead retaining their mind in the underworld, part of the Book III discussion of poetry that makes death seem fearful.",
    },
    {
        'id': 'cronus', 'kind': 'deity', 'storyRole': 'reference',
        'aliases': ['Cronus', 'Saturn'],
        'subtitle': "Zeus's father",
        'body': "Cited alongside his father Uranus in the poetry critique as an example of the violent succession stories among the gods that Socrates says should not be told.",
    },
    {
        'id': 'uranus', 'kind': 'deity', 'storyRole': 'reference',
        'aliases': ['Uranus'],
        'subtitle': "Cronus's father",
        'body': "Cited in the poetry critique as the god whose treatment by his son Cronus is, per Hesiod, one of the stories Socrates says should not be told to the young.",
    },
    {
        'id': 'hades-god', 'kind': 'deity', 'storyRole': 'reference',
        'aliases': ['Hades'],
        'subtitle': 'God of the underworld; also the underworld itself',
        'body': "Named both as the god and, more often in this dialogue, as the underworld he rules — the place of reward and punishment described in Book II's account of what poets say happens to the just and the unjust after death.",
    },
    {
        'id': 'hermes', 'kind': 'deity', 'storyRole': 'reference',
        'aliases': ['Mercury'],
        'subtitle': 'Messenger god',
        'body': "Named as ‘Mercury’ for the planet in the Book X vision of the cosmos, alongside the other gods' planetary names.",
    },
    {
        'id': 'achilles', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Achilles'],
        'subtitle': 'Greek hero of the Iliad',
        'body': "Cited repeatedly in the Book III poetry critique as an example of excessive grief and disrespect for authority that Socrates says should not be depicted for the young to imitate.",
    },
    {
        'id': 'agamemnon', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Agamemnon'],
        'subtitle': 'Commander of the Greeks at Troy',
        'body': "Cited several times in the poetry critique, including the false dream Zeus sends him and his eventual restoration of Hector's body for ransom.",
    },
    {
        'id': 'odysseus', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Odysseus'],
        'subtitle': 'Greek hero, grandson of Autolycus',
        'body': "Cited as the grandson of the thief Autolycus, an example Socrates uses to question what counts as praiseworthy conduct.",
    },
    {
        'id': 'patroclus', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Patroclus'],
        'subtitle': "Achilles's companion",
        'body': "Named as the slayer of Sarpedon and, elsewhere in the poetry critique, as the friend whose death Achilles is depicted mourning in ways Socrates objects to.",
    },
    {
        'id': 'ajax', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Ajax'],
        'subtitle': 'Greek hero, son of Telamon',
        'body': "Cited as an example of a hero properly honored for valor with a choice cut of meat, part of Book V's discussion of fitting rewards.",
    },
    {
        'id': 'priam', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Priam'],
        'subtitle': 'King of Troy',
        'body': "Cited as an example, from Homer, of undignified grief and supplication that Socrates says should not be shown of a man ‘near akin to the gods.’",
    },
    {
        'id': 'hector', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Hector'],
        'subtitle': 'Chief Trojan warrior',
        'body': "Cited in the poetry critique: his body is restored to Priam after ransom is paid, an episode Socrates uses to question Achilles's motives.",
    },
    {
        'id': 'menelaus', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Menelaus'],
        'subtitle': 'King of Sparta, Helen’s husband',
        'body': "Cited as the Greek wounded by Pandarus's broken-truce arrow, an episode used to discuss whether the gods can be blamed for human wrongdoing.",
    },
    {
        'id': 'helen-of-troy', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Helen'],
        'subtitle': 'Wife of Menelaus, cause of the Trojan War',
        'body': "Cited via Stesichorus's account that the Greeks and Trojans fought over a phantom image of her, used in Book IX as an analogy for people who compete for false goods without realizing it.",
    },
    {
        'id': 'thersites', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Thersites'],
        'subtitle': 'A common, disreputable soldier at Troy',
        'body': "Named in Er's account as the soul who, offered any life to choose, becomes a monkey — a detail illustrating that a soul's past character shapes its choice.",
    },
    {
        'id': 'sarpedon', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Sarpedon'],
        'subtitle': "Zeus's mortal son, a Trojan ally",
        'body': "Cited as the fallen warrior whose death, mourned by his father Zeus, is used to question whether the gods should be shown lamenting what fate decrees.",
    },
    {
        'id': 'glaucus-sea-god', 'kind': 'deity', 'storyRole': 'reference',
        'aliases': ['Glaucus'],
        'subtitle': 'A sea-god, encrusted and disfigured by the sea — not Glaucon',
        'body': "Invoked in Book X as an image for how hard it is to see the soul's true nature clearly, since it is as encrusted and disfigured by the body as the sea-god Glaucus is by shells, seaweed, and stones. Not the same figure as Socrates's interlocutor Glaucon.",
    },
    {
        'id': 'diomede', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Diomede'],
        'subtitle': 'Greek hero at Troy',
        'body': "Cited as an example, from Homer, of a warrior who speaks with due caution about the gods rather than presuming to fight them outright.",
    },
    {
        'id': 'peleus', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Peleus'],
        'subtitle': "Achilles's father",
        'body': "Cited as an example of a mortal, married to the goddess Thetis, whom poets should not be allowed to depict as behaving disorderly in grief — part of the Book III case against certain stories about the gods and their kin.",
    },
    {
        'id': 'thetis', 'kind': 'deity', 'storyRole': 'reference',
        'aliases': ['Thetis'],
        'subtitle': "Sea-goddess, Achilles's mother",
        'body': "Cited via Aeschylus's account of what Apollo sang at her wedding, and elsewhere as a goddess Socrates says poets should not slander with undignified behavior.",
    },
    {
        'id': 'niobe', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Niobe'],
        'subtitle': 'A mother whose children were killed by the gods',
        'body': "Cited as the subject of a tragedy about extreme suffering, part of Socrates's case that poets should not dwell on such grief as fit material for the young.",
    },
    {
        'id': 'cheiron', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Cheiron', 'Chiron'],
        'subtitle': "Achilles's tutor, a centaur",
        'body': "Named as the wise centaur who raised Achilles, cited when Socrates objects to Homer's portrayal of Achilles's pupil as behaving disorderly despite that upbringing.",
    },
    {
        'id': 'palamedes', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Palamedes'],
        'subtitle': 'A Greek hero at Troy, in later tragedy',
        'body': "Cited as a tragic character who, wherever he appears, is shown proving Agamemnon incompetent as a general — an example Socrates gives of poets' inventions rather than a figure in Homer himself.",
    },
    {
        'id': 'proteus', 'kind': 'deity', 'storyRole': 'reference',
        'aliases': ['Proteus'],
        'subtitle': 'A shape-shifting sea-god',
        'body': "Cited alongside Thetis as a god poets should not be permitted to slander or show shape-shifting deceitfully, part of the Book II case against certain stories about the gods.",
    },
    {
        'id': 'pandarus', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Pandarus'],
        'subtitle': 'A Trojan archer who breaks the truce',
        'body': "Cited as the archer whose truce-breaking shot at Menelaus is wrongly blamed by some poets on the gods' instigation, an example in the case against unfair stories about divine responsibility for human wrongdoing.",
    },
    {
        'id': 'eurypylus', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Eurypylus'],
        'subtitle': 'A wounded Greek hero at Troy',
        'body': "Cited as the wounded warrior who, in Homer, drinks a strong wine posset despite his wound — used in Book III to question whether such scenes suit a medically trained readership.",
    },
    {
        'id': 'autolycus', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Autolycus'],
        'subtitle': "Odysseus's maternal grandfather",
        'body': "Cited via Homer's praise of him as an accomplished thief and liar, an example Socrates uses to question what counts as praiseworthy conduct.",
    },
    {
        'id': 'telamon', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Telamon'],
        'subtitle': "Ajax's father",
        'body': "Named only as Ajax's father, in the patronymic used for Ajax's soul in Er's account.",
    },
    {
        'id': 'pelops', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Pelops'],
        'subtitle': 'A mythical king whose house suffered generations of tragedy',
        'body': "Cited as another example, alongside Niobe and the Trojan War, of suffering-centered subject matter Socrates says poets should treat with restraint.",
    },
    {
        'id': 'atreus', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Atreus'],
        'subtitle': "Agamemnon and Menelaus's father",
        'body': "Named only via the patronymic ‘sons of Atreus’ for Agamemnon and Menelaus, in a quoted line from Homer.",
    },
    {
        'id': 'menoetius', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Menoetius'],
        'subtitle': "Patroclus's father",
        'body': "Named only as Patroclus's father, in the patronymic Homer uses for him.",
    },
    {
        'id': 'alcinous', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Alcinous'],
        'subtitle': 'A king in the Odyssey',
        'body': "Named only as the king to whom Odysseus tells his tales in the Odyssey, invoked by contrast as Socrates introduces the very different tale of Er.",
    },
    {
        'id': 'lycurgus', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Lycurgus'],
        'subtitle': 'Legendary lawgiver of Sparta',
        'body': "Cited as the legislator credited with Sparta's good order, part of a Book X argument about what counts as genuine, lasting benefit to a city.",
    },
    {
        'id': 'solon', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Solon'],
        'subtitle': 'Athenian lawgiver',
        'body': "Cited twice: for a saying about learning in old age Socrates says was mistaken, and as the legislator Athens can point to when other cities are asked to name theirs.",
    },
    {
        'id': 'charondas', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Charondas'],
        'subtitle': 'Lawgiver of Italy and Sicily',
        'body': "Cited alongside Solon and Lycurgus as a legislator credited with genuine benefit to his cities, in the Book X discussion of what makes a life truly beneficial to others.",
    },
    {
        'id': 'periander', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Periander'],
        'subtitle': 'Tyrant of Corinth, one of the Seven Sages',
        'body': "Named in a list of rich and powerful men Thrasymachus cites as models of the successful unjust life he is defending in Book I.",
    },
    {
        'id': 'pittacus', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Pittacus'],
        'subtitle': 'Statesman of Mytilene, one of the Seven Sages',
        'body': "Named among the wise men Socrates says might be credited with a saying about justice being what benefits the stronger, in Book I.",
    },
    {
        'id': 'bias', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Bias'],
        'subtitle': 'Statesman of Priene, one of the Seven Sages',
        'body': "Named among the wise men Socrates says might be credited with a saying about justice being what benefits the stronger, in Book I.",
    },
    {
        'id': 'anacharsis', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Anacharsis'],
        'subtitle': 'A Scythian philosopher',
        'body': "Named alongside Thales as an example of an ingenious individual credited with a useful invention, in the Book X argument that genuine benefactors are remembered for concrete achievements.",
    },
    {
        'id': 'xerxes', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Xerxes'],
        'subtitle': 'King of Persia',
        'body': "Named in a list of rich and powerful men Thrasymachus cites as models of the successful unjust life he is defending in Book I.",
    },
    {
        'id': 'croesus', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Croesus'],
        'subtitle': 'King of Lydia, proverbially wealthy',
        'body': "Named as the descendant of Gyges in the Book II introduction of the ring story, and elsewhere as an example of proverbial wealth.",
    },
    {
        'id': 'perdiccas', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Perdiccas'],
        'subtitle': 'A king of Macedon',
        'body': "Named in a list of rich and powerful men Thrasymachus cites as models of the successful unjust life he is defending in Book I.",
    },
    {
        'id': 'polydamas', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Polydamas'],
        'subtitle': 'A champion athlete (pancratiast)',
        'body': "Cited by Socrates as an example while testing Thrasymachus's claim that justice is whatever benefits the stronger: an athlete's private diet does not become beneficial to everyone just because he is stronger.",
    },
    {
        'id': 'homer', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Homer'],
        'subtitle': 'Epic poet, the central subject of the dialogue’s critique of poetry',
        'body': "The most-cited poet in the dialogue by far. Socrates repeatedly quotes and challenges his portrayals of gods and heroes, arguing that even Homer's celebrated authority does not exempt his poetry from being examined for its effect on character.",
    },
    {
        'id': 'hesiod', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Hesiod'],
        'subtitle': 'Early Greek poet',
        'body': "Cited alongside Homer, both as an authority on divine justice and as a source, with Musaeus and Orpheus, for the material-reward accounts of the afterlife Socrates criticizes in Book II.",
    },
    {
        'id': 'simonides', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Simonides'],
        'subtitle': 'Lyric poet',
        'body': "Cited by Cephalus and Polemarchus as an authority on the definition of justice (‘giving every man his due’), the position Socrates first examines and refutes in Book I.",
    },
    {
        'id': 'pindar', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Pindar'],
        'subtitle': 'Lyric poet',
        'body': "Quoted by Cephalus on the comfort a clear conscience brings in old age, near the start of Book I.",
    },
    {
        'id': 'aeschylus', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Aeschylus'],
        'subtitle': 'Tragedian',
        'body': "Cited repeatedly in the Book II–III poetry critique, including his account of Apollo's song at Thetis's wedding and a line praising the man who simply is just rather than merely seeming so.",
    },
    {
        'id': 'sophocles', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Sophocles'],
        'subtitle': 'Tragedian',
        'body': "Recalled by Cephalus in Book I, who reports the aged Sophocles's relief at being free, in old age, from the tyranny of sexual desire.",
    },
    {
        'id': 'euripides', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Euripides'],
        'subtitle': 'Tragedian',
        'body': "Named in Book VIII as ‘a great tragedian’ in an aside about tyranny being fit material for tragic poetry.",
    },
    {
        'id': 'archilochus', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Archilochus'],
        'subtitle': 'Early lyric poet',
        'body': "Quoted by Adeimantus in Book II for a line recommending cunning concealment, part of his case for how popular poetry actually teaches the advantages of appearing just without being just.",
    },
    {
        'id': 'stesichorus', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Stesichorus'],
        'subtitle': 'Lyric poet',
        'body': "Cited in Book IX for his account that the Greeks and Trojans fought over a mere phantom of Helen, used as an analogy for people who strive for false goods without realizing it.",
    },
    {
        'id': 'musaeus', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Musaeus'],
        'subtitle': 'Legendary early poet',
        'body': "Cited with his son and with Orpheus as a source, alongside Hesiod, for the material-reward pictures of the afterlife Socrates criticizes in Book II.",
    },
    {
        'id': 'orpheus', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Orpheus'],
        'subtitle': 'Legendary poet and musician',
        'body': "Cited alongside Musaeus as a source of books promising rewards for the just and threats for the unjust; his soul also appears in Er's account, choosing rebirth as a swan rather than be born of a woman.",
    },
    {
        'id': 'thamyras', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Thamyras'],
        'subtitle': 'Legendary Thracian singer',
        'body': "Named in Er's account as the soul who chooses the life of a nightingale.",
    },
    {
        'id': 'damon', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Damon'],
        'subtitle': 'Athenian musical theorist',
        'body': "Cited in Book III as an authority to be consulted on which musical rhythms express which qualities of character.",
    },
    {
        'id': 'marsyas', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Marsyas'],
        'subtitle': 'A satyr, defeated by Apollo in a musical contest',
        'body': "Cited in Book III as the loser of a contest of instruments against Apollo, used as an unsurprising example when Socrates ranks the lyre and cithara above the flute.",
    },
    {
        'id': 'pythagoras', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Pythagoras'],
        'subtitle': 'Philosopher and religious teacher',
        'body': "Cited in Book X as someone genuinely loved for his wisdom, whose followers still distinguish themselves by ‘the Pythagorean way of life,’ in an argument about what counts as a real, lasting contribution.",
    },
    {
        'id': 'thales', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Thales'],
        'subtitle': 'Philosopher of Miletus',
        'body': "Cited in Book X as an example of an ingenious individual credited with a useful invention, part of the argument that real benefactors are remembered for concrete achievements rather than political power.",
    },
    {
        'id': 'protagoras', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Protagoras'],
        'subtitle': 'Sophist of Abdera',
        'body': "Cited in Book X, with Prodicus, as a sophist who earned devoted followers by teaching — unlike, Socrates argues, the political figures being discussed.",
    },
    {
        'id': 'prodicus', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Prodicus'],
        'subtitle': 'Sophist of Ceos',
        'body': "Cited in Book X, with Protagoras, as a sophist who earned devoted followers by teaching — unlike, Socrates argues, the political figures being discussed.",
    },
    {
        'id': 'heraclitus', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Heracleitus', 'Heraclitus'],
        'subtitle': 'Philosopher',
        'body': "Cited in Book VI for his saying that the sun is renewed daily, used as a figure for how old men's minds, once extinguished, do not light up again.",
    },
    {
        'id': 'the-seriphian', 'kind': 'person', 'storyRole': 'reference',
        'aliases': ['Seriphian'],
        'subtitle': 'An unnamed man from Seriphos',
        'body': "Not a named individual: identified only by his home island in the anecdote about Themistocles's sharp reply to the claim that his fame rested on being Athenian rather than on his own merit.",
    },
]
