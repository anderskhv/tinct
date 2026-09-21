import json
fixes = json.load(open('/tmp/fixes_part4.json'))
def add(chn, idx, old, new):
    fixes.append((chn, idx, old, new))

# Chapter 16
add(16,0,
  "EVANS. This is one of the best instances of discretion in a woman that I have ever looked upon.",
  "EVANS. This is one of the best instances of discretion in a 'oman that I have ever looked upon.")

add(16,7,
  "EVANS. You say he has been thrown in the rivers, and has been grievously beaten, as an old woman: it seems to me there must be such terrors in him that he should not come; it seems to me his flesh is punished, he shall have no desires.",
  "EVANS. You say he has been thrown in the rivers, and has been grievously peaten, as an old 'oman: it seems to me there must be such terrors in him that he should not come; it seems to me his flesh is punished, he shall have no desires.")

add(16,18,
  "EVANS. I will teach the children their parts; and I will be like a jackanapes also, to burn the knight with my taber.",
  "EVANS. I will teach the children their behaviours; and I will be like a jackanapes also, to burn the knight with my taber.")

add(16,24,
  "EVANS. Let us get about it: these are admirable pleasures and very honest knaveries. [Exeunt PAGE, FORD, and EVANS.]",
  "EVANS. Let us get about it: these are admirable pleasures and fery honest knaveries. [Exeunt PAGE, FORD, and EVANS.]")

# Chapter 17
add(17,39,
  "CAIUS. Vere is mine host of the Garter?",
  "CAIUS. Vere is mine host de Jarteer?")

add(17,41,
  "CAIUS. I cannot tell vat is dat: but it is tell-a me dat you make grand preparation for a duke of Germany: by my troth, dere is no duke dat the court is know to come. I tell you for good vill: farewell. [Exit.]",
  "CAIUS. I cannot tell vat is dat: but it is tell-a me dat you make grand preparation for a duke de Jamany: by my trot, dere is no duke dat the court is know to come. I tell you for good vill: farewell. [Exit.]")

# Chapter 22
add(22,0,
  "EVANS. Trip, trip, fairies; come; and remember your parts: be bold, I pray you; follow me into the pit; and when I give the watchwords, do as I bid you: come, come; trip, trip. [Exeunt.]",
  "EVANS. Trib, trib, fairies; come; and remember your parts: be pold, I pray you; follow me into the pit; and when I give the watch-'ords, do as I pid you: come, come; trib, trib. [Exeunt.]")

# Chapter 23
add(23,38,
  "EVANS. Sir John Falstaff, serve God, and leave your desires, and fairies will not pinch you.",
  "EVANS. Sir John Falstaff, serve Got, and leave your desires, and fairies will not pinse you.")

add(23,43,
  "EVANS. Cheese is not good to give butter; your belly is all butter.",
  "EVANS. Seese is not good to give putter; your pelly is all putter.")

add(23,52,
  "EVANS. And given to fornications, and to taverns, and sack, and wine, and metheglins, and to drinkings, and swearings, and starings, prittles and prattles?",
  "EVANS. And given to fornications, and to taverns, and sack, and wine, and metheglins, and to drinkings, and swearings, and starings, pribbles and prabbles?")

add(23,69,
  "CAIUS. Vere is Mistress Page? By God, I am cozened: I have married un garçon, a boy; un paysan, by God, a boy; it is not Anne Page: by God, I am cozened.",
  "CAIUS. Vere is Mistress Page? By gar, I am cozened: I ha' married un garçon, a boy; un paysan, by gar, a boy; it is not Anne Page: by gar, I am cozened.")

add(23,71,
  "CAIUS. Yes, by God, and it is a boy: by God, I'll rouse all Windsor. [Exit.]",
  "CAIUS. Yes, by gar, and it is a boy: by gar, I'll rouse all Windsor. [Exit.]")

with open('/tmp/fixes_final.json','w') as f:
    json.dump(fixes, f)
print("TOTAL fixes:", len(fixes))
