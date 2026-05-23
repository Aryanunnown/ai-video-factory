from piper import PiperVoice
import wave
import sys

voice = PiperVoice.load(
    "voices/en_US-lessac-medium.onnx"
)

text = sys.argv[1]
output = sys.argv[2]

with wave.open(output, "wb") as wav_file:
    voice.synthesize_wav(
        text,
        wav_file
    )

print(output)