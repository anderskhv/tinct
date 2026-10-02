# Wuthering Heights modern-en: editorial fixes
Applied on branch `integration/editorial-fixes-wh` per the independent editorial review. Coordinates are `chapter:paragraph`, 1-based, located by matching the quoted text. Apostrophes use curly forms (N1) in the lists below.

## S1 (3:28 Earnshaw/Linton)
- **3:28**
  - before: I had read _Earnshaw_ twenty times for every Linton
  - after: I had read _Earnshaw_ twenty times in place of Linton

## S3 (22:23 Slough of Despond)
- **22:23**
  - before: slough of despair
  - after: Slough of Despond

## S4 Yorkshire dialect
- **2:8**
  - before: “Not me! I’ll have no hand in it,” the head muttered, and disappeared.
  - after: “Not me! I’ll have nowt to do wi’ it,” muttered the head, vanishing.
- **2:6**
  - before: “There’s nobbut t’ missis; and she won’t open it, though ye make that frightful din till night.”
  - after: “There’s nobbut t’ missis; and she’ll not open it, an ye make yer frightful din till night.”
- **9:110**
  - before: “Nay, nay, he’s not at Gimmerton,” Joseph said. “I wouldn’t wonder if he’s at t’ bottom of a bog hole. This visitation wasn’t for nowt, and I’d have ye watch out, Miss—ye may be next. Thank Heaven for everything! All things work together for good to them that’s chosen and picked out from t’ rubbish! Ye know what Scripture says.”
  - after: “Nay, nay, he’s noan at Gimmerton,” Joseph said. “I’d not wonder but he’s at t’ bottom of a bog-hole. This visitation wasn’t for nowt, and I’d have ye look out, Miss—ye may be next. Thank Heaven for all! All warks together for good to them as is chosen, and picked out fro’ t’ rubbish! Ye know what t’ Scripture says.”
- **23:3**
  - before: Ye can go back where ye came from.
  - after: Ye may go back whear ye came fro’.
- **32:1**
  - before: “That’s from Gimmerton,” he remarked. “They’re always three weeks behind other folk with their harvest.”
  - after: “That’s from Gimmerton, that is!” he remarked. “They’re allus three weeks behind other folk wi’ their harvest.”
- **30:1**
  - before: “busy” and the master was out
  - after: “thrang” (busy) and the master was out
- **34:71**
  - before: “Heathcliff and a woman are over there, under t’ crag,” he sobbed. “I daren’t go past them.”
  - after: “There’s Heathcliff and a woman yonder, under t’ crag,” he sobbed, “an’ I darnut pass ’em.”

## S5 pronoun consistency
- **5:6**
  - before: Why can’t thou always
  - after: Why canst thou not always
- **9:104**
  - before: you’ll see, every one of ye!
  - after: ye’ll see, all on ye!
- **13:46**
  - before: thou won’t be eating thy porridge tonight. It’ll be nowt but lumps as big as my fist.
  - after: thou’ll not be eating thy porridge tonight. It’ll be nowt but lumps as big as my fist.
- **13:46**
  - before: It’s a mercy ye haven’t knocked t’ bottom out!
  - after: It’s a mercy t’ bottom isn’t knocked out!
- **13:63**
  - before: in thy terrible rages
  - after: in yer terrible rages
- **13:63**
  - before: catch thee at those tricks
  - after: catch ye at those tricks
- **32:23**
  - before: than listen to thee at all!
  - after: than listen to ye at all!
- **32:23**
  - before: without thee starting up
  - after: without ye starting up
- **32:23**
  - before: Oh, thou’s a right good-for-nowt
  - after: Oh! Ye’re a right good-for-nowt

## N2/N3/N5/N6/N7
- **3:19**
  - before: This is particularly understandable given the common report that his flock
  - after: This is especially so as it is commonly reported that his flock
- **34:62**
  - before: Heathcliff told us to go to hell.
  - after: Heathcliff told us to be damned.
