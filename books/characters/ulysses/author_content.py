"""Manually authored recognition cards for both full English texts of Ulysses.

Joyce's text in both editions, 18 episodes, 7,148 paragraphs per edition,
aligned paragraph for paragraph. The modern edition is a light modernisation:
it resolves some of Joyce's run-together words and normalises punctuation, but
it does not rewrite the prose and it does not modernise the names. Where the two
differ on a name the difference is recorded on the card.

Episodes 1 to 3 are authored. The rest are not.

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
('thomas-aquinas','Thomas Aquinas','And the fiftyfive reasons he has made out to prop the theory up, which Mulligan says he is not equal to before a few pints. Stephen calls him Aquinas tunbelly on the strand, frate porcospino, and quotes his morose delectation.','Thomas Aquinas|Aquinas'),
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

# ========================= EPISODE 3 — Proteus
for row in [
# --- the household at Strasburg terrace, which Stephen walks towards and does not enter
('richie-goulding','Uncle Richie','Richie Goulding, Stephen’s uncle on his mother’s side, in his broad bed with a sturdy forearm over the hillock of his knees, drafting bills of costs on a lapboard and whistling the aria from the opera. He offers Stephen malt, a chippendale chair and a rasher fried with a herring, and admits there is nothing in the house but backache pills. Stephen’s father calls him the drunken little costdrawer.','','major'),
('aunt-sara','Aunt Sara','Richie’s wife, and the aunt whose house Stephen is walking towards and then walks past. Stephen’s father calls her aunt Sally and asks whether the boy could not fly a bit higher than Strasburg terrace. She is the mother Walter is sent to for the malt, and she is bathing Crissie when Stephen calls.','',),
('walter-goulding','Walter','Richie’s son, skeweyed, who draws the bolt and welcomes Stephen, is sent for the malt, squints vainly for a chair and finds the visitor nothing to sit on. He sirs his own father at every answer, which is what makes Stephen’s father say Jesus wept, and no wonder.','',),
('crissie-goulding','Crissie','Richie’s small daughter, being bathed upstairs while Stephen stands in the bedroom. Papa’s little bedpal, lump of love.','',),
('goulding-cornet-brother','The cornet player','Richie’s brother, named in Stephen’s father’s catalogue of the family he married into: the drunken little costdrawer and his brother the cornet player, highly respectable gondoliers.','',),
('simon-dedalus','Simon Dedalus','Stephen’s father, present in this episode only as the voice in his son’s head — my consubstantial father’s voice — mimicking the Gouldings and asking, and and and and tell us, Stephen, how is uncle Si. The man himself comes into the book in episode 6.','','major'),
# --- the strand
('florence-maccabe','Mrs Florence MacCabe','One of the two women who come down the steps from Leahy’s terrace and shuffle along the shelving shore, swinging a midwife’s bag. Out from the liberties for the day, of Bride Street. One of her sisterhood lugged Stephen squealing into life, and he wonders what she has in the bag: a misbirth with a trailing navelcord, hushed in ruddy wool.','',),
('patk-maccabe','The late Patk MacCabe','Her husband, deeply lamented, of Bride Street. The modern edition spells him Patrick.','',),
('cocklepicker-man','The cocklepicker','The man who comes shoreward with a woman and a dog, wades in to souse his bag, calls the dog Tatters off the dead carcass with a blunt bootless kick, and trudges away with the bags shouldered. Blued feet out of turnedup trousers and a dull brick muffler round his unshaven neck. Stephen makes him a ruffian out of the rogues’ lingo.','',),
('cocklepicker-woman','The cocklepicker’s woman','Who follows behind her lord with woman steps, spoils slung at her back, loose sand and shellgrit crusted on her bare feet and her hair trailing about her windraw face. Stephen gives her a whole life in three sentences: the archway where dogs have mired, the fancyman treating two Royal Dublins in O’Loughlin’s, Fumbally’s lane and the tanyard smells.','',),
('bookshop-woman','The girl at the bookshop window','The virgin at Hodges Figgis’ window on Monday, looking in for one of the alphabet books Stephen was going to write, her wrist through the braided jesse of her sunshade. She lives in Leeson park, a lady of letters. The modern edition calls her the young woman at the bookshop window.','',),
('two-maries','The two Marys','The women who came to the tomb on the third day, and whom Stephen sees in the two figures walking shoreward out of the tide. He adds that they have tucked it safe among the bulrushes, which is Moses and not Easter: the two stories run together in the same breath.','',),
# --- Paris, and Kevin Egan's table
('kevin-egan','Kevin Egan','The old Fenian in exile in Paris, rolling gunpowder cigarettes through fingers smeared with printer’s ink and sipping his green fairy, who talks of Ireland and hopes and conspiracies and would yoke Stephen as his yokefellow. Loveless, landless, wifeless, making his day’s stations between the dingy printingcase, his three taverns and the Montmartre lair. They have forgotten Kevin Egan, not he them.','Kevin Egan','major'),
('patrice','Patrice','Kevin Egan’s son, home on furlough, who lapped warm milk with Stephen in the bar MacMahon with a plump bunny’s face, hopes to win in the gros lots, read Michelet on the nature of women, and says he is a socialist and does not believe in the existence of God — but his father must not be told. His father calls him Pat: my son, soldier of France.','Patrice'),
('egan-wife','Kevin Egan’s wife','The madame in rue Gît-le-Cœur, quite nicey comfy without her outcast man, with a canary and two buck lodgers, peachy cheeks and a zebra skirt, frisky as a young thing.','',),
('head-centre','The head centre','The Fenian chief whose escape Egan retells as the authentic version: got up as a young bride, man, veil, orangeblossoms, and driven out the road to Malahide. The text names him by his office and never by his name; the modern edition calls him the rebel leader.','',),
('the-froeken','The froeken','The Swedish maid of all work who rubs male nakedness in the bath at Upsala — it is my job, she said, all the gentlemen — in Egan’s account of most licentious custom. The modern edition calls her the Scandinavian girl.','',),
('esther-osvalt','Esther Osvalt','The girl Stephen knew in Paris, whose shoe went on his foot: what a pretty little foot. He remembers being delighted by it while looking down at another man’s castoff boots on his own feet.','Esther Osvalt'),
('belluomo','Belluomo','Who rises from the bed of his wife’s lover’s wife in Stephen’s Paris waking rawly. The name is Italian for a handsome man, and the modern edition prints the translation in place of the name.','Belluomo'),
('yvonne','Yvonne','One of the two women in Rodot’s who newmake their tumbled beauties, shattering chaussons of pastry with gold teeth, their mouths yellowed with flan.','Yvonne'),
('madeleine','Madeleine','The other of them. Not Madeline the mare of the song at the start of the episode, who is a horse and is spelt with an i.','Madeleine'),
('arthur-griffith','Arthur Griffith','Named in Egan’s talk of hopes and conspiracies, beside A E and the good shepherd of men. Bloom thinks of him twice in the course of the day: the man who said the thing about the homerule sun rising up in the northwest, and a squareheaded fellow with no go in him for the mob.','Arthur Griffith|Griffith'),
('drumont','Monsieur Drumont','The famous French journalist Egan quotes, who called queen Victoria an old hag with the yellow teeth. Stephen gives the phrase back to himself later on the strand, with his own bad teeth in his mouth.','Drumont'),
('queen-victoria','Queen Victoria','The old hag with the yellow teeth, in Drumont’s phrase, which Stephen repeats. She had been dead three years on the day of this book.','',),
('maud-gonne','Maud Gonne','Beautiful woman, in Egan’s roll of Paris names. Bloom remembers her letter about taking the soldiers off O’Connell street at night: disgrace to our Irish capital.','Maud Gonne'),
('millevoye','Monsieur Millevoye','The French journalist and politician named beside Maud Gonne in the same breath, with La Patrie between them.','Millevoye'),
('felix-faure','Félix Faure','Named next, with the question Egan leaves hanging: know how he died? The answer is the two words that follow — licentious men.','Félix Faure|Faure'),
('brian-boru','Brian Boru','The high king whose warriors Egan means when he talks of Ireland. The older edition calls them the Dalcassians, which is the name of his people and not of a man; the modern edition puts the king in place of the people, so this card exists in the modern edition alone.','',),
('richard-burke','Colonel Richard Burke','Tanist of his sept, with whom Egan prowled under the walls of Clerkenwell and, crouching, saw a flame of vengeance hurl them upward in the fog. Not the O’Madden Burke of the newspaper office, nor Pisser Burke of the City Arms, nor Burke’s public house.','',),
('napper-tandy','Napper Tandy','Who takes me by the hand in the song Egan sings out of The Wearing of the Green. Not the Shapland Tandy whose bills of costs uncle Richie drafts.','Napper Tandy'),
('shapland-tandy','Master Shapland Tandy','One of the two masters for whose eyes Richie Goulding drafts his bills of costs, with master Goff, among consents and common searches and a writ of Duces Tecum. Not Napper Tandy of the song.','Shapland Tandy'),
('goff','Master Goff','The other of the two, named in the same line of legal work.','Goff'),
('strongbow','Strongbow','Whose castle on the Nore stands over old Kilkenny in Egan’s memory of the song he taught Patrice.','Strongbow'),
('saint-canice','Saint Canice','Of Kilkenny, named with Strongbow’s castle in the same memory, and again in the long procession of saints in episode 12.','Canice'),
# --- the figures Stephen thinks with
('demiurge','Los Demiurgos','The maker whose mallet Stephen hears in the solid sound of his own boots on the strand. The modern edition replaces the demiurge of the gnostics with God the Creator.','',),
('adam','Adam','The first man: Adam Kadmon, the primal man of the kabbalists, whose spouse and helpmate is Heva; and again, at the end of the episode, unfallen Adam who rode and did not rut. The modern edition writes the primal man Adam.','Adam Kadmon'),
('eve','Eve','Heva, naked Eve, who had no navel — belly without blemish, a buckler of taut vellum — set against the trailing navelcord in the midwife’s bag. The older edition gives her Hebrew name first; the modern edition drops it and keeps Eve.','Heva'),
('mananaan','Mananaan','Mananaan MacLir, the Irish sea god, whose steeds are the whitemaned seahorses of the waves coming in. The modern edition explains him as the sea god Mananaan; A E invokes him by both names in the library.','Mananaan'),
('joachim-abbas','Joachim Abbas','The abbot whose fading prophecies Stephen read in the stagnant bay of Marsh’s library, and whom Mulligan mocks in episode 10 as mumbling Joachim. The modern edition names him Joachim of Fiore.','Joachim Abbas|Joachim of Fiore|Joachim'),
('foxy-campbell','Foxy Campbell','One of the oval equine faces in Stephen’s procession of the mad: Temple, Buck Mulligan, Foxy Campbell, Lanternjaws. Not the Thomas Campbell of the churchyard poem, nor Henry Campbell the townclerk.','Foxy Campbell'),
('lanternjaws','Lanternjaws','The last of the four faces, known by his jaw and by nothing else. The modern edition hyphenates him.','Lanternjaws|Lantern-jaws'),
('william-of-ockham','Dan Occam','The invincible doctor, who thought of the host elevated in two churches at once — a misty English morning, the imp hypostasis tickled his brain. The modern edition names him William of Ockham and calls him the invincible logician.','Dan Occam|Occam|William of Ockham|Ockham'),
('blessed-virgin','The Blessed Virgin','To whom Stephen prayed that he might not have a red nose, in the same breath in which he prayed to the devil in Serpentine avenue that the fubsy widow in front might lift her clothes still more.','Blessed Virgin'),
('pico-della-mirandola','Pico della Mirandola','Whom Stephen thinks of over the epiphanies he meant to have sent, if he died, to all the great libraries of the world, including Alexandria: someone was to read them there after a few thousand years. Ay, very like a whale.','Pico della Mirandola|Mirandola'),
('michelet','Michelet','The French historian in whom Patrice read about the nature of women, over warm milk in the bar MacMahon.','Michelet'),
('leo-taxil','Monsieur Léo Taxil','Author of La Vie de Jésus, which Patrice must send Stephen and has lent to a friend. His is the joke of the pigeon — who put you in this wretched position? It was the pigeon, Joseph — and the French of it comes back in episode 14.','Léo Taxil|Taxil'),
('columbanus','Columbanus','The fiery missionary to Europe Stephen meant to follow, and who in the history lesson of the episode before bestrode his own mother’s prostrate body in holy zeal. The modern edition calls him Saint Columban.','Columbanus|Columban'),
('fiacre','Fiacre','One of the two Irish monks laughing in heaven on their creepystools, spilt from their pintpots. Not the church of Saint Fiacre in Horto of the mock wedding report in episode 12.','',),
('scotus','Scotus','The other of them, loudlatinlaughing: Euge! Euge!','Scotus'),
('king-malachi','Malachi','The high king who wore the collar of gold, in Stephen’s vision of the Danish galleys beaching on this same strand. The ardri Malachi of the roll of Irish heroes in episode 12 is the same king. Malachi Mulligan is not, and neither is the Saint Malachy of the procession.','',),
('bruce-brother','The Bruce’s brother','Edward Bruce, brother of Robert the Bruce, crowned king of Ireland and killed for it: first of Stephen’s four pretenders. The text names him only as his brother’s brother.','',),
('thomas-fitzgerald','Thomas Fitzgerald','Silken Thomas, the silken knight, second of the four. Not the lord Edward Fitzgerald who escaped from major Sirr, nor the Fitzgerald Mor, the great earl.','Thomas Fitzgerald'),
('perkin-warbeck','Perkin Warbeck','York’s false scion, in breeches of silk of whiterose ivory, wonder of a day.','Perkin Warbeck'),
('lambert-simnel','Lambert Simnel','With a tail of nans and sutlers, a scullion crowned. Last of the four, and the one the thought closes on: all kings’ sons, paradise of pretenders then and now.','Lambert Simnel'),
('guido','Guido','Whom the courtiers mocked in Or san Michele — and they were in their own house, which is the turn Stephen uses against himself while deciding he would not go in after a drowning man. The modern edition calls him the poet Guido and drops the name of the church.','Guido'),
('sir-lout','Sir Lout','The giant whose toys are the stoneheaps on the strand: I am the bloody well gigant rolls all them bloody well boulders, bones for my steppingstones. Feefawfum. The modern edition keeps the giant and drops the name.','Sir Lout'),
('haroun-al-raschid','Haroun al Raschid','The caliph of the dream Stephen is almosting: open hallway, street of harlots, the man who led me and held a melon against my face, and the red carpet spread. The modern edition adds that he is out of the Arabian Nights and spells him Rashid.','Haroun al Raschid|Haroun Al Raschid|Haroun al Rashid'),
('louis-veuillot','Louis Veuillot','Who called Gautier’s prose a coach stuck in the sand — the phrase Stephen turns over on these heavy sands. The modern edition explains him as the French critic.','Louis Veuillot|Veuillot'),
('gautier','Théophile Gautier','Whose prose he called it. The older edition gives the surname alone; the modern edition supplies the first name.','Gautier'),
('ferrando','Ferrando','Whose aria di sortita uncle Richie drones on his padded knees: the grandest number, Stephen, in the whole opera. The modern edition spells him Fernando.','Ferrando|Fernando'),
('saint-ambrose','Saint Ambrose','Who heard the sigh of leaves and waves waiting and awaiting the fullness of their times, in the Latin Stephen quotes over the weeds swaying under the tide.','Saint Ambrose|Ambrose'),
('berkeley','The bishop of Cloyne','Who took the veil of the temple out of his shovel hat: the veil of space with coloured emblems hatched on its field. The modern edition names him, calling him the philosopher Bishop Berkeley and giving him a top hat.','',),
('pan','Pan','Whose hour is the faunal noon in which Stephen lies back over the sharp rocks with his hat tilted down on his eyes, among gumheavy serpentplants and milkoozing fruits.','',),
('lawn-tennyson','Lawn Tennyson','Gentleman poet, whose May Queen gives Stephen the line he hums with his bad teeth — of all the glad new year, mother, the rum tum tiddledy tum. The same phrase for him comes back in the library in episode 9.','Lawn Tennyson|Tennyson'),
('lucifer','Lucifer','Allbright he falls, proud lightning of the intellect. The Latin Stephen quotes is from the Easter Exsultet, where Lucifer is the morning star that knows no setting; Stephen means the falling angel as well.','',),
]:add(*row)

updates={}
for e in entities:e['snapshots']=[dict(after=list(at),body=body) for at,body in updates.get(e['id'],[])]
print(len(entities),'entities authored: episodes 1-3')
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(
 bookId='ulysses',
 contentVersion='2026-09-14.3',
 coverage='Both full English editions, episodes 1-3 of 18. Named persons, and the writers, saints, heresiarchs and stage figures the characters quote. Peoples, places, newspapers, songs, pubs and shops are not cast.',
 entities=[e for e in entities if e['name']!='unused']),ensure_ascii=False,indent=2)+'\n')
