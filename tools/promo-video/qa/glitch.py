# Usage: python3 qa/glitch.py <video.mp4> <fps>  — counts single-frame blips (flicker).
# Run it on every render before shipping: a clean render reports ~0 (compare with the source).
# Find single-frame glitches: frames that differ from BOTH neighbours much more than
# the neighbours differ from each other (a blip in an otherwise smooth sequence).
import subprocess, numpy as np, sys
f=sys.argv[1]; W,H=270,338
p=subprocess.Popen(['ffmpeg','-v','error','-i',f,'-vf',f'scale={W}:{H},format=gray','-f','rawvideo','-'],stdout=subprocess.PIPE)
prev2=prev=None; i=0; hits=[]
while True:
    b=p.stdout.read(W*H)
    if len(b)<W*H: break
    cur=np.frombuffer(b,np.uint8).astype(np.float32)
    if prev2 is not None:
        d1=np.abs(prev-prev2).mean(); d2=np.abs(prev-cur).mean(); d0=np.abs(cur-prev2).mean()
        if min(d1,d2) > 3*d0+0.4: hits.append((i-1, round(min(d1,d2)/(d0+0.05),1)))
    prev2,prev=prev,cur; i+=1
print('frames',i,'glitches',len(hits))
print([(round(a/int(sys.argv[2]),2),r) for a,r in hits[:80]])
