"""Synthesised score + sound design for THE SHALLOWS (48 s). Writes out/score.wav.

Everything is generated here: no samples, no external audio.
Cue times match film.html.
"""
import numpy as np
from scipy import signal
import wave, os

SR = 48000
DUR = 48.0
N = int(SR * DUR)
rng = np.random.default_rng(11)
L = np.zeros(N); R = np.zeros(N)
bus_rev = np.zeros((2, N))  # send to reverb


def t_axis(d):
    return np.arange(int(d * SR)) / SR


def place(x, t0, gain=1.0, pan=0.0, rev=0.0):
    i = int(t0 * SR)
    if i >= N: return
    x = x[: N - i]
    gl, gr = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
    L[i:i + len(x)] += x * gain * gl
    R[i:i + len(x)] += x * gain * gr
    if rev:
        bus_rev[0, i:i + len(x)] += x * gain * gl * rev
        bus_rev[1, i:i + len(x)] += x * gain * gr * rev


def lp(x, fc, order=2):
    b, a = signal.butter(order, min(fc, SR / 2 - 100) / (SR / 2), 'low'); return signal.lfilter(b, a, x)


def hp(x, fc, order=2):
    b, a = signal.butter(order, fc / (SR / 2), 'high'); return signal.lfilter(b, a, x)


def bp(x, f1, f2, order=2):
    b, a = signal.butter(order, [f1 / (SR / 2), f2 / (SR / 2)], 'band'); return signal.lfilter(b, a, x)


def env_ad(n, a, d_tau):
    t = np.arange(n) / SR
    return np.minimum(t / max(a, 1e-4), 1) * np.exp(-np.maximum(t - a, 0) / d_tau)


def fade(x, fi=0.01, fo=0.05):
    n = len(x); e = np.ones(n)
    a, b = int(fi * SR), int(fo * SR)
    if a: e[:a] = np.linspace(0, 1, a)
    if b: e[-b:] = np.linspace(1, 0, b)
    return x * e


def saw(f, t):
    return 2 * (t * f - np.floor(0.5 + t * f))


def note(f):  # midi -> Hz
    return 440 * 2 ** ((f - 69) / 12)


# ---------------------------------------------------------------- instruments
def piano(freq, dur=4.0, vel=1.0):
    t = t_axis(dur); x = np.zeros_like(t)
    for n in range(1, 9):
        fn = freq * n * np.sqrt(1 + 0.0004 * n * n)
        x += (1 / n ** 1.4) * np.sin(2 * np.pi * fn * t + rng.random() * 6) * np.exp(-t * (0.7 + n * 0.55))
    x *= np.minimum(t / 0.004, 1)
    x += 0.15 * lp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 60)  # hammer felt
    return fade(lp(x, 4200) * vel, 0, 0.3)


def pad(freqs, dur, attack=1.5, release=1.5, bright=900):
    t = t_axis(dur); x = np.zeros_like(t)
    for f in freqs:
        for det in (-0.12, 0.0, 0.11):
            x += saw(f * 2 ** (det / 12), t + rng.random())
    x = lp(x / (3 * len(freqs)), bright, 2)
    e = np.minimum(t / attack, 1) * np.minimum((dur - t) / release, 1)
    return x * np.clip(e, 0, 1)


def braam(f=55, dur=4.5, bright=700):
    t = t_axis(dur); x = np.zeros_like(t)
    for m in (1, 1.5, 2, 3):
        for det in (-0.2, -0.07, 0.07, 0.2):
            x += saw(f * m * 2 ** (det / 12), t + rng.random()) / m
    sweep = bright * (0.35 + 0.65 * np.exp(-t * 1.2))
    # time-varying lowpass approximated by crossfading two filtered copies
    a, b = lp(x, bright, 2), lp(x, bright * 0.3, 2)
    k = (sweep - bright * 0.3) / (bright * 0.7)
    y = a * k + b * (1 - k)
    y *= env_ad(len(t), 0.02, 1.8)
    return np.tanh(y * 0.35)


