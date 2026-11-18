import json,pathlib
p=pathlib.Path(__file__).parent
d=json.loads((p/'don-quixote-modern-da.json').read_text());e=json.loads((p/'don-quixote-modern-en.json').read_text());log=[]
def fix(c,n,old,new,reason,source,lang='da'):
 x=d if lang=='da' else e;s=x['chapters'][c-1]['paragraphs'][n-1]; assert old in s,(c,n,old)
 t=s.replace(old,new); x['chapters'][c-1]['paragraphs'][n-1]=t;log.append(dict(language=lang,chapter=c,paragraph=n,before=s,after=t,reason=reason,source=source))
fix(4,24,'Efter omkring to mil','Efter omkring to millas','Distinguish Spanish millas from leguas consistently.','PG2000 I.4 dos millas')
fix(66,37,'fastelavnsnæse','maskeradenæse','Avoid imposing the Danish Fastelavn holiday on a masquerade nose.','PG2000 II.14 nariz de mascara')
fix(70,25,'Han er en galning fuld af striber, fuld af lyse øjeblikke.','Han er en galning, hvis vanvid er blandet med øjeblikke af klarsyn.','Entreverado means mixed; literal stripes are an English intermediary artefact.','PG2000 II.18 entreverado loco lleno de lucidos intervalos')
fix(79,4,'De skrydede ikke forgæves,\nde to borgmestre, hver og én.','De skrydede ikke forgæves,\nhverken den ene eller den anden borgmester.','Restore both mayors explicitly in natural unrhymed Danish.','PG2000 II.27 banner')
fix(84,40,'de trug er lige så slemme for ham som krukker med snæver hals.','de trug er en bitter slurk for ham, som at drikke af en krukke med snæver, besværlig åbning.','Make the drinking-vessel metaphor intelligible: painful mouth rims and a nasty practical joke.','https://cvc.cervantes.es/literatura/clasicos/quijote/edicion/parte2/cap32/cap32_04.htm note71')
fix(104,7,'eller dø i forsøget på at undslå sig.','eller sætte livet på spil i kampen.','Restore the duel threat without inventing an escape attempt.','PG2000 II.52 morir en la demanda; Ormsby stake his life')
fix(109,11,'sådan som de gjorde det til min tjener Tosilos’ ansigt hos ham, der kæmpede mod jer.','sådan som de gav ham, der kæmpede mod jer, min tjener Tosilos’ ansigt.','Untangle face transformation syntax, preserving who received which face.','PG2000 II.57')
src='https://cvc.cervantes.es/literatura/clasicos/quijote/edicion/parte2/cap49/cap49_03.htm note49'
fix(101,42,'uldhandleren her i byen','som har forpagtet retten til at opkræve uldafgiften her i byen','Arrendador is a tax farmer, not wool merchant.',src)
fix(101,49,'uldhandleren Pedro Perez','uldafgiftsforpagteren Pedro Perez','Keep tax-farmer identification consistent.',src)
fix(101,42,'the wool-farmer of this town','who leases the right to collect this town’s wool tax','Make historical tax farming intelligible and avoid livestock farmer interpretation.',src,'en')
fix(101,49,'Pedro Perez the wool-farmer','Pedro Perez, the wool-tax collector','Keep historical occupation clear.',src,'en')
for lang,x in [('da',d),('en',e)]: (p/f'don-quixote-modern-{lang}.json').write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
(p/'FINAL-POLISH.json').write_text(json.dumps(log,ensure_ascii=False,indent=2)+'\n')
el=json.loads((p/'ENGLISH-CHANGES.partial.json').read_text());el.extend([{k:v for k,v in q.items() if k!='language'} for q in log if q['language']=='en']);(p/'ENGLISH-CHANGES.partial.json').write_text(json.dumps(el,ensure_ascii=False,indent=2)+'\n')
print('Applied',len(log),'changes;',len(el),'English entries')
