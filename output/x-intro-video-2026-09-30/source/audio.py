"""Procedural score and foley for the Tinct film (32.0 s @ 24 fps timeline).

Everything is synthesized here: no samples, no stock audio.
"""
import numpy as np
from scipy import signal
import wave, sys

SR = 48000
DUR = 32.0
N = int(SR * DUR)
rng = np.random.default_rng(1818)
fr = lambda f: f / 24.0            # frame -> seconds


def buf():
    return np.zeros((2, N))


def place(dst, x, t, gain=1.0, pan=0.0):
    """Add mono or stereo x into dst at time t (s) with equal-power pan."""
    i = int(t * SR)
    if i >= N:
        return
    if x.ndim == 1:
        l = np.cos((pan + 1) * np.pi / 4)
        r = np.sin((pan + 1) * np.pi / 4)
        x = np.vstack([x * l * 1.414, x * r * 1.414])
    n = min(x.shape[1], N - i)
    if i < 0:
        x = x[:, -i:]
        n = min(x.shape[1], N)
        i = 0
    dst[:, i:i + n] += gain * x[:, :n]


def sos_filter(x, kind, f, order=2):
    sos = signal.butter(order, f, btype=kind, fs=SR, output='sos')
    return signal.sosfilt(sos, x, axis=-1)


def pink(n):
    w = rng.standard_normal(n)
    f = np.fft.rfft(w)
    k = np.arange(len(f))
    k[0] = 1
    f = f / np.sqrt(k)
    p = np.fft.irfft(f, n)
    return p / (np.abs(p).max() + 1e-9)


def brown(n):
    b = np.cumsum(rng.standard_normal(n))
    b = sos_filter(b, 'highpass', 20)
    return b / (np.abs(b).max() + 1e-9)


def env_adsr(n, a, r, hold=None):
    e = np.ones(n)
    na, nr = int(a * SR), int(r * SR)
    if na > 0:
        e[:na] = 0.5 - 0.5 * np.cos(np.linspace(0, np.pi, na))
    if nr > 0:
        e[-nr:] *= 0.5 + 0.5 * np.cos(np.linspace(0, np.pi, nr))
    return e


def midi(m):
    return 440.0 * 2 ** ((m - 69) / 12)


NOTE = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11}


def n2m(s):
    name, octv = (s[:-1], int(s[-1]))
    return 12 * (octv + 1) + NOTE[name]


# ---------------------------------------------------------------- instruments
def piano(note, dur=3.5, vel=0.5):
    """Soft felt-piano: inharmonic partials, paired detuned strings, hammer felt."""
    f0 = midi(n2m(note)) if isinstance(note, str) else note
    tail = 1.2
    n = int((dur + tail) * SR)
    t = np.arange(n) / SR
    out = np.zeros(n)
    B = 0.00032
    base_tau = 3.4 * (261.6 / f0) ** 0.45
    for k in range(1, 18):
        fk = k * f0 * np.sqrt(1 + B * k * k)
        if fk > 9000:
            break
        amp = (1 / k ** 1.35) * np.exp(-(k - 1) * (0.55 - 0.35 * vel)) * (1 + 0.25 * np.sin(k * 1.7))
        tau = base_tau / (1 + 0.55 * (k - 1))
        det = 0.09 * k
        ph = rng.uniform(0, 2 * np.pi)
        partial = 0.5 * (np.sin(2 * np.pi * fk * t + ph) + np.sin(2 * np.pi * (fk + det) * t + ph * 1.3))
        # two-stage decay: fast prompt sound, slow aftersound
        dec = 0.65 * np.exp(-t / tau) + 0.35 * np.exp(-t / (tau * 3.2))
        out += amp * partial * dec
    att = np.minimum(1, t / 0.006)
    out *= att
    # felt hammer thump
    hn = int(0.03 * SR)
    ham = rng.standard_normal(hn) * np.exp(-np.arange(hn) / (0.006 * SR))
    ham = sos_filter(ham, 'bandpass', [f0 * 1.5, min(f0 * 8, 6000)])
    out[:hn] += 0.05 * vel * ham
    # damper at note end
    rel = np.ones(n)
    di = int(dur * SR)
    rel[di:] = np.exp(-(t[di:] - dur) / 0.28)
    out *= rel
    out = sos_filter(out, 'lowpass', 2200 + 4200 * vel, order=2)
    return out * vel


