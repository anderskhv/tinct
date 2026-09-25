# Gate output — confessions modern-en candidate

Tool: unmodified copy of books/classify-modern-en.py (sha256 950700285d86e2132cd4067969c68b575c8fb946f3f0fb8c97cae6471896e50b), run with EDITIONS_DIR resolving to a scratch dir that symlinks the served confessions-original-en.json and this package's confessions-modern-en.json.
Candidate sha256: 949e4f77fd317601cc39dc701cfbc3f5f82a5b5a842c34e93c9a6328ef78add7
Baseline original-en sha256: 64b39a8ae77d7175c904625fcc0bf3de13cb59e346e964b37ec8f5e47d95a6d7

## Before (served modern-en, main 0a306caf)
```
confessions original-en -> modern-en  (13 chapters)
  weighted similarity : 0.926   (gate: <= 0.75)
  light+mechanical    : 9/13 = 69.2%   (gate: <= 5%)
  identical long paras: 340/459 = 74.1%   (gate: <= 5%)
  buckets: REAL-HEAVY 0  REAL 4  LIGHT 0  MECHANICAL 9
  wrapped scaffolding : 0   (gate: 0)
  truncated quotations: 0   (gate: 0)
GATE FAIL
```

## Per batch (candidate)
```
$ --gate --chapters 1-2
confessions original-en -> modern-en  (2 chapters)
  weighted similarity : 0.443   (gate: <= 0.75)
  light+mechanical    : 0/2 = 0.0%   (gate: <= 5%)
  identical long paras: 0/54 = 0.0%   (gate: <= 5%)
  buckets: REAL-HEAVY 2  REAL 0  LIGHT 0  MECHANICAL 0
  wrapped scaffolding : 0   (gate: 0)
  truncated quotations: 0   (gate: 0)
GATE PASS

$ --gate --chapters 3-6
confessions original-en -> modern-en  (4 chapters)
  weighted similarity : 0.433   (gate: <= 0.75)
  light+mechanical    : 0/4 = 0.0%   (gate: <= 5%)
  identical long paras: 0/104 = 0.0%   (gate: <= 5%)
  buckets: REAL-HEAVY 4  REAL 0  LIGHT 0  MECHANICAL 0
  wrapped scaffolding : 0   (gate: 0)
  truncated quotations: 0   (gate: 0)
GATE PASS

$ --gate --chapters 7-9
confessions original-en -> modern-en  (3 chapters)
  weighted similarity : 0.454   (gate: <= 0.75)
  light+mechanical    : 0/3 = 0.0%   (gate: <= 5%)
  identical long paras: 0/96 = 0.0%   (gate: <= 5%)
  buckets: REAL-HEAVY 3  REAL 0  LIGHT 0  MECHANICAL 0
  wrapped scaffolding : 0   (gate: 0)
  truncated quotations: 0   (gate: 0)
GATE PASS

$ --gate --chapters 10-10
confessions original-en -> modern-en  (1 chapters)
  weighted similarity : 0.515   (gate: <= 0.75)
  light+mechanical    : 0/1 = 0.0%   (gate: <= 5%)
  identical long paras: 0/70 = 0.0%   (gate: <= 5%)
  buckets: REAL-HEAVY 0  REAL 1  LIGHT 0  MECHANICAL 0
  wrapped scaffolding : 0   (gate: 0)
  truncated quotations: 0   (gate: 0)
GATE PASS

$ --gate --chapters 11-13
confessions original-en -> modern-en  (3 chapters)
  weighted similarity : 0.523   (gate: <= 0.75)
  light+mechanical    : 0/3 = 0.0%   (gate: <= 5%)
  identical long paras: 0/135 = 0.0%   (gate: <= 5%)
  buckets: REAL-HEAVY 1  REAL 2  LIGHT 0  MECHANICAL 0
  wrapped scaffolding : 0   (gate: 0)
  truncated quotations: 0   (gate: 0)
GATE PASS

```

## Whole book (candidate)
```
  ch    1  sim 0.430  REAL-HEAVY  Book 1
  ch    2  sim 0.466  REAL-HEAVY  Book 2
  ch    3  sim 0.443  REAL-HEAVY  Book 3
  ch    4  sim 0.440  REAL-HEAVY  Book 4
  ch    5  sim 0.421  REAL-HEAVY  Book 5
  ch    6  sim 0.429  REAL-HEAVY  Book 6
  ch    7  sim 0.423  REAL-HEAVY  Book 7
  ch    8  sim 0.465  REAL-HEAVY  Book 8
  ch    9  sim 0.474  REAL-HEAVY  Book 9
  ch   10  sim 0.515  REAL        Book 10
  ch   11  sim 0.419  REAL-HEAVY  Book 11
  ch   12  sim 0.528  REAL        Book 12
  ch   13  sim 0.597  REAL        Book 13
confessions original-en -> modern-en  (13 chapters)
  weighted similarity : 0.477   (gate: <= 0.75)
  light+mechanical    : 0/13 = 0.0%   (gate: <= 5%)
  identical long paras: 0/459 = 0.0%   (gate: <= 5%)
  buckets: REAL-HEAVY 10  REAL 3  LIGHT 0  MECHANICAL 0
  wrapped scaffolding : 0   (gate: 0)
  truncated quotations: 0   (gate: 0)
GATE PASS
```
