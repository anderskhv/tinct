# Temporary edition availability holds — 2026-09-25

## Release state

Prepared against main `447a7a650b9aec567251a638dc85b303d3b10477`.
Implementation and CI/browser acceptance are in progress. Not merged, not deployed, not production-verified.
Baseline production bundle: `index-_UsWGnmb.js`.
Prior deploy [36166609484](https://github.com/anderskhv/tinct/actions/runs/36166609484) succeeded.
Release owner task “Tinct-coder” was contacted before edits and confirms no competing release.
Its handoff requires resolving prior failed production checks before publication:
- followups 36169994998 and Meditations 36169994976: HTTP 404 assertion in check-reviewed-characters.cjs:51; URL absent from log.
- Chapter Preview 36169994984: Next chapter locator timeout at line 142.
- Shakespeare 36166609436: smoke-wait timeout before the subsequently successful deploy.
These have not been waived. A separate prerequisite repair requires scope coordination; do not bundle unrelated repairs into this change.

## Decision boundary

Audit branch `claude/laughing-maxwell-3d7f5l`, commit `e24c16e8`, is a lead, not production proof.
Whole-book JSON was fetched directly from tinct.app on September 25 after release-owner coordination. Exact hashes below.
Fresh source copies were separately retrieved. The decisive passages were inspected in current served JSON, not merely inferred from scores.
Current main history through #198 and open PRs contain no repair for the severe defects below.
The audit's EXISTING-REPAIRS register says Macbeth candidates inherit the omissions; no As You Like It, Faust or Jerusalem text repair is ready. Named-branch searches found no newer repair for those gaps.
Confessions #192 repairs modern-en, not modern-da. Vindication's English candidate does not repair Danish.
No translation is authored or semantically approved here.

| Book | Editions held | Current production evidence | Remains available | Restore only when |
|---|---|---|---|---|
| Macbeth | original-en, modern-en, modern-da | Ch 8 ends Exit Servant → bell → Exit, with no dagger speech. PG1533 contains it. The audit's 34-speech total is not independently recounted here; this decisive major omission remains in all three editions. | No sound registered edition remains; whole-book discovery hold. | Complete source comparison restores missing speeches in the exact candidate, with reviewed coordinate migration and annotation recovery before structural changes ship. |
| As You Like It | original-en, modern-en, modern-da | Starts with lawn before Duke's palace / Rosalind and Celia (Scene 2), omitting Orlando/Oliver's opening. Ch 17 ends in World Library/Gutenberg licence prose, translated in Danish. PG1523 confirms missing Scene 1. | No sound registered edition remains; whole-book discovery hold. | Opening scene restored, scene structure checked, reading-text licence contamination separated, and saved coordinates safely migrated. |
| Faust Part One | original-en, modern-en, modern-da | 4.0 starts midway through Faust's opening; 6.0 loses the Word/Sense/Power/Deed passage. Original-en 2.4 contains facing-page German. Served prose matches Hayward/Buchheim scan while registry says Taylor; Danish ending has English dialogue. | original-de, explicitly German. Its appended transcription note is known, but is not treated as a severe missing-body defect. Remove Faust's old whole-book discovery exclusion so German remains selectable. | Verified complete English/Danish text without accidental language intrusions, accurate translator identity, and safe coordinate/card migration. No mere relabelling of broken text. |
| Jerusalem | modern-en, modern-da | 1.24 replaces the long discussion of Brita with a sheriff/arrest ending; 6.59 drops the charcoal-kiln story after the food basket. Howard PG15837 and the Swedish scan carry the missing material, not the replacement. Audit's 51-paragraph count remains a referenced extent, not a new exhaustive count. | Howard original-en. Structural heading issues and optional front matter alone do not justify withdrawal. | Source-verified restoration of omitted endings and removal of invented substitutions across the exact edition, preserving annotations. |
| Confessions | modern-da | Books 10–13 contain exactly 206 [TBD] paragraphs. | original-en and #192 modern-en. | Complete verified Danish Books 10–13; no placeholders; all earlier books and saved locations checked. |
| Paradise Lost | modern-da | Book 5 ends at the heavenly feast, before Satan's revolt and Abdiel's rebuke; English retains the passage. The estimate of 11,400 missing words is historical audit scope, not a new word-for-word certification. | Both English editions; no hold for optional Arguments/front matter. | Complete verified Danish body, including Book 5 ending and audited omissions in Books 1, 2 and 6. |
| Heart of Darkness | modern-da | All 87 paragraphs of Part III are byte-identical English from original-en. | Both English editions. | Verified Danish Part III and whole-edition language check. |
| Discourse on Inequality | modern-da | All 67 paragraphs of Part II (chapter 4) are byte-identical English. | Both English editions. | Verified Danish Part II and whole-edition language check. |
| Vindication of the Rights of Woman | modern-da | English copies dominate chapters 1–6 and 10–15 (e.g. all 76 in chapter 4, all 33 in chapter 11). This is identifiable English prose, not a similarity-based withdrawal. | Both English editions. | Whole-edition Danish completeness and language verification. |

Danish was already excluded from discovery by the English-first policy; these new holds additionally stop new reader-settings selection and explain availability to saved readers.
No rights-based withdrawal is made. No source text, audio, card, user data, schema or accepted translation is modified.

## Source witnesses fetched again

- [Macbeth PG1533](https://www.gutenberg.org/cache/epub/1533/pg1533.txt), SHA-256 `1371a47e68246197f7f57017a83386fed75dbfebfd0ff51b4524921a3b38ff5e`.
- [As You Like It PG1523](https://www.gutenberg.org/cache/epub/1523/pg1523.txt), `1c0b8906545dafea408e06e988dbb036e1de1bddb33ce79eb9f09d3979645a10`.
- [Howard Jerusalem PG15837](https://www.gutenberg.org/cache/epub/15837/pg15837.txt), `cc5df0ba5e17cba5dbfebc6ce71eeb0571d8910a9e981df97cd84dcd1ebcff98`.
- [Hayward/Buchheim 1892 scan OCR](https://archive.org/download/cu31924026191910/cu31924026191910_djvu.txt), `bf20329598ec2df74ffefd7b2c85772bb908e117038a5031fb9c8774cf86f9aa`.
- [Jerusalem Swedish scan OCR](https://archive.org/download/jerusalem0000lage_m2j3/jerusalem0000lage_m2j3_djvu.txt), `44a1ea11cc469d846e7a7088e750eb0284ad98838b39e1eb9bbde825feba6f02`.
- Original audit [verification records](https://github.com/anderskhv/tinct/tree/e24c16e8/books/wip/inventory-completeness-audit/verification): V01, V06, V10, V11 and the confirmed-defect/repair registers.

## Production SHA-256 inventory

Reader-versioned URLs were also fetched with `?v=447a7a650b9aec567251a638dc85b303d3b10477`. All 16 held hashes match both variants. Of all 28 inspected assets, only Confessions modern-en differs: the unversioned cached URL serves `420b17153b6cb46f6a74e41bb633dcbc88099975720dac27c6bfb0bf6be51b4e`; the versioned current reader serves the accepted repair shown below.

URLs are `https://tinct.app/data/editions/{book}-{edition}.json` with that reader version parameter.

| Book/edition | SHA-256 |
|---|---|
| macbeth/original-en | `2650bcc666428a808584fd6f99534f71474a4e99a085c7ae6b87234e24e30608` |
| macbeth/modern-en | `0c85273086804fdd02abee81842de15338b61a2288bb26805e9b2f2d505d02f1` |
| macbeth/modern-da | `c10696221af2265dfa00fdc8f09a27dfd1d2a5289da347d3a6fd82a1de125d57` |
| as-you-like-it/original-en | `2c04249b4ea528612cfa8f41031ed7a78fff2e453f15fbccf7d55f03905ce179` |
| as-you-like-it/modern-en | `df270fa2b605950982107d654d395fe0eaa0226208f9a5b185d06d7da2b5f8e4` |
| as-you-like-it/modern-da | `80064e115bd31f194fa60e16f1ec08ee4b99efc5f1cc199ec7a4ac34dd52d8ef` |
| faust-part-1/original-en | `bff236838e6e5ee6baeb7afd16c6b1c1b2872f87605f21e79e4cd5198a997395` |
| faust-part-1/modern-en | `9e66da5b45267bfb3cae70905897d9f9c1397bd1d1c8b080bf325cda0046d28b` |
| faust-part-1/modern-da | `ce719108b40e89f1f008d16a62e1fa7dc9e1f1600b2481439696873f9b471191` |
| faust-part-1/original-de | `edb0081f759c0eb256ed303711932af743784a87f1cc6716dab7d15365bc83e5` |
| jerusalem/original-en | `747b53bedd58d9ba65877185247a8545dac4bddcd1e8219cf5315da00cdac47c` |
| jerusalem/modern-en | `6cdbf3a5904a26d5edffc0ad45325f29af16e8cd6bc0a959f92450c3b33c00ee` |
| jerusalem/modern-da | `c1552e9a9a3a311b75e1d83ee104ff33c71c1a538bf68fd4bfd5d4f000a78223` |
| confessions/original-en | `64b39a8ae77d7175c904625fcc0bf3de13cb59e346e964b37ec8f5e47d95a6d7` |
| confessions/modern-en | `949e4f77fd317601cc39dc701cfbc3f5f82a5b5a842c34e93c9a6328ef78add7` |
| confessions/modern-da | `4935d43ca05f87da69b94c37d3b2079ed8591a7769cf45f57a213690ec0b19bb` |
| paradise-lost/original-en | `56c47aa192f17e38ae996d1abfc268dc0090a8c365a2e8f7578160dea2f81185` |
| paradise-lost/modern-en | `87727e7760ea487d5b4527570d9bdaeaeb3158c782ed372f9c0a554cbf8562ba` |
| paradise-lost/modern-da | `266ada0a3a74b0838b1dfe4a54a08d2959f03d627ddc955e954fcb306ead117c` |
| heart-of-darkness/original-en | `9d7234592e087f7d60a6dd460551347da283d5225fdcf81099a4b78b62bcede8` |
| heart-of-darkness/modern-en | `169c288c26f0c8c07be6d181855123cd982023a0b780262576944f5833afa435` |
| heart-of-darkness/modern-da | `b0d43952a120819a451538113d82947f922ddaba0535257fb19bd909ba834444` |
| discourse-on-inequality/original-en | `d3e7e7975ac634b98f685abcd7f6aae64b3621a74db31e1d229f2b6cfc4ba3bd` |
| discourse-on-inequality/modern-en | `78356e4ffdf62ec28c056fe871521967da428d31fafe694cad8b064f7019c62f` |
| discourse-on-inequality/modern-da | `383db95bbf30559d6ba41eb2045d37f2a24db49e9a3e80b2e246efb8e6b2c224` |
| vindication-rights-of-woman/original-en | `3e168f00ba7901f8a31cc36902f0046e9555d6fd5245566c437b029331e91aac` |
| vindication-rights-of-woman/modern-en | `4e7e6143670a4ca29fa6f004587578e56102ac7b2f1b00814ddefb303084ba63` |
| vindication-rights-of-woman/modern-da | `41ec7c251015ca8079dc88e5845757ac634fbf4c62f6ab03160ed5e686fc8880` |

## Recovery and verification contract

The registry and raw assets stay intact. Temporary holds never enter SUCCESSORS/migrateWithheldEdition.
Discovery and defaults exclude held editions; whole-book hides apply only to Macbeth and As You Like It.
Saved handoffs retain exact edition and coordinates. The unavailable panel explains the defect and offers an explicit preserved-text recovery view, using the existing Contents and annotation reader. Position/history writes and playback are suspended while a hold is active, including recovery.
No automatic fallback or Danish/English relabelling occurs.

Required before merge: full verify CI, availability acceptance, direct-link/SEO routing tests, phone and desktop saved-data browser fixtures, and resolved prior-release acceptance.
Required after deploy: successful deploy/smoke, exact new bundle, production catalogue/search and direct links, all 16 held identities, recovery UI and data preservation in isolated contexts, unchanged raw-content hashes.
Account/device verification must distinguish mocked or seeded data from real authenticated production data; do not claim real-account preservation testing from a mock.
