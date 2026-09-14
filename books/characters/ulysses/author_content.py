"""Manually authored recognition cards for both full English texts of Ulysses.

Joyce's text in both editions, 18 episodes, 7,148 paragraphs per edition,
aligned paragraph for paragraph. The modern edition is a light modernisation:
it resolves some of Joyce's run-together words and normalises punctuation, but
it does not rewrite the prose and it does not modernise the names. Where the two
differ on a name the difference is recorded on the card.

Episodes 1 and 2 are authored. The rest are not.

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

# ========================= EPISODE 2 — Nestor
for row in [
('deasy','Mr Deasy','The headmaster of the school at Dalkey where Stephen teaches: an Ulster protestant and a unionist who pays Stephen his salary in sovereigns and shillings, lectures him on saving money, dictates a letter to the press about foot and mouth disease, and tells him that England is in the hands of the jews and that Ireland never persecuted them because she never let them in.','Deasy','major'),
('cochrane','Cochrane','One of Stephen\u2019s pupils, who is asked what city sent for Pyrrhus and answers Tarentum, and who is on the same side as Halliday at hockey.','',),
('armstrong','Armstrong','The boy with the bag of figrolls in his satchel, asked what was the end of Pyrrhus and offering a pier. Welloff people, proud that their eldest son was in the navy; Vico Road, Dalkey.','Armstrong'),
('comyn','Comyn','The boy who laughs, and who is told to ask Stephen about Pyrrhus.','Comyn'),
('talbot','Talbot','The boy who reads Lycidas with the book propped nimbly under the breastwork of his satchel, prompted word by word.','',),
('sargent','Sargent','The boy kept back after class over his sums, ugly and futile, with lean neck and tangled hair and a smear of ink on his cheek, whose mother loved him and who copies the symbols in grave morrice across the page.','Sargent'),
('sargent-mother','Sargent\u2019s mother','Who taught him to write and bought him a coloured picture book; and who, Stephen thinks, is the only one who loved him and saved him from being trampled underfoot.','',),
('halliday','Halliday','On the same side as Cochrane at hockey. Not the Jacob Halliday, vintner, of the mock legal report in episode 12.','',),
# --- the Dublin men Stephen owes money to
('curran','Curran','Ten guineas, in the list of Stephen\u2019s debts. Not John Philpot Curran of episode 7 nor Sara Curran of episode 12.','',),
('mccann','McCann','One guinea.','McCann'),
('fred-ryan','Fred Ryan','Two shillings.','Fred Ryan'),
('temple','Temple','Two lunches \u2014 and one of the oval equine faces of Stephen\u2019s dream in episode 3. Not Temple bar.','',),
('russell','Russell','One guinea: George Russell, the eminent poet who signs himself A. E., whom Bloom thinks of in episode 8 and who argues with Stephen in the library in episode 9.','',),
('cousins','Cousins','Ten shillings.','Cousins'),
('bob-reynolds','Bob Reynolds','Half a guinea.','Bob Reynolds'),
('koehler','Koehler','Three guineas.','Koehler'),
('mrs-mackernan','Mrs MacKernan','Five weeks\u2019 board.','Mrs MacKernan'),
# --- the people in Deasy's study and in his letter
('albert-edward','Albert Edward, prince of Wales','The shapely bulk of a man in tartan fillibegs over Deasy\u2019s mantelpiece, whom he stares at sternly.','',),
('sir-john-blackwood','Sir John Blackwood','Deasy\u2019s ancestor, who voted for the union \u2014 per vias rectas was his motto \u2014 and put on his topboots to ride to Dublin from the Ards of Down to do it. Stephen sees the gruff squire jogging on horseback instead.','',),
('henry-blackwood-price','Mr Henry Blackwood Price','Named in Deasy\u2019s letter to the press as making a courteous offer of a fair trial of Koch\u2019s preparation against foot and mouth disease. Not the Henry Price of the basket and fancy goods shop in episode 17.','Henry Blackwood Price'),
('koch','Koch','Whose preparation, serum and virus, the letter recommends.','Koch'),
('lord-hastings','lord Hastings|Lord Hastings','Owner of Repulse, one of the vanished horses framed on Deasy\u2019s walls.','lord Hastings|Lord Hastings'),
('duke-of-westminster','The Duke of Westminster','Owner of Shotover, another of them.','',),
('duke-of-beaufort','The Duke of Beaufort','Owner of Ceylon, prix de Paris, 1866, the third.','',),
('oconnell','O\u2019Connell','Whose time Deasy has seen three generations since, and whom the prelates of Stephen\u2019s communion denounced as a demagogue twenty years after the orange lodges had agitated for repeal.','',),
('parnell','Parnell','Whom a woman brought low, in Deasy\u2019s list of the women who have ruined men.','',),
# --- the schoolgirls of Stephen's envy
('edith','Edith','One of the four faces Stephen watches with envy, whose breaths are sweetened with tea and jam and whose bracelets titter in the struggle.','Edith'),
('ethel','Ethel','Another of the four.','Ethel'),
('school-gerty','Gerty','A third. Not the Gerty MacDowell of episode 13.','',),
('school-lily','Lily','The fourth. Not the red Carlisle girl of episode 1, and not the Lily of episodes 6, 12, 13 or 15.','',),
# --- the figures of the history lesson and of Stephen's thought
('pyrrhus','Pyrrhus','Whose end Armstrong cannot remember and whose fall by a beldam\u2019s hand in Argos Stephen sets beside Caesar\u2019s knifing as one of the things that are not to be thought away. Misled by an oracle, the newspaper men say of him in episode 7, he made a last attempt to retrieve the fortunes of Greece.','Pyrrhus'),
('julius-caesar','Julius Caesar','Knifed to death: the other of the two actualities Stephen says cannot be thought away.','Julius Caesar'),
('blake','Blake','Whose wings of excess thud in Stephen\u2019s thought of history fabled by the daughters of memory, and whose buttocks the creepycrawlers follow into eternity in episode 9. Not the Phil Blake of the weekly Pat and Bull story in episode 7.','',),
('aristotle','Aristotle','Whose phrase \u2014 the soul is the form of forms \u2014 forms itself within the gabbled verses and floats out into the studious silence of the library of Saint Genevieve, where Stephen read night by night, sheltered from the sin of Paris.','Aristotle'),
('averroes','Averroes','With Moses Maimonides, one of the dark men in mien and movement, gone from the world, flashing in their mocking mirrors the obscure soul of the world \u2014 a darkness shining in brightness which brightness could not comprehend.','Averroes'),
('maimonides','Moses Maimonides','The other of them.','Maimonides'),
('iago','Iago','Whose line Deasy quotes as Shakespeare\u2019s \u2014 put but money in thy purse \u2014 and whom Stephen names under his breath in correction.','Iago','reference','literary-figure'),
('cassandra','Cassandra','The classical allusion Deasy pardons himself for in the letter, and a woman, he adds, who was no better than she should be.','Cassandra'),
('helen','Helen','The runaway wife of Menelaus, for whom the Greeks made war ten years on Troy \u2014 first of Deasy\u2019s women who brought sin into the world.','',),
('menelaus','Menelaus','Her husband.','Menelaus'),
('macmurrough-wife','MacMurrough\u2019s wife','The faithless wife who first brought the strangers to our shore here, second of Deasy\u2019s three women who brought sin into the world. The text names her husband only in naming her, and O\u2019Rourke, prince of Breffni, was her leman.','MacMurrough'),
('orourke','O\u2019Rourke, prince of Breffni','Her leman.','',),
]:add(*row)

updates={}
for e in entities:e['snapshots']=[dict(after=list(at),body=body) for at,body in updates.get(e['id'],[])]
print(len(entities),'entities authored: episodes 1-2')
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(
 bookId='ulysses',
 contentVersion='2026-09-14.2',
 coverage='Both full English editions, episodes 1-2 of 18. Named persons, and the writers, saints, heresiarchs and stage figures the characters quote. Peoples, places, newspapers, songs, pubs and shops are not cast.',
 entities=[e for e in entities if e['name']!='unused']),ensure_ascii=False,indent=2)+'\n')
