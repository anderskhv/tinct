"""Notes to sheet music (MusicXML) and MIDI.

Sheet music is written on the detected beat grid, so rubato and tempo drift in the
recording do not push the bar lines out of place. Quarter note q of the score sounds
at beats[q] seconds; the player uses the same grid to move its cursor.
"""

from pathlib import Path

import numpy as np

GRID = 4  # subdivisions per quarter note (16th notes)


def seconds_to_beats(times, beats: list[float]) -> np.ndarray:
    idx = np.arange(len(beats), dtype=float)
    return np.interp(times, beats, idx, left=None, right=None)


def _quantise(notes, beats):
    """[(onset, duration, pitch)] in grid units."""
    if not notes:
        return []
    arr = np.array(notes, dtype=float)
    on = np.round(seconds_to_beats(arr[:, 0], beats) * GRID).astype(int)
    off = np.round(seconds_to_beats(arr[:, 1], beats) * GRID).astype(int)
    return [(int(a), int(max(1, b - a)), int(p)) for a, b, p in zip(on, off, arr[:, 2])]


def _staff_events(qnotes):
    """Collapse overlapping notes into a single chord sequence a pianist can read."""
    by_onset: dict[int, list] = {}
    for on, dur, pitch in qnotes:
        by_onset.setdefault(max(0, on), []).append((dur, pitch))
    onsets = sorted(by_onset)
    events = []
    for i, on in enumerate(onsets):
        group = by_onset[on]
        longest = max(d for d, _ in group)
        gap = onsets[i + 1] - on if i + 1 < len(onsets) else longest
        dur = max(1, min(longest, gap, GRID * 4))
        pitches = sorted({p for _, p in group})
        events.append((on, dur, pitches))
    return events


def _fill_part(part, events, clef):
    from music21 import chord, meter, note, clef as m21clef

    part.insert(0, clef)
    part.insert(0, meter.TimeSignature("4/4"))
    for on, dur, pitches in events:
        el = note.Note(pitches[0]) if len(pitches) == 1 else chord.Chord(pitches)
        el.quarterLength = dur / GRID
        part.insert(on / GRID, el)
    if not events:
        part.insert(0, note.Rest(quarterLength=4))


def write_musicxml(notes, beats: list[float], bpm: float, title: str, instrument: str, path: Path, grand_staff: bool) -> None:
    from music21 import clef, instrument as m21inst, layout, metadata, stream, tempo

    q = _quantise(notes, beats)
    score = stream.Score()
    score.metadata = metadata.Metadata(title=title, composer="Transcribed by Tonescribe")

    if grand_staff:
        upper = stream.PartStaff(id="upper")
        lower = stream.PartStaff(id="lower")
        _fill_part(upper, _staff_events([n for n in q if n[2] >= 60]), clef.TrebleClef())
        _fill_part(lower, _staff_events([n for n in q if n[2] < 60]), clef.BassClef())
        upper.insert(0, m21inst.Piano())
        parts = [upper, lower]
    else:
        part = stream.Part(id=instrument)
        median = np.median([n[2] for n in q]) if q else 60
        _fill_part(part, _staff_events(q), clef.BassClef() if median < 55 else clef.TrebleClef())
        part.partName = instrument.capitalize()
        parts = [part]

    parts[0].insert(0, tempo.MetronomeMark(number=round(bpm)))
    if q:
        from music21 import key, note

        sample = stream.Stream([note.Note(p, quarterLength=d / GRID) for _, d, p in q])
        sharps = sample.analyze("key").sharps
        for p in parts:
            p.insert(0, key.KeySignature(sharps))

    for p in parts:
        score.insert(0, p)
    if grand_staff:
        score.insert(0, layout.StaffGroup(parts, symbol="brace", barTogether=True))
    score.makeNotation(inPlace=True)
    score.write("musicxml", fp=str(path))


GM_PROGRAMS = {"piano": 0, "guitar": 25, "bass": 33, "vocals": 52, "other": 48}


def write_midi(tracks: list[dict], bpm: float, path: Path) -> None:
    import pretty_midi

    pm = pretty_midi.PrettyMIDI(initial_tempo=bpm)
    for t in tracks:
        drum = t["id"] == "drums"
        inst = pretty_midi.Instrument(program=GM_PROGRAMS.get(t["id"], 0), is_drum=drum, name=t["name"])
        for start, end, pitch, vel in t["notes"]:
            inst.notes.append(pretty_midi.Note(velocity=int(vel), pitch=int(pitch), start=float(start), end=float(end)))
        pm.instruments.append(inst)
    pm.write(str(path))
