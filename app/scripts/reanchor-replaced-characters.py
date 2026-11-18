#!/usr/bin/env python3
"""Re-anchor a character package after a book's text was replaced by an unrelated translation.

usage: reanchor-replaced-characters.py <bookId> <before-dir> <revision> [--dry]

<before-dir> holds <bookId>-<edition>.before.json (the replaced live files); the
new files are read from app/public/data/editions. No prose is written or changed.

Exact-only rule. Paragraph structure and wording no longer correspond, so a
mention cannot be projected. A character survives only when ALL hold:
  * its kind is a named figure (person, deity, cultural-figure, mythical-being);
  * one of its reviewed mention spellings is the card's own name (or that name in
    capitals, a speaker tag; aliases such as epithets are identity claims and are
    not carried) and, in the OLD text, every whole-word, case-sensitive
    occurrence of it was a reviewed mention of this one character, and no other
    character used it as a mention spelling;
  * that identical spelling occurs, whole-word and case-sensitively, in the NEW
    text, and, when the name was rare in the old text (RARE or fewer
    occurrences), occurs the same number of times (the existing machinery's
    "same occurrence count" rule; a rare name may denote something else, e.g.
    a state, in another translation).
Every such occurrence in the new text becomes a mention (resolution
`reviewed-name`). Roles, groups, personifications, aliases and any spelling the
new translation does not use are dropped and reported, never guessed. Each package has exactly one snapshot, available at the first mention,
so the card text (reviewed copy) is unchanged and only its anchors move to the
new first mention. Rewrites app/public/data/characters/<bookId>.v1.json, bumps
contentVersion, and bumps/removes the characterReleases entry as needed (an
edition left with no cards is removed from the entry's `editions`, and the whole
entry when none remain). Report: <before-dir>/<bookId>.characters-report.json.
"""
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
NAMED = {'person', 'deity', 'cultural-figure', 'mythical-being'}
RARE = 5


def digest(raw):
    return hashlib.sha256(raw if isinstance(raw, bytes) else raw.encode('utf-8')).hexdigest()


def normalize(text):
    return re.sub(r' {2,}', ' ', text.replace('\n', ' '))


def utf16(text):
    return len(text.encode('utf-16-le')) // 2


def paragraphs(raw):
    return {str(c['number']): [normalize(p) for p in c['paragraphs']] for c in json.loads(raw)['chapters']}


def occurrences(text, name):
    return [(m.start(), m.end()) for m in re.finditer(r'(?<!\w)' + re.escape(name) + r'(?!\w)', text)]


