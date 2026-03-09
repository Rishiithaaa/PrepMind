import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    resume: String, // 👈 resume file path
  },
  { timestamps: true }
);

export default models.User || mongoose.model("User", UserSchema);
