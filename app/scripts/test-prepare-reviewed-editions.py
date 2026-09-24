#!/usr/bin/env python3
import importlib.util
import json
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location("prepare", Path(__file__).with_name("prepare-reviewed-editions.py"))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


def fixture(text, needle, aliases=()):
    start = text.index(needle)
    point = {"chapterNumber": 1, "paragraphIndex": 0, "offset": module.utf16(text[:start])}
    mention = {"characterId": "person", "chapterNumber": 1, "paragraphIndex": 0,
               "startOffset": point["offset"], "endOffset": point["offset"] + module.utf16(needle), "text": needle}
    raw = json.dumps({"chapters": [{"number": 1, "title": "One", "paragraphs": [text]}]}, ensure_ascii=False).encode()
    character = {"id": "person", "kind": "person", "storyRole": "major", "firstMention": dict(point),
                 "roleVisibleAt": dict(point), "snapshots": [{"availableAt": dict(point), "name": "Existing name",
                 "subtitle": "Existing subtitle", "body": "Existing reviewed prose."}]}
    asset = {"contentVersion": "old", "editions": {
        "modern-en": {"sourceSha256": module.digest(raw), "paragraphHashes": {"1": [module.digest(module.normalize(text))]},
                      "characters": [character], "mentions": [mention]},
        "original-en": {"characters": [], "mentions": [{"characterId": "person", "text": alias} for alias in aliases]}
    }}
    return raw, asset


