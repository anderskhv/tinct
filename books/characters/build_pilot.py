#!/usr/bin/env python3
"""Compile reviewed character content into edition-specific lookup data. Offline only."""
import argparse, hashlib, json, re, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
BASE=Path(__file__).resolve().parent

def normalized(text):
    return re.sub(' {2,}', ' ', text.replace('\n',' '))
def u16(text):
    return len(text.encode('utf-16-le'))//2

def point(ch,pi,offset):
    return {'chapterNumber':ch,'paragraphIndex':pi,'offset':offset}
def key(p):
    return p['chapterNumber'],p['paragraphIndex'],p['offset']
def digest(s):
    return hashlib.sha256(s.encode()).hexdigest()
def paragraphs(data):
    return {(c['number'],pi):normalized(p) for c in data['chapters'] for pi,p in enumerate(c['paragraphs'])}
def pattern(alias):
    return re.compile(r'(?<!\w)'+re.escape(alias)+r'(?!\w)',re.I)

# These phrases have several possible owners; whitelist occurrences rather than guess.
SCOPED={
 'mother':{(7,21),(26,15)},
}
# Bare surnames and family/possessive contexts reviewed in both English sources.
BARE={
 'Pontellier':{(1,11):'leonce',(5,8):'edna',(7,7):'pontelliers',(22,2):'leonce',(22,8):'leonce',(22,11):'leonce',(22,18):'leonce',(23,17):'leonce',(32,3):'pontelliers',(33,38):'pontelliers'},
 'Ratignolle':{(5,6):'alphonse',(7,7):'ratignolles'},
 'Lebrun':{(1,12):'robert',(16,19):'robert',(34,19):'robert',(34,27):'robert'},
}
# Non-person uses of a family name; keep ordinary selection behavior.
IGNORED={('Lebrun',1,4),('Lebrun',4,10),('Lebrun',7,7),('Lebrun',8,32),('Highcamp',25,8)}

def match_all(entities,paras):
    matches=[]; ignored=[]
    for (ch,pi),text in paras.items():
        candidates=[]
        for e in entities:
            if e['id'] in SCOPED and (ch,pi) not in SCOPED[e['id']]:continue
            for alias in e['aliases']:
                for m in pattern(alias).finditer(text):
                    candidates.append((m.start(),m.end(),e['id'],'alias'))
        # Explicit owner of otherwise ambiguous expressions.
        overrides={}
        if (ch,pi) in {(15,26),(23,2),(32,8)}:overrides['their mother']='edna'
        if (ch,pi)==(39,7):overrides['her mother']='philomel-mother'
        if (ch,pi)==(2,7):overrides['the mother']='mother'
        if ch>=9:overrides['Mademoiselle']='reisz'
        for alias,id in overrides.items():
            for m in pattern(alias).finditer(text):candidates.append((m.start(),m.end(),id,'reviewed-context'))
        # First choose longest exact labels, so Mrs. / Monsieur / Old Madame do not collide.
        chosen=[]
        for a,b,id,how in sorted(set(candidates),key=lambda z:(-(z[1]-z[0]),z[0],z[2])):
            overlap=[c for c in chosen if a<c[1] and b>c[0]]
            if overlap and not all((id,c[2]) in {('sylvano','sylvano-wife'),('celina','celina-husband'),('philomel','philomel-mother')} for c in overlap):
                if any(a==c[0] and b==c[1] and id!=c[2] for c in overlap):
                    raise ValueError(f'Ambiguous match {ch}:{pi} {text[a:b]!r}: {id}, {overlap}')
                continue
            chosen.append((a,b,id,how))
        for surname,locations in BARE.items():
            for m in pattern(surname).finditer(text):
                if any(m.start()<b and m.end()>a for a,b,_,_ in chosen):continue
                if (ch,pi) in locations:
                    chosen.append((m.start(),m.end(),locations[(ch,pi)],'reviewed-context'))
                elif (surname,ch,pi) in IGNORED:ignored.append({'chapterNumber':ch,'paragraphIndex':pi,'text':m.group(),'reason':'property or venue, not a person'})
                else:raise ValueError(f'Unresolved surname {surname} at {ch}:{pi}: {text}')
        for a,b,id,how in sorted(chosen):
            matches.append({'characterId':id,'chapterNumber':ch,'paragraphIndex':pi,'startOffset':u16(text[:a]),'endOffset':u16(text[:b]),'text':text[a:b],'resolution':how})
    return matches,ignored

