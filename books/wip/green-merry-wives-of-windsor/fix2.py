import json

fixes = json.load(open('/tmp/fixes_part1.json'))

def add(chn, idx, old, new):
    fixes.append((chn, idx, old, new))

# Chapter 3
add(3,18,
  "FALSTAFF. There's no remedy for it; I must catch dupes; I must scheme.",
  "FALSTAFF. There is no remedy for it; I must cony-catch; I must shift.")

# Chapter 4 (Caius)
add(4,20,
  "CAIUS. What is you sing? I do not like dese toys. Please, go and fetch me in my closet un boitier vert — a box, a green-a box: do you understand what I speak? A green-a box.",
  "CAIUS. Vat is you sing? I do not like des toys. Please, go and vetch me in my closet un boitier vert — a box, a green-a box: do intend vat I speak? A green-a box.")

add(4,22,
  "CAIUS. Fie, fie, fie, fie! Upon my faith, it is very hot. I am going to the court — on a great matter.",
  "CAIUS. Fie, fie, fie, fie! Ma foi, il fait fort chaud. Je m'en vais à la cour — la grande affaire.")

add(4,24,
  "CAIUS. Yes; put it in my pocket: hurry, quickly. Where is dat knave Rugby?",
  "CAIUS. Oui; mette le au mon pocket: dépêche, quickly. Vere is dat knave Rugby?")

add(4,27,
  "CAIUS. You are John Rugby, and you are Jack Rugby. Come, take your rapier, and come at my heels to the court.",
  "CAIUS. You are John Rugby, and you are Jack Rugby. Come, take-a your rapier, and come after my heel to the court.")

add(4,29,
  "CAIUS. By my troth, I tarry too long. — Goodness me! What did I forget! There are some herbs in my closet that I would not for the world leave behind.",
  "CAIUS. By my trot, I tarry too long. — Od's me! Qu'ai-j'oublié! Dere is some simples in my closet, dat I vill not for the varld I shall leave behind.")

add(4,31,
  "CAIUS. Oh devil, devil! What is in my closet? Villain! Thief! [Pulling SIMPLE out.] Rugby, my rapier!",
  "CAIUS. O diable, diable! Vat is in my closet? Villain! Larron! [Pulling SIMPLE out.] Rugby, my rapier!")

add(4,33,
  "CAIUS. Why should I be calm?",
  "CAIUS. Wherefore shall I be content-a?")

add(4,35,
  "CAIUS. What shall an honest man do in my closet? There is no honest man dat shall come in my closet.",
  "CAIUS. What shall de honest man do in my closet? Dere is no honest man dat shall come in my closet.")

add(4,37,
  "CAIUS. Well.",
  "CAIUS. Vell.")

add(4,40,
  "CAIUS. Hush your own tongue. Speak your tale.",
  "CAIUS. Peace-a your tongue. Speak-a your tale.")

add(4,43,
  "CAIUS. Sir Hugh sent you? Rugby, bring me some paper. Wait a little while. [Writes.]",
  "CAIUS. Sir Hugh send-a you? Rugby, baille me some paper. Tarry you a little-a while. [Writes.]")

add(4,47,
  "CAIUS. You jackanapes, give this letter to Sir Hugh; by God, it is a challenge: I will cut his throat in the park; and I will teach a scurvy jackanapes priest to meddle and intrude. You may be gone; it is not good that you tarry here. — By God, I will cut off both his stones; by God, he shall not have a stone to throw at his dog. [Exit SIMPLE.]",
  "CAIUS. You jack'nape, give-a this letter to Sir Hugh; by gar, it is a shallenge: I will cut his troat in de park; and I will teach a scurvy jack-a-nape priest to meddle and intrude. You may be gone; it is not good that you tarry here. — By gar, I will cut off both his stones; by gar, he shall not have a stone to throw at his dog. [Exit SIMPLE.]")

add(4,49,
  "CAIUS. It is no matter for that: — did you not tell me that I shall have Anne Page for myself? — By God, I will kill the Jack priest; and I have appointed mine host of the Garter to measure our weapons: — By God, I will have Anne Page myself.",
  "CAIUS. It is no matter-a ver dat: — do not you tell-a me dat I shall have Anne Page for myself? — By gar, I vill kill de Jack priest; and I have appointed mine host of de Jarteer to measure our weapon: — By gar, I will myself have Anne Page.")

add(4,51,
  "CAIUS. Rugby, come to the court with me. By God, if I do not have Anne Page, I shall turn your head out of my door. Follow my heels, Rugby. [Exeunt CAIUS and RUGBY.]",
  "CAIUS. Rugby, come to the court with me. By gar, if I have not Anne Page, I shall turn your head out of my door. Follow my heels, Rugby. [Exeunt CAIUS and RUGBY.]")

# Chapter 6 - minor doublet restore
add(6,81,
  "FALSTAFF. Want no Mistress Ford, Master Brook; you shall want none. I shall be with her, I may tell you, by her own appointment; even as you came in to me, her go-between parted from me: I say I shall be with her between ten and eleven; for at that time the jealous rascally knave her husband will be out. Come to me tonight; you shall know how I succeed.",
  "FALSTAFF. Want no Mistress Ford, Master Brook; you shall want none. I shall be with her, I may tell you, by her own appointment; even as you came in to me, her assistant, or go-between, parted from me: I say I shall be with her between ten and eleven; for at that time the jealous rascally knave her husband will be out. Come to me tonight; you shall know how I succeed.")

add(6,32,
  "QUICKLY. Why, you say well. But I have another message for your worship. Mistress Page sends her hearty commendations to you, too: and let me tell you in your ear, she's as virtuous a civil modest wife — and one, I tell you, who will not miss morning or evening prayer — as any woman in Windsor, whoever the other may be: and she bade me tell your worship that her husband is seldom away from home; but, she hopes, the time will come. I never knew a woman so dote upon a man: surely, I think you have charms; yes, in truth.",
  "QUICKLY. Why, you say well. But I have another message for your worship. Mistress Page sends her hearty commendations to you, too: and let me tell you in your ear, she's as fartuous a civil modest wife — and one, I tell you, who will not miss morning or evening prayer — as any woman in Windsor, whoever the other may be: and she bade me tell your worship that her husband is seldom away from home; but, she hopes, the time will come. I never knew a woman so dote upon a man: surely, I think you have charms; yes, in truth.")

add(6,30,
  "QUICKLY. Yes, indeed; and then you may come and see the picture, she says, that you know about: Master Ford, her husband, will be away from home. Alas, the sweet woman leads an ill life with him! He's a very jealous man: she leads a very vexed life with him, good heart.",
  "QUICKLY. Yes, indeed; and then you may come and see the picture, she says, that you know about: Master Ford, her husband, will be away from home. Alas, the sweet woman leads an ill life with him! He's a very jealous man: she leads a very frampold life with him, good heart.")

with open('/tmp/fixes_part2.json','w') as f:
    json.dump(fixes, f)
print("total after part2:", len(fixes))
