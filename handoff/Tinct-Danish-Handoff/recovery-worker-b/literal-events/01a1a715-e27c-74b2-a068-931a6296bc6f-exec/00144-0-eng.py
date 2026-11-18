from revise import load,write,p
def change(c,n,f,t,reason):
 e=load('modern-en.json')if(p/'modern-en.json').exists()else load('source-modern-en.json');s=e['chapters'][c-1]['paragraphs'][n-1];assert f in s,(c,n,f);v=s.replace(f,t);e['chapters'][c-1]['paragraphs'][n-1]=v;write('modern-en.json',e);r=load('review-progress.json');r['englishChanges']=[z for z in r['englishChanges']if(z['chapter'],z['paragraph'])!=(c,n)]+[{'chapter':c,'paragraph':n,'before':load('source-modern-en.json')['chapters'][c-1]['paragraphs'][n-1],'after':v,'reason':reason}];write('review-progress.json',r)
