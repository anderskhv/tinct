"""Manually authored recognition cards; no model or network calls."""
import json
from pathlib import Path
BASE=Path(__file__).resolve().parent
entities=[]
def C(id,name,role,body,aliases='',kind='person',chapters=None,updates=None):
 e=dict(id=id,name=name,category=role,body=body,subtitle='',kind=kind,aliases=aliases.split('|') if aliases else [],snapshots=updates or [])
 if chapters:e['chapters']=chapters
 entities.append(e)
C('prospero','Prospero','central','Miranda’s father, a magician living with her on the island.','Prospero|Prosper',updates=[{'after':[2,16],'body':'Miranda’s father, a magician who was once Duke of Milan.'},{'after':[9,21],'body':'Miranda’s father, the magician restored to his dukedom in Milan.'}])
C('miranda','Miranda','central','Prospero’s daughter, brought up with him on the island.','Miranda',updates=[{'after':[5,24],'body':'Prospero’s daughter, now pledged to marry Ferdinand.'}])
C('ariel','Ariel','major','The spirit who serves Prospero and carries out his magic.','Ariel',kind='spirit')
C('caliban','Caliban','major','Sycorax’s son, an island inhabitant whom Prospero keeps in servitude.','Caliban|Cacaliban')
C('ferdinand','Ferdinand','major','The prince of Naples, son of King Alonso.','Ferdinand',updates=[{'after':[5,24],'body':'Alonso’s son, the prince of Naples, now pledged to marry Miranda.'}])
C('alonso','Alonso','major','King of Naples and father of Ferdinand and Claribel.','Alonso|King of Naples')
C('antonio','Antonio','major','The Duke of Milan, traveling with King Alonso.','Antonio',updates=[{'after':[2,22],'body':'Prospero’s brother and Miranda’s uncle, now holding the dukedom of Milan.'},{'after':[9,28],'body':'Prospero’s brother and Miranda’s uncle, the former Duke of Milan.'}])
C('sebastian','Sebastian','supporting','King Alonso’s brother.','Sebastian')
C('gonzalo','Gonzalo','supporting','An elderly counselor traveling with King Alonso.','Gonzalo|Sir Prudence')
C('adrian','Adrian','supporting','A lord in King Alonso’s traveling party.','Adrian')
C('francisco','Francisco','supporting','A lord in King Alonso’s traveling party.','Francisco')
C('trinculo','Trinculo','major','King Alonso’s jester.','Trinculo')
C('stephano','Stephano','major','King Alonso’s butler.','Stephano')
C('boatswain','The boatswain','supporting','The ship’s officer directing the sailors during the storm.','Boatswain','unnamed-role')
C('master','The ship’s master','supporting','The captain of the ship carrying King Alonso’s party.','','unnamed-role')
C('mariners','The mariners','supporting','The crew of the ship carrying King Alonso’s party.','Mariners','group')
C('sycorax','Sycorax','reference','Caliban’s mother, a witch who lived on the island before Prospero.','Sycorax')
C('claribel','Claribel','reference','Alonso’s daughter and Ferdinand’s sister, newly married to the King of Tunis.','Claribel')
C('king-tunis','The King of Tunis','reference','Claribel’s husband and ruler of Tunis.','King of Tunis','unnamed-person')
C('antonio-son','Antonio’s son','reference','The unnamed son of Antonio, mentioned among the ship’s passengers.','','unnamed-person')
C('miranda-mother','Miranda’s mother','reference','Prospero’s wife and Miranda’s mother. She is not named in the play.','','unnamed-person')
for id,name,body,aliases in [
 ('jove','Jove','The Roman sky and thunder god, also called Jupiter.','Jove|Jupiter'),
 ('neptune','Neptune','The Roman god of the sea.','Neptune'),
 ('setebos','Setebos','The god worshipped by Sycorax and invoked by Caliban.','Setebos'),
 ('dido','Dido','The legendary queen of Carthage, associated with Aeneas in Virgil’s Aeneid.','Dido'),
 ('aeneas','Aeneas','The Trojan hero of Virgil’s Aeneid, associated with Dido at Carthage.','AEneas|Aeneas'),
 ('hymen','Hymen','The classical god of marriage, whose torch represents the wedding ceremony.','Hymen'),
 ('phoebus','Phoebus','A name for Apollo as the sun god, imagined driving a chariot across the sky.','Phoebus'),
 ('venus','Venus','The Roman goddess of love and mother of Cupid.','Venus'),
 ('cupid','Cupid','The winged god of love, Venus’s son.','Cupid'),
 ('dis','Dis','The Roman ruler of the underworld, also called Pluto.','Dis'),
 ('mars','Mars','The Roman god of war, associated with Venus as her lover.','Mars')]:C(id,name,'reference',body,aliases,'cultural-figure')
for id,name,body in [('iris','Iris','The rainbow goddess and messenger of Juno, portrayed in Prospero’s masque.'),('ceres','Ceres','The goddess of agriculture, portrayed in Prospero’s masque.'),('juno','Juno','The queen of the gods and goddess of marriage, portrayed in Prospero’s masque.')]:
 C(id,name,'supporting',body,name,'dramatic-role',[8])
C('nymphs','The nymphs','reference','The water spirits, or Naiads, represented by dancers in Prospero’s masque.','Nymphs|Naiads','dramatic-group',[8])
C('reapers','The reapers','reference','The harvest workers represented by dancers in Prospero’s masque.','Reapers','dramatic-group',[8])
C('shapes','The banquet figures','supporting','The strange figures who bring in and remove the banquet.','Shapes','spirit-group',[7])
C('hounds','The spirit hounds','supporting','The spirits appearing as hunting dogs under Prospero and Ariel’s direction.','','spirit-group',[8])
for name in ['Mountain','Silver','Fury','Tyrant']:
 C(name.lower(),name,'reference','One of the spirit hounds called by name during the chase.',name,'spirit',[8])
for id,name,aliases in [('mall','Mall / Moll','Mall|Moll'),('meg','Meg','Meg'),('marian','Marian','Marian'),('margery','Margery','Margery'),('kate','Kate','Kate')]:
 C(id,name,'reference','One of the women named in Stephano’s sailors’ song.',aliases,'song-figure',[4])
C('temperance','Temperance','reference','A woman’s name in Antonio’s joke about the word “temperance”; no further identity is given.','Temperance','unresolved-figure',[3])
C('nobody','Nobody','reference','The comic figure of “Nobody,” invoked when Trinculo hears music without seeing a musician.','Nobody','cultural-figure',[6])
C('fortune','Fortune','reference','Good or bad luck imagined as a female power.','Fortune','cultural-figure',[2])
C('fate','Fate','reference','Destiny imagined as a power governing human lives.','Fate|Destiny','cultural-figure',[1,7])
data=dict(bookId='the-tempest',contentVersion='2026-09-10.1',coverage='Both English editions: named cast, all printed speaker labels, distinct masque roles, named references and selected identifiable unnamed figures. Generic pronouns, imagined crowds and ordinary oaths excluded.',entities=entities)
(BASE/'editorial.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
