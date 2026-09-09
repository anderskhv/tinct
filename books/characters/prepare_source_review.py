"""Build an offline candidate worksheet. No prose generation or readiness claims."""
import json
import re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
BASE=Path(__file__).resolve().parent

def prepare(book_id):
    path=ROOT/f'app/public/data/editions/{book_id}-threads.json'
    if not path.exists():return {'bookId':book_id,'status':'needs-source-inventory','candidates':[]}
    thread=json.loads(path.read_text())
    sources={}
    for edition in ['original-en','modern-en']:
        p=ROOT/f'app/public/data/editions/{book_id}-{edition}.json'
        if p.exists():sources[edition]=json.loads(p.read_text())
    candidates=[]
    for entry in thread.get('characters',[]):
        aliases=list(dict.fromkeys(entry.get('searchNames',[])))
        item={'id':entry['id'],'candidateName':entry.get('name',{}).get('en',''),'unreviewedAliases':aliases,'firstCandidateMatches':{},'reviewStatus':'unreviewed'}
        for edition,data in sources.items():
            found=[]
            for c in data.get('chapters',[]):
                for pi,paragraph in enumerate(c['paragraphs']):
                    if not isinstance(paragraph,str):continue
                    matches=[]
                    for alias in aliases:
                        m=re.search(r'(?<!\w)'+re.escape(alias)+r'(?!\w)',paragraph)
                        if m:matches.append((m.start(),alias))
                    if matches:
                        start,alias=min(matches)
                        found.append({'chapter':c['number'],'paragraphIndex':pi,'alias':alias,'context':paragraph})
                        break
                if found:break
            item['firstCandidateMatches'][edition]=found[0] if found else None
        candidates.append(item)
    return {'bookId':book_id,'status':'unreviewed-source-candidates','warning':'Aliases may be ambiguous, future identities, titles, or different people. First regex match is NOT a validated first mention. Existing thread prose is intentionally not copied.','candidates':candidates}

if __name__=='__main__':
    inventory=json.loads((BASE/'library-inventory.json').read_text())
    folder=BASE/'source-candidates';folder.mkdir(exist_ok=True)
    for row in inventory['books']:
        data=prepare(row['bookId'])
        (folder/(row['bookId']+'.json')).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    print(f"Prepared unreviewed source inventories for {len(inventory['books'])} published books.")
