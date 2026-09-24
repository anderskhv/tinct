"""Run: python3 -m pytest books/align -q   (or python3 books/align/test_build_alignment.py)"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_alignment import pairs_to_segments, sentences, segments_from_beads, validate  # noqa: E402


def test_match_and_unresolved_tile():
    assert validate([["m", 0, 5, 0, 4], ["u", 5, 12, 4, 9]], 12, 9) is None


def test_one_sided_segments_are_valid():
    segs = [["m", 0, 5, 0, 4], ["s", 5, 8], ["m", 8, 12, 4, 7], ["t", 7, 9]]
    assert validate(segs, 12, 9) is None


def test_gap_overlap_and_short_coverage_rejected():
    assert "gap" in validate([["m", 0, 5, 0, 4], ["m", 6, 12, 4, 9]], 12, 9)
    assert "gap" in validate([["m", 0, 5, 0, 4], ["m", 4, 12, 4, 9]], 12, 9)
    assert "covered" in validate([["m", 0, 5, 0, 4]], 12, 4)


def test_bad_shapes_rejected():
    assert validate([["x", 0, 1, 0, 1]], 1, 1)
    assert validate([["m", 0, 1]], 1, 1)
    assert validate([["m", 0, 0, 0, 1]], 1, 1)  # empty span
    assert validate([], 1, 1)


def test_weak_beads_become_unresolved_not_matches():
    beads = [
        {"s": [0, 5], "t": [0, 4], "cost": 0.5, "sim": 0.8},
        {"s": [5, 9], "t": [4, 8], "cost": 3.0, "sim": 0.0},
        {"s": [9, 9], "t": [8, 10], "cost": 3.0, "sim": 0.0},
        {"s": [9, 12], "t": [10, 13], "cost": 0.4, "sim": 0.7},
    ]
    segs = segments_from_beads(beads)
    assert segs == [["m", 0, 5, 0, 4], ["u", 5, 9, 4, 10], ["m", 9, 12, 10, 13]]
    assert validate(segs, 12, 13) is None


def test_leading_one_sided_weak_run_is_folded():
    beads = [
        {"s": [0, 0], "t": [0, 2], "cost": 3.0, "sim": 0.0},
        {"s": [0, 5], "t": [2, 6], "cost": 0.5, "sim": 0.8},
    ]
    segs = segments_from_beads(beads)
    assert segs == [["u", 0, 5, 0, 6]]


def test_legacy_pairs_convert():
    assert pairs_to_segments([[0, 0], [3, 2]], 5, 6) == [["m", 0, 3, 0, 2], ["m", 3, 5, 2, 6]]


def test_abbreviations_do_not_end_sentences():
    words = "but, unlike Mr. Covey, he ate. Then J. Smith left.".split()
    assert sentences(words) == [0, 6]


if __name__ == "__main__":
    for name, fn in list(globals().items()):
        if name.startswith("test_"):
            fn()
    print("ok")
