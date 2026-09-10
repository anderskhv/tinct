"""Bind the reviewed The Tempest editorial package to exact source occurrences."""
import argparse,hashlib,json,re
from pathlib import Path
from build_pilot import ROOT, normalized, u16, point, key
BASE=Path(__file__).resolve().parent/'the-tempest'
SPEAKERS={name.upper():name for name in ['prospero','miranda','ariel','caliban','ferdinand','alonso','antonio','sebastian','gonzalo','adrian','francisco','trinculo','stephano','boatswain','master','mariners','iris','ceres','juno']}

def compile_package():
    editorial=json.loads((BASE/'editorial.json').read_text());entities=editorial['entities'];ids={e['id'] for e in entities}
    assert len(ids)==len(entities)
    editions={};omissions={};worksheet=[]
    for edition in ['original-en','modern-en']:
        path=ROOT/f'app/public/data/editions/the-tempest-{edition}.json';raw=path.read_bytes();source=json.loads(raw)
        paragraphs={(c['number'],i):normalized(p) for c in source['chapters'] for i,p in enumerate(c['paragraphs'])}
        mentions=[];ignored=[]
        for (ch,pi),text in paragraphs.items():
            candidates=[]
            speaker=re.match(r'^([A-Z][A-Z ]+)\.',text)
            if speaker:
                owner=SPEAKERS.get(speaker.group(1))
                if owner:candidates.append((0,len(speaker.group(1)),owner,'reviewed-speaker'))
            for e in entities:
                if ch not in e.get('chapters',[ch]):continue
                for alias in e['aliases']:
                    flags=0 if e['kind']=='cultural-figure' else re.I
                    for m in re.finditer(r'(?<!\w)'+re.escape(alias)+r'(?!\w)',text,flags):
                        id=e['id']
                        if id in {'mountain','silver','fury','tyrant'} and pi not in {90,91,92}:continue
                        if id=='temperance' and pi!=30:continue
                        if id in {'mariners','boatswain'} and ch==4 and pi==11:continue
                        candidates.append((m.start(),m.end(),id,'reviewed-name'))
            # Titles and anonymous mentions need local ownership, not global aliases.
            contextual=[]
            if ch==1 or (ch==9 and pi in {16,57,63}):contextual.append((r'\b(?:master|captain)\b','master'))
            if (ch,pi)==(2,18):contextual.append((r'\b(?:Thy|Your) mother\b','miranda-mother'))
            if (ch,pi)==(2,138):contextual.append((r'\b(?:brave|fine) son\b','antonio-son'))
            if (ch,pi)==(8,89):contextual.append((r'\b(?:Spirits|dogs and hounds)\b','hounds'))
            if (ch,pi)==(8,24):contextual.append((r'\b(?:her son|her blind boy)\b','cupid'))
            for pattern,owner in contextual:
                for m in re.finditer(pattern,text,re.I):candidates.append((m.start(),m.end(),owner,'reviewed-context'))
            for m in re.finditer(r'\bDuke of Milan\b',text,re.I):
                owner='antonio' if (ch,pi)==(2,138) else 'prospero'
                candidates.append((m.start(),m.end(),owner,'reviewed-ducal-title'))
            # Bind capitalized royal titles only where the referent is reviewed.
            if (ch,pi)==(7,10):
                for m in re.finditer(r'\bKing\b',text):candidates.append((m.start(),m.end(),'alonso','reviewed-royal-title'))
            chosen=[]
            for a,b,id,how in sorted(set(candidates),key=lambda c:(-(c[1]-c[0]),c[0],c[2],c[3])):
                assert id in ids,id
                overlap=[c for c in chosen if a<c[1] and b>c[0]]
                if overlap:
                    assert not any(a==c[0] and b==c[1] and id!=c[2] for c in overlap),(edition,ch,pi,text[a:b],id,overlap)
                    continue
                chosen.append((a,b,id,how))
            for a,b,id,how in sorted(chosen):
                mentions.append(dict(characterId=id,chapterNumber=ch,paragraphIndex=pi,startOffset=u16(text[:a]),endOffset=u16(text[:b]),text=text[a:b],resolution=how))
        compiled=[];missing=[]
        for e in entities:
            ms=[m for m in mentions if m['characterId']==e['id']]
            if not ms:missing.append(e['id']);continue
            first=ms[0];at=point(first['chapterNumber'],first['paragraphIndex'],first['endOffset'])
            snapshots=[dict(id=e['id']+'-identity',availableAt=at,name=e['name'],subtitle=e['subtitle'],body=e['body'],editorialBasis='Reviewed ordinary identity for recognition; trigger is not a claim that every identity fact precedes the selected name.',evidence=[dict(chapterNumber=at['chapterNumber'],paragraphIndex=at['paragraphIndex'],throughOffset=at['offset'])])]
            for i,s in enumerate(e['snapshots']):
                ch,pi=s['after'];gate=point(ch,pi,u16(paragraphs[ch,pi]));assert key(gate)>=key(at)
                snapshots.append(dict(id=e['id']+f'-{i+1}',availableAt=gate,name=s.get('name',e['name']),subtitle=e['subtitle'],body=s['body'],editorialBasis='Identity clarification released at the end of the reviewed source paragraph.',evidence=[dict(chapterNumber=ch,paragraphIndex=pi,throughOffset=gate['offset'])]))
            role=at
            if e.get('roleAfter'):
                ch,pi=e['roleAfter'];role=point(ch,pi,u16(paragraphs[ch,pi]))
            compiled.append(dict(id=e['id'],kind=e['kind'],storyRole=e['category'],roleVisibleAt=role,firstMention=at,snapshots=snapshots))
            worksheet.append((edition,e['id'],first,paragraphs[first['chapterNumber'],first['paragraphIndex']],e['body']))
        omissions[edition]=missing
        editions[edition]=dict(sourcePath=str(path.relative_to(ROOT)),sourceSha256=hashlib.sha256(raw).hexdigest(),chapterCount=len(source['chapters']),paragraphCount=len(paragraphs),paragraphHashes={str(c['number']):[hashlib.sha256(paragraphs[c['number'],i].encode()).hexdigest() for i in range(len(c['paragraphs']))] for c in source['chapters']},characters=compiled,mentions=mentions,ignoredContextMatches=ignored)
    asset=dict(schemaVersion=1,bookId='the-tempest',language='en',contentVersion=editorial['contentVersion'],normalization='prose-reader-v1',offsetUnit='utf16',reviewStatus='authoring-agent-reviewed',editions=editions)
    report=dict(bookId='the-tempest',scope=editorial['coverage'],authoredEntries=len(entities),editions={ed:dict(sourceSha256=d['sourceSha256'],chapters=d['chapterCount'],paragraphs=d['paragraphCount'],entries=len(d['characters']),mentions=len(d['mentions']),omittedEntities=omissions[ed]) for ed,d in editions.items()},limits=['Authoring-agent source review; not independent editorial approval.','Named cast, speaking roles and named references; no claim of pronoun or every generic-title coverage.','No runtime registration or production verification in this content package.'])
    return asset,report,worksheet

