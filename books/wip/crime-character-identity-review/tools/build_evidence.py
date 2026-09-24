#!/usr/bin/env python3
"""Build mechanical evidence for the Crime and Punishment character-identity review.

Offline and deterministic: no network or model calls. Reads pinned inputs from
`inputs/` (see ../INPUTS.md) and writes `evidence/entries.json` and
`evidence/entries.md`.

For each of the 438 flagged live mentions (408 `renamed-to-source-form`, 30
`manual-review`) it records:

- the live mention and its context in the live modern-en paragraph;
- a token alignment of the live paragraph against the accepted candidate
  paragraph. Tokens are compared after a Garnett-variant fold (case, diacritics,
  Dounia/Dunia->Dunya, Sonia->Sonya, Razumihin->Razumikhin, -itch->-ich), so a
  pure spelling change still aligns as "equal";
- where the mention lands in the candidate (the mapped span), and whether it
  agrees with the script-suggested span in character-card-impact.json;
- the candidate and source (Garnett original-en) paragraph context;
- the ledger edits (round, category, reason) that touched the paragraph.

This is evidence for editorial decisions, not a decision. Identity decisions
are recorded separately in ledger/decisions.jsonl.
"""
import difflib
import hashlib
import json
import re
import sys
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
INP = ROOT / "inputs"
OUT = ROOT / "evidence"

WORD = re.compile(r"[^\W_]+", re.UNICODE)
FOLD = {"dounia": "dunya", "dunia": "dunya", "sonia": "sonya", "razumihin": "razumikhin",
        "zossimov": "zosimov", "mikolka": "mikolka"}


def norm_para(text):
    # Mirrors app/src/services/characters/characterCards.ts normalizeParagraph.
    return re.sub(r" {2,}", " ", text.replace("\n", " "))


def fold(tok):
    t = unicodedata.normalize("NFKD", tok.lower())
    t = "".join(c for c in t if not unicodedata.combining(c))
    t = FOLD.get(t, t)
    if t.endswith("itch"):
        t = t[:-4] + "ich"
    return t


def tokens(text):
    return [(m.start(), m.end(), fold(m.group())) for m in WORD.finditer(text)]


def u16(text, i):
    """Python str index -> UTF-16 code-unit offset."""
    return len(text[:i].encode("utf-16-le")) // 2


def py_index(text, off16):
    """UTF-16 code-unit offset -> Python str index."""
    return len(text.encode("utf-16-le")[: 2 * off16].decode("utf-16-le"))


def ctx(text, s, e, width=160):
    a, b = max(0, s - width), min(len(text), e + width)
    return ("…" if a else "") + text[a:s] + "⟦" + text[s:e] + "⟧" + text[e:b] + ("…" if b < len(text) else "")


def align(old, new, s, e):
    """Map old[s:e] (python indices) into new via folded-token alignment."""
    ot, nt = tokens(old), tokens(new)
    idx = [i for i, t in enumerate(ot) if t[0] >= s and t[1] <= e]
    if not idx:
        return {"method": "no-token"}
    first, last = idx[0], idx[-1]
    sm = difflib.SequenceMatcher(a=[t[2] for t in ot], b=[t[2] for t in nt], autojunk=False)
    ops = sm.get_opcodes()

    def locate(i):
        for tag, i1, i2, j1, j2 in ops:
            if i1 <= i < i2:
                return tag, i1, i2, j1, j2
        return None

    lf, ll = locate(first), locate(last)
    if lf and ll and lf[0] == "equal" and ll[0] == "equal":
        j_first = lf[3] + (first - lf[1])
        j_last = ll[3] + (last - ll[1])
        if j_last - j_first == last - first:
            # Neighbourhood check: how many of the 6 folded tokens either side agree.
            left = sum(1 for k in range(1, 7) if first - k >= 0 and j_first - k >= 0 and ot[first - k][2] == nt[j_first - k][2])
            right = sum(1 for k in range(1, 7) if last + k < len(ot) and j_last + k < len(nt) and ot[last + k][2] == nt[j_last + k][2])
            span_l = min(lf[2] - lf[1], ll[2] - ll[1])
            return {"method": "equal-block", "start": nt[j_first][0], "end": nt[j_last][1],
                    "equalRunTokens": span_l, "neighbourAgreement": f"{left}/6 left, {right}/6 right"}
    # Fallback: same folded sequence inside one non-equal block, matched by rank.
    if lf and ll and lf == ll and lf[0] == "replace":
        _, i1, i2, j1, j2 = lf
        seq = [t[2] for t in ot[first:last + 1]]
        n = len(seq)
        o_hits = [i for i in range(i1, i2 - n + 1) if [t[2] for t in ot[i:i + n]] == seq]
        n_hits = [j for j in range(j1, j2 - n + 1) if [t[2] for t in nt[j:j + n]] == seq]
        if len(o_hits) == len(n_hits) and first in o_hits:
            j = n_hits[o_hits.index(first)]
            return {"method": "rank-in-changed-block", "start": nt[j][0], "end": nt[j + n - 1][1],
                    "blockOld": old[ot[i1][0]:ot[i2 - 1][1]], "blockNew": new[nt[j1][0]:nt[j2 - 1][1]] if j2 > j1 else ""}
        return {"method": "unaligned", "tag": lf[0],
                "blockOld": old[ot[i1][0]:ot[i2 - 1][1]] if i2 > i1 else "",
                "blockNew": new[nt[j1][0]:nt[j2 - 1][1]] if j2 > j1 else "",
                "oldHitsInBlock": len(o_hits), "newHitsInBlock": len(n_hits)}
    tag = lf[0] if lf else None
    info = {"method": "unaligned", "tag": tag}
    if lf:
        _, i1, i2, j1, j2 = lf
        info["blockOld"] = old[ot[i1][0]:ot[i2 - 1][1]] if i2 > i1 else ""
        info["blockNew"] = new[nt[j1][0]:nt[j2 - 1][1]] if j2 > j1 else ""
    return info


