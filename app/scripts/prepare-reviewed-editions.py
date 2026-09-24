#!/usr/bin/env python3
"""Prepare approved edition bytes and re-anchor their existing character packages.

No prose is generated or changed. Only previously reviewed mention spellings
for the same figure are allowed after offset projection. Ambiguous/replaced
mentions are omitted and recorded, never assigned by guessing a referent.
"""
import copy
import difflib
from functools import lru_cache
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


@lru_cache(maxsize=2048)
def opcodes(old, new):
    return difflib.SequenceMatcher(None, old, new, autojunk=False).get_opcodes()


def project(old, new, offset, bias="right"):
    """Monotone projection; right bias delays reveal across inserted text."""
    position = codepoint(old, offset)
    if old == new:
        return offset
    choices = []
    for tag, lo, hi, new_lo, new_hi in opcodes(old, new):
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


def unchanged_name_span(old, new, mention, name_ids):
    """Relocate a reviewed proper name only when spelling/count/identity agree."""
    name = mention["text"]
    if not name or not name[0].isupper() or name_ids.get(name) != {mention["characterId"]}:
        return None
    pattern = r"(?<!\w)" + re.escape(name) + r"(?!\w)"
    old_hits = list(re.finditer(pattern, old))
    new_hits = list(re.finditer(pattern, new))
    if not old_hits or len(old_hits) != len(new_hits):
        return None
    for index, match in enumerate(old_hits):
        if utf16(old[:match.start()]) == mention["startOffset"] and utf16(old[:match.end()]) == mention["endOffset"]:
            target = new_hits[index]
            return utf16(new[:target.start()]), utf16(new[:target.end()])
    return None


def approved_mapping_span(old, new, mention, mappings):
    """Apply an explicitly accepted same-identity spelling mapping by occurrence."""
    matches = [m for m in mappings if m["characterId"] == mention["characterId"] and m["from"] == mention["text"]]
    if not matches:
        return None
    if len(matches) != 1:
        raise ValueError("Duplicate approved mention mapping")
    mapping = matches[0]
    old_hits = list(re.finditer(r"(?<!\w)" + re.escape(mapping["from"]) + r"(?!\w)", old))
    new_hits = list(re.finditer(r"(?<!\w)" + re.escape(mapping["to"]) + r"(?!\w)", new))
    for index, hit in enumerate(old_hits):
        if utf16(old[:hit.start()]) == mention["startOffset"] and utf16(old[:hit.end()]) == mention["endOffset"]:
            target_index = index
            if len(old_hits) != len(new_hits):
                overrides = [v for v in mapping.get("occurrenceOverrides", []) if v["chapterNumber"] == mention["chapterNumber"] and v["paragraphIndex"] == mention["paragraphIndex"] and v["oldOccurrence"] == index]
                if len(overrides) != 1:
                    return None
                target_index = overrides[0]["newOccurrence"]
            if target_index < 0 or target_index >= len(new_hits):
                raise ValueError("Approved occurrence mapping exceeds candidate occurrences")
            target = new_hits[target_index]
            return utf16(new[:target.start()]), utf16(new[:target.end()]), mapping["to"]
    return None


def paragraphs(edition):
    return {str(ch["number"]): [normalize(p) for p in ch["paragraphs"]] for ch in edition["chapters"]}


