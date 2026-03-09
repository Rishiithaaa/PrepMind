import os
import numpy as np
import librosa
import joblib
import logging
import gc
import tensorflow as tf
from tensorflow.keras.models import load_model, Sequential
from tensorflow.keras.layers import Conv1D, MaxPooling1D, BatchNormalization, Dropout, LSTM, Dense

logger = logging.getLogger(__name__)

class EmotionDetector:
    FIXED_LENGTH = 5120
    EMOTIONS = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']

    def __init__(self, model_path="model.h5", scaler_path="scaler.pkl", encoder_path="encoder.pkl"):
        base_path = os.path.dirname(os.path.abspath(__file__))
        self.model_path = os.path.join(base_path, model_path)
        self.scaler_path = os.path.join(base_path, scaler_path)
        self.encoder_path = os.path.join(base_path, encoder_path)
        
        self.model = None
        self.scaler = None
        self.encoder = None

    def _build_model(self):
        """Build architecture to load weights into if direct load fails"""
        model = Sequential()
        model.add(Conv1D(1024, kernel_size=5, strides=1, padding='same', activation='relu', input_shape=(165, 1)))
        model.add(MaxPooling1D(pool_size=2, strides=2, padding='same'))
        model.add(BatchNormalization())
        model.add(Dropout(0.3))
        
        model.add(Conv1D(512, kernel_size=5, strides=1, padding='same', activation='relu'))
        model.add(MaxPooling1D(pool_size=2, strides=2, padding='same'))
        model.add(BatchNormalization())
        model.add(Dropout(0.3))
        
        model.add(Conv1D(256, kernel_size=5, strides=1, padding='same', activation='relu'))
        model.add(MaxPooling1D(pool_size=2, strides=2, padding='same'))
        model.add(BatchNormalization())
        model.add(Dropout(0.3))
        
        model.add(LSTM(128, return_sequences=True))
        model.add(Dropout(0.3))
        model.add(LSTM(128, return_sequences=True))
        model.add(Dropout(0.3))
        model.add(LSTM(128))
        model.add(Dropout(0.3))
        
        model.add(Dense(128, activation='relu'))
        model.add(Dense(64, activation='relu'))
        model.add(Dense(32, activation='relu'))
        model.add(Dense(7, activation='softmax'))
        return model

    def load_artifacts(self):
        if self.model is None:
            logger.info(f"Loading custom TensorFlow model from {self.model_path}")
            try:
                # First try building and loading weights
                self.model = self._build_model()
                self.model.load_weights(self.model_path)
            except Exception as e:
                logger.warning(f"Failed to load weights: {e}. Attempting full model load.")
                self.model = load_model(self.model_path, compile=False)
            
        if self.scaler is None:
            self.scaler = joblib.load(self.scaler_path)
        
        if self.encoder is None and os.path.exists(self.encoder_path):
            self.encoder = joblib.load(self.encoder_path)

    def extract_features(self, data, sr):
        """
        Extract features matching the training logic (Total: 165 features):
        ZCR (1), Chroma (12), MFCC (20), RMS (1), Mel (128), Spectral Centroid (1), Spectral Rolloff (1), Spectral Bandwidth (1)
        """
        result = np.array([])
        
        # 1. ZCR (1)
        zcr = np.mean(librosa.feature.zero_crossing_rate(y=data).T, axis=0)
        result = np.hstack((result, zcr)) 
        
        # 2. Chroma (12)
        stft = np.abs(librosa.stft(data))
        chroma_stft = np.mean(librosa.feature.chroma_stft(S=stft, sr=sr).T, axis=0)
        result = np.hstack((result, chroma_stft)) 
        
        # 3. MFCC (20)
        mfcc = np.mean(librosa.feature.mfcc(y=data, sr=sr, n_mfcc=20).T, axis=0)
        result = np.hstack((result, mfcc)) 
        
        # 4. RMS (1)
        rms = np.mean(librosa.feature.rms(y=data).T, axis=0)
        result = np.hstack((result, rms)) 
        
        # 5. Mel (128)
        mel = np.mean(librosa.feature.melspectrogram(y=data, sr=sr).T, axis=0)
        result = np.hstack((result, mel)) 
        
        # 6. Spectral Centroid (1)
        centroid = np.mean(librosa.feature.spectral_centroid(y=data, sr=sr).T, axis=0)
        result = np.hstack((result, centroid)) 
        
        # 7. Spectral Rolloff (1)
        rolloff = np.mean(librosa.feature.spectral_rolloff(y=data, sr=sr).T, axis=0)
        result = np.hstack((result, rolloff)) 
        
        # 8. Spectral Bandwidth (1)
        bandwidth = np.mean(librosa.feature.spectral_bandwidth(y=data, sr=sr).T, axis=0)
        result = np.hstack((result, bandwidth)) 
        
        return result

    def predict(self, file_path):
        self.load_artifacts()
        
        # Load audio at sr=22050
        data, sr = librosa.load(file_path, sr=22050)
        
        # Defensive release for Windows file locking
        del data
        gc.collect() 
        
        # Reload for actual use (librosa.load doesn't always close handles immediately)
        # but the second load often uses the OS cache and is safer once GC has run on the first handle
        data, sr = librosa.load(file_path, sr=22050)
        
        # 0. Silence Check: If the audio is extremely quiet, return silence
        # Peak amplitude threshold and average RMS threshold for better reliability
        peak_amplitude = np.max(np.abs(data)) if len(data) > 0 else 0
        rms_energy = np.sqrt(np.mean(np.square(data))) if len(data) > 0 else 0
        
        with open("ml_debug.log", "a") as f:
            f.write(f"Audio check for {file_path}: Peak={peak_amplitude:.4f}, RMS={rms_energy:.4f}\n")
        
        # Thresholds: Peak < 0.05 OR RMS < 0.012 are considered silence
        # (Based on calibration showing that RMS 0.008 can still trigger 'Sad' bias)
        if len(data) == 0 or peak_amplitude < 0.05 or rms_energy < 0.012:
            logger.info(f"Silence detected for {file_path}")
            return {
                "emotion": "silence",
                "confidence": 1.0
            }

        # For the model, we extract features for the whole file and treat it as one segment
        # If the audio is very long, we could chunk it, but the model expects mean features
        features = self.extract_features(data, sr)
        
        # Format for scaler: shape (1, 165)
        features_2d = features.reshape(1, -1)
        
        if self.scaler:
            features_2d = self.scaler.transform(features_2d)
            
        # Reshape for model: (1, 165, 1)
        features_3d = features_2d.reshape(1, 165, 1)
        
        predictions = self.model.predict(features_3d, verbose=0)
        
        idx = np.argmax(predictions[0])
        emotion = self.EMOTIONS[idx]
        confidence = float(predictions[0][idx])
        
        logger.info(f"Prediction for {file_path}: {emotion} ({confidence:.2f})")
        with open("ml_debug.log", "a") as f:
            f.write(f"Prediction for {file_path}: {emotion} ({confidence:.2f})\n")
        
        return {
            "emotion": emotion.lower(),
            "confidence": float(np.round(confidence, 2))
        }

detector = EmotionDetector()
