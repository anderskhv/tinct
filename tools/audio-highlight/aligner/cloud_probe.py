"""Cloud port of independent_probe.py: unprompted second-model anchor agreement.

This is a **port, not a rewrite**. The check is the one the completion plan
already uses, and the acceptance criterion is unchanged:

  - anchors are exact-match words between the candidate sidecar and an
    independent model's unprompted recognition of the same recording
  - 30 evenly spaced anchors are selected across the chapter
  - each anchor's delta is max(|start difference|, |end difference|)
  - the criterion is met when at least 30 anchors were selected, at least 95%
    of them are within 300 ms, and none exceeds 1 second

The independent model is OpenAI Whisper `base` on CPU, unprompted — deliberately
a different implementation and a different checkpoint from the `faster-whisper
small.en` that produced the candidate, so agreement is evidence rather than an
echo of the same model's mistakes.

What changed from `independent_probe.py`: it hardcoded
`/Users/andershvelplund/...` and read the pilot's own fixed filenames. Here the
cohort, run directory, arm, model and output are arguments, so it runs on any
worker. The comparison logic is unchanged.

This is **not** human timing certification, and it does not claim to be — every
result carries `human_listening: false`, exactly as the original did. It detects
drift between the candidate and an independent recognition of the same audio.
"""
from __future__ import annotations

import argparse
import difflib
import hashlib
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import pinned_words_sidecar_lib as lib  # noqa: E402

WITHIN_SECONDS = 0.3
HARD_LIMIT_SECONDS = 1.0
REQUIRED_ANCHORS = 30
REQUIRED_FRACTION = 0.95


def probe_chapter(model, entry: dict, candidate: dict, audio_root: Path, keep_raw: bool) -> dict:
    anchors: list[dict] = []
    records = []
    for paragraph in entry["paragraphs"]:
        path = audio_root / paragraph["path"]
        if hashlib.sha256(path.read_bytes()).hexdigest() != paragraph["sha256"]:
            raise ValueError(f"audio changed since the cohort was built: {path}")
        started = time.monotonic()
        result = model.transcribe(str(path), language="en", fp16=False, temperature=0,
                                  condition_on_previous_text=False, word_timestamps=True)
        heard = [w for segment in result["segments"] for w in segment.get("words", [])]
        words = next((r["words"] for r in candidate["paragraphs"]
                      if r["paragraph"] == paragraph["index"]), None)
        if words is None:
            continue
        opcodes = difflib.SequenceMatcher(
            None,
            [lib.canonical_alignment_token(w["text"]) for w in words],
            [lib.canonical_alignment_token(w["word"]) for w in heard],
            autojunk=False,
        ).get_opcodes()
        for tag, i1, i2, j1, j2 in opcodes:
            if tag != "equal":
                continue
            for i in range(i1, i2):
                candidate_word, heard_word = words[i], heard[j1 + i - i1]
                anchors.append({
                    "paragraph": paragraph["index"], "word": i, "text": candidate_word["text"],
                    "candidate_start": candidate_word["start"], "probe_start": heard_word["start"],
                    "candidate_end": candidate_word["end"], "probe_end": heard_word["end"],
                })
        records.append({"paragraph": paragraph["index"], "seconds": time.monotonic() - started,
                        **({"raw_segments": result["segments"]} if keep_raw else {})})

    indexes = sorted({round(i * (len(anchors) - 1) / (REQUIRED_ANCHORS - 1))
                      for i in range(REQUIRED_ANCHORS)}) if anchors else []
    selected = [dict(anchors[i]) for i in indexes]
    for anchor in selected:
        anchor["max_delta"] = max(abs(anchor["candidate_start"] - anchor["probe_start"]),
                                  abs(anchor["candidate_end"] - anchor["probe_end"]))
    within = sum(a["max_delta"] <= WITHIN_SECONDS for a in selected)
    return {
        "key": entry["key"],
        "model": "cached OpenAI Whisper base CPU, unprompted",
        "human_listening": False,
        "raw": records,
        "all_exact_match_anchors": anchors,
        "selected_anchors": selected,
        "within_300ms": within,
        "selected_count": len(selected),
        "max_delta": max([a["max_delta"] for a in selected], default=None),
        "criterion_met": (len(selected) >= REQUIRED_ANCHORS
                          and within / len(selected) >= REQUIRED_FRACTION
                          and all(a["max_delta"] <= HARD_LIMIT_SECONDS for a in selected)),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--cohort", type=Path, required=True, help="cohort.json the run was built from")
    parser.add_argument("--run", type=Path, required=True, help="a trial.py --output directory")
    parser.add_argument("--arm", default="auto", choices=["off", "auto"])
    parser.add_argument("--model-path", type=Path, default=Path.home() / ".cache/whisper/base.pt")
    parser.add_argument("--out", type=Path, required=True)
    parser.add_argument("--threads", type=int, default=4)
    parser.add_argument("--only", help="limit to this chapter key, e.g. magna-carta/original-en/ch1")
    parser.add_argument("--keep-raw", action="store_true",
                        help="retain full raw recognition in the output (large)")
    arguments = parser.parse_args()

    import torch
    import whisper

    if not arguments.model_path.exists():
        raise SystemExit(f"independent model missing: {arguments.model_path}")
    torch.set_num_threads(arguments.threads)
    model = whisper.load_model(str(arguments.model_path), device="cpu")
    model_hash = hashlib.sha256(arguments.model_path.read_bytes()).hexdigest()

    cohort = json.loads(arguments.cohort.read_text())
    if arguments.only:
        cohort = [e for e in cohort if e["key"] == arguments.only]
    results = []
    for entry in cohort:
        sidecar = arguments.run / entry["key"] / arguments.arm / "words.candidate.json"
        if not sidecar.exists():
            print(f"  skip {entry['key']}: no {arguments.arm} candidate", flush=True)
            continue
        record = probe_chapter(model, entry, json.loads(sidecar.read_text()),
                              arguments.cohort.parent, arguments.keep_raw)
        record["model_sha256"] = model_hash
        record["arm"] = arguments.arm
        record["candidate_sha256"] = hashlib.sha256(sidecar.read_bytes()).hexdigest()
        results.append(record)
        arguments.out.parent.mkdir(parents=True, exist_ok=True)
        arguments.out.write_text(json.dumps(results, indent=2,
                                           default=lambda v: v.item() if hasattr(v, "item") else v.tolist()))
        verdict = "PASS" if record["criterion_met"] else "FAIL"
        print(f"{verdict} {entry['key']} {record['within_300ms']}/{record['selected_count']} "
              f"within 300ms, max {record['max_delta']:.3f}s", flush=True)


if __name__ == "__main__":
    main()
