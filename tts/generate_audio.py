from piper import PiperVoice
import wave
import sys
import os

scriptDir = os.path.dirname(os.path.abspath(__file__))

voice_model = "en_US-lessac-medium.onnx"
if len(sys.argv) > 3:
    voice_model = sys.argv[3]

voicePath = os.path.join(scriptDir, "voices", voice_model)

if not os.path.exists(voicePath):
    print(f"Warning: Voice file not found at {voicePath}. Falling back to default.", file=sys.stderr)
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