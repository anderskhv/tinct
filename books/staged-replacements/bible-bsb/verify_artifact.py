"""Read-back validation of the emitted artifact, independent of layout construction."""
import hashlib, json, re, sys
from pathlib import Path

root = Path(sys.argv[1])
load = lambda n: json.loads((root/n).read_text(encoding="utf-8"))
sha = lambda b: hashlib.sha256(b).hexdigest()
manifest = load("provenance.json")
for name, expected in manifest["outputs"].items():
    assert sha((root/name).read_bytes()) == expected, name
for name in ("bsb.txt","bsb_usj.zip"):
    assert sha((root/name).read_bytes()) == manifest["inputs"][name]["sha256"], name
edition = load("bible-bsb-en.candidate.json")
crosswalk = load("verse-crosswalk.json")["references"]
canonical = load("bsb-verse-text.json")
chapters = {c["number"]:c for c in edition["chapters"]}
assert len(chapters) == len(edition["chapters"]) == 1189
assert set(chapters) == set(range(1,1190))
# Independently re-read the official export by named reference and compare its
# ordered nonempty text entries with the retained canonical verse text.
lines = (root/"bsb.txt").read_text(encoding="utf-8-sig").splitlines()
official = [line.split("\t",1)[1].strip() for line in lines
            if re.match(r"^.+ \d+:\d+\t",line) and line.split("\t",1)[1].strip()]
assert len(official) == len(canonical) == 31086
assert official == list(canonical.values()), "canonical text differs from official export"
ranges = {}
for ref, expected in canonical.items():
    row = crosswalk[ref]["bsb-en"]
    assert row["status"] == "reference_match", ref
    fragments = []
    for span in row["spans"]:
        key = (span["chapterNumber"],span["paragraphIndex"])
        p = chapters[key[0]]["paragraphs"][key[1]]
        raw = p.encode("utf-16-le")
        a,b = span["startUtf16"],span["endUtf16"]
        assert 0 <= a < b <= len(raw)//2, (ref,span)
        fragment = raw[2*a:2*b].decode("utf-16-le")
        assert sha(fragment.encode()) == span["textSha256"], ref
        fragments.append(fragment)
        ranges.setdefault(key,[]).append((a,b))
    compact = lambda t: re.sub(r"\s","",t)
    assert compact("".join(fragments)) == compact(expected), ref
# No extra or duplicated reading text outside verified verse spans.
for c in chapters.values():
    for pi,p in enumerate(c["paragraphs"]):
        raw=p.encode("utf-16-le")
        previous=0
        uncovered=[]
        for a,b in sorted(ranges.get((c["number"],pi),[])):
            assert previous <= a, "overlapping mapped ranges"
            uncovered.append(raw[previous*2:a*2].decode("utf-16-le"))
            previous=b
        uncovered.append(raw[previous*2:].decode("utf-16-le"))
        assert not re.sub(r"[⁰¹²³⁴⁵⁶⁷⁸⁹\s]","","".join(uncovered)), (c["number"],pi)
missing=load("official-empty-references.json")
assert len(missing)==16
assert all(crosswalk[r]["bsb-en"]=={"status":"missing_reference","spans":[]} for r in missing)
assert load("validation.json")["legacyUnsafeChapters"] == {"kjv-en":[],"web-en":[1189]}
print("ARTIFACT_READBACK_PASS: 31,086 verses; complete span coverage; no extra reading text")
print("PINNED_OUTPUTS",json.dumps(manifest["outputs"],sort_keys=True))
