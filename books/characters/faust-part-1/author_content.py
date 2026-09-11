"""Manually authored recognition cards for both full English texts of Faust, Part One.

Goethe's play in 28 scenes and 895 paragraphs per edition, aligned paragraph for
paragraph. The original is an older English verse translation carrying visible
scanning damage; the modern edition is a clean prose rendering of the same
translation.

A play does most of its identification through speaker tags, so every speaking
part is cast under the tag it speaks by — MEPHISTOPHELES, MARGARET, FROSCH — as
well as under the name other characters use for it. Goethe's crowds speak in
anonymous voices (A MECHANIC, ANOTHER BURGHER, A THIRD), and those are grouped
rather than carded one by one.

Scope: speaking parts, named people, spirits, gods and devils, and the figures
the dialogue names. Places are not cast.
"""
import json
from pathlib import Path
entities=[]
def add(id,name,body,aliases='',category='supporting',kind='person'):
 entities.append(dict(id=id,name=name,body=body,aliases=aliases.split('|') if aliases else [],category=category,kind=kind,subtitle='',snapshots=[]))

# ------------------------------------------------------------------ the principals
for row in [
('faust','Faust','The scholar who has read everything and knows nothing worth knowing, and signs away his soul for one moment he would want to keep. The wager is his own idea, and so is its wording.','FAUST|Faust','central'),
('mephistopheles','Mephistopheles','The devil who bets the Lord that he can have Faust, and then finds that ruining him is harder than it looked. He calls himself the spirit that always denies, and he is the funniest thing in the play.','MEPHISTOPHELES|Mephistopheles|Mephisto','central','angel'),
('margaret','Margaret','Gretchen: a girl of fourteen or fifteen who has never been outside her own street. What Faust does to her is the whole second half of the play, and the last word on her is not his.','MARGARET|Margaret|MARGARETE|Margarete|Gretchen|Marearet','central'),
('the-lord','The Lord','God in the Prologue in Heaven, who lets Mephistopheles have his wager because a man’s striving needs a companion who goads.','THE LORD','major','deity'),
('earth-spirit','The Spirit of the Earth','The power Faust conjures and cannot bear to look at, which tells him he resembles the spirit he can grasp — and not this one.','SPIRIT|Earth-Spirit','major','mythical-being'),
]:add(*row)

# ------------------------------------------------------------- the Gretchen tragedy
for row in [
('martha','Martha','Margaret’s neighbour, a widow who is not much troubled about her missing husband and is very ready to be courted by Mephistopheles.','MARTHA|Martha|MARTHE|Marthe','major'),
('valentine','Valentine','Margaret’s brother, a soldier, who used to be proud of her name and dies in the street outside her door cursing it.','VALENTINE|Valentine','major'),
('bessy','Bessy','The neighbour at the well who tells Margaret, with relish, what has happened to Barbara — not knowing she is describing Margaret’s own future.','BESSY|Bessy','supporting'),
('evil-spirit','The Evil Spirit','The voice behind Margaret in the cathedral, which asks her how things stood when she was still innocent.','EVIL SPIRIT|Evil Spirit','supporting','mythical-being'),
('barbara','Barbara','The girl in the next street who was got with child and abandoned; Bessy tells the story to Margaret without seeing what it means.','Barbara','reference'),
('agatha','Agatha','A girl at the city gate, called away by her friend so as not to be seen with fortune-tellers.','Agatha','reference'),
('catherine','Catherine','The girl in Mephistopheles’s serenade under Margaret’s window, warned not to go in to her lover as a maiden.','Catherine','reference'),
('king-of-thule','The King in Thule','The faithful king of the song Margaret sings while she undresses, who kept his dead love’s golden cup until he died.','Thule','supporting','literary-figure'),
('mater-dolorosa','The Mater Dolorosa','The image of the Virgin in the wall of the Zwinger, with flowers before it, that Margaret prays to.','Mater Dolorosa','supporting','religious-figure'),
]:add(*row)

