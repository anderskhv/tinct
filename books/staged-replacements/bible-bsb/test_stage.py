import copy
import unittest
from stage import parse_book, legacy_index, correspondence, utf16, parse_text_export

def verse(n): return {"type":"verse","marker":"v","number":str(n)}
def para(*content, marker="p"): return {"type":"para","marker":marker,"content":list(content)}
def document(*content):
    return {"type":"USJ","version":"3.1","content":[
        {"type":"book","marker":"id","code":"GEN"},
        {"type":"chapter","marker":"c","number":"1"}, *content]}

class ImportTests(unittest.TestCase):
    def test_notes_are_separate_and_punctuation_preserved(self):
        note={"type":"note","marker":"f","content":[{"type":"char","marker":"ft","content":["Never read as verse."]}]}
        doc=document(para(verse(1), "God",note,"’s word.",verse(2),"“Yes.”"))
        original=copy.deepcopy(doc)
        cs,vs,ix,blocks=parse_book(doc,"GEN","Genesis",0)
        self.assertEqual(vs,{"GEN.1.1":"God’s word.","GEN.1.2":"“Yes.”"})
        self.assertEqual(cs[0]["paragraphs"],["¹ God’s word. ² “Yes.”"])
        self.assertEqual(doc,original)
        self.assertEqual(blocks[0]["usj"],doc["content"][2])
        self.assertEqual(ix["GEN.1.1"][0]["startUtf16"],2)

    def test_verse_continues_across_poetry_lines(self):
        cs,vs,ix,_=parse_book(document(
            para(verse(1),"First",marker="q1"),
            para("second.",marker="q2"),
            para(verse(2),"Next.",marker="q1")),"GEN","Genesis",0)
        self.assertEqual(vs["GEN.1.1"],"First second.")
        self.assertEqual(len(ix["GEN.1.1"]),2)
        self.assertEqual(cs[0]["paragraphs"],["¹ First","second.","² Next."])

    def test_titles_not_inserted_into_verse_and_retained(self):
        cs,vs,ix,blocks=parse_book(document(
            para("An editorial heading",marker="s1"),
            para("A psalm title",marker="d"),
            para(verse(1),"Body.")),"GEN","Genesis",0)
        self.assertEqual(vs["GEN.1.1"],"Body.")
        self.assertEqual([x["marker"] for x in blocks],["s1","d","p"])

    def test_duplicate_and_unsupported_reference_fail(self):
        for nums in [(1,1),(1,"2-3")]:
            with self.assertRaises(ValueError):
                parse_book(document(para(verse(nums[0]),"A.",verse(nums[1]),"B.")),"GEN","Genesis",0)

    def test_unknown_marker_fails_closed(self):
        with self.assertRaises(ValueError):
            parse_book(document(para(verse(1),"A.",marker="unexpected")),"GEN","Genesis",0)

    def test_chapter_identity_and_unanchored_text_fail(self):
        with self.assertRaises(ValueError):
            parse_book(document(para("No verse.")),"GEN","Genesis",0)
        d=document(para(verse(1),"A."))
        d["content"][0]["code"]="EXO"
        with self.assertRaises(ValueError): parse_book(d,"GEN","Genesis",0)

    def test_legacy_offsets_use_javascript_units(self):
        d={"chapters":[{"number":1,"paragraphs":["¹ A 😀 word. ² Next."]}]}
        idx,issues,unsafe=legacy_index(d,{1:("GEN",1)})
        self.assertFalse(issues)
        self.assertEqual(idx["GEN.1.1"][0]["endUtf16"],utf16("¹ A 😀 word."))
        self.assertEqual(idx["GEN.1.2"][0]["startUtf16"],utf16("¹ A 😀 word. ² "))

    def test_legacy_corruption_blocks_projection(self):
        for paragraphs in [["¹ A.","¹ Repeated."],["¹ A.","Unmarked tail"],["¹ A. Project Gutenberg"]]:
            idx,issues,unsafe=legacy_index({"chapters":[{"number":1,"paragraphs":paragraphs}]},{1:("GEN",1)})
            self.assertTrue(issues)
            cross=correspondence(["GEN.1.1","GEN.1.2"],{"web-en":idx},{"web-en":unsafe})
            self.assertEqual(cross["GEN.1.1"]["web-en"]["status"],"unsafe_source_chapter")
            self.assertEqual(cross["GEN.1.2"]["web-en"]["status"],"missing_reference")

    def test_missing_verse_never_maps_to_neighbor(self):
        idx={"GEN.1.1":[{"chapterNumber":1}]}
        cross=correspondence(["GEN.1.2"],{"bsb-en":idx},{})
        self.assertEqual(cross["GEN.1.2"]["bsb-en"],{"status":"missing_reference","spans":[]})

    def test_official_text_export_duplicates_fail(self):
        with self.assertRaises(ValueError):
            parse_text_export(b"Genesis 1:1\tA.\nGenesis 1:1\tB.\n",["Genesis"])

if __name__=="__main__": unittest.main()
