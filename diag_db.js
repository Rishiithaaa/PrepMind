const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "backend", ".env") });

const User = require("./backend/models/User");

async function checkDB() {
    try {
        const uri = process.env.MONGODB_URI;
        if (!uri) {
            throw new Error("MONGODB_URI is not defined in backend/.env");
        }
        console.log("Connecting to:", uri.substring(0, 20) + "...");
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log("Connected successfully!");

        const users = await User.find({});
        console.log("Total Users found:", users.length);
        users.forEach(u => {
            console.log(`- ${u.name} (${u.email}) [ID: ${u._id}]`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error("FATAL ERROR:", err.message);
        process.exit(1);
    }
}

checkDB();
