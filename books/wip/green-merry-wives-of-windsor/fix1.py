import json, sys
sys.path.insert(0, '/home/user/tinct/books')
from content_edit_helpers import safe_replace, validate_structure, diff_report, assert_only_changed

with open('candidate.json') as f:
    candidate = json.load(f)
with open('source.json') as f:
    source = json.load(f)

before = [list(ch['paragraphs']) for ch in candidate['chapters']]

# fixes: (chapter_number, 0based_index, expected_old_full_text, new_full_text)
fixes = []

def add(chn, idx, old, new):
    fixes.append((chn, idx, old, new))

# Chapter 1
add(1,7,
  "SLENDER. I may quarter the arms, cousin.",
  "SLENDER. I may quarter the arms, cousin.")  # placeholder no-op removed later
fixes.pop()

add(1,22,
  "SHALLOW. I will attend him, fair Mistress Anne.",
  "SHALLOW. I will attend him, fair Mistress Anne.")
fixes.pop()

add(1,13,
  "SHALLOW. Not a bit.",
  "SHALLOW. Not a bit.")
fixes.pop()

# Real fixes start
add(1,13,  # index of "EVANS. Yes, by our Lady..." -> check index: [1.14] means paragraph index 14 per notation used, but that notation was 0-based already same as list index (chapter.i). Confirmed sidebyside used same index as list.
  "EVANS. Yes, by our Lady; if he takes a quarter of your coat, there is only three skirts left for yourself, by my simple reckoning. But that is all one. If Sir John Falstaff has done you wrongs, I belong to the church, and shall be glad to do my benevolence to make atonement and compromises between you.",
  "EVANS. Yes, py'r lady; if he takes a quarter of your coat, there is only three skirts left for yourself, by my simple reckoning. But that is all one. If Sir John Falstaff has done you wrongs, I am of the church, and shall be glad to do my benevolence to make atonement and compremises between you.")

add(1,16,
  "SHALLOW. Ha! Upon my life, if I were young again, the sword would settle it.",
  "SHALLOW. Ha! Upon my life, if I were young again, the sword would settle it.")
fixes.pop()

add(1,15,
  "EVANS. It is not fitting for the council to hear about a riot; there is no fear of God in a riot. The council, you see, shall desire to hear of the fear of God, and not to hear of a riot. Take that into your considerations.",
  "EVANS. It is not fitting for the council to hear about a riot; there is no fear of Got in a riot. The council, you see, shall desire to hear of the fear of Got, and not to hear of a riot. Take that into your considerations.")

add(1,17,
  "EVANS. It is better that friends are the sword, and settle it that way. And there is also another idea in my brain, which perhaps brings good discretions with it: there is Anne Page, who is daughter to Master Thomas Page, and she is pretty virginity.",
  "EVANS. It is petter that friends are the sword, and settle it that way. And there is also another idea in my prain, which perhaps prings goot discretions with it: there is Anne Page, who is daughter to Master Thomas Page, and she is pretty virginity.")

add(1,19,
  "EVANS. It is exactly that person, in all the world, just as you could wish; and seven hundred pounds of money, and gold and silver, is what her grandfather on his deathbed (God grant him a joyful resurrection!) gave her, to be received when she is able to reach seventeen years old. It would be a good idea if we set aside our quibbles and quarrels, and arrange a marriage between Master Abraham and Mistress Anne Page.",
  "EVANS. It is that fery person, in all the world, just as you could wish; and seven hundred pounds of money, and gold and silver, is what her grandfather on his deathbed (Got deliver him a joyful resurrection!) gave her, to be received when she is able to reach seventeen years old. It would be a goot idea if we leave our pribbles and prabbles, and desire a marriage between Master Abraham and Mistress Anne Page.")

add(1,22,
  "SLENDER. I know the young gentlewoman; she has good qualities.",
  "SLENDER. I know the young gentlewoman; she has good gifts.")

add(1,20,
  "EVANS. Yes, and her father will make her a better penny.",
  "EVANS. Yes, and her father will make her a petter penny.")

add(1,23,
  "EVANS. Seven hundred pounds and possibilities are good qualities.",
  "EVANS. Seven hundred pounds and possibilities is goot gifts.")

