# PrepMind – AI Powered Interview Simulator

PrepMind is an AI-powered interactive interview preparation platform designed to simulate real-world technical and behavioral interviews. It helps job seekers and students practice interviews, receive instant feedback, and improve both technical knowledge and communication confidence.

The platform uses Generative AI to generate domain-specific interview questions and evaluate responses. It also performs Speech Emotion Recognition (SER) on voice responses to assess behavioral traits such as confidence, stress, and calmness.

By combining AI-driven technical evaluation with behavioral analysis and personalized learning resources, PrepMind offers a comprehensive system for interview preparation.

---

# Features

## AI Generated Interview Questions
Dynamic role-specific questions generated using **Llama-3 via Groq** to simulate real interview environments.

## AI Response Evaluation
Evaluates candidate responses for:
- Technical accuracy
- Clarity of explanation
- Depth of knowledge
- Communication effectiveness

## Speech Emotion Recognition (SER)
Analyzes voice responses to detect behavioral signals such as:
- Confidence
- Nervousness
- Stress
- Calmness

The system uses a **CNN + LSTM architecture** trained on acoustic features extracted from speech.

## Multimodal Analysis
Combines:
- Natural Language Processing
- Speech Emotion Recognition
- AI feedback generation

for a complete candidate evaluation.

## Interactive Dashboard
Users can review their performance through an intuitive results dashboard with detailed feedback and insights.

## Mastery Bridges (Learning Recommendations)
Automatically recommends resources for improvement:
- Wikipedia articles for technical concepts
- YouTube videos for communication and interview skills

---

# System Architecture

PrepMind follows a **service-oriented architecture** with three major components:

### Frontend
Built using **Next.js** to provide a responsive and interactive UI for interview simulation and performance analysis.

### Backend
Built with **Node.js and Express** to handle:
- API routing
- AI integration
- session management
- data storage

### Machine Learning Microservice
Built using **FastAPI** for Speech Emotion Recognition using a **CNN + LSTM model**.

### Database
**MongoDB** is used to store:
- interview sessions
- responses
- evaluation results
- user progress data

---

# Tech Stack

## Frontend
- Next.js
- React
- Tailwind CSS

## Backend
- Node.js
- Express.js

## Machine Learning
- Python
- FastAPI
- CNN + LSTM
- Librosa
- Scikit-learn
- TensorFlow / PyTorch

## AI Integration
- Groq API
- Llama-3

## Database
- MongoDB

---

# Project Structure
PrepMind
│
├── frontend # Next.js frontend
│
├── backend # Node.js backend
│ ├── ml # ML microservice
│ │ ├── app.py
│ │ ├── model
│ │ └── requirements.txt
│ │
│ ├── routes
│ ├── controllers
│ └── server.js
│
└── README.md


---

# Prerequisites

Make sure the following are installed:

**Node.js**  
Version: v20.17.0

**Python**  
Version: 3.10

**MongoDB**  
Running locally or through a cloud connection.

---

# Installation and Setup

## Clone the repository

git clone https://github.com/Rishiithaaa/PrepMind.git

cd PrepMind


---

# Step 1: Start the Backend

Open **Terminal 1**


cd backend
npm install
npm run dev


Backend runs at:


http://localhost:5000


---

# Step 2: Start the Frontend

Open **Terminal 2**


npm install
npm run dev


Frontend runs at:


http://localhost:3000


---

# Step 3: Start the Machine Learning Service

Open **Terminal 3**


cd backend/ml
py -3.10 -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py


FastAPI ML service runs at:


http://localhost:8008


API documentation:


http://localhost:8008/docs


---

# Application URLs

**Frontend**

http://localhost:3000


**Backend**

http://localhost:5000


**ML API**

http://localhost:8008


**ML API Docs**

http://localhost:8008/docs


---

# Workflow

1. User selects interview domain.
2. AI generates role-specific interview questions.
3. User answers through voice input.
4. Speech Emotion Recognition analyzes voice signals.
5. AI evaluates technical response quality.
6. System generates feedback and scores.
7. Mastery Bridges recommend learning resources.

---

# Research Concepts Used

- Generative AI
- Natural Language Processing
- Speech Emotion Recognition
- Deep Learning (CNN + LSTM)
- Multimodal AI Analysis
- Real-time AI Feedback Systems

---

# Keywords

Artificial Intelligence  
Interview Preparation System  
Generative AI  
Speech Emotion Recognition (SER)  
CNN-LSTM  
Natural Language Processing  
Technical Assessment  
Behavioral Analysis  
Next.js  
Node.js  
FastAPI  
Groq Llama-3

---

# Future Improvements

- Real-time video interview simulation
- Facial expression analysis
- AI interviewer avatars
- Performance analytics over multiple sessions
- Resume-based question generation
- Multi-language interview support

---

# Author

**Rishiithaaa**

---

# License

This project is intended for educational and research purposes.
