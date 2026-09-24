# Crime and Punishment: Svidrigaïlov card spoiler correction

**Status: ACCEPTANCE_STATUS. Content-only staging. Nothing is published.**

## Problem

The identity review (`../crime-character-identity-review/`) found that Svidrigaïlov's only card, available from his first mention at 3.38, revealed information from much later in the novel. A first correction deferred the two named details, "recently widowed" and his arrival in St. Petersburg. That was too narrow. Anders asked for the spoiler correction to be finished, with one rule applied throughout: **every claim in a snapshot must be supported by the text at that snapshot's availability point.**

## Result

Both editions (`original-en` and `modern-en`) get three snapshots. Names are unchanged in both: "Svidrigaïlov" in original-en and "Svidrigailov" in modern-en.

| Snapshot | Available from | Subtitle | Body |
|---|---|---|---|
| `svidrigailov-1` (edited) | First mention, 3.38: end of the name | Dunya's former employer | Dunya worked as a governess in his household, where she had a hard time. |
| `svidrigailov-2` (new) | End of 3.38 | Dunya's former employer | Unsettling, he pursued Dunya while she worked in his household. |
| `svidrigailov-3` (new) | End of 22.34 | Dunya's former employer, with a dark reputation | Unsettling and recently widowed, he pursued Dunya while she worked in his household and is rumored to be responsible for terrible things. His arrival in St. Petersburg alarms the whole Raskolnikov family. |

**Baseline (both editions):**

| Field | Value |
|---|---|
| Snapshot | `svidrigailov-1` only |
| Subtitle | Dunya's former employer, with a dark reputation |
| Body | Wealthy, unsettling, and recently widowed, he pursued Dunya while she worked in his household and is rumored to be responsible for terrible things. His arrival in St. Petersburg alarms the whole Raskolnikov family. |

## Why each claim sits where it does

`EVIDENCE.md` quotes each point in the source, live and candidate texts.

| Claim | First supported | Placed in |
|---|---|---|
| Former employer; Dunya a governess there; she had a hard time | 3.38, **before the name**: "Dunya was having a hard time at the Svidrigaïlovs'", "she took the governess position", "your sister has been living with me these last six weeks" | 1 |
| Pursued Dunya | 3.38, after the name. The letter stages it as a surprise: "And how do you think it all turned out? Would you believe that the crazy fellow had been in love with Dunya from the very beginning…", followed by his "open and shameless proposal". The card policy keeps a relationship revealed as a surprise gated, so it is released at paragraph end. | 2, 3 |
| Unsettling | 3.38, after the name: his rudeness, mocking remarks and drinking | 2, 3 |
| Recently widowed | 16.73: "Marfa Petrovna is dead!" (3.38 establishes that she is his wife) | 3 |
| Rumored to be responsible for terrible things / dark reputation | 17.49: "that terrible man seems to have been the cause of her death. They say he beat her dreadfully." | 3 |
| His arrival in St. Petersburg alarms the whole family | 22.31–22.34: Luzhin says he "set out for Petersburg in great haste right after his wife's funeral"; Dounia asks "in alarm"; Pulcheria cries "Won't he leave Dounia in peace even here?" | 3 |
| **Wealthy** | **Never established**, so it is omitted everywhere | none |

**The wealth check.** No passage from the start of the book through 22.34 establishes that he is wealthy. This was checked by reading and by a whole-text scan.
- **3.38** mentions "another estate (of his)". Owning an estate is not a statement of wealth.
- **21.33** is his own account: "not considered poor", with income from forests and water meadows.
- **21.43**: the fortune is Marfa Petrovna's.
- **22.2**: Raskolnikov calls him "that landowner".
- **21.37 and 21.103** are excluded, per Anders's instruction not to infer poverty from his debt or his claim "I'm not rich", nor wealth from his offer of ten thousand roubles.

**Release points** are the earliest paragraph ends at which every claim in a snapshot is supported. 3.38 is the letter paragraph itself. 22.34 is the first paragraph end at which all of snapshot 3's clauses are established; 22.31–22.34 is also where the family learns of his arrival.

**Unchanged, and enforced by `tools/apply_patch.py`:**
- display names and snapshot 1's `id`, `availableAt`, `evidence` and `editorialBasis`
- `firstMention`, `roleVisibleAt` and every mention, including the allusive R125 binding
- paragraph hashes and all other characters (the coverage)
- `contentVersion` and `reviewStatus`
- the edition texts and the identity-review ledger

## Patches, baselines and hashes

There are two variants. Their wording and operations are the same; only the modern-en coordinates differ, because each is anchored to the edition its baseline card is bound to.

| Patch | Baseline card | Baseline sha256 | modern-en bound to | Patched sha256 |
|---|---|---|---|---|
| `PATCH.json` (`a3917171…`) | `main` (`1bd1bfb3`, still identical at `e1bf66a9`). Both card paths. | `2125526c56769e4f09be387f6d5dc2e974dc9aca7fb931115fb893da34706d98` | live `914bcdfa…` | `5e0a9ea5a121817b11f4667928bcc10cd60b25f27d9b2e209bc68f6d2ef12be4` |
| `PATCH-staged-01963b24.json` (`c54f4596…`) | Codex staging branch `codex/crime-reviewed-release-20260924` @ `01963b24`, `app/public/data/characters/crime-and-punishment.v1.json` | `b4e2217deda2b92cf6f838782c0526ab24c1ddcde517e40cffed26779d296d70` | accepted candidate `18be4155…` | `0e695a1296eae579b3477faf3f56e0176476b0915f0a9bff47391b94ada54676` |

