"""Manually authored recognition copy for Thoreau's Walden.

Covers all eighteen chapters in both English editions. Like Meditations and
Confessions, Walden addresses no one in particular and has almost no plot;
per editorial policy's guidance for treatises ("cited thinkers normally
remain references"), the great majority of entries are Reference -- a
philosopher or explorer cited once to make a point, a god named in a
mocking or admiring aside, an ancient authority quoted for a fact about
farming or entomology. What makes Walden's cast larger and stranger than
Meditations' is that alongside the philosophers there is a genuine local
cast: real, named former inhabitants of Walden Woods (formerly enslaved
neighbors, an Irish ditcher, a family of potters), real Concord
contemporaries (a tenant farmer, a miserly neighbor, town-clerk ledger
entries), and two chapter-length episodes staged as dialogue with capitalized
speaker tags.

Central: **Thoreau** himself, the narrator, present on every page but never
once named in the running text (the book is written entirely in the first
person, "I"). Per editorial policy's instruction not to cast a treatise's
or memoir's own narrator as a spoken-of character, this entry carries no
bindable alias, the same treatment Meditations gives Marcus Aurelius and
Confessions gives Augustine.

No entity here reaches Major: unlike Confessions, Walden has no sustained
human companion who recurs across many chapters by name -- the two
recurring un-named visitors real-world scholarship identifies as Ellery
Channing and Bronson Alcott (Chapter 14's "poet" and "philosopher," never
given a proper name in the text) are deliberately left unbound; see check 4.

Supporting (each gets a dedicated narrative paragraph or scene, the same
standard Meditations' README applies to Book 1's named teachers): **John
Field** (the Irish tenant farmer of the Baker Farm episode, Chapter 10),
**Cato Ingraham**, **Brister Freeman**, **Fenda**, **Zilpha**, and **Hugh
Quoil** (the formerly enslaved and immigrant former residents of Walden
Woods portrayed in Chapter 14), **John Farmer** (the parable figure of
Chapter 11's closing vignette), and the **Hermit** and **Poet** of Chapter
12's staged dialogue (capitalized speaker tags, not proper names, but the
book's only philosophical-dialogue participants -- per editorial policy's
guidance to classify dialogue participants by their part in it).

Five genuine namesake collisions, three resolved by location-scoped
binding in build_walden.py, two resolved by plain global aliases and
longest-span-first with no location scoping needed:

- **"Cato"** names two different men with no shared global alias: Marcus
  Porcius Cato the Elder, the Roman agricultural writer quoted four times
  for farming advice (1:102, 2:6, 7:19, 13:5), and Cato Ingraham, the
  formerly enslaved Concord resident of Chapter 14 (14:1 x3, 14:11) --
  whom Thoreau's own text explicitly disambiguates in the same breath:
  "Cato, not Uticensis, but Concordiensis." Neither the Roman Cato of
  Utica (Cato the Younger) nor Cato the Elder is ever confused with him in
  the text; the joke is Thoreau's own.
- **"Nutting"** and **"Stratton"** each name two different people: a bare
  surname in Chapter 14 (a former-inhabitant family, no first name given)
  and a full name in Chapter 15 (Sam Nutting the bear-hunter; Hezekiah
  Stratton, a French-war sergeant, quoted from an old trader's ledger) --
  each followed later in the same Chapter 15 sentence by a bare backward
  reference to the just-named individual, which would otherwise collide
  with the Chapter 14 family's bare surname. Both resolve the same way:
  the Chapter 15 individual carries the full-name global alias; the
  Chapter 14 family carries no global alias and is bound only by
  location-scoped match.
- **"Adam"** is a clean split resolved with no location scoping: the
  biblical Adam (six mentions, bare) and Adam Smith the economist (one
  mention, always with "Smith," 1:79) resolve via longest-span-first, the
  same pattern Meditations uses for Fabius/Fabius Catulinus.
- **"Say"** is not a namesake collision but a common-word collision: Jean-
  Baptiste Say, the economist named once alongside Adam Smith and Ricardo
  (1:79), shares his surname with the ordinary English verb "say," which
  the text also capitalizes at two sentence-openings (12:1, 18:16). Say
  carries no global alias at all and is bound only by a location-scoped
  match at 1:79, so the two unrelated capitalized "Say"s are never
  touched.

This translation shows no footnote-apparatus contamination between
editions, unlike Aristotle's Politics.
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
    ('thoreau', 'Thoreau',
     "The book's narrator, recounting the two years he spent living alone "
     "in a self-built cabin at Walden Pond. Written entirely in the first "
     "person, the book never names him; per editorial policy, a memoir's "
     "own narrator is not cast as a spoken-of character, so this entry "
     "carries no bindable alias.",
     '', 'central', 'person'),

    # --- Supporting: the real local cast ---
    ('john-field', 'John Field',
     "An honest, hard-working, but shiftless Irish tenant farmer at the "
     "Baker Farm, visited during a thunderstorm in Chapter 10; Thoreau "
     "tries, without success, to persuade him that his laborious pursuit "
     "of tea, coffee, and meat is what keeps him poor.",
     'John Field|Field', 'supporting', 'person'),
    ('cato-elder', 'Cato',
     "Marcus Porcius Cato the Elder, the Roman statesman and "
     "agricultural writer, quoted four times on farming and household "
     "management from his De Re Rustica -- including the recipe Thoreau "
     "follows for his own kneaded bread. Never confused in the text with "
     "Cato Ingraham, the formerly enslaved Concord resident of Chapter "
     "14, who is bound separately and carries no global alias.",
     'Cato', 'reference', 'person'),
    ('cato-ingraham', 'Cato Ingraham',
     "A formerly enslaved man, held by Duncan Ingraham of Concord village, "
     "who built him a house and let him live in Walden Woods; Thoreau "
     "notes the half-obliterated cellar hole that was his home, and that "
     "he is not to be confused with either Roman Cato -- \"Cato, not "
     "Uticensis, but Concordiensis.\"",
     '', 'supporting', 'person'),
    ('brister-freeman', 'Brister Freeman',
     "A formerly enslaved man, \"a handy Negro,\" held by Squire Cummings, "
     "who planted the apple trees still bearing wild fruit on Brister's "
     "Hill; his gravestone in the old Lincoln burying-ground styles him "
     "\"Sippio Brister\" -- a name Thoreau hears echoing Scipio Africanus.",
     'Brister Freeman|Brister', 'supporting', 'person'),
    ('fenda', 'Fenda',
     "Brister Freeman's wife, \"large, round, and black,\" who told "
     "fortunes hospitably and shared his house on Brister's Hill.",
     'Fenda', 'supporting', 'person'),
    ('zilpha', 'Zilpha',
     "A colored woman who spun linen for the townsfolk in a small house "
     "near Thoreau's bean-field, singing shrilly as she worked; her "
     "dwelling was burned by English prisoners of war in 1812 while she "
     "was away, killing her cat, dog, and hens.",
     'Zilpha', 'supporting', 'person'),
    ('hugh-quoil', 'Hugh Quoil',
     "The last inhabitant of Walden Woods before Thoreau, an Irish "
     "ditcher known as \"Col. Quoil,\" reputed to have fought at Waterloo; "
     "a man of manners and civil speech despite his poverty and "
     "trembling delirium, he died in the road at the foot of Brister's "
     "Hill shortly after Thoreau's arrival.",
     'Hugh Quoil|Quoil', 'supporting', 'person'),
    ('john-farmer', 'John Farmer',
     "A parable figure of Chapter 11: a laborer who, resting after a hard "
     "day's work, hears a flute and feels called to a higher life than "
     "his \"mean moiling\" one, though he cannot see how to answer the "
     "call beyond a new austerity of mind.",
     'John Farmer|Farmer', 'supporting', 'dramatic-role'),
    ('hermit', 'Hermit',
     "Thoreau's own voice in Chapter 12's staged dialogue -- a would-be "
     "contemplative interrupted mid-meditation by the Poet's proposal to "
     "go fishing, and unable to resist.",
     'Hermit', 'supporting', 'dramatic-role'),
    ('poet', 'Poet',
     "The Hermit's fishing companion in Chapter 12's staged dialogue, "
     "identified with no other name; real-world scholarship reads him as "
     "Thoreau's friend and fellow writer William Ellery Channing, but the "
     "text itself never supplies that name.",
     'Poet', 'supporting', 'dramatic-role'),

    # --- Reference: Concord contemporaries and records ---
    ('duncan-ingraham', 'Duncan Ingraham',
     "A gentleman of Concord village who enslaved Cato Ingraham and built "
     "him the house in Walden Woods where he was permitted to live.",
     'Duncan Ingraham', 'reference', 'person'),
    ('squire-cummings', 'Squire Cummings',
     "The Concord man who enslaved Brister Freeman.",
     'Squire Cummings|Cummings', 'reference', 'person'),
    ('stratton-family', 'the Stratton family',
     "A former-inhabitant family whose homestead and orchard once "
     "covered the slope of Brister's Hill, named only by surname, with "
     "no individual member identified; not to be confused with Hezekiah "
     "Stratton, named later in the ledger excerpt of Chapter 15.",
     '', 'reference', 'family'),
    ('breed-family', 'the Breed family',
     "A former-inhabitant family whose hut, the site of a famous local "
     "house-fire Thoreau describes at length, stood near the edge of the "
     "wood closer to the village.",
     'Breed', 'reference', 'family'),
    ('nutting-le-grosse', 'Nutting and Le Grosse',
     "Two former inhabitants named together, who lived where a well and "
     "lilac bushes still mark an open field; nothing else is told of "
     "them. Not to be confused with Sam Nutting, named later in Chapter "
     "15.",
     '', 'reference', 'person'),
    ('wyman-elder', 'Wyman the potter',
     "A potter who squatted farther into the woods than any other former "
     "inhabitant, furnished the town with earthenware, and left "
     "descendants who continued the trade after him; the last inhabitant "
     "before Hugh Quoil, who occupied \"Wyman's tenement.\"",
     'Wyman the potter|Wyman', 'reference', 'person'),
    ('wyman-younger', 'Wyman the younger',
     "Wyman the potter's descendant, who continued the family trade and "
     "later disappeared; a travelling pottery-dealer who had once bought "
     "a wheel from him stops to ask Thoreau what became of him.",
     'Wyman the younger', 'reference', 'person'),
    ('sam-nutting', 'Sam Nutting',
     "A bear-hunter on Fair Haven Ledges who traded skins for rum in "
     "Concord village and once claimed to have seen a moose there; owner "
     "of the famous fox-hound Burgoyne. Not to be confused with the "
     "unrelated former-inhabitant family of the same surname in Chapter "
     "14.",
     'Sam Nutting', 'reference', 'person'),
    ('burgoyne-hound', 'Burgoyne',
     "Sam Nutting's famous fox-hound, borrowed by Thoreau's informant; "
     "Nutting himself pronounced the name \"Bugine.\"",
     'Burgoyne', 'reference', 'animal'),
    ('hezekiah-stratton', 'Hezekiah Stratton',
     "A Concord man credited in an old trader's ledger with a wild-cat "
     "skin in 1743; a sergeant in the French war, and so not one who "
     "would have gotten credit for hunting less noble game. Not to be "
     "confused with the unrelated Stratton family of Chapter 14.",
     'Hezekiah Stratton', 'reference', 'person'),
    ('john-melven', 'John Melven',
     "A Concord man credited in an old trader's ledger with a grey fox "
     "skin in January 1742/3.",
     'John Melven', 'reference', 'person'),
    ('mr-gilian-baker', 'Mr. Gilian Baker',
     "A Lincoln farmer near the pond whose household kept an unusual "
     "\"winged cat,\" which Thoreau visited and describes in Chapter 12.",
     'Mr. Gilian Baker|Gilian Baker', 'reference', 'person'),
    ('mr-coleman', 'Mr. Coleman',
     "Henry Coleman, the Massachusetts agricultural commissioner whose "
     "published farm reports Thoreau twice notes did not cover his "
     "bean-field.",
     'Mr. Coleman|Coleman', 'reference', 'person'),
    ('luther-blanchard', 'Luther Blanchard',
     "A Concord Minuteman wounded at the Battle of Concord, invoked as a "
     "point of comparison in the mock-heroic account of Thoreau's ant "
     "battle.",
     'Luther Blanchard', 'reference', 'person'),
    ('buttrick', 'Buttrick',
     "Major John Buttrick, who commanded the Concord Minutemen at the "
     "North Bridge; his order \"Fire! for God's sake fire!\" is echoed in "
     "the mock-heroic account of Thoreau's ant battle.",
     'Buttrick', 'reference', 'person'),
    ('davis-hosmer', 'Davis and Hosmer',
     "Isaac Davis and Abner Hosmer, the two Concord Minutemen killed at "
     "the Battle of Concord, named together as the human dead whose fate "
     "the ant battle's carnage is mock-heroically compared to.",
     'Davis and Hosmer', 'reference', 'person'),

    # --- Reference: cited authors, explorers, and historical figures ---
    ('homer', 'Homer',
     "The Greek epic poet; Thoreau keeps the Iliad on his table through "
     "the summer, reads a passage of it aloud in translation to a "
     "woodchopper acquaintance, and cites Alexander's habit of carrying "
     "it on campaign.",
     'Homer', 'reference', 'person'),
    ('aeschylus', 'Æschylus',
     "The Greek tragedian, named alongside Homer as a classic never yet "
     "printed in English translation worth the name.",
     'Æschylus', 'reference', 'person'),
    ('virgil', 'Virgil',
     "The Roman poet, named alongside Homer and Æschylus as a classic "
     "author.",
     'Virgil', 'reference', 'person'),
    ('alexander-the-great', 'Alexander',
     "Alexander the Great, who is said to have carried the Iliad with "
     "him on his expeditions in a precious casket.",
     'Alexander', 'reference', 'person'),
    ('mir-camar-uddin-mast', 'Mîr Camar Uddîn Mast',
     "A poet Thoreau quotes on the pleasure of reading, comparing it to "
     "intoxication by wine.",
     'Mîr Camar Uddîn Mast', 'reference', 'person'),
    ('damodara', 'Damodara',
     "An epithet of Krishna in Hindu scripture; Thoreau quotes a saying "
     "attributed to him about the freedom of a vast horizon, spoken when "
     "his herds needed new pastures.",
     'Damodara', 'reference', 'religious-figure'),
    ('tching-thang', 'king Tching-thang',
     "A legendary Chinese emperor (Tang of Shang); Thoreau cites the "
     "characters said to be engraved on his bathing tub, urging daily "
     "renewal.",
     'Tching-thang', 'reference', 'person'),
    ('confucius', 'Confucius',
     "The Chinese philosopher, quoted several times under different "
     "transliterations of his name (Confucius, Khoung-tseu, Con-fut-see) "
     "on knowledge, virtue, and neighborliness.",
     'Confucius|Khoung-tseu|Con-fut-see', 'reference', 'person'),
    ('kieou-he-yu', 'Kieou-he-yu',
     "A great dignitary of the state of Wei, in the anecdote Thoreau "
     "quotes about sending a messenger to Confucius for news of his "
     "master.",
     'Kieou-he-yu', 'reference', 'person'),
    ('plato', 'Plato',
     "The Athenian philosopher; Thoreau reproaches himself for having "
     "his Dialogues on the shelf and never reading them, and later "
     "discusses Plato's definition of man as \"a biped without feathers.\"",
     'Plato', 'reference', 'person'),
    ('zoroaster', 'Zoroaster',
     "The ancient Persian religious teacher, invoked as an example of "
     "someone who had the same spiritual experience as a solitary hired "
     "man Thoreau knows, but treated it as universal wisdom rather than "
     "private singularity.",
     'Zoroaster', 'reference', 'religious-figure'),
    ('jesus-christ', 'Jesus Christ',
     "Named as one through whose liberalizing influence, along with all "
     "the worthies, a solitary man might commune and set aside sectarian "
     "religion.",
     'Jesus Christ', 'reference', 'religious-figure'),
    ('abelard', 'Abelard',
     "Peter Abelard, the medieval philosopher; Thoreau asks whether "
     "Concord could not hire some Abelard to lecture to it, as part of "
     "his argument that villages should fund culture as noblemen once "
     "did.",
     'Abelard', 'reference', 'person'),
    ('adam-biblical', 'Adam',
     "The first man of Genesis, cited as the origin of human tedium and "
     "ennui, and, with Eve, of the first clothing (the bower) worn "
     "before the Fall.",
     'Adam', 'reference', 'religious-figure'),
    ('eve-biblical', 'Eve',
     "The first woman of Genesis, named with Adam as driven from Eden, "
     "and as first wearing the bower of Paradise before any other "
     "clothing.",
     'Eve', 'reference', 'religious-figure'),
    ('adam-smith', 'Adam Smith',
     "The Scottish economist, named alongside Ricardo and Say as the "
     "\"political economy\" a poor student is taught in college while "
     "graduating in debt.",
     'Adam Smith', 'reference', 'person'),
    ('ricardo', 'Ricardo',
     "David Ricardo, the British economist, named alongside Adam Smith "
     "and Say.",
     'Ricardo', 'reference', 'person'),
    ('say-economist', 'Say',
     "Jean-Baptiste Say, the French economist, named alongside Adam "
     "Smith and Ricardo. His surname also happens to be an ordinary "
     "English verb, capitalized twice elsewhere at the start of a "
     "sentence; only this one mention names the economist.",
     '', 'reference', 'person'),
    ('sir-kenelm-digby', 'Sir Kenelm Digby',
     "The seventeenth-century English natural philosopher, quoted on "
     "the \"vital spirits\" attracted by fallow, exhausted soil.",
     'Sir Kenelm Digby|Kenelm Digby', 'reference', 'person'),
    ('kirby', 'Kirby',
     "William Kirby, co-author with Spence of a standard entomology "
     "text, cited on insects' feeding habits and on the history of "
     "recorded ant battles.",
     'Kirby', 'reference', 'person'),
    ('spence', 'Spence',
     "William Spence, Kirby's co-author, cited alongside him.",
     'Spence', 'reference', 'person'),
    ('thseng-tseu', 'Thseng-tseu',
     "Zengzi, a disciple of Confucius, quoted on the soul's absence from "
     "itself when the appetite masters perception: \"one eats, and one "
     "does not know the savor of food.\"",
     'Thseng-tseu', 'reference', 'person'),
    ('mencius', 'Mencius',
     "The Chinese philosopher, quoted on the thin margin that "
     "distinguishes men from brute beasts, and how easily the common "
     "herd loses it.",
     'Mencius', 'reference', 'person'),
    ('chaucers-nun', 'Chaucer’s nun',
     "The Canterbury Tales narrator Thoreau quotes and attributes to "
     "\"Chaucer's nun,\" on hunters not being unholy men. Chaucer's own "
     "name never appears in the text on its own -- only as part of this "
     "one phrase -- so there is no separate entry for Chaucer himself.",
     'Chaucer’s nun|Chaucer\'s nun', 'reference', 'dramatic-role'),
    ('huber', 'Huber',
     "François Huber, the Swiss entomologist Kirby and Spence credit as "
     "the only modern author to have witnessed a battle of ants "
     "firsthand.",
     'Huber', 'reference', 'person'),
    ('aeneas-sylvius', 'Æneas Sylvius',
     "Aeneas Sylvius Piccolomini, later Pope Pius II, quoted by Kirby "
     "and Spence for his circumstantial account of a battle of ants on a "
     "pear tree.",
     'Æneas Sylvius', 'reference', 'person'),
    ('eugenius-fourth', 'Eugenius the Fourth',
     "Pope Eugene IV, in whose pontificate the ant battle Æneas Sylvius "
     "describes is said to have taken place.",
     'Eugenius the Fourth', 'reference', 'person'),
    ('nicholas-pistoriensis', 'Nicholas Pistoriensis',
     "An eminent lawyer said to have witnessed and related the history "
     "of the ant battle Æneas Sylvius describes.",
     'Nicholas Pistoriensis', 'reference', 'person'),
    ('olaus-magnus', 'Olaus Magnus',
     "The Swedish churchman and writer who records a second ant battle, "
     "quoted by Kirby and Spence.",
     'Olaus Magnus', 'reference', 'person'),
    ('christiern-second', 'Christiern the Second',
     "Christian II of Denmark, the \"tyrant\" whose expulsion from Sweden "
     "the ant battle Olaus Magnus describes is said to have preceded.",
     'Christiern the Second', 'reference', 'person'),
    ('polk', 'Polk',
     "James K. Polk, President of the United States when Thoreau's own "
     "witnessed ant battle took place, per his mock-scholarly dating of "
     "the event.",
     'Polk', 'reference', 'person'),
    ('webster-daniel', 'Webster',
     "Daniel Webster, whose Fugitive-Slave Bill dates Thoreau's ant "
     "battle in Chapter 12, and who is later named, in Chapter 18, as "
     "the orator of an imagined national celebration presided over by "
     "God.",
     'Webster', 'reference', 'person'),
    ('samuel-laing', 'Samuel Laing',
     "The travel writer quoted on Laplanders sleeping unclothed on snow "
     "in reindeer-skin bags.",
     'Samuel Laing', 'reference', 'person'),
    ('winslow', 'Winslow',
     "Edward Winslow, later governor of the Plymouth Colony, whose "
     "account of a diplomatic visit to Massasoit -- warmly received but "
     "poorly fed and lodged -- Thoreau quotes at length.",
     'Winslow', 'reference', 'person'),
    ('massasoit', 'Massasoit',
     "The Wampanoag sachem who received Winslow's Plymouth delegation, "
     "sharing what little food his people had.",
     'Massasoit', 'reference', 'person'),
    ('benvenuto-cellini', 'Benvenuto Cellini',
     "The Italian Renaissance artist and memoirist, whose account of a "
     "halo seen over his own shadow after a vision in prison Thoreau "
     "compares to a phenomenon he has observed himself.",
     'Benvenuto Cellini|Cellini', 'reference', 'person'),
    ('guy-fawkes', 'Guy Faux',
     "Guy Fawkes, the Gunpowder Plot conspirator, named in a quoted poem "
     "about the Baker Farm.",
     'Guy Faux', 'reference', 'person'),
    ('william-gilpin', 'William Gilpin',
     "The English writer on landscape aesthetics, quoted on the "
     "dimensions and origin of Scotland's Loch Fyne, used as a point of "
     "comparison for Walden's own depth.",
     'William Gilpin|Gilpin', 'reference', 'person'),
    ('michaux', 'Michaux',
     "François André Michaux, the French botanist, quoted on the high "
     "price of firewood in early-nineteenth-century New York and "
     "Philadelphia.",
     'Michaux', 'reference', 'person'),
    ('nebuchadnezzar', 'Nebuchadnezzar',
     "The Babylonian king; Thoreau notes, of his second-hand chimney "
     "bricks, that he did not find this name inscribed on them, unlike "
     "the ancient bricks of Babylon that supply Mesopotamian villages "
     "with building material.",
     'Nebuchadnezzar', 'reference', 'person'),
    ('john-franklin', 'Franklin',
     "Sir John Franklin, the British Arctic explorer whose lost "
     "expedition was a major contemporary news story; Thoreau asks "
     "pointedly whether he is \"the only man who is lost.\"",
     'Franklin', 'reference', 'person'),
    ('mr-grinnell', 'Mr. Grinnell',
     "Henry Grinnell, the American philanthropist who funded search "
     "expeditions for Sir John Franklin.",
     'Mr. Grinnell', 'reference', 'person'),
    ('mungo-park', 'Mungo Park',
     "The Scottish explorer of West Africa, named among the explorers "
     "Thoreau urges his reader to become instead within their own mind.",
     'Mungo Park', 'reference', 'person'),
    ('lewis-explorer', 'Lewis',
     "Meriwether Lewis, of the Lewis and Clark expedition, named among "
     "the explorers of Chapter 18's closing exhortation.",
     'Lewis', 'reference', 'person'),
    ('clarke-explorer', 'Clarke',
     "William Clark, of the Lewis and Clark expedition, named alongside "
     "Lewis.",
     'Clarke', 'reference', 'person'),
    ('frobisher', 'Frobisher',
     "Sir Martin Frobisher, the English explorer who searched for the "
     "Northwest Passage, named among Chapter 18's explorers.",
     'Frobisher', 'reference', 'person'),
    ('columbus', 'Columbus',
     "Christopher Columbus, invoked as the model for exploring "
     "continents and worlds within oneself rather than geographic ones.",
     'Columbus', 'reference', 'person'),
    ('mirabeau', 'Mirabeau',
     "The Comte de Mirabeau, quoted on having taken to highway robbery "
     "to test what resolution was needed to defy society's most sacred "
     "laws -- a resolve Thoreau calls manly but idle.",
     'Mirabeau', 'reference', 'person'),
    ('kabir', 'Kabir',
     "The Indian poet-saint, whose verses are said to admit four "
     "different senses -- cited as a contrast to the demand, in "
     "Thoreau's own place and time, that writing admit only one "
     "interpretation.",
     'Kabir', 'reference', 'person'),
    ('croesus', 'Crœsus',
     "The proverbially wealthy king of Lydia, invoked to argue that even "
     "his riches would not change what a person's true aims and means "
     "must be.",
     'Crœsus', 'reference', 'person'),
    ('tom-hyde', 'Tom Hyde',
     "A tinker, hanged, whose last words on the gallows -- reminding "
     "tailors to knot their thread before the first stitch -- Thoreau "
     "offers as an example of truth over decorum.",
     'Tom Hyde', 'reference', 'person'),
    ('champollion', 'Champollion',
     "Jean-François Champollion, decipherer of Egyptian hieroglyphics, "
     "invoked rhetorically to ask who will decipher the \"hieroglyphic\" "
     "of the sand foliage on the railroad bank.",
     'Champollion', 'reference', 'person'),
    ('calidas', 'Calidas',
     "Kalidasa, the classical Sanskrit poet and dramatist, whose play "
     "Sacontala Thoreau quotes for its image of golden pollen-dust.",
     'Calidas', 'reference', 'person'),

    # --- Reference: mythological and legendary figures ---
    ('jupiter', 'Jupiter',
     "The chief god of the Roman pantheon; commerce, Thoreau notes, does "
     "not clasp its hands and pray to him, and Hebe, cupbearer to "
     "Jupiter, is invoked as a symbol of perpetual youth and health.",
     'Jupiter', 'reference', 'cultural-figure'),
    ('ceres', 'Ceres',
     "The Roman goddess of agriculture, to whom -- Thoreau argues -- "
     "modern farmers no longer sacrifice, worshipping the infernal "
     "Plutus instead.",
     'Ceres', 'reference', 'cultural-figure'),
    ('plutus', 'Plutus',
     "The Greek god of wealth, whom Thoreau says the modern farmer "
     "serves in place of Ceres.",
     'Plutus', 'reference', 'cultural-figure'),
    ('saturn', 'Saturn',
     "The Roman god of a legendary golden age, named as the ancestral "
     "king whose race the old Romans believed themselves alone left of, "
     "and again as the \"prostrate Saturn of an older dynasty\" one steps "
     "over on entering Thoreau's imagined communal hall.",
     'Saturn', 'reference', 'cultural-figure'),
    ('minerva', 'Minerva',
     "The Roman goddess of wisdom, invoked in an anecdote about her "
     "objection to a house Momus criticized for not being movable, and "
     "again as the master builder of an oil-and-wine-cellar-equipped "
     "villa.",
     'Minerva', 'reference', 'cultural-figure'),
    ('aurora', 'Aurora',
     "The Roman goddess of the dawn; Thoreau calls himself as sincere a "
     "worshipper of her as the Greeks, and all poets and heroes are "
     "called her children.",
     'Aurora', 'reference', 'cultural-figure'),
    ('memnon', 'Memnon',
     "The mythological son of Aurora, a byword for a statue that sang "
     "at dawn; invoked as the type of all poets and heroes, children of "
     "Aurora who emit their music at sunrise.",
     'Memnon', 'reference', 'cultural-figure'),
    ('hygeia', 'Hygeia',
     "The Greek goddess of health, daughter of Æsculapius; Thoreau "
     "declines to worship her, preferring Hebe instead.",
     'Hygeia', 'reference', 'cultural-figure'),
    ('aesculapius', 'Æsculapius',
     "The Greek and Roman god of medicine, named as Hygeia's father, "
     "\"that old herb-doctor.\"",
     'Æsculapius', 'reference', 'cultural-figure'),
    ('hebe', 'Hebe',
     "The Roman goddess of youth, cupbearer to Jupiter and daughter of "
     "Juno; Thoreau prefers her worship to Hygeia's, calling her the "
     "power to restore gods and men to the vigor of youth.",
     'Hebe', 'reference', 'cultural-figure'),
    ('juno', 'Juno',
     "The Roman queen of the gods, named as Hebe's mother.",
     'Juno', 'reference', 'cultural-figure'),
    ('atlas', 'Atlas',
     "The Titan condemned to bear the world on his shoulders, invoked "
     "when Thoreau describes his own eagerness to improve the Hollowell "
     "farm.",
     'Atlas', 'reference', 'cultural-figure'),
    ('hercules', 'Hercules',
     "The Greek and Roman demigod hero; his twelve labors are compared, "
     "unfavorably, to the burdens Thoreau's Concord neighbors have "
     "undertaken, and his strength is invoked again when Thoreau feels "
     "\"strength like Antæus\" from his beans.",
     'Hercules|Herculean', 'reference', 'cultural-figure'),
    ('cerberus', 'Cerberus',
     "The three-headed dog guarding the underworld in Greek myth, "
     "invoked as a figure for any host's overbearing insistence on "
     "feeding a guest.",
     'Cerberus', 'reference', 'cultural-figure'),
    ('vulcan', 'Vulcan',
     "The Roman god of fire, to whom Thoreau says he sacrificed an old "
     "forest fence for firewood.",
     'Vulcan', 'reference', 'cultural-figure'),
    ('terminus', 'Terminus',
     "The Roman god of boundaries, whom an old forest fence, past its "
     "usefulness, was said no longer to serve.",
     'Terminus', 'reference', 'cultural-figure'),
    ('brahma', 'Brahma',
     "The Hindu creator god, invoked in the parable of the artist of "
     "Kouroo, whose perfect staff becomes, at the moment of completion, "
     "one of the fairest of all of Brahma's creations.",
     'Brahma', 'reference', 'cultural-figure'),
    ('vishnu', 'Vishnu',
     "The Hindu preserver god, named alongside Brahma and Indra as a "
     "deity the servant of a Brahmin priest is said to worship.",
     'Vishnu', 'reference', 'cultural-figure'),
    ('indra', 'Indra',
     "The Hindu king of the gods, named alongside Brahma and Vishnu, and "
     "invoked earlier as the detached spectator in the sky Thoreau "
     "imagines himself as, watching the stream of events from above.",
     'Indra', 'reference', 'cultural-figure'),
    ('thor', 'Thor',
     "The Norse god of thunder, whose hammer -- which only breaks things "
     "in pieces -- is contrasted with the gentler, more powerful "
     "persuasion of the spring thaw.",
     'Thor', 'reference', 'cultural-figure'),
    ('atropos', 'Atropos',
     "One of the three Fates in Greek myth, who cuts the thread of "
     "life; Thoreau proposes her name for the unstoppable railroad "
     "engine, \"a fate ... that never turns aside.\"",
     'Atropos', 'reference', 'cultural-figure'),
    ('ulysses', 'Ulysses',
     "The hero of Homer's Odyssey, invoked as the model for sailing "
     "past the daily \"whirlpool\" of dinner \"tied to the mast,\" resisting "
     "distraction.",
     'Ulysses', 'reference', 'literary-figure'),
    ('achilles', 'Achilles',
     "The hero of Homer's Iliad; Thoreau translates his rebuke to "
     "Patroclus aloud to a woodchopper acquaintance, and later imagines "
     "a red ant as \"some Achilles\" avenging a fallen companion in the "
     "battle of the ants.",
     'Achilles', 'reference', 'literary-figure'),
    ('patroclus', 'Patroclus',
     "Achilles' companion in the Iliad, whose sad countenance Achilles "
     "rebukes in the passage Thoreau translates aloud, and whom the "
     "avenging red ant of the battle scene is compared to avenging.",
     'Patroclus', 'reference', 'literary-figure'),
    ('menoetius', 'Menœtius',
     "Patroclus's father, named in the Iliad passage Thoreau translates.",
     'Menœtius', 'reference', 'literary-figure'),
    ('peleus', 'Peleus',
     "Achilles' father, named in the same Iliad passage.",
     'Peleus', 'reference', 'literary-figure'),
    ('aeacus', 'Æacus',
     "Peleus's father and Achilles' grandfather, named in the same "
     "Iliad passage.",
     'Æacus', 'reference', 'literary-figure'),
    ('myrmidons', 'the Myrmidons',
     "Achilles' warriors in the Iliad, named in the translated passage; "
     "Thoreau later calls the legions of battling ants in his wood-yard "
     "\"these Myrmidons.\"",
     'Myrmidons', 'reference', 'group'),
    ('antaeus', 'Antæus',
     "The giant of Greek myth who drew his strength from contact with "
     "the earth; Thoreau says he got strength like his from cultivating "
     "his bean rows.",
     'Antæus', 'reference', 'literary-figure'),
    ('sirens', 'the Sirens',
     "The mythological singers whose voices lured sailors to their "
     "deaths; Thoreau says he escapes the village's gossip by keeping "
     "his thoughts on high things, \"like Orpheus,\" who drowned their "
     "voices with his own song.",
     'Sirens', 'reference', 'literary-figure'),
    ('orpheus', 'Orpheus',
     "The legendary musician of Greek myth, whose singing drowned out "
     "the Sirens' voices and kept him out of danger, a model Thoreau "
     "invokes for escaping the village's gossip.",
     'Orpheus', 'reference', 'literary-figure'),
    ('robin-hood', 'Robinhood',
     "The legendary English outlaw, named among those across history "
     "and rank who have all required a few sticks from the forest to "
     "warm them and cook their food.",
     'Robinhood', 'reference', 'literary-figure'),
    ('goody-blake', 'Goody Blake',
     "A character from Wordsworth's poem \"Goody Blake and Harry Gill,\" "
     "named alongside Harry Gill in the same passage as Robinhood.",
     'Goody Blake', 'reference', 'literary-figure'),
    ('harry-gill', 'Harry Gill',
     "The other title character of Wordsworth's poem, named alongside "
     "Goody Blake.",
     'Harry Gill', 'reference', 'literary-figure'),
    ('actaeon', 'Actæon',
     "The mythological hunter torn apart by his own hounds; Thoreau "
     "notes that the woods ring with hunting cries yet no fox bursts "
     "forth \"pursuing their Actæon.\"",
     'Actæon', 'reference', 'literary-figure'),
    ('toscar', 'Toscar',
     "A figure from the Ossianic poems, named as the father of the "
     "\"beautiful daughter\" mourned in a quoted verse.",
     'Toscar', 'reference', 'literary-figure'),
    ('pilpay', 'Pilpay',
     "The legendary Indian fabulist credited with the beast-fables of "
     "the Panchatantra, invoked (as \"Pilpay & Co.\") for having put "
     "animals to their best literary use as vehicles for human thought.",
     'Pilpay', 'reference', 'literary-figure'),
    ('robin-goodfellow', 'Robin Goodfellow',
     "The mischievous sprite of English folklore (later Shakespeare's "
     "Puck), invoked as a figure for an erratic, meddling sun that "
     "helps by fits and starts rather than steadily.",
     'Robin Goodfellow', 'reference', 'literary-figure'),
    ('reynard', 'Reynard',
     "The fox of medieval beast-fable tradition, invoked generically for "
     "the fox a black chicken at Hugh Quoil's abandoned house is said to "
     "be \"awaiting.\"",
     'Reynard', 'reference', 'literary-figure'),
    ('william-tell', 'Tell',
     "The legendary Swiss marksman; Thoreau says the punctuality the "
     "railroad has taught everyone makes them all \"sons of Tell.\"",
     'Tell', 'reference', 'literary-figure'),
    ('theseus', 'Theseus',
     "The legendary Athenian hero, named alongside Hercules and Achilles "
     "in the quoted closing verses of Chapter 1 as an example of heroic "
     "virtue \"for which antiquity hath left no name.\"",
     'Theseus', 'reference', 'literary-figure'),
    ('old-mortality', 'Old Mortality',
     "The title character of Walter Scott's novel, an old man who "
     "wanders Scotland re-cutting the inscriptions on covenanters' "
     "gravestones; Thoreau compares his philosopher-visitor to him, "
     "\"say rather an Immortality.\"",
     'Old Mortality', 'reference', 'literary-figure'),
]:
    add(*row)


ID = 'walden'
CONTENT_VERSION = '2026-09-12.1'

editorial = dict(
    bookId=ID,
    contentVersion=CONTENT_VERSION,
    entities=entities,
    coverage=(
        "Entities: 1 central (Thoreau, the narrator, never named -- no "
        "bindable alias), no major, 10 supporting (the real local cast of "
        "Chapters 10-12 and 14, plus the Hermit/Poet dialogue tags), the "
        "rest reference. Five namesake/common-word collisions: Cato "
        "(Elder vs. Ingraham, location-scoped), Nutting and Stratton "
        "(each a Chapter 14 family vs. a Chapter 15 named individual, "
        "location-scoped), Adam (biblical vs. Adam Smith, resolved by "
        "longest-span-first with no scoping needed), and Say (the "
        "economist Jean-Baptiste Say vs. the ordinary verb \"Say\" "
        "capitalized at two sentence-openings, bound only by a "
        "location-scoped match, no global alias). No footnote-apparatus "
        "contamination between editions, unlike Aristotle's Politics."
    ),
)

if __name__ == '__main__':
    out = Path(__file__).resolve().parent / 'editorial.json'
    out.write_text(json.dumps(editorial, indent=2, ensure_ascii=False) + '\n')
    print(f"Wrote {out} with {len(entities)} entities")
