
import librosa
import numpy as np
import soundfile as sf
import os
from detector import detector
import logging

logging.basicConfig(level=logging.INFO)

def test_valid_wav():
    print("--- Testing Valid WAV Processing ---")
    filename = "test_valid.wav"
    try:
        # Generate 1 sec of sine wave
        sr = 22050
        t = np.linspace(0, 1, sr)
        data = np.sin(2 * np.pi * 440 * t)
        sf.write(filename, data, sr)
        
        print(f"File created: {filename}, size: {os.path.getsize(filename)} bytes")
        
        result = detector.predict(filename)
        print(f"Result: {result}")
        print("Valid WAV processing SUCCESSFUL!")
    except Exception as e:
        print(f"Valid WAV processing FAILED: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if os.path.exists(filename):
            os.remove(filename)

if __name__ == "__main__":
    test_valid_wav()
