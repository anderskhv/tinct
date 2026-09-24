#!/usr/bin/env python3
"""Write the lead reviewer's mapping/drop ledger: ledger/decisions.jsonl.

The editorial judgments are declared below (REFERENTS, NOTES, DROPS). They were
made by reading every entry's live, candidate and source context in
evidence/entries.md. This script only joins those judgments to the mechanical
evidence and checks internal consistency; it does not decide identity.
"""
import json
from collections import Counter
from pathlib import Path

from build_evidence import INP, norm_para, py_index

ROOT = Path(__file__).resolve().parent.parent

# Who each card ID denotes, as checked against the card record (snapshot 1).
REFERENTS = {
    "raskolnikov": "Rodion Romanovitch Raskolnikov, the protagonist",
    "sonya": "Sonia (Sofya Semyonovna) Marmeladov",
    "razumikhin": "Razumihin (Dmitri Prokofitch), Raskolnikov's friend",
    "porfiry": "Porfiry Petrovitch, the examining magistrate",
    "dunya": "Dounia (Avdotya Romanovna), Raskolnikov's sister",
    "luzhin": "Pyotr Petrovitch Luzhin, Dounia's fiancé",
    "svidrigailov": "Arkady Ivanovitch Svidrigaïlov",
    "katerina-ivanovna": "Katerina Ivanovna Marmeladov",
    "ilya-petrovich": "Ilya Petrovitch, the assistant police superintendent",
    "zamyotov": "Zametov (Alexandr Grigorievitch), the head clerk",
}

# Entry-specific notes recorded during the read. Keys are entry IDs.
NOTES = {
    "R062": "Sentence reordered ('From many signs, Pyotr Petrovich seems' -> 'Pyotr Petrovitch, judging by many indications, is'); still Pulcheria's letter about Luzhin. Equal run is only the two name tokens, so identity was confirmed by reading, not by alignment.",
    "R125": "Allusive use: Raskolnikov shouts 'Hey! You, Svidrigaïlov!' at the boulevard dandy, using the name as a taunt (source 4.13 reads the same). The name token denotes Svidrigaïlov and the card explains the allusion; the live binding is carried forward unchanged. The candidate did not change identity here. Flagged for the card owner in case they prefer to unbind allusive uses.",
    "R172": "Razumihin's joke 'My name is Vrazumihin ... not Razumihin, as everyone calls me'; the bound token is his real surname. 'Vrazumihin' is not bound, as before.",
    "R179": "Source 10.68 has 'kept his eyes fixed upon him'; the modern edition names the antecedent, Razumihin (the speaker of 10.67). Same referent.",
    "R194": "Source 10.107 has 'said the latter', i.e. Razumihin (named at the end of 10.106); the modern edition names him. Same referent.",
    "R402": "'Svidrigaïlov,' someone answers from the other room at the police station, naming the man who shot himself; the referent is Svidrigaïlov.",
    "M02": "Same text and position. Count changed because an access-reference edit replaced the following 'He' with a second 'Raskolnikov' (13.108@141, new and unbound).",
    "M03": "Same text and position. Count changed because an access-reference edit replaced 'He stumbled' with 'Raskolnikov stumbled' (13.204@71, new and unbound).",
    "M04": "Luzhin's letter. Same text and offset. Count changed because a restored omission adds 'if ... I meet Rodion Romanovitch' (16.58@1082, new and unbound).",
    "M05": "Luzhin's letter ('I write on the assumption that Rodion Romanovitch ... recovered'). Same text; offset moves +194 because of the restored omission before it.",
    "M06": "Pulcheria Alexandrovna addressing Dounia. Same text and offset. Count changed because a restored omission adds 'You shouldn't have, Dounia' (17.65@374, new and unbound).",
    "M07": "Same speech ('Why did you say that, Dounia?'); offset +3 because 'Rodya.' became 'Rodya....'.",
    "M08": "Sonia speaking to Raskolnikov ('I come from Katerina Ivanovna'); offset +8 from the restored stammer before it. The added 'Katerina Ivanovna told me' (18.5@158) replaces 'She' and is new and unbound.",
    "M09": "Sonia speaking ('Katerina Ivanovna and I have figured it all out'); same offset. The restored clause adds a second 'Katerina Ivanovna' (18.21@177), new and unbound.",
    "M10": "Raskolnikov recalling his scene with Porfiry; same offset.",
    "M11": "'Porfiry's aims'; same offset. The next 'he' became 'Porfiry' through an access-reference edit (26.67@286, new and unbound).",
    "M12": "'how dangerous Porfiry's gambit had been'; offset +5 from the preceding edit.",
    "M13": "'Porfiry had played a bold game -- and was bound to win' -> 'Porfiry, though playing a bold game, was bound to win'. Same subject and referent; offset +4.",
    "M14": "'What had Porfiry been driving at?'; offset -2.",
    "M15": "Raskolnikov explaining Luzhin's letter: 'not to Katerina Ivanovna but to Sofya Semyonovna'; same offset relative to the new text (+15).",
    "M16": "'my relationship with Sofya Semyonovna'; the restored clause 'character of Sofya Semyonovna' (29.64@1072) sits before it and is new and unbound. This mention moves +87.",
    "M17": "'not to Sofya Semyonovna'; offset +87.",
    "M18": "'no acquaintance with Sofya Semyonovna'; offset +87.",
    "M19": "'worth Sofya Semyonovna's little finger'; offset +87.",
    "M20": "'seat Sofya Semyonovna next to my sister'; offset +87.",
    "M21": "'proving Sofya Semyonovna was a thief'; offset +87.",
    "M22": "'on a level with Sofya Semyonovna'; offset +87.",
    "M23": "'Sofya Semyonovna's honor and happiness'; offset +87.",
    "M24": "'Meanwhile, Katerina Ivanovna had caught her breath'; same offset. An access-reference edit replaced 'she' with 'Katerina Ivanovna' later in the paragraph (31.73@239), new and unbound.",
    "M25": "Porfiry to Raskolnikov: 'Mr. Zametov was tremendously struck'; offset +93. A restored omission adds 'you simply bowled Zametov over' (33.13@3848), new and unbound.",
    "M26": "Epilogue trial account: 'while at the university, Raskolnikov had helped'; offset +52.",
    "M27": "'Raskolnikov's landlady also testified'; offset +169. An access-reference edit adds 'Raskolnikov had got the old man into a hospital' (40.3@1373), new and unbound.",
    "M28": "'Raskolnikov had rescued two small children'; offset +195.",
    "M29": "'Dounia finally realized/saw'; same offset.",
    "M30": "'Dounia remembered that her brother had mentioned'; offset -17. An access-reference edit replaced 'her' with 'Dounia' (40.9@558), new and unbound.",
}

