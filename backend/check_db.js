const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

async function checkDB() {
    try {
        console.log("Connecting to:", process.env.MONGODB_URI.substring(0, 30) + "...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected successfully!");

        const users = await User.find({});
        console.log("Total Users found:", users.length);
        users.forEach(u => {
            console.log(`- Name: "${u.name}", Email: "${u.email}", ID: ${u._id}`);
        });

        await mongoose.disconnect();
    } catch (err) {
        console.error("FATAL ERROR:", err.message);
    }
}

checkDB();
