# Changed-passage ledger

Baseline: `main` `38a97c63`. Candidates: original-en `3521a12d5d5acd6d4ac83f53747192c5ae592f7bf5e965c9c9bff881965495a6`, modern-en `1e970b7beb3f098095ecf1a9fc7d78a8855d75e6ffc3bba14edc69db0e05374f`. The machine-readable ledger is `CHANGES.json`.

Coordinates are candidate `chapter.index`: the chapter is 1-based and the paragraph index is 0-based.

## Summary

| ID | Edition(s) | What | Where | Why |
|---|---|---|---|---|
| C-01 | original-en | Insert 9 paragraphs, verbatim Jowett | 1.0–1.8 | The dialogue's opening (PG #1600 dialogue ¶0–8, 648 words) was missing. It is the only gap between the served text and the source |
| C-02 | modern-en | Insert 9 new Modern English paragraphs | 1.0–1.8 | The same passage was missing from modern-en. It is rendered from the source and reviewed |
| C-03 | both | Chapter regroup, text unchanged | old 7.69–7.114 → 8.0–8.45; old 8.0 → 8.46 | Chapter 7 "Socrates & Diotima" contained Alcibiades's arrival, speech and aftermath, while chapter 8 "Alcibiades" held only the closing paragraph. The Alcibiades episode begins at "When Socrates had done speaking…" (dialogue ¶142), directly after Socrates's last words |
| C-04 | original-en | Chapter 5 title "Agathon & Aristophanes" → "Aristophanes's Speech" | ch 5 title | Label disagreed with modern-en and modern-da for the same aligned chapter. Agathon's speech is chapter 6. Label only and separable: see the variant hash in `hashes/build-summary.json` |
| C-05 | both | Renumber, text unchanged | old 1.0–1.39 → 1.9–1.48 | Consequence of C-01 and C-02 |
| C-06 | modern-en | Correct three existing sentences | 3.3, 3.7, 3.8 | Confirmed defects found by the whole-book review (Review 1): a garbled clause (3.3), a dropped qualification "which custom allows" (3.7), and a dropped hedge and quotation, "done his best" and 'uses base' (3.8) |

No other paragraph was changed. Every other baseline paragraph of each edition is carried byte for byte (`mapping/paragraph-map.tsv`). The three C-06 paragraphs are the only changed passages needing offset-aware migration (`mapping/changed-paragraph-ops.json`).

## C-01 and C-02: the restored opening

Speaker framing: Apollodorus is speaking to an unnamed companion. He recounts what he told Glaucon on the road two days earlier (1.0–1.7). The companion answers in 1.8. The existing text resumes at 1.9 with "APOLLODORUS: Yes, friend…". As in Jowett, 1.0 has no speaker label.

### 1.0 (dialogue ¶0)

**Jowett (original-en, verbatim)**, sha256 `91b4e9641d6803e752a9a95861f75cea5019a7acbe3d0a3fa45f487ac29e4d9a`:

> Concerning the things about which you ask to be informed I believe that I am not ill-prepared with an answer. For the day before yesterday I was coming from my own home at Phalerum to the city, and one of my acquaintance, who had caught a sight of me from behind, calling out playfully in the distance, said: Apollodorus, O thou Phalerian (Probably a play of words on (Greek), 'bald-headed.') man, halt! So I did as I was bid; and then he said, I was looking for you, Apollodorus, only just now, that I might ask you about the speeches in praise of love, which were delivered by Socrates, Alcibiades, and others, at Agathon's supper. Phoenix, the son of Philip, told another person who told me of them; his narrative was very indistinct, but he said that you knew, and I wish that you would give me an account of them. Who, if not you, should be the reporter of the words of your friend? And first tell me, he said, were you present at this meeting?

**Modern English (modern-en)**, sha256 `ef7250288c0e09b2c54534a33b9e7260f346ef7ffe733bc7e37fb71dfcadf3fd`:

