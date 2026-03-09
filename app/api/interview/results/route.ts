import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import Result from "@/models/Result";

export async function GET() {
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

        await connectDB();
        const results = await Result.find({ userId: decoded.userId }).sort({ createdAt: -1 });

        return NextResponse.json({ results }, { status: 200 });
    } catch (error: any) {
        console.error("Fetch All Results Error:", error);
        return NextResponse.json(
            { message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}
