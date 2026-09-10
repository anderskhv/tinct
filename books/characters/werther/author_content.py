"""Manually authored whole-book recognition copy, including the Ossian songs."""
import json
from pathlib import Path
entities=[]
def add(id,name,body,aliases='',category='supporting',kind='person',snapshots=None):
 entities.append(dict(id=id,name=name,body=body,aliases=aliases.split('|') if aliases else [],category=category,kind=kind,subtitle='',snapshots=snapshots or []))
add('werther','Werther','The main character, whose letters tell the story.','Werther','central')
add('charlotte','Charlotte','The district judge’s eldest daughter, who cares for her younger siblings and is engaged to Albert.','Charlotte','major',snapshots=[dict(after=[14,5],body='The woman Werther loves; she is engaged to Albert.'),dict(after=[47,1],body='The woman Werther loves; she is married to Albert.')])
add('albert','Albert','Charlotte’s fiancé.','Albert','major',snapshots=[dict(after=[47,1],body='Charlotte’s husband.')])
add('wilhelm','Wilhelm','Werther’s close friend and the principal recipient of his letters.','Wilhelm','major')
for row in [
('editor','The editor','The fictional editor who introduces and arranges Werther’s story.',''),
('mother','Werther’s mother','Werther’s mother, whose concerns about his affairs reach him through Wilhelm.',''),
('aunt','Werther’s aunt','The relative Werther visits concerning his mother’s disputed inheritance.',''),
('leonora','Leonora','The young woman who became attached to Werther while he was drawn to her sister.',''),
('leonora-sister','Leonora’s sister','The woman whose charms attracted Werther during his acquaintance with Leonora.',''),
('count-m','Count M','The late owner of the garden Werther enjoys.','Count M'),
('gardener','The gardener','The man who tends the late Count M’s garden.','gardener'),
('early-friend','Werther’s earlier friend','The older woman whose friendship Werther remembers with affection.',''),
('v','V—','The young university graduate who displays his learning to Werther.','V—'),
('judge','Charlotte’s father','The district judge, a widower and father of Charlotte and her eight younger siblings.','district judge'),
('charlotte-mother','Charlotte’s mother','Charlotte’s late mother, whose place she tries to fill for the younger children.',''),
('innkeeper','The innkeeper at Walheim','The older woman who runs the small inn beneath the linden trees.',''),
('philip','Philip','One of the schoolmaster’s daughter’s three sons; the boy Werther sketches holding his younger brother.','Philip'),
('hans','Hans','The youngest of the schoolmaster’s daughter’s three sons.','Hans|John'),
('eldest-boy','The eldest of the three boys','The schoolmaster’s daughter’s eldest son, brother of Philip and Hans.',''),
('boys-mother','The boys’ mother','The schoolmaster’s daughter, whose three boys befriend Werther at Walheim.',''),
('boys-father','The boys’ father','The husband of the schoolmaster’s daughter, away in Switzerland on inheritance business.',''),
('schoolmaster-father','The schoolmaster','The father of the woman whose three boys Werther befriends.',''),
('peasant','The peasant lad','The young farm servant who is in love with the widow he works for.','peasant-lad|peasant lad|peasant boy'),
('widow','The widow','The woman who employs the peasant lad and is the object of his love.',''),
('widow-husband','The widow’s first husband','The late husband whose mistreatment is described in the peasant lad’s account.',''),
('widow-brother','The widow’s brother','The brother concerned about his children’s inheritance if the widow remarries.',''),
('replacement','The replacement servant','The servant hired by the widow after the peasant lad’s dismissal.',''),
('partner','Werther’s dance partner','The young woman Werther escorts to the country ball.',''),
('partner-aunt','The dance partner’s aunt','The woman who accompanies Werther’s partner and warns him that Charlotte is engaged.',''),
('maid','The hunting-lodge maid','The maid who admits the visitors at Charlotte’s family home.',''),
('louis','Louis','Charlotte’s youngest brother.','Louis'),
('sophy','Sophy','Charlotte’s younger sister, entrusted with the children when Charlotte goes out.','Sophy'),
('jane','Jane','One of Charlotte’s younger sisters.','Jane'),
('marianne','Marianne','Charlotte’s younger sister, present with Jane at the fountain.','Marianne'),
('andrans','The Messrs. Andran','The gentlemen named Andran among the dancing company.','Messrs. Andran|Andran|Audran'),
('nn','N. N.','The gentleman identified only by initials among the party’s dance partners.','N. N.|N.N.'),
('warning-lady','The lady at the ball','The woman who pointedly reminds Charlotte of Albert during the dance.',''),
('old-vicar','The old vicar','The clergyman Charlotte and Werther visit; Frederica’s father.',''),
('frederica','Frederica','The old vicar’s daughter, whose companion is Herr Schmidt.','Frederica'),
('schmidt','Herr Schmidt','Frederica’s reserved, jealous suitor.','Herr Schmidt|Schmidt'),
('vicar-predecessor','The vicar’s predecessor','The earlier clergyman whose daughter married the old vicar.',''),
('vicar-wife','The old vicar’s wife','The daughter of his predecessor and mother of Frederica.',''),
('madame-m','Madame M—','The ailing woman Charlotte visits, married to the miserly old M—.','Madame M—|Frau M—'),
('old-m','Old M—','Madame M—’s husband, who keeps a tight limit on the household allowance.','Old M—|old M—'),
('m-doctor','Madame M—’s physician','The doctor attending Madame M—.',''),
('ambassador','The ambassador','The diplomat with whom Werther is offered employment.','ambassador'),
('minister','The minister','The government official who takes an interest in Werther’s career.',''),
('count-c','Count C—','The sympathetic nobleman Werther befriends while working at the embassy.','Count C—|Count of O—|Count O—'),
('miss-b','Miss B—','The young noblewoman Werther befriends during his time at the embassy.','Miss B—'),
('b-aunt','Miss B—’s aunt','The aristocratic aunt with whom Miss B— lives.',''),
('colonel','Colonel B—','The officer talking with Werther and the count before the aristocratic gathering.','Colonel B—'),
('lady-s','Lady S—','The aristocratic woman attending the count’s gathering with her family.','Madame S—|Lady von S—|Frau von S—'),
('lady-s-husband','Lady S—’s husband','The nobleman who accompanies his wife and daughter to the count’s gathering.',''),
('lady-s-daughter','Lady S—’s daughter','The young woman attending the gathering with her parents.',''),
('baron-f','Baron F—','An aristocratic guest at the count’s gathering.','Baron F—'),
('chancellor','The court official','The guest who attends the count’s gathering with his deaf wife.','Chancellor N—|court councillor R—'),
('chancellor-wife','The court official’s wife','The court official’s wife, described as deaf.',''),
('i-guest','The guest in the patched coat','The guest whose old coat Werther notices at the count’s gathering.',''),
('adelin','Adelin','The acquaintance who tells Werther about the reaction to his presence at the gathering.','Adelin'),
('s-family','The S——s','Members of the aristocratic circle discussed after the count’s gathering.','S——s|von S—s'),
('t-family','The T——s','Members of the aristocratic circle discussed alongside the S——s.','T——s|von T—s'),
('prince','The prince','The nobleman who invites Werther to stay at his country house.','Prince of ——'),
('crown-prince','The crown prince','The royal patron who sends Werther money when he leaves his post.','crown prince'),
('new-vicar','The new vicar','The clergyman who succeeds Frederica’s father.',''),
('new-vicar-wife','The new vicar’s wife','The new clergyman’s wife, whose decisions anger Werther and the villagers.',''),
('tree-steward','The steward in the tree dispute','The local official involved with the new vicar in disposing of the walnut trees.',''),
('tree-schoolmaster','The schoolmaster in the tree dispute','The man who tells Werther what happened to the walnut trees.',''),
('ill-n','N—, the sick acquaintance','The man whose illness Charlotte mentions in conversation.',''),
('visitor','Charlotte’s visiting friend','The woman who exchanges local news with Charlotte.',''),
('henry','Henry (Heinrich)','The distressed man Werther encounters looking for flowers.','Henry|Heinrich'),
('henry-mother','Henry’s mother','The woman caring for Henry, who explains his condition to Werther.',''),
('servant','Werther’s servant','The servant who attends to Werther’s household and errands.',''),
('charlotte-servant','Charlotte’s household servant','The servant present at Charlotte’s house during Werther’s visit.',''),
('albert-host','Albert’s host','The friend whose country house appears in Albert’s pistol anecdote.',''),
('pistol-servant','The servant in Albert’s anecdote','The servant asked to clean and load the pistols in Albert’s story.',''),
('pistol-maid','The maid in Albert’s anecdote','The maid frightened by the servant in Albert’s story about the pistols.',''),
('pistol-surgeon','The surgeon in Albert’s anecdote','The surgeon whose bill Albert mentions in his pistol story.',''),
('albert-official','Albert’s business contact','The neighboring official with whom Albert has business.',''),
('surgeon','The surgeon attending Werther','The surgeon called to Werther’s room.',''),
('neighbor','Werther’s neighbor','The neighbor who notices a disturbance at Werther’s lodging.',''),
]:add(*row,kind='group' if row[0] in ('andrans','s-family','t-family') else 'person')
# Keep employment and identity developments behind their actual report.
for e in entities:
 if e['id']=='peasant':e['snapshots']=[dict(after=[61,2],body='The widow’s former servant, still in love with her.')]
 if e['id']=='henry':e['snapshots']=[dict(after=[81,0],body='Charlotte’s father’s former secretary, whose attachment to Charlotte is explained to Werther.')]
