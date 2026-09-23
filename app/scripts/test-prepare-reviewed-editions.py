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

    def test_duplicate_names_keep_their_instance(self):
        text, new = "Antony met Antony.", "Antonius met Antony."
        second = module.utf16(text[:text.rindex("Antony")])
        self.assertEqual(module.project(text, new, second), module.utf16(new[:new.rindex("Antony")]))

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
