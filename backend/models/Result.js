const mongoose = require("mongoose");
const { Schema } = mongoose;

const ResultSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        mode: { type: String, enum: ["domain", "resume"], required: true },
        context: String, // Domain or Resume Name
        role: String,
        score: Number, // 0-100 (Technical/Overall)
        feedback: String,
        behavioralAnalysis: {
            emotionCounts: { type: Map, of: Number },
            confidenceScore: Number,
            nervousScore: Number,
            aggressionScore: Number,
            technicalScore: Number, // 👈 Added for transparency
        },
        recommendations: [
            {
                title: String,
                url: String,
                type: { type: String, enum: ["wikipedia", "youtube", "other"], default: "other" },
                reason_for_recommendation: String // 👈 Added for clarity
            }
        ],
        answers: [
            {
                question: String,
                answer: String,
                score: Number,
                feedback: String,
                emotion: String, // Emotion for this specific answer
            },
        ],
    },
    { timestamps: true }
);

module.exports = mongoose.models.Result || mongoose.model("Result", ResultSchema);
