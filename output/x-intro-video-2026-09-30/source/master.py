import numpy as np, wave, subprocess, sys, re
from scipy import ndimage, signal
src, dst, target = sys.argv[1], sys.argv[2], float(sys.argv[3])
w = wave.open(src); sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).reshape(-1, 2).astype(float) / 32768
def lufs(path):
    out = subprocess.run(['ffmpeg', '-hide_banner', '-i', path, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
    I = float(re.findall(r'I:\s+(-?[\d.]+) LUFS', out)[-1]); P = float(re.findall(r'Peak:\s+(-?[\d.]+) dBFS', out)[-1]); return I, P
def write(path, y):
    with wave.open(path, 'wb') as o:
        o.setnchannels(2); o.setsampwidth(2); o.setframerate(sr); o.writeframes((np.clip(y, -1, 1) * 32767).astype(np.int16).tobytes())
def limit(y, thr=float(sys.argv[4]) if len(sys.argv) > 4 else 0.80):
    a = np.abs(y).max(axis=1)
    look = int(0.004 * sr)
    pk = ndimage.maximum_filter1d(a, size=2 * look + 1)
    g = np.minimum(1.0, thr / np.maximum(pk, 1e-9))
    # smooth: instant attack (already looked ahead), 80 ms release
    g = ndimage.minimum_filter1d(g, size=look)
    b, a2 = signal.butter(1, 1 / (0.08 * sr) * 2)
    gs = signal.filtfilt(b, a2, g)
    gs = np.minimum(gs, g + 0.0)
    return y * np.minimum(gs, 1.0)[:, None]
gain = 1.0
for it in range(6):
    y = limit(x * gain)
    write(dst, y)
    I, P = lufs(dst)
    print(f'iter {it}: gain {gain:.2f}  I {I:.1f} LUFS  peak {P:.1f} dBFS')
    if abs(I - target) < 0.3: break
    gain *= 10 ** ((target - I) / 20)