DROPS = {
    "M01": ("removed-with-duplicate-text",
            "Live 8.120 duplicated all of source 8.121 (the contemptuous glance and the list of scandals). The package removed the duplicate to restore alignment (ledger round P0-structure). The sentence containing this 'Raskolnikov' no longer exists in candidate 8.120, whose remaining text has no name and matches source 8.120. The same moment is already bound by the existing mention at 8.121@37 ('And he cast a contemptuous glance at Raskolnikov'), which is unchanged in text. There is no candidate span to map to, so this is dropped, not relinked."),
}


def main():
    entries = json.load(open(ROOT / "evidence" / "entries.json"))
    src = json.load(open(INP / "source.json"))
    cand = json.load(open(INP / "candidate.json"))
    out = []
    for e in entries:
        ch, pi = e["chapterNumber"], e["paragraphIndex"]
        srcp = norm_para(src["chapters"][ch - 1]["paragraphs"][pi])
        new = norm_para(cand["chapters"][ch - 1]["paragraphs"][pi])
        rec = {
            "entryId": e["entryId"],
            "impactStatus": e["status"],
            "characterId": e["characterId"],
            "cardSnapshotName": e["characterName"],
            "referent": REFERENTS[e["characterId"]],
            "chapterNumber": ch, "paragraphIndex": pi,
            "existingMention": {k: e["old"][k] for k in ("startOffset", "endOffset", "text")},
            "proposedCandidateSpan": ({"startOffset": e["suggested"]["startOffset"], "endOffset": e["suggested"]["endOffset"],
                                       "text": e["suggested"]["newText"]} if "suggested" in e else None),
        }
        if e["entryId"] in DROPS:
            cls, why = DROPS[e["entryId"]]
            rec.update({"decision": "drop", "decisionClass": cls, "finalCandidateSpan": None, "rationale": why})
        else:
            m = e["mapped"]
            final = {"startOffset": m["startOffset"], "endOffset": m["endOffset"], "text": m["text"]}
            s, t = py_index(new, final["startOffset"]), py_index(new, final["endOffset"])
            assert new[s:t] == final["text"]
            if e["status"] == "renamed-to-source-form":
                assert e["suggestedAgreesWithMapped"], e["entryId"]
                cls = "spelling-variant"
                why = (f"Read in context: '{e['old']['text']}' -> '{final['text']}' is the Garnett spelling of the same name in the same "
                       f"position; the referent is {REFERENTS[e['characterId']]}.")
            else:
                cls = "same-text"
                why = f"Read in context: same name and same referent ({REFERENTS[e['characterId']]})."
            if e["entryId"] in NOTES:
                why += " " + NOTES[e["entryId"]]
            rec.update({"decision": "map", "decisionClass": cls, "finalCandidateSpan": final, "rationale": why})
        rec["evidence"] = {
            "alignment": e["alignment"]["method"],
            "equalRunTokens": e["alignment"].get("equalRunTokens"),
            "neighbourAgreement": e["alignment"].get("neighbourAgreement"),
            "proposedAgreesWithAlignment": e.get("suggestedAgreesWithMapped"),
            "finalTextOccurrencesInSourceParagraph": srcp.count(rec["finalCandidateSpan"]["text"]) if rec["finalCandidateSpan"] else None,
            "liveParagraphSha256": e["liveParagraphSha256"],
            "candidateParagraphSha256": e["candidateParagraphSha256"],
            "editRounds": sorted({x["round"] for x in e["edits"]}),
        }
        rec["identityNote"] = "allusive-use" if e["entryId"] == "R125" else None
        out.append(rec)
    (ROOT / "ledger").mkdir(exist_ok=True)
    with open(ROOT / "ledger" / "decisions.jsonl", "w") as f:
        for r in out:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    print(len(out), Counter((r["decision"], r["decisionClass"]) for r in out))
    print("final text absent from source paragraph:",
          [r["entryId"] for r in out if r["finalCandidateSpan"] and not r["evidence"]["finalTextOccurrencesInSourceParagraph"]])


if __name__ == "__main__":
    main()
