from piper import PiperVoice
import wave
import sys
import os

scriptDir = os.path.dirname(os.path.abspath(__file__))
voicePath = os.path.join(scriptDir, "voices", "en_US-lessac-medium.onnx")

voice = PiperVoice.load(voicePath)

text = sys.argv[1]
output = sys.argv[2]

with wave.open(output, "wb") as wav_file:
    voice.synthesize_wav(
        text,
        wav_file
    )

print(output)