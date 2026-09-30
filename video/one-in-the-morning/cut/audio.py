"""Mix for the One in the Morning cut. Reads edl.json so sound follows the picture timeline.
Layers: each generated clip's own audio (rain, room tone), synthesised indoor rain under the phone-UI
segments, UI ticks, thunder, a sparse piano/strings score cut to a 72 bpm grid, and the voice on top.
Writes out/cut.wav."""
import json, os, subprocess, wave
import numpy as np
from scipy import signal

HERE = os.path.dirname(os.path.abspath(__file__))
FF = os.environ.get('FFMPEG', 'ffmpeg')
EDL = json.load(open(os.path.join(HERE, 'edl.json')))
SR, DUR = 48000, EDL['duration']
N = int(SR * DUR)
rng = np.random.default_rng(7)
mix = np.zeros((2, N)); rev = np.zeros((2, N)); score = np.zeros((2, N))
BEAT = 60 / 72


def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, f, o=2): b, a = signal.butter(o, f / (SR / 2), 'low'); return signal.lfilter(b, a, x)
def hp(x, f, o=2): b, a = signal.butter(o, f / (SR / 2), 'high'); return signal.lfilter(b, a, x)
def bp(x, f1, f2): b, a = signal.butter(2, [f1 / (SR / 2), f2 / (SR / 2)], 'band'); return signal.lfilter(b, a, x)
def env(n, a, tau): t = np.arange(n) / SR; return np.minimum(t / max(a, 1e-4), 1) * np.exp(-np.maximum(t - a, 0) / tau)
def note(m): return 440 * 2 ** ((m - 69) / 12)


def put(x, t0, g=1.0, pan=0.0, r=0.0, bus=None):
    bus = mix if bus is None else bus
    i = int(t0 * SR)
    if i >= N or i < 0: return
    x = x[:N - i]
    if x.ndim == 1:
        gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4); st = np.stack([x * gl, x * gr])
    else: st = x
    bus[:, i:i + st.shape[1]] += st * g
    if r: rev[:, i:i + st.shape[1]] += st * g * r


def span(t0, t1, fi=0.3, fo=0.3):
    e = np.zeros(N); a, b = int(t0 * SR), min(N, int(t1 * SR)); e[a:b] = 1
    k = int(fi * SR); e[a:a + k] = np.linspace(0, 1, len(e[a:a + k])); k = int(fo * SR); e[max(a, b - k):b] = np.linspace(1, 0, len(e[max(a, b - k):b]))
    return e


def decode(path, start=0.0, dur=None, ch=2):
    cmd = [FF, '-loglevel', 'error', '-ss', str(start), '-i', path] + (['-t', str(dur)] if dur else []) + ['-f', 's16le', '-ac', str(ch), '-ar', str(SR), '-']
    raw = subprocess.run(cmd, capture_output=True).stdout
    a = np.frombuffer(raw, np.int16) / 32768.0
    return a.reshape(-1, ch).T if ch == 2 else a


def piano(f, d=4.0, v=1.0):
    t = tt(d); x = sum((1 / n ** 1.4) * np.sin(2 * np.pi * f * n * t + rng.random() * 6) * np.exp(-t * (0.8 + n * 0.6)) for n in range(1, 8))
    return lp(x * np.minimum(t / .004, 1), 3800) * v


def strings(freqs, d, a=1.5, r=1.5):
    t = tt(d); x = np.zeros_like(t)
    for f in freqs:
        for det in (-.1, 0, .1): x += 2 * ((t * f * 2 ** (det / 12) + rng.random()) % 1) - 1
    return lp(x / (3 * len(freqs)), 1400) * np.clip(np.minimum(t / a, (d - t) / r), 0, 1)


