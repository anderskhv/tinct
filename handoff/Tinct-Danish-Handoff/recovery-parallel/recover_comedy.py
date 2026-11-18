import ast,json,pathlib,subprocess,copy,re
R=pathlib.Path(__file__).parent;D=R/'comedy-of-errors';D.mkdir(exist_ok=True);src={}
for k in ['original-en','modern-en','modern-da']:
 raw=subprocess.check_output(['git','-C','/Users/andershvelplund/Developer/Tinct','show',f'225979e36743d21502ebbace6c253fbc5ce09bfa:app/public/data/editions/comedy-of-errors-{k}.json']);(D/f'source-{k}.json').write_bytes(raw);src[k]=json.loads(raw)
es=json.loads((R/'literal-file-writes.json').read_text());texts={l:''.join(e['content'] for e in es if e['targetExpression']=='/tmp/ce-'+l+'.txt') for l in ['da','en']}
for a,b in [('et umanerlig fedt giftermål','et umanerligt fedt giftermål'),('På panden, rustet til oprør og i krig med hårgrænsens arving.','På panden. Frankrig har grebet til våben og fører arvekrig helt op til hårgrænsen.'),('Ja, anholdets anfører!','Ja, herre, fører for en hel flok betjente!'),('Skibet er sejlklar','Skibet er sejlklart'),('den ulyksalige flåde af træ','den ulyksalige tømmerflåde'),('I treogtredive år har jeg båret jer i fødselsveer, mine sønner.','I treogtredive år har jeg ligget i barsel med jer, mine sønner.'),('Nu skal jeg nok ud og købe mig en herregård med tusind pund om året! Næ, jeg skal købe et reb!','Jeg køber mig tusind pund om året! Jeg køber mig et reb!')]:texts['da']=texts['da'].replace(a,b)
texts['en']='\n'.join(l for l in texts['en'].splitlines() if not l.startswith('7.7 '))+'\n'
# Recover seven literal substitution lists from the original inline Python payload.
record=next(e for e in json.loads(next(R.glob('*09-29-25*.calls.json')).read_text()) if e['ordinal']==165)
raw=re.search(r'r=(\{.*?\n\})',record['input'],re.S)[1]
# JavaScript template string decoding, restricted to backslash pairs in this payload.
raw=raw.replace('\\\\','\\')
replacements=ast.literal_eval(raw)
for (k,i),ed in replacements.items():
 v=src['modern-en']['chapters'][k-1]['paragraphs'][i-1].split('. ',1)[1]
 for a,b in ed:assert a in v;v=v.replace(a,b)
 texts['en']+=f'{k}.{i} {v}\n'
labels={'DUKE':'HERTUGEN','MERCHANT':'KØBMANDEN','OFFICER':'BETJENTEN','COURTESAN':'KURTISANEN','ABBESS':'ABBEDISSEN','JAILER':'FANGEVOGTEREN','MESSENGER':'BUDET'}
for lang in ['da','en']:
 obj=copy.deepcopy(src['modern-'+lang]);changes={}
 for line in texts[lang].splitlines():
  if line:idx,txt=line.split(' ',1);changes[tuple(map(int,idx.split('.')))]=txt
 for k,ch in enumerate(obj['chapters'],1):
  if lang=='da':ch['section']=ch['section'].replace('Act ','Akt ');ch['title']=ch['title'].replace('Scene ','scene ')
  for i,old in enumerate(ch['paragraphs'],1):
   m=re.match(r'^([A-Z ]+)\.(?: |$)',old);prefix=m[1] if m else '';v=old[m.end():] if m else old
   if (k,i) in changes:v=changes.pop((k,i))
   if lang=='da':
    prefix=labels.get(prefix,prefix.replace(' OF SYRACUSE',' FRA SYRAKUS').replace(' OF EPHESUS',' FRA EFESOS'))
    for a,b in [('Pindsvinet','Hulepindsvinet'),(' af Efesos',' fra Efesos'),('en tovende','en rebende'),('en tovets','en rebets'),('Master Antipholus','Hr. Antipholus'),('Mistress Satan','fru Satan'),("Pinch's",'Pinchs'),('Signior','signor'),('signior','signor'),('stikker ud','sejler'),('Sir, ','Herre, '),('Gode sir','Gode herre'),('gode sir','gode herre')]:v=v.replace(a,b)
    v=re.sub(r'\bsir\b','herre',v);v=re.sub(r'\bJer(es)?\b',lambda m:m[0].lower(),v);v=re.sub(r'(?<=[.!?] )jer(es)?\b',lambda m:m[0].capitalize(),v);v=re.sub(r'^jer(es)?\b',lambda m:m[0].capitalize(),v)
   ch['paragraphs'][i-1]=prefix+'.'+(' '+v if v else '') if prefix else v
 assert not changes
 (D/f'modern-{lang}.json').write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
 print(lang,sum(x!=y for a,b in zip(obj['chapters'],src['modern-'+lang]['chapters']) for x,y in zip(a['paragraphs'],b['paragraphs'])))
