"""Temp mix for the One in the Morning animatic: voice cues + synthesised rain, thunder, ticks and a sparse score.
Writes out/animatic.wav. Voice files come from ../voice (Grok TTS)."""
import numpy as np, subprocess, wave, os
from scipy import signal

HERE = os.path.dirname(os.path.abspath(__file__))
FF = os.environ.get('FFMPEG', 'ffmpeg')
SR, DUR = 48000, 82.0
N = int(SR * DUR)
rng = np.random.default_rng(5)
mix = np.zeros((2, N)); rev = np.zeros((2, N))


def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, f, o=2): b, a = signal.butter(o, f / (SR / 2), 'low'); return signal.lfilter(b, a, x)
def hp(x, f, o=2): b, a = signal.butter(o, f / (SR / 2), 'high'); return signal.lfilter(b, a, x)
def bp(x, f1, f2): b, a = signal.butter(2, [f1 / (SR / 2), f2 / (SR / 2)], 'band'); return signal.lfilter(b, a, x)
def env(n, a, tau): t = np.arange(n) / SR; return np.minimum(t / max(a, 1e-4), 1) * np.exp(-np.maximum(t - a, 0) / tau)
def note(m): return 440 * 2 ** ((m - 69) / 12)


def put(x, t0, g=1.0, pan=0.0, r=0.0):
    i = int(t0 * SR)
    if i >= N: return
    x = x[:N - i]; gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    mix[0, i:i + len(x)] += x * g * gl; mix[1, i:i + len(x)] += x * g * gr
    if r: rev[0, i:i + len(x)] += x * g * gl * r; rev[1, i:i + len(x)] += x * g * gr * r


def span(t0, t1, fi=0.5, fo=0.5):
    e = np.zeros(N); a, b = int(t0 * SR), int(t1 * SR); e[a:b] = 1
    k = int(fi * SR); e[a:a + k] = np.linspace(0, 1, k); k = int(fo * SR); e[b - k:b] = np.linspace(1, 0, k)
    return e


