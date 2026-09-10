"""Manually authored whole-play recognition cards, not recaps."""
import json
from pathlib import Path
entities=[]
def C(id,name,role,body,aliases='',kind='person',snapshots=None):
 entities.append(dict(id=id,name=name,category=role,body=body,subtitle='',kind=kind,aliases=aliases.split('|') if aliases else [],snapshots=snapshots or []))
C('viola','Viola','central','The play’s main character, Sebastian’s twin sister, shipwrecked on the coast of Illyria.','VIOLA|Viola',snapshots=[dict(after=[4,1],body='The main character, Sebastian’s twin sister, serving Orsino under the name Cesario.'),dict(after=[18,153],body='The main character, Sebastian’s twin sister and Orsino’s intended bride; Cesario is her assumed name.')])
C('sebastian','Sebastian','major','Viola’s twin brother.','SEBASTIAN|Sebastian|Roderigo',snapshots=[dict(after=[18,66],body='Viola’s twin brother and Olivia’s husband.')])
C('orsino','Orsino','major','The Duke of Illyria, who is courting Olivia.','DUKE|Orsino|Duke|duke',snapshots=[dict(after=[18,153],body='The Duke of Illyria, now intending to marry Viola.')])
C('olivia','Olivia','major','The wealthy countess whom Orsino is courting, and Sir Toby’s niece.','OLIVIA|Countess Olivia|Lady Olivia|Olivia|Countess',snapshots=[dict(after=[18,66],body='The wealthy countess, Sir Toby’s niece and Sebastian’s wife.')])
C('toby','Sir Toby Belch','major','Olivia’s uncle, a resident in her household and Sir Andrew’s drinking companion.','SIR TOBY|Sir Toby Belch|Sir Toby|Toby',snapshots=[dict(after=[18,147],body='Olivia’s uncle, now married to Maria.')])
C('andrew','Sir Andrew Aguecheek','major','Sir Toby’s companion, the knight seeking Olivia’s hand.','SIR ANDREW|Sir Andrew Aguecheek|Sir Andrew|Andrew Aguecheek|Aguecheek|Agueface')
C('maria','Maria','major','Olivia’s waiting-woman, who keeps watch over the household’s unruly guests.','MARIA|Maria|Mistress Mary',snapshots=[dict(after=[18,147],body='Olivia’s waiting-woman and Sir Toby’s wife.')])
C('malvolio','Malvolio','major','Olivia’s steward, responsible for managing her household.','MALVOLIO|Count Malvolio|Malvolio')
C('feste','Feste','major','Olivia’s jester, labeled Clown in the dialogue.','CLOWN|Clown|Feste',snapshots=[dict(after=[16,12],body='Olivia’s jester, also appearing under the clerical name Sir Topas.')])
C('antonio','Antonio','major','The sea captain who helps Sebastian.','ANTONIO|Antonio')
for id,name,body,aliases in [
 ('valentine','Valentine','Orsino’s attendant, sent to Olivia on his behalf.','VALENTINE|Valentine'),
 ('curio','Curio','One of Orsino’s attendants.','CURIO|Curio'),
 ('fabian','Fabian','A member of Olivia’s household and Sir Toby’s companion.','FABIAN|Fabian'),
]:C(id,name,'supporting',body,aliases)
for id,name,body,aliases in [
 ('captain','Viola’s captain','The captain who helps Viola after the shipwreck.','CAPTAIN|Captain'),
 ('priest','The Priest','The clergyman Olivia brings to solemnize her vows.','PRIEST|Priest'),
 ('officer-first','The first officer','One of the Illyrian officers who arrest Antonio.','FIRST OFFICER'),
 ('officer-second','The second officer','The other officer taking Antonio into custody.','SECOND OFFICER'),
 ('olivia-servant','Olivia’s servant','The attendant announcing Orsino’s messenger at Olivia’s house.','SERVANT|Servant'),
 ('handmaid','Olivia’s handmaid','The unnamed attendant who gives Olivia’s reply to Valentine.','handmaid'),
]:C(id,name,'supporting',body,aliases,'unnamed-person')
C('sailors','The shipwrecked sailors','supporting','The sailors with Viola and the captain on the coast.','Sailors|sailors','group')
C('musicians','The musicians','supporting','The musicians attending Orsino’s household.','Musicians|Musician|musicians','group')
for id,name,body,aliases,kind in [
 ('father-sebastian','Sebastian of Messaline','The father of the twins Viola and Sebastian.','Sebastian of Messaline','person'),
 ('olivia-father','Olivia’s father','The deceased count, father of Olivia and her brother.','','unnamed-person'),
 ('olivia-brother','Olivia’s brother','The brother whose death Olivia is mourning.','','unnamed-person'),
 ('titus','Titus','Orsino’s nephew, mentioned in the account of the naval fighting.','Titus','person'),
 ('dick','Dick the surgeon','The surgeon Sir Toby asks for after being injured.','Dick Surgeon|Dick the surgeon','person'),
 ('mall','Mistress Mall','The woman whose curtained portrait Sir Toby uses as a comparison.','Mistress Mall','person'),
 ('quinapalus','Quinapalus','The invented authority Feste cites in his joke about wisdom and folly.','Quinapalus','literary-figure'),
 ('pigrogromitus','Pigrogromitus','The invented figure in Feste’s nonsense, recalled by Sir Andrew.','Pigrogromitus','literary-figure'),
 ('vapians','The Vapians','The imaginary people in Feste’s nonsense about crossing the equinoctial.','Vapians','group'),
 ('myrmidons','The Myrmidons','Achilles’s warriors in Greek legend, incongruously invoked by Feste.','Myrmidons','group'),
 ('peg','Peg-a-Ramsey','The figure in a popular song whose name Toby applies to Malvolio.','Peg-a-Ramsey','literary-figure'),
 ('babylon-man','The man in Babylon','The man mentioned in Sir Toby’s song fragment.','','literary-figure'),
 ('strachy-lady','The lady of the Strachy','The woman whose marriage to a servant Malvolio cites as a precedent.','lady of the Strachy','unnamed-person'),
 ('wardrobe-yeoman','The wardrobe servant','The man said to have married the lady of the Strachy.','yeoman of the wardrobe','unnamed-person'),
 ('sowter','Sowter','A stock hound-name used in Fabian’s metaphor about Malvolio following a scent.','Sowter','animal'),
 ('sophy','The Sophy','The Persian ruler referred to by his title in the characters’ comparisons and boasts.','Sophy|Shah of Persia','unnamed-person'),
 ('capilet','Capilet','Sir Andrew’s gray horse.','Capilet','animal'),
 ('prague-hermit','The hermit of Prague','The supposed hermit in Feste’s invented anecdote.','hermit of Prague','literary-figure'),
 ('gorboduc','King Gorboduc','The legendary British king named in Feste’s anecdote.','King Gorboduc','mythological-figure'),
 ('gorboduc-niece','Gorboduc’s niece','The supposed niece addressed by the hermit in Feste’s anecdote.','','literary-figure'),
 ('robin','Robin','The man addressed in Feste’s song.','Robin','literary-figure'),
 ('thyamis','The Egyptian thief','Thyamis, the bandit in Heliodorus’s romance, invoked in Orsino’s comparison about jealousy.','Egyptian thief','literary-figure'),
 ('brownists','The Brownists','The religious separatists invoked in Sir Andrew’s comparison.','Brownist','group'),
 ('pythagoras','Pythagoras','The Greek philosopher associated here with the migration of souls between living creatures.','Pythagoras','person'),
 ('arion','Arion','The legendary musician rescued at sea by a dolphin.','Arion','mythological-figure'),
 ('diana','Diana','The goddess invoked in Orsino’s description of Cesario’s appearance.','Diana','deity'),
 ('mercury','Mercury','The Roman messenger god, invoked by Feste.','Mercury','deity'),
 ('jove','Jove','Jupiter, the king of the Roman gods.','Jove','deity'),
 ('penthesilea','Penthesilea','The Amazon queen whose name Sir Toby uses to address Maria.','Penthesilea','mythological-figure'),
 ('lucrece','Lucrece','The Roman Lucretia, associated with chastity and invoked through Olivia’s seal.','Lucrece','person'),
 ('pandarus','Pandarus','The go-between in the story of Troilus and Cressida.','Lord Pandarus|Pandarus','literary-figure'),
 ('cressida','Cressida','Troilus’s beloved, invoked in Feste’s joke about begging.','Cressida','literary-figure'),
 ('troilus','Troilus','The Trojan lover of Cressida.','Troilus','literary-figure'),
 ('vulcan','Vulcan','The Roman smith-god, used as a comparison for a smoke-blackened face.','Vulcan','deity'),
 ('eve','Eve','The first woman in the biblical creation story.','Eve','religious-figure'),
 ('anne','Saint Anne','The saint traditionally identified as the Virgin Mary’s mother.','Saint Anne','religious-figure'),
 ('jezebel','Jezebel','The biblical queen whose name Sir Andrew uses as an insult.','Jezebel','religious-figure'),
 ('noah','Noah','The biblical survivor of the Flood.','Noah','religious-figure'),
 ('legion','Legion','The collective demonic name in the Gospel story of possession.','Legion','religious-figure'),
 ('satan','Satan','The devil, invoked in the characters’ jokes and accusations.','Satan','religious-figure'),
 ('beelzebub','Beelzebub','The demonic figure Feste invokes, named here as Belzebub.','Belzebub|Beelzebub','religious-figure'),
 ('god','God','The deity invoked in the characters’ prayers and exclamations.','God','deity'),
 ('vice','The Vice','The comic tempter of older morality plays, evoked in Feste’s song.','Vice','literary-figure'),
 ('egyptians','The Egyptians','The people evoked in Feste’s reference to the biblical plague of darkness.','Egyptians','group'),
]:C(id,name,'reference',body,aliases,kind)
p=Path(__file__).resolve().parent
(p/'editorial.json').write_text(json.dumps(dict(contentVersion='2026-09-10.1',coverage='All eighteen scenes: full named cast, contextual disguises and mistaken identities, separate family references, staff, reported people, songs and classical/biblical allusions.',entities=entities),ensure_ascii=False,indent=2)+'\n')
