# Changed-passage ledger

Baseline: `main` `38a97c63`. Candidates: original-en `3521a12d5d5acd6d4ac83f53747192c5ae592f7bf5e965c9c9bff881965495a6`, modern-en `43f03333a255d90378a12ab1d1d384620e515e1725cb4ba8132e794fa504e550`. The machine-readable ledger is `CHANGES.json`.

Coordinates are candidate `chapter.index`: the chapter is 1-based and the paragraph index is 0-based.

## Summary

| ID | Edition(s) | What | Where | Why |
|---|---|---|---|---|
| C-01 | original-en | Insert 9 paragraphs, verbatim Jowett | 1.0–1.8 | The dialogue's opening (PG #1600 dialogue ¶0–8, 648 words) was missing. It is the only gap between the served text and the source |
| C-02 | modern-en | Insert 9 new Modern English paragraphs | 1.0–1.8 | The same passage was missing from modern-en. It is rendered from the source and reviewed |
| C-03 | both | Chapter regroup, text unchanged | old 7.69–7.114 → 8.0–8.45; old 8.0 → 8.46 | Chapter 7 "Socrates & Diotima" contained Alcibiades's arrival, speech and aftermath, while chapter 8 "Alcibiades" held only the closing paragraph. The Alcibiades episode begins at "When Socrates had done speaking…" (dialogue ¶142), directly after Socrates's last words |
| C-04 | original-en | Chapter 5 title "Agathon & Aristophanes" → "Aristophanes's Speech" | ch 5 title | Label disagreed with modern-en and modern-da for the same aligned chapter. Agathon's speech is chapter 6. Label only and separable: see the variant hash in `hashes/build-summary.json` |
| C-05 | both | Renumber, text unchanged | old 1.0–1.39 → 1.9–1.48 | Consequence of C-01 and C-02 |

No other paragraph was changed. All 217 baseline paragraphs of each edition are carried byte for byte (`mapping/paragraph-map.tsv`).

## C-01 and C-02: the restored opening

Speaker framing: Apollodorus is speaking to an unnamed companion. He recounts what he told Glaucon on the road two days earlier (1.0–1.7). The companion answers in 1.8. The existing text resumes at 1.9 with "APOLLODORUS: Yes, friend…". As in Jowett, 1.0 has no speaker label.

### 1.0 (dialogue ¶0)

**Jowett (original-en, verbatim)**, sha256 `91b4e9641d6803e752a9a95861f75cea5019a7acbe3d0a3fa45f487ac29e4d9a`:

> Concerning the things about which you ask to be informed I believe that I am not ill-prepared with an answer. For the day before yesterday I was coming from my own home at Phalerum to the city, and one of my acquaintance, who had caught a sight of me from behind, calling out playfully in the distance, said: Apollodorus, O thou Phalerian (Probably a play of words on (Greek), 'bald-headed.') man, halt! So I did as I was bid; and then he said, I was looking for you, Apollodorus, only just now, that I might ask you about the speeches in praise of love, which were delivered by Socrates, Alcibiades, and others, at Agathon's supper. Phoenix, the son of Philip, told another person who told me of them; his narrative was very indistinct, but he said that you knew, and I wish that you would give me an account of them. Who, if not you, should be the reporter of the words of your friend? And first tell me, he said, were you present at this meeting?

**Modern English (modern-en)**, sha256 `ab383055a73a3235b5f38aaf58fb092152e8eacc4d20df142c645dc3625c90da`:

> As for what you're asking about, I believe I'm well prepared to answer. In fact, only the day before yesterday I was on my way into the city from my home in Phalerum when an acquaintance of mine caught sight of me from behind and called out playfully from a distance, 'Apollodorus! You there — you Phalerian! Halt!' So I did as I was told, and he said, 'Apollodorus, I was looking for you only just now. I wanted to ask you about the speeches in praise of love that Socrates, Alcibiades, and others gave at Agathon's supper. Phoenix, the son of Philip, described them to someone, who then told me; but his account was very vague. He did say that you knew, though, so I'd like you to give me an account of them. Who better than you to report your friend's words? But first tell me,' he said, 'were you at that gathering yourself?'