> As for what you're asking about, I believe I'm well prepared to answer. In fact, the day before yesterday I was on my way into the city from my home in Phalerum when an acquaintance of mine caught sight of me from behind and called out playfully from a distance, 'Apollodorus! You there — you Phalerian! Halt!' So I did as I was told, and he said, 'Apollodorus, I was just looking for you. I wanted to ask you about the speeches in praise of love that Socrates, Alcibiades, and others gave at Agathon's supper. Someone told me what he had heard from Phoenix, the son of Philip, but his account was very vague. He did say, though, that you knew about them, so I'd like to hear them from you. Who better than you to report your friend's words? But first tell me,' he said, 'were you at that gathering yourself?'

Editorial notes: Jowett's bracketed note "(Probably a play of words on (Greek), 'bald-headed.')" is omitted, as modern-en omits all 20 other Jowett notes (compare Republic 7.257). The original-en compare text keeps it. "Phalerian", the word the jest turns on, and "playfully" are kept. "Not ill-prepared" becomes "well prepared", matching 1.7. Glaucon's words are in single quotes, following the chapter's convention. The chain of informants is ordered so that "his account" can only be the go-between's, which is Jowett's sense (Review 2, finding 5). "Hear them from you" avoids repeating "about them" (re-verification N11). "Only" was trimmed from "the day before yesterday" (Review 1, F9).

### 1.1 (dialogue ¶1)

**Jowett (original-en, verbatim)**, sha256 `fe61be31b6448ce16053c550ce6ad07b9d37b7520efeee9978de19737e645496`:

> Your informant, Glaucon, I said, must have been very indistinct indeed, if you imagine that the occasion was recent; or that I could have been of the party.

**Modern English (modern-en)**, sha256 `d408be46351e13b874b162d1607b54f9e5ac66f9afe5e36c4e9da0c6004236b6`:

> 'Glaucon,' I said, 'your informant must have been very vague indeed, if you imagine that the occasion was recent, or that I could have been one of the party.'

Editorial notes: Glaucon is named in the first words of the reply, which is his first appearance.

### 1.2 (dialogue ¶2)

**Jowett (original-en, verbatim)**, sha256 `656d25916b55a7625830cc9c302471823703b70e9adc842d0c1043c7def1dcf7`:

> Why, yes, he replied, I thought so.

**Modern English (modern-en)**, sha256 `a6812fa0e68e0845dc65619900a71cd4bcef50376f8030eba6d5d4aca36476b3`:

> 'Well, yes,' he replied, 'I did think so.'

### 1.3 (dialogue ¶3)

**Jowett (original-en, verbatim)**, sha256 `0d557a23652edd2e69e97b6f1c7945f07ff0726fbaf639c9967dc7008a0b0a58`:

> Impossible: I said. Are you ignorant that for many years Agathon has not resided at Athens; and not three have elapsed since I became acquainted with Socrates, and have made it my daily business to know all that he says and does. There was a time when I was running about the world, fancying myself to be well employed, but I was really a most wretched being, no better than you are now. I thought that I ought to do anything rather than be a philosopher.

**Modern English (modern-en)**, sha256 `17aef37dbd177b5cc661cbaa59bacbf1db3339dfb9273710f5e0bd33ecc959f4`:

> 'Impossible,' I said. 'Don't you know that Agathon hasn't lived in Athens for many years, and that it's not yet three years since I started spending time with Socrates and made it my daily business to know everything he says and does? There was a time when I ran around from one thing to another, thinking I was doing something worthwhile, but I was really a thoroughly wretched creature — no better than you are now. I thought I ought to do anything rather than be a philosopher.'

Editorial notes: "Are you ignorant that…" is recast as a question. "Not three have elapsed" becomes "not yet three years" (Review 1, F9). "Became acquainted with" becomes "started spending time with". This follows Review 2 finding 7; the wording avoids "keeping company", which could read as courting (re-verification N11). "Fancying myself to be well employed" becomes "thinking I was doing something worthwhile" (Review 2, finding 8).