- **9:91**
  - before: like the leaves in the woods
  - after: like the foliage in the woods
- **17:9**
  - before: ring from her finger
  - after: ring from her third finger
- **32:70**
  - before: her ambassador and
  - after: her ambassadress and
- **32:66**
  - before: “Thou’s a damned liar,”
  - after: “You’re a damned liar,”
- **32:66**
  - before: taking thy side
  - after: taking your side
- **32:66**
  - before: Even when thou sneered
  - after: Even when you sneered
- **32:66**
  - before: tell him thou’s worried me
  - after: tell him you worried me

## S2 Exclamation marks restored (comparison of count('!') per paragraph, modern vs original, all chapters)
38 paragraphs had fewer `!` than the source; all now have at least as many (script re-run: 0 paragraphs below source). Fragment before/after:
- **25:6**: I can’t abandon her to him.  ->  I can’t abandon her to him!
- **25:13**: Dear uncle, send me  ->  Dear uncle! Send me
- **27:9**: “My affectations?” he murmured. “What do you mean?  ->  “My affectations!” he murmured. “What do you mean?
- **27:14**: “To stay? Tell me  ->  “To stay! Tell me
- **27:29**: “Dear Linton,” Catherine  ->  “Dear Linton!” Catherine
- **27:36**: how savage I feel towards anything that seems frightened of me.  ->  how savage I feel towards anything that seems frightened of me!
- **27:52**: The man’s mad, or he thinks  ->  The man’s mad! Or he thinks
- **27:58**: Now, to bed.  ->  Now, to bed!
- **27:59**: “Oh, so you’re not  ->  “Oh! So you’re not
- **27:67**: No, don’t turn away. _Do_ look!  ->  No, don’t turn away! _Do_ look!
- **27:67**: Ah, you must look at me once.  ->  Ah! You must look at me once.
- **28:2**: “Dear me, Mrs. Dean!” she exclaimed. “Well, they’re talking about you in Gimmerton!  ->  “Dear me! Mrs. Dean!” she exclaimed. “Well! They’re talking about you in Gimmerton.
- **28:2**: You must have got onto an island  ->  What! You must have got onto an island
- **28:5**: “Oh, Zillah, Zillah!”  ->  “Oh! Zillah, Zillah!”
- **28:15**: but you won’t pity hers.  ->  but you won’t pity hers!
- **28:15**: Oh, you’re a heartless  ->  Ah! You’re a heartless
- **28:26**: “Catherine is coming, dear master,” I whispered.  ->  “Catherine is coming, dear master!” I whispered.
- **28:30**: “Oh, it’s Green,”  ->  “Oh! It’s Green,”
- **29:13**: what I did yesterday.  ->  what I did yesterday!
- **29:17**: for just one glimpse.  ->  for just one glimpse!
- **29:20**: “Goodbye, Ellen,” my  ->  “Goodbye, Ellen!” my
- **30:33**: But I won’t complain to you.  ->  But I won’t complain to you!
- **30:35**: “‘Oh, you’re an exception,’  ->  “‘Oh! You’re an exception,’
- **30:38**: “Hareton muttered that she could go to hell for all he cared.  ->  “Hareton muttered that she could go to hell for all he cared!
- **31:7**: Oh, I’m tired  ->  Oh! I’m tired
- **31:19**: “Oh, I don’t want  ->  “Oh! I don’t want
- **32:2**: “Ah, yes.  ->  “Ah! Yes.
- **32:24**: “No, or I suppose  ->  “No! Or I suppose
- **32:33**: “Ah, I see you  ->  “Ah! I see you
- **32:59**: “Will ye go to the devil,” he snarled,  ->  “Will ye go to the devil!” he snarled,
- **32:68**: “Well, what else  ->  “Well! What else
- **33:15**: Make it short.  ->  Make it short!
- **33:16**: Thank God _she_  ->  Thank God! _she_
- **33:16**: Nay, it fair  ->  Nay! It fair
- **33:34**: “Hush, hush!”  ->  “Hush! Hush!”
- **33:39**: where he can. Your  ->  where he can get it! Your
- **34:14**: “Yes,” I thought  ->  “Yes!” I thought
- **34:26**: Now you’d better go.  ->  Now you’d better go!
- **34:30**: Those deep, dark eyes, that smile, that deathly pallor!  ->  Those deep, dark eyes! That smile, that deathly pallor!
- **34:61**: By God, she’s relentless.  ->  By God! She’s relentless.

