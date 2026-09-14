"""Manually authored recognition cards for both full English texts of Ulysses.

Joyce's text in both editions, 18 episodes, 7,148 paragraphs per edition,
aligned paragraph for paragraph. The modern edition is a light modernisation:
it resolves some of Joyce's run-together words and normalises punctuation, but
it does not rewrite the prose and it does not modernise the names. Where the two
differ on a name the difference is recorded on the card.

Episode 1 is authored. The rest are not.

Scope: named persons — the Dublin cast, the figures they remember, and the
writers, saints, heresiarchs and stage characters they quote. Peoples, places,
newspapers, songs, pubs and the shops of Dublin are not cast, which in this book
excludes a great deal: Dublin, Kingstown, Sandycove, Clongowes, the Ship, the
Mabinogion, the Upanishads. An author named in a quotation is cast, because the
quotation is a reference to the man.

Two things are harder here than in any other book in this library.

The first is that a surname in Ulysses is almost never one man. *Dedalus* is
Stephen in episode 1, his father Simon from episode 6, and his sisters in
episode 10. *Bloom* is Leopold, Molly, Milly, Rudolph and Rudy. Nothing that
could be a second man is bound by alias; it is keyed to the paragraphs that
identify him, and the tables in `build_ulysses.py` carry `None` for their
defaults so that an unread episode gets no card rather than the wrong one.

The second is that Joyce's characters think in half-names. Stephen calls
Swinburne *Algy* because Mulligan does; Mulligan calls Stephen *Kinch*; the
milkwoman is never named at all. A half-name is bound when the text settles who
it is, and the card says plainly which man it is and how the text says so.
"""
import json
from pathlib import Path
entities=[]
def add(id,name,body,aliases='',category='reference',kind='person'):
 entities.append(dict(id=id,name=name,body=body,aliases=aliases.split('|') if aliases else [],category=category,kind=kind,subtitle='',snapshots=[]))