### 1.4 (dialogue ¶4)

**Jowett (original-en, verbatim)**, sha256 `f8ec30e715fffd1f1e7ef1c988d2929e5d7991c8fe2d99144c8b66dca3593e6e`:

> Well, he said, jesting apart, tell me when the meeting occurred.

**Modern English (modern-en)**, sha256 `ba403254bb0493e206df4540e9a0e0060ad68a489d8662f549e47cc90060d4c2`:

> 'Well,' he said, 'joking aside, tell me when that gathering took place.'

Editorial notes: "Jesting apart" becomes "joking aside". "Meeting" is rendered "gathering" both here and in 1.0.

### 1.5 (dialogue ¶5)

**Jowett (original-en, verbatim)**, sha256 `bcde0df6266de542dcae865ef1242cbbd9aca5c7b877a0ef411a77dd5fe0faaf`:

> In our boyhood, I replied, when Agathon won the prize with his first tragedy, on the day after that on which he and his chorus offered the sacrifice of victory.

**Modern English (modern-en)**, sha256 `20666242c63eb53d28b62a5359de17007d10cd47115875fc6bf57f5921177cde`:

> 'When we were still boys,' I replied, 'at the time Agathon won the prize with his first tragedy. It was the day after he and his chorus had offered their victory sacrifice.'

Editorial notes: Split into two sentences so that "the day after … the sacrifice of victory" clearly dates the party, as in Jowett (Review 2, finding 9).

### 1.6 (dialogue ¶6)

**Jowett (original-en, verbatim)**, sha256 `f75095194a19573d57738182bf03d51a02fb1cdc69f498acf5ce08397ec382b6`:

> Then it must have been a long while ago, he said; and who told you--did Socrates?

**Modern English (modern-en)**, sha256 `24731c50eb63020c332bec143d74777269b03ba95c64c67af0a98e0ab45803bc`:

> 'Then it must have been a long time ago,' he said. 'And who told you — was it Socrates?'

Editorial notes: "Did Socrates?" becomes "was it Socrates?"

### 1.7 (dialogue ¶7)

**Jowett (original-en, verbatim)**, sha256 `33e311e2aa8fc0d1ca006f49cea43e932f6377f53a936c1591b0824df593717e`:

> No indeed, I replied, but the same person who told Phoenix;--he was a little fellow, who never wore any shoes, Aristodemus, of the deme of Cydathenaeum. He had been at Agathon's feast; and I think that in those days there was no one who was a more devoted admirer of Socrates. Moreover, I have asked Socrates about the truth of some parts of his narrative, and he confirmed them. Then, said Glaucon, let us have the tale over again; is not the road to Athens just made for conversation? And so we walked, and talked of the discourses on love; and therefore, as I said at first, I am not ill-prepared to comply with your request, and will have another rehearsal of them if you like. For to speak or to hear others speak of philosophy always gives me the greatest pleasure, to say nothing of the profit. But when I hear another strain, especially that of you rich men and traders, such conversation displeases me; and I pity you who are my companions, because you think that you are doing something when in reality you are doing nothing. And I dare say that you pity me in return, whom you regard as an unhappy creature, and very probably you are right. But I certainly know of you what you only think of me--there is the difference.

**Modern English (modern-en)**, sha256 `3e044ef2cda90619987d21664244168f272c641719f86f5ef8f27dfed89ac9fd`:

