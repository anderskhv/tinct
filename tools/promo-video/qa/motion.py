# Usage: python3 qa/motion.py <video> <from> <to> [crop w:h:x:y]
# Measures frame-to-frame motion of the picture inside a crop (phase correlation,
# sub-pixel) and reports how evenly it moves: "jerk" = mean change in velocity
# between frames (px/frame). Lower = smoother. Use on a stretch with scrolling.
import subprocess, numpy as np, sys
f, a, b = sys.argv[1], sys.argv[2], sys.argv[3]
crop = sys.argv[4] if len(sys.argv) > 4 else '384:384:350:500'
w, h = [int(x) for x in crop.split(':')[:2]]
raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', a, '-t', str(float(b) - float(a)), '-i', f,
                      '-vf', f'crop={crop},format=gray', '-f', 'rawvideo', '-'], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.float32)
win = np.outer(np.hanning(h), np.hanning(w))
def shift(p, q):
    F = np.fft.fft2((p - p.mean()) * win); G = np.fft.fft2((q - q.mean()) * win)
    R = F * np.conj(G); R /= np.abs(R) + 1e-9
    c = np.fft.ifft2(R).real
    y, x = np.unravel_index(np.argmax(c), c.shape)
    def sub(m, i, n):
        l, r = m[(i - 1) % n], m[(i + 1) % n]; d = (l - r) / (2 * (l - 2 * m[i] + r) + 1e-9)
        return (i + d + n / 2) % n - n / 2
    return sub(c[:, x], y, h), sub(c[y, :], x, w)
v = np.array([shift(fr[i - 1], fr[i]) for i in range(1, len(fr))])
speed = np.hypot(v[:, 0], v[:, 1])
jerk = np.abs(np.diff(v, axis=0)).sum(axis=1)
print(f'frames {len(fr)}  speed max {speed.max():.1f}px/f  jerk mean {jerk.mean():.2f}  p95 {np.percentile(jerk, 95):.2f}  max {jerk.max():.2f}')
print('speed:', ' '.join(f'{x:.0f}' for x in speed[::3]))