def reanchor(asset, before_raw, accepted_raw, revision, allow_alias_changes=True, approved_mappings=()):
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
    name_ids = {}
    for reviewed in result["editions"].values():
        for mention in reviewed["mentions"]:
            aliases.setdefault(mention["characterId"], set()).add(mention["text"])
            name_ids.setdefault(mention["text"], set()).add(mention["characterId"])

    def texts(point):
        key, index = str(point["chapterNumber"]), point["paragraphIndex"]
        return old[key][index], new[key][index]

    def point(value):
        a, b = texts(value)
        return {**value, "offset": project(a, b, value["offset"])}

    dropped, mentions, relocated = [], [], []
    for mention in block["mentions"]:
        a, b = texts(mention)
        start, end = codepoint(a, mention["startOffset"]), codepoint(a, mention["endOffset"])
        if a[start:end] != mention["text"]:
            raise ValueError("Previous mention does not verify")
        projected_start = project(a, b, mention["startOffset"], "right")
        projected_end = project(a, b, mention["endOffset"], "left")
        value = b[codepoint(b, projected_start):codepoint(b, projected_end)] if projected_end > projected_start else ""
        if value != mention["text"]:
            exact = unchanged_name_span(a, b, mention, name_ids)
            if exact is not None:
                projected_start, projected_end = exact
                value = mention["text"]
                relocated.append({**mention, "newStartOffset": projected_start, "newEndOffset": projected_end, "method": "unchanged reviewed proper name; same occurrence count and unique character identity"})
        approved = approved_mapping_span(a, b, mention, approved_mappings)
        if approved is not None:
            projected_start, projected_end, value = approved
            relocated.append({**mention, "newText": value, "newStartOffset": projected_start, "newEndOffset": projected_end, "method": "explicit accepted identity mapping; verified occurrence selection"})
        if projected_end <= projected_start:
            dropped.append({**mention, "reason": "source span removed"})
            continue
        if not allow_alias_changes and value != mention["text"] and approved is None:
            dropped.append({**mention, "projectedText": value, "reason": "changed mention text lacks explicit mapping approval"})
            continue
        if value not in aliases[mention["characterId"]] and approved is None:
            dropped.append({**mention, "projectedText": value, "reason": "not a reviewed spelling for this figure"})
            continue
        mentions.append({**mention, "startOffset": projected_start, "endOffset": projected_end, "text": value})
    for character in block["characters"]:
        character["firstMention"] = point(character["firstMention"])
        character["roleVisibleAt"] = point(character["roleVisibleAt"])
        for snapshot in character["snapshots"]:
            snapshot["availableAt"] = point(snapshot["availableAt"])
            for evidence in snapshot.get("evidence", []):
                if "throughOffset" in evidence:
                    a, b = texts(evidence)
                    evidence["throughOffset"] = project(a, b, evidence["throughOffset"])
    block["mentions"] = mentions
    block["sourceSha256"] = digest(accepted_raw)
    block["paragraphHashes"] = {k: [digest(p) for p in values] for k, values in new.items()}
    result["contentVersion"] = revision
    return result, {"retainedMentions": len(mentions), "droppedMentions": dropped, "relocatedExactNames": relocated}


def repair_legacy_evidence(asset, historical_asset, historical_raw, current_raw):
    """Repair evidence omitted by the old publisher, with pinned historical proof."""
    previous = historical_asset["editions"]["modern-en"]
    if previous["sourceSha256"] != digest(historical_raw):
        raise ValueError("Historical evidence source does not match its card")
    old, current = paragraphs(json.loads(historical_raw)), paragraphs(json.loads(current_raw))
    if old.keys() != current.keys() or any(len(old[k]) != len(current[k]) for k in old):
        raise ValueError("Historical evidence structure changed")
    result = copy.deepcopy(asset)
    repairs = []
    for character, was in zip(result["editions"]["modern-en"]["characters"], previous["characters"], strict=True):
        if character["id"] != was["id"]:
            raise ValueError("Historical character identity differs")
        for snapshot, prior in zip(character["snapshots"], was["snapshots"], strict=True):
            if snapshot.get("evidence", []) != prior.get("evidence", []):
                raise ValueError("Evidence already changed; refuse to repair twice")
            at = prior["availableAt"]
            a, b = old[str(at["chapterNumber"])][at["paragraphIndex"]], current[str(at["chapterNumber"])][at["paragraphIndex"]]
            if snapshot["availableAt"] != {**at, "offset": project(a, b, at["offset"])}:
                raise ValueError("Current reveal boundary does not match historical projection")
            for evidence in snapshot.get("evidence", []):
                if "throughOffset" not in evidence:
                    continue
                a = old[str(evidence["chapterNumber"])][evidence["paragraphIndex"]]
                b = current[str(evidence["chapterNumber"])][evidence["paragraphIndex"]]
                offset = project(a, b, evidence["throughOffset"])
                if offset != evidence["throughOffset"]:
                    repairs.append({"characterId": character["id"], **evidence, "newThroughOffset": offset})
                    evidence["throughOffset"] = offset
    return result, repairs


