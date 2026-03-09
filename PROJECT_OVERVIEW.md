# PrepMind: AI-Powered Interview Preparation Platform

PrepMind is a cutting-edge web application designed to help users prepare for job interviews using Generative AI and Behavioral Analysis. The platform generates realistic interview questions, analyzes responses for technical correctness, and uses machine learning to detect emotional cues from the user's voice.

## 🏗️ Architecture Overview

The project is built using a modern separation-of-concerns architecture:

- **Frontend**: A highly interactive Next.js application.
- **Backend (Node.js)**: Orchestrates business logic, user management, and AI interactions.
- **ML Service (Python)**: A specialized microservice dedicated to real-time audio emotion analysis.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Vanilla CSS + Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Authentication**: JWT (Stateless)

### Backend
- **Runtime**: Node.js (Express)
- **Database**: MongoDB (Mongoose)
- **AI Processing**: Groq Cloud API (Llama-3 models) for technical assessment.
- **Storage**: Local filesystem (Multer) for temporary audio processing.

### Machine Learning Service
- **Framework**: FastAPI (Python)
- **Audio Processing**: Librosa (Feature extraction: MFCC, Mel-spectrogram, Chroma)
- **Model**: Custom CNN + LSTM architecture trained for Speech Emotion Recognition (SER).
- **Environment**: TensorFlow / Keras

---

## 🚀 Key Features

### 1. Dynamic Interview Generation
Users can choose between:
- **Domain-Based**: Interviews focused on specific roles (e.g., Software Engineer, Marketing Manager).
- **Resume-Based**: Custom questions tailored to the user's uploaded experience.

### 2. Behavioral Emotion Analysis
While the user answers, the system records audio and segments it for analysis. Our ML model detects:
- **Positive**: Happy, Neutral (High Confidence)
- **Low Energy**: Sad (Calculated as 40% Confidence)
- **Stress Signals**: Fear (Nervousness), Angry (Aggression)

### 3. Integrated Scoring System
The final score is a hybrid calculation:
- **Technical Score (70%)**: Evaluated by AI based on response accuracy and quality.
- **Behavioral Score (30%)**: Derived from detected confidence and tone.
- **Deductions**: Automatic penalties for excessive nervousness or aggressive tones.

### 4. Advanced Results Dashboard
- Detailed feedback for every answer.
- Personalized learning recommendations (Wikipedia/YouTube links).
- Interview history with trend tracking.

---

## 📊 Scoring Formula

The system uses a weighted formula to provide a realistic interview result:

```text
Final Score = (Technical_AI_Score * 0.70) + (Confidence_Score * 0.30)
```

- **Confidence Score**: `(Happy + Neutral + [Sad * 0.4]) / Total_Samples`
- **Skipped Questions**: If a question has no recorded response (unanswered), it is excluded from the `Total_Samples`. This ensures that skipping a question does not unfairly lower the behavioral average, though it will receive a 0 from the technical AI evaluation.
- **Nervousness Penalty**: Deductions applied if `fear > 50%`.
- **Aggression Penalty**: Deductions applied if `angry > 20%`.

---

## 📂 Project Structure

```text
prepmind/
├── app/               # Next.js Frontend (Pages & Components)
├── backend/           # Node.js API Service
│   ├── controllers/   # AI and Logic controllers
│   ├── models/        # MongoDB Schemas
│   ├── routes/        # API Endpoints (Interview, Auth, Results)
│   └── ml/            # Python ML Service
│       ├── app.py     # FastAPI Server
│       └── detector.py # Emotion Analysis Logic
└── public/            # Static Assets
```

---

## ⚙️ Setup & Installation

1. **Frontend**: `npm install` -> `npm run dev` (Port 3000)
2. **Backend**: `cd backend` -> `npm install` -> `npm run dev` (Port 5000)
3. **ML Service**: `cd backend/ml` -> `python app.py` (Port 8008)

---

Developed with ❤️ for Advanced Career Preparation.
