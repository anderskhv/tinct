#!/usr/bin/env python3
"""Publish the accepted Jane Eyre and Pride and Prejudice structural successors.

Inputs are pinned by commit and SHA-256; nothing is generated or reworded.
  * Final editions: featured-source-cleanup 7994156f (+ Jane clarity 88ebdd4c).
  * Character anchors: the reviewed same-structure re-anchoring of PR #160
    (Jane, e0306303) and PR #159 (Pride, a771e426), then carried through the
    accepted paragraph map. A mention whose exact text does not survive is
    dropped and recorded; nothing is re-bound by guessing.

  python3 scripts/prepare-structural-release.py            # write
  python3 scripts/prepare-structural-release.py --verify   # check published bytes
"""
import copy, csv, hashlib, importlib.util, io, json, re, sys, urllib.request
from pathlib import Path

APP = Path(__file__).resolve().parents[1]
ROOT = APP.parent
BASE = "b91d4b8d8ceab2e3379cb6a83174ce97c7c47aec"
CLEAN = "7994156f131a0c382e3f1372518dcb55a44eaade"
CLARITY = "88ebdd4c9779fe45871ce87777c5dd6a8e48dac0"
REVISION = "2026-09-25.1"
BOOKS = {
    "jane-eyre": {
        "cardRef": "e0306303e172382d22d48f256f57ea9852491ecb",
        "stageRef": "d47d80f8e849819c67b4879f925d1493619478e3",
        "stage": {"modern-en": "5e270560909297f7f9ccb4e0914a79923b29471008b23e1e70a251a882dce7d7",
                  "original-en": "055aad5e04c0c9dbb32969c57cbcc54aa5e00c012256cd3debbce0577cbe5f96"},
        "final": {"modern-en": "0488dac58943afde5be0b7e1105206429e2fc0a887462ff753057081e096dff6",
                  "original-en": "d05d18103f439a8267be407ac8e6d44068236c262321f386174050bbf2109257"},
        "counts": (38, 4034),
    },
    "pride-and-prejudice": {
        "cardRef": "a771e4260730628c08ccd297554ef6a8db26c9a7",
        "stageRef": "e004aad94981ccd203f7d603588d38392158cff5",
        "stage": {"modern-en": "5ba867fe5e13a7c7c1f1f94946c6b6a575f342951467245a0d816723dd3f4c77",
                  "original-en": "5a44024668550ab8cdae47579bd798b5b60c8e3e1401043b6d9f8777081760c6"},
        "final": {"modern-en": "6c80aa42dd44707774a6049d2a17bbfaf61806751e6f0cf5536b8837dabfc463",
                  "original-en": "6d968f00645655554e44156a16a2713a3c1f60e74cb533d56aa5231847ca183c"},
        "counts": (61, 2053),
    },
}

spec = importlib.util.spec_from_file_location("reviewed", APP / "scripts/prepare-reviewed-editions.py")
reviewed = importlib.util.module_from_spec(spec)
spec.loader.exec_module(reviewed)
project, normalize, utf16, codepoint, digest = reviewed.project, reviewed.normalize, reviewed.utf16, reviewed.codepoint, reviewed.digest


def fetch(ref, path):
    req = urllib.request.Request(f"https://raw.githubusercontent.com/anderskhv/tinct/{ref}/{path}", headers={"User-Agent": "Tinct-structural-release"})
    return urllib.request.urlopen(req, timeout=60).read()


def pinned(raw, sha, label):
    if digest(raw) != sha:
        raise SystemExit(f"{label}: expected {sha}, got {digest(raw)}")
    return raw


def paragraphs(raw):
    return {c["number"]: [normalize(p) for p in c["paragraphs"]] for c in json.loads(raw)["chapters"]}


