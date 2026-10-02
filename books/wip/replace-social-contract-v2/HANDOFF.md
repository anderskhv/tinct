# Handoff - social-contract replacement (v2, Sonnet)

Branch: content/replace-social-contract-sonnet. Owned path: books/wip/replace-social-contract-v2/ only. Continued from the Codex package on origin/content/replace-social-contract-codex (not merged). Status: content COMPLETE, awaiting integration by Claude/Codex in a separate step. No API calls, no generation scripts, no code/app/registry edits.

## What changed from the Codex checkpoint
- original-en: Codex had re-rendered 72 paragraphs of the 1764 text to dodge the overlap gate. Per Anders's clarification original-en is exempt and must be verbatim, so all 72 were restored from scratch/original-draft.json (the 1764 TCP transcription) with only the genuine corrections applied (scratch/transcription-corrections.json, 32 entries: 31 scan/OCR repairs of damaged print plus the Crusoe fix, and the restored four-paragraph note in Book III ch. X). Entry 8 para 3 again ends with its source colon.
- modern-en: 59 paragraphs were below 75 percent of the (now restored) original; ~70 paragraphs were re-rendered by hand, sentence by sentence, in my own words from the 1764 text. Overlap-flagged paragraphs were then re-phrased. No protected live text was read; only the coordinate/count output of overlap-check.py was used, plus sentence-level flags on my own text.

## Counts
50 chapters (Advertisement, Book I Introduction, 48 book-chapters), 470 paragraphs, sections []. original-en 48,072 words; modern-en 39,652 words (82.5 percent).

## Gates (all PASS)
- modern-en overlap vs old live original + old live modern, --allow new original-en: N=10 0/470, N=8 0/470 (gates/overlap-modern-n10.txt, -n8.txt). original-en is exempt by rule.
- classify-modern-en.py --gate: PASS native (weighted similarity 0.338, 0 light/mechanical, 0 identical long, 0 truncated quotes) and PASS on typography-folded copy (0.339). gates/classifier-*.txt.
- Alignment: same chapter and paragraph counts and titles; every modern paragraph >= 75 percent of source words; '!' counts equal per paragraph; no brackets, no embedded newlines, no empty paragraphs (gates/paragraph-audit.txt: bad 0).
- JSON shape valid.

## SHA-256
- editions/social-contract-original-en.json 57653ba8e01bd63352a12f89541258c612d4a45da04153ff3e4f7dc924487546 (see final hashes in git; recompute if edited)
- editions/social-contract-modern-en.json 144326b19a7da452cc851a71a5b2d505103b6c88b69838e2b78cc228aff28680
- structure-map.json 132ac0385411d720a0a26d47ccf47b44f649c8cbf437e7764e7a55dca4cf11aa

## Remaining gaps / honest notes
- structure-map.json is count-based, confidence low, no text comparison (old live: 48 chapters/491 paragraphs; new 50/470). Not suitable for exact highlight migration; integration must decide migration behaviour.
- Transcription: damaged-print repairs checked against scan pages (see ledger). Two punctuation normalizations (31.15 comma to period, 36.8 comma removed) and the TCP-derived punctuation elsewhere were not scan-confirmed; 20.4 (period) and 49.34 confirmed on the scan. Original-en is a transcription of the 1764 printing with long s as s, no other modernisation.
- Original-en shares some wording with the later Cole translation (inherited from the 1764 text); exempt by Anders's rule.
- Modern-en re-renders stay close to the 1764 sentence order, because the free source is the only permitted base; overlap checks cover only protected files named above.
- Accidental-exposure disclosure from Codex HANDOFF retained: an overview search surfaced a quoted translation snippet and prefatory matter from other editions; not used. Separately, I as a model recall other English translations; the first re-render draft of ~30 paragraphs inadvertently echoed such wording (overlap tool flagged it) and was rewritten until zero flags. Reviewer may want a human spot-check of Book III-IV renderings.
- Character-card/onboarding impact not assessed (text-only package).
