# Crime and Punishment: Svidrigaïlov first-snapshot correction

**Status: ACCEPTANCE_STATUS. Content-only. Not published.**

The identity review (`../crime-character-identity-review/`) found that Svidrigaïlov's first-encounter card revealed two later facts at his first mention (3.38): that he is "recently widowed", and that his "arrival in St. Petersburg alarms the whole Raskolnikov family". This package corrects that with a narrow patch to the character card:

- It removes the two details from `svidrigailov-1`.
- It defers them, in the original wording, to a new snapshot `svidrigailov-2`, released at the earliest point where the text supports every clause.

The live card, the editions and all code are untouched. Codex applies the patch.

## Exact change (both editions, `original-en` and `modern-en`)

Baseline card: `app/public/data/characters/crime-and-punishment.v1.json`, which is byte-identical to `books/characters/crime-and-punishment/characters.v1.json`. At `main` `1bd1bfb3`, both have sha256 **`2125526c56769e4f09be387f6d5dc2e974dc9aca7fb931115fb893da34706d98`**.

| Field | Old | New |
|---|---|---|
| `svidrigailov-1.body` | Wealthy, unsettling, and recently widowed, he pursued Dunya while she worked in his household and is rumored to be responsible for terrible things. His arrival in St. Petersburg alarms the whole Raskolnikov family. | Wealthy and unsettling, he pursued Dunya while she worked in his household and is rumored to be responsible for terrible things. |
| `svidrigailov-2` | *(absent)* | A new snapshot inserted after `svidrigailov-1`. Its `body` is the original text above, verbatim. Its `name` and `subtitle` are copied from `svidrigailov-1` in each edition, so display names are unchanged. |
| `svidrigailov-2.availableAt` | — | `{22, 34, 87}`, the end of 22.34. The offset is 87 in original-en, live modern-en and the accepted candidate alike. |
| `svidrigailov-2.evidence` | — | Paragraph ends of 16.73, 17.49, 22.31 and 22.34. The offsets differ by edition; see `PATCH.json`. |
| `svidrigailov-2.editorialBasis` | — | Cites 16.73 (death), 17.49 (rumor), 22.31–22.34 (the family learns of his arrival and is alarmed) and 20.68 (the reader first meets him in St. Petersburg). |

Nothing else changes. That covers names, subtitles, IDs, `firstMention`, `roleVisibleAt`, snapshot 1's `availableAt`, `evidence` and `editorialBasis`, every mention (including the allusive R125 binding), the paragraph hashes, the other characters, `contentVersion` and `reviewStatus`. `tools/apply_patch.py` enforces this: it rejects any change it was not told to make.