- **Offsets** are paragraph-end UTF-16 lengths, normalized as `prose-reader-v1`. 22.34 ends at 87 in every text. The end of 3.38 differs by text: original-en 15515, live modern-en 13544, candidate 13789.
- **`PATCH.json`** also carries `candidateCoordinates` for its two new snapshots.
- **Serialization:** both baselines are `json.dumps(indent=2, ensure_ascii=False) + "\n"`, and the patched files use the same format.

## Independent acceptance

ACCEPTANCE_SECTION

## Reconciliation against newer card versions (checked 2026-09-24)

- **Scope of the check:** all branch heads (a tree-only fetch), for both card paths.
- **`main`** has moved to `e1bf66a9` (#162: Prince, Caesar and Jekyll), but its Crime and Punishment card is unchanged (`2125526c…`). `PATCH.json` targets it.
- **Newer version: Codex's staging branch** `codex/crime-reviewed-release-20260924` @ `01963b24`, "Stage reviewed Crime text and exact identity mappings". It is unmerged.
  - It publishes the accepted candidate and re-anchors the card (`contentVersion 2026-09-24.1`).
  - Its Svidrigaïlov card still has the single snapshot with the premature subtitle and body, at modern-en 3.38@2536. Its original-en edition is byte-identical to the baseline.
  - `PATCH-staged-01963b24.json` targets it.
  - On that branch **only the served path** was updated: `books/characters/crime-and-punishment/characters.v1.json` is still the old `2125526c…`. Both paths should end byte-identical.
- **`claude/great-clarke-mugpy4`** (`bda9bafa`) is an unaccepted, unmerged draft. Its Svidrigaïlov card has the same premature text. It is not a baseline. If it is ever accepted, rebuild the patch against it; the applier refuses unknown baselines by design.

## Release handoff for Codex

1. **Fetch and verify the pinned inputs.** Run `git fetch origin claude/awesome-euler-pjc7jv main codex/crime-reviewed-release-20260924`, then `python3 books/wip/crime-svidrigailov-snapshot-correction/tools/verify_inputs.py`. It must print `ALL PINS OK`.
2. **Choose the patch that matches the card you are releasing:**
   - **Crime release built on the staging branch** (expected):
     - Run `python3 …/tools/apply_patch.py --patch PATCH-staged-01963b24.json --card app/public/data/characters/crime-and-punishment.v1.json --out <path>`. It must report `errors 0` and patched sha256 `0e695a12…`.
     - Write the result to **both** card paths.
     - Your staged revision bump in `characterCards.ts` covers this, provided the release carries the patched card. Otherwise, bump again.
   - **Card-only release on `main`, before the Crime text:**
     - Use `PATCH.json` in the same way (patched sha256 `5e0a9ea5…`).
     - Write the result to both paths.
     - Bump the `crime-and-punishment` revision from `2026-09-12.1`.
   - **If the staged card has changed since `01963b24`:** the applier will refuse it. Rebuild against the new card with `tools/make_patch.py`, keeping the same wording and the rule that each snapshot is anchored at a paragraph end of the text it is bound to.
3. **Check in the reader** (isolated, muted headless browser, both editions). Tap Svidrigaïlov:
   - at the first mention in 3.38: snapshot 1
   - in chapter 21 (e.g. 21.2): snapshot 2
   - at 22.35 or later (e.g. 41.7): snapshot 3
   - Check that the subtitle changes with snapshot 3.

No GPU or TTS work, and no edition, audio or code change comes from this package.

## Notes for the card owner (not changed here)

- **Display-name spelling (already live).** The modern-en display name is "Svidrigailov". That matches most of the live modern-en (173 "Svidrigailov" and 38 "Svidrigaïlov"), but the accepted candidate uses "Svidrigaïlov" throughout (211 and 0). Once the candidate ships, the card name will differ in spelling from the text. The reviewer's note N6 described the live text as mostly "Svidrigaïlov"; this count corrects it. Display names are outside this package's scope.
- **"as a governess" (optional).** Snapshots 2 and 3 say "worked in his household" without "as a governess". Snapshot 1 already establishes that she was a governess. The reviewer confirmed that adding "as a governess" back would stay supported at the same points. The wording is left as it is.

## Files

- `PATCH.json` and `PATCH-staged-01963b24.json`: exact old and new values, baseline hashes, and anchors.
- `EVIDENCE.md`: generated quotes with coordinates from the source, live and candidate texts, including the wealth check.
- `review/`:
  - `v3/`: independent acceptance of this final version.
  - `INDEPENDENT-ACCEPTANCE.md` and `tools/`: superseded reviews of the earlier two-detail versions, kept as history.
- `inputs/`: pinned copies. Git stores each as the same blob as its origin.
- `tools/`:
  - `make_patch.py`: declares the wording and computes the anchors.
  - `apply_patch.py`: applies a patch, refuses a wrong baseline or undeclared change, validates runtime rules, simulates reading positions and bans premature words per snapshot.
  - `build_evidence.py` and `verify_inputs.py`.
  - All tools run offline and deterministically.

### History

- `d1a147ac`: deferred the two named details to 22.37.
- `6dc25bb0`: moved that release to 22.34 after the reviewer found the 17.49 rumor.
- `40b33e0b`: accepted two-detail version.
- **This version:** completes the correction under the claim-by-claim rule and adds the staged-branch variant.
