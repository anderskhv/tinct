"""Manually authored identities for the local twelve-tablet edition."""
import json
from pathlib import Path
entities=[]
def C(id,name,role,body,aliases='',kind='person'):
 entities.append(dict(id=id,name=name,category=role,body=body,subtitle='',kind=kind,aliases=aliases.split('|') if aliases else [],snapshots=[]))
C('gilgamesh','Gilgamesh','central','The king of Uruk and the epic’s principal hero, son of Ninsun and Lugalbanda.','Gilgamesh|Gilgamsh|Gigamesh|Gilagmesh|Gilamesh')
C('enkidu','Enkidu','central','The wild man created by Aruru to match Gilgamesh in strength.','Enkidu')
entities[-1]['snapshots']=[dict(after=[2,15],body='Gilgamesh’s closest friend and companion, originally a wild man raised among animals.')]
C('shamash','Shamash','major','The sun god, protector of Gilgamesh and Enkidu.','Shamash|Sun God','deity')
C('humbaba','Humbaba','major','The fearsome guardian appointed by Enlil to protect the Cedar Forest.','Humbaba','mythical-being')
C('ishtar','Ishtar','major','The goddess of love and war, daughter of Anu and Antum.','Ishtar','deity')
C('utnapishtim','Utnapishtim','major','Gilgamesh’s distant ancestor, a man granted everlasting life.','Utnapishtim|Utnapishim|Atra-hasis')
C('ninsun','Ninsun','supporting','Gilgamesh’s mother, a wise cow-goddess who interprets his dreams.','Ninsun','deity')
C('lugalbanda','Lugalbanda','supporting','Gilgamesh’s divine father, invoked as his protector.','Lugalbanda','deity')
C('shamhat','Shamhat','supporting','The sex worker from Uruk sent to introduce Enkidu to human society.','Shamhat')
C('siduri','Siduri','supporting','The tavern-keeper who lives beside the sea. Also spelled Sirudi here.','Siduri|Sirudi|tavern-keeper')
C('urshanabi','Urshanabi','supporting','Utnapishtim’s ferryman, who crosses the Waters of Death. Also spelled Urshinabi here.','Urshanabi|Urshinabi')
C('anu','Anu','supporting','The sky god and father of Ishtar.','Anu','deity')
C('enlil','Enlil','supporting','A leading god who exercises authority over humanity and the other gods. Also called Bel here.','Enlil|Bel','deity')
C('ea','Ea / Enki','supporting','The god of wisdom and fresh water, also called Enki and Nudimmud.','Ea|Enki|Nudimmud','deity')
C('aruru','Aruru','supporting','The creator goddess who fashions human beings.','Aruru','deity')
C('adad','Adad','supporting','The god of storms and thunder.','Adad','deity')
C('sin','Sin','supporting','The moon god, also invoked as Namra-sit.','Sin|Namra-sit','deity')
C('ereshkigal','Ereshkigal','supporting','The queen of the underworld, also called Irkalla in this edition.','Ereshkigal|Irkalla','deity')
C('nergal','Nergal','supporting','A god associated with death, warfare and the underworld.','Nergal','deity')
C('ninurta','Ninurta','supporting','A warrior god who takes part in the gods’ council and the Flood story.','Ninurta','deity')
C('antum','Antum','supporting','Ishtar’s mother and Anu’s consort.','Antum','deity')
C('bull','The Bull of Heaven','supporting','The divine bull under Anu’s control, requested by Ishtar.','Bull of Heaven|Heaven-Bull','mythical-being')
C('anunnaki','The Anunnaki','supporting','A collective name for the great gods who determine human fate.','Anunnaki','group')
C('trapper','The trapper','supporting','The hunter who encounters Enkidu at the animals’ watering place.','trapper','unnamed-person')
C('trapper-father','The trapper’s father','supporting','The trapper’s father, whom he consults about Enkidu.','','unnamed-person')
C('elders','The elders of Uruk','supporting','The city’s senior counselors, who advise Gilgamesh.','elders of Uruk|elders','group')
C('scorpion-man','The scorpion-man','supporting','One of the guardians of the mountain of Mashu and the sun’s passage.','scorpion-man','mythical-being')
C('scorpion-wife','The scorpion-man’s wife','supporting','The scorpion-man’s wife and fellow guardian at Mount Mashu.','','mythical-being')
C('scorpion-guardians','The scorpion guardians','supporting','The beings who guard the entrance to Mount Mashu.','Scorpion-men','group')
C('stone-men','The Stone Men','supporting','Urshanabi’s stone boat crew, immune to the Waters of Death.','Stone Men','group')
C('utnapishtim-wife','Utnapishtim’s wife','supporting','Utnapishtim’s wife, who lives with him at his distant dwelling.','','unnamed-person')
C('barber','The barber','supporting','The barber who grooms Enkidu as he enters human society.','barber','unnamed-person')
C('wedding-guest','The wedding guest','supporting','The traveler who explains the wedding customs of Uruk to Enkidu.','','unnamed-person')
C('dream-attacker','The figure in Enkidu’s dream','supporting','The terrifying humanlike figure with animal claws in Enkidu’s dream.','','mythical-being')
C('underworld-scribe','The underworld scribe','supporting','The scribe who reads a tablet before Ereshkigal.','','unnamed-role')
C('carpenter','The carpenter','reference','The carpenter whose shop Gilgamesh recalls in the story of his ball and mallet.','','unnamed-person')
C('carpenter-wife','The carpenter’s wife','reference','The carpenter’s wife, whom Gilgamesh regards as being like a mother.','','unnamed-person')
C('carpenter-daughter','The carpenter’s daughter','reference','The carpenter’s daughter, whom Gilgamesh regards as being like a sister.','','unnamed-person')
C('snake','The serpent','supporting','The snake at the watering place on Gilgamesh’s return journey.','','animal')
for id,name,body,aliases,kind in [
 ('aya','Aya','The goddess who is Shamash’s consort.','Aya','deity'),
 ('nisaba','Nisaba','The grain goddess, invoked in the description of Enkidu’s hair.','Nisaba','deity'),
 ('igigi','The Igigi','A collective name for a group of gods.','Igigi','group'),
 ('irnina','Irnina','A divine figure associated with victory and the underworld, invoked in Ninsun’s prayer.','Irnina','deity'),
 ('irnini','Irnini','The divine name attached to the Cedar Forest’s sanctuary in this translation; printed Imini in the original edition.','Irnini|Imini','deity'),
 ('ningishzida','Ningishzida','An underworld god invoked in Ninsun’s prayer.','Ningishzida','deity'),
 ('dumuzi','Dumuzi','Ishtar’s youthful husband, a shepherd god.','Dumuzi','deity'),
 ('thunderbird','The Thunderbird','The mighty supernatural bird invoked in the heroes’ dreams and comparisons.','Thunderbird','mythical-being'),
 ('allallu','The allallu-bird','The brightly colored bird named among Ishtar’s former lovers.','allallu-bird','animal'),
 ('silili','Silili','The mother of the horse named among Ishtar’s former lovers.','Silili','mythical-being'),
 ('ishullanu','Ishullanu','Anu’s gardener, named among the men desired by Ishtar.','Ishullanu','person'),
 ('lover-lion','The lion','The powerful lion named among Ishtar’s former lovers.','','animal'),
 ('lover-horse','The horse','The warhorse named among Ishtar’s former lovers, offspring of Silili.','','animal'),
 ('lover-shepherd','The shepherd','The herdsman named among Ishtar’s former lovers.','','unnamed-person'),
 ('etana','Etana','A legendary king encountered among the inhabitants of the underworld.','Etana','person'),
 ('shakkan','Shakkan','The god of wild animals and herds, named in the underworld vision.','Shakkan','deity'),
 ('namtar','Namtar','A divine agent of death and disease associated with the underworld.','Namtar','deity'),
 ('hushbisha','Hushbisha','A divine attendant in the court of the underworld.','Hushbisha','deity'),
 ('qassu','Quassu-tabat','A divine attendant of Ereshkigal, honored in the funeral offerings.','Quassu-tabat','deity'),
 ('ninshuluhha','Ninshuluhha','A deity associated with cleaning the underworld’s house.','Ninshuluhha','deity'),
 ('bibbu','Bibbu','A deity serving in the underworld’s court, honored in the funeral offerings.','Bibbu','deity'),
 ('dumuzi-abzu','Dumuzi-abzu','A separate underworld deity from Ishtar’s husband Dumuzi, named in the funeral offerings.','Dumuzi-abzu','deity'),
 ('ubar-tutu','Ubar-Tutu','Utnapishtim’s father, also spelled Ubara-Tutu here.','Ubar-Tutu|Ubara-Tutu','person'),
 ('mammitum','Mammitum','The goddess who determines human fate with the great gods.','Mammitum','deity'),
 ('ennugi','Ennugi','A god named among the leaders of the divine council.','Ennugi','deity'),
 ('puzur','Puzur-Amurri','The boatman entrusted with Utnapishtim’s ship in the Flood story.','Puzur-Amurri','person'),
 ('shullat','Shullat','One of the heralds who accompany the storm god Adad.','Shullat','deity'),
 ('hanish','Hanish','One of the heralds who accompany the storm god Adad.','Hanish','deity'),
 ('ninazu','Ninazu','An underworld god, a son of Ereshkigal in this tradition.','Ninazu','deity'),
 ('asakku','Asakku','A demon associated with sickness and death.','Asakku','mythical-being'),
 ('sages','The seven Sages','The legendary sages credited with laying the foundations of Uruk’s wall.','Seven Sages|seven Sages|seven sages','group')]:C(id,name,'reference',body,aliases,kind)
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='gilgamesh',contentVersion='2026-09-10.1',coverage='All twelve local tablets in both English editions: named heroes, divine actors and references, distinct recognizable unnamed roles and selected groups. Source defects and ambiguous divine names are documented separately.',entities=entities),ensure_ascii=False,indent=2)+'\n')