# ------------------------------------------------------------------- the study
for row in [
('wagner','Wagner','Faust’s assistant, entirely content with books and eager to be told he is making progress. Goethe uses him to show what Faust might have settled for.','WAGNER|Wagner','major'),
('the-student','The Student','The freshman who comes for advice and is sent off by Mephistopheles, in Faust’s gown, with a course of study designed to ruin him — and an autograph that reads "you shall be as gods, knowing good and evil."','STUDENT|Student','supporting'),
('the-poodle','The Poodle','The black dog that follows Faust home from the walk and turns out to be the devil; Faust spends a whole scene talking to it before it changes shape.','Poodle','supporting','animal'),
('nostradamus','Nostradamus','The astrologer whose book of signs Faust opens, and in which he finds the sign of the Macrocosm and then the sign of the Earth Spirit.','Nostradamus','reference'),
]:add(*row)

# --------------------------------------------------- Auerbach's Cellar and the Witch
for row in [
('frosch','Frosch','One of the four drinkers in Auerbach’s Cellar, and the one who tries hardest to keep the party going.','FROSCH|Frosch','supporting'),
('brander','Brander','A drinker in Auerbach’s Cellar, who sings the song about the rat that ate poison.','BRANDER|Brander','supporting'),
('siebel','Siebel','A drinker in Auerbach’s Cellar, unlucky in love and the first to grab for Mephistopheles’s throat.','SIEBEL|Siebel','supporting'),
('altmayer','Altmayer','The fourth drinker in Auerbach’s Cellar, and the soberest of them.','ALTMAYER|Altmayer','supporting'),
('the-witch','The Witch','The keeper of the kitchen where Faust is made thirty years younger; she recognises Mephistopheles at once and is scolded for using his old names.','THE WITCH|The Witch','supporting'),
('the-monkeys','The Monkeys','The witch’s household, who mind the cauldron, play with a crown and a glass ball, and beg for money.','MONKEYS|Monkeys|HE-MONKEY|He Monkey|He-Monkey','supporting','animal'),
('helen','Helen','The face in the witch’s mirror — Mephistopheles promises that with the drink in him Faust will see her in every woman.','Helen','reference','mythological-figure'),
('cupid','Cupid','Named by Mephistopheles for what the philtre will do.','Cupid','reference','deity'),
]:add(*row)

# ---------------------------------------------------------------- the Prologues
for row in [
('raphael','Raphael','The first of the three archangels in the Prologue in Heaven, who sings of the sun and its brother spheres.','RAPHAEL|Raphael','supporting','angel'),
('gabriel','Gabriel','The second archangel of the Prologue, who sings of the earth turning between splendour and night.','GABRIEL|Gabriel','supporting','angel'),
('michael','Michael','The third archangel of the Prologue, who sings of the storms raging from sea to land.','MICHAEL|Michael','supporting','angel'),
('the-three','The Three','The archangels singing together, closing the Prologue’s hymn before Mephistopheles speaks.','THE THREE|The Three','reference','angel'),
('the-manager','The Manager','In the Prelude on the Stage, the one who wants a full house and tells the Poet what an audience actually is.','MANAGER|Manager|STAGE-MANAGER|Stage-Manager','supporting'),
('the-poet','The Poet','In the Prelude, the one who refuses to write for the crowd and is told he will have to.','POET|Poet','supporting'),
('the-merryman','The Merryman','In the Prelude, the comic actor, who sides with neither and tells them both to get on with it.','MERRYMAN|Merryman','supporting'),
]:add(*row)

