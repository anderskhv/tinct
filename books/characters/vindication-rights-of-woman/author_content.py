"""Manually authored recognition copy for Mary Wollstonecraft's A
Vindication of the Rights of Woman.

15 chapters (edition numbering: 1 Dedication, 2 Introduction, 3-15 the
book's own "Chapter 1" through "Chapter 13"), 778 paragraphs, identical
structure in both English editions. This is a polemical treatise
addressed to a named dedicatee (M. Talleyrand-Perigord, then Bishop of
Autun) and argued almost entirely in the author's own first-person
voice, with no narrative cast: nobody experiences events, nobody speaks
in a staged dialogue except where the text quotes another author's own
fictional dialogue at length. Per editorial policy's guidance for
treatises -- "provide useful people/reference identification without
inventing a fictional cast or calling the author a protagonist" and
"cited thinkers normally remain references" -- every entry here is
Reference, including Rousseau, who receives by far the most sustained
engagement (the whole of chapter 7/"Chapter 5" section 5.1, roughly 60
paragraphs, quotes and rebuts Emile point by point) but is still, in the
end, a cited author being argued with, not a participant in anything the
book itself dramatizes. The author is never named in the running text
(the Dedication is signed only "M. W.") and gets no entry.

The cast is instead a very large flat list of cited or invoked persons:
contemporary conduct-book writers (Rousseau, Dr. Gregory, Dr. Fordyce,
Lord Chesterfield) who are the book's actual argumentative targets;
women writers praised or criticized in passing (Catharine Macaulay, the
Baroness de Stael, Madame Genlis, Mrs. Chapone, Mrs. Piozzi, Mrs.
Barbauld); a long tail of one-off citations (Johnson, Locke, Priestley,
Bacon, Dryden, Cowper, Cowley, Swift, Shakespeare, Richardson, Leibnitz,
Hume, Knox, Boswell, Milton, Pope, Newton, Washington, Fabricius, Cato,
Cicero, Butler, Forster, Swedenborg, Hervey); named biblical and
mythological figures invoked for a comparison (Moses, Solomon, Adam,
Eve, Satan, Jesus Christ, Peter, Mahomet, Diana, Argus, Pallas, Hymen,
Cerberus); and fictional characters from the books under discussion
(Rousseau's Emilius, Sophia, and St. Preux; Richardson's Clarissa and
Lovelace; Shakespeare's Hamlet and Macbeth; Cervantes's Quixote; a stray
"Ranger" quoted for a single line).

Two real editorial hazards, both resolved from the text itself:

1. **Talleyrand and Catherine the Great are named only by title, never
   by their own names, in the paragraph text that can be bound.**
   Talleyrand appears by name only in the chapter-1 TITLE metadata
   ("Dedication. To M. Talleyrand Perigord, Late Bishop of Autun") --
   not bindable paragraph text -- and the Dedication's own body
   addresses him only as "Sir." But the book cites his own pamphlet on
   national education twice in running prose, both times by his
   ecclesiastic title alone: "a very sensible pamphlet written by the
   late bishop of Autun" and, in parentheses, "(The Bishop of Autun)".
   Given the unambiguous cross-reference to the dedicatee and his
   documented 1791 "Rapport sur l'instruction publique," this is bound
   as a genuine (if title-only) person-mention, the same treatment
   Walden gave "Wyman the potter" and other by-epithet references. The
   Empress of Russia (Catherine the Great, reigning in 1792) is named
   the same way, once, in a list of exceptional women -- bound via the
   full phrase "Empress of Russia" rather than the bare place name
   "Russia" (which recurs once elsewhere, in an unrelated aside about
   the whip trade, and must not be mistaken for her).

2. **A genuine namesake collision: "Eloisa" names two different women.**
   At (4, 51) "Rousseau make[s] the mistress of his soul, Eloisa, love
   St. Preux" -- unambiguously Julie, the heroine of his novel La
   Nouvelle Heloise, given the surrounding "St. Preux" and "Rousseau."
   At (6, 85) the SAME spelling, "Eloisa," appears in a list of real
   historical women "who, from having received a masculine education,
   have acquired courage and resolution" -- Sappho, [Eloisa,] Mrs.
   Macaulay, the Empress of Russia, Madame d'Eon -- a context that only
   fits the real medieval Heloise (Abelard's pupil and correspondent,
   famed for her learning), not Rousseau's fictional heroine. A third
   occurrence, at (9, 21), uses the alternate spelling "Heloisa" for "a
   woman [who] gives up all the world, deliberately, for love" -- the
   real Heloise's own most famous words (she is on record preferring to
   be Abelard's mistress than the world's empress), so this is also the
   historical Heloise. Because the identical string "Eloisa" is used for
   both women, neither entity carries a global alias for it; both are
   bound only at their confirmed locations by a custom `bind()`, exactly
   as Walden's Cato collision was resolved.

One common-word hazard, resolved the same way as Walden's "Say" and
"Cato": **"Day"** (Thomas Day, author of "Sandford and Merton," quoted
at length in a footnote) is never given a global alias, since "day" is
an ordinary word throughout the book; it is bound only at its one
confirmed prose location, (5, 9), "Mr. Day's 'Sandford and Merton.'"

Every other entity below carries a plain, safe global alias: none of the
remaining ~60 surnames, first names, or mythological/fictional names
recur anywhere else in the book with a different referent (verified by
an exhaustive `\b[A-Z][a-z']+\b` frequency sweep of both editions plus a
direct read of every paragraph).

Deliberately unbound (see README's editorial checks for the full
reasoning): the plural, generic "these Rebekahs" (12, 3), which
characterizes a type rather than naming the biblical Rebekah herself;
the group/demonym references "Pharisees," "Essenes," "the Jews" (9, 29;
10, 12), "Spartans"/"the Spartan" (3, 16; 4, 22), "Sybarites" (5, 20),
and "Turkish bashaws" (5, 6); the fictional non-human races "Yahoos" and
"Houyhnhnm" from Gulliver's Travels (7, 158); and "Pantaloon" (7, 156), a
generic commedia dell'arte stock type, not a specific individual.
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
    # --- Reference: the book's principal argumentative targets ---
    ('rousseau', 'Rousseau',
     "Jean-Jacques Rousseau, the book's central argumentative target. "
     "Chapter 7/\"Chapter 5\" section 5.1 quotes and rebuts his Emile "
     "point by point on the education of Sophia; he recurs constantly "
     "elsewhere, including once by the epithet \"the citizen of Geneva\" "
     "(his own proud self-description, since he was born there).",
     'Rousseau', 'reference', 'person'),
    ('dr-gregory', 'Dr. Gregory',
     "John Gregory, physician and author of \"A Father's Legacy to His "
     "Daughters,\" whose advice that a wife conceal the extent of her "
     "affection, and that a woman never let a suitor know she has "
     "cultivated delicacy of sentiment, is examined at length and "
     "rejected as \"noble morality!\" in bitter irony.",
     'Gregory', 'reference', 'person'),
    ('dr-fordyce', 'Dr. Fordyce',
     "James Fordyce, author of \"Sermons to Young Women,\" a bestselling "
     "conduct book criticized for its florid, sentimental style and for "
     "urging women toward a submissive, decorative piety.",
     'Fordyce', 'reference', 'person'),
    ('lord-chesterfield', 'Lord Chesterfield',
     "Philip Stanhope, 4th Earl of Chesterfield, quoted for boasting of "
     "having \"endeavoured to gain the hearts of twenty women, whose "
     "persons [he] would not have given a fig for,\" and criticized "
     "again for his \"Letters\" and their advice on acquiring an early, "
     "cynical knowledge of the world.",
     'Chesterfield', 'reference', 'person'),

    # --- Reference: women writers discussed by name ---
    ('catharine-macaulay', 'Catharine Macaulay',
     "The historian and political writer, praised at length as \"the "
     "woman of the greatest abilities...that this country has ever "
     "produced,\" whose style shows \"no sex\" and whose recent death is "
     "mourned; also quoted on the disproportionate ruin a single lapse "
     "brings to a woman's reputation.",
     'Macaulay', 'reference', 'person'),
    ('germaine-de-stael', 'the Baroness de Stael',
     "Germaine de Stael, quoted at length from her published eulogy of "
     "Rousseau, which is criticized for excusing his contempt for "
     "women's reason in exchange for his \"adoration\" of their persons.",
     'Stael', 'reference', 'person'),
    ('madame-genlis', 'Madame Genlis',
     "Stephanie Felicite, comtesse de Genlis, author of popular "
     "children's books and \"Letters on Education,\" criticized for "
     "insisting on blind submission to parents and to the opinion of "
     "the world even against a child's own convictions.",
     'Genlis', 'reference', 'person'),
    ('hester-chapone', 'Mrs. Chapone',
     "Hester Chapone, author of the well-regarded \"Letters on the "
     "Improvement of the Mind,\" mentioned briefly and respectfully, "
     "though not always agreed with.",
     'Chapone', 'reference', 'person'),
    ('hester-piozzi', 'Mrs. Piozzi',
     "Hester Thrale Piozzi, quoted addressing a newly married man with "
     "advice that a woman will forgive an affront to her understanding "
     "sooner than one to her person -- sentiments condemned as \"true "
     "masculine\" contempt for women repeated by rote.",
     'Piozzi', 'reference', 'person'),
    ('anna-barbauld', 'Mrs. Barbauld',
     "Anna Laetitia Barbauld, cited in a footnote for an essay on the "
     "incompatibility of raising a son to be rich and raising him to be "
     "virtuous.",
     'Barbauld', 'reference', 'person'),

    # --- Reference: one-off citations of real authors and public figures ---
    ('samuel-johnson', 'Dr. Johnson',
     "Samuel Johnson, quoted for his dictionary definition of "
     "sensibility (\"quickness of sensation; quickness of perception; "
     "delicacy\"), cited again via Boswell's biography of him, and "
     "invoked for his wish to see idle fine ladies set to useful work.",
     'Johnson', 'reference', 'person'),
    ('john-locke', 'Mr. Locke',
     "John Locke, quoted on the harm done to a child's vigour and "
     "industry by curbing and humbling its spirits too severely.",
     'Locke', 'reference', 'person'),
    ('joseph-priestley', 'Dr. Priestley',
     "Joseph Priestley, cited for his observation, in the preface to a "
     "biographical chart, that most great men have lived beyond "
     "forty-five.",
     'Priestley', 'reference', 'person'),
    ('francis-bacon', 'Lord Bacon',
     "Francis Bacon, quoted on marriage and children as \"hostages to "
     "fortune\" that impede great undertakings, and cited again for the "
     "phrase \"they must have iron frames\" applied to men of genius.",
     'Bacon', 'reference', 'person'),
    ('john-dryden', 'Dryden',
     "John Dryden, quoted for two couplets: one on women first idolized "
     "then enslaved by love, another on the fickle nature of matter, "
     "\"best distinguish'd by black, brown, or fair.\"",
     'Dryden', 'reference', 'person'),
    ('william-cowper', 'Cowper',
     "William Cowper, quoted in a footnote for the line \"He is the free "
     "man, whom TRUTH makes free!\"",
     'Cowper', 'reference', 'person'),
    ('abraham-cowley', 'Cowley',
     "Abraham Cowley, named alongside Milton and Pope as an example of "
     "genius and reason showing itself early in life, against the claim "
     "that women mature faster than men only because they are shallower.",
     'Cowley', 'reference', 'person'),
    ('jonathan-swift', 'Dean Swift',
     "Jonathan Swift, quoted for his remark on how naturally women "
     "handle each other's ribbons and lace, and cited again for his "
     "\"disgusting\" portrayal of the brutish Yahoos and the rational "
     "horses, the Houyhnhnms, in Gulliver's Travels.",
     'Swift', 'reference', 'person'),
    ('william-shakespeare', 'Shakespeare',
     "William Shakespeare, invoked for never having \"grasped the airy "
     "dagger with a nerveless hand\" (Macbeth), and quoted again via "
     "Hamlet and Macbeth themselves.",
     'Shakespeare', 'reference', 'person'),
    ('samuel-richardson', 'Richardson',
     "Samuel Richardson, criticized for having his heroine Clarissa "
     "accuse Lovelace of having robbed her of her honour against her "
     "will -- a \"strange\" notion of honour the author rejects.",
     'Richardson', 'reference', 'person'),
    ('gottfried-leibniz', 'Leibnitz',
     "Gottfried Wilhelm Leibniz, quoted on the usefulness of errors: "
     "\"Errors are often useful; but it is commonly to remedy other "
     "errors.\"",
     'Leibnitz', 'reference', 'person'),
    ('david-hume', 'Mr. Hume',
     "David Hume, quoted at length comparing the deference French "
     "society pays women to a year-round Saturnalia, in which the "
     "\"slaves\" permanently rule their supposed masters.",
     'Hume', 'reference', 'person'),
    ('vicesimus-knox', 'Knox',
     "Vicesimus Knox, quoted twice: once, in a footnote, on the "
     "unhappiness of any kind of voluntary slavery, and once asking what "
     "could be more absurd than keeping women ignorant while demanding "
     "they resist temptation.",
     'Knox', 'reference', 'person'),
    ('james-boswell', 'Boswell',
     "James Boswell, cited in a footnote for his \"Life of Johnson,\" "
     "one of the biographies the author has in mind when noting how "
     "envy and \"ingenious malice\" can bespatter even a great man's "
     "reputation.",
     'Boswell', 'reference', 'person'),
    ('john-milton', 'Milton',
     "John Milton, whose Paradise Lost is quoted directly (Adam and "
     "Eve's speeches, and the line on Eve, \"that with honour he may "
     "love\") and referred to repeatedly, including for having been "
     "modestly confident, rather than arrogant, about his own genius.",
     'Milton', 'reference', 'person'),
    ('alexander-pope', 'Pope',
     "Alexander Pope, quoted for verse on women's supposed perfection "
     "(\"whatever she wills to do or say / Seems wisest\") and for his "
     "sarcastic summary, \"every woman is at heart a rake.\"",
     'Pope', 'reference', 'person'),
    ('isaac-newton', 'Sir Isaac Newton',
     "The scientist, invoked twice: once via an \"ingenious conjecture\" "
     "that he was a superior being accidentally caged in a human body, "
     "and once for the shade under which he pursued contemplation, "
     "contrasted with Rousseau's very different solitude.",
     'Newton', 'reference', 'person'),
    ('george-washington', 'General Washington',
     "George Washington, whose acceptance of command of the American "
     "forces is offered as an example of true modesty (steady "
     "self-trust) rather than mere humility, and named again among the "
     "citizen-soldiers of true heroism alongside Fabricius.",
     'Washington', 'reference', 'person'),
    ('fabricius', 'Fabricius',
     "Gaius Fabricius Luscinus, the Roman consul and general, invoked "
     "twice as an example of the old citizen-soldier who fought for his "
     "country and then returned to his farm, and once, via Rousseau's "
     "own apostrophe to his shade, as a figure Rousseau enlists for his "
     "praise of primitive virtue.",
     'Fabricius', 'reference', 'person'),
    ('cato-elder', 'Cato',
     "Cato the Elder (Cato the Censor), invoked once for his \"most "
     "unjust\" love of country: his wish to crush Carthage was for "
     "Rome's vainglory, not its safety, offered as an example of how "
     "even admirable-seeming exclusive attachments can sacrifice "
     "justice and humanity.",
     'Cato', 'reference', 'person'),
    ('cicero', 'Tully',
     "Marcus Tullius Cicero, referred to by his common English name "
     "\"Tully,\" cited via his \"Offices\" (De Officiis) as the kind of "
     "book acquaintance with which is not needed to make a person of "
     "probity.",
     'Tully', 'reference', 'person'),
    ('samuel-butler', 'Butler',
     "Samuel Butler, author of the mock-heroic \"Hudibras,\" whose "
     "caricature of a Puritan dissenter is cited as the popular image of "
     "prim, over-scrupulous decorum the author compares to women's "
     "situation under similar oppression.",
     'Butler', 'reference', 'person'),
    ('forster', 'Forster',
     "Johann Reinhold Forster, cited via his published \"Account of the "
     "Isles of the South Sea\" for observations on sex ratios among "
     "polygamous societies, quoted at length in a footnote.",
     'Forster', 'reference', 'person'),
    ('emanuel-swedenborg', 'Swedenborg',
     "Emanuel Swedenborg, named alongside Rousseau as one of the "
     "\"specious reasoners\" who, in restoring woman as one moral being "
     "with man from his rib, still insist on giving her only "
     "\"submissive charms.\"",
     'Swedenborg', 'reference', 'person'),
    ('james-hervey', 'Hervey',
     "James Hervey, whose devotional bestseller \"Meditations\" is cited "
     "as a precedent: still widely read, the author notes, despite (in "
     "her view) equally sinning against sense and taste as Dr. Fordyce's "
     "sermons.",
     'Hervey', 'reference', 'person'),
    ('richard-price', 'Dr. Price',
     "Richard Price, the dissenting minister and philosopher, named "
     "as \"one of the best of men\" whose memory the author defends "
     "against the \"bitter calumnies\" -- being reviled as an enemy of "
     "God and man -- that fall on anyone who dares question the sacred "
     "authority of kings; noted as already dead (\"whose ashes still "
     "preach peace\") at the time of writing.",
     'Price', 'reference', 'person'),
    ('talleyrand', 'the Bishop of Autun',
     "Charles-Maurice de Talleyrand-Perigord, then Bishop of Autun, the "
     "book's dedicatee -- named in full only in the chapter-1 title "
     "metadata (\"To M. Talleyrand Perigord, Late Bishop of Autun\") and "
     "addressed throughout the Dedication's body only as \"Sir.\" The "
     "two bindable mentions are both by his ecclesiastic title alone, "
     "citing his own recent pamphlet on national education.",
     'bishop of Autun|Bishop of Autun', 'reference', 'person'),
    ('louis-xiv', 'Lewis XIV',
     "Louis XIV of France, cited as the model of a monarch who won "
     "flattering deference through personal manner and \"frivolous "
     "accomplishments\" rather than any real virtue or ability, in a "
     "long quotation from Adam Smith's Theory of Moral Sentiments.",
     'Lewis|Louis', 'reference', 'person'),
    ('adam-smith', 'Dr. Smith',
     "Adam Smith, quoted twice from his Theory of Moral Sentiments: once "
     "on the empty, purely personal accomplishments by which Louis XIV "
     "won his reputation, and once on how a good man's general "
     "reputation for honesty usually survives any single unjust "
     "suspicion.",
     'Smith', 'reference', 'person'),
    ('therese-levasseur', 'Theresa',
     "Therese Levasseur, Rousseau's lifelong companion, named once, "
     "bitterly, as \"that fool Theresa\" -- the real woman the author "
     "argues Rousseau chose precisely because her limitations let him "
     "imagine invented virtues in her.",
     'Theresa', 'reference', 'person'),
    ('catherine-the-great', 'the Empress of Russia',
     "Catherine II of Russia, named only by title, in a list of women "
     "(with Sappho, Mrs. Macaulay, and Madame d'Eon) offered as "
     "exceptions proving that a \"masculine education\" can give women "
     "courage and resolution.",
     'Empress of Russia', 'reference', 'person'),
    ('madame-d-eon', "Madame d'Eon",
     "The Chevalier d'Eon, the French diplomat and soldier who spent "
     "much of later life presenting as a woman, listed by the author "
     "among women of unusual achievement and masculine education.",
     'Eon', 'reference', 'person'),
    ('sappho', 'Sappho',
     "The ancient Greek poet, named in the same list of exceptional "
     "women who prove the sex capable of courage and resolution when "
     "given a fuller education.",
     'Sappho', 'reference', 'person'),
    ('thomas-day', 'Mr. Day',
     "Thomas Day, author of the popular children's novel \"Sandford and "
     "Merton,\" quoted at length in a footnote for an old man's account "
     "of raising his daughter Selene with the same vigorous education "
     "given to boys. \"Day\" is an ordinary word throughout this book, "
     "so the entity carries no global alias and is bound only at its one "
     "confirmed location, (5, 9).",
     '', 'reference', 'person'),

    # --- Reference: named biblical and religious figures ---
    ('jesus-christ', 'Jesus Christ',
     "Named directly three times: as an example of true modesty "
     "(\"Jesus Christ was modest, Moses was humble, and Peter vain\"), "
     "for his healing miracles and the charge \"be whole, and sin no "
     "more,\" and for his teaching that his true followers are known by "
     "their works, not by invoking his name.",
     'Jesus Christ|Jesus|Christ', 'reference', 'religious-figure'),
    ('moses', 'Moses',
     "Named twice: for the Genesis creation account and the story of "
     "the Fall, called his \"beautiful, poetical cosmogony,\" and, "
     "alongside Jesus Christ and Peter, as an example of humility rather "
     "than modesty or vanity.",
     'Moses', 'reference', 'religious-figure'),
    ('peter-apostle', 'Peter',
     "The apostle, named once alongside Jesus Christ and Moses as an "
     "example of vanity, in the author's three-way distinction between "
     "modesty, humility, and vanity.",
     'Peter', 'reference', 'religious-figure'),
    ('solomon', 'Solomon',
     "The king of Israel, invoked once via the phrase \"a wiser than "
     "Solomon hath said\" -- a reference to Christ's own teaching (echoed "
     "from Matthew) that the heart, not outward ceremony, is what must "
     "be made clean.",
     'Solomon', 'reference', 'religious-figure'),
    ('adam-biblical', 'Adam',
     "The first man, invoked twice: for the \"rights of humanity\" "
     "confined \"to the male line from Adam downwards,\" and, quoted "
     "directly from Milton, for his own speech to Eve in Paradise Lost.",
     'Adam', 'reference', 'religious-figure'),
    ('eve-biblical', 'Eve',
     "The first woman, quoted directly, via Milton's Paradise Lost, in "
     "her own words of devotion to Adam -- one of the passages the "
     "author examines for what it reveals about the ideal of feminine "
     "submission.",
     'Eve', 'reference', 'religious-figure'),
    ('satan', 'Satan',
     "Named once via Milton: the author notes that Milton \"never...led "
     "Satan far from the confines of his dreary prison\" with a "
     "trembling hand, offered as proof that powerful, controlled "
     "imagination is not the same thing as \"imbecility.\"",
     'Satan', 'reference', 'religious-figure'),
    ('mahomet', 'Mahomet',
     "The Prophet Muhammad, invoked once via \"the vulgar tale of "
     "Mahomet's coffin\" (the legend of his coffin suspended in "
     "mid-air), used as a simile for women suspended by destiny between "
     "instinct and reason. original-en uses a straight apostrophe, "
     "modern-en a typographic one (the same apostrophe-style mismatch "
     "Walden's \"Chaucer's nun\" had), so both are aliased.",
     "Mahomet's coffin|Mahomet’s coffin", 'reference', 'religious-figure'),

    # --- Reference: fictional characters from the books under discussion ---
    ('emilius', 'Emilius',
     "The fictional pupil of Rousseau's Emile, held up throughout "
     "chapter 7/\"Chapter 5\" as the paired ideal to Sophia: the young "
     "man Sophia is educated to please and eventually marry.",
     'Emilius', 'reference', 'literary-figure'),
    ('sophia-rousseau', 'Sophia',
     "Rousseau's fictional ideal woman from Emile, whose education -- "
     "to be modest in appearance yet coquettish in effect, to value "
     "neatness over doing things well, to leave religion to her husband "
     "-- is quoted and examined in detail as the target of the author's "
     "central argument.",
     'Sophia', 'reference', 'literary-figure'),
    ('eloisa-julie', 'Eloisa (Rousseau’s Julie)',
     "Julie, called \"Eloisa,\" the heroine of Rousseau's novel La "
     "Nouvelle Heloise -- \"the mistress of his soul,\" whom Rousseau "
     "has love St. Preux even as life is fading from her. Distinct from "
     "the real historical Heloise named elsewhere in the book (see "
     "README); bound only at its one confirmed location, (4, 51), never "
     "by a global alias.",
     '', 'reference', 'literary-figure'),
    ('st-preux', 'St. Preux',
     "The hero of Rousseau's La Nouvelle Heloise, loved by Julie "
     "(\"Eloisa\") even as she is dying.",
     'Preux', 'reference', 'literary-figure'),
    ('clarissa-harlowe', 'Clarissa',
     "The heroine of Richardson's novel Clarissa, who tells Lovelace he "
     "has robbed her of her honour -- criticized by the author as a "
     "\"strange\" notion, since true honour cannot be taken from someone "
     "without their own consent.",
     'Clarissa', 'reference', 'literary-figure'),
    ('lovelace', 'Lovelace',
     "The seducer of Richardson's Clarissa, invoked twice: for the "
     "accusation Clarissa levels at him, and as the type of the witty, "
     "graceful rake that women, in their present miseducation, are "
     "primed to prefer to an honest man.",
     'Lovelace', 'reference', 'literary-figure'),
    ('hamlet', 'Hamlet',
     "Shakespeare's prince, quoted for his line to his mother, \"Seems! "
     "I know not seems!,\" applied to women who are taught only ever to "
     "SEEM virtuous rather than to be so.",
     'Hamlet', 'reference', 'literary-figure'),
    ('macbeth', 'Macbeth',
     "Shakespeare's Macbeth, invoked for how much more his own "
     "conscience smote him for his first murder than for the hundred "
     "that followed it -- an illustration of how habit deadens moral "
     "feeling.",
     'Macbeth', 'reference', 'literary-figure'),
    ('inkle', 'Inkle',
     "The faithless merchant of the popular \"Inkle and Yarico\" story, "
     "invoked as a warning: a father who teaches his son too early and "
     "too coldly to distrust human nature risks making \"an Inkle of "
     "him.\"",
     'Inkle', 'reference', 'literary-figure'),
    ('don-quixote', 'Quixote',
     "Cervantes's Don Quixote, invoked via the idiom \"to out Quixote "
     "Cervantes\" -- to reason love out of the world entirely would be "
     "to out-do even Quixote's own extravagance.",
     'Quixote', 'reference', 'literary-figure'),
    ('miguel-de-cervantes', 'Cervantes',
     "The author of Don Quixote, named in the same idiom, \"to out "
     "Quixote Cervantes.\"",
     'Cervantes', 'reference', 'person'),
    ('telemachus', 'Telemachus',
     "The hero of Fenelon's popular moral-education romance "
     "\"Telemachus\" (itself drawing on the son of Homer's Odysseus), "
     "named alongside Emilius as the kind of ideal husband fortune is "
     "imagined to bring a well-educated young woman.",
     'Telemachus', 'reference', 'literary-figure'),
    ('ranger', 'Ranger',
     "A character quoted for a single line, \"'I take her body,' says "
     "Ranger\" -- likely Ranger from Benjamin Hoadly's popular comedy "
     "\"The Suspicious Husband\" -- offered as an example of men valuing "
     "only a wife's body while leaving her mind to rust.",
     'Ranger', 'reference', 'literary-figure'),

    # --- Reference: a real historical woman sharing a spelling with the fictional Eloisa above ---
    ('heloise-historical', 'Heloise',
     "The medieval Heloise, pupil, correspondent, and eventual wife of "
     "Peter Abelard, famed for her learning and for her own declaration "
     "that she would rather be his mistress than the world's empress. "
     "Named once under the spelling \"Heloisa\" and once, spelled "
     "identically to Rousseau's fictional \"Eloisa\" (see that entry), "
     "in a list of real women of unusual achievement -- Sappho, "
     "[Heloise], Mrs. Macaulay, the Empress of Russia, Madame d'Eon. "
     "Both locations are bound by a custom, location-scoped match rather "
     "than a global alias, to keep her separate from Rousseau's Eloisa.",
     'Heloisa', 'reference', 'person'),

    # --- Reference: named mythological figures ---
    ('diana', 'Diana',
     "The Roman goddess of the moon and chastity, invoked as the "
     "\"poetical fiction\" the author finds beautiful: a modest woman of "
     "antiquity turning to the moon's reflected light as to a chaste "
     "sister.",
     'Diana', 'reference', 'cultural-figure'),
    ('argus', 'Argus',
     "The hundred-eyed watchman of Greek myth, invoked idiomatically: "
     "women taught to fear only \"the eye of man\" need merely \"lull "
     "their Argus to sleep\" to feel their reputation, if not their "
     "virtue, is safe.",
     'Argus', 'reference', 'cultural-figure'),
    ('pallas', 'Pallas',
     "Pallas Athena, invoked in a quoted anecdote (from Mr. Day's "
     "footnote) about a girl who threw away her pen \"like another "
     "Pallas\" rather than keep writing in an awkward, constrained "
     "posture.",
     'Pallas', 'reference', 'cultural-figure'),
    ('hymen', 'Hymen',
     "The Greek god of marriage, invoked once: \"Hymen banishes "
     "modesty, and chaste love takes its flight\" when a worn-out "
     "libertine marries only for a safe companion and then seduces his "
     "own wife.",
     'Hymen', 'reference', 'cultural-figure'),
    ('cerberus', 'Cerberus',
     "The three-headed hound guarding the underworld in Greek myth, "
     "invoked idiomatically: a self-serving minister can \"dip a sop in "
     "the milk of human kindness, to silence Cerberus\" -- quiet his own "
     "conscience -- while doing nothing to end a cruel practice.",
     'Cerberus', 'reference', 'cultural-figure'),
]:
    add(*row)

editorial = dict(
    bookId='vindication-rights-of-woman',
    contentVersion='2026-09-12.1',
    entities=entities,
    coverage=(
        "71 entities, all Reference -- per editorial policy's guidance "
        "for treatises ('cited thinkers normally remain references'), "
        "not excepting Rousseau despite his far longer engagement. No "
        "Central or Major entry: the author is never named in running "
        "text and gets no entry, and nothing in this treatise is a "
        "narrative or staged dialogue participant. Two title-only "
        "person references are bound (Talleyrand as 'the Bishop of "
        "Autun', Catherine the Great as 'the Empress of Russia'). One "
        "genuine namesake collision -- 'Eloisa' names both Rousseau's "
        "fictional Julie (4, 51) and the real historical Heloise (6, "
        "85), the latter also named 'Heloisa' (9, 21) -- is resolved by "
        "a location-scoped custom bind() with no global alias for "
        "either entity's colliding spelling. One common-word hazard "
        "('Day', Thomas Day of Sandford and Merton) is bound only at "
        "its one confirmed location, (5, 9)."
    ),
)

if __name__ == '__main__':
    out = Path(__file__).resolve().parent / 'editorial.json'
    out.write_text(json.dumps(editorial, indent=2, ensure_ascii=False) + '\n')
    print(f"Wrote {out} with {len(entities)} entities")