def load(name):
    raw = subprocess.run([FF, '-loglevel', 'error', '-i', os.path.join(HERE, '..', 'voice', name + '.mp3'), '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.int16) / 32768.0


def piano(f, d=4.0, v=1.0):
    t = tt(d); x = sum((1 / n ** 1.4) * np.sin(2 * np.pi * f * n * t + rng.random() * 6) * np.exp(-t * (0.8 + n * 0.6)) for n in range(1, 8))
    return lp(x * np.minimum(t / .004, 1), 3800) * v


def strings(freqs, d, a=1.5, r=1.5):
    t = tt(d); x = np.zeros_like(t)
    for f in freqs:
        for det in (-.1, 0, .1):
            ph = rng.random(); x += 2 * ((t * f * 2 ** (det / 12) + ph) % 1) - 1
    x = lp(x / (3 * len(freqs)), 1400)
    return x * np.clip(np.minimum(t / a, (d - t) / r), 0, 1)


# ---- rain: indoor (muffled) and outdoor (full)
rain = hp(rng.standard_normal(N), 400) * 0.5 + bp(rng.standard_normal(N), 2000, 7000) * 0.5
drops = np.zeros(N); idx = rng.integers(0, N, 9000); drops[idx] = rng.uniform(.3, 1, len(idx)); drops = bp(drops, 1500, 6000)
outdoor = (rain + drops * 2) * (span(38.6, 51.2, .2, .4))
indoor = lp(rain + drops, 1400) * np.clip(span(0, 38.7, .8, .3) + span(51.1, 82, .3, 2.0), 0, 1)
indoor *= 1 - 0.8 * span(71.4, 75.8, .15, .6)          # near silence under the question
mix[0] += outdoor * .09 + indoor * .07; mix[1] += np.roll(outdoor, 311) * .09 + np.roll(indoor, 211) * .07
hum = np.sin(2 * np.pi * 60 * tt(DUR)) * 0.012 * span(0, 7.4, 1, .5); mix += hum

# ---- feed swipes, chat pops, taps
for k, t0 in enumerate(np.arange(7.5, 9.9, .42)):
    w = bp(rng.standard_normal(int(.18 * SR)), 1500, 5000) * env(int(.18 * SR), .05, .05); put(w, t0, .12, pan=.2)
for t0 in (10.6, 11.4, 12.2): put(np.sin(2 * np.pi * 1320 * tt(.12)) * env(int(.12 * SR), .002, .03), t0, .05)
put(lp(rng.standard_normal(int(.25 * SR)), 900) * env(int(.25 * SR), .01, .06), 12.3, .06)   # Tom's exhale
for k in range(4):
    t0 = 35.2 + k * .85
    put(hp(rng.standard_normal(int(.03 * SR)), 2500) * np.exp(-tt(.03) * 300), t0, .25)
    put(np.sin(2 * np.pi * (880 * 2 ** (k * 2 / 12)) * tt(.4)) * env(int(.4 * SR), .002, .09), t0 + .02, .05, r=.4)
put(hp(rng.standard_normal(int(.03 * SR)), 2500) * np.exp(-tt(.03) * 300), 30.0, .25)  # the long-press
put(np.sin(2 * np.pi * 988 * tt(.5)) * env(int(.5 * SR), .003, .12), 53.25, .06, r=.5)    # Talk wakes

# ---- thunder: distant roll, then two cracks on the flashes
roll = lp(rng.standard_normal(int(4 * SR)), 180) * env(int(4 * SR), .6, 1.2); put(roll, 42.3, .5)
for t0 in (47.4, 48.0):
    crack = lp(rng.standard_normal(int(3 * SR)), 2500) * env(int(3 * SR), .003, .25) + lp(rng.standard_normal(int(3 * SR)), 120) * env(int(3 * SR), .02, .9)
    put(crack, t0, .55, r=.4)

# ---- score
motif = [(18.3, 57), (19.8, 60), (21.3, 64), (23.2, 62), (25.0, 57), (27.0, 64), (29.0, 65), (31.0, 64), (33.0, 60), (34.6, 62)]
for t0, m in motif: put(piano(note(m), 3.5, .6), t0, .16, pan=.15, r=.5)
for t0, m in [(18.3, 45), (25.0, 41), (31.0, 48)]: put(piano(note(m), 5, .8), t0, .16, pan=-.1, r=.4)
for t0, m in [(38.8, 57), (41.0, 64), (43.5, 62), (45.5, 65)]: put(piano(note(m), 3, .5), t0, .12, r=.6)
put(strings([note(45), note(52)], 9.5, 2, .4) * 1.0, 38.2, .07)                           # tension under the river, drops out at the flash
for t0, m in [(55.6, 57), (57.8, 60), (60.0, 64), (62.4, 62)]: put(piano(note(m), 3.5, .55), t0, .15, r=.5)
put(strings([note(45), note(57), note(60), note(64)], 7.6, 2.5, .15), 63.6, .15, r=.5)        # swell, cut on "feelings"
for t0, m in [(63.6, 45), (65.6, 48), (67.6, 53)]: put(piano(note(m), 4, .8), t0, .16, r=.5)
for t0, m in [(64.1, 69), (65.1, 72), (66.1, 76), (67.1, 74), (68.1, 72), (69.1, 76), (70.1, 77)]: put(piano(note(m), 2.2, .45), t0, .11, pan=.3, r=.6)
put(piano(note(60), 6, .7), 75.9, .2, r=.8)
put(piano(note(67), 6, .5), 76.3, .12, r=.8)

# ---- reverb, then voice on top (dry, intimate)
t_ir = tt(2.4); ir = np.stack([rng.standard_normal(len(t_ir)), rng.standard_normal(len(t_ir))]) * np.exp(-t_ir / .6)
ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True))
mix += np.stack([signal.fftconvolve(rev[0], ir[0])[:N], signal.fftconvolve(rev[1], ir[1])[:N]]) * .5
# hard silence for music between the last word and the question card (keep a trace of rain)
gate = 1 - span(71.2, 75.75, .05, .05) * .85; mix *= gate

cues = [('01_one', .3), ('02_trash', 11.6), ('03_apathy', 18.2), ('04_light', 21.0), ('05_explain', 30.3), ('06_flash', 42.4),
        ('07_books', 51.6), ('08_tom_read', 53.3), ('09_taught', 55.5), ('10_tom_goon', 62.3), ('11_infinity', 63.6)]
for name, t0 in cues:
    v = load(name); v = v / (np.abs(v).max() + 1e-9) * .8
    tom = name.startswith(('08', '10'))
    put(v, t0, .95 if not tom else .85, pan=0 if not tom else -.05, r=.08)

mix = np.stack([hp(mix[0], 30), hp(mix[1], 30)])
mix = np.tanh(mix * 1.3) / 1.3
mix *= .92 / np.abs(mix).max()
e = np.ones(N); nf = int(1.2 * SR); e[-nf:] = np.linspace(1, 0, nf); mix *= e
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
with wave.open(os.path.join(HERE, 'out', 'animatic.wav'), 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix.T * 32767).astype(np.int16).tobytes())
print('ok')