# ---------------------------------------------------------------- Before the Gate
for row in [
('townsfolk','The townsfolk at the gate','Goethe’s crowd on Easter Sunday, speaking in anonymous voices — mechanics choosing a tavern, servant-girls, burghers glad of a war far away in Turkey, a beggar, a soldier, a citizen’s daughter warned off the fortune-teller. None of them is named, and that is the point: this is the world Faust cannot be content with.','SOME MECHANICS|A MECHANIC|SERVANT-GIRL|CITIZEN’S DAUGHTER|CITIZEN\'S DAUGHTER|BURGHER|ANOTHER BURGHER|THIRD BURGHER|SOLDIER|BEGGAR|RUSTICS UNDER THE LIME-TREE|A SECOND|A THIRD|A FOURTH|A FIFTH','supporting','group'),
('old-peasant','The Old Peasant','The villager who brings Faust the first draught, because Faust’s father worked among them in the plague year — the thanks that makes Faust confess what his father’s medicine actually did.','OLD PEASANT|Old Peasant','supporting'),
('fausts-father','Faust’s father','The dark man of honour who brewed the red lion and the lily in his laboratory and killed more patients than the plague; Faust says so while accepting their gratitude.','','supporting'),
('luther','Luther','Named only for his paunch, in Brander’s song about the rat.','Luther','reference'),
('hans-of-rippach','Mr Hans of Rippach','A stock joke — the man from Rippach who does not exist, whom Mephistopheles is asked whether he supped with.','Hans','reference'),
('jack-rake','Jack Rake','The name Margaret’s type of admirer is given: a man who covets every flower for himself.','Rake','reference'),
]:add(*row)

# ------------------------------------------------------ Walpurgis Night on the Brocken
for row in [
('will-o-the-wisp','The Will-o’-the-Wisp','The zigzag light pressed into service as a guide up the Brocken, and told to go straight for once.',"WILL-O’-THE-WISP|WILL-O'-THE-WISP|WILL-O’-THE-WISPS|WILL-O'-THE-WISPS|Will-o’-the-Wisp|Will-o'-the-Wisp|will-o’-the-wisp|will-o'-the-wisp",'supporting','mythical-being'),
('lilith','Lilith','Adam’s first wife, dancing on the Brocken; Mephistopheles warns Faust about her beautiful hair.','Lilith','supporting','mythological-figure'),
('squire-voland','Squire Voland','The old German name for the devil, which Mephistopheles uses to clear a path through the crowd on the mountain.','Voland','reference','angel'),
('the-general','The General','One of four has-beens sitting by the dying embers on the Brocken, complaining that the world has passed him by.','GENERAL|General','reference'),
('the-minister','The Minister','A second of the four by the embers, who remembers when merit still counted.','MINISTER|Minister','reference'),
('the-fair-one','The Fair One','The young witch Faust dances with, whose song about the apple tree he answers in kind.','FAIR ONE|Fair One','supporting'),
('the-old-one','The Old One','The old witch who dances with Mephistopheles and matches his coarseness.','OLD ONE|Old One','supporting'),
('proktophantasmist','The Proktophantasmist','Goethe’s caricature of a living critic who denied ghosts in print; he turns up on a mountain full of them and complains that they will not obey the rules.','PROCKTOPHANTASMIST|PROKTOPHANTASMIST|Procktophantasmist|Proktophantasmist','supporting'),
('servibilis','Servibilis','The busybody who announces the amateur theatricals about to begin — the Walpurgis-Night’s Dream.','SERVIBILIS|Servibilis','reference'),
('medusa','Medusa','Whose name Mephistopheles gives to the pale girl Faust cannot look away from — the vision with a red thread round her throat.','Medusa','supporting','mythological-figure'),
('perseus','Perseus','Named for having cut off the head the vision carries under her arm.','Perseus','reference','mythological-figure'),
('demi-witch','The Demi-Witch','One of the crowd toiling up the mountain, a hundred years behind the others.','DEMI-WITCH|Demi-Witch','reference'),
('chorus-of-witches','The Chorus of Witches','The crowd streaming to the summit — the salve gives courage, a rag serves for a sail.','CHORUS OF WITCHES|Chorus of Witches','reference','group'),
('wizards','The Wizards','The male half of the procession, creeping along while the women go ahead.','WIZARDS|Wizards','reference','group'),
]:add(*row)

