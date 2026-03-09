const express = require("express");
const router = express.Router();
const aiController = require("../controllers/aiController");
const Result = require("../models/Result");
const auth = require("../middlewares/auth");
const upload = require("../middlewares/upload");

router.post("/generate", auth, async (req, res) => {
    try {
        let { context, type, role, level } = req.body;
        level = level || "Medium";

        // If it's a resume-based interview, fetch the saved resume text from the user profile
        if (type === "resume") {
            const User = require("../models/User");
            const user = await User.findById(req.user.userId);
            if (user && user.resumeText) {
                console.log("Using extracted resume text for question generation.");
                context = user.resumeText; // Use the text field, not the path field
            } else {
                console.warn("Resume mode selected but no resume text found for user. Falling back to role-based generation.");
            }
        }

        const questions = await aiController.generateInterviewQuestions(context, type, role, level);
        res.json({ questions });
    } catch (err) {
        console.error("Generate questions error:", err);
        res.status(500).json({ message: err.message });
    }
});

// Phase 6: Behaviour Mapping Layer
const behaviorMapping = {
    "angry": "Aggressive",
    "fear": "Nervous",
    "happy": "Confident",
    "neutral": "Calm",
    "sad": "Calm/Modest Energy",
    "disgust": "Negative Tone",
    "surprise": "Reactive",
    "silence": "No Response Detected"
};

router.post("/analyze-emotion", auth, upload.single("audio"), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No audio file uploaded" });
        const fs = require("fs");
        const fileBuffer = fs.readFileSync(req.file.path);

        const formData = new FormData();
        const blob = new Blob([fileBuffer], { type: req.file.mimetype });
        formData.append("file", blob, req.file.originalname);

        const response = await fetch("http://localhost:8008/analyze", {
            method: "POST",
            body: formData
        });

        if (!response.ok) throw new Error("ML Service Error");
        const data = await response.json();
        console.log("ML Service Prediction Result:", data);
        res.json(data);
    } catch (err) {
        console.error("Emotion analysis proxy error:", err);
        res.status(500).json({ message: err.message });
    }
});

router.post("/analyze", auth, async (req, res) => {
    try {
        const { answers, mode, context, role } = req.body;
        console.log(`Received analysis request for User: ${req.user.userId}, Answers count: ${answers?.length}`);

        // Ensure empty answers have a default message, but use ML-detected emotion
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ message: "Invalid answers format" });
        }

        answers.forEach(ans => {
            if (!ans.answer || ans.answer.trim() === "") {
                ans.answer = "No response recorded.";
            }
        });

        const analysis = await aiController.analyzeInterview(answers);
        console.log("AI Analysis Result Summary:", analysis.summary);

        // Phase 7: Full Interview Behaviour Scoring (requested formulas)
        const emotionCounts = {};
        let totalSpeechSamples = 0;

        answers.forEach(ans => {
            // 🛑 BUG FIX: If no text was recorded AND ML detected 'sad' (biased default) or 'silence',
            // ensure it is treated as silence so it doesn't give 40% confidence.
            const isNoText = !ans.answer || ans.answer === "No response recorded." || ans.answer.trim() === "";
            const emotionVal = (ans.emotion || "").toLowerCase();

            if (isNoText && (emotionVal === "sad" || emotionVal === "silence")) {
                ans.emotion = "silence";
            }

            if (ans.emotion && ans.emotion.toLowerCase() !== "silence" && ans.emotion.toLowerCase() !== "none" && ans.emotion.toLowerCase() !== "processing...") {
                const emotion = ans.emotion.toLowerCase();
                emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
                totalSpeechSamples++;
            }
        });

        const happy = emotionCounts["happy"] || 0;
        const neutral = emotionCounts["neutral"] || 0;
        const fear = emotionCounts["fear"] || 0;
        const angry = emotionCounts["angry"] || 0;
        const sad = emotionCounts["sad"] || 0;

        // Formula: Happy and Neutral are 100% confidence. 
        // Sad is treated as 'Calm/Modest Energy' and contributes 70%.
        const confidenceScore = totalSpeechSamples > 0
            ? (happy + neutral + (sad * 0.7)) / totalSpeechSamples * 100
            : 0;

        const nervousScore = totalSpeechSamples > 0
            ? fear / totalSpeechSamples * 100
            : 0;

        const aggressionScore = totalSpeechSamples > 0
            ? angry / totalSpeechSamples * 100
            : 0;

        // Phase 8: Combined Final Scoring
        // Weighting: 100% technical (AI assessment)
        // We no longer apply behavioral penalties or weightings to the technical score per user request.
        const technicalScore = analysis.totalScore || 0;
        const finalOverallScore = Math.max(0, Math.min(100, Math.round(technicalScore || 0)));

        const newResultData = {
            userId: req.user.userId,
            mode,
            context,
            role,
            score: finalOverallScore,
            feedback: analysis.summary,
            behavioralAnalysis: {
                emotionCounts,
                confidenceScore: Math.round(confidenceScore) || 0,
                nervousScore: Math.round(nervousScore) || 0,
                aggressionScore: Math.round(aggressionScore) || 0,
                technicalScore: technicalScore
            },
            recommendations: (analysis.recommendations || []).map(rec => ({
                title: rec.title || "Topic",
                url: rec.url || "#",
                type: rec.type || "other",
                reason_for_recommendation: rec.reason_for_recommendation || ""
            })),
            answers: (analysis.detailedAnalysis || []).map((item, index) => ({
                question: item.question || (answers[index]?.question || ""),
                answer: answers[index]?.answer || "",
                score: item.score || 0,
                feedback: item.feedback || "",
                emotion: answers[index]?.emotion || "neutral",
            })),
        };

        const newResult = await Result.create(newResultData);
        console.log("Successfully saved interview result:", newResult._id);

        res.status(201).json({
            message: "Analysis complete",
            resultId: newResult._id,
            analysis
        });
    } catch (err) {
        console.error("Critical Analysis/Save Error:", err);
        res.status(500).json({ message: err.message });
    }
});

router.get("/results", auth, async (req, res) => {
    try {
        const results = await Result.find({ userId: req.user.userId }).sort({ createdAt: -1 });
        res.json({ results });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/results/:id", auth, async (req, res) => {
    try {
        const result = await Result.findOne({ _id: req.params.id, userId: req.user.userId });
        if (!result) return res.status(404).json({ message: "Result not found" });
        res.json({ result });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
