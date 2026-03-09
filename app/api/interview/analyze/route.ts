import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Result from "@/models/Result";
import { analyzeInterview } from "@/backend/groq";

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const decoded = verifyToken(token);
        if (!decoded || !decoded.userId) {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }

        const { answers, mode, context, role } = await req.json();

        if (!answers || !Array.isArray(answers) || answers.length === 0) {
            return NextResponse.json({ message: "No answers to analyze" }, { status: 400 });
        }

        // 1. Analyze with AI
        const analysis = await analyzeInterview(answers);

        // 2. Save to MongoDB
        await connectDB();
        const newResult = await Result.create({
            userId: decoded.userId,
            mode,
            context,
            role,
            score: analysis.totalScore,
            feedback: analysis.summary,
            answers: analysis.detailedAnalysis.map((item: any, index: number) => ({
                question: item.question,
                answer: answers[index]?.answer || "",
                score: item.score,
                feedback: item.feedback,
            })),
        });

        return NextResponse.json({
            message: "Analysis complete",
            resultId: newResult._id,
            analysis
        }, { status: 200 });

    } catch (error: any) {
        console.error("Analysis API Error:", error);
        return NextResponse.json(
            { message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}
