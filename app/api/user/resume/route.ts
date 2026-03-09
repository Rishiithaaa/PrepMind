import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import pdf from "pdf-parse";

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

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        let extractedText = "";

        if (file.type === "application/pdf") {
            const data = await pdf(buffer);
            extractedText = data.text;
        } else {
            // Fallback for text files or simple extraction
            extractedText = buffer.toString("utf-8");
        }

        await connectDB();
        const user = await User.findByIdAndUpdate(
            decoded.userId,
            { resume: extractedText },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        return NextResponse.json({
            message: "Resume uploaded and saved successfully",
            resumeText: extractedText
        }, { status: 200 });

    } catch (error: any) {
        console.error("Resume Upload Error:", error);
        return NextResponse.json(
            { message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}
