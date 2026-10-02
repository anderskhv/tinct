# Bacchae replacement handoff

STATUS: COMPLETE
Content package accepted; not integrated or published.

Branch: `content/replace-bacchae-codex`.
Owned package: `books/wip/replace-bacchae/`.
Base (fetched before branch creation): `95837141bd77d34dd2fdd854e9f82ab44695c0c3`.
Instruction comparison: current remote main `72af4a8bee9de1d16d8f9051863a4f244151770a`; applicable root/book/workflow/strategy files have no differences from the assigned base. Explicit user assignment supersedes older Codex content-ownership restrictions and authorizes the copied overlap checker.

## Deliverables and counts

Way 1898 original and fresh modern English: 11 chapters each, 324 aligned paragraphs each. Chapter counts: 1, 7, 21, 4, 51, 11, 75, 3, 33, 3, 115. Word counts including tags/directions, whitespace-delimited: original 11234; modern 11657. Modern paragraphs were written individually in this conversation, with no API generation or regex/dictionary rendering.

`structure-map.json` maps all 336 former coordinates to the 324 new coordinates by chapter and relative paragraph progress. It uses counts only, with endpoints preserved. This is an approximate migration suggestion, not semantic alignment; no protected wording or titles were inspected. Both former English editions had the same counts. A count-only newline check found 331 former original paragraphs with embedded newlines and zero in former modern. New editions consistently use spaces within paragraphs.

## Final gates

All required final gates passed; exact outputs are in GATES.txt.

- JSON, 11/11 chapter alignment, 324/324 paragraph alignment, nonempty paragraphs: PASS.
- Unmodified classifier: PASS, weighted similarity 0.256; light/mechanical 0%; identical long paragraphs 0%; truncated quotations 0; scaffolding 0.
- Typography-folded copies: same PASS, 0.256.
- Every modern paragraph is at least 75% of source word count; minimum 80.95%.
- Exclamation counts: no paragraph loses any; original total 158.
- Original overlap: N=10 zero; N=8 2/324 = 0.617284%. Coordinates 11:11 and 11:93. Candidate-only diagnostics identify a short conventional physical-description phrase (with one matched token across a quotation boundary) and a short prayer/confession formula including the speaker/name. These are inherited verbatim from verified Way, not imported from the protected reference. Retained as the permitted sub-1% short-formula cases: altering the historical original would falsify the selected baseline.
- Modern overlap: N=10 zero and N=8 zero.
- Apparatus, terminal punctuation, empty/stub content, odd characters, typography: PASS. Original bracketed speech at 7:14 and 11:87 exists in Way; no modern brackets. All surviving speech is retained. Short dialogue replies are intentional, not stubs.
- Independent reader compared every paragraph, found no missing narrative blocks or names, and confirmed five corrections after recheck; see REVIEW.md.

## Source and editorial decisions

SOURCE.md contains edition details, retrieved raw files and hashes, death-year evidence, licensing attribution, extraction notes, and scan checks. Title page and printed pp. 369, 429–431, 437–438 inspected. Opening and complete surviving ending agree with Way. The ancient Exodos lacuna remains a gap: its explanatory note and Way's Appendix are excluded; no invented restoration. Sentence-final dashes at interrupted dramatic turns are regularized to terminal punctuation without joining or dropping turns. Entrance/exit directions are retained inline. One-speech grouping and strophe/antistrophe/epode grouping yield different counts from the former translation.

The two original transcription errors identified in SOURCE.md were scan-verified. The source's straight-quote transcription style is consistently retained. Verse line breaks are folded to spaces; source line-initial capitals remain part of the original transcription's style.

No protected edition text was opened, printed, quoted, copied or used for rendering. Access was limited to counts/newline booleans and the unchanged coordinates-only overlap checker. The assignment itself supplied a comparison phrase, which was not used as a baseline. During free-source inspection, Way's excluded Appendix and its quotation of Tyrrell commentary were displayed. No other translator's dramatic wording was consulted; no fallback was used.

An early classifier attempt on the six-chapter partial draft rejected whole-book structure before applying --chapters; a matching ten-chapter scratch batch then passed. The final full-book run supersedes both. No failed gate remains.

## Integration requirements

Claude can review the candidate and approximate saved-place map. Any later integration must retain source attribution, address changed paragraph references/character compatibility, and invalidate incompatible narration caches. This assignment authorizes no runtime integration. No app/registry/live edition/scripts/tests/config changes, PR, merge, deployment, narration generation, Anthropic API calls or generate-editions.cjs execution occurred. Only package-local overlap-check.py was copied as explicitly requested.

## SHA-256

- `editions/bacchae-original-en.json`: `cea1d64ee2dcc2cb9c3dcc39b1e1f9f52c120a8c6f1ff33cfd22ecf623e5fdcc`
- `editions/bacchae-modern-en.json`: `7531e554cbd2ece775f219fad7df9d66cdcf0d2111d54f979afccce5216320a8`
- `structure-map.json`: `0daf1ddb1338ccc295c6c5ca2b00e3fc35889f5e803cb09d93fbf85cdad6ffd7`
- `overlap-check.py`: `1adc8cd67d140d4b32ac1f0b2e155db5090d9f36ca967dd9450658b107481508`
- `GATES.txt`: `a54f35e38d76add8a048b83be0b4666654913cddda755108f9c5dd3ec445b34b`