def main():
    args = [a for a in sys.argv[1:] if a != '--dry']
    dry = '--dry' in sys.argv
    book, before_dir, revision = args
    before_dir = Path(before_dir)
    asset_path = ROOT / f'app/public/data/characters/{book}.v1.json'
    asset_raw = asset_path.read_text()
    asset = json.loads(asset_raw)
    report = {'book': book, 'editions': {}}
    for edition, block in list(asset['editions'].items()):
        before_raw = (before_dir / f'{book}-{edition}.before.json').read_bytes()
        after_raw = (ROOT / f'app/public/data/editions/{book}-{edition}.json').read_bytes()
        if digest(before_raw) != block['sourceSha256']:
            raise SystemExit(f'{book}/{edition}: package does not match the replaced edition')
        old, new = paragraphs(before_raw), paragraphs(after_raw)
        if {k: [digest(p) for p in v] for k, v in old.items()} != {k: v for k, v in block['paragraphHashes'].items()}:
            raise SystemExit(f'{book}/{edition}: old paragraph hashes do not verify')
        # spelling -> characters that use it as a reviewed mention
        users = {}
        for m in block['mentions']:
            users.setdefault(m['text'], set()).add(m['characterId'])
        keep, dropped, mentions = [], [], []
        for character in block['characters']:
            cid = character['id']
            own = [m for m in block['mentions'] if m['characterId'] == cid]
            reason = None
            reliable = []
            if character['kind'] not in NAMED:
                reason = f"kind '{character['kind']}' is a role/group/concept, not an exact name"
            else:
                display = character['snapshots'][0]['name']
                for name in sorted({m['text'] for m in own}):
                    # Only the card's own name (or its speaker-tag capitals): aliases are identity claims.
                    if name not in (display, display.upper()) or users[name] != {cid}:
                        continue
                    spans = {(m['chapterNumber'], m['paragraphIndex'], m['startOffset'], m['endOffset']) for m in own if m['text'] == name}
                    seen = set()
                    for ch, paras in old.items():
                        for pi, text in enumerate(paras):
                            for s, e in occurrences(text, name):
                                seen.add((int(ch), pi, utf16(text[:s]), utf16(text[:e])))
                    if seen != spans:
                        continue
                    # A name seen only a few times can denote something else in another
                    # translation (a state, a place): then the occurrence count must agree.
                    now = sum(len(occurrences(text, name)) for paras in new.values() for text in paras)
                    if len(seen) > RARE or now == len(seen):
                        reliable.append(name)
                if not reliable:
                    reason = 'no reviewed spelling was an exact, unambiguous name in the old text'
            found = []
            if reason is None:
                for name in reliable:
                    for ch, paras in new.items():
                        for pi, text in enumerate(paras):
                            for s, e in occurrences(text, name):
                                found.append({'characterId': cid, 'chapterNumber': int(ch), 'paragraphIndex': pi,
                                              'startOffset': utf16(text[:s]), 'endOffset': utf16(text[:e]), 'text': name,
                                              'resolution': 'reviewed-name'})
                if not found:
                    reason = f"reviewed spelling(s) {reliable} do not occur in the new translation"
            if reason:
                dropped.append({'id': cid, 'kind': character['kind'], 'name': character['snapshots'][0]['name'], 'oldMentions': len(own), 'reason': reason})
                continue
            found.sort(key=lambda m: (m['chapterNumber'], m['paragraphIndex'], m['startOffset']))
            first = found[0]
            if len(character['snapshots']) != 1 or character['snapshots'][0]['availableAt'] != character['firstMention'] or character['roleVisibleAt'] != character['firstMention']:
                raise SystemExit(f'{book}/{edition}/{cid}: snapshot is not anchored at the first mention; not handled')
            point = {'chapterNumber': first['chapterNumber'], 'paragraphIndex': first['paragraphIndex'], 'offset': first['endOffset']}
            character['firstMention'] = dict(point)
            character['roleVisibleAt'] = dict(point)
            snap = character['snapshots'][0]
            snap['availableAt'] = dict(point)
            for evidence in snap.get('evidence', []):
                evidence.update({'chapterNumber': point['chapterNumber'], 'paragraphIndex': point['paragraphIndex'], 'throughOffset': point['offset']})
            keep.append(character)
            mentions.extend(found)
            report['editions'].setdefault(edition, {}).setdefault('kept', []).append(
                {'id': cid, 'spellings': reliable, 'oldMentions': len(own), 'newMentions': len(found)})
        mentions.sort(key=lambda m: (m['chapterNumber'], m['paragraphIndex'], m['startOffset'], m['characterId']))
        block['characters'], block['mentions'] = keep, mentions
        block['sourceSha256'] = digest(after_raw)
        block['chapterCount'] = len(new)
        block['paragraphCount'] = sum(len(v) for v in new.values())
        block['paragraphHashes'] = {k: [digest(p) for p in v] for k, v in new.items()}
        report['editions'].setdefault(edition, {})['dropped'] = dropped
        print(book, edition, 'kept', len(keep), 'dropped', len(dropped), 'mentions', len(mentions))
    asset['contentVersion'] = revision
    report['revision'] = revision
    (before_dir / f'{book}.characters-report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
    if dry:
        return
    empty = [e for e, b in asset['editions'].items() if not b['characters']]
    for e in empty:
        del asset['editions'][e]
    compact = asset_raw.startswith('{"')
    text = json.dumps(asset, ensure_ascii=False, separators=(',', ':')) if compact else json.dumps(asset, ensure_ascii=False, indent=2)
    service = ROOT / 'app/src/services/characters/characterCards.ts'
    service_text = service.read_text()
    pattern = r"( *(?:'" + re.escape(book) + r"'|" + re.escape(book) + r"):\s*\{\s*editions:\s*)(EN|\[[^\]]*\])(,\s*revision:\s*)'[^']+'(\s*\},?\n)"
    match = re.search(pattern, service_text)
    if not match:
        raise SystemExit(f'{book}: expected one character release entry')
    if not asset['editions']:
        service_text = service_text[:match.start()] + service_text[match.end():]
        asset_path.unlink()
        print('no cards survive; release entry and package removed')
    else:
        editions = ['EN'] if set(asset['editions']) == {'original-en', 'modern-en'} else [json.dumps(sorted(asset['editions'])).replace('"', "'")]
        service_text = service_text[:match.start()] + match.group(1) + editions[0] + match.group(3) + repr(revision) + match.group(4) + service_text[match.end():]
        asset_path.write_text(text + '\n')
    service.write_text(service_text)


if __name__ == '__main__':
    main()