# ---- picture sound: each clip's own audio, short fades at the cuts
for s in EDL['segments']:
    if 'clip' in s:
        d = s['t1'] - s['t0']
        a = decode(os.path.join(HERE, '..', 'clips', s['clip'] + '.mp4'), s['from'], d)
        if a.size == 0: continue
        n = a.shape[1]; e = np.ones(n); k = min(int(.08 * SR), n // 2); e[:k] = np.linspace(0, 1, k); e[-k:] = np.linspace(1, 0, k)
        g = .55 if s['clip'].startswith(('t6', 't7')) else .4
        put(a * e, s['t0'], g)

# ---- indoor rain under the phone-UI segments (continuity with the bedroom)
rain = lp(hp(rng.standard_normal(N), 300) * .5 + bp(rng.standard_normal(N), 1800, 6000) * .4, 1500)
ui_env = np.zeros(N)
for s in EDL['segments']:
    if s.get('ui') and s['ui'] != 'question': ui_env = np.maximum(ui_env, span(s['t0'], s['t1'], .15, .15))
mix += np.stack([rain, np.roll(rain, 211)]) * ui_env * .06

# ---- UI details
tick = lambda: hp(rng.standard_normal(int(.03 * SR)), 2500) * np.exp(-tt(.03) * 300)
for k, t0 in enumerate(np.arange(7.5, 9.9, .42)): put(bp(rng.standard_normal(int(.18 * SR)), 1500, 5000) * env(int(.18 * SR), .05, .05), t0, .1, .2)
for t0 in (10.9, 11.65, 12.4): put(np.sin(2 * np.pi * 1320 * tt(.12)) * env(int(.12 * SR), .002, .03), t0, .04)
put(tick(), 29.6, .22)
for k in range(4):
    t0 = 34.8 + k * .85; put(tick(), t0, .22)
    put(np.sin(2 * np.pi * (880 * 2 ** (k * 2 / 12)) * tt(.4)) * env(int(.4 * SR), .002, .09), t0 + .02, .045, r=.4)
put(np.sin(2 * np.pi * 988 * tt(.5)) * env(int(.5 * SR), .003, .12), 54.55, .05, r=.5)

# ---- thunder on the flash
th = EDL['thunder']; T = tt(3.5)
crack = lp(rng.standard_normal(len(T)), 2600) * np.exp(-T / .22) * np.minimum(T / .004, 1) + lp(rng.standard_normal(len(T)), 110) * np.exp(-T / 1.1) * np.minimum(T / .03, 1) * 1.4
put(np.tanh(crack * 1.2), th, .45, r=.4)

# ---- score on a 72 bpm grid (cuts land near the beat)
def at(beat): return 17.4 + beat * BEAT
for b, m in [(0, 57), (2, 60), (4, 64), (6, 62), (8, 57), (10, 64), (12, 65), (14, 64), (16, 60), (18, 62), (20, 57), (22, 60)]:
    put(piano(note(m), 3.5, .6), at(b), .15, .15, r=.5, bus=score)
for b, m in [(0, 45), (8, 41), (16, 48)]: put(piano(note(m), 5, .8), at(b), .15, -.1, r=.4, bus=score)
put(strings([note(45), note(52)], 7.2, 2, .3), 38.6, .06, bus=score)                          # tension into the walk
for t0, m in [(56.7, 57), (57.5 + BEAT, 60), (58.3 + 2 * BEAT, 64), (59.1 + 3 * BEAT, 62)]: put(piano(note(m), 3.5, .55), t0, .14, r=.5, bus=score)
put(strings([note(45), note(57), note(60), note(64)], 7.8, 2.5, .15), 64.5, .15, r=.5, bus=score)
for k, m in enumerate([69, 72, 76, 74, 72, 76, 77]): put(piano(note(m), 2.2, .45), 65.0 + k * BEAT, .1, .3, r=.6, bus=score)
for t0, m in [(64.6, 45), (66.6, 48), (68.6, 53)]: put(piano(note(m), 4, .8), t0, .15, r=.5, bus=score)
put(piano(note(60), 6, .7), 76.9, .2, r=.8, bus=score); put(piano(note(67), 6, .5), 77.3, .12, r=.8, bus=score)
# music drops out for the flash, and is silent under the question
score *= (1 - span(45.2, 50.6, .05, .8) * .95) * (1 - span(72.2, 76.8, .05, .05))
mix += score

# ---- reverb, voice on top
t_ir = tt(2.4); ir = np.stack([rng.standard_normal(len(t_ir)), rng.standard_normal(len(t_ir))]) * np.exp(-t_ir / .6)
ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True))
mix += np.stack([signal.fftconvolve(rev[0], ir[0])[:N], signal.fftconvolve(rev[1], ir[1])[:N]]) * .45
# duck everything under the voice a little
duck = np.ones(N)
for name, t0 in EDL['voice']:
    v = decode(os.path.join(HERE, '..', 'voice', name + '.mp3'), ch=1)
    v = v / (np.abs(v).max() + 1e-9) * .8
    duck = np.minimum(duck, 1 - span(t0 - .1, t0 + len(v) / SR + .1, .15, .3) * .35)
mix *= duck
for name, t0 in EDL['voice']:
    v = decode(os.path.join(HERE, '..', 'voice', name + '.mp3'), ch=1); v = v / (np.abs(v).max() + 1e-9) * .8
    put(v, t0, .9 if not name.startswith(('08', '10', '12')) else .8, 0 if not name.startswith(('08', '10', '12')) else -.05, r=.06)

mix = np.stack([hp(mix[0], 30), hp(mix[1], 30)])
mix = np.tanh(mix * 1.3) / 1.3
mix *= .9 / np.abs(mix).max()
e = np.ones(N); nf = int(.6 * SR); e[-nf:] = np.linspace(1, 0, nf); mix *= e
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
with wave.open(os.path.join(HERE, 'out', 'cut.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix.T * 32767).astype(np.int16).tobytes())
print('ok', DUR)