# ========================= EPISODE 1 — Telemachus
for row in [
# --- the three in the tower
('stephen','Stephen Dedalus','The young man who wakes in the Martello tower at Sandycove: a poet and a teacher, in mourning for his mother and unwilling to say why he would not kneel at her deathbed. He pays the rent of the tower and carries its key. Mulligan calls him Kinch; the older edition and the modern edition agree on every form of his name.','Stephen Dedalus|Stephen|Kinch','central'),
('mulligan','Buck Mulligan','Malachi Mulligan, a medical student, who shares the tower with Stephen and opens the book shaving on its roof with a mock mass. He is Stephen’s friend and his tormentor in the same breath: he mimics him, borrows from him, and told his own mother that it was only Dedalus whose mother was beastly dead.','Buck Mulligan|Malachi Mulligan|Mulligan|Malachi','major'),
('haines','Haines','The Englishman staying in the tower, down from Oxford, collecting Irish folk sayings for a book. He raved all night about shooting a black panther, apologises for it in the morning, pays the milkwoman, and tells Stephen that England has treated Ireland rather unfairly and that history is to blame.','Haines','major'),
# --- Stephen's dead mother, who is present in the episode without being named
('may-dedalus','Stephen’s mother','Dead a year, and the presence the episode turns on. Stephen would not kneel and pray at her bedside when she asked him, and she comes to him in a dream in her loose brown graveclothes smelling of wax and rosewood. Mulligan says the aunt thinks Stephen killed her. She is not named in this episode.','',),
('milkwoman','The milkwoman','The old woman who brings the morning milk up to the tower, is spoken to in Irish by Haines and cannot understand it, and is paid a florin against a bill of two and two. Stephen sees in her the silk of the kine and the poor old woman, names given Ireland in old times: a wandering crone serving her conqueror and her gay betrayer.','',),
# --- the swimmers and the men at the cliff
('creek-young-man','The young man in the water','Clinging to a spur of rock at the fortyfoot hole, who brings Mulligan the news that Seymour has chucked medicine for the army and was spooning with the Carlisle girl on the pier.','',),
('creek-elderly-man','The elderly swimmer','Who shoots up near the spur of rock with a blowing red face and scrambles past Mulligan out of the water.','',),
('cliff-boatman','The boatman','One of two men watching from the verge of the cliff, who says there are five fathoms out there and that the drowned man will be swept up when the tide comes in about one. It is nine days today.','',),
('cliff-businessman','The businessman','The other of the two.','',),
('drowned-man','The drowned man','Nine days in the bay, and the body the sail is waiting for. Stephen thinks of the swollen bundle bobbing up and rolling over a puffy saltwhite face to the sun, and of Mulligan, who has saved men from drowning as he has not.','',),
# --- the people they remember
('mulligan-aunt','Mulligan’s aunt','Who thinks Stephen killed his mother and will not let her nephew have anything to do with him, keeps plainlooking servants for Malachi, and might be got to fork out twenty quid for Athens.','',),
('ursula','Ursula','The aunt’s servant, out of whose room Mulligan pinched the cracked shaving mirror. Her name is the last word of the joke about keeping plainlooking servants.','',),
('mulligan-mother','Mulligan’s mother','Who came out of the drawingroom with a visitor and asked her son who was in his room, and got the answer Stephen has not forgiven: O, it’s only Dedalus whose mother is beastly dead.','',),
('mulligan-brother','Mulligan’s brother','Down in Westmeath with the Bannons.','',),
('cranly','Cranly','Whose arm Stephen remembers when Mulligan links his own in it. A friend of an earlier time, named only in that one thought.','Cranly'),
('seymour','Seymour','Who has chucked medicine and is going in for the army, and whom Mulligan would bring down to rag Haines if he made any noise in the tower. He was spooning with the Carlisle girl on the pier last night.','',),
('lily-carlisle','Lily','The red Carlisle girl, whose father is rotto with money.','',),
('bannon','Bannon','Who sent a card from Westmeath saying he had found a sweet young thing down there — a photo girl, he calls her.','',),
('the-bannons','The Bannons','The family in Westmeath that Mulligan’s brother is staying with.','',),
('clive-kempthorpe','Clive Kempthorpe','In whose Oxford rooms the moneyed voices shouted while he hopped round the table with his trousers at his heels and his shirt in ribbons, chased with a tailor’s shears — the ragging Mulligan offers to repeat on Haines.','Clive Kempthorpe|Kempthorpe'),
('aubrey-oxford','Aubrey','One of the palefaces in that room, called on to break the news gently.','',),
('ades','Ades of Magdalen','Who chased him with the tailor’s shears.','Ades of Magdalen|Ades'),
('connolly-norman','Connolly Norman','At Dottyville, where the fellow Mulligan was with in the Ship is a patient: general paralysis of the insane, which is what the fellow says Stephen has.','Connolly Norman'),
('matthew-arnold','Matthew Arnold','Whose face masks the deaf gardener pushing a mower on the sombre Oxford lawn in Stephen’s vision of the quadrangle.','Matthew Arnold'),
# --- the folk figures of Mulligan's performance
('mother-grogan','Mother Grogan','Who said that when she makes tea she makes tea and when she makes water she makes water — Mulligan’s piece of folk for Haines’s book, delivered in an old woman’s wheedling voice.','',),
('mrs-cahill','Mrs Cahill','To whom she said it, and who answered: God send you don’t make them in the one pot.','',),
('mary-ann','Mary Ann','Of the song Mulligan growls at the loaf, and whom Stephen guesses was a kinswoman of mother Grogan’s.','',),
('royce','Royce','Old Royce, who sang in the pantomime of Turko the Terrible, and whom Stephen’s mother heard and laughed at with the others when she was a girl.','Royce'),
('turko','Turko the Terrible','The pantomime, and the boy of its song that can enjoy invisibility. Both editions keep the spelling.','Turko'),
# --- the writers, saints and heresiarchs they quote
('algy','Swinburne','Whom Mulligan asks whether the sea is not what he calls it: a great sweet mother. The older edition gives only the nickname Mulligan uses for him, Algy; the modern edition prints the surname instead.','Algy|Swinburne'),
('wilde','Oscar Wilde','Whose Caliban Mulligan quotes at the cracked mirror, and whom he says the age has grown out of along with paradoxes.','Wilde'),
('caliban','Caliban','Whose rage at not seeing his face in a mirror Mulligan offers Stephen as the joke of the cracked lookingglass.','Caliban','reference','literary-figure'),
('shakespeare','Shakespeare','Whose grandfather, Mulligan says, Stephen proves by algebra to be Hamlet’s grandson — and who is himself the ghost of his own father.','',),
('hamlet','Hamlet','The play Haines asks Stephen for his idea of, and whose Elsinore the tower and cliffs remind him of.','',),
('thomas-aquinas','Thomas Aquinas','And the fiftyfive reasons he has made out to prop the theory up, which Mulligan says he is not equal to before a few pints.','Thomas Aquinas'),
('loyola','Loyola','Whom Mulligan tells Stephen to chuck and come down: the Sassenach wants his morning rashers.','Loyola'),
('fergus','Fergus','Who rules the brazen cars in the song Mulligan drones down the staircase, and which Stephen sang alone in the house at his mother’s open door.','',),
('billy-pitt','William Pitt','Who had the Martello towers built, Mulligan says, when the French were on the sea. The older edition calls him Billy.','Billy Pitt|William Pitt'),
('peter-teazle','Sir Peter Teazle','Whom Stephen’s mother called the doctor in her last illness, while she picked buttercups off the quilt.','Sir Peter Teazle|Peter Teazle'),
('japhet','Japhet','In search of a father — what Mulligan calls Stephen in the ear, hearing his theory of Hamlet.','Japhet'),
('mercury','Mercury','Whose hat quivers on Mulligan\u2019s head as he capers down to the fortyfoot hole, fluttering his winglike hands. The modern edition writes only \u201chis hat\u201d, so the god stands in the older edition alone.','Mercury','reference','deity'),
('chrysostomos','Chrysostomos','The golden-mouthed: the one word Stephen thinks at the gold points glistening in Mulligan\u2019s teeth. The modern edition drops the word altogether, so he stands in the older edition alone.','',),
('joseph-the-joiner','Joseph the Joiner','With whom the queerest young fellow of Mulligan’s ballad cannot agree.','Joseph the Joiner|Joseph the joiner'),
('butterly','Butterly','The name at the end of Mulligan’s pun on the gospel: and going forth he met Butterly.','',),
('zarathustra','Zarathustra','Thus spake whom, Mulligan says solemnly, taking Stephen’s twopence: he who stealeth from the poor lendeth to the Lord.','Zarathustra'),
('pope-marcellus','Pope Marcellus','In whose mass the symbol of the apostles is sung, the voices blended, loud in affirmation — the music behind Stephen’s memory of the church militant and her heresiarchs.','Marcellus'),
('photius','Photius','First of the heresiarchs the vigilant angel menaces in Stephen’s memory, and of whose brood of mockers Mulligan is one.','Photius'),
('arius','Arius','Who warred his life long upon the consubstantiality of the Son with the Father.','Arius'),
('valentine','Valentine','Who spurned Christ’s terrene body.','',),
('sabellius','Sabellius','The African, subtlest heresiarch of them all, who held that the Father was Himself His own Son.','Sabellius'),
]:add(*row)

updates={}
for e in entities:e['snapshots']=[dict(after=list(at),body=body) for at,body in updates.get(e['id'],[])]
print(len(entities),'entities authored: episode 1')
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(
 bookId='ulysses',
 contentVersion='2026-09-14.1',
 coverage='Both full English editions, episode 1 of 18. Named persons, and the writers, saints, heresiarchs and stage figures the characters quote. Peoples, places, newspapers, songs, pubs and shops are not cast.',
 entities=[e for e in entities if e['name']!='unused']),ensure_ascii=False,indent=2)+'\n')
