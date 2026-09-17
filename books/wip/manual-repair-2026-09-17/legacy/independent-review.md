# Independent review — The Manual first-half repair

**Date:** 2026-09-15  
**Candidate:** `output/manual-first-half-repair-2026-09-15/the-manual-modern-en.first-half-candidate.json`  
**Candidate SHA-256:** `c4a45bb09c061760c741aefdb62a1cbc72d28b80383d01ad7db7a6849f3e1f51`  
**Locked source:** `app/public/data/editions/the-manual-original-en.json` (George Long source; SHA recorded in `change-ledger.json`)  
**Scope reviewed:** sections 1–26, all 27 source paragraphs, plus retained held-out sections 3, 5, 6, 9, 11, 13, 16, 17, 19, 20, 23, 26. Second half (sections 27–52) was checked for byte-equivalence with the prior target.

## Verdict

**ACCEPT for this bounded independent review, pending the normal editorial/release gate.** The frozen ledger now consistently records all 12 actual changed coordinates, so the earlier 9-vs-12 accounting blocker is resolved.

## Source-grounded content review

I compared each of those 12 paragraphs to the locked George Long source and its immediate section context. The candidate preserves the argument sequence, conclusions, examples, qualifications, and relations. It restores source-specific details that the prior Modern English target had dropped, including the rules/harsh-impression test (1), “contrary to nature” and qualified impulse (2), abusive words and endurance (10), the slave relation and oil/wine examples (12), slave/master dependence (14), body/property distinction (18), base thought and excessive desire (21), the God-appointed post and double ridicule (22), Roman citizenship and civic/craft analogies (24), and the lettuce-price/flattery logic (25). No invented person, historical event, relation, or plot claim was found. Historical slavery language is retained because it is explicit in the source; it should remain covered by the product’s editorial policy review.

Minor editorial observations are nonblocking: “lettuces” is plural where Long says a head of lettuce; “high-minded”/“faithful” and “tranquilly” are reasonable modern renderings. Section 12 now makes the intended agency explicit: “He is not the one in such a fortunate position; you are. Your freedom from distress must not lie in his power.” This preserves Long’s contrast between the slave’s condition and the reader’s control of their own disturbance.

## Structural and held-out checks

- Candidate JSON parses; chapter order, titles, and paragraph counts remain aligned with source/target.
- All 12 changed coordinates are within sections 1–26; no out-of-scope paragraph changed.
- Retained held-out sections 3, 5, 6, 9, 11, 13, 16, 17, 19, 20, 23, 26 match the prior target exactly: **True**. This checks that the repair builder did not rewrite untouched first-half content.
- Sections 27–52 match the prior target exactly: **True**.
- The candidate’s own change ledger is now the consistent provenance source with 12 repaired coordinates. This review does not certify Greek fidelity, audio timing, or publication readiness.

## Required next step

Proceed to the normal editorial/release decision and audio invalidation workflow for the 12 changed coordinates. Keep publication blocked until that gate completes.
