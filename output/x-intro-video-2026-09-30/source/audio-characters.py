"""Procedural score and foley for the Tinct film (32.0 s @ 24 fps timeline).

Everything is synthesized here: no samples, no stock audio.
"""
import numpy as np
from scipy import signal
import wave, sys

SR = 48000
DUR = 360 / 24.0
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


# ------------------------------------------------------------------ characters clip: foley only
music = buf(); pads = buf()
amb = buf()
w = wind(5.4)
wf = np.ones(w.shape[1]); wf[:int(0.4 * SR)] = np.linspace(0, 1, int(0.4 * SR)); wf[-int(1.0 * SR):] = np.linspace(1, 0, int(1.0 * SR))
place(amb, w * wf, 0.0, gain=0.16)                                       # the garret: wind at the window
rt0 = fire(5.0, rate=3)
place(amb, rt0, 0.0, gain=0.07)                                          # candle / room tone
bl = bell(midi(n2m('D4')) * 0.5, 6.0)
place(music, bl, 0.7, gain=0.11, pan=0.45)                               # a distant church bell over the city
rt = fire(8.0, rate=5)
rtf = np.ones(rt.shape[1]); rtf[:int(1.0 * SR)] = np.linspace(0, 1, int(1.0 * SR))
place(amb, rt * rtf, fr(124), gain=0.09)                                 # quiet room tone under the reading
fe = fire(3.0, rate=9)
fef = np.ones(fe.shape[1]); fef[:int(0.6 * SR)] = np.linspace(0, 1, int(0.6 * SR))
place(amb, fe * fef, fr(300), gain=0.24)                                 # the reading room's fire
amb = wet(amb, reverb_ir(1.6, 0.35), 0.12)
music = wet(music, reverb_ir(3.6, 0.7), 0.45)
sfx = buf()
place(sfx, whoosh(0.9, 400, 2600, 0.4), fr(110), gain=0.16)              # into the book
place(sfx, page_flutter(0.6), fr(122), gain=0.10)
place(sfx, click(0.6), fr(167), gain=0.12, pan=-0.3)                     # Rodya → card
place(sfx, whoosh(0.35, 1500, 4200, 0.3), fr(167), gain=0.04, pan=-0.3)
place(sfx, click(0.6), fr(248), gain=0.12, pan=0.35)                     # Dounia → card
place(sfx, whoosh(0.35, 1500, 4200, 0.3), fr(248), gain=0.04, pan=0.35)
sfx = wet(sfx, reverb_ir(1.2, 0.25), 0.18)

# ------------------------------------------------------------------ mix
tt = np.arange(N) / SR
mix = 0.22 * music + 0.07 * pads + 0.8 * amb + 1.7 * sfx
# gentle master: high-pass rumble, soft saturation, end fade
mix = sos_filter(mix, 'highpass', 65, order=4)
mix = mix + 0.35 * sos_filter(mix, 'highpass', 4500)
end_fade = np.ones(N)
efn = int(0.9 * SR)
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