Notes on S2:
- 29:17 needed a second fix beyond the reviewer's count (14 -> 12): `glimpse!` and `unbearable torture!`.
- 32:1: the source `Yon's frough Gimmerton, nah!` carries its `!` on the first clause, so the restored dialect line reads `That's from Gimmerton, that is!` (the reviewer's suggested text had no `!`; one is needed to satisfy the source count).
- 27:9, 27:14, 27:52, 28:2, 28:5 etc. restore the `!` on the clause that carries it in the source; no restructures were documented because none were genuine.

## N1 Apostrophes
All 3,672 straight `'` in the modern edition became curly `’` (the original uses `’`; 0 straight remain). Quotation marks were not touched (the only straight-apostrophe-like cases were `'em`).

## Verification
- JSON valid; 34 chapters / 1,931 paragraphs, aligned with the original; no paragraph under 0.75 of source words (over 30 words).
- Per-paragraph `!` check: 0 paragraphs with fewer than the source.
- `python3 books/classify-modern-en.py wuthering-heights --gate`: GATE PASS.
- Shards regenerated with `node scripts/split-edition-chapters.cjs wuthering-heights-modern-en --write-registry`; all 34 shards equal the whole-file chapters; `editionShardRegistry.ts` unchanged.

## Independent review fixes — 2026-10-02

**Independent editorial acceptance: ACCEPTED, all findings resolved.** Content accepted is distinct from integrated/published: the book remains STAGED, unregistered and unpublished. Coordinates `chapter:paragraph`, 1-based unless marked zero-based.

### Blocking
- **B1 — 18:13 (zero-based 18:12) “Mrs. Heathcliff lived more than twelve years after leaving her husband”** was bound to `catherine-linton-younger`; it means Isabella. `bind()` in `books/characters/entities/wuthering-heights.py` now excludes (18, 12) from the younger Catherine’s `Mrs. Heathcliff` alias and adds it to `isabella-linton`. Both editions rebound. Audit of every `Mrs. Heathcliff` from ch18 on (both editions): 18:12 → Isabella; 30:10, 30:15, 30:34, 31:7, 31:17, 32:30, 32:85 (zero-based) → younger Catherine, all correct. 18:12 was the only mis-binding.

### Should-fix (modern-en text unless stated)
1. 9:83 → “It would degrade me to marry Heathcliff now, so he must never know…”; “as different as a moonbeam from lightning”.
2. 16:16 → “May she wake in torment!”; “Be with me always—take any form—drive me mad! Only _don’t_ leave me in this abyss, where I cannot find you!”
3. 3:28 → “I had read _Earnshaw_ twenty times as often as Linton” (emphasis markup kept).
4. 22:23 → “Unless you restore him, he’ll be in his grave before summer!”
5. 25:12 → “Heathcliff knew, then, that he could plead eloquently for Catherine’s company.”
6. 34:19 → “go back to you”; 30:30 → “Ask of yerself.”
7. Threads, Joseph ch2 → “Joseph refuses to let Lockwood in and later raises the alarm when he takes the lantern. His shouts bring the dogs upon the departing visitor.”
8. Threads, Joseph ch3 → quarrel sentence replaced: “Early next morning he comes down to the kitchen hearth and smokes his pipe in silence, ignoring Lockwood.” (source 3:56).
9. Onboarding cast “Catherine “Cathy” Linton” → “The young widow Lockwood meets as Mrs. Heathcliff; Nelly knew her as Catherine Linton. She is a separate person from the Catherine whose childhood Nelly describes.” `angleObjective` (no code consumer found, softened anyway) → “Track the two Catherines and the different people called Linton, …” (no longer names Linton Heathcliff).
10. Zillah card: identity body at first mention (2:70; zero-based 2:69) is now “Mrs. Heathcliff names her among the household at the Heights.” The former aid text is a snapshot released at the end of 2:88 (zero-based 2:87). Mirrored in `editorial.json` and the module’s ENTITIES list.

### Nits
- “black” restored: 34:20 “black brows”, 34:30 “Those deep black eyes!”, 33:39 “Heathcliff’s black eyes blazed”, 27:38 “her black eyes flashing”.
- 29:16 “dissolved into earth”; 29:17 “Of dissolving with her”.
- 30:1 “thrang”—busy—and (replaces “thrang” (busy)).
- 30:25 “I’ve been starved a month and more” (source sense kept).
- 15:2 “the evening of my visit to the Heights”.
- 3:58 “or now and then to push away a dog that thrust its nose too boldly into her face.”
- 34:71 “an’ I daren’t pass ’em” (supersedes the earlier “darnut” fix above).
- Sidecar 8:1 (zero-based 8:0) modern “the last of the old Earnshaw line”: `bind()` skips `old Earnshaw` when followed by “line”; no longer bound to `mr-earnshaw-elder`. Other `old Earnshaw` bindings (4:38, 7:14 zero-based, both editions) unchanged.
- Threads, Heathcliff ch30 → “Nelly thinks of taking a cottage and having Cathy live with her, but judges that Heathcliff would refuse to permit it.” (source 30:39).

### Regeneration and gates (2026-10-02)
- Shards: `node scripts/split-edition-chapters.cjs wuthering-heights-modern-en` (no `--write-registry`; registry untouched); 34 shards equal the whole-file chapters.
- Characters: `python3 books/characters/entities/wuthering-heights.py`, then `--check` pass; public sidecar byte-identical to the package output. contentVersion `2026-10-02.1`. Mention diff vs previous sidecar: only the 18:12 rebinding (both editions), the removed 8:0 `old Earnshaw` (modern) and offset shifts in edited paragraphs. Mentions: original 1,397, modern 1,458; 19 identities per edition. Direct validation: source and paragraph hashes, every UTF-16 span and every snapshot gate offset pass.
- `npx vitest run src/services/characters`: 6 files, 487 tests passed.
- `python3 books/classify-modern-en.py wuthering-heights --gate`: GATE PASS (exit 0; weighted similarity 0.509; light+mechanical 0/34; identical long 1/1586; scaffolding 0; truncated quotations 0).
- JSON valid (editions, shards, threads, onboarding, sidecar, editorial); 34 chapters / 1,931 paragraphs aligned; no paragraph under 0.75 of source words (>30 words); 0 paragraphs with fewer `!` than source; 0 straight apostrophes.
- Original edition, preface and intro unchanged.

### Hashes (SHA-256)
- `app/public/data/editions/wuthering-heights-modern-en.json`: `2ffc01f3d29a6f2087ea0bff09ed69d26e32e5ffb748bf9e4e29d22755dc75c8`
- `app/public/data/editions/wuthering-heights-original-en.json` (unchanged): `cd6c024bd4b0f1fc773ac0b4129b0ff50635099a372a4bf5f1501c06dd293d96`
- `app/public/data/characters/wuthering-heights.v1.json`: `fffec902d9b49124beb018c046ed1cd1397882f749ecb2eec42657f4ae715872`
- `app/public/data/editions/wuthering-heights-threads.json`: `5fbdb45800d8b4cfd11ed2c71fe238037d31879d1ccb8b7caf4e1530cd945e20`
- `app/public/data/onboarding/wuthering-heights.json`: `49aa92b5facc96b97a9c3b05f6a6ae997033016f185e99fac769d461995003c3`
- modern-en shards concatenated ch0001–ch0034: `d2dc7051cae90307864daf6ca22bdd259fbd5c4a6602506aa6327034163c664d`
