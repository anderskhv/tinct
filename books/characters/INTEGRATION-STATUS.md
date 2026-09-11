# Integration status — what is actually live

Reconciled 2026-09-11. Written for the Codex release owner and for any authoring
session that needs to know whether a package still needs integrating.

Two records disagreed: `status.json` files marked six packages `appStatus: live`,
while the authoring lane's queue text still read as though nothing had shipped.
Neither was right. This file records what production actually serves, and how to
re-check it, so the queue stops being argued from memory.

## How this is checked

```
python3 books/characters/serving_check.py            # probes https://tinct.app
python3 books/characters/serving_check.py <host>     # any other origin
```

A package is being served only if `GET /data/characters/<id>.v1.json` returns
200. The script probes every package directory, writes `serving-check.json`, and
prints any package whose `appStatus` disagrees with what the host returns. Run it
before updating this file; do not edit the conclusions by hand.

## Result, 2026-09-11

**4 of 63 packages are served by tinct.app:** `bible`, `hamlet`, `macbeth`,
`the-awakening`.

That matches `origin/main` exactly. On `origin/main`,
`app/src/services/characters/characterCards.ts` registers those same four book
ids in `supportedEditions`, and `app/public/data/characters/` contains those same
four sidecars and no others.

## The four that were verified but are not being served

`crito`, `apology`, `the-manual` and `the-art-of-war` carried
`appStatus: "live"` with a release-owner verification dated 2026-09-10 — bundle
`index-D_c4t1iT.js`, Worker `07acbcbd-0c28-4cfc-b6e7-358ae2d3542b`, evidence
commit `10de86bb`, report `docs/character-cards-four-2026-09-10.md`.

Production returns 404 for all four sidecars today, and none of that evidence is
reachable from this remote:

- commit `10de86bb` is not an object in this repository
- `docs/character-cards-four-2026-09-10.md` is not on `origin/main`
- `origin/main` does not register those four ids in `supportedEditions`

So the verification is not being doubted — it is not *pushed*. The app-side
integration and its evidence exist only in a local checkout, and whatever has
been deployed to tinct.app since does not include them. Their `appStatus` is now
`not-integrated`, which is what production reports; the original
`productionVerification` block is preserved untouched inside each `status.json`
under `priorProductionVerification`, so nothing is lost when the integration
commit is pushed and the status goes back to `live`.

`hamlet` and `macbeth` are genuinely live and stay `live` — their evidence docs
are on `origin/main` and their sidecars return 200.

## What the release owner needs to do

1. Push the local integration work — the `supportedEditions` change, the four
   sidecars under `app/public/data/characters/`, and
   `docs/character-cards-four-2026-09-10.md` — to a branch on
   `github.com/anderskhv/tinct`. Until it is pushed it cannot survive a deploy
   from any other checkout, which is what appears to have happened here.
2. Re-run `python3 books/characters/serving_check.py` after the next deploy and
   update this file from its output.
3. Then drain the queue in `RELEASE-QUEUE.md`. 55 packages are validated and
   awaiting integration; that number is real, and it is not reduced by work that
   has not been pushed.

## Where the authoring lane's files are

The authoring lane does not work on `main` and never has, which is why these
files were not in the checkouts that were inspected.

| File | Branch | Commit |
|---|---|---|
| `books/characters/AUTOMATION-QUEUE.md` | `claude/tinct-character-content-1n5iqq` | `aec6edff2590ecd1170aa507c5800a322bca90b2` |
| `books/characters/RELEASE-QUEUE.md` (current) | `claude/tinct-character-content-1n5iqq` | branch head |
| every package since the handoff | `claude/tinct-character-content-1n5iqq` | branch head |

All of it is pushed to `origin`. To read it:

```
git fetch origin claude/tinct-character-content-1n5iqq
git show origin/claude/tinct-character-content-1n5iqq:books/characters/AUTOMATION-QUEUE.md
```

The branch is based on the handoff commit `607ab9b1`, which is on
`codex/character-cards-pilot`. It has never been force-pushed.
