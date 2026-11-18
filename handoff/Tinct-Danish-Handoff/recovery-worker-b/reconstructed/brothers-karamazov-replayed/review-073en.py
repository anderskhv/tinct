import pathlib,json
p=pathlib.Path(__file__).parent;f=p/'candidate-brothers-karamazov-modern-en.json';d=json.loads(f.read_text());r=json.loads((p/'ENGLISH-REPAIRS.json').read_text());c=d['chapters'][72]
def fix(n,a,b):
 t=c['paragraphs'][n-1];assert a in t,(n,a);c['paragraphs'][n-1]=t.replace(a,b);r.append(dict(chapter=73,paragraph=n,before=a,after=b,reason='Russian XI IV page74: clear source divergences, restored omitted sentence and full poem, deliberate mispronunciation and mixed-language mock Latin.'))
changes={2:[('Mihail Mihailovitch','Mihail Makarovitch'),('as the captain called them','as Rakitin called them'),('usually about sacred subjects','usually about “wisdom”')],
3:[('fur-trimmed overcoat','overcoat with its fur collar')],
9:[('Great friends with Rakitin?','Great friends with Mihail?'),('it’s all over with me now','my head is done for now')],
12:[('when I said it was all over with me.','when I said my head was done for. It isn’t my head that’s done for, but what was inside it.')],
14:[('Ethics! What is ethics?','Ethicses! What is ethicses?')],
15:[('Ethics?','Ethicses?')],
18:[('Damn ethics','Damn ethicses')],
24:[('_De ideabus non est disputandum_.','_De thoughtibus non est disputandum_—there’s no disputing thoughts.')],
38:[('buy a house in Petersburg','buy a stone house in Petersburg'),('preach enlightenment even in that','slip civic concern even into a comic little poem')],
50:[('A new man has risen up in me.','A new man has risen from the dead in me.'),('Because we’re all responsible for all.','Because we’re all guilty for all.'),('That was a sign to me','That was a prophecy to me'),('Rakitin’s laughing!','Rakitin’s lying!'),('we’ll shelter Him underground','we’ll meet Him underground'),('A man can’t exist in prison without God; it’s even more impossible than outside prison.','A convict can’t exist without God; it’s even more impossible for him than for someone who isn’t a convict.'),('a glorious hymn','a tragic hymn')],
52:[('“Yes, life is full.','“No, life is full.'),('Stretched on the rack—I exist! Though I sit alone on top of a pillar—I exist!','Writhing under torture—I exist! I sit inside a tower, but I too exist!'),('my angel','my cherub')],
54:[('It’s God who worries me. Nothing else worries me but that.','It’s God who torments me. That’s the only thing tormenting me.'),('going to be good without God','going to be virtuous without God'),('the price of meat','the price of beef'),('if it suited you','if you got the chance'),('what is goodness','what is virtue'),('Goodness is one thing','Virtue is one thing')],
58:[('I haven’t told you anything about Ivan','I’ve told you almost nothing about Ivan'),('something tremendous between us','something terrible at stake here')],
60:[('soft, city-bred rogue','smooth rogue from the capital'),('the facts against me','the witness statements against me'),('that four thousand','that four thousand five hundred')],
67:[('a fierce heart','a hard heart'),('such fierce hearts','such hard hearts')],
71:[('my angel','my cherub'),('a way of salvation','a path of purification'),('with the good will','with good inclinations')],
76:[('At first he didn’t come to see me.','He hadn’t come to see me for a long time.'),('He’s just fixed on it.','He wants it so much he’s almost hysterical.')],
91:[('Everything seemed to heave and sway before Alyosha','Alyosha seemed to sway with his whole body')]
}
for n,items in changes.items():
 for a,b in items:fix(n,a,b)
poems={39:'What a little foot it is,\nJust a little swollen!\nDoctors come to cure it,\nBandaging and maiming.',40:'It is not for feet I yearn—\nLet Pushkin sing their praise:\nIt is for the little head\nThat cannot grasp ideas.',41:'It had begun to grasp a little,\nBut then the foot got in the way!\nLet the little foot get well,\nSo the little head can understand.'}
for n,s in poems.items():fix(n,c['paragraphs'][n-1],s)
f.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');(p/'ENGLISH-REPAIRS.json').write_text(json.dumps(r,ensure_ascii=False,indent=2)+'\n')
print('Saved English73',len(r))