> 'No, not Socrates,' I replied. 'It was the same man who told Phoenix — Aristodemus, of the deme of Cydathenaeum, a little fellow who never wore shoes. He had been at Agathon's feast, and I think that in those days no one was a more devoted admirer of Socrates. What's more, I have asked Socrates himself whether some parts of Aristodemus's account were true, and he confirmed them.' 'Then,' said Glaucon, 'let's hear the story. Isn't the road to Athens just made for conversation?' So we walked along and talked about the speeches on love. And that is why, as I told you at the start, I'm well prepared to do what you ask; I'll go through them again for you, if you like. For speaking about philosophy, or hearing others speak about it, always gives me the greatest pleasure — to say nothing of the benefit. But when I hear any other kind of talk — especially the talk of rich men and businessmen like you — it annoys me; and I pity you, my friends, because you think you're doing something when in reality you're doing nothing. I suppose you pity me in return and think I'm miserable — and very probably you're right. But what you only think about me, I know for certain about you. That's the difference.

Editorial notes: "No indeed" becomes "No, not Socrates", and the description now follows the name (Review 2, finding 10). "Deme" is kept as Jowett's term. "His narrative" is made explicit as "Aristodemus's account" (Review 2, finding 2). Glaucon's "let us have the tale over again" becomes "let's hear the story". "Over again" is dropped because it implied Glaucon had heard the story before (Review 2, finding 11). The Greek is simply "why not tell it to me?". An interim "whole" was removed because it is not in Jowett (re-verification N5). The turn back to the companion is signalled with "as I told you at the start" and "for you" (Review 2, finding 1). The plural "you who are my companions" stays plural. The closing antithesis is kept.

### 1.8 (dialogue ¶8)

**Jowett (original-en, verbatim)**, sha256 `e58a22e2c1a9db757a032360701614c8621380ae3223780847308fb6213949d4`:

> COMPANION: I see, Apollodorus, that you are just the same--always speaking evil of yourself, and of others; and I do believe that you pity all mankind, with the exception of Socrates, yourself first of all, true in this to your old name, which, however deserved, I know not how you acquired, of Apollodorus the madman; for you are always raging against yourself and everybody but Socrates.

**Modern English (modern-en)**, sha256 `f3d9a5747c9af840948147ab23e1e1c76e0405bc8e26c88884c8aa64b2e67662`:

> COMPANION: I see you're just the same as ever, Apollodorus — always speaking ill of yourself and of others. I really do believe you pity all mankind except Socrates, starting with yourself. In this you live up to your old nickname, 'Apollodorus the madman.' I don't know how you came by it, but it suits you, for you're always raging against yourself and everybody except Socrates.

Editorial notes: The nickname sentence is split for readability. "However deserved" becomes "it suits you" (Review 2, finding 3). The text leads directly into the existing 1.9, "APOLLODORUS: Yes, friend, and the reason people say I'm crazy…".

## C-06: corrections to existing modern-en sentences

### 3.3

- **Before:** For the love between Aristogeiton and the steadfast devotion of Harmodius proved strong enough to bring down their power.
- **After:** For Aristogeiton's love and Harmodius's constancy proved strong enough to bring down their power.
- **Why:** Confirmed defect found in the whole-book review (Review 1). Garbled clause ("the love between Aristogeiton and the steadfast devotion of Harmodius"). Jowett: "the love of Aristogeiton and the constancy of Harmodius had a strength which undid their power".
- **Paragraph sha256:** `800d9f905b820ef9f7509aedbfda0f81bf0b8a8636b490f908ebaab4109a6c0c` → `524ce031834ba928b910f3cd910c01243e60e0ecb79ca3ad456ac532ad4313ab`

### 3.7

- **Before:** There remains, then, only one honorable way for the beloved to yield — the way of virtue.
- **After:** There remains, then, only one honorable way, allowed by custom, for the beloved to yield — the way of virtue.
- **Why:** Confirmed defect found in the whole-book review (Review 1). Dropped qualification. Jowett: "There remains, then, only one way of honourable attachment which custom allows in the beloved, and this is the way of virtue".
- **Paragraph sha256:** `f3cd77c227ef7c672c6845d18f7798c773ccda4863f7da335d0ba016d3a62103` → `aec0ca2a4734e5fefb90c83663673d0c2af82828011c8aa6957c86f28e218615`

### 3.8

- **Before:** because he has shown that for money's sake he would give himself up to anyone, for any base use; and that is not honorable.
- **After:** because he has done his best to show that he would give himself up to anyone's 'uses base' for the sake of money; and that is not honorable.
- **Why:** Confirmed defect found in the whole-book review (Review 1). Dropped hedge and quotation. Jowett: "for he has done his best to show that he would give himself up to any one's 'uses base' for the sake of money; but this is not honourable".
- **Paragraph sha256:** `11ab27fbcf5a9948471d9223d3432f884273c94919398ae38e4c39bae416b52e` → `0f34ee934b181dc0ca7f82568352353c1fe4dd32e954df890d80368ec570e9c3`

## C-03: chapter regroup evidence

- **Last paragraphs of the new chapter 7** (unchanged text):
  - 7.67 "Such, Phaedrus--and I speak not only to you, but to all of you--were the words of Diotima; …"
  - 7.68 "The words which I have spoken, you, Phaedrus, may call an encomium of love, or anything else which you please."
- **First paragraph of the new chapter 8** (unchanged text): 8.0 "When Socrates had done speaking, the company applauded, and Aristophanes was beginning to say something … when suddenly there was a great knocking at the door …"
- **The closing paragraph** "Agathon arose in order that he might take his place on the couch by Socrates, when suddenly a band of revellers entered …" moves from 8.0 to 8.46.

Chapter divisions are Tinct's editorial reading aids, not Plato's. The transition chosen is the conventional start of the Alcibiades episode (Stephanus 212c). No sentence or quotation straddles it in either edition.

## Checked and deliberately not changed

- **Paragraph split 8.0/8.1** (baseline 7.69/7.70). It leaves "Will you drink with me or not?'" as a short paragraph inside Alcibiades's entrance speech. It falls at a sentence end and loses no text. It is kept to avoid changing more coordinates.
- **Upstream Gutenberg typos:** all 10 slips listed in `source/SOURCE.md` (1.40, 3.5, 3.9, 4.1, 5.4, 5.16, 6.4, 6.10, 7.62, 8.29) are reproduced verbatim in original-en. Correcting them is a separate source-emendation decision.
- **Modern-en typography:** doubled quotes in 1.33 (`''I may touch you` … `sought.''`) and the `',` ending of 1.20. Also, quotation conventions differ between chapters, 7.68 and 8.1 have no opening quotation marks, the inner quotation marks around Phaedrus's complaint in 1.46 are missing, and British spellings remain ("theatre" 5.11–5.13, "marvellous" 8.5/8.26/8.31, "revellers" 8.0/8.24). These are pre-existing and cosmetic. They are left unchanged so those paragraphs keep exact offsets.
- **Modern-en nuances judged not to be defects of meaning** (Review 1 F8; re-verification N12), recorded for any later modern-English pass:
  - 3.0 drops "quite".
  - 3.1 "apt to be" becomes "equally".
  - 3.2 "But surely" for Jowett's "for surely".
  - 3.3 "loves of youths" becomes "love between males", and the "generally in countries subject to the barbarians" clause is restructured.
  - 3.4 drops "of mankind".
  - 3.5 "parents" becomes "fathers".
  - 3.6 "both lover and beloved" for "both of them".
  - 3.7 "by the loss of them" becomes "by the fear of losing them".
  - 4.1 "the poets here" for "our friends the poets here".
  - Several of these are closer to the Greek than Jowett is.
- **Modern-en closeness to Jowett in chapters 2 and 4–7.** The similarity gate fails before and after this repair. These are clear passages and were not rewritten (see `coverage/COVERAGE.md`).
- **Jowett's inline notes** stay verbatim in original-en and stay omitted in modern-en, following each edition's existing convention.