def prepare(root=ROOT, config_path=CONFIG):
    config_path = Path(config_path)
    if not config_path.is_absolute():
        config_path = root / config_path
    config = json.loads(config_path.read_text())
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
        base = item.get("sourceDirectory", f"books/wip/green-{book}")
        url = f"https://raw.githubusercontent.com/anderskhv/tinct/{ref}/{base}/candidate.json"
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
        legacy_repairs = []
        if item.get("evidenceBaselineRef"):
            historical_ref = item["evidenceBaselineRef"]
            if not re.fullmatch(r"[0-9a-f]{40}", historical_ref):
                raise ValueError("Immutable historical evidence ref required")
            def historical(path):
                request = urllib.request.Request(f"https://raw.githubusercontent.com/anderskhv/tinct/{historical_ref}/{path}", headers={"User-Agent": "Tinct-release-preflight"})
                return urllib.request.urlopen(request, timeout=30).read()
            old_asset, legacy_repairs = repair_legacy_evidence(
                old_asset,
                json.loads(historical(f"app/public/data/characters/{book}.v1.json")),
                historical(f"app/public/data/editions/{book}-modern-en.json"),
                before_raw,
            )
        asset, report = reanchor(old_asset, before_raw, accepted_raw, config["revision"], config.get("allowReviewedAliasChanges", True), item.get("approvedMentionMappings", []))
        report["historicalEvidenceRepairs"] = legacy_repairs
        if config.get("reviewEvidence"):
            def evidence(name):
                request = urllib.request.Request(f"https://raw.githubusercontent.com/anderskhv/tinct/{ref}/books/wip/green-{book}/{name}", headers={"User-Agent": "Tinct-release-preflight"})
                return urllib.request.urlopen(request, timeout=30).read()
            if evidence("baseline-live-modern-en.json") != before_raw:
                raise ValueError(f"{book}: review baseline differs from publication baseline")
            if evidence("source.json") != (root / f"app/public/data/editions/{book}-original-en.json").read_bytes():
                raise ValueError(f"{book}: reviewed original source changed")
            expected = [f"{ch['number']}.{index}\t{digest(text)[:16]}" for ch in accepted["chapters"] for index, text in enumerate(ch["paragraphs"])]
            if evidence("accepted-paragraph-hashes.tsv").decode().splitlines() != expected:
                raise ValueError(f"{book}: accepted paragraph hash coverage differs")
            impact = json.loads(evidence("character-card-impact.json"))
            locations = [f"{row['chapter']}.{row['paragraph']}" for row in changed]
            if impact["changed_paragraphs"] != locations:
                raise ValueError(f"{book}: changed paragraph set differs from reviewed impact")
            old_mentions = old_asset["editions"]["modern-en"]["mentions"]
            changed_set = set(locations)
            affected = sum(f"{m['chapterNumber']}.{m['paragraphIndex']}" in changed_set for m in old_mentions)
            if impact["mentions_total"] != len(old_mentions) or impact["mentions_in_changed"] != affected:
                raise ValueError(f"{book}: reviewed character impact differs")
            if book == "jekyll-and-hyde" and any(m["text"].lower() == "cabinet" for m in old_mentions):
                raise ValueError("Jekyll contains a cabinet anchor requiring review")
            report["reviewEvidenceVerified"] = {"paragraphHashes": len(expected), "changedParagraphs": len(changed), "affectedMentions": affected}
        for key in old_asset["editions"]:
            if key != "modern-en" and old_asset["editions"][key] != asset["editions"][key]:
                raise ValueError("An unrelated character edition changed")
        pattern = r"((?:'" + re.escape(book) + r"'|" + re.escape(book) + r"):\s*\{\s*editions:\s*EN,\s*revision:\s*)'[^']+'"
        service_text, count = re.subn(pattern, lambda m: m.group(1) + repr(config["revision"]), service_text)
        if count != 1:
            raise ValueError(f"{book}: expected one character release entry")
        outputs.extend([(target, accepted_raw), (asset_path, (json.dumps(asset, ensure_ascii=False, indent=2) + "\n").encode("utf-8"))])
        reports.append({"book": book, "acceptedSha256": digest(accepted_raw), "changedParagraphs": changed, **report})
    # All inputs validate before any publication file is replaced.
    for path, data in outputs:
        path.write_bytes(data)
    service.write_text(service_text)
    report_path = config_path.with_name(config_path.stem + "-report.json")
    report_path.write_text(json.dumps({"sourceRef": ref, "scope": config["scope"], "books": reports}, ensure_ascii=False, indent=2) + "\n")
    print(json.dumps([{"book": row["book"], "hash": row["acceptedSha256"], "mentions": row["retainedMentions"], "dropped": len(row["droppedMentions"])} for row in reports]))


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", type=Path, default=CONFIG)
    prepare(config_path=parser.parse_args().config)
