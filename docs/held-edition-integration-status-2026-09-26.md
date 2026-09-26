# Held editions: integration status, 26 September 2026

## Status at 16:25 UTC

This is a partial integration receipt, not a declaration that repaired editions are live.

| Work | Implemented | Deployed/executed | Production verified |
|---|---|---|---|
| Catalogue, search, selection holds and preserved-reader recovery (#201/#203) | Yes | Yes | All 16 identities and 32 browser cases |
| Direct audio API hold enforcement (#211) | Yes | Yes, main `2638c5aaf14ea885f926b486ee7af584deab235c` | 48 held endpoints |
| Exact defective-audio retirement (#212 operational branch) | Yes | Executed once | 14,279 acknowledgements; empty target prefixes; unaffected siblings identical |
| Latest content hashes, baseline checks, draft coordinate maps and character projections | Yes, verification artifacts | Cloud verification only | Baselines match served files; candidates are not live |
| Saved-reader migration and earlier-text recovery for repaired editions | Incomplete | No | No |
| Repaired content publication / lifting holds | No | No | No |
| Actual affected-reader counts | Access unavailable | No query performed | Unknown, not zero |

[PR #211](https://github.com/anderskhv/tinct/pull/211) passed 2,836 tests (one skipped), build and bundle verification. [Deployment 36252836601, attempt 2](https://github.com/anderskhv/tinct/actions/runs/36252836601/attempts/2) passed all release gates at 16:17:56 UTC. Its production-verified bundle is `/assets/index-CSxMm1hw.js`; Worker version `5fe1f4e5-0db5-4334-8a95-05757c5716bd`.

Attempt 1 deployed the same source revision but later failed the Great Expectations English/Danish language-switch acceptance. The assertion was not weakened. Three isolated diagnostic cases passed, then the unchanged full deployment retry passed. A readiness race is a hypothesis, not an established diagnosis or claimed code fix.

The serialized release slot has been handed to the Design task for #213. Its later deployment may replace the bundle above. This receipt records the verified held-edition release, not a claim that this bundle remains current indefinitely.

## Exactly what remains hidden

No additional book or text edition was hidden during this integration turn. All 16 existing holds remain. The two whole-book discovery holds remain Macbeth and As You Like It.

| Book | Held editions | Decisive live defect (unchanged baseline) | Still available | Restoration requirements |
|---|---|---|---|---|
| Macbeth | original-en, modern-en, modern-da | Dagger speech absent; accepted repair restores the reported missing speech blocks | No registered edition is open to new selection | Integrate pinned accepted three-edition repair; safe saved-place/annotation handling; reviewed character projection; re-anchor live Danish patches; production source checks |
| As You Like It | original-en, modern-en, modern-da | Act 1 Scene 1 absent; licence prose in reading text; incorrect scene structure | No registered edition is open to new selection | Integrate accepted 23-scene repairs, accepted onboarding/threads, character projection and coordinate recovery; verify all entry points |
| Faust Part I | original-en, modern-en, modern-da | Missing body passages, accidental German/English intrusions, incorrect English attribution | original-de, explicitly German | Publish Taylor replacements under distinct identities; preserve old text and all old reader coordinates; explicit reader choice; accepted new character card; accurate translator labels; production acceptance |
| Jerusalem | modern-en, modern-da | Dropped endings and invented replacement passages | Howard original-en | Integrate latest whole-edition repairs and heading corrections; resolve two reviewed character anchors; preserve old annotations across rewritten paragraphs and chapter changes |
| Confessions | modern-da | 206 placeholder paragraphs in Books 10–13 | Both English editions | Integrate accepted 462-paragraph candidate; merge Danish revision handling without altering prior English migration; preserve unresolved annotations |
| Paradise Lost | modern-da | Major body omissions including Book 5 ending | Both English editions | Match acceptance to exact final Danish candidate; current additions have no matching acceptance found; integrate structural maps and character projection |
| Heart of Darkness | modern-da | Part III offered as Danish is English | Both English editions | Integrate accepted Danish candidate with revision-aware annotation recovery and production checks |
| Discourse on Inequality | modern-da | Part II offered as Danish is English | Both English editions | Integrate accepted Danish body plus Appendix/footnotes, corresponding English structure, verified maps/card, and reader recovery |
| Vindication of the Rights of Woman | modern-da | Substantial chapters offered as Danish contain English | Both English editions | Integrate exact accepted candidate; preserve old quote/note context wherever wording changes; production checks |

Danish remains subject to the existing English-first discovery policy even after a defect hold is eventually lifted. No silent fallback or language relabelling is introduced.

Optional front matter, similarity scores and debatable wording did not justify new holds. No rights-based withdrawal was made. The As You Like It provenance question remains documented; the website notice alone was not treated as sufficient withdrawal evidence.

The prior [hold evidence report](https://github.com/anderskhv/tinct/pull/201) records the actual defect passages, source witnesses and source hashes. This turn reverified that the corresponding production hashes remain unchanged; it did not claim a fresh independent semantic review of every candidate.

## Audio retirement: complete

[Cleanup and post-cleanup acceptance run](https://github.com/anderskhv/tinct/actions/runs/36253528695), [receipt artifact](https://github.com/anderskhv/tinct/actions/runs/36253528695/artifacts/10909054164).

- 13,906 MP3 recordings, 290 manifests and 83 timing files deleted.
- Total: **14,279 distinct objects, 1,642,373,839 bytes**.
- All 7,663 unaffected sibling objects retained with identical object identity.
- All 48 Fish/Google/Grok edition-mapping prefixes were already empty. Shared content-addressed narration blobs were not deleted.
- All 16 text hashes remained unchanged. No account data was queried or modified. No audio was regenerated.
- Deletion required exact agreement with the original inventory SHA-256 `bada011b6e9a453504a806bd81292dbae251167d1a166383b1a8f2671da435b7`, including each key, size and ETag. The receipt retains every deletion acknowledgement.

| Edition | Objects deleted | Bytes |
|---|---:|---:|
| macbeth/original-en | 882 | 102883259 |
| macbeth/modern-en | 889 | 106551878 |
| macbeth/modern-da | 862 | 30433527 |
| as-you-like-it/original-en | 944 | 124838943 |
| as-you-like-it/modern-en | 937 | 123459436 |
| as-you-like-it/modern-da | 935 | 35706877 |
| faust-part-1/original-en | 1302 | 205211700 |
| faust-part-1/modern-en | 1297 | 244401421 |
| faust-part-1/modern-da | 951 | 58346718 |
| jerusalem/modern-en | 1817 | 227482765 |
| jerusalem/modern-da | 1805 | 94814435 |
| confessions/modern-da | 483 | 82954452 |
| paradise-lost/modern-da | 0 | 0 |
| heart-of-darkness/modern-da | 196 | 43179884 |
| discourse-on-inequality/modern-da | 175 | 39849700 |
| vindication-rights-of-woman/modern-da | 804 | 122258844 |

The 48 production audio-route probes returned explanatory 503/no-store responses. Both before and after deletion, 32 isolated phone WebKit / desktop Chromium cases verified saved-edition identity, explicit preserved-text recovery, visible notes, byte-identical seeded places/highlights/notes/history and zero account writes.

These were fixtures against production UI, not tests of an actual customer's signed-in account or every offline device.

## Latest content reconciliation

Pinned source: `claude/cool-clarke-ngd780` at `a5e89816bdf53076aaf7301ad5da2716dcb7d149`. The original consolidated handoff at `dde75840` predates later structural corrections.

[Latest reconciliation run](https://github.com/anderskhv/tinct/actions/runs/36254505233), artifact `10909254483`: 22 candidates pass technical JSON/hash/baseline checks. Twenty-one have acceptance records for their stated scopes; latest Paradise Lost modern-da front matter is staged without matching acceptance found.

[Latest character projection run](https://github.com/anderskhv/tinct/actions/runs/36254686828), artifact `10909294550`:

| Book | Mechanically verified moved anchors | Status |
|---|---:|---|
| Macbeth | 890 | Ready, including reviewed exceptions |
| As You Like It | 435 | Ready, including reviewed removal of two licence-boilerplate mentions |
| Paradise Lost | 617 | Ready |
| Discourse on Inequality | 219 | Ready |
| Jerusalem | 9 | Two modern-en mentions unresolved: mentions/4 at old 2.8, mentions/6 at old 7.38 |
| Faust replacement | — | New source-specific character card not supplied |

Eighteen non-Faust coordinate drafts cover every old paragraph, retaining old text and explicit unresolved removals. They are verification artifacts, not installed migrations. Faust has no invented cross-source coordinate map. Split paragraphs, rewritten translation paragraphs, legacy storage, delayed offline records, chapter completion history, and recovery access still require implementation and regression coverage before publication.

Additional accepted content includes As You Like It onboarding/threads and Faust onboarding. Faust German apparatus acceptance is narrow: remaining speaker-attribution issues at chapter 16 paragraphs 4/5, chapter 21 paragraphs 1/2 and chapter 25 Titania/Orchester Tutti are not claimed fixed. Vindication's 100% fidelity review covers 544 repaired paragraphs, not all 778 paragraphs; chapters 7–9 were unchanged. Confessions combines 256 earlier and 206 repaired paragraphs for 462/462 coverage.

### Exact hashes

Production hashes below matched the current served files during reconciliation. Candidate hashes are staged bytes, not live files.

| Edition | Production SHA-256 | Candidate SHA-256 | Acceptance |
|---|---|---|---|
| macbeth/original-en | `2650bcc666428a808584fd6f99534f71474a4e99a085c7ae6b87234e24e30608` | `9df987bdf1a1a8c50d44e0c4c2ab6a18e2580f47114810232e8022eecca207c6` | Recorded for stated scope |
| macbeth/modern-en | `0c85273086804fdd02abee81842de15338b61a2288bb26805e9b2f2d505d02f1` | `c597a985ce096a923b03a5072e52f6d8bd5bbc44c0c11fd924ff4e0019351bec` | Recorded for stated scope |
| macbeth/modern-da | `c10696221af2265dfa00fdc8f09a27dfd1d2a5289da347d3a6fd82a1de125d57` | `6441958cec4ddadeb9408414db103cb8228ad9694c39a19c7e359261417a3a18` | Recorded for stated scope |
| as-you-like-it/original-en | `2c04249b4ea528612cfa8f41031ed7a78fff2e453f15fbccf7d55f03905ce179` | `8ab533a42958f570a59d12e686793d4397ff0efe6c9b061acfb468d645254358` | Recorded for stated scope |
| as-you-like-it/modern-en | `df270fa2b605950982107d654d395fe0eaa0226208f9a5b185d06d7da2b5f8e4` | `5a4e95bbf50e3affb4581cc5acd53d19322642e81894342bc56bd03fc7f75e48` | Recorded for stated scope |
| as-you-like-it/modern-da | `80064e115bd31f194fa60e16f1ec08ee4b99efc5f1cc199ec7a4ac34dd52d8ef` | `1229f6875d9177eff984f7ed40d57c883ba88c9844e63bb8154406bd6b8b25b5` | Recorded for stated scope |
| faust-part-1/original-en | `bff236838e6e5ee6baeb7afd16c6b1c1b2872f87605f21e79e4cd5198a997395` | `e36200c60fe9e763555461ea2d65f9772058aa737635688e7b79ad4010bee79d` | Recorded for stated scope |
| faust-part-1/modern-en | `9e66da5b45267bfb3cae70905897d9f9c1397bd1d1c8b080bf325cda0046d28b` | `7c7b27df8c77e069e8641b8154f67f26d57afab36d73072865d061998d201dfe` | Recorded for stated scope |
| faust-part-1/modern-da | `ce719108b40e89f1f008d16a62e1fa7dc9e1f1600b2481439696873f9b471191` | `04e36f410cdaea3019cc593bdb2c52fe2ffed56eca39db7fc2ad3d178f980bb5` | Recorded for stated scope |
| jerusalem/original-en | `747b53bedd58d9ba65877185247a8545dac4bddcd1e8219cf5315da00cdac47c` | `20d0ed3ecce5e4b440fec2e4373b337222c6a734f37f9cf769d94cecc248c48a` | Recorded for stated scope |
| jerusalem/modern-en | `6cdbf3a5904a26d5edffc0ad45325f29af16e8cd6bc0a959f92450c3b33c00ee` | `47c0c1c78ef4b342c793f7ffd07dabbbe96334c67d7ca85dbfa9aafdf9f521b0` | Recorded for stated scope |
| jerusalem/modern-da | `c1552e9a9a3a311b75e1d83ee104ff33c71c1a538bf68fd4bfd5d4f000a78223` | `702f29c4e1ee0785c7cbf72f29b29315154ff2ca82e769fc3ae6d2475449dc2c` | Recorded for stated scope |
| confessions/modern-da | `4935d43ca05f87da69b94c37d3b2079ed8591a7769cf45f57a213690ec0b19bb` | `1a0fad4ebb7be4c49d85f19254aa7fda8481bdd861ba8905ee56a959836383c8` | Recorded for stated scope |
| paradise-lost/modern-da | `266ada0a3a74b0838b1dfe4a54a08d2959f03d627ddc955e954fcb306ead117c` | `a6885a77e8d287577cb78cbc56d5b7b9a515bfa8e8f0aef48e7e93e57f3b735f` | Latest additions pending |
| heart-of-darkness/modern-da | `b0d43952a120819a451538113d82947f922ddaba0535257fb19bd909ba834444` | `2bc45f4bf5a3280a1c86099e9f83357a9fdfdc09492b62f5936233d4e13074c9` | Recorded for stated scope |
| discourse-on-inequality/modern-da | `383db95bbf30559d6ba41eb2045d37f2a24db49e9a3e80b2e246efb8e6b2c224` | `3bb05f3a7eefeef7ccf770f8ffca28feca628a52afa56653724cadc661171c21` | Recorded for stated scope |
| vindication-rights-of-woman/modern-da | `41ec7c251015ca8079dc88e5845757ac634fbf4c62f6ab03160ed5e686fc8880` | `a6c4dd4a2d7f603c88756f7e3ac0d9173565864bcc7a6f9d40af8cc48652b2af` | Recorded for stated scope |
| faust-part-1/original-de | `edb0081f759c0eb256ed303711932af743784a87f1cc6716dab7d15365bc83e5` | `1ecb93d97051475d628cb94a1dc487baa7d113665ff275e4df565439bf5e3b9b` | Recorded for stated scope |
| paradise-lost/original-en | `56c47aa192f17e38ae996d1abfc268dc0090a8c365a2e8f7578160dea2f81185` | `1ef6b3667859b7d4e5bd7c9e615880395687fb3b4df67a1dd9829f3adcd9398c` | Recorded for stated scope |
| paradise-lost/modern-en | `87727e7760ea487d5b4527570d9bdaeaeb3158c782ed372f9c0a554cbf8562ba` | `32e8c716ccc80f93df1aa4761718642f9c86997682fb4af0a55ec0c8ed1bde32` | Recorded for stated scope |
| discourse-on-inequality/original-en | `d3e7e7975ac634b98f685abcd7f6aae64b3621a74db31e1d229f2b6cfc4ba3bd` | `6df7da14bcd7bb997f68a61890ef96f8205ffe02ab629f5e8aeac24153fa45be` | Recorded for stated scope |
| discourse-on-inequality/modern-en | `78356e4ffdf62ec28c056fe871521967da428d31fafe694cad8b064f7019c62f` | `2fba90eed46eed2611730f8b9e43e1eeadd54e7e48bbe64ad24a271399df5fc6` | Recorded for stated scope |

### Candidate source paths

- [macbeth/original-en](https://github.com/anderskhv/tinct/blob/a5e89816bdf53076aaf7301ad5da2716dcb7d149/books/wip/macbeth-completeness-repair/editions/macbeth-original-en.json)
- [macbeth/modern-en](https://github.com/anderskhv/tinct/blob/a5e89816bdf53076aaf7301ad5da2716dcb7d149/books/wip/macbeth-completeness-repair/editions/macbeth-modern-en.json)
- [macbeth/modern-da](https://github.com/anderskhv/tinct/blob/a5e89816bdf53076aaf7301ad5da2716dcb7d149/books/wip/macbeth-modern-da-repair/editions/macbeth-modern-da.json)
- [as-you-like-it/original-en](https://github.com/anderskhv/tinct/blob/a5e89816bdf53076aaf7301ad5da2716dcb7d149/books/wip/as-you-like-it-completeness-repair/editions/as-you-like-it-original-en.json)
- [as-you-like-it/modern-en](https://github.com/anderskhv/tinct/blob/a5e89816bdf53076aaf7301ad5da2716dcb7d149/books/wip/as-you-like-it-completeness-repair/editions/as-you-like-it-modern-en.json)
- [as-you-like-it/modern-da](https://github.com/anderskhv/tinct/blob/a5e89816bdf53076aaf7301ad5da2716dcb7d149/books/wip/as-you-like-it-modern-da-repair/editions/as-you-like-it-modern-da.json)
- [faust-part-1/original-en](https://github.com/anderskhv/tinct/blob/a5e89816bdf53076aaf7301ad5da2716dcb7d149/books/wip/faust-part-1-english-repair/editions/faust-part-1-original-en.json)
- [faust-part-1/modern-en](https://github.com/anderskhv/tinct/blob/a5e89816bdf53076aaf7301ad5da2716dcb7d149/books/wip/faust-part-1-english-repair/editions/faust-part-1-modern-en.json)
- [faust-part-1/modern-da](https://github.com/anderskhv/tinct/blob/a5e89816bdf53076aaf7301ad5da2716dcb7d149/books/wip/faust-part-1-modern-da-repair/editions/faust-part-1-modern-da.json)
- [jerusalem/original-en](https://github.com/anderskhv/tinct/blob/a5e89816bdf53076aaf7301ad5da2716dcb7d149/books/wip/jerusalem-completeness-repair/editions/jerusalem-original-en.json)
- [jerusalem/modern-en](https://github.com/anderskhv/tinct/blob/a5e89816bdf53076aaf7301ad5da2716dcb7d149/books/wip/jerusalem-completeness-repair/editions/jerusalem-modern-en.json)
- [jerusalem/modern-da](https://github.com/anderskhv/tinct/blob/a5e89816bdf53076aaf7301ad5da2716dcb7d149/books/wip/jerusalem-modern-da-repair/editions/jerusalem-modern-da.json)
- [confessions/modern-da](https://github.com/anderskhv/tinct/blob/a5e89816bdf53076aaf7301ad5da2716dcb7d149/books/wip/confessions-modern-da-repair/editions/confessions-modern-da.json)
- [paradise-lost/modern-da](https://github.com/anderskhv/tinct/blob/a5e89816bdf53076aaf7301ad5da2716dcb7d149/books/wip/paradise-lost-modern-da-repair/editions/paradise-lost-modern-da.json)
- [heart-of-darkness/modern-da](https://github.com/anderskhv/tinct/blob/a5e89816bdf53076aaf7301ad5da2716dcb7d149/books/wip/heart-of-darkness-modern-da-repair/editions/heart-of-darkness-modern-da.json)
- [discourse-on-inequality/modern-da](https://github.com/anderskhv/tinct/blob/a5e89816bdf53076aaf7301ad5da2716dcb7d149/books/wip/discourse-on-inequality-modern-da-repair/editions/discourse-on-inequality-modern-da.json)
- [vindication-rights-of-woman/modern-da](https://github.com/anderskhv/tinct/blob/a5e89816bdf53076aaf7301ad5da2716dcb7d149/books/wip/vindication-modern-da-repair/editions/vindication-rights-of-woman-modern-da.json)
- [faust-part-1/original-de](https://github.com/anderskhv/tinct/blob/a5e89816bdf53076aaf7301ad5da2716dcb7d149/books/wip/faust-part-1-original-de-fix/editions/faust-part-1-original-de.json)
- [paradise-lost/original-en](https://github.com/anderskhv/tinct/blob/a5e89816bdf53076aaf7301ad5da2716dcb7d149/books/wip/paradise-lost-frontmatter-repair/editions/paradise-lost-original-en.json)
- [paradise-lost/modern-en](https://github.com/anderskhv/tinct/blob/a5e89816bdf53076aaf7301ad5da2716dcb7d149/books/wip/paradise-lost-frontmatter-repair/editions/paradise-lost-modern-en.json)
- [discourse-on-inequality/original-en](https://github.com/anderskhv/tinct/blob/a5e89816bdf53076aaf7301ad5da2716dcb7d149/books/wip/discourse-on-inequality-frontmatter-repair/editions/discourse-on-inequality-original-en.json)
- [discourse-on-inequality/modern-en](https://github.com/anderskhv/tinct/blob/a5e89816bdf53076aaf7301ad5da2716dcb7d149/books/wip/discourse-on-inequality-frontmatter-repair/editions/discourse-on-inequality-modern-en.json)

## Remaining work and ownership

Codex still owes the release implementation: immutable earlier-text recovery, revision-aware saved places and annotations in both reader paths, cross-device/late-offline handling, Faust's separate identity and explicit choice, registry/Compare/onboarding/threads/card integration, live patch reconciliation, final CI, serialized deployment and production verification. Draft maps alone do not satisfy these requirements.

Claude content dependencies: exact reviewed Jerusalem anchor replacements or removal; the Faust replacement character card; acceptance matching Paradise Lost modern-da `a6885a77…`; remaining Faust German attributions if claiming all major findings closed. Codex must not author or semantically approve these under [repository AGENTS.md](https://github.com/anderskhv/tinct/blob/2638c5aaf14ea885f926b486ee7af584deab235c/AGENTS.md): “While Anders assigns content work to Claude, Codex owns code and technical pipelines only.”

Active-reader impact remains unknown. This task has no verified authorized read-only service-role/admin database connection. No conclusion can be drawn from the absence of access. Requested evidence is aggregate counts per held edition for saved positions, annotations/history and reading in the last 7/30 days, with unknown edition and offline/anonymous limitations stated. No names, emails, account IDs, note text or credentials are needed.

Needs your decision: identify the existing authorized read-only route for aggregate reader counts, or accept that the count remains unknown. Recommendation: have the owner with existing access return aggregate results; do not paste credentials into chat.
