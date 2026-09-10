"""Manually authored identities, with changing relationships source-gated."""
import json
from pathlib import Path
entities=[]
def C(id,name,role,body,aliases='',kind='person',snapshots=None):
 entities.append(dict(id=id,name=name,category=role,body=body,subtitle='',kind=kind,aliases=aliases.split('|') if aliases else [],snapshots=snapshots or []))
C('hermia','Hermia','central','Egeus’s daughter, in love with Lysander.','Hermia')
C('lysander','Lysander','central','The young Athenian whom Hermia loves.','Lysander')
C('helena','Helena','central','Hermia’s friend, in love with Demetrius.','Helena|Helen')
C('demetrius','Demetrius','central','The suitor Egeus wants Hermia to marry.','Demetrius',snapshots=[dict(after=[7,54],body='The young Athenian who now declares his love for Helena.')])
C('theseus','Theseus','supporting','Duke of Athens, engaged to Hippolyta.','Theseus')
C('hippolyta','Hippolyta','supporting','Queen of the Amazons, engaged to Theseus.','Hippolyta')
C('egeus','Egeus','supporting','Hermia’s father.','Egeus')
C('philostrate','Philostrate','supporting','Theseus’s master of revels, responsible for entertainments.','Philostrate')
C('bottom','Nick Bottom','major','The weaver in Peter Quince’s amateur acting company.','Nick Bottom|Bottom',snapshots=[dict(after=[5,40],body='The weaver and amateur actor, now wearing an ass’s head through Puck’s magic.'),dict(after=[7,29],body='The weaver and amateur actor, restored to his human appearance.')])
for id,name,body,aliases in [
 ('quince','Peter Quince','The carpenter who organizes the amateur players.','Peter Quince|Quince'),
 ('flute','Francis Flute','The bellows-mender in Quince’s acting company.','Francis Flute|Flute'),
 ('snout','Tom Snout','The tinker in Quince’s acting company.','Tom Snout|Snout'),
 ('snug','Snug','The joiner in Quince’s acting company.','Snug'),
 ('starveling','Robin Starveling','The tailor in Quince’s acting company.','Robin Starveling|Starveling')]:C(id,name,'supporting',body,aliases)
C('oberon','Oberon','major','King of the fairies and husband of Titania.','Oberon')
C('titania','Titania','major','Queen of the fairies and wife of Oberon.','Titania|Queen of Fairies|Fairy Queen')
C('puck','Puck','major','Oberon’s mischievous fairy servant, also called Robin Goodfellow.','Robin Goodfellow|Puck|Hobgoblin|Robin','spirit')
for id,name,body,aliases in [
 ('fairy','The fairy','A fairy serving Titania who meets Puck in the wood.','FAIRY'),
 ('first-fairy','The first singing fairy','One of the fairies singing Titania to sleep.','FIRST FAIRY'),
 ('second-fairy','The second fairy','Another fairy attending Titania as she sleeps.','SECOND FAIRY'),
 ('peaseblossom','Peaseblossom','One of Titania’s attendant fairies.','Peaseblossom'),
 ('cobweb','Cobweb','One of Titania’s attendant fairies.','Cobweb'),
 ('moth','Moth','One of Titania’s attendant fairies.','Moth'),
 ('mustardseed','Mustardseed','One of Titania’s attendant fairies.','Mustardseed')]:C(id,name,'supporting',body,aliases,'spirit')
C('fairies','Titania’s fairies','supporting','The fairy attendants who sing and serve Titania.','CHORUS','group')
C('players','The amateur players','supporting','Quince’s company of Athenian craftsmen.','','group')
C('boy','The Indian boy','supporting','The young child in Titania’s care, whom Oberon wants as his attendant.','','unnamed-person')
C('mother','The boy’s mother','reference','The mortal woman from India who was Titania’s friend and follower.','','unnamed-person')
C('indian-king','The Indian king','reference','The unnamed king from whom Puck says the boy was taken.','','unnamed-person')
for id,name,body,aliases in [
 ('pyramus','Pyramus','The male lover in the amateur players’ story of Pyramus and Thisbe.','Pyramus'),
 ('thisbe','Thisbe','The female lover in the amateur players’ story of Pyramus and Thisbe.','Thisbe|Thisne'),
 ('wall','Wall','The wall personified as a speaking part in the amateur play.','Wall|WALL'),
 ('lion','Lion','The lion portrayed in the amateur play.','Lion|LION'),
 ('moonshine','Moonshine','Moonlight personified as a part in the amateur play.','Moonshine|MOONSHINE|MOON'),
 ('prologue','Prologue','The speaker who introduces the amateur play.','PROLOGUE')]:C(id,name,'supporting',body,aliases,'dramatic-role')
