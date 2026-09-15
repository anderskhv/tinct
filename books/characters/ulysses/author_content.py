"""Manually authored recognition cards for both full English texts of Ulysses.

Joyce's text in both editions, 18 episodes, 7,148 paragraphs per edition,
aligned paragraph for paragraph. The modern edition is a light modernisation:
it resolves some of Joyce's run-together words and normalises punctuation, but
it does not rewrite the prose and it does not modernise the names. Where the two
differ on a name the difference is recorded on the card.

Episodes 1 to 7 are authored. The rest are not.

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
('deasy','Mr Garrett Deasy','The headmaster of the school at Dalkey where Stephen teaches: an Ulster protestant and a unionist who pays Stephen his salary in sovereigns and shillings, lectures him on saving money, dictates a letter to the press about foot and mouth disease, and tells him that England is in the hands of the jews and that Ireland never persecuted them because she never let them in.','Garrett Deasy|Deasy','major'),
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
('simon-dedalus','Simon Dedalus','Stephen’s father, present in this episode only as the voice in his son’s head — my consubstantial father’s voice — mimicking the Gouldings and asking, and and and and tell us, Stephen, how is uncle Si. In episode 6 he is in the funeral carriage all morning, and from there on every Mr Dedalus and every bare Dedalus in the book is him and not his son.','','major'),
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
('head-centre','James Stephens','The head centre of the Fenian brotherhood, whose escape Kevin Egan retells as the authentic version: got up as a young bride, man, veil, orangeblossoms, and driven out the road to Malahide. Episode 3 names him only by his office — the modern edition calls him the rebel leader — and Bloom gives him his name at 4:159: the chap in the paybox at the Tara street baths got away James Stephens, they say. Not the James Stephens of 9:126, who is doing some clever sketches.','',),
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

# ========================= EPISODE 4 — Calypso
for row in [
# --- 7 Eccles street
('leopold','Leopold Bloom','The man the book follows from this morning to the small hours: an advertisement canvasser of 7 Eccles street who eats with relish the inner organs of beasts and fowls, fries a pork kidney for his own breakfast and carries his wife her tea in bed. Jewish by descent in a city that will not let him forget it, kind to the cat, curious about everything, and carrying a potato in his pocket. His wife calls him Poldy and his daughter calls him Papli.','','central'),
('molly','Molly Bloom','Marion Bloom, born Marion Tweedy at Gibraltar: a concert soprano, and in bed for the whole of this episode, reading a novel and asking her husband what metempsychosis means. Tell us in plain words. The letter in the bold hand that she glances at and tucks under the pillow is from Blazes Boylan, who is coming at four with the programme. The envelope calls her Mrs Marion Bloom, which is not how a letter is addressed to a married woman.','','central'),
('milly','Milly Bloom','Their daughter, fifteen yesterday and away from home for the first time, learning the photography business at Mullingar. Her birthday letter thanks her father for the present, says everyone says she is quite the belle in her new tam, and mentions a young student named Bannon who sings Boylan’s song about those seaside girls. Her father calls her silly Milly; she signs herself your fond daughter Milly.','','major'),
('rudy','Rudy','Their son, who lived eleven days. Mrs Thornton knew from the first that he would not live, and knew at once. He would be eleven now if he had lived, and the thought of him runs under everything his father does in this book.','Rudy'),
('major-tweedy','Old Tweedy','Molly’s father, who bought the bed at the governor’s auction at Gibraltar and got a short knock — hard as nails at a bargain, and I rose from the ranks, sir, and I’m proud of it. He made a corner in stamps, which Bloom calls farseeing, and his big moustaches walk into the daydream of the east. The modern edition calls him old Major Tweedy.','',),
('hanlon-milkman','Hanlon’s milkman','Who had just filled the jug Bloom pours the cat’s milk out of. The modern edition drops the dairy’s name and leaves only the milkman.','',),
# --- Dorset street
('larry-orourke','Larry O’Rourke','The publican on the corner, a cute old codger and baldhead over the blind, leaning against the sugarbin in his shirtsleeves and watching the curate swab up. No use canvassing him for an ad, but he knows his own business best. Bloom says good day through the doorway and thinks of stopping to say a word about the funeral. Simon Dedalus takes him off to a tee with his eyes screwed up.','',),
('dlugacz','Dlugacz','The ferreteyed porkbutcher of Dorset street with a deep voice, blotchy sausagepink fingers and a pile of cut sheets from a Zionist planting company to wrap the sausages in. Bloom buys the last pork kidney from him and carries away one of the sheets. A later episode gives him a first name: Moses Dlugacz.','Dlugacz'),
('nextdoor-girl','The nextdoor girl','The servant from the house next door, at the counter ahead of Bloom with a slip in her hand and a pound and a half of Denny’s sausages. The porkbutcher calls her my miss; Bloom means to catch up and walk behind her and does not, and thinks of the constable off duty who cuddles her in Eccles lane. She is in the next garden again when he goes down to the jakes.','',),
('woods','Woods','The neighbour she works for. Woods his name is: wonder what he does, wife is oldish, no followers allowed.','',),
# --- the letters, and the people in them
('blazes-boylan','Blazes Boylan','Who is bringing Molly the programme at four, and whose letter in the bold hand goes under her pillow unread in front of her husband. Bloom will not hold the name in his mind for long at a time: is that Boylan well off, he has money, why, I noticed he had a good rich smell off his breath dancing. Milly writes that the young student sings Boylan’s song about those seaside girls, and nearly writes Blazes.','','major'),
('mr-coghlan','Mr Coghlan','The photographer Milly works for at Mullingar, who took one of her and Mrs and will send it when developed.','Coghlan'),
('professor-goodwin','Professor Goodwin','Molly’s old accompanist, a dreadful old case and a courteous old chap, who used to bow her off the platform in the oldfashioned way and kept a little mirror in his silk hat. Milly found it and carried it into the parlour, and they all laughed.','Goodwin'),
('paddy-dignam','Dignam','Whose funeral is at eleven, and the fixed point of the day for half the men in this book. Bloom comes back to him three times before he has left the house: a word about him to Larry O’Rourke, a man’s soul after he dies — Dignam’s soul — and, under the bells of George’s church, poor Dignam. Not Master Patrick Aloysius Dignam of episode 10, who is his son.','','major'),
('mrs-thornton','Mrs Thornton','The midwife of Denzille street, a jolly old woman who must have helped a lot of babies into the world, whom Bloom ran to knock up the summer morning Milly was born, and who knew from the first that Rudy would not live. Well, God is good, sir.','Mrs Thornton'),
('citron','Citron','Of Saint Kevin’s parade, in whose basketchair Molly used to sit on the pleasant evenings of the old Lombard street days. Wonder is poor Citron still there.','Citron'),
('mastiansky','Mastiansky','Of the same evenings, with the old cither, and the man who told Bloom that the giant poppies of the Chinese cemeteries produce the best opium. A later episode gives him a first name, Julius; the Mrs Mastiansky of the last episode is his wife and not him.','',),
('moisel','Moisel','Who told Bloom that the citrons fetched high prices too. Arbutus place, Pleasants street: pleasant old times.','',),
('norwegian-captain','The Norwegian captain','Whose back Bloom is reminded of by a man on the quayside he knows just to salute — chap you know just to salute, bit of a bore. The captain is not described and is named nowhere else in the book in these words.','',),
('adam-findlater','Adam Findlater','One of two Dublin names Bloom uses as a type: the redheaded curates up from the county Leitrim, rinsing empties, who then lo and behold blossom out as Adam Findlaters or Dan Tallons. The modern edition drops both names and writes successful businessmen instead, so this card exists in the older edition alone.','',),
('dan-tallon','Dan Tallon','The other of the two. The modern edition drops him here as well, but keeps him at 17:109, where he is the new lord mayor, Daniel Tallon.','',),
('moses-montefiore','Moses Montefiore','Whose name stands on the sheet Bloom takes from the porkbutcher’s pile, over the model farm at Kinnereth on the lakeshore of Tiberias. I thought he was, Bloom says, and leaves the sentence unfinished.','',),
('kearney','Kearney','Bloom’s guarantor at the Capel street library, who will be written to if the book is not renewed. Not the Kathleen Kearney whom Molly cannot bear.','',),
('mccoy','M’Coy','Through whom Bloom thinks he might work a press pass to Mullingar, to go down and see Milly. He appears in person in the next episode and asks to have his name put down at the funeral.','M’Coy|M\'Coy'),
('gretta-conroy','Gretta Conroy','Whose dress Molly asked about at 9.20 one morning while she dressed — one of the remarks Bloom used to try jotting down on his cuff.','Gretta Conroy'),
('sandow','Sandow','Whose exercises Bloom must begin again. On the hands down. A later episode names the book: Eugen Sandow, Physical Strength and How to Obtain It.','Sandow'),
('ponchielli','Ponchielli','Whose dance of the hours May’s band played the morning after the bazaar dance, and which Bloom is still explaining to himself: morning hours, noon, then evening coming on, then night hours.','Ponchielli'),
('jc-doyle','J. C. Doyle','The singer Molly is to sing Là ci darem with on the tour, with Love’s Old Sweet Song for the other number.','J. C. Doyle'),
('katey-keogh','Katey Keogh','With her ass and garden, in the song Bloom sings over his daughter’s letter: I’d rather have you without a farthing than Katey Keogh.','Katey Keogh'),
# --- what Bloom and Molly read
('paul-de-kock','Paul de Kock','The French novelist Molly wants another of. Nice name he has — which is the whole of Bloom’s comment, and enough.','Paul de Kock'),
('ruby','Ruby','The pride of the ring, on the floor naked in the illustration with the sheet kindly lent: the heroine of the novel Molly has finished and wants replaced. The first Ruby on the page is the title of the book and carries no card; the second is the girl.','',),
('maffei','Maffei','The monster who desisted and flung his victim from him with an oath — the fierce Italian with the carriagewhip in the illustration.','Maffei','reference','literary-figure'),
('philip-beaufoy','Mr Philip Beaufoy','Of the Playgoers’ Club, London, who wrote Matcham’s Masterstroke and was paid at the rate of one guinea a column for it. Bloom reads it seated calm above his own rising smell, envies him kindly the three pounds thirteen and six, and tears away half of it to wipe himself. Not the Mrs Beaufoy of episode 8, who is Mrs Purefoy under a slip of the tongue.','',),
('matcham','Matcham','Who often thinks of the masterstroke by which he won the laughing witch who now. Begins and ends morally. Hand in hand. Smart. His story stands in Gutenberg italics in the older edition, which is why his name is keyed and not aliased.','','reference','literary-figure'),
]:add(*row)

# ========================= EPISODE 5 — Lotus Eaters
for row in [
# --- the correspondence
('henry-flower','Henry Flower','The name Bloom writes under and collects his letters under: Henry Flower Esq, care of the post office in Westland row. He carries the card for it behind the leather headband of his hat and puts it back before going into church. It is his own name translated — Virag, his father’s name, is Hungarian for flower.','Henry Flower','major'),
('martha-clifford','Martha','The typist who writes to Henry Flower and signs herself Martha: I called you naughty boy because I do not like that other world. Please tell me what is the real meaning of that word. She pins a yellow flower to the letter and asks, in a postscript, what perfume his wife uses. Her surname, Clifford, is given in a later episode.','','major'),
('the-postmistress','The postmistress','Who searches the pigeonhole at Westland row and hands Bloom back his card with a letter, while he holds his rolled newspaper against his nostrils and looks at the recruiting poster.','',),
# --- the people he meets and passes
('mccoy-wife','Mrs M’Coy','Whose engagement is not settled yet: a reedy freckled soprano with a cheeseparing nose, nice enough for a little ballad. Her husband brings her up so as to borrow a valise, which is the wheeze Bloom did not fall for.','',),
('bantam-lyons','Bantam Lyons','Who takes Bloom’s newspaper at his armpit with yellow blacknailed fingers to look up the French horse running at Ascot, hears him say twice that he was going to throw it away, and speeds off towards Conway’s corner to back Throwaway. Bloom never learns what he has said.','Bantam Lyons','major'),
('bob-doran','Bob Doran','On one of his periodical bends, in Conway’s with Bantam Lyons when M’Coy was there.','',),
('hoppy-holohan','Hoppy Holohan','Who told M’Coy about the funeral, and came into Conway’s for a wet. You know Hoppy?','Hoppy Holohan|Holohan|Hoppy'),
('corny-kelleher','Corny Kelleher','Who Bloom daresays bagged the funeral job for O’Neill’s, singing with his eyes shut. Police tout, he adds, and goes off into the tooraloom song. He manages the undertaker’s, and turns up wherever the day’s business is.','Kelleher','major'),
('tom-kernan','Tom Kernan','From whom Bloom means to get tea, and cannot ask at a funeral.','Tom Kernan'),
('hornblower','Hornblower','At the porter’s lodge of Trinity, worth keeping on hands: might take a turn in there on the nod. How do you do, Mr Hornblower? How do you do, sir?','Hornblower'),
('the-chemist','The chemist','Of Sweny’s in Lincoln place, who turns back page after page of the prescriptions book to find the lotion of sweet almond oil and tincture of benzoin, and sells Bloom a cake of sweet lemony soap for fourpence to be paid for later. Sandy shrivelled smell he seems to have. Shrunken skull. And old.','',),
('skins-boy','The boy for the skins','Lolling by Brady’s cottages with his bucket of offal linked, smoking a chewed fagbutt. Tell him if he smokes he won’t grow. O let him. His life isn’t such a bed of roses.','',),
('caskhoop-girl','The girl with the caskhoop','Smaller, with scars of eczema on her forehead, who eyes him listlessly, holding her battered hoop.','',),
('coombe-sluts','The two in the Coombe','The two women linked together in the rain that night in the Coombe, whose flat Dublin voices bawl the song about Mairy’s drawers in Bloom’s head, and who would listen too, he thinks, in the house at Bethany. The modern edition calls them two rough girls.','',),
('rudolph-bloom','Poor papa','Bloom’s father, who used to talk of Kate Bateman in Leah and of the scene where the old blind Abraham knows his son’s voice. He is not named in this episode, and Bloom is glad he did not go into the room to look at his face. That day. O, dear! O, dear!','','major'),
# --- remembered
('bob-cowley','Bob Cowley','Who lent M’Coy his valise for the Wicklow regatta concert last year and never heard tidings of it from that good day to this.','Bob Cowley'),
('vance','Vance','The High school master who cracked his fingerjoints teaching the law of falling bodies: thirtytwo feet per second per second. He taught the colours of the spectrum too.','Vance'),
('mrs-ellis','Mrs Ellis','Who kept the old dame’s school where Bloom played marbles, and liked mignonette. And Mr? — the question he leaves unfinished.','Mrs Ellis'),
('jack-fleming','Jack Fleming','Who embezzled to gamble and was smuggled off to America, and keeps a hotel now. They never come back.','Jack Fleming'),
('captain-culler','Captain Culler','Who broke a window in the Kildare street club with a slog to square leg — the whole of Bloom’s case for cricket in Ireland.','Captain Culler'),
('mccarthy-of-the-song','M’Carthy','Whose taking the floor set the skulls cracking, in the song Bloom half quotes about Donnybrook fair. Not the Jakes M’Carthy of episode 7, nor Justin M’Carthy, nor Denis Florence M’Carthy.','',),
('mairy','Mairy','Who lost the pin of her drawers and did not know what to do to keep it up, in the song of the two women in the Coombe. The modern edition spells her Mary.','',),
('martin-cunningham','Martin Cunningham','Who knows Father Conmee. He is the organiser of the funeral party in the next episode and of the collection for the Dignams after it.','Martin Cunningham','major'),
('john-conmee','Father John Conmee','Whose sermon on saint Peter Claver and the African Mission is on the notice at the door of All Hallows. Distinguishedlooking, Bloom thinks, and regrets not having worked him about getting Molly into the choir. He opens episode 10 walking across Dublin.','Conmee','major'),
('peter-claver','Saint Peter Claver','The Jesuit of the African mission, subject of the sermon — and the name Bloom reaches for and mixes up with Peter Carey, a few paragraphs later, in the same church.','Peter Claver|Claver'),
('gladstone','Gladstone','For whose conversion they had prayers when he was almost unconscious. The protestants are the same, Bloom adds.','Gladstone'),
('william-walsh','Dr William J. Walsh','Archbishop of Dublin, whom the protestants would convert to the true religion in the same way. Not the Louis J Walsh of Magherafelt in episode 13.','William J. Walsh'),
('father-farley','Father Farley','Who got the choir place instead of Molly, and who looked a fool but wasn’t.','Father Farley'),
('carey','Carey','The informer who turned queen’s evidence on the invincibles and took communion every morning in this very church, with a wife and six children at home and the murder plotted all the while. Bloom cannot fix the first name: Carey was his name, Peter Carey, yes — no, Peter Claver I am thinking of — Denis Carey. Episode 8 has him hesitating the same way: Peter or Denis or James Carey.','',),
('old-glynn','Old Glynn','The organist of Gardiner street, who knew how to make that instrument talk, the vibrato, and had fifty pounds a year for it.','Glynn'),
('bernard-vaughan','Father Bernard Vaughan','Whose sermon came before the music on the day Molly was in fine voice: Christ or Pilate? Christ, but don’t keep us all night over it.','Bernard Vaughan'),
# --- the theatre, and Bloom's father's theatre
('mrs-bandmann-palmer','Mrs Bandmann Palmer','Playing Leah tonight, and Hamlet last night: a male impersonator, which sets Bloom wondering whether Hamlet was a woman and why Ophelia committed suicide.','Mrs Bandmann Palmer|Bandmann Palmer'),
('kate-bateman','Kate Bateman','Whom Bloom’s father used to talk of in the same part, and waited all the afternoon outside the Adelphi in London to see — the year before Bloom was born, sixtyfive.','Kate Bateman'),
('ristori','Ristori','And Ristori in Vienna: the other actress his father named.','Ristori'),
('mosenthal','Mosenthal','Who wrote the play. By Mosenthal it is. Bloom gropes for the title after the author’s name and does not find it.','Mosenthal'),
('leah-nathan','Nathan','Whose voice the old blind man knows in the scene Bloom’s father was always talking about: Nathan’s voice! His son’s voice! I hear the voice of Nathan who left his father to die of grief and misery in my arms.','Nathan','reference','literary-figure'),
('leah-abraham','Abraham','The old blind man of that scene, who recognises the voice and puts his fingers on his face. Not the patriarch of episodes 12 and 15.','','reference','literary-figure'),
('ophelia','Ophelia','Who committed suicide, and why — the question Bloom asks himself in front of the playbill, and which the library argument of episode 9 takes up in earnest.','Ophelia','reference','literary-figure'),
# --- the church, and what Bloom thinks in it
('pilate','Pilate','Christ or Pilate, the choice Father Bernard Vaughan’s sermon offered. Professor MacHugh gives him a second line in episode 7.','Pilate'),
('saint-michael','Saint Michael','The archangel of the prayer after mass: blessed Michael, defend us in the hour of conflict. His host are the embattled angels of the church whose menace Stephen remembers in episode 1.','',),
('satan','Satan','Whom the same prayer asks God to thrust down to hell, with those other wicked spirits who wander through the world for the ruin of souls.','',),
('saint-peter','Saint Peter','Named with Paul in Bloom’s inventory of what the mass is about: glorious and immaculate virgin, Joseph her spouse, Peter and Paul.','',),
('saint-paul','Saint Paul','The other of the pair.','',),
('buddha','Buddha','Lying on his side in the museum with his hand under his cheek, taking it easy, josssticks burning: the god Bloom sets against the Ecce Homo, the crown of thorns and the cross.','Buddha'),
('mohammed','Mohammed','Who cut a piece out of his mantle rather than wake the cat asleep on it — the story Bloom remembers over a tabby on a warm sill. The modern edition calls him the Prophet Muhammad.','Mohammed|Muhammad'),
('saint-patrick','Saint Patrick','And the shamrock: clever idea, Bloom says, in the same breath as the chopsticks and the heathen Chinee.','',),
# --- the money
('lord-iveagh','Lord Iveagh','Who once cashed a sevenfigure cheque for a million in the bank of Ireland. Shows you the money to be made out of porter.','',),
('lord-ardilaun','Lord Ardilaun','The other brother, who has to change his shirt four times a day, they say.','Ardilaun'),
('duke-of-albany','The duke of Albany','One of the old queen’s sons, who had only one skin. Leopold, yes — which is Bloom’s own name, and the only reason he remembers the man.','duke of Albany|Duke of Albany'),
('brutus','Brutus','And Brutus is an honourable man: Antony’s line, which Bloom turns on the stylish woman outside the Grosvenor. The honourable Mrs.','Brutus','reference','literary-figure'),
# --- the music
('rossini','Rossini','Whose Stabat Mater Molly sang in Gardiner street, with the thrill in the air and the people looking up.','Rossini'),
('mercadante','Mercadante','Of the seven last words, first of Bloom’s list of that old sacred music, splendid. Molly sang his Quis est homo too.','Mercadante'),
('mozart','Mozart','Whose twelfth mass has the Gloria in it.','Mozart'),
('palestrina','Palestrina','For example too, among the old popes keen on music and art and statues and pictures of all kinds. They had a gay old time while it lasted.','Palestrina'),
('martha-and-mary','Martha and Mary','The two sisters of Bethany, in whose house Christ sat talking — the picture Bloom half remembers when his correspondent’s name slides into the gospel: old master or faked for money. He is sitting in their house, talking. Mysterious.','',),
]:add(*row)

# ========================= EPISODE 6 — Hades
for row in [
# --- the carriage
('peeping-woman','The old woman peeping','Who drags her blind aside as the funeral leaves Newbridge avenue, her nose whiteflattened against the pane, thanking her stars she was passed over. Extraordinary the interest they take in a corpse, Bloom thinks: glad to see us go, we give them such trouble coming.','',),
('jack-power','Mr Power','Jack Power, the fourth man in the carriage: goodlooking, greyish over the ears, and the one who says out loud that the worst of all is the man who takes his own life, not knowing whose father did. Bloom has heard he keeps a barmaid from Jury’s or the Moira. Mr Dedalus calls him Jack at the graveside.','','major'),
# --- the people the carriage talks about
('mrs-fleming','Mrs Fleming','Who comes in to clean at Eccles street, made the bed with Molly, and did not darn Bloom’s socks well enough.','Mrs Fleming'),
('ignatius-gallaher','Ignatius Gallaher','With whom Richie Goulding waltzed in Stamer street of a Sunday morning, the landlady’s two hats pinned on his head. The newspaper men of episode 7 remember him as the man who paralysed Europe.','Ignatius Gallaher'),
('peter-paul-mswiney','Peter Paul M’Swiney','Mr Dedalus’s cousin, in whose shop a counterjumper’s son sold tapes — the whole of his case against Mulligan.','Peter Paul M’Swiney|Peter Paul M\'Swiney'),
('ned-lambert','Ned Lambert','One of the mourners behind, who was down for the Cork park races and stopped with Dick Tivy, tells Mr Dedalus who is walking in front, and tells John Henry Menton who Bloom is.','Ned Lambert','major'),
('joe-hynes','Hynes','The reporter, who walks behind with Ned Lambert and takes the names at the graveside for the paper — and takes down M’Intosh as a name because Bloom said macintosh. He asks the others to go round by the chief’s grave.','Hynes','major'),
('paddy-leonard','Paddy Leonard','Who was taking Tom Kernan off to his face last night.','Paddy Leonard'),
('ben-dollard','Ben Dollard','Whose singing of The Croppy Boy Tom Kernan called the most trenchant rendering he ever heard in the whole course of his experience.','Ben Dollard','major'),
('dan-dawson','Dan Dawson','Whose speech is in the paper this morning, and which Mr Dedalus refuses to have read out to him in a carriage. The newspaper office takes it apart in episode 7.','Dan Dawson'),
('eugene-stratton','Eugene Stratton','On the hoardings past the Queen’s theatre, and on them again for Father Conmee in episode 10.','Eugene Stratton'),
('philip-crampton','Sir Philip Crampton','Whose memorial fountain bust they pass. Who was he? — which is the whole of Bloom’s thought about him.','Philip Crampton'),
('mary-anderson','Mary Anderson','Who is up in Belfast now, in Martin Cunningham’s one contribution to the talk about the concert tour.','Mary Anderson'),
('louis-werner','Louis Werner','Who is touring Molly.','Louis Werner'),
('john-mccormack','John MacCormack','Whom Bloom hopes to have among the topnobbers, with J. C. Doyle.','John MacCormack'),
('smith-obrien','Smith O’Brien','Whose statue has a bunch of flowers laid at it. Must be his deathday, Bloom thinks: for many happy returns.','Smith O’Brien|Smith O\'Brien'),
('ocallaghan','O’Callaghan','The old man at the curbstone selling four bootlaces for a penny, struck off the rolls, who had his office in Hume street and has had the silk hat ever since. Relics of old decency. On his last legs.','',),
('waterford-tweedy','Tweedy, crown solicitor for Waterford','Molly’s namesake, who had his office in the same house. Not her father.','',),
('crofton','Crofton','Who met Mr Power one evening bringing his woman a pound of rumpsteak — the only evidence Bloom has for the story.','Crofton'),
('john-gray','Sir John Gray','Whose statue the carriage passes while Mr Power collapses in laughter.','',),
('nelson','Nelson','Whose pillar they pass. Horatio onehandled Nelson, as episode 11 has him.','Nelson'),
('father-mathew','Father Mathew','The temperance apostle, under whose patronage the dead side of the street stands, with the foundation stone for Parnell beside it.','Father Mathew|Theobald Mathew'),
# --- Reuben J and the son
('reuben-j','Reuben J','Reuben J Dodd, the moneylender, stumping round the corner of Elvery’s on a stick — of the tribe of Reuben, Martin Cunningham says, and the carriage enjoys him. He gave the boatman who fished his son out of the Liffey a florin, which Mr Dedalus calls one and eightpence too much. Mr Dedalus also calls him Barabbas, after the robber released instead of Christ, and does so again in episode 10.','',),
('reuben-son','Reuben J’s son','The young chiseller, whom his father was sending to the Isle of Man out of harm’s way over a girl, and who got loose on the quay and went over the wall into the river.','',),
('liffey-boatman','The boatman','Who got a pole and fished him out by the slack of the breeches and landed him up to the father more dead than alive. Half the town was there. A silver florin.','',),
# --- the funeral party at Glasnevin
('john-henry-menton','John Henry Menton','Solicitor, commissioner for oaths and affidavits, in whose office Dignam used to be. He danced with Molly at Mat Dillon’s seventeen golden years ago and has disliked Bloom ever since an evening at bowls, and asks Ned Lambert in God’s name what she married a coon like that for. Bloom points out the dinge in his hat and gets a short thank you.','John Henry Menton','major'),
('mat-dillon','Mat Dillon','Jolly Mat of Roundtown, in whose house Molly and Menton danced: convivial evenings, cold fowl, cigars, the Tantalus glasses. Heart of gold really.','Mat Dillon'),
('floey-dillon','Floey Dillon','Linked with Molly under the lilactree, laughing, on the same evening.','Floey Dillon'),
('wisdom-hely','Wisdom Hely','The stationer Bloom travelled for, in blottingpaper.','Wisdom Hely'),
('dick-tivy','Dick Tivy','The solid man of Cork, with whom Ned Lambert stopped for the races, and who has nothing between himself and heaven — which is Ned Lambert’s way of saying he is bald.','Dick Tivy'),
('dignam-son','The boy with the wreath','Paddy Dignam’s eldest, in a brandnew collar, sleekcombed, who carries one of the two wreaths, is beckoned to kneel by Corny Kelleher, and stands at the gravehead holding it with both hands. Martin Cunningham is trying to get him into Artane. He has episode 10 to himself, carrying home a pound and a half of porksteaks.','',),
('dignam-brother-in-law','The brother-in-law','Who walks beside the boy, carries the other wreath, and at the end places something in the gravedigger’s free hand.','',),
('mrs-dignam','Dignam’s wife','Left with five young children and a policy heavily mortgaged. A great blow to the poor wife, Mr Kernan says, and Bloom thinks: she had outlived him.','',),
('father-coffey','Father Coffey','Who reads the service over the coffin in a fluent croak. I knew his name was like a coffin, Bloom thinks: bully about the muzzle, bosses the show, with a belly on him like a poisoned pup. Not the Coffey the butcher of episode 8.','Father Coffey'),
('mortuary-server','The server','The boy who carries the brass bucket in before the priest, pipes the answers in the treble, and holds the bucket while the priest shakes the thing over the coffin.','',),
('mervyn-browne','Mervyn Browne','Who told Bloom that down in the vaults of saint Werburgh’s they have to bore a hole in the coffins sometimes to let out the bad gas.','Mervyn Browne'),
('john-oconnell','John O’Connell','The caretaker of Glasnevin: a portly man ambushed among the grasses who never forgets a friend, shakes all their hands in silence, and tells the story of the two drunks and Mulcahy from the Coombe. Keys at his back, and a prosperous bulk Bloom admires. Not Daniel O’Connell, whose circle they are standing in.','',),
('terence-mulcahy','Terence Mulcahy','From the Coombe, whose grave the two drunks found in the fog, and whose widow had put up a statue of Our Saviour over it. Not a bloody bit like the man, said the second drunk. That’s not Mulcahy, whoever done it.','Mulcahy'),
('mulcahy-widow','Mulcahy’s widow','Who had the statue put up.','',),
('major-gamble','Major Gamble','Who calls Mount Jerome his garden — the protestant cemetery on the other side of the city.','Major Gamble'),
('spurgeon','Spurgeon','Of the caretaker’s other joke, the one about the bulletin: Spurgeon went to heaven 4 a.m. this morning. 11 p.m. (closing time). Not arrived yet. Peter.','Spurgeon'),
('macintosh','M’Intosh','The thirteenth man at the graveside, a lankylooking galoot in a macintosh who was not in the chapel and whom nobody knows. Bloom says the word for the coat; Hynes writes it down as a name, and it is the name he keeps for the rest of the book.','',),
('louis-byrne','Louis Byrne','Under whom M’Coy got the job in the morgue after the Freeman.','Louis Byrne'),
('joe-cuffe','Cuffe','Who sold the cattle at about twentyseven quid each. Bloom worked for him once, and was given the order of the boot for it.','',),
('james-mccann','James M’Cann','Whose hobby is developing the waterways — to row me o’er the ferry. Not the McCann of Stephen’s list of debts.','James M’Cann|James M\'Cann'),
('wren','Wren','The auctioneer at whose sale there was an old crock of a safety bicycle the other day, but a lady\u2019s \u2014 in Bloom\u2019s plan for cycling down the canal to see Milly. The modern edition drops the sentence.','Wren'),
('fogarty','Fogarty','Our friend Fogarty, whom Mr Power wonders about and Mr Dedalus says to ask Tom Kernan about: though lost to sight, to memory dear — which means Kernan owes him money.','Fogarty'),
('jimmy-geary','Jimmy Geary','The sexton, before whose door an old tramp sat emptying the dirt and stones out of his boot. After life’s journey.','Jimmy Geary'),
('childs','Childs','Murdered in the last house of the gloomy gardens. His brother was tried for it and Seymour Bushe got him off; the crown had no evidence, only circumstantial. A later episode gives the name: Samuel Childs.','Childs'),
('seymour-bushe','Seymour Bushe','The K.C. who got him off, and whose polished periods the newspaper men remember in episode 7.','Seymour Bushe|Bushe'),
('mrs-riordan','Mrs Riordan','Who died in Our Lady’s Hospice for the dying: her feeding cup, and the screen round her bed for her to die. Molly knew her at the City Arms hotel.','Mrs Riordan'),
('mesias','Mesias','The tailor who is to turn Bloom’s grey suit. One in a million, Bloom calls him later.','Mesias'),
('alderman-hooper','Alderman Hooper','Who gave the Blooms a stuffed bird as a wedding present. Not the Paddy Hooper of the newspaper office.','',),
('robert-emery','Robert Emery','Whose remains are laid in the crypt where the rat goes in — and whose name sets Bloom thinking of the other Robert, buried here by torchlight.','Robert Emery'),
('robert-emmet','Robert Emmet','Who was buried here by torchlight, wasn’t he? His last words come back to Bloom in episode 11, in a shop window with seven last words.','Robert Emmet|Emmet'),
('mrs-sinico','Mrs Sinico','At whose funeral Bloom was last in this cemetery. Emily Sinico, accidentally killed at Sydney Parade railway station.','Mrs Sinico|Emily Sinico'),
('ellen-bloom','Bloom’s mother','Mamma, poor mamma, buried in the plot he bought towards Finglas, with little Rudy. She is not named in this episode.','',),
('prince-albert','Albert','The prince consort, with Victoria on the guncarriage and at the Frogmore memorial: consort not even a king, in Bloom’s account of the old queen’s widowhood. Her son was the substance.','',),
('lazarus','Lazarus','Come forth, Lazarus! And he came fifth and lost the job — Bloom’s answer to the resurrection and the life.','',),
('robinson-crusoe','Robinson Crusoe','Say Robinson Crusoe was true to life: then Friday buried him. Only man buries — no, ants too.','Robinson Crusoe','reference','literary-figure'),
('crusoe-friday','Friday','Who buried him. The second Friday in the sentence is the day of the week, and carries no card.','','reference','literary-figure'),
]:add(*row)

# ========================= EPISODE 7 — Aeolus
for row in [
# --- the Freeman's Journal and the Evening Telegraph
('red-murray','Red Murray','Who cuts Keyes’s advertisement out of the paper with his long shears in four clean strokes, offers a par to go with it, and whispers that Brayden’s face is like Our Saviour’s.','Red Murray|red Murray'),
('davy-stephens','Davy Stephens','Minute in a large capecoat, a small felt hat crowning his ringlets, who passes out of Ruttledge’s office with a roll of papers under his cape: a king’s courier.','Davy Stephens'),
('william-brayden','William Brayden','Of Oaklands, Sandymount: the stately figure who goes up the staircase steered by an umbrella, a solemn beardframed face. Simon Dedalus says all his brains are in the nape of his neck.','WILLIAM BRAYDEN|William Brayden|BRAYDEN|Brayden'),
('nannetti','Councillor Nannetti','The foreman of the machine room, who takes Bloom’s cutting, scratches under his alpaca jacket, and says we can do that, let him give us a three months’ renewal. Member for College green, and soon to be called my lord mayor. He does not hear the machines.','Nannetti','major'),
('monks','Monks','The dayfather: an old man, bowed, spectacled, aproned, called for four times across the caseroom to find the archbishop’s letter. Queer lot of stuff he must have put through his hands in his time.','',),
('machugh','Professor MacHugh','Unshaven and blackspectacled, eating water biscuits by the window, who teaches the blatant Latin language and would rather profess Greek. He jeers at Dan Dawson’s speech, sets Rome’s cloacal obsession against the radiance of the intellect, and recites John F Taylor’s speech from memory.','MacHugh','major'),
('jj-omolloy','J. J. O’Molloy','Cleverest fellow at the junior bar he used to be, with a hectic flush and practice dwindling, turning the pink pages of the file and asking the editor for money he does not get. He quotes Seymour Bushe on the Moses of Michelangelo. The others call him Jack.','J. J. O’Molloy|J. J. O\'Molloy|O’Molloy|O\'Molloy','major'),
('myles-crawford','Myles Crawford','The editor: a scarlet beaked face crested by a comb of feathery hair, bold blue eyes, in and out of his sanctum all afternoon, jingling his keys, declaiming, and pretty well on. He tells Stephen to write something with a bite in it, and sends Keyes a message that will not go into a newspaper.','Myles Crawford','major'),
('lenehan','Lenehan','Who comes out of the inner office with Sport’s tissues, gives the Gold cup to Sceptre with O. Madden up, lights everybody’s cigarettes, and will not be put off his riddle: what opera resembles a railwayline? The Rose of Castile. Rows of cast steel.','Lenehan','major'),
('omadden-burke','Mr O’Madden Burke','Tall in copious grey of Donegal tweed, who brings Stephen in — Youth led by Experience visits Notoriety — and speaks in the manner of a man quoting himself. They went forth to battle, but they always fell.','O’Madden Burke|O\'Madden Burke','major'),
('the-newsboy','The newsboy','Seized by the collar as the others scamper down the steps: it wasn’t me, sir, it was the big fellow shoved me, sir. He was waiting for the racing special.','',),
('pat-farrell','Pat Farrell','The big fellow who shoved him, named by the boy and pointed out round the doorframe.','Pat Farrell'),
# --- the ad, and the people in it
('alexander-keyes','Alexander Keyes','Tea, wine and spirit merchant, whose advertisement Bloom is trying to renew: two crossed keys, a circle, and the house of keys — innuendo of home rule, from the Manx parliament. He gets a two months’ renewal and an answer from the editor that Bloom does not deliver.','Keyes','major'),
('ruttledge','Ruttledge','Whose office door creaks and whispers ee: cree, twice, and again in Bloom’s ear in episode 11.','Ruttledge'),
('mario','Mario','The tenor, who was said to be the picture of Our Saviour: Jesusmario with rougy cheeks, doublet and spindle legs, singing in Martha.','Mario'),
('long-john-fanning','Long John','Who is backing Nannetti for lord mayor, they say. The modern edition gives him the surname here that the older one keeps until episode 10: Long John Fanning, the subsheriff.','',),
('phil-blake','Phil Blake','Of the weekly Pat and Bull story in the Freeman, in Bloom’s list of what really sells a paper. Not the Blake of Stephen’s thought in episode 2.','',),
# --- the men in the office talk about
('chatterton','Hedges Eyre Chatterton','The vicechancellor, Ned Lambert’s granduncle or greatgranduncle, close on ninety and living to spite them: he writes an odd shaky cheque or two on gale days. Not the Master Abraham Chatterton of episode 15.','',),
('wetherup','Wetherup','Who always said that: get a grip of them by the stomach.','Wetherup'),
('gabriel-conroy','Gabriel Conroy','With whom J. J. O’Molloy is believed to do some literary work for the Express.','Gabriel Conroy'),
('o-madden-jockey','O. Madden','Up on Sceptre, the dead cert for the Gold cup that Lenehan gives out and that does not win.','O. Madden'),
('kendal-bushe','Kendal Bushe','Whom the editor names and corrects himself out of: Kendal Bushe or I mean Seymour Bushe. An earlier man of the same family and the same reputation at the bar.','Kendal Bushe'),
('palles','Chief baron Palles','Of the story J. J. O’Molloy begins at the royal university dinner and never finishes, because Lenehan wants his riddle first.','Palles'),
('whiteside','Whiteside','A master of forensic eloquence, first of the editor’s three men at the bar, with Isaac Butt and silvertongued O’Hagan. Where have you a man now like those fellows?','Whiteside'),
('isaac-butt','Isaac Butt','The second of them.','Isaac Butt'),
('ohagan','O’Hagan','Silvertongued, the third.','O’Hagan|O\'Hagan'),
('grattan','Henry Grattan','Who wrote for this very paper, with Flood: Irish volunteers, established 1763. J. J. O’Molloy brings him in as an orator and the editor takes him back as a journalist.','Grattan'),
('flood','Flood','The other of the two. Not the flood of the year Hamilton Long’s was founded.','',),
('demosthenes','Demosthenes','Named in the same list, with Edmund Burke, as the eloquence J. J. O’Molloy will not be told the bar has lost.','Demosthenes'),
('edmund-burke','Edmund Burke','The last of the list. Not the O’Madden Burke in the room.','Edmund Burke'),
('harmsworth','Harmsworth','Of the farthing press, Ignatius Gallaher’s Chapelizod boss.','Harmsworth'),
('dr-lucas','Dr Lucas','Named with the paper’s founding: established 1763.','Dr Lucas'),
('john-philpot-curran','John Philpot Curran','Who have you now like him, the editor asks. Not the Curran of Stephen’s list of debts, nor Sara Curran.','John Philpot Curran'),
('tim-healy','Tim Healy','Sitting with Gerald Fitzgibbon, rumour has it, on the Trinity college estates commission.','',),
('fitzgibbon','Gerald Fitzgibbon','Mr Justice Fitzgibbon, the present lord justice of appeal, whose speech to the youth of Ireland John F Taylor rose to answer. You know Gerald Fitzgibbon: then you can imagine the style of his discourse. Not Fitzgibbon street.','',),
('john-f-taylor','John F Taylor','Who had come from a sickbed, with a growth of shaggy beard and a loose white silk neckcloth, and made the finest display of oratory professor MacHugh ever heard — the speech of the Egyptian highpriest to the youthful Moses, which MacHugh gives back from memory in the office.','John F Taylor|John F. Taylor','major'),
('magennis','Professor Magennis','Who was speaking to J. J. O’Molloy about Stephen, and thinks he must have been pulling A. E.’s leg.','Magennis'),
('blavatsky','Madame Blavatsky','That Blavatsky woman, who started the whole thing. A nice old bag of tricks.','Blavatsky'),
# --- the invincibles, and the journalism made out of them
('skin-the-goat','Skin-the-Goat','Fitzharris, who drove the car for an alibi on the day of the Phoenix park murders, and who keeps the cabman’s shelter down at Butt bridge now — they say. Holohan told Mr O’Madden Burke so.','Skin-the-Goat|Fitzharris','major'),
('joe-brady','Joe Brady','One of the invincibles, on the editor’s map of the route and on the commemoration postcard Lady Dudley nearly bought.','Joe Brady'),
('tim-kelly','Tim Kelly','Another, whom the editor names and then corrects to Kavanagh.','Tim Kelly'),
('kavanagh','Kavanagh','The name he corrects it to. Not Charley Kavanagh of episode 8, nor Kavanagh’s public house.','',),
('number-one','Number One','The unnamed head of the invincibles, on the same postcard. The book never gives him another name.','Number One'),
('gumley','Gumley','A friend of Stephen’s father, now minding stones for the corporation as a night watchman — let Gumley mind the stones, see they don’t run away.','Gumley'),
('dick-adams','Dick Adams','The besthearted bloody Corkman the Lord ever put the breath of life in, present with the editor when Ignatius Gallaher cabled the route to New York.','Dick Adams'),
('gregor-grey','Gregor Grey','Who made the design for the advertisement the map was built out of. That gave him the leg up. Not sir John Gray of the statue.','Gregor Grey'),
('paddy-hooper','Paddy Hooper','Who worked Tay Pay and got Gallaher his opening, and who is round at the Oval now with Jack Hall. Not the alderman Hooper of the stuffed owl.','Paddy Hooper'),
('jack-hall','Jack Hall','With whom he came over last night.','Jack Hall'),
('tay-pay','Tay Pay','T. P. O’Connor, who took Gallaher on to the Star. The older edition spells him as the initials are said; the modern edition writes the name.','Tay Pay|T.P. O’Connor|T.P. O\'Connor|T. P. O’Connor|T. P. O\'Connor'),
('blumenfeld','Blumenfeld','Whom Gallaher is in with now.','Blumenfeld'),
('pyatt','Pyatt','He was all their daddies, the editor says. Lenehan makes him the father of scare journalism and the brother-in-law of Chris Callinan.','Pyatt'),
('chris-callinan','Chris Callinan','His brother-in-law, in Lenehan’s footnote. Lenehan tells a longer story about him and Bloom on the Featherbed Mountain in episode 10.','Chris Callinan'),
('lady-dudley','Lady Dudley','Walking home through the park to see the trees blown down by the cyclone, who thought she would buy a view of Dublin and was offered a commemoration postcard of Joe Brady instead. Right outside the viceregal lodge, imagine.','Lady Dudley'),
('bobrikoff','General Bobrikoff','The lord lieutenant of Finland, shot. You look as though you had done the deed, J. J. O’Molloy tells Stephen and Mr O’Madden Burke, looking at their ties.','General Bobrikoff|Bobrikoff'),
('jakes-mccarthy','Jakes M’Carthy','Father, Son and Holy Ghost and Jakes M’Carthy — the editor’s formula for putting everybody into it. The modern edition spells him McCarthy.','Jakes M’Carthy|Jakes M\'Carthy|Jakes McCarthy'),
# --- what they quote
('xenophon','Xenophon','Who looked upon Marathon, and Marathon looked on the sea: Mr Dedalus quoting Byron at Dan Dawson’s prose.','Xenophon'),
('cicero','Cicero','A recently discovered fragment of whom, professor MacHugh says with pomp of tone, is Dan Dawson’s speech in this morning’s paper.','Cicero'),
('sallust','Sallust','In mourning for whom, Mulligan says of professor MacHugh’s black clothes. Whose mother is beastly dead.','Sallust'),
('salisbury','Lord Salisbury','A sofa in a westend club — where professor MacHugh looks for the spirituality of the Roman and the Englishman and does not find it.','Lord Salisbury'),
('maximilian-odonnell','Maximilian Karl O’Donnell','Graf von Tirconnell in Ireland, the Irishman who saved the emperor’s life on the ramparts of Vienna and whose heir was sent over to make the king an Austrian fieldmarshal. Wild geese.','Maximilian Karl O’Donnell|Maximilian Karl O\'Donnell'),
('macduff','Macduff','Lay on, Macduff — Mr O’Madden Burke’s word for going to Mooney’s, with a lunge of his umbrella.','Macduff','reference','literary-figure'),
('michelangelo','Michelangelo','Whose Moses in the vatican Seymour Bushe cited, and described in the period J. J. O’Molloy repeats: that stony effigy in frozen music, horned and terrible. Not the Michelangelo Hayes of episode 12.','',),
('moses','Moses','Twice over in this episode: the statue in the vatican, and the youthful Moses of John F Taylor’s speech, who did not listen to the Egyptian highpriest and so brought the chosen people out of their house of bondage. He died without having entered the land of promise, which is where Stephen’s parable of the plums ends up.','','reference','major'),
('saint-augustine','Saint Augustine','Whose sentence comes into Stephen’s head in the middle of the speech — those things are good which yet are corrupted — and is recognised a beat too late. Ah, curse you! That’s saint Augustine.','saint Augustine|Saint Augustine'),
('isis','Isis','Whose abode, with Osiris, the Egyptian highpriest sets against the local and obscure idol of the Jews. Not Isis Unveiled, the book on the shelf in episode 9.','',),
('osiris','Osiris','The second of the four.','Osiris'),
('horus','Horus','The third.','Horus'),
('ammon-ra','Ammon Ra','The fourth: ours thunder and the seas.','Ammon Ra'),
('antisthenes','Antisthenes','A disciple of Gorgias, of whom it is said that none could tell whether he were bitterer against others or against himself. He wrote a book taking the palm of beauty from Argive Helen and handing it to poor Penelope, and professor MacHugh says Stephen reminds him of it.','Antisthenes'),
('gorgias','Gorgias','The sophist whose disciple he was.','Gorgias'),
('penelope','Penelope','Poor Penelope, who got the palm of beauty in that book. Odysseus’s wife at the loom, and the last word of this one.','',),
('penelope-rich','Penelope Rich','The other Penelope, who follows in Stephen’s head one line later: Sidney’s Stella, and not Homer’s wife at all.','Penelope Rich'),
('kate-collins','Miss Kate Collins','Proprietress of the north city diningrooms in Marlborough street, from whom the two Dublin vestals buy one and fourpenceworth of brawn and four slices of panloaf.','Kate Collins'),
('anne-kearns','Anne Kearns','One of the two: she has the lumbago, for which she rubs on Lourdes water given her by a lady who got a bottleful from a passionist father. The other is Florence MacCabe, the midwife Stephen watched come down to the strand in episode 3.','Anne Kearns'),
]:add(*row)

updates={}
for e in entities:e['snapshots']=[dict(after=list(at),body=body) for at,body in updates.get(e['id'],[])]
print(len(entities),'entities authored: episodes 1-7')
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(
 bookId='ulysses',
 contentVersion='2026-09-15.7',
 coverage='Both full English editions, episodes 1-7 of 18. Named persons, and the writers, saints, heresiarchs and stage figures the characters quote. Peoples, places, newspapers, songs, pubs and shops are not cast.',
 entities=[e for e in entities if e['name']!='unused']),ensure_ascii=False,indent=2)+'\n')
