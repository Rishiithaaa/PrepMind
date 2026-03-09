from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
import uuid
import traceback
import time
import gc
from fastapi.responses import JSONResponse
from detector import detector

app = FastAPI(title="PrepMind ML Service (CNN+LSTM)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMP_DIR = "temp_audio"
os.makedirs(TEMP_DIR, exist_ok=True)

def remove_file_with_retry(path, retries=5, delay=0.2):
    """Attempt to remove a file with retries to handle Windows file locking"""
    for i in range(retries):
        try:
            if os.path.exists(path):
                os.remove(path)
            return True
        except PermissionError:
            if i < retries - 1:
                time.sleep(delay)
                gc.collect() # Force GC to release file handles
            else:
                print(f"Failed to remove {path} after {retries} attempts.")
    return False

@app.get("/")
async def root():
    return {"message": "PrepMind ML Service (CNN+LSTM) is running", "endpoint": "/analyze"}

@app.post("/analyze")
async def analyze_audio(file: UploadFile = File(...)):
    try:
        job_id = str(uuid.uuid4())
        # Save uploaded file temporarily
        temp_path = os.path.join(TEMP_DIR, f"{job_id}.wav")
        
        with open(temp_path, "wb") as f:
            f.write(await file.read())
            
        try:
            # Predict emotion using the CNN+LSTM model
            result = detector.predict(temp_path)
            return result
            
        finally:
            remove_file_with_retry(temp_path)
    except Exception as e:
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"message": str(e)})

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8008)