for id,name,body,aliases in [
 ('nedar','Nedar','Helena’s father.','Nedar'),
 ('cupid','Cupid','The god of love, represented with a bow and arrows.','Cupid'),
 ('venus','Venus','The goddess of love.','Venus'),
 ('diana','Diana','The goddess of the hunt and chastity, associated with the moon.','Diana|Dian|Phoebe'),
 ('dido','Dido','The queen of Carthage in the story of Aeneas.','Dido|Carthage queen'),
 ('aeneas','Aeneas','The Trojan hero loved by Dido.','Aeneas|false Trojan'),
 ('hercules','Hercules','The legendary hero famed for his strength; Bottom calls him Ercles.','Hercules|Ercles'),
 ('apollo','Apollo','The god associated with music and the sun; Bottom calls him Phibbus.','Apollo|Phibbus'),
 ('fates','The Fates','The mythological powers who govern mortal destiny.','Fates'),
 ('corin','Corin','The shepherd identity Titania says Oberon has assumed.','Corin'),
 ('phillida','Phillida','The woman Titania says Oberon courted as Corin.','Phillida'),
 ('perigenia','Perigenia','A woman associated with Theseus in Greek legend.','Perigenia'),
 ('aegles','Aegles','One of the women Oberon names among Theseus’s former loves.','Aegles'),
 ('ariadne','Ariadne','The Cretan princess associated with Theseus.','Ariadne'),
 ('antiopa','Antiopa','An Amazon associated with Theseus in Greek legend.','Antiopa'),
 ('hiems','Hiems','Winter imagined as an aged person.','Hiems'),
 ('neptune','Neptune','The Roman god of the sea.','Neptune'),
 ('daphne','Daphne','The nymph pursued by Apollo in Greek mythology.','Daphne'),
 ('philomel','Philomel','A poetic name for the nightingale, recalling the myth of Philomela.','Philomel'),
 ('ninus','Ninus','The legendary Assyrian king whose tomb is the lovers’ meeting place in the amateur play.','Ninus|Ninny'),
 ('squash','Mistress Squash','The mother Bottom jokingly gives Peaseblossom, playing on the fairy’s name.','Mistress Squash|Mrs. Squash'),
 ('peascod','Master Peascod','The father Bottom jokingly gives Peaseblossom; Peascod means a pea pod.','Master Peascod|Mr. Peapod'),
 ('aurora','Aurora','The Roman goddess of dawn.','Aurora'),
 ('cadmus','Cadmus','The legendary founder of Thebes, recalled as a hunting companion.','Cadmus'),
 ('valentine','Saint Valentine','The saint whose feast day was associated with birds pairing and lovers.','Saint Valentine|Valentine'),
 ('centaurs','The Centaurs','The half-human, half-horse creatures of Greek myth.','Centaurs'),
 ('bacchanals','The Bacchanals','The frenzied followers of the wine god, mentioned in a proposed entertainment.','Bacchanals|Drunken Revelers'),
 ('orpheus','Orpheus','The legendary musician meant by the Thracian singer in the proposed entertainment.','Thracian singer'),
 ('muses','The Muses','The nine goddesses of poetry, music and the arts.','Muses'),
 ('learning','Learning','Learning personified in one of the proposed entertainments.','Learning|learning'),
 ('jove','Jove','Another name for Jupiter, king of the Roman gods.','Jove'),
 ('leander','Leander','The mythic lover of Hero, called Limander in the amateur play.','Limander|Leander'),
 ('hero','Hero','The woman loved by Leander in Greek legend, mistakenly called Helen by Thisbe.','Hero'),
 ('cephalus','Cephalus','The husband of Procris in Greek legend, called Shafalus by the players.','Shafalus|Cephalus'),
 ('procris','Procris','The wife of Cephalus in Greek legend, called Procrus by the players.','Procrus|Procris'),
 ('hecate','Hecate','The goddess associated with night and magic.','Hecate')]:C(id,name,'reference',body,aliases,'cultural-figure')
C('helen-troy','Helen of Troy','reference','The legendary beauty invoked by Theseus.','','cultural-figure')
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='midsummer',contentVersion='2026-09-10.1',coverage='Complete play in both English editions: named cast, speaker roles, dramatic roles, identifiable unnamed figures and named cultural references.',entities=entities),ensure_ascii=False,indent=2)+'\n')