class ReanchorTests(unittest.TestCase):
    def test_reviewed_alias_with_utf16_offsets_and_unchanged_prose(self):
        old, asset = fixture("😀 Antony spoke.", "Antony", ("Antonius",))
        new = json.dumps({"chapters": [{"number": 1, "title": "One", "paragraphs": ["😀 Antonius spoke."]}]}, ensure_ascii=False).encode()
        output, report = module.reanchor(asset, old, new, "new")
        mention = output["editions"]["modern-en"]["mentions"][0]
        self.assertEqual((mention["startOffset"], mention["endOffset"], mention["text"]), (3, 11, "Antonius"))
        self.assertEqual(report["droppedMentions"], [])
        self.assertEqual(output["editions"]["original-en"], asset["editions"]["original-en"])
        snapshot = output["editions"]["modern-en"]["characters"][0]["snapshots"][0]
        self.assertEqual(snapshot["body"], "Existing reviewed prose.")
        self.assertEqual(snapshot["name"], "Existing name")

    def test_strict_release_does_not_invent_changed_epithet_mapping(self):
        old, asset = fixture("the creature spoke.", "the creature", ("the fiend",))
        new = json.dumps({"chapters": [{"number": 1, "title": "One", "paragraphs": ["the fiend spoke."]}]}).encode()
        output, report = module.reanchor(asset, old, new, "new", allow_alias_changes=False)
        self.assertEqual(output["editions"]["modern-en"]["mentions"], [])
        self.assertEqual(report["droppedMentions"][0]["reason"], "changed mention text lacks explicit mapping approval")

    def test_unreviewed_replacement_is_omitted_instead_of_guessed(self):
        old, asset = fixture("John spoke.", "John")
        new = json.dumps({"chapters": [{"number": 1, "title": "One", "paragraphs": ["James spoke."]}]}).encode()
        output, report = module.reanchor(asset, old, new, "new")
        self.assertEqual(output["editions"]["modern-en"]["mentions"], [])
        self.assertEqual(len(report["droppedMentions"]), 1)

    def test_inserted_gloss_does_not_become_part_of_name(self):
        old, asset = fixture("Antony spoke.", "Antony")
        new = json.dumps({"chapters": [{"number": 1, "title": "One", "paragraphs": ["Antony (a Roman) spoke."]}]}).encode()
        output, report = module.reanchor(asset, old, new, "new")
        self.assertEqual(output["editions"]["modern-en"]["mentions"][0]["text"], "Antony")
        self.assertEqual(report["droppedMentions"], [])

    def test_relocated_proper_name_preserves_identity_and_utf16(self):
        old, new = "Poole led him.", "😀 He was led by Poole."
        mention = {"text": "Poole", "characterId": "poole", "startOffset": 0, "endOffset": 5}
        self.assertEqual(module.unchanged_name_span(old, new, mention, {"Poole": {"poole"}}), (17, 22))
        self.assertIsNone(module.unchanged_name_span(old, new, mention, {"Poole": {"poole", "someone-else"}}))
        self.assertIsNone(module.unchanged_name_span(old, new + " Poole", mention, {"Poole": {"poole"}}))

    def test_changed_epithet_cannot_use_name_relocation(self):
        mention = {"text": "the creature", "characterId": "creature", "startOffset": 0, "endOffset": 12}
        self.assertIsNone(module.unchanged_name_span("the creature spoke.", "the fiend spoke.", mention, {"the creature": {"creature"}}))

    def test_duplicate_names_keep_their_instance(self):
        text, new = "Antony met Antony.", "Antonius met Antony."
        second = module.utf16(text[:text.rindex("Antony")])
        self.assertEqual(module.project(text, new, second), module.utf16(new[:new.rindex("Antony")]))

    def test_snapshot_evidence_moves_with_utf16_reveal_boundary(self):
        old, asset = fixture("Antony spoke.", "Antony")
        snapshot = asset["editions"]["modern-en"]["characters"][0]["snapshots"][0]
        snapshot["availableAt"]["offset"] = 6
        snapshot["evidence"] = [{"chapterNumber": 1, "paragraphIndex": 0, "throughOffset": 6}]
        new = json.dumps({"chapters": [{"number": 1, "title": "One", "paragraphs": ["😀 Antony spoke."]}]}, ensure_ascii=False).encode()
        output, _ = module.reanchor(asset, old, new, "new", allow_alias_changes=False)
        changed = output["editions"]["modern-en"]["characters"][0]["snapshots"][0]
        self.assertEqual(changed["availableAt"]["offset"], 9)
        self.assertEqual(changed["evidence"][0]["throughOffset"], 9)
        self.assertEqual(snapshot["evidence"][0]["throughOffset"], 6)
        self.assertEqual(output["editions"]["original-en"], asset["editions"]["original-en"])

    def test_explicit_mapping_keeps_identity_and_duplicate_occurrence(self):
        old, asset = fixture("Your ruling part directs your ruling part.", "ruling part")
        accepted = json.dumps({"chapters": [{"number": 1, "title": "One", "paragraphs": ["Your ruling faculty directs your ruling faculty."]}]}).encode()
        mappings = [{"characterId": "person", "from": "ruling part", "to": "ruling faculty"}]
        output, report = module.reanchor(asset, old, accepted, "new", False, mappings)
        mention = output["editions"]["modern-en"]["mentions"][0]
        self.assertEqual(mention["characterId"], "person")
        self.assertEqual(mention["text"], "ruling faculty")
        self.assertEqual(report["droppedMentions"], [])
        self.assertIsNone(module.approved_mapping_span("Your ruling part directs your ruling part.", "A ruling faculty.", asset["editions"]["modern-en"]["mentions"][0], mappings))
        self.assertIsNone(module.approved_mapping_span("Your ruling part.", "Your ruling faculty.", asset["editions"]["modern-en"]["mentions"][0], [{**mappings[0], "characterId": "other"}]))

    def test_corrupt_previous_source_fails_closed(self):
        old, asset = fixture("Antony spoke.", "Antony")
        with self.assertRaisesRegex(ValueError, "previous edition"):
            module.reanchor(asset, old + b" ", old, "new")

    def test_paragraph_structure_change_fails_closed(self):
        old, asset = fixture("Antony spoke.", "Antony")
        new = json.dumps({"chapters": [{"number": 1, "title": "One", "paragraphs": ["Antony", "spoke."]}]}).encode()
        with self.assertRaisesRegex(ValueError, "structure"):
            module.reanchor(asset, old, new, "new")


if __name__ == "__main__":
    unittest.main()
