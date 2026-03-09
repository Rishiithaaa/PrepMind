import { NextResponse } from "next/server";

let sessionCache: Record<string, string[]> = {};

export async function POST(req: Request) {
  try {
    const { domain, role, level, resumeText, sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    if (!sessionCache[sessionId]) {
      sessionCache[sessionId] = [];
    }

    // FIRST QUESTION ONLY ONCE
    if (sessionCache[sessionId].length === 0) {
      const firstQ = "Tell me about yourself";
      sessionCache[sessionId].push(firstQ);
      return NextResponse.json({ question: firstQ });
    }

    const previous = sessionCache[sessionId].join("\n");

    const prompt = `
You are a strict professional interviewer.

Candidate:
Domain: ${domain}
Role: ${role}
Level: ${level}
Resume: ${resumeText || "Not provided"}

Previous questions:
${previous}

IMPORTANT RULES:
- Generate ONE completely NEW interview question.
- NEVER repeat previous questions.
- DO NOT explain anything.
- DO NOT greet.
- Make it realistic for the role.
- Ask only the question.

Question:
`;

    const ollamaRes = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt,
        stream: false,
        options: {
          temperature: 0.9,
          top_p: 0.95,
        },
      }),
    });

    const data = await ollamaRes.json();

    let question = data.response?.trim() || "";

    // clean extra text
    question = question.split("\n")[0].trim();

    // Prevent repeats WITHOUT fallback question
    if (!question || sessionCache[sessionId].includes(question)) {
      question = `What technologies do you prefer working with and why? ${Date.now()}`;
    }

    sessionCache[sessionId].push(question);

    return NextResponse.json({ question });
  } catch (err) {
    console.error("OLLAMA ERROR:", err);
    return NextResponse.json({
      question: `Tell me about a recent technical challenge. ${Date.now()}`,
    });
  }
}