Editorial notes: Jowett's bracketed note "(Probably a play of words on (Greek), 'bald-headed.')" is omitted, as modern-en omits all 20 other Jowett notes (compare Republic 7.257). The original-en compare text keeps it. "Phalerian", the word the jest turns on, and "playfully" are both kept. "Not ill-prepared" becomes "well prepared", matching 1.7. Glaucon's words are in single quotes, following the chapter's convention for reported speech. "Supper" is kept, as in the surrounding modern text. The ambiguous "his account" (the intermediary's) mirrors Jowett.

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

**Modern English (modern-en)**, sha256 `7c74abc689842a9fa0ab6eb09cf78f219c4c24eadb30c436223740325580b8e7`:

> 'Impossible,' I said. 'Don't you know that Agathon hasn't lived in Athens for many years, and that it's not even three years since I got to know Socrates and made it my daily business to know everything he says and does? There was a time when I ran around from one thing to another, thinking I was well occupied, but I was really a thoroughly wretched creature — no better than you are now. I thought I ought to do anything rather than be a philosopher.'

Editorial notes: "Are you ignorant that…" is recast as a question. "Not three have elapsed" becomes "it's not even three years".

### 1.4 (dialogue ¶4)

**Jowett (original-en, verbatim)**, sha256 `f8ec30e715fffd1f1e7ef1c988d2929e5d7991c8fe2d99144c8b66dca3593e6e`:

> Well, he said, jesting apart, tell me when the meeting occurred.

**Modern English (modern-en)**, sha256 `ba403254bb0493e206df4540e9a0e0060ad68a489d8662f549e47cc90060d4c2`:

> 'Well,' he said, 'joking aside, tell me when that gathering took place.'

Editorial notes: "Jesting apart" becomes "joking aside". "Meeting" is rendered "gathering" both here and in 1.0.

### 1.5 (dialogue ¶5)

**Jowett (original-en, verbatim)**, sha256 `bcde0df6266de542dcae865ef1242cbbd9aca5c7b877a0ef411a77dd5fe0faaf`:

> In our boyhood, I replied, when Agathon won the prize with his first tragedy, on the day after that on which he and his chorus offered the sacrifice of victory.

**Modern English (modern-en)**, sha256 `24f4a89d91b5bee31448c41e64dc6dbcf79d65d974ad962ed4efb2fbd3bade81`:

> 'When we were still boys,' I replied, 'when Agathon won the prize with his first tragedy — the day after he and his chorus had offered their victory sacrifice.'

Editorial notes: The time relation is preserved: the party took place the day after the victory sacrifice.

### 1.6 (dialogue ¶6)

**Jowett (original-en, verbatim)**, sha256 `f75095194a19573d57738182bf03d51a02fb1cdc69f498acf5ce08397ec382b6`:

> Then it must have been a long while ago, he said; and who told you--did Socrates?

**Modern English (modern-en)**, sha256 `24731c50eb63020c332bec143d74777269b03ba95c64c67af0a98e0ab45803bc`:

> 'Then it must have been a long time ago,' he said. 'And who told you — was it Socrates?'

Editorial notes: "Did Socrates?" becomes "was it Socrates?"

### 1.7 (dialogue ¶7)

**Jowett (original-en, verbatim)**, sha256 `33e311e2aa8fc0d1ca006f49cea43e932f6377f53a936c1591b0824df593717e`:

> No indeed, I replied, but the same person who told Phoenix;--he was a little fellow, who never wore any shoes, Aristodemus, of the deme of Cydathenaeum. He had been at Agathon's feast; and I think that in those days there was no one who was a more devoted admirer of Socrates. Moreover, I have asked Socrates about the truth of some parts of his narrative, and he confirmed them. Then, said Glaucon, let us have the tale over again; is not the road to Athens just made for conversation? And so we walked, and talked of the discourses on love; and therefore, as I said at first, I am not ill-prepared to comply with your request, and will have another rehearsal of them if you like. For to speak or to hear others speak of philosophy always gives me the greatest pleasure, to say nothing of the profit. But when I hear another strain, especially that of you rich men and traders, such conversation displeases me; and I pity you who are my companions, because you think that you are doing something when in reality you are doing nothing. And I dare say that you pity me in return, whom you regard as an unhappy creature, and very probably you are right. But I certainly know of you what you only think of me--there is the difference.

**Modern English (modern-en)**, sha256 `a91a5fdce3d590e8daa28ea0e753f0e9019b39edd7b660b2fb241ebcf253aa4b`:

> 'No indeed,' I replied, 'but the same man who told Phoenix — a little fellow who never wore shoes, Aristodemus, of the deme of Cydathenaeum. He had been at Agathon's feast, and I think that in those days no one was a more devoted admirer of Socrates. What's more, I have asked Socrates about the truth of some parts of his account, and he confirmed them.' 'Then,' said Glaucon, 'let's have the whole story again. Isn't the road to Athens just made for conversation?' So we walked along and talked about the speeches on love. That is why, as I said at the start, I'm well prepared to do what you ask, and I'll go through them again if you like. For speaking about philosophy, or hearing others speak about it, always gives me the greatest pleasure — to say nothing of the benefit. But when I hear any other kind of talk, especially the talk of you rich men and businessmen, it annoys me; and I pity you, my friends, because you think you're doing something when in reality you're doing nothing. I dare say you pity me in return, and think me an unhappy creature — and very probably you're right. But what you only think about me, I know for certain about you. That's the difference.

Editorial notes: "Deme" is kept as Jowett's term for the Athenian district. "Traders" becomes "businessmen" and "displeases me" becomes "annoys me". The plural address "you who are my companions" becomes "my friends". The closing antithesis is kept: "what you only think about me, I know for certain about you".

### 1.8 (dialogue ¶8)

**Jowett (original-en, verbatim)**, sha256 `e58a22e2c1a9db757a032360701614c8621380ae3223780847308fb6213949d4`:

> COMPANION: I see, Apollodorus, that you are just the same--always speaking evil of yourself, and of others; and I do believe that you pity all mankind, with the exception of Socrates, yourself first of all, true in this to your old name, which, however deserved, I know not how you acquired, of Apollodorus the madman; for you are always raging against yourself and everybody but Socrates.

**Modern English (modern-en)**, sha256 `3365abdee8fd00b744d48ba4e266b0d0fea2b3009a317097229090d05b833b26`:

> COMPANION: I see you're just the same as ever, Apollodorus — always speaking ill of yourself and of others. I really do believe you pity all mankind except Socrates, starting with yourself. In this you live up to your old nickname, 'Apollodorus the madman' — though I don't know how you came by it, deserved as it is — for you're always raging against yourself and everybody except Socrates.

Editorial notes: The nickname "Apollodorus the madman" is quoted. "Which, however deserved, I know not how you acquired" becomes "though I don't know how you came by it, deserved as it is". The text leads directly into the existing 1.9, "APOLLODORUS: Yes, friend, and the reason people say I'm crazy…".

## C-03: chapter regroup evidence

- **Last paragraphs of the new chapter 7** (unchanged text):
  - 7.67 "Such, Phaedrus--and I speak not only to you, but to all of you--were the words of Diotima; …"
  - 7.68 "The words which I have spoken, you, Phaedrus, may call an encomium of love, or anything else which you please."
- **First paragraph of the new chapter 8** (unchanged text): 8.0 "When Socrates had done speaking, the company applauded, and Aristophanes was beginning to say something … when suddenly there was a great knocking at the door …"
- **The closing paragraph** "Agathon arose in order that he might take his place on the couch by Socrates, when suddenly a band of revellers entered …" moves from 8.0 to 8.46.

Chapter divisions are Tinct's editorial reading aids, not Plato's. The transition chosen is the conventional start of the Alcibiades episode (Stephanus 212c). No sentence or quotation straddles it in either edition.

## Checked and deliberately not changed

- **Paragraph split 8.0/8.1** (baseline 7.69/7.70). It leaves "Will you drink with me or not?'" as a short paragraph inside Alcibiades's entrance speech. It falls at a sentence end and loses no text. It is kept to avoid changing more coordinates.
- **Upstream Gutenberg typos** reproduced in original-en: "saying: not answer him" (5.16), "Sthenoaoea" (6.4), "Hyppolytus" (6.10), "godess" (3.9). Correcting them is a separate source-emendation decision.
- **Modern-en typography:** doubled quotes in 1.33 (`''I may touch you` … `sought.''`) and the `',` ending of 1.20. Also, quotation conventions differ between chapters. These are pre-existing and cosmetic. They are left unchanged so every old paragraph keeps exact offsets.
- **Modern-en closeness to Jowett in chapters 2 and 4–7.** The similarity gate fails before and after this repair. These are clear passages and were not rewritten (see `coverage/COVERAGE.md`).
- **Jowett's inline notes** stay verbatim in original-en and stay omitted in modern-en, following each edition's existing convention.