**Patched card sha256** (serialized as `json.dumps(indent=2, ensure_ascii=False) + "\n"`, the baseline's own byte format): **`c641a04992890b85707ae6e25afe03db48c73c751151eb8d0d5a94cc7c066245`**.

## What the reader knows, and when (`EVIDENCE.md` has exact quotes in all three texts)

| Position | Text | Supports |
|---|---|---|
| 3.38, first mention (original-en @2855, live modern-en @2530, candidate @2536) | The mother's letter. Dounia worked as a governess in the Svidrigaïlovs' house. Later in the same paragraph, Marfa Petrovna is "Mr. Svidrigaïlov's wife" and alive, and he lives on his country estate. | Employer, "unsettling", "pursued Dunya". **Not** widowed, not in St. Petersburg. |
| 16.73 | "Marfa Petrovna is dead!" | That he is widowed |
| 17.49 | "that terrible man seems to have been the cause of her death. They say he beat her dreadfully." | "rumored to be responsible for terrible things" |
| 20.68 | He introduces himself in Raskolnikov's room | His presence in St. Petersburg (the family does not know yet) |
| 22.31–22.34 | Luzhin: he "set out for Petersburg in great haste right after his wife's funeral"; Dounia asks "in alarm"; Pulcheria: "Won't he leave Dounia in peace even here?" | "His arrival in St. Petersburg alarms the whole Raskolnikov family" |

**Release point.** The end of 22.34 is the earliest point where every clause of the original body is supported. The first version of this patch released at the end of 22.37, on the belief that the rumor was first supported by Luzhin's account there. The independent reviewer found the earlier rumor at 17.49, and the release point was moved to 22.34.

**Candidate integration.**
- Paragraphs 22.31, 22.34 and 22.37 are identical in the live and accepted candidate texts, so the new `availableAt` needs no re-anchoring.
- The evidence offsets for 16.73 and 17.49 differ in the candidate. `PATCH.json` `candidateCoordinates` gives the exact values.
- Snapshot 1's `availableAt` and the character's `firstMention` and `roleVisibleAt` at 3.38 are already among the 42 anchors the identity review hands to Codex. They move to 2536 with the accepted mention R025.

## Independent acceptance

ACCEPTANCE_SECTION

## Reconciliation against newer card versions (checked 2026-09-24)

- **Checked all 358 remote branch heads** for both card paths (a tree-only fetch of every head).
  - 205 carry the pinned baseline, and 152 have no Crime and Punishment card.
  - One differs: `claude/great-clarke-mugpy4`, commit `bda9bafa`. It is unmerged, and it marks itself `agent-drafted-2026-09-17-pending-independent-review`. It is not accepted, so it is not the baseline.
  - That draft's `svidrigailov` still has the single snapshot with the identical premature body, in both editions. So this correction applies to it unchanged, field by field. If it is ever accepted, rebuild with `tools/apply_patch.py` against its hash. The script refuses any other baseline by design.
- **`main`** is at `1bd1bfb3` (2026-09-24 10:27 +0200) and is unchanged since the identity review.
- **The identity-review package** (`../crime-character-identity-review/`) is unaffected. It concerns mentions only, and this patch changes no mention. Its `final-mapping.jsonl` and `validate.py` results stand.

## Release handoff for Codex

1. `git fetch origin claude/awesome-euler-pjc7jv main`, then `python3 books/wip/crime-svidrigailov-snapshot-correction/tools/verify_inputs.py`. It must print `ALL PINS OK`.
2. `python3 books/wip/crime-svidrigailov-snapshot-correction/tools/apply_patch.py --card app/public/data/characters/crime-and-punishment.v1.json --out <path>`.
   - It must print `errors 0` and patched sha256 `c641a049…`.
   - Write the result to **both** `app/public/data/characters/crime-and-punishment.v1.json` and `books/characters/crime-and-punishment/characters.v1.json`, which stay byte-identical.
3. Bump the `characterReleases` revision for `crime-and-punishment` in `app/src/services/characters/characterCards.ts` (currently `2026-09-12.1`). Card assets are immutably cached, and the copy changed.
4. **If this lands together with the candidate text re-anchoring:** apply this patch first, to the baseline hash. Then re-anchor. For `svidrigailov-2`, use `candidateCoordinates`.
5. **Verify in the reader** (isolated, muted headless browser):
   - Tapping Svidrigaïlov before the end of 22.34 (e.g. 3.38, 21.2) shows the new short body.
   - At or after the end of 22.34 (e.g. 22.35, 41.7) it shows the original body.
   - Check both editions.
   - `app/scripts/check-reviewed-characters.cjs` has no Crime and Punishment fixtures. Its extra-book path already tests before-gate and after-gate mentions for books with a multi-snapshot character, and could be extended to this one.

No GPU or TTS work, no edition change, no audio change.

## Open decisions for the card owner (not in this patch)

- **"rumored to be responsible for terrible things" in `svidrigailov-1`.** It is premature at 3.38: the first rumor is at 17.49. Both the lead and the independent reviewer recommend removing it from snapshot 1. It is kept verbatim in `svidrigailov-2`, which releases after 17.49, so the correction would lose nothing. This was left out because the brief limited the patch to the two named details.
- **"Wealthy."** It is supported at 3.38 by his estates. By 22.34 the text complicates it: he was in debtors' prison (21.37), says "I'm not rich" (21.103), yet freely offers ten thousand roubles. It is kept verbatim as card content.

## Files

- `PATCH.json`: machine-readable operations with exact old/new values, the baseline hash and candidate coordinates.
- `EVIDENCE.md`: generated quotes with coordinates from the source, live and candidate texts.
- `review/`: the independent reviewer's report, tools and patched copy.
- `inputs/`: pinned copies. Git stores them as the same blobs as their origins.
- `tools/`: `make_patch.py`, `apply_patch.py`, `build_evidence.py` and `verify_inputs.py`. All run offline and deterministically.
