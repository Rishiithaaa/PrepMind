const Groq = require("groq-sdk");
const dotenv = require("dotenv");

dotenv.config();

const getGroq = () => {
    if (!process.env.GROQ_API_KEY) {
        console.warn("GROQ_API_KEY is missing from environment variables.");
    }
    return new Groq({
        apiKey: process.env.GROQ_API_KEY || "missing_key",
    });
};

const groq = getGroq();

/**
 * Generate interview questions based on domain, role, or resume content.
 */
exports.generateInterviewQuestions = async (context, type, role = "", level = "Medium") => {
    const prompt = type === "domain"
        ? `You are an expert interviewer. Generate EXACTLY 5 highly relevant technical interview questions for the role of "${role}" within the "${context}" domain. 
           The questions should be at a "${level}" difficulty level. 
           You must return EXACTLY 5 questions as a JSON array of strings.`
        : `You are an expert interviewer. Analyze the following resume content and generate EXACTLY 5 personalized technical and behavioral interview questions for the candidate who is applying for the role of "${role}". Use their experience to tailor the questions: ${context}. You must return EXACTLY 5 questions as a JSON array of strings.`;

    console.log(`Generating questions for ${type} mode. Role involved: ${role || context}`);

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that outputs JSON. Always return a JSON object with a 'questions' key containing an array of EXACTLY 5 strings.",
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
};

/**
 * Analyze an interview transcript and provide feedback.
 */
exports.analyzeInterview = async (answers) => {
    const prompt = `
    Analyze the following interview transcript. 
    Compare each candidate's answer to the technical concepts, depth, and clarity expected for that specific question.
    
    Evaluation Criteria:
    1. Semantic Alignment: Does the answer address the core intent of the question?
    2. Technical Accuracy: Are the key concepts explained correctly?
    3. Gaps Identification: Specifically identify WHERE the candidate lacks knowledge for each question.

    Transcript:
    ${JSON.stringify(answers, null, 2)}
    
    Instructions for Recommendations (EXISTS & SOURCE VERIFIED):
    1. Based ONLY on the gaps identified in this specific interview, suggest 3-4 HIGH-QUALITY learning resources.
    2. Suggest technical resources from WIKIPEDIA only for concepts they struggled with. 
       Format: https://en.wikipedia.org/wiki/Exact_Topic_Name (Use standard Wikipedia URL structure).
    3. Suggest practical/behavioral resources from YOUTUBE for delivery gaps. 
       Format: https://www.youtube.com/results?search_query=specific+topic+tutorial (Prefer search queries for 100% link reliability).
    4. DO NOT hallucinate URLs. Use only the formats above. 
    5. Each recommendation must clearly state WHY it is being recommended based on a specific "lack" in their response.

    Return as a JSON object with:
    {
      "totalScore": number (0-100),
      "summary": "Holistic performance overview focusing strictly on technical strengths and specific knowledge gaps. IMPORTANT: Do not mention any behavioral, confidence, or emotional data (like 'sad', 'confident', etc.) in this summary.",
      "detailedAnalysis": [
        { 
          "question": "string", 
          "score": number, 
          "feedback": "Specific analysis of where the candidate succeeded and exactly where they lacked in technical content. Do not mention emotions or behavior." 
        }
      ],
      "recommendations": [
        {
          "title": "Specific Topic to Master (e.g., Closures in JS)",
          "url": "Direct and Correct URL (Wav or YT Search)",
          "type": "wikipedia" | "youtube",
          "reason_for_recommendation": "Explain exactly which gap from the interview this resource addresses. Focus on technical or delivery gaps without referencing detected emotions."
        }
      ]
    }
  `;

    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an expert technical recruiter. Be honest, professional, and clear. Focus strictly on technical accuracy and knowledge gaps. Ignore any behavioral or emotional cues provided in the transcript data. Format output as JSON strictly.",
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
};
