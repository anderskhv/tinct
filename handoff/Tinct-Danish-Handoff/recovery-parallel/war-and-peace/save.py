from prepare import *
from pathlib import Path
for extra in sorted((D/'rounds').glob('*.py')):
 exec(compile(extra.read_text(),str(extra),'exec'))
put('modern-da.json',da);put('modern-en.json',en)
put('change-record.json',records)
for i,(b,h,ps) in enumerate(src,1):
 chapter=da['chapters'][i-1]
 put(f'chapters/ch{i:03}.json',{'chapter':i,'sourceSection':b,'sourceChapter':h,'verifiedSourceParagraphs':len(ps),'danish':chapter,'english':en['chapters'][i-1],'reviewedEdits':[{'language':r['language'],'paragraph':r['paragraph'],'reason':r['reason']} for r in records if r['chapter']==i]})
put('source-details.json',{'source':'War and Peace, trans. Louise and Aylmer Maude. Project Gutenberg 2600, text dated June 14, 2022.','url':'https://www.gutenberg.org/ebooks/2600','base':'https://github.com/anderskhv/tinct/tree/a1ee0ffda8de113b06814e2986802f90e24eccff','verification':'Parsed complete source independently of Tinct, excluded contents and license. All 11,340 source paragraphs match Tinct original after whitespace folding. The capital letters, spelling and punctuation matched. The cipher table and gun disposition have meaningful spacing; the working files retain the supplied spacing.','inputs':{f.name:hashlib.sha256(f.read_bytes()).hexdigest() for f in sorted((D/'upstream').glob('*'))+list((D/'input').glob('*.txt'))}})
