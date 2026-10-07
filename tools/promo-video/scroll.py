# Measures vertical content scrolling in a take's source recording, frame by frame.
# Usage (from tools/promo-video): python3 scroll.py out/take3 [from to]
# Writes <take>/scroll60.json: per 60 fps frame, how far the content moved UP since
# the previous frame, in source pixels (1180 wide), with sub-pixel precision.
# render-take.mjs uses it to retime scrolls so they glide instead of stutter.
import subprocess, numpy as np, json, sys, os
take = sys.argv[1]
a, b = (float(sys.argv[2]), float(sys.argv[3])) if len(sys.argv) > 3 else (0, 1e9)
W, H = 295, 639  # quarter resolution
args = ['ffmpeg', '-v', 'error']
if a > 0: args += ['-ss', str(a)]
if b < 1e9: args += ['-t', str(b - a)]
raw = subprocess.run(args + ['-i', os.path.join(take, 'source.mp4'), '-vf', f'fps=60,scale={W}:{H},format=gray',
                     '-f', 'rawvideo', '-'], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.float32)
prof = fr[:, 60:600, 15:280].mean(axis=2)  # row profiles, below the status bar
R = 40
out = [0.0]
for i in range(1, len(prof)):
    p, q = prof[i - 1], prof[i]
    if np.abs(p - q).mean() < 0.15: out.append(0.0); continue
    sc = []
    for s in range(-R, R + 1):
        x = p[R + s: len(p) - R + s]; y = q[R: len(q) - R]
        x = x - x.mean(); y = y - y.mean()
        sc.append((x * y).sum() / (np.sqrt((x * x).sum() * (y * y).sum()) + 1e-6))
    k = int(np.argmax(sc))
    if 0 < k < 2 * R:  # parabolic sub-pixel refinement
        l, c, r = sc[k - 1], sc[k], sc[k + 1]
        d = (l - r) / (2 * (l - 2 * c + r)) if (l - 2 * c + r) != 0 else 0
    else: d = 0
    out.append(round(float((k - R + d) * 1180 / W), 2) if sc[k] > 0.6 else 0.0)
path = os.path.join(take, 'scroll60.json')
full = json.load(open(path)) if os.path.exists(path) else []
start = int(round(a * 60))
if len(full) < start + len(out): full += [0.0] * (start + len(out) - len(full))
full[start:start + len(out)] = out
json.dump(full, open(path, 'w'))
t = None
for i, s in enumerate(out):
    if abs(s) > 0.5 and t is None: t = i
    if abs(s) <= 0.5 and t is not None:
        if i - t >= 6: print(f'{a + t / 60:.2f}-{a + i / 60:.2f}s moved {sum(out[t:i]):.0f}px')
        t = None
