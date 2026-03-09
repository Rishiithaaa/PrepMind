const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Result = require("./models/Result");
const User = require("./models/User");

dotenv.config();

async function runTest() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to DB");

        const user = await User.findOne({});
        if (!user) throw new Error("No user found for testing");

        const mockAnswers = [
            { question: "What is React?", answer: "A JS library for UI.", emotion: "happy" },
            { question: "What is Node?", answer: "A JS runtime.", emotion: "neutral" }
        ];

        // We simulate what the route does internally or just check what was saved recently
        // But better is to just check the Result model creation
        const technicalScore = 80;
        const confidenceScore = 100;
        const weightedScore = (technicalScore * 0.7) + (confidenceScore * 0.3);

        const newResult = await Result.create({
            userId: user._id,
            mode: "domain",
            context: "Web Dev",
            role: "Frontend Engineer",
            score: Math.round(weightedScore),
            feedback: "Good job",
            behavioralAnalysis: {
                emotionCounts: { happy: 1, neutral: 1 },
                confidenceScore: 100,
                technicalScore: 80
            },
            recommendations: [{ title: "React Docs", url: "https://react.dev", type: "other", reason_for_recommendation: "Learn more" }],
            answers: mockAnswers.map(a => ({ ...a, score: 80, feedback: "Correct" }))
        });

        console.log("Successfully created test result:", newResult._id);

        const fetched = await Result.findById(newResult._id);
        console.log("Fetched Result behavioralAnalysis:", JSON.stringify(fetched.behavioralAnalysis, null, 2));

        await mongoose.disconnect();
    } catch (err) {
        console.error("Test failed:", err);
        process.exit(1);
    }
}

runTest();
