import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Result from "@/models/Result";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        await connectDB();
        const result = await Result.findById(id);

        if (!result) {
            return NextResponse.json({ message: "Result not found" }, { status: 404 });
        }

        return NextResponse.json({ result }, { status: 200 });
    } catch (error: any) {
        console.error("Fetch Result Error:", error);
        return NextResponse.json(
            { message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}
