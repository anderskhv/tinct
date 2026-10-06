# Measures vertical content scrolling in out/<take>/source.mp4 (run from that folder);
# render-take.mjs uses the resulting scroll.json to move swipe indicators with the content.
# Vertical content motion per frame (30 fps): cross-correlate row-mean profiles of
# the middle band of consecutive frames. Prints intervals with steady scrolling.
import subprocess, numpy as np, json, sys
W, H = 118, 256  # downscaled 1180x2556 / 10
raw = subprocess.run(['ffmpeg','-v','error','-i','source.mp4','-vf',f'fps=30,scale={W}:{H},format=gray','-f','rawvideo','-'],capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
band = fr[:, 30:230, 20:98].mean(axis=2)  # rows 30..230, skip status bar/edges
shifts = []
for i in range(1, len(band)):
    a = band[i-1] - band[i-1].mean(); b = band[i] - band[i].mean()
    best, bs = 0, -1e18
    for s in range(-25, 26):
        if s >= 0: c = (a[s:] * b[:len(b)-s]).sum() / max(1, len(b)-s)
        else: c = (a[:s] * b[-s:]).sum() / max(1, len(b)+s)
        if c > bs: bs, best = c, s
    diff = np.abs(a - b).mean()
    shifts.append(best * 10 if diff > 0.5 else 0)  # source px; content moved UP by +s
json.dump(shifts, open('scroll.json','w'))
t=None
for i,s in enumerate(shifts):
    if s and t is None: t=i
    if not s and t is not None:
        if i-t>=3: print(f'{(t+1)/30:.2f}-{(i+1)/30:.2f}s total {sum(shifts[t:i])}px')
        t=None