def final_edition(book, edition):
    folder = f"books/wip/featured-source-cleanup/{book}"
    raw = fetch(CLEAN, f"{folder}/{book}-{edition}.json")
    if book == "jane-eyre" and edition == "modern-en":
        patch = json.loads(fetch(CLARITY, "books/wip/jane-eyre-targeted-clarity-review/PATCH.json"))
        base = patch["bases"]["corrected"]
        pinned(raw, base["sha256"], "Jane corrected base")
        text = raw.decode()
        for change in patch["changes"]:
            old, new = (json.dumps(change[k], ensure_ascii=False) for k in ("old", "new"))
            if text.count(old) != 1:
                raise SystemExit("Jane clarity patch does not apply exactly once")
            text = text.replace(old, new, 1)
        raw = text.encode()
    return pinned(raw, BOOKS[book]["final"][edition], f"{book} {edition} final")


def structure(book, edition, stage, final):
    """(chapter, index) of the stage text -> (chapter, index, offset mapper) in the final text."""
    folder = f"books/wip/featured-source-cleanup/{book}"
    tsv = fetch(CLEAN, f"{folder}/paragraph-map.tsv").decode()
    rows = list(csv.DictReader(io.StringIO("\n".join(l for l in tsv.splitlines() if not l.startswith("#"))), delimiter="\t"))
    rows = {(int(r["old_chapter"]), int(r["old_index"])): r for r in rows}
    deleted = set()
    for ch, texts in stage.items():
        for pi in range(len(texts)):
            if rows.get((ch, pi), {}).get("op") == "delete":
                deleted.add((ch, pi))

    def target(ch, pi):
        row = rows.get((ch, pi))
        return (int(row["new_chapter"]), int(row["new_index"])) if row else (ch, pi)

    def mapper(ch, pi):
        row = rows.get((ch, pi))
        op = row["op"] if row else "keep"
        if op == "delete":
            return None
        nc, np_ = target(ch, pi)
        old, new = stage[ch][pi], final[nc][np_]
        if op == "merge-head":
            if not new.startswith(old + " "):
                raise SystemExit(f"{book} {edition} {ch}.{pi}: merge head does not verify")
            return nc, np_, lambda offset, bias="right": offset
        if op == "merge-tail":
            head = stage[ch][pi - 1]
            if new != head + " " + old:
                raise SystemExit(f"{book} {edition} {ch}.{pi}: merge tail does not verify")
            shift = utf16(head) + 1
            return nc, np_, lambda offset, bias="right": offset + shift
        return nc, np_, lambda offset, bias="right": project(old, new, offset, bias)

    def point(ch, pi, offset, bias="right"):
        hit = mapper(ch, pi)
        if hit:
            nc, np_, move = hit
            return nc, np_, move(offset, bias)
        # A deleted caption repeated a neighbouring line: a point there moves to
        # the start of the next surviving paragraph, never earlier in the book.
        for later in range(pi + 1, len(stage[ch])):
            if (ch, later) not in deleted:
                nc, np_, _ = mapper(ch, later)
                return nc, np_, 0
        for earlier in range(pi - 1, -1, -1):
            if (ch, earlier) not in deleted:
                nc, np_, _ = mapper(ch, earlier)
                return nc, np_, utf16(final[nc][np_])
        raise SystemExit(f"{book} {edition} {ch}.{pi}: no surviving paragraph")

    return mapper, point


