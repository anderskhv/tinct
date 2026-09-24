# Changed paragraphs — Moby-Dick modern-en

1614 of 2432 paragraphs differ from the live baseline (`baseline-live-modern-en.json`). Coordinates are `chapter.paragraph`, with a 0-based paragraph index. Each row gives the baseline hash, the accepted hash (both the first 16 hex characters of sha256), the rounds that touched the paragraph, and the reason for each change taken from `ledger.jsonl`.

### 1.0  `c34018d0a239bb2c` → `26c62170abd6e98a`
- **R1** (omission,hedge,voice): Audit slip: closing sentence lost "If they but knew it", "in their degree" and "very nearly" ("almost all men in their degree, some time or other, cherish very nearly the same feelings"); also dropped "as soon as I can", "involuntarily", "in my purse", and "coffin warehouses" became "coffin shops".
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 1.1  `b3cecc685bab699e` → `fb0d316f226165c3`
- **R1** (meaning): Audit slip: "as Indian isles by coral reefs" was changed to "Pacific isles" (a change of fact); "the Manhattoes" was normalized to "Manhattan" and "commerce surrounds it with her surf" became "laps at it like surf".

### 1.2  `02862db3f4a9df14` → `36eda031c762811b`
- **R2-fid** (voice): Source "thousands upon thousands of mortal men fixed in ocean reveries" became "people lost in ocean reveries": "mortal men" (the solemn register that sets up "the ungraspable phantom of life") and "fixed" (they stand transfixed) are flattened.
- **R3-fix** (hedge): R2 restored "mortal men fixed in ocean reveries" correctly, but the paragraph still drops the hedge in "some high aloft in the rigging, as if striving to get a still better seaward peep": the candidate states "trying to get" as fact. Restore "as if".

### 1.3  `2cc51ed624ed7021` → `faee0c22574b66fb`
- **R1** (omission,voice): Dropped "Inlanders all" and "lanes and alleys, streets and avenues" (replaced by "every neighborhood"), and the "Tell me" address and "magnetic virtue" of the compass needles.

### 1.4  `ecfcfd760e447937` → `267bdf23b6b9b984`
- **R1** (omission,meaning): "leaves you there by a pool in the stream" lost the pool; "the great American desert" lost "great" (the period's name for the plains); "metaphysical professor" became "philosophy professor"; "Once more" became "Consider one more thing".
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 1.5  `f208957a29682d6e` → `9868f36e7ce3cab5`
- **R1** (meaning,omission,invention,voice): "a separate deity, and own brother of Jove" became "its own god, Poseidon, brother of Zeus" (added name, changed Jove to Zeus). Also lost "overlapping spurs", "hill-side blue", "pedestrian trip" (walking trip), "robust healthy boy with a robust healthy soul in him"; "this pine-tree shakes down its sighs like leaves" garbled to "sighs leaves down".
- **R2-acc** (voice): Read-aloud rhythm: 'a separate god, and own brother of Jove' keeps the 1851 'and own brother of' construction, which trips the ear and invites a reread. Minimal rewording keeps both claims (a separate sea-god; brother of Jove).
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 1.6  `15499c02a22adb51` → `7e793b45e94069ef`
- **R2-fid** (omission,voice): Kept paragraph still loses three touches: "you must needs have a purse, and a purse is but a rag unless you have something in it" became "Passengers need money, and a wallet..." (the purse of 1.0 lost); "though I confess there is considerable glory in that" lost "I confess" and "glory"; "the idolatrous dotings of the old Egyptians upon broiled ibis" became plain "worship", losing the mock-pious joke.
- **R3-fix** (omission,voice): R2 correctly restored the purse, "I confess ... glory" and "idolatrous doting", but the paragraph still omits source touches: "the glory and distinction of such offices" ("distinction" lost), "toils, trials, and tribulations of every kind whatsoever" (the comic emphasis lost), "schooners, and what not" (dropped), and "yet, somehow, I never fancied broiling fowls" ("somehow" dropped). Minimal restoration of each.

### 1.8  `5b84b15532cae95d` → `8e9b00f9640c222a`
- **R1** (omission,invention): Lost "promptly and respectfully" and "in that particular instance"; added "in one way or another" to "Who ain't a slave?"; "it is all right" became "it's all fair"; "one way or other served" simplified.

### 1.9  `54b51caaf511237d` → `28ecc393c6344116`
- **R1** (voice,hedge): "the two orchard thieves" was replaced outright by "Adam and Eve" (image lost; now kept with the names as a gloss); "that I ever heard of" hedge dropped; "root of all earthly ills" and "Ah!" flattened.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 1.10  `f01aba69bacfcf96` → `2b8ef44d4719c189`
- **R1** (meaning,omission): "the invisible police officer of the Fates" became "of Fate"; "he can better answer than any one else" became "better than I can"; "influences me in some unaccountable way" and "smelt the sea" softened.
- **SWEEP-terms** (convention): Terminology consistency: edition spells 'quarter-deck' (as source and ch36 title)

### 1.11  `ab3ed048514dca14` → `838affb6cafc09fd`
- **R1** (convention): Curly quotes in candidate; "AFFGHANISTAN" normalized to "AFGHANISTAN" (source spelling of a proper name kept per lead decision 3).

### 1.12  `6719baea0c7169cb` → `e7842dc21fbe7d6f`
- **R1** (unmodernized): Left near-verbatim 1851 syntax ("I think I can see a little into the springs and motives which, being cunningly presented to me under various disguises, induced me to set about performing the part I did").

### 1.13  `f3154a045d0533cf` → `f6dbe6d41a510f4a`
- **R1** (omission,hedge,voice): "portentous" became "gigantic"; "his island bulk" became "enormous bulk"; "With other men, perhaps" lost "perhaps"; "barbarous coasts" became "savage coasts"; "inmates of the place one lodges in" flattened.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 2.0  `51b0cc7e51cfc92a` → `f76442b605eca06c`
- **R1** (meaning): Name normalized: "the good city of old Manhatto" became "Manhattan" (lead decision 3).

### 2.1  `917b6b917f21bc98` → `c07bfddb593318ce`
- **R1** (meaning,omission,convention): Period term softened: "the Red-Men" became "the Native Americans" (lead decision 1); "aboriginal whalemen" became "original whalemen"; "the Leviathan" became "the great beast"; lost "imported" cobblestones and "from the bowsprit"; "the Tyre of this Carthage" expanded.

### 2.2  `39e9465fa2f9b191` → `8c7de1f721bbd2c3`
- **R1** (voice,omission): Metaphor lost: "With anxious grapnels I had sounded my pocket, and only brought up a few pieces of silver" became "anxiously searched my pocket"; "wherever in your wisdom you may conclude" lost "in your wisdom"; "dubious-looking, nay, a very dark" flattened.

### 2.3  `b55c0951e8350af3` → `043f909df777eaea`
- **R1** (convention,omission): Single quotes around inn names (edition uses double quotes); "hard, asphaltic pavement" became "hard pavement"; "congealed frost" became "frozen ground"; "hard, remorseless service" lost "remorseless".

### 2.4  `0559c76c3a153a18` → `095006ee92e4cfc9`
- **R1** (omission,convention): Final sentence dropped entirely: "However, I picked myself up and hearing a loud voice within, pushed on and opened a second, interior door." Also added "dim" to "smoky light"; single quotes.

### 2.5  `ce7411e7fb9e79a8` → `d317a3bd9971a3c5`
- **R1** (meaning,omission,voice): Period language softened and images lost: "a negro church" became "a Black church" (lead decision 1); "the great Black Parliament sitting in Tophet" became "some great dark parliament sitting in Hell" (name Tophet dropped); "A hundred black faces" became "dark faces"; "a black Angel of Doom" became "a dark figure".

### 2.6  `888c4854d3e9f02b` → `e3f6e443549ebc55`
- **R1** (convention): Single quotes around the sign text; "a dim sort of light" became "a faint light".

### 2.7  `584e3e19b9bccb58` → `792928d2eefa53ce`
- **R1** (omission,voice): "the best of pea coffee" (ironic: a cheap coffee substitute) became "decent coffee"; "an emigrant from there" softened.

### 2.8  `93c7fff75235a2f5` → `4e2b4e4e110a8bd4`
- **R1** (omission,voice,convention): Name "Euroclydon" dropped in three of its five places ("that tempestuous wind Euroclydon" became "the tempestuous northeast wind"; "Euroclydon, nevertheless, is a mighty pleasant zephyr"; "yet that would not keep out the tempestuous Euroclydon" became "the freezing wind would find him"); "lint" became anachronistic "insulation"; "as this passage occurred to my mind" and "the wight Death" dropped; single quotes.
- **R2-acc** (unmodernized): 'old black-letter' used alone as a vocative noun is opaque to a first-time reader or listener (it sounds like an adjective with no noun). Adding 'book' makes clear Ishmael is addressing the old volume printed in black-letter type he has just quoted; no content added.

### 2.9  `cf211c2667e7d2d5` → `ad29044401a2689f`
- **R1** (omission,voice): "yea, ye gods!" dropped; "the grand northern lights" lost "grand".

### 2.10  `758aa72b63631b83` → `863fb53320458ba3`
- **R1** (omission): "moored to one of the Moluccas" became "a tropical island" (name dropped).
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 2.11  `61329f92d7cf887e` → `8eb0a4ef1386734f`
- **R1** (convention): Single quotes around "Spouter".

### 3.0  `50039b49ec97b30b` → `58211dc46dbcb24f`
- **R1** (technical,omission,invention): "the bulwarks of some condemned old craft" became "bulkheads" (a different part of a ship); "in the unequal crosslights by which you viewed it" dropped; "to let in more light" invented; "New England hags" became "witch trials".

### 3.1  `d050847c50656a56` → `19ffaff04cc5725d`
- **R1** (omission,voice): Lost "limber", "confounded", "a sort of indefinite, half-attained, unimaginable sublimity" (reduced to "something almost sublime"), "involuntarily", "bright, but, alas, deceptive idea", "unnatural combat"; "Hyperborean" became "Arctic".

### 3.2  `428f19855440779b` → `c65c18b7e4f0536d`
- **R1** (meaning,voice): "its three dismantled masts alone visible" became "barely visible" (sense changed); "in the enormous act of impaling himself" lost "enormous".

### 3.3  `5afe3a3235e1acee` → `8dc82061546c7c54`
- **R1** (meaning,omission): Period terms altered: "heathenish array" became "barbaric display"; "monstrous cannibal and savage" dropped "and savage" (lead decision 1). Also "once long lance, now wildly elbowed" lost "once long"; "full forty feet" and "found imbedded" softened.

### 3.4  `1f9a1986ec1e51f9` → `04da8716f626faa5`
- **R1** (omission): Dropped "with fireplaces all round", "some old craft's cockpits", "this corner-anchored old ark rocked so furiously" (reworded to building), "jaws of swift destruction" lost "swift", "dearly sells" lost "dearly".

### 3.5  `b8079b6b312615da` → `13efbb0bd2185c0c`
- **R1** (technical,omission): "Parallel meridians rudely pecked into the glass" became "like latitude markings" (meridians are lines of longitude); "these footpads' goblets" (robbers') dropped.

### 3.6  `6899cedcd56ee707` → `6ca6fd8e2f7e86b2`
- **R1** (convention,voice): "harpooneer"; single quotes; Melville's word "skrimshander" normalized to "scrimshaw" (it recurs as a nickname in 3.26); landlord's dialect ("you haint no objections... I s'pose you are goin' a-whalin'") fully standardized (lead decision 5).

### 3.7  `29801b12c5d7dd55` → `c1d3b77c0614cf55`
- **R1** (convention,omission): "harpooneer" twice; "(the landlord)" and "decidedly objectionable" softened.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 3.8  `896aa22521c2a7f3` → `60f25ee59104145e`
- **R1** (convention): Single quotes.

### 3.9  `749fc02fc04f3ba7` → `5a7c5c63d2e323dd`
- **R2-fid** (hedge,voice): Source "but he didn't make much headway, I thought" is Ishmael's opinion and a nautical pun (a carved ship under full sail making no headway). Candidate "he wasn't making much progress" drops "I thought" (opinion stated as fact) and the pun.

### 3.10  `96435df5511e613f` → `a3b944a1e97e14e5`
- **R1** (meaning,omission): "two dismal tallow candles, each in a winding sheet" (the shroud-like drip of tallow) became "each in a paper sleeve" (wrong object); "monkey jackets" and "green box coat" flattened; "hold to our lips" dropped.

### 3.11  `03c700959cf16dcf` → `7ac20bcbacbea07c`
- **R1** (convention,voice): Single quotes; "you'll have the nightmare to a dead sartainty" flattened to "for sure".

### 3.12  `60dfc9cbe6d7a6a0` → `d833446744bf4f7a`
- **R1** (convention): "harpooneer"; single quotes.

### 3.13  `6cbedb52fc28ecec` → `615a08759800c755`
- **R1** (convention,voice): "harpooneer"; single quotes; landlord's "he don't" dropped.

### 3.14  `ef19261b6bc1d183` → `23d25514d51c5a99`
- **R1** (convention): "harpooneer"; single quotes.

### 3.15  `84bda333eba2ee44` → `c1b5f69409a9d5c2`
- **R1** (convention): Single quotes.

### 3.16  `21513aadfbe2741a` → `fd44a745a0d7f886`
- **R1** (convention): "harpooneer"; single quotes.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 3.18  `f3fa87df2f8a6c69` → `0c6abb82f4b599a1`
- **R1** (meaning,convention): "the Feegees" normalized to "the Fiji Islands" (lead decision 3); landlord's "I seed her" standardized; single quotes.
- **SWEEP-names** (convention): Lead decision 7 sweep (spelling variants of geographic/people names to modern standard form): Feegees -> the Fijis

### 3.19  `761f7ead6280e74d` → `bec4b9ad896293b8`
- **R1** (omission): Ending cut: "all colds and catarrhs whatsoever, never mind of how long standing, or whether caught off the coast of Labrador, or on the weather side of an ice-island" became "no matter how long-standing or where they'd been caught"; "cold in his head" lost.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 3.21  `c6b6e11737197c9b` → `3319fcd24e0fd3e9`
- **R1** (meaning,convention): "since the sea-gods had ordained" became "fate had decreed"; "a chest like a coffer-dam" became "a vault" (image changed); "the Alleghanian Ridge" normalized to "Allegheny Ridge" (lead decision 3); single quotes.

### 3.22  `b8eecb32dffcbdba` → `29db897ae7eb248d`
- **R2-fid** (voice): Source "the room seeming almost supernaturally quiet after these orgies" (the sailors' wild revels) became "after the commotion", which loses the comic overstatement.

### 3.23  `ff65eb2bdd0b39e1` → `38e71f4e2caaaa95`
- **R1** (convention,omission): "harpooneer"; "I don't know how it is, but" dropped; "no earthly reason" and "To be sure" flattened.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 3.24  `1c2b0d4efa5622d5` → `4ecd59d215d088c9`
- **R1** (convention,omission): "harpooneer" x4; "his linen or woollen, as the case might be, would not be of the tidiest, certainly none of the finest" lost "certainly none of the finest"; "abominated" weakened to "the less I wanted".

### 3.25  `f9d86d81a004b3da` → `0a5af872d5619179`
- **R1** (convention): "harpooneer"; single quotes.

### 3.26  `028f36e59bd5e406` → `3ca3e55a5611369d`
- **R1** (meaning,convention): Nickname "Skrimshander" respelled "Scrimshander"; "the great stove in the middle of the room" lost location; "plaguy rough board" flattened; "brown study"; single quotes.

### 3.27  `b0409d3e48fddb09` → `b04281661f9bd12b`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 3.28  `d4acab812a00556a` → `ee96fa5da1c30048`
- **R1** (convention): "harpooneer" twice.

### 3.29  `49fe3ed7b49ef2b5` → `fdf609125d3c40f6`
- **R1** (convention,voice): "harpooneer"; "jolly good bedfellows" became "perfectly good".

### 3.30  `08234a0c09142e90` → `6c0c80282adc914b`
- **R1** (omission,convention): "by ones, twos, and threes" became "one by one"; "harpooneer".

### 3.31  `05f71f09f6591f3c` → `de527e34ea7d9e53`
- **R1** (convention): Single quotes.

### 3.32  `21cdeb85c2e3311b` → `1ef823c08726a4cb`
- **R1** (omission,voice,convention): Dropped the landlord's "yes, he's the bird what catches the worm"; "lean chuckle" became "dry"; dialect standardized; single quotes.

### 3.33  `76ab7139014a47d8` → `40c07d8c5f6cee90`
- **R1** (convention,omission): "harpooneer"; single quotes; "this blessed Saturday night" lost "blessed"; "bamboozingly story" flattened to "crazy story".

### 3.34  `1c4732533ce7c1c1` → `7c37637e8ad0003b`
- **R1** (convention): Single quotes.

### 3.35  `6d7b60f4c733a0b1` → `c2d990740cfe19b4`
- **R1** (convention): Single quotes.

### 3.36  `b464759de17f7342` → `e74ed40fdb10117c`
- **R1** (convention): Single quotes.

### 3.37  `20b8656beb631f39` → `3aca3b1e0da82205`
- **R1** (convention): Single quotes.
- **R2-fid** (voice): Source "I'm not green" sets up the landlord's reply "you'll be done brown" (3.38): green/brown color joke. "I wasn't born yesterday" breaks the pairing; "green" (naive) is still current English.

### 3.38  `b8ac9eb4c52dd988` → `8ecc42159cffadf2`
- **R1** (convention,voice): "harpooneer"; single quotes; "I rayther guess" and "a slanderin'" dialect flattened.

### 3.39  `d5f34c54ec3cfa78` → `60dfcb3939b80cf7`
- **R1** (convention): Single quotes.

### 3.40  `1706ca63809816d6` → `e1430b45825ac370`
- **R1** (voice,convention): "It's broke a'ready" became "already broken", which kills the "broke/broke" wordplay picked up in 3.41; single quotes.

### 3.41  `86ca1dfc3ba0147f` → `a2e984e91c05ab2d`
- **R1** (voice,convention): "Broke ... broke, do you mean?" standardized to "Broken"; single quotes.

### 3.42  `e7bfa241d4c946fe` → `39332962c23076a3`
- **R1** (convention,voice): Single quotes; "Sartain" became "Yep".

### 3.43  `bcbac065231ee29c` → `d689acdadebf8a1e`
- **R1** (omission,meaning,convention): "as cool as Mt. Hecla in a snow-storm" became "cool as a glacier in a blizzard" (name and volcano joke lost); "stories tending to beget in me an uncomfortable feeling" became "designed to" (intent added); "in all respects safe" lost; "harpooneer"; single quotes.
- **SWEEP-names** (convention): Lead decision 7 sweep (spelling variants of geographic/people names to modern standard form): Hecla -> Mount Hekla

### 3.44  `58f12346cb94cb56` → `ef3a0bf245d142f7`
- **R1** (voice,convention): Landlord's dialect fully standardized ("purty long sarmon", "for all the airth like a string of inions"; lead decision 5); "be easy, be easy" collapsed; "harpooneer"; single quotes.

### 3.45  `d173a62c5966ee96` → `b4f0c91e6da7e79e`
- **R1** (omission,convention): "selling the heads of dead idolators" became "dead men's heads" (idolaters dropped); "otherwise unaccountable" dropped; "harpooneer".
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 3.46  `b66c888b54d5fad4` → `a5afcc7920eb9c56`
- **R1** (convention): "harpooneer"; single quotes.

### 3.47  `9c31c443bb7a9ed2` → `1c6ae38650a616b9`
- **R1** (omission,voice,convention): Whaling idiom "turning flukes" became "turn in"; "come to anchor somewhere" softened; "almighty big bed" flattened; "_do_ come; _won't_ ye come?" compressed; "harpooneer"; single quotes.

### 3.48  `7b5fd9acd87988c3` → `fe8945511499e376`
- **R1** (hedge,convention): "almost big enough indeed for any four harpooneers" lost "almost"; "sure enough" dropped; "harpooneers".

### 3.49  `90df3eaf3487261e` → `5c7ec27c2b63dc77`
- **R1** (convention): Single quotes; "wash-stand and centre table" lost "center table", which 3.50 refers back to.

### 3.50  `1e843eb980c77dcf` → `3d7d244b6187555e`
- **R1** (omission,convention): "counterpane" became "bedspread" (the next chapter is titled "The Counterpane"); "Of things not properly belonging to the room" distinction dropped; "harpooneer".

### 3.51  `c0066157bf434174` → `817d4c0d2a5dfb7a`
- **R1** (meaning,hedge,convention): "an Indian moccasin" changed to "a Native American moccasin" (lead decision 1); "gave myself a kink in the neck" became "nearly wrenched" (hedge added); "harpooneer" x2.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 3.52  `d435d60f49fd5b4d` → `b148dedca8d31174`
- **R1** (hedge,omission,convention): "what the landlord said about the harpooneer's not coming home at all that night, it being so very late" became "might not come back" (hedge added, reason dropped); "monkey jacket" and "care of heaven" flattened; "harpooneer" x2.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 3.53  `483e4841ad722cd8` → `77c0796c85f10593`
- **R1** (voice): The nautical metaphor "had pretty nearly made a good offing towards the land of Nod" became "nearly reached"; "no telling" and "in the passage" flattened.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 3.54  `5732f94df572eb23` → `32c1f86ae3a1eecc`
- **R1** (omission,hedge,convention): Dropped "and perhaps the sun there produced these extraordinary effects upon the skin" (Ishmael's speculation); dropped "placing these on the old chest in the middle of the room" location, "a whaleman too", "a good way off from me", "none to speak of at least" order; "harpooneer" x3.

### 3.55  `c4c34597358c5ae8` → `83091f095dc66b7b`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 3.56  `0a76e74a42d7a637` → `922910dec491db4f`
- **R1** (omission): "some abominable savage or other" lost "abominable" (lead decision 1); "a sticking-plaster shirt" became "nothing but bandages"; "heavens!" became "God".
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.
- **R4-acc** (convention): 'A head peddler, too' is unhyphenated, while the neighbouring paragraphs use 'head-peddling' (3.51, 3.52, 3.55) and 'the infernal head-peddler' (3.54). Hyphenate for consistency.

### 3.57  `8183ccd4369af375` → `29510689e29f4c49`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 3.58  `324871fd99ecf9f8` → `a5024abc6e3fa4a9`
- **R1** (meaning,hedge,omission): Period term replaced: "a polite offer of it to the little negro" became "the little figure" (lead decision 1); "(whereby he seemed to be scorching them badly)" became fact ("his scorched fingers"); "a sportsman bagging a dead woodcock" became "a hunter bagging a dead bird"; "grego pocket" became "coat pocket".
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 3.59  `538b00b6dcbc20ac` → `0639a87d9928cd81`
- **R2-fid** (voice): Source "exhibiting strong symptoms of concluding his business operations" keeps the running joke of the head-peddler as a businessman; "finishing up" drops it.
- **R3-fix** (omission): R2 correctly restored "concluding his business operations", but the paragraph still loses "the spell in which I had so long been bound" ("so long" dropped) and turns "before the light was put out" (someone will put it out) into "before the light went out". Minimal restoration.

### 3.60  `23d74472ee17d9f1` → `5ee1a76b3e078379`
- **R1** (omission): "holding it to the light, with his mouth at the handle" lost "to the light" (he is lighting the tomahawk-pipe from the candle); "I could not help it now" lost "now".
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 3.61  `cf17f0ddeca61045` → `28d76dcbacf80ce8`
- **R1** (unmodernized): Left near-verbatim 1851: "I knew not what", "conjured him", "he but ill comprehended" rendered "satisfied me at once".

### 3.62  `4cf5567c1115bdee` → `7a12b4a50ff7d11e`
- **R1** (voice,convention): Queequeg's pidgin ("Who-e debel you?... you no speak-e, dam-me, I kill-e") standardized to "Who the devil are you?" (lead decision 5); single quotes.

### 3.63  `89cb2c007d70ca57` → `26a156bff0b2be3b`
- **R1** (meaning,convention): "Watch!" (a call for the night watchman) became "Help!"; single quotes.

### 3.64  `6b7e45d547d112ff` → `dc12b39a9821f1d6`
- **R1** (voice,meaning,convention): Queequeg's pidgin standardized ("Speak-e! tell-ee me who-ee be, or dam-me, I kill-e!"); "my linen" (his shirt) became "my sheets"; "horrid flourishings" flattened; single quotes.

### 3.65  `4432f4c2b60962c7` → `1332d217c0288d6c`
- **R1** (convention): Single quotes.

### 3.66  `557d626b5181686e` → `5579fb139e9cd665`
- **R1** (convention): "harpooneer"; single quotes.

### 3.67  `4860439fa40d78d1` → `1ded7133c14ead90`
- **R1** (voice,convention): The landlord's pidgin to Queequeg ("you sabbee me, I sabbee — you this man sleepe you — you sabbee?") and "turn flukes again" standardized; single quotes.

### 3.68  `8fffed5dfb2c9fb6` → `0a3c7251fca6f7ef`
- **R1** (voice,convention): "Me sabbee plenty" standardized to "Me understand plenty"; single quotes.

### 3.69  `dcf3f5da34d80472` → `f83a3091585aae72`
- **R1** (voice,convention): "You gettee in" standardized; "clean, comely looking cannibal" became "decent-looking"; single quotes.

### 3.70  `daf1f90799a27756` → `1668d6a57b863b4f`
- **R1** (convention): Single quotes; "I ain't insured" standardized.

### 3.71  `6aa54ff2664afea9` → `bb7262ebb587b7a8`
- **R1** (convention): Single quotes.

### 3.72  `d9b98fc007406404` → `b8965faeb0470aed`
- **R1** (convention): Single quotes.

### 4.0  `ddd69e5bdd2e86d5` → `5d242d2bfdc0a32a`
- **R1** (meaning): "The counterpane" became "the bedspread" in the chapter titled "The Counterpane"; "owing I suppose" hedge became "probably"; "interminable Cretan labyrinth of a figure" slightly flattened.

### 4.1  `043f097038694e2d` → `18361c26677797d4`
- **R1** (meaning,omission): Melville's famous slip is silently corrected: source breaks off "my stepmother who, somehow or other, was all the time whipping me... — my mother dragged me by the legs"; candidate made the stepmother do the dragging (hard rule 3: don't correct Melville). Also dropped "in our hemisphere", "I well remember", "somehow or other".

### 4.2  `1cd8001b2f1af869` → `eb4147a0a8ec0965`
- **R1** (voice,omission): "before I could hope for a resurrection" became "freedom" (joke lost); "the best and most conscientious of stepmothers" lost "best" (irony); "wrapped in outer darkness" (biblical) became "total darkness"; "silent form or phantom" lost "phantom"; "the small of my back" and "Nay, to this very hour" flattened.

### 4.3  `d00c19f40439e3a6` → `9f643b77540d487b`
- **R1** (invention,omission,meaning,convention): Editorial softening added: "these savages have an innate sense of delicacy" became "these so-called savages" (invention; lead decision 1); "Queequeg's pagan arm" became "tattooed arm"; dropped "it is marvellous how essentially polite they are", "reconciled to the fact", and the closing clause "he and his ways were well worth unusual regarding"; single quotes.

### 4.4  `67c8642b5a78770c` → `baa1c0567260981b`
- **R1** (hedge,omission): "as if, not being much accustomed to boots, his pair ... rather pinched and tormented him" became fact ("clearly pinching him"); dropped "not being much accustomed to boots" and "probably not made to order either"; "If he had not been a small degree civilized" reworded.

### 4.5  `cfabce1f035a2ff7` → `ae3317a9ceedf8cb`
- **R1** (omission): "this is using Rogers's best cutlery with a vengeance" lost the name Rogers; "long wooden stock" and "long straight edges" lost "long"; "the house opposite commanded a plain view" became "the neighbors".

### 4.6  `22fcf60e3d4065d5` → `bb72b60c654654d6`
- **R2-fid** (omission): Source "his great pilot monkey jacket": "monkey" dropped. The monkey jacket recurs (3.10, 3.52, 5.2).

### 5.0  `53ab0aa97ac23dde` → `154dfcdb41138de9`
- **R2-fid** (meaning,omission): Source "accosted the grinning landlord very pleasantly" became "pleasantly enough", which implies a grudging greeting and cuts against "I cherished no malice". "he had been skylarking with me not a little" lost "not a little".

### 5.1  `d1217d5429510e2f` → `c1f75e4039faeb9f`
- **R1** (omission,hedge,voice): Dropped "the more's the pity" and the biblical "spend and be spent"; "than you perhaps think for" lost "perhaps"; "in his own proper person" and "bountifully laughable" flattened.

### 5.2  `4f29c0b0a06521dc` → `d1d2b1b4f21f2b16`
- **R1** (convention): "harpooneers"; "sea carpenters, and sea coopers, and sea blacksmiths" lost "sea".

### 5.3  `9fb88793eadd4348` → `f93d46911e6442d4`
- **R1** (omission,meaning): "he cannot have been three days landed from his Indian voyage" became "off his ship" (Indian voyage dropped; same class as the 1.1 slip); "smell almost as musky" became "just as sweet"; "he doubtless has tarried whole weeks" became "probably"; tenses shifted.

### 5.4  `74f3f9e35b1fcdd1` → `cf694f6b1abbae93`
- **R1** (convention): Single quotes.

### 5.5  `c3d1b3160393e138` → `019d91ecfe4e7d36`
- **R1** (meaning,omission): Last sentence reversed: "Still, for the most part, that sort of thing is to be had anywhere" (social polish can be acquired anywhere) became "that kind of worldly awkwardness can be found anywhere". Also dropped "the negro heart of Africa" period term (lead decision 1), "as Ledyard did", "which was the sum of poor Mungo's performances", "in the parlor".
- **R2-acc** (meaning): 'that sort of thing' is ambiguous right after two kinds of travel are described; a reader has to reread to see that it refers to 'a high social polish'. Naming the referent removes the reread; fidelity reviewer should confirm the referent against the source.

### 5.6  `eb8ac80806f86356` → `4510f4c894056135`
- **R1** (omission): "some sheepfold among the Green Mountains" became "some mountain farm" (name dropped); "without the slightest bashfulness" and "to my no small surprise" dropped.

### 5.7  `c00b9fb67e702233` → `e1002980d0b878ef`
- **R2-fid** (voice,technical): Source irony runs "I cannot say much for his breeding ... to do anything coolly is to do it genteelly". The candidate turns "breeding" into "table manners" and "genteelly" into "with style", which loses the breeding/genteel irony. It also drops "cordially" and "certainly", and turns "grappling the beefsteaks towards him" (hooking and dragging) into "spearing".

### 6.1  `ffb846e1eb025997` → `96de139bbafbab7f`
- **R1** (omission): Drops the named places "in the Apollo Green" (Bombay) and "beats all Water Street and Wapping" (flattened to "outdoes them all"); "affrighted ladies" softened; "savages outright" kept.

### 6.2  `6f1147baab45a98b` → `72d5c69897fcf931`
- **R1** (omission,meaning,convention): Melville's names "Feegeeans, Tongatobooarrs, Erromanggoans, Pannangians, and Brighggians" normalized and two replaced by "other South Sea islanders" (lead decision 3); "certainly more comical" dropped; "bombazine cloak" became "shabby cloak" (bombazine is a fabric, not shabbiness).
- **SWEEP-names** (convention): Lead decision 7 sweep (spelling variants of geographic/people names to modern standard form): Feegeeans -> Fijians

### 6.3  `ebe1c00ae067e0db` → `940354a1d4c70fc0`
- **R1** (omission,voice): Drops "in the dog-days" and "his two acres" (turned into "his field"), and "the comical things he does" loses "comical".

### 6.4  `985ef20aa7ba0eee` → `01e9f194b52c09f8`
- **R1** (meaning,omission,convention): "not like Canaan; a land, also, of corn and wine" replaced with an invented "a land of milk and honey"; "enough to frighten one" dropped; "scraggy scoria" flattened; "harpooneers" not converted.

### 6.5  `c6fb387a500df972` → `96767a18f5f07a70`
- **R1** (omission,voice): Final joke "Can Herr Alexander perform a feat like that?" deleted; "iron emblematical harpoons" blurred to "decorative"; "One and all" dropped.

### 6.6  `c230713a82a61026` → `708361d112727e25`
- **R1** (hedge): First sentence drops "they say", turning hearsay into fact; "burn their lengths in spermaceti candles" altered to "the finest".

### 6.7  `bcdc529e7dfe1d2a` → `53746aea24898a18`
- **R1** (omission): Drops "high in air" and "bountiful"; "congregated blossoms" and "superinduced" loosely rendered.

### 6.8  `03d4504f51b3a6b9` → `89ad4105c6f48373`
- **R2-fid** (voice,omission): Source: "the fine carnation of their cheeks" continues the rose/flower image; flattened to "fine color". "breathe such musk" becomes generic "perfume" (musk is the specific scent that sets up the "odorous Moluccas" spice image). "the young girls" altered to "the young women".

### 7.1  `b57b85d0fe39feee` → `9ed915ef943f286f`
- **R2-fid** (omission): Source: "Returning from my first morning stroll, I again sallied out upon this special errand" — "first" and "again" dropped (he goes out a second time); "A muffled silence reigned, only broken at times by the shrieks of the storm" — "at times" dropped.
- **R3-fix** (technical,meaning): Source: "my shaggy jacket of the cloth called bearskin" — bearskin is a shaggy woolen cloth. "my shaggy bearskin jacket" reads to a modern reader as a jacket made of a bear's pelt. Restore the cloth sense; rest of paragraph (incl. R2 restoration of "first"/"again") verified clean.

### 7.5  `981a4049c48fd575` → `b3142aedf737ba00`
- **R1** (meaning,omission,voice): "This savage was the only person present" softened to "He was" (lead decision 1); "the countenance if not the trappings of some unceasing grief" loses "if not the trappings"; "frigid inscriptions" / "I feel sure" (present tense) altered.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 7.6  `9b82411a27998c4e` → `af8a626764380e73`
- **R1** (omission,voice,convention): Drops "unbidden infidelities" and the stressed repetition "here, here lies my beloved"; uses single quotes; "cave of Elephanta" pluralized.

### 7.7  `ae1273455b4c900a` → `d1ba3850ff36d010`
- **R1** (meaning,omission): "the remotest Indies of this living earth" changed to "remotest shores"; "and deadly, hopeless trance" and "sixty round centuries" dropped; "we nevertheless maintain" weakened.

### 7.9  `7f514027b6c6a21e` → `196de8b7e69d1245`
- **R1** (hedge,technical,voice): "an immortal by brevet" (an honorary rank, like a brevet promotion) blurred to "by reputation"; the last "Methinks" ("Methinks my body is but the lees") loses its hedge; "In fact" and "aye" dropped.

### 8.0  `610c55731aa55dba` → `9d8475c81fc0cc82`
- **R1** (omission,convention,voice): "a certain venerable robustness" loses "venerable"; "No one having previously heard his history" dropped; "a newly developing bloom" becomes "vitality"; "harpooneer" not converted; "tarpaulin hat" and "pilot cloth jacket" altered.

### 8.1  `00781cf4da8aa7af` → `669a89590dba327a`
- **R1** (technical,voice): "man-ropes" changed to "hand-ropes"; "the main-top of his vessel" (the platform at the head of the lower mainmast) blurred to "the mainmast"; litotes "by no means in bad taste" flattened to "in perfectly good taste"; "nicely headed" dropped.

### 8.2  `d174d626c0941d2d` → `5729c7bb8f60ce81`
- **R1** (omission): Drops the qualification "as is usually the case with swinging ones"; "At my first glimpse of the pulpit" merged.

### 8.3  `2ffcf6d968e86971` → `2a4f01a60e88c908`
- **R1** (meaning,omission): "the meat and wine of the word" changed to "bread and wine" (a eucharistic image Melville does not use); the allusion "a lofty Ehrenbreitstein" deleted; "I see" and "for the time" dropped.

### 8.4  `bf7119beccb82208` → `694c57ca5032a161`
- **R1** (voice,convention,omission): Angel's speech in single quotes; loses "beat on, beat on" repetition and "for lo!"; "lee coast of black rocks" becomes "black cliffs"; "borrowed from the chaplain's former sea-farings" drops "strange".

### 8.5  `e2d538661cc91bc4` → `d262c0451d6dcf69`
- **R1** (technical,omission): "a ship's fiddle-headed beak" (a scroll-shaped bow head) changed to "figurehead"; "the same sea-taste that had achieved the ladder and the picture" loses its reference back.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 8.6  `57297ee8784b9ef2` → `5fe8957768d2d04c`
- **R1** (omission): "invoked for favourable winds" dropped; "ever this earth's foremost part" loses "ever"; "more full of meaning" weakened to "more fitting".

### 9.0  `2982a07429fd77fb` → `62336875219f698c`
- **R1** (convention): Dialogue in single quotes where the edition (and the rest of this chapter) uses straight double quotes. Wording kept.

### 9.4  `c94418df1a2a2747` → `bae0fe3f644a14ca`
- **R1** (convention): Hymn stanza opened with a single quote; the source opens each stanza with a double quote and closes only after the last. Wording and line layout kept.

### 9.5  `34307dff73ac5d96` → `3af88a871aad25f6`
- **R1** (convention): Quote convention as 9.4.
- **R4-mod** (unmodernized): hymn: light modernization (maw, they that), lines/rhyme kept

### 9.6  `cc3ec3dceeda9028` → `0fef5be122c86210`
- **R1** (convention): Quote convention as 9.4.
- **R4-mod** (unmodernized): hymn: light modernization (scarce, bowed), rhyme kept

### 9.7  `acc71d3e4269454e` → `afa10a5c450f7f7b`
- **R1** (convention): Quote convention as 9.4.
- **R4-mod** (unmodernized): hymn: light modernization (with speed, awful, radiant), lines kept

### 9.8  `77fe228da18a1a9d` → `05dd0cc66b78bb31`
- **R1** (convention): Quote convention as 9.4 (closing double quote after the last stanza).

### 9.9  `0abd6c60b46614f8` → `12c4e283e3cbd07e`
- **R1** (convention,voice): Outer single / inner double quotes reversed against the edition's convention; the nautical "clinch the last verse" (make fast) flattened to "hold tight to". Scripture wording kept as quoted.

### 9.10  `654e4d2af72238c3` → `5f45569875abca34`
- **R1** (omission,convention): "the sin of this son of Amittai" reduced to "Jonah's sin" and the parallel "As with all sinners among men" garbled into "Like all sinners, Jonah's sin"; "we sound with him" becomes "sink"; quote closed at paragraph end though the sermon continues (source opens each sermon paragraph and closes only at 9.19).

### 9.11  `5c9f3471d7a3dc0e` → `794c8b8b339890ad`
- **R1** (omission,voice,convention): Drops "That's the opinion of learned men", "the Syrian" coast, "Oh! most contemptible and worthy of all scorn", "vile" burglar, "carpet-bag"/"valise", the bill "stuck against the spile upon the wharf to which the ship is moored" and "containing a description of his person", "sympathetic" shipmates, "He will not confess himself suspected"; single quotes.

### 9.12  `d2b67c208751e7b9` → `ef96dfaf4fd51c6a`
- **R1** (convention,voice): Quote nesting reversed; "that harmless question mangles Jonah" softened to "torments"; the scripture citation "that he paid the fare thereof" (quoted as written text, Jonah 1:3) shortened; "at last he slowly answered" dropped "at last".

### 9.13  `8f9c35ffd5c0c646` → `1cb1529e57304f37`
- **R1** (omission,convention): "In this world, shipmates" and "to test the length of Jonah's purse" altered; "the smallest of his bowels' wards" (the prison-cell image) flattened to "the tightest chamber of its belly"; quote nesting reversed.
- **R2-acc** (read-aloud,unmodernized): 'feels the heralding foreboding of that stifling hour when the whale shall hold him' — 'heralding foreboding' stacks two near-synonyms and trips aloud; 'shall' is leftover archaic future in the preacher's narration.

### 9.14  `175c034387c77480` → `969c5a218b19b30f`
- **R1** (convention,omission): Quote nesting reversed; "with the weight of the last bales received", "alarms and frightens", "finds no refuge for his restless glance" (rendered "no rest") slightly altered.
- **R2-acc** (reread,convention): Opening sentence has a broken absolute construction ('and the ship, heeling over ... , the lamp ... still keeps') that has to be reread, and it slips into past tense ('it only made obvious ... among which it hung') inside present-tense narration.

### 9.15  `b7b36fbe29c56e8d` → `af2a1aff94521976`
- **R1** (omission,voice,convention): The whole simile "as the plungings of the Roman race-horse but so much the more strike his steel tags into him" is deleted; "praying God for annihilation" softened to "praying for oblivion"; "Jonah's prodigy of ponderous misery" reduced.

### 9.16  `7eb54b4de55de9c1` → `43c53710ae60af31`
- **R1** (meaning,hedge,omission,technical,convention): "shrieks in his dead ear" became "deaf ear"; Mapple's hedge "a berth in the cabin as I have taken it" dropped; "sees no black sky and raging sea" loses the sea; "finding no speedy vent runs roaring fore and aft" dropped; "grasps a shroud" blurred to "a rope"; "the frightened master" became "captain"; quote nesting reversed.
- **R2-acc** (term): 'grasps a shroud to look out at the sea' — a first-time reader/listener hears 'shroud' as a burial cloth; brief accurate gloss (shrouds are the standing-rigging ropes bracing a mast).

### 9.17  `0281e3e535960637` → `e4ad1910bee002a5`
- **R1** (convention): Quote nesting reversed and sermon quote wrongly closed at paragraph end; content otherwise complete (source's unclosed inner quote after "What people?" is closed here).

### 9.18  `f55547621a05ce15` → `1fd4d82678cc2387`
- **R1** (omission,voice,convention): Drops the apostrophe "O Jonah" and "for he knew that for his sake this great tempest was upon them" is paraphrased as "knowing the storm is his fault"; "not unreluctantly" rendered; quote nesting reversed. Jonah's confession (Jonah 1:9) is dramatized speech, so "hath made" is modernized to "has made".
- **R2-acc** (convention): Tense slip: 'at which the sailors became more and more appalled, but still they pity him' — past 'became' inside present-tense narration.

### 9.19  `088c78c3aa204e6a` → `b97f31a37d8c3ee6`
- **R1** (hedge,omission,convention): "as Jonah carries down the gale with him" is turned into "as if Jonah carried the gale" (fact made into speculation); "take heed to repent of it" dropped; "he will still look towards His holy temple" becomes "God's"; single quotes.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 9.20  `5108ecc062663363` → `46a1fe2ae917b09e`
- **R2-fid** (omission,voice): Source: "the howling of the shrieking, slanting storm without" — "shrieking" dropped; "his tossed arms seemed the warring elements at work" — "tossed" dropped, which carries the storm-tossed image.

### 9.22  `78e992861930b889` → `535db91ab2df3c1f`
- **R2-fid** (omission): Source: "bowing his head lowly, with an aspect of the deepest yet manliest humility" — "lowly" dropped.

### 9.23  `3fac3475153a6206` → `8065c6a0d86a38e8`
- **R1** (omission,voice,convention): "Jonah, appalled at the hostility he should raise" became "dreading" (loses the book's keyword "appal"); "all the watery world of woe bowled over him" became "misery poured over"; "his ears, like two sea-shells, still multitudinously murmuring of the ocean" loses "multitudinously murmuring"; "and when the word of the Lord came" reorders the clause; quotes. Scripture fragments (Jonah 2:3, 2:5, 2:2, 2:10) kept in their quoted wording.
- **R2-fid** (voice): Source: "his ears, like two sea-shells, still multitudinously murmuring of the ocean" — "multitudinously" (many-voiced, like a multitude) is rendered "over and over", which is repetition in time, not multitude. The word is current English; keep it.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 9.24  `09724cd33a53407e` → `b9f97b227c85b83b`
- **R1** (meaning,voice,convention): Audit slip: "Woe to him who seeks to please rather than to appal!" became "rather than to shake" — "appal" restored (modern spelling "appall"). "whose good name is more to him than goodness" loses its wordplay ("reputation ... righteousness"); "slights" and "even though to be false were salvation" ("would save him") weakened; "Yea" kept as "Yes"; single quotes.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 9.25  `787ef6b2a01c2a14` → `04aa3f3c28de3461`
- **R1** (meaning,technical,voice,unmodernized,convention): Audit slip: "gives no quarter in the truth" became "gives no quarter to the truth" (inverts the sense) — restored. "Is not the main-truck higher than the kelson is low?" blurred to "masthead ... keel"; "eternal delight and deliciousness" became "blessedness"; "boisterous mob" became "raging"; "top-gallant delight" hyphenation restored; Thy/Thine/Thee left in the closing prayer — modernized to Your/Yours/You per the edition's pronoun rule, keeping cadence and the capital for God.

### 10.0  `a0b7e22f6333bc48` → `1b43ab05d6db7d7c`
- **R1** (meaning,omission): "that little negro idol of his" softened to "his little idol" (lead decision 1: keep period term); "some time" before the benediction dropped.

### 10.1  `4b172831e0c551f7` → `95787e6fadddf43c`
- **R2-fid** (hedge): Source: "at every fiftieth page—as I fancied—stopping a moment" — Ishmael marks the fifty-page count as his own conjecture. "Every fifty pages or so" drops "as I fancied" and turns the hedge into loose approximation, while the rest of the paragraph builds the joke on exactly fifty.

### 10.2  `d6fcecdd28884cc8` → `08050c307ef98edc`
- **R1** (meaning,voice): "hideously marred about the face" (by tattooing) became "scarred"; "a certain lofty bearing about the Pagan" softened to "about the man"; "his uncouthness could not altogether maim" loses "altogether"; "this I will not venture to decide; but certain it was" compressed.

### 10.3  `1e72d31e9892ae86` → `3913483e164c8505`
- **R1** (hedge,omission,convention): Drops "never troubled himself with so much as a single glance"; hedges changed: "or but very little" dropped, "some twenty thousand miles" made exact, "no doubt he had never heard" softened to "probably"; quoted phrase "broken his digester" lost its quotation marks.

### 10.6  `916522a1a6ff629f` → `2e4ba66e04d0fd2d`
- **R1** (invention,omission): Invented closing sentences ("In a country where they don't regulate these things by law, I suppose they use this simple, savage way. In any case, he seemed to consider us joined.") replace the source's "In a countryman, this sudden flame of friendship would have seemed far too premature, a thing to be much distrusted; but in this simple savage those old rules would not apply."; also drops "the Pagan's breast", "left us cronies" and "quite as naturally and unbiddenly as I to him".
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 10.7  `759946a2dc3e1c36` → `eb573ad1659f750f`
- **R1** (invention,omission,meaning): Largely invented: a pouch "which also served as a pillow", sitting "on the edge of the bed", emptying pipe ashes, "a ritual of fire" and "offering me the idol to worship". Deleted: "and another social chat and smoke", "He made me a present of his embalmed head", groping "under the tobacco", "mechanically dividing", "I let them stay", "removed the paper fireboard", and Ishmael's hesitation "I deliberated a moment whether, in case he invited me, I would comply or otherwise".
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.
- **R4-acc** (convention): 'removed the paper fireboard' echoes 3.57's 'takes away the papered fire-board'. Match that term so the reader recognizes the same object.

### 10.8  `0ce709f0cec30ef7` → `41b1d07ff42b7ad3`
- **R1** (unmodernized,voice): Left near-verbatim 1851 ("thought I", "salamed before him twice or thrice", "what I would have my fellow man to do to me"); the stressed "that is worship" / "that is the will of God" lost their emphasis when the italics were stripped.

### 10.9  `44dd3bee37735ff1` → `da496832a5596924`
- **R1** (unmodernized): Left verbatim 1851: "How it is I know not", "there open the very bottom of their souls", inverted "lay I and Queequeg".

### 11.0  `b928621c09dd5c3e` → `6abafb1a7232e0cd`
- **R2-fid** (voice,omission): Source: "so entirely sociable and free and easy were we; when, at last, by reason of our confabulations, what little nappishness remained in us altogether departed" — "sociable" and "free and easy" become "relaxed and comfortable", and the comic "confabulations"/"nappishness" are flattened to "conversation"/"traces of sleepiness".

### 11.1  `c92443b5e2d15e29` → `37ab960433fcfc4e`
- **R2-fid** (omission,voice): Source: "If you flatter yourself that you are all over comfortable" — "flatter yourself" (self-deception) softened to "believe"; "you feel most delightfully and unmistakably warm" — "unmistakably" dropped.

### 11.2  `0500c527759fc6fe` → `f7d99d6cb3687412`
- **R2-fid** (omission): Source: "all at once I thought I would open my eyes" — "all at once" dropped; "the more to concentrate the snugness of being in bed" — "snugness" becomes "feeling"; "the imposed and coarse outer gloom" — "coarse" dropped; "the hint from Queequeg that perhaps it were best to strike a light" — the tentative "hint ... perhaps" becomes a plain suggestion; "a blue hanging tester of smoke" — "hanging" dropped.
- **R2-acc** (reread,read-aloud): 'I should mention that although I'd been so against his smoking in bed the night before, see how elastic...' — the 'although' clause never resolves and the sentence breaks; also 'lit by the flame of the newly lit lamp' repeats 'lit'.

### 11.3  `c2fb178d3da1dd77` → `009c963dc3d13885`
- **R1** (meaning,hedge): "I but ill comprehended not a few of his words" (many words poorly understood) became an invented quantity, "barely understood half his words"; "such as it may prove" hedge softened.

### 12.1  `53d6ae5e39b1650a` → `856fc5f5aebbbf9b`
- **R1** (meaning,voice): "a new-hatched savage" softened to "a child" (lead decision 1); "a specimen whaler or two" became "a whaling ship or two"; "the cannibal propensity he nourished" became "picked up".

### 12.2  `822b0c062a8dabdb` → `44aeb56f9ea0c4a4`
- **R1** (omission): Drops "still afloat" (the hidden canoe) and "paddle low in hand"; "vowed a vow" and "though hacked in pieces" otherwise fine.

### 12.3  `b716d3fb342ef0a2` → `31a183b0a9a2d03b`
- **R1** (omission,voice): "if thereby he might happily gain the power of enlightening his untutored countrymen" blurred to "help his people"; "disdained no seeming ignominy" loses "seeming"; "spent their wages in that place also" loses the stress; "a wicked world in all meridians" became "every direction"; "In vain" dropped.

### 12.4  `09e3fcd36c7cae57` → `647e69c537910f0d`
- **R1** (voice,omission): Irony of "tried to talk their gibberish" flattened to "speak their language"; "an old idolator at heart" loses "old".
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 12.5  `a6b13f042fecc9f0` → `1c9ade631039dc34`
- **R1** (meaning,voice,convention): The joke "as soon as he felt himself baptized again" became "once he felt properly cleansed again"; "he might now consider his father dead and gone" hedged to "probably dead"; "in lieu of a sceptre"; "harpooneer" not converted.

### 12.6  `126761e37d454662` → `1f228f031dd47df3`
- **R1** (convention,omission): "harpooneer" not converted; "the mysteries of whaling" and "as known to merchant seamen" loosely rendered; "we'd boldly dip" shifts the subject (source: he resolved to dip, "with both my hands in his").

### 12.7  `d5bcf1ceeeabedf9` → `40d266c00605a478`
- **R2-fid** (omission): Source: "we rolled over from each other, this way and that" — "this way and that" dropped.

### 13.0  `2db72169bb4fe36f` → `4562ca721307fcc7`
- **R1** (invention,voice): "disposing of the embalmed head to a barber" became "selling" (a sale the source does not state); "cock and bull stories" flattened to "wild stories".

### 13.1  `26afd9fd60bdf8eb` → `f552e0312ad82a72`
- **R1** (invention,omission,hedge): "of assured stuff" became an invented "proven steel"; the hedge "in substance, he replied" and the qualification "though in no wise obliged to furnish them" dropped; "reapers and mowers" / "farmers' meadows" altered.

### 13.2  `c91f175b22e995d4` → `160751fc861b2bd3`
- **R1** (hedge,convention): "The owners of his ship, it seems, had lent him one" loses "it seems"; the source's tense shift into the vivid present ("puts ... lashes ... marches") and "one would think" dropped; single quotes.

### 13.3  `6de6065210cb0bdc` → `62b9d0da3107bd36`
- **R1** (omission,hedge,meaning,voice,convention): Drops the joke "at least for a sea captain" and the hedge "it seems"; "between the High Priest and his majesty the King, Queequeg's father" garbled to "King Queequeg's father"; "consecrated and consecrating fingers" reduced; Queequeg's dialect "what you tink now?" standardized (lead decision 5); single quotes.

### 13.4  `ad8bc48ff4893131` → `5a03bbfa56f69ca0`
- **R1** (omission): Final climax "Such is the endlessness, yea, the intolerableness of all earthly effort" loses "the intolerableness"; "casks on casks" and "all betokening that new cruises were on the start" reduced.
- **R2-acc** (reread): 'piled on her wharves' directly after 'she glided down the Acushnet' reads as the schooner's wharves; the wharves are New Bedford's.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 13.5  `821d6c693d347982` → `db6bca22bdd2161e`
- **R1** (omission,meaning,voice): "that Tartar air" became "brisk, wild air"; "how I spurned that turnpike earth!" deleted; "heels and hoofs" loses hoofs; "the magnanimity of the sea" changed to "magnificence" (different claim).

### 13.6  `91f81c7fbae6587f` → `67f45a90460dc002`
- **R1** (meaning,omission,voice): Period term softened: "a whitewashed negro" became "a whitewashed Black man", and "the brawny savage" became "Queequeg" (lead decision 1). "boobies and bumpkins" and "the heart and centre of all verdure" (the greenness joke) flattened; "the bumpkin's hour of doom" became "the fool's hour".

### 13.7  `b031839ca39e95b8` → `98c347d41ffe466e`
- **R1** (voice,convention): The bumpkin's "Capting! Capting!" standardized to "Captain" (lead decision 5: keep light dialect); repetition "Capting, Capting" reduced; single quotes.

### 13.8  `ea19faa7e75440f3` → `7ecf0dbbb9603042`
- **R1** (voice,convention): "a gaunt rib of the sea" changed to "scarecrow"; "what in thunder" coarsened to "what the hell" (register); stress on "you" lost; single quotes.

### 13.9  `4b65758d0be8086a` → `047a2b6099311de0`
- **R1** (convention): Single quotes; wording kept.

### 13.10  `bd247f7cbf87e0d4` → `b0cd6bc7d30fe6b4`
- **R1** (voice,convention): Ishmael's comic slide into Queequeg's pidgin ("He say ... you came near kill-e that man") standardized away; this sets up 13.11 and the Captain's "kill-e you" in 13.12.

### 13.11  `990ad3179d5b7356` → `b3474e4dfc4d91b5`
- **R1** (voice,convention): Queequeg's "-e" dialect ("bevy small-e fish-e ... kill-e") thinned; the Captain mocks it in 13.12, so it must survive (lead decision 5: light, readable flavor).

### 13.12  `008894d5e8856d21` → `da2eb40c861b4d24`
- **R1** (voice,convention): Captain's mocking "I'll kill-e you" standardized, losing the joke; "mind your eye" (echoed in 13.13) became "Watch yourself"; single quotes.

### 13.13  `fd805fc1ab70b3c7` → `9dee6e8cd0269df0`
- **R1** (omission,technical,voice): The echo "high time for the Captain to mind his own eye" lost; "and all was safe" and "seeming to see just how matters were" dropped; "clearing away the stern boat" blurred to "the rescue boat"; "a noble trump" flattened to "a hero"; "he was seen swimming" became "we watched him".
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 13.14  `7c92f2e159f72dce` → `834c8e84dc5e5121`
- **R1** (omission,meaning,convention): "a medal from the Humane and Magnanimous Societies" reduced to "a medal"; "in all meridians" changed to "every latitude" (meridians run the other way); "Was there ever such unconsciousness?" reframed as lack of self-importance; single quotes.

### 14.1  `422ef83e4f8f6786` → `033c003a2af66ecc`
- **R1** (invention,omission,voice): "as to the backs of sea turtles" gains invented barnacles; "a spile to stop a leak in an oil cask" loses the oil cask; "three blades in a day's walk a prairie" loses "in a day's walk"; the piled-up "shut up, belted about, every way inclosed, surrounded, and made an utter island of by the ocean" compressed to "enclosed"; "Look at it" dropped.

### 14.2  `ffa42c63f86c364d` → `beb16652bac9ad76`
- **R1** (meaning,omission): Period term "the red-men" replaced by "Native Americans"; "an infant Indian" and "the poor little Indian's skeleton" lose "Indian" (lead decision 1); "Thus goes the legend. In olden times" dropped.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 14.3  `bd544c7712a43fa9` → `007ecfdfcbf243b0`
- **R1** (convention,omission): Melville's spellings "Behring's Straits" and "Himmalehan" normalized (lead decision 3); "quohogs" genericized to "clams"; "his most fearless and malicious assaults" loses "fearless"; "animated mass" became "living creature".
- **SWEEP-names** (convention): Lead decision 7 sweep (spelling variants of geographic/people names to modern standard form): Behring's Straits -> peeped in at the Bering Strait; Himmalehan -> Himalayan

### 14.4  `3510d94c4f23caa4` → `cb172029dd929edd`
- **R1** (meaning,omission,technical): "Let America add Mexico to Texas" changed to "annex Mexico"; "this terraqueous globe" (land-and-water) blurred to "watery globe"; "privateers" dropped; "extension bridges" became "floating bridges"; "resides and riots" softened.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 15.0  `140032247f38621c` → `eceb115c330d4e86`
- **R1** (voice,omission): The pun "try pot-luck at the Try Pots" flattened to "try our luck"; "at first" and "our first point of departure" dropped; "these crooked directions of his" lost.
- **R2-acc** (read-aloud,unmodernized): 'knocking up a peaceable inhabitant to ask the way' — the old sense (to rouse by knocking) is lost on modern American readers, who hear a sexual meaning; an unintended joke when read aloud.

### 15.1  `7cab71c4ba5be2cd` → `cc06cfffe3dc5646`
- **R1** (technical,meaning): "suspended by asses' ears" (the name for the pots' side handles) and "cross-trees" blurred to "handles" / "crossbeams"; the allusion "oblique hints touching Tophet" replaced by "Hell" and loses "oblique"; "not a little like a gallows".
- **R2-fid** (technical,voice): Answering the repair editor's open question: "suspended by asses' ears" — the gloss "their ear-shaped handles known as asses' ears" asserts a trade term that cannot be confirmed; per the brief, an unsure gloss is dropped. Also "oblique hints touching Tophet" — "oblique" is current English and is the point (the pots hint indirectly); "sly" shifts it to intent. Tophet gloss kept (accurate).

### 15.2  `e1dded1474a0380b` → `7ce346f9d078ea18`
- **R1** (meaning): "carrying on a brisk scolding with a man" became "a brisk argument" (she is scolding him, as 15.5 and 15.9 confirm); "swinging there" dropped.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 15.3  `80f30bb64ae4754d` → `fe54d36b073afc2c`
- **R1** (voice,convention): Mrs. Hussey's colloquial threat "or I'll be combing ye!" replaced with "give you a thrashing" (lead decision 5: keep light dialect); single quotes.

### 15.4  `a77b681850ca70e8` → `0acd3534c42638fd`
- **R1** (convention,omission): Single quotes; "all right" dropped.

### 15.5  `1712e2775b23ab91` → `f6f55f95813064a6`
- **R1** (convention): Single quotes; "postponing further scolding for the present" otherwise kept.

### 15.6  `432fe4140c3c73ac` → `a1e0a5afa263f1eb`
- **R1** (convention,voice): Single quotes; Ishmael's comic "Cods" lost.

### 15.7  `3515f242f5d0f68d` → `91106076d929d067`
- **R1** (convention): Single quotes.

### 15.8  `0b90de78a5d8a6c2` → `94d0c01b76320878`
- **R1** (voice,convention): Ishmael's colloquial "says I ... ain't it, Mrs. Hussey?" standardized and the second "Mrs. Hussey" dropped; stress on "that" lost; single quotes.

### 15.9  `ab2f2179b7893267` → `e4ca081e9e540249`
- **R1** (omission,convention): "who was waiting for it in the entry" (waiting for his scolding) loses "for it"; "seeming to hear" kept; quote marks.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 15.10  `6873c55aeedd1254` → `23c613a339adb78c`
- **R1** (convention,omission): Single quotes; "for us both" dropped.

### 15.11  `872b0d7da5b05905` → `422034774b87148a`
- **R1** (hedge,convention): "the apparently cheerless prospect" loses "apparently"; "Oh, sweet friends!" loses "sweet"; quote marks around the announcement added and single-quoted.

### 15.12  `4402383ee5922df1` → `978821b1948bda6e`
- **R1** (voice,convention): "that stultifying saying about chowder-headed people" loses "stultifying"; Ishmael's colloquial "thinks I to myself ... this here ... ain't that" flattened; single quotes.

### 15.13  `c3bbdc4a132e14ef` → `26d51e1c42cc4f31`
- **R1** (omission,voice): "Hosea's brindled cow" loses "brindled"; the pun "looking very slip-shod" (each foot in a cod's head) became "slovenly"; "I could not at all account for" and "happening to take a stroll" slightly reduced.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 15.14  `62055a324f3384dc` → `130e2e9822abb141`
- **R1** (voice,omission,convention): Mrs. Hussey's dialect ("unfort'nt v'y'ge", "ile", "sich dangerous weepons", "this here iron") standardized away (lead decision 5); Ishmael's repeated "but why not?" and "she allowed no harpoon in her chambers" reduced; "to-morrow" dropped; single quotes.

### 15.15  `51b9eefef41b0e06` → `4a33fe9e275a52ce`
- **R1** (convention,voice): Single quotes; Ishmael's "says I" standardized.

### 16.0  `6fd9eb4477b7fcea` → `09e49936b4655dda`
- **R1** (omission,meaning,voice): "diligently consulting Yojo", "strongly insisted upon it everyway", "earnestly enjoined", "in concert selecting our craft" and "for all the world as though it had turned out by chance" were thinned; "black little god" became "small black idol"; "for the present irrespective of Queequeg" became "without waiting for Queequeg".

### 16.1  `d26f07b6e313b915` → `f8f337e033a722da`
- **R2-fid** (hedge,omission): Source: 'I have forgotten to mention that, in many things, Queequeg placed great confidence' and 'who perhaps meant well enough upon the whole, but in all cases did not succeed'. Candidate drops the restriction 'in many things', hardens 'perhaps' to 'probably', and resolves the ambiguous 'in all cases did not succeed' to 'didn't always succeed'; 'surprising forecast' thinned to 'ability to predict'.

### 16.2  `44b4570aa86fecb1` → `ca92d7bdcefefa54`
- **R1** (omission,voice): Dropped "us and our fortunes", "that trifling little affair" (the comic understatement), "though I applied myself to it several times", the allusion "his liturgies and XXXIX Articles" (flattened to "rituals and articles of faith"), "humiliation", and "I peered and pryed about the Devil-dam". Ship names re-spelled against the source paragraph.

### 16.3  `429f556f0e681d00` → `b99e423d1e379c6d`
- **R1** (omission,meaning,voice): Names and images changed or lost: "Thorkill-Hake's carved buckler or bedstead" became "a Viking's carved shield"; "barbaric Ethiopian emperor" became "barbarian African emperor"; "French grenadier" became "French soldier"; "venerable bows looked bearded" became "sturdy bow"; "hempen thews and tendons" became "ropes and rigging"; "turnstile wheel", "reverend helm", "curiously carved", "unpanelled", "base blocks of land wood" and "fiery steed" flattened.

### 16.4  `0bb8b996dcf31b3b` → `8b4f044a46f8395e`
- **R1** (omission,meaning): "some old Pottowottamie Sachem's head" became "some old Native chief's head" (name lost); "laced together" dropped; "to propose myself as a candidate" thinned.
- **R2-acc** (convention): The parenthetical gloss wedged inside a possessive, "Sachem's (chief's) head", is awkward to read and nearly impossible to read aloud. Reordered so the gloss follows the noun; no content changed.

### 16.5  `28057679cbeb5332` → `224919912439c46c`
- **R2-fid** (voice,omission): Source: 'an old-fashioned oaken chair, wriggling all over with curious carving; and the bottom of which was formed of a stout interlacing of the same elastic stuff'. 'wriggling ... curious carving' flattened to 'elaborately carved', and 'stout interlacing' lost.

### 16.6  `46244f5643eb4dae` → `dd8ea2a9f7f94964`
- **R1** (hedge): Source hedges "There was nothing so very particular, perhaps"; the candidate dropped "perhaps" and made it flat fact.

### 16.14  `98b561d59cef5ab1` → `17a4d4072b9be3be`
- **R1** (voice): Peleg's characterizing diction flattened: his mispronunciation "marchant service" (three times, after "Merchant service be damned"), "Talk not that lingo to me" and "ye feel considerable proud" were normalized.

### 16.15  `93845e070a51507a` → `b54e5e843fe2fc93`
- **R2-fid** (voice,omission): Source: 'under the mask of these half humorous innuendoes, this old seaman, as an insulated Quakerish Nantucketer, was full of his insular prejudices'. The 'mask', 'innuendoes' (became 'accusations') and the insulated/insular wordplay were lost.
- **R3-fix** (hedge): Source: 'and rather distrustful of all aliens'. The qualifier 'rather' is dropped, so a mild distrust becomes flat suspicion.

### 16.23  `096df874357134d9` → `dcd4972c8348090e`
- **R2-fid** (voice): Source: 'Was the other one lost by a whale?' Peleg's next line echoes it exactly ('Lost by a whale!', kept in 16.24); the candidate's 'lost to a whale' breaks the echo.

### 16.24  `0ae0a54ee0a6f7e6` → `fd3958bd46a12d4b`
- **R1** (voice): Peleg's "monstrousest parmacetty that ever chipped a boat" normalized to "most monstrous sperm whale that ever smashed a boat"; restores his sea-dialect word (whose sense is clear from "Lost by a whale") and "chipped".

### 16.25  `cc8bfcd1fb5f5a73` → `5230d43d3a07d65b`
- **R2-acc** (convention): The sentence is phrased as a question ("But how could I have known ...") but ends with a period, which makes it hard to voice. Changed the final mark to a question mark.

### 16.26  `4410cdcce9ade5b0` → `4b023703bfdd7612`
- **R1** (omission,voice): "thy lungs are a sort of soft" and "thou dost not talk shark a bit" became "you're a bit soft ... You don't talk tough"; the lungs image and the shark idiom (which Peleg returns to in 18.23, "sharkish") were lost, and the doubled "Sure ... sure of that?" flattened.

### 16.28  `52a7970c5f6c4d0f` → `6496a5230003930a`
- **R1** (voice): Peleg's "marchant service" normalized again; "don't aggravate me" softened to "don't push me"; "Hard down out of that!" (a helm order used as a rebuke) flattened.

### 16.34  `ae9486785804f531` → `7a1e8e6a37ec3eab`
- **R1** (omission): "was now obliquely pointing towards the open ocean": "obliquely" dropped.

### 16.40  `6ede67058cac4d54` → `f1695fc2985c2f3f`
- **R1** (meaning,omission): "approved state stocks bringing in good interest" became "government bonds"; "bringing in good interest" lost and the instrument changed.

### 16.42  `197ae48cb81badfb` → `6a382ce79c4fdb62`
- **R1** (meaning,omission,voice): "morbidness" (three times: "overruling morbidness", "a certain morbidness") became "darkness", a change of sense; "globular brain and a ponderous heart" became "powerful mind and a deep heart"; "virgin voluntary and confiding breast" became "wild breast"; "and thereby chiefly, but with some help from accidental advantages" dropped; "makes one in a whole nation's census" became "one in a million"; "poetical Pagan Roman" became "heroic pagan Roman"; "O young ambition" lost its apostrophe.

### 16.43  `a44e552fd6d21339` → `d675f8d75310f379`
- **R1** (technical,voice,omission,invention): "spilled tuns upon tuns of leviathan gore" became "barrels upon barrels of whale blood" (measure changed); "cared not a rush" became "didn't give a damn" (an added oath in Ishmael's narration); the joke "short clothes of the drabbest drab" became "drab short pants"; "broad shad-bellied waistcoat" became "wide-bellied"; "self-same serious things the veriest of all trifles", "one single jot", "goodly age" and "straight-bodied coat" thinned.

### 16.45  `fb56dbd1bc9aa0b0` → `39f2be061ee37375`
- **R2-fid** (meaning): Source: 'his drab vesture was buttoned up to his chin'. 'Vesture' is clothing generally (his coat), not a vest; 'drab vest' changes the garment.

### 16.52  `5fda87b0547800cc` → `d2a5761e278c0104`
- **R2-fid** (voice): Source: 'went on spelling away at his book in a mumbling tone'. 'Spelling away' (slowly sounding his way through, which sets up Peleg's thirty-years joke in 16.46) became plain 'reading'.

### 16.53  `ee55981cae376d53` → `23ee7f5fe3bada48`
- **R1** (omission): "I made no doubt that from all I had heard I should be offered" — "from all I had heard" dropped (the basis of his confidence); "and all that" and "clear net proceeds" thinned.

### 16.54  `a4cf0aad697681c9` → `8c82f282b9a6b383`
- **R1** (voice): "princely fortune" / "princely fortunes" reduced to plain "fortune(s)", losing the irony; "I thought that the 275th lay would be about the fair thing" thinned.

### 16.55  `cdcec85ab87d754c` → `7f0bbcd0d89a3966`
- **R2-fid** (omission,hedge): Source: 'the other and more inconsiderable and scattered owners' lost 'scattered'; 'I did not know but what the stingy old Bildad might have a mighty deal to say' (a possibility) became 'I suspected'; 'Peleg was vainly trying to mend a pen' lost 'vainly'.
- **R3-fix** (hedge): Source: 'But one thing, nevertheless, that made me a little distrustful about receiving a generous share'. 'a little' dropped (candidate: 'made me uneasy'), strengthening the unease; 'nevertheless' (contrast with the preceding hopes) also dropped.

### 16.57  `997ef1514c0d2cb5` → `f6e31f926242456d`
- **R1** (unmodernized): Bildad's "Thou knowest best" left in 1851 grammar. Modernized per the brief (Quaker speech rendered as "you"); the scripture fragment he mumbles stays as quoted.

### 16.58  `4ae92ab7e5405157` → `89754d7c6145ff44`
- **R1** (omission,voice): The arithmetic joke "though seven hundred and seventy-seven is a pretty large number, yet, when you come to make a teenth of it, you will then see, I say" was dropped; "shall not lay up many lays here below" and "exceedingly long lay" flattened ("absurdly long lay").

### 16.62  `451297713ca28f26` → `8b489d5335387b61`
- **R1** (unmodernized): Bildad's "thou hast a generous heart; but thou must consider ... thy duty" left in archaic grammar; "the duty thou owest" and "too abundantly reward the labors" thinned.

### 16.63  `4c78919dca579cda` → `8c28225d8142e926`
- **R1** (omission,voice): "Thou Bildad!" reduced to "Bildad!"; "a conscience to lug about" and "founder" flattened.

### 16.64  `55d6ca56383f9f24` → `d27cd1b3404666dc`
- **R1** (unmodernized): "thy conscience", "thou art still an impenitent man", "sink thee" left in archaic grammar; "foundering down" and "impenitent" (which 16.67 echoes) thinned.

### 16.65  `065190306554736e` → `2ed33bd813485fe4`
- **R1** (omission,meaning,voice): Dropped the oath "start my soul-bolts" and "all-fired"; "canting" (hypocritically pious) became "droning"; "a straight wake with ye!" flattened; "human creature" became "human being".

### 16.66  `6a3a4aa7b1d657ad` → `2464e155e965a71a`
- **R1** (omission): "Bildad for that time eluded him": "for that time" (implying more such rushes) dropped.

### 16.67  `be8bac78ffd9b0e0` → `5b5ed1ed913aec31`
- **R1** (omission): "the two principal and responsible owners" lost "responsible"; "impenitent Peleg" (Bildad's word from 16.64) lost; "thou used to be good at sharpening a lance, mend that pen" kept.
- **R2-fid** (hedge): Source: 'though he twitched a little as if still nervously agitated'. The 'as if' appearance became fact ('with nervous agitation').

### 16.71  `76f9d1fcb4c6280d` → `2ea6aacbf8093e0d`
- **R2-acc** (convention): A participial fragment ("turning to me") dangles after the quotation with no subject, which stumbles when read aloud. Added "he asked".

### 16.80  `2a9345a6221a02fa` → `f9462379cdb8f074`
- **R1** (meaning,hedge,convention,voice): "the old squaw Tistig, at Gayhead" softened to "old woman" and re-spelled "Gay Head" (lead decisions 1 and 3); "And, perhaps, other fools like her" lost its hedge; "any utter, hopeless harm in Ahab" became "evil"; "a sweet, resigned girl" became "patient"; "Ahab has his humanities!" became "humanity".
- **SWEEP-names** (convention): Lead decision 7 sweep (spelling variants of geographic/people names to modern standard form): Gayhead -> Gay Head

### 16.81  `db48b2b975cfa7c1` → `6420b511a0917fef`
- **R1** (omission,voice): "a certain wild vagueness of painfulness" became "a strange, vague unease"; "incidentally revealed", "that sort of awe, which I cannot at all describe" and "so imperfectly as he was known to me then" thinned.

### 17.0  `05470bc28010524b` → `4be6aeb924816590`
- **R1** (invention,omission,voice): Invented "preserved body" for "the torso of a deceased landed proprietor"; the joke "footmanism quite unprecedented in other planets" became "servility unmatched anywhere else"; "never mind how comical" softened to "odd"; "those other creatures" became "people".

### 17.2  `43f2d70366b1aadf` → `ab977f5385c6d9d9`
- **R1** (voice,omission): "the key-hole prospect was but a crooked and sinister one" became "the view was narrow and useless"; "the wooden shaft of Queequeg's harpoon" thinned.

### 17.3  `47a4f68f239cffc6` → `5aafd5d6f038de8d`
- **R1** (omission): The chambermaid's cries "La! la, ma'am!—Mistress! murder!" lost "Mistress!"; "not a mouse to be heard" flattened.

### 17.4  `140a5091dbd84ad2` → `211e6c6c8a74ef73`
- **R1** (meaning,technical): Period term softened: "scolding her little black boy" became "her little kitchen boy" (lead decision 1). "attending to the castors" (the condiment stands) became "setting the table", which also sets up the pun in 17.5.

### 17.5  `588d097d1394f603` → `57297267eaf4b75b`
- **R1** (voice,omission): The pun "the entire castor of her countenance" became "the full authority of her expression"; "unmethodically" dropped.

### 17.11  `305ee43bf9980854` → `755d5f96621eb422`
- **R1** (omission,voice): "but, alas! Queequeg's supplemental bolt remained unwithdrawn within" lost "alas" and "supplemental"; "I guess", "side-pocket", "premises spoiled" thinned.

### 17.16  `06d253038ffb1a57` → `6100c0baaa021f95`
- **R2-fid** (hedge,omission): Source: 'in all probability he had been sitting so for upwards of eight or ten hours'. 'upwards of' dropped.

### 17.22  `8ec5fb25b9e4f22c` → `6cbdba0d40f803ad`
- **R2-fid** (technical): Source: 'he had nothing but his ordinary round jacket on'. A round jacket is a short, tail-less sailor's jacket; 'light jacket' invents a quality the source does not state.

### 17.23  `d7496da95d66c6be` → `e09d77922f4293c4`
- **R2-fid** (omission): Source: 'pressed his forehead again against mine' — 'again' (recalling the earlier forehead-pressing of their friendship) dropped.

### 17.25  `4b12042e6ea38f95` → `53936b0754c2162e`
- **R1** (meaning,technical): Period term softened: "such an extremely sensible and sagacious savage" became "sensible and wise person" (lead decision 1). "dyspeptic religionists" became "sickly religious people", blurring the dyspepsia (indigestion) argument that the paragraph's apple-dumpling joke depends on.

### 17.28  `e3e4c5a0a96208dc` → `47b26ac5f65b639d`
- **R1** (voice): The irony "hopelessly lost to evangelical pagan piety" became "proper pagan devotion".

### 18.4  `40a9572c4dec8fa9` → `514aef0928d3753a`
- **R1** (meaning,invention): Period term softened: "many tattooed savages" became "tattooed islanders" (lead decision 1); "local" churches is added.

### 18.8  `a8535fb407d7530f` → `d237503363c007ec`
- **R2-fid** (voice): Source: 'I pass it every Lord's day'. Bildad's pious 'Lord's day' flattened to 'Sunday'; the same phrase survives in his farewell (22.19).

### 18.10  `2fddc7e3a43815d2` → `e0a47f2b8f712bfe`
- **R1** (unmodernized,meaning): Bildad's "thou art skylarking with me—explain thyself ... What church dost thee mean?" left archaic; "thou young Hittite" was changed to "young heathen" (a biblical name lost).

### 18.11  `b964fb30ca65670a` → `0c111b1ed3634cbe`
- **R1** (meaning,voice): "the same ancient Catholic Church" was replaced by "universal Church", which drops the word Melville plays on; the emphasis "in _that_ we all join hands" and "no ways touching" thinned. The capitalized word is kept with a brief gloss.

### 18.12  `7122cf6060bd7eb3` → `17e615442ab03575`
- **R2-fid** (invention): Source: 'looks like good stuff that'. 'good steel' specifies a material the source does not name.

### 18.14  `815c92e03d0b6c30` → `8fcdf54f02e19cce`
- **R1** (voice): Queequeg's pidgin ("you see him small drop tar on water dere? ... spose him one whale eye, well, den!") was standardized to fluent English, while his next line (18.15) keeps the pidgin; per lead decision 5 a light dialect flavor is restored. "taking sharp aim", "darted the iron" restored.

### 18.21  `ebf76d98cc297e79` → `c531009bfd081020`
- **R1** (unmodernized,meaning,omission): Bildad's speech left in archaic grammar ("thee", "thou still clingest to thy", "thine"); "a Belial bondsman" became "a servant of wickedness" (name lost) and "the idol Bell" was changed to "Baal" (Melville's Bel-and-the-Dragon allusion altered); "steadfastly eyeing" and "mind thine eye" thinned.

### 18.23  `811da1807b96f4d8` → `34f2ea0e06de82cc`
- **R1** (voice): Peleg's shark idiom "it takes the shark out of 'em; no harpooneer is worth a straw who aint pretty sharkish" became "fight" / "fierce"; "plaguy soul", "for fear of after-claps", "got stove", "joined the meeting, and never came to good" thinned.

### 18.24  `98d029eecc2cc53f` → `21b36310b7824bde`
- **R1** (unmodernized): Bildad's reply left in 1851 grammar ("Thou thyself ... hast", "Thou knowest", "canst thou", "thine own heart", "didst thou"); "prate" and "belie" flattened.

### 18.25  `e519617ad4f0b170` → `feafcc7db24d50d7`
- **R1** (technical): "how to rig jury-masts" became "emergency masts" (whaling/nautical term lost); "Death and the Judgment" (repeated from Bildad) shortened.

### 19.1  `08e3a6f23b457e8d` → `dcbdb1a229e8b907`
- **R1** (technical,invention,voice): "A confluent small-pox" became "A severe case of smallpox"; "the complicated ribbed bed of a torrent, when the rushing waters have been dried up" became "the scarred, ribbed bed of a dried-up stream" ("scarred" added; "complicated", "torrent", "rushing waters" lost).

### 19.10  `710dd88a15a2ab36` → `64e7bc65de521efe`
- **R2-acc** (convention): With no italics in the edition, the bare word "he" at the end of the sentence reads as a pronoun, not as the word being stressed. Quoting it (as the edition does with "teenth" in 16.58) makes the sense clear.

### 19.13  `e2a8b82ff994e5c6` → `323b013737647a62`
- **R1** (voice): "riveted with the insane earnestness of his manner" softened to "caught again by the unsettling intensity".

### 19.22  `f52b90258b253c20` → `1a1b566386c0a489`
- **R1** (meaning,technical,voice): "Step and growl; growl and go" became "Obey and complain — complain and obey"; "the silver calabash" became "silver cup"; "skrimmage" and "parmacetti" normalized; "according to the prophecy" rephrased. Elijah's hints restored in their order, with light flavor.

### 19.26  `1c00ed094a31238b` → `58b163720ce84124`
- **R1** (omission): "the ineffable heavens bless ye": "ineffable" dropped.

### 19.28  `e42f49465a79175a` → `ae33547f4dadac00`
- **R2-fid** (hedge,meaning): Source: 'tell 'em I've concluded not to make one of 'em'. The source leaves 'em' unspecified (the chapter's ambiguity); 'not to be one of the crew' resolves it.

### 19.33  `50c957a94bb93ad1` → `117a6c9ed6963e2c`
- **R1** (meaning,hedge,omission,technical): Period term softened: "the prediction of the squaw Tistig" became "old woman" (lead decision 1); "we had not gone perhaps above a hundred yards" lost its hedge; "the silver calabash" became "cup"; "the Cape Horn fit" became "incident"; "a humbug, trying to be a bugbear", "shrouded sort of talk" and "vague wonderments and half-apprehensions" flattened.

### 19.34  `a53dc3067ec8c28e` → `c4d5f4aebcae7e5f`
- **R2-fid** (voice): Source: 'I pronounced him in my heart, a humbug' repeats 19.33's 'nothing but a humbug'; the candidate's 'fraud' breaks the deliberate echo that 19.33 keeps.

### 20.1  `3bd4e836c1a6f874` → `a20e235bfad06951`
- **R2-fid** (hedge): Source: 'But it seems they always give very long notice in these cases'. 'it seems' and the general 'always' became 'as usual, they gave'.

### 20.2  `861f6bfe2631eade` → `de539e4bb4ab75e5`
- **R1** (omission,invention,technical): "far from all grocers, costermongers, doctors, bakers, and bankers" lost "costermongers" and "bankers", and "supply shops" was invented; "spare spars" became "spare masts" (spars include yards and booms); "and spare everythings, almost" flattened.

### 20.4  `336e20e2ee539712` → `b6c467f8d506fa67`
- **R1** (omission,voice): "like a sister of charity did this charitable Aunt Charity" became "sister of mercy", which breaks the triple pun on her name; "a score or two of well-saved dollars" became "a tidy sum" (number lost); "the small of some one's rheumatic back" became "someone's aching back".
- **R2-fid** (meaning): Source: 'nothing should be found wanting in the Pequod, after once fairly getting to sea' (the ship). Immediately after 'if she had anything to say about it' (Aunt Charity), 'once she was properly at sea' reads as if Charity were going to sea.

### 20.5  `ee520ff1568e0e23` → `a629c686938460c8`
- **R2-acc** (convention): "Neither ... nor ... either" is a doubled negative construction that has to be reread to see that Bildad and Peleg were also active. Rephrased with the same meaning.

### 20.6  `cab627f835ab38ff` → `d52118ae04bbdc7a`
- **R1** (hedge,meaning): "it sometimes happens that if he be already involved in the matter, he insensibly strives to cover up his suspicions" became a general law ("he tends to bury"); "absolute dictator" softened to "absolute ruler".

### 21.2  `4c6bf68bd1b93ca4` → `3fc9a6fab22c57fb`
- **R2-fid** (voice,omission): Source: 'then insinuating himself between us' (slipping in sidelong) became 'pushed himself between us'.

### 21.8  `3c91e8509b0296b8` → `6e233e5081a35063`
- **R2-fid** (omission): Source: 'slowly and wonderingly looking from me to Queequeg, with the most unaccountable glances'. 'wonderingly' dropped.

### 21.12  `52aad875729c3ba5` → `bbe9c016284e77b4`
- **R1** (omission): "cried stationary Elijah": that he stood still while hailing (before he "stole up to us again" in 21.14) was dropped.

### 21.20  `22d9295398e1fe2d` → `94375b69fe7d695f`
- **R1** (omission): "a tattered pea-jacket" became "a tattered jacket".

### 21.22  `eba3bc37f464f6fc` → `d52b9f7b3a16c7a2`
- **R2-fid** (voice): Source: 'Gracious! Queequeg, don't sit there'. 'Good Lord!' adds an oath-like invocation to Ishmael's mild exclamation.

### 21.24  `83ce98c41a5cad55` → `fb256c220f9f5743`
- **R1** (omission,voice): The biblical allusion "it's grinding the face of the poor" (Isaiah 3:15) became "You're crushing the poor man's face"; "very benevolent countenance" thinned.

### 21.25  `cc83df08937a9814` → `977104568195b500`
- **R1** (omission,voice): "fattening some of the lower orders for ottomans" became "to use as furniture" (the ottoman joke lost); "lay them round in the piers and alcoves" became "scatter them around the rooms"; "to furnish a house comfortably in that respect" thinned.
- **R2-acc** (convention): Misplaced modifier: as written, "in his broken way" attaches to Ishmael's questioning rather than to Queequeg's broken English. Moved the phrase to Queequeg's explanation.

### 21.37  `2c6ded95940b9307` → `a00e9eee90f0a7c2`
- **R1** (voice): "Captain Ahab remained invisibly enshrined within his cabin": "enshrined" flattened to "shut away".

### 22.3  `9ecdae37b1ee6faa` → `4559e8b1b7fa91cd`
- **R2-fid** (hedge,omission): Source: 'just as if they were to be joint-commanders at sea, as well as to all appearances in port' ('to all appearances' dropped); 'steering her well out to sea' lost 'well'; 'before they quit the ship for good with the pilot' lost 'for good'.
- **R3-fix** (omission): Source: 'And all this seemed natural enough; especially as in the merchant service many captains never show themselves...'. The candidate splits this into two sentences and drops 'especially as', so the merchant-service custom no longer reads as the reason it seemed natural.

### 22.8  `cf0e9e72e5431077` → `045bb4017e9c7b33`
- **R1** (omission): Names lost: "the girls in Booble Alley" became "girls in some alley", and "a small choice copy of Watts" became "a small hymnal"; "a dismal stave of psalmody" thinned.

### 22.9  `f5150f3f06767192` → `41d48d518affaa3f`
- **R1** (meaning): "Captain Peleg ripped and swore astern" (raged at the stern end of the ship) became "cursed and swore at the stern", which reads as swearing at the stern itself.
- **R2-fid** (invention): Source: 'Captain Peleg in the act of withdrawing his leg from my immediate vicinity'. 'boot' replaces 'leg', which 22.10 picks up ('using his leg very freely').

### 22.10  `99dc40892201160d` → `cd34ed8d77d7c77d`
- **R1** (voice): Peleg's "marchant service" normalized again; the drumming repetition "spring ... spring your eyes out" became "move ... spring your eyes out", losing the pattern; "thou sheep-head" became "blockhead"; "using his leg very freely" became "boot"; "Thinks I" flattened.

### 22.13  `80c0c26d27bdf950` → `2591f867d166823c`
- **R1** (convention): The hymn's line openings ("Stand dressed", "While Jordan") were lowercased, running the verse lines together; the brief keeps quoted verse laid out as in the source.

### 22.14  `0eda2ffc3b2c52e8` → `566f8896b98437b9`
- **R2-fid** (voice,omission): Source: 'meads and glades so eternally vernal, that the grass shot up by the spring, untrodden, unwilted, remains at midsummer'. 'vernal' became 'green' and 'shot up by the spring' (in springtime) was lost, blurring the spring-into-midsummer image.

### 22.16  `5a52fbac63e4f993` → `a2a1c297b1dec3e7`
- **R1** (meaning,omission): "all the terrors of the pitiless jaw" became "the pitiless sea" (the whale's jaw image replaced); "the far-off unseen Eastern Continents" lost "Eastern"; "curious and not unpleasing" became "touching"; "convulsively grasped stout Peleg" and "so every way brimful of every interest to him" thinned.
- **R2-acc** (unmodernized,convention): "loath to depart, yet;" keeps the 1851 punctuation and word order and reads as a garble: the comma and semicolon split "depart yet" apart. Repunctuated to the edition's dash convention; content unchanged.
- **R3-fix** (meaning,convention): Accessibility edit introduced a mis-paired dash. Source: 'For loath to depart, yet; very loath to leave, for good, a ship bound on so long and perilous a voyage—beyond both stormy Capes; a ship in which...'. The candidate's '...just yet — very loath ... voyage — beyond both stormy Capes' makes the two dashes read as a parenthesis, so 'beyond both stormy Capes' attaches to 'depart just yet'. The inserted 'he was' also turns the fronted participial series into a main clause, leaving '— poor old Bildad lingered long' as a second, run-on clause. Fix restores the source's structure (loath...; loath... — poor old Bildad lingered long) with the dash only where the source has it.

### 22.19  `b96546e444b28440` → `e0ce66b1ad798342`
- **R1** (omission): Two of Bildad's parting instructions were deleted: "If ye touch at the islands, Mr. Flask, beware of fornication. Good-bye, good-bye!" and "Don't keep that cheese too long down in the hold, Mr. Starbuck; it'll spoil." "a' Lord's days" became "Sundays"; "raised full three per cent. within the year" thinned.
- **R2-acc** (convention): "a pleasant sun ... plenty of them" has a singular/plural mismatch, and "the tropic voyage you're going" is ungrammatical in modern English. Minimal grammatical repair.

### 23.1  `cc525fcf1507eee7` → `55f4ca90847fcb1a`
- **R1** (meaning,omission): "this six-inch chapter is the stoneless grave of Bulkington" became "the gravestone — without a stone —" (grave, not gravestone; the point is it has no stone). Dropped "miserably drives", "forlornly rushing into peril", "shudder through and through" became "from stem to stern".

### 23.2  `7c61f2c7c6a02104` → `49e765488c36e2e1`
- **R1** (omission): "that mortally intolerable truth" lost "mortally"; "Glimpses do ye seem to see" softened.

### 23.3  `91d10d9b808e67f5` → `8890917a73893ce8`
- **R1** (meaning,voice): "straight up, leaps thy apotheosis!" rendered "leaps your immortality" — apotheosis is deification, the climax the chapter builds to. "Bear thee grimly, demigod!" lost "grimly".

### 24.2  `8d35c4db99be2f01` → `ecf0fdea667f1c6e`
- **R1** (hedge,omission): Qualifications dropped: "at best, our vocation amounts to"; "upon the whole, will triumphantly plant the sperm whale-ship at least among the cleanliest things" became "will place ... among the cleanest operations". "all manner of defilements" became "filth and gore" (gore added).

### 24.5  `71edd7d5864febd1` → `aebd2e01f229e0cc`
- **R1** (meaning,convention): "some score or two of families" (20 to 40) became "a couple dozen"; the Advocate's figures ("£1,000,000", "4,000,000 of dollars", "$20,000,000", "$7,000,000") were spelled out, against the brief's keep-numbers-as-printed rule; "banded whalemen" dropped.

### 24.7  `4a7173bc90fbd8c8` → `ece2af13c0edba75`
- **R1** (omission,invention,meaning): Period term softened: "first interpreted between them and the savages" became "with the natives" (lead decision 1). Dropped "heathenish" (sharked waters), "javelin" (islands), "virgin" wonders, "high and mighty". The two closing examples were scrambled: "All that is made such a flourish of in the old South Sea Voyages" was given Vancouver's "three chapters", and Vancouver's own "three chapters" became "whole chapters"; "ship's common log". Added "mythical" to the Egyptian mother.
- **R2-fid** (meaning): Source: "in their succourless empty-handedness" — succourless means without succor (no aid, no support ships). The candidate's "helpless" suggests incapacity, the opposite of the heroic point. "javelin-throwing islands" for "javelin islands" is an acceptable brief gloss (see open question).

### 24.8  `5703f3d7a720bbec` → `e3b929eb6162a3f8`
- **R1** (omission): "the establishment of the eternal democracy in those parts" lost "eternal"; "the yoke of Old Spain" became "the yoke of Spain".

### 24.9  `06601f51c4b36fa6` → `3954236c0ea9b8e6`
- **R1** (meaning,voice): "The whale-ship is the true mother of that now mighty colony" became "nation" (Australia was a colony in 1851); "the benevolent biscuit of the whale-ship" became "generous provisions" (the image and its humour lost); "given to the enlightened world" became "opened to the civilized world".

### 24.10  `a975e79bbfeb13f4` → `21f1325ba8029ac5`
- **R1** (omission): "unhorse you with a split helmet every time" lost the split helmet.

### 24.12  `ddd27ca7cf3e02fd` → `68b79f70ddcb914a`
- **R1** (meaning,invention,convention): Name changed: source prints "Other, the Norwegian whale-hunter"; candidate normalized to "Ohthere" (personal names stay as printed, lead decision 7). Added "great" to "our Leviathan".
- **R2-fid** (convention): Source: "took down the words from Other, the Norwegian whale-hunter of those times" — "Other" is correctly kept as printed (decision 7), but in "the words of Other" a modern reader will take "Other" as the common word ("the Other"). Add the minimal gloss "a man named", as the edition already does for "one Bulkington" at 23.0; the printed name is unchanged.

### 24.13  `cac107269a2deea4` → `102f2bf99f75837f`
- **R1** (voice,meaning): "whalemen themselves are poor devils; they have no good blood in their veins" became "lowly types with no noble blood"; the "good blood in their veins" wording is echoed in 24.14.

### 24.14  `4874f432d01d0626` → `050f818ecd22c687`
- **R1** (omission): The echo "No good blood in their veins?" and "royal blood there" were reduced to "No noble blood?"; "kith and kin".

### 24.16  `e6f87faabc28c8ac` → `7b73e9148644e413`
- **R1** (omission,convention): Melville's footnote asterisk after "a royal fish." dropped (lead decision 2); "By old English statutory law" lost "statutory".
- **R2-acc** (convention): Footnote marker is spaced off the closing quote ('royal fish." *'), unlike 24.18 ('procession.*'). Attach it for consistency.

### 24.17  `3ef31ae19a15422a` → `dd0705f007d960a4`
- **R2-fid** (meaning): Source: "Oh, that's only nominal!" — i.e. true in name only. "Only a technicality" shifts the sense to a legal loophole.

### 24.18  `02653d106ea7905e` → `5233d374b3ab6df0`
- **R1** (omission,convention): Footnote asterisk after "the cymballed procession" dropped (lead decision 2).

### 24.19  `3b70d4fa1c002fb4` → `b10b68c84b89ce5b`
- **R1** (omission,convention): Footnote marker "*" at the start of the footnote text dropped (lead decision 2).

### 24.21  `cfa3e6bb2715562a` → `3dccb343264dcd7f`
- **R1** (meaning): Reversed: "Drive down your hat in presence of the Czar, and take it off to Queequeg!" means jam your hat on (refuse to uncover) before the Czar; candidate says "Bow your head before the Czar". "No more!" twice rendered inconsistently.
- **R2-acc** (voice): 'No more!' (twice) reads to a modern ear/listener as 'not any longer', which makes no sense after 'Cetus is a constellation in the southern sky!'. The sense is the rhetorical 'enough said'. Render it so.

### 24.22  `6d9d709cb3e4f7e0` → `b833757494f019f5`
- **R1** (hedge,omission): Hedges and qualifications dropped: "by any possibility", "as yet undiscovered prime thing", "which I might not be unreasonably ambitious of" (litotes), "upon the whole", "here I prospectively ascribe"; "small but high hushed world" lost "hushed".
- **R2-fid** (voice): Source: "that small but high hushed world which I might not be unreasonably ambitious of". The candidate's "to which I might not be unreasonably ambitious" is ungrammatical in modern English; keep the litotes with a working verb.

### 25.0  `b7e15150bb3d3973` → `4cb41e94d4970a38`
- **R1** (hedge): "a not unreasonable surmise" (a deliberate understatement suited to the mock-legal pleading) became "an entirely reasonable speculation"; "wholly suppress" lost "wholly".

### 25.1  `77675ddddee1f7d0` → `d6a6ebf249802be1`
- **R1** (meaning): "has probably got a quoggy spot in him somewhere" (quoggy = boggy, soft underfoot) became "a soft spot", which in modern idiom means a fondness — sense changed. "castor of state" rendered "spice shaker".

### 25.2  `f482ac1466340cc3` → `f12b6d0c0c2ae1e6`
- **R1** (meaning,omission): "bear's oil" became "bear's grease"; "unmanufactured, unpolluted state, the sweetest of all oils" became "pure, unprocessed ... the finest of all oils" ("sweetest" lost).

### 25.3  `c61cc7ae54dc8fb3` → `08e82e09a3c2a8e4`
- **R1** (voice): "coronation stuff" (the jaunty, deflating close) became "coronation oil".

### 26.0  `633d78cdadebb89d` → `a433936a80978a8d`
- **R1** (meaning,omission,technical): "Transported to the Indies" became "Shipped to the tropics" (named place generalized, the audit's "Indian isles" slip type); "like a revivified Egyptian" became "a restored Egyptian mummy" (revivified = brought back to life); "like a patent chronometer" became "a fine chronometer"; "at times affected, and in some cases seemed well nigh to overbalance" lost "affected" and "well nigh"; "most reliable and useful courage" lost "useful".

### 26.2  `80e0ad07f6e16aae` → `3fbfaeb6ef9ccfac`
- **R1** (hedge,omission,technical): Hedge dropped: "he thought, perhaps, that ... courage was one of the great staple outfits of the ship". "lowering for whales" (lowering the boats) became "chasing"; the play "persisting in fighting a fish that too much persisted in fighting him" lost; "upon all mortally practical occasions" and "critical ocean" flattened.
- **R2-acc** (voice): 'always at hand on every occasion that was practical to the point of life and death' has to be reread; the phrase does not parse as a modifier of 'occasion'. Minimal rewording keeps 'practical' and 'life and death'.

### 26.3  `5aed8e8a18043c87` → `786d1e2b084914af`
- **R1** (hedge): "brave as he might be" (concessive) became "Brave as he was"; "that sort of bravery chiefly" lost "chiefly"; "it was not in reasonable nature" flattened to "only natural".

### 26.4  `ffb12d2e89d435d5` → `d01b900437cf1af0`
- **R1** (meaning,omission): "That immaculate manliness we feel within ourselves" became "immaculate dignity"; "Men may seem detestable as joint stock-companies and nations" (in their capacity as) became "like joint-stock companies"; "undraped spectacle" (continuing the robe image) lost; "Thou shalt see it" is correctly modernized but kept.

### 26.5  `a02984354f43168b` → `29a8e2b95ddd9a19`
- **R1** (unmodernized,omission): Left in archaic grammar ("thou Spirit", "who has spread" mismatch, "Thou who didst", "choosest") where the brief modernizes the grammar of high rhetoric. Omissions: "all mortal critics", "thou just Spirit", "the swart convict, Bunyan" became "imprisoned convict", "doubly hammered leaves of finest gold", "from the pebbles", "the kingly commons" (paradox) became "common people", "the exalted mounts".

### 27.0  `9ab1d680bc393a3c` → `c4deaa657aa23322`
- **R1** (meaning,technical,omission): "to tumble aloft" (up into the rigging) became "tumble up on deck"; "a whistling tinker his hammer" became "handyman"; "his old rigadig tunes" lost "rigadig"; "journeyman joiner" became "carpenter".
- **R2-fid** (omission): Source: "calm and collected as a journeyman joiner engaged for the year". The repair report lists "journeyman joiner became carpenter" but the text still reads "carpenter"; "joiner" is a current word and the specific trade.
- **R2-acc** (unmodernized,convention): Last sentence: 'to tumble aloft and bestir themselves there' keeps archaic 'bestir' and switches from 'he' to 'themselves' with no plural antecedent, so the listener loses who is being called. Make the watch explicit.
- **R3-fix** (technical,invention): Accessibility edit replaced source 'a sort of call of the watch to tumble aloft, and bestir themselves there' with 'a sort of call of the watch, telling all hands to tumble aloft'. 'All hands' is the nautical term for the whole crew, the opposite of a call to one watch, and is not in the source. Make the antecedent explicit without the conflicting term.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.
- **R5-fix** (technical): Final verify v1 note: source 'journeyman joiner'; the b23 fidelity fix restoring 'joiner' was later overwritten. Restored.

### 27.1  `49312b18e7a08d29` → `235fdb3398139c3d`
- **R1** (hedge,omission,voice): Hedge dropped: "What, perhaps, with other things, made Stubb" is now a flat single cause. "a world full of grave pedlars, all bowed to the ground with their packs" became "solemn worriers bent double under their loads" (the pedlar image lost).

### 27.3  `23b16b8b2e57ba44` → `cb8c2ba5cb9c1aef`
- **R1** (meaning,omission): "in his poor opinion" (the narrator's judgment) became "in his humble opinion" (a modesty Flask lacks); "the wondrous whale" lost "wondrous"; "the icy concussions of those battering seas" became "the battering ice"; "hereditably" is a misform of "hereditarily".

### 27.5  `a4cc90a7d71d4e67` → `0e9f9b5f0496ca01`
- **R1** (technical): "when the former one has been badly twisted, or elbowed in the assault" (bent into an angle) became "bent or broken"; "broken" is not in the source.

### 27.7  `9b53b4a0df7213ed` → `b3515ebf8cd0d3ea`
- **R1** (meaning,omission): Period term softened: "the last remnant of a village of red men" became "a Native village" (lead decision 1). "black rounding eyes—for an Indian, Oriental in their largeness" lost the qualifier "for an Indian".
- **SWEEP-names** (convention): Lead decision 7 sweep (spelling variants of geographic/people names to modern standard form): Gay-Headers -> Gay Headers

### 27.8  `2459908b81859ab5` → `020bd76e4b020096`
- **R1** (meaning,omission,voice): Period terms softened (lead decision 1): "coal-black negro-savage" became "African", "this imperial negro" became "this magnificent Daggoo", "barbaric virtues" became "untamed", "pagan harbors" became "remote ports". Allusions dropped: "an Ahasuerus to behold" and "Ahasuerus Daggoo" (the Persian king of Esther), "An Anacharsis Clootz deputation" (the Revolutionary who led a delegation of foreigners 'of the human race' before the French National Assembly). Also "hardy peasants of those rocky shores", "engineering forces", "top-sail halyards".
- **R2-acc** (unmodernized): 'Isolatoes too, I call such' keeps the archaic 'such' as a pronoun and is awkward read aloud.

### 28.0  `2db43e7c4ba3c9d3` → `c10ac04fea24a4dc`
- **R1** (omission): "their supreme lord and dictator" became "lord and ruler".

### 28.1  `8c3f5a9768f6308e` → `c7eb47410643359b`
- **R1** (omission,hedge,meaning): Dropped: "the ragged Elijah's diabolical incoherences" (candidate adds "warnings" and loses "diabolical"); "But poorly could I withstand them" overstated as "I couldn't resist them"; "barbaric, heathenish, and motley" softened to "wild, heathen, and mixed"; "tame merchant-ship companies"; "with a fair wind"; "every degree and minute of latitude"; "all its intolerable weather".
- **R2-acc** (voice): The sentence 'It was one of those less lowering ... mornings of the transition, when ..., that, as I climbed ..., the moment I leveled my gaze ..., foreboding shivers ran over me' needs rereading: 'that, as' closes a cleft construction begun forty words earlier, and 'less lowering' is easily heard as a comparative of 'lower'. Restructure with no content lost.

### 28.2  `4352a898e024ee6d` → `13277fcc69c54265`
- **R1** (meaning,omission): Contradiction introduced: "when the fire has overrunningly wasted all the limbs without consuming them" became "the fire has consumed all his limbs' outer surface without destroying them". "seemed inferentially negatived" lost "inferentially"; "preternatural" became "supernatural".
- **SWEEP-names** (convention): Lead decision 7 sweep (spelling variants of geographic/people names to modern standard form): Gay-Head Indian -> Gay Head Indian

### 28.3  `efd238afc3743924` → `9f8c305ac62cb00a`
- **R1** (voice): "He has a quiver of 'em" (the arrow-quiver image, several spare legs) became "a whole supply of them".
- **SWEEP-names** (convention): Lead decision 7 sweep (spelling variants of geographic/people names to modern standard form): Gay-Head Indian -> Gay Head Indian

### 28.4  `e263db6350e3f194` → `2d85d44fdd678449`
- **R2-fid** (hedge,omission,invention): Kept by the repair editor, but: (1) hedge changed — "the uneasy, if not painful, consciousness" became "uneasy, even painful awareness" (asserts pain the source only allows); (2) "bored about half an inch or so" lost "or so", and "pretty close to the mizzen shrouds" lost "pretty"; (3) "an infinity of firmest fortitude, a determinate, unsurrenderable wilfulness, in the fixed and fearless, forward dedication of that glance" was collapsed into "an infinity of iron determination" — "fortitude" and "wilfulness" dropped and the image "iron" added; (4) "prow" became "bow" (fine) and "overbearing dignity" became "overpowering" (fine). Minimal restoration below.

### 28.5  `5376f567526ecb43` → `cc834ab427f1ed91`
- **R2-fid** (omission,invention): Source: "there was little or nothing, out of himself, to employ or excite Ahab, now; and thus chase away, for that one interval, the clouds ... as ever all clouds choose the loftiest peaks to pile themselves upon." Candidate drops "or nothing" and "for that one interval", changes the logic ("and nothing to chase away" instead of "and so to chase away"), and adds "storm" to "all clouds".
- **R2-acc** (voice): Two reread points: 'Before long, after his first appearance on deck, he withdrew' (comma splits 'before long after'), and the inverted 'Nearly all the whaling preparations that needed overseeing the mates were fully capable of handling', where 'overseeing the mates' is first parsed as one phrase.
- **R3-fix** (omission,hedge): Source qualifiers still missing after the round-2 fix: 'began to grow a little genial' (candidate drops 'a little') and 'on the at last sunny deck' (candidate 'now sunny' drops 'at last'). Otherwise the round-2 fix is faithful.

### 28.6  `24c95fa73feab317` → `495ad50e4538a7bf`
- **R1** (voice,omission): "the warm, warbling persuasiveness" lost "warbling"; "the wintry, misanthropic woods" became "bitter woods"; "the playful allurings of that girlish air" became "gentle air", breaking the April-and-May girls image (same slip type as "butterfly cheeks").

### 29.0  `f965919c689c086f` → `d3c4ce2de148668c`
- **R1** (omission,meaning): Proper name and specifics dropped: "the bright Quito spring" became "spring of the equatorial regions"; "the eternal August of the Tropic" became "eternal summer"; "their absent conquering Earls" became "lords"; "overflowing, redundant days" lost "redundant". Gloss added for Quito (the city on the equator whose climate is a byword for perpetual spring).

### 29.1  `1f9551796d51d754` → `8e54c0721d6597ee`
- **R2-fid** (meaning): Source: "the longer linked with life, the less man has to do with aught that looks like death" (i.e. old men sleep little). "the less he wants anything to do with" adds a motive the source does not state.

### 29.2  `464460ebe4e57f7b` → `de626311927acf5e`
- **R1** (meaning): "a globe of tow, and the insertion into it, of the ivory heel" became "inserting it around the ivory heel" (the heel goes into the ball, not the ball around it); "he was measuring the ship from taffrail to mainmast".

### 29.3  `6bc0c2d8856e8742` → `cae27801f591dc8c`
- **R2-fid** (voice,technical): Source: "Am I a cannon-ball, Stubb, that thou wouldst wad me that fashion?" — "wad" is the cannon-loading term (wadding), which makes the joke; "pad" loses it.

### 29.4  `41494d0800f4716c` → `0df413276c4f25bf`
- **R1** (voice,meaning): "I do but less than half like it, sir" became "I don't half like it", an idiom that can mean the opposite ("I like it a lot") and loses Stubb's awkward understatement.

### 29.9  `167ffb80c70a04d9` → `917f9b07d72a2063`
- **R1** (meaning,voice,omission): "A hot old man!" (the joke on the hot pillow) became "A restless old man!"; "it's a kind of Tic-Dolly-row they say" (Stubb's mangling of tic douloureux, a facial nerve pain) became "a kind of torture"; "his eyes like powder-pans!" (the flash-pan of a gun) became "like gunpowder"; "hammock clothes"; "plaguey juggling".

### 30.0  `9c3a5789b2a0daec` → `cef1d0e33b600644`
- **R1** (technical): "the binnacle lamp" became "compass lamp"; nautical term restored with the brief gloss.

### 30.1  `23ae309955ccd119` → `aadfaecc54a31c61`
- **R1** (omission,meaning): "a Khan of the plank, and a king of the sea, and a great lord of Leviathans" became "a king of the planks, a lord of the sea, and a great ruler of Leviathans": Khan dropped and the titles reshuffled.

### 30.2  `77da30c4864daadf` → `8c4dfdd68f64cbcc`
- **R1** (meaning,omission): "like the dying whale, my final jets were the strongest" became "final gasps" (the spout image lost); the repeated "to windward; to windward" collapsed.

### 31.1  `eae65bf646be9f25` → `ee4babe5a1e376f2`
- **R1** (omission,voice): Dropped: the merman's command "be kicked by him"; "let's argue the insult" became "let's think about"; "like a chimney hag" lost "chimney"; "common pitch pine leg"; "there's a devilish broad insult"; "in some queer fashion"; "seaweed he had for a clout".
- **R2-acc** (convention): Broken punctuation: "'Wise Stubb,' said he, 'wise Stubb;' and kept muttering" puts a semicolon inside the closing quote before a continuing clause.
- **R3-fix** (omission): The punctuation fix ('wise Stubb,' said he, 'wise Stubb,' and kept muttering) is correct. One source word is missing in the same paragraph: 'this insult is whittled down to a point only' — candidate drops 'only', which carries Stubb's diminishing logic.

### 31.6  `47e2887a4ae231cf` → `30d77da36921ae21`
- **R2-fid** (voice): Source: "ain't there a small drop of something queer about that, eh? ... did ye mark that, man? ... there's something special in the wind. Stand by for it". "Queer" is Stubb's refrain through 29.9 and 31.1; the candidate flattens it to "strange", drops "a small drop", "now", "eh" and "man", and loses the still-current idiom "in the wind".

### 32.0  `6a0e93862b2fd64c` → `e9846b0900a46dfa`
- **R1** (voice,omission): Flattened 'the more special leviathanic revelations and allusions of all sorts' to 'many whale-related revelations and references'; dropped 'appreciative' and 'the leviathan' (hulls of the leviathan -> 'whales').

### 32.1  `cec91cbf302076de` → `5690ab5dd14ee7f9`
- **R1** (omission,voice): 'The classification of the constituents of a chaos' reduced to 'the classification of chaos'; 'some systematized exhibition of the whale in his broad genera' blurred to 'broad categories'.

### 32.3  `676296e17dc0608a` → `e2368a7b6059f15b`
- **R1** (omission): Beale's quotation keeps Melville's elision marks '* * *' between the two sentences; the candidate silently dropped them and ran the quotes together.
- **R4-fid** (omission,convention): Source 'says Surgeon Beale, A.D. 1839' — the mock-scholarly 'A.D.' is dropped (dates kept as printed). Beale quotation itself is verbatim with '* * *'.

### 32.5  `fa1488c5e094cd72` → `6a0c4e442d599820`
- **R1** (meaning,convention): 'to what ultimate generalizing purpose all these have written' became 'useful generalizing purpose', losing the irony (the extracts show they reached no conclusion). Source paragraph prints 'Lacépède' with accents (lead decision 3); candidate had 'Lacepede'.

### 32.6  `45d1e319f7be67a3` → `26e7b855aa9f28b0`
- **R1** (omission,unmodernized,voice): Dropped the allusion 'This is Charing Cross' (the site of London proclamations); left 'Hear ye, hear ye' archaism; 'usurper upon the throne' softened to 'pretender', breaking the link with 'this usurpation'.
- **R2-fid** (voice): Source crier's formula "This is Charing Cross; hear ye! good people all" is a proclamation to the crowd ("hear, all of you"); candidate "hear me" shifts it to the speaker. Render as a modern proclamation call.
- **R2-acc** (accessibility): 'This is Charing Cross' stops a modern reader: the point is that royal proclamations were read there. Brief gloss added.

### 32.8  `21268158161f35e3` → `81f768fb1ab0c7da`
- **R1** (voice): The joke 'must for that very reason infallibly be faulty' lost 'infallibly'; 'project the draught of a systematization' flattened.

### 32.9  `ef394d3b09a626da` → `7d10b820f76fe48c`
- **R1** (meaning,unmodernized,omission): 'The awful tauntings in Job might well appal me' became 'terrifying challenges ... unnerve me' (audit-flagged 'appal' slip); Job quotation kept archaic 'thee' and dropped Melville's '(the leviathan)'; 'with these visible hands' flattened.
- **R2-fid** (convention,meaning): Lead decision 8: Job at 32.9 is a verbatim scripture quotation and keeps its archaic pronouns. Source: "Will he (the leviathan) make a covenant with thee? Behold the hope of him is vain!" Candidate modernized it to "with you? See, the hope of him is vain!" Restore verbatim (keeping Melville's inserted "(the leviathan)").
- **R4-mod** (unmodernized): Job quotation kept verbatim (decision 8); surrounding prose modernized

### 32.10  `d64cc7441b159954` → `48829d794e56b01a`
- **R1** (omission): Dropped 'alewives' from 'sharks and shad, alewives and herring' and 'the Leviathan' (became 'whales'); 'express edict' softened.

### 32.11  `09f8b45eae4c5c7e` → `d2718e84b5e04f92`
- **R1** (omission,voice,meaning): Melville left the anatomical grounds veiled in Latin ('penem intrantem feminam mammis lactantem'); candidate replaced them with an invented paraphrase 'their reproductive and nursing anatomy'. Dropped 'of Nantucket ... messmates of mine in a certain voyage'; 'Charley profanely hinted they were humbug' became 'bluntly called them nonsense'.

### 32.13  `5b044addabe7a834` → `180c32c51416e696`
- **R1** (voice): Lost the contracted/expanded joke ('However contracted, that definition is the result of expanded meditation' -> 'careful thought'); 'landsmen' shifted to slangy 'landlubbers'.

### 32.14  `40c1baba26818c2c` → `4c5d6b9ab32770ec`
- **R1** (omission,convention): Footnote asterisk after 'alien.*' dropped (lead decision 2); 'authoritatively regarded as alien' lost 'authoritatively'; 'leviathanic brotherhood', 'ground-plan' and 'whale host' flattened.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 32.15  `f7e89fd3240afa37` → `0855ad692d7f28ad`
- **R1** (omission,convention,meaning): Footnote text lost its leading asterisk (lead decision 2); Melville's 'Lamatins' silently changed to 'Manatees' (kept as printed with a brief gloss); 'down to the present time' kept.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 32.16  `cdfdad42d27c2537` → `684dc8850d40f771`
- **R2-acc** (accessibility): The whole bibliographical joke (Folio / Octavo / Duodecimo, and the Quarto footnote at 32.31) depends on knowing these are book sizes; nothing tells a first-time reader. Brief gloss added.

### 32.20  `b3b80a7cdf34d6dc` → `d4bc24ad45efe35d`
- **R1** (omission,hedge,meaning,convention): Dropped the joke 'and the Macrocephalus of the Long Words'; changed 'Pottsfich' to 'Pottfisch' (as-printed name); dropped the hedge 'spermaceti, it would seem, was popularly supposed'; softened 'that quickening humor' to 'a certain fluid'; 'a notion so strangely significant of its scarcity' became 'exotic rarity'.

### 32.21  `58c0c04ed60d2b15` → `0bce9dd727ba324b`
- **R1** (convention,omission): Name as printed: 'Growlands Walfish' was changed to 'Gronlands Walfish'; dropped 'indiscriminately designated'; 'most venerable of the leviathans' flattened.

### 32.22  `09bdc03b999e3b17` → `28a13c0518175fa9`
- **R1** (meaning): 'with reference to elucidating the sperm whale' (treated to shed light on the sperm whale) blurred to 'in connection with the sperm whale'.

### 32.23  `1de5ea8974eebdd4` → `930b8234d6174305`
- **R1** (omission,hedge,voice): Dropped the allusion 'On that Ahaz-dial the shadow often goes back' and 'gnomon-like'; 'bearing for his mark that style upon his back' became 'that fin', breaking the sundial image; 'defy all present pursuit from man' lost 'present'; 'New York packet-tracks' became packet ships.
- **R2-acc** (accessibility): 'On that Ahaz-dial the shadow often goes back' is an unexplained biblical allusion (2 Kings 20 / Isaiah 38) that stops understanding. Brief gloss added.

### 32.24  `3bc7bbe25c7adee0` → `a22a18b6c9bd3b1f`
- **R1** (omission): Compressed the concession 'those marked parts ... very obviously seem better adapted to afford the basis for a regular system of Cetology than any other detached bodily distinctions, which the whale, in his kinds, presents' and dropped 'How then?' and 'of great importance'.

### 32.25  `5ffe10f6debf58bd` → `da82a2d653f64bde`
- **R2-fid** (meaning,hedge,voice): Source: "if you descend into the bowels of the various leviathans, why there you will not find distinctions a fiftieth part as available to the systematizer". The negation means inside the whale you won't find even a fiftieth as much; candidate "you'll find distinctions a fiftieth as useful" asserts exactly a fiftieth, dropping the "not". Also: "Yet we have seen that by his baleen it is impossible correctly to classify the Greenland whale" was generalized to "baleen is useless for classification"; "boldly sort them that way" became "sort them boldly by size" (an added gloss; the source's point is 'bodily, in their entire liberal volume'); "descend into the bowels" flattened to "look inside"; "systematizer" to "classifier".

### 32.26  `dbb2ac8865ba2267` → `21a3a3677a8a88a1`
- **R1** (meaning,invention): 'or you might call him the Elephant and Castle whale' was replaced by an invented 'pack-horse whale'.

### 32.27  `8c85b44a1a66179a` → `d422aabfcdd848c6`
- **R1** (meaning): 'he eludes both hunters and philosophers' changed to 'scholars'.

### 32.28  `cf87ae01f0e2f8f8` → `5b7c4690a62c06b3`
- **R1** (omission,technical,voice): 'brimstone belly' became 'yellow belly'; the allusion 'scraping along the Tartarian tiles' became 'ocean floor'; 'he would run away with rope-walks of line' became 'warehouses of rope' (a rope-walk is a ropemaking shed).

### 32.30  `a70235e017d5ae3a` → `76f378f464f8a8ea`
- **R1** (omission,convention): Footnote asterisk 'OCTAVOES.*' dropped (lead decision 2); 'Black Fish' and 'Narwhale' normalized away from the source's printed names.

### 32.31  `fe8c622c55af78f4` → `7350b2e04d14d847`
- **R1** (omission,convention): Footnote text lost its leading asterisk (lead decision 2); 'in its dimensioned form' dropped.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 32.32  `1c2b7685417adc17` → `5f19ebb015486cff`
- **R1** (omission): Dropped 'or rather blowing' (the point of the landsmen's proverb); 'landsmen' became 'landlubbers'; 'premonitory of the advance' simplified.

### 32.33  `3b49d8932fd339e7` → `dbcf5f39ebbc6a4c`
- **R1** (voice,omission): 'an everlasting Mephistophelean grin' flattened to 'devilish grin'; dropped 'and quite alone by themselves' from the frugal-housekeeper joke; source name 'Black Fish' normalized.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 32.34  `db94e9d0d2d2bf1b` → `0d31d3a1caab4756`
- **R1** (omission,meaning,voice,convention): Lost the pun 'only found on the sinister side, which has an ill effect'; 'a folder in reading pamphlets' (a paper-folding blade) mistranslated as 'bookmark'; 'Black Letter tells me ... saith Black Letter' replaced by 'Old accounts ... old records'; 'Queen Bess did gallantly wave' became 'Queen Elizabeth waved'; 'cloistered old authors', 'Unicornism', 'from that voyage' flattened; 'Narwhale' normalized.
- **R2-acc** (accessibility): 'Black Letter tells me' personifies old Gothic-type books; a first-time reader or listener takes it for an unknown person. Brief gloss at first use.

### 32.35  `a981b1de28807bd2` → `72f98667b65b4af2`
- **R1** (meaning): 'He is mostly found in the circumpolar seas' changed to 'Arctic seas'; 'very superior' oil softened.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 32.36  `fe6f98bf2284b4bb` → `f8d08893680198e9`
- **R1** (meaning,invention,convention): 'a sort of Feegee fish' replaced by the interpretive 'cannibal fish' (render the place name, modern form per decision 7); 'Bonapartes' changed to 'Napoleons'; 'on the ground of its indistinctness' kept.

### 32.39  `d0ff562a850b4cdd` → `5f5d4e97d0d606fa`
- **R2-fid** (convention): Source prints "DUODECIMOES" here and at 32.40, parallel to "OCTAVOES" (32.30, kept). Candidate has "DUODECIMOS" here but "Duodecimoes" at 32.40: internally inconsistent. Keep the source's plural as the book-heading form.

### 32.40  `2b4ec5a8bd4a6cce` → `434f37c07068556a`
- **R1** (hedge,voice): Dropped the qualification 'in the popular sense' (WHALES 'in the popular sense, always conveys an idea of hugeness') and 'possibly'; 'infallibly whales' softened to 'undeniably'.

### 32.41  `68522fe78921b5b6` → `3426f26e1b0500a6`
- **R1** (voice,omission): Lost the joke 'one good gallon of good oil'; 'the spirit of godly gamesomeness' became 'joyful fun' (dropping 'godly'); dropped 'upon the broad sea' and 'to heaven'.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 32.42  `bc62f40af148c37c` → `6510c32369857e41`
- **R2-fid** (technical): Source: "I have lowered for him many times, but never yet saw him captured." "Lowered" is the whaling term for lowering the boats to chase; candidate "I've gone after him" blurs it.

### 32.43  `bb6193d07bdf7d5c` → `201ea4a6d24c2493`
- **R1** (voice,meaning): 'found in the vicinity of that Folio' became 'that great whale' (loses the book-system joke); 'a felonious visit to a meal-bag' became 'raiding a flour bag' (loses the meal/mealy pun); 'A most mean and mealy aspect' became 'pitiful'; the 'bright waist' name was attached to the ship's mark instead of the whale's line.

### 32.45  `b752c13db5996b32` → `b15cb0fe3a9cc418`
- **R1** (voice): 'mere sounds, full of Leviathanism, but signifying nothing' (Macbeth echo) became 'mere words — full of whale-like grandeur'; 'fore-castle appellations' became 'deck-hand names'.

### 32.46  `2fa5202f6050d802` → `12a45d293f068a93`
- **R1** (voice): 'small erections may be finished by their first architects' became 'first builders', breaking the callback to 32.8 'I am the architect, not the builder'.

### 33.1  `528c33d271d3fee6` → `ccb78a1e7f2abb56`
- **R1** (meaning,omission): 'he should nominally live apart' became 'officially'; 'though always, by them, familiarly regarded as their social equal' lost 'familiarly'; dropped 'or Chief Harpooneer' and 'in some way'.

### 33.2  `cf715e473664b132` → `21c2050d8634f6e0`
- **R2-fid** (omission): Source: "sleep in a place indirectly communicating with it"; candidate "a space connected to it" drops "indirectly" (the harpooneers' berth opens off the cabin only indirectly; cf. 34.9 "passed through it").

### 33.3  `39d6e34da7e5dd96` → `cfe2eda18b68b063`
- **R1** (omission,hedge): The allusion 'like an old Mesopotamian family' became 'one big primitive family'; the qualification 'the punctilious externals, at least,' lost 'at least'; dropped 'high or low' and 'now or ever made'.

### 33.4  `accfcb2ca3844796` → `e1403f6bc9cbf21b`
- **R1** (meaning,voice): 'the only homage he ever exacted, was implicit, instantaneous obedience' became 'the only obedience he ever demanded'; 'of all men' became 'of all captains'; 'the paramount forms and usages' flattened to 'established'; 'in terrorem' reduced to 'threatening'.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 33.5  `60b6396ca1994a72` → `5ddb0b408ed2468a`
- **R1** (omission,voice): Dropped 'the choice hidden handful of the Divine Inert' (became 'the chosen hidden few') and 'princes of the Empire'; 'sultanism' (twice) flattened to 'tyrannical quality'; 'external arts and entrenchments' became 'ceremony and trappings'; 'dead level of the mass', 'tremendous centralization', 'direct swing' flattened.

### 33.6  `8599667857fe7dac` → `316055dca42387a1`
- **R1** (meaning,omission): 'I must not conceal' became 'must not forget'; dropped 'housings' from 'trappings and housings'; 'featured in the unbodied air' (given features) became 'found in the invisible air'; 'moves before me' became 'stands'.

### 34.0  `64544ee218a7a3d6` → `32a65a8f30dd368b`
- **R2-fid** (technical,invention): Source: "the smooth, medallion-shaped tablet, reserved for that daily purpose on the upper part of his ivory leg". Candidate "set into the upper part" adds a claim that the tablet is inset; the source says only that a smooth area on the leg is reserved for it.

### 34.1  `e34036ecda3cb91a` → `1990927d83776030`
- **R1** (voice): Lost the irony of Stubb's make-work: 'to see whether it will be all right with that important rope' became 'to make sure it's secure'.
- **R2-fid** (technical): Source: "after a grave peep into the binnacle". Candidate "into the compass" drops the nautical term (the binnacle is the compass's housing, recurring in 35.5 "binnacle magnets").

### 34.2  `bbc1cd1f88e1164f` → `844c2de51dfcdb00`
- **R1** (omission,voice): 'in the character of Abjectus, or the Slave' reduced to 'the humble slave' (the mock-dramatic character name dropped); 'hilarious' and 'squall of a hornpipe' flattened.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 34.3  `494177ba3e1be62c` → `fc227ddbdb95786a`
- **R1** (meaning,omission,voice): 'Who has but once dined his friends' (hosted them) became 'Anyone who has once dined with friends', reversing host and guest; dropped 'ten to one' and 'that man's royalty of state'; 'a witchery of social czarship' flattened to 'a social spell'.
- **R2-acc** (syntax,read-aloud): Broken construction: 'and at once their inoffensive, not to say apologetic and humble air toward him as he sits at the head of the table — this is marvelous' has no verb for its subject until after a dash; must be reread. Joined into one clause; missing comma after 'humble' restored.

### 34.4  `01df525966b23e65` → `b938efef8ae473db`
- **R1** (meaning,voice,hedge): 'this weary family party' became 'grim'; 'tantamount to larceny in the first degree' flattened to 'committing theft'; 'on account of its clotting his clear, sunny complexion' became 'clouding'; 'doubtless' weakened to 'probably'; 'marketless waters' became 'remote'.

### 34.5  `e957a9f514f93bc5` → `b746982392dd79c7`
- **R2-fid** (voice): Source: "sitting silly and dumfoundered before awful Ahab". "Awesome" reads as modern slang praise; "silly" dropped.

### 34.6  `869195aa4af1c90d` → `ecf65827ecfba646`
- **R2-fid** (omission): Source: "the canvas cloth was cleared"; candidate "the tablecloth" drops the shipboard detail that it is canvas.
- **R3-fix** (voice): R2 correctly restored "canvas" (the canvas cloth). The paragraph still flattens two points of Melville's mock-grandeur: the harpooneers as the feast's "residuary legatees" (a legal joke) becomes "leftover heirs of the feast", and "the high and mighty cabin" (ironic) becomes "the grand cabin". Restore both with minimal wording.

### 34.7  `54e988007a341e4e` → `a9c1a50172084854`
- **R1** (omission,meaning): Dropped 'the almost frantic democracy of those inferior fellows'; 'like Indian ships all day loading with spices' became 'cargo ships' (audit-type 'Indian' slip); dropped 'the hinges of their own jaws', 'a nimble hop-skip-and-jump', 'from their clutches'; 'black terrific Ahab' became 'dark Ahab'.

### 34.8  `30589d3417e93bcc` → `7d518b7c0a44b063`
- **R1** (meaning,convention,omission): 'opposing his filed teeth to the Indian's' mistranslated as 'filing his teeth against the Indian's'; 'the great negro' softened to 'the great man' (lead decision 1); dropped 'hearse-plumed', 'drank deep', 'Queequeg, for one'; 'convivial indiscretions' made explicit as 'cannibalistic'; 'fits of the palsy' became 'terror'.

### 34.9  `7bf04c569d5d7a33` → `62fcecd5f5ab7e4b`
- **R1** (convention,meaning): 'these barbarians' softened to 'these harpooners' (lead decision 1); 'nominally lived there' became 'officially'; 'their own peculiar quarters' lost 'peculiar'.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 34.10  `9f89877277bec8fb` → `7498342320950f15`
- **R1** (omission,voice): The allusion 'that wild Logan of the woods' became 'that wild creature'; 'shut up in the caved trunk of his body' became 'the cave of his body', losing the hollow-tree image; 'it is by courtesy alone that anybody else is, at any time, permitted' lightly compressed.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.
- **R4-acc** (unmodernized): Two sentences need rereading. (1) 'anyone else is ever allowed in it only as a courtesy': 'ever ... only' jars. (2) In '...the way a street door goes into a house: swinging inward for a moment, only to be swung back out the next, and living, permanently, in the open air', the participles have no subject, so 'living' seems to belong to the mates rather than the door. Adding 'it' fixes the reference without changing the image.

### 35.1  `507afd851bbdb75c` → `81b50322f4fd0bbb`
- **R2-fid** (technical): Source: "not till her skysail-poles sail in among the spires of the port". Candidate "her very topmost poles" drops the rigging term; "church" before spires is an addition.

### 35.2  `987a52a8cdda489b` → `6a99758056492152`
- **R1** (omission,hedge): Dropped 'whether Louis Philippe, Louis Blanc, or Louis the Devil'; dropped the hedge 'may be said to have gone by the board'; 'what shoals and what rocks must be shunned' became 'what dangers'; 'with a tackle' and 'singularly supported' flattened.
- **R2-acc** (accessibility,technical-term): 'before the final truck was put to it' — 'truck' (the wooden cap at a masthead) is unexplained and reads as a vehicle. Brief gloss added.

### 35.3  `2bc484b4f7d8fdd5` → `809d3553c7a6f0f2`
- **R2-fid** (meaning,voice,omission): Several small drifts: (1) "It may seem unwarrantable to couple in any respect the mast-head standers of the land with those of the sea; but that in truth it is not so, is plainly evinced" means the coupling is justified, not that they are "not so different"; (2) the gradation "it is exceedingly pleasant the mast-head; nay, to a dreamy meditative man it is delightful" collapsed to "delightful — especially"; (3) "between the boots of the famous Colossus" (the joke) became "legs"; (4) "the infinite series of the sea" became "expanse of the ocean"; (5) "snugly stowed in casks" became "barrels".

### 35.4  `35f10505c332985d` → `22472ca87497817e`
- **R1** (meaning,omission,voice): 'a hearse' changed to 'a coffin'; 'a cosy inhabitiveness ... a comfortable localness of feeling' flattened; 'an ignorant pilgrim' became 'traveler'; 'a mere envelope, or additional skin' lost 'envelope'.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 35.5  `be64626191002c90` → `f55f52e18c950b68`
- **R1** (omission,voice): Dropped the joke 'an error ascribable to the horizontal vicinity of the iron in the ship's planks, and in the Glacier's case, perhaps, to there having been so many broken-down blacksmiths among her crew', plus '"azimuth compass observations"'; lost the magnetic pun 'attracted occasionally towards that ... case-bottle'; 'tents or pulpits' became 'platforms'; 'inventors and patentees' and 'any other apparatus we may beget' flattened; 'tierce or pipe' became 'barrel'.

### 35.6  `bf95b3b300ff7bf0` → `e3a33686dc8a923f`
- **R2-fid** (meaning): Source: "Captain Sleet and his Greenlandmen" = his Greenland-whaling crew. Candidate "Greenlanders" means natives of Greenland, changing who is meant. Also "the widely contrasting serenity of those seductive seas" lost "contrasting" (the point of the comparison).

### 35.8  `1dc9d095fdef0a60` → `66617d3cd90a5a92`
- **R1** (meaning,omission): 'who offers to ship with the Phaedon instead of Bowditch in his head' changed the named book to 'Plato'; 'this sunken-eyed young Platonist' became 'philosopher' (the chapter's warning is aimed at Platonists); 'carking cares of earth' became 'life on land'; 'movingly admonish' flattened.

### 35.10  `f36152405b093134` → `74e52a5209917e67`
- **R2-fid** (hedge): Source: "half-hinting that they are so hopelessly lost to all honorable ambition". Candidate "hinting" drops the "half-" qualification, making the captains' insinuation stronger than Melville's.

### 35.11  `d0eded72a58c2aee` → `4be4878ae3c9a432`
- **R1** (omission): Dropped the allusion 'like Cranmer's sprinkled Pantheistic ashes' (became 'like scattered ashes'), which sets up the closing 'ye Pantheists'.

### 35.12  `71d88f2a0b62bd54` → `9baefaac062e754d`
- **R1** (omission): 'Over Descartian vortices you hover' lost Descartes (became 'spiraling vortexes').

### 36.3  `fb1a971b041bfe3c` → `48829928a9243627`
- **R1** (technical,hedge): Candidate turned "the binnacle" into "the compass" and dropped the hedge in "so completely possessing him, indeed, that it all but seemed the inward mould".

### 36.9  `849cbf2977c3c372` → `b7d4c9e37fbf3f09`
- **R1** (omission): Candidate dropped "weather" from "not unlike the weather horizon when a storm is coming up", which is the windward horizon, and flattened "not unlike" to "much like".

### 36.12  `7e661162a3a29748` → `608beee9f6547b89`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 36.20  `b87f600e5d803f75` → `f4387a99a453a329`
- **R1** (meaning): Candidate changed "rubbing the gold piece against the skirts of his jacket" (the lower flaps) to "the front of his jacket".

### 36.27  `964ea281e9f9e114` → `56feed975a8a8f42`
- **SWEEP-names** (convention): Lead decision 7 sweep (spelling variants of geographic/people names to modern standard form): Gay-Header -> Gay Header

### 36.30  `bff9c0a823c76e49` → `ecbf2f0aff331c8c`
- **R1** (technical,omission): Candidate made "like a split jib in a squall" into "a split sail" and dropped "our" and "great" from "our Nantucket wool after the great annual sheep-shearing".

### 36.32  `12f3408fc0c9745b` → `e3b59eb1ab384bd5`
- **R1** (meaning,voice): Candidate made "over all sides of earth" into "across every ocean", "rolls fin out" into "rolls over dead", "razeed me" into "cut me down" and "poor pegging lubber" into "poor stumping cripple". It also dropped "splice hands".

### 36.36  `e6c33c243f535dca` → `864fbc710808e90d`
- **R1** (omission,voice): Candidate made "girdling it with guineas" into "circling it with gold coins", which loses the named coin and the alliteration.
- **R2-acc** (unmodernized): "you need a little deeper layer" does not parse naturally and weakens the link to 36.39's "the deeper layer"; reads as a garble on first hearing.

### 36.39  `9e28307f4b34ff01` → `ce3b9b283d14a386`
- **R1** (meaning,voice): Candidate reversed "my heat has melted thee to anger-glow" into "melted your anger into a glow". It also made "spotted tawn" (tawny) into "spotted gold", "thy one tost sapling" into "bent sapling" and "outrageous strength ... inscrutable malice sinewing it" into "monstrous ... unfathomable", which loses the famous wording. "Puts forth the mouldings of its features" and "torrid life" were flattened.
- **R2-fid** (meaning): Source: "There are men from whom warm words are small indignity." The words come FROM such men (Ahab excusing his own heat); the candidate's "men for whom hot words are no real offense" shifts it to the hearer.
- **R3-fix** (omission): Source "Ah! constrainings seize thee; I see! the billow lifts thee!" — candidate "Ah! I can see it seizing you" drops "constrainings" (compulsions) and leaves "it" without antecedent.

### 36.41  `299e5080a5aae68b` → `0ccaad8d008d4268`
- **R2-fid** (hedge): Source: "the hollow flap of the sails against the masts, as for a moment their hearts sank in" — the sails' bellies actually sank in; "as if" turns the event into a simile.

### 36.44  `f2c5793cfa91afe8` → `611640ac524761ce`
- **R2-acc** (unmodernized): "Men, you seem the years: life, brimming, is gulped and gone" is compressed to the point of needing a reread; "seem the years" is archaic phrasing.

### 36.45  `3b8b9a17751ea071` → `8603ebbc23663666`
- **R1** (meaning,omission): Candidate garbled the conditional "this pewter had run brimming again, wer't not thou St. Vitus' imp — away, thou ague!" and dropped the St. Vitus allusion and "ague". "Bad pennies come not sooner" was also reversed into "always return".

### 36.47  `a6a1012f43d23f8b` → `4e654bedbf507b2c`
- **R1** (technical,invention): Candidate made "using his tiara for ewer" into "his crown for a water basin" and "Cut your seizings" (the lashings holding iron to pole) into "Cut loose". It also added "gracious" to "your own condescension".

### 36.49  `e6741f589d726a0e` → `e6a6d048b7e8331f`
- **R1** (voice): Candidate made "know ye not the goblet end?" into "the socket end", which loses the goblet image the chapter builds on.

### 36.50  `48df920e11694bd3` → `a27f68f4d41f887d`
- **R1** (meaning): Candidate made "Commend the murderous chalices! Bestow them" (offer, hand over) into "Raise ... Pass them".

### 37.2  `3d37405d6e494db0` → `bf8d25c6f7eb7100`
- **R1** (voice): Candidate made "the most brain-battering fight" into "the most brutal fight", which loses the echo of "my brain seems to beat against the solid metal".
- **R2-acc** (unmodernized): "Yonder" is the one leftover archaic word in the soliloquy; the rest of Ahab's elevated grammar is modernized.

### 37.4  `3d597a75f69dc85c` → `0cb4c4a1c1e5d2df`
- **R1** (omission): Candidate made "Come forth from behind your cotton bags!" into "barricades" and "no long gun" into "no gun".
- **R2-fid** (meaning): Source: "That wild madness that's only calm to comprehend itself!" — its only calm is in comprehending itself; "only calm enough to" implies a limited degree of calm.

### 38.3  `8160088b983e9d40` → `c5b1128f0531def9`
- **R1** (meaning,omission): Candidate reversed "hunted by its wolfish gurglings" into "haunted", made "their demigorgon" (an allusion) into "demon god" and dropped "bantering" from "the gay, embattled, bantering bow".

### 39.2  `ecf786a2ce51df9f` → `feec1074ec453eac`
- **R1** (voice,invention,omission): Candidate made "old Mogul" into "old sultan" and "my juicy little pear" into "my sweet little wife", which adds an identification the source does not make. It also cut the refrain "Fa, la! lirra, skirra!" to "Fa la! La la!" and made "gay as a frigate's pennant" into "a ship's pennant".

### 39.3  `0a877c32f1de8681` → `a36c62daa4abb7eb`
- **R1** (convention): Quoted verse: the candidate lowercased the line openings ("To love", "As bubbles", "And break") that mark the source's verse lines.

### 40.3  `622c9b08d1ff487f` → `564844375ce9a8ac`
- **R1** (meaning): Candidate made "Take a tonic" into "Have a drink", which loses the medicinal joke that follows "bad for the digestion".

### 40.5  `d274c5488b3fb18d` → `8a837bdc90cf257b`
- **R1** (meaning,convention): Song: "That blew at every strand" became "spouted near the strand", "gallant" became "splendid", and the line capitals of the verse were lost.

### 40.7  `6c37d3cc0aa7198f` → `94202959036142de`
- **R1** (meaning,voice): Period language softened: "thou Pip! thou blackling!" became "Pip, you little rascal!" (lead decision 1). The drawn-out call "Star-bo-l-e-e-n-s, a-h-o-y!" was flattened, and "Tumble up!" became "Get up!".

### 40.8  `146a9bc4502d1abf` → `2790c5657e277802`
- **R1** (technical,meaning): Candidate made "old Mogul's wine" into "old sultan's" and "like ground-tier butts" (the bottom tier of casks in the hold) into "barrels in a cellar". It changed "copper-pump" to "copper tube" and "it's the resurrection; they must kiss their last" to "Judgment Day ... kiss their sweethearts goodbye".

### 40.11  `f8cab0ac4572f7d2` → `81a7a9cc8950110b`
- **R2-fid** (voice,meaning): Source: "Form, now, Indian-file". Lead decision 1 (render what the source says) and the edition's retention of "Indian" at 36.43 and 42.10; "Indian file" is still a current idiom, so "single file" is a needless softening.

### 40.12  `826098933943effc` → `601f51997fef8d81`
- **R1** (voice): Candidate made "I'm sorry to throw cold water on the subject" into "dampen the mood", which loses the Icelander's cold-water joke.

### 40.15  `f05c93cb40f94049` → `8da7dabae7df1b3f`
- **R1** (voice): Candidate swapped the farm idiom "Hoe corn when you may" for "Make hay while you can".

### 40.17  `e548971d50a69358` → `eaf994ca0fb8f229`
- **R1** (omission,voice): Candidate cut the nonsense chant "Rig it, dig it, stig it, quig it" to "Rig it, dig it, jig it", and made "Make fire-flies" into "Make sparks fly".

### 40.20  `51a6721ab5a5534f` → `b1995c2d23558242`
- **R2-fid** (technical,voice): Source: "Split jibs! tear yourselves!" — the sail-specific "jib" image (as in 36.30 "split jib in a squall") became generic "Rip the sails!"; "tear yourselves" became "Tear loose".
- **R3-fix** (invention): Source "Split jibs! tear yourselves!" — "Tear yourselves apart!" adds a self-destruction sense; the cry is dance frenzy, parallel to 40.11 "Throw yourselves!".

### 40.22  `9990067d8e8f241b` → `74490b5a806ba828`
- **R1** (meaning): Candidate made "the green navies" (sunken fleets) into "the green sea-bottoms".

### 40.25  `4515c61091ad5f2d` → `9a85665675e47f00`
- **R1** (convention): Candidate normalized the printed name "Seeva" to "Shiva". Lead decision 7 keeps personal names as printed.

### 40.26  `9da125ae01f98718` → `c62efc14f9fdf709`
- **R2-fid** (voice): Source: "the snow's caps turn to jig it now. They'll shake their tassels soon." The tassel image (caps with tassels) became "foam-caps", duplicating the preceding image.

### 40.27  `43ec9c075f646d90` → `32569dd86f9cffc2`
- **R1** (meaning): Candidate made "not taste, observe ye, else come satiety" into "or satisfaction would come". Satiety means surfeit, not satisfaction.
- **R2-acc** (unmodernized): Inverted "or else comes satiety" is leftover archaic syntax and trips when read aloud.

### 40.34  `26b26e3f431056e8` → `e540191505ff5838`
- **R1** (voice): Candidate made "How the three pines shake!" into "three masts", which breaks the image the next sentence ("Pines are the hardest sort of tree...") develops. It also dropped "keeled".

### 40.35  `470f55f93a774295` → `9c30413ab1ea2da4`
- **R2-fid** (voice): Source: "I'm quarried out of it!" — Daggoo as stone quarried from blackness; "carved" loses the quarry image.

### 40.38  `c97ff99c68e32c96` → `25773574ac51dbe8`
- **R1** (convention): Candidate made "our old Mogul's fire-waters" into "old sultan's liquor". The edition keeps "Mogul" in chs 99 and 108.

### 40.49  `7dce10ef4a647d78` → `ac4e3b31ccbd2a67`
- **R2-fid** (voice,omission): Source: "jump, my jollies!" — Pip echoes the word in 40.50 ("Jollies? Lord help such jollies!"), so "Jump, lads!" leaves his echo dangling.

### 40.50  `00a0a2b8c5bfd9c7` → `a72389ec5a76e77c`
- **R1** (omission,invention): Candidate made "that anaconda of an old man" into "snake", "Jimmini" into "Lord" and "those chaps there are worse yet" into the invented "worse than any storm".

### 41.1  `42a3145057b5b95b` → `a18ff8841464615a`
- **R1** (hedge,meaning): Candidate dropped the hedges "perhaps, for the most part" and "more, as it were", and collapsed "hardly to be doubted ... not an unfair presumption, I say" into "reasonable to suspect". "Malignity" became "ferocity".
- **R2-fid** (hedge): Source (a crux): "It was hardly to be doubted, that several vessels reported to have encountered ... a Sperm Whale of uncommon magnitude and malignity ... to some minds it was not an unfair presumption, I say, that the whale in question must have been no other than Moby Dick." The certainty attaches to the identification with Moby Dick, not to the existence of the reports; the candidate moves "hardly any doubt" onto "ships had reported".
- **SWEEP-caps** (convention): Species-name capitalization follows the source paragraph (brief: 'In a paragraph you rewrite, follow the source's capitalization'): Sperm Whale

### 41.2  `2413f6b6b11cb8ca` → `b93d25b1bc3e242f`
- **R2-fid** (omission): Source: "broken limbs, or devouring amputations" — "devouring" (the limb taken by the jaw) became the generic "horrific".
- **R2-acc** (readability): "eventually" twice in one sentence ("But eventually, such catastrophes" / "who eventually heard the story"); awkward read-aloud rhythm.

### 41.3  `862b46df9ce3fe9c` → `5753eff730f92a1f`
- **R1** (meaning,omission): Candidate made "whalemen as a body [are] unexempt from that ignorance and superstitiousness hereditary to all sailors" into the garbled "no more free ... than anyone else". It dropped "chiseled hearth-stone, or aught hospitable beneath that part of the sun" and "latitudes and longitudes", and made "the smitten tree" into "a damaged tree".

### 41.4  `710380a1b94e29cf` → `1f867422b643d4b3`
- **R1** (omission,hedge,voice): Candidate dropped "half-formed fœtal suggestions" (the birth image carried over from 41.3) and "in many cases", and made "by those rumors, at least" into "through these rumors alone".

### 41.5  `bcc6afba08c47763` → `86cff91767996a8f`
- **R1** (meaning,voice): Candidate made "the ignoble monster primitively pursued in the North" into "the less dangerous species hunted in the North", and dropped "whalemen as a body" and "whaling nations".
- **SWEEP-caps** (convention): Species-name capitalization follows the source paragraph (brief: 'In a paragraph you rewrite, follow the source's capitalization'): Sperm Whale

### 41.6  `d6551060c502afc6` → `23e6d3085a90c79a`
- **R1** (meaning): Candidate rewrote the quoted Cuvier wording ("struck with the most lively terrors", "in the precipitancy of their flight ... with such violence as to cause instantaneous death"). Quoted matter should stand as quoted.
- **SWEEP-caps** (convention): Species-name capitalization follows the source paragraph (brief: 'In a paragraph you rewrite, follow the source's capitalization'): Sperm Whale

### 41.7  `3c815a63334df6ee` → `ff5a865d26a50065`
- **R1** (omission,meaning): Candidate dropped "such an apparition as the Sperm Whale", made "hopefully pursued" (with hope of success) into "safely", and made "documents that may be consulted" into "documents survive".
- **SWEEP-caps** (convention): Species-name capitalization follows the source paragraph (brief: 'In a paragraph you rewrite, follow the source's capitalization'): Sperm Whale

### 41.8  `80c7670ab24d7a69` → `c7dd9a45dff910c0`
- **R2-fid** (meaning): Source: "without superstitious accompaniments". The chapter keeps its "superstitious" framing throughout (41.3, 41.6, 41.9, 41.10, 41.12); "supernatural embellishments" shifts from the hearers' superstition to the content.

### 41.10  `4856309d5930c15f` → `85e8c35ff897ffe9`
- **R1** (meaning,hedge): Candidate made "some faint show of superstitious probability" into "some faint basis in fact", which turns superstition into fact. It also dropped "mystic" from "the mystic modes whereby".
- **SWEEP-caps** (convention): Species-name capitalization follows the source paragraph (brief: 'In a paragraph you rewrite, follow the source's capitalization'): Sperm Whale

### 41.11  `ad8ccf03af6648cf` → `51e6df5b9c10c17e`
- **R1** (hedge,meaning): Candidate made the reported claim ("it has been declared that the interval ... could not have exceeded very many days") into bare fact and "very many days" into "a few days". "It has been believed by some whalemen" became "have concluded".
- **R2-acc** (readability): "some whales have been captured far north in the Pacific with the barbs of harpoons thrown in the Greenland seas found in their bodies" stacks participles so the reader must reparse where "found" attaches.

### 41.12  `20d3d5470c828955` → `e7af8ff007e67b38`
- **R1** (meaning): Candidate made "a ghastly deception" into "a ghostly deception".

### 41.16  `8aca3e2ef89d5432` → `770cafe759c395ab`
- **R1** (hedge): Candidate dropped "wholly" from "was not wholly regarded as having been inflicted by an unintelligent agent", which makes the judgment absolute.
- **R2-acc** (unmodernized): Inverted "in most cases such seemed the White Whale's infernal, premeditated ferocity that" is archaic word order and needs a reread.

### 41.17  `cc00ce8aa6f850ca` → `5447dbc6fb48376a`
- **R1** (meaning): Candidate made "his more desperate hunters" into "more determined" and moved "desperate" onto the fury. "Distracted fury" and "chips of chewed boats" were lost.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 41.18  `00c95e6e779a3f57` → `8212ee4fcba48cc4`
- **R1** (omission,technical,invention): Candidate dropped "monomaniac" from "the monomaniac incarnation", the chapter's key term. It made "as if his chest had been a mortar, he burst his hot heart's shell" into "cannon ... fired" and added "assassin" to "hired Venetian or Malay".

### 41.19  `700747c4252026a8` → `54d8bd691c6fcd8d`
- **R1** (omission,voice,technical): Candidate replaced "monomania" with "obsession" throughout and dropped "If such a furious trope may stand". It also lost "Egyptian chest", "mild stun'sails", "that noble Northman" (the Hudson) and "concentred cannon".

### 41.20  `9e9b10ab86a4d1b6` → `b846797b971a0fce`
- **R1** (meaning,omission): Candidate reversed "Ahab's larger, darker, deeper part remains unhinted" into "remains only hinted at". It dropped the named allusions "this spiked Hotel de Cluny", "Roman halls of Thermes", "like a Caryatid" and "piled entablatures", and "A family likeness!".

### 41.21  `83dbf6c15a2509c5` → `d94e1a94d731d322`
- **R2-fid** (voice): Source: "Ahab had some glimpse of this, namely: all my means are sane, my motive and my object mad." Melville gives Ahab's self-knowledge in the first person; the candidate turns this famous line into reported third-person speech.

### 41.22  `e0c266aa3c16bf4c` → `ed7da2d0026f1b9c`
- **R1** (meaning): Candidate made "They were bent on profitable cruises" (the shore acquaintances and owners) into "They had signed on for", which is wrong for landsmen. "The most appalling of all brutes" was weakened to "most terrifying".

### 41.23  `5cd21dd9a6f2f175` → `4706cd51f8750908`
- **R1** (omission,voice): Candidate made "a Job's whale" into "a Biblical whale" and dropped "indifference and recklessness" from Stubb's "invulnerable jollity of indifference and recklessness", and "or right-mindedness" from Starbuck. "A seventy-four" became "a warship", and "the abandonment of the time" became "madness".

### 42.2  `a9c249885697cb7f` → `f7079613ea8d41ca`
- **R1** (voice,omission,convention): Period language softened or corrected: "the barbaric, grand old kings of Pegu" lost "barbaric". "Giving the white man ideal mastership over every dusky tribe" became "an assumed mastery over every darker people", which is an editorial correction (lead decision 1 and hard rule 4). "Romish faith" became "Roman Catholic", although the edition keeps "Romish" at 54.2. "Cæsarian, heir to overlording Rome" and "magniloquent" were dropped.

### 42.3  `f8401208cc21d5dd` → `a1f698196c3a75d9`
- **R1** (convention,omission): Candidate dropped Melville's footnote asterisk after "bear or shark" (lead decision 2), and made "the fierce-fanged tiger in his heraldic coat" into "striped coat". "Loathsome than terrific" was blurred.

### 42.4  `66793b084663f210` → `75eb8b9ca350d913`
- **R1** (convention,hedge,omission): Candidate dropped the footnote asterisk, the hedge "it may possibly be urged" and "by him who would fain go still deeper into this matter".

### 42.5  `40751da9d23935de` → `2f70d500f238add9`
- **R1** (convention): Candidate made "The Romish mass" into "The Roman Catholic mass". The edition keeps "Romish" at 54.2, and hard rule 4 forbids softening period language.

### 42.6  `8b464ac1df0f5c09` → `cfe4dd5a4d7de01c`
- **R1** (convention): Candidate dropped the footnote asterisk after "Nature" (lead decision 2).

### 42.7  `bd77732886cb9d49` → `35c94224873649b4`
- **R1** (convention,meaning,omission): Candidate dropped the footnote asterisk and made "methought I peeped to secrets which took hold of God" into "secrets known only to God". It also dropped "Roman" from "a hooked, Roman bill sublime" and "of towns" from "memories of traditions and of towns".

### 42.8  `0f66fc6b6cda1391` → `9dfed452f57938c9`
- **R1** (omission): Candidate dropped "by a solecism of terms" (a contradiction in terms), which is the point of the "grey albatrosses" example.

### 42.9  `bf32b480cd1126d1` → `26e5ff59ca9d8311`
- **R1** (omission): Candidate dropped "the invoking" from "the wing-folding, the invoking, and adoring cherubim".

### 42.10  `30c393a24011995e` → `1bc2ebdf7beac743`
- **R1** (omission,convention): Candidate dropped the allusions "the elected Xerxes" and "like an Ohio", and "in those days" from "whose pastures in those days were only fenced". It also changed "Indian traditions" to "Native American traditions" (the paragraph later keeps "Indians"; lead decision 1).

### 42.12  `34bcbbfed0f7fe81` → `0954e677a3801e55`
- **R2-fid** (voice,meaning): Source: "more strangely hideous than the ugliest abortion." Period sense is a monstrous, misshapen birth. "Birth defect" is a modern clinical softening (a condition, not a creature) and is inconsistent with 55.9, which keeps "authentic abortions" with a gloss. Answer to the open question: keep the period term with a brief gloss (lead decision 1; hard rule 4).

### 42.13  `00dfb4484c11ed62` → `c9aeddd4736c4fe5`
- **R1** (meaning): Candidate made the Froissart "bailiff" into "magistrate" and "the art of human malice" into "human cruelty".

### 42.16  `795cddbd01c5b4c0` → `a6aa590784750251`
- **R2-acc** (readability): The long question has no finite verb inside the dash clause ("cases where this thing of whiteness — though ... stripped ..., yet still found to work the same spell") and then restarts with "can we hope"; a reader must reread to parse it. Minimal fix supplies "is" and removes the restart.
- **R3-fix** (omission,meaning,hedge): Source "stripped of all direct associations calculated to impart to it aught fearful ... the same sorcery, however modified" and "would seem impossible". Candidate drops "direct" (the qualification the argument rests on), turns "calculated to" (apt to) into intentional "meant to", narrows "modified" to "softened", and drops the tentative "would".

### 42.17  `99e9f5c4a1841670` → `a553a8fe7287f678`
- **R1** (hedge): Candidate made "doubtless, some at least of the imaginative impressions" into "many of the imaginative impressions", and "few perhaps" into "few were probably".
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.
- **R4-fid** (hedge): Source 'doubtless, some at least of the imaginative impressions about to be presented may have been shared by most men' keeps both 'doubtless' and 'may'; the round-4 text 'have been shared' drops 'may' and turns the qualified claim into a flat one (pre-round-4 text had 'may have been shared').

### 42.18  `3919281c9abfb3b1` → `9c11b154634bab35`
- **R1** (meaning): Candidate made "the Protestant of the Middle American States" (the Middle States) into "the American heartland".
- **R2-acc** (gloss): "Whitsuntide" stops many modern readers and the sentence depends on knowing it is a church season; a brief accurate gloss helps (Whitsuntide = the Pentecost season).

### 42.19  `6b134a4e909b1eae` → `1de2fcce2a6ed2e7`
- **R1** (omission): Candidate dropped "lacquered" from "long lacquered mild afternoons" and "irrespective of all latitudes and longitudes" was flattened.

### 42.20  `90e0110d1ea52c1e` → `a70c74ba2d9d2548`
- **R1** (meaning): Candidate made "the cheerful greenness of complete decay" into "natural decay".

### 42.23  `9bb929dab941b2e0` → `f702254061c629ab`
- **R1** (convention,omission): Candidate changed "the native Indian of Peru" to "native peoples of Peru" (lead decision 1), and dropped the image in "snow-howdahed Andes" and "legerdemain".

### 42.24  `126b94495c343366` → `9e1a390889e2cfa8`
- **R2-fid** (voice,meaning): Source: "methinks that white-lead chapter about whiteness is but a white flag hung out from a craven soul; thou surrenderest to a hypo, Ishmael." "White-lead" (white paint) pun lost as "bleached"; "a hypo" is a fit of hypochondria/low spirits, which "despair" overstates.
- **R3-fix** (meaning): Source "But thou sayest, methinks that white-lead chapter ... is but a white flag ...; thou surrenderest to a hypo, Ishmael." "Methinks" and the vocative belong to the objector's speech; candidate "But you say, I think, that ..." makes it Ishmael's own hedge and leaves the second sentence's speaker unclear.

### 42.27  `03c001721cebe847` → `c101a0430b6445a6`
- **R1** (omission): Candidate made "the bleak rustlings of the festooned frosts of mountains" into "frosted mountain peaks", which drops "festooned".

### 42.28  `1529f385691226f9` → `36b1e750921f35c3`
- **R2-fid** (voice): Source: "Though in many of its aspects this visible world seems formed in love, the invisible spheres were formed in fright." The concessive contrast is the point; the candidate splits it into two flat statements.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.
- **R4-acc** (meaning): 'Neither of us knows' reads as 'you and I, the reader and narrator', but the pair meant is Ishmael and the colt from 42.27, as the next clause shows ('for me, as for the colt'). Name them so the sentence needs no rereading.

### 42.30  `de7ef4313036b291` → `d6497e42c397409c`
- **R1** (voice,meaning): Known slip: "the butterfly cheeks of young girls" became "rosy cheeks", which flattens the echo of "gilded velvets of butterflies". "All deified Nature" became "glorified Nature", and "coloured and colouring glasses" became "tinted protective glasses".

### 43.0  `5aa57f941f482e9a` → `71af0656a6208a42`
- **R1** (voice): "HIST!" is a hushing whisper (43.2 says Archy "whispered"). The candidate's "Hey!" is a shout.

### 43.1  `cff3630f795210ea` → `04d27745f00feaa2`
- **R1** (invention,omission): Candidate invented "the never-stopping engine room of the sea" for "the steady hum of the unceasingly advancing keel", which is anachronistic, and dropped "to fill the scuttle-butt" and "near the taffrail".
- **R2-acc** (convention): "quarterdeck" here while the edition uses "quarter-deck" (27 occurrences, incl. ch36 title and 40.6); inconsistent term.

### 43.2  `e3daed9fe8a117b4` → `284ff26053b71251`
- **R1** (meaning,convention): Candidate made "a Cholo" into "a Chilean", which changes who the neighbor is and softens a period term (lead decision 1).
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.

### 43.3  `5aa57f941f482e9a` → `6e755ee297eca142`
- **R1** (voice): "Hist!" (hush) is a whisper, and the candidate has "Hey!". Matches 43.0.

### 43.8  `3382c9865c06500c` → `6ee4cffc0a60c3e4`
- **R1** (voice): Candidate replaced the Cholo's Spanish oath "Caramba!" with "Good lord!".

### 43.11  `1fb3e930fbe35dc3` → `dc5d9f392c14ba42`
- **R1** (convention): Candidate made "our old Mogul" into "our old captain". The edition keeps "Mogul" (chs 99 and 108).

### 44.0  `c146577b74763360` → `c6a05c55df883b90`
- **R1** (meaning,omission,invention): Source says Ahab traced courses "over spaces that before were blank"; candidate reverses this to spaces that "already showed a maze of such markings". Last sentence drops "the seasons and places in which ... sperm whales had been captured or seen" and invents "faded entries".

### 44.2  `cff962a3a1eea431` → `0399580ebd1f3793`
- **R2-acc** (meaning): 'But it was not this particular night that Ahab pondered over his charts' reads on first pass as if he did NOT pore over them that night; the sense is that this night was not the only one.

### 44.3  `83634d1ee4bfe89a` → `5e46fbaee2e7917e`
- **R2-fid** (technical,voice): Source: 'concerning the timeliest day to be upon this or that ground in search of his prey'. Candidate 'the best times for finding his prey in any given stretch of water' loses the precision of 'day' and the whaling term 'ground' (feeding-ground, used throughout chs 44-45), and shifts 'to be upon ... in search of' to 'finding'.
- **R3-fix** (voice,convention): R2-fid fix to the final clause is correct ('timeliest day to be upon this or that ground' now fully rendered). Remaining residue: source 'the ways of the leviathans' is flattened to 'the ways of whales'; the brief keeps 'Leviathan/leviathan' as used. Minimal fix restores the word; nothing else touched.

### 44.4  `ed5499c061356609` → `6883da832f74b8ed`
- **R1** (meaning): Source: "were the logs for one voyage of the entire whale fleet carefully collated" (a single voyage across the whole fleet); candidate says "the logs of every voyage". "correspond in invariability" softened to "predictable".
- **R2-fid** (convention): Lead decision 2 (Melville's footnotes): source places the footnote marker '*' at the end of 44.4 ('migratory charts of the sperm whale.*') and opens 44.5 with '*'. Candidate drops both markers.

### 44.5  `b111c270f1883ff3` → `6a35b8389936135c`
- **R2-fid** (convention): Lead decision 2 (Melville's footnotes): source places the footnote marker '*' at the end of 44.4 ('migratory charts of the sperm whale.*') and opens 44.5 with '*'. Candidate drops both markers.
- **R4-mod** (unmodernized): narration modernized; Maury quotation restored to verbatim source wording

### 44.6  `416db2590fe0418d` → `372f0adb69bfe29a`
- **R1** (omission,invention,technical): Second half invented: "rarely deviates more than a few miles from its exact course ... ocean highways ... provide the specific feeding opportunities". Source: the whale's own line is "straight as a surveyor's parallel" and confined to "its own unavoidable, straight wake", yet the vein "generally embraces some few miles in width (more or less, as the vein is presumed to expand or contract); but never exceeds the visual sweep from the whale-ship's mast-heads ... this magic zone"; conclusion "migrating whales may with great confidence be looked for" lost. Also "say, rather" hedge flattened.

### 44.8  `ba11d8161665654f` → `8f0c362ff006c72f`
- **R1** (omission,invention,hedge,voice): Candidate (148 words vs 418) keeps only the herd-identity point, then invents an elk-hunting simile and a "key was this" conclusion. Missing: "the solitaries and hermits among the matured, aged sperm whales"; the "Seychelle ground in the Indian ocean, or Volcano Bay on the Japanese Coast" examples; "casual stopping-places and ocean-inns"; the "way-side, antecedent, extra prospects" vs "all possibilities would become probabilities ... the next thing to a certainty"; "the Season-on-the-Line"; the Zodiac simile; "the waves were storied with his deeds"; "that tragic spot where the monomaniac old man had found the awful motive to his vengeance"; and Ahab's refusal to "rest all his hopes upon the one crowning fact" or "postpone all intervening quest".
- **R2-acc** (convention): 'feeding grounds' is hyphenated everywhere else in the chapter and edition ('feeding-grounds' in 44.6, 44.7 context, 44.9).

### 44.9  `451eb71fdd2e2a65` → `5c141e4b2ee81c95`
- **R1** (invention,omission,meaning): From "Because" on, candidate invents an itinerary (Azores, Cape de Verdes, Rio de la Plata, Carrol Ground, Seychelles, Japanese cruising ground). Source: "an interval of three hundred and sixty-five days and nights" spent in "a miscellaneous hunt" in case the White Whale, "spending his vacation", should "turn up his wrinkled brow off the Persian Gulf, or in the Bengal Bay, or China Seas"; and the winds list "Monsoons, Pampas, Nor'-Westers, Harmattans, Trades; any wind but the Levanter and Simoon" blowing him into "the devious zig-zag world-circle of the Pequod's circumnavigating wake". "perhaps, been correctly selected" also became "shrewdly calculated".
- **R2-acc** (unmodernized): 'double Cape Horn' uses the old nautical sense of 'double' (sail round); a first-time reader or listener may stumble. 'round' is the plain modern equivalent.

### 44.10  `eff1ffec5eb14888` → `d48dcbdad0d3a67d`
- **R1** (invention,omission,meaning): Candidate invents "lean back in his swinging chair and stare at the smoldering flame", "he's marked me ... touching his leg" and "I'll chase him around Good Hope ... flames of perdition" (lifted from ch. 36). Missing: "tallied him, and shall he escape? His broad fins are bored, and scalloped out like a lost sheep's ear!"; the breathless race of his mind, faintness, recovery "in the open air of the deck"; "Ah, God! what trances of torments ... He sleeps with clenched hands; and wakes with his own bloody nails in his palms." "white-bearded Mufti" flattened to "white-bearded man".

### 44.11  `080841d0bc9f408d` → `0be7f35b06e633e7`
- **R1** (omission,invention,meaning,voice): After the burst from the stateroom, candidate replaces Melville's argument with invented lines ("that thinking agent that called itself 'I' was unhoused", "seeking the open air of the ship's deck", "The frenzy of the mind fed on those limbs", "Ahab was a sleepwalker in his own body"). Missing: "instead of being the unsuppressable symptoms of some latent weakness, or fright at his own resolve, were but the plainest tokens of its intensity"; the soul "dissociated from the characterizing mind" fleeing "the scorching contiguity of the frantic thing"; "as the mind does not exist unless leagued with the soul" / the purpose forcing itself "against gods and devils into a kind of self-assumed, independent being"; "unbidden and unfathered birth"; "a ray of living light ... without an object to colour"; and "God help thee, old man ... a Prometheus; a vulture feeds upon that heart for ever; that vulture the very creature he creates."

### 45.0  `5b7bef234184cd28` → `0585e339f18de258`
- **R1** (invention,omission): Candidate ends with invented "when they learn that I am earnest in setting down the story of a particular whale"; source: "any incredulity ... as to the natural verity of the main points of this affair".
- **R2-acc** (voice): The opening clause 'As far as there may be a narrative in this book — and, indeed, as it indirectly touches on...' has no clear grammatical link to the main clause; readers must reread to see it means 'as regards the book's narrative'.

### 45.2  `55b3993416b51480` → `cfdf62b71212250e`
- **R1** (unmodernized): Near-verbatim 1851 text with archaic syntax and diction: "effected a complete escape", "the man who darted them happening, in the interval, to go ... went ashore", "thrice circumnavigated", "it so fell out", "three years previous", "no good ground to impeach". Content complete; modernized without loss.

### 45.3  `fa9e5d8bd51bf92c` → `85cec46d6e831e0a`
- **R1** (unmodernized): Near-verbatim 1851 text: "popularly cognizable", "not altogether and originally owing to", "terrible prestige of perilousness", "insomuch that", "lest if they pursued the acquaintance". Modernized; Rinaldo Rinaldini given a brief accurate gloss (bandit hero of Vulpius's novel).

### 45.4  `22b5714e9e277ade` → `b28cda7dbe6ef44c`
- **R1** (meaning,invention,omission): Name error: "New Zealand Jack" became "New Zealand Tom". Morquan's jet "at times assumed the semblance of a snow-white cross against the sky" replaced by invented "spotted even from the peak of distant Donan". Final sentence dropped: "In plain prose, here are four whales as well known to the students of Cetacean History as Marius or Sylla to the classic scholar." "palmy beach" flattened; apostrophic "O" lost.
- **R2-fid** (convention): Lead decision 3 (proper-name spelling as printed): source 'O Don Miguel! thou Chilian whale'; candidate normalizes to 'Chilean'. (Source 'Cæsar' is given as 'Caesar'; the ligature is typographic and I leave it to the lead.)
- **R2-acc** (convention): 'Chilian' is the 1851 spelling of the ordinary adjective; the rest of the edition uses 'Chilean' (2 occurrences). Brief: ordinary words take modern American spelling.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all content preserved.
- **R4-fid** (voice): Source 'the Oriental straits of that name' (the period name for the East Indies region) became 'Eastern straits'; pre-round-4 text kept 'Oriental'. Restore rather than soften the period term.

### 45.5  `56ad4644a45b1670` → `c2ab987853821025`
- **R1** (voice): Period language softened: "that notorious murderous savage Annawon" became "murderous warrior"; "headmost warrior" rendered "chief fighter". Brief rule 4 forbids softening; otherwise correct.

### 45.6  `5d6a937380b03bce` → `f9bb54bf2d076dc2`
- **R1** (meaning,omission): "establishing in all respects the reasonableness" lost "in all respects"; "wonders of the world" changed to "wonders of the sea"; "still worse and more detestable" reduced to "worse still".

### 45.7  `06fb533bcc7eff24` → `250dfaf24e1fe69f`
- **R1** (unmodernized): Near-verbatim with 1851 syntax that obstructs: "that that poor fellow there, who this moment perhaps caught by the whale-line ... is being carried", "we spoke thirty different ships" (unexplained sea usage), "not a gallon you burn, but at least one drop". Modernized; "spoke" glossed briefly.

### 45.8  `2d22d07d647ac46f` → `1fdfc4dd82319782`
- **R2-fid** (voice): Source: 'I have ever found that when narrating to them some specific example ... they have significantly complimented me upon my facetiousness'. 'significantly' (pointedly, i.e. signalling disbelief) carries the irony and is dropped; 'flatter me' also loses 'to them' and the habitual tense.

### 45.9  `a823db18281cfedb` → `25a7211eed7970c9`
- **R1** (voice,convention): Candidate duplicates "deliberately malicious to deliberately stave in", losing "judiciously malicious" and "with direct aforethought"; the source's italic stress on "has done it" is lost.

### 45.10  `eda487d6caaf697d` → `e43584724ed8bb04`
- **R1** (unmodernized): Near-verbatim 1851 text: "Ere long", "issued from the shoal", "Being returned home at last", "forthwith forswearing the sea, he has never tempted it since", "At this day". Modernized; all names, dates and the "ten minutes" quotation kept.
- **R2-fid** (convention): Lead decision 2 (Melville's footnotes): source places the footnote marker '*' at the end of 45.10 ('within a few miles of the scene of the catastrophe.*') and opens 45.11 with '*'. Candidate drops both markers.

### 45.11  `eb4f52de855cd44c` → `4b241b2ef2220ddf`
- **R1** (omission,invention): Second Chace extract dropped ("Again: \"At all events, the whole circumstances taken together ... decided, calculating mischief, on the part of the whale ... induce me to be satisfied that I am correct in my opinion.\""), replaced with invented material: Pollard "confirmed every word", "night watchman", "most impressive man ... I ever encountered". Quotation also altered ("shoal" to "school").
- **R2-fid** (convention): Lead decision 2 (Melville's footnotes): source places the footnote marker '*' at the end of 45.10 ('within a few miles of the scene of the catastrophe.*') and opens 45.11 with '*'. Candidate drops both markers.

### 45.12  `e7f3d01afd670e23` → `cadb62a405d67fad`
- **R4-mod** (unmodernized): framing sentence modernized; Chace quotation verbatim

### 45.15  `1715b1a66582cb13` → `00d08d05c9f87539`
- **R1** (invention,omission,voice,technical): From "Very good" on, candidate invents a strike that throws "every man to the deck" and a closing joke about skepticism. Missing: "leak so much as a thimbleful", "there is more coming", "this impregnable craft for Valparaiso", "a portly sperm whale, that begged a few moments' confidential business with him", "such a thwack", "with all his pumps going ... heave down and repair", "I am not superstitious, but I consider the Commodore's interview with that whale as providential", "Saul of Tarsus", "the sperm whale will stand no nonsense". "sloop-of-war" blurred to "warship".

### 45.17  `4aa1860cc4119857` → `a24ccf1c28867a44`
- **R1** (convention): Quoted Langsdorff text altered: printed place name "Ochotsh" changed to "Okhotsk" (brief: keep proper names as printed) and "prevent its striking against him" reworded.

### 45.18  `7b7bb7973eba5cfd` → `4042f3358d82c9b8`
- **R1** (invention): Invented final sentence "He bargained it from the Russians as one might buy a used pony cart in the woods." Source ends "purchased by my uncle after bartering away the vessel in which he sailed from home."

### 45.19  `4d125a45f64bd009` → `dfc559d841ec9820`
- **R2-fid** (voice): Source: 'one of ancient Dampier's old chums'. The colloquial, affectionate 'old chums' is flattened to 'companions'.
- **R2-acc** (voice): Three dashes in one opening clause ('In that straightforward, manly book ... — so full of honest wonders — the voyage of Lionel Wafer, one of ancient Dampier's old chums — I found') make it unclear which phrase is the book's title; hard to parse aloud. Reordered so the book is named first, no content changed.

### 45.20  `be0c7a78ad90af81` → `2b9860ed23f06d49`
- **R1** (meaning,invention,omission,hedge): Candidate invents Wafer attributing the shock to "a large whale, the body of which ... seemed larger than the ship itself" (recycled from Langsdorff). Source: Lionel "goes on to impute the shock to an earthquake" citing "a great earthquake ... along the Spanish land", and Ishmael only speculates: "But I should not much wonder if ... the shock was after all caused by an unseen whale vertically bumping the hull from beneath." Also printed "Juan Fernandes" changed; omission mark and closing "!" dropped from the quotation.
- **SWEEP-names** (convention): Lead decision 7 sweep (spelling variants of geographic/people names to modern standard form): Juan Fernandes -> what is now Juan Fernández
- **R4-mod** (unmodernized): narration modernized; Wafer quotation verbatim incl. source "* * * * *" (candidate had "...")
- **R4-fid** (meaning): Source 'did actually do great mischief along the Spanish land' means Spanish-held America (cf. Wafer's 'Main of America'); round-4 'along the Spanish mainland' reads to a modern reader as mainland Spain. Restore the Spanish-held sense. Wafer quotation itself is verbatim, including the restored '* * * * *' (correct).

### 45.21  `2a43da50782b3358` → `7f11ddef3b25e5ac`
- **R1** (unmodernized): Near-verbatim 1851 text: "can tell a story on that head", "nor is it without conveying some eloquent indication of his character, that ...", "Verily". Modernized with all examples (Pusie Hall, towing like a horse with a cart, the open-mouthed gape) and the Solomon allusion kept.

### 45.23  `b799eefc2e1f3a64` → `c49f309f26f143bf`
- **R1** (unmodernized): Near-verbatim 1851 text: "cannot easily be gainsaid", "Of what precise species this sea-monster was, is not mentioned", "I fancied", "habitual gregarious resort", "hence a sperm whale could". Modernized lightly; hedges ("strongly inclined to think", "perhaps never can be") kept.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 45.24  `1116e06692feb72c` → `b6fc63e3a72961f5`
- **R1** (invention,omission): Source: the monster "for half a century stove the ships of a Roman Emperor"; candidate drops "of a Roman Emperor" and invents "and lay on the surface of the sea".

### 46.0  `5ec7afdbb82bc1f4` → `49cd288a94f0d53a`
- **R1** (unmodernized): Left in verbatim 1851 English: "ever had in view", "habituation", "the collateral prosecution of the voyage", "there were not wanting other motives", "It would be refining too much", "by so much the more", "if such an hypothesis be indeed exceptionable", "not so strictly according with". Fully modernized; hedges ("it may have been", "perhaps", "possibly ... in some degree") kept.

### 46.1  `60c294286fea2164` → `d8ce955d14549366`
- **R1** (unmodernized): Verbatim 1851 English: "ascendency", "the intellectual but stand in a sort of corporeal relation", "could he, would joyfully disintegrate himself from it", "ere the White Whale was seen", "noways more significantly manifested", "impiousness which naturally invested it", "however promissory of life and passion", "it is above all things requisite". Fully modernized; the tool/magnet images, the spiritual/intellectual/corporeal argument and the sailors-weather image kept.
- **R2-acc** (voice): 'when they are kept on for some object remote and blank in the pursuit' does not parse on a first read ('kept on' = retained; 'blank in the pursuit' dangles).
- **R3-fix** (invention): R2-acc parse fix to source 'when retained for any object remote and blank in the pursuit' added 'long' ('kept at a long pursuit'), which the source does not say at this point. Minimal fix drops 'long'; the rest of the accessibility edit is faithful.

### 46.2  `8aeb761c5c6313d6` → `eaf50f14d0a0a316`
- **R1** (unmodernized): Verbatim 1851 English: "Nor was Ahab unmindful", "mankind disdain", "evanescent", "this my savage crew", "high lifted", "that final and romantic object, too many would have turned from", "aye, cash", "no perspective promise of it", "quiescent cash all at once mutinying". Modernized; "cashier" pun kept with a brief gloss.

### 46.3  `576fa29f9ec604cc` → `53a2041d69f73276`
- **R1** (unmodernized): Verbatim 1851 English: "Nor was there wanting still another precautionary motive", "if so disposed, and to that end competent", "wrest from him the command", "From even the barely hinted imputation of usurpation ... Ahab must ... have been most anxious to protect himself" (inverted), "which it was possible for his crew to be subjected to". Modernized; hedges ("it is probable", "perhaps somewhat prematurely") kept.

### 46.5  `a82a5e0564817045` → `1e07ba08222f7302`
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 47.1  `967a7d2d3cacb4a8` → `21e8383cdfc5b69e`
- **R1** (omission,invention,meaning): The closing argument is garbled and partly invented: "none working separately", "If chance freely determines the pattern, necessity sets its laws. Free will works somewhere between them." Source: "nowise incompatible—all interweavingly working together"; "The straight warp of necessity, not to be swerved from its ultimate course ... free will still free to ply her shuttle between given threads; and chance, though restrained ... within the right lines of necessity, and sideways in its motions directed by free will ... chance by turns rules either, and has the last featuring blow at events." Also "weaving and weaving away at the Fates" replaced by "weaving the unchangeable pattern of my own destiny"; the sword "which thus finally shapes and fashions both warp and woof" became "strikes the woof at random"; "impulsive" and "easy" dropped.
- **R2-acc** (voice): 'though thus prescribed to by both, chance ... has the last, shaping blow at events' — 'prescribed to by' is stilted and 'has the blow at' is unidiomatic; stumbles when read aloud.

### 47.2  `5016ecdef6fb1267` → `155f38830f36e4d6`
- **R1** (invention,omission,meaning): Candidate invents "heard from the mastheads of three other whaling vessels in the same waters" and "to us, hearing it for the first time, it hardly seemed possible that anything could make such sounds". Source: the sound "perhaps being heard all over the seas, from hundreds of whalemen's look-outs perched as high in the air; but from few of those lungs could that accustomed old cry have derived such a marvellous cadence as from Tashtego the Indian's."
- **SWEEP-names** (convention): Lead decision 7 sweep (spelling variants of geographic/people names to modern standard form): Gay-Header -> Gay Header
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.
- **R4-fid** (hedge,voice): Source hedge 'the same sound was that very moment perhaps being heard' is strengthened to 'may well have been ringing out'; restore the plain 'perhaps'. Also restore the repetition in 'weaving and weaving away', which the modern rendering flattened to 'weaving away'.

### 47.12  `46648da4784980f4` → `714e847ed187c3f9`
- **R1** (invention,omission,meaning,technical): After the mill-round trick, candidate invents "every reason to believe the whales were heading steadily downwind. And so it proved. Suddenly Tashtego gave a tremendous shout", which also contradicts 47.13. Missing: the reason ("no reason to suppose that the fish ... had been in any way alarmed, or indeed knew at all of our vicinity"); shipkeepers relieving the Indian at the main-mast head; fore and mizzen men down; "line tubs ... cranes were thrust out; the mainyard was backed"; boats "like three samphire baskets over high cliffs"; crews clinging outside the bulwarks, foot on the gunwale; "man-of-war's men about to throw themselves on board an enemy's ship".
- **R2-acc** (unmodernized): 'So looks the long line of a man-of-war's men about to...' is inverted archaic syntax left in modernized narration.

### 47.13  `758d74ecbea72085` → `7cd1293a128f2f22`
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 48.0  `3693571d70cda019` → `87d3fa9f33936161`
- **R1** (unmodernized): Near-verbatim 1851 text: 'noiseless celerity', 'had always been deemed', 'swart', 'funereally invested him', 'ebonness', 'diabolism of subtilty'. Modernized with all details kept (Chinese jacket, plaited-hair turban, Manillas, the devil's counting-room).
- **R2-acc** (voice): Read-aloud parse: 'secret confidential agents on the water of the devil, their lord' reads as 'the water of the devil'. Reorder so the devil is plainly the principal.
- **SWEEP-names** (convention): Lead decision 7 sweep (spelling variants of geographic/people names to modern standard form): Manillas -> natives of the Manila islands

### 48.3  `781522c8b74c5725` → `4e54e02155a4bcc9`
- **R2-acc** (voice): Subjectless tag '"...do you hear?" shouting across the deck.' is a dangling fragment when read aloud.

### 48.4  `ea8cf1a7e31e646d` → `3c2b430d6975f9fd`
- **R2-fid** (voice): Source 'with a dexterous, off-handed daring' — the 'off-handed' (casual, careless) quality is lost in 'a daring agility'.

### 48.11  `981ca331f94e405e` → `221bd4bbfd95c9d4`
- **R1** (unmodernized): Stubb's speech keeps the archaic pronouns 'The devil fetch ye, ye ragamuffin rapscallions; ye are all asleep ... Pull, will ye? ... don't ye pull? ... every mother's son of ye ... Now ye do something', plus 'yonder boat', 'girdle', 'start your eyes out'. Per brief, ye -> you in dialogue; every phrase of the banter kept.

### 48.12  `abc33203993cb7b4` → `8fce8154c53321e9`
- **R1** (unmodernized): Verbatim 1851 narration: 'exordium ... given here at large', 'inculcating the religion of rowing', 'therein consisted his chief peculiarity', 'so loungingly managed', 'odd sort of humorists ... to put all inferiors on their guard'. Modernized, keeping the sermon/congregation metaphor and the fun-and-fury paradox.

### 48.17  `9b038fb96c43eb55` → `68f299b5bd732c30`
- **R1** (meaning,technical): Starbuck says to Stubb 'that's what ye came for' (you, Stubb); candidate reads 'what we came for', shifting the speaker's stance. Also 'hogsheads of sperm' flattened to 'barrels' (brief: keep measures as printed). Rest kept.

### 48.19  `45807195809c01ad` → `fbde23c520dbc536`
- **R1** (unmodernized): Verbatim 1851 syntax: 'Now the advent ... this had not unreasonably awakened', 'having some time previous got abroad among them, though indeed not credited then', 'superstitious surmisings', 'enigmatical hintings'. Modernized; the hedge 'not unreasonably', 'in some small measure' and the Elijah/Nantucket-dawn recall kept.

### 48.20  `cc9ac31e16312379` → `c6dbff6fb2f374e6`
- **R1** (unmodernized,convention): Verbatim 1851: 'having sided the furthest to windward', 'a circumstance bespeaking how potent a crew', 'ere the White Whale had torn him', 'no distantly discernible token', 'harpooneer oar'. Modernized; trip-hammer and Mississippi-steamer boiler images, fencer's arm, 'peaked' oars kept.

### 48.22  `52eba55fc616e86a` → `acc5f81b2032c777`
- **R1** (voice): Source 'the savage stood erect' softened to 'the harpooner' (brief hard rule 4: don't soften period language); 'triangularly platformed' blurred. Otherwise kept.

### 48.23  `2eefcfdea3eff505` → `17bbc7eabfb8dfec`
- **R1** (omission,invention): Last sentence replaced by invention ('a resourceful fellow. Not a man to be long kept down by anything ... Daggoo loomed behind him like a dark mountain, Flask would still be the first to see a whale'). Source: 'But little King-Post was small and short, and at the same time little King-Post was full of a large and tall ambition, so that this loggerhead stand-point of his did by no means satisfy King-Post.' Also 'sunk to all but her trucks' blurred to 'topmost spars'.

### 48.28  `addfa007da638ea5` → `0660f00fc7fbfa79`
- **R1** (omission,voice): Image 'his hearse-plumed head' reduced to 'plumed head' (the hearse image recurs in the chapter's tone); 'the gigantic negro' softened to 'harpooner' (hard rule 4); 'breastband' changed to 'chest-strap'.

### 48.29  `c653418bd6276201` → `06d86a07768d66de`
- **R1** (omission,invention,meaning): Second half invented: 'bore little Flask ... as though the little man were simply a badge or ornament ... like the black figure on the front of some enormous hearse, bearing a white coffin'. Omitted: Daggoo 'to every roll of the sea harmoniously rolled his fine form'; 'On his broad back, flaxen-haired Flask seemed a snow-flake. The bearer looked nobler than the rider'; Flask stamping without adding 'one added heave' to 'the negro's lordly chest'; the closing simile 'So have I seen Passion and Vanity stamping the living magnanimous earth, but the earth did not alter her tides and her seasons for that.'
- **R2-acc** (meaning): 'Truly lively, tumultuous, showy little Flask' reads as an intensifier on 'lively'; the sense is concessive ('True, ... Flask would now and then stamp ... but').

### 48.30  `16556d585a0ad899` → `38fc7294a1832ad0`
- **R1** (omission,invention,meaning): Ending invented: Tashtego's eyes 'set on a level with the water like two floated pistols, gave a sharp shout and declared that the whale was just below. Instantly, Stubb's pipe went out of his mouth.' Source: 'whose eyes had been setting to windward like two fixed stars, suddenly dropped like light from his erect attitude to his seat, crying out in a quick phrensy of hurry, "Down, down all, and give way!—there they are!"' Also the hedge 'as his wont in such cases, it seems' lost, and 'regular soundings' blurred.

### 48.31  `3c4f95a4a5b6c4b5` → `52d8c36949188aa3`
- **R1** (omission,invention): Final sentences invented (whales 'strangely magnified, like the full-length reflections in a thin mirror'; hunters who 'fatally mistaken the size of the whale ... crushed by the weight of the rising monster'). Omitted source ending: 'Seen in advance of all the other indications, the puffs of vapor they spouted, seemed their forerunning couriers and detached flying outriders.'

### 48.33  `09544ccf3f89d1dd` → `7b34860c7d4d85ac`
- **R2-fid** (technical): Source 'two visible needles in two unerring binnacle compasses' — 'binnacle' dropped; the ship's steering compass image is blurred to generic 'compasses'.

### 48.34  `ee61d03f40178123` → `64526f1f04cc20c8`
- **R1** (omission,invention): Ending invented: 'And still he shrieked: "Lay me on — lay me on! Lay me on, sir!" he cried to Daggoo. "Break something! Break your back! Burst yourself! Only get me there!"'. Omitted source: 'and finally fell to rearing and plunging in the boat's stern like a crazed colt from the prairie.' Also dropped the repeated 'boys' after 'wife and children'.

### 48.36  `0c7320651debe6ee` → `44f8b935ea4b8764`
- **R1** (meaning,voice): 'the blessed light of the evangelical land' changed to 'Christian land', 'infidel sharks' to 'godless', 'audacious seas' to 'lawless seas' (new sense). Restored Melville's terms, which are modern words.

### 48.37  `352e27ec12db469f` → `a8bdf18bd7ca3d2b`
- **R1** (omission,invention,meaning): Invented ending: 'custom dictating that they must have no sight of the terror facing them. Well enough for them. But what about us in the bow? We could see the whole thing.' Omitted: 'usage pronouncing that they must have no organs but ears, and no limbs but arms, in these critical moments'; also 'put out their eyes' softened to 'row blindly, their eyes shut'.

### 48.38  `0afe8fae5a8b1312` → `28e41ba00a4e1ca0`
- **R1** (omission,invention): Omitted 'the headlong, sled-like slide down its other side', 'the cries of the headsmen and harpooneers, and the shuddering gasps of the oarsmen', and 'the wondrous sight of the ivory Pequod bearing down upon her boats with outstretched sails, like a wild hen after her screaming brood'. Invented: 'Not a man breathed. A thin mist of sweat covered every face. The chests heaved as if laboring at the forge. Not one word was spoken.'

### 48.39  `fc3d8198d9b7a4c1` → `a07dbcad47db6fe1`
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 48.40  `93d670be46a4b9bb` → `937badb1c61952d7`
- **R1** (technical): 'The jets of vapor' changed to 'jets of spray' (Melville consistently calls the spout vapor) and 'the whales seemed separating their wakes' blurred to 'paths'; 'dun' dropped (restored as 'dusky'). Minimal fix, rest kept.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 48.46  `c8e0b93dc8591fe5` → `63654eecd537cda3`
- **R2-fid** (technical): Source 'a gush of scalding vapor shot up near by' — the spout is 'vapor' throughout (the repair itself restored 'vapor' in 48.40 for this reason); 'steam' shifts Melville's term.

### 48.47  `31895869a52bbb79` → `1c9dcee87cfc91dd`
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 48.48  `779890e63ab05735` → `c457dd9e14b5c43a`
- **R1** (omission,invention,meaning): Second half invented ('made an eerie sound against the half-submerged gunwale', bailing 'with our hats', oars used 'as paddles, guiding the boat through the breakers', 'each flashing cheek was his companion's lightning-rod'). Source: the rising sea 'forbade all attempts to bale out the boat'; oars 'performing now the office of life-preservers'; Starbuck lights the lantern from 'the waterproof match keg' after many failures, sets it on 'a waif pole', hands it to Queequeg 'as the standard-bearer of this forlorn hope'; 'holding up that imbecile candle in the heart of that almighty forlornness ... the sign and symbol of a man without faith, hopelessly holding up hope in the midst of despair.' All omitted. 'live coals' also dropped.
- **R2-acc** (technical): 'waif pole' is unexplained here and stops a first-time reader; add a brief gloss (a waif is the small flag on a pole used to mark a killed whale).

### 48.49  `2fc8e6aa4c644b5b` → `8cccf064222af201`
- **R1** (invention): Invented explanation 'which at last had been searching for us after the other boats returned'; source only says 'as the ship at last loomed into view, bearing right down upon us'. Also 'ropes and yards hitherto muffled by the storm' changed to 'masts hidden by the storm'.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.
- **R4-acc** (accessibility): Read-aloud/reread: the creaking is compared to 'ropes and yards' themselves; 'whose sound the storm had muffled' is a tangled relative clause. Minimal smoothing, no content change.

### 48.50  `35ce71a5d7b8140e` → `0ab0872a4b8181cb`
- **R1** (invention,omission,meaning): Invented last sentence 'It was only the morning after that we were recovered' (contradicts the scene: it is already dawn and they have just been taken aboard). Omitted: the ship was cruising 'if haply it might light upon some token of our perishing,—an oar or a lance pole'; 'for one instant' dropped.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 49.0  `641747869542685b` → `b093906ff1c7ca63`
- **R1** (omission,invention): Second half replaced by invented 'And just as the ostrich blindly swallows these things, so does this man greedily consume the strangest opinions.' Omitted: small difficulties, disaster, 'peril of life and limb ... and death itself, seem to him only sly, good-natured hits, and jolly punches in the side bestowed by the unseen and unaccountable old joker'; the mood 'comes over a man only in some time of extreme tribulation ... in the very midst of his earnestness'; 'There is nothing like the perils of whaling to breed this free and easy sort of genial, desperado philosophy; and with it I now regarded this whole voyage of the Pequod, and the great White Whale its object.' Also 'persuasions' dropped.

### 49.6  `b6705540c452c233` → `c9428fa2e9c4e77e`
- **R1** (omission,invention,meaning): Chain of 'considering' clauses rewritten with invented content ('I always belonged to the harpooner's boat, and the harpooner's duty was to approach nearest to the whale's head'; harpooner throwing 'from a frantically rocking boat'). Omitted: 'the particular disaster to our own particular boat was chiefly to be imputed to Starbuck's driving on to his whale almost in the teeth of a squall'; 'Starbuck, notwithstanding, was famous for his great heedfulness'; 'I belonged to this uncommonly prudent Starbuck's boat'; 'in what a devil's chase I was implicated, touching the White Whale'; going below; and the line to Queequeg '"come along, you shall be my lawyer, executor, and legatee."' Also 'frantic stampings' became 'excitement'.

### 49.7  `5804292ef15047c1` → `f6af748f24bc1c59`
- **R1** (omission,invention): Final image replaced: source 'I looked round me tranquilly and contentedly, like a quiet ghost with a clean conscience sitting inside the bars of a snug family vault'; candidate invents 'made up my mind to be coolly brave from that moment forward' (which also pre-empts 49.8). 'upon the present occasion' dropped.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 50.3  `9f30423c456d4b09` → `744d77707631cdd0`
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 50.5  `b5f014958a1d8c1c` → `bff3118d14e9ab81`
- **R1** (unmodernized): Near-verbatim 1851 text: 'comparatively harmless vicissitudes', 'apportioned to him', 'such generous conceits', 'hinted his desires on that head', 'touching all that matter', 'bestirring himself', 'solicitously', 'the anxiety he evinced', 'preparative heedfulness', 'did by no means involve'. Modernized; all boat-fitting detail kept (thole-pins, skewers over the bow groove, sheathing, thigh-board/clumsy cleat, semicircular depression, carpenter's chisel).
- **R2-acc** (voice): 'though, to be sure, after they had been a little while out of port and all hands had finished ...; when, some time after this, Ahab was now and then found...' has a dangling 'after ... ; when' clause that forces a reread; 'thole-pins' unglossed. Split the clause at the start of the catalogue; keep the 'when ... — all these things, I say' cadence and all content.

### 50.6  `353c7a42e0f1ea4f` → `ea74d0b830832d91`
- **R1** (omission,invention): Ending invented: 'that the Devil himself could hardly have been surprised at Fedallah's crew' (reverses the joke's direction). Source: 'that Beelzebub himself might climb up the side and step down into the cabin to chat with the captain, and it would not create any unsubduable excitement in the forecastle.' Also 'nooks and ash-holes of the earth' lost 'ash-holes'.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 50.7  `84b8fd0fee4de8f2` → `cf32f1fbd510395b`
- **R1** (unmodernized): Verbatim 1851: 'Whence he came in a mannerly world like this', 'he soon evinced himself to be linked', 'nay', 'all this none knew', 'one cannot sustain an indifferent air', 'unknowing whence he came', 'mundane amours'. Modernized; the hedge 'Heaven knows, but it might have been even authority over him', Genesis and 'the uncanonical Rabbins' kept.
- **R2-acc** (unmodernized): 'Rabbins' is an archaic form of 'rabbis' (an ordinary word, not a proper name).

### 51.1  `53884f1da3f9f426` → `c7feb4ea8947e4b5`
- **R1** (omission,invention): Second half invented ('the crew would find him there in the morning, still standing in the same posture ... his thin lips moved on and on, as if muttering some endless prayer'). Omitted: 'though herds of whales were seen by night, not one whaleman in a hundred would venture a lowering for them'; 'his turban and the moon, companions in one sky'; his silence over 'several successive nights' then 'his unearthly voice ... announcing that silvery, moon-lit jet'; mariners starting up 'as if some winged spirit had lighted in the rigging'; '"There she blows!" Had the trump of judgment blown, they could not have quivered more; yet still they felt no terror; rather pleasure'; 'almost every soul on board instinctively desired a lowering.'

### 51.2  `e0d0ea9530cd54b3` → `5793b3e8d0de33e8`
- **R1** (omission,invention): Ending invented ('And all the while the phantom jet kept rising ahead' — the source says the opposite: 'the silvery jet was no more seen that night'). Omitted: 'had you watched Ahab's face that night, you would have thought that in him also two different things were warring'; 'his one live leg made lively echoes ... every stroke of his dead limb sounded like a coffin-tap. On life and death this old man walked'; eager glances 'like arrows'; 'Every sailor swore he saw it once, but not a second time.' Also 'drive yawingly' lost.

### 51.4  `33410c15310646f6` → `b07c36f80de1d467`
- **R2-fid** (omission): Source 'that unnearable spout was cast by one self-same whale' and 'at however remote times, or in however far apart latitudes and longitudes' — 'unnearable' (the spout can never be approached, the point of 51.3) is dropped, and 'latitudes and longitudes' flattened to 'place'. Also 'in the remotest and most savage seas' weakened to 'some remote and savage sea'.

### 51.6  `55a0be7b5533be84` → `f2491e2b6b7faddd`
- **R2-fid** (voice): Source 'the ivory-tusked Pequod ... gored the dark waves in her madness' — 'gored' completes the tusk image; 'drove into' loses it.
- **R3-fix** (voice,meaning): Source 'gored the dark waves in her madness'. The R2 fix restored 'gored' but the candidate still has 'in her fury'; 'madness' is Melville's word and ties the ship to Ahab's madness. Restore it.

### 51.8  `d54e8b0559ff5652` → `01f31e7acc4759a3`
- **R2-acc** (voice): 'For long deceived by...' is heard as 'For long,' (a time phrase); a comma after the causal 'For' fixes the parse.
- **R3-fix** (meaning): Source 'for long allured by the perfidious silences that before had attended us'. 'allured' means lured or enticed on, which echoes the jet 'alluring us on' in 51.3; 'deceived' drops the luring sense. 'lured on' restores it, and 'treacherous' still carries 'perfidious'.

### 51.9  `ec82bff1fb9134ee` → `0b5c92a8caf85637`
- **R1** (omission,invention,meaning,technical): From the fatalist sentence on, the paragraph is invented (icicle on the helmsman's tiller dipped in the sea; Ahab refusing the cabin because its floor was 'worse than standing on the backs of wild bulls'; ivory leg struck and Ahab 'hurled heavily against the deck'; a watchman at the cabin door; and the tell-tale footnote merged in and misdescribed as 'the binnacle'). Omitted: sleet 'would all but congeal his very eyelashes together'; the crew in a line along the bulwarks in the waist, each 'slipped himself into a sort of bowline secured to the rail'; 'as if manned by painted sailors in wax'; 'swift madness and gladness of the demoniac waves'; night 'muteness of humanity before the shrieks of the ocean'; Ahab not seeking repose in his hammock; Starbuck seeing him in the cabin 'with closed eyes sitting straight in his floor-screwed chair', sleet dripping from 'the unremoved hat and coat', the chart of tides and currents, the lantern 'from his tightly clenched hand', closed eyes 'pointed towards the needle of the tell-tale'. Footnote marker restored so 51.10 stays attached.

### 51.10  `55e3da1eead617e2` → `301faa01fa4979ad`
- **R2-fid** (convention): Source footnote opens '*The cabin-compass is called the tell-tale'. Lead decision 2: keep each asterisk where the source places it; the edition does so at 44.5, 45.11, 86.13 etc. The call-site '*' in 51.9 is kept, but the footnote's own marker is missing.

### 52.0  `e7b5629f53bfd15e` → `83ce4b12fdd287b4`
- **R2-fid** (convention): Source 'off the distant Crozetts'. Lead decision 3 and the brief's name list require Melville's spelling 'Crozetts'; the candidate normalizes to 'Crozet Islands'.
- **SWEEP-names** (convention): Lead decision 7 sweep (spelling variants of geographic/people names to modern standard form): Crozetts -> Crozets

### 52.1  `c3624148113c4948` → `5266d75dddf3028e`
- **R1** (omission,invention): Second half invented ('Three of the ship's officers leaned over the railing with long, bent fishing rods ... three old trees with three old crows perched on them'). Omitted: 'over a fathomless sea'; when the ship 'slowly glided close under our stern, we six men in the air came so nigh to each other that we might almost have leaped from the mast-heads of one ship to those of the other'; 'those forlorn-looking fishermen, mildly eyeing us as they passed, said not one word to our own look-outs, while the quarter-deck hail was being heard from below.' 'fullers' became 'bleachers'.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 52.3  `6495a7c08e462adc` → `2ea9be9993a111ad`
- **R1** (omission,invention,meaning): Ending reversed/invented: candidate says Ahab 'knew that the other vessel was too far away to be heard, so he merely stood watching her move off'. Source: 'But taking advantage of his windward position, he again seized his trumpet, and knowing by her aspect that the stranger vessel was a Nantucketer and shortly bound home, he loudly hailed—"Ahoy there! This is the Pequod, bound round the world! Tell them to address all future letters to the Pacific ocean! and this time three years, if I am not at home, tell them to address them to ——"' The hail sets up 52.5's 'Keep her off round the world!'.

### 52.4  `eac4e58df5604638` → `2af8e889b53b9e1a`
- **R1** (meaning): 'to any monomaniac man, the veriest trifles capriciously carry meanings' became 'the most trivial things can carry powerful meanings' — adds 'powerful', drops 'capriciously'. Minimal fix.

### 52.7  `0d68d2fad936a506` → `cfb9b963b012c5d6`
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 53.0  `92b37569233773b6` → `2a81557aa7a84231`
- **R1** (hedge,meaning): Hedge changed: source 'he would not after all, perhaps, have boarded her' became 'would probably not have boarded her anyway'. Last sentence rewritten to pre-empt the Gam: source 'were not something said here of the peculiar usages of whaling-vessels when meeting each other in foreign seas, and especially on a common cruising-ground'.
- **R2-acc** (technical): 'the whaler we had spoken' uses nautical 'speak' (to hail a ship at sea), which reads as a slip to a first-time reader; brief gloss.

### 53.1  `e317b924b0146224` → `9f86ce28f24aa278`
- **R1** (omission,invention): Last sentence invented ('most whalers are away from home for at least three or four years at a stretch'). Omitted source: 'And especially would this seem to be a matter of course, in the case of vessels owned in one seaport, and whose captains, officers, and not a few of the men are personally known to each other; and consequently, have all sorts of dear domestic things to talk about.' Also 'come into still closer, more friendly and sociable contact' and 'how much more natural, I say' flattened.

### 53.2  `4ec952d8cf0ad240` → `605c5bca7193ee33`
- **R1** (omission,invention): Ending invented ('one may have received recent mail from a friendly passing vessel, while the other has received none at all'). Omitted: 'a transfer of letters from some third, and now far remote vessel; and some of those letters may be for the people of the ship she now meets'; 'Besides, they would exchange the whaling news, and have an agreeable chat'; 'not only would they meet with all the sympathies of sailors, but likewise with all the peculiar congenialities arising from a common pursuit and mutually shared privations and perils.'

### 53.3  `35452054598880e3` → `afadbfce9465a8ac`
- **R1** (omission,meaning,voice): 'his nondescript provincialisms' changed to 'antiquated equipment'; 'sea-peasant' to 'poor rustic cousin'. Omitted the Yankee retort: 'where this superiority in the English whalemen does really consist, it would be hard to say, seeing that the Yankees in one day, collectively, kill more whales than all the English, collectively, in ten years. But this is a harmless little foible ... probably, because he knows that he has a few foibles himself.'

### 53.4  `57680db1fa354e7d` → `ca69e734334fb016`
- **R1** (omission,invention): Invented simile 'as ridiculous as two aristocrats meeting on a staircase, each insisting the other go first'. Omitted: men-of-war show little 'right-down hearty good-will and brotherly love'; the slave-ships that 'run away from each other as soon as possible'; the pirates' hail '"How many skulls?"—the same way that whalers hail—"How many barrels?"' and their steering apart as 'infernal villains on both sides' who 'don't like to see overmuch of each other's villanous likenesses'. Hedge 'perhaps' before the rig criticism dropped.
- **R2-acc** (voice): Second sentence is a fragment beginning 'Whereas some merchant ships ... will often pass on' with no main clause.

### 53.5  `a7d619b52101df3d` → `0267c178074bdaa9`
- **R1** (omission,invention): Invented deferral 'is something that requires a separate chapter for its explanation. But for now, let us proceed.' Source: 'this is a question it would be hard to answer', followed by the omitted gallows joke: pirates' profession 'sometimes ends in uncommon elevation, indeed; but only at the gallows ... he has no proper foundation for his superior altitude. Hence, I conclude, that in boasting himself to be high lifted above a whaleman, in that assertion the pirate has no solid basis to stand on.' Also 'gamesome stuff' (pun on Gam) flattened to 'mocking'.

### 53.6  `a854f275bc414225` → `b0474132bbc1f6a3`
- **R1** (voice): Pun lost: 'Noah Webster's ark does not hold it' flattened to 'Noah Webster's dictionary does not contain it'; 'true born Yankees' changed to 'Americans'; 'incorporated into the Lexicon' and the mock-learned 'let me learnedly define it' flattened.

### 53.8  `41945a3024b531c5` → `c3ad306a53d5de70`
- **R1** (omission,invention,meaning): Second half invented (captain 'practically sitting on the boat's bottom', 'the most athletic captain will choose the bow oar', 'an equal among equals'). Omitted: 'milliner's tiller'; captains 'wheeled about the water on castors like gouty old aldermen in patent chairs'; the harpooneer steering and the captain 'pulled off to his visit all standing like a pine tree'; 'sustaining his dignity by maintaining his legs'; steering oar hitting 'the small of his back', after-oar 'rapping his knees'; 'length of foundation is nothing without corresponding breadth. Merely make a spread angle of two poles'; hands in trouser pockets 'for ballast'; and the authenticated cases of seizing 'the nearest oarsman's hair, and hold on there like grim death'.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.
- **R4-fid** (meaning): Source: the steering oar is 'hitting him now and then in the small of his back'; 'keeps knocking him' makes it continuous. Restore the intermittence.
- **R4-acc** (accessibility): Two reader stumbles: (1) 'It would be high times indeed' is an obsolete idiom that reads like a typo for 'high time'; rendered as the ironic 'a fine state of affairs'. (2) 'gay cords and ribbons' — in a paragraph already riffing on 'effeminacy', the 1851 sense 'brightly colored' is likely to be misread by a modern listener; 'bright' keeps the sense. 'effeminacy' itself is period language and is kept.

### 54.2  `1d2eb446bacae0f1` → `90bdae87c83d5e74`
- **R1** (invention,omission,meaning): Live text invents a new narrative (Steelkilt telling Tashtego on the Pequod's forecastle on the Japan cruising ground, officers knowing only 'how the mate had been killed', 'a fight between a mate and one of the crew', the man 'replacing the chief mate') and drops the source's account: the secret known only to 'three confederate white seamen', unknown even to the Town-Ho's captain, passed to Tashtego 'with Romish injunctions of secrecy', and 'never transpired abaft the Pequod's main-mast'; also absorbs 54.4's Lima frame into 54.2 and drops the footnote asterisk.

### 54.3  `d4fa46b4f6de72e1` → `6e6cd9aaa9042af6`
- **R1** (convention,technical): Footnote marker '*' dropped (the edition keeps footnote asterisks, e.g. 86.13, 95.3), and Melville's 'terrapin' changed to 'tortoise'.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 54.4  `94a3ca7f6b2d1bcc` → `1f4bbb644a9c3c05`
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 54.5  `5e896bba211053bb` → `bb73b0a9a33450b1`
- **R1** (unmodernized): Near-verbatim 1851 syntax and diction ('prior to my first learning the events which I am about to rehearse', 'upon handling the pumps, according to daily usage', 'made more water in her hold than common', 'averse to quit them', 'sensibly increased', 'stood away'); one long run-on period left intact.
- **R2-acc** (accessibility,gloss): 'north of the Line' uses the sailor's term for the equator, unexplained in this chapter; a first-time reader or listener may not know it. Brief accurate gloss added.

### 54.6  `32c2187f28968b85` → `1aaef172823fa1bf`
- **R1** (omission,voice): Drops 'without the occurrence of the least fatality' and 'bitterly' (in 'bitterly provoked vengeance'); 'prosperous breezes' flattened to 'good weather'; the closing sentence is broken into an ungrammatical fragment ('And for the provoked vengeance of Steelkilt').

### 54.8  `1173a4588aaa1ff8` → `05de03b040d64533`
- **R1** (unmodernized): Left almost verbatim 1851: 'may be, you shall soon hear further', 'well-nigh', 'interflowing aggregate', 'Afric', 'Borean', 'full many a midnight ship', 'yet was he quite as vengeful', 'laid him down', 'might yet by inflexible firmness ... thus treated' (broken syntax). Rendered fully in modern English, every image kept.

### 54.9  `ce1652ebc1a721cd` → `a482ce987dfe9278`
- **R1** (omission,invention,meaning): Flagged short paragraph confirmed as loss: the second sentence's joke ('he and his shipmates would never again remember it, on account of all hands gently subsiding to the bottom') is replaced by invented business ('the crew wake to the sound of the water washing over the cabin floor ... not a thing that alarms anyone'); the whole sentence on the 'solitary and savage seas' to the west, pumping 'in full chorus' along 'a tolerably accessible coast', and the closing 'really landless latitude' sentence are missing.

### 54.10  `cb857dc5dc8f3374` → `d223afa68498dcc3`
- **R1** (invention,omission,meaning): From 'Now this Radney' the live text is invented (Nantucket 'mole hill', 'a leak in his own body', 'not half so afraid of the leak as ... of being afraid', 'Radney was afraid, and that fear drove everything') and reverses the source, which says he was fearless 'touching his own person'. Missing: the seamen's claim it was 'only on account of his being a part owner in her', the 'gamesomeness slily going on' at the pumps, and the clear water 'clear as any mountain spring' pouring out at the lee scupper-holes.

### 54.11  `84521c17cbfb0659` → `b3dfcdd1898d0882`
- **R1** (omission,invention): Flagged paragraph: the portraits are gone ('a tall and noble animal with a head like a Roman', the golden beard 'like the tasseled housings of your last viceroy's snorting charger', the brain, heart and soul that 'had made Steelkilt Charlemagne', Radney 'ugly as a mule; yet as hardy, as stubborn, as malicious', 'He did not love Steelkilt, and Steelkilt knew it'), replaced by an invented summary ('superior in general strength and fearlessness ... the contrast was a painful one').
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 54.12  `0bf964ad12a73c83` → `b5406bcf391b492b`
- **R1** (meaning): 'unawed' (not intimidated by the approaching mate) became 'casually', losing the point.

### 54.13  `fc5f185338184d12` → `61d18cfb18d0b9f1`
- **R1** (invention,omission): Last lines invented ('But that's his lookout, not mine. I'm not paid to guard his things. Let him look after his own planks') in place of the source's jokes: 'he's a simple old soul, — Rad, and a beauty too', 'the rest of his property is invested in looking-glasses', 'I wonder if he'd give a poor devil like me the model of his nose.' 'estate ... I can tell him' also altered.

### 54.16  `f600f1133a3dd37d` → `e6bc8d9436105f58`
- **R1** (meaning): Fact altered: the filth to be shoveled is 'consequent upon allowing a pig to run at large', not 'left by the cattle on board'. Also 'corporeally exasperated' softened to 'exhausted'.

### 54.17  `0053506ce9d395d4` → `b24af3d63dcbc978`
- **R1** (omission,invention): Flagged paragraph: the source's point that the stronger men had been divided into pump gangs, that Steelkilt 'being the most athletic seaman of them all' was captain of one and so 'should have been freed from any trivial business', and 'I mention all these particulars so that you may understand exactly how this affair stood' are missing; replaced by invented lines about 'her cattle' and 'by boys, I do not mean children'.

### 54.18  `8db9c3b974616494` → `e62c4d0c6378b560`
- **R1** (invention,omission): Second half invented ('the mate was deliberately provoking him to strike first ... might lawfully do that ... swallowed his anger'); lost the 'stacks of powder-casks heaped up in him and the slow-match silently burning along towards them' and the 'strange forbearance ... a repugnance most felt ... by really valiant men ... this nameless phantom feeling' that stole over Steelkilt (which 54.20 refers back to).

### 54.19  `4ee9329e72b8bd4c` → `34d793f7c3f1df5d`
- **R1** (omission): Flagged paragraph: the last sentence drops Radney's 'most domineering and outrageous manner unconditionally reiterating his command' and his advance on the seated Lakeman 'with an uplifted cooper's club hammer which he had snatched from a cask near by' (the hammer 54.20-22 depend on).

### 54.21  `dd3007bf4955cf10` → `a209c76cbcb066b1`
- **R1** (invention,omission): Invented plank ('quickly drawing up a heavy plank from its place'); dropped 'resolved at last no longer to retreat, bethinking him that he had now forborne as much as comported with his humor, the Lakeman paused on the hatches'.

### 54.22  `2a8d4bfec914857a` → `cbd44d810d204145`
- **R1** (invention,omission,meaning): After the curses the live text is invented (plank, whispered warning 'like the click of a cocked pistol', 'knocked him flat', 'ran to the rigging'). Lost: Steelkilt 'clenching his right hand behind him', the threat that if the hammer 'but grazed his cheek' he would murder him, 'the fool had been branded for the slaughter by the gods', the hammer touching the cheek, 'the lower jaw of the mate was stove in his head', 'spouting blood like a whale'. The weapon and injury matter later (Radney's bandaged mouth, Steelkilt's broken finger).

### 54.23  `68bc76e9aa11f41b` → `dc4079136b7bb098`
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 54.28  `6f739c39fa8bbf8a` → `e74d565a37fbde4e`
- **R1** (invention,omission): Second half invented ('winds the long Erie Canal ... straight as a pike ... almost European grandeur'); lost 'by rows of snow-white chapels, whose spires stand almost like milestones, flows one continual stream of Venetianly corrupt and often lawless life', 'There's your true Ashantee ... there howl your pagans', the churches' 'snug patronising lee', and the freebooters/halls of justice comparison. Without 'Venetianly' the dons' replies (54.29-31: friar, Inquisition, Lima for Venice) make no sense. 'Mohawk counties' also changed to 'Northern states'.
- **R2-fid** (convention): Unbalanced quotes. The source opens this paragraph with a quotation mark ('“For three hundred and sixty miles'), like every paragraph of the Lima telling from 54.5 to 54.111 except the '* * * * * *' break in 54.108. The candidate drops the opening mark but keeps its closing ". The contrary claim in the repair report is mistaken: the source never omits the opening mark. Fix: add the opening " and change nothing else.

### 54.31  `dd4d8363c0193b18` → `11e5ee786c6189b1`
- **R1** (meaning,omission): Ending altered: source 'Your cup! Thanks: here I refill; now, you pour out again' (the drink-passing business) became an invented 'Now, Senor, proceed with your story'. Also 'Limeese' changed to 'Limenos' (keep as printed) and 'billiard-tables' to 'billiard-rooms'.

### 54.32  `37017ec98384e659` → `65bc39a3ed848f79`
- **R1** (invention,omission): After Mark Antony almost everything is invented (river duels, buffalo hunts, 'the Navajos' bonfire', Five Points riots, 'carried in a blanket like a baby', 'the face of a desperado and the heart of a lion'). Lost: 'toying with his red-cheeked Cleopatra, ripening his apricot thigh', the 'brigandish guise' and 'gaily-ribboned hat', terror of villages, Ishmael's own good turn from a Canaller as 'a vagabond on his own canal', the 'stiff an arm to back a poor stranger' observation, the whale-fishery's 'most finished graduates', distrust second only to 'Sydney men', and the Grand Canal as the transition from 'a Christian corn-field' to 'the most barbaric seas'.
- **R2-fid** (convention): Unbalanced quotes. The source opens this paragraph with a quotation mark ('“Freely depicted in his own vocation'), like every paragraph of the Lima telling from 54.5 to 54.111 except the '* * * * * *' break in 54.108. The candidate drops the opening mark but keeps its closing ". The contrary claim in the repair report is mistaken: the source never omits the opening mark. Fix: add the opening " and change nothing else.

### 54.34  `f6571c2b4dd9c7d4` → `fd473caab0ea8278`
- **R1** (invention,omission,meaning): From 'a twisted turmoil ensued' the live text is invented and changes the plot: the officers 'eventually victorious', Steelkilt 'locked below', rumors in the forecastle, officers pumping with their own hands. Source: the captain dancing 'out of harm's way ... with a whale-pike', prying into the confusion, Steelkilt's men 'too much for them all', gaining the forecastle deck and entrenching behind casks as 'sea-Parisians'. 54.35-36 (pistols, barricade) depend on this.
- **R2-fid** (convention): Unbalanced quotes. The source opens this paragraph with a quotation mark ('“I left off, gentlemen'), like every paragraph of the Lima telling from 54.5 to 54.111 except the '* * * * * *' break in 54.108. The candidate drops the opening mark but keeps its closing ". The contrary claim in the repair report is mistaken: the source never omits the opening mark. Fix: add the opening " and change nothing else.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 54.39  `d65cfcdc40a11418` → `fce52dca0706bb04`
- **R1** (meaning): 'not to raise a rope-yarn against us' (not lift a finger) became 'a rope's end', which implies a flogging instrument.

### 54.40  `2c0de3056de18a33` → `8fa73edd1c18d843`
- **R1** (invention,omission): Ending invented ('forget the flogging — or we're done! Say it! We only asked not to be flogged ... We'll be peaceable'); source: 'forget it all; we are ready to turn to; treat us decently, and we're your men; but we won't be flogged.'
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 54.47  `fc270091c3279f43` → `507273742d670f44`
- **R1** (omission): Drops 'ten in number — leaving on deck some twenty or more, who thus far had remained neutral' (the count that 54.49 and 54.53 'the last of the ten' rely on).
- **R2-acc** (read-aloud,awkward): 'planted their group of hands on it' is an odd phrase that stops the reader; 'all planted their hands on it' keeps the image (several men pressing down the slide).

### 54.48  `277f82c913d0ddea` → `da3bb137ffc91e06`
- **R1** (invention): Invented simile 'pierced the dark night like a troubled conscience' for 'dismally resounded through the ship'.

### 54.49  `129ba0c55bc0f8d6` → `512a8470437d352d`
- **R1** (unmodernized): Verbatim 1851 ('when again turning the key upon them', 'constrained them to surrender at discretion', 'betake himself where he belonged', 'famishing diet', 'fetid closeness').

### 54.53  `5b8514039f274b27` → `5e200f57bf58a9e8`
- **R1** (unmodernized): Near-verbatim 1851 ('if by any devilishness of desperation possible', 'the ladder would but admit one man', 'associates', 'miscreants', 'on the part of the other two').

### 54.54  `9a53125aa0012df1` → `e69d480c19413e3b`
- **R1** (invention,meaning,omission): Second half invented and sequence changed: 'something changed in their faces', seized him 'while he was explaining the details', 'demanded release, saying they would now cooperate'. Source: they 'mixed their before secret treacheries together' 'by some subtle chemistry of villany', and 'when their leader fell into a doze' opened their souls 'in three sentences', bound and gagged the sleeper 'with cords', and 'shrieked out for the Captain at midnight'.

### 54.55  `8b35eb631019e3fe` → `48702ff9ac436886`
- **R1** (omission,invention): Drops 'side by side, were seized up into the mizzen rigging, like three quarters of meat, and there they hung till morning' and the Captain's line 'Damn ye ... the vultures would not touch ye, ye villains!'; invents 'stood over the three prisoners, with a mixture of relief and contempt'. 54.57 ('the three men in the rigging') depends on it.

### 54.56  `9468a6d6dfaa6e12` → `8113b36309289ea3`
- **R1** (meaning): 'in the vernacular' (in plain, rough sailor's language) became 'in the most violent terms'.

### 54.57  `de515b95e91e3e30` → `798838a90639e0a0`
- **R1** (convention): Ungrammatical 'like the two crucified thieves are drawn'.

### 54.60  `ae51814d2ae719bd` → `fc598599e31c66fa`
- **R1** (unmodernized): 'Say you so?' left archaic.

### 54.64  `215ce1f8be2d6f0e` → `e51eecde3be50137`
- **R1** (invention,meaning): Order of events changed: the live text has Radney 'dealt the blow', 'ignoring Steelkilt's warning', which belongs to 54.66 (after 'You are a coward!' and the second hiss), and invents 'from the Captain's relaxed hands', 'maddened with pain and revenge'. Also loses the stress of italic '_his_' (he, unlike the captain, was willing) and 'what the captain dared not attempt'.

### 54.66  `3695ebba41944385` → `6e634f1834d9e7fe`
- **R2-acc** (punctuation,reread): Final sentence parses as 'all hands were turned to, and sullenly worked by the moody seamen' until the reader reaches 'the iron pumps'; a comma after 'and' marks the participle phrase as belonging to the pumps.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 54.67  `0a2f720e6dab6610` → `36c3981517fc96d6`
- **R1** (invention,omission): From 'On the contrary' the live text is invented (quiet obedience, 'whether the Captain quietly put away his pistols', the crew's 'strange respect' for the mate, the mate growing 'sociable', Steelkilt 'softening'). Lost: the crew's resolve, 'mainly at Steelkilt's instigation', to keep the peace and 'desert her in a body' at port; the pact 'not to sing out for whales' (on which 54.85 turns); the captain still manning the mastheads and willing to lower; Radney ready 'with his bandaged mouth' to 'gag in death the vital jaw of the whale'. 'ship's run' became 'hold'.

### 54.68  `9870f7f18939b172` → `1b5abd2f989171be`
- **R1** (omission,invention,meaning): Lost: Radney 'insisted, against the express counsel of the captain, upon resuming the head of his watch at night' and 'Upon this, and one or two other circumstances, Steelkilt systematically built the plan of his revenge'; invented 'continued to push Steelkilt in small, persistent ways'; 'scene at the rigging' became 'scene at the forecastle'.

### 54.69  `589823d87f8c843d` → `cb92c30ea21c5142`
- **R1** (meaning,invention,technical): 'his next trick at the helm' (turn steering) became 'his next watch below'; 'the third day from that in which he had been betrayed' became 'after the flogging'; invented 'went to his hammock ... a piece of cord and a ball of iron — the makings of a slungshot' in place of 'braiding something very carefully in his watches below' (the reveal belongs to 54.77).
- **R2-acc** (accessibility,gloss): 'trick at the helm' (nautical: a spell or turn of duty steering) is used here and again in 54.77 without explanation; a reader may take 'trick' as a ruse, which is a real risk in a revenge plot. Brief gloss on first use.

### 54.76  `b45a97da417c85f1` → `83df1869a742ed44`
- **R1** (voice): The italic stress on '_him!_' (the mate, of all people) is lost; conveyed through wording per convention.

### 54.77  `05aac9e2cb2119d1` → `c35e1c55a0e52399`
- **R1** (omission,invention,meaning): After the iron ball the live text invents 'Steelkilt and his mates would have been at work' and then duplicates 54.78's opening sentence. Lost: 'his trick at the silent helm — nigh to the man who was apt to doze over the grave always ready dug to the seaman's hand — that fatal hour', and 'in the fore-ordaining soul of Steelkilt, the mate was already stark and stretched as a corpse, with his forehead crushed in'. 'lanyard' changed to 'slungshot'; 'monkey jacket' blurred.
- **R2-acc** (reread,read-aloud): 'Twenty-four hours later, his trick at the silent helm — ... — that fatal hour was then to come' has a dangling subject that the reader must reread to connect to 'that fatal hour'. Reordered so the sentence parses, keeping every element.
- **R3-fix** (meaning,convention): R2 accessibility reorder reads 'Twenty-four hours later would come his trick at the silent helm — ... — and that fatal hour was then to come': 'come' is doubled and the added 'and' splits the trick and 'that fatal hour' into two events, whereas the source ('his trick at the silent helm—nigh to ...—that fatal hour was then to come') sets them in apposition. Minimal fix keeps the reorder and every element.

### 54.78  `177bab08ccb2555b` → `4c493f35a20f0689`
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 54.79  `59dcc277d31eed86` → `006495f063843cfb`
- **R1** (convention): 'Teneriffe' respelled 'Tenerife' (54.85 keeps 'Teneriffe'; keep as printed) and the Spanish/Latin exclamation 'Jesu' changed to 'Jesus'.
- **SWEEP-names** (convention): Lead decision 7 sweep (spelling variants of geographic/people names to modern standard form): Teneriffe -> Tenerife
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.
- **R4-fid** (invention): Source says only 'just between daybreak and sunrise'; 'the gray gap between' adds an image Melville does not use.

### 54.85  `4726d943ffe1dfe9` → `4cc0ca8a93c609e0`
- **R1** (unmodernized,convention): Left verbatim 1851 ('phrensy'-era syntax: 'lifted his voice for the monster', 'plainly beheld', 'eyed askance', 'verily mapped out', 'Nothing loath', 'blent', 'keeling over'), and 'harpooneers'/'harpooneer' unchanged against the edition's 'harpooner'.
- **R2-fid** (convention): Unbalanced quotes. The source opens this paragraph with a quotation mark ('“No need, gentlemen'), like every paragraph of the Lima telling from 54.5 to 54.111 except the '* * * * * *' break in 54.108. The candidate drops the opening mark but keeps its closing ". The contrary claim in the repair report is mistaken: the source never omits the opening mark. Fix: add the opening " and change nothing else.
- **SWEEP-names** (convention): Lead decision 7 sweep (spelling variants of geographic/people names to modern standard form): Teneriffe -> Tenerife

### 54.86  `62645dc0a1223656` → `6c84b5d4e4ca2640`
- **R1** (meaning): Last sentence altered: source 'All four boats gave chase again; but the whale eluded them, and finally wholly disappeared' became an invented rescue attempt by 'the four remaining boats' ending 'the sailor was gone'.

### 54.87  `f0af55a609952efd` → `26d59dcb5a7ed48a`
- **R1** (voice): Period language softened: 'war-canoe of the savages' became 'of the natives' (brief rule 4).

### 54.88  `d4d633076f7314f3` → `66159a801fbf36da`
- **R1** (unmodernized): Verbatim 1851 ('to such unresting vigilance over their dangerous allies was this small band of whites necessitated', 'durst not put off', 'procure a reinforcement').

### 54.89  `155258f435c16373` → `1e944dff6c5bbffa`
- **R1** (invention,omission): Steelkilt's threat 'if the pistol so much as clicked in the lock, he would bury him in bubbles and foam' replaced by invented 'he would immediately be sunk — the canoe being much faster than the whale-boat. He repeated his demand.'
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.
- **R4-acc** (accessibility): Pronoun drift: the paragraph opens with 'they spotted', then 'He steered away' with no antecedent in the paragraph (the Lakeman is also a 'he' here), and names 'The captain' only in the third sentence. Swapping the noun and pronoun fixes the referent without changing content.

### 54.96  `918bb8f6d512282f` → `38da5db5a8786b12`
- **R1** (omission): 'had he been at all minded to work them legal retribution' flattened to 'disposed to pursue them' (loses 'legal').

### 54.97  `3dda1a8d3f3fbbeb` → `4a0b260f1fc05673`
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 54.98  `8b34cba890f99b6a` → `6ef598cd9b9b3223`
- **R1** (convention): Source's closing break '* * * *' (marking the pause before the dons' questions) dropped.

### 54.101  `d5f7e3b496883e86` → `19164f3a4a99b23b`
- **R1** (unmodernized): 'so passing wonderful' left archaic.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 54.103  `13705f9f1d31333b` → `da781382dd9970d7`
- **R1** (convention): 'the Holy Evangelists' (the Gospel book sworn on; keep as printed, and it recurs in 54.107, 54.109) changed to 'Gospels'.

### 54.106  `43161e308d2fa900` → `0febe3314d3c175b`
- **R1** (convention,voice): Spanish touch 'Auto-da-Fés' replaced by 'burnings at the stake'; keep as printed.

### 54.107  `b9104fecfc11948a` → `e785a0a5b42b43d9`
- **R1** (convention): 'Evangelists' changed to 'Gospels' (see 54.103).

### 54.109  `6588bfc043638e28` → `9867767c6f7bba8a`
- **R1** (convention): 'Evangelists' changed to 'Gospels' (see 54.103).

### 54.110  `8dfaf32ed3de00ef` → `8a5e39f26f7f861e`
- **R2-fid** (convention): Improperly nested quotes. In the source, Ishmael's oath is one speech that runs across two paragraphs: 54.110 opens with ‘Let me remove my hat and leaves the inner quote open, and 54.111 reopens it with ‘So help me Heaven and closes with ’”. Because the candidate closes the outer " at the end of every paragraph, 54.110 ends with an inner ' still open inside the closed outer ". Close the inner quote before the outer one. 54.111 already reopens with "'.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 55.0  `1f92429da5d20d18` → `4499774acd089314`
- **R1** (invention,omission): Candidate invents a closing joke ('And I have no doubt the world will agree to be set right') and drops the stated method 'by proving such pictures of the whale all wrong'; also drops 'in his own absolute body'.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 55.1  `868d3282d5eb6e72` → `82242d74a6fbc56d`
- **R1** (hedge,omission): Candidate adds 'supposedly' to 'many scientific presentations of him' (a hedge/irony not in source) and drops 'something of' in 'something of the same sort of license'.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.
- **R4-fid** (hedge,technical): Source hedge 'It may be that the primal source ... will be found' is firmed to 'may well lie'; restore a plain 'may'. Source says the dolphin 'was drawn' on temple panels, pedestals, shields, medallions, cups and coins; 'carved' narrows the medium, which does not fit painted cups or struck coins. Use a neutral verb.
- **R5-fix** (omission,hedge): Source 'ever since then has something of the same sort of license prevailed'. Candidate 'the same sort of license has held sway' drops the qualifier 'something of', turning a partial likeness into an identical license. R1 already flagged this loss; the R4 rewrite reintroduced it.

### 55.2  `2d5a08d2e8c94a7e` → `fa9f680205b18872`
- **R1** (omission,invention,meaning): Candidate drops the specific error — 'so as only to give the tail of the latter, yet that small section of him is all wrong. It looks more like the tapering tail of an anaconda, than the broad palms of the true whale's majestic flukes' — replacing it with invented 'does not satisfy expectations' / 'no resemblance to the real thing'; 'Matse Avatar' reduced to 'a creature called Matse' (wrong: the avatar is Vishnu's incarnation, not a creature name); 'known learnedly as' dropped.

### 55.3  `6265e8b581abba62` → `8aee240fb0dad6a2`
- **R1** (omission,invention): Candidate invents Hogarth's monster having 'a head like a dog' and 'spouting water upward from his forehead like a fountain in the park' plus a summary 'these things are no more than signs and symbols'. Drops the howdah, the 'distended tusked mouth' likened to the 'Traitors' Gate leading from the Thames by water into the Tower', 'the Prodromus whales of old Scotch Sibbald', 'Jonah's whale ... old Bibles ... old primers', and the whole book-binder's whale passage (vine-stalk round an anchor stock, antique vases, 'universally denominated a dolphin', old Italian publisher, 15th century, Revival of Learning, dolphins supposed a species of Leviathan).

### 55.4  `d49a0711ef546db1` → `f82c48dd4114c4a0`
- **R1** (omission,voice): Candidate drops 'Saratoga and Baden-Baden' (the spa joke) and 'jets d'eau' (fountains) from the list of spouts.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 55.5  `d2412b2cc21e9213` → `1986b04d43b6316d`
- **R1** (meaning,invention,technical,omission): The specific error is changed: source says 'the prodigious blunder is made of representing the whale with perpendicular flukes'; candidate invents 'eyes the size of a man's head ... set in the wrong part of the head'. Also drops 'living' in 'running over their living backs' and alters 'A.D. 1671' / 'Spitzbergen' as printed in the title.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 55.6  `1c318b3506b035ae` → `865861240617902f`
- **R1** (meaning,invention,omission): The specific error is lost and replaced by invention: source says 'it has an eye which ... would make the eye of that whale a bow-window some five feet long. Ah, my gallant captain, why did ye not give us Jonah looking out of that eye!'; candidate invents 'looks much like an overgrown Guinea pig. Of course, he is a great deal worse than that.' Also drops 'Physeter' from the quoted caption and 'quarto'.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 55.7  `62109a50cbad038a` → `fd4e2964157bff58`
- **R1** (voice,omission): Candidate drops 'such a hippogriff could be palmed for genuine upon any intelligent public of schoolboys' (the hippogriff image and the ironic 'intelligent public of schoolboys'), flattening to 'such a thing could be presented to students as truth'; 'heinousness of mistake' softened.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 55.8  `df37740943cb55d6` → `578a1b9a79879f43`
- **R1** (omission,meaning): Candidate drops 'the Mysticetus or Greenland whale (that is to say, the Right whale)', 'systemized', 'the Leviathan', and garbles the grammar so the Scoresby clause no longer parses ('the picture of the Right Whale — even Scoresby ... — declares has no counterpart').

### 55.9  `aa45ed53efdaeeb7` → `2afaada01516a797`
- **R1** (omission,invention): Candidate replaces the end with invention ('which is how most of these one-sided scientific portraits of the whale are produced') and drops '(such men seldom have)', 'whence he derived that picture, who can tell?', the Desmarest comparison ('got one of his authentic abortions; that is, from a Chinese drawing') and the joke about 'lively lads with the pencil ... many queer cups and saucers inform us'.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 55.10  `3b11fe3285b80015` → `2231976d56152c4a`
- **R1** (voice,omission): Candidate flattens 'Richard III. whales' to 'monstrous whales' and 'breakfasting on three or four sailor tarts, that is whaleboats full of mariners' to 'boatloads of sailors', losing the allusion and the joke.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 55.11  `261dc1fc42f38a16` → `5d7d895df8b0c50b`
- **R1** (omission,invention): Candidate invents 'in the great majority of cases, the hunter's first sight of the whale is from a considerable distance' and drops: 'afloat the vast bulk of him is out of sight, like a launched line-of-battle ship', the impossibility of hoisting him 'so as to preserve all his mighty swells and undulations', and the young sucking whale vs 'full-grown Platonian Leviathan' argument ('outlandish, eel-like, limbered, varying shape ... his precise expression the devil himself could not catch'). Also 'noble animal itself' (the ship as animal) flattened to 'noble vessel'.

### 55.12  `202a0d15429aed59` → `967e322f1546a80b`
- **R1** (omission,invention): Candidate invents 'gentle curve of his back, or that blending of his body into his flukes' and drops everything after Bentham: 'nothing of this kind could be inferred from any leviathan's articulated bones', Hunter's insect/chrysalis comparison, the head, the side-fin bones answering to the human hand 'minus only the thumb', the four bone-fingers named, the fleshy covering like an artificial covering, and Stubb's mittens joke. Also 'utilitarian' flattened to 'practical' and 'with all Jeremy's other leading personal characteristics' dropped.
- **R2-acc** (convention): 'the great Hunter' reads as a whale-hunter to a first-time reader or listener, especially in this book. Brief accurate gloss: John Hunter, the 18th-century anatomist who wrote on whale anatomy.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 55.13  `1f7455b25b43a483` → `b72966ebe6d05294`
- **R1** (invention,omission,meaning): Candidate replaces the ending with invented 'So it may go with you.' and drops the concluding advice 'Wherefore, it seems to me you had best not be too fastidious in your curiosity touching this Leviathan'; 'eternally stove and sunk by him' becomes 'stove in and sinking to the bottom' (agent 'by him' lost).
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 56.1  `f2552801beeddbc4` → `97fec6013518bb4a`
- **R2-fid** (convention): Name spelling changed from source. Source prints "Pliny, Purchas, Hackluyt, Harris"; candidate has "Hakluyt". Lead decision 3 requires the source spelling.

### 56.2  `dbd11eb746f145d5` → `8d24ae14caaa332b`
- **R1** (meaning,invention,omission): Meaning reversed: source says Beale's frontispiece, 'though no doubt calculated to excite the civil scepticism of some parlor men, is admirably correct and life-like'; candidate says it 'is rather bad'. Candidate invents a 'supplementary picture ... faithful likeness' and drops J. Ross Browne ('pretty correct in contour; but they are wretchedly engraved. That is not his fault though') and 'capping his second chapter'.
- **R2-acc** (unmodernized): 'by great odds' is dated idiom that makes a listener pause; 'by far' says the same.

### 56.3  `a5d107ca5a69fce1` → `ac708180fc6ffbeb`
- **R2-fid** (meaning,voice): Source: "drawn on too small a scale to convey a desirable impression" and "this is a sad deficiency". The candidate's "to make much impression" shifts the sense from "the impression one would want" to "any impression", and "real deficiency" drops the rueful "sad".
- **R3-fix** (hedge): Source: "it is by such pictures only, when at all well done, that you can derive...". "when at all well done" means done even passably well; candidate "when done well" raises the bar and drops the qualification "at all".

### 56.4  `9a8112c0f4422af0` → `8200a968bd3fc300`
- **R1** (meaning,invention,omission): Candidate changes the scene ('shattered fragments of the boat and the bodies of the crew'; invented 'harpooner ... ready for a dart at the beast's throat') and drops: the partially unbroken prow 'balancing upon the monster's spine', the oarsman 'half shrouded by the incensed boiling spout ... in the act of leaping, as if from a precipice', 'The action of the whole thing is wonderfully good and true', the half-emptied line-tub, the harpoon poles bobbing, the swimming crew's 'contrasting expressions of affright', the ship bearing down, and 'Serious fault might be found with the anatomical details ... I could not draw so good a one'.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 56.5  `31dedf26a5f3e0a2` → `7dc2704f194c850e`
- **R1** (omission,voice): Candidate stops after the wake and drops: 'causing the slight boat to rock in the swells like a skiff caught nigh the paddle-wheels of an ocean steamer' and the whole background contrast ('the glassy level of a sea becalmed, the drooping unstarched sails of the powerless ship, and the inert mass of a dead whale, a conquered fortress, with the flag of capture lazily hanging from the whale-pole inserted into his spout-hole'). Also 'sea candies and maccaroni' flattened to 'sea delicacies'.
- **R2-fid** (voice): Source: "the drooping unstarched sails of the powerless ship". "limp" drops Melville's laundry image (sails like unstarched linen).
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 56.6  `9c71d4ee72c6c7dd` → `6e2c1b61204b9616`
- **R1** (omission,invention): Candidate invents 'Every major historical engagement is there, with one painting after another' and drops 'pell-mell', 'where every sword seems a flash of the Northern Lights, and the successive armed kings and Emperors dash by, like a charge of crowned centaurs', and the concluding 'Not wholly unworthy of a place in that gallery, are these sea battle-pieces of Garnery'.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 56.7  `7192b10e31b6ebe8` → `82888bc27fc2ffe3`
- **R1** (omission,invention): Candidate invents 'the unvarnished facts. But it is the French who capture the drama' and drops: 'the vacant profile of the whale; which ... is about tantamount to sketching the profile of a pyramid', and the entire Scoresby satire ('stiff full length of the Greenland whale', 'miniatures of narwhales and porpoises', 'classical engravings of boat hooks, chopping knives, and grapnels', 'microscopic diligence of a Leuwenhoeck', 'ninety-six fac-similes of magnified Arctic snow crystals', 'I honor him for a veteran', the 'sworn affidavit taken before a Greenland Justice of the Peace').
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 56.8  `33ad71fd64e1e318` → `cf6505d64898b809`
- **R1** (omission,invention): Candidate invents 'This painting captures something of the peculiar tranquility of the Pacific' and drops the rest: the effect as 'the hardy fishermen under one of their few aspects of oriental repose', and the whole second Durand engraving (ship hove-to 'in the very heart of the Leviathanic life', Right Whale alongside, 'in the act of cutting-in' hove over 'as if to a quay', boat pushing off to chase, harpoons and lances levelled, three oarsmen setting the mast, craft half-erect 'like a rearing horse', smoke 'like the smoke over a village of smithies', black cloud to windward quickening the seamen).
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 57.1  `4216ba040702e967` → `06daddf89503abb0`
- **R1** (omission,voice): Candidate stops after 'incredulous world' and drops '(or kedger, as the sailors say)' and the whole payoff: 'the time of his justification has now come', 'as good whales as were ever published in Wapping', 'as unquestionable a stump as any you will find in the western clearings', and the stump/stump-speech pun with the beggar 'ruefully contemplating his own amputation'.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 57.2  `0e5df9c8ea3c0c8b` → `cba96cfff2a4badb`
- **R1** (invention,omission): Candidate invents 'The work they produce is remarkable' and drops 'specially intended for the skrimshandering business' and the final sentence ('in general, they toil with their jack-knives alone; and, with that almost omnipotent tool of the sailor, they will turn you out anything you please, in the way of a mariner's fancy'). Melville's term 'skrimshander' silently replaced.

### 57.3  `f921753b888b9bf6` → `67144bcc798250d2`
- **R1** (omission): Candidate drops 'Christendom' from 'Long exile from Christendom and civilization'.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 57.5  `686fd23bf15853ac` → `7990de72ce7215ac`
- **R2-fid** (convention,voice): Name spelling changed from source. Source prints "that fine old Dutch savage, Albert Durer"; candidate has "Albrecht Durer" (lead decision 3). Also source "full of barbaric spirit and suggestiveness" is flattened to "wild spirit"; "barbaric" carries the chapter's savage/barbarian play (Achilles the "Greek savage", Durer the "Dutch savage").

### 57.6  `59d05c892979f64b` → `14458032ef3f6d38`
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 57.7  `710b4b0e4d16fdab` → `2751979fced8ae64`
- **R2-fid** (omission,voice): Source: "brass whales hung by the tail for knockers to the road-side door" ("road-side" dropped) and "you cannot examine them closely enough to decide upon their merit" (candidate "form any real opinion" loses "their merit"). The "labeled \"Hands off!\" so you cannot" construction also reads as a run-on.

### 57.8  `37f28afcf3fe0030` → `7887de22cbec76c5`
- **R1** (voice): 'bony, ribby regions' (the landscape imagined as a skeleton, anticipating the whale-shapes) flattened to 'bony, rocky'.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 57.9  `51ead13f485af5aa` → `a3c42536ac171bd0`
- **R1** (omission): Candidate drops the closing allusion: 'like the Soloma Islands, which still remain incognita, though once high-ruffed Mendanna trod them and old Figuera chronicled them', and 'intersecting' latitude and longitude; 'require a laborious re-discovery' becomes 'you never find the same one again'.

### 57.10  `e480625398f9b75b` → `705df4043a22222a`
- **R1** (omission): Candidate truncates the last clause: 'far beyond the utmost stretch of Hydrus and the Flying Fish' becomes 'far beyond'.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 57.11  `70afd02129ea2170` → `be62f3770e7be134`
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 58.2  `3b6618eaa19a4b07` → `4bdfc986fda36266`
- **R1** (voice): 'slowly and seethingly advance their scythes' (the hissing sound that the paragraph turns on) changed to 'slowly and steadily'.
- **R2-fid** (omission,convention): Footnote marker dropped. Source ends "endless swaths of blue upon the yellow sea.*"; lead decision 2 requires every asterisk kept where the source places it.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 58.3  `8d26f11273974bea` → `56a0f25d1ee13285`
- **R2-fid** (omission,convention): Footnote marker dropped. Source paragraph begins "*That part of the sea known among whalemen as the \"Brazil Banks\""; lead decision 2 requires the asterisk kept.

### 58.4  `e48e763cc5992da6` → `bbef2c8506aa84e5`
- **R1** (omission,meaning): Candidate ends 'so, often, with whales', dropping 'with him, who for the first time beholds this species' and the whole final sentence: 'even when recognised at last, their immense magnitude renders it very hard really to believe that such bulky masses of overgrowth can possibly be instinct, in all parts, with the same sort of life that lives in a dog or a horse' (which the next paragraph's dog comparison depends on).

### 58.5  `a27e052122cfee59` → `d366263043dcd4e7`
- **R1** (invention,meaning): Candidate adds an invented closing question 'But as for the gentle whale — what has he in common with anything ashore?'; 'sagacious kindness' changed to 'loyal kindness'; 'in any generic respect ... bear comparative analogy' reduced.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 58.6  `7cb5fd772142d12c` → `47cbff5919ba2b70`
- **R1** (invention,omission): Candidate replaces the fourth 'though' clause and the conclusion with invention ('the sea has been the sworn enemy of man since man was man — yet man has always gone to sea and always will'). Source: 'however baby man may brag of his science and skill ... yet for ever and for ever, to the crack of doom, the sea will insult and murder him, and pulverize the stateliest, stiffest frigate he can make; nevertheless, by the continual repetition of these very impressions, man has lost that sense of the full awfulness of the sea which aboriginally belongs to it.' The argument's actual conclusion is lost.
- **R2-acc** (unmodernized): 'by vast odds' is dated idiom inside an already long periodic sentence; 'by far' keeps the sense and eases the read.
- **R3-fix** (hedge,voice): Source: "though but a moment's consideration will teach". "but" = only (a moment's thought suffices), part of the rhetorical build; candidate "though a moment's consideration will teach" drops it.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.
- **R4-fid** (invention): Source: 'the sea to be an everlasting terra incognita, so that Columbus sailed over numberless unknown worlds'. The consequence follows from the sea being unknown, not from its size; 'so vast that' adds a claim. Keep the plain consequence.
- **R5-fix** (hedge,voice,meaning): Source 'though but a moment's consideration will teach': 'but' (= only) was restored in R3-fix and is dropped again by the R4 rewrite ('a moment's thought will show'). Also source 'have ... befallen tens and hundreds of thousands' is sharpened to 'struck down', which implies death or injury where Melville says only that the disasters befell them; restore the neutral verb.

### 58.8  `35b561741c30839a` → `300a728ca5450111`
- **R2-acc** (unmodernized): Archaic 'not ... ever sets but ...' construction; a reader has to reread to parse it.

### 58.9  `5e9837e79b4a38a5` → `601f9bc6c442c09a`
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 58.10  `1b0cae650664d6df` → `2fb55da49e55d20b`
- **R2-acc** (unmodernized): 'all whose creatures' is an archaic relative construction; after a colon it reads as a broken sentence.

### 58.11  `59125357871ac80d` → `c69ad5ec0ed365d2`
- **R1** (unmodernized): 'Push not off from that island' left in inverted 1851 imperative form.

### 59.1  `b182c97f77bc6203` → `5fc87bc9759f1cae`
- **R2-fid** (technical,meaning): Source: "a stillness almost preternatural spread over the sea, however unattended with any stagnant calm" — the stillness was not accompanied by a stagnant calm; the candidate calls it "a calm, yet not a stagnant one", which asserts a calm. Source "sun-glade" is the bright track of sunlight on water, not a "glare".

### 59.2  `89d5429945be32c8` → `f3d21f341f91396a`
- **R1** (meaning): Source 'the negro yelled out' changed to 'the harpooner shouted' — softens period language (brief hard rule 4); the edition elsewhere keeps 'negro' (e.g. Pip, Daggoo passages).

### 59.3  `d3aa085977c6e268` → `d0e2cdae1f8ae615`
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 59.4  `9e6a242cdc85bced` → `fe7c583dfbb9eec8`
- **R2-fid** (meaning): Source: "the flitting attendance of the one still and solitary jet". The spirit-spout appears only "at wide intervals" (59.0); "constant attendance" reverses "flitting" (fleeting, intermittent).
- **R2-acc** (voice): 'however this was' and 'whichever way it might have been' double up and interrupt the 'Whether ... or whether' frame, so the sentence has to be reread. Removing the first redundant phrase keeps both alternatives and all content.
- **R3-fix** (meaning): Source: "with a quick intensity he instantly gave orders for lowering". "quick" = keen/lively; candidate "fierce intensity" adds ferocity the source does not state. Rest of paragraph (including the accessibility removal of the doubled "however this was") is faithful.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 59.5  `6a87a9e2efc29780` → `471e4e99d8e1fe30`
- **R1** (invention,omission): Last sentences altered: candidate invents 'No imaginable mouth' and drops 'no conceivable token of either sensation or instinct' and 'undulated there on the billows, an unearthly, formless, chance-like apparition of life'.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 59.6  `b5b6dc4acd9fb057` → `bc8fc6a2578c8408`
- **R2-acc** (voice): Ungrammatical 'rather have seen ... than to have seen'; stumbles when read aloud.

### 59.10  `f5cbc9389a7e0a05` → `06318e65d650e972`
- **R1** (invention,meaning,hedge,omission): Candidate invents 'other kinds of whales feed on a diet of small organisms, the sperm whale is known to prey on nothing smaller than the squid' (fact where source is inference). Source: other whales 'find their food above water, and may be seen by man in the act of feeding', the sperm whale feeds 'in unknown zones below the surface; and only by inference is it that any one can tell of what ... that food consists'. Drops the disgorged arms 'exceeding twenty and thirty feet', the belief that the squid 'clings by them to the bed of the ocean', and that the sperm whale 'is supplied with teeth in order to attack and tear it'.
- **R2-acc** (unmodernized): Absolute construction 'a glimpse of it being so very unusual, that circumstance has...' is hard to parse; same claim stated directly.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.
- **R4-acc** (accessibility): Read-aloud stumble: 'more than twenty and thirty feet long' reads as a typo. Comma phrasing keeps both figures and the escalation.

### 59.11  `8c2d93014824ff9a` → `cd026c9ff214a2ea`
- **R2-fid** (convention): Name spelling changed from source. Source: "the great Kraken of Bishop Pontoppodan"; candidate has "Pontoppidan" (lead decision 3 names "Pontoppodan" explicitly).

### 59.12  `dd68bea9a6d07295` → `35eb18fe4629a761`
- **R1** (voice): Allusion 'the Anak of the tribe' (the biblical giants) flattened to 'the giant among its tribe'.
- **R2-acc** (voice): The gloss is wedged between 'the Anak' and 'of the tribe', which garbles the phrase when read aloud. Moving the gloss after keeps it and restores the phrase.

### 60.1  `2609af1d4a4cd428` → `fe59fea2657e6c3f`
- **R1** (invention,technical,omission): Candidate invents 'tar in general tends to rot rather than preserve the line. Thus the original line was merely touched with tar.' Source says only that tar 'by no means adds to the rope's durability or strength, however much it may give it compactness and gloss', and attributes this to what 'most seamen are beginning to learn'. 'vapored with tar' blurred to 'coated'.

### 60.2  `daaafb53d8a098dd` → `8187adb5e56a9fd6`
- **R1** (voice): 'a golden-haired Circassian' flattened to 'a golden-haired beauty', losing the period allusion that pairs with 'a sort of Indian'.
- **R2-fid** (convention,technical): Source spelling "Manilla" (twice: "the Manilla rope", "Manilla is as a golden-haired Circassian") changed to "Manila". The rope is named for the place, and lead decision 3 keeps the source paragraph's spelling of proper names; ch60 also uses "Manilla" as the defining contrast with hemp.
- **SWEEP-names** (convention): Lead decision 7 sweep (spelling variants of geographic/people names to modern standard form): Manilla -> Manila

### 60.3  `7bff86c038131926` → `bf696b3ca8cf6b90`
- **R1** (technical,invention,omission): Coiling described wrongly and invented: candidate says coiled 'in such a way that any free end can be pulled out without disturbing the rest ... kept ready for instant use'. Source: 'one round, cheese-shaped mass of densely bedded "sheaves," or layers of concentric spiralizations, without any hollow but the "heart," or minute vertical tube formed at the axis'. Drops the danger of 'the least tangle or kink' taking off 'somebody's arm, leg, or entire body', the 'utmost precaution', and the harpooneers spending 'almost an entire morning ... carrying the line high aloft and then reeving it downwards through a block towards the tub'.

### 60.4  `a53142753e37f15c` → `0d6cc240e9815309`
- **R1** (meaning,invention,omission): Candidate invents 'you don't want to be standing on it too long' and loses the actual point: the boat bottom 'will bear up a considerable distributed weight, but not very much of a concentrated one'. Drops the wedding-cake image ('When the painted canvas cover is clapped on the American line-tub, the boat looks as if it were pulling off with a prodigious great wedding-cake to present to the whales').

### 60.5  `ea054cc668dd7abf` → `a049b8f870fb2beb`
- **R1** (meaning,invention,technical,omission): The second reason is wholly invented ('a universal law ... no line can be used in active service until it has been rearranged and re-coiled from one tub into another'). Source: the lower end must be free 'for common safety's sake; for were the lower end ... attached to the boat, and were the whale then to run the line out to the end almost in a single, smoking minute ... the doomed boat would infallibly be dragged down after him ... no town-crier would ever find her again.' Also drops 'eye-splice', the whale 'shifted like a mug of ale ... from the one boat to the other', and the first boat hovering 'to assist its consort'.

### 60.6  `9a19aca8a3ae7ad3` → `c83797dfd0a2a458`
- **R1** (technical,meaning,omission,invention): The line's route is cut short and falsified: candidate says the quill-sized pin 'directs it outward' and the line 'is free to fly off at the darting of the harpoon'. Source: the pin 'prevents it from slipping out'; from the chocks it 'hangs in a slight festoon over the bows, and is then passed inside the boat again; and some ten or twenty fathoms (called box-line) being coiled upon the box in the bows, it continues its way to the gunwale still a little further aft, and is then attached to the short-warp — the rope which is immediately connected with the harpoon', the short-warp going through 'sundry mystifications too tedious to detail'. Also 'leaded chocks or grooves' and 'loom' blurred.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 60.7  `841f09bc0af8c680` → `51d65442e4f7f56d`
- **R1** (invention,omission,voice): Candidate replaces the shudder with an invented outcome ('coils will go spinning through him and snatch him into the deep') and drops: 'like ringed lightnings', the 'shudder that makes the very marrow in his bones to quiver in him like a shaken jelly', and the whole turn on habit ('Gayer sallies, more merry mirth, better jokes ... over your mahogany, than ... over the half-inch white cedar of the whale-boat ... hung in hangman's nooses', and the six burghers of Calais before King Edward, 'a halter around every neck').

### 60.8  `932082f2b694a628` → `0275fc3c00f87e26`
- **R1** (invention,omission,voice): Candidate invents 'by the most careful attention to the direction of the spinning line, and by occasionally jerking the oar, can you hope to escape instant destruction'. Source: 'the boat is rocking like a cradle, and you are pitched one way and the other, without the slightest warning; and only by a certain self-adjusting buoyancy and simultaneousness of volition and action, can you escape being made a Mazeppa of, and run away with where the all-seeing sun himself could never pierce you out.'

### 60.9  `cc102bb410383a34` → `271c0a7341885d43`
- **R1** (invention,omission,meaning): Candidate invents the ending ('a swift, sudden turn of death may come upon any of us ... Only the difference is this: the whale-line makes the danger visible') and drops: 'it is only when caught in the swift, sudden turn of death, that mortals realize the silent, subtle, ever-present perils of life', and the philosopher's close ('if you be a philosopher, though seated in the whale-boat, you would not at heart feel one whit more of terror, than though seated before your evening fire with a poker, and not a harpoon, by your side'). 'All men live enveloped in whale-lines' altered to 'invisible whale-lines'.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 61.0  `a157f24154492b37` → `a8fd9877b59af98e`
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 61.1  `a271190b83e88315` → `3c3f4b2908e60468`
- **R1** (voice,meaning): Period narration 'said the savage' softened to 'said the harpooner' (brief rule 4: don't soften period language; edition keeps 'the savage' elsewhere); Queequeg's pidgin 'When you see him 'quid ... you quick see him 'parm whale' flattened; 'honing' became 'sharpening' (fine, kept).

### 61.2  `03cbf90f16bbe4f1` → `a987d281b93c906d`
- **R1** (omission,invention): Drops the comparison grounds 'than those off the Rio de la Plata, or the in-shore ground off Peru'; adds invented 'that keep you awake'; 'the spell of sleep' blurred to 'drowsiness'.

### 61.3  `ed059fedea25d1d3` → `75e0a03c2d63e2c1`
- **R1** (technical): 'the slackened royal shrouds' blurred to 'the slackened rigging'; 'as a pendulum will' tense kept consistent.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 61.4  `095f330bce8ad298` → `570131804dd7e805`
- **R1** (invention,omission): Final image 'east nodded to west, and the sun over all' deleted and replaced by an invented trade-wind sentence ('the vast trade-wind kept on blowing — but so drowsily that it seemed to breathe through a dream').
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 61.5  `ddd907cc74c9d67d` → `cae14ce04a372cd6`
- **R1** (omission,invention): Second half replaced with invented prose ('vast mild head lay dripping', 'lazy cotton bales'). Lost: 'the whale looked like a portly burgher smoking his pipe of a warm afternoon. But that pipe, poor whale, was thy last'; the enchanter's-wand waking of the ship; 'more than a score of voices ... simultaneously with the three notes from aloft, shouted forth the accustomed cry'.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 61.7  `557e515be2fc88c4` → `cface071a60ae863`
- **R1** (omission,invention,technical): Invented 'At times the whale turned to look at us with one slow, suspicious glance'; deleted 'the calm not admitting of the noiseless sails being set' and the sounding: 'the monster perpendicularly flitted his tail forty feet into the air, and then sank out of sight like a tower swallowed up'. 'we swiftly but silently paddled' garbled to 'silently sailed along, using only paddles'.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 61.8  `f3cb367f0ea36523` → `0069eeaeb4bc2038`
- **R1** (omission): Drops the close: 'All silence of cautiousness was therefore no longer of use. Paddles were dropped, and oars came loudly into play. And still puffing at his pipe, Stubb cheered on his crew to the assault.' Also 'the smoker's boat' and 'sounding' blurred.

### 61.9  `ae53ad19f6d185a9` → `2f51530b2c76a908`
- **R1** (voice,convention): Melville's image 'the mad yeast which he brewed' flattened to 'churning foam'; the footnote marker '*' (to 61.10) dropped.
- **R2-acc** (unmodernized): "that part projecting" has no clear antecedent; a first-time reader has to reread to see that the head is meant. Name the head directly; no content changed.

### 61.10  `f178c99aed4918df` → `583425d57e1fab3d`
- **R1** (invention,omission,meaning): Ending invented ('his head is completely protected from the impact of the waves'); source's point deleted: 'by obliquely elevating his head, he thereby may be said to transform himself from a bluff-bowed sluggish galliot into a sharppointed New York pilot-boat'. 'the front of his head' and footnote '*' dropped.

### 61.11  `8f17369633026d8c` → `66f17cadad81235e`
- **R1** (omission,voice): Stubb's climax replaced by a repeat of 'thunderclaps': lost 'only start her like grim death and grinning devils, and raise the buried dead perpendicular out of their graves, boys—that's all. Start her!'

### 61.12  `6ff0cd1864a59b4a` → `e28226f17716ea90`
- **SWEEP-names** (convention): Lead decision 7 sweep (spelling variants of geographic/people names to modern standard form): Gay-Header -> Gay Header

### 61.14  `f3bacc8ce644a784` → `e713e01be12164f2`
- **R1** (invention,omission,technical): Second half entirely invented ('A hit, a hit!', the whale diving, the line running foul, Tashtego cutting and re-coiling the line, 'flew ... like a shark all fins' borrowed from 61.15). Lost: 'Stern all!', the oarsmen backing water, the line 'hot and hissing along every one of their wrists', 'the magical line', Stubb's two extra turns round the loggerhead with 'a hempen blue smoke' mingling with his pipe smoke, the line passing through Stubb's bare hands (hand-cloths dropped), and the two-edged-sword simile.

### 61.15  `9bbd21188f8bca97` → `e93614756097a9ec`
- **R1** (meaning,convention): 'a staggering business truly in that rocking commotion' generalized to 'in any unsteady craft'; 'stem for stern' reversed to 'stern for bow'; footnote marker '*' (to 61.16) dropped; the gloss '(him seated by the tub)' dropped.

### 61.16  `37dd8c15785febc3` → `d2cd9aa514f638d5`
- **R1** (technical,convention): 'a wooden piggin, or bailer' blurred to 'a wooden bucket'; footnote '*' dropped; clause order made awkward ('It may here be noted that, partly to show the necessity').

### 61.17  `910acc995b19cc3c` → `567db4ec35ac404d`
- **R1** (omission,invention): Invented 'like a great helpless whale itself, the boat with its streaming oars drifted sidewise' and 'A continuous cascade of spray broke over everything'. Lost: the craft canting 'over her spasmodic gunwale into the sea' at 'the slightest motion ... even but of a little finger'; each man clinging to his seat; Tashtego 'crouching almost double, in order to bring down his centre of gravity'; 'Whole Atlantics and Pacifics seemed passed ... till at length the whale somewhat slackened his flight.'

### 61.18  `5cbcb785de6ecb81` → `468c5f0bdd2e2969`
- **R1** (invention,omission,technical): Invented 'Stubb delivered his thrusts from every position'; lost 'sterning out of the way of the whale's horrible wallow, and then ranging up for another fling'; 'darted dart after dart' changed to 'lance after lance'.

### 61.19  `146b415cc4b24820` → `82226b063db803b7`
- **R1** (omission,invention,technical): Last sentence invented ('spouting up and spiraling against the sun'). Lost: smoke 'agonizingly shot from the spiracle of the whale, and vehement puff after puff from the mouth of the excited headsman'; Stubb hauling in 'his crooked lance (by the line attached to it)', straightening it 'by a few rapid blows against the gunwale' and sending it again into the whale.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 61.20  `313b2e9288ddd1c8` → `c81891934bcc37e4`
- **R1** (omission,invention,technical,hedge): The 'flurry' is deleted and replaced by invented action ('rolling over and over, sending the slanting sun-glance across the water, spouting thick dark blood'). Lost: 'starting from his trance into that unspeakable thing called his "flurry," the monster horribly wallowed in his blood, overwrapped himself in impenetrable, mad, boiling spray', and the boat 'dropping astern' to struggle 'out from that phrensied twilight into the clear air of the day'. 'might have swallowed' hardened to 'had swallowed'.

### 61.21  `251e86b9e8aa2798` → `d3e36ed61c0aef8c`
- **R1** (technical): 'abating in his flurry' blurred to 'his fury subsiding' (the flurry is the whale's death-convulsion, the term just introduced in 61.20); exclamation 'His heart had burst!' flattened.

### 62.1  `e0c13328cf29f637` → `c890ce7560f37021`
- **R1** (invention,omission,meaning): After the first two sentences the paragraph is invented (rest/fatigue argument, 'fixed, concentrated attention', 'the line seizes him with all the strength of gravity multiplied by speed'); 'twenty or thirty feet' changed to 'fifty feet or more'. Lost: the harpooner must row 'to the uttermost' and shout 'loud and intrepid exclamations'; 'I cannot bawl very heartily and work very recklessly at one and the same time'; the cry 'Stand up, and give it to him!' reaching him with his back to the fish; the drop-oar/turn/seize-from-the-crotch sequence; the 'no wonder' series (not five in fifty darts, cursed and disrated, burst blood-vessels, 'four years with four barrels', a losing concern for owners); 'it is the harpooneer that makes the voyage'.

### 62.2  `ac473bcda83abda3` → `57476306523de0ef`
- **R1** (omission,corruption): Lost 'then at the second critical instant' (the dash now misattaches 'when the whale starts to run' to the dart); 'boathead' is a garble of 'boatheader'; 'fore and aft' blurred.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 62.3  `183dd4345f07d35e` → `b7308cb21f766a38`
- **R1** (meaning,invention,omission): Final argument replaced: source says 'long experience in various whalemen of more than one nation has convinced me that in the vast majority of failures in the fishery, it has not by any means been so much the speed of the whale as the before described exhaustion of the harpooneer that has caused them'; candidate invents 'the long experience of the entire fishery would confirm this is far more than compensated for by the greater accuracy of the throw', losing the personal conviction and the stated cause of failures.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 62.4  `79da276ddc06822d` → `068893901fd9ced1`
- **R1** (voice,meaning): 'greatest efficiency' changed to 'greatest power'; the wry antithesis 'from out of idleness, and not from out of toil' softened to 'from rest, not from exhaustion'.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 63.0  `9fdc0cf65180fc54` → `0ee604ac2518154e`
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.
- **R4-fid** (meaning): Source: 'So, in productive subjects, grow the chapters.' The analogy has chapters branching within a productive subject, as branches from a trunk and twigs from branches. 'chapters grow out of productive subjects' narrows it to one level of growth. Keep Melville's 'in'.

### 63.1  `cdc250b4684ed7ff` → `74c065035748eece`
- **R1** (invention,omission): Invented similes ('like a lean branch from a bare tree', 'like a tomahawk'); lost 'Thereby the weapon is instantly at hand to its hurler, who snatches it up as readily from its rest as a backwoodsman swings his rifle from the wall' and the naming 'respectively called the first and second irons' (changed to 'one for the first throw, the other as a backup').

### 63.2  `f70210b4795bf40c` → `0870fc188297ea97`
- **R1** (meaning,invention,omission,technical): Cause invented ('confused whale-line ... the second harpoon gets tangled up'; 'tension of the line ... prevents the boatman from clearing it'). Source: the whale's 'instantaneous, violent, convulsive running ... upon receiving the first iron' makes a second dart impossible; since the second iron is on the running line it 'must ... be anticipatingly tossed out of the boat ... else the most terrible jeopardy would involve all hands'; 'the spare coils of box line ... making this feat ... prudently practicable'; 'not always unattended with the saddest and most fatal casualties'. All lost.

### 63.3  `0004c0f94238462a` → `4edad0770837382f`
- **R1** (meaning,invention): 'until the whale is fairly captured and a corpse' changed to invented 'and a slack line obtained'.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 63.4  `ba4982af0c8a2422` → `3d031d7a6fe8ec70`
- **R1** (invention,omission,meaning): Invented 'some of these are sure to be thrown and go wild' and 'a right whale might almost say he is being attacked with darts'; harpoons are 'to bend on to the line should the first one be ineffectually darted without recovery', not 'to replace those that are lost'; lost the closing 'All these particulars are faithfully narrated here, as they will not fail to elucidate several most important, however intricate passages, in scenes hereafter to be painted.'

### 64.0  `21e854da4d82f765` → `7cc5e0cdfe6bf244`
- **R1** (invention,omission): Invented 'bitter, impatient thoughts began to fill us about the good old owner of the sea' and 'It was a funeral procession, and we were the pallbearers'. Lost: 'good evidence was hereby furnished of the enormousness of the mass we moved'; the Hang-Ho canal comparison ('four or five laborers on the foot-path will draw a bulky freighted junk at the rate of a mile an hour'); 'this grand argosy ... as if laden with pig-lead in bulk'.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 64.1  `d8bbea92f24a70bb` → `92b0440ac1b058ef`
- **R1** (meaning,invention): Source: Ahab 'went his way into the cabin, and did not come forward again until morning'; candidate invents 'went his way into the darkness, muttering to himself'.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 64.2  `cc01220533762822` → `7bd2ecfbea4022fd`
- **R1** (invention,omission,meaning): Invented 'not one could be Moby Dick' and the 'hateful, incurable itch' sentence. Lost: 'all that would not one jot advance his grand, monomaniac object'; the chains dragged and 'thrust rattling out of the port-holes' as if to anchor; 'the vast corpse itself, not the ship, is to be moored'; 'Tied by the head to the stern, and by the tail to the bows'; ship and whale 'yoked together like colossal bullocks, whereof one reclines while the other remains standing'; footnote '*'.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 64.3  `01f17b9f9ef44bd8` → `f8a23595f0892f4c`
- **R1** (invention,omission,technical): Mooring procedure invented ('passed through the natural indentation', 'does not prevent the tail from dropping completely below the surface'). Lost: 'with the hand you cannot get at it from the boat, in order to put the chain round it', and the whole technique — a small strong line 'with a wooden float at its outer end, and a weight in its middle', the float made 'to rise on the other side of the mass', the chain following and 'locked fast round the smallest part of the tail, at the point of junction with its broad flukes or lobes'. Footnote '*' dropped.

### 64.4  `d7715f76746b2ba3` → `22640e3c9009b9af`
- **R1** (invention,omission,meaning): Invented 'One small helpful task from Starbuck was readily accepted by Stubb'. Source: 'One small, helping cause of all this liveliness in Stubb, was soon made strangely manifest. Stubb was a high liver; he was somewhat intemperately fond of the whale as a flavorish thing to his palate.' — the set-up for the whole steak scene is lost. 'for the time' dropped.

### 64.5  `7694d1a979cfcc3c` → `5bdc91a23e246a92`
- **R1** (technical): Whaling term 'his small' (the tapering part of the body toward the tail, explained in 64.6) changed to 'his flank', which contradicts 64.6.

### 64.6  `3428dcf3957e6ac3` → `2f776a0269bbb5da`
- **R1** (technical,invention,meaning): Invents 'known as the whale steak ... cut from the tapering part of the body just behind the side-fin'; source: 'that particular part of the Sperm Whale designated by Stubb; comprising the tapering extremity of the body' (the small, toward the tail, not behind the side-fin).

### 64.7  `bf2e629fb2624a06` → `791e6e3bb29ecb4d`
- **R1** (invention,omission): Invented 'as you might at night see the shining of silver in a graveyard' and teeth 'gleaming in the moonlight'. Lost: '(as before you heard them)'; 'huge globular pieces of the whale of the bigness of a human head'; 'This particular feat of the shark seems all but miraculous'; how they gouge 'such symmetrical mouthfuls, remains a part of the universal problem of all things'; the carpenter 'countersinking for a screw' comparison.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 64.8  `e58506c073a2af8a` → `43ebdedf72f23865`
- **R1** (invention,omission,meaning): After the opening clauses the sentence is invented ('snap at the oars of the whaleboats ... bite off pieces of the blades'). Lost: the sharks' 'jewel-hilted mouths ... carving away under the table at the dead meat'; 'were you to turn the whole affair upside down, it would still be pretty much the same thing'; sharks as 'invariable outriders of all slave ships crossing the Atlantic'; the conclusion that they are never in 'such countless numbers, and in gayer or more jovial spirits, than around a dead sperm whale, moored by night'; and 'suspend your decision about the propriety of devil-worship, and the expediency of conciliating the devil'. 'carving-knives all gilded and tasselled' changed to 'swords and cutlasses'.
- **R4-mod** (unmodernized): Candidate still near-verbatim 1851 wording/syntax; full sentence-level modern rendering, all content kept.

### 64.9  `9def6e5878df7a32` → `78f742d9e7de7bd8`
- **R2-fid** (omission,voice): Source: "Stubb heeded not the mumblings of the banquet that was going on so nigh him". Candidate "paid no attention to the feast being held so close to him" drops "mumblings", the sound image that pairs with "the smacking of his own epicurean lips" in the same sentence and echoes "Mingling their mumblings" in 64.7.

### 64.11  `cb038a916e1c8fef` → `fbfc49b166738f71`
- **R1** (omission,invention,technical): Invented 'His left hand held a lantern, and in his right a long cooking fork with which he occasionally rapped his limping knee'. Lost: 'his knee-pans, which he did not keep well scoured like his other pans' (joke garbled to 'knees ... well oiled'); his tongs 'made of straightened iron hoops' used as a cane; 'this old Ebony floundered along'; his dead stop across Stubb's sideboard, hands folded on 'his two-legged cane', arched back bowed and head tilted 'to bring his best ear into play'.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 64.12  `07e57f6befa303ed` → `bdd897d33ccbe425`
- **R1** (omission): Stage direction 'snatching one from his sideboard' dropped.

### 64.13  `846bf4e3116210cf` → `bc00b7beda121726`
- **R1** (technical,meaning): Fleece's 'tongs' (made of iron hoops, his cane) turned into a 'cooking fork', contradicting 64.41 and 64.50; 'overheard all that was said' weakened.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 64.14  `dd3bff17f9446352` → `e7eb8ef7dcd2d50f`
- **R1** (voice): Fleece's dialect fully standardized, erasing his characterization (lead instruction: keep his voice and dialect flavor while making it followable). Restored a light, consistent dialect: dat/de/dem/dey/dere, dropped g's, 'critters', 'Massa', 'by Gor', his grammar ('you is', 'dey is'); the hardest consonant respellings (wery/woracious, gobern, cibil, eber) are regularized so the lines stay readable. Source: 'Fellow-critters: I'se ordered here to say dat you must stop dat dam noise dare ... Massa Stubb say ... by Gor!'

### 64.15  `856c43cda2a1f05c` → `275765c01309952a`
- **R2-fid** (omission): Source: "here interposed Stubb, accompanying the word with a sudden slap on the shoulder". Candidate "slapping him on the shoulder" loses "sudden" (the abruptness is the comic beat of Stubb's interruption).

### 64.16  `2300a646442290f6` → `ac07286abf74275b`
- **R1** (voice,meaning): Fleece's dialect fully standardized, erasing his characterization (lead instruction: keep his voice and dialect flavor while making it followable). Restored a light, consistent dialect: dat/de/dem/dey/dere, dropped g's, 'critters', 'Massa', 'by Gor', his grammar ('you is', 'dey is'); the hardest consonant respellings (wery/woracious, gobern, cibil, eber) are regularized so the lines stay readable. Source 'Who dat? Den preach to him yourself' — 'him' changed to 'them'; an invented speech tag 'he replied'.

### 64.18  `53ec78a9c974dd37` → `040175e538028747`
- **R1** (voice): Fleece's dialect fully standardized, erasing his characterization (lead instruction: keep his voice and dialect flavor while making it followable). Restored a light, consistent dialect: dat/de/dem/dey/dere, dropped g's, 'critters', 'Massa', 'by Gor', his grammar ('you is', 'dey is'); the hardest consonant respellings (wery/woracious, gobern, cibil, eber) are regularized so the lines stay readable. Source: 'Well, den, Belubed fellow-critters:'—

### 64.20  `69332412ed0d3855` → `5900f5583730e4b2`
- **R1** (voice,omission): Fleece's dialect fully standardized, erasing his characterization (lead instruction: keep his voice and dialect flavor while making it followable). Restored a light, consistent dialect: dat/de/dem/dey/dere, dropped g's, 'critters', 'Massa', 'by Gor', his grammar ('you is', 'dey is'); the hardest consonant respellings (wery/woracious, gobern, cibil, eber) are regularized so the lines stay readable. Also the concessive 'Do [= Though] you is all sharks ... yet I zay to you' lost its 'Though'.

### 64.21  `36c66eda0f1d0eea` → `e04173bbe18c4973`
- **R2-fid** (meaning): Source: "Talk to 'em gentlemanly." (= speak in a gentlemanly way). Candidate "Talk to them like gentlemen" reads as 'address them as if they were gentlemen', a different instruction. Minimal fix keeps the manner on the speaker.

### 64.23  `872154dfe9b7b847` → `e0f15cd1b9e4d302`
- **R1** (invention,omission,voice): From 'just try wonst to be cibil' onward the sermon is invented ('a little charity between yourselves', 'starving the rest of the neighborhood', 'can you really be filling your bellies when your neighbor's belly is empty?', 'There's room enough for everyone'). Lost: 'a helping yourselbs from dat whale. Don't be tearin' de blubber out your neighbour's mout'; 'Is not one shark dood right as toder to dat whale?'; 'none on you has de right to dat whale; dat whale belong to some one else'; the big-mouths/small-bellies argument ending 'to bit off de blubber for de small fry ob sharks, dat can't get into de scrouge'. Dialect also erased.

### 64.25  `b7ad0c521a541a15` → `cabfe1787da44fc8`
- **R1** (omission,voice): Final 'no more, for eber and eber' dropped; dialect erased.
- **R2-fid** (meaning,hedge): Open question answered. Source: "de dam willains will keep a scougin' and slappin' each oder". "scougin'" is best read as Fleece's form of "scrougin'" (scrouge = crowd, squeeze, jostle), the same word he used two paragraphs earlier (64.23 "dat can't get into de scrouge", rendered "crush"); the reciprocal "each oder" and the scene (sharks crowding the carcass) fit. The repair's "a-scourgin'" asserts whipping/lashing, a sense the text does not support. Use a plain, light-dialect jostling verb consistent with 64.23.

### 64.28  `05a3a10af44fa3db` → `1799fc4ecbc61956`
- **R1** (voice): Fleece's dialect fully standardized, erasing his characterization (lead instruction: keep his voice and dialect flavor while making it followable). Restored a light, consistent dialect: dat/de/dem/dey/dere, dropped g's, 'critters', 'Massa', 'by Gor', his grammar ('you is', 'dey is'); the hardest consonant respellings (wery/woracious, gobern, cibil, eber) are regularized so the lines stay readable. Source: 'Cussed fellow-critters! Kick up de damndest row as ever you can'.

### 64.30  `cf20d20b68bab8cf` → `af79f6cec9ec425c`
- **R1** (technical,voice): 'stooping over upon his tongs' changed to 'on his fork' (tongs error, see 64.13); dialect 'All dention' erased.

### 64.32  `57c75cd6fbcda2af` → `0be8a37f1199fb89`
- **R1** (voice): Fleece's dialect fully standardized, erasing his characterization (lead instruction: keep his voice and dialect flavor while making it followable). Restored a light, consistent dialect: dat/de/dem/dey/dere, dropped g's, 'critters', 'Massa', 'by Gor', his grammar ('you is', 'dey is'); the hardest consonant respellings (wery/woracious, gobern, cibil, eber) are regularized so the lines stay readable. Source: 'What dat do wid de 'teak'.

### 64.34  `a0b83e6eccb4371e` → `68310b5561065a8f`
- **R1** (voice): Fleece's dialect fully standardized, erasing his characterization (lead instruction: keep his voice and dialect flavor while making it followable). Restored a light, consistent dialect: dat/de/dem/dey/dere, dropped g's, 'critters', 'Massa', 'by Gor', his grammar ('you is', 'dey is'); the hardest consonant respellings (wery/woracious, gobern, cibil, eber) are regularized so the lines stay readable.

### 64.36  `362c720ec228785e` → `8f5adc293eb2df99`
- **R1** (voice): Fleece's dialect fully standardized, erasing his characterization (lead instruction: keep his voice and dialect flavor while making it followable). Restored a light, consistent dialect: dat/de/dem/dey/dere, dropped g's, 'critters', 'Massa', 'by Gor', his grammar ('you is', 'dey is'); the hardest consonant respellings (wery/woracious, gobern, cibil, eber) are regularized so the lines stay readable. Source: ''Hind de hatchway, in ferry-boat, goin' ober de Roanoke.'

### 64.38  `c3ac83ae35297683` → `cd8efbf3088fe88a`
- **R1** (voice): Fleece's dialect fully standardized, erasing his characterization (lead instruction: keep his voice and dialect flavor while making it followable). Restored a light, consistent dialect: dat/de/dem/dey/dere, dropped g's, 'critters', 'Massa', 'by Gor', his grammar ('you is', 'dey is'); the hardest consonant respellings (wery/woracious, gobern, cibil, eber) are regularized so the lines stay readable.

### 64.40  `82c19d13922f1103` → `1c1d674d72305b3e`
- **R1** (voice): Fleece's dialect fully standardized, erasing his characterization (lead instruction: keep his voice and dialect flavor while making it followable). Restored a light, consistent dialect: dat/de/dem/dey/dere, dropped g's, 'critters', 'Massa', 'by Gor', his grammar ('you is', 'dey is'); the hardest consonant respellings (wery/woracious, gobern, cibil, eber) are regularized so the lines stay readable. Source: 'Bress my soul, if I cook noder one'.

### 64.42  `2af1136038bdd8ad` → `83b7115690fe4c4f`
- **R1** (voice): Period narration 'the old negro' softened to 'the old man' (brief rule 4); dialect 'Best cooked 'teak I eber taste; joosy, berry joosy' fully standardized.

### 64.44  `bddc22ea70c69673` → `169bacf4e96855e3`
- **R1** (voice): Fleece's 'Cape-Down' normalized to 'Cape Town', losing his pronunciation that Stubb then corrects to 'Cape-Town' in 64.45.

### 64.48  `bff5b36daaeb45a5` → `205334469638d577`
- **R1** (voice): 'said the negro slowly' softened to 'said the cook' (brief rule 4); dialect ('dis old brack man', 'hisself', 'bressed angel') standardized; 'air and demeanor' fine.

### 64.50  `e3a3bbb660c3471d` → `1bf958581a0861de`
- **R1** (voice): Fleece's dialect fully standardized, erasing his characterization (lead instruction: keep his voice and dialect flavor while making it followable). Restored a light, consistent dialect: dat/de/dem/dey/dere, dropped g's, 'critters', 'Massa', 'by Gor', his grammar ('you is', 'dey is'); the hardest consonant respellings (wery/woracious, gobern, cibil, eber) are regularized so the lines stay readable.

### 64.51  `61aaa1586e994e8d` → `559e0e8b2ca4d888`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 64.52  `53f275cec2bea0c1` → `0afa33964470cabd`
- **R1** (voice): Fleece's dialect fully standardized, erasing his characterization (lead instruction: keep his voice and dialect flavor while making it followable). Restored a light, consistent dialect: dat/de/dem/dey/dere, dropped g's, 'critters', 'Massa', 'by Gor', his grammar ('you is', 'dey is'); the hardest consonant respellings (wery/woracious, gobern, cibil, eber) are regularized so the lines stay readable. Source: 'Didn't say dat t'all'.

### 64.53  `6a9a8afddf8db4a0` → `7a1c06e4870e8673`
- **R1** (invention,omission): Ending invented ('listen, now. Look here, cook — you expect to go to heaven — turn your face around — ... Answer me!'). Lost: 'Drop your tongs, cook, and hear my orders. Do ye hear? Hold your hat in one hand, and clap t'other a'top of your heart ... What! that your heart, there?—that's your gizzard! Aloft! aloft!—that's it—now you have it. Hold it there now, and pay attention.' — which 64.54 ('with both hands placed as desired') depends on.
- **R2-acc** (unmodernized): "lubber's hole" is an unexplained nautical term, and Stubb's joke (the lazy route vs. "the regular way, round by the rigging") depends on knowing it. Brief gloss added once.
- **R3-fix** (technical): R2 accessibility gloss for "lubber's hole" says "the opening in the main-top platform that timid climbers use". Every top (fore, main, mizzen) has a lubber's hole and Stubb names none, so "main-top" is an inaccurate narrowing; "timid" adds a characterization beyond the term (lubber = novice/landsman). Generalize the gloss; nothing else changed.

### 64.54  `791b8fc389203018` → `0e142cbf3980e648`
- **R1** (voice): Fleece's dialect fully standardized, erasing his characterization (lead instruction: keep his voice and dialect flavor while making it followable). Restored a light, consistent dialect: dat/de/dem/dey/dere, dropped g's, 'critters', 'Massa', 'by Gor', his grammar ('you is', 'dey is'); the hardest consonant respellings (wery/woracious, gobern, cibil, eber) are regularized so the lines stay readable. Source: 'All 'dention'.

### 64.55  `6bed1c62c5a6bb24` → `31c5e9cfe8478755`
- **R1** (invention,omission): Ending invented ('tomorrow night, you will cook another steak for me — and now get to bed'). Lost: 'to-morrow, cook, when we are cutting in the fish, be sure you stand by to get the tips of his fins; have them put in pickle. As for the ends of the flukes, have them soused, cook. There, now ye may go.'
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 64.57  `0c78f6b948e70872` → `fd07178581e21466`
- **R2-fid** (meaning): Source: "make a bow before you go". Candidate "Take a bow" is modern idiom for accepting applause, not bowing to Stubb as a dismissal courtesy. Keep "Make a bow".

### 64.58  `48b93bb619ee21bb` → `3f283e2c343db528`
- **R1** (voice): Fleece's closing joke 'more of shark dan Massa Shark hisself' flattened to 'than the sharks themselves'; 'by gor' turned into 'to God'; dialect erased; 'sage ejaculation' flattened to 'wise remark'.

### 65.0  `e2194835c43509b7` → `df13c73e87986c84`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 65.1  `09b344a12cd2499e` → `b871ce2dd703fb04`
- **R1** (omission): Last two sentences dropped: 'The old monks of Dunfermline were very fond of them. They had a great porpoise grant from the crown.'
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 65.2  `67c545658155d57b` → `1e091a86196d7bc3`
- **R1** (invention,omission): Invented 'Among the Eskimos of Greenland, whale steak is a common dish'. Lost: 'We all know how they live upon whales, and have rare old vintages of prime old train oil'; 'Zogranda, one of their most famous doctors, recommends strips of blubber for infants'; the Englishmen 'accidentally left in Greenland' who 'lived for several months on the mouldy scraps of whales'; the Dutch 'fritters' likened to 'old Amsterdam housewives' dough-nuts or oly-cooks'; 'the most self-denying stranger can hardly keep his hands off'.
- **R2-acc** (unmodernized): Resumptive "reminds me that certain Englishmen, who ... — that these men actually lived" is an 1851 construction that trips read-aloud. Restructured with a colon; all content kept.

### 65.3  `290a53ab2f4be085` → `6e8ec3c9ce6525bc`
- **R1** (invention,omission): Invented simile 'Like the butter in rich pastries'. Lost: 'like the transparent, half-jellied, white meat of a cocoanut in the third month of its growth, yet far too rich to supply a substitute for butter'; whalemen's method of 'absorbing it into some other substance'; seamen dipping 'ship-biscuit into the huge oil-pots' in 'the long try watches of the night'; 'Many a good supper have I thus made.'

### 65.4  `244cf7dd436f92c3` → `f7e25c96afa5b3b2`
- **R1** (omission,technical): Second half dropped: the 'young bucks among the epicures' who by 'continually dining upon calves' brains, by and by get to have a little brains of their own, so as to be able to tell a calf's head from their own heads', the 'saddest sights' line and the calf's head's 'Et tu Brute!' look. Also 'casket of the skull' changed to 'case of the skull', conflating it with the whale's 'case' (the spermaceti reservoir).

### 65.5  `c998db1940847b47` → `4f09705e1d9ce026`
- **R1** (invention,omission,meaning): Invented 'regarded with the same horror. And yet that same first ox was eaten with great relish'; 'take a tooth out of the cannibal's jaw' changed to 'cannibal's criticism'. Lost: 'regarded as a murderer; perhaps he was hung; and if he had been put on his trial by oxen, he certainly would have been; and he certainly deserved it if any murderer does'; 'Cannibals? who is not a cannibal?'; the Fejee who 'salted down a lean missionary in his cellar against a coming famine' being 'more tolerable ... in the day of judgment, than for thee, civilized and enlightened gourmand, who nailest geese to the ground and feastest on their bloated livers in thy paté-de-foie-gras'. 'newly murdered thing' softened to 'freshly killed creature'.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 65.6  `a0b2329f510fb0d2` → `a61e228623d1955e`
- **R1** (invention,omission,meaning): 'Society for the Suppression of Cruelty to Ganders' changed to '... to Animals'; invented 'protest against the use of whalebone corsets? With a quill from a goose'. Lost: 'formally indite his circulars' and 'It is only within the last month or two that that society passed a resolution to patronize nothing but steel pens.' 'gourmand' changed to 'gourmet'.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 66.0  `2fc0e69d2a8db4a0` → `706489faf8b2b4b7`
- **R1** (invention,omission,technical): Invented procedure ('haul back the mainyard, and let the ship drift alongside her prize through the night'). Source: 'take in all sail; lash the helm a'lee; and then send every one below to his hammock till daylight, with the reservation that ... anchor-watches shall be kept; that is, two and two for an hour, each couple, the crew in rotation shall mount the deck' — lost (and needed for 66.2's anchor-watch).

### 66.1  `b5e9fbfa58a210c3` → `ccf0e65561f05a5f`
- **R1** (invention,omission,meaning): Invented 'the usual practice may be followed without much risk'. Source: in other parts the sharks' 'wondrous voracity can be at times considerably diminished, by vigorously stirring them up with sharp whaling-spades, a procedure ... which, in some instances, only seems to tickle them into still greater activity'; plus 'it was not thus in the present case with the Pequod's sharks' and the image of 'the whole round sea was one huge cheese, and those sharks the maggots in it'. All lost.
- **R2-acc** (unmodernized): "on the Line" (sailors' term for the Equator) is not explained anywhere nearby and stops a first-time reader. Brief gloss.

### 66.2  `03d2a37591a1cdd0` → `09d6957bc791894b`
- **R1** (invention,omission,meaning): After the lanterns the paragraph is invented: the two men 'began cutting the dead whale', Queequeg as 'experienced surgeon', 'broad swaths of blubber flying', sharks biting the spade. Source: they kept up 'an incessant murdering of the sharks, by striking the keen steel deep into their skulls'; misses revealing 'the incredible ferocity of the foe' — sharks snapping at 'each other's disembowelments' and, 'like flexible bows', biting their own; the 'generic or Pantheistic vitality' in their bones; a dead shark hoisted for its skin almost taking 'poor Queequeg's hand off'. Footnote '*' dropped.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.
- **R4-fid** (voice): Source 'kept up an incessant murdering of the sharks,*' is softened to 'slaughter'. 'Murder' is the running word of chs 65-66 ('newly murdered thing', 'murdered an ox', 'murderous jaw'); keep it.

### 66.3  `d384e643ea8c9f56` → `7d874741ca0e3c15`
- **R1** (invention,omission,convention): Invented 'Sometimes a very practiced hand will keep the blade sharp enough to shave off the thin surface of the body without drawing blood'. Lost: 'In its socket, a stiff pole, from twenty to thirty feet long, is inserted for a handle.' Footnote '*' dropped.

### 66.4  `d71f33438c61a77f` → `9e187f8aa85b3854`
- **R1** (voice): Period narration 'said the savage' softened to 'said the harpooner' (brief rule 4; edition keeps 'the savage' elsewhere). Queequeg's speech otherwise kept as the candidate has it.

### 67.1  `9705064af44d59cb` → `02f762d51e6c307f`
- **R1** (omission,invention,technical,meaning): The cutting-in process is replaced by an invented one: the rope is said to go to 'a great iron ring bolted into the deck near the bow' (source: 'conducted to the windlass'), the cut is made 'on both sides', a strip 'five feet wide and thirty feet long' hangs 'like a huge pendulum' (not in source). Omitted: 'this vast bunch of grapes', the lower block swung over the whale with 'the great blubber hook, weighing some one hundred pounds', Starbuck and Stubb 'suspended in stages' cutting the hook-hole 'just above the nearest of the two side-fins', the crew's 'wild chorus' at the windlass, bolts starting 'like the nail-heads of an old house in frosty weather', 'nods her frighted mast-heads', the 'helping heave from the billows', the 'swift, startling snap', the orange-rind spiral stripping, the 'scarf', the mass that 'may box his ears and pitch him headlong overboard'. Rendered in full from the source.
- **R2-acc** (voice): Opening sentence restarts its subject ('the enormous cutting tackles — ... — this vast bunch of grapes was hoisted'), so a reader or listener loses the verb and must reread. Also 'suspended in stages over the side' reads as 'gradually'; a brief gloss marks stages as platforms (the term recurs at 72.7).

### 67.2  `205290822e6f7abb` → `e357d8874baef9e4`
- **R1** (invention,omission,technical): Invented a 'Bible leaves' cut with blanket-pieces 'attached by a thin strip that allowed them to fold like pages' (imported from ch 96 footnote) and moved the orange-spiral image here. Omitted: the swordsman 'warning all hands to stand off' and severing the mass 'in twain' with 'sidelong, desperate, lunging slicings'; 'the long upper strip, called a blanket-piece, swings clear'; the heavers resuming their song; the strip lowered 'through the main hatchway ... into an unfurnished parlor called the blubber-room'; coiled 'as if it were a great live mass of plaited serpents'; the closing catalogue ending 'all hands swearing occasionally, by way of assuaging the general friction'.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 68.0  `d19c5e9c54f2fe1a` → `1b64b0b814365417`
- **R1** (meaning): 'that not unvexed subject' (i.e. a much-disputed one) was rendered 'that not-easy subject', which loses the sense of controversy that the next sentence builds on.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 68.1  `9e827fa8186c4600` → `5a12861ed4132a92`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 68.2  `9bc589ed8d469d5a` → `ff5a7097368313af`
- **R1** (omission,invention,meaning): Second half invented: 'thinnest of tissue paper', 'almost as transparent as glass', 'I show to my friends', 'a piece about a foot square', 'mistaken it for the finest Italian tissue paper'. Reverses the dry/fresh qualities partially and omits: 'shreds of isinglass', 'as flexible and soft as satin', contracting and thickening when dried, 'I use for marks in my whale-books', the fancied 'magnifying influence', 'read about whales through their own spectacles', and the whole argument that it is 'the skin of the skin' since it would be 'ridiculous to say, that the proper skin of the tremendous whale is thinner ... than the skin of a new-born child'. 'what can that be but the skin?' was flattened into a definition. Isinglass glossed once for the chapter.

### 68.3  `3b62fb7cdca0ad53` → `b593aa58fe690048`
- **R1** (omission,voice): Drops the payoff: 'the enormousness of that animated mass, a mere part of whose mere integument yields such a lake of liquid as that' and the whole closing calculation 'Reckoning ten barrels to the ton, you have ten tons for the net weight of only three quarters of the stuff of the whale's skin.'

### 68.4  `18817b480dad04a5` → `23b270028648c40f`
- **R1** (invention,omission,meaning,hedge): From the third sentence on the paragraph is invented: 'Nor is this strange', lines seen 'on the back of your hand through a fine tissue', 'an old oak tree's bark', marks deepening 'in elderly whales ... as the wrinkles in a human face'. Omitted: the marks seem 'seen through it, as if they were engraved upon the body itself'; 'Nor is this all'; the hieroglyphics and 'mysterious cyphers on the walls of pyramids'; the plate of 'old Indian characters chiselled on the famous hieroglyphic palisades on the banks of the Upper Mississippi'; 'the mystic-marked whale remains undecipherable'; the 'rude scratches' on back and flanks; Agassiz's New England rocks scraped by icebergs; and the hedged guess ('It also seems to me ... probably') that the scratches come from other whales, most remarked 'in the large, full-grown bulls'.
- **R2-acc** (voice): 'From my retentive memory of the hieroglyphics on one Sperm Whale in particular, I was much struck by a plate...' does not parse: the memory is not where he was struck. Recast as a participle so the link (memory made the plate striking) is clear.

### 68.5  `a2acb707694041ba` → `dd1ea94dd82547f6`
- **R1** (omission,invention): Truncated after the Greenland whale question, and that question was rewritten with an invented image ('if he did not carry his own furnace with him?') instead of 'if unsupplied with his cosy surtout'. 'skirting his extremity' became 'trailing below his knees' (invented). Omitted: the brisk cold-blooded, 'lungless fish, whose very bellies are refrigerators' warming themselves 'under the lee of an iceberg, as a traveller in winter would bask before an inn fire'; 'like man, the whale has lungs and warm blood. Freeze his blood, and he dies'; the wonder ('except after explanation') that he lives 'immersed to his lips for life in those Arctic waters'; seamen 'perpendicularly frozen into the hearts of fields of ice, as a fly is found glued in amber'; and the experiment that 'the blood of a Polar whale is warmer than that of a Borneo negro in summer' (period wording kept per brief).
- **R2-acc** (unmodernized): 'How wonderful it is, then — except after explanation — that...' is a stiff 1851 aside that stops the reader; plain modern form keeps the same hedge.

### 68.6  `a5cad485774168ab` → `877d499ecfc710ad`
- **R1** (omission,voice): The chapter's closing lesson is cut: 'Like the great dome of St. Peter's, and like the great whale, retain, O man! in all seasons a temperature of thine own' is missing (and 68.7's 'domed like St. Peter's' then has no antecedent). The apostrophe 'Oh, man!' is also dropped.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 68.7  `57b6005440982932` → `a331da7f5d638a49`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 69.1  `06164b3d6c0ba582` → `1085d36d1c53e6e3`
- **R1** (omission,invention,meaning): 'the murderous din' became an invented 'monstrous funeral procession' (anticipating 69.2); 'every rod' became 'every step' and 'cubic roods of fowls' became 'cubic yards of birds' (measures must stay as printed). Omitted: 'screaming' fowls, and the last two sentences: 'For hours and hours from the almost stationary ship that hideous sight is seen. Beneath the unclouded and mild azure sky, upon the fair face of the pleasant sea, wafted by the joyous breezes, that great mass of death floats on and on, till lost in infinite perspectives.'

### 69.2  `67c3fdda47340a8e` → `9eae594e9a0eece1`
- **R2-fid** (voice,hedge): "What a most sorrowful and mocking funeral!" is ungrammatical English and drops the source's doubled "most doleful and most mocking". "if peradventure he had needed it" (if by chance) lost "by chance"; "they most piously do pounce" became "most devoutly descend", losing the predatory "pounce" that the vulture image needs; the apostrophe "Oh, horrible vultureism of earth!" lost "Oh".
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 69.3  `748bd61245e256c6` → `043fe2c0cd702a11`
- **R1** (invention,omission,voice): Invented: 'the whale's ghost becomes a terrifying reef', 'marked with an "S" for shoal', 'a new hazard is added to the navigator's dangers'. Omitted: the corpse 'with trembling fingers is set down in the log — shoals, rocks, and breakers hereabouts: beware!'; ships shunning the place for years, 'leaping over it as silly sheep leap over a vacuum, because their leader originally leaped there when a stick was held'; and the satirical close 'There's your law of precedents; there's your utility of traditions; ... old beliefs never bottomed on the earth, and now not even hovering in the air! There's orthodoxy!' The source italic log entry is conveyed with quotation marks.

### 69.4  `0c092c86ca345335` → `e12b41f38338d298`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 69.5  `5e988fcb1d05c94f` → `a6c963e48db3649d`
- **R2-acc** (voice): 'the Cock-Lane one' is an allusion most readers will not know and nothing nearby explains it, so the Doctor Johnson joke is lost. Brief accurate gloss: the Cock Lane ghost was a famous London ghost hoax of 1762 that Johnson helped investigate.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 70.0  `02558e5450d0ec4f` → `28471262b37baa38`
- **R2-fid** (convention): Source: "previous to completely stripping the body of the leviathan". The brief keeps "Leviathan/leviathan" as used; the candidate substitutes "whale".
- **R2-acc** (voice): Dangling modifier: 'before completely stripping the body of the leviathan, he was beheaded' grammatically makes the whale do the stripping. Reword so the passive is consistent.

### 70.1  `b6ca7811802a7e10` → `27e23f9722ab9614`
- **R1** (omission,invention,technical): 'feel after the joints and sever the head from the body' is invented and technically wrong: the source says he must cut 'without so much as getting one single peep into the ever-contracting gash', 'steer clear of all adjacent, interdicted parts, and exactly divide the spine at a critical point hard by its insertion into the skull'. 'oftentimes tumultuous and bursting sea' reduced. Omitted: the closing 'Do you not marvel, then, at Stubb's boast, that he demanded but ten minutes to behead a sperm whale?'

### 70.2  `04eaeb21f3be41e1` → `a13c8a4f79dc22f2`
- **R1** (invention,omission,voice): The comic image 'as vain a thing as to attempt weighing a Dutch barn in jewellers' scales' was replaced with invented 'court the risk of pulling the masts from their sockets'; 'even by the immense tackles of a whaler' blurred to 'the strongest tackle'.

### 70.3  `578ecd7b8d876e41` → `7b9801964f48300d`
- **R1** (invention,omission,technical): Invented: 'the masts whipped forward', 'the ship herself was bowing in homage to the massive thing'. Omitted: the lean is 'by reason of the enormous downward drag from the lower mast-head', 'every yard-arm on that side projecting like a crane over the waves', and the key allusion 'that blood-dripping head hung to the Pequod's waist like the giant Holofernes's from the girdle of Judith'.

### 70.4  `cf060acceec9b7bb` → `d589fd3bd9426757`
- **R1** (meaning): Image altered: 'a universal yellow lotus ... unfolding its noiseless measureless leaves' became 'golden lotus ... petals'. Restored the source's color and 'leaves'.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 70.5  `6cfc9b76a4b2221c` → `67b1d21e82d83894`
- **R1** (meaning,invention,omission): Ahab's pose changed: source 'placed its other end crutch-wise under one arm, and so stood leaning over with eyes attentively fixed on this head' became 'he placed his foot upon it' plus invented 'gaze almost directly into the whale's great divided head'. The crutch posture matters (Ahab's leg).
- **SWEEP-terms** (convention): Terminology consistency: edition spells 'quarter-deck' (as source and ch36 title)

### 70.6  `c5da3aee1eb9656a` → `6d0cb8f73e7e2d45`
- **R1** (invention,omission,voice): The end of Ahab's speech is invented ('The true, the right worshippers of God ... they have faced you, head, and gone down, giving no outcry. But you, vast, dark head — you are a Sphinx that will tell nothing'). Omitted: the lovers 'true to each other, when heaven seemed false to them'; the murdered mate 'tossed by pirates from the midnight deck', falling 'for hours ... into the deeper midnight of the insatiate maw', his murderers sailing on unharmed 'while swift lightnings shivered the neighboring ship that would have borne a righteous husband to outstretched, longing arms'; and the climax 'O head! thou hast seen enough to split the planets and make an infidel of Abraham, and not one syllable is thine!' Thou-forms modernized per edition practice; cadence kept.
- **R2-fid** (convention,meaning): Name changed from the source paragraph's printed spelling. Source 70.6: "it seemed the Sphynx's in the desert" (the chapter title is also "The Sphynx"). The candidate normalizes to "Sphinx's". Per the lead decision on names as printed and the batch instruction (follow each source paragraph as printed), 70.6 must read "Sphynx's". Rest of Ahab's speech verified complete (bell/diver, locked lovers, murdered mate, lightning-shivered ship, infidel of Abraham).

### 70.10  `35bc9ff570754a89` → `f11a2bd8967ca8cb`
- **R1** (invention,unmodernized): 'to my breezelessness bring his breeze' became 'bring his breeze to my becalmed soul' ('soul' added, the play on breezelessness lost); 'Would that' is archaic; 'lives on matter' changed to 'in matter'; 'analogies' to 'parallels'.
- **R2-acc** (unmodernized): 'Not the smallest atom stirs or lives on matter but has its cunning duplicate in mind' uses the archaic 'but has' (= that does not have) construction; a reader must decode it. Keep Ahab's cadence, modernize the grammar.

### 71.0  `1c736e8c61cbb55d` → `f7d48b0efbf75b8d`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 71.1  `e18928af0ddb600f` → `fff7912f1f494056`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.
- **R4-acc** (voice): Read-aloud echo: 71.0 ends 'and before long the Pequod began to rock', and 71.1 opens 'Before long, the spyglass...'. Vary the second opener (source 'By and by').

### 71.2  `46242cec428eabb4` → `b5d2543168e1b5dc`
- **R1** (unmodernized,omission): 'Here be it said' left archaic; 'even at considerable distances and with no small facility' reduced to 'at a distance'; 'upon the ocean' dropped.

### 71.3  `07a555201db336ed` → `564c3c2c1133b4cb`
- **R1** (unmodernized): Near-verbatim 1851 syntax and diction: 'it soon drew nigh', 'in token of that proceeding being entirely unnecessary', 'though himself and boat's crew remained untainted', 'conscientiously adhering to the timid quarantine of the land, he peremptorily refused'. Modernized with all content kept (half a rifle-shot, incorruptible sea and air, timid quarantine of the land).

### 71.4  `7967b92a37cd4400` → `995f22a34e32fde4`
- **R1** (unmodernized): Near-verbatim: 'this did by no means prevent all communications', 'contrived to keep parallel', 'would be soon skilfully brought to her proper bearings again', 'Subject to this, and other like interruptions', 'but at intervals not without still another interruption'. Modernized; all content kept.

### 71.5  `f6bf3a910ba4e04e` → `89b0b883585114b2`
- **R1** (omission,meaning): Omitted: 'the overlapping sleeves of which were rolled up on his wrists' and 'A deep, settled, fanatic delirium was in his eyes' (the key characterization of Gabriel). 'of a faded walnut tinge' was changed to 'faded yellow' (wrong color; his hair is the yellow). 'cabalistically-cut' blurred to 'mystical-looking'.

### 71.6  `5f7cf0f588377cb3` → `dde1cec50f3b5e85`
- **R1** (unmodernized): Near-verbatim: 'So soon as this figure had been first descried', 'Stubb here alluded to', 'some time previous', 'a wonderful ascendency'. Modernized; Stubb's slang 'long-togged scaramouch' and the nautical 'spoke the Town-Ho' kept.

### 71.7  `765656f51274f514` → `6b251014f88632eb`
- **R1** (unmodernized): Left almost verbatim 1851: 'would fain have been rid of him', 'but apprised that that individual's intention was to land him', 'straightway upon the ship's getting out of sight of land', 'broke out in a freshet', 'forthwith', 'it came to pass', 'carried a higher hand than ever', 'nor should it be stayed but according to his good pleasure'. Modernized sentence by sentence; every claim, name (Neskyeuna Shakers, seventh vial, laudanum, vicar-general of all Oceanica) and the closing reflection on fanatics kept.

### 71.8  `f98afeab79f3bfaf` → `f586e91ea37c7a8a`
- **R1** (unmodernized): 'I fear not your epidemic' keeps the archaic inverted negative; the edition modernizes Ahab's grammar.

### 71.14  `eb0d106f723e5991` → `2bb3a03b25fc3bd2`
- **R1** (unmodernized): Archaic pronoun left in dialogue ('I tell thee again'); narration near-verbatim ('by one of those occasional caprices of the seas were tumbling, not heaving it', 'apprehensiveness'). Modernized; the ambiguous 'it' (the boat) kept.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 71.15  `af249d901d3c5663` → `239f443cd6c4bc54`
- **R1** (omission): Omitted the interruptions from 'the crazy sea that seemed leagued with him'. The candidate also resolved 'his name' as 'the whale's name'; the source leaves it as 'his name', kept as printed.

### 71.16  `6918dfc7ecfcabe5` → `2a5ca78f11d3d29f`
- **R1** (unmodernized): Near-verbatim 1851: 'reliably apprised', 'Greedily sucking in this intelligence', 'essaying to get a fair chance', 'lo!', 'the mate for ever sank'. Modernized; all events, the Shaker-God claim, Macey, five men, the main-royal masthead, the fifty yards and 'not a chip of the boat was harmed' kept.

### 71.17  `0d26c9cf6dd4d753` → `b2ebaa43661be179`
- **R2-acc** (voice): 'the headsman' reads as 'executioner' to a first-time reader and is not explained nearby; a brief gloss (the officer who commands the whale-boat) makes the accident legible.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.
- **R4-acc** (voice): Clause '— and the man stone dead.' is verbless and reads as a fragment aloud; supply the verb.

### 71.18  `b73b8f1f80a2fa01` → `47811bbe51d00e88`
- **R1** (unmodernized): 'plainly descried', 'called off the terror-stricken crew from the further hunting', 'fore-announced' left archaic. Modernized with the argument about general prophecy hitting 'one of many marks in the wide margin allowed' kept.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.
- **R4-acc** (voice): Broken parallel 'believed he had predicted ... rather than merely making a general prophecy ... and so happened to hit' forces a reread; align the tenses.

### 71.19  `7975e99c3c6650fb` → `e6b52cab5b4ed45d`
- **R1** (meaning,omission): Reversed who asks whom: source 'Ahab put such questions to him, that the stranger captain could not forbear inquiring whether he intended to hunt the White Whale' became 'Ahab asked him whether he intended to hunt the White Whale', so Ahab's 'Aye' answers his own question. Restored Mayhew as the questioner.

### 71.21  `53686cb847c29eb8` → `e736a22dce84f9ce`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 71.23  `ee954a8e3274a50b` → `85a4a5dc1df083c7`
- **R2-fid** (omission,meaning): Source: "hand it to the boat, without its coming any closer to the ship." The candidate's "without getting any closer" drops "to the ship" and makes it sound as if Starbuck is the one not approaching; the point is the quarantine distance between boat/letter and ship. Rendered literally, ambiguity of "its" preserved.

### 71.27  `0ba27710fd0476d2` → `258ef1ab3b828362`
- **R1** (invention,meaning,omission): The letter episode is rewritten: invented 'caught by a wave and shot back upon the Pequod's deck', Gabriel seizing 'the end of the pole', and an invented speech 'Keep it yourself. God has ordained it! Away!'. Source: the boat drifts 'towards the ship's stern', the letter comes level 'with Gabriel's eager hand', he 'seized the boat-knife, and impaling the letter on it, sent it thus loaded back into the ship. It fell at Ahab's feet'; then he shrieks to 'give way with their oars' and 'the mutinous boat rapidly shot away'.

### 71.28  `f08b6a34b6ad4037` → `4dc9199cf3115a2b`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 72.0  `c8ce22ccc24bb687` → `1db3f3b6b0566598`
- **R1** (invention,omission,meaning): After the first sentences the paragraph is invented and anticipates 72.1-72.2 ('It is a complicated affair', 'then the sharks!', monkey-ropes 'contrived', 'for better or worse, Queequeg and I were joined'). Omitted: 'It is much the same with him who endeavors the description of the scene. We must now retrace our way a little'; the blubber-hook inserted into the hole cut by the mates' spades; 'how did so clumsy and weighty a mass as that same hook get fixed in that hole?'; Queequeg's duty as harpooneer to descend on the back, often remaining till 'the whole flensing or stripping operation is concluded'; the whale 'almost entirely submerged'; 'some ten feet below the level of the deck ... half on the whale and half in the water, as the vast mass revolves like a tread-mill'; Queequeg 'in the Highland costume — a shirt and socks'.

### 72.1  `69660e3ae4ae939d` → `cc37460efd3483db`
- **R1** (meaning,convention): 'the savage's bowsman' was softened to 'the harpooner's' (brief: do not soften period language); 'from the ship's steep side' became 'from the ship's deck' (wrong position); 'a strong strip of canvas belted round his waist' became 'a strong belt around his body', which blurs the canvas belt that 72.2 depends on; 'organ-boys ... dancing-ape' altered.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 72.2  `014aa9f8a07caec7` → `8d0134d74b4077a6`
- **R1** (omission,voice): Omitted the Siamese-twin tie: 'So, then, an elongated Siamese ligature united us. Queequeg was my own inseparable twin brother; nor could I any way get rid of the dangerous liabilities which the hempen bond entailed.' (72.3 and 72.8 build on 'Siamese connexion' and 'twin-brother').
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 72.3  `51d0e230f7e90fdf` → `8b899697fc8b6718`
- **R1** (invention,omission,meaning): Core argument replaced by an invented generalization ('the extreme illustration of the general truth — that for the mass of men, the choice of their daily acts is not at all with themselves'). Omitted: 'here was a sort of interregnum in Providence; for its even-handed equity never could have so gross an injustice'; jerking him 'from between the whale and ship'; 'the precise situation of every mortal that breathes; only ... he ... has this Siamese connexion with a plurality of other mortals'; 'If your banker breaks, you snap; if your apothecary by mistake sends you poison in your pills, you die'; the objection about 'exceeding caution'; nearly sliding overboard; 'I only had the management of one end of it'; and the footnote marker '*'.
- **R2-fid** (voice,convention): Source: "if your apothecary by mistake sends you poison in your pills, you die." The candidate turns "apothecary" into "druggist", while 72.11 and 72.13 keep Stubb's "Is the steward an apothecary, sir?" and "none of your apothecary's medicine". The chapter's echo (the poisoning apothecary, then the steward-as-apothecary drugging a harpooner) is lost. Restore the source word.

### 72.4  `405e85bde5d24d08` → `4b2c3dc00a4d8a0e`
- **R1** (convention,omission): Footnote paragraph lost its leading '*' marker (the edition keeps '*' on footnote paragraphs, e.g. chs 32, 96, and 72.3 now ends with '*'); 'his monkey-rope holder' shortened to 'his holder'.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 72.5  `8598456e1462c038` → `8b176908b666837a`
- **R1** (omission,invention): 'hungrily snapping at the strips of blubber' is invented. Omitted: the 'jamming jeopardy', that the sharks were 'freshly and more keenly allured by the before pent blood which began to flow from the carcass', and the simile 'swarmed round it like bees in a beehive'.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.
- **R4-acc** (voice): Anacoluthon: 'the sharks, now drawn afresh ... from the carcass — those rabid creatures swarmed' leaves 'the sharks' without a verb; the listener must reread. Keep 'rabid' and let 'the sharks' take the verb.

### 72.6  `0ef8747f736b6da0` → `f49a40956dee4119`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 72.7  `05e82e64a7ad5ddb` → `219abb4d340c35c5`
- **R1** (omission,invention,meaning): Invented 'his harpooner friends on deck' and 'you had to be careful not to strike Queequeg himself'. Omitted: the 'peculiarly ferocious shark'; Tashtego and Daggoo 'suspended over the side in one of the stages' flourishing 'a couple of keen whale-spades' and slaughtering sharks; the irony 'very disinterested and benevolent of them. They meant Queequeg's best happiness, I admit'; the 'blood-muddled water'; spades coming 'nearer amputating a leg than a tail'; and Queequeg praying 'to his Yojo' and giving 'up his life into the hands of his gods'.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 72.8  `77af2384f5922391` → `3f8315d3400b1f79`
- **R1** (invention,voice): 'and might well feel nervous about it' is invented and replaces 'in a sad pickle and peril, poor lad'; the closing address 'poor lad' dropped.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 72.9  `46dc2e69ed9be165` → `393b06d152980de5`
- **R1** (omission,voice): The comic build-up is cut: 'hands him, ye gods! hands him a cup of tepid ginger and water!' reduced to 'Ginger and water!' ('tepid' and 'cup' lost); 'over the side' became 'on the side'.

### 72.10  `6f372d2d9658559c` → `a618c2a1244a22cf`
- **R1** (omission,meaning,voice): Stubb's tirade is cut and changed: 'where lies the virtue of ginger?' became 'where you got this ginger?'; omitted 'is ginger the sort of fuel you use, Dough-boy, to kindle a fire in this shivering cannibal? Ginger! — what the devil is ginger? Sea-coal? firewood? — lucifer matches? — tinder? — gunpowder? — what the devil is ginger, I say, that you offer this cup to our poor Queequeg here.'

### 72.11  `e6e59ea4f3decb14` → `1071ca7764c92a28`
- **R1** (omission,invention,voice): Invented 'after that dangerous work!'. Omitted: 'that calomel and jalap' (Stubb calling ginger a purge), 'this instant off the whale', 'Is the steward an apothecary, sir? and may I ask whether this is the sort of bitters by which he blows back the life into a half-drowned man?' — the question Starbuck's 'I trust not' (72.12) answers.

### 72.15  `1a9b02ee16c24ea1` → `bf0a8daea9373bec`
- **R1** (voice): Stubb's pun 'you gingerly rascal' was changed to 'gingery rascal', losing the word-play.

### 72.17  `f94197e0e229335b` → `7bb132710e3d45a6`
- **R2-fid** (unmodernized): "What were you about saying, sir?" is left as 1851 idiom (source: "What were you about saying, sir?"). The repair editor flagged but kept it; it reads as an error to a modern reader. Modernize.

### 72.19  `ca6b39295277792e` → `3673891c5f6f139d`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 73.1  `923a31d16fbbb076` → `3d5c185e12764e38`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 73.2  `523858b4cb2ec754` → `c3f4f2d6165f4e91`
- **R1** (unmodernized): Near-verbatim 1851: 'gave unusual tokens of the vicinity of Right Whales', 'that but few supposed to be at this particular time lurking anywhere near', 'if opportunity offered'. Modernized; brit, Crozetts and the three 'though' clauses kept.
- **SWEEP-names** (convention): Lead decision 7 sweep (spelling variants of geographic/people names to modern standard form): Crozetts -> Crozets

### 73.3  `9c75f1c65c2ebebf` → `39a13a08208b613a`
- **R1** (unmodernized): Near-verbatim 1851: 'Nor was this long wanting', 'meant it malice', 'brought with a deadly dash', 'paid out abundance of rope', 'a few feet advance', 'the fagged whale abated his speed'. Modernized; all steps of the manoeuvre (line scraping under the keel, drops 'like bits of broken glass', the circuit round the stern) kept.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 73.4  `52c08892d2d0fdd6` → `45996a23c7830c15`
- **R1** (omission,invention): The biblical simile is deleted and replaced by an invented 'thickening the sea around them'. Omitted: sharks 'thirstily drinking at every new gash, as the eager Israelites did at the new bursting fountains that poured from the smitten rock'.

### 73.5  `7523ba878f74ce1d` → `16c6e10d148f0e89`
- **R1** (voice): 'with a frightful roll and vomit' was softened to 'roll and heave'.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 73.6  `11eabbfb20d42028` → `9e305f95e18579b6`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 73.7  `8b930c813374a890` → `8cbd883576a702e4`
- **R2-fid** (voice,convention): Source: "this lump of foul lard" (Stubb's contemptuous word for the Right Whale) and "so ignoble a leviathan". The candidate gives "foul blubber" and "so ignoble a whale", flattening the insult and dropping the edition's kept term "leviathan".
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 73.8  `b75b3ba987b36ff9` → `2dfb152c6975050d`
- **R1** (omission): 'the ship which but once has' (even once) dropped; the charm depends on a single occasion.

### 73.10  `0fcbd848d36de122` → `4d3a618a452245c2`
- **R2-acc** (corruption): 'that tusk of his is a sort of carved into a snake's head' reads as a garble ('a sort of' + participle). 'is sort of carved' keeps Flask's colloquial hedge and parses.

### 73.11  `d1a3c2cf2cb39909` → `38ea16ab0b1d1737`
- **R2-acc** (unmodernized): 'Aye, will I!' is inverted archaic word order; 'Aye, I will!' keeps Stubb's flavor.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 73.19  `8bfccbd51609b3a7` → `be8fe5b38d890f65`
- **R1** (invention,omission,meaning): Stubb's devil story is replaced by an invented one (warming hands at the admiral's fire, staying for dinner, 'a long chat'). Omitted: 'The devil, switching his hoofs, up and says, "I want John." "What for?" ... "I want to use him." "Take him," says the governor', the devil giving John 'the Asiatic cholera', 'I'll eat this whale in one mouthful', and Stubb's orders 'look sharp — ain't you all ready there? Well, then, pull ahead, and let's get the whale alongside.' 'old governor' was changed to 'old admiral'. (Nested single quotes are kept for speech within speech.)

### 73.23  `8dc57227b1321f52` → `bb94d402aa6befe7`
- **R1** (omission): Closing 'Tell me that, Mr. Flask?' lost 'Mr. Flask' (Stubb's mock-formality); 'latch-key' became 'master key'.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 73.25  `0a82b5d06d4e708d` → `dd97031864c245c3`
- **R1** (omission,voice): Omitted the capping joke: 'Nor all the coopers in creation couldn't show hoops enough to make oughts enough.'

### 73.26  `f101446786698526` → `99b3a47378f10e36`
- **R2-fid** (hedge): Source: "I thought you a little boasted just now" — Flask's softener "a little" is dropped ("I thought you just boasted").

### 73.31  `1447b47399e10f29` → `0dcaff76bb0a1e9e`
- **R2-acc** (unmodernized,voice): 'daresn't' is archaic and 'double-darbies' (slang for handcuffs) stops understanding with no explanation nearby. Modernize the verb; gloss the slang inside the speech without losing it.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.
- **R4-fid** (omission): Source 'all the people the devil kidnapped, he'd roast for him' — 'for him' dropped, losing that the governor roasts them on the devil's behalf (the point of the bond).

### 73.33  `61c7d5df0d71933d` → `9812c80a4d9a71a9`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 73.40  `31f0d37bf880e291` → `426665858889de46`
- **R1** (invention,omission,voice): The Locke/Kant satire is cut and its moral replaced: invented 'in both cases you run the risk of straining your ship's timbers'; 'you come back again; but in very poor plight' flattened to 'come back to an even keel'. Omitted: 'Thus, some minds for ever keep trimming boat. Oh, ye foolish! throw all these thunder-heads overboard, and then you will float light and right.'

### 73.41  `0af3753a6dfb01da` → `c301b9368ce9ce84`
- **R2-acc** (voice): 'in the latter instance ... in the former' forces the reader (and especially a listener) to backtrack to work out which whale is which; naming the whales makes the contrast instant. 'the well-known black bone' is also opaque to a modern reader: a brief gloss (baleen, the whalebone of the right whale's mouth).
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 73.42  `df492c6ba3483bc9` → `e443f4285358d2e5`
- **R1** (omission): Final sentence omitted: 'As the crew toiled on, Laplandish speculations were bandied among them, concerning all these passing things.'

### 74.0  `bfec169dae941aa7` → `eacb96231e853988`
- **R2-acc** (voice): Read-aloud: inverted 'lay together our own' trips the ear; restore natural order.

### 74.1  `1635aa4dd5b43724` → `ac0ae459ca94e80d`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 74.2  `0488e2da433d8753` → `6a06b7629227f864`
- **R1** (unmodernized): Near-verbatim 1851 English: 'massive enough in all conscience', 'As you behold it, you involuntarily yield the immense superiority to him', 'giving token of'. Modernized; content unchanged; 'grey' to American 'gray'.

### 74.4  `873c2ffab0febb6d` → `93846f53405d817d`
- **R1** (unmodernized): Near-verbatim 1851 syntax: 'no more than he can one exactly astern', 'how it would fare with you, did you sideways survey objects through your ears', 'in broad day'. Modernized sentence by sentence; thirty degrees, dagger, two backs / two fronts kept.

### 74.5  `19debff9946c3ad9` → `ffdecce3fb970ab4`
- **R1** (unmodernized): Near-verbatim 1851 syntax: 'so planted as imperceptibly to blend their visual power', the long suspended clause ending '— this, of course, must wholly separate', 'effectually divided'. Restructured into modern sentences; mountain between two lakes, sentry-box with two sashes, reminder for later scenes all kept.

### 74.6  `e58693368f95ee4d` → `77cf5b8ab4b243a6`
- **R1** (unmodernized): Near-verbatim 1851 English: 'might be started concerning this visual matter as touching the Leviathan', 'excluded from your contemporary consciousness', 'then is it as marvellous'. Modernized; the Euclid comparison and 'Nor, strictly investigated' kept.

### 74.7  `629e556f639f3588` → `fc543b1291903d48`
- **R1** (hedge,technical): Source: 'I think that all this indirectly proceeds from the helpless perplexity of volition, in which their divided and diametrically opposite powers of vision must involve them.' Candidate dropped 'indirectly' (hedge) and blurred 'perplexity of volition' (paralysis of will) into 'confusion of looking in two directions at once'; 'queer frights' also softened.
- **R2-acc** (unmodernized): Sentence must be reread: 'it has always seemed to me that [long subject] — I think that all this comes' restarts the clause with a second 'I think that', leaving the first 'that' clause without a verb. Keep the hedge, fix the syntax.

### 74.8  `898b3731bf282d0b` → `9b903139317f25f1`
- **R1** (unmodernized): Near-verbatim 1851 English: 'full as curious', 'no external leaf', 'so wondrously minute is it', 'imperceptible from without'. Modernized; sperm/right ear difference (external opening vs membrane-covered) kept exactly.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 74.9  `4c480e6ae92d5c11` → `c5c64c96e6bca199`
- **R1** (meaning,omission,invention): Source: 'would that make him any longer of sight, or sharper of hearing? Not at all.—Why then do you try to "enlarge" your mind? Subtilize it.' Candidate replaced the question with invented 'any better at understanding this world? No.' and deleted the closing moral turn on the reader ('enlarge' vs 'Subtilize').

### 74.10  `ccff6a6f422cd514` → `2231dd820367a7af`
- **R1** (unmodernized): Near-verbatim 1851 English: 'that it may lie bottom up', 'were it not that the body is now completely separated from it, with a lantern we might descend'. Modernized; Kentucky Mammoth Cave, tooth, bridal satins kept.

### 74.11  `8013ad2745fd27c5` → `7c201dabb4b3a7e0`
- **R1** (unmodernized): Near-verbatim 1851 English: 'many a poor wight', 'far more terrible is it to behold', 'supine', 'imprecate lock-jaws upon him'. Modernized; snuff-box lid hinged at one end, portcullis, fifteen-foot jaw like a jib-boom, hypochondriac whale and the lockjaw joke kept.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 74.13  `aeb5dc43940bd573` → `be75724282c901db`
- **R2-acc** (unmodernized): 'nor filled after our artificial fashion' is leftover archaic phrasing ('after our fashion') and a verbless fragment after a semicolon; reads oddly aloud.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 75.0  `4dc33b2361ce54f0` → `a5d469adbc94325a`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 75.1  `9dcc0e0ef2794f95` → `9cd7cc5aa13ab4c3`
- **R1** (omission,technical): Omits the nursery-tale joke: 'in this same last or shoe, that old woman of the nursery tale, with the swarming brood, might very comfortably be lodged, she and all her progeny.' 'galliot-toed' was changed to 'flat-toed' (a galliot's bow is rounded, not flat); the Dutch voyager likened 'its shape', not the head generally. Restored with a brief gloss.

### 75.2  `de6a964788628f27` → `e18d5000a1519abd`
- **R1** (omission,invention): Candidate keeps only the bass-viol image, then invents 'look at this from the front, the whale takes on the aspect of some great, stubborn buffalo'. Omitted: the 'green, barnacled thing, which the Greenlanders call the "crown," and the Southern fishers the "bonnet"'; the oak trunk 'with a bird's nest in its crotch'; the live crabs; the 'diademed king of the sea'; 'Look at that hanging lower lip! what a huge sulk and pout'; 'about twenty feet long and five feet deep'; 'some 500 gallons of oil'.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 75.3  `5316d3358fc7e248` → `56fb5db075803c61`
- **R1** (omission,invention,technical): Candidate keeps two sentences then invents a 'baleen' explanation ('If we had not known it already, we would be informed...'). Omitted: the Peruvian-earthquake joke about the hare-lip; Mackinaw / Indian wigwam; 'Good Lord! is this the road that Jonah went?'; roof 'about twelve feet high' with a ridge-pole; 'scimetar-shaped slats of whalebone, say three hundred on a side ... form those Venetian blinds'; hairy fringes that retain small fish in the brit; the age marks read 'as the age of an oak by its circular rings' and the hedge 'Though the certainty of this criterion is far from demonstrable'.

### 75.4  `743aee4530cf7c73` → `e5b74e1c9a160825`
- **R1** (omission,voice): Omits the source 'Hackluyt' ('a third old gentleman in Hackluyt') and the quaint 'upper _chop_' (normalized to 'jaw'); 'blinds' (Melville's running term) replaced by 'baleen plates'; footnote marker dropped.

### 75.5  `0442825eb5bb2031` → `b40ddb7d51e82917`
- **R2-fid** (convention): Source footnote paragraph begins "*This reminds us...". The call-site asterisk is kept in 75.4 but the footnote's own leading marker is dropped. Lead decision 2: keep each asterisk where the source places it. Text otherwise complete ("brigandish" > "piratical" acceptable).
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 75.6  `2e02949582638880` → `024f29fd84be4aca`
- **R1** (omission,voice): Omits the closing joke: 'as those ancient dames moved about gaily, though in the jaws of the whale, as you may say; even so, in a shower, with the like thoughtlessness, do we nowadays fly under the same jaws for protection; the umbrella being a tent spread over the same bone.' 'busks' flattened to 'corset-stays'.

### 75.7  `91a9e5e70a71f59e` → `19b3f39d25cbfd05`
- **R1** (omission): Omits the tongue: 'For a carpet to the organ we have a rug of the softest Turkey—the tongue, which is glued, as it were, to the floor of the mouth. It is very fat and tender, and apt to tear in pieces in hoisting it on deck. ... I should say it was a six-barreler.' Also 'colonnades' flattened to 'columns', 'blinds' to 'baleen'.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 75.8  `45143f2ddc2d26cc` → `ae7e159c934f8a28`
- **R1** (omission,technical): Omits the last distinction: 'Again, the Right Whale has two external spout-holes, the Sperm Whale only one.' 'great well of sperm' blurred to 'reservoir'; 'long, slender mandible of a lower jaw' shortened.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 75.9  `4c3ca5de4bc1bcfc` → `bda59e41acf4b116`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 75.10  `aff864b4421189be` → `299f814dbd4d70ec`
- **R1** (omission,invention,meaning): Candidate replaces the second half with invented 'You see it has a look of hopeless, resigned defiance.' Omitted: the lower lip 'pressed by accident against the vessel's side, so as firmly to embrace the jaw'; 'an enormous practical resolution in facing death'; 'This Right Whale I take to have been a Stoic; the Sperm Whale, a Platonian, who might have taken up Spinoza in his latter years.' Also 'speculative indifference' flattened to 'calm indifference'.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 76.0  `cfac5c2c1d8128a4` → `5c6f3afe6f0cdec9`
- **R1-lead** (omission): Live text drops the chapter's stated stake: 'Here is a vital point; for you must either satisfactorily settle this matter with yourself, or for ever remain an infidel as to one of the most appalling, but not the less true events, perhaps anywhere to be found in all recorded history' (the forward pointer to the Essex-style ramming). 'physiologist' was blurred to 'observer of nature' and 'battering-ram power' to 'destructive power'.

### 76.1  `49b696730dd349e2` → `20d8e3bdea0db64e`
- **R1-lead** (meaning,technical,omission,invention): Live text reverses the anatomy: source 'only in the extreme, lower, backward sloping part of the front of the head, is there the slightest vestige of bone ... So that this whole enormous boneless mass is as one wad' became 'the front of his head is almost all solid bone'. Also invented: 'like a fireplace beneath a massive mantelpiece', 'pleated with riddles' (imported from ch79), 'no nose, eyes, ears, or mouth', and two 'masses' forming the ram. Omitted: mouth-under-chin comparison, no external nose / spout-hole on top, eyes and ears one third of the length back, 'dead, blind wall, without a single organ or tender prominence', twenty feet to full cranial development, the delicate oil within, the blubber-like-orange-rind envelope of boneless toughness, harpoons and lances rebounding, 'paved with horses' hoofs', 'I do not think that any sensation lurks in it'. Rendered in full from the source.
- **R2-acc** (unmodernized): 'you are now to be told the nature of the substance' is stilted; 'you must now be told' keeps the sense. Nothing else changed.

### 76.2  `ce8ddf0b162d11df` → `e12749cd83de9556`
- **R1-lead** (omission,invention,hedge): Live text deletes the swim-bladder hypothesis entirely (fish swimming bladder; the Sperm Whale 'as far as I know' has none; head now sunk, now raised; elasticity of the envelope; the 'mystical lung-celled honeycombs' possibly connected with the outer air; the air as 'the most impalpable and destructive of all elements'), drops the wad taking the jam that would snap 'oaken handspikes and iron crow-bars', and invents a padding 'between the solid bone of the skull and the solid mass of the case above'. 'Indiamen' became generic 'ships'. The source's hedges ('hypothetically occurred to me', 'as far as I know', 'may possibly', 'If this be so') are restored.
- **R2-acc** (unmodernized,voice): (1) 'tow' is obscure to most modern readers and not explained nearby; brief gloss '(coarse hemp fiber)' added once. (2) Closing sentence 'the irresistible force of that might, to which the most impalpable and destructive of all the elements contributes' is hard to parse by ear (the relative clause hangs off 'might'); reordered to '... of that might, when the most impalpable and destructive of all the elements contributes to it.' Reviewer should confirm 'elements' = air matches source intent; wording otherwise unchanged.

### 76.3  `2c6330f422db5c78` → `ee2c4c89de0d3345`
- **R1-lead** (omission,invention,voice): Live text replaces the second half with invented interpretation ('I am speaking of a directed, calculating intelligence backed by the most tremendous physical power in the animal kingdom. What object ... could withstand such a battering?'). Omitted: the promise of later detail on his 'braining feats'; the challenge that even if the Sperm Whale 'stove a passage through the Isthmus of Darien, and mixed the Atlantic with the Pacific' you should not raise an eyebrow; 'unless you own the whale, you are but a provincial and sentimentalist in Truth'; 'clear Truth is a thing for salamander giants only to encounter'; the veil of the dread goddess at Lais (kept as printed).

### 77.1  `33c3634c2c97b3ac` → `4b5ad2112d9805a6`
- **R1** (omission,technical,meaning): Omits the second division: 'At the middle of the forehead horizontally subdivide this upper quoin, and then you have two almost equal parts, which before were naturally divided by an internal wall of a thick tendinous substance' — without it 77.3's 'lower subdivided part, called the junk' and 'upper part ... the Case' make no sense. 'quoins' replaced by 'wedge-shaped sections', contradicting the footnote (77.2) which says a quoin differs from a wedge; 'solid oblong' became 'solid rectangle'.

### 77.2  `31a3d6c68d5bd309` → `3aa39cced934a98d`
- **R1** (voice): 'Quoin is not a Euclidean term' flattened to 'not a standard geometric term' (Euclid allusion and mock-scholarship lost); footnote otherwise fine.
- **R2-fid** (convention): Source footnote paragraph begins "*Quoin is not a Euclidean term." Candidate drops the leading marker while 77.1 keeps the call-site asterisk. Lead decision 2.

### 77.3  `ea224d438307b088` → `e0f9ada13b4191dc`
- **R1** (omission,invention,technical): Invented: 'the residents of Heidelburgh might freely draw from it whenever they pleased' and 'in its capped case'. Omitted: 'as that famous great tierce is mystically carved in front, so the whale's vast plaited forehead forms innumerable strange devices'; 'the wines of the Rhenish valleys'/'oily vintages'; 'Nor is this precious substance found unalloyed in any other part'; fluid in life, concreting after death with 'crystalline shoots, as when the first thin delicate ice'; 'about five hundred gallons of sperm' and the spillage in 'the ticklish business of securing what you can'.

### 77.4  `75e0601d18972956` → `7858d1bc198ef2b6`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 77.5  `0006678f33c3b4cd` → `04422eaa6391186e`
- **R1** (omission): Omits 'as has been elsewhere set forth' and the orienting clause 'when it is lengthwise hoisted up and down against a ship's side' (which sets up the vertical well Tashtego works in).
- **R2-acc** (voice): Read-aloud: 'the entire length of the entire top of the head' repeats 'entire' awkwardly.

### 77.6  `fcba75f4d001bdbf` → `ee8562f2bde09703`
- **R1** (omission): Omits the second sentence entirely: 'It is this decapitated end of the head, also, which is at last elevated out of the water, and retained in that position by the enormous cutting tackles, whose hempen combinations, on one side, make quite a wilderness of ropes in that quarter.' (Needed for ch78's hooks and tackles.)

### 78.0  `faf3c3d38fe92777` → `264154345eef1111`
- **R1** (unmodernized): Verbatim 1851 English: 'proceeds very heedfully', 'Tashtego downward guides the bucket', 'high elevated', 'to whom he vivaciously cries', 'the full-freighted vessel', 'being sent up to him'. Modernized with every step of the bucket operation kept in order (whip through single-sheaved block, rope held on deck, spade, sounding for the spot, iron-bound bucket, long pole, emptying into tub, twenty feet of pole).

### 78.1  `9c0ca23a12e0b789` → `92e22ad25e763505`
- **R1** (unmodernized): Near-verbatim 1851 English: 'the Evil One himself would have it to fall out so', 'on a sudden', 'the twin reciprocating bucket in a veritable well', 'head-foremost'. Modernized; three alternative causes, 'eightieth or ninetieth bucket', 'my God! poor Tashtego', oily gurgling kept.

### 78.2  `66aa1b61a4f76241` → `171405690b654951`
- **R1** (unmodernized): Near-verbatim 1851 syntax: 'so as the better to secure his slippery hand-hold', 'the before lifeless head', 'Meantime'. Modernized; content unchanged.

### 78.3  `07978669f4cb5823` → `3647382f2d34303d`
- **R1** (unmodernized): Near-verbatim 1851 syntax: 'the enormous mass sideways swung, till the drunk ship reeled and shook as if smitten by an iceberg', 'got foul of'. Modernized; two hooks / one remaining, iceberg simile kept.

### 78.4  `5d9b2755d99e4bc8` → `4f615d4381cfb949`
- **R2-fid** (meaning,voice): Source: "the negro having cleared the foul line, rammed down the bucket". Candidate substitutes "Daggoo", which softens period language and supplies an identification the source leaves to the term. Lead decision 1 requires the source's term to be restored. Rest of the paragraph is complete and correct.

### 78.7  `654c7f89bfc2b70b` → `8b09ee13959db101`
- **R1** (unmodernized): Near-verbatim 1851 English: 'rolled away from it, to far down her glittering copper', 'was dimly beheld', 'One packed rush was made'. Modernized with brief gloss of the copper sheathing; Niagara's Table Rock, boarding-sword, 'my brave Queequeg' kept.

### 78.10  `593e2f1daf9a7e51` → `342ac47344121831`
- **R1** (unmodernized): Near-verbatim 1851 English: 'He averred', 'might occasion great trouble', 'had wrought a somerset upon the Indian', 'came forth'. Modernized; side lunges near the bottom, leg presented and thrust back, head-first delivery, 'doing as well as could be expected' kept.

### 78.11  `d40143a33d405293` → `4c02d9d8cb878dbf`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 78.12  `5a6f03161c3d5e37` → `69944bca645b100b`
- **R1** (omission): Omits the closing reason: 'considering the exceeding slipperiness of the curb of the Sperm Whale's well'.
- **SWEEP-names** (convention): Lead decision 7 sweep (spelling variants of geographic/people names to modern standard form): Gay-Header -> Gay Header

### 78.13  `70bb74dcc6dd57d6` → `00cac4d7182fd749`
- **R1** (unmodernized): Verbatim 1851 English including archaic pronouns and verbs the brief requires modernized: 'peradventure', 'thou makest it sink', 'We have thee there', 'but I have ye', 'sagaciously urged'. Modernized; the specific-gravity objection, emptied case, dense tendinous wall 'much heavier than the sea water', slow sinking and 'running delivery' joke kept.

### 78.14  `61b267c006d7d655` → `5aaf5caac21addfc`
- **R1** (omission,voice): Omits the chapter's closing turn: 'How many, think ye, have likewise fallen into Plato's honey head, and sweetly perished there?' Also dropped 'hearsed', 'sanctum sanctorum', 'crotch of a hollow tree' and 'it sucked him in' (changed to 'he fell into the honeyed comb').

### 79.0  `4ccd408c8665017d` → `aac8dc6ccb20cf96`
- **R1** (omission,invention): Invented: 'For it is an enterprise which makes much philosophical sense.' Omitted: Lavater studying 'the faces of horses, birds, serpents, and fish'; 'Gall and his disciple Spurzheim'; 'though I am but ill qualified for a pioneer, in the application of these two semi-sciences'; 'I try all things; I achieve what I can.' Gall 'mounted a ladder and manipulated the Dome' blurred to 'measured the bumps'.

### 79.1  `c0a0c145241f512e` → `6f1eedb22cc4bbdc`
- **R1** (omission,invention,meaning): Invented: 'makes the sperm whale's face a sort of blank. But if you see the whale from the side, there is much to learn from his profile.' Omitted the whole argument: landscape gardening 'spire, cupola, monument, or tower'; 'the elevated open-work belfry of the nose'; 'Dash the nose from Phidias's marble Jove'; the deficiency that 'in him is no blemish at all. Nay, it is an added grandeur. A nose to the whale would have been impertinent'; the jolly-boat voyage; 'a nose to be pulled'; 'the mightiest royal beadle on his throne'.

### 79.2  `ae84b158a2b8accc` → `52b760fbc7b8f108`
- **R1** (omission): 'the most imposing physiognomical view to be had of the Sperm Whale, is that of the full front of his head' became 'the most imposing view ... of the Sperm Whale's face is that of his full frontal aspect': the chapter's physiognomical framing and 'head' (79.3 says he has no face) lost.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 79.3  `ed82884ea1fba4b7` → `fc2c1a9376485952`
- **R1** (omission,invention,meaning): Invented 'Not a single line or wrinkle of worry is found there', 'It forms an enormous blank', 'the evidence of his genius'; 'a mere strip of alpine land lying along the snow line' replaced. Omitted: 'Shakespeare's or Melancthon's' foreheads; eyes like 'clear, eternal, tideless mountain lakes'; 'antlered thoughts descending there to drink, as the Highland hunters track the snow prints of the deer'; 'you feel the Deity and the dread powers'; 'no nose, eyes, ears, or mouth; no face'; 'one broad firmament of a forehead, pleated with riddles; dumbly lowering with the doom of boats, and ships, and men'; the profile view and the 'semi-crescentic depression ... Lavater's mark of genius'.
- **R2-acc** (voice): Dangling modifier: 'Pushing heavy cannon up mountain passes, the elephant's brow is majestic' makes the brow do the pushing; a listener has to untangle it. Recast with the elephant as subject, same content.

### 79.4  `a859c95a121a808b` → `d3aaaf2daa05c028`
- **R1** (omission,invention,meaning): Invented: 'They revered all grandeur, including the grandeur of silence. Lacking speech, he would have been their most terrifying god.' Omitted: 'They deified the crocodile of the Nile, because the crocodile is tongueless; and the Sperm Whale has no tongue, or at least it is so exceedingly small, as to be incapable of protrusion'; the future poetical nation luring back 'the merry May-day gods of old' into 'the now egotistical sky; in the now unhaunted hill', with the whale 'exalted to Jove's high seat'. 'deified by their child-magian thoughts' weakened to 'worshipped by their childlike people'.

### 79.5  `21dafb4245b7c882` → `45566cef1f26b66f`
- **R1** (omission,voice): Omits the ending: 'how may unlettered Ishmael hope to read the awful Chaldee of the Sperm Whale's brow? I but put that brow before you. Read it if you can.' Candidate generalized to 'how can any of us' and cut 'in its profounder and more subtle meanings'; 'peasant' changed to 'farmer'.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 80.0  `2611c29498705fe0` → `5f17e6dc0f4deb65`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 80.1  `0bae0b3030630f42` → `11b011f97035c6ef`
- **R1** (omission,invention,technical): Invented: 'this vast mass forms the forehead of the whale. Lift the skull from behind, and you expose the brain.' Omitted: the plane 'angularly filled up, and almost squared by the enormous superincumbent mass of the junk and sperm'; the crater; the brain cavity 'seldom exceeding ten inches in length and as many in depth'; 'the mere handful of this monster's brain'; 'at least twenty feet from his apparent forehead'; 'the innermost citadel within the amplified fortifications of Quebec'; whalemen who deny any brain but the sperm magazine's 'strange folds, courses, and convolutions'.
- **R2-acc** (voice): Last sentence must be reread: 'With its strange folds... it seems to their minds more in keeping... to regard that mystic part' has two unclear 'it's (the sperm magazine vs. the dummy 'it') and a dangling opening phrase.

### 80.2  `3a7c36b4631a79fa` → `85ca028c5fa8a635`
- **R2-fid** (omission): Source: "in the creature's living intact state" and "you can then see no indications of it". "intact" (the skull still loaded with junk and sperm) is the condition that makes the head a phrenological delusion, set against 80.3's "If you unload his skull"; "then" ties the second sentence to that state. Both dropped; restore.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 80.3  `43ec6d6eb3523b83` → `1efa65403493768f`
- **R1** (omission,invention): Invented: 'And the resemblance goes deeper. In both the whale and the human, the spine enters at the rear, slightly below the top.' Omitted: 'remarking the depressions on one part of its summit, in phrenological phrase you would say—This man had no self-esteem, and no veneration' and the conclusion about 'the truest, though not the most exhilarating conception of what the most exalted potency is'.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 80.4  `2c4456ceb0dce474` → `ade25afa62877b65`
- **R1** (omission,invention,meaning): Invented: 'The base of the human skull is like the first vertebra ... in the spinal cord of the whale there runs a succession of these connected skull-like shapes.' Omitted: 'It is a German conceit, that the vertebræ are absolutely undeveloped skulls'; the foreign friend inlaying his canoe prow with a slain foe's vertebrae 'in a sort of basso-relievo'; phrenologists' failure to push 'from the cerebellum through the spinal canal'; 'much of a man's character will be found betokened in his backbone. I would rather feel your spine than your skull'; 'A thin joist of a spine never yet upheld a full and noble soul'; the flag-staff of the spine. 'comparative dimensions' became 'comparatively small dimensions'; 'charted' became 'studied'.

### 80.5  `895ffabf2779a228` → `7482e1d54fb1e6b6`
- **R1** (omission,technical): Candidate stops after the canal's size and invents 'maintains its proportions'. Source: canal tapers 'but for a considerable distance remains of large capacity'; omitted that it is filled with the spinal cord, 'much the same strangely fibrous substance ... as the brain', communicating directly with it; that for many feet the cord keeps 'an undecreasing girth, almost equal to that of the brain'; the question 'would it be unreasonable to survey and map out the whale's spine phrenologically?'; and the compensation of the small brain by the large cord.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 80.6  `e6e90cc1074685cc` → `90f58038df26f0d9`
- **R1** (meaning,voice): Last sentence changed: source 'And that the great monster is indomitable, you will yet have reason to know' (a forward pointer to the chase) became 'all who know him will acknowledge'. 'august hump' flattened to 'noble hump'.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 81.1  `0e5aed356fa92918` → `cb8a7e86f39ae3b2`
- **R1** (omission): 'at very wide intervals of latitude and longitude, you still occasionally meet with their flag in the Pacific' was flattened to 'at very wide intervals across the Pacific'; the latitude-and-longitude phrasing is dropped.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 81.2  `d21a2694330a690c` → `a39d07355975999d`
- **R1** (invention): Source 'her captain was impelled towards us, impatiently standing in the bows instead of the stern' (he was rowed toward us); candidate invents 'urging his men toward us'.

### 81.6  `de819fb027d7b589` → `fa3ffd67eb78706a`
- **R2-fid** (voice,omission): Source: "however much it may invertedly contradict the old proverb about carrying coals to Newcastle" — "invertedly" (the oil-ship borrowing oil is the proverb turned upside down) was dropped, weakening the joke.

### 81.11  `9cc9c68c6b868f0c` → `b30edf0572471ecc`
- **R1** (voice): Stubb's jokes flattened: 'paregoric' became generic 'medicine'; 'Adverse winds are holding mad Christmas in him' became 'having a mad party'; 'did ever whale yaw so before? ... he's lost his tiller' became 'steer so badly ... lost his rudder'.

### 81.12  `c74c3f85f533bd1b` → `ec2c688b2e990531`
- **R1** (omission,voice): 'an overladen Indiaman bearing down the Hindostan coast' reduced to 'merchant ship ... coast of India' (loses the ship type and the period name); 'rib-ends' reduced to 'ribs'.

### 81.16  `fa9f8450fa87aa42` → `35807a26fcb72c34`
- **R2-fid** (voice): Source: "Give way, greyhounds! Dog to it!" — "Go for it!" loses the dog/greyhound wordplay that answers "ungrateful dog" earlier in the speech. "Dog to it!" is intelligible in context.

### 81.17  `e71f8a6e64ec5d21` → `70b1249c2a6195d8`
- **R2-fid** (convention,technical): Source: "A hogshead of brandy, then, to the best man." Brief: keep measures as printed; "a whole barrel" changes the measure (the edition keeps "hogshead" at 48.17 and 101.9).

### 81.20  `9ab74e47daf8f085` → `c9d107bd4feba039`
- **R1** (meaning,voice): 'The unmannerly Dutch dogger!' — a dogger is a Dutch fishing boat (Stubb insults the German as a clumsy tub); candidate's 'mongrel' changes the insult. 'fifty thousand line-of-battle-ship loads' lost its scale ('shiploads').
- **R2-fid** (convention): Source paragraph prints "for the honor of old Gayhead". Lead decision 3: proper names exactly as spelled in the source paragraph; candidate normalized to "Gay Head".
- **R3-fix** (convention): R2-fid change restored "Gayhead" under lead decision 3, but binding lead decision 7 gives geographic names their modern standard form; Gay Head is a place (Tashtego's Martha's Vineyard home) and the candidate writes "Gay Head" elsewhere (4x). Revert to "Gay Head"; nothing else changed.

### 81.22  `dcfb7fd025992cad` → `aa1beeb899a312bb`
- **R2-fid** (meaning): Source: "incited by the taunts of the German" — singular: Derick, who has just shaken his lamp-feeder and thrown his gear. "the Germans' taunts" spreads the taunting to all the German boats.

### 81.24  `233f6b1365252bc6` → `b449bdb9e8932ae4`
- **R2-acc** (unmodernized,convention): Read-aloud: inverted clause 'or sideways rolled toward the sky his one beating fin' forces a reread; two consecutive sentences open with 'But' ('But the bird has a voice... But the fear...'); 'save that choking respiration' uses archaic 'save'.

### 81.28  `fb9c07052dc73c67` → `3836b5ea9d7fceca`
- **R1** (technical,omission): 'the lead-lined chocks of the boats' became 'the lined chocks of the bows' (drops lead); 'this hooking up by the sharp barbs of his live flesh from the back' lost 'from the back'.

### 81.29  `8cc63e704614f6e0` → `52a8cfaa2543136d`
- **R2-fid** (omission,voice): Source: "Not eight inches of perpendicular rope" and "to hide him from the Pequod's fish-spears!" — "perpendicular" dropped, and the closing "fish-spears" (a deliberate echo of Job's "his head with fish-spears" quoted just before) flattened to "spears", losing the unfulfilled-prophecy irony.

### 81.35  `cd5446f558bd80fe` → `84b57ea4da7f3a12`
- **R1** (omission,voice): 'For all his old age, and his one arm' (echoing Flask's 'wounded arm' joke) became 'his one fin'; 'churches that preach unconditional inoffensiveness by all to all' lost 'by all to all' (reduced to 'gentleness to all').

### 81.38  `4da7afef5efa8495` → `2aa13cd7deb36410`
- **R2-fid** (meaning): Source: "bespattering them and their glorying crews ... capsizing Flask's boat and marring the bows." "glorying" (exulting) became "gloating" (adds malice), and "marring" (damaging) became "smashing" (overstates the damage).
- **R3-fix** (meaning): Source "with swift fury blindly darted at the craft": candidate "with savage fury" swaps speed for ferocity (pre-existing wording, left in the R2-touched paragraph). Restore "swift"; R2 fixes (exulting, damaging) kept.

### 81.41  `704254c5656e5b70` → `6af90ba1e31c88dc`
- **R1** (omission,voice): Dropped 'if still persisting in locking arms with the body' (flattened to 'kept holding on') and the cause 'so low had the whale now settled that the submerged ends could not be at all approached'.
- **R2-acc** (unmodernized): 'the ship was unprecedentedly dragged sideways toward the sea' is hard to parse aloud (the ship is already in the sea); the sense is that she was heeled over toward the sea to an unusual degree.
- **R3-fix** (meaning): Source "owing to the body's immensely increasing tendency to sink": candidate "rapidly increasing" turns magnitude into rate (pre-existing, in the R2-touched sentence). R2 accessibility edit ("to a most unusual degree") is otherwise faithful to "unprecedentedly".

### 81.44  `8f4452cc52f828ff` → `6c5df259cfc45b03`
- **R2-fid** (omission,voice): Source: "an uncommon specific gravity in the fish so sinking, consequent upon this absence of buoyant matter in him" — the causal clause (heaviness because the buoyant fat is gone) was dropped. Also "swelling with noble aspirations" became "noble energy" and "all their panting lard" became "plump fat", flattening the mock-heroic "brawny, buoyant heroes" register.
- **SWEEP-caps** (convention): Species-name capitalization follows the source paragraph (brief: 'In a paragraph you rewrite, follow the source's capitalization'): Sperm Whale

### 81.45  `df21a26a708e39ea` → `37d1bd366577e744`
- **R1** (voice): Melville's image 'his Venetian blinds alone sometimes weighing more than a ton' replaced by plain 'baleen plates'.
- **R2-fid** (convention): Repaired paragraph; brief: "In a paragraph you rewrite, follow the source's capitalization." Source has "Sperm Whale", "Right Whale(s)" throughout; candidate lowercased them.

### 81.46  `9126f1a3ac9bc30f` → `bbc33710b4e2dba2`
- **R2-fid** (voice): Source: "The Virgin crowding all sail, made after her four young keels" — "young" (the Virgin and her brood, closing the Jungfrau joke) dropped.
- **R3-fix** (hedge): Source "the species of uncapturable whales": candidate "virtually impossible to capture" adds a qualification Melville does not make (pre-existing, in the R2-touched paragraph). Remove "virtually"; R2 "young" restoration is correct.
- **SWEEP-caps** (convention): Species-name capitalization follows the source paragraph (brief: 'In a paragraph you rewrite, follow the source's capitalization'): Sperm Whale
- **R5-fix** (convention,voice): Rewritten paragraph mixes species capitalization after the SWEEP-caps pass: source prints 'Fin-Back' (twice) and 'Sperm Whale'; candidate has 'fin-back' beside 'Sperm Whale'. Also source 'this unnearable brute' became 'this uncatchable brute', duplicating 'impossible to capture' (source 'uncapturable') and losing the sense that it cannot even be approached.

### 82.1  `2e922f7584d6240d` → `c51e6e1d120b2c22`
- **R1** (omission,unmodernized): Dropped 'though but subordinately' and 'so emblazoned a fraternity' (replaced by 'so ancient and noble a body'); first sentence otherwise near-verbatim.

### 82.2  `83220d796b22e170` → `f6d862e5149e7398`
- **R1** (unmodernized): Near-verbatim 1851 text ('be it said', 'to succor the distressed', 'intrepidly advancing', 'delivered and married the maid', 'inasmuch as', 'let no man doubt this Arkite story'). Modernized sentence by sentence; mock-heroic tone kept.
- **R2-fid** (invention): Open question 1. Source: "let no man doubt this Arkite story". The gloss "a tale as old as Noah's Ark" asserts a dating claim the source does not make (Melville's "Arkite" points to the Ark/Deluge-era mythography, not to a stated age). Brief: "When unsure of a gloss's accuracy, leave the term unglossed."

### 82.3  `6a7d33d5a729710e` → `1d828e1454678e6c`
- **R1** (unmodernized): Near-verbatim ('Thou art as a lion ... saith Ezekiel; hereby, plainly meaning', 'it would much subtract from the glory ... had St. George but encountered', 'have the heart in them'). Modernized; 'a Coffin' glossed as the Nantucket name.

### 82.4  `4f79d37a7cf90b6f` → `b64485355210e263`
- **R1** (unmodernized): Entire paragraph verbatim 1851 ('Let not the modern paintings', 'ancientest draughts', 'who being planted before the ark ... fell off from him', 'let them never eye', 'woollen frocks and tarred trowsers'). Full modern rendering, keeping the three 'considering' steps, the seal/sea-horse mount, Dagon's horse's head, the Order of St. George joke and the parenthesis.

### 82.5  `1ab7821912511cb3` → `d5832f875a0e1489`
- **R1** (unmodernized): Near-verbatim ('concerning this I long remained dubious', 'that might be mooted', 'he may be deemed', 'if he did not the whale'). Modernized; Crockett/Kit Carson and the 'from the inside' joke kept.

### 82.7  `018159117a9ea77f` → `99e0e58d0791acf9`
- **R1** (unmodernized): Verbatim 1851 ('is now to be rehearsed from the Shaster', 'saith the Shaster', 'whose perusal would seem to have been indispensable', 'Was not this Vishnoo a whaleman'). Modernized; 'practical hints to young architects' joke and horseman analogy kept; Shaster briefly glossed.

### 82.8  `fe43e87f37c8d9b7` → `0cad230644112302`
- **R1** (convention,unmodernized): Candidate respells 'Vishnoo' as 'Vishnu' (names are kept as printed; the chapter uses Vishnoo throughout) and keeps the obscure 'can head off like that'.

### 83.0  `4a5fdd500afbe750` → `8518486f531f219a`
- **R1** (invention,omission): Candidate invents 'some Portuguese scholars doubted the story of St. George and the Dragon' and a moral ('some people will always doubt the most extraordinary stories'); it omits 'Arion and the dolphin' and the ironic punch line 'their doubting those traditions did not make those traditions one whit the less facts, for all that'.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 83.1  `38c4babb2965fb0d` → `28ca81d471b6853b`
- **R1** (unmodernized): Verbatim 1851 ('Bishop Jebb's anticipative answer is ready', 'hints the Bishop, that we consider Jonah as tombed', 'ensconced himself', 'on second thoughts'). Modernized; Sag-Harbor objection, penny-roll saying, whist-tables and hollow-tooth joke kept.

### 83.2  `e71db9d122d6f97a` → `db5860c5ab9fdd29`
- **R1** (unmodernized): Verbatim 1851 ('urged for his want of faith', 'something obscurely in reference to', 'German exegetist', 'it has been divined', 'straightway effected his escape', 'Nor have there been wanting learned exegetists who have opined', 'worsted all round'). Modernized; the italic stress on _dead_ conveyed by wording; all alternative theories and the Nineveh geography objection kept.

### 83.3  `e8c2866de1ddc5c1` → `0e95792bc78f1542`
- **R1** (unmodernized): Verbatim 1851 ('not to speak of', 'Jonah's weathering the Cape ... at so early a day would wrest the honor'). Modernized; Melville's route (Mediterranean, 'up the Persian Gulf and Red Sea') kept as printed, not corrected.
- **R2-acc** (unmodernized): Read-aloud: 'to say nothing of' appears twice in the same sentence; varying the second keeps both points.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 83.4  `ee816a69c78aa52e` → `5b6b886d7b8844bd`
- **R1** (unmodernized): Verbatim 1851 ('only evinced his foolish pride of reason', 'For by a Portuguese Catholic priest, this very idea ... was advanced as a signal magnification', 'speaks of a Turkish Mosque ... in which Mosque was a miraculous lamp that burnt'). Modernized; the mock-pious irony ('abominable, devilish rebellion against the reverend clergy', 'highly enlightened Turks', oil-less lamp) kept intact.

### 84.0  `08239d73525200c3` → `a8ee790f7ceea8da`
- **R1** (unmodernized): Verbatim 1851 ('Nor is it to be doubted that as such a procedure can do no harm, it may possibly be of no contemptible advantage', 'rubbing in the unctuousness', 'Nor did it remain unwarranted by the event'). Modernized; the 'anointed' axles/anointing echo and the bald-keel hair joke kept.

### 84.1  `52a3db3b4a28624b` → `6f329db9303ee94b`
- **R1** (unmodernized): Verbatim 1851 ('whales were raised', 'so soon as', 'fled with swift precipitancy').

### 84.2  `9de46c8b688928ad` → `78906d97d1b10ff6`
- **R1** (unmodernized): Verbatim 1851 ('without at all sounding', 'with added fleetness', 'Such unintermitted strainings upon the planted iron must sooner or later inevitably extract it', 'What then remained?').

### 84.3  `0097924d8212058e` → `b3f70410b5e6dd98`
- **R1** (unmodernized): Verbatim 1851 ('to which the veteran whaleman is so often forced', 'Small sword, or broad sword, in all its exercises boasts nothing like it', 'inveterate running whale', 'its grand fact and feature', 'under extreme headway'). Modernized; all technical specs (10-12 ft, slighter pine staff, warp) kept.

### 84.4  `0ac722169f3900d0` → `c6b128567e821e99`
- **R1** (unmodernized): Verbatim 1851 ('in the same way with the lance, yet it is seldom done; and when done, is still less frequently successful, on account of the greater weight and inferior length').

### 84.5  `520edfa582ea6676` → `cd2616b38c6efb05`
- **R1** (unmodernized): Verbatim 1851 ('wrapt in fleecy foam', 'Stubb whistlingly gathers up', 'when, covering him with it, he steadily depresses the butt-end', 'He minds you somewhat of a juggler'). Modernized; every step of the throw (sighting, warp coil, lance balanced on palm fifteen feet up, arc) kept.

### 84.6  `42ac13933cb874ba` → `3d241ff9ae377035`
- **R1** (unmodernized): Stubb's speech left verbatim ('Would now, it were', 'I'd have ye hold a canakin', 'Yea, verily, hearts alive', 'quaff'). Modernized; Fourth-of-July joke and the three whiskeys kept.

### 84.7  `c1e0d3ba73afd461` → `6aef231a5ba21346`
- **R1** (unmodernized): Verbatim 1851 ('to such gamesome talk, the dexterous dart is repeated', 'held in skilful leash'). 'Flurry' briefly glossed.
- **R2-acc** (unmodernized): Doubled word: 'the skillful throw ... held on a skillful leash' repeats 'skillful' within one sentence.

### 85.0  `983c8e2b4ce2e7d3` → `d2c12eaedda9d0b1`
- **R1** (unmodernized): Verbatim 1851 ('sprinkling and mistifying the gardens of the deep, as with so many sprinkling or mistifying pots', 'that all this should be'). Modernized; the mock-precise timestamp and 'still ... a problem, whether ... water, or nothing but vapor' kept open.

### 85.1  `6bbd4934e5fbf612` → `07ae3aa0f1e641ec`
- **R1** (unmodernized): Verbatim 1851 ('along with some interesting items contingent', 'by the peculiar cunning of their gills, the finny tribes', 'inhaling the disengaged air', 'Wherefore the necessity'). Modernized; 'spiracle' glossed once.

### 85.2  `4331cabf6584211d` → `48ec6871910a0f02`
- **R1** (unmodernized): Verbatim 1851 throughout ('If I say ... I do not think I shall err', 'vivifying principle', 'not fetch another', 'remarkable involved Cretan labyrinth', 'ere descending for good', 'Not so much thy skill, then, O hunter, as the great necessities that strike the victory to thee!'). Modernized; hedges ('I do not think I shall err', 'seems the more cogent to me', 'Say he stays'), the camel comparison, the seventy-breaths example and the apostrophe kept.

### 85.3  `647ca6a229fdbc1d` → `8a77954a677a9e67`
- **R1** (unmodernized): Verbatim 1851 ('one breath only serving for two or three pulsations'). Modernized; the deliberate chiasmus 'breathe he must, or die he will' kept as rhetoric; the 'one seventh or Sunday' joke kept.

### 85.4  `d049f5eee3c30de4` → `0badd17a1f5f507e`
- **R1** (unmodernized): Verbatim 1851 ('then I opine we should be furnished with the reason', 'answers to his nose', 'on this head', 'Sure it is, nevertheless', 'what does he want of them?'). Modernized; conditional kept conditional; water-or-vapor uncertainty kept open.

### 85.5  `d536e608df2f2eed` → `d451d99b189ff4d2`
- **R1** (unmodernized): Near-verbatim 1851 ('as his windpipe solely opens into', 'for the downward retention of air or the upward exclusion of water', 'Oh! happy that the world'). Modernized; Erie Canal locks, 'talks through his nose' insult and the ironic closing kept.

### 85.6  `d6c2ee1f76a20690` → `1e7f1d4af883ba68`
- **R1** (unmodernized): Verbatim 1851 ('chiefly intended as it is for the conveyance of air', 'the question returns', 'there he cannot spout even if he would', 'if you regard him very closely', 'an undeviating rhyme between the periods of his jets'). Modernized; 'certain' vs 'cannot be proved' distinction kept.

### 85.7  `90da9e6069451e70` → `d8b9c20c4173429e`
- **R1** (unmodernized): Verbatim 1851 ('why pester one', 'I have ever found your plain things the knottiest of all'). Light modernization; the imagined objector and 'plain things the knottiest' kept.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 85.8  `f426d0d0ddb2487d` → `1de31d93ec46732f`
- **R1** (unmodernized): Verbatim 1851 ('how can you certainly tell ... when, always, when you are close enough', 'if at such times you should think that you really perceived', 'those identical drops superficially lodged'). Modernized; all three rhetorical doubts kept as questions (no conclusion added); dromedary and rock-basin images kept.
- **R2-acc** (unmodernized): Doubled word: 'close enough to a whale to get a close view' repeats 'close'.

### 85.9  `26d9e39f99fc31a8` → `2ee652a9fc582b62`
- **R1** (unmodernized): Verbatim 1851 ('Nor is it at all prudent for the hunter to be over curious touching', 'from the acridness of the thing so touching it', 'And I know one, who coming into ... the skin peeled off', 'Wherefore ... they try to evade it'). Modernized; hedges 'I cannot say', 'I have heard it said, and I do not much doubt it', 'it seems to me' kept.

### 85.10  `daaecbd670d1a755` → `46447b4bd0e318a4`
- **R1** (unmodernized): Verbatim 1851 ('to this conclusion I am impelled, by considerations touching', 'I account him no common, shallow being, inasmuch as', 'ere long saw reflected there'). Modernized; kept explicitly as hypothesis ('we can hypothesize, even if we cannot prove'; 'supposition'); the shallow/profound pun, the list Plato ... Dante, the mirror and tea-and-attic 'evidence' kept; 'on soundings' glossed.

### 85.11  `51e368daad405abd` → `254a576379935832`
- **R1** (unmodernized): Verbatim 1851 ('how nobly it raises our conceit of', 'For, d'ye see', 'enkindling my fog', 'but doubts or denials, few along with them, have intuitions'). Modernized; closing doubts/intuitions balance kept exactly ('neither believer nor infidel ... with equal eye').
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 86.1  `776670578ae56c9a` → `a78b7fdddf11cc4c`
- **R2-fid** (technical,omission): Source: "At the crotch or junction, these flukes slightly overlap, then sideways recede from each other like wings" — the direction "sideways" was lost ("separate from each other").
- **SWEEP-caps** (convention): Species-name capitalization follows the source paragraph (brief: 'In a paragraph you rewrite, follow the source's capitalization'): Sperm Whale

### 86.3  `23398bb06d20c9b9` → `635b022ac1480a47`
- **R1** (technical,omission): 'the tendinous tail' became 'the muscular tail' (the source contrasts the sinewy tail with the muscular web over the body); 'the confluent measureless force' lost 'confluent'.
- **R2-fid** (voice): Source: "knit over with a warp and woof of muscular fibres" — the weaving image (continuing "knit") flattened to "mesh".

### 86.4  `90708c01ea2bad72` → `091b1dbbaa688435`
- **R1** (omission,convention): Drops 'hermaphroditical' from 'the soft, curled, hermaphroditical Italian pictures' (period language softened, against hard rule 4). Name 'Eckerman' respelled 'Eckermann' (names kept as printed).
- **R2-fid** (meaning,voice): Source prints "When Angelo paints even God the Father"; lead decision 3 and the brief require the name as printed — silently replacing it with "Michelangelo" changes the name (an accurate gloss is allowed). Also "the mere negative, feminine one of submission and endurance" became "merely passive" (source term altered), and "most appalling beauty" became "most awesome beauty" (modern "awesome" is weak/slangy; Melville means terrible).
- **R2-acc** (unmodernized): Archaic imperative 'mark what robustness is there'; the brief renders Melville's 'mark' asides in modern form ('notice').

### 86.10  `d9ad1e1c745608af` → `8c1b06576982ee6a`
- **R1** (omission): 'in the fancied security of the middle of solitary seas' reduced to 'of the open seas'; the solitude is lost.

### 86.12  `2fe7579f3ab7dd73` → `d10e1196f463e16a`
- **R2-fid** (omission): Source: "should not tend to place those two opposite organs on an equality" — "opposite" (tail and trunk at opposite ends) dropped.
- **R2-acc** (meaning): Ambiguous pronoun: in 'so compared with Leviathan's tail, his trunk is but the stalk of a lily', 'his' reads as Leviathan's; the trunk is the elephant's. 'is but' also archaic.
- **R3-fix** (omission): Source "which in repeated instances have one after the other hurled entire boats": "one after the other" (boats hurled in succession) dropped. R2 fixes ("opposite", "the elephant's trunk", "only") are correct.

### 86.13  `d7c0c94083cdf05f` → `31a390d6dee94967`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 86.14  `0a0043467bfba4cf` → `1d33205d164a2328`
- **R2-fid** (hedge): Source: "so remarkable, occasionally, are these mystic gestures" — the qualifier "occasionally" was dropped, making the remarkable gestures sound habitual.
- **R2-acc** (unmodernized): Leftover archaic/inverted syntax: 'Nor are there lacking other motions', 'Dissect him how I may', and 'Much more, how can I comprehend his face' (1851 idiom for 'still less'; a modern reader takes 'much more' the wrong way). Biblical 'back parts ... shall not be seen' echo kept deliberately.

### 87.0  `96ecb135ec286536` → `dde422d2c2969dbd`
- **R1** (voice,omission): Melville's fortification image 'a vast mole, or rampart' became 'a vast wall', and 'pierced by several sally-ports' became 'passages', breaking the rampart/sally-port metaphor that the paragraph sustains.

### 87.1  `67876386c1836689` → `9c26699690cc8e35`
- **R1** (omission): 'the endless procession of ships before the wind' lost 'before the wind'; 'the islands of Sumatra and Java' shortened.
- **R2-acc** (gloss): 'the Propontis' is an ancient name most readers will not recognize in a list of fortified sea entrances; brief accurate gloss added.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 87.2  `89296d593866cead` → `42ac26e29ca7285d`
- **R1** (technical,omission,convention): 'piratical proas of the Malays' flattened to 'pirate boats'; 'the audacity of these corsairs' lost 'corsairs'; 'sallied out upon the vessels sailing through the straits' shortened; 'Since time out of mind' is ungrammatical.

### 87.3  `e040e789c376e509` → `62bcb68498f76961`
- **R1** (hedge,omission): 'waters known to be frequented here and there by the Sperm Whale' lost the qualifier 'here and there'.
- **SWEEP-caps** (convention): Species-name capitalization follows the source paragraph (brief: 'In a paragraph you rewrite, follow the source's capitalization'): Sperm Whale

### 87.4  `4279909b5935af1f` → `e490a3447d605813`
- **R1** (unmodernized): Inverted conditional 'did you carry them the news' left in 1851 syntax; 'But how now?' archaic.
- **R2-acc** (unmodernized): 'Mark this, too' is the archaic imperative the brief says to render in modern form ('Now, notice this').

### 87.5  `d4abfaf37ed502e7` → `61dc776edf120015`
- **SWEEP-caps** (convention): Species-name capitalization follows the source paragraph (brief: 'In a paragraph you rewrite, follow the source's capitalization'): Sperm Whale

### 87.6  `843a3ad4fa7e1de6` → `f8564018ef265507`
- **R1** (omission,voice): Allusion 'sworn solemn league and covenant' reduced to 'a solemn pact'; 'this aggregation of the Sperm Whale into such immense caravans' lost the caravan image.
- **R2-fid** (hedge): Source: 'be suddenly saluted by what sometimes seems thousands on thousands' — candidate 'what seems thousands upon thousands' drops the hedge 'sometimes'.
- **SWEEP-caps** (convention): Species-name capitalization follows the source paragraph (brief: 'In a paragraph you rewrite, follow the source's capitalization'): Sperm Whale

### 87.7  `d5fc526a0e5226a8` → `81ac0eeec7d20eea`
- **R1** (omission): 'like the cleft drooping boughs of a willow' lost 'cleft', the image of the divided spout.
- **SWEEP-caps** (convention): Species-name capitalization follows the source paragraph (brief: 'In a paragraph you rewrite, follow the source's capitalization'): Sperm Whale, Right Whale

### 87.10  `fec4f5dd85989709` → `d8bbb2e14fca1fb6`
- **R1** (technical,voice): 'with stun-sail piled on stun-sail, we sailed along' became 'with every sail set'; the studding-sail image is lost.
- **R2-acc** (readability): 'they had little doubt that chased through these Straits of Sunda, the vast host would only spread out ... to witness the capture of not a few of their number' needs rereading: the participle 'chased' has no anchor and 'witness the capture' is stiff.

### 87.12  `a6dcd67662f0ebd6` → `4b51c8566a293f99`
- **R1** (voice,convention): Period term 'Asiatics' softened to 'Asians' (lead decision 1); the italic stress in 'the bloodthirsty pirates chasing _him_' (the chaser chased) is lost; conveyed with 'him, the chaser'.
- **R2-acc** (readability): Two parsing problems. 'As if lurking too long behind the headlands, ... these rascally Asiatics were now in hot pursuit' reads as a broken comparison. And 'As Ahab paced the deck ... the pirates who were chasing him, the chaser — some such thought seemed his' only resolves at the end; the reader has to reread to see that the 'thought' is the preceding 'how very kind' irony. Reordered, no content changed.

### 87.13  `5631111f6fa19196` → `429f19f3b8309d68`
- **R1** (hedge): 'by some presumed wonderful instinct of the Sperm Whale' lost 'presumed'.
- **SWEEP-caps** (convention): Species-name capitalization follows the source paragraph (brief: 'In a paragraph you rewrite, follow the source's capitalization'): Sperm Whale

### 87.14  `18bfdc27468d43a7` → `313fb5728bda1b41`
- **R1** (omission): 'King Porus' elephants in the Indian battle with Alexander' lost 'Indian' (the same kind of slip the audit found).
- **R2-acc** (unmodernized): 'Best, therefore, withhold any amazement' is clipped archaic syntax.
- **R3-fix** (omission): Source: 'a general pausing commotion among the whales gave animating token that they were now at last under the influence of that strange perplexity' — 'at last' (the release after 'several hours' pulling') is dropped. The R2 edit ('So it is best to withhold any amazement') is itself clean.

### 87.15  `130abba14983bd23` → `e17936e8d14572c2`
- **R1** (voice): 'only exist in a delirious throb' became 'a delirious rush'; the pulse image is changed.

### 87.17  `d31ef38c16ce5b88` → `23b463c958470ad7`
- **R1** (voice,meaning): 'to a great dromedary that of a sudden rose' flattened to 'a great whale' (the oarsmen's joke is lost); 'steered us manfully' became 'expertly'.

### 87.18  `f38366748c9758f2` → `157f5e37ef2a401b`
- **R1** (technical,omission): Melville's whaling term 'druggs'/'drugg' was replaced throughout by 'drags'; 'at times like these' dropped; 'two or three drawers and shirts' lost 'drawers'; 'cramped like malefactors' became 'hampered like prisoners'.
- **R2-acc** (readability): Dangling construction: 'upon flinging the third, in the act of tossing the clumsy wooden block overboard, it caught under one of the boat's seats' — nobody is named as the one flinging, and 'it' is ambiguous.

### 87.19  `40eb33019bbf5769` → `6910e383e2ffc403`
- **R1** (technical,voice): 'drugged-harpoons' became 'drag-harpoons'; 'the storms in the roaring glens between the outermost whales' became 'the gaps', losing the mountain-glen image that follows the torrent/valley-lake simile.

### 87.20  `d81c8edda1a48f39` → `516e265dc666f1b9`
- **R1** (omission): 'so young, unsophisticated, and every way innocent and inexperienced' lost 'unsophisticated' and 'every way'.
- **R2-fid** (omission): Source: 'the entire area at this juncture, embraced by the whole multitude, must have contained' — 'embraced by the whole multitude' is dropped, so the reader is not told what area is being measured.
- **R2-acc** (readability): The central sentence ('I mention this because, as if the cows and calves ... — or possibly, being so young ... — however it may have been, these smaller whales ...') stacks three hedged causes before its subject and is very hard to follow read aloud. Reordered so the main clause comes first; all three possible causes and their uncertainty are kept.
- **R3-fix** (omission,convention): Restructure (R2-acc) keeps all three hedged causes and the sense, but introduces a punctuation fault and drops three small source details: (1) the tail '...innocent and inexperienced; however it may have been.' ends the sentence with a semicolon before a non-clause fragment; (2) source 'a still becharmed panic' — 'still' (motionless) is dropped; (3) 'had hitherto prevented them' — 'hitherto' dropped; (4) 'came snuffling round us, right up to our gunwales' — 'round us' dropped. Minimal fix restores these and repunctuates the tail with a dash.

### 87.21  `196851320266a658` → `ad659c45f7828913`
- **R1** (voice,omission): 'a bit of Gulfweed' generalized to 'seaweed'; 'that irksome position ... in the maternal reticule' flattened to 'the womb', losing Melville's joke (a reticule is a lady's drawstring handbag).

### 87.25  `b6e5a265be3704ff` → `20f78a5e83d1ee9b`
- **R2-fid** (voice): Source: 'We saw young Leviathan amours in the deep.' 'Amours' are love affairs; 'courtship' softens Melville's frankness, which the footnote (87.26) then develops.
- **R2-acc** (unmodernized): 'Not seldom' is an archaic litotes.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 87.26  `4504a9a93e7615d1` → `fdfbd9047f4ecb81`
- **R1** (omission,voice): Footnote: the allusion 'giving birth to an Esau and Jacob' reduced to 'twins'; 'these precious parts' lost 'precious'; 'discolour the sea for rods' changed the measure to 'yards'; 'mutual esteem' became 'affection'; 'salute more hominum' reduced to 'in human fashion' with the Latin dropped.

### 87.27  `d9736a4926e14525` → `3ff323311e2af129`
- **R1** (unmodernized,voice): Left in inverted archaic syntax ('did these inscrutable creatures ... indulge', 'yea', 'do I myself still ... float'); 'dalliance' became 'tenderness', 'disport' became 'float', 'unwaning' became 'unceasing'.
- **R2-acc** (readability,meaning): 'But even so, amid the tornadoed Atlantic of my being' — to a modern reader 'even so' means 'nevertheless', which makes the narrator's parallel with the calm whales read as a contrast. The sense is 'just so / in the same way'. Please confirm against the source.

### 87.28  `33dd265a0c71d5d1` → `0209d3633acdec43`
- **R1** (technical,hedge): 'drugging the whales' and 'drugged whales' became 'dragging'/'dragged'; 'to seek to hamstring him, as it were' lost 'as it were'; 'but not effectually, as it seemed' lost 'as it seemed'.

### 87.30  `f64537c8b2b5e460` → `7f1efac8eb949a1d`
- **R2-fid** (omission): Source: 'as if lifted by half spent billows from afar' — candidate 'spent waves' drops 'half'.

### 87.32  `3f9bddac25e80696` → `e3d08fb4d3e6cb18`
- **R1** (omission,voice): 'a narrow Dardanelles between their long lengths' reduced to 'a narrow strait' (allusion dropped); 'two vast black bulks' became 'hulks'.

### 87.33  `6b2aec3467a59605` → `72415dc277e12ec1`
- **R1** (technical): The whaling term 'waif' ('Flask had killed and waifed. The waif is a pennoned pole') was replaced by 'marked'/'The mark', and 'drugged whales' by 'dragged'; chapter 89 depends on 'waif' being established here.

### 87.34  `fc4348eb1ab1a3fc` → `c24b3d875673d635`
- **R1** (technical): 'Of all the drugged whales' became 'dragged'.

### 88.0  `d089059109095a98` → `4acb0b1c613b2b66`
- **R2-acc** (readability): 'and there was also given the probable cause behind those vast gatherings' is inverted passive that reads awkwardly aloud.
- **SWEEP-caps** (convention): Species-name capitalization follows the source paragraph (brief: 'In a paragraph you rewrite, follow the source's capitalization'): Sperm Whale

### 88.2  `39082f73d5246ebf` → `74e23b39f8683761`
- **R1** (voice,omission): 'luxurious Ottoman' and 'this Ottoman and his concubines' became 'sultan' and 'consorts' (softened); 'the largest leviathanic proportions' lost 'leviathanic'. The Ottoman/Bashaw/Grand Turk sequence is the chapter's running joke.

### 88.3  `d8048b7c202de0a1` → `ec9ce05d658e4377`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 88.4  `a7b27bec1fc2bc14` → `35381eddb2ea28db`
- **R1** (omission,voice,corruption): 'the Bashaw assails him' and 'do what the Bashaw will' became 'the lord'; the allusive name 'Lothario' became 'seducer'; 'elks that warringly interweave' became ungrammatical 'warring interweave'.
- **R2-fid** (voice): Open question answered: 'Bashaw' (source: 'with what prodigious fury the Bashaw assails him') is an old English form of 'pasha'. It is a title and stays as printed (decision 7), but it is the one term in the chapter's Ottoman/Grand Turk joke that will stop a modern reader. A brief accurate gloss at first use, once in the chapter, is within the brief.
- **R2-acc** (readability): 'High times indeed' now means 'good times' to most readers; here it is ironic outrage ('a fine state of affairs'). Proposed wording keeps the irony without the misleading idiom.

### 88.5  `4843c4af51810fdf` → `cb59c3b186b621ac`
- **R1** (voice,omission): 'these Grand Turks' became 'grand sultans'; 'the sated Turk' became 'sultan'; 'our Ottoman' became 'Our lord'; 'omnivorous roving lovers' lost 'omnivorous'.
- **R2-acc** (unmodernized): 'Granting other whales to be in sight' is archaic conditional syntax.

### 88.6  `2b571e765b0e3983` → `2d2e3f2707e44ff5`
- **R1** (voice): 'this sort of Ottoman whale' became 'sultan whale'.
- **R2-acc** (allusion): The Vidocq joke depends on knowing who Vidocq was; most readers will not. Brief accurate gloss added (Eugene Francois Vidocq, criminal turned head of the Paris police detectives, whose memoirs were famous). If the lead prefers no gloss, leave as is.

### 88.7  `e3c42dda62edad30` → `3736412103e6fb33`
- **SWEEP-caps** (convention): Species-name capitalization follows the source paragraph (brief: 'In a paragraph you rewrite, follow the source's capitalization'): Sperm Whale

### 88.8  `ccf4655b021dc88c` → `3783bc5dfd2cd276`
- **R1** (omission): 'grim fiends exasperated by a penal gout' lost 'penal' (gout as a punishment).

### 88.9  `1b60503e771143d5` → `77bfa53ccaf0987d`
- **R1** (meaning): 'full of fight, fun, and wickedness' softened to 'mischief'.

### 89.0  `96060412961b4a6c` → `b702eb97823480e9`
- **R1** (technical,omission): 'The allusion to the waif and waif-poles' became 'the marker-pole'; 'of which the waif may be deemed the grand symbol' became 'the marker'. The chapter's key term is lost.

### 89.1  `f6c877aab5bd5af0` → `6a2c9e97092f6a7e`
- **R1** (hedge): 'the most vexatious and violent disputes would often arise' became 'constantly arise'.

### 89.2  `1a753b211c8cf050` → `c82183f5ef9b6cdf`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 89.6  `fed0e1bd0c42f617` → `b989ecc5ac28a108`
- **R1** (technical): 'when it bears a waif ... so long as the party waifing it' became 'marker'/'marking party'.

### 89.7  `353b226513074473` → `36126d01e03bfc8e`
- **R1** (omission,voice): The legal allusion 'the Coke-upon-Littleton of the fist' was replaced by 'the fists doing the arguing'.

### 89.8  `872180aa70f636ba` → `056d114730ef3837`
- **R1** (voice): 'by way of doxology to the deed he had done' flattened to 'by way of celebration'.
- **R2-acc** (allusion,unmodernized): 'whale-trover' is an obscure legal term that stops the reader at the opening of the case; brief accurate gloss added (trover = action to recover the value of goods wrongfully taken). Also 'Wherefore' is archaic.
- **R3-fix** (voice,omission): The R2 trover gloss is accurate. But the paragraph drops the pedantic legal parenthetical 'when indeed they (the plaintiffs) had succeeded in harpooning the fish' — the same mock-legal device the round-2 fidelity review restored in 89.11 ('it (the fish)') — and softens 'finally appropriated it' to 'finally claimed it', losing the wrongful-taking sense.

### 89.9  `53036399ec3e5874` → `b43ebcb2a3cd3293`
- **R1** (omission,meaning): The legal term 'crim. con. case' replaced by 'adultery case'; 'bridle his wife's viciousness' and 'the great stress of her plunging viciousness' (a horse-breaking metaphor) became 'curb ... unfaithfulness' and 'wayward plunging'.
- **R2-fid** (meaning): Source: 'Erskine was on the other side; and he then supported it by saying' — Erskine had opposed the husband's action and argued his own side. Candidate 'had then supported the case' reads as if he backed the husband's suit, the opposite of the point.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 89.10  `e3b6ecc9452dcb5a` → `260ea043e6ff31dc`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 89.11  `558a2f97eafe6911` → `3c28cb040837f881`
- **R2-fid** (voice): Source: 'it (the fish) acquired a property in those articles' — the pedantic parenthetical is part of the mock-legal comedy of the judgment and is dropped.

### 89.13  `f8ff8d282a55f2de` → `3b76786ab35a7f04`
- **R1** (meaning,omission): 'Republican slaves' became 'American slaves' (Melville's irony of slaves in a republic lost); biblical 'the widow's last mite' became 'penny'; 'a door-plate for a waif' became 'nameplate for a marker'; 'that globular £100,000' became 'that vast sum'.
- **R2-fid** (convention): Source prints 'income of £100,000' and 'that globular £100,000'. Brief: 'Measures, numbers and dates: keep them as printed.' Candidate spells out 'a hundred thousand pounds' twice; 'globular' is attached to the printed figure (the round zeros).
- **R2-acc** (allusion): 'Brother Jonathan' (the period personification of the United States) is paired with John Bull; John Bull is still widely known, Brother Jonathan is not, and the Texas line loses its point without it. Brief gloss added.

### 89.14  `16f3cef625fe3aa0` → `fe8539b17c97ce89`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 89.15  `c74ab453d745628f` → `1b7124daae122aa0`
- **R1** (technical): 'by way of waifing it' became 'marking it'.
- **R4-mod** (unmodernized): Anaphoric rhetorical questions kept for voice; elliptical questions expanded to full modern form and 'waifing' glossed briefly.

### 89.16  `86b9632a88210bdd` → `395673d1db0301a1`
- **R1** (meaning): 'the ostentatious smuggling verbalists' became 'pompous pedantic quibblers', losing 'smuggling' (word-mongers who pass off others' thoughts).
- **R4-mod** (unmodernized): Anaphora of 'What ... but Loose-Fish?' kept for voice; archaic 'ostentatious smuggling verbalists' line recast in modern syntax and vocabulary.

### 90.1  `96c4e6cc3dc27c93` → `7a624536689c5381`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 90.2  `f360c13619ea69b0` → `6097fc1815cffaa8`
- **R1** (omission,meaning): 'a sort of policeman or beadle' became 'official'; 'fobbing his perquisites' became 'pocketing his privileges' (perquisites are perks, not privileges).
- **R2-acc** (readability): Dangling modifier: 'Holding the office directly from the crown, I believe, all the royal revenues ... become his' makes the revenues the office-holder.

### 90.3  `da866d682896837e` → `cd484dadaa8e6827`
- **R1** (meaning): 'rolled high up on their eely legs' became 'weather-beaten legs'.
- **R2-fid** (convention): Source prints 'a good £150'; numbers are kept as printed. Candidate spells out 'a hundred and fifty pounds'.

### 90.12  `5b9b0861c307e366` → `304ca42381304f1a`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 90.16  `54b6c5fef8a43b07` → `24b67dd016ccde28`
- **R2-fid** (voice): Source: 'To which my Lord Duke in substance replied' and 'if for the future he (the reverend gentleman) would decline meddling' — the mock-deferential 'my Lord Duke' and the pedantic parenthetical, which echo the letter's own officialese, are both dropped.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 90.17  `581811c94360f093` → `3dc3338657df9a3f`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 90.18  `4e668530aa0bf191` → `276238a6305048e8`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 90.19  `3ee7bc72dcdb6686` → `64f67d5d55a94c26`
- **R2-fid** (meaning): Source: 'was largely used in ladies' bodices'. Candidate substitutes 'corsets', a different garment; 'bodices' is current English and needs no change.

### 90.20  `f4656687c4a7efe9` → `289e06e406ca3a81`
- **R1** (unmodernized,meaning): 'I know not that' left archaic; 'some presumed congeniality' became 'resemblance'.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.
- **R4-acc** (voice): 'may possibly rest, humorously, on some supposed kinship' — stacked commas make the adverb float and the sentence has to be reread (source sense: 'may possibly be humorously grounded upon some presumed congeniality').

### 91.1  `d5e04902c7071b8c` → `70edfb00cb3d8f3c`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 91.2  `a752bb6635e8296f` → `c579be0877a47e8c`
- **R1** (technical,voice): 'those drugged whales we tickled the other day' became 'dragged whales we stabbed', losing both the term and Stubb's joking understatement.

### 91.3  `b66ba001eb5a2380` → `3e27f8742dcc51e8`
- **R1** (meaning): 'by no means of the nature of attar-of-rose' became 'rose-water'; attar is the oil, which is the point of the comparison.

### 91.4  `9e4dfd4583e622cb` → `c9fcae892e963f93`
- **R1** (voice,invention): The irony 'even more of a nosegay than the first' became the coinage 'stench-bouquet'.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 91.6  `cb2b60eb43e590c9` → `e8377c26cd8aecca`
- **R1** (voice,technical): Stubb's period slur 'these Crappoes of Frenchmen' / 'here's a Crappo' softened to 'Frenchmen'/'a Frenchman' (lead decision 1); 'drugged whale' twice became 'dragged'; 'boxes of tallow candles' lost 'boxes'; 'I say' dropped.
- **SWEEP-caps** (convention): Species-name capitalization follows the source paragraph (brief: 'In a paragraph you rewrite, follow the source's capitalization'): Sperm Whale

### 91.15  `783e557f3f06b60d` → `4a8068f7c155b871`
- **SWEEP-caps** (convention): Species-name capitalization follows the source paragraph (brief: 'In a paragraph you rewrite, follow the source's capitalization'): Sperm Whale

### 91.18  `39ffbb51742bb97c` → `0f4b1ff7beb169b0`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 91.19  `5b58f71429fd9788` → `4ec322c80fe53d8c`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 91.24  `03efac07a1bee2e3` → `1a7536360b61e627`
- **R1** (voice): 'he hasn't a gill in his whole carcase' became 'a drop'; the gill (a small liquid measure) is Stubb's pun on the fish.

### 91.26  `f1fd547abe6a8abf` → `25e1172cad5f0401`
- **R1** (technical): 'like so many jib-booms' became 'bowsprits'.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 91.27  `2ce7b3f285718b27` → `528434a17b2905c3`
- **R1** (omission,meaning): 'the Captain's round-house (_cabinet_ he called it)' became 'cabin' with the parenthesis dropped; 'to avoid the pest' (the plague) became 'the stench'.

### 91.29  `baa74564d50cb9ba` → `32b95c1cf64f0967`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 91.31  `a73802b759ecc962` → `6d5d3d62ea9a3241`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 91.35  `5b359c5d987e9227` → `06131f28d4b48e2e`
- **R1** (omission): 'than a St. Jago monkey' lost 'St. Jago'.

### 91.37  `b07f25ac7df33c56` → `c74602e157c630a7`
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 91.39  `af0083b49747c697` → `e4df8e0a5b0c394e`
- **R1** (voice): Stubb's slang 'I've diddled him' flattened to 'tricked'.

### 91.43  `1aa7f8cd1f380e41` → `4573b32c0abd9576`
- **R1** (voice): 'the man I've diddled' flattened to 'tricked'.

### 91.44  `1e675857969a6e40` → `b9ac6df74a76aaa4`
- **R2-acc** (unmodernized): 'his principles won't admit of his drinking' is archaic phrasing.

### 91.46  `9ab02eb5da267dd6` → `30e14b6fb37abb55`
- **R1** (omission): 'reap the fruit of his unrighteous cunning' lost the moral word 'unrighteous'.
- **R2-fid** (voice): Source: 'old Roman tiles and pottery buried in fat English loam' — 'fat' plays on the whale's fat that Stubb is digging through; 'rich English soil' loses it.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 91.47  `01b57054d7ed2ec4` → `2d8627378876bd1e`
- **R1** (voice): Ironic 'the horrible nosegay increased' became 'stench'.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 91.49  `17e2e5c95201ea0f` → `2d6491e340e2a5df`
- **R1** (hedge): 'still more, perhaps, might have been secured' lost 'perhaps'.
- **R4-mod** (unmodernized): Sentence-level modern rendering replacing near-verbatim 1851 syntax and vocabulary; all claims, images, names and numbers preserved.

### 92.0  `3e58e3dc0d92d590` → `298eaafe4b914e74`
- **R4-mod** (unmodernized): Modernized periodic syntax and phrasing ('a problem to the learned', 'but the French compound', 'Besides'); split long sentences.

### 92.1  `42f33a795bdaed6d` → `f5965a0ff3e362f6`
- **R1** (omission): 'three or four boat loads of Brandreth's pills' lost the name.
- **R2-acc** (allusion): The joke needs the reader to know Brandreth's pills were a heavily advertised patent purgative; brief accurate gloss added.

### 92.2  `70f1100a2503c169` → `076158cda7d068b1`
- **R4-mod** (unmodernized): Recast 1851 word order ('there were found in this ambergris') and 'afterwards turned out' into modern syntax.
- **R4-acc** (unmodernized): Awkward tail 'that had been embalmed in it that way' — 'in it that way' reads as a stumble aloud; the sense is simply that they were embalmed in the ambergris.

### 92.4  `6eb6f8cfd8b6d9df` → `a61b4287c553c6d2`
- **R2-fid** (meaning): Source: 'But there is another thing to rebut ... Now how did this odious stigma originate?' A stigma is a mark of disgrace, not a rumor, and 'address' weakens 'rebut'.
- **R4-mod** (unmodernized): Modernized 'owing to my anxiety to repel', 'slanderous aspersion', passive inversion and 'slatternly'.

### 92.5  `da771f3d90267d92` → `06808fd1bf830cca`
- **R1** (omission,hedge): 'the foundations of a Lying-in Hospital' became 'a hospital' (the maternity-hospital irony is lost); 'somewhat similar' lost 'somewhat'.

### 92.6  `74eff6c737495457` → `b8f0feecc638b385`
- **SWEEP-caps** (convention): Species-name capitalization follows the source paragraph (brief: 'In a paragraph you rewrite, follow the source's capitalization'): Sperm Whale

### 93.1  `97601fa8f0755c80` → `422d08cf7e83167a`
- **R2-fid** (meaning): Source: 'the little negro Pippin by nick-name, Pip by abbreviation' — Pippin is his nickname and Pip is short for it. Candidate 'the little negro Pippin — Pip, for short' presents Pippin as his name.

### 93.2  `75aee4587718a781` → `d3e162c0daab5134`
- **R1** (voice,omission): Period term 'his tribe; a tribe, which' softened to 'his people' (lead decision 1); 'driven in one eccentric span' became 'wild harness'; 'with his gay ha-ha!' became 'gay laughter'.
- **R2-fid** (meaning,voice): Open question answered: source 'like a black pony and a white one, of equal developments, though of dissimilar colour, driven in one eccentric span'. A span is a pair of horses harnessed together; 'eccentric' is odd, unconventional (the unmatched colors), not off-center harnessing. Candidate 'made a matched pair ... driven in one oddly matched team' contradicts itself ('matched'/'oddly matched') and turns the pair into a 'team'. Keep Melville's word.
- **R2-acc** (readability): 'made a matched pair, like a black pony and a white one ... driven together as one eccentric pair' repeats 'pair' and the comma placement blurs the comparison.

### 93.5  `dca47024e0ca2d13` → `12c03968f8f99699`
- **R1** (technical,corruption): 'came all foaming up to the chocks of the boat' became 'the bow'; the sentence 'And in such a way that part of the slack whale-line ... he carried it overboard' is ungrammatical.

### 93.6  `590c332c38ca559b` → `bcbed1e60384393c`
- **R2-fid** (meaning): Source: 'He hated Pip for a poltroon.' Candidate 'despised' changes the emotion; 'hated' is current English.

### 93.8  `7d657f989fe8156d` → `c41e207a443d8c77`
- **R2-acc** (unmodernized): 'Hereby perhaps Stubb indirectly hinted' — 'Hereby' is archaic.

### 93.9  `11bcf5181cdda8de` → `bc45d50b250788ce`
- **R1** (invention,meaning): 'like a hurried traveller's trunk' gained invented 'forgotten'; 'the whale was winged' became 'struck'.
- **R2-fid** (voice): Source: 'Pip's ebon head showed like a head of cloves' — 'ebon' (black) picks up the 'lustrous ebony' image of 93.2; 'dark' generalizes it.
- **R2-acc** (readability): 'poor Pip turned his crisp, curling, black head to the sun — another lonely castaway, though the loftiest and the brightest' reads as if Pip were the loftiest and brightest; the appositive belongs to the sun. 'itself' removes the ambiguity without adding content.

### 93.10  `adfee25c8f0e29f9` → `53e7e461cad53df5`
- **R1** (omission): 'ride in a spring-carriage ashore' lost 'spring-'; 'mark how closely they hug their ship' lost 'closely'.

### 93.13  `dc94434bc068be72` → `238afde4fc9d207f`
- **R2-acc** (unmodernized): 'what like abandonment befell myself' uses archaic 'like' (= similar) and reflexive 'myself'.

### 94.0  `360408cd063d303f` → `f0eb50381febfcde`
- **R4-mod** (unmodernized): Recast 1851 passive/periodic sentence ('so dearly purchased, was duly brought', 'regularly gone through').

### 94.2  `669e1f4e89ce05f4` → `74dac10fc7643dde`
- **R1** (omission): Source "a large Constantine's bath of it" lost the Constantine allusion ("a large bath").
- **R4-mod** (unmodernized): Modernized 'concreted', 'unctuous', 'molifier', 'serpentine and spiralise' and the exclamation series.

### 94.3  `023dd306bec72ae3` → `fca17ba1262513b9`
- **R1** (omission): Source "the old Paracelsan superstition" became "the old superstition"; the Paracelsus attribution was dropped.

### 94.4  `23d9bf1443cd04c1` → `f05867f4cd107efe`
- **R2-acc** (unmodernized): 'Nay' is leftover archaic diction in narration; 'No,' carries the same escalation.

### 94.5  `fd24806cbb6c93fe` → `6f4963c1aa406f4f`
- **R1** (omission,voice): Source "In thoughts of the visions of the night" (echo of Job 4:13) was cut to "In visions of the night".
- **R4-mod** (unmodernized): Modernized 'Would that', 'conceit of attainable felicity', 'the fancy' and split the periodic sentence; kept the Job phrase 'In thoughts of the visions of the night' as an allusion.

### 94.7  `ce9b7e78080ff6af` → `dd092c0698b950fc`
- **R1** (omission): Source "blocks of Berkshire marble" became "blocks of marble".
- **R2-fid** (technical): Source "the white-horse is first cut into portable oblongs ere going to the mincer" became "portable blocks", losing the oblong shape and producing "blocks ... blocks of Berkshire marble".
- **R4-mod** (unmodernized): Modernized 'First comes ... so called', 'ere going to the mincer' and 'portable oblongs'.

### 94.8  `412e7f0aa262d7f4` → `a4ad35c78aa46010`
- **R4-mod** (unmodernized): Modernized 'bestowed upon', 'participating ... in its unctuousness', 'As its name imports', 'bestreaked', 'Spite of reason', 'conceive'.

### 94.9  `6db1649753b8427c` → `42bd5c556653c026`
- **R2-acc** (unmodernized): 'and so is the nature of the substance' reads as if the nature were also a name; reader has to reread. Minimal rewording keeps the claim that the substance is as peculiar to whaling as its name.

### 94.10  `9d07ddaa1c3cf413` → `5a3ea6162d64195c`
- **R4-mod** (unmodernized): Modernized 'so called', 'properly belonging to', 'incidentally used' and 'designates'.

### 94.11  `eba75f97f4da9dae` → `b628481e4764fa00`
- **R1** (technical,voice): Source "tendinous stuff" became "tough material" (the tendon composition lost); "by nameless blandishments, as of magic, allures" was flattened to "by nameless magic, attracts".

### 94.12  `8c2aeec0a4e39ce6` → `1dc4f62fcfac2331`
- **R2-fid** (technical,convention): Source "similar to a frigate's boarding-weapon" became "a warship's" (the specific ship type dropped for no gain); source "one of his own toes, or one of his assistants'" (plural possessive) became the ungrammatical singular "one of his assistant's". Repair editor noted the latter but left it.

### 95.1  `bbb88164349d1658` → `4aa9ec74b46a55c3`
- **R1** (omission,voice): Source "as if he were a grenadier" became "a soldier"; "the full canonicals of his calling" became "ceremonial garments", losing the clerical vestment sense the chapter's cassock/archbishop joke depends on.
- **R2-acc** (unmodernized): 'From time immemorial to all his order' is inverted and hard to parse aloud; reordered without changing content.

### 95.2  `1c7cea552bf561c3` → `86dab848e52f48b2`
- **R1** (meaning): Source "fast as the sheets from a rapt orator's desk" became "a hurried speaker's desk"; "rapt" means carried away, not hurried. "archbishopric" restored.

### 96.1  `65a4d2fa678a834f` → `a4932fda2821af66`
- **R2-fid** (technical,voice): Try-works construction: source "ponderous knees of iron bracing it on all sides, and screwing it down to the timbers" became "bolting it down" (fastening changed); "confidential communications are carried on, over the iron lips" became "iron rims", losing the lips image that goes with the whispered confidences.
- **R4-mod** (unmodernized): Recast 1851 descriptive syntax ('are planted', 'of a peculiar strength, fitted to sustain', 'two in number', 'many confidential communications are carried on') into modern sentences.

### 96.2  `4e90b3a4644987b0` → `f4232ef922ce3a9e`
- **R4-mod** (unmodernized): Replaced dangling 1851 participle construction, 'prevented from communicating itself' and 'kept replenished' with modern syntax.
- **R4-fid** (technical): 'By a tunnel inserted at the rear': Melville's 'tunnel' is the period word for a funnel (water is poured in to replenish the reservoir); 'pipe' blurs the device.

### 96.4  `e67f748c461ee610` → `6bbea2ce13d912a5`
- **R1** (omission,voice): Source "Like a plethoric burning martyr, or a self-consuming misanthrope" was collapsed to "Like a self-consuming martyr"; the plethoric martyr and the misanthrope were dropped.
- **R4-mod** (unmodernized): Modernized 'Here be it said', 'staple fuel', 'considerable of its unctuous properties', 'Would that', 'Hindoo', 'funereal pyres'; split the long closing sentences.

### 96.5  `c2cb1705936a35db` → `ddb6da7d8d7188f6`
- **R1** (omission,meaning): Source "the pitch and sulphur-freighted brigs of the bold Hydriote, Canaris" became "fire-ships of the bold Greek hero Canaris": "brigs" and "Hydriote" (man of Hydra) replaced by an invented "hero".
- **R4-mod** (unmodernized): Modernized 'We were clear from the carcase', 'forked forth', 'issuing from', 'bore down upon' and the periodic Canaris sentence.

### 96.6  `06d7b36a24e6e6a2` → `2d6b478e6b2219e4`
- **R1** (voice,meaning): Source "Tartarean shapes" (of Tartarus) flattened to "hellish"; "tawny features" altered to "swarthy".
- **R2-fid** (meaning,voice): Softened period language (lead decision 1 / hard rule 4): source "as their uncivilized laughter forked upwards out of them" became "their wild laughter". Also "scornfully champed the white bone in her mouth" became "bit", losing the champing (chewing at a bit) image.
- **R4-mod** (unmodernized): Modernized the scene-setting sentences ('now afforded', 'Standing on this were', 'Here lounged the watch', 'capricious emblazonings') while keeping the rhythm and every image of the long closing sentence.
- **R4-fid** (voice,meaning): Softened period language: source 'their uncivilized laughter' became 'their wild laughter' (Lead decision 1 / hard rule 4). Also 'yet steadfastly shot her red hell' lost 'steadfastly' ('and still kept driving').

### 96.8  `564747532b119a66` → `ca2750e4b40382c5`
- **R2-fid** (technical,invention): Source "the fatal contingency of being brought by the lee" became "caught by the lee"; "brought by the lee" is the nautical term (wind swinging round onto the lee quarter, risking an accidental gybe) and should stay. Source "In an instant I faced back" became "whirled back around", an added flourish.
- **R4-mod** (unmodernized): Modernized 'Starting from', 'smote', 'spite of all this', 'it seemed but a minute', 'Uppermost was the impression', 'crazy conceit', 'thought I', 'Lo!', 'fronting' and the verbless closing exclamation.

### 96.9  `0ffec265fe540baa` → `8ed4e1322a24bf5c`
- **R1** (unmodernized,voice): Negated imperatives left inverted ("Turn not your back", "Believe not"); source "in far other, at least gentler, relief" became "light", losing the sculptural image. Opening warning kept with its phrase "in the face of the fire" and its "O man!" apostrophe.

### 96.10  `d953531e3be41f69` → `0bef40bbd13ffd64`
- **R1** (voice): Source "cannot be true—not true, or undeveloped" lost its insistent repetition ("cannot be true, or is undeveloped").
- **R2-acc** (unmodernized): 'poor devils all of sick men' is a garden-path phrase for a modern reader/listener; punctuation and 'of them' clarify.

### 96.11  `b222f0fd387dc1d8` → `df16468832cdec79`
- **R1** (unmodernized): Inverted archaic imperative "Give not yourself up" left in place.
- **R2-fid** (convention): Source quotes Proverbs 21:16 as scripture: "the man that wandereth out of the way of understanding shall remain ... in the congregation of the dead." Lead decision 8 keeps verbatim scripture quotations in their archaic form; the candidate modernized the quoted verb to "wanders". The surrounding narration ("Do not give yourself up ... invert you") is correctly modernized.
- **R4-mod** (unmodernized): Modernized Ishmael's own 'Give not thyself up ... lest it invert thee' and the 'alike ... and' construction; Solomon quotation kept verbatim (decision 8); italic 'i.e.' rendered without underscores.

### 97.0  `04ca5e79b464c798` → `d547b09ae14b8e75`
- **R1** (voice): Source "triangular oaken vaults" became "bunks", breaking the shrine-and-tomb image of "canonized kings and counsellors" and "chiselled muteness".
- **R4-mod** (unmodernized): Replaced 1851 conditional inversion 'Had you descended' and 'a chiselled muteness' phrasing with modern syntax.

### 97.2  `2c075726123c3189` → `1b43a7083fab015b`
- **R2-acc** (unmodernized): 'but' in the sense 'only' next to 'though' makes the aside hard to parse aloud.

### 98.0  `c3687f2d2b5addb4` → `1c9cc143fbbc4f79`
- **R4-mod** (unmodernized): Undid inverted opening 'Already has it been related', 'descried', 'surtout', 'rehearsing', 'striking them down' and 'profundities'; split the long periodic sentence.

### 98.1  `478b09da94ddaca7` → `4cd8b38caa80d26f`
- **R1** (meaning): Source "_ex officio_, every sailor is a cooper" rendered "by necessity"; ex officio means by virtue of office.

### 98.2  `c81196d48eb0c999` → `842526a274ccc43d`
- **R4-mod** (unmodernized): Modernized 'At length', 'This done' and 'hermetically closed' phrasing.

### 98.3  `cf446ebecaebd471` → `7cea346748d95590`
- **R2-acc** (unmodernized): Sentence fragment beginning 'While' sounds unfinished when read aloud.

### 98.5  `f10007651b1c448f` → `7460fa6069de8eee`
- **R1** (unmodernized,meaning): Archaic "They know not" left; "little short of audacity" softened to "rude".

### 98.6  `113c0f5fff170852` → `e2665f21550c78f8`
- **R2-acc** (unmodernized): Archaic imperative 'mark'; brief renders these asides in modern form.

### 98.7  `7a968a1890f9ed67` → `08b990e7ac852a37`
- **R2-fid** (voice,technical): Source "Oh! the metempsychosis!" became "Oh, the transmigration of souls!": the term itself was replaced rather than kept with a brief gloss, as the brief's term rule prefers.
- **R2-acc** (unmodernized): Verb-final inversion 'two thousand years ago died' is leftover archaic syntax and awkward aloud.

### 99.0  `ba6c8ba12c237858` → `f6e1b2d5b973176c`
- **R2-acc** (corruption): Broken syntax: 'his gaze fastened on the pointed needle in the compass, that glance shot like a javelin' is two clauses spliced with a comma; reader must reread. Adding 'with' restores the construction.

### 99.1  `d5af2251fce46184` → `0197252110714e34`
- **R2-fid** (voice): Source "to interpret for himself in some monomaniac way" became "obsessive way"; "monomaniac" is Melville's signature term for Ahab (kept in 96.6 "monomaniac commander") and is readable.
- **R4-mod** (unmodernized): Modernized 'else all things are little worth', 'but an empty cipher' and the participial opening.

### 99.2  `295ee45498bdf81b` → `f2818f8c65fc4867`
- **R1** (omission): Source "the head-waters of many a Pactolus flows" became "many a golden river"; the Pactolus allusion was dropped (now kept with a brief gloss).
- **R2-acc** (unmodernized): 'Nor, though ... — nevertheless, every sunrise found' is an anacoluthon ('Nor' never gets its verb); reader has to reread. 'And though ... nevertheless' keeps the same content and emphasis.
- **R4-mod** (unmodernized): Modernized 'whence', 'amidst', the 'Nor, though ... nevertheless' construction and 'wanton'; kept the Pactolus gloss.
- **R4-acc** (meaning): 'ruthless hands passed it every hour' can be read as hands handing the coin around; the point is that ruthless hands passed by it. Clarify the verb so listeners do not reread.

### 99.4  `8a4421067fd4a33a` → `d7a2c93c7a51217f`
- **R1** (omission): Source "a segment of the partitioned zodiac" lost "partitioned"; "cabalistics" rendered "mystic symbols" is kept.
- **R2-fid** (convention): Source "on the third a crowing cock; while arching over all was a segment of the partitioned zodiac" is one sentence; the candidate split it, leaving the fragment "While arching over all was a segment ...". Content complete (three summits, flame, tower, cock, partitioned zodiac, cabalistics, keystone sun at Libra).
- **R4-mod** (unmodernized): Modernized 'It so chanced', 'a most wealthy example', 'unwaning clime', 'Zoned by those letters' and 'cabalistics'.

### 99.6  `e629269d632b8c1f` → `320e38fef25ad8d3`
- **R4-mod** (unmodernized): Modernized Ahab's grammar ('Methinks', 'but mirrors back', 'aye', 'but six months before', ''tis fit') while keeping his cadence, repetitions and imagery.

### 99.7  `e0078a35c7ae7793` → `e789be7ef1f64b40`
- **R2-fid** (meaning): Source "three mighty, heaven-abiding peaks" (dwelling in heaven) became "heaven-reaching", which changes the image from abiding to aspiring; Starbuck's Trinity reading depends on the peaks being heaven's own.
- **R4-mod** (unmodernized): Modernized Starbuck's 'mouldings', 'marked the coin inspectingly', 'girds us round', 'would fain' and 'I will quit it'.
- **R4-fid** (hedge): 'lest Truth shake me falsely' is ambiguous; 'shakes me into falsehood' resolves it to one reading. Render as literally as reads naturally (hard rule 5).

### 99.8  `81c198524b73218b` → `448beb2f6101ad19`
- **R1** (omission,voice): Stubb's catalog and jokes thinned: "moidores" became "gold coins"; "old Bowditch in his Epitome" became "in his book"; "raised with Daboll's arithmetic" lost Daboll; the "Jimimi! here's Gemini" pun became "good Lord"; "so killing wonderful" became "extraordinarily wonderful"; "what my almanac below calls ditto" flattened.

### 99.10  `a8aa4a7fda2351ed` → `3f5947ab3a8879ac`
- **R1** (technical): Source "He luffs up before the doubloon" (a sailing term: brings the ship's head up into the wind, stopping) became "He comes up".
- **R2-fid** (unmodernized,convention): Stubb's subjunctives "if it be really wise ... if it be really foolish" were left in 1851 form, while the repair modernized the Manxman's "If the White Whale be raised" (99.11). "Prick ears, and listen!" rendered "Prick up ears" reads as a slip.

### 99.11  `21fae278b0f81873` → `fcd91805b6a84fff`
- **R1** (unmodernized): Archaic "think of thee" and subjunctive "If the White Whale be raised" left in the Manxman's speech.
- **R2-acc** (unmodernized): 'two-score' is archaic; the Manxman keeps plenty of flavor elsewhere ('I've studied signs and know their marks', 'Ship, old ship!').

### 99.12  `6ed2d365db6ebcfe` → `4a9980765f6bf883`
- **R1** (omission,voice): Source "as the old women talk Surgeon's Astronomy in the back country" became "talk astrology in the backwoods"; the named folk practice (zodiac signs ruling parts of the body) was lost.

### 100.2  `737f0f773e477369` → `244d43142eafb2a6`
- **R4-mod** (unmodernized): Modernized 'So cried Ahab', 'bearing down under the stern', 'or thereabouts', 'roundabout' and 'broidered'.

### 100.4  `c779285e7f984f4b` → `ac26dab2b9014e02`
- **R1** (unmodernized): Inverted archaic question "See you this?" left.
- **R4-mod** (unmodernized): Modernized 'See you this?' and the participial 'withdrawing it from the folds'.
- **R4-acc** (meaning): 'He pulled it out' has no antecedent (previous paragraph is just the hail), so the reader must reread to learn 'it' is the arm. Reorder so the object is named before the pronoun.

### 100.6  `099edfa5ac44f8a1` → `85007f46970aa3aa`
- **R1** (omission): Source "abjectly reduced" lost "abjectly"; "unsupplied with the kindly invention" became "lacking in the needed device".
- **R2-fid** (technical): Source "then instantaneously drop it half way down to the kelson" became "the keel"; the kelson (keelson) is the internal timber above the keel, a different member. Use the modern spelling "keelson".
- **R4-mod** (unmodernized): Modernized 'without quitting his little craft', 'presented itself', 'contrivance peculiar to the Pequod', 'unsupplied with the kindly invention' and 'abjectly reduced'.

### 100.7  `69813f70cd1ba5a0` → `1ce3ec8a14023c77`
- **R1** (meaning,voice): Period wording softened: source "a one-legged man must be too much of a cripple to use their sea bannisters" became "a one-legged man would find their sea-banisters useless" (hard rule 4).
- **R4-mod** (unmodernized): Modernized 'It has before been hinted', 'untoward circumstance that befell him', 'cleets', 'bethink them' and 'bannisters'.

### 100.8  `963aefdc7c00d1b3` → `e44b794bb797c0cf`
- **R1** (voice): Source "cried out in his walrus way" became "in his hearty way"; the walrus image was lost.

### 100.9  `369dcb65ae5e1211` → `98b9c5c77fc2a215`
- **R2-acc** (unmodernized): 'the Line' recurs through this chapter (100.13, 100.23, 100.30) and is not glossed in ch100; a first-time reader may not know it means the equator. Same gloss the edition already uses elsewhere ('the Line being the equator').

### 100.13  `1a544cd99ff335c7` → `50fcb45d0d15f2e4`
- **R1** (voice): Source "all crows' feet and wrinkles" became "all wrinkled and creased".
- **R4-mod** (unmodernized): Modernized 'I was ignorant of', 'could only trim dish', 'Presently up breaches' inversion.

### 100.17  `222c7ce38efde57a` → `dcbd6ef26bc14a5a`
- **R1** (technical): Source "snapping furiously at my fast-line" became "my line"; fast-line (the line fastened to the harpooned whale) sets up Ahab's "free the fast-fish" reply.

### 100.19  `83a973b0d987997b` → `b66da2373720bc91`
- **R1** (omission): Source "down comes the tail like a Lima tower" lost "Lima" (Melville's recurring earthquake-toppled towers of Lima).

### 100.20  `b025e1603fa1afde` → `0a74aca4d331dfae`
- **R1** (omission,voice): Source "to denote his gentlemanly rank on board" lost "gentlemanly" (the joke of the "professional gentleman" in a sailor's frock); "woollen frock or shirt" cut to "shirt".
- **R4-mod** (unmodernized): Modernized 'thus familiarly pointed out', 'nothing specific visible, to denote', 'straightway went on to do his captain's bidding'.

### 100.23  `bf2122320ac8201c` → `685cac04f7d7b53b`
- **R2-fid** (voice): Source "was very severe with him in the matter of diet" became "very strict". "Severe" is the running joke word, echoed by Boomer in 100.24 ("Oh, very severe! ... very severe in my diet ... very dietetically severe") and Bunger in 100.27 ("my best and severest endeavors"); the candidate breaks the echo.

### 100.24  `38764a6431bb1027` → `68e88eed933aebfe`
- **R2-fid** (voice,meaning): Source "Oh, very severe!" and "was very severe in my diet" became "strict", breaking the echo of Bunger's "severe" (see 100.23). Source "a great watcher" (one who sits up with the sick, answering Bunger's "sat up with him nights") became "a great watchman", a different sense.

### 100.26  `8c4406844158912a` → `792c9e260fca4332`
- **R1** (meaning,voice): Source "it's a sort of fits to him; fresh water throws him into the hydrophobia" became "a sort of allergy ... convulsions": anachronistic "allergy" and the hydrophobia joke (rabies, literally fear of water) lost.

### 100.27  `7fc2a9b0cbce6078` → `71b9806d1622cd2e`
- **R1** (invention): Source "that thing is against all rule" gained an invented "medical".

### 100.29  `b5affb89888c4409` → `77f5b6927c92ed26`
- **R4-mod** (unmodernized): Modernized 'now cried Ahab, who thus far had been' and 'by-play'.
- **R4-fid** (convention): 'by-play' rendered as the non-word 'side-play'; modern English 'byplay' is exact.

### 100.35  `448b388103b4388c` → `e9640694ed6af006`
- **R4-mod** (unmodernized): Modernized Bunger's 'thinks to terrify by feints', 'making believe swallow', 'in good earnest', 'a twelvemonth', 'd'ye see', 'have a mind to pawn', keeping his comic pomposity.
- **R4-fid** (voice): 'very gravely and mathematically bowing' - the comic 'mathematically' is flattened to 'precisely'.

### 100.37  `db20bbeb2fe80841` → `b0aad997f99ec933`
- **R2-acc** (unmodernized): Inverted, doubly-negative-feeling sentence that nearly every reader will reread. Reordered only; same claim.

### 100.41  `fb4ac2db8758cbae` → `f1e60d753d70f501`
- **R4-mod** (unmodernized): Recast the participial chain and 'commanded ... to stand by to lower' into modern syntax.

### 100.42  `de385609618ec399` → `ad487258baa440ad`
- **R4-mod** (unmodernized): Modernized 'In vain the English Captain hailed him' inversion and 'face set like a flint to his own'.

### 101.0  `581571928b559a20` → `4e031e2a5e05c706`
- **R2-acc** (unmodernized): Archaic subjunctive 'Be it ... recorded'; matches 'let it be set down here' at the start of the same paragraph.
- **SWEEP-caps** (convention): Species-name capitalization follows the source paragraph (brief: 'In a paragraph you rewrite, follow the source's capitalization'): Sperm Whale

### 101.1  `c5a5664ff145d909` → `f6a83512e5f7b3c6`
- **R1** (hedge): Source "and partly, I think, at their expense" lost the hedge "I think"; the claim is now stated as fact.
- **R2-acc** (corruption): Broken sentence: 'Samuel and all his sons ... and under their immediate sponsorship ... the British government was induced' has a subject with no verb. Restructured so the sons are the sponsors, no content added.
- **SWEEP-caps** (convention): Species-name capitalization follows the source paragraph (brief: 'In a paragraph you rewrite, follow the source's capitalization'): Sperm Whale

### 101.2  `12aa6687b3d9bc3e` → `96d540c7958422f9`
- **R2-fid** (convention): Source prints "All honor to the Enderbies" here (101.1 prints "Enderbys"). Lead decisions 3/7 keep personal names as each paragraph prints them; the candidate normalized to "Enderbys". Lead may instead rule plural inflection is not a name spelling; flagged for decision.
- **R4-mod** (unmodernized): Modernized 'All honor to ... therefore', 'exists to the present day' and 'doubtless ... must long ago have'.

### 101.3  `ee765494e6a602d9` → `f76c93b753bd4cd5`
- **R1** (technical,voice): Whaling term "gam" (a social visit between whale-ships) replaced by "sociable visit"; the second "fine gam I had" became "fine time".
- **R4-mod** (unmodernized): Modernized 'minds me of', 'a very fast sailer', 'they were all trumps', 'at the rate of ten gallons the hour', 'tars', 'by and by', 'forecastle scuttle', and split the long run-on sentences.
- **R4-fid** (voice): 'Flip? ... we flipped it at the rate of ten gallons the hour' - the flip/flipped pun is lost in 'we put it away'.

### 101.4  `f77cfc564663347a` → `eade01b11caf84b6`
- **R1** (meaning,omission,technical): Source "the bread contained the only fresh fare they had" became "fresh life" (an interpretive substitution); "dromedary beef" became "camel-beef"; "from truck to helm" (masthead cap to helm) became "top to bottom"; "his own live parchment boilers" became "his own live hide" and "the cook's boilers" became "pots", losing the boilers pun; "symmetrically globular" had become "round".
- **R2-acc** (unmodernized): 'anti-scorbutic' is a medical term most readers won't know and it carries the joke; brief accurate gloss.

### 101.5  `f5fbc7f6137eef77` → `c65c9c841cb8c04f`
- **R1** (unmodernized): Archaic "think you" (source "think ye") left.

### 101.7  `b7c56d0380fc2dae` → `24208073448fb34a`
- **R2-acc** (unmodernized): Archaic 'wherefore'.

### 101.8  `b80bbf3ac1179cef` → `b128926bd158f911`
- **R1** (technical): Units of the provisions list altered: "2,800 firkins of butter" became "tubs"; "550 ankers of Geneva" became "casks of Geneva gin"; "inferior article" was acceptable. Numbers checked and all exact.
- **R4-mod** (unmodernized): Transcribed provision list: spelled out 'lbs.' as 'pounds' for modern readers; items, figures, measures and Melville's aside kept, with the reviewers' brief glosses of firkins and ankers.

### 101.9  `71de460833b2e19a` → `1a4c87642137b6a0`
- **R1** (meaning): Source "whole pipes, barrels, quarts, and gills" became "barrels, hogsheads, quarts, and gills": "pipes" replaced by "hogsheads" and the order changed.
- **R4-mod** (unmodernized): Modernized 'parchingly dry in the reading; not so in the present case'.

### 101.10  `20afe9f8e50080e0` → `3d5487c79e16ea79`
- **R2-fid** (omission): Source "the probable quantity of stock-fish, etc., consumed by every Low Dutch harpooneer" lost "etc.", narrowing the supplementary tables to stock-fish alone.
- **R4-mod** (unmodernized): Modernized 'studious digesting', 'incidentally suggested to me', 'touching the probable quantity', 'I impute it', 'unctuous natures', 'Esquimaux', 'pledge each other in bumpers of train oil'.

### 101.11  `940a30b83bb61c24` → `36b26099393cbf7e`
- **R1** (technical): Source "that 550 ankers of gin" became "that 550 casks"; "boozy in his boat" flattened to "drunk"; restored for consistency with 101.8.
- **R4-mod** (unmodernized): Modernized 'prosecuted', 'say, and reckoning', 'exclusive of', 'fuddled as one might fancy', 'be it remembered', 'grievous loss might ensue'; untangled the long periodic calculation into separate sentences.

### 101.12  `c45be27b0a48c808` → `aa15e49db27f8307`
- **R4-mod** (unmodernized): Modernized 'But no more', 'high livers', 'For, say they'.

### 102.0  `afa906c6d134585a` → `d6215de57c0c380b`
- **R1** (omission,voice,unmodernized): The undressing conceit is cut: 'untagging the points of his hose, unbuckling his garters, and casting loose the hooks and the eyes of the joints of his innermost bones' reduced to 'unhooking his innermost bones'; 'in his ultimatum' flattened; archaic 'Hitherto', 'it behooves me' left.
- **SWEEP-caps** (convention): Species-name capitalization follows the source paragraph (brief: 'In a paragraph you rewrite, follow the source's capitalization'): Sperm Whale

### 102.1  `f2cab8924ea52e90` → `1df7b3e85d0a7767`
- **R1** (omission,unmodernized): Final clause dropped: 'and belike of the tallow-vats, dairy-rooms, butteries, and cheeseries in his bowels'; 'sleepers' dropped from the list of timbers; 'A veritable witness have you hitherto been' and 'have a care' left archaic.

### 102.2  `99d4c233c8e744a7` → `35a61bacca03cb05`
- **R1** (technical,meaning,unmodernized): 'hoisted to the deck for his poke or bag' (the specific organ used for the sheaths) became 'for its skin'; 'Think you I let that chance go' left archaic.
- **SWEEP-caps** (convention): Species-name capitalization follows the source paragraph (brief: 'In a paragraph you rewrite, follow the source's capitalization'): Sperm Whale

### 102.3  `bfc1ca4a71f628b8` → `cfff48ed3d7bf30b`
- **R4-mod** (unmodernized): Modernized 'for that rare knowledge I am indebted', the dangling 'For being at Tranque ... when attached to' and 'retired palm villa'.

### 102.4  `afdd0bdb721c0f20` → `dcaed9e4076a041b`
- **R1** (omission,voice): 'the wonder-freighted, tribute-rendering waves' reduced to 'tribute-bearing waves'; 'barbaric vertu' (collector's curios) rendered 'barbarian art'.

### 102.5  `5c4cd8656751f78f` → `cb66e29d033eb9c4`
- **R4-mod** (unmodernized): Modernized 'Chief among these latter', 'plumage-like, tufted droopings seemed his verdant jet', 'fathom-deep enfoldings' and the periodic 'When ... then' sentence.

### 102.6  `50a74a65c6a379ee` → `3449a5d27639c7b6`
- **R1** (convention): Last sentence is a fragment beginning 'While, suspended from a bough...'; the source's single running sentence is restored. Content otherwise complete.

### 102.7  `474ffb2b2447b444` → `ce2fe5e92df5769a`
- **R1** (unmodernized,meaning,convention): Archaic syntax left: 'whereof', 'Where flows the fabric?', 'from forth the loom', 'by that weaving he is deafened, that he hears', 'without the walls' (= outside), 'Thereby have villanies been detected'; 'freshet-rushing carpet' (a flood image) changed to 'ever-rushing'; 'villanies' misspelled.

### 102.8  `828a197629ec3b66` → `9bba174cee26a02e`
- **R4-mod** (unmodernized): Modernized 'life-restless loom', 'assuming greener, fresher verdure', 'wived' and 'begat him', keeping the weaving imagery and the Life/Death chiasmus.

### 102.9  `d9f4d51bc299f953` → `ba558045476a5fcc`
- **R2-fid** (voice,convention): Source 'regard a chapel as an object of vertu' picks up 102.4's 'barbaric vertu', which the candidate now renders 'curios'. 'object of art' loses the collector's-piece joke and the echo; align with 102.4.
- **R4-mod** (unmodernized): Modernized the inverted clauses ('saw the skull an altar', 'more I marvelled', 'To and fro I paced'), 'object of vertu', 'naught was there but bones'.

### 102.10  `edc85d76ca76e796` → `49074a411b9c258b`
- **R2-acc** (unmodernized): Priests' outburst uses archaic 'How now!' and inverted 'Dare you measure this our god!'; reads as leftover 1851 grammar in otherwise modern dialogue.

### 102.11  `7f5b51cc5b20f948` → `2c2505a023544104`
- **R1** (meaning,unmodernized): The quoted museum label 'a Greenland or River Whale' was changed to 'Right Whale'; 'be it recorded' left archaic.
- **SWEEP-caps** (convention): Species-name capitalization follows the source paragraph (brief: 'In a paragraph you rewrite, follow the source's capitalization'): Sperm Whale

### 102.12  `8a6099faaad7d4d3` → `b69e2a5298804ec6`
- **R1** (technical,omission): 'the echo in the hollow of his cerebellum' changed to 'brain-case'; 'lord of the seignories of those parts' reduced to 'lord of those territories' (the feudal title is the joke's point).

### 102.13  `e20c7eac6ea0f39c` → `e54d7966fd925e43`
- **R4-mod** (unmodernized): Modernized 'I shall now proceed to set down', 'as in my wild wanderings', 'crowded for space', 'did not trouble myself', 'congenial admeasurement'.

### 103.0  `9f8ecb18cb93d64f` → `ceb9e77bda6d93aa`
- **R2-acc** (unmodernized): 'touching the living bulk' and 'we are briefly to exhibit' are archaic constructions.
- **R4-mod** (unmodernized): Modernized 'lay before you a particular, plain statement, touching' and 'whose skeleton we are briefly to exhibit'.

### 103.1  `6ac118b4cba307f7` → `b8a41b2e56dbfcb0`
- **SWEEP-caps** (convention): Species-name capitalization follows the source paragraph (brief: 'In a paragraph you rewrite, follow the source's capitalization'): Sperm Whale

### 103.2  `b44ff0f8d0f4b4bf` → `5939f9cc308ed702`
- **R2-acc** (voice): 'to make him at all budge' is inverted and trips the reader and listener.

### 103.3  `b23e59ecad8c1bfa` → `cccbd21b5eb936ad`
- **R4-mod** (unmodernized): Modernized 'divers other parts', 'unobstructed bones', 'embraces so very large a proportion', the chain of 'as' clauses, and 'gain a complete notion'.

### 103.4  `dd29359ae5478bc7` → `ffee206489b4cbd7`
- **SWEEP-caps** (convention): Species-name capitalization follows the source paragraph (brief: 'In a paragraph you rewrite, follow the source's capitalization'): Sperm Whale

### 103.5  `2a694d17ae4e488a` → `0fc200f17a5ebd1b`
- **R4-mod** (unmodernized): Modernized 'not a little resembled', 'new-laid upon the stocks', 'the keel is otherwise, for the time, but'.

### 103.6  `e8fc22d28e3e3bf6` → `095fed0e507100d7`
- **R4-mod** (unmodernized): Modernized 'to begin from the neck', 'each successively longer', 'bore a seemly correspondence', 'beams whereon to lay'.

### 103.7  `2124ff5755647eb5` → `5761338ddc45db2d`
- **R2-acc** (unmodernized,voice): 'could not but be struck', 'measured but little more', 'I saw but a few' are archaic; 'for some distance where I now saw only a naked spine, all that had been once wrapped round' has to be reread to parse.
- **R4-mod** (unmodernized): Modernized 'could not but be struck anew with the circumstance', 'mould of his invested form', 'measured but little more', 'conveyed half of the true notion', 'for some way', 'Still more, for the ample fins'.

### 103.8  `1d50969ac457b009` → `eacb13b59f863091`
- **R2-fid** (omission): Source 'to try to comprehend aright this wondrous whale': 'aright' (correctly) dropped, weakening the claim that the skeleton gives a wrong idea.
- **R2-acc** (unmodernized): Inverted 'thought I'.

### 103.9  `993ea9a6305951ba` → `dd35172277c8725d`
- **R2-acc** (voice): 'But now it's done' is missing 'that'; Pompey's Pillar is an allusion many first-time readers will not know. Brief accurate gloss: the ancient Roman column at Alexandria.

### 103.10  `e073540cbeaa266b` → `6bbb14f6229b76af`
- **R4-mod** (unmodernized): Modernized 'forty and odd', 'in width something less than', 'cannibal urchins', 'Thus we see how that'.

### 104.0  `47fa1195d2021fe8` → `3d6c621edac1c533`
- **R1** (meaning,technical): 'Would you, you could not compress him' (= even if you wanted to) became 'Would you could not compress him', which is ungrammatical and reverses the sense; 'the subterranean orlop-deck of a line-of-battle-ship' reduced to 'the lowest deck of a warship'; 'imperial folio' (a book size) flattened.

### 104.1  `f812f79e77d8c9e7` → `d8b8525dffe36d1e`
- **R1** (voice,omission): The paragraph's joke is its 'portly terms'; the candidate shrinks them ('archaeological, fossil, and pre-flood' for 'archæological, fossiliferous, and antediluvian'; 'be exhaustively thorough' for 'approve myself omnisciently exhaustive'; 'seeds' for 'seminal germs'; 'grand terms'/'inflated' for 'portly terms'/'grandiloquent'), so the self-mockery no longer lands.

### 104.2  `4c16f5d5ebe6f1b3` → `c55f83ee30713f39`
- **R2-fid** (omission,unmodernized): Source 'with their outreaching comprehensiveness of sweep': 'comprehensiveness' dropped; closing 'though many there be who have tried it' left in archaic inversion.
- **R4-mod** (unmodernized): Modernized 'How, then, with me', 'chirography', 'penning my thoughts', 'outreaching comprehensiveness of sweep', 'Such, and so magnifying, is the virtue', 'many there be who have tried it'.

### 104.3  `068d9d071fd015b9` → `a5b1826b40b42e00`
- **R1** (omission): 'the connecting, or at any rate intercepted links' lost its qualification 'or at any rate intercepted'; 'antichronical' (out of time) flattened to 'ancient'.
- **R2-fid** (meaning): Repair editor's open question. Source 'the connecting, or at any rate intercepted links' uses 'intercepted' in its older sense of 'lying between'; 'links caught in the middle' suggests being trapped. 'intervening' is the accurate plain rendering.

### 104.4  `3b2735cfc00fd15e` → `c4203fa052370979`
- **R1** (omission): 'pre-adamite whales' (before Adam, a biblical allusion) rendered 'pre-human'.

### 104.5  `9dd1727d8312727f` → `a1d9081e86e159c5`
- **R2-acc** (convention,unmodernized): Missing comma between coordinate adjectives 'awestruck credulous'; 'furnishes but little clue' archaic.
- **R4-mod** (unmodernized): Modernized 'bestowed upon it the name', the absolute 'some specimen bones of it being taken', the verbless sentence, 'furnishes but little clue', 'fully invested body', 'the mutations of the globe'.

### 104.6  `6ae97c465bca74ea` → `f74d918bfc8086e5`
- **R1** (omission,unmodernized): 'this antemosaic, unsourced existence' (before Moses) flattened to 'ancient, sourceless'; 'antichronical' reduced to 'ancient'; 'must needs exist' left archaic.
- **R2-acc** (voice): 'I am horror-struck at this existence, older than Moses and without a source, of the unspeakable terrors of the whale, which...' separates 'existence' from 'of the terrors' and makes 'which' ambiguous; must be reread. Reordered, no content changed.
- **R3-fix** (hedge,meaning): Accessibility restructure of the last sentence. Source: 'I am horror-struck at this antemosaic, unsourced existence of the unspeakable terrors of the whale, which, having been before all time, must needs exist after all humane ages are over.' (1) The object of horror in the source is 'this ... existence' of the terrors (their pre-Mosaic, sourceless being, with 'this' pointing back to the pedigree just described); the candidate makes the terrors themselves the object and demotes their existence to a relative clause, dropping 'this'. (2) 'must needs exist' is necessity (a deduction from 'having been before all time'); 'must surely' turns it into the speaker's confident expectation. Fix restores 'this existence' as the object and 'of necessity', keeps the reviewer's goal of not splitting 'existence' from 'of the terrors', and keeps the candidate's reading of 'which' as the terrors.

### 104.7  `7d0b053762fa4b69` → `3a6c427e565ae0ee`
- **R1** (omission,voice): 'in limestone and marl bequeathed his ancient bust' lost the bust (sculpture) image; 'pre-adamite' rendered 'pre-human'.

### 104.8  `2b35a8a03124e35c` → `b7d65f833b1013d4`
- **R1** (omission): 'in his own osseous post-diluvian reality' lost 'post-diluvian' (after the Flood).

### 104.9  `8eff0b992bb5172b` → `c8fe9cff6795738c`
- **R1** (meaning,convention): Quoted document's names changed: 'Mahomet' became 'Muhammad' and 'the Prophet Jonas' became 'Jonah' (quoted documents keep their own spelling); 'with its convex part uppermost' blurred to 'curved part'.

### 104.10  `6ad8e7be875d14ef` → `023f9ce226812ae7`
- **R1** (unmodernized): Archaic subjunctive 'if you be a Nantucketer' left.

### 105.0  `735c0e7455b2f2b6` → `d9e152773a6270ca`
- **R2-acc** (unmodernized): 'it may be fitly inquired whether ... he has not shrunk' is archaic phrasing.

### 105.1  `c2b39cdfb5cde016` → `02f6cbcfdb72dd3a`
- **R4-mod** (unmodernized): Modernized 'upon investigation we find', 'superior in magnitude', 'embracing a distinct geological period prior to man', and the inverted 'of the whales found ...' clause.

### 105.2  `7e653b2279ffbb24` → `cdefbea5d44c0da3`
- **R1** (omission): 'pre-adamite whales' rendered 'pre-human' (the Adam allusion, which the next paragraph picks up with 'since Adam's time', is lost).
- **R4-mod** (unmodernized): Modernized 'Of all the pre-adamite whales yet exhumed' inversion, 'Whereas, we have already seen, that', 'on whalemen's authority', 'near a hundred feet'.

### 105.4  `615302e3602555f2` → `1a0d8025e0b5978b`
- **R1** (omission,meaning): Dropped '(reydan-siskur, or Wrinkled Bellies)' and '(page 3)'; changed 'Cooke's naturalists' to 'Cook's' and 'Lacépède' to 'Lacepede' (names as printed in this paragraph); 'Iceland Whales' made 'Icelandic whales'.
- **R4-mod** (unmodernized): Modernized 'Assuredly', 'if we are to credit', 'embraced acres of living bulk', 'setting down ... at', 'so late as'.

### 105.5  `bbd42499c534f2b2` → `8469422c7fcc6f42`
- **R1** (omission): Argument cut: 'the cattle and other animals', 'by the relative proportions in which they are drawn, just as plainly prove', and 'the high-bred, stall-fed, prize cattle of Smithfield' all dropped.
- **R2-acc** (voice): The long sentence opens 'I cannot understand how it is that while...' and ends 'in the face of all this, I will not admit that...', so the main clause never completes; listeners lose the thread. Restructured with the same content.

### 105.6  `7f7c42ce0b758376` → `ff38cf713d17d998`
- **R1** (omission,voice): 'into the remotest secret drawers and lockers of the world' reduced to 'secret corners'; 'the more recondite Nantucketers' (learned, obscure) rendered 'more thoughtful'.

### 105.7  `68c65c6e51175647` → `9da1764f3d4889e4`
- **R1** (omission,voice): 'and scowled with their thunder-clotted brows' dropped from the buffalo image.
- **R4-mod** (unmodernized): Recast the dangling participial periodic sentence ('Comparing ... ; in such a comparison an irresistible argument would seem furnished') and 'overspread'.

### 105.8  `43bb36c287f1200e` → `85220fa645730cca`
- **R1** (omission): Dropped the parenthesis '(in whose sunset suns still rise)' and 'moccasined' ('the same number of moccasined men'), replaced by 'men on horse'.
- **R4-mod** (unmodernized): Modernized the long 'Though ... and though ... yet' periodic sentence, 'not a good lifetime', 'peremptorily forbids', 'slain', 'if need were, could be statistically stated'.

### 105.9  `9e7d498c56585054` → `598b88dba987c7ba`
- **R1** (omission,hedge): Dropped the time qualifier '(the latter part of the last century, say)', the qualification 'to a large degree', and 'schools' from 'solitaries, yokes, and pods, and schools'; 'influenced by some views to safety' turned into 'some instinct toward safety'.
- **R2-acc** (voice): 'does it seem any argument' is missing a verb for modern ears.
- **SWEEP-caps** (convention): Species-name capitalization follows the source paragraph (brief: 'In a paragraph you rewrite, follow the source's capitalization'): Sperm Whale

### 105.10  `0f0227190c78ee92` → `82cb114294c0e585`
- **R1** (voice,omission): 'hunted from the savannas and glades of the middle seas' flattened to 'hunted from the open and sheltered seas' (the land metaphor and 'middle seas' lost).

### 105.11  `2da664fe9930b849` → `683f4280a96f01ac`
- **R1** (hedge,voice): 'of little or no account' weakened to 'of little account'; 'diminished their battalions' flattened to 'reduced their numbers'.

### 105.12  `6b8dd467fbae95a0` → `360711c7af2f101c`
- **R2-fid** (meaning): Source lists 'Europe and Africa, New Holland, and all the Isles of the sea'; the candidate renames 'New Holland' to 'Australia'. Lead decision 7 note: decision 7 covers spelling variants only, never renamings; 'New Holland' stays as printed.
- **R2-acc** (voice): 'there seems no reason to doubt that if these elephants ... — if they still survive there in great numbers, how much more may the great whale outlast all hunting' is grammatically broken (the 'that' clause never completes). Reordered, same content.

### 105.13  `73f98d99bd72a484` → `7039bd72005ebea1`
- **R4-mod** (unmodernized): Modernized 'we are to consider, that from the presumed great longevity ... therefore', 'what that is, we may soon gain some idea of', 'yielding up'.

### 105.14  `b0c466dadecb9d50` → `b06c259f9cd33b43`
- **R1** (unmodernized): Archaic opening 'Wherefore, for all these things' left.

### 106.1  `1dd677082aec6cbc` → `180c537b7bca7df9`
- **R1** (meaning,hedge,omission): 'it had stake-wise smitten, and all but pierced his groin' became 'had stake-like pierced, and all but run through, his groin' — the source says it struck and all but pierced, not that it pierced; 'unimaginable' dropped from 'seemingly inexplicable, unimaginable casualty'.

### 106.2  `80e3cdc3e3c6d722` → `16012a1f50e68155`
- **R1** (omission,unmodernized): 'soft cymballing, round harvest-moons' lost 'round' and the cymbal image; 'on the contrary' dropped; the 'For, not to hint of this' construction left opaque to a modern reader.
- **R2-acc** (unmodernized): 'shall have no children ... shall be followed ... shall still fruitfully beget' uses archaic future 'shall' inside an already dense sentence.

### 106.3  `04f9413bf4a492a0` → `fd2b534ca28ac731`
- **R2-fid** (omission): Source 'which perhaps might more properly, in set way, have been disclosed before' ('in set way' = in due, formal order) and 'that ever-contracting, dropping circle' (members dropping away): both qualifiers dropped.
- **R2-acc** (unmodernized): 'as touching all Ahab's deeper nature' is archaic.

### 106.4  `da49e47490b5dc4b` → `81fb870e44db5687`
- **R1** (voice): 'the unseen, ambiguous synod in the air' (a council) flattened to 'powers in the air'.

### 106.5  `bb6d2d4831f173a8` → `1f1ea213b32bb581`
- **R1** (technical): 'studs and joists of jaw-ivory' changed to 'studs and joints' (joist = a length of timber-like stock; 108.1 turns on the same 'ivory joist').
- **SWEEP-caps** (convention): Species-name capitalization follows the source paragraph (brief: 'In a paragraph you rewrite, follow the source's capitalization'): Sperm Whale

### 107.0  `8294b1bef23bf362` → `ac070e6503f84c69`
- **R2-acc** (voice): 'But most humble though he was' is an awkward construction.

### 107.1  `3790275c598173e2` → `cb23f2e1eba79133`
- **R1** (technical,omission): 'inserting bull's eyes in the deck' (thick glass deck-lights) mistranslated as 'porthole covers'; 'wood as an auxiliary material' lost 'auxiliary'; 'more directly pertaining' lost 'directly'.

### 107.3  `c793e8a78f24ae1a` → `bd953e37139c8f41`
- **R1** (omission): 'vermillion stars' flattened to 'red stars' (the pigment named is part of the detail).

### 107.4  `d6786937853ae452` → `eaf67dc5ad12f200`
- **R1** (invention,meaning,omission): 'multum in parvo, Sheffield contrivances' replaced by an anachronistic invention, 'Swiss Army knives' (Sheffield lost); 'a sort of unintelligence' changed to 'unconsciousness'; 'even or uneven' dropped; 'Such as might have served...' left as a fragment.

### 108.1  `9cb7f865aa317b18` → `da8e6805834d3b76`
- **R1** (technical): 'filing the ivory joist for the leg' rendered 'ivory joint'; restores the joist (the stock being shaped).
- **R4-mod** (unmodernized): Stage direction modernized from 1851 participial telegraphese ('which joist is firmly fixed in the vice', 'lying about', 'Forward, the red flame ... is seen'); parenthetical layout kept, italics dropped per convention.

### 108.2  `7c503dee140461db` → `c9dd7a53374f78aa`
- **R1** (meaning,voice): Nickname changed: 'you old Smut' (the sooty blacksmith) became 'you old Blacksmith'; 'his old Mogulship' became 'his old lordship', losing the Mogul joke; 'calves of legs' garbled to 'calf-legs'.

### 108.5  `7c5673551dfc282e` → `7bad893de673d294`
- **R4-mod** (unmodernized): Modernized the deferential period idiom 'If the captain pleases, I will now mark the length'.

### 108.6  `97290d0027ef1ed4` → `fecbee88bc873083`
- **R2-acc** (unmodernized): 'About it!' (get on with it) is archaic and unclear.

### 108.8  `1f425582964787eb` → `bbbff913e7177c56`
- **R4-mod** (unmodernized): Modernized Ahab's 'No fear' and 'What's Prometheus about there?'

### 108.12  `f26a6a59f2b27342` → `4d0e3041ac51c5a3`
- **R4-mod** (unmodernized): Modernized 'Um-m', 'I do deem it now a most meaning thing', 'animated them with fire', 'This must be the remainder the Greek made the Africans of', 'pedlar'.

### 108.14  `2df49c3c7d029115` → `96ec58005a36b1ac`
- **R4-mod** (unmodernized): Modernized 'Hold', 'while Prometheus is about it', 'after a desirable pattern', 'Imprimis', 'take the order, and away'.

### 108.15  `1d7cd23530c70a11` → `c445dc167c707671`
- **R4-mod** (unmodernized): Modernized 'I should like to know' and the aside's word order; aside kept as a stage direction.

### 108.16  `0ac69675904bcb65` → `c0b11c4be254bb29`
- **R2-acc** (unmodernized): 'It is but poor architecture' archaic 'but'.

### 108.17  `ee4b493e6ca78f2c` → `a39dbdec5e36d8fe`
- **R2-acc** (unmodernized): 'one will serve my turn' is an archaic idiom.

### 108.27  `81a3d1afeddbc673` → `d9e6e3b075b732cd`
- **R1** (voice,unmodernized): The carpenter's sea-metaphor 'a dismasted man never entirely loses the feeling of his old spar' was literalized to 'dismembered man ... old limb'; 'if it be really so' left archaic.
- **R4-mod** (unmodernized): Modernized 'Truly, sir, I begin to understand somewhat', 'on that score', 'how that', 'if it be really so'.

### 108.28  `095ae866a272321e` → `f9653f0ee25b6490`
- **R2-acc** (convention): Semicolon after 'Where you feel tingling life' breaks a subordinate clause from its main clause.
- **R4-mod** (unmodernized): Modernized Ahab's 'thy live leg', 'Where thou feelest tingling life; there ... do I', 'Is't a riddle?' while keeping his cadence.

### 108.30  `3e8e28d995526df0` → `5a9552abedbd2c0f`
- **R1** (meaning,omission,unmodernized): 'standing there in thy spite' (in spite of you) mistranslated as 'in your very space'; 'uninterpenetratingly' (without mingling with you) dropped; 'why may not you' left archaic.
- **R2-acc** (unmodernized): 'why might not you' is archaic word order.

### 108.31  `4ae457a354be22ae` → `03271c9fa3c37f31`
- **R4-mod** (unmodernized): Modernized 'Truly, sir', 'I must calculate over again', 'I think I didn't carry a small figure'.

### 108.34  `ab8d1d85cbfad67a` → `e86db737b28c692e`
- **R1** (omission,meaning): 'the wealthiest Prætorians at the auction of the Roman empire' lost 'Praetorians' (the guard who auctioned the empire); '(which was the world's)' changed to 'which was the world'.
- **R4-mod** (unmodernized): Modernized 'standing debtor', 'Cursed be that mortal inter-indebtedness', 'given bid for bid', 'Prætorians', 'compendious vertebra', keeping Ahab's elevation; stage direction kept.

### 108.36  `2b1f2ee6ec1df16a` → `db2851d487c70cce`
- **R1** (meaning,omission,voice): 'the water chucks you under the chin' became 'chokes you under the chin'; 'roly-poly old coach-horses' lost 'roly-poly'; 'spavined the other for life' (lamed, as a horse) flattened to 'broken'; 'you Smut' renamed 'you Blacksmith'.

### 109.0  `a05face9b1bd288d` → `68f8a09a66817aa6`
- **R4-mod** (unmodernized): Modernized 'According to usage', 'lo! no inconsiderable oil', 'Much concern was shown', 'this unfavourable affair'; footnote asterisk kept in place.

### 109.1  `5a7adf89675574be` → `4b90b5c6c4678905`
- **R1** (hedge): 'Hereby the casks are sought to be kept damply tight' (the aim) was made a fact: 'the casks are kept damply tight'.

### 109.2  `732eb20ddf0512d2` → `4c0535ac066606f9`
- **R2-fid** (technical): Source 'braced against the screwed leg of his table': the table leg is screwed down (fastened to the deck), not bolted; keep the source's detail.
- **SWEEP-names** (convention): Lead decision 7 sweep (spelling variants of geographic/people names to modern standard form): Matsmai -> Matsumae
- **R4-mod** (unmodernized): Modernized 'drawing nigh', the 'between which lies' inversion, 'oriental archipelagoes' phrasing and the long participial description; kept the reviewers' modern geographic forms (decision 7).
- **R4-fid** (invention): 'The wondrous old man sat' - the source never says Ahab is seated; it says only that his leg was braced against the table leg.

### 109.4  `4159bd2bfb2e53cd` → `c2bdfff4743bd1e9`
- **R1** (technical): 'We must up Burtons and break out' — the named tackle (Burtons) generalized to 'tackles'; restored with a brief gloss, used once in the chapter.

### 109.5  `5eb73d3c642f5322` → `eb1a6b141a69fa06`
- **R1** (technical): 'Up Burtons and break out?' generalized to 'Rig up tackles'.

### 109.6  `5b68a65499cc2943` → `c30559fac477c4fd`
- **R4-mod** (unmodernized): Modernized Starbuck's 'more oil than we may make good in a year' and 'What we come twenty thousand miles to get'.

### 109.9  `509290c50e6a7734` → `9ee64d205d00fa7d`
- **R1** (technical): 'I'll not have the Burtons hoisted' generalized to 'tackles'.
- **R4-mod** (unmodernized): Modernized Ahab's 'Begone!', 'I'm all aleak', 'Aye!', 'who can find it ... or how hope to plug it', 'I'll not have', keeping his leak-imagery rhetoric.
- **R4-fid** (voice): 'I'm all aleak myself' became 'I'm leaking all over myself', which reads as an unintended bodily joke and loses the ship metaphor that the next sentences extend.

### 109.11  `5504b7c51c800afe` → `d6070389e457e8e0`
- **R1** (unmodernized): Archaic inversion 'What cares Ahab?' left.

### 109.12  `038950613128933b` → `c355ce8b47e0beba`
- **R2-fid** (omission): Source 'not only every way seeking to avoid the slightest outward manifestation of itself': 'every way' dropped.
- **R4-mod** (unmodernized): Modernized the convoluted 'daring so strangely respectful ... every way seeking to avoid the slightest outward manifestation of itself' and Starbuck's 'pass over in thee'.
- **R4-acc** (unmodernized): Second sentence ('it seemed not only to be trying in every way to avoid showing itself outwardly in the slightest, but inwardly as well to be more than half unsure of itself') forces a reread: the 'not only...but inwardly as well to be' structure is unbalanced. Rebalanced with minimal change; restores source's 'almost seemed'.

### 109.13  `6e6e8f29e1f63065` → `b9007fb24d908d25`
- **R2-acc** (voice): 'Do you then so much as dare to critically think of me?' is awkward to read aloud.

### 109.14  `fbae56a8ea7699a4` → `8ac892b8ab63af82`
- **R1** (unmodernized): 'Nay' and 'I do entreat' left archaic.

### 109.16  `20410a184e2a9d0b` → `55d7b377866ac010`
- **R2-acc** (unmodernized): 'you would but laugh' archaic.

### 109.17  `3666a982091aebb5` → `9b7508f872037dcb`
- **R2-acc** (unmodernized): Inverted 'most careful bravery that!'.

### 109.18  `5e409313f454aab3` → `cd0f164b97e266e0`
- **R1** (technical): 'up Burton, and break out in the main-hold' generalized to 'rig up tackles'.

### 109.19  `4207f76394739805` → `4caa7c7c2226887d`
- **R1** (technical,unmodernized,meaning): 'the Burtons were hoisted' generalized to 'tackles'; 'It were perhaps vain' left archaic; 'open disaffection' (disloyalty) changed to 'open defiance'.

### 110.0  `38f82848e1eb8b5a` → `97bae016463ff594`
- **R1** (unmodernized): Near-verbatim 1851 text left in place; inverted and archaic syntax ('So deep did they go', 'Top-heavy was the ship as', 'Well was it that', 'it being calm weather', 'struck into the hold'). Rendered sentence by sentence; Noah's coins and placards, catacombs, air-freighted demijohn and the Aristotle simile all kept; one brief gloss for 'shooks'.

### 110.1  `903d1a9f286d858b` → `e6152768b0c2d374`
- **R1** (unmodernized): Near-verbatim 1851 text left in place; 'at this time it was that', 'nigh to his endless end'.

### 110.2  `ded038f26f8a1776` → `6a26fa626f206e37`
- **R1** (unmodernized,convention): Near-verbatim 1851 text left in place; 'Be it said', 'till you get to be', 'subterraneous confinement', 'To be short'; 'harpooneer(s)' should be 'harpooner(s)'.

### 110.3  `5bd1c810a169a8e8` → `bb61a54fa31fb2fb`
- **R1** (unmodernized): Near-verbatim 1851 text left in place; 'you should have stooped ... where', 'it somehow proved to him', 'lapsed into', 'seemed growing', 'strange softness of lustre', 'as any beheld who were bystanders', 'never yet was put into words', 'which alike levels all, alike impresses all'. Full content kept (lizard in a well, rings of Eternity, Zoroaster, author from the dead, Chaldee or Greek, flood-tide to heaven).

### 110.4  `73334c70589de79c` → `3b5d03b556d32fcd`
- **R1** (unmodernized): Near-verbatim 1851 text left in place; 'Not a man of the crew but gave him up', 'what he thought of his case', 'called one to him', 'upon inquiry', 'the fancy of being so laid', 'interflow with', 'adown the dim ages'. Canoes of dark war-wood, embalming, starry archipelagoes, stars as isles, milky way breakers, sharks, keelless coffin-canoes all kept.

### 110.5  `69e5480204c7bc4e` → `76662635d74a73e0`
- **R1** (unmodernized): Near-verbatim 1851 text left in place; 'was at once commanded', 'upon a long previous voyage', 'was recommended to be made', 'No sooner was the carpenter apprised ... than ... he forthwith ... proceeded', 'promptitude'.

### 110.6  `c5b8ca63e97bcb50` → `6c4a1561cad5b38e`
- **R2-acc** (unmodernized): 'ejaculated' is dated as a speech tag and reads oddly aloud to a modern listener; 'exclaimed' keeps the sense.

### 110.7  `05ec267803510285` → `d4f235c51ad5074d`
- **R1** (unmodernized): Near-verbatim 1851 text left in place; 'transferringly measured on it', 'vice-bench', 'marshalled'.

### 110.8  `359e41f9bae9e575` → `5b226758ec1945e9`
- **R4-mod** (unmodernized): Modernized 'duly planed and fitted', 'lightly shouldered', 'inquiring whether they were ready for it yet in that direction'.

### 110.9  `07f9d350afde2a0c` → `980add556919b748`
- **R4-mod** (unmodernized): Modernized 'Overhearing ... Queequeg ... commanded', 'nor was there any denying him; seeing that', 'for evermore', 'ought to be indulged'.

### 110.10  `d98e05069b5d8a81` → `78e2ecb0c9e05807`
- **R1** (unmodernized): Near-verbatim 1851 text left in place; 'long regarded', 'ranged round the sides within', 'entreated to be lifted', 'that he might make trial of its comforts, if any it had', 'told one to go', 'signed to be replaced'. All items (iron without stock, paddle, biscuits, water flask, earth, sail-cloth pillow, Yojo, 'hatch', leather hinge, 'Rarmai') kept.
- **R4-mod** (unmodernized): Modernized 'long regarded the coffin with an attentive eye', 'ranged round the sides within', the absolute 'a piece of sail-cloth being rolled up', 'entreated ... that he might make trial of its comforts, if any it had', 'told one', 'signed to be replaced'.

### 110.11  `381f0350c6c0c8bc` → `c9ff4036783af4ac`
- **R1** (unmodernized): Near-verbatim 1851 text left in place; 'ere this was done', 'drew nigh to him'.

### 110.12  `35030f5e74cdfdba` → `a0798c9590e4c4d3`
- **R1** (unmodernized): Near-verbatim 1851 text left in place; 'will ye never have done', 'where go ye now', 'carry ye', 'beat ye your dying march'. 'ye' modernized to 'you' as in Pip's speeches in ch125; images (Antilles, water-lily beaches, missing Pip, tambourine, 'Rig-a-dig') kept in Pip's voice.

### 110.13  `c1dcd3ae8fee29ad` → `4f1479f9e1c12d44`
- **R1** (unmodernized): Near-verbatim 1851 text left in place; 'men, all ignorance, have talked in ancient tongues', 'when the mystery is probed', 'Where learned he that, but there?', 'Hark!'.

### 110.14  `77b6067cb4cb0cfa` → `e934c19b2d976ef1`
- **R1** (unmodernized): Near-verbatim 1851 text left in place; 'mind ye', 'take ye good heed', 'out upon Pip', 'Hark ye', 'if ye find Pip', 'shame upon'. The 'dies game' play, the General, the harpoon across him and the coward refrain kept.

### 110.15  `e4c1912cdc578809` → `8b36f2e007c2f92e`
- **R4-mod** (unmodernized): Modernized 'lay with closed eyes' and 'the sick man was replaced in his hammock'.

### 110.16  `8e420e39b72c4658` → `e778dfd84e7fd9d8`
- **R1** (unmodernized): Near-verbatim 1851 text left in place; 'made every preparation', 'thereupon', 'convalescence', 'he averred', 'it was Queequeg's conceit'.

### 110.17  `f9d8720f816b37f1` → `246bf1075dd01638`
- **R1** (unmodernized): Near-verbatim 1851 text left in place; 'may be six months convalescing', 'indolent days', 'pronounced himself fit'.

### 110.18  `e4b286099cd96192` → `b988612763b797ae`
- **R1** (unmodernized): Near-verbatim 1851 text left in place; 'hereby he was striving, in his rude way', 'not even himself could read', 'whereon they were inscribed', 'this thought it must have been which suggested to Ahab'. Theory of heavens and earth, treatise on attaining truth, 'wondrous work in one volume', living parchment and Ahab's exclamation kept.

### 111.0  `6fa54cc0c5c6f7af` → `82d9dba96f8dde4e`
- **R2-acc** (unmodernized): 'When gliding by the Bashee isles we emerged' is an elliptical 1851 construction with no subject for 'gliding'; reads as a dangling clause.

### 111.1  `b8d2fa238634ae59` → `f753cc1e483ec3b1`
- **R1** (unmodernized): Archaic inversion 'And meet it is, that' left; 'somnambulisms' kept but made readable. Otherwise the existing modern wording is kept.
- **R2-acc** (unmodernized,convention): 'There is, one knows not what sweet mystery' keeps the archaic 'one knows not what' plus a stray comma that breaks the sentence; a reader has to reparse it.

### 111.2  `cf5816baae93eaf1` → `31a5350d50af67bc`
- **R1** (invention,omission,voice): Final sentence replaced by invented prose ('you need not be surprised at the sight of that stately thing, the ocean — which some call God, painting it with ever-shifting hues and renaming it with all the names of all the nations'); source 'you needs must own the seductive god, bowing your head to Pan' is lost, which breaks the 'But few thoughts of Pan' link in 111.3. Also 'Magian rover' flattened to 'wanderer', 'moles' (breakwaters) dropped, 'sea of his adoption' blurred.

### 111.3  `f0259c29c296fd1d` → `b383cd8423534252`
- **R1** (omission,invention): Second half deleted and replaced ('scented the scorching sea through which he was so rapidly nearing Moby Dick'). Missing: 'consciously inhaled the salt breath of the new found sea; that sea in which the hated White Whale must even then be swimming'; the Japanese cruising-ground and 'the old man's purpose intensified itself'; lips like a vice; the Delta of veins like overladen brooks; his cry in sleep 'Stern all! the White Whale spouts thick blood!'.

### 112.0  `9e901f61cf92e193` → `3f8b848fc5e9ebca`
- **R1** (omission,meaning,invention): 191-word source cut to 73 with invented facts: forge said kept up after 'the lengthening of the buckskin for the harpoon lines' (source: 'after concluding his contributory work for Ahab's leg') and lashed 'to the ringbolt near the forge, which was now fanned up to full blast' (source: 'fast lashed to ringbolts by the foremast'). Missing: headsmen, harpooneers and bowsmen constantly calling on him; the eager circle holding boat-spades, pike-heads, harpoons and lances; 'a patient hammer wielded by a patient arm'; no murmur or petulance; his broken back; toil as life and hammer as heartbeat; 'And so it was. — Most miserable!'.

### 112.1  `b00912f930926e2e` → `119181f93d9cb191`
- **R2-fid** (hedge,omission): Source: 'a certain slight but painful appearing yawing in his gait' — the yawing only appeared painful; the candidate states it as painful. Also 'so it came to pass that every one now knew' lost 'now', and 'came round' is an odd idiom.
- **R4-mod** (unmodernized): Modernized 'had at an early period of the voyage excited', 'to the importunity of their persisted questionings', 'so it came to pass'.

### 112.2  `50f39dfbde90adb9` → `dd0f7d04a6863f17`
- **R1** (invention,omission,meaning): Everything after the barn is invented (the owner finding him, the parlor, rubbing and warm spirits, the drink lighting 'a worse fire'). Source instead says 'The issue was, the loss of the extremities of both feet' and 'Out of this revelation, part by part, at last came out the four acts of the gladness, and the one long, and as yet uncatastrophied fifth act of the grief of his life's drama' — both missing.
- **R2-acc** (voice): 'Out of this revelation ... there at last came out' doubles 'out' and is clumsy to read aloud.

### 112.3  `d30be4b5401d9507` → `02fe0af88e3eb7b2`
- **R1** (omission,invention,meaning): Second half replaced by invention ('concealed by his self-forgetfulness from the drink, the blacksmith's shop was broken into at one end and his home at another'), turning Melville's allegory into a literal burglary. Missing: the burglar in 'a most cunning disguisement'; 'the blacksmith himself did ignorantly conduct this burglar into his family's heart'; 'It was the Bottle Conjuror!' and the fiend flying from the cork; the basement shop with separate entrance; the wife listening with vigorous pleasure to the hammer through floors and walls; 'stout Labor's iron lullaby'.

### 112.4  `16f935d50765d73f` → `b9ff0227f4a5dedb`
- **R1** (omission,invention,meaning): After 'Had you taken this old blacksmith...', the widow's 'delicious grief' is garbled ('a grief delicious enough to slowly heal') and 'the merry children a care-free grave to visit' plus 'Death plucked at a richer, a more bitter vine' are invented. Missing: orphans with 'a truly venerable, legendary sire to dream of', 'a care-killing competency', Death plucking down 'some virtuous elder brother, on whose whistling daily toil solely hung the responsibilities of some other family', and leaving 'the worse than useless old man standing, till the hideous rot of life should make him easier to harvest'.

### 112.5  `e01dbb015fa3dc06` → `c887229c2e257181`
- **R1** (omission,meaning,invention): 'his every woe unreverenced' changed to 'unremedied'; 'his grey head a scorn to flaxen curls!' dropped; sentence 'Death seems the only fitting sequel for a career like this' added (it belongs to 112.6, where it is duplicated).
- **R4-mod** (unmodernized): Modernized 'Why tell the whole?', 'grew more and more between', 'glitteringly gazing', 'thither', 'in crape', 'unreverenced', keeping the rhythm of the cumulative sentence and every image.

### 112.6  `46c18b449d857cdd` → `b4938491fd7ef9c7`
- **R1** (invention,omission,meaning): Second half invented ('those things that are equally dangerous and dispiriting in the land feel oddly different ... they smell less acutely there ... It is this that drives men to sea') and 'interior compunctions against suicide' reversed to 'compulsion to live'. Missing: the ocean spreading 'his whole plain of unimaginable, taking terrors, and wonderful, new-life adventures'; the thousand mermaids singing from 'infinite Pacifics'; their whole song ('another life without the guilt of intermediate death ... put up thy gravestone, too, within the churchyard ... till we marry thee!'), which 112.7's 'these voices' depends on. Italic 'thy' conveyed by word order.

### 112.7  `e64783424e3f1b17` → `78f109f20bddf493`
- **R1** (unmodernized): Archaic 'Hearkening' and 'by fall of eve(ning)'; otherwise kept.

### 113.0  `362064be6c7e87c3` → `6ea34d1f59be68ff`
- **R1** (omission,meaning): 'a small rusty-looking leathern bag' became 'a small rustic bag of studded leather'. Second sentence deleted: moody Ahab pausing at a distance; Perth withdrawing the iron and hammering it; the red mass sending sparks 'in thick hovering flights, some of which flew close to Ahab' — the sparks that 113.1's 'Mother Carey's chickens' refers to. 'forge's lungs' kept with a brief gloss.

### 113.3  `6ea983352ca7725d` → `2b628f1c430f0763`
- **R2-fid** (meaning): Source: 'What wert thou making there?' — past tense (Perth has just stopped hammering and rested on it); candidate shifts to present 'What are you working at?'.

### 113.9  `b1abcb6f4ce6d4d7` → `842faf3b9c223a08`
- **R2-acc** (unmodernized): Inverted syntax 'glad enough would I lay my head upon your anvil' left from 1851; modernize grammar while keeping Ahab's intensity.

### 113.11  `c0b19dc3d52a804b` → `b51a04e828aab73d`
- **R1** (omission,voice): 'one that a thousand yoke of fiends could not part, Perth' flattened to 'a thousand devils could not part' (the yoked-team pulling image and the address to Perth lost); 'gaffs' changed to 'hooks'.

### 113.13  `342625b2e723c139` → `e38b79cb0399c322`
- **R4-mod** (unmodernized): Modernized Ahab's word order ('forge me first, twelve rods for its shank'), keeping the imperative rhythm.

### 113.15  `6de56877961c4edd` → `39ba5c3b2bceb601`
- **R1** (meaning): 'with regular, gasping hems' (grunts) rendered 'gasping heaves', which changes the action.
- **R2-fid** (meaning): Source: 'bowing over his head towards the fire' is ambiguous (the Parsee bowing over Ahab's head, or bowing his own head). The candidate resolves it to 'bowing his head over'; keep the source's word order so the ambiguity stays open (brief hard rule 3/5).
- **R4-mod** (unmodernized): Modernized 'This done', 'stayed his hand', the long absolute construction 'Perth passing ... the forge shooting', 'hems', 'seemed invoking'.
- **R4-fid** (meaning): Source: 'As ... he hammered ..., the Parsee passed silently' - simultaneous. 'Then the Parsee passed by' makes it a subsequent event.
- **R4-acc** (meaning): 'But when Ahab looked up, he slipped away to one side' — 'he' reads as Ahab; it is the Parsee who slips away.
- **R5-fix** (meaning,hedge): Source 'bowing over his head towards the fire' is ambiguous (over Ahab's head, or bowing his own head); R2-fid required keeping the source word order so the ambiguity stays open (hard rules 3/5). The R4 rewrite 'bent his head toward the fire' resolves it again and drops 'over'. Restore 'bowing over his head toward the fire'; rest of the R4 text kept.

### 113.16  `5a8ca91e15d196f0` → `f7b7f874dab3c191`
- **R1** (invention,voice): 'that bunch of lucifers' (matches, with the devil pun that fits the fire-smelling Parsee) replaced by a new image, 'fireflies'. Restored unglossed, since the referent is Stubb's joke.
- **R2-fid** (convention,voice): Source: 'that bunch of lucifers'. The edition renders 'lucifers' as 'lucifer matches' in 72.10 and 121.1–2; doing so here tells the modern reader the word means friction matches while keeping the Lucifer/devil pun and leaving the referent open.

### 113.17  `7a8c1e25e73de273` → `3e55b2b40dba77f1`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.49).

### 113.19  `9b44a9d6ca6e1d6d` → `669103b0d7087465`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.62).

### 113.21  `63c6ca95ec585ef7` → `b7e798a57c23a551`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.72).

### 113.22  `2143b4a7822b7fb9` → `1c9e8a9065876bc3`
- **R2-acc** (unmodernized): 'sup' is archaic for 'eat'.

### 113.23  `bcf06f226989d080` → `da37a93a6f019a52`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.51).

### 113.24  `b252da42409f11f1` → `14fbb613b8bc6bc3`
- **R2-acc** (unmodernized): 'What say you, pagans!' is archaic question form.

### 113.25  `4cdc1af913b1cfaf` → `b3de975b350c86f2`
- **R2-acc** (voice): The Latin curse is left untranslated and a listener cannot follow Ahab's inverted baptism. Proposed brief accurate gloss: 'I do not baptize you in the name of the father, but in the name of the devil.' Lead may reject if the edition leaves Latin unglossed elsewhere.

### 113.26  `26328556e758f992` → `93a5a9a681965c5d`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.57).

### 113.27  `86ef385f55a6de2b` → `a5a6b30affc8f239`
- **R1** (invention,omission): Ending invented ('its outer extremity was looped back upon itself into the body of the line, forming a spring. The completed weapon was now presented to Ahab'). Missing: pole, iron and rope 'like the Three Fates' inseparable; Ahab stalking away with the ivory leg and hickory pole ringing hollowly; and Pip's 'light, unnatural, half-bantering, yet most piteous' laugh with the apostrophe 'Oh, Pip! thy wretched laugh ... mocked it!'.
- **R2-acc** (voice): 'all your strange mummery, not without meaning blended with the black tragedy' is hard to parse: 'not without meaning' reads as modifying 'mummery' rather than 'blended'. Moving the verb first fixes it with no content change.

### 114.0  `96cd250c9143c996` → `b8e05bb137667fda`
- **R1** (omission): 'for an interlude of sixty or seventy minutes calmly awaiting their uprising' lost its number ('patiently lying still'); 'with but small success for their pains' changed to 'for the time'.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.61).

### 114.2  `42668b4605b2d141` → `10260bed8385b006`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.57).

### 114.3  `7826522d99f96400` → `635c075b93e4966d`
- **R2-acc** (voice): 'as over these there steals the hush, the hum; you almost swear' is a fragment split by a semicolon, hard to follow aloud.

### 114.4  `665b12187316a906` → `f3b2a2079f6d2915`
- **R1** (unmodernized): Verbatim 1851 inversions: 'fail of at least as temporary an effect', 'yet did his breath upon them prove but tarnishing'.

### 114.5  `d7aaa7317e4cfe60` → `b6c3586711bb5bf1`
- **R1** (unmodernized,meaning): 'we must there to learn it' left elliptical-archaic; 'earthy life' altered to 'earthly life'. Rest kept.
- **R2-acc** (unmodernized,voice): 'and at the last one pause' is a reread trap (reads as 'the last one'); 'men yet may roll' keeps archaic 'yet'. Minimal grammar fixes only.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.63).
- **R4-acc** (reread): "In what ecstatic ether does the world sail, the one that even the weariest will never tire of?" -- 'the one' can attach to 'ether' instead of 'world'; the relative clause must point clearly at the world.

### 114.6  `4a98735da387595d` → `c949b5d35116bf0f`
- **R2-acc** (unmodernized): 'lowly murmured' is an archaic adverb use.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.59).

### 114.7  `d187d54140238acd` → `1aa4d6a674d90c54`
- **R2-acc** (unmodernized): 'Tell me not of' is archaic imperative; the brief modernizes grammar in high speeches.

### 114.9  `4edbb4afa66b81a8` → `0922bb16493035a8`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.70).

### 115.0  `e57c93aa61c0c225` → `6119a7ec5f4d6b6e`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.76).

### 115.1  `0abec36ba5506e76` → `60f083a44988e925`
- **R1** (meaning): 'somewhat vain-gloriously' rendered 'somewhat vainly', which reads as 'in vain'.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.61).
- **R4-acc** (reread): "the widely scattered ships on the ground" reads as ships run aground; 114.0 uses 'cruising ground'.

### 115.2  `8a057d10d6bbe4df` → `c14a034108b355a0`
- **R1** (invention,omission): Invented 'On the forecastle was a great cask lying upon its side, with one head knocked out, and a brimming bright barrel standing within it'. Missing: two barrels of sperm lashed sideways in each of her three basketed tops; slender breakers of sperm in the topmast cross-trees; the brazen lamp nailed to her main truck. Brief glosses for 'breakers' and 'main truck'.

### 115.3  `e94b5c43e075df8e` → `7c4bd5b74f3369e9`
- **R1** (omission): Second half deleted: extra casks stowed along the deck and in the captain's and officers' state-rooms; cabin table knocked into kindling and the mess dining off an oil-butt head as centrepiece; sailors caulking and filling their chests; the humorous list (cook's boiler, steward's coffee-pot, harpooneers' iron sockets) and everything filled 'except the captain's pantaloons pockets', kept for his hands 'in self-complacent testimony of his entire satisfaction'.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.62).

### 115.4  `87595b989738b4e4` → `45315414047da255`
- **R1** (omission,meaning): Paragraph cut after the try-pot drums; 'gave forth a loud roar to every stroke of the clenched hands of the crew' blurred and 'poke' dropped. Missing: mates and harpooneers dancing with the olive-hued girls eloped from the Polynesian Isles; three Long Island negroes (period term kept, per brief) with whale-ivory fiddle-bows in an ornamented boat slung between the masts; the crew tearing down the try-works masonry; the Bastille comparison and brick hurled into the sea. Italic 'poke' conveyed as a named term.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.65).

### 115.5  `90aebd1847d3808d` → `39caf14e92cd16c6`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.51).

### 115.12  `7b201d935de8b815` → `34478897857716f8`
- **R2-acc** (unmodernized): 'How wondrous familiar is a fool!' uses 'wondrous' as an adverb with inverted order.

### 115.13  `98b70ca8bf836994` → `c6bab7c683f1cac3`
- **R1** (omission): Final sentence deleted: Ahab at the taffrail taking from his pocket 'a small vial of sand', looking from the ship to the vial, 'bringing two remote associations together, for that vial was filled with Nantucket soundings'. 'revelry' also softened to 'celebrations'.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.54).

### 116.0  `1617182453e069fb` → `cd80dc5192019e2f`
- **R2-acc** (unmodernized): 'Not seldom', 'catch somewhat of' and 'For next day' are leftover archaic idioms stacked in one sentence.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.59).

### 116.1  `a2c52fd8c9d07da9` → `bc3b9ba3ac7dda6f`
- **R1** (invention,omission): Ending invented ('from the deep green valley-lands there came that gentle shout over the world-renowned calf-pastures, "Our Jenny's dead."'). Missing: 'deep green convent valleys of the Manilla isles', 'the Spanish land-breeze, wantonly turned sailor, had gone to sea, freighted with these vesper hymns'.
- **SWEEP-names** (convention): Lead decision 7 sweep (spelling variants of geographic/people names to modern standard form): Manilla isles -> Manila isles

### 116.2  `16da8c9093db96b4` → `4145362f5a5f5dea`
- **R2-fid** (voice): Source: 'beheld of such a placid evening'. 'benign evening weather' swaps the adjective and adds 'weather'; 'placid' is plain modern English.

### 116.3  `ebe132889745b0d4` → `9954d217be941375`
- **R1** (omission,convention): Ends at 'life dies sunward', deleting the turn the whole speech rests on: 'full of faith; but see! no sooner dead, than death whirls round the corpse, and it heads some other way' (the 'gone round again' of 116.4). Source leaves the quotation open because the speech continues; closing quote removed.
- **R2-acc** (unmodernized): 'where to traditions no rocks furnish tablets' is inverted to the point of needing a reread; 'as stars that shine' is archaic for 'like stars'.

### 116.4  `12a4e3db2138241d` → `25625614612045aa`
- **R1** (meaning,convention): 'without a lesson to me' became 'without the lesson to me'; 'this thy whale' left inverted; closing quote added though the speech continues (source has none).
- **R2-acc** (unmodernized): 'who of drowned bones have built your separate throne' is inverted; reorder.

### 116.5  `6369b5f708ff3f77` → `7dd4a084b9a7f57d`
- **R1** (unmodernized,convention): Inverted 'Yet do you, darker half, rock me'; closing quote added though the speech continues into 116.6 (source has none).
- **R2-acc** (unmodernized): 'gives it not again' is archaic negation.
- **R3-fix** (corruption): Source 'All thy unnamable imminglings float beneath me here'; candidate prints 'inminglings', a misspelling of Melville's word (introduced in round 1 when 'inmixings' was restored; carried through the R2 accessibility edit). The R2 change itself ('gives it not again' -> 'does not give it again') is faithful. Fix: restore 'imminglings'.

### 116.6  `14c178f2ae1aae3a` → `b3d99dec41c40908`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.68).

### 117.1  `0bb03b842e0ddec7` → `e7f3467eb6c625a8`
- **R1** (technical): Whaling term 'waif-pole' replaced by generic 'marker-pole'; restored with a brief gloss (a waif marks a dead whale).

### 117.2  `b8d9f69514555ab1` → `50cb6dca8454547a`
- **R2-acc** (voice): 'the moaning in squadrons over Asphaltites of unforgiven ghosts of Gomorrah' strings three prepositional phrases so the listener loses who is moaning; 'Asphaltites' stops understanding. Reorder and add a brief gloss (Lacus Asphaltites = the Dead Sea, beside Sodom and Gomorrah).

### 117.3  `9768e8c772596893` → `3f012348aaefbaec`
- **R2-acc** (unmodernized): 'Started from his slumbers, Ahab, face to face, saw the Parsee' and 'said he' are 1851 syntax.

### 117.4  `0ff1b3550b9bc50c` → `757ea7d59d6e9300`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.48).

### 117.5  `112bd7e0f680478d` → `281ec90c3f3573c6`
- **R2-acc** (unmodernized): 'And who are hearsed that die on the sea?' inverted relative clause; needs a reread.

### 117.8  `228d7f23d4304478` → `4b2734e53e2aa765`
- **R2-acc** (unmodernized): Subjunctive 'till it be seen'.

### 117.10  `ff0c03d1976ba26a` → `fc46d40c890ab951`
- **R2-acc** (unmodernized): Subjunctive 'Though it come to the last'.

### 117.11  `34783bd698e7b0d5` → `2d6c3e853ef8538d`
- **R2-fid** (unmodernized): Source: 'did I believe all ye say, oh my pilot! I have here two pledges' — an inverted conditional ('if I believed'). Left inverted and followed by '!', modern readers take it as a question or a past statement.
- **R2-acc** (unmodernized): Subjunctive 'if that ever befall'.

### 117.13  `95d13521262ff19f` → `1220cd066bd055dc`
- **R2-acc** (convention): Capital 'Immortal' after a semicolon is broken punctuation; end the attribution with a period.

### 117.14  `f1e9927a2b657c8c` → `1b9f1d5135f8cb3f`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.51).

### 118.0  `6ff5c885e366da47` → `952cc0cf4a8b0113`
- **R1** (meaning,omission): Ends with the order not yet given ('imagining that the long-wished-for command ... would soon be given'), reversing the source. Missing: 'In good time the order came. It was hard upon high noon; and Ahab, seated in the bows of his high-hoisted boat, was about taking his wonted daily observation of the sun to determine his latitude.' 'the Line' restored with a gloss.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.60).
- **R4-acc** (reread): "seated in the bow of his boat, hoisted high," leaves it unclear whether Ahab or the boat is hoisted.
- **R5-fix** (omission): Final verify v4 note: source 'all their eyes centrally fixed on the nailed doubloon' — 'centrally' (all eyes converging on one point) had been dropped; restored as 'all their eyes converging on'.

### 118.1  `cb440bbe1d3f6c5c` → `f130d381e5b96955`
- **R1** (invention,omission,meaning): After the splendors of God's throne, all is invented ('Well may that eye of his be in it...', 'One morning, Ahab raised his ivory leg ... taking from the binnacle the quadrant'). Missing: quadrant with colored glasses; Ahab swinging with the roll to catch the meridian; the Parsee kneeling beneath, eyeing the same sun with half-hooded eyes and 'earthly passionlessness'; the latitude pencilled on the ivory leg; and Ahab's apostrophe to the sun ('Thou sea-mark! thou high and mighty Pilot! ... Where is Moby Dick? This instant thou must be eyeing him ... thither side of thee, thou sun!'). Italic am/shall conveyed with 'now'. Brief quadrant gloss.
- **R2-acc** (voice): 'Meanwhile, while his whole attention was absorbed' doubles while, awkward aloud.

### 118.2  `b818378267eef9dd` → `fbea0e00a24c380b`
- **R1** (invention,omission,voice): Invented closing 'This world steers its own course and I am steering mine!'. Missing: 'on this wide planet, and the hand that holds thee: no! not one jot more!'; 'and yet with thy impotence thou insultest the sun!'; 'Science! Curse thee'; 'as these old eyes are even now scorched with thy light, O sun!'; the argument 'Level by nature to this earth's horizon are the glances of man's eyes; not shot from the crown of his head'; 'the level ship's compass, and the level dead-reckoning, by log and by line; these shall conduct me' (set-up for chs 124-125); leaping to the deck and trampling and splitting the quadrant. 'cabalistical contrivances' flattened to 'mystical devices'. Italic 'these' conveyed with 'it is these'.
- **R2-fid** (meaning): Source: 'lighting from the boat to the deck' = alighting, getting down. 'leaping down' adds a vigorous action the source does not state (Ahab is on an ivory leg).
- **R2-acc** (unmodernized): 'Level by nature to this earth's horizon are the glances of man's eyes' is inverted and needs a reread.

### 118.3  `9f2de8f9328e4834` → `69c0f01ece6edf7e`
- **R1** (omission): Ahab's order that turns the ship is deleted: 'till Ahab, troubledly pacing the deck, shouted out — "To the braces! Up helm! — square in!"' (118.4's swinging yards depend on it).

### 118.4  `acdd42cbb96c0b92` → `833582698b65837b`
- **R1** (omission,voice): Classical allusion 'the three Horatii' replaced by 'three acrobats'.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.56).

### 118.5  `c35df079230614e6` → `7a5a377b8848d61e`
- **R2-fid** (technical): Source: 'Standing between the knight-heads'. 'bow-timbers' blurs a specific nautical term; the brief says keep such terms, with a brief accurate gloss if needed.

### 118.6  `2179a2540ddf6090` → `4f52088a00bf8da7`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.72).

### 119.0  `d8eaadaddee7c7fd` → `1bf7ba854c67870a`
- **R1** (omission,voice,convention): Last sentence dropped ("It will sometimes burst from out that cloudless sky, like an exploding bomb upon a dazed and sleepy town"); "the direst of all storms, the Typhoon" flattened to "the deadliest typhoons"; "but nurse"/"but basket" left archaic; "cruellest" British spelling.

### 119.1  `84cfa7061e7c1f77` → `ae33a9ff7782b3dc`
- **R2-acc** (unmodernized): 'was torn of her canvas' is an archaic construction; a listener stumbles on it.

### 119.2  `628c89edb25c7f5a` → `8254bbfe23c5ada3`
- **R1** (omission): Last three sentences dropped: Ahab's windward quarter boat, "lifted to the very top of the cranes", has its bottom stove in at the stern by "a great rolling sea" and is left "all dripping through like a sieve" (set-up for 119.11 and 119.36).

### 119.3  `6cbdde59fa984a04` → `b755f9e20c42f48b`
- **R1** (invention,omission,meaning): Ending invented ("And a pull or a jolt or a sail torn, is my signal to spring — that's all"); source's "But never mind; it's all in fun: so the old song says" and the (sings.) direction that introduce the song in 119.4-6 are missing; "all the start I have to meet it" changed to "to begin with".

### 119.8  `9c9b05e127ebe17a` → `66b08a065f9e228a`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.69).

### 119.11  `d310156f744da4d1` → `c19d731a81a98307`
- **R1** (invention,omission,unmodernized): Invented "His very body was there but an hour ago. I saw him then. The boat's whole bottom is stove in!"; dropped the pun "his stand-point is stove, man!" and "Now jump overboard, and sing away, if thou must!"; "mark you not", "is wont to stand" left archaic.

### 119.13  `34f75eb339713f5f` → `0fc0ef90832ea76b`
- **R2-acc** (unmodernized): 'The gale that now hammers at us to stave us, we can turn it...' reads as a broken sentence aloud; 'to stave us' lacks its particle.

### 119.14  `87b29198557edc23` → `c632ffe9ef021b34`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.64).

### 119.17  `0cf59112bf3ebed2` → `bd0fa37869c33611`
- **R1** (invention,omission,technical): Invented "the lower end was left trailing in the sea until the storm came. It was then hauled up alongside." Dropped the reasons (towing mishaps, fouling rigging, slowing the ship) and the actual design: "the lower parts ... are not always overboard; but are generally made in long slender links, so as to be the more readily hauled up into the chains outside, or thrown down into the sea" — which explains the "links" Ahab grasps in 119.30-37.

### 119.18  `ca1efbd7c38bf741` → `84b41eca9368a854`
- **R1** (meaning): "darting flambeaux" (torches) rendered as "darting flamelike"; source image is the lightning as torches lighting Ahab to his post.

### 119.19  `a394bb7c918ff8b9` → `fdd81cce879e5c67`
- **R2-acc** (unmodernized): Archaic subjunctive 'though we be the weaker side'; the brief modernizes Ahab's grammar while keeping his elevation.

### 119.21  `cf1621ab81470915` → `bb0911bd8cd4b210`
- **R1** (technical): First narrative appearance of the "pallid fire" called "corpusants" in 119.20; a first-time reader has no idea what they are. Brief accurate gloss added (St. Elmo's fire); otherwise unchanged.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.45).

### 119.23  `6f9ed9a5d0c44cdd` → `f71610ca35895135`
- **R2-acc** (voice): 'Mene, Mene, Tekel, Upharsin' is unexplained and will stop many first-time readers. Brief accurate gloss: the writing on the wall at Belshazzar's feast (Daniel 5). Drop if the lead prefers no gloss.

### 119.24  `afd2812132d24608` → `cc018932234a3ca6`
- **R1** (unmodernized): "Relieved against the ghostly light" uses an obsolete sense of "relieved" (set off in relief) that misleads modern readers; "thrice" archaic.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.66).

### 119.25  `7be16304444cab2c` → `5a02789598146036`
- **R2-acc** (unmodernized): 'it was not the same in the song' has to be reread; Starbuck means the cry was different from Stubb's song.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.63).

### 119.29  `ee4e4e98602f515c` → `f8690fe80a740a7d`
- **R1** (omission,unmodernized): "like a knot of numbed wasps from a drooping, orchard twig" lost "numbed"; "in Ahab's front" left archaic; "all their eyes upcast" lacks a verb.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.51).

### 119.30  `85b9711d58236e6e` → `508d00f03dd00768`
- **R1** (unmodernized): "I would fain feel this pulse" and "the white flame but lights the way" left in 1851 grammar.

### 119.31  `848a2d6a78c5698c` → `30c9c213168bdd93`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.56).

### 119.32  `1cdfbda50c2c81f8` → `db70036bdba48771`
- **R1** (omission,unmodernized): Second half of Ahab's address to the fire deleted: "Though but a point at best; whencesoe'er I came; wheresoe'er I go; yet while I earthly live, the queenly personality lives in me, and feels her royal rights. But war is pain, and hate is woe. Come in thy lowest form of love, and I will kneel and kiss thee ... there's that in here that still remains indifferent. Oh, thou clear spirit, of thy fire thou madest me, and like a true child of fire, I breathe it back to thee." Remaining text keeps inverted syntax ("will you be kind", "No fearless fool now fronts you", "will dispute" without subject).

### 119.33  `60be18eabe9d8d65` → `b5c13c7acfed0102`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.67).

### 119.34  `cb55d34eb2dcab73` → `f93fc0bae0a5c206`
- **R1** (invention,omission,unmodernized): Invented line "Here I devoutly pledge myself to what I adore in you — and defiance to all else." replaces "The javelins cease; open eyes; see, or not? There burn the flames!"; dropped "hence callest thyself unbegotten; certainly knowest not thy beginning" (the unbegotten/unbegun pair collapsed into one); inverted forms kept ("yet will I talk", "would fain be welded").

### 119.36  `b9b693ca4d89be79` → `f3e9bf3b9132efd1`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.67).

### 119.37  `0fd3d1fd01c3e1a4` → `c286d1e96e5d4735`
- **R1** (invention,omission): "Petrified by his aspect, and still more shrinking from the fiery dart that he held" replaced by invented "Petrified by his desperate daring, and his wild words but still more desperate".
- **R2-acc** (unmodernized): 'the first sailor that but cast loose' uses archaic 'but' (= so much as).
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.62).

### 119.38  `2e8d6dd097f9fb2b` → `0ef61e8a18082933`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.66).

### 119.39  `7df7b6336f968ebe` → `2d99f3fe61fdaa31`
- **R2-acc** (unmodernized): 'whose very height and strength but render it so much the more unsafe, because so much the more a mark' is archaic and hard to follow aloud.

### 120.1  `286bee334e5edf59` → `7295da1b809afc91`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.60).

### 120.6  `8e1394cd198eff26` → `c4650a6aab51ffd1`
- **R1** (meaning,voice): Ahab's insult "Ho, gluepots!" changed to "Ho, you landlubbers!"; "brain-trucks" plural made singular.
- **R2-acc** (unmodernized): Inverted conditional 'did I not know' in otherwise modernized speech.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.66).

### 121.0  `93263e600514b545` → `7c3035665ebf7b8a`
- **R1** (unmodernized): Inverted "the anchors there hanging".

### 121.1  `b31b53af3a4d1ae1` → `d1948355f66201e7`
- **R1** (omission): "boxes of lucifers forward" lost "boxes"; "lucifers" (friction matches) left obsolete while 121.2 uses "matches".
- **R2-acc** (unmodernized): 'how long ago is it since you said' is a tangled tense construction a reader has to reparse.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.74).

### 121.2  `ac8153d6bd4d6d46` → `f1fde0d182656922`
- **R1** (invention,omission,meaning): Everything after "coat collar" is invented ("Don't you see the sails are all wet? What a big flood it is!... the typhoon's over now. Let's make a deal: ... I'll give you this jacket"). Lost: insurance companies' "extra guarantees" / "Here are hydrants"; the whole lightning-rod argument (holding a rod vs. standing by an unrodded mast; "not one ship in a hundred carries rods"); the militia officer's hat-rod joke; "Why don't ye be sensible, Flask? ... any man with half an eye can be sensible" (which 121.3 answers). "changed my flesh" altered to "skin".
- **R2-fid** (voice): Source italic stress "supposing we _are_ loaded with powder barrels aft" (Stubb conceding the premise) is lost in the flat "supposing we are loaded". Per the conventions, carry the stress through wording, not underscores.

### 121.4  `7319547c81f451f1` → `59a45fdfc951e652`
- **R1** (invention,omission): Second half invented ("I guess there's no letting go their holding in a hurry. Oh man, the old anchor holds on well... Trust the old anchor there, my boy"). Lost: "I wonder, Flask, whether the world is anchored anywhere...uncommon long cable"; finishing the knot and coming down to deck; wringing the jacket skirts; long-tailed coats and cocked hats as rain-gutters; swallow-tail and beaver; the tarpaulin blowing overboard; "that the winds that come from heaven should be so unmannerly! This is a nasty night, lad."
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.67).

### 123.0  `968a3c67983d6a7c` → `647e5c265cce579f`
- **R1** (invention,meaning): Paragraph imports the whole content of 123.1 (shuttlecock, whirling needles) plus an invented "though he cared little for such things at that time"; "indispensable" became "necessary in heavy weather".
- **R2-acc** (unmodernized): 'even though preventer tackles had been attached to it — for they were slack — because some play...' must be reread; the dash-aside breaks the causal chain.

### 123.1  `c3abeae924c3691f` → `9ef586302502cf96`
- **R1** (omission,invention): Dropped "the whirling velocity with which they revolved upon the cards; it is a sight that hardly anyone can behold without some sort of unwonted emotion"; invented "though caring but little for the marvel" (reverses the source's point).
- **R2-acc** (unmodernized): 'at almost every shock the helmsman had not failed to notice' is a stiff double negative.

### 123.2  `35b8dbdbbe103357` → `a6844b2c39ccce7d`
- **R1** (omission): Dropped the rest of the albatross simile: "which sometimes are cast to the winds when that storm-tossed bird is on the wing".

### 123.3  `2fc89d23df5471bb` → `5e7382d61cbbe196`
- **R1** (meaning,invention,omission): "which he was to steer" (the helmsman) became "which Ahab was to steer"; "steered according to its vicissitudes" became invented "steered by instinct"; last sentence dropped: the wind coming round astern, "aye, the foul breeze became fair!" — the event 123.4 celebrates.

### 123.4  `2088514ef5e61a55` → `7d8e13e4bbd25612`
- **R2-acc** (unmodernized): Inverted 'should so soon have proven false the evil omens' needs rereading.

### 123.6  `055bf5ee7f660c01` → `5fb11ed41be9cac4`
- **R1** (omission,invention): Dropped the cabin's "isolated subterraneousness" and "humming silence ... hooped round by all the roar of the elements", the muskets "standing upright against the forward bulkhead", and the key point that "there strangely evolved an evil thought; but so blent with its neutral or good accompaniments that for the instant he hardly knew it for itself"; replaced with vague invented "strange things were bursting"; "flickering light of the lamp revealed" altered.

### 123.7  `7488ecdd6df14aa0` → `fa90d9f014cd12f2`
- **R1** (omission,invention,unmodernized): Roughly the second half of Starbuck's reasoning deleted: the lightning-rods charge; "If, then, he were this instant — put aside, that crime would not be his"; Ahab muttering in sleep; "I can't withstand thee ... say'st all of us are Ahabs. Great God forbid!"; the lawful alternative (make him a prisoner, the caged-tiger image, losing his reason on the voyage); "locked Japan", "two oceans and a whole continent between me and law"; heaven's lightning striking a would-be murderer; "And would I be a murderer, then, if—" and placing the musket against the door. Ending invented ("Great God, where are you? Shall I? Shall I? The wind has blown fair! — but is the fair wind my friend?"), partly stolen from 123.8. "I'll cure myself of this" dropped; archaic forms ("gropes he not", "would fain", "if Ahab have") kept.

### 123.8  `c78bc40d700be548` → `e0bf7ff0b028c8e9`
- **R1** (invention,omission,meaning): Ending invented ("The wind is fair. His sleeping hand is on the loaded musket.") — the musket is in Starbuck's hand, not Ahab's. Dropped the second "shall I?" and Starbuck's spoken report "The wind has gone down and shifted, sir; the fore and main topsails are reefed and set; she heads her course", which is what wakes Ahab's dream-speech in 123.9-10. "if I wake him not to death, old man" mixes persons.

### 123.10  `3c2c0e6d2e079525` → `629df806b2a0c6d1`
- **R2-acc** (unmodernized): Archaic 'from out the'.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.73).

### 123.11  `78e739258ca674c5` → `e9573c624a5f5469`
- **R2-acc** (unmodernized): 'seemed wrestling' drops the infinitive; reads archaic.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.51).

### 124.0  `d79db363cbcfb2bd` → `7b7f8f676a1f1ac7`
- **R1** (omission): Last three sentences dropped: the invisible sun "only known by the spread intensity of his place; where his bayonet rays moved on in stacks"; "Emblazonings, as of crowned Babylonian kings and queens, reigned over everything"; "The sea was as a crucible of molten gold". "abounded so" slightly reworded.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.67).

### 124.1  `b8a67caeb4e946ca` → `e1c29c0dcb347b4e`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.57).

### 124.3  `28ae4749fc559d76` → `4f6d35092c9cad6f`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.51).

### 124.6  `8ff5fae11e02ad29` → `a85f6bc3dbd42071`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.48).

### 124.7  `fa49dc3ced32c366` → `a0fdbe1deed57d25`
- **R2-fid** (voice,meaning): Source "the two compasses pointed East, and the Pequod was as infallibly going West". The "as infallibly" irony (the ship just as surely going the opposite way) is lost, and "due west" adds a precision the source does not claim.
- **R2-acc** (convention,unmodernized): 'and lo! The two compasses' — archaic 'lo' and a capital letter mid-sentence after the exclamation.
- **R3-fix** (voice): R2 change rendered source "Starbuck looked, and lo!" as "Starbuck looked, and — look! —", a doubled word (looked/look!) that reads as a slip. Source "as infallibly going West" fix is otherwise correct. Replace "look!" with "behold!".

### 124.8  `11fb32c8fd84001a` → `4de1eb55e0663b07`
- **R2-acc** (unmodernized): 'could get out abroad among the crew' is garbled/archaic; 'You have before now heard' is inverted.

### 124.9  `442670818092cbc4` → `718b89a260cfb7ba`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.53).

### 124.10  `8de500c56d8897ef` → `d520fa79f12dc637`
- **R1** (invention,omission,technical): Invented claim that compasses reverse "as well as those where the storm merely rages without direct contact". Dropped: a direct strike that smites down spars can be "still more fatal", annihilating "all its loadstone virtue" so the steel is no better than "an old wife's knitting needle"; the needle "never again, of itself, recovers"; and if the binnacle compasses are affected, all others in the ship are too, "even were the lowermost one inserted into the kelson".

### 124.11  `0f586d5ea289ac6c` → `02d25ad23ac9486d`
- **R1** (invention): "the supposed fair one had only been juggling her" (tricking her) became invented "luring her on to her doom".
- **R2-acc** (unmodernized): 'with the sharp of his extended hand' — 'the sharp' as a noun stops the reader.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.64).

### 124.12  `bc1612c9bb6af32c` → `3327c04856e6d89b`
- **R1** (omission,invention): Dropped "their fear of Ahab was greater than their fear of Fate" (replaced by invented "their obedience of habit carried them through") and the whole last sentence: the pagan harpooneers "almost wholly unimpressed; or if impressed, it was only with a certain magnetism shot into their congenial hearts from inflexible Ahab's".

### 124.13  `c6ea1154838f01df` → `7c1179635f706075`
- **R2-acc** (unmodernized): Inverted 'the quadrant he had the day before dashed to the deck'.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.68).

### 124.14  `6e49dd7c54bcc509` → `0e963a65ccb604a3`
- **R1** (unmodernized): "the compasses would fain have wrecked me" left archaic.

### 124.15  `89b3c64c117f89fa` → `d8785679ea641337`
- **R1** (meaning): "not a thing to be passed over by superstitious sailors, without some shudderings and evil portents" changed to "not ... passed over without complaint by his officers"; "clumsily practicable" became "feasible enough".

### 124.16  `e3b2a9eed2e9ebc2` → `d97f9be79593d597`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.71).

### 124.17  `d55e5ae5f0b3d7e5` → `05f1bba18b5d29da`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.47).

### 124.18  `3f382e3db7abd6bf` → `a6fb8cba651877e8`
- **R1** (invention,omission,technical): Second half invented ("the crew was intently watching, their mouths open. Then turning the needle in the opposite direction ... swung it back and forth ... settled to the east, the very direction the compasses had pointed before"). Dropped: the mate still holding the rod; the "small strange motions" and the narrator's uncertainty whether they were needed for magnetizing or only for awe; calling for linen thread; removing the two reversed needles from the binnacle; suspending the sail-needle horizontally by its middle over a compass-card; its quivering then settling; Ahab stepping back and "Look ye, for yourselves, if Ahab be not lord of the level loadstone! The sun is East, and that compass swears it!"

### 124.19  `7dc22dfb5544e34c` → `bd5bce727eebe53c`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.64).

### 124.20  `2060c6b722de5fe3` → `e6cdfd35876a28f3`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.33).

### 125.0  `aac71547e97692de` → `f6565591aed5047b`
- **R1** (invention,omission): Everything after "heave the log" replaced by invented "and frequently more than at the same time, it remains but a question of drifting currents and calms". Dropped: logging course and presumed speed on the slate "for form's sake"; "It had been thus with the Pequod"; the reel and angular log hanging untouched under the after bulwarks, damped, warped and rotting; Ahab's mood on seeing the reel after "the magnet scene", remembering the quadrant and his "frantic oath about the level log and line"; "astern the billows rolled in riots". Brief gloss of "log and line" added.

### 125.2  `31ea1cf89beb4ff6` → `879e1d68b91c9058`
- **R2-acc** (unmodernized): 'grizzly Manxman' — a modern reader hears the bear; the sense is gray-haired.

### 125.3  `4f7354d62dfc4f57` → `7da6ca0fd576c267`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.63).

### 125.4  `a7a36f0da9e27a92` → `8e7c15bbe057b2d7`
- **R2-acc** (unmodernized): 'so stood with the angular log hanging downward' — archaic 'so stood'.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.60).
- **R4-acc** (reread): "the handles sticking out at each end of the spindle the spool of line turned on" -- stacked noun clause must be reread.

### 125.5  `4d4b4d52ba185946` → `bfddc784171db113`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.73).

### 125.12  `f818c7f13714f6be` → `2c250525a44e6cf7`
- **R1** (unmodernized): "I know not, sir" left archaic.

### 125.13  `75906e3afc5f8ac9` → `eda723ccd927c0c7`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.71).

### 125.14  `793edd368bebb669` → `65f846afb3574ca1`
- **R2-acc** (unmodernized): Dangling modifier: 'jerkingly raised and lowered by the rolling waves, the towing resistance of the log...' — it is the log, not the resistance, that is raised and lowered; a reader has to reparse.

### 125.16  `109abc69e2533c9d` → `364ca096e955fb5b`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.61).

### 125.17  `65b8d333b64c1f22` → `b8bcb894750a3d6b`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.78).

### 125.18  `b8666e8c5b0b4e46` → `f2437a86e4236886`
- **R2-acc** (unmodernized): 'the skewer seems loosening' drops the infinitive.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.62).

### 125.19  `d26d34fb3e9740e6` → `652a9ba0fd01299a`
- **R1** (unmodernized): "Whom call you Pip?" left in inverted 1851 grammar.

### 125.21  `dd846030c0f41419` → `95a87f86ef6dc7b7`
- **R1** (unmodernized): "ever scolds" (= always) and "Hands off from" left archaic.

### 125.22  `29e6c9e5c14611b6` → `443429e0b153151a`
- **R1** (unmodernized): "Lo! Lo!" left archaic.

### 125.23  `276546c4fc1bb044` → `97515175c2a682b8`
- **R1** (unmodernized): "I see not my reflection" left inverted.

### 125.25  `80e31cec75ee8d33` → `c14b4baf23ef8ca0`
- **R1** (unmodernized): "You did beget" left archaic.

### 125.26  `cb83fa405fff3a67` → `d4deaa3400cad4a3`
- **R1** (unmodernized): "perhaps he had never been lost" keeps the 1851 conditional.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.68).

### 125.27  `0bc4c84f14899036` → `028bc0afdb7cd783`
- **R1** (unmodernized): "Lo, you believers ... lo you!", "knowing not what he does", "than though I grasped" left archaic.

### 126.0  `142d6067c9d5ef96` → `c24076d74a1364ff`
- **R1** (invention,omission,meaning): "Ahab's levelled steel" / "level log and line" became "hand-made compass" / "hand-made log and line"; "descrying no ships" kept but "ere long, sideways impelled by unvarying trade winds, over waves monotonously mild" dropped; invented "encountering no obstacles of any sort" and "began to breed a strange dread in many of the crew" replace "all these seemed the strange calm things preluding some riotous and desperate scene".

### 126.1  `8606b5b0a2481614` → `5a0de73ffead73c9`
- **R1** (convention): "harpooneers" and "grey" violate edition conventions (harpooner, gray); otherwise complete.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.59).

### 126.2  `8dd05b07405fdbd1` → `a229b97896568453`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.40).

### 126.3  `04e98f2546ad54bd` → `1e8bd83ca371cdb5`
- **R1** (unmodernized): "risen nigh the ship" left archaic.
- **R2-acc** (unmodernized): 'But this only the more affected some of them' is inverted and unclear; 'seen peeringly uprising' is awkward aloud.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.71).

### 126.4  `e23d0e99204e7585` → `f3159b22bb2b56e4`
- **R1** (invention,omission,hedge): Invented causes ("that condition all sleepers are occasionally in...", "his feet were treacherous from their icy contact with the deck", "the man was seen to stagger") — source leaves it open: "whether it was thus with the man, there is now no telling". Dropped "for sailors sometimes go aloft in a transition state", "a cry and a rushing", "a falling phantom in the air" and "a little tossed heap of white bubbles in the blue of the sea".
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.71).

### 126.5  `0fac85e3f219bf4f` → `dfc9d3cb3a66a672`
- **R1** (invention,omission,meaning): Ending invented and wrong ("that parched wood slowly sank, till the man drowned with the buoy" — the man was already gone). Source: the parched wood "also filled at its every pore; and the studded iron-bound cask followed the sailor to the bottom, as if to yield him his pillow, though in sooth but a hard one".

### 126.6  `476dd8291bb81274` → `7ae51869df3361b0`
- **R1** (unmodernized,convention): "said nay" archaic; "fulfilment" British spelling.
- **R2-acc** (unmodernized): Archaic 'in some sort' and 'the reason of'.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.72).

### 126.7  `43f9ed6d3e046830` → `e99bcfb77d227b57`
- **R1** (meaning,omission): Passive invented "it was suggested that Queequeg's coffin should be brought up and used" replaces "they were going to leave the ship's stern unprovided with a buoy, when by certain strange signs and inuendoes Queequeg hinted a hint concerning his coffin" — loses that the crew was about to go without a buoy and that the idea was Queequeg's.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.70).

### 126.12  `d9f3359c51a6064f` → `6876a93cafbf0e13`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.71).

### 126.16  `dd75236648b05b3c` → `aefbacb9e16e7627`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.67).

### 126.18  `57c50bfe9561c09d` → `1e3253c0cb9758e6`
- **R1** (unmodernized): Near-verbatim; "ere they would do", "if the hull go down", "Any way", "Let's to it" left archaic. Content complete; carpenter's voice kept.
- **R2-acc** (unmodernized): 'Were ever such things done before with a coffin?' is inverted; 'unless it be' is archaic subjunctive. The carpenter's voice survives the change.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.74).

### 127.0  `c2105ac1b29ebb14` → `10c193180fa78006`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.71).

### 127.1  `fc1eac28fc2bce93` → `cac6f9added2b814`
- **R1** (unmodernized): Verbatim 1851: "I will be with ye again presently", "Not this hand complies with my humor more genially than that boy".

### 127.3  `33ec5b9882033b2a` → `61cf0de1e34e6920`
- **R1** (unmodernized): Verbatim "Thank ye, man. Thy coffin".

### 127.5  `ca36f52fc649702e` → `f7f733075f399896`
- **R1** (unmodernized): Verbatim "Art not thou ... thy shop".

### 127.7  `5f2944c27677b1d2` → `83a6fd79594a14ae`
- **R1** (unmodernized): Verbatim "art thou not".

### 127.8  `0be1c28db74ad59d` → `5e5d30bb1e8bf36c`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.72).

### 127.9  `391432e26afcb30e` → `bc1b5a3feb36f92b`
- **R1** (unmodernized): Verbatim "art thou not", "Thou art".

### 127.11  `95e1d00b5344068b` → `939aa29a2cf0f578`
- **R1** (unmodernized): Verbatim "Hark ye, dost thou not ever sing", "Dost thou never?".

### 127.12  `9218b9c0262c0f12` → `726e2c4db71c665b`
- **R1** (unmodernized): "Hark to it" archaic.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.72).

### 127.13  `b424c1daa15a937b` → `465d2bdac9b053be`
- **R1** (unmodernized): Verbatim "there's naught beneath", "Hast thou ever".

### 127.19  `bbfba763002daf9f` → `c180eb1460c422d0`
- **R1** (unmodernized): Verbatim "Art thou a silk-worm? Dost thou spin thy own shroud", "Despatch!".

### 127.20  `7332bd0b21671af9` → `70dff5a61cb956ac`
- **R1** (unmodernized): "yon old man", "I tell ye" left archaic.
- **SWEEP-names** (convention): Lead decision 7 sweep (spelling variants of geographic/people names to modern standard form): Gallipagos -> Galapagos

### 127.22  `688f624fee85ebf9` → `f79fb0d4effb3429`
- **R1** (unmodernized): "by a mere hap", "Will ye never have done", "let me not see", "from thee ... into thee" left archaic; "grey-headed" spelling.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.70).

### 128.0  `05c837a16d8cc3e8` → `1eb4b0c8898ac461`
- **R1** (meaning,invention,voice): Live text replaces 'the broad-winged windward stranger shot nigh to her' with 'graceful stranger came near' (drops 'windward', which explains why the Pequod's sails were becalmed), turns 'fell together as blank bladders that are burst' into 'fell one after another into mere unsightly bags', and invents 'as though she were some dead thing suddenly struck'; source: 'all life fled from the smitten hull'.

### 128.1  `9abc8c08e97ce573` → `a7652b3c4540de1c`
- **R1** (invention,meaning): Source: 'ere her commander, who, with trumpet to mouth, stood up in his boat; ere he could hopefully hail'. Live text drops 'stood up in his boat', invents 'cordially hail the ship's company', and garbles 'raising his trumpet in his mouth'.

### 128.2  `89a5b0c26ff636c0` → `f82c288df014371b`
- **R1** (unmodernized): Verbatim 'Hast seen the White Whale?'

### 128.3  `442945980f85f4a4` → `c6c639c22be8bff7`
- **R1** (unmodernized): Verbatim 'Have ye seen a whale-boat adrift?'

### 128.4  `55978887b118451e` → `bed66c1a55a2938b`
- **R1** (unmodernized): Near-verbatim 1851 syntax: 'would then have gladly boarded', 'boat-hook soon clinched', 'recognized by Ahab for a Nantucketer'.

### 128.5  `68fe8e94850c61a7` → `0db9b06a690ade9d`
- **R1** (unmodernized): 'How was it?' left as 1851 idiom.

### 128.6  `67e797b117886ae4` → `61e61a4bada3ce20`
- **R1** (unmodernized): Almost verbatim source ('whereupon', 'the fourth rigged boat', 'indefinitely run away with his pursuers', 'forced to pick up her three far-windward boats', 'had thus continued doing till daylight'); long 1851 periodic sentences kept intact.

### 128.7  `5ee5799f8c04e020` → `fe7a4147f4c3a470`
- **R1** (unmodernized): Verbatim 1851 phrasing: 'The story told', 'He desired that ship to unite with his own'.

### 128.8  `7036dc93ae311630` → `dad18864ab5f13fb`
- **R2-acc** (unmodernized): 'someone in that missing boat wore off that captain's best coat' reads as 'wore off' (faded/rubbed off); the sense is that someone went off wearing the coat. Readers and listeners will stumble.

### 128.9  `41f022388d505ae3` → `19f8652d12205a8a`
- **R1** (unmodernized): Verbatim: 'I conjure', 'had but icily received his petition', 'eight-and-forty hours', 'if there be no other way'.

### 128.10  `53d92d8f951b2a4b` → `031c0a3d052c649d`
- **R2-acc** (unmodernized): 'what says Ahab?' is inverted archaic question form in otherwise modern sailor talk.

### 128.11  `f523328e52176b54` → `b1b23e5dc54a34b0`
- **R1** (unmodernized): 'all of ye heard' left archaic.

### 128.12  `1813df21ced2396c` → `3acffdf759c90ae9`
- **R1** (unmodernized): Near-verbatim single 1851 period: 'the circumference... at the same time, though separated', 'unmisgiving hardihood', 'Nor does it infrequently happen', 'unenervated', 'untimely partiality'; hard to follow for a modern reader.

### 128.13  `028ffb3ac11098f5` → `d30903099b72250d`
- **R1** (unmodernized): Verbatim: 'Meantime, now the stranger was still beseeching his poor boon of Ahab'.

### 128.14  `3beacae482c5bace` → `c7230b932e54b9ae`
- **R1** (unmodernized,voice): Near-verbatim ('say aye to me', 'in the like case'); source italics on 'aye' and 'you' dropped without compensating stress.

### 128.15  `57db30b65c449f38` → `e4dc00c10e36c16f`
- **R1** (unmodernized): Verbatim: 'touch not a rope-yarn', 'prolongingly molded every word', 'God bless ye', 'from this present instant'.

### 128.16  `3b8ab486644acf58` → `d00e32fc20e4a2d0`
- **R1** (unmodernized): Verbatim: 'his so earnest suit', 'starting from his enchantment'.

### 128.17  `3dbee2580b1a4513` → `6c47e89d10497075`
- **R1** (unmodernized): Verbatim: 'diverged their wakes', 'yaw hither and thither', 'long as the strange vessel was in view'.

### 128.18  `cdf25df171b80ae1` → `cec9d1e0ccd5781a`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.59).

### 129.1  `260c0c67f6d17679` → `b3444760c8267af5`
- **R1** (unmodernized): Ahab's speech verbatim with thee/thou/thou wert/thou shalt/abide; edition modernizes Ahab's grammar (chs 36, 119).

### 129.2  `ab8cc00c33a8a4a1` → `c8167f42e75b0e3e`
- **R1** (unmodernized): Pip verbatim: 'ye have not a whole body', 'do ye but use poor me', 'a part of ye'.

### 129.3  `7e459f586c0ed282` → `60035a0031be9c62`
- **R1** (unmodernized): Verbatim: 'spite of million villains', 'methinks'.

### 129.4  `868f60750670a2e4` → `f13cad6047015eaf`
- **R1** (unmodernized): Verbatim: 'did once desert', 'desert ye', 'go with ye'.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.80).

### 129.5  `42fbc854d0e45c5e` → `36c4a61e338ff863`
- **R1** (unmodernized): Verbatim: 'If thou speakest thus', 'I tell thee no'; 'keels up' (capsizes) left opaque.

### 129.7  `0dee73a56ac844eb` → `25b24cb95dddc2eb`
- **R1** (unmodernized): Verbatim: 'I will murder thee', 'thou wilt', 'I quit thee', 'Thy hand', 'True art thou', 'let what will befall'.

### 129.9  `973b268cf828989d` → `4d0d1fe17cae5308`
- **R1** (unmodernized): Pip's monologue verbatim: 'Here he this instant stood', 'were even poor Pip here', 'I'll seat me', 'glad to see ye', 'have ye seen', 'Hist!'.
- **R2-acc** (voice): 'black seventy-fours' stops a first-time reader: the term is not explained anywhere nearby. Brief accurate gloss (ships of the line carrying seventy-four guns).

### 130.0  `2aa65b24f9b6d320` → `e5cf7a21ee9f21ce`
- **R1** (unmodernized): Verbatim: 'hard by', 'contrastingly concurred', 'hardly sufferable', 'livelong', 'were fain to hide', 'sprout forth a single spear'.
- **R2-acc** (unmodernized): 'a vessel had been spoken' uses the period nautical sense of 'speak' (to hail/communicate with a ship at sea); a modern listener hears it as ungrammatical.

### 130.1  `6cdb3140ace50c43` → `b9d3e03e7e398b49`
- **R1** (unmodernized): Verbatim 1851: 'no more strove', 'Alike, joy and sorrow...', 'despot eye'.

### 130.2  `0b78509527331719` → `a27e3f784ecb6d7b`
- **R1** (unmodernized): Verbatim: 'did you deeply scan him', 'invest the thin Fedallah', 'whether indeed he were', 'had Fedallah ever certainly been known to slumber', 'did plainly say'.

### 130.3  `195a3a617a3d63a5` → `5d24955c2a64c766`
- **R1** (unmodernized): Verbatim single 1851 period: 'unless Ahab was before them', 'however the days and nights were added on', 'tell unerringly', 'on the stretch', 'whatever he wanted from the cabin that thing he sent for'.

### 130.4  `e8e1f2a25fcaa89f` → `ece5f862c79f6653`
- **R1** (unmodernized): Verbatim: 'nor reaped his beard', 'was now become', 'the twain', 'pole-like asunder', 'dumb men were both'.

### 130.5  `da8a13cb61b0726d` → `860fce2dacaaa14f`
- **R1** (unmodernized): Verbatim broken 1851 construction 'And yet, somehow, did Ahab — ... — Ahab seemed', 'be this Parsee what he may', 'siding'.

### 130.6  `6bb3a87c3ba2f17d` → `147d5684733acf7b`
- **R1** (unmodernized): Only defect: 'What d'ye see?'

### 130.7  `b92cebfb9207a54f` → `849fda51bf1100ae`
- **R1** (unmodernized,convention): Verbatim: 'had slid by', 'sagaciously refrained from verbally expressing them'; 'harpooneers' against convention.
- **R2-acc** (voice): 'He even seemed to doubt whether Stubb and Flask might not willingly overlook' is a double-negative construction that must be reread to see it means he suspected they might overlook it. Same hedge kept via 'seemed to suspect ... might'.

### 130.8  `9f3b32d4e2f0bc6a` → `cad8c9cafe7aeb30`
- **R1** (unmodernized): Verbatim: 'I give it into thy hands', 'arranging his person', 'firm relying eye', 'gazed abroad'.

### 130.9  `5511775c89bee30b` → `00b71a103b651bf0`
- **R1** (unmodernized): Verbatim 1851 periodic syntax: 'Because in such a wilderness...', 'almost the one only man', 'such an otherwise distrusted person's hands'.

### 130.10  `02735d7501109153` → `c149bfdb5bb532e2`
- **R1** (unmodernized): Verbatim: 'ere he had been there ten minutes', 'incommodiously', 'spiralized'.

### 130.11  `636f6598ee34f924` → `0829035f60efef3a`
- **R1** (unmodernized): Verbatim 'seemed not to mark', 'would anyone else have marked it'.

### 130.12  `7eba45c9bb0a6a82` → `5e5408259862fb69`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.67).

### 130.13  `7a07223814acfdab` → `5d9a04a3eee24462`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.71).

### 130.14  `c359a20c65252556` → `2d01bb21ffdbdf94`
- **R1** (unmodernized): Verbatim: 'flew thrice', 'thereupon', 'was that omen accounted good'.

### 131.0  `0ca8fc135fd9833c` → `7f3cc0b2588af96a`
- **R1** (unmodernized): Verbatim: 'was descried', 'As she drew nigh'.

### 131.1  `54af4fce53b5abac` → `8fd329ed8c58ff1e`
- **R1** (unmodernized): Verbatim: 'Upon the stranger's shears were beheld'.

### 131.2  `89a5b0c26ff636c0` → `f82c288df014371b`
- **R1** (unmodernized): Verbatim 'Hast seen the White Whale?'

### 131.3  `9e3e4a2b733468e3` → `f4b0214e624ea79a`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.62).

### 131.4  `62f965299bedb1b4` → `5a7012d8b2b0a6cf`
- **R1** (unmodernized): Verbatim 'Hast killed him?'

### 131.5  `f35528141c0410af` → `3e32798a725be5e4`
- **R1** (unmodernized): 1851 syntax: 'The harpoon is not yet forged that ever will do that', 'glancing upon', 'busy in sewing'.

### 131.6  `2969c3585232c1cd` → `6eae694ecd0b7185`
- **R1** (unmodernized): Verbatim: 'Look ye, Nantucketer', inverted 'Tempered in blood... are these barbs', 'triply'.

### 131.7  `0a8af37ddbc052b2` → `8ba0830ef7b83b39`
- **R1** (unmodernized,convention): Verbatim: 'God keep thee', 'see'st thou that', 'ere night', 'Are ye ready there'; source stress on 'that one' lost; doubled dash.

### 131.9  `3f02cc2598d2a5b5` → `742d9260b3c79f55`
- **R1** (unmodernized): Verbatim 1851 construction 'not so quick, indeed, but that some of the flying bubbles might have sprinkled'.
- **R2-fid** (omission): Source: 'the sound of the splash that the corpse soon made as it struck the sea'. The candidate drops 'soon', which marks that the Delight went ahead with the burial as the Pequod fled. Restore it.
- **R2-acc** (unmodernized): 'not so quick, indeed, but that some of the flying bubbles may have sprinkled' is archaic 'but that' syntax that needs rereading. Rephrased keeping the hedge ('perhaps').

### 131.10  `d02a815fa2f5fe70` → `3622de5258bf6f19`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.76).

### 131.11  `e2c82b54b641d1aa` → `0ded003da8186538`
- **R1** (unmodernized): Verbatim: 'yonder', 'oh, ye strangers, ye fly our sad burial; ye but turn us your taffrail'.

### 132.0  `1fecdc8d1a930e56` → `7b6db4764f85dd74`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.59).

### 132.1  `4d45e2e2db26277c` → `fb97a9c39d1b0c77`
- **R1** (unmodernized): 'Hither and thither' left archaic.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.65).

### 132.2  `c931c8e06cb26b23` → `84e193e4f1e7dc05`
- **R2-acc** (voice): 'But though thus contrasting within, the contrast was only in shades and shadows without' is a dangling participle with no subject; readers must reread to see 'within/without' refers to air and sea.
- **R3-fix** (convention): The R2 accessibility wording 'though the two contrasted so within, without the contrast was only in shades and shadows' is a garden path: 'without the contrast' parses as a prepositional phrase. Source: 'the contrast was only in shades and shadows without'. A comma after 'without' makes it read as the adverb (outside), matching the source's within/without pairing.

### 132.3  `2c2d3f0c360b0575` → `5206346d9a1dbaed`
- **R2-acc** (unmodernized): 'the sun seemed giving' drops the infinitive in an archaic way.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.67).

### 132.4  `fd2f878a8ca64e78` → `9c582c31618c1128`
- **R1** (unmodernized): 'the clearness of the morn' left archaic.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.64).

### 132.5  `fa54f7c55bbe7d3c` → `7ba06a32b034c9b7`
- **R1** (unmodernized): Verbatim: 'innocency', 'how oblivious were ye', 'their old sire', 'on the marge of'.

### 132.6  `7b9d2e6941daf6de` → `ebe2e71a6591b0bc`
- **R1** (unmodernized): Verbatim: 'did at last seem to dispel', 'did seem to joyously sob', 'as if over one who ... she could yet' (ungrammatical), 'profundity'.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.71).

### 132.7  `c45ff5bdc641aca0` → `646a5bad8956387a`
- **R1** (unmodernized): Verbatim: 'saw him, how he heavily leaned', 'he yet drew near to him'.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.65).

### 132.11  `991e672644014120` → `c619a8c8c2bd5f46`
- **R1** (unmodernized,convention): Ahab's great speech left in 1851 grammar ('has Ahab forsaken', 'admits but small entrance', 'wedded past fifty', 'Locks so grey did never grow but from out some ashes', 'to wear ye', 'thine eye', 'lower not when I do', 'shall not be thine'); 'harpooneer', 'grey', 'mouldy'. Also silently emends source 'soil' to 'soul' (see open questions). Rhetoric kept; grammar only modernized.

### 132.12  `12271220f7e158db` → `efb14ca24d028e0f`
- **R1** (unmodernized): Verbatim: 'even as thine, sir, are the wife and child of thy loving...', 'let us home'.

### 132.13  `44611d0f4a5479f5` → `7a30f82e6b9b2e6f`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.62).

### 132.14  `df84e8cb4c7b0a38` → `882df85b32c52781`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.63).

### 132.15  `514cf2b0fc2474e4` → `a8511c8905b3c625`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.59).

### 132.16  `84e7b826bd7aee2d` → `971f133612fd95ea`
- **R1** (unmodernized): Verbatim 1851 grammar in Ahab's speech: 'cozening', 'I durst not so much as dare', 'if the great sun move not of himself', 'lo!', 'yon Albicore', 'toil we how we may'. Rhetoric kept; grammar only modernized.
- **R2-fid** (meaning,voice): Source: 'what in my own proper, natural heart, I durst not so much as dare'. 'Durst not' means 'dared not' (a lack of courage), and Melville doubles the verb ('durst ... dare'). The candidate's 'would not' turns it into unwillingness and loses the doubling. Modernize the grammar only: 'I dared not so much as dare'.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.75).
- **R4-acc** (reread): Subject slip: "I keep pushing ... recklessly making me ready" -- the participle's subject is 'I', so 'me' should be 'myself'.

### 132.18  `4eae4d383c37ad0c` → `e6992d8d6e3b4329`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.77).

### 133.0  `0ae23b5201b4d825` → `d5ae07007b215278`
- **R1** (unmodernized): Near-verbatim 1851 wording: "as his wont at intervals", "stepped forth", "drawing nigh to some barbarous isle", inverted "sometimes to a great distance given forth by", "nor was any mariner surprised". Rendered in modern syntax with every step (compass, dog-vane, bearing of the odor, course altered, sail shortened) kept.

### 133.1  `c67fb741bdc769ca` → `3b180716693f9f62`
- **R2-fid** (omission): Source locates the wrinkles: "resembling in the pleated watery wrinkles bordering it, the polished metallic-like marks". Candidate "in its pleated watery wrinkles" drops "bordering it" (the wrinkles edge the sleek; they are not on it).
- **R2-acc** (unmodernized): "a long sleek on the sea": "sleek" used as a noun reads like a typo to a modern reader; the modern form of the word is "slick".

### 133.3  `2c7bc7523cf240cc` → `c0e016f78b38b654`
- **R1** (voice): "such judgment claps" (the Last-Judgment trumpet image that makes the sleepers rise) flattened to "such sharp claps". Restored; rest of the sentence kept.

### 133.7  `fffc711d11fed101` → `81f566ab0b03f8d3`
- **R2-acc** (unmodernized): Stacked clauses "when, while but two-thirds of the way aloft, and while peering..." with archaic "but" (= only) force a reread; split into two sentences, no content changed.

### 133.8  `b517d549214f059a` → `5266f18b119b4159`
- **R1** (omission): Final sentence dropped: "To the credulous mariners it seemed the same silent spout they had so long ago beheld in the moonlit Atlantic and Indian Oceans" (the spirit-spout of ch51). Restored; rest lightly modernized.

### 133.11  `141625c9c9ec7619` → `2a0eb09a5a81662a`
- **R1** (omission,invention,meaning): After "Stand by three boats" the candidate substitutes ch134's order ("stay on the ship, and keep her away from the boats, but keep near them. Lower, all!") and drops the source's "stay on board, and keep the ship. Helm there! Luff, luff a point! So; steady, man, steady! There go flukes! No, no; only black water! All ready the boats there? Stand by, stand by! Lower me, Mr. Starbuck; lower, lower,—quick, quicker!" and "and he slid through the air to the deck". Restored in full; the italic "_I_ only" conveyed by word order.

### 133.14  `fd8ebf8ff2aca93e` → `ef843a8cc6206448`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.58).
- **R4-fid** (invention): Source "a hideous motion gnawed his mouth" is unspecified; "twitching" adds a particular kind of motion the source does not name. Restore the neutral noun.

### 133.15  `f49a5077218ab721` → `7d61ef58d6e067c2`
- **R1** (unmodernized): Left verbatim: "came so nigh", "like to some flag-staff", "alternate with their fitful flight", "Before it ... went", "interchangeably flowed over", "gay fowl". Rendered in modern syntax; every image kept (nautilus shells, carpet, noon-meadow, revolving ring of foam, Turkish-rug waters, white shadow of the forehead, valley of the wake, bubbles, birds' toes, argosy flagstaff, shattered lance-pole, perching bird, pennons).

### 133.16  `2a30328968985f4a` → `1a432fe026390168`
- **R1** (unmodernized): Verbatim 1851 syntax ("invested the gliding whale", "intent upon the maid", "did surpass"). Modernized; Jupiter/Europa/Crete simile and the exclamation kept.

### 133.17  `435851f3e45a0a2b` → `38df4eb415b0688d`
- **R2-acc** (unmodernized): Near-1851 syntax: "that, but once leaving him, then flowed so wide away", "shed off enticings", "found that quietude but the garment of tornadoes", "to all who for the first time eye you". Hard to parse aloud; grammar modernized, images kept.

### 133.18  `f3fbbc219f37bb75` → `cdd9871748692306`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.69).

### 133.19  `60421fdfbee1077e` → `120724ee9700dd65`
- **R2-fid** (technical): Source "With oars apeak" is the specific whaleboat posture (oars peaked, blades raised clear of the water, as in ch. 48 and elsewhere), not merely "at rest".

### 133.20  `464e9e6a04b6cfad` → `386377577e6b35ca`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.64).

### 133.22  `12c087fe79a91f1c` → `6f7b41bfd406d2e9`
- **R1** (unmodernized,technical): Near-verbatim ("with wonderful celerity uprising", "profoundly saw", subjectless "Then, calling upon Fedallah ..., went forward"); "stand by to stern" (be ready to back the boat astern) left opaque. Modernized; all images (herons, weasel, teeth, marble tomb, Perth's harpoon) kept.

### 133.23  `4bd440b3ef9668f7` → `4268abf6a1585fc4`
- **R1** (omission,unmodernized): "as it were, in an instant" dropped; "by reason of", "by anticipation" left. Modernized and restored.

### 133.24  `471af8274dca1f28` → `847c9dc35da49e92`
- **R1** (omission): Final sentence dropped: "With unastonished eyes Fedallah gazed, and crossed his arms; but the tiger-yellow crew were tumbling over each other's heads to gain the uttermost stern." Restored; opening clause clarified (subject of "thrilled").

### 133.25  `30663cbe036f80d7` → `4f891fedbee7a716`
- **R1** (unmodernized): One 1851 period sentence left intact ("from his body being submerged", "tantalizing vicinity", "wrench it from its gripe", "in twain"). Split into modern sentences with every action kept.

### 133.26  `e3d308b6fe077a4d` → `5b4dc882999f3efb`
- **R1** (unmodernized): "preluding moment", "ere", "loosed his hold for the time", tangled participle chain. Clarified; the source's ambiguous "his hold" kept ambiguous.

### 133.27  `51e059023d453588` → `fd613434f3774d6d`
- **R1** (corruption,meaning): Garbled "the half-full half-filled Channel billows" for source "the but half baffled Channel billows"; "Ripplingly withdrawing" flattened to "Drawing away". Repaired; footnote marker kept; "Eddystone" given the brief accurate gloss "lighthouse".

### 133.28  `bee1be975c761819` → `edd23db5a4734b2e`
- **R2-acc** (unmodernized): Footnote "It receives its name (pitchpoling) from its being likened to..." is stiff and needs a reread.

### 133.29  `54430214c5e4be07` → `17f4c80018cde09b`
- **R1** (unmodernized): Near-verbatim ("succor", "more than enough was it for them", "so revolvingly appalling", "planetarily swift", "lest that should be"). Modernized; Maccabees elephants, bubble, Fedallah's mild gaze, the boats' dilemma kept.
- **R2-acc** (unmodernized): Broken sentence: "Meanwhile Ahab, half smothered ... and too much of a cripple to swim — ... — helpless Ahab's head could be seen" has no verb for its first subject; reader must reread.

### 133.31  `cf348191a45e0cfd` → `afc023bdd0f20cb3`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.72).

### 133.32  `a80449a4a0acbd9e` → `9ed059f967e0c6f9`
- **R2-acc** (unmodernized): Dangling opener ("Dragged into Stubb's boat ..., the long tension ... did crack"), archaic emphatic "did crack" and "from out ravines".

### 133.33  `d15e6074851b9c4a` → `e92b578cd36cb2ee`
- **R1** (meaning): "pointless centres" (centers that are mere geometric points, yet contain whole circumferences) became "painless centers", reversing the image. Also "abbreviate" / "aggregate" syntax left stiff. Repaired.

### 133.39  `878311829c5f252c` → `b24311127d1723d3`
- **R1** (unmodernized): Long near-verbatim paragraph ("D'ye see him?", "anon", "unintermitted", "in some one brief vicissitude"). Modernized; double-banked/treble-banked, cranes, albatross wings, binnacle-watch, the hour, the doubloon cry kept.

### 133.40  `e5678dfc74127ab1` → `301876c2fd50394a`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.61).

### 133.41  `e7ad20526dcd840a` → `fa4e20b6ec61e3fd`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.59).

### 133.42  `0fadefafa3f722ef` → `64ef4895a73e15a7`
- **R1** (unmodernized): Inverted "Did I not know you brave ... I could swear". Modernized; the fire/mechanical parenthesis (echoed in 134.43-44) kept.

### 133.44  `842c0d994135bbf5` → `60d50dc944189007`
- **R1** (omission): Final order dropped: "D'ye see him? Sing out for every spout, though he spout ten times a second!" (replaced by "What do you see?"). Restored.

### 133.49  `4b46569381ed795e` → `d9effbc991f06657`
- **R1** (unmodernized): "whosoever of you", "let it abide here", "now, it's night" (garbled "now 'tis night"). Modernized; all orders and the ten-times reward kept.

### 133.50  `03a8a99b47094273` → `f75ec9bd77872040`
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.48).

### 134.0  `27f2c776be6e41e7` → `32798b45cbf5e3b4`
- **R1** (corruption,unmodernized): "wbefore" (were) corruption.

### 134.1  `4f7314ce4e2dc7d0` → `5c081d200cc5d26e`
- **R1** (unmodernized,convention): "D'you see him?"; curly quotes.

### 134.2  `f342ad020092af55` → `05b99bd86fc4a71f`
- **R1** (convention): Curly quotes only; text kept.

### 134.3  `d9350833d86b97a4` → `a67213797f0ffaa5`
- **R1** (unmodernized,convention): Verbatim ("than I thought for", "'tis but resting"); curly quotes, unspaced dashes.

### 134.4  `eccacc8dba9a74b2` → `f44462040c2d052f`
- **R1** (corruption,unmodernized): Corruptions "Hbefore" (Here), "thbefore" (there), "well near" (well nigh); rest verbatim 1851. Full modern rendering: pilot/cape/headland comparison, "thing writ in water", railway Leviathan and baby's pulse, up/down train, two hundred miles, ninety-three leagues and a quarter all kept.
- **R2-acc** (unmodernized): "points touching the chase of whales": archaic "touching" (= concerning).

### 134.5  `10b36d8bdb695de6` → `18dc0a494858a0ba`
- **R1** (unmodernized): Verbatim ("missent", "plough-share"). Modernized.

### 134.6  `2b1b9f5373122952` → `851bcea98ed1eca2`
- **R1** (convention,unmodernized): Curly quotes, unspaced dashes; "Some one take me up". Modernized lightly; Stubb's oaths kept.

### 134.7  `12c96d588fb17eb6` → `10f69bf09c9180d7`
- **R1** (corruption): "Thbefore" (There) corruption; curly quotes.

### 134.8  `ce9d843f8b0d19a2` → `7bb1cc8b6837ad13`
- **R1** (convention,voice): "Yes, aye!" is a botched substitution for sea-talk "Aye, aye!"; curly quotes, unspaced dashes.

### 134.9  `5f0bf684deece189` → `5c00e9433485c980`
- **R1** (corruption,unmodernized): "wbefore" x3, "well near"; rest verbatim. Modernized; old wine, prairie hares and bison, hand of Fate, wind as symbol kept.

### 134.10  `45a33654a355876c` → `5cda21d716f814c5`
- **R1** (corruption,unmodernized): "wbefore" x3. Modernized; ship/keel figure and "guilt and guiltiness" (kept as printed; see open questions) kept.

### 134.11  `e35a1d7be30cbd6e` → `526628ef3dde362d`
- **R1** (corruption): "wbefore" corruption; "in full bearing of mortals" left opaque. Modernized.

### 134.12  `aeee3ea7b1b9b08c` → `f0296accad576695`
- **R1** (unmodernized,convention): "Why sing you not out" (half-modernized inversion), "not Moby Dick casts"; curly quotes.

### 134.13  `2f9374c6e169eda4` → `74380442df66fd99`
- **R1** (unmodernized): Verbatim ("It was even so", "belayed", "halloo", "indolent spoutings"). Modernized; orchestra/rifle image, thirty buckskin lungs, breaching explanation, seven miles, mane, defiance kept.

### 134.14  `3a613a9b5b6a426e` → `7fe104380d7e0721`
- **R1** (corruption): "Thbefore" x2, "thbefore" (there). Modernized.

### 134.15  `15e25839256c023a` → `c042f25ba266939a`
- **R1** (convention,voice): "Yes, breach your last" for "Aye, breach your last"; curly quotes, unspaced dashes.

### 134.16  `7b1abab39b115d43` → `080d251ff64516fd`
- **R1** (unmodernized): Verbatim ("Unmindful of", "isolated backstays"). Modernized.

### 134.17  `d119e529174f55cc` → `3c112b274c4405ef`
- **R1** (unmodernized,convention): "the ship is thine"; curly quotes.

### 134.18  `390291bdd7ca2179` → `9df35327fd3e8a0e`
- **R1** (corruption,unmodernized): "wbefore" x2; rest verbatim ("ere", "manœuvred", "slogan"). Modernized; head-and-head explained as in source, trained chargers, plank's breadth kept.
- **R2-acc** (unmodernized): "As if to strike quick terror into them, being by this time the first to attack, Moby Dick had turned" — participle clause is hard to parse aloud.

### 134.19  `e1aab146c05d8655` → `01a78866449199ac`
- **R1** (unmodernized): Verbatim ("evolutions", "devoted boats", "disencumber", "lo!"). Modernized.

### 134.20  `840038628343fa81` → `15e8435471fd491b`
- **R1** (unmodernized): Verbatim ("critically reached within—through—and then, without", "sundering", "fagot"). Modernized; knife sequence, bowsman, husks, maelstrom, nutmeg in punch kept.

### 134.21  `560323387da928b3` → `c3ee78c6099dcfc5`
- **R1** (corruption,unmodernized): "wbefore" corruption; rest verbatim. Modernized; Flask as empty vial, Stubb to be ladled up, line parting, invisible wires, seals from a cave kept.

### 134.22  `d4bd12f98dbf9f89` → `dd81033e2ee13896`
- **R1** (unmodernized): Verbatim ("involuntarily launched him along it", "a traveller's methodic pace"). Modernized.

### 134.23  `0f5acdd6b24295dd` → `0118fb87c88bc5d7`
- **R1** (corruption,unmodernized): "wbefore" corruption; rest verbatim. Modernized.

### 134.24  `f232dab839a7547b` → `01fcb24fe48875bc`
- **R1** (unmodernized): Verbatim. Modernized lightly.

### 134.25  `82a84d68ac99b9f8` → `f5aa05c6fe3b1de5`
- **R1** (unmodernized,convention): "'tis sweet", "be the leaner who he will", "would old Ahab had"; curly quotes.

### 134.26  `26e84c1de53be7f8` → `e3be97833b8a7a2a`
- **R1** (convention): Curly quotes; "has not stood" modernized to "has not held".

### 134.27  `5b3baa5aabd64e43` → `975421e595c2b44a`
- **R1** (convention): Curly quotes only.

### 134.28  `5b5ab8b6471afa75` → `35da7a35a85609a7`
- **R1** (unmodernized,convention): "d'ye see it", "one jot more me", "Nor white whale, nor man, nor fiend", "yonder floor ... yonder roof"; curly quotes.

### 134.29  `9cf376feeefb2ff2` → `6e3eebef692924fc`
- **R1** (convention): Curly quotes only.

### 134.30  `a372770af899e6c6` → `6aea0351f6d87d9a`
- **R1** (convention): Curly quotes; missing comma after "Mr. Starbuck".

### 134.31  `a71d5d18e2ab9171` → `6ef8d2390d2bb325`
- **R1** (unmodernized,convention): "help thee towards"; curly quotes.

### 134.32  `88239b59fbb64e1e` → `20a6e9adc5b1780f`
- **R1** (convention): Curly quotes only; text kept.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.75).

### 134.33  `c45ce329788e3add` → `4b09124f05c32fc5`
- **R1** (convention): Curly quotes only.

### 134.34  `f9de6d3908bfefa9` → `ccf724e8d205514d`
- **R1** (unmodernized,convention): "not thee"; curly quotes, unspaced dashes.

### 134.35  `f2f3d14b0361bbb9` → `b90eaad751dbcd6a`
- **R1** (unmodernized): "hinted thought", "Upon mustering the company". Modernized lightly.

### 134.36  `ac3100c7c6093d33` → `7dc47f53e1ffd10c`
- **R1** (convention): Curly quotes, double em dash.

### 134.37  `5398c71880089480` → `2d4e80cb36f5a82b`
- **R1** (unmodernized,convention): "wrench thee", "all of ye ... alow"; curly quotes.

### 134.38  `9be1e572d18494eb` → `7f81d438971ab65e`
- **R1** (unmodernized): "tidings". Modernized lightly.

### 134.39  `d7f2bbbb0d976778` → `110dd8203e707722`
- **R1** (convention): Curly quotes, unspaced dashes.

### 134.40  `9c03c2b306c046fe` → `1de702c1666ec161`
- **R1** (unmodernized,convention): "What means that little word?", "d'ye see it", "'tis in the fish", "yea", "harpooneers" (edition uses "harpooners"); curly quotes, unspaced dashes. Italic stress on "My line" conveyed by position.

### 134.41  `2332006f2c6cc719` → `153033cb7e97e25c`
- **R1** (unmodernized,convention): Starbuck's plea left in thee/thou/wilt/wouldst; curly quotes. Grammar modernized; every item of the plea kept.

### 134.42  `5cca227523bcd052` → `2c8a6d6a5db986f5`
- **R1** (unmodernized,convention): Ahab's Fates'-lieutenant speech left in thee/thou/ye/'twas/ere; curly quotes. Grammar modernized; rhetoric (palm of the hand, billion years, centipede, hawser, drowning things rise twice, encore) kept; italic "that" conveyed with a dash.

### 134.43  `1ee450aafed70c35` → `b18e976fa467569e`
- **R1** (convention): Curly quotes only.

### 134.44  `e5d9960ab245059a` → `351054a02d36248f`
- **R1** (unmodernized,convention): "ere I could perish", "might baffle"; curly quotes; italic "_I'll_, _I'll_" conveyed by repetition with dash.

### 134.45  `ebd5262c6c6abe02` → `230745f2865da87e`
- **R1** (unmodernized): "descended". Modernized lightly.

### 134.46  `609c4df2423ca21e` → `994f73142ab2d731`
- **R1** (unmodernized): Verbatim ("his hid, heliotrope glance anticipatingly gone backward on its dial; sat due eastward"). Modernized; heliotrope (sun-turning) image kept with a brief accurate gloss.

### 135.0  `a9127216cc929018` → `b7e201016691f877`
- **R1** (unmodernized): Near-verbatim. Modernized lightly.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.70).

### 135.1  `8d5cb10ce335113a` → `60be21b3aa29d919`
- **R1** (unmodernized,convention): "D'ye see him?"; curly quotes.

### 135.2  `5ebcadecff92501f` → `ea7dd594bbb7cd16`
- **R1** (corruption,unmodernized): Corruptions "wbefore" (were), "earyour" (earthy), "hbefore" (hither), "Wbefore" (Were), "somewhbefore", "whbefore"; "as you goest"; rest verbatim. Full modern rendering of the wind soliloquy, keeping every turn: angels' summer-house, "Ahab never thinks", frozen-skull glass, Greenland/Vesuvius grass, tainted prison wind, coward wind, bodiless as objects not agents, Trade Winds, keeled soul. Italic "that's" conveyed by wording. "swift and swerve" see open questions.

### 135.3  `1707e6120cefef8b` → `e9ddd893eb42734f`
- **R1** (convention): Curly quotes only.

### 135.4  `8280a77a3a5be6a1` → `2bf979b574fd7b91`
- **R1** (unmodernized,convention): "goes a-begging", "all of ye", "have run him by"; curly quotes; italic "_me_ ... _him_" conveyed by word order.
- **R2-acc** (convention): "How, did he get the start?" — stray comma reads as a typo.

### 135.5  `1040b4985f6c7559` → `deadce7e44959248`
- **R1** (unmodernized): Verbatim, hard to parse ("Steering as she had done ... sailed hard upon the breeze as she rechurned the cream"). Modernized.
- **R2-fid** (technical): Source "sailed hard upon the breeze" means close-hauled. "sailed close into the breeze" reads as heading into the wind's eye; the idiom is "close to the wind".

### 135.6  `91cf6e3ce9104ab1` → `1489b4f5248f0c2d`
- **R1** (unmodernized,convention): "I misdoubt me"; curly quotes.
- **R2-acc** (unmodernized): "my bones feel damp inside me, and wet my flesh from within" — inverted; reader cannot tell that the bones are the subject of "wet".

### 135.7  `4e512df286743b74` → `de11f8b52abdc77c`
- **R1** (convention): Curly quotes only.

### 135.8  `b564507c4c156e0e` → `6be8ad83366c69ab`
- **R1** (unmodernized,convention): "straightway"; curly quotes.

### 135.9  `9514e2fc4006c845` → `1de231c9b1c54a9d`
- **R1** (unmodernized): Verbatim ("gold-beaten out to ages", "descried"). Modernized.

### 135.10  `11feb03f0833b8ae` → `9ac03dbb7e45dbf0`
- **R1** (corruption,unmodernized): Corruptions "hbefore" (here), "thbefore" (there), "eyou" (eye); "you told'st". Full modern rendering; masthead farewell, Noah, leewardings, mosses, dead wood vs live flesh, Parsee's prophecy and "endless stairs" kept.
- **R2-acc** (unmodernized): "you told dire truth as touching yourself" — archaic "as touching".

### 135.11  `900ec5a7c634039a` → `7f86a367ba6e3b8b`
- **R1** (unmodernized): "cloven blue air". Modernized lightly.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.68).

### 135.12  `a54f98f163b212a2` → `cf4dac670f913060`
- **R1** (unmodernized): Verbatim ("shallop's stern", "bade him pause"). Modernized.

### 135.13  `d0ea34d47fcc6323` → `40d9b1daa432e5a2`
- **R1** (convention): Curly quotes only.

### 135.14  `c45ce329788e3add` → `4b09124f05c32fc5`
- **R1** (convention): Curly quotes only.

### 135.15  `d16f1c428a09f14c` → `5da2297db0abd4f6`
- **R1** (convention): Curly quotes; "starts upon" lightly modernized.

### 135.16  `5683df52732269ed` → `44a4a98c6f1c61cc`
- **R1** (unmodernized,convention): "thou wilt have it so"; curly quotes.

### 135.17  `f23f60b5cc9bf99c` → `1d149a86766c31f6`
- **R1** (convention): Curly quotes; word order modernized.

### 135.18  `3ea55f518c88be33` → `36f534497b923a91`
- **R1** (convention): Curly quotes only.

### 135.19  `34cb42eec6199b5f` → `31f1d24b7efc88d5`
- **R1** (convention): Curly quotes, unspaced dashes; text kept.

### 135.20  `acb397007be39fb8` → `34e416effec7343a`
- **R1** (unmodernized): Elliptic "Starbuck's tears the glue". Minimal modern completion.

### 135.21  `f0728b11b79b8905` → `94d3da7eb334c833`
- **R1** (unmodernized,convention): "go not—go not!", "how great the agony of the persuasion then"; curly quotes.

### 135.22  `6a88de1a64e0e8d6` → `89f1ab2011643982`
- **R1** (convention): Curly quotes, unspaced dash.

### 135.24  `748d09445a8e4adb` → `162454ee15754ce5`
- **R1** (convention): Curly quotes only.

### 135.25  `ee0c432cc3613940` → `aad6ba2673a5c838`
- **R1** (unmodernized): "high-lifted then". Modernized lightly.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.71).

### 135.26  `57dedccc87f135ef` → `fe1001d173816494`
- **R1** (unmodernized): Verbatim ("the voice spake true", "scarce had he", "prescient way"). Modernized; vultures over regiments in the east, tiger-yellow crew, musky flesh kept with the hedges ("apparently", "a matter sometimes well known", "however it was").

### 135.27  `d1466417f7fe81d8` → `b2ac0873b4d949a7`
- **R1** (unmodernized,convention): Starbuck's soliloquy in thou/canst/fadest/see'st; curly quotes, unspaced dashes. Grammar modernized; Mary, the boy's blue eyes, "fixed at the top of a shudder", the hawk tearing the vane kept; "main-truck" given a brief accurate gloss (used again in 135.54, 135.60).

### 135.28  `d638e7efece9f363` → `9fc623880091fff2`
- **R1** (unmodernized): Verbatim ("becharmed crew", "head-beat waves"). Modernized.

### 135.29  `2409a84fffcec71a` → `162f97265f424446`
- **R1** (unmodernized,convention): "oh ye waves", "ye but strike"; curly quotes.

### 135.30  `2696f962c973847d` → `777f012be530125b`
- **R1** (unmodernized): Verbatim ("bedraggled", "subterraneous hum"). Modernized; berg, rainbowed air, thirty feet, heaps of fountains, new milk, marble trunk kept.

### 135.31  `85544969bc48c926` → `e9d93ba5789855a3`
- **R1** (unmodernized,convention): Verbatim ("combinedly possessed", "head on, he came churning"); curly quotes. Modernized.

### 135.32  `6b664bc0e1f87ff7` → `8066a959df63c9c0`
- **R1** (unmodernized): Verbatim ("reeled the involutions", "sable raiment"). Modernized.

### 135.34  `7e807c8d5afc9033` → `8cea9d071ba8041c`
- **R1** (unmodernized,convention): "I see thee", "thou goest", "thou didst promise", "ye"; curly quotes; italic "_this_" conveyed by repetition with dashes.

### 135.35  `dab2a8593dd04d98` → `1d6d825a51649ef8`
- **R1** (unmodernized): Verbatim ("looked too nigh the boat"). Modernized.

### 135.36  `9b3f943a8d516662` → `2890d78603904553`
- **R1** (unmodernized,convention): "seeks thee not. It is thou, thou, that madly seekest him"; curly quotes.

### 135.37  `43ef57d504f7a885` → `e6a34418dfa72378`
- **R1** (unmodernized): Verbatim ("impelled", "far other hammers"). Modernized; every glimpse (Starbuck at the rail, three harpooners mounting, oarsmen repairing, Stubb and Flask through portholes), the hammers-in-the-heart image and the flag order kept.

### 135.38  `3bfead74b6d56c02` → `d0274a4321f6aad0`
- **R1** (unmodernized): Verbatim ("fagged", "knotted hamper", "the White Whale's way now began to abate"). Modernized; the either/or hedge and "as it seemed" kept.

### 135.39  `1079b3951082c1bc` → `d0297a28883dbb00`
- **R1** (unmodernized,convention): "Heed them not", "'tis the better rest"; curly quotes.

### 135.40  `212fab70297577e3` → `e134411c8c891a3a`
- **R1** (convention): Curly quotes only.

### 135.41  `94b0c0075382d7d2` → `eadc9aff8630a81f`
- **R1** (convention): Curly quotes, unspaced dashes; "and so saying" modernized.

### 135.42  `574c2aed5bf7b708` → `9a5ff5d7d3d4b7cf`
- **R1** (unmodernized): Verbatim ("fairly within", "foreknew not", "nigh flank", "a combing wave"). Split into modern sentences; Monadnock hump, iron and curse, morass, three oarsmen's fates kept.

### 135.43  `2f90ec702947fa2b` → `e56c3f36419ec2f3`
- **R1** (unmodernized): "a mighty volition of ungraduated, instantaneous swiftness". Modernized.

### 135.44  `7a160ad729955361` → `6b50e817ee2ccd0b`
- **R1** (unmodernized,convention): "'tis whole again"; curly quotes.

### 135.45  `2e42d492a71e40c9` → `14f9c0c68c0352e6`
- **R1** (unmodernized): Verbatim ("evolution", "bethinking it", "smiting his jaws"). Modernized; "it may be" hedge kept.

### 135.46  `94c0ad1fdf29ac1d` → `a8166c02b3611b1b`
- **R1** (unmodernized,convention): "Is't night?"; curly quotes.

### 135.47  `8e4748182252ba0f` → `17974acd9e549a80`
- **R1** (convention): Curly quotes only.

### 135.48  `0d26af559667ec50` → `01793099da781bb7`
- **R1** (unmodernized,convention): "thy depths", "ere it be for ever too late", "Will ye not"; curly quotes.

### 135.49  `d540f1448746331f` → `b6e940286896b799`
- **R1** (unmodernized): "the before whale-smitten bow-ends", "bale". Modernized.

### 135.50  `dfc9bf4ec6b65d7f` → `c3e1abb014a49a71`
- **R1** (unmodernized): Verbatim ("that one beholding instant", "as his own forward-flowing heart"). Modernized.

### 135.51  `e06f51073f681303` → `d5611b49f6ce3ec5`
- **R1** (unmodernized,convention): "all ye sweet powers", "ye fools", "lo, thy work", "Nay, nay"; curly quotes.

### 135.52  `18bab97abe551678` → `ade7c37dcc4ad960`
- **R1** (unmodernized,convention): "thee, thou grinning whale", "Look ye", "ye assassins", "would ye but", "Why fly ye not", "mattrass", "ere"; curly quotes. Grammar modernized; Stubb's grin refrain, mattress, sun-moon-stars, drawers, cherries kept.
- **R2-acc** (unmodernized): "off shoes and jacket to it" is elliptical 1851 idiom; hard to parse aloud.

### 135.53  `ca89a4bffd44a4c0` → `ec60ebe61936df20`
- **R1** (unmodernized,convention): "ere this"; curly quotes.

### 135.54  `ee7ccd6e355f89a8` → `8631cf2ed368386b`
- **R1** (unmodernized): Verbatim ("darted from their various employments", "spite of all", "harpooneers"). Modernized; "harpooners" per edition.

### 135.55  `ba23f06919789225` → `b4374db3ea82de6f`
- **R1** (convention): Curly quotes, unspaced dash; text kept.

### 135.56  `989366ce9b7ac04e` → `ddbe0671e5f2ca47`
- **R1** (unmodernized): "lay quiescent". Modernized lightly.

### 135.57  `71f00c38264fbaf3` → `08e766b9e6ac17f1`
- **R1** (unmodernized,convention): Candidate's partial thee→you pass left "pour you now in", "Towards", "let me then tow to pieces"; curly quotes, unspaced dash. Grammar modernized, full elevated rhetoric kept: spires/keel/hull/deck/helm/prow apostrophe, "topmost greatness ... topmost grief", billows of my whole bygone life, "Toward you I roll, you all-destroying but unconquering whale ... from hell's heart I stab at you; for hate's sake I spit my last breath at you", "Thus, I give up the spear!"

### 135.58  `553efec32d8cbf65` → `baa1168228051a22`
- **R1** (unmodernized): Verbatim ("voicelessly as Turkish mutes bowstring their victim", "ere"). Modernized; image kept.
- **R2-fid** (technical): Source "the line ran through the grooves" is plural; candidate "through the groove" changes the detail.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.65).

### 135.59  `b5ebf3aba203702a` → `08bebd3b6d1308de`
- **R1** (unmodernized): Verbatim ("they through dim, bewildering mediums saw", "harpooneers"). Modernized; "Fata Morgana" given a brief accurate gloss (mirage); infatuation/fidelity/fate triad kept.

### 135.60  `bbbb2b49881ea3b9` → `c9e0753c21aa3c18`
- **R1** (unmodernized): Verbatim ("whelmings intermixingly poured", "etherial thrill", "incommoding"). Modernized; the sky-hawk, "bird of heaven", archangelic shrieks, flag of Ahab, Satan image kept intact; period term "savage" kept per brief.

### 135.61  `ad16402991d371ce` → `6f1609b2b48187f4`
- **R1** (unmodernized): "small fowls". Modernized lightly; final cadence kept.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.81).

### 136.2  `306ab0e61dac8f14` → `792b12c7ec8330f6`
- **R1** (unmodernized): Mostly modern already, but kept inverted "like another Ixion I did revolve", the verbless "Till, gaining that vital center, the black bubble upward burst", and "main" for sea. Light repair; rest of the candidate wording kept.
- **R2-acc** (unmodernized): "— the same one who, when on the last day the three men were tossed out..." dangles; the reader cannot tell "the same one" is the narrator rather than the bowsman.
- **R4-mod** (unmodernized): Candidate was near-verbatim 1851 (source similarity >=0.85); sentence-level modern rendering, all content kept (new similarity 0.56).
