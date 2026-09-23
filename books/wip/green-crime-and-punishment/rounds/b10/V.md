# b10 verification: chapters 30–31

## Coverage
- Chapter 30: 29 changed paragraphs checked, matching the tool count of 29.
- Chapter 31: 34 changed paragraphs checked, matching the tool count of 34.
- Total: 63 paragraphs, matching `view.py changed 30 31`. 61 are verified clean and 2 have defects (30.134, 31.11).
- Accessibility: all 5 proposals in A.json were screened.

Chapter 30 (the confession) was checked strictly against Garnett:
- Every restored stammer, repetition and trailing-off is in the source: 30.22, 30.59, 30.85, 30.90, 30.95, 30.119 ("Well... that's all..."), 30.128 ("And I kept thinking...") and 30.134 ("all, all", "how sick, how sick").
- Each restored contradiction is also in the source:
  - 30.126: "I too know it wasn't a louse."
  - 30.128: "on purpose, out of sulkiness" replaces the baseline's rationalizing "on principle".
  - 30.119: "that's all" returns before "of course... wrong".
- None of the fidelity edits makes his account more coherent or more certain:
  - 30.0 uses "felt", not "knew".
  - 30.115 removes the invented "for a terribly long time".
  - 30.158 drops the invented "maybe", matching the source's plain "you'd better not".

## Defects
1. **30.134, blocking (grammar).** The restored present tense "whether I have the _right_" now sits beside "Whether I was a trembling creature", which is a tense break introduced by the edit. The source reads "whether I am a trembling creature or whether I have the _right_". Fix: "was" becomes "am".
2. **30.134, non-blocking (meaning, from the baseline).** The source reads "if I asked myself whether a human being is a louse it proved that it wasn't so for me, though it might be for a man who…". The baseline narrows "a human being" to "she" (the old woman) and adds the hedge "at least", which reshapes his reasoning. Fix: "it proved that for me a human being wasn't one, though it might be for someone".
3. **31.11, non-blocking (style).** The restored "someone seemed to be hammering..." left "hammering" twice in one sentence. The source reads "a loud continuous knocking". Fix: "persistent hammering" becomes "persistent knocking".

The defect array passes `apply.py check --dry`: 3 applied, 0 rejected.

## Accessibility verdict summary
| # | Where | Verdict | Note |
|---|---|---|---|
| 0 | 30.162 | accept | "No, of course you don't" keeps the meaning and fixes who is speaking. |
| 1 | 31.44 | reject | The added English gloss is not in the source, and the chapter's other French is unglossed. |
| 2 | 31.70 | modify | "nearly a pint of blood" is the source wording; "tumblerful" is invented. |
| 3 | 31.73 | accept | Naming Katerina Ivanovna is faithful and clearer. |
| 4 | 31.77 | modify | "She looked at Sonia with a face of suffering." restores the source phrase. |

## Verdict
CLEAN AFTER CORRECTIONS
