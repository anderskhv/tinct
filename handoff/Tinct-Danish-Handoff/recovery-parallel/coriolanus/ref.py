from prep import *
c,l,h=map(int,sys.argv[1:]);print('\n'.join(str(i)+' '+en[c-1]['paragraphs'][i-1]+' // '+da[c-1]['paragraphs'][i-1][:70] for i in range(l,min(h,len(en[c-1]['paragraphs']))+1)))