def carry(book, edition, block, stage_raw, final_raw):
    stage, final = paragraphs(stage_raw), paragraphs(final_raw)
    if block["sourceSha256"] != digest(stage_raw):
        raise SystemExit(f"{book} {edition}: card is not anchored to the reviewed stage text")
    if block["paragraphHashes"] != {str(k): [digest(p) for p in v] for k, v in stage.items()}:
        raise SystemExit(f"{book} {edition}: stage paragraph hashes do not verify")
    mapper, point = structure(book, edition, stage, final)
    kept, dropped = [], []
    for mention in block["mentions"]:
        ch, pi = mention["chapterNumber"], mention["paragraphIndex"]
        hit = mapper(ch, pi)
        if not hit:
            dropped.append({**mention, "reason": "paragraph removed (duplicate caption)"})
            continue
        nc, np_, move = hit
        start, end = move(mention["startOffset"], "right"), move(mention["endOffset"], "left")
        text = final[nc][np_]
        value = text[codepoint(text, start):codepoint(text, end)] if end > start else ""
        if value != mention["text"]:
            dropped.append({**mention, "projectedText": value, "reason": "exact mention text does not survive"})
            continue
        kept.append({**mention, "chapterNumber": nc, "paragraphIndex": np_, "startOffset": start, "endOffset": end})

    def moved(value, key="offset"):
        nc, np_, offset = point(value["chapterNumber"], value["paragraphIndex"], value[key])
        return {**value, "chapterNumber": nc, "paragraphIndex": np_, key: offset}

    for character in block["characters"]:
        character["firstMention"] = moved(character["firstMention"])
        character["roleVisibleAt"] = moved(character["roleVisibleAt"])
        for snapshot in character["snapshots"]:
            snapshot["availableAt"] = moved(snapshot["availableAt"])
            snapshot["evidence"] = [moved(e, "throughOffset") if "throughOffset" in e else e for e in snapshot.get("evidence", [])]
    block["mentions"] = kept
    block["sourceSha256"] = digest(final_raw)
    block["paragraphCount"] = sum(len(v) for v in final.values())
    block["paragraphHashes"] = {str(k): [digest(p) for p in v] for k, v in final.items()}
    return {"retainedMentions": len(kept), "droppedMentions": dropped}


def build():
    outputs, report = {}, {"revision": REVISION, "baselineRef": BASE, "structureRef": CLEAN, "clarityRef": CLARITY, "books": {}}
    for book, cfg in BOOKS.items():
        card = json.loads(fetch(cfg["cardRef"], f"app/public/data/characters/{book}.v1.json"))
        card = copy.deepcopy(card)
        book_report = {"cardRef": cfg["cardRef"], "editions": {}}
        for edition in ("original-en", "modern-en"):
            stage_raw = pinned(fetch(cfg["stageRef"], f"books/wip/green-{book}/candidate.json"), cfg["stage"][edition], f"{book} stage") \
                if edition == "modern-en" else pinned(fetch(BASE, f"app/public/data/editions/{book}-{edition}.json"), cfg["stage"][edition], f"{book} stage")
            final_raw = final_edition(book, edition)
            final = json.loads(final_raw)
            if (len(final["chapters"]), sum(len(c["paragraphs"]) for c in final["chapters"])) != cfg["counts"]:
                raise SystemExit(f"{book} {edition}: unexpected structure")
            book_report["editions"][edition] = carry(book, edition, card["editions"][edition], stage_raw, final_raw)
            outputs[f"public/data/editions/{book}-{edition}.json"] = final_raw
        card["contentVersion"] = REVISION
        outputs[f"public/data/characters/{book}.v1.json"] = (json.dumps(card, ensure_ascii=False, indent=2) + "\n").encode()
        report["books"][book] = book_report
    outputs["../books/wip/structural-release-20260925-report.json"] = (json.dumps(report, ensure_ascii=False, indent=2) + "\n").encode()
    return outputs


if __name__ == "__main__":
    outputs = build()
    if "--verify" in sys.argv:
        stale = [path for path, raw in outputs.items() if (APP / path).read_bytes() != raw]
        if stale:
            raise SystemExit("Published bytes differ from the pinned build: " + ", ".join(stale))
        print(f"Verified {len(outputs)} structural release files")
    else:
        for path, raw in outputs.items():
            (APP / path).write_bytes(raw)
        report = json.loads(outputs["../books/wip/structural-release-20260925-report.json"])
        for book, data in report["books"].items():
            for edition, result in data["editions"].items():
                print(book, edition, "retained", result["retainedMentions"], "dropped", len(result["droppedMentions"]))