for row in [
('homer','Homer','The ancient Greek poet whose works Werther reads.','Homer'),
('batteux','Charles Batteux','The French writer on literature and the arts named by V—.','Batteaux|Batteux'),
('wood','Robert Wood','The antiquarian and writer on Homer named in the discussion of learning.','Wood'),
('piles','Roger de Piles','The French art critic cited among V—’s reading.','De Piles'),
('winckelmann','Johann Joachim Winckelmann','The scholar of ancient art named in V—’s display of learning.','Winkelmann|Winckelmann'),
('sulzer','Johann Georg Sulzer','The writer on the fine arts whose theory V— says he has read.','Sultzer|Sulzer'),
('heyne','Christian Gottlob Heyne','The classical scholar whose work V— says he possesses in manuscript.','Heyne'),
('klopstock','Friedrich Gottlieb Klopstock','The German poet whose ode Charlotte and Werther recall during the storm.','Klopstock'),
('ernesti','Johann August Ernesti','The classical scholar associated with Werther’s larger edition of Homer.','Ernestine|Ernesti'),
('francis','Francis I','The Holy Roman emperor whose coronation dates Baron F—’s old-fashioned suit.','Francis I'),
('lavater','Johann Caspar Lavater','The Swiss religious writer mentioned in the account of the new vicar’s wife.','Lavater'),
('kennicott','Benjamin Kennicott','The biblical scholar named among the new vicar’s wife’s intellectual interests.','Kennicot|Kennicott'),
('semler','Johann Salomo Semler','The German theologian and biblical critic mentioned alongside Kennicott.','Semler'),
('michaelis','Johann David Michaelis','The German biblical scholar named in the same discussion.','Michaelis'),
]:add(*row,category='reference')
for row in [
('melusina','Melusina','The water spirit of European legend, invoked beside the fountain.','Melusina'),
('penelope','Penelope','Odysseus’s wife in Homer’s Odyssey.','Penelope'),
('ulysses','Ulysses','Odysseus, the wandering hero of Homer’s Odyssey.','Ulysses'),
('fictitious-leonora','The fictional Leonora','A heroine in Charlotte’s example of the stories she enjoyed as a girl.',''),
('elijah','The prophet in the oil story','The biblical prophet invoked through the story of the unfailing supply of oil.',''),
('jesus','Jesus Christ','The Christian teacher whose words Werther recalls.','Great Teacher of mankind|Teacher of mankind|Son of God'),
('levite','The Levite','The passerby from the Good Samaritan parable, used as a comparison.','Levite'),
('pharisee','The Pharisee','The self-satisfied worshipper from Jesus’s parable, used in Werther’s argument.','Pharisee'),
('samaritan','The Good Samaritan','The compassionate traveler of Jesus’s parable.','Samaritan'),
('priest','The priest in the parable','The other passerby in the Good Samaritan story, invoked in Werther’s letter.',''),
]:add(*row,category='reference',kind='literary-figure')
add('god','God','The divine being Werther and others address in prayer and reflection.','God|Almighty|Creator|Godhead|Maker|Father|Lord|Eternal',category='reference',kind='religious-figure')
for row in [
('ossian','Ossian','The legendary bard in the poems Werther reads and translates.','Ossian'),
('fingal','Fingal','The heroic king in the Ossian poems.','Fingal'),
('ullin','Ullin','The bard who sings of Alpin and Ryno in the quoted Ossian poems.','Ullin'),
('ryno','Ryno','The singer who addresses Alpin in the Ossian passage.','Ryno'),
('alpin','Alpin','The singer who mourns Morar in the Ossian passage.','Alpin'),
('minona','Minona','The singer of Colma’s lament; Torman’s daughter and Morar’s sister.','Minona'),
('colma','Colma','The woman waiting for her lover Salgar in Minona’s song.','Colma'),
('salgar','Salgar','Colma’s lover in the Ossian song.','Salgar'),
('colma-brother','Colma’s brother','The brother opposed to Colma’s love for Salgar.',''),
('colma-father','Colma’s father','The father Colma would leave to be with Salgar.',''),
('torman','Torman','The father of Minona and Morar in the Ossian poems.','Torman'),
('morar','Morar','The warrior mourned in Alpin’s song; Minona’s brother.','Morar'),
('oscar','Oscar','The Ossianic warrior used as a comparison for Morar’s swordsmanship.','Oscar'),
('morar-mother','Morar’s mother','The mother mentioned in the lament for Morar.',''),
('morglan','Morglan','The father of the woman mourned as Morar’s beloved.','Morglan'),
('morglan-daughter','Morglan’s daughter','Morar’s beloved, mentioned in the song mourning him.',''),
('armin','Armin','The chief of Gorma and father of Daura and Arindal in the Ossian song.','Armin'),
('carmor','Carmor','The chief of Galmal who asks Armin the reason for his grief.','Carmor'),
('colgar','Colgar','Carmor’s son in the Ossian song.','Colgar'),
('annira','Annira','Carmor’s daughter in the Ossian song.','Annira'),
('daura','Daura','Armin’s daughter and Arindal’s sister, loved by Armar.','Daura'),
('arindal','Arindal','Armin’s son and Daura’s brother.','Arindal'),
('armar','Armar','Daura’s lover, the son of Arnart.','Armar'),
('erath','Erath','The son of Odgal whose grievance against Armar enters the song of Daura.','Erath'),
('odgal','Odgal','Erath’s father in the Ossian song.','Odgal'),
('arnart','Arnart','Armar’s father in the Ossian song.','Arnart'),
('erath-brother','Erath’s brother','The brother whose death underlies Erath’s grievance against Armar.',''),
]:add(*row,category='reference',kind='literary-figure')
add('werther-father','Werther’s father','Werther’s late father, remembered in the account of leaving his childhood home.')
add('albert-father','Albert’s father','Albert’s late father, whose affairs Albert has gone to settle.')
add('henry-father','Henry’s father','The father Henry mentions while talking about flowers.')
add('well-girl','The girl at the fountain','The servant girl whose pitcher Werther helps lift.')
add('wetstein','Wetstein','The publishing name on the small edition of Homer given to Werther.', 'Wetstein',category='reference',kind='group')
add('w','W.','The young man standing with the company as Charlotte’s carriage departs.','W.')
add('seldstadt','Seldstadt','One of the company standing beside Charlotte’s departing carriage.','Seldstadt|Selstadt')
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='werther',contentVersion='2026-09-10.1',coverage='Complete 84-unit book in both English editions, including the editor’s final narrative and the embedded Ossian poems. Named cast, local roles and named literary/religious references; no invented names for abbreviated identities or generic imagined figures.',entities=entities),ensure_ascii=False,indent=2)+'\n')
