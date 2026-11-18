from prep import *
for j in [24,25,26]:apply(j,f's{j:02}.txt',len(en[j-1]['paragraphs']))
print('total',sum(rd('review-progress.json').values()))