def sub_boom(f0=62, f1=32, dur=2.5):
    t = t_axis(dur)
    f = f1 + (f0 - f1) * np.exp(-t * 6)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * env_ad(len(t), 0.003, 0.7)


def noise_hit(dur=1.2, fc=3000, tau=0.25):
    t = t_axis(dur)
    return lp(rng.standard_normal(len(t)), fc) * env_ad(len(t), 0.002, tau)


def riser(dur, f0=300, f1=4000):
    t = t_axis(dur); n = rng.standard_normal(len(t))
    out = np.zeros_like(t); seg = int(0.05 * SR)
    for i in range(0, len(t), seg):
        k = i / len(t); fc = f0 * (f1 / f0) ** k
        out[i:i + seg] = bp(n[max(0, i - 2000):i + seg], fc * 0.7, min(fc * 1.4, 20000))[-len(out[i:i + seg]):]
    tone = np.sin(2 * np.pi * np.cumsum(80 * (8 ** (t / dur))) / SR) * 0.3
    return (out + tone) * (t / dur) ** 2.2


def tick():
    t = t_axis(0.03)
    return hp(rng.standard_normal(len(t)), 2500) * np.exp(-t * 400)


def ping(f=1760):
    t = t_axis(0.6)
    x = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.5 * t)
    return x * env_ad(len(t), 0.002, 0.12)


def drop():
    t = t_axis(0.25)
    f = 700 + 1400 * (t / 0.25) ** 0.5
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(len(t), 0.001, 0.05)


def taiko(f=70):
    t = t_axis(1.5)
    fq = f * (1 + 0.6 * np.exp(-t * 30))
    body = np.sin(2 * np.pi * np.cumsum(fq) / SR) * env_ad(len(t), 0.002, 0.35)
    skin = lp(rng.standard_normal(len(t)), 900) * env_ad(len(t), 0.001, 0.05)
    return np.tanh((body + 0.6 * skin) * 1.4)


# ---------------------------------------------------------------- A/B: the feed
# thumb flicks (same seed/logic as the film is not required; rhythmic density is)
tt = 0.0
while tt < 3.3:
    for j in range(int(6 + rng.random() * 6)):
        place(tick(), tt + j * (0.018 + j * 0.006), 0.3 * (1 - j / 14), pan=rng.uniform(-.4, .4))
    tt += 0.26 + rng.random() * 0.22
for t0, f, p in [(0.55, 1760, -.5), (1.35, 1318, .4), (2.05, 1976, -.2), (2.6, 1568, .5), (3.0, 1760, 0)]:
    place(ping(f), t0, 0.15, pan=p, rev=0.3)
drone_t = t_axis(5.6)
dr = (saw(55, drone_t) + saw(55.3, drone_t) + 0.5 * saw(82.4, drone_t))
dr = lp(dr, 300) * np.minimum(drone_t / 1.0, 1) * (0.5 + 0.5 * drone_t / 5.6)
place(fade(dr, 0, 0.4), 0.0, 0.16)
place(riser(3.3, 400, 6000), 0.05, 0.09)
place(sub_boom(70, 35, 2.2), 3.4, 0.55)
place(noise_hit(1.0, 1800, 0.3), 3.4, 0.08, rev=0.5)

# ---------------------------------------------------------------- C: the shallows
place(braam(55, 5.0, 650), 5.45, 0.5, rev=0.35)
place(sub_boom(55, 30, 3), 5.45, 0.5)
amb_t = t_axis(6.4)
water = bp(rng.standard_normal(len(amb_t)), 250, 1400)
lap = 0.55 + 0.45 * np.sin(2 * np.pi * 0.35 * amb_t + np.sin(2 * np.pi * 0.13 * amb_t) * 2)
hum = lp(rng.standard_normal(len(amb_t)), 160)
amb = water * lap * 0.35 + hum * 0.6
place(fade(amb, 1.0, 0.4), 5.4, 0.22, rev=0.2)
# footsteps in water: soft sloshes on the walk cycle
for k in range(9):
    t0 = 5.9 + k * (np.pi / 2.2)  # WALK = (t-5.3)*2.2 -> step every pi/2.2 s
    if t0 < 11.4:
        s = bp(rng.standard_normal(int(0.35 * SR)), 300, 2200) * env_ad(int(0.35 * SR), 0.03, 0.09)
        place(s, t0, 0.07, pan=-0.15, rev=0.3)
