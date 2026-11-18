from revise import *
from edits import apply
from eng import change
for c,n,pairs in [(1,1,[('tidligt op','op med lærken')]),(17,23,[('lette den byrde, sit presserende behov for at hævde sig','lette sig for den byrde, det er at skulle hævde sig hele tiden')]),(17,61,[('var,,','var,')]),(21,3,[('eller et vandrende skib eller måske fra selve fyret','fra et omstrejfende skib eller måske fra selve fyret')]),(22,3,[('på,,','på,')]),(24,1,[('huset,,','huset,')]),(30,6,[('alle andre, og','alle andre og')]),(37,4,[('den vilde harpy, der pludselig kom med sorte vinger','den vilde harpy, der pludselig slog ned på sorte vinger')])]:
 apply(c,n,{n:pairs})
change(36,2,'calling the evening papers, _Standard, News_','calling, _Standard, News_','Keep the newsboy’s cry without the editorial newspaper classification.')
save(42,3,{})