def compile_book(book):
    folder=BASE/book
    source=json.loads((folder/'editorial.json').read_text())
    entities=source['entities'];ids=[e['id'] for e in entities]
    assert len(ids)==len(set(ids)), 'Duplicate entity id'
    assert all(e['storyRole'] in {'central','major','supporting','reference'} for e in entities)
    editions={};readable=[]
    for edition in ['original-en','modern-en']:
        path=ROOT/f'app/public/data/editions/{book}-{edition}.json'
        raw=path.read_bytes();data=json.loads(raw);paras=paragraphs(data)
        active=[e for e in entities if edition in e.get('editions',['original-en','modern-en'])]
        mentions,ignored=match_all(active,paras)
        counts={id:sum(m['characterId']==id for m in mentions) for id in ids}
        missing=[id for id,n in counts.items() if not n and id in {e['id'] for e in active}]
        if missing:raise ValueError(f'{edition}: no mentions for {missing}')
        compiled=[]
        for e in active:
            ms=[m for m in mentions if m['characterId']==e['id']]
            first=min(ms,key=lambda m:(m['chapterNumber'],m['paragraphIndex'],m['startOffset']))
            firstPoint=point(first['chapterNumber'],first['paragraphIndex'],first['endOffset'])
            snapshots=[]
            intro=e.get('introduction')
            if intro:
                snapshots.append({'id':e['id']+'-introduction','availableAt':firstPoint,'name':intro.get('name',first['text']),'subtitle':intro['subtitle'],'body':intro['body'],'evidence':[{'chapterNumber':first['chapterNumber'],'paragraphIndex':first['paragraphIndex'],'throughOffset':first['endOffset']}],'editorialBasis':'Reviewed baseline identity, including ordinary relationships, occupation, and setting; no concealed identity or later plot development. See editorial policy.'})
            for i,s in enumerate(e['snapshots']):
                ch,pi=s['after'];assert (ch,pi) in paras,(e['id'],s['after'])
                gate=point(ch,pi,u16(paras[ch,pi]));assert key(gate)>=key(firstPoint),(e['id'],'snapshot predates mention')
                snapshots.append({'id':e['id']+'-'+str(i+1),'availableAt':gate,'name':s['name'],'subtitle':s['subtitle'],'body':s['body'],'evidence':[{'chapterNumber':ch,'paragraphIndex':pi,'throughOffset':gate['offset']}],'editorialBasis':'Source-reviewed reminder; may retain facts from earlier snapshots and chapters.'})
                readable.append((edition,e['id'],ch,pi,paras[ch,pi],s['body']))
            snapshots.sort(key=lambda s:key(s['availableAt']))
            rch,rpi=e['roleVisibleAfter'];rolepoint=point(rch,rpi,u16(paras[rch,rpi]))
            compiled.append({'id':e['id'],'kind':e['kind'],'storyRole':e['storyRole'],'roleVisibleAt':rolepoint,'firstMention':firstPoint,'snapshots':snapshots})
        editions[edition]={'sourcePath':str(path.relative_to(ROOT)),'sourceSha256':hashlib.sha256(raw).hexdigest(),'chapterCount':len(data['chapters']),'paragraphCount':len(paras),'paragraphHashes':{str(ch):[digest(paras[ch,pi]) for pi in range(len(c['paragraphs']))] for c in data['chapters'] for ch in [c['number']]},'characters':compiled,'mentions':mentions,'ignoredContextMatches':ignored}
    assert editions['original-en']['paragraphCount']==editions['modern-en']['paragraphCount']
    a=paragraphs(json.loads((ROOT/f'app/public/data/editions/{book}-original-en.json').read_text()))
    b=paragraphs(json.loads((ROOT/f'app/public/data/editions/{book}-modern-en.json').read_text()))
    assert list(a)==list(b), 'Edition structure differs; explicit alignment needed'
    compiled={'schemaVersion':1,'bookId':book,'language':'en','contentVersion':source['contentVersion'],'reviewStatus':'source-reviewed-pilot','offsetUnit':'utf16','normalization':'prose-reader-v1','editions':editions}
    report={'bookId':book,'chapterCount':39,'entities':len(entities),'authoredSnapshots':sum(len(e['snapshots']) for e in entities),'firstMentionCards':sum(bool(e.get('introduction')) for e in entities),'editions':{ed:{'mentions':len(d['mentions']),'sourceSha256':d['sourceSha256'],'ignoredContexts':len(d['ignoredContextMatches'])} for ed,d in editions.items()},'reviewLimits':['Source reviewed by the authoring agent; not independently reviewed by another editor.','English edition alignment verified at all card-update paragraphs; no Danish bindings or copy.','Generic pronouns and every unnamed incidental person are not claimed as entity coverage.','This report validates content bindings; app and production verification are recorded separately.']}
    return compiled,report,readable

def main():
    parser=argparse.ArgumentParser();parser.add_argument('book',nargs='?',default='the-awakening');parser.add_argument('--check',action='store_true');args=parser.parse_args()
    compiled,report,readable=compile_book(args.book);folder=BASE/args.book
    outputs={'characters.v1.json':compiled,'validation-report.json':report}
    for name,data in outputs.items():
        text=json.dumps(data,ensure_ascii=False,indent=2)+'\n';path=folder/name
        if args.check:assert path.read_text()==text,f'Stale compiled file: {path}'
        else:path.write_text(text)
    source=json.loads((folder/'editorial.json').read_text())
    cards=['# The Awakening: complete editorial card draft','','**Editorial document: contains spoilers through Chapter XXXIX.** Reader display must use compiled position gates, never this file.','','Revision '+source['contentVersion']+'. Baseline identity is available from first mention; later developments remain gated. Paragraph numbers below are one-based.','']
    for e in source['entities']:
        cards.extend([f"## {e['editorialName']}",'',f"{e['kind']} · {e['storyRole']} · `{e['id']}`",'','**First encounter**','',f"**{e['introduction']['name']} — {e['introduction']['subtitle']}**",'',e['introduction']['body'],''])
        for snapshot in e['snapshots']:
            ch,pi=snapshot['after']
            cards.extend([f"**After chapter {ch}, paragraph {pi+1}** — {snapshot['subtitle']}",'',snapshot['body'],''])
    card_text='\n'.join(cards)
    if args.check:assert (folder/'cards.md').read_text()==card_text,'Stale cards.md'
    else:(folder/'cards.md').write_text(card_text)
    if not args.check:
        lines=['# The Awakening: source and card review','', 'Editorial worksheet; includes later plot. All paragraph indices are zero-based.','']
        for edition,id,ch,pi,text,body in readable:
            lines.extend([f'## {edition} · {id} · {ch}:{pi}', '',text,'',f'**Card:** {body}',''])
        (folder/'source-review.md').write_text('\n'.join(lines))
    print(json.dumps(report,ensure_ascii=False,indent=2))
if __name__=='__main__':main()
