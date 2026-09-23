#!/usr/bin/env python3
"""Prepare approved edition bytes and re-anchor their existing character packages.

No prose is generated or changed. Only previously reviewed mention spellings
for the same figure are allowed after offset projection. Ambiguous/replaced
mentions are omitted and recorded, never assigned by guessing a referent.
"""
import copy
import difflib
import hashlib
import json
from pathlib import Path
import re
import urllib.request

ROOT = Path(__file__).resolve().parents[2]
CONFIG = ROOT / "books/wip/three-book-release-20260923.json"


def digest(raw):
    return hashlib.sha256(raw if isinstance(raw, bytes) else raw.encode("utf-8")).hexdigest()


def normalize(text):
    return re.sub(r" {2,}", " ", text.replace("\n", " "))


def utf16(text):
    return len(text.encode("utf-16-le")) // 2


def codepoint(text, offset):
    if not isinstance(offset, int) or offset < 0 or offset > utf16(text):
        raise ValueError("Invalid UTF-16 offset")
    return len(text.encode("utf-16-le")[:offset * 2].decode("utf-16-le"))


def project(old, new, offset, bias="right"):
    """Monotone projection; right bias delays reveal across inserted text."""
    position = codepoint(old, offset)
    if old == new:
        return offset
    choices = []
    for tag, lo, hi, new_lo, new_hi in difflib.SequenceMatcher(None, old, new, autojunk=False).get_opcodes():
        if lo <= position <= hi:
            if tag == "equal":
                choices.append(new_lo + position - lo)
            elif lo == hi:
                choices.extend([new_lo, new_hi])
            elif position == lo:
                choices.append(new_lo)
            elif position == hi:
                choices.append(new_hi)
            else:
                choices.extend([new_lo, new_hi])
    if not choices:
        if not old and not new and offset == 0:
            return 0
        raise ValueError("Cannot project source offset")
    return utf16(new[:max(choices) if bias == "right" else min(choices)])


def paragraphs(edition):
    return {str(ch["number"]): [normalize(p) for p in ch["paragraphs"]] for ch in edition["chapters"]}


def reanchor(asset, before_raw, accepted_raw, revision):
    result = copy.deepcopy(asset)
    block = result["editions"]["modern-en"]
    if digest(before_raw) != block["sourceSha256"]:
        raise ValueError("Character package does not match the previous edition")
    old = paragraphs(json.loads(before_raw))
    new = paragraphs(json.loads(accepted_raw))
    if old.keys() != new.keys() or any(len(old[k]) != len(new[k]) for k in old):
        raise ValueError("Chapter/paragraph structure changed")
    hashes = {k: [digest(p) for p in values] for k, values in old.items()}
    if hashes != block["paragraphHashes"]:
        raise ValueError("Previous paragraph hashes do not verify")
    aliases = {}
    for reviewed in result["editions"].values():
        for mention in reviewed["mentions"]:
            aliases.setdefault(mention["characterId"], set()).add(mention["text"])

    def texts(point):
        key, index = str(point["chapterNumber"]), point["paragraphIndex"]
        return old[key][index], new[key][index]

    def point(value):
        a, b = texts(value)
        return {**value, "offset": project(a, b, value["offset"])}

    dropped, mentions = [], []
    for mention in block["mentions"]:
        a, b = texts(mention)
        start, end = codepoint(a, mention["startOffset"]), codepoint(a, mention["endOffset"])
        if a[start:end] != mention["text"]:
            raise ValueError("Previous mention does not verify")
        projected_start = project(a, b, mention["startOffset"], "right")
        projected_end = project(a, b, mention["endOffset"], "left")
        if projected_end <= projected_start:
            dropped.append({**mention, "reason": "source span removed"})
            continue
        value = b[codepoint(b, projected_start):codepoint(b, projected_end)]
        if value not in aliases[mention["characterId"]]:
            dropped.append({**mention, "projectedText": value, "reason": "not a reviewed spelling for this figure"})
            continue
        mentions.append({**mention, "startOffset": projected_start, "endOffset": projected_end, "text": value})
    for character in block["characters"]:
        character["firstMention"] = point(character["firstMention"])
        character["roleVisibleAt"] = point(character["roleVisibleAt"])
        for snapshot in character["snapshots"]:
            snapshot["availableAt"] = point(snapshot["availableAt"])
    block["mentions"] = mentions
    block["sourceSha256"] = digest(accepted_raw)
    block["paragraphHashes"] = {k: [digest(p) for p in values] for k, values in new.items()}
    result["contentVersion"] = revision
    return result, {"retainedMentions": len(mentions), "droppedMentions": dropped}


