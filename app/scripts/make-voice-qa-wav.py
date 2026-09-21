"""Build a synthetic QA microphone loop from espeak output. No user recording."""
import sys
import wave
from array import array

with wave.open(sys.argv[1], 'rb') as source:
    assert source.getnchannels() == 1 and source.getsampwidth() == 2
    rate = source.getframerate()
    data = array('h', source.readframes(source.getnframes()))
# PCM16, 24kHz mono with an four-second pause between questions.
out = array('h', (data[min(len(data)-1, round(i * rate / 24000))] for i in range(round(len(data) * 24000 / rate))))
out.extend([0] * (24000 * 4))
with wave.open(sys.argv[2], 'wb') as target:
    target.setnchannels(1)
    target.setsampwidth(2)
    target.setframerate(24000)
    target.writeframes(out.tobytes())
