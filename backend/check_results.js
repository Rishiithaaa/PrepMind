const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const Result = require("./models/Result");

async function checkResults() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error("MONGODB_URI is not defined in .env");
        }
        console.log("Connecting to:", uri.substring(0, 20) + "...");
        await mongoose.connect(uri);
        console.log("Connected successfully!");

        const results = await Result.find({}).sort({ createdAt: -1 }).limit(5);
        console.log("Total Results found:", await Result.countDocuments());
        results.forEach((r, i) => {
            console.log(`${i + 1}. Result ID: ${r._id}, User: ${r.userId}, Score: ${r.score}, Created: ${r.createdAt}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error("FATAL ERROR:", err.message);
        process.exit(1);
    }
}

checkResults();