def prepare(root=ROOT):
    config = json.loads((root / "books/wip/three-book-release-20260923.json").read_text())
    ref = config["sourceRef"]
    if not re.fullmatch(r"[0-9a-f]{40}", ref):
        raise ValueError("An immutable source commit is required")
    service = root / "app/src/services/characters/characterCards.ts"
    service_text = service.read_text()
    outputs, reports = [], []
    for item in config["books"]:
        book = item["id"]
        target = root / f"app/public/data/editions/{book}-modern-en.json"
        before_raw = target.read_bytes()
        if digest(before_raw) != item["before"]:
            raise ValueError(f"{book}: live source moved; review before replacing")
        url = f"https://raw.githubusercontent.com/anderskhv/tinct/{ref}/books/wip/green-{book}/candidate.json"
        request = urllib.request.Request(url, headers={"User-Agent": "Tinct-release-preflight"})
        accepted_raw = urllib.request.urlopen(request, timeout=30).read()
        if digest(accepted_raw) != item["accepted"]:
            raise ValueError(f"{book}: candidate hash differs from acceptance")
        before, accepted = json.loads(before_raw), json.loads(accepted_raw)
        if len(accepted["chapters"]) != item["chapters"]:
            raise ValueError(f"{book}: chapter count changed")
        if {k: v for k, v in before.items() if k != "chapters"} != {k: v for k, v in accepted.items() if k != "chapters"}:
            raise ValueError(f"{book}: edition metadata changed")
        changed = []
        for old_ch, new_ch in zip(before["chapters"], accepted["chapters"]):
            if {k: v for k, v in old_ch.items() if k != "paragraphs"} != {k: v for k, v in new_ch.items() if k != "paragraphs"}:
                raise ValueError(f"{book}: chapter identity changed")
            if len(old_ch["paragraphs"]) != len(new_ch["paragraphs"]):
                raise ValueError(f"{book}: paragraph count changed")
            changed.extend({"chapter": new_ch["number"], "paragraph": i} for i, (old_p, new_p) in enumerate(zip(old_ch["paragraphs"], new_ch["paragraphs"])) if old_p != new_p)
        if sum(len(ch["paragraphs"]) for ch in accepted["chapters"]) != item["paragraphs"] or len(changed) != item["changed"]:
            raise ValueError(f"{book}: changed paragraph set differs from handoff")
        asset_path = root / f"app/public/data/characters/{book}.v1.json"
        old_asset = json.loads(asset_path.read_bytes())
        asset, report = reanchor(old_asset, before_raw, accepted_raw, config["revision"])
        for key in old_asset["editions"]:
            if key != "modern-en" and old_asset["editions"][key] != asset["editions"][key]:
                raise ValueError("An unrelated character edition changed")
        pattern = r"((?:'" + re.escape(book) + r"'|" + re.escape(book) + r"):\s*\{\s*editions:\s*EN,\s*revision:\s*)'[^']+'"
        service_text, count = re.subn(pattern, lambda m: m.group(1) + repr(config["revision"]), service_text)
        if count != 1:
            raise ValueError(f"{book}: expected one character release entry")
        outputs.extend([(target, accepted_raw), (asset_path, (json.dumps(asset, ensure_ascii=False, indent=1) + "\n").encode("utf-8"))])
        reports.append({"book": book, "acceptedSha256": digest(accepted_raw), "changedParagraphs": changed, **report})
    # All inputs validate before any publication file is replaced.
    for path, data in outputs:
        path.write_bytes(data)
    service.write_text(service_text)
    report_path = root / "books/wip/three-book-release-20260923-report.json"
    report_path.write_text(json.dumps({"sourceRef": ref, "scope": config["scope"], "books": reports}, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps([{"book": row["book"], "hash": row["acceptedSha256"], "mentions": row["retainedMentions"], "dropped": len(row["droppedMentions"])} for row in reports]))


if __name__ == "__main__":
    prepare()