def main():
    live = json.load(open(INP / "baseline-live-modern-en.json"))
    cand = json.load(open(INP / "candidate.json"))
    src = json.load(open(INP / "source.json"))
    impact = json.load(open(INP / "character-card-impact.json"))
    cards = json.load(open(INP / "crime-and-punishment.v1.json"))["editions"]["modern-en"]
    chars = {c["id"]: c for c in cards["characters"]}
    edits = {}
    for line in open(INP / "changes.jsonl"):
        x = json.loads(line)
        edits.setdefault((x["chapter"], x["paragraph"]), []).append(
            {"round": x["round"], "category": x["category"], "reason": x["reason"]})

    flagged = [m for m in impact["mentions"] if m["status"] in ("renamed-to-source-form", "manual-review")]
    entries, n_r, n_m = [], 0, 0
    for m in flagged:
        ch, pi = m["chapter"], m["paragraph"]
        old = norm_para(live["chapters"][ch - 1]["paragraphs"][pi])
        new = norm_para(cand["chapters"][ch - 1]["paragraphs"][pi])
        srcp = norm_para(src["chapters"][ch - 1]["paragraphs"][pi])
        s = py_index(old, m["oldStart"])
        e = s + len(m["text"])
        assert old[s:e] == m["text"], (m, old[s:e])
        if m["status"] == "renamed-to-source-form":
            n_r += 1
            eid = f"R{n_r:03d}"
        else:
            n_m += 1
            eid = f"M{n_m:02d}"
        a = align(old, new, s, e)
        rec = {
            "entryId": eid, "status": m["status"], "characterId": m["characterId"],
            "characterName": chars[m["characterId"]]["snapshots"][0]["name"],
            "chapterNumber": ch, "paragraphIndex": pi,
            "old": {"startOffset": m["oldStart"], "endOffset": m["oldStart"] + len(m["text"].encode("utf-16-le")) // 2,
                    "text": m["text"], "context": ctx(old, s, e)},
            "liveParagraphSha256": hashlib.sha256(old.encode()).hexdigest(),
            "candidateParagraphSha256": hashlib.sha256(new.encode()).hexdigest(),
            "alignment": {k: v for k, v in a.items() if k not in ("start", "end")},
            "edits": edits.get((ch, pi), []),
            "sourceContextLength": len(srcp),
        }
        if "start" in a:
            rec["mapped"] = {"startOffset": u16(new, a["start"]), "endOffset": u16(new, a["end"]),
                             "text": new[a["start"]:a["end"]], "context": ctx(new, a["start"], a["end"])}
        if "suggestedNewStart" in m:
            ss = py_index(new, m["suggestedNewStart"])
            se = py_index(new, m["suggestedNewEnd"])
            rec["suggested"] = {"startOffset": m["suggestedNewStart"], "endOffset": m["suggestedNewEnd"],
                                "newText": m["newText"], "textAtSpan": new[ss:se], "context": ctx(new, ss, se)}
            rec["suggestedAgreesWithMapped"] = bool(rec.get("mapped")) and \
                (rec["mapped"]["startOffset"], rec["mapped"]["endOffset"]) == (m["suggestedNewStart"], m["suggestedNewEnd"])
        entries.append(rec)

    OUT.mkdir(exist_ok=True)
    (OUT / "entries.json").write_text(json.dumps(entries, indent=1, ensure_ascii=False) + "\n")
    lines = ["# Evidence worksheet (generated by tools/build_evidence.py; do not edit)", ""]
    for r in entries:
        lines += [f"## {r['entryId']} · {r['characterId']} · ch {r['chapterNumber']} ¶{r['paragraphIndex']} · {r['status']}",
                  "", f"- live `{r['old']['text']}` @{r['old']['startOffset']}: {r['old']['context']}",
                  f"- alignment: `{r['alignment']['method']}`"]
        if "mapped" in r:
            if "equalRunTokens" in r["alignment"]:
                lines.append(f"- equal run {r['alignment']['equalRunTokens']} tokens; neighbours {r['alignment']['neighbourAgreement']}")
            lines.append(f"- mapped `{r['mapped']['text']}` @{r['mapped']['startOffset']}–{r['mapped']['endOffset']}: {r['mapped']['context']}")
        if "suggested" in r:
            lines.append(f"- suggested `{r['suggested']['newText']}` @{r['suggested']['startOffset']} (agrees: {r['suggestedAgreesWithMapped']})")
        for k in ("blockOld", "blockNew"):
            if k in r["alignment"]:
                lines.append(f"- {k}: {r['alignment'][k][:600]}")
        for ed in r["edits"]:
            lines.append(f"- edit {ed['round']} [{ed['category']}]: {ed['reason'][:300]}")
        lines.append("")
    (OUT / "entries.md").write_text("\n".join(lines))
    from collections import Counter
    print(len(entries), Counter(r["alignment"]["method"] for r in entries),
          Counter(r.get("suggestedAgreesWithMapped") for r in entries if r["status"] != "manual-review"))


if __name__ == "__main__":
    sys.exit(main())
