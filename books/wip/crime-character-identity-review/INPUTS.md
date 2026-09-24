# Pinned inputs

All inputs were pinned on 2026-09-24. `inputs/` holds byte-identical copies. Git stores each as the same blob as its origin, so the copies add no repository storage. `python3 tools/verify_inputs.py` re-checks every hash against the pinned commits.

| Input | Pinned at | Path at that commit | sha256 |
|---|---|---|---|
| Accepted candidate modern-en | `debcc8c2b48f352c3e143e5e3aca84de73c6f7b8` (`claude/awesome-euler-pjc7jv`) | `books/wip/green-crime-and-punishment/candidate.json` | `18be4155497ebdf78013d1a26ce2fad86839aaa00c036cf9970954af550888eb` |
| Live modern-en baseline | same | `…/baseline-live-modern-en.json` | `914bcdfae396792477d90f788ce30ed684732dc89eb4abc76d4c126a9c963834` |
| Garnett source (original-en) | same | `…/source.json` | `6609777b2dfca00fa10c7d0f4d2599b2b617f029f8a1689714ce96c60627a978` |
| Script impact report | same | `…/character-card-impact.json` | `19f0f80201f5f02833317bfb559dc1e7d09402cfb0f8c679734a3aa493962c07` |
| Edit ledger (1,963 edits) | same | `…/ledger/changes.jsonl` | `f06da82c23d45a3eb2724a7509d944e892c8ecca68ed6ecf405aa5567c4959ec` |
| Live character package | `1bd1bfb3a1cbd03ed070ca733cbcd442a40bae27` (`main`) | `app/public/data/characters/crime-and-punishment.v1.json` | `2125526c56769e4f09be387f6d5dc2e974dc9aca7fb931115fb893da34706d98` |
| Live threads (`searchNames` reference only) | same | `app/public/data/editions/crime-and-punishment-threads.json` | `3dc0295ca969cec7d36050aeea21cbc80831f6f95b2cc3c2dee8fdd323f2d9b9` |

At `main` `1bd1bfb3`, the served `crime-and-punishment-modern-en.json` equals the pinned baseline (`914bcdfa…`), and `crime-and-punishment-original-en.json` equals the pinned source (`6609777b…`). The runtime registry `characterReleases` entry for `crime-and-punishment` is at revision `2026-09-12.1` (`app/src/services/characters/characterCards.ts:92`).

## Check for newer accepted inputs

Checked 2026-09-24 across all 354 remote branches (`git ls-remote`, then a tree-only fetch of every head):

- **Package.** `claude/awesome-euler-pjc7jv` still points at the pinned `debcc8c2`. No other branch contains a Crime and Punishment WIP package. `claude/awesome-euler-k7uazt` is an unrelated app branch.
- **Live edition and character package.** `main` (`1bd1bfb3`, committed 2026-09-24 10:27 +0200) has not changed either file relative to the package. None of the 4 commits on `main` that are not in `debcc8c2` touches the modern-en, original-en, threads or character files.
- **One other card package exists, and it is not accepted.** `claude/great-clarke-mugpy4`, commit `bda9bafa` (2026-09-18, "fix(characters): crime-and-punishment 19->83"), holds a different `crime-and-punishment.v1.json`. It marks itself `reviewStatus: agent-drafted-2026-09-17-pending-independent-review`, adds 64 cards, and changes anchors. It is unmerged and was never accepted, so it is **not** an input here. If it is ever accepted, it re-binds mentions against the live edition and needs its own identity review against this candidate. The decisions here are keyed to the 19-character package on `main`.

Result: the pinned inputs are the newest accepted inputs.
