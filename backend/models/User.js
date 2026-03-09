const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    resume: String, // Path to the uploaded file (e.g., /uploads/resume.pdf)
    resumeText: String, // Extracted plain text for AI
  },
  { timestamps: true }
);

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
