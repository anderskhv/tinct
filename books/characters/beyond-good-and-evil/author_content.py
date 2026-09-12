"""Manually authored recognition copy for Nietzsche's Beyond Good and Evil.

Covers the Preface, all nine numbered chapters, and the closing poem "From
the Heights" in both English editions. This is an aphoristic philosophical
work, not a novel: it names more real historical, mythological, and literary
figures per page than any Lane A book authored so far, exactly as flagged in
the automation queue ("Nietzsche's philosophers, composers and nations").
Almost every entry is Reference -- a thinker, writer, composer, ruler, or
mythological figure cited to make a point. Eight entries are Major because
Nietzsche returns to them repeatedly across multiple chapters in sustained,
substantive discussion rather than a single citation: Plato and Socrates
(the twin targets/originators of the "morality as error" argument running
from the Preface through Chapter 5); Kant (Chapter 1's critique of synthetic
judgments a priori, revisited in Chapters 6 and 7); Schopenhauer (discussed
at length in Chapters 1, 3, 4, 6, 7 and 9); Pascal (the Religious Mood
chapter's central case study); Napoleon and Goethe (paired repeatedly as
exemplars of "good Europeans," Chapters 5-9); and Wagner (Chapters 3, 8 and
9, culminating in the long Chapter 9 assessment).

Two genuine namesake collisions, both resolved by location-scoped binding
rather than a shared alias -- see build_beyond_good_and_evil.py:

- "Frederick" names two different men: Frederick II of Hohenstaufen, the
  medieval emperor (6:14), and Frederick the Great of Prussia (7:5).
- "Sand" names two different people: George Sand, the novelist (8:19), and
  Karl Ludwig Sand, the student who assassinated Kotzebue (9:4) -- the
  aphorism about Kotzebue "knowing his Germans" is itself a dark joke about
  that assassination.

A third near-collision -- original-en's "Caesar Borgia" contains the bare
word "Caesar," which would otherwise misbind to Julius Caesar -- is handled
by excluding that one location from the Caesar alias in the build script;
modern-en spells it "Cesare Borgia" and never collides at all.

Several names carry an ALL-CAPS alias alongside the normal-case one: this
translation renders Nietzsche's own italicized emphasis in small caps or
full caps at a few points (PLATO'S, KANT, LOCKE, BIZET, DIONYSUS), and the
exact, case-sensitive matcher needs the literal alias to catch each one.
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
    # --- Preface / Chapter 1: Prejudices of Philosophers ---
    ('plato', 'Plato',
     "The arch-dogmatist: the Preface calls Christianity \"Platonism for "
     "'the people'\" and blames Plato's invention of Pure Spirit and the "
     "Good in Itself for the worst error philosophy has made; later "
     "chapters return to his death-bed reading (a book of Aristophanes, "
     "not scripture) and the \"Socratism\" smuggled into his own morality.",
     'Plato|PLATO', 'major'),
    ('socrates', 'Socrates',
     "The dialectician whose \"Will to Truth\" the book keeps circling "
     "back to -- the Sphinx he and Nietzsche's readers both face in the "
     "Preface, the man Plato may have caught his morality from, and the "
     "ironist whose real deception (per Chapter 6) was persuading reason "
     "to defend the instincts it pretended to rule.",
     'Socrates', 'major'),
    ('epicurus', 'Epicurus',
     "The Greek philosopher whose joke about Plato and the Platonists -- "
     "calling them \"Dionysiokolakes,\" flatterers of the tyrant Dionysius "
     "-- opens Chapter 1's gallery of philosophers' malice; his own three "
     "hundred garden-written books earned him a hundred years of "
     "obscurity.",
     'Epicurus'),
    ('dionysius-tyrant', 'Dionysius of Syracuse',
     "The tyrant of Syracuse behind Plato's visits and Epicurus's "
     "coinage \"Dionysiokolakes\" (flatterers of Dionysius) -- named "
     "only in that etymology, not the god Dionysus of Chapter 10's "
     "closing confession.",
     'Dionysius'),
    ('kant', 'Immanuel Kant',
     "The philosopher whose Table of Categories and \"synthetic "
     "judgment a priori\" Chapter 1 dissects at length as a comic "
     "non-answer (\"by means of a means\"); later called \"the great "
     "Chinaman of Konigsberg,\" and named again for his rift with Hume "
     "and his categorical imperative.",
     'Kant|KANT', 'major'),
    ('spinoza', 'Baruch Spinoza',
     "The philosopher accused of smuggling self-preservation in as a "
     "\"superfluous\" teleological principle; later cited for the "
     "\"no-more-laughing and no-more-weeping\" of his ethics, and, in "
     "Chapter 2, grouped with Giordano Bruno as a persecuted recluse "
     "whose hidden vengefulness is worth reading his own theology to "
     "find.",
     'Spinoza|Spinoza\'s|Spinozas'),
    ('boscovich', 'Roger Boscovich',
     "The Croatian physicist (\"the Pole Boscovich\" in this telling), "
     "credited with Copernicus as the greatest opponent of ocular "
     "evidence -- his refutation of atomism is called the greatest "
     "triumph over the senses yet achieved.",
     'Boscovich'),
    ('copernicus', 'Nicolaus Copernicus',
     "Named alongside Boscovich as the other great \"Pole\" who "
     "persuaded humanity to believe, against the senses, that the earth "
     "does not stand still.",
     'Copernicus'),
    ('schelling', 'Friedrich Wilhelm Joseph Schelling',
     "Credited with christening \"intellectual intuition\" during "
     "German philosophy's post-Kantian honeymoon; quoted again in "
     "Chapter 9 dismissing Locke in three French words, \"Je meprise "
     "Locke.\"",
     'Schelling'),
    ('giordano-bruno', 'Giordano Bruno',
     "The philosopher burned for heresy, grouped with Spinoza in "
     "Chapter 2 as one of the \"compulsory recluses\" whose long "
     "persecution breeds concealed vengeance-seeking beneath even the "
     "most intellectual disguise.",
     'Giordano Bruno|Giordano Brunos'),
    ('munchausen', 'Baron Munchausen',
     "Raspe's tall-tale baron, invoked for the image of pulling oneself "
     "into existence \"by the hair, out of the slough of nothingness\" "
     "-- Nietzsche's figure for the self-contradiction at the heart of "
     "wanting to be one's own cause.",
     'Munchausen|Münchhausen'),
    ('descartes', 'Rene Descartes',
     "The father of rationalism, credited (via Kant's defiance of him) "
     "with modern philosophy's covert war on the Christian soul, and "
     "later dismissed in one line as superficial, since reason is only "
     "a tool.",
     'Descartes'),
    ('moliere', 'Moliere',
     "Cited for the doctor's mock-answer in his plays -- opium causes "
     "sleep \"by means of a means,\" the virtus dormitiva -- Nietzsche's "
     "model for the comic non-explanation he accuses Kant of repeating.",
     'Moliere|Molière'),

    # --- Chapter 2: The Free Spirit ---
    ('lessing', 'Gotthold Ephraim Lessing',
     "The one German prose stylist exempted from the charge that "
     "German cannot manage a swift TEMPO -- his histrionic range, "
     "translation of Bayle, and debt to Diderot and Voltaire let him "
     "love \"free-spiritism\" in style as well as thought.",
     'Lessing'),
    ('bayle', 'Pierre Bayle',
     "The skeptic philosophe whose work Lessing translated -- cited in "
     "passing as one of the influences Lessing absorbed on his way to "
     "a livelier German prose.",
     'Bayle'),
    ('diderot', 'Denis Diderot',
     "The Encyclopedist in whose shadow Lessing \"took refuge\" -- one "
     "of the French influences credited with loosening German prose's "
     "otherwise leaden pace.",
     'Diderot'),
    ('machiavelli', 'Niccolo Machiavelli',
     "Author of The Principe, praised for a TEMPO so fast it \"makes "
     "us breathe the dry, fine air of Florence\" even while narrating "
     "the gravest matters in a boisterous gallop -- the untranslatable "
     "opposite of German heaviness.",
     'Machiavelli'),
    ('petronius', 'Petronius',
     "The Roman satirist called the greatest master of PRESTO in "
     "invention and language \"hitherto\" -- untranslatable into German, "
     "Nietzsche says, for the same reason Aristophanes is.",
     'Petronius'),
    ('aristophanes', 'Aristophanes',
     "The comic playwright found, in a much-repeated anecdote, under "
     "Plato's pillow on his deathbed instead of any scripture -- proof, "
     "for Nietzsche, that even Plato could not have endured a Greek "
     "life without him.",
     'Aristophanes'),
    ('galiani', 'Ferdinando Galiani',
     "The Neapolitan abbe called \"the profoundest, acutest, and "
     "perhaps also filthiest man of his century\": quoter of the "
     "witticism about Helvetius, source of a letter to Madame d'Epinay "
     "on Europe's uglifying, and one of Chapter 10's examples (with "
     "Hamlet) of a mask concealing a broken, proud heart.",
     'Galiani'),

    # --- Chapter 3: The Religious Mood ---
    ('luther', 'Martin Luther',
     "Named among the northern barbarians of the spirit whose "
     "slave-faith Nietzsche distinguishes from Pascal's more terrible, "
     "suicidal reason; his Bible is later called the one masterpiece "
     "of German prose, next to which almost everything else is "
     "\"merely literature.\"",
     'Luther|Luther\'s'),
    ('cromwell', 'Oliver Cromwell',
     "Named alongside Luther as a northern barbarian of the spirit "
     "whose faith, unlike Pascal's, was a plain, austere slave-faith "
     "rather than a continuous suicide of reason.",
     'Cromwell'),
    ('pascal', 'Blaise Pascal',
     "The exemplary Christian intellect: his faith is called a "
     "\"continuous suicide of reason,\" his intellectual conscience the "
     "measure by which any psychologist of homines religiosi would "
     "have to be judged, and his own tortured self-mutilation the case "
     "study Nietzsche imagines a \"divine hammer\" confronting at the "
     "chapter's close.",
     'Pascal', 'major'),
    ('augustine', 'Saint Augustine',
     "The \"holy rhetorician\" quoted for his phrase \"Sabbath of "
     "Sabbaths\" describing the peace a war-torn soul craves, and "
     "later cited for an Oriental exaltation of mind that, like a "
     "favored slave's, lacks all nobility of bearing.",
     'St. Augustine|Augustine'),
    ('guyon', 'Madame Guyon',
     "The French mystic whose passion for God Nietzsche calls feminine "
     "and sensual, longing unconsciously for a union at once mystical "
     "and physical -- one of his three types of religious devotion.",
     'Madame de Guyon'),
    ('comte', 'Auguste Comte',
     "Founder of positivist sociology, whose system strikes Nietzsche "
     "as startlingly Catholic and un-German in its Roman logic, "
     "evidence of how deeply Latin races remain attached to "
     "Catholicism even in unbelief.",
     'Auguste Comte'),
    ('sainte-beuve', 'Charles Augustin Sainte-Beuve',
     "The critic called an \"amiable and shrewd cicerone of Port "
     "Royal\" -- Jesuitical in manner despite his hostility to Jesuits, "
     "one of the later French skeptics whose Celtic blood still shows "
     "through as piety.",
     'Sainte-Beuve'),
    ('renan', 'Ernest Renan',
     "The historian of religion whose sentence claiming religion as "
     "the product of the \"normal man\" Nietzsche quotes at length in "
     "French, calls religious naivete par excellence, and then admits "
     "he has come to enjoy for how thoroughly it inverts his own view.",
     'Renan'),
    ('tiberius', 'Tiberius',
     "The Roman emperor whose human sacrifice in the Mithra-Grotto on "
     "Capri is called the most terrible of all Roman anachronisms -- "
     "an example of religious cruelty's first, most literal rung.",
     'Tiberius'),
    ('buddha', 'the Buddha',
     "Invoked as the one earlier thinker who, like Schopenhauer, still "
     "looked beyond good and evil while remaining under the \"dominion "
     "and delusion of morality\"; also credited alongside Christianity "
     "with teaching even the lowest to bear a difficult life through "
     "piety.",
     'Buddha'),
    ('kundry', 'Kundry',
     "The character from Wagner's Parsifal in whom Wagner staged the "
     "\"terrible and eternal type\" of the religious neurosis -- proof, "
     "for Nietzsche, of how thoroughly Schopenhauerian Wagner's own "
     "final work became.",
     'Kundry'),

    # --- Chapter 4: Epigrams and Interludes ---
    ('sacchetti', 'Franco Sacchetti',
     "The medieval Florentine novelliere credited by citation (\"Nov. "
     "86\") as the source of the Italian proverb about good and bad "
     "women alike needing the stick -- one of the epigrams collected "
     "\"from old Florentine novels, moreover, from life.\"",
     'Sacchetti'),
    ('jesus', 'Jesus',
     "Quoted telling his fellow Jews that the law was only for "
     "servants and that he loves God as a son; much later, imagined by "
     "the psychologist as a soul so insatiable for love that it had to "
     "invent both a hell for those who refused him and a God who is "
     "entire love, out of pity for how paltry human love actually is.",
     'Jesus'),
    ('eros', 'Eros',
     "The god of love, personified in one epigram as having been given "
     "poison to drink by Christianity -- he did not die of it, "
     "Nietzsche says, but degenerated into Vice.",
     'Eros'),
    ('ulysses', 'Ulysses',
     "The hero who, in one epigram, parts from Nausicaa \"blessing it "
     "rather than in love with it\" -- Nietzsche's model for how to "
     "part from life itself; invoked again in Chapter 9 as the "
     "\"stopped Ulysses-ears\" of the disciplined man of knowledge.",
     'Ulysses|Odysseus'),
    ('nausicaa', 'Nausicaa',
     "The Phaeacian princess from whom Ulysses parts at the end of his "
     "stay on her island -- the epigram's figure for a clean, "
     "unsentimental leave-taking from something one no longer needs.",
     'Nausicaa'),
    ('circe', 'Circe',
     "The enchantress invoked twice as a figure of seductive, "
     "dangerous knowledge: once as a fellow philosopher alongside the "
     "Sphinx in Chapter 7's meditation on skepticism, once as the name "
     "Nietzsche gives outright to cruelty's own \"philtre\" in Chapter "
     "8.",
     'Circe'),

    # --- Chapter 5: The Natural History of Morals ---
    ('hafiz', 'Hafiz',
     "The Persian poet named, with Goethe, as an example of "
     "surrendering wholly and wantonly to the emotions -- one of "
     "Chapter 6's short catalogue of moral systems as disguised "
     "expediency.",
     'Hafis|Hafiz'),
    ('borgia', 'Cesare Borgia',
     "The Renaissance \"beast and man of prey\" Nietzsche offers as an "
     "example that moralists mistake for a monster rather than the "
     "healthiest kind of tropical growth -- original-en spells him "
     "\"Caesar Borgia,\" modern-en the Italian \"Cesare Borgia.\"",
     'Cesare Borgia|Borgia'),
    ('julius-caesar', 'Julius Caesar',
     "Named alongside Alcibiades as one of the finest examples of a "
     "rare type: men whose inherited, unresolved contrariety of "
     "instinct becomes, rather than weakness, an additional spur to "
     "conquest.",
     'Caesar'),
    ('alcibiades', 'Alcibiades',
     "Named alongside Julius Caesar as the finest example, with him, "
     "of a man whose contradictory inheritance sharpens rather than "
     "weakens his drive to conquer and outmaneuver others.",
     'Alcibiades'),
    ('frederick-ii-hohenstaufen', 'Frederick II of Hohenstaufen',
     "The medieval Holy Roman Emperor Nietzsche calls \"the first of "
     "Europeans\" by his own taste, named alongside Alcibiades, Caesar "
     "and Leonardo as a man whose inherited contrariety became "
     "conquering strength -- a different Frederick from Chapter 7's "
     "Frederick the Great.",
     ''),
    ('leonardo-da-vinci', 'Leonardo da Vinci',
     "Named, among artists, as sharing the same rare temperament as "
     "Alcibiades, Julius Caesar and Frederick II: one whose unresolved "
     "inner contrariety becomes a spur rather than a weakness.",
     'Leonardo da Vinci'),
    ('catiline', 'Catiline',
     "The Roman conspirator (\"Catalina\" in original-en's spelling) "
     "named alongside Cagliostro as an example of the \"higher arts\" "
     "one might use to try to possess an entire nation.",
     'Catalina|Catiline'),
    ('cagliostro', 'Alessandro Cagliostro',
     "The eighteenth-century adventurer and impostor, named alongside "
     "Catiline as an example of the arts of possessing a nation, and "
     "later invoked as the type of \"philosophical Cagliostro\" the "
     "philosopher risks becoming if he loses self-respect.",
     'Cagliostro'),

    # --- Chapter 6: The Natural History of Morals (cont.) ---
    ('tacitus', 'Tacitus',
     "The Roman historian cited, with \"the whole ancient world,\" for "
     "calling the Jews a people \"born for slavery\" -- the received "
     "verdict Nietzsche sets against the Jews' own self-conception as "
     "chosen, before crediting them with inverting all values.",
     'Tacitus'),
    ('george-sand', 'George Sand',
     "The novelist (born Amantine Dupin, published under the pen name "
     "\"Monsieur George Sand\") named at 8:19 with Madame de Stael and "
     "Madame Roland as one of three women no one should cite in favor "
     "of \"woman as she is\" -- a different Sand from Chapter 9's Karl "
     "Ludwig Sand, distinguished only by location.",
     ''),
    ('karl-ludwig-sand', 'Karl Ludwig Sand',
     "The nationalist student who assassinated the playwright Kotzebue "
     "in 1819, named only as \"Sand\" at 9:4 in the same dark joke "
     "about Kotzebue's own boast that he \"knew his Germans\" -- a "
     "different Sand from Chapter 6's novelist George Sand.",
     ''),
    ('kotzebue', 'August von Kotzebue',
     "The popular playwright whose boast that he \"knew his Germans\" "
     "sets up the darkly ironic mention of Sand -- the nationalist "
     "student who assassinated him -- as someone who thought he knew "
     "them too.",
     'Kotzebue'),
    ('jean-paul', 'Jean Paul',
     "The pen name of Johann Paul Friedrich Richter, cited for having "
     "seen through Fichte's patriotic flattery of the Germans even "
     "though Goethe, Nietzsche guesses, judged the Germans differently.",
     'Jean Paul'),
    ('fichte', 'Johann Gottlieb Fichte',
     "The philosopher whose \"lying but patriotic flatteries and "
     "exaggerations\" about the German character Jean Paul is credited "
     "with seeing through.",
     'Fichte|Fichte\'s'),
    ('goethe', 'Johann Wolfgang von Goethe',
     "Repeatedly paired with Napoleon as one of the \"good Europeans\": "
     "his prose is granted one exception to German stylistic "
     "clumsiness, his rewriting of Faust is tied to Napoleon's rise, "
     "his remark to Rath Schlosser on true esteem is quoted directly, "
     "and Napoleon's own astonishment on meeting him (\"Voila un "
     "homme!\") closes Chapter 7's parable of German skepticism.",
     'Goethe|Goethe\'s', 'major'),
    ('napoleon', 'Napoleon Bonaparte',
     "Named again and again as the culmination of a European drama: "
     "the \"absolute ruler\" Europe's herd instinct craved, the man "
     "whose appearance changed Goethe's own Faust, the figure before "
     "whom Europe \"danced round the Tree of Liberty\" and then fell "
     "in adoration, and the one who told Madame de Stael to be silent "
     "in politics.",
     'Napoleon|Napoleon\'s', 'major'),
    ('hegel', 'Georg Wilhelm Friedrich Hegel',
     "Named with Kant as one of the \"philosophical workers\" who "
     "systematize existing values rather than create new ones; also "
     "credited with having systematized the very riddles of the "
     "German soul that Wagner then set to music, and blamed by "
     "Schopenhauer's unintelligent rage for severing a whole "
     "generation from German culture.",
     'Hegel'),

    # --- Chapter 7: We Scholars ---
    ('heraclitus', 'Heraclitus',
     "Named, with Plato and Empedocles, among the \"royal and "
     "magnificent anchorites of the spirit\" whose style of philosophy "
     "Nietzsche contrasts with the two \"lions of Berlin\" who pass "
     "for philosophers today.",
     'Heraclitus'),
    ('empedocles', 'Empedocles',
     "Named alongside Heraclitus and Plato as one of the ancient "
     "anchorites of the spirit against whom the modern philosophical "
     "pretenders of Berlin are measured and found wanting.",
     'Empedocles'),
    ('eugen-duhring', 'Eugen Duhring',
     "One of the \"two lions of Berlin\" -- called \"the anarchist\" "
     "-- held up as an example of the hotch-potch \"realist\" or "
     "\"positivist\" philosophy that has replaced genuine "
     "philosophizing.",
     'Eugen Duhring|Eugen Dühring'),
    ('eduard-von-hartmann', 'Eduard von Hartmann',
     "The other \"lion of Berlin\" -- called \"the amalgamist\" -- "
     "named alongside Eugen Duhring as an example of the diminished "
     "philosophy now passing for the real thing.",
     'Eduard von Hartmann'),
    ('leibniz', 'Gottfried Wilhelm Leibniz',
     "Quoted for his motto \"je ne meprise presque rien\" (I despise "
     "almost nothing) -- Nietzsche's example of the \"objective\" or "
     "purely reflective spirit that affirms and denies nothing of its "
     "own.",
     'Leibniz'),
    ('montaigne', 'Michel de Montaigne',
     "Quoted for his signature question \"What do I know?\" -- one of "
     "the skeptic's consoling formulas, alongside Socrates' \"I know "
     "that I know nothing.\"",
     'Montaigne'),
    ('michelet', 'Jules Michelet',
     "The French historian credited with the phrase describing the "
     "German spirit as \"cet esprit fataliste, ironique, "
     "mephistophelique\" -- quoted as the outside verdict on a "
     "distinctly German kind of skepticism.",
     'Michelet'),
    ('frederick-the-great', 'Frederick the Great',
     "The King of Prussia whose \"problematic, crazy father\" doubted "
     "his manliness -- Nietzsche's parable for a new, harder, more "
     "dangerous German skepticism first entering Germany \"in the "
     "person of the great Frederick\"; a different Frederick from "
     "Chapter 6's Frederick II of Hohenstaufen.",
     ''),

    # --- Chapter 8: Our Virtues ---
    ('flaubert', 'Gustave Flaubert',
     "The \"honest citizen of Rouen\" whose lifelong preoccupation "
     "with bourgeois stupidity -- betise bourgeoise -- Nietzsche calls "
     "a mode of self-torment and refined cruelty.",
     'Flaubert'),
    ('epinay', 'Madame d\'Epinay',
     "The addressee of a thoughtful letter from Galiani, cited as "
     "early documentary evidence of the overshadowing and \"uglifying\" "
     "of Europe that Nietzsche traces across the nineteenth century.",
     'Madame d\'Epinay|Madame d\'Épinay'),
    ('saint-evremond', 'Charles de Saint-Evremond',
     "The seventeenth-century French critic named among those who "
     "could not fully appropriate Homer, reproaching him for his "
     "\"esprit vaste\" -- part of Nietzsche's argument that only the "
     "modern, hybrid \"historical sense\" can enjoy Homer without "
     "reservation.",
     'Saint-Evremond|Saint-Évremond'),
    ('voltaire', 'Voltaire',
     "Named repeatedly as the last echo of the classicizing century "
     "that still could not fully enjoy Homer; earlier apostrophized "
     "directly (\"O Voltaire! O humanity! O idiocy!\") over the naive "
     "idea that seeking truth serves the good.",
     'Voltaire'),
    ('homer', 'Homer',
     "The poet the modern \"historical sense\" can finally enjoy in "
     "full, where classical French taste (Saint-Evremond, Voltaire) "
     "could not -- Chapter 8's central test case for what a truly "
     "hybrid, omnivorous culture can appreciate that a purer one "
     "cannot.",
     'Homer'),
    ('shakespeare', 'William Shakespeare',
     "Called a \"marvelous Spanish-Moorish-Saxon synthesis of taste\" "
     "that an ancient Athenian would have found laughable -- another "
     "of Chapter 8's proofs that only the modern, semi-barbarian "
     "European can enjoy such motley art without disturbance.",
     'Shakespeare|Shakespeare\'s'),
    ('aeschylus', 'Aeschylus',
     "Named as part of the \"circle\" of ancient Athenian taste "
     "against which Shakespeare's motley style is measured -- "
     "original-en's odd spelling \"AEschylus\" and modern-en's "
     "\"Aeschylus\" name the same Greek tragedian.",
     'AEschylus|Aeschylus'),
    ('bentham', 'Jeremy Bentham',
     "The utilitarian philosopher whose footsteps English moralists "
     "are said to \"stalk\" in, just as he had earlier stalked in the "
     "footsteps of Helvetius -- part of Chapter 8's dismissal of "
     "English moral philosophy as tedious.",
     'Bentham'),
    ('helvetius', 'Claude Adrien Helvetius',
     "The Enlightenment philosopher Bentham is said to have followed "
     "-- quoted secondhand via Galiani's witticism calling him \"ce "
     "senateur Pococurante\" (that senator who cares for nothing), "
     "borrowing the name of Voltaire's blase character in Candide "
     "rather than naming a real Pococurante.",
     'Helvetius|Helvetius\'|Helvétius|Helvétius\''),
    ('madame-de-lambert', 'Madame de Lambert',
     "The eighteenth-century salon hostess whose remark to her son -- "
     "\"never permit yourself follies except ones that will give you "
     "great pleasure\" -- Nietzsche calls the wisest and most motherly "
     "thing ever said to a son.",
     'Madame de Lambert'),
    ('dante', 'Dante Alighieri',
     "Named with Goethe as sharing a belief about woman that Nietzsche "
     "expects every noble woman to reject -- quoted in the original "
     "Italian, \"Ella guardava suso, ed io in lei.\"",
     'Dante'),
    ('madame-de-stael', 'Madame de Stael',
     "The writer Napoleon is said to have told, in Latin, to keep "
     "quiet in politics (\"mulier taceat in politicis\"); also one of "
     "three women (with Madame Roland and George Sand) a woman should "
     "not cite as proof of her sex's capacities.",
     'Madame de Stael|Stael|Madame de Staël|Staël'),
    ('madame-roland', 'Madame Roland',
     "The French revolutionary-era writer named, with Madame de Stael "
     "and George Sand, as one of \"three comical women\" no one should "
     "cite as an argument for feminine emancipation.",
     'Madame Roland|Roland'),

    # --- Chapter 9: Peoples and Countries ---
    ('hume', 'David Hume',
     "The skeptic Kant is said to have risen up against; named, with "
     "Hobbes and Locke, among the three Englishmen whose mechanical "
     "philosophy Nietzsche blames for a century of philosophical "
     "abasement.",
     'Hume'),
    ('hobbes', 'Thomas Hobbes',
     "Named with Hume and Locke as one of the three Englishmen "
     "responsible for depreciating the very idea of \"philosopher\"; "
     "quoted again in Chapter 10 for calling laughter a \"bad "
     "infirmity of human nature.\"",
     'Hobbes'),
    ('locke', 'John Locke',
     "Named at 2:19 for a \"superficiality\" about the origin of "
     "ideas Nietzsche says his own account corrects, and again at 9:12 "
     "with Hobbes and Hume as one of the English trio blamed for "
     "abasing philosophy -- quoted secondhand there via Schelling's "
     "dismissive French, \"Je meprise Locke.\"",
     'Locke|Locke\'s|LOCKE'),
    ('carlyle', 'Thomas Carlyle',
     "Called \"the absurd muddle-head\" and \"half-actor and "
     "rhetorician\" whose passionate grimaces conceal exactly what "
     "England lacks: real depth of intellect, i.e. philosophy.",
     'Carlyle'),
    ('bacon', 'Francis Bacon',
     "Named as representing, by himself, an \"attack on the "
     "philosophical spirit generally\" -- the opening figure in "
     "Chapter 9's roll call of English thinkers Nietzsche holds "
     "responsible for depreciating philosophy.",
     'Bacon'),
    ('demosthenes', 'Demosthenes',
     "Named with Cicero as an orator whose long, breath-spanning "
     "periods -- possible only because ancient audiences still read "
     "aloud -- modern readers, short of breath in every sense, no "
     "longer have any right to.",
     'Demosthenes'),
    ('cicero', 'Cicero',
     "Named with Demosthenes as a master of the classical, "
     "breath-defined period, part of Chapter 9's argument that German "
     "prose has lost its ear because Germans no longer read aloud.",
     'Cicero'),
    ('darwin', 'Charles Darwin',
     "Named, with John Stuart Mill and Herbert Spencer, as one of the "
     "\"respectable but mediocre Englishmen\" whose ascendancy in "
     "European taste Nietzsche treats as symptomatic rather than "
     "triumphant, even while granting that English narrowness suited "
     "his specific discoveries.",
     'Darwin'),
    ('john-stuart-mill', 'John Stuart Mill',
     "Named with Darwin and Herbert Spencer as one of the mediocre "
     "Englishmen whose truths appeal specifically to mediocre minds.",
     'John Stuart Mill'),
    ('herbert-spencer', 'Herbert Spencer',
     "Named with Darwin and Mill as the third of Chapter 9's mediocre "
     "but ascendant Englishmen.",
     'Herbert Spencer'),
    ('sybel', 'Heinrich von Sybel',
     "The German historian named, pluralized (\"the Sybels\"), as one "
     "type-example of the \"Prussian folly\" -- historians with, "
     "Nietzsche says, \"closely bandaged heads.\"",
     'Sybels'),
    ('treitschke', 'Heinrich von Treitschke',
     "The nationalist historian named, pluralized (\"the "
     "Treitschkes\"), alongside Sybel as the other type-example of "
     "Prussian historical folly.",
     'Treitschkes'),
    ('heinrich-heine', 'Heinrich Heine',
     "Named as having been \"reincarnated\" in the refined, fastidious "
     "lyrists of Paris -- one of the German exports France has "
     "quietly absorbed -- and later grouped among the \"good "
     "Europeans\" whose real allegiance outran their fatherlands.",
     'Heinrich Heine|Heine'),
    ('taine', 'Hippolyte Taine',
     "The French historian in whose work Hegel's influence is said "
     "now to exercise an almost tyrannical dominance over French "
     "thought -- called \"the first of living historians.\"",
     'Taine'),
    ('victor-hugo', 'Victor Hugo',
     "The writer whose funeral is cited as the occasion for a "
     "\"veritable orgy of bad taste\" and national self-admiration, "
     "evidence for Nietzsche of France's current besottedness.",
     'Victor Hugo'),
    ('stendhal', 'Stendhal',
     "The pen name of Henri Beyle, called \"the last great "
     "psychologist of France\": named as Stendhal for his aphorism "
     "that a good philosopher must be dry, clear, without illusion "
     "(Chapter 3), and as Henri Beyle for his Napoleonic tempo in "
     "surveying the European soul two generations ahead of his "
     "readers (Chapter 9).",
     'Stendhal|Henri Beyle'),
    ('wagner', 'Richard Wagner',
     "The composer whose overture to the Meistersinger opens Chapter "
     "9's long study of German music; his Kundry (Chapter 3) staged "
     "the religious neurosis as Schopenhauerian confession, his "
     "riddles of the German soul are said to be the ones Hegel had "
     "already systematized, and the chapter's climax names him -- "
     "alongside Napoleon and Goethe -- among the handful of true "
     "\"good Europeans,\" his Siegfried and Parsifal both weighed at "
     "length.",
     'Wagner|Wagner\'s', 'major'),
    ('beethoven', 'Ludwig van Beethoven',
     "Contrasted at length with Mozart as the \"intermediate event\" "
     "between an old mellow soul and a future over-young one -- his "
     "music carries, Nietzsche says, the same twilight of loss and "
     "hope in which Europe dreamed with Rousseau and danced toward "
     "Napoleon.",
     'Beethoven'),
    ('mozart', 'Wolfgang Amadeus Mozart',
     "Called the last echo of a great, centuries-old European taste "
     "-- his rococo delicacy, tenderness, and belief in the South are "
     "said still to speak to something left in \"us,\" unlike "
     "Beethoven's more fragile appeal.",
     'Mozart'),
    ('rousseau', 'Jean-Jacques Rousseau',
     "Named as the starting point of the historical arc Beethoven's "
     "music is said to carry -- Europe \"dreamed with Rousseau\" "
     "before dancing around the Tree of Liberty and falling into "
     "adoration of Napoleon.",
     'Rousseau'),
    ('schiller', 'Friedrich Schiller',
     "Named among the poets (with Rousseau, Shelley and Byron) whose "
     "language now sounds strange to modern ears despite once voicing "
     "the same European fate Beethoven's music sang; a footnote in "
     "original-en also traces one phrase to his play William Tell.",
     'Schiller|Schiller\'s'),
    ('shelley', 'Percy Bysshe Shelley',
     "Named with Rousseau, Schiller and Byron as one of the Romantic "
     "poets whose collective voice, once able to speak Europe's fate, "
     "now sounds difficult to fully grasp.",
     'Shelley'),
    ('byron', 'Lord Byron',
     "Named among the Romantic poets whose voice has faded from "
     "modern ears; his Manfred is also the basis for the Schumann "
     "composition Nietzsche calls a \"mistake and a "
     "misunderstanding,\" and he appears again in Chapter 10 among "
     "the great poets whose \"work\" invented the men later "
     "reverenced as their authors.",
     'Byron'),
    ('weber', 'Carl Maria von Weber',
     "The composer of Der Freischutz and Oberon, named as belonging "
     "to a Romanticism already extinct, though not yet forgotten, in "
     "German music.",
     'Weber'),
    ('marschner', 'Heinrich Marschner',
     "The composer of Hans Heiling and Der Vampyr, grouped with Weber "
     "as another representative of the fading Romantic school of "
     "German opera.",
     'Marschner\'s'),
    ('mendelssohn', 'Felix Mendelssohn',
     "Called \"that halcyon master,\" whose lighter, purer, happier "
     "soul won quick admiration and was just as quickly forgotten -- "
     "the \"beautiful episode\" of German music.",
     'Felix Mendelssohn|Mendelssohn'),
    ('schumann', 'Robert Schumann',
     "The composer treated at length as the point where German music "
     "became merely national rather than European: his Manfred is "
     "called a mistake, his taste \"fundamentally petty,\" and his "
     "\"surmounting\" a relief precisely because it ends a danger "
     "Beethoven and Mozart never posed.",
     'Robert Schumann|Schumann|Schumann\'s'),
    ('siegfried', 'Siegfried',
     "The hero of Wagner's Ring, called Wagner's most remarkable, "
     "permanently inimitable creation -- \"too free, too hard, too "
     "cheerful, too healthy\" for the taste of older, more mellow "
     "civilizations, and, Nietzsche says, almost a sin against "
     "Romanticism.",
     'Siegfried'),
    ('delacroix', 'Eugene Delacroix',
     "Named as the artist nearest related to Wagner among the great "
     "European Romantics -- grouped with Napoleon, Goethe, Beethoven, "
     "Stendhal, Heine and Schopenhauer as one who outgrew any single "
     "fatherland.",
     'Delacroix'),
    ('balzac', 'Honore de Balzac',
     "Cited near the start of Chapter 7 for the phrase \"montrer ses "
     "plaies\" (to show one's wounds); named again in Chapter 9 as an "
     "example of the tireless, self-destroying worker unable to "
     "achieve a noble tempo or lento in life.",
     'Balzac'),
    ('bizet', 'Georges Bizet',
     "The composer credited with having made music \"for\" the \"good "
     "Europeans\" who love both North and South at once -- his work is "
     "called the discovery of \"a piece of the South in music.\"",
     'BIZET|Bizet'),

    # --- Chapter 10: What Is Noble? ---
    ('schopenhauer', 'Arthur Schopenhauer',
     "Discussed at greater length than almost anyone else in the "
     "book: his account of the will is picked apart in Chapter 1, his "
     "pessimism is the background of Chapter 3's religious crisis "
     "(with Wagner's Kundry its \"genuine Schopenhauerian "
     "consequence\"), Chapter 6 quotes his Grundprobleme der Ethik at "
     "length and notes, drily, that this repudiator of God still "
     "played the flute every day after dinner, and Chapter 9 counts "
     "him among the true \"good Europeans.\"",
     'Schopenhauer|Schopenhauer\'s', 'major'),
    ('rath-schlosser', 'Rath Schlosser',
     "Johann Georg Schlosser, Goethe's brother-in-law and the "
     "addressee of the letter Nietzsche quotes as Chapter 10's "
     "epigraph: \"One can only truly esteem him who does not look out "
     "for himself.\"",
     'Rath Schlosser'),
    ('raphael', 'Raphael',
     "Invoked in the phrase \"Raphael without hands\" -- Nietzsche's "
     "figure for genius that lacks the sheer number of hands needed to "
     "seize the right moment.",
     'Raphael'),
    ('horace', 'Horace',
     "Quoted in Latin (\"naturam expellere... usque recurret\") on the "
     "impossibility of driving out nature with a pitchfork -- cited as "
     "the source any truthfulness-preaching educator would eventually "
     "have to reach for.",
     'Horace|Horace\'s'),
    ('dr-marianus', 'Dr. Marianus',
     "The character from Goethe's Faust, Part II, whose line -- \"Here "
     "is the prospect free, the mind exalted\" -- is quoted (with "
     "attribution given only in a footnote) to introduce the reverse "
     "kind of man who is also on a height but looks downward.",
     'Dr. Marianus'),
    ('dionysus', 'Dionysus',
     "The god who names himself only near the close of Chapter 10 as "
     "\"the tempter-god and born rat-catcher of consciences\" -- "
     "Nietzsche's own last disciple and initiate, distinct from the "
     "tyrant Dionysius of Syracuse named in Chapter 1.",
     'Dionysus|DIONYSUS'),
    ('ariadne', 'Ariadne',
     "Named as present at Dionysus's side when the god confesses, "
     "\"under certain circumstances I love mankind\" -- the mythic "
     "consort Nietzsche would return to repeatedly in his later "
     "notebooks.",
     'Ariadne'),
    ('sphinx', 'the Sphinx',
     "The riddling monster of the Oedipus myth, twice personified as "
     "a figure of dangerous, ambiguous knowledge -- \"which of us is "
     "the Oedipus here? Which the Sphinx?\" in the Preface's opening "
     "pages, and \"the Sphinx, too, is a Circe\" in Chapter 7.",
     'Sphinx'),
    ('oedipus', 'Oedipus',
     "Named twice as the figure of fearless, unblinking insight: "
     "paired with the Sphinx in the Preface's opening question about "
     "who is asking whom, and again in Chapter 8's image of \"fearless "
     "Oedipus-eyes\" turned on nature itself.",
     'Oedipus'),

    # --- Chapter 11: From the Heights (poem) ---
    ('zarathustra', 'Zarathustra',
     "Nietzsche's own prophet-figure from Thus Spoke Zarathustra, "
     "named in the closing poem's final stanza as the long-awaited "
     "\"Guest of Guests\" whose arrival ends the poem's long, lonely "
     "waiting.",
     'Zarathustra'),
    ('hercules', 'Hercules',
     "Named for the constellation, not the labors: Nietzsche says he "
     "is pleased to hear the sun is moving rapidly toward it, and "
     "hopes \"good Europeans\" will do likewise.",
     'Hercules'),
    ('wotan', 'Wotan',
     "The Norse/Germanic god quoted via an old Scandinavian saga -- "
     "\"Wotan placed a hard heart in my breast\" -- Nietzsche's chosen "
     "epigraph for the proud, self-mastering Viking soul at the "
     "center of master-morality.",
     'Wotan'),
    ('athena', 'Pallas Athene',
     "The Greek goddess invoked as the figure Spinoza's mathematical "
     "\"mail and mask\" was meant to terrify any assailant away from "
     "approaching, as though she were an \"invincible maiden.\"",
     'Pallas Athene|Pallas Athena'),
]:
    add(*row)

ids = [e['id'] for e in entities]
assert len(ids) == len(set(ids)), f'duplicate id: {[i for i in ids if ids.count(i) > 1]}'

BASE = Path(__file__).resolve().parent
(BASE / 'editorial.json').write_text(json.dumps(dict(
    bookId='beyond-good-and-evil',
    contentVersion='2026-09-12.1',
    coverage=(
        'Preface, all nine numbered chapters, and the closing poem "From the '
        'Heights" in both English editions. An aphoristic philosophical work '
        'naming more real historical, mythological and literary figures than any '
        'prior Lane A book -- almost every entry is Reference. Eight entries are '
        'Major for sustained, repeated engagement across multiple chapters: Plato, '
        'Socrates, Kant, Pascal, Goethe, Napoleon, Wagner, and Schopenhauer. Two '
        'genuine namesake collisions ("Frederick" names two different men; "Sand" '
        'names two different people) resolved by location-scoped binding rather '
        'than a shared alias; see build_beyond_good_and_evil.py and README.md.'
    ),
    entities=entities,
), ensure_ascii=False, indent=2) + '\n')

if __name__ == '__main__':
    print(f'{len(entities)} entities written to editorial.json')
