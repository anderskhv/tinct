# Release assets — COMPLETE / STAGED

- Items 1–4 complete: 24 character identities in both editions with reviewed spoiler gates; preface and intro; threads covering chapters 1–50; all four integration snippets and HANDOFF.md.
- Verification: 505/505 focused tests; direct runtime hash/offset/snapshot/identity checks in both editions; JSON, chapter coverage, copy equality and preface checks passed.
- Preface: 170 words; SHA-256 `895b9124e6f200f6867462fcd6dbfe4ff2f50251a705a2cde94a69a284c2f6c9`.
- Checkpoints: character cards `26341747`; introduction `456dce57`; final threads/handoff in this commit.
- Resume: Claude’s separately owned shared-file integration only. No content items remain. See HANDOFF.md for conservative alias omissions and exact final hashes.
- STAGED only; no shared-file edits, deployment, PR, merge, image work, narration generation, Anthropic calls or generate-editions.cjs run.

## 2026-10-02 — independent review ACCEPTED, findings resolved

- Independent editorial review findings (SHOULD-FIX 1–8 and nits) applied to modern-en (107 paragraphs), threads (7 entries), onboarding (Edward role, Fanny description) and character cards (Edward, Miss Williams, 7 new snapshots). Character asset rebuilt (contentVersion 2026-10-02.1); `characterReleases` snippet revision updated.
- Gates: whole-book and all batch gates PASS (0.482); truncation 0; structure/shards PASS; 487/487 character tests; in-memory verification of both editions PASS.
- Accepted hashes: modern-en `789a6dfb5025e0b96604b0cf7c258c3444792c175d1e18f62969cbbd52412928`; original-en `26ccda9547c41d41a808e57c43834c4d9199f9164f7872e297cca4b73820d4c0`; onboarding `d2e5e7810b9dcc7b6d6284210d135cfa3378c7d3b746a72f31ad0a0a1194c251`; threads `212b6d4ef59e66d6aeb95089156dce373e552053994a5a37c217b213504d4305`; characters `c968fe82a9cb09e0e129ba7a62e9ed85091222488e518358844c2918842d0c20`.
- Still STAGED; no shared-file edits, deployment or publication.
