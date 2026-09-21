import json
fixes = json.load(open('/tmp/fixes_part3.json'))
def add(chn, idx, old, new):
    fixes.append((chn, idx, old, new))

# Chapter 9
add(9,25,
  "CAIUS. Yes, by God; and the maid is love-a me: my nurse-a Quickly tell me so mush.",
  "CAIUS. Yes, be-gar; and de maid is love-a me: my nursh-a Quickly tell me so mush.")

# Chapter 10
add(10,72,
  "EVANS. This is very fantastical humours and jealousies.",
  "EVANS. This is fery fantastical humours and jealousies.")

add(10,73,
  "CAIUS. By God, it is not the fashion of France; one is not jealous in France.",
  "CAIUS. By gar, 'tis no the fashion of France; it is not jealous in France.")

add(10,93,
  "EVANS. If there be any body in the house, and in the chambers, and in the coffers, and in the presses, heaven forgive my sins at the day of judgement!",
  "EVANS. If there be any pody in the house, and in the chambers, and in the coffers, and in the presses, heaven forgive my sins at the day of judgement!")

add(10,94,
  "CAIUS. By God, nor I either: there are no bodies.",
  "CAIUS. By gar, nor I too: there is no bodies.")

add(10,97,
  "EVANS. You suffer for a bad conscience: your wife is as honest a woman as I would desire among five thousand, and five hundred too.",
  "EVANS. You suffer for a pad conscience: your wife is as honest a 'omans as I will desires among five thousand, and five hundred too.")

add(10,98,
  "CAIUS. By God, I see she is an honest woman.",
  "CAIUS. By gar, I see 'tis an honest woman.")

add(10,103,
  "CAIUS. If there be one or two, I shall make-a the third.",
  "CAIUS. If dere be one or two, I shall make-a the turd.")

add(10,106,
  "CAIUS. That is good; by God, with all my heart!",
  "CAIUS. Dat is good; by gar, with all my heart!")

# Chapter 13
add(13,16,
  "EVANS. You are a very simple woman: I pray you, hush. — What is 'lapis,' William?",
  "EVANS. You are a very simplicity 'oman: I pray you, hush. — What is 'lapis,' William?")

add(13,20,
  "EVANS. No, it is 'lapis:' I pray you, remember in your brain.",
  "EVANS. No, it is 'lapis:' I pray you, remember in your prain.")

add(13,28,
  "EVANS. Leave your prattling, woman. — What is the focative case, William?",
  "EVANS. Leave your prabbles, 'oman. — What is the focative case, William?")

add(13,32,
  "EVANS. Woman, forbear.",
  "EVANS. 'Oman, forbear.")

add(13,39,
  "EVANS. For shame, woman.",
  "EVANS. For shame, 'oman.")

add(13,41,
  "EVANS. Woman, are you lunatic? Have you no understanding of your cases, and the numbers of the genders? You are as foolish a Christian creature as I would desire.",
  "EVANS. 'Oman, are you lunaties? Have you no understandings for your cases, and the numbers of the genders? You are as foolish Christian creatures as I would desires.")

add(13,45,
  "EVANS. It is qui, quae, quod: if you forget your 'quies,' your 'quaes,' and your 'quods,' you must be flogged. Go your ways, and play; go.",
  "EVANS. It is qui, quae, quod: if you forget your 'quies,' your 'quaes,' and your 'quods,' you must be preeches. Go your ways, and play; go.")

add(13,47,
  "EVANS. He has a good lively memory. Farewell, Mistress Page.",
  "EVANS. He is a good sprag memory. Farewell, Mistress Page.")

# Chapter 14
add(14,86,
  "EVANS. By yea and no, I think the woman is a witch indeed: I do not like it when a woman has a great beard; I spy a great beard under her muffler.",
  "EVANS. By yea and no, I think the 'oman is a witch indeed: I do not like it when a 'oman has a great peard; I spy a great peard under his muffler.")

add(14,81,
  "FORD. I'll prat her. [Beating him] Out of my door, you witch, you hag, you baggage, you polecat, you nasty creature! Out, out! I'll conjure you, I'll fortune-tell you.",
  "FORD. I'll prat her. [Beating him] Out of my door, you witch, you hag, you baggage, you polecat, you ronyon! Out, out! I'll conjure you, I'll fortune-tell you.")

with open('/tmp/fixes_part4.json','w') as f:
    json.dump(fixes, f)
print("total after part4:", len(fixes))
