from build import *
single={(4,3),(4,9),(4,11),(6,6),(6,8),(6,10),(10,19),(10,20),(10,41),(11,10),(12,7),(12,29),(12,31),(12,40),(15,3),(15,21),(15,23),(15,25),(15,27),(15,45),(18,60),(21,2),(21,7),(23,9),(23,14),(23,24),(25,18),(28,18),(28,20)}
for j,c in enumerate(D['chapters'],1):
 c['title']=re.sub(r'Akt (\d), Scene (\d+) —',r'\1. akt, \2. scene —',c['title']).replace('Et rum i slottet','Et værelse på slottet').replace('Et rum i Macduffs slot','Et værelse på Macduffs slot')
 for i,s in enumerate(c['paragraphs'],1):
  if (j,i) in single:
   s=s.replace('Jeres','Deres').replace('Jer','Dem')
   s=re.sub(r'\bI\b(?= (?:har|sagde|gjorde|befaler|er|ønsker|vil|kan|får|ser|må|måtte|finder|venter|tager))','De',s)
  else:s=s.replace('Jeres','jeres').replace(' Jer ',' jer ')
  for a,b in [('Thanen af','Thanen af' if s.startswith('Thanen') else 'thanen af'),('Thane af','than af'),('thane.','than.'),('thane,','than,'),('skæbnekvinderne','skæbnesøstrene'),('Birnam-skoven','Birnamskoven'),('førend','før'),('fader','far'),('moders','mors'),('broder','bror'),('din fjols','dit fjols'),('Mordets','mordets'),('som profeter som stamfar','som profeter og kaldte ham stamfar'),('synes at have bestemt','ser ud til at have bestemt'),(' en skov i sigte',' en skov i det fjerne'),('fugleklistre','limpinde'),('[_Banken indefra._]','[Det banker uden for scenen.]'),('[_Indefra._]','[Uden for scenen.]'),(' går af.',' går ud.'),('trøbel','besvær'),('fortryllerer','fortryller'),('sceptret','sceptret')]:s=s.replace(a,b)
  s=re.sub(r'\b[fF]arslø',[ 'farslø' ][0],s) if False else s
  if s.startswith('LORDER.'):s=s.replace('LORDER.','ADELSMÆNDENE.',1)
  if s.startswith('LORD.'):s=s.replace('LORD.','ADELSMAND.',1)
  c['paragraphs'][i-1]=s
def eng(c,i,a,b):
 s=E['chapters'][c-1]['paragraphs'];assert a in s[i-1],(c,i,a);s[i-1]=s[i-1].replace(a,b)
for j,i,a,b in [(2,17,"like the god of war's own champion","like the bridegroom of Bellona, goddess of war"),(2,19,'ten thousand dollars','ten thousand silver dollars'),(3,30,'you incomplete prophets','you who tell only half the story'),(4,8,'I have begun to invest in you, and I will work to see you flourish','I’ve planted you, and I’ll help you grow'),(9,30,'all the water in the ocean','all the water in great Neptune’s ocean'),(10,2,'in the name of the devil','in Beelzebub’s name'),(10,2,'heat your pressing iron','roast your goose of a pressing iron'),(10,8,'it props him up and then lets him down','it gets him up and then he can’t keep it up'),(10,9,'drink got the better of you','drink called you a liar and laid you flat'),(10,10,'I managed to throw it off in the end','I managed to throw it up in the end'),(18,4,'My familiar spirit cries','Harpier, my familiar spirit, cries'),(18,5,'Into the poisoned brew throw a toad','Throw the poisoned entrails in. You toad'),(18,9,'liver of a blasphemer','liver of a blaspheming Jew'),(20,30,"It's called the King's Evil, a most miraculous power in this good king.","The disease is called the King’s Evil. This good king works a remarkable cure."),(23,23,'diagnose the disease of my country','examine my country’s urine'),(23,23,'What drug, what laxative, what purge','What rhubarb, what senna, what purging drug')]:eng(j,i,a,b)
E['chapters'][16]['paragraphs'][4]='LORD. He did. When Macduff gave him a flat “No, sir, not I,” the messenger turned his back with a scowl and a hum, as if to say, “You’ll regret loading me with that answer.”'
E['chapters'][27]['paragraphs'][8]='MACDUFF. Then give up hope in your charm. Let the spirit you’ve served all along tell you this: Macduff was ripped from his mother’s womb before his time.'
wr('modern-da.json',D);wr('modern-en.json',E)
