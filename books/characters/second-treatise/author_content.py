"""Manually authored recognition copy for Locke's Second Treatise of Government.

Covers all nineteen chapters in both English editions. This is a political
treatise, not a novel: almost every bound entry is a real historical,
biblical, or classical figure Locke cites once or twice to make a point, not
an invented cast. Three entries are Major because the whole argument turns
on them rather than a single citation: Sir Robert Filmer, whose Patriarcha
this entire treatise (continuing the First Treatise) is written against;
Adam, the linchpin of Filmer's argument from paternal dominion that Locke
spends chapters 1, 5, 6 and 18 dismantling; and Richard Hooker, quoted
approvingly at length as Locke's own chief authority throughout. Everyone
else is Reference.

No namesake collisions: I swept every candidate name (including several
biblical figures who could plausibly recur, and two source-text spelling
variants) across both editions before authoring, and every name resolves to
exactly one person. Two source quirks, not namesakes: original-en spells
Jephthah as "Jeptha" (no middle h) once at 19:45, against "Jephtha"
elsewhere (3:5, 8:17, 16:1); modern-en spells it "Jephtha" at all four
locations, including 19:45 -- neither edition ever prints the modern
"Jephthah". And original-en lowercases "juvenal" at 19:33 where modern-en
capitalizes "Juvenal". Both forms are carried as aliases.
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
    ('filmer', 'Sir Robert Filmer',
     "The royalist theorist whose Patriarcha argued that political authority descends from Adam's fatherhood; this treatise, continuing the First Treatise's refutation, is written against him throughout.",
     'Sir Robert Filmer|Filmer', 'major'),
    ('adam', 'Adam',
     "The first man, whose supposed \"private dominion and paternal jurisdiction\" over all his posterity is the premise Locke spends chapters 1, 5, 6 and 18 dismantling as the foundation of Filmer's argument.",
     'Adam', 'major'),
    ('hooker', 'Richard Hooker',
     'The Elizabethan theologian ("the judicious Hooker"), quoted approvingly and at length throughout as an authority for the natural equality of men and the consensual origin of government.',
     'Hooker', 'major'),
    ('cain', 'Cain',
     "The first murderer, cited twice: once for having been so convinced of everyone's right to punish a murderer that he feared for his own life after killing Abel, and once for the ground he might have tilled, leaving Abel's sheep pasture enough.",
     'Cain'),
    ('abel', 'Abel',
     "Cain's brother, whose sheep would have had pasture enough even after Cain took what ground he could till -- Locke's example of property arising from labor before any settled boundaries existed.",
     'Abel'),
    ('garcilasso-de-la-vega', 'Garcilaso de la Vega',
     "The historian of Peru, cited for an account of two men bartering on a desert island while remaining, in relation to each other, in the state of nature.",
     'Garcilasso de la Vega'),
    ('jephthah', 'Jephthah',
     "The judge of Israel who, finding no earthly court to decide his dispute with the Ammonites, appealed to heaven and led Israel's army to battle -- Locke's recurring example of an appeal to God as the only remedy when no common judge exists on earth.",
     'Jephtha|Jeptha|Jephthah'),
    ('noah', 'Noah',
     "Named alongside Adam as one to whom, according to Genesis, God granted the earth -- and, later, as the party to God's post-deluge covenant that seedtime and harvest shall not cease.",
     'Noah'),
    ('david', 'King David',
     "Cited for the Psalm verse that God has given the earth to the children of men, and later as the man after God's own heart whom the Lord commanded to be captain over Israel in Saul's place.",
     'David'),
    ('abraham', 'Abraham',
     "The patriarch, cited as living, even in a country where he was a stranger, without any fixed property in land beyond what he made use of -- wandering freely with his flocks until he and Lot amicably separated for want of shared pasture.",
     'Abraham'),
    ('lot', 'Lot',
     "Abraham's companion, with whom Abraham amicably parted and enlarged their separate pastures when the land no longer held both their herds together (Genesis 13:5).",
     'Lot'),
    ('esau', 'Esau',
     "Jacob's brother, who left his father and brother to settle in Mount Seir (Genesis 36:6) -- Locke's example of a family separating for want of shared pasture, without any fixed property in the land itself.",
     'Esau'),
    ('eve', 'Eve',
     "Named alongside Adam as jointly obligated, by the law of nature, to preserve, nourish and educate the children born to them -- Locke's evidence that paternal power was never the father's alone.",
     'Eve'),
    ('melchizedec', 'Melchizedek',
     'The priest-king of Salem, cited (via a Hooker footnote) for the ancient custom of rulers also serving as priests, as fathers had at the first.',
     'Melchizedec'),
    ('hymen', 'Hymen',
     "The god of marriage, invoked for the season at which animal mates part and choose anew -- the point of contrast Locke draws before explaining why human conjugal society lasts longer.",
     'Hymen'),
    ('cato', 'Cato',
     "The Roman famous for walking into the theatre only to walk straight back out again -- Locke's image for what unanimous consent to a single common measure would actually look like in practice.",
     'Cato'),
    ('salmanasser', 'Shalmaneser',
     "The Assyrian king, invoked alongside Xerxes as a ruler whose armies were once children too, though history says little of it -- Locke's answer to the objection that history records no state of nature.",
     'Salmanasser'),
    ('xerxes', 'Xerxes',
     "The Persian king, invoked alongside Shalmaneser as a ruler whose armies were once children too, though history says little of it.",
     'Xerxes'),
    ('acosta', 'José de Acosta',
     'The Jesuit historian ("Josephus Acosta"), cited for his account that many parts of America, including ancient Peru, had for a long time neither kings nor commonwealths.',
     'Josephus Acosta'),
    ('palantus', 'Phalanthus',
     "The Spartan leader (\"Palantus\"), cited via Justin's history for having led a company of men away from Sparta to found a new, freely consented-to government.",
     'Palantus'),
    ('justin', 'Justin',
     'The Roman historian (Marcus Junianus Justinus), cited as the source for the story of Phalanthus leaving Sparta to found a new government.',
     'Justin'),
    ('jotham', 'Jotham',
     "Gideon's son, who upbraided the men of Shechem with their debt to his father in the parable of the trees (Judges 9) -- cited as evidence that early Israelite \"judges\" were essentially war-captains.",
     'Jotham'),
    ('gideon', 'Gideon',
     "The judge of Israel who delivered his people from Midian -- cited by Locke as evidence that the office of \"judge\" in Israel amounted to little more than being a general in war.",
     'Gideon'),
    ('abimelech', 'Abimelech',
     "Gideon's son, called \"king\" in Judges though Locke notes he was, at most, only their general -- part of the argument that early kingship was chiefly a military office.",
     'Abimelech'),
    ('samuel', 'Samuel',
     "The judge and prophet whose sons' misgovernment led Israel to demand a king -- part of Locke's argument, from 1 Samuel, that the earliest kings' chief business was leading Israel's armies.",
     'Samuel'),
    ('saul', 'Saul',
     "Israel's first king, anointed by Samuel to be \"captain over my people\" and later doubted by those who asked, \"How shall this man save us?\" -- cited throughout Locke's argument that early kingship meant, above all, military command.",
     'Saul'),
    ('king-james-i', 'King James I',
     "The English king, quoted twice from his own speeches to Parliament (1603, 1609) distinguishing a lawful king who serves the public good from a tyrant who serves only himself, and again in Chapter 18 to the same purpose.",
     'King James the first'),
    ('locke', 'John Locke',
     "The treatise's own author, named once in an editorial footnote noting a correction he made to another copy of the text.",
     'Mr. Locke'),
    ('william-the-conqueror', 'William the Conqueror',
     "The Norman duke whose 1066 conquest is invoked (and its supposed grant of absolute dominion to later English princes disputed) in Locke's chapter on conquest.",
     'William'),
    ('draw-can-sirs', 'Drawcansir',
     "The blustering, indiscriminately slaughtering braggart of Buckingham's play The Rehearsal, invoked as the type for founders of absolute monarchies who forget the officers and soldiers who fought and won alongside them.",
     'Draw-can-sirs'),
    ('hingar', 'Hingar',
     "One of the two Danish chieftains (\"Hingar, or Hubba, the Danes\") whose conquest of parts of England gave them, in Locke's argument, no more lawful title to rule than any other unjust conqueror's.",
     'Hingar'),
    ('hubba', 'Hubba',
     "The other of the two Danish chieftains (\"Hingar, or Hubba, the Danes\") whose conquest of parts of England gave them, in Locke's argument, no more lawful title to rule than any other unjust conqueror's.",
     'Hubba'),
    ('spartacus', 'Spartacus',
     "The Roman gladiator and rebel leader, invoked hypothetically: had he conquered Italy, Locke argues, he would have had no better a title to rule it than any other unjust conqueror.",
     'Spartacus'),
    ('hezekiah', 'Hezekiah',
     "The king of Judah whom God assisted in throwing off the dominion of the conquering Assyrian empire, rebelling against and refusing to serve the king of Assyria (2 Kings 18:7) -- Locke's biblical example of a conqueror's rule justly cast off.",
     'Hezekiah'),
    ('ahaz', 'Ahaz',
     "Hezekiah's father, likely subdued and deposed by the Assyrians (in Locke's telling), whose son Hezekiah then paid him tribute before later rebelling.",
     'Ahaz'),
    ('jupiter', 'Jupiter',
     'The king of the Roman gods, invoked ironically: however much flatterers style oppressive rulers "sons of Jupiter," the people\'s readiness to throw off ill usage remains the same.',
     'Jupiter'),
    ('polyphemus', 'Polyphemus',
     "The Cyclops of the Odyssey, whose den Locke calls \"a perfect pattern\" of the peace tyranny offers: the lamb yielding its throat to the wolf, or Ulysses and his men waiting quietly to be devoured.",
     'Polyphemus'),
    ('ulysses', 'Ulysses',
     "The hero of the Odyssey, imagined by Locke (with irony) as a \"prudent man\" who preached patient submission to Polyphemus rather than resistance -- a pointed jab at those who counsel passive obedience to tyranny.",
     'Ulysses'),
    ('barclay', 'William Barclay',
     'The Scottish jurist ("that great assertor of the power and sacredness of kings"), quoted at length in Latin and English on the narrow cases in which even he concedes a people may resist their king.',
     'Barclay'),
    ('buchanan', 'George Buchanan',
     "The Scottish historian and political theorist, named as the one writer on Barclay's own side who allowed a private person, not just the body of the people, a remedy beyond patience against tyranny.",
     'Buchanan'),
    ('juvenal', 'Juvenal',
     'The Roman satirist, quoted in Latin on the futility of a poor man\'s "liberty" to beg for mercy after being beaten -- Locke\'s image for a resistance that is forbidden to strike back.',
     'juvenal|Juvenal'),
    ('nero', 'Nero',
     "The Roman emperor, cited via Barclay as one who forfeited his right to rule by resolving to devastate Rome, massacre the senate and people, and relocate the seat of empire.",
     'Nero'),
    ('caligula', 'Caligula',
     "The Roman emperor, cited via Barclay for declaring he would no longer be a citizen or head of the senate, planning to kill the foremost men of Rome, and wishing the people had but one neck so he could dispatch them at a blow.",
     'Caligula'),
    ('winzerus', 'Winzerus',
     "The jurist Barclay credits, alongside himself, with identifying the two cases in which a king forfeits his crown -- named only in Barclay's Latin, quoted by Locke.",
     'Winzerus'),
    ('bilson', 'Thomas Bilson',
     'A bishop of the Church of England and defender of royal prerogative, whom Locke nonetheless credits with acknowledging that princes can forfeit their title to their subjects\' obedience.',
     'Bilson'),
    ('bracton', 'Henry de Bracton',
     'The medieval English jurist, named among the authorities Locke says he could cite on the lawfulness of resisting a king who forfeits his trust, alongside Fortescue and the anonymous author of The Mirror of Justices.',
     'Bracton'),
    ('fortescue', 'Sir John Fortescue',
     'The medieval English jurist, named among the authorities Locke says he could cite on the lawfulness of resisting a king who forfeits his trust, alongside Bracton and the anonymous author of The Mirror of Justices.',
     'Fortescue'),
]:
    add(*row)

ids = [e['id'] for e in entities]
assert len(ids) == len(set(ids)), 'duplicate id'

BASE = Path(__file__).resolve().parent
(BASE / 'editorial.json').write_text(json.dumps(dict(
    bookId='second-treatise',
    contentVersion='2026-09-11.1',
    coverage=(
        'All nineteen chapters in both English editions. Named biblical, classical, '
        'medieval and contemporary figures Locke cites to make a point -- chiefly Sir '
        'Robert Filmer, the polemical target of the whole treatise; Adam, the linchpin '
        "of Filmer's argument from paternal dominion; and Richard Hooker, Locke's own "
        'chief cited authority. No conjectural identities for generic titles (Czar, '
        'Grand Seignior), offices (the thirty tyrants at Athens, the Decemviri), or '
        'peoples and places (Israel, the Saxons, the Normans, Peru, Mexico). Two '
        'source-text spelling variants, not namesakes: original-en\'s "Jeptha" (19:45, no '
        'middle h) alongside its own "Jephtha" elsewhere, and its lowercase "juvenal" '
        '(19:33); see README.'
    ),
    entities=entities,
), ensure_ascii=False, indent=2) + '\n')

if __name__ == '__main__':
    print(f'{len(entities)} entities written to editorial.json')
