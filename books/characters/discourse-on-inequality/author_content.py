"""Manually reviewed references in the dedication, preface and both parts."""
import json
from pathlib import Path
entities=[]
def add(id,name,body,aliases='',kind='person'):
 entities.append(dict(id=id,name=name,body=body,aliases=aliases.split('|') if aliases else [],category='reference',kind=kind,subtitle='',snapshots=[]))
for row in [
('isaac','Isaac Rousseau','Rousseau’s father, the Geneva craftsman whose example he recalls in the dedication.',''),
('tacitus','Tacitus','The Roman historian among the authors read by Rousseau’s father.','Tacitus'),
('plutarch','Plutarch','The Greek biographer whose works Rousseau recalls beside his father’s tools.','Plutarch'),
('grotius','Hugo Grotius','The Dutch jurist and political thinker cited on law and property.','Grotius'),
('aristotle','Aristotle','The Greek philosopher used as a model for inquiry into humanity and nature.','Aristotle|Aristotles'),
('pliny-elder','Pliny the Elder','The Roman natural historian invoked as a model for scientific inquiry.','Plinys'),
('pliny-younger','Pliny the Younger','The Roman writer quoted addressing the emperor Trajan.','Pliny'),
('burlamaqui','Jean-Jacques Burlamaqui','The Genevan jurist cited on the meaning of natural right.','Burlamaqui'),
('persius','Persius','The Roman satirist quoted in the Latin verses introducing the inquiry.','Persius'),
('moses','Moses','The biblical lawgiver whose writings Rousseau invokes in discussing the state of nature.','Moses'),
('plato','Plato','The Greek philosopher invoked as an imagined judge of the discourse and cited on medicine and government.','Plato'),
('xenocrates','Xenocrates','The Greek philosopher and head of the Academy, imagined alongside Plato as a judge of the discourse.','Xenocrates'),
('hobbes','Thomas Hobbes','The English political philosopher whose account of humanity in the state of nature Rousseau challenges.','Hobbes'),
('montesquieu','Montesquieu','The French political thinker referred to as the other illustrious philosopher in the discussion of natural fear.',''),
('cumberland','Richard Cumberland','The English philosopher and bishop cited on natural law and human behavior.','Cumberland'),
('pufendorf','Samuel Pufendorf','The German natural-law thinker whose views on fear, liberty and slavery Rousseau examines.','Puffendorf|Pufendorf'),
('correal','Francis Correal','The travel-account author cited on the Caribs of Venezuela.','Francis Correal'),
('hippocrates','Hippocrates','The ancient Greek physician associated here with dietary treatment.','Hippocrates'),
('celsus','Celsus','The Roman medical writer cited on the history of diet as a treatment.','Celsus'),
('condillac','Étienne Bonnot de Condillac','The French philosopher whose account of language Rousseau discusses.','Abbé Condillac|Condillac'),
('mandeville','Bernard Mandeville','The author of The Fable of the Bees, cited in the argument about compassion.','Mandeville'),
('sulla','Sulla','The Roman general and dictator used in an example of compassion coexisting with cruelty.','Sulla'),
('alexander','Alexander of Pherae','The Thessalian tyrant whose response to tragedy is contrasted with his cruelty.','Alexander of Pheros|Alexander of Pherae'),
('juvenal','Juvenal','The Roman satirist quoted in the discussion of compassion.','Juvenal'),
('socrates','Socrates','The Athenian philosopher invoked in the discussion of virtue and reason.','Socrates'),
('locke','John Locke','The English philosopher cited on property and political authority.','Locke'),
('lycurgus','Lycurgus','The traditional lawgiver of Sparta, used as an example of founding political institutions.','Lycurgus'),
('trajan','Trajan','The Roman emperor addressed in the quotation from Pliny the Younger.','Trajan'),
('brasidas','Brasidas','The Spartan commander to whom Rousseau attributes the reply about the pleasures of liberty.','Brasidas'),
('sidney','Algernon Sidney','The English republican thinker cited against deriving absolute government from fatherhood.','Sidney'),
('louis','Louis XIV','The French king whose 1667 edict is quoted in the argument about rulers and law.','Louis XIV'),
('barbeyrac','Jean Barbeyrac','The jurist cited against surrendering liberty to arbitrary power.','Barbeyrac'),
('lucan','Lucan','The Roman poet quoted to illustrate obedience to a ruler’s criminal commands.','Lucan'),
('diogenes','Diogenes','The Cynic philosopher invoked through his search for an honest human being.','Diogenes'),
('cato','Cato the Younger','The Roman republican statesman used as an example of virtue at odds with its age.','Cato'),
]:add(*row)
for row in [
('tarquins','The Tarquins','The royal family associated with the last kings of Rome, whose expulsion Rousseau discusses.','Tarquins','group'),
('glaucus','Glaucus','The sea god whose weathered statue illustrates the difficulty of recognizing humanity’s original nature.','Glaucus','mythological-figure'),
('god','God','The divine creator invoked in the discussion of human nature, liberty and religious authority.','God Himself|God|Creator|Sovereign Creator|divine Author|Author of our being','religious-figure'),
('adam','Adam','The first man in the biblical creation story, invoked in the discussion of the state of nature.','','religious-figure'),
('podalirius','Podalirius','The Greek healer at Troy, paired with Machaon in the example about ancient medicine.','Podalirius','literary-figure'),
('machaon','Machaon','The Greek healer at Troy mentioned alongside Podalirius.','Machaon','literary-figure'),
('andromache','Andromache','Hector’s wife in Trojan legend, invoked as a figure of tragic suffering.','Andromache','literary-figure'),
('priam','Priam','The king of Troy, invoked alongside Andromache as a figure of tragic suffering.','Priam','literary-figure'),
('ceres','Ceres','The Roman goddess of agriculture, cited through her association with law and land distribution.','Ceres|Legislatrix','mythological-figure'),
('satrap','The Persian satrap','The Persian official in the anecdote Rousseau tells about Brasidas and liberty.','Satrap|Persian satrap','unnamed-role'),
]:add(*row)
BASE=Path(__file__).resolve().parent
(BASE/'editorial.json').write_text(json.dumps(dict(bookId='discourse-on-inequality',contentVersion='2026-09-10.1',coverage='Full dedication, preface and both parts in original-en and modern-en: named historical, philosophical, literary and religious references and identified implicit references. Generic hypothetical people, political bodies and population labels are not given invented personal identities.',entities=entities),ensure_ascii=False,indent=2)+'\n')
