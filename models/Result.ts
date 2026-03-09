import mongoose, { Schema, models } from "mongoose";

const ResultSchema = new Schema(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        mode: { type: String, enum: ["domain", "resume"], required: true },
        context: String, // Domain or Resume Name
        role: String,
        score: Number, // 0-100
        feedback: String,
        answers: [
            {
                question: String,
                answer: String,
                score: Number,
                feedback: String,
            },
        ],
    },
    { timestamps: true }
);

export default models.Result || mongoose.model("Result", ResultSchema);
