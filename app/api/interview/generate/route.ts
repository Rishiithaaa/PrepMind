import { NextResponse } from "next/server";
import { generateInterviewQuestions } from "@/backend/groq";

export async function POST(req: Request) {
    try {
        const { context, type } = await req.json();

        if (!context || !type) {
            return NextResponse.json(
                { message: "Context and type are required" },
                { status: 400 }
            );
        }

        if (type !== "domain" && type !== "resume") {
            return NextResponse.json(
                { message: "Invalid type. Must be 'domain' or 'resume'" },
                { status: 400 }
            );
        }

        const questions = await generateInterviewQuestions(context, type);

        return NextResponse.json({ questions }, { status: 200 });
    } catch (error: any) {
        console.error("API Interview Generate Error:", error);
        return NextResponse.json(
            { message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}
