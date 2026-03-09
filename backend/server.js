const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
console.log("Environment Variables Loaded. GROQ_API_KEY exists:", !!process.env.GROQ_API_KEY);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request Logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
const userRoutes = require("./routes/userRoutes");
const interviewRoutes = require("./routes/interviewRoutes");

console.log("Mounting User Routes...");
app.use("/api/users", userRoutes);
console.log("Mounting Interview Routes...");
app.use("/api/interview", interviewRoutes);

// Basic route
app.get("/", (req, res) => {
  res.send("PrepMind API is running...");
});

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB Atlas",mongoose.connection.name );
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`API reachable at http://localhost:${PORT}/api`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });
