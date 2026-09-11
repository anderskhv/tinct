"""Executable contract for the coding handoff; not production reader code."""
from build_pilot import key, digest, normalized


def reminder(edition, character_id, cutoff):
    character = next((c for c in edition['characters'] if c['id'] == character_id), None)
    if not character or key(character['firstMention']) > key(cutoff):
        return None
    eligible = [s for s in character['snapshots'] if key(s['availableAt']) <= key(cutoff)]
    if not eligible:
        return None
    s = max(eligible, key=lambda s: key(s['availableAt']))
    # Return only released fields, never raw future snapshots or editorial names.
    return {**{k: s[k] for k in ('name', 'subtitle', 'body')},
            'id': character_id, 'kind': character['kind'],
            'role': character['storyRole'] if key(character['roleVisibleAt']) <= key(cutoff) else None}


def gallery(edition, cutoff):
    return [card for c in edition['characters'] if (card := reminder(edition, c['id'], cutoff))]


def resolve(edition, chapter, paragraph, start, end, source_text, *, existing_highlight=False):
    """One-paragraph selection; invalid/ambiguous selections use normal controls.

    Offsets are JavaScript UTF-16 offsets in the normalized reader paragraph.
    Caller must also verify book/edition identity and whole-source fingerprint.
    """
    if existing_highlight or start < 0 or end <= start:
        return None
    hashes = edition['paragraphHashes'].get(str(chapter), [])
    if paragraph < 0 or paragraph >= len(hashes) or digest(normalized(source_text)) != hashes[paragraph]:
        return None
    matches = [m for m in edition['mentions'] if m['chapterNumber'] == chapter
               and m['paragraphIndex'] == paragraph and m['startOffset'] <= start and m['endOffset'] >= end]
    if not matches:
        return None
    width = min(m['endOffset'] - m['startOffset'] for m in matches)
    closest = [m for m in matches if m['endOffset'] - m['startOffset'] == width]
    if len({m['characterId'] for m in closest}) != 1:
        return None
    m = closest[0]
    cutoff = {'chapterNumber': chapter, 'paragraphIndex': paragraph, 'offset': m['endOffset']}
    return reminder(edition, m['characterId'], cutoff)
