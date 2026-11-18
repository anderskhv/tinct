from pathlib import Path
import json,re
p=Path(__file__).parent
sup=str.maketrans('0123456789','⁰¹²³⁴⁵⁶⁷⁸⁹')
def save(n,verses,notes):
 src=json.loads((p/'source-web-romans.json').read_text())['chapters'][n-1]
 groups=[re.findall(r'[⁰¹²³⁴⁵⁶⁷⁸⁹]+',s) for s in src['paragraphs']]
 inv=str.maketrans('⁰¹²³⁴⁵⁶⁷⁸⁹','0123456789')
 nums=[[int(x.translate(inv)) for x in g] for g in groups]
 assert sum(nums,[])==list(range(1,len(verses)+1)),(n,nums,len(verses))
 pars=[' '.join(str(v).translate(sup)+' '+verses[v-1] for v in g) for g in nums]
 result={'number':src['number'],'title':f'Romerbrevet {n}','paragraphs':pars}
 (p/f'chapter-{n:02}-modern-da.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
 (p/f'chapter-{n:02}-review.json').write_text(json.dumps({'chapter':n,'verses':len(verses),'paragraphs':len(pars),'status':'draft-source-compared-native-and-biblical-review-pending','notes':notes},ensure_ascii=False,indent=2)+'\n')
