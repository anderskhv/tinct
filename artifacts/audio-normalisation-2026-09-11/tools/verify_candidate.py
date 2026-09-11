"""Run verify_timings.check_chapter over a LOCAL candidate sidecar (production manifest + text, local words)."""
import json,sys
sys.path.insert(0,'/tmp/claude-0/audio-norm/tools/audio-highlight')
import prodapi,verify_timings
book,edition,chapter,path,out=sys.argv[1],sys.argv[2],int(sys.argv[3]),sys.argv[4],sys.argv[5]
raw=open(path,'rb').read()
prodapi.chapter_words=lambda b,e,c:(200,json.loads(raw),raw)
verify_timings.prodapi.chapter_words=prodapi.chapter_words
status,text=prodapi.edition_text(book,edition)
r=verify_timings.check_chapter(book,edition,chapter,text);r['candidate']=path
json.dump(r,open(out,'w'),indent=1);print(json.dumps({k:r[k] for k in ('ok','failures','paragraphsChecked','wordsChecked','worstParagraphRatio')}))
