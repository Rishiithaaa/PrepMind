import Groq from "groq-sdk";
const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

/**
 * Generate interview questions based on domain, role, or resume content.
 * @param context The context for question generation (e.g., "Frontend Developer", "RESUME_TEXT:...")
 * @param type "domain" or "resume"
 * @returns An array of string questions.
 */
export async function generateInterviewQuestions(context: string, type: "domain" | "resume") {
    const prompt = type === "domain"
        ? `You are an expert interviewer. Generate 5 highly relevant technical interview questions for the role of: ${context}. Return the questions as a JSON array of strings.`
        : `You are an expert interviewer. Analyze the following resume content and generate 5 personalized technical and behavioral interview questions based on their experience: ${context}. Return the questions as a JSON array of strings.`;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that outputs JSON. Always return a JSON object with a 'questions' key containing an array of strings.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
        });

        const response = JSON.parse(chatCompletion.choices[0].message.content || '{"questions": []}');
        return response.questions;
    } catch (error) {
        console.error("Groq AI Error:", error);
        throw new Error("Failed to generate questions via Groq AI");
    }
}

/**
 * Analyze an interview transcript and provide feedback.
 * @param answers List of { question, answer }
 * @returns Structured feedback and score.
 */
export async function analyzeInterview(answers: { question: string, answer: string }[]) {
    const prompt = `
    Analyze the following interview transcript. Provide a total score (0-100) and brief feedback for each answer, plus an overall summary.
    Transcript:
    ${JSON.stringify(answers, null, 2)}
    
    Return as a JSON object with:
    {
      "totalScore": number,
      "summary": "string",
      "detailedAnalysis": [
        { "question": "string", "score": number, "feedback": "string" }
      ]
    }
  `;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an expert technical recruiter. Be honest, professional, and clear. Format output as JSON strictly.",
                },
                {
                    role: "user",
                    content: prompt,
                },
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" },
        });

        return JSON.parse(chatCompletion.choices[0].message.content || "{}");
    } catch (error) {
        console.error("Groq Analysis Error:", error);
        throw new Error("Failed to analyze interview");
    }
}
