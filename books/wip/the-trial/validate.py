"""Read-only content QA. Does not generate or translate prose."""
import json, re, hashlib
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
GERMAN = HERE / "editions/the-trial-original-de.json"
ENGLISH = HERE / "editions/the-trial-modern-en.json"
EXPECTED = [20, 28, 11, 8, 3, 4, 28, 10, 18, 10]
for path in HERE.rglob("*.json"):
    json.loads(path.read_text())
de = json.loads(GERMAN.read_text())["chapters"]
en = json.loads(ENGLISH.read_text())["chapters"]
assert [c["number"] for c in de] == list(range(1, 11))
assert [c["number"] for c in en] == list(range(1, 11))
assert [len(c["paragraphs"]) for c in de] == EXPECTED
assert [len(c["paragraphs"]) for c in en] == EXPECTED
ratios, flags, german_hits = [], [], []
for dc, ec in zip(de, en):
    n = dc["number"]
    assert dc["title"] == f"Kapitel {n}"
    assert ec["title"] == f"Chapter {n}"
    for i, (dp, ep) in enumerate(zip(dc["paragraphs"], ec["paragraphs"]), 1):
        assert isinstance(ep, str) and len(ep.strip()) > 20, (n, i, "empty/stub")
        assert dp != ep, (n, i, "untranslated paragraph")
        assert not re.search(r"\b(?:TODO|TBD|PLACEHOLDER|TRANSLATION PENDING)\b", ep), (n, i)
        dw, ew = len(dp.split()), len(ep.split())
        ratio = ew / dw
        row = dict(chapter=n, paragraph=i, deWords=dw, enWords=ew, ratio=round(ratio, 4), flag=ratio < .6 or ratio > 2)
        ratios.append(row)
        if row["flag"]: flags.append(row)
        hits = re.findall(r"\b(?:und|nicht|daß|mußte|wurde|hatte|sagte|Fräulein|Herr|Frau|Untersuchungsrichter|Verhaftung|Schuld)\b", ep)
        if hits: german_hits.append(dict(chapter=n, paragraph=i, hits=hits))
onboarding = json.loads((HERE / "onboarding/the-trial.json").read_text())
assert len(onboarding["whyItMatters"]) == 3
assert len(onboarding["angleCards"]) == 4
assert onboarding["cast"] and onboarding["about"] and "acclaim" not in onboarding
assert onboarding["openingText"] == en[0]["paragraphs"][0]
assert hashlib.sha256(GERMAN.read_bytes()).hexdigest() == "caf39bade270a8718f3867720b97533e25364c8948c2b8a7738a11f1d6138d0f"
raw = ROOT / "raw/the-trial/pg69327-images.html"
assert hashlib.sha256(raw.read_bytes()).hexdigest() == "39806572aa000c1db7319503636a41505cc55ed7f9b01499070643ca7b5c23ec"
print(json.dumps(dict(jsonValid=True, chapters=10, paragraphs=140, counts=EXPECTED, wholeBookEquality=True, ratioFlags=flags, germanScan=german_hits, minimum=min(x["ratio"] for x in ratios), maximum=max(x["ratio"] for x in ratios), englishWords=sum(x["enWords"] for x in ratios), sourceHashesValid=True), indent=2))
assert not flags and not german_hits, "Inspect flags before acceptance"
