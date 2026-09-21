# Bella word-sync inventory — 2026-09-21

Read-only cloud audit. No reader or audio changes.

```json
{
  "asOf": "2026-09-21T10:57:36.269579+00:00",
  "commit": "fdbf3be73d73081d17b0b209032b5842e5ef9448",
  "chapters": 11830,
  "editions": 200,
  "states": {
    "deferred-modern-text-retention": 2169,
    "timings-pass-structural": 7985,
    "timings-missing": 1652,
    "missing-audio": 12,
    "timings-invalid": 12
  },
  "manifestVoices": {
    "unknown": 11830
  },
  "missingTimingReadiness": {
    "ready": 1420,
    "repair:audio": 42,
    "repair:map": 186,
    "separator-gap": 4
  },
  "editionFetchErrors": [],
  "limits": [
    "Survey spans the initial and resumed runs; 7600 prior checks were reused only for identical edition hashes.",
    "Unaudited modern-en chapters are explicitly deferred pending text retention; not counted as missing or verified.",
    "Inventory covers actual published text chapter numbers; no 1200-chapter ceiling.",
    "Structural/text validation is not acoustic verification.",
    "Readiness samples three audio objects; it does not prove spoken text matches.",
    "Unknown voice is not claimed as Bella. Historical generator default is corroboration only.",
    "Modern-English retention and content holds must be reconciled before repair.",
    "Content hashes here are canonical JSON, not raw-object byte hashes."
  ]
}
```