# ------------------------------------------------- the Walpurgis-Night's Dream masque
# Goethe's satirical intermezzo: thirty speakers, each one line, each a caricature
# of a contemporary faction, journal or philosophical school.
for row in [
('oberon','Oberon','The fairy king of the intermezzo, celebrating his golden wedding; Goethe borrows him from Shakespeare and Wieland.','OBERON|Oberon','supporting','literary-figure'),
('titania','Titania','Oberon’s queen, reconciled with him for the golden wedding.','TITANIA|Titania','supporting','literary-figure'),
('puck','Puck','Shakespeare’s sprite, come whirling into the masque.','PUCK|Puck','supporting','literary-figure'),
('ariel','Ariel','The airy spirit of The Tempest, leading the song in the masque.','ARIEL|Ariel','supporting','literary-figure'),
('the-herald','The Herald','Who announces the golden wedding of Oberon and Titania.','HERALD|Herald','reference'),
('the-orchestra','The Orchestra','The band of gnats, flies and frogs that accompanies the masque, tuning up and signing off.','ORCHESTRA|Orchestra|ORCHESTRA-TUTTI','reference','group'),
('solo-voice','Solo','A single voice in the masque’s chorus.','SOLO|Solo','reference'),
('self-fashioning-spirit','The Spirit that is Fashioning Itself','A half-made creature in the masque, all legs and no body yet.','SPIRIT THAT IS FASHIONING ITSELF|Spirit that is Fashioning itself','reference','mythical-being'),
('pair-of-lovers','A Pair of Lovers','Two figures slipping away from the masque into the dark.','A PAIR OF LOVERS|A Pair of Lovers|Pair of Lovers','reference'),
('inquisitive-traveller','The Inquisitive Traveller','The tourist who asks whether all this is masquerade, and recognises Oberon.','INQUISITIVE TRAVELLER|Inquisitive Traveller','reference'),
('the-orthodox','The Orthodox','Who sees no claws and no tail and concludes that, like the gods of Greece, this one is a devil too.','ORTHODOX|Orthodox','reference'),
('the-purist','The Purist','The literary pedant who objects that the witches are not delicately enough drawn.','PURIST|Purist','reference'),
('young-witch','The Young Witch','Who says dress and paint are for the old, and rides naked.','YOUNG WITCH|Young Witch','reference'),
('the-matron','The Matron','Who is too well-bred to quarrel, and hopes the young one rots.','MATRON|Matron','reference'),
('leader-of-the-band','The Leader of the Band','Who tries to keep the insects off the naked witch.','LEADER OF THE BAND|Leader of the Band','reference'),
('weathercock','The Weathercock','Who faces one way and then the other in two consecutive speeches — Goethe’s joke about turncoats.','WEATHERCOCK|Weathercock','reference'),
('xenien','The Xenien','The stinging epigrams Goethe and Schiller had published together, appearing in the masque as insects.','XENIEN|Xenien','reference','group'),
('hennings','Hennings','A journalist who had attacked the Xenien; he appears here as one of the pests.','HENNINGS|Hennings','reference'),
('musaget','Musaget','The name of Hennings’s journal, personified as a leader of muses who would rather lead witches.','MUSAGET|Musaget|MUSAGETES','reference'),
('genius-of-the-age','The Ci-devant Genius of the Age','Another of Hennings’s journals, which claims the Brocken as the German Parnassus.','CI-DEVANT GENIUS OF THE AGE|Ci-devant Genius of the Age','reference'),
('the-crane','The Crane','Lavater, the physiognomist, who fishes in clear water and in muddy.','CRANE|Crane','reference'),
('the-worldling','The Worldling','Who observes that the pious will ride any vehicle that is going their way.','WORLDLING|Worldling','reference'),
('the-dancer','The Dancer','Who hears a new company coming and takes it for distant drums.','DANCER|Dancer','reference'),
('dancing-master','The Dancing Master','Who watches the crowd caper and cannot make them keep time.','DANCING MASTER|Dancing Master','reference'),
('the-fiddler','The Fiddler','Whose bagpipe unites the rabble as Orpheus’s lyre united the beasts.','FIDDLER|Fiddler','reference'),
('the-dogmatist','The Dogmatist','Who is not to be shaken by criticism, and concludes that the devil must be something because he exists.','DOGMATIST|Dogmatist','reference'),
('the-idealist','The Idealist','Whose fantasy is tyrannical tonight, so that if all this is himself, he is a fool.','IDEALIST|Idealist','reference'),
('the-realist','The Realist','To whom the whole business is a torment, since for the first time he cannot trust his own feet.','REALIST|Realist','reference'),
('the-supernaturalist','The Supernaturalist','Who is delighted to be here, because if there are devils there must be good spirits too.','SUPERNATURALIST|Supernaturalist','reference'),
('the-sceptic','The Sceptic','Who follows the little flames about looking for treasure, and observes that doubt rhymes with devil.','SCEPTIC|Sceptic','reference'),
('the-adroit','The Adroit','One of the nimble spirits, dancing barefoot in the moss.','ADROIT|Adroit','reference'),
('the-awkward','The Awkward','One of the clumsy spirits, who used to sponge on the world and now walks on his head.','AWKWARD|Awkward','reference'),
('shooting-star','The Shooting Star','A falling light, sprawling on its side in the grass.','SHOOTING STAR|Shooting Star','reference','mythical-being'),
('the-massive-ones','The Massive Ones','The heavy spirits who tramp through at the end of the masque.','MASSIVE ONES|Massive Ones','reference','group'),
('orpheus','Orpheus','Named for the lyre that tamed the beasts, as the Fiddler’s bagpipe tames this crowd.','Orpheus','reference','mythological-figure'),
]:add(*row)