def pad_chord(notes, dur, att=1.4, rel=1.6, bright=900):
    n = int((dur + rel) * SR)
    t = np.arange(n) / SR
    out = np.zeros((2, n))
    for idx, nt in enumerate(notes):
        f0 = midi(n2m(nt))
        for side, cents in ((0, -6), (1, 7)):
            f = f0 * 2 ** (cents / 1200)
            v = np.zeros(n)
            for k in range(1, 14):
                if k * f > 5000:
                    break
                v += np.sin(2 * np.pi * k * f * t + rng.uniform(0, 6.28)) / k ** 1.15
            lfo = 1 + 0.08 * np.sin(2 * np.pi * (0.11 + 0.03 * idx) * t + idx)
            out[side] += v * lfo
    e = np.ones(n)
    na = int(att * SR)
    e[:na] = np.sin(np.linspace(0, np.pi / 2, na)) ** 2
    nd = int(dur * SR)
    e[nd:] = np.cos(np.linspace(0, np.pi / 2, n - nd)) ** 2
    out *= e
    out = sos_filter(out, 'lowpass', bright, order=3)
    out = sos_filter(out, 'highpass', 190, order=2)
    return out / len(notes)


def bell(f0, dur=7.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    ratios = [0.5, 1.0, 1.183, 1.506, 2.0, 2.514, 2.662, 3.011, 4.166, 5.433]
    amps = [0.5, 1.0, 0.6, 0.45, 0.5, 0.25, 0.22, 0.18, 0.1, 0.06]
    taus = [4.5, 3.2, 2.4, 2.0, 1.6, 1.1, 1.0, 0.8, 0.5, 0.35]
    out = np.zeros(n)
    for r, a, ta in zip(ratios, amps, taus):
        out += a * np.sin(2 * np.pi * f0 * r * t + rng.uniform(0, 6)) * np.exp(-t / ta)
    out *= np.minimum(1, t / 0.004)
    return sos_filter(out, 'lowpass', 3500)


def click(bright=1.0):
    n = int(0.06 * SR)
    t = np.arange(n) / SR
    tick = rng.standard_normal(n) * np.exp(-t / 0.0015)
    tick = sos_filter(tick, 'highpass', 2500)
    body = np.sin(2 * np.pi * 950 * t) * np.exp(-t / 0.012)
    low = np.sin(2 * np.pi * 180 * t) * np.exp(-t / 0.02)
    return (0.35 * bright * tick + 0.25 * body + 0.3 * low)


def whoosh(dur=0.55, f_from=500, f_to=2600, peak=0.25):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = pink(n)
    # sweep via short-block bandpass
    out = np.zeros(n)
    blocks = 24
    edges = np.linspace(0, n, blocks + 1).astype(int)
    zi = None
    for b in range(blocks):
        fc = f_from * (f_to / f_from) ** (b / (blocks - 1))
        sos = signal.butter(2, [fc * 0.6, min(fc * 1.7, 20000)], btype='bandpass', fs=SR, output='sos')
        seg = x[edges[b]:edges[b + 1]]
        if zi is None:
            zi = signal.sosfilt_zi(sos) * 0
        y, zi = signal.sosfilt(sos, seg, zi=zi)
        out[edges[b]:edges[b + 1]] = y
    pk = int(peak * n)
    e = np.concatenate([np.sin(np.linspace(0, np.pi / 2, pk)) ** 2, np.exp(-np.linspace(0, 5, n - pk))])
    return out * e


def page_flutter(dur=0.7):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = sos_filter(rng.standard_normal(n), 'bandpass', [900, 6000])
    am = 0.5 + 0.5 * np.abs(np.sin(2 * np.pi * 17 * t + 3 * np.sin(2 * np.pi * 3 * t)))
    e = np.minimum(1, t / 0.04) * np.exp(-t / 0.22)
    return x * am * e


def rain(dur):
    n = int(dur * SR)
    bed = sos_filter(pink(n), 'bandpass', [450, 7500]) * 0.55
    bed2 = sos_filter(brown(n), 'lowpass', 400) * 0.25
    drops = np.zeros(n)
    k = rng.poisson(90 * dur)
    for _ in range(k):
        i = rng.integers(0, n - 800)
        fd = rng.uniform(1800, 6500)
        ln = rng.integers(120, 500)
        tt = np.arange(ln) / SR
        drops[i:i + ln] += rng.uniform(0.05, 0.35) * np.sin(2 * np.pi * fd * tt) * np.exp(-tt / 0.0025)
    st = np.vstack([bed + bed2 + drops, np.roll(bed, 2400) + bed2 + np.roll(drops, 777)])
    return st


def thunder(dur=4.2):
    n = int(dur * SR)
    t = np.arange(n) / SR
    rum = sos_filter(brown(n), 'lowpass', 160, order=3)
    mod = sos_filter(np.abs(rng.standard_normal(n)), 'lowpass', 6) * 3
    rumble = rum * (np.minimum(1, t / 0.18)) * np.exp(-t / 1.4) * (0.6 + mod)
    crack = sos_filter(rng.standard_normal(n), 'bandpass', [180, 2400]) * np.exp(-np.maximum(0, t - 0.02) / 0.12) * np.minimum(1, t / 0.01)
    crack2 = sos_filter(rng.standard_normal(n), 'bandpass', [120, 1400]) * np.exp(-np.maximum(0, t - 0.22) / 0.2) * (t > 0.2)
    x = 0.9 * rumble / (np.abs(rumble).max() + 1e-9) + 0.28 * crack + 0.18 * crack2
    return np.vstack([x, np.roll(x, 900)])


def sea(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    base = pink(n)
    swell = np.clip(np.sin(np.pi * t / dur), 0, 1) ** 1.6
    crash = np.exp(-((t - dur * 0.55) / 0.5) ** 2)
    lo = sos_filter(base, 'lowpass', 700) * (0.5 + 0.8 * swell)
    hi = sos_filter(base, 'bandpass', [1200, 7000]) * (0.15 + 0.9 * crash)
    x = lo + hi
    return np.vstack([x, np.roll(x, 3100)])


def wind(dur):
    n = int(dur * SR)
    t = np.arange(n) / SR
    w = rng.standard_normal(n)
    out = np.zeros(n)
    blocks = 64
    edges = np.linspace(0, n, blocks + 1).astype(int)
    zi = None
    for b in range(blocks):
        fc = 380 + 220 * np.sin(2 * np.pi * 0.23 * edges[b] / SR) + 80 * np.sin(2 * np.pi * 0.7 * edges[b] / SR)
        sos = signal.butter(2, [fc * 0.7, fc * 1.5], btype='bandpass', fs=SR, output='sos')
        if zi is None:
            zi = np.zeros((sos.shape[0], 2))
        y, zi = signal.sosfilt(sos, w[edges[b]:edges[b + 1]], zi=zi)
        out[edges[b]:edges[b + 1]] = y
    out *= 0.6 + 0.4 * np.sin(2 * np.pi * 0.17 * t) ** 2
    return np.vstack([out, np.roll(out, 5000)])


def fire(dur, rate=12):
    n = int(dur * SR)
    bed = sos_filter(brown(n), 'lowpass', 300) * 0.35
    bed *= 0.7 + 0.3 * sos_filter(np.abs(rng.standard_normal(n)), 'lowpass', 4) * 3
    cr = np.zeros(n)
    for _ in range(rng.poisson(rate * dur)):
        i = rng.integers(0, n - 400)
        ln = rng.integers(40, 260)
        burst = rng.standard_normal(ln) * np.exp(-np.arange(ln) / (ln / 4))
        cr[i:i + ln] += rng.uniform(0.1, 0.9) ** 2 * burst
    cr = sos_filter(cr, 'highpass', 1200)
    x = bed + 1.1 * cr
    return np.vstack([x, np.roll(x, 1900)])


def pen_scratch(dur=0.9):
    n = int(dur * SR)
    t = np.arange(n) / SR
    x = sos_filter(rng.standard_normal(n), 'bandpass', [2200, 7000])
    grain = 0.6 + 0.4 * np.sin(2 * np.pi * 55 * t + 2 * np.sin(2 * np.pi * 7 * t))
    # two strokes: stem (0-0.45), crossbar (0.5-0.8)
    e = np.exp(-((t - 0.24) / 0.16) ** 2) + 0.8 * np.exp(-((t - 0.66) / 0.09) ** 2)
    return x * grain * e


def reverb_ir(dur=3.4, decay=0.62, lp_start=9000, lp_end=1800):
    n = int(dur * SR)
    t = np.arange(n) / SR
    irs = []
    for s in range(2):
        x = rng.standard_normal(n) * np.exp(-t / decay)
        a = sos_filter(x, 'lowpass', lp_start)
        b = sos_filter(x, 'lowpass', lp_end)
        m = np.clip(t / dur * 2.2, 0, 1)
        y = a * (1 - m) + b * m
        pre = int(0.022 * SR)
        y = np.concatenate([np.zeros(pre), y])[:n]
        irs.append(y / np.sqrt(np.sum(y ** 2)))
    return np.vstack(irs)


def wet(x, ir, mix):
    y = np.vstack([signal.fftconvolve(x[0], ir[0])[:N], signal.fftconvolve(x[1], ir[1])[:N]])
    y = sos_filter(y, 'highpass', 180, order=2)
    return x * (1 - mix * 0.35) + y * mix


# ------------------------------------------------------------------ the score
music = buf()
pads = buf()

# Pad harmony (D major, contemplative): hooks -> card tension -> resolution -> product -> end bloom
PADS = [
    (0.0, 3.1, ['D3', 'A3', 'E4', 'A4']),              # Dsus2
    (3.0, 2.35, ['B2', 'F#3', 'D4', 'A4']),            # Bm7
    (5.25, 2.35, ['G2', 'D3', 'B3', 'F#4']),           # Gmaj7
    (7.5, 2.9, ['E3', 'B3', 'D4', 'G4']),              # Em7
    (10.25, 1.0, ['A2', 'E3', 'D4', 'G4']),            # A7sus4 (card: tension)
    (11.17, 1.9, ['D3', 'A3', 'F#4', 'A4']),           # D (resolution on "This time")
    (13.0, 2.1, ['D3', 'A3', 'F#4', 'E5']),            # product: Dadd9
    (15.0, 2.1, ['B2', 'F#3', 'D4', 'A4']),            # Bm7
    (17.0, 2.1, ['G2', 'D3', 'B3', 'F#4']),            # Gmaj7
    (19.0, 2.1, ['A2', 'E3', 'C#4', 'E4']),            # A
    (21.0, 2.1, ['D3', 'A3', 'F#4', 'E5']),
    (23.0, 2.1, ['B2', 'F#3', 'D4', 'A4']),
    (25.0, 2.1, ['G2', 'D3', 'B3', 'F#4']),
    (27.0, 1.25, ['A2', 'E3', 'C#4', 'E4']),
    (28.17, 3.9, ['D3', 'A3', 'F#4', 'A4', 'D5']),     # end bloom
]
for t0, d, notes in PADS:
    place(pads, pad_chord(notes, d, att=1.1 if t0 > 0 else 0.6, rel=1.4, bright=1100 if t0 < 13 else 1400), t0, gain=0.9)

# Piano: one note per question, descending line, then resolution
PIANO = [
    (0.10, 'A4', 3.0, 0.42), (0.10, 'D4', 3.0, 0.30),
    (3.00, 'F#4', 2.4, 0.40), (3.00, 'B3', 2.4, 0.26),
    (5.25, 'E4', 2.3, 0.40), (5.25, 'G3', 2.3, 0.24),
    (7.50, 'D4', 1.4, 0.40), (8.60, 'B3', 1.8, 0.30), (7.50, 'E3', 2.8, 0.22),
    (10.30, 'E4', 1.0, 0.30), (10.30, 'A3', 1.0, 0.22),
    (11.17, 'F#4', 2.2, 0.44), (11.17, 'A3', 2.2, 0.30), (11.17, 'D3', 2.2, 0.30), (11.60, 'A4', 1.9, 0.30),
]
# product section: gentle broken chords, one figure per chord
FIG = {
    'D': ['D3', 'A3', 'F#4', 'E4'], 'Bm': ['B2', 'F#3', 'D4', 'C#4'],
    'G': ['G2', 'D3', 'B3', 'A3'], 'A': ['A2', 'E3', 'C#4', 'E4'],
}
seq = [(13.0, 'D'), (15.0, 'Bm'), (17.0, 'G'), (19.0, 'A'), (21.0, 'D'), (23.0, 'Bm'), (25.0, 'G'), (27.0, 'A')]
for t0, ch in seq:
    for j, nt in enumerate(FIG[ch]):
        v = [0.30, 0.22, 0.26, 0.20][j]
        PIANO.append((t0 + j * 0.46, nt, 1.6 if j < 3 else 1.2, v))
# end: D major chord, then a single high A when the wordmark lands
PIANO += [(28.17, 'D2', 3.6, 0.36), (28.17, 'A2', 3.6, 0.30), (28.17, 'F#3', 3.6, 0.32), (28.17, 'D4', 3.6, 0.34),
          (28.95, 'A4', 3.0, 0.32), (29.55, 'F#5', 2.4, 0.2)]
for t0, nt, d, v in PIANO:
    pan = np.clip((n2m(nt) - 60) / 30, -0.5, 0.5)
    place(music, piano(nt, d, v), t0, gain=0.9, pan=pan)

# distant Florence bell (The Prince)
place(music, bell(midi(n2m('D4')) * 0.5, 6.5), 5.40, gain=0.10, pan=0.35)

ir_hall = reverb_ir(3.6, 0.7)
music = wet(music, ir_hall, 0.42)
music = music - 0.5 * sos_filter(music, 'lowpass', 230, order=2)
pads = wet(pads, ir_hall, 0.3)

# ------------------------------------------------------------------ ambience
amb = buf()
r = rain(3.9)
fade = np.ones(r.shape[1]); fo = int(0.9 * SR); fade[-fo:] = np.linspace(1, 0, fo)
fi = int(0.05 * SR); fade[:fi] = np.linspace(0, 1, fi)
place(amb, r * fade, 0.0, gain=0.34)
place(amb, thunder(4.4), fr(9), gain=0.62)
place(amb, sea(3.2), 2.55, gain=0.34)
# The Prince: quiet room, candle, wind at the window
place(amb, fire(2.6, rate=4) * 0.5, 5.1, gain=0.18)
# Meditations: winter wind + brazier
w = wind(6.4)
wf = np.ones(w.shape[1]); wf[:int(0.5 * SR)] = np.linspace(0, 1, int(0.5 * SR)); wf[-int(1.5 * SR):] = np.linspace(1, 0, int(1.5 * SR))
place(amb, w * wf, 7.25, gain=0.22)
fz = fire(9.5, rate=10)
ff = np.ones(fz.shape[1]); ff[:int(0.5 * SR)] = np.linspace(0, 1, int(0.5 * SR)); ff[-int(1.2 * SR):] = np.linspace(1, 0, int(1.2 * SR))
place(amb, fz * ff, 7.35, gain=0.22)
# end card: the reading room's fire
fe = fire(4.0, rate=9)
fef = np.ones(fe.shape[1]); fef[:int(0.8 * SR)] = np.linspace(0, 1, int(0.8 * SR))
place(amb, fe * fef, 28.1, gain=0.2)
# duck ambience under the card text
duck = np.ones(N)
tt = np.arange(N) / SR
duck *= 1 - 0.55 * np.clip((tt - 10.2) / 0.6, 0, 1) * np.clip((12.9 - tt) / 0.6, 0, 1)
amb *= duck
amb = wet(amb, reverb_ir(1.6, 0.35), 0.12)

# ------------------------------------------------------------------ UI foley
sfx = buf()
place(sfx, click(0.9), fr(340), gain=0.22, pan=-0.2)          # Read
place(sfx, whoosh(0.8, 300, 1800, 0.3), fr(340) + 0.04, gain=0.20)   # the book lifts and opens
place(sfx, page_flutter(0.8), fr(346), gain=0.10, pan=0.15)
place(sfx, click(0.8), fr(396), gain=0.20, pan=0.1)           # Begin reading
place(sfx, whoosh(0.7, 700, 3200, 0.35), fr(398), gain=0.14)  # into the page
place(sfx, page_flutter(0.6), fr(421), gain=0.12, pan=0.35)   # compare page lays in
place(sfx, whoosh(0.5, 1200, 3800, 0.4), fr(420), gain=0.06, pan=0.35)
place(sfx, click(0.5), fr(528), gain=0.10, pan=-0.3)          # menu appears
place(sfx, click(0.9), fr(550), gain=0.18, pan=-0.3)          # Explain
place(sfx, whoosh(0.45, 1500, 4200, 0.3), fr(560), gain=0.05, pan=-0.3)   # card resolves
place(sfx, click(0.7), fr(614), gain=0.14, pan=0.3)           # focus the input
for k in range(10):                                           # typing
    place(sfx, click(1.3) * rng.uniform(0.5, 1.0), fr(616) + k * 0.083 + rng.uniform(-0.012, 0.012), gain=0.07, pan=0.3)
place(sfx, click(0.8), fr(640), gain=0.16, pan=0.3)           # send
place(sfx, whoosh(0.4, 900, 3000, 0.25), fr(641), gain=0.06, pan=0.3)
place(sfx, pen_scratch(0.9), fr(688), gain=0.05)              # the t draws itself
sfx = wet(sfx, reverb_ir(1.2, 0.25), 0.18)

# ------------------------------------------------------------------ mix
mix = 0.22 * music + 0.07 * pads + 0.8 * amb + 1.7 * sfx
# gentle master: high-pass rumble, soft saturation, end fade
mix = sos_filter(mix, 'highpass', 65, order=4)
mix = mix + 0.35 * sos_filter(mix, 'highpass', 4500)
end_fade = np.ones(N)
efn = int(1.1 * SR)
end_fade[-efn:] = np.cos(np.linspace(0, np.pi / 2, efn)) ** 2
start_fade = np.minimum(1, tt / 0.02)
mix *= end_fade * start_fade
mix /= np.abs(mix).max() + 1e-9
mix *= 0.89

out = sys.argv[1] if len(sys.argv) > 1 else 'score.wav'
pcm = (np.clip(mix.T, -1, 1) * 32767).astype(np.int16)
with wave.open(out, 'wb') as wv:
    wv.setnchannels(2); wv.setsampwidth(2); wv.setframerate(SR)
    wv.writeframes(pcm.tobytes())
print('wrote', out, pcm.shape)
