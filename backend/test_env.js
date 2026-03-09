const dotenv = require("dotenv");
dotenv.config();
console.log("CWD:", process.cwd());
console.log("GROQ_API_KEY exists:", !!process.env.GROQ_API_KEY);
console.log("GROQ_API_KEY value length:", process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.length : 0);
if (process.env.GROQ_API_KEY) {
    console.log("GROQ_API_KEY starts with:", process.env.GROQ_API_KEY.substring(0, 4));
}
