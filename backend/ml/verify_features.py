
import numpy as np
import librosa
import joblib
import os

def get_features(data, sr):
    result = np.array([])
    
    # ZCR
    zcr = np.mean(librosa.feature.zero_crossing_rate(y=data).T, axis=0)
    result = np.hstack((result, zcr)) # 1
    
    # Chroma
    stft = np.abs(librosa.stft(data))
    chroma_stft = np.mean(librosa.feature.chroma_stft(S=stft, sr=sr).T, axis=0)
    result = np.hstack((result, chroma_stft)) # 12
    
    # MFCC
    mfcc = np.mean(librosa.feature.mfcc(y=data, sr=sr, n_mfcc=20).T, axis=0)
    result = np.hstack((result, mfcc)) # 20
    
    # RMS
    rms = np.mean(librosa.feature.rms(y=data).T, axis=0)
    result = np.hstack((result, rms)) # 1
    
    # Mel
    mel = np.mean(librosa.feature.melspectrogram(y=data, sr=sr).T, axis=0)
    result = np.hstack((result, mel)) # 128
    
    # Spectral features (Hypothesis: Centroid, Rolloff, Bandwidth)
    centroid = np.mean(librosa.feature.spectral_centroid(y=data, sr=sr).T, axis=0)
    result = np.hstack((result, centroid)) # 1
    
    rolloff = np.mean(librosa.feature.spectral_rolloff(y=data, sr=sr).T, axis=0)
    result = np.hstack((result, rolloff)) # 1
    
    bandwidth = np.mean(librosa.feature.spectral_bandwidth(y=data, sr=sr).T, axis=0)
    result = np.hstack((result, bandwidth)) # 1
    
    return result

sr = 22050
duration = 2.5 # arbitrary
data = np.random.uniform(-1, 1, int(sr * duration))

features = get_features(data, sr)
print(f"Total features extracted: {len(features)}")

scaler_path = r"e:\TRIZEN\prepmind_suhi\prepmind\backend\ml\scaler.pkl"
if os.path.exists(scaler_path):
    scaler = joblib.load(scaler_path)
    try:
        scaled = scaler.transform(features.reshape(1, -1))
        print("Transformation successful!")
    except Exception as e:
        print(f"Transformation failed: {e}")
else:
    print("Scaler not found.")