place(pad([note(45), note(52), note(57), note(60)], 6.2, 1.6, 0.6, 700), 5.5, 0.13, rev=0.5)
place(piano(note(69), 3, 0.6), 7.15, 0.13, pan=.2, rev=0.6)
place(piano(note(64), 3, 0.5), 9.5, 0.13, pan=-.2, rev=0.6)

# ---------------------------------------------------------------- D: slop pile
for i in range(7):
    t0 = 11.62 + i * 0.47
    place(sub_boom(90 + i * 6, 45, 0.5), t0, 0.35)
    place(noise_hit(0.12, 6000, 0.02), t0, 0.16, pan=rng.uniform(-.5, .5))
    place(ping(880 * 2 ** (i / 12)), t0, 0.04, pan=rng.uniform(-.6, .6))
place(riser(3.3, 200, 9000), 11.65, 0.13)
tens_t = t_axis(3.35)
tens = lp(saw(110 * 2 ** (np.minimum(tens_t / 3.35, 1) * 5 / 12), tens_t) + saw(111, tens_t), 900) * (tens_t / 3.35) ** 1.5
place(tens, 11.6, 0.10)
# "This isn't reading." — hard stop
place(sub_boom(60, 28, 2.6), 14.95, 0.7)
place(noise_hit(1.5, 2500, 0.4), 14.95, 0.15, rev=0.6)
place(braam(41.2, 1.6, 500), 14.95, 0.35, rev=0.4)

# ---------------------------------------------------------------- E: silence, a single drop
place(drop(), 16.62, 0.22, rev=0.9)

# ---------------------------------------------------------------- F: the dive
place(riser(1.75, 150, 3000), 18.25, 0.28)
rt = t_axis(1.75)
place(lp(saw(55 * 2 ** (rt / 1.75), rt), 400) * (rt / 1.75) ** 2, 18.25, 0.25)
place(sub_boom(80, 26, 4.0), 20.0, 0.95)
place(noise_hit(1.4, 5000, 0.18), 20.0, 0.35, rev=0.3)            # the splash
under_t = t_axis(15.0)
rumble = lp(rng.standard_normal(len(under_t)), 220) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.07 * under_t))
place(fade(rumble, 0.05, 1.5), 20.0, 0.35)
for k in range(46):
    t0 = 20.02 + rng.exponential(0.6) * (1 + k / 25)
    if t0 < 22.6:
        t = t_axis(0.12); f = rng.uniform(500, 1500) * (1 + 3 * t / 0.12)
        b = np.sin(2 * np.pi * np.cumsum(f) / SR) * env_ad(len(t), 0.002, 0.03)
        place(b, t0, 0.05 * (1 - (t0 - 20) / 2.6), pan=rng.uniform(-.8, .8), rev=0.5)
place(pad([note(45), note(57), note(64), note(69)], 3.2, 0.3, 1.0, 1300), 20.0, 0.16, rev=0.6)

# ---------------------------------------------------------------- G: the theme (72 bpm)
beat = 60 / 72
chords = [  # (start, root-bass midi, pad notes, arpeggio notes)
    (22.7, 45, [57, 60, 64], [69, 72, 76, 72]),   # Am
    (25.5, 41, [53, 57, 60], [69, 72, 77, 72]),   # F
    (28.3, 48, [55, 60, 64], [67, 72, 76, 79]),   # C
    (31.1, 43, [55, 59, 62], [67, 71, 74, 79]),   # G
]
for i, (t0, bass, padn, arp) in enumerate(chords):
    d = 2.8 if i < 3 else 3.95
    place(pad([note(n) for n in padn], d + 0.8, 0.8, 0.9, 1100), t0, 0.12, rev=0.5)
    place(piano(note(bass), 4, 0.9), t0, 0.22, pan=-.1, rev=0.4)
    for j in range(int(d / (beat / 2))):
        n = arp[j % len(arp)]
        place(piano(note(n), 2.5, 0.55 - 0.1 * (j % 2)), t0 + j * beat / 2, 0.12, pan=0.25 * np.sin(j), rev=0.55)
# heartbeat-soft kick under the theme
for k in range(int((35 - 23) / beat)):
    place(sub_boom(65, 42, 0.5), 23.0 + k * beat, 0.16)

# ---------------------------------------------------------------- H: the canon
for i in range(6):
    t0 = 35.0 + i * 0.62
    place(taiko(62 + i * 3), t0, 0.55, rev=0.35)
    place(noise_hit(0.25, 7000, 0.04), t0, 0.08)
place(pad([note(45), note(52), note(57), note(64)], 3.9, 0.4, 0.2, 800), 35.0, 0.14, rev=0.4)
place(riser(0.9, 300, 8000), 37.82, 0.16)
place(braam(55, 3.0, 900), 38.72, 0.55, rev=0.5)
place(sub_boom(70, 30, 3), 38.72, 0.7)
place(pad([note(48), note(55), note(60), note(64), note(67)], 2.3, 0.05, 1.2, 2200), 38.72, 0.16, rev=0.7)
place(noise_hit(2.0, 9000, 0.6), 38.72, 0.05, rev=0.8)

# ---------------------------------------------------------------- I: the line
place(piano(note(57), 4, 0.8), 40.95, 0.24, rev=0.8)
dt = t_axis(2.3)
place(fade(lp(saw(55, dt) + saw(55.2, dt), 180), 0.4, 0.5), 40.7, 0.10)

# ---------------------------------------------------------------- J: end card — resolve to C major
place(sub_boom(65, 32, 3.5), 43.2, 0.55)
for n, dl in [(36, 0), (48, 0.0), (55, 0.02), (60, 0.04), (64, 0.06), (67, 0.08), (72, 0.1)]:
    place(piano(note(n), 4.8, 0.8), 43.2 + dl, 0.14, pan=(n - 55) / 30, rev=0.6)
place(pad([note(48), note(55), note(60), note(64), note(67)], 4.8, 0.3, 2.2, 1600), 43.2, 0.17, rev=0.6)
place(piano(note(79), 3.5, 0.5), 44.5, 0.1, pan=0.3, rev=0.9)

# ---------------------------------------------------------------- reverb + master
ir_t = t_axis(2.8)
ir = np.stack([rng.standard_normal(len(ir_t)), rng.standard_normal(len(ir_t))]) * np.exp(-ir_t / 0.7)
ir = np.stack([lp(ir[0], 5000), lp(ir[1], 5000)])
ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True))
wet = np.stack([signal.fftconvolve(bus_rev[0], ir[0])[:N], signal.fftconvolve(bus_rev[1], ir[1])[:N]])
mix = np.stack([L, R]) + wet * 0.55
mix = hp(mix, 25) if False else np.stack([hp(mix[0], 25), hp(mix[1], 25)])
mix = np.tanh(mix * 1.6) / 1.6  # gentle glue
mix *= 0.93 / np.abs(mix).max()
end = np.ones(N); nf = int(0.8 * SR); end[-nf:] = np.linspace(1, 0, nf) ** 2
mix *= end

os.makedirs(os.path.join(os.path.dirname(__file__), 'out'), exist_ok=True)
out = os.path.join(os.path.dirname(__file__), 'out', 'score.wav')
pcm = (mix.T * 32767).astype(np.int16)
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
print('wrote', out, 'peak', np.abs(mix).max())