def main():
    parser=argparse.ArgumentParser();parser.add_argument('--check',action='store_true');args=parser.parse_args()
    asset,report,worksheet=compile_package()
    for name,data in [('characters.v1.json',asset),('validation-report.json',report)]:
        text=json.dumps(data,ensure_ascii=False,indent=2)+'\n';p=BASE/name
        if args.check:assert p.read_text()==text,f'Stale {name}'
        else:p.write_text(text)
    if not args.check:
        editorial=json.loads((BASE/'editorial.json').read_text());lines=['# The Tempest: recognition cards','','Editorial review copy; source excerpts and later identities may contain spoilers.','']
        for e in editorial['entities']:
            lines.extend([f"## {e['name']} · {e['category']}",'',e['body'],''])
            for s in e['snapshots']:lines.extend([f"After source chapter {s['after'][0]}, paragraph {s['after'][1]+1}: {s['body']}",''])
        (BASE/'cards.md').write_text('\n'.join(lines))
        lines=['# The Tempest: first-binding source worksheet','','Paragraph indices are zero-based. Every inferred alias is reviewed by explicit rules, not Threads metadata.','']
        for ed,id,first,text,body in worksheet:lines.extend([f"## {ed} · {id} · {first['chapterNumber']}:{first['paragraphIndex']}",'',text,'',body,''])
        (BASE/'source-review.md').write_text('\n'.join(lines))
    print(json.dumps(report,indent=2))
if __name__=='__main__':main()