add(1,25,
  "EVANS. Shall I tell you a lie? I despise a liar as I despise one who is false, or as I despise one who is not true. The knight, Sir John, is there; and I beg you, be guided by your well-wishers. I will knock on the door for Master Page.",
  "EVANS. Shall I tell you a lie? I despise a liar as I despise one who is false, or as I despise one who is not true. The knight, Sir John, is there; and I beg you, be guided by your well-wishers. I will peat the door for Master Page.")

add(1,29,
  "EVANS. Here is God's blessing, and your friend, and Justice Shallow; and here is young Master Slender, who perhaps shall tell you another tale, if matters develop to your liking.",
  "EVANS. Here is Got's plessing, and your friend, and Justice Shallow; and here is young Master Slender, who perhaps shall tell you another tale, if matters develop to your liking.")

add(1,55,
  "EVANS. Pauca verba, Sir John; good words.",
  "EVANS. Pauca verba, Sir John; goot worts.")

add(1,64,
  "EVANS. Peace, I pray you. Now let us understand. There are three umpires in this matter, as I understand it: that is, Master Page, videlicet Master Page; and there is myself, videlicet myself; and the third party is, lastly and finally, mine host of the Garter.",
  "EVANS. Peace, I pray you. Now let us understand. There are three umpires in this matter, as I understand it: that is, Master Page, fidelicet Master Page; and there is myself, fidelicet myself; and the three party is, lastly and finally, mine host of the Garter.")

add(1,66,
  "EVANS. Very good: I will make a brief of it in my notebook; and we will afterwards work upon the case with as great discretion as we can.",
  "EVANS. Fery goot: I will make a prief of it in my notebook; and we will afterwards ork upon the case with as great discreetly as we can.")

add(1,69,
  "EVANS. The devil and his dam! What sort of phrase is this, 'He hears with ear'? Why, it is affectation.",
  "EVANS. The tevil and his tam! What sort of phrase is this, 'He hears with ear'? Why, it is affectations.")

add(1,83,
  "EVANS. So God judge me, that is a virtuous mind.",
  "EVANS. So Got udge me, that is a virtuous mind.")

add(1,100,
  "EVANS. Pay attention to his propositions, Master Slender: I will describe the matter to you, if you have the capacity for it.",
  "EVANS. Pay attention to his propositions, Master Slender: I will description the matter to you, if you have capacity of it.")

add(1,106,
  "EVANS. But can you have affection for the woman? Let us be allowed to know that from your mouth or from your lips; for various philosophers hold that the lips are part of the mouth. Therefore, precisely, can you direct your good will toward the maid?",
  "EVANS. But can you affection the 'oman? Let us be allowed to know that from your mouth or from your lips; for various philosophers hold that the lips is parcel of the mouth. Therefore, precisely, can you direct your good will toward the maid?")

add(1,109,
  "EVANS. No, by God's lords and his ladies! You must speak positively, if you can carry your desires toward her.",
  "EVANS. No, by Got's lords and his ladies! You must speak possitable, if you can carry your desires toward her.")

add(1,114,
  "EVANS. It is a very discreet answer; except that the fault is in the word 'dissolutely': the word, according to our meaning, is 'resolutely': his meaning is good.",
  "EVANS. It is a fery discretion answer; except that the fault is in the ort 'dissolutely': the ort, according to our meaning, is 'resolutely': his meaning is good.")

add(1,122,
  "EVANS. By God's blessed will! I will not be absent at the grace. [Exeunt Shallow and Evans.]",
  "EVANS. Od's plessed will! I will not be absence at the grace. [Exeunt Shallow and Evans.]")

add(1,133,
  "SLENDER. How is your fallow greyhound, sir? I heard he was outrun on the Cotswolds.",
  "SLENDER. How is your fallow greyhound, sir? I heard he was outrun on Cotsall.")

# Chapter 2
add(2,3,
  "EVANS. No, it gets better still. Give her this letter; for she is a woman who is altogether acquainted with Mistress Anne Page: and the letter is to ask and request her to plead your master's wishes to Mistress Anne Page. I pray you, be off: I will finish my dinner; there are pippins and cheese still to come. [Exeunt.]",
  "EVANS. No, it gets petter yet. Give her this letter; for she is a 'oman who is altogether acquainted with Mistress Anne Page: and the letter is to ask and request her to plead your master's wishes to Mistress Anne Page. I pray you, be off: I will finish my dinner; there are pippins and cheese still to come. [Exeunt.]")

with open('/tmp/fixes_part1.json','w') as f:
    json.dump(fixes, f)
print("part1 count:", len(fixes))
