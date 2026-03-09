
import joblib
import tensorflow as tf
import os

base_path = r"e:\TRIZEN\prepmind_suhi\prepmind\backend\ml"
model_path = os.path.join(base_path, "model.h5")
scaler_path = os.path.join(base_path, "scaler.pkl")
encoder_path = os.path.join(base_path, "encoder.pkl")

print("--- Results ---")
try:
    model = tf.keras.models.load_model(model_path)
    print(f"MODEL_INPUT_SHAPE: {model.input_shape}")
    
    scaler = joblib.load(scaler_path)
    num_features = len(scaler.mean_)
    print(f"SCALER_FEATURES: {num_features}")

    encoder = joblib.load(encoder_path)
    classes = encoder.categories_[0].tolist()
    print(f"ENCODER_CLASSES: {classes}")
except Exception as e:
    print(f"ERROR: {e}")