# --------------------------------------------------------- named in the dialogue
for row in [
('god','God','Named throughout by Faust, Margaret and Mephistopheles alike; in the Prologue he speaks as the Lord.','God','supporting','deity'),
('christ','Christ','Risen in the Easter chorus that stops Faust’s hand on the poison cup.','Christ','reference','religious-figure'),
('satan','Satan','The name the Witch greets Mephistopheles by, and is told not to use any more — the gentlemen have given it up.','Satan','reference','angel'),
('mammon','Mammon','The wealth-god whose name Faust curses, and whose mountain glows on the Brocken.','Mammon','reference','deity'),
('solomon','Solomon','Whose key the Witch’s nonsense book parodies.','Solomon','reference','religious-figure'),
('chorus-of-angels','The Chorus of Angels','The Easter choir that sings Christ is arisen — which does not convert Faust but does keep him alive.','CHORUS OF ANGELS|Chorus of Angels','supporting','group'),
('chorus-of-disciples','The Chorus of Disciples','The answering choir, weeping over their master’s happy lot.','CHORUS OF DISCIPLES|Chorus of Disciples','reference','group'),
('chorus-of-spirits','The Chorus of Spirits','Mephistopheles’s invisible servants, who tell Faust he has smashed the world and invite him to build it again.','CHORUS OF SPIRITS|Chorus of Spirits','supporting','group'),
('voice-from-above','The Voice from Above','The last word of the play: Mephistopheles says Margaret is judged, and the voice says she is saved.','VOICE FROM ABOVE|Voice from above|Voice from Above','supporting','deity'),
]:add(*row)

print(len(entities),'entities')
Path(__file__).parent.joinpath('editorial.json').write_text(json.dumps(dict(
 contentVersion='2026-09-11.1',
 coverage='Both full English editions, 28 scenes and 895 paragraphs. Speaking parts, named people, spirits, gods and devils, and the figures the dialogue names. Places are not cast.',
 entities=entities),ensure_ascii=False,indent=2)+'\n')
