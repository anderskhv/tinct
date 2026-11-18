from prepare import *
books=[get(src/(k+'.json'))['chapters'] for k in ['original-en','modern-da','modern-en','wip-da']]
def show(n,i):
 vals=[b[n-1]['paragraphs'][i] for b in books]
 print(n,i,*(v for v in vals[:3]),sep='\n')
if __name__=='__main__':
 if sys.argv[1]=='single':show(*map(int,sys.argv[2:]))
 else:
  for n in range(int(sys.argv[1]),int(sys.argv[2])+1):
   z=books[0][n-1]['paragraphs'];ids=[0,len(z)-1]; ids+=[min((i for i in range(len(z)) if len(z[i].split())>16),key=lambda i:len(books[1][n-1]['paragraphs'][i].split())/len(z[i].split()))]
   for i in dict.fromkeys(ids):show(n,i)
