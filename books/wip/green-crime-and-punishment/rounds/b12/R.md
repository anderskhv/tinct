# b12 re-verification (R)

**Coverage:** 36.61, 37.16, 37.32. Each paragraph was read in full against Garnett, with one paragraph of context either side, and checked against the ledger (P0-names, b12-F, b12-AV).

**Verdict: DEFECTS FOUND** (3, all non-blocking, all in 37.16)

| Coord | Result | Notes |
|---|---|---|
| 36.61 | clean | The AV edit ("ill-bred for a man of society to go in for them") is faithful, and "them" correctly refers to the home-made traditions. The chapter's typography is kept: curly quotes, straight apostrophes, `…` and spaced em dashes. |
| 37.16 | defects | The AV edit ("bringing the conversation round to Third Street") and the b12-F time fix ("at twenty past eleven") are correct. Three residual drifts in certainty or degree remain: "vanished *almost* immediately" (a hedge that is not in the source); "eager questions" (drops the source's "interested and almost"); "had been quite impressive" (source: "had of course been very impressive"). Names and straight-quote typography are correct. |
| 37.32 | clean | The AV edit ("advised Raskolnikov to entrust her") is grammatical and keeps the degree of "recommended". `_too_` is restored and the Garnett names (Dounia, Razumihin) are used. The chapter's straight quotes are kept. |

`apply.py … check --dry`: applied 3, rejected 0.
