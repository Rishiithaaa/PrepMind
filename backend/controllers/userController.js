const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

console.log("User Controller initialized. JWT_SECRET exists:", !!process.env.JWT_SECRET);
if (process.env.JWT_SECRET) {
    console.log("JWT_SECRET prefix:", process.env.JWT_SECRET.substring(0, 5));
}

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "User already exists" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ token, user: { id: user._id.toString(), name, email } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user._id.toString(), name: user.name, email } });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    console.log("GET /me - Fetching profile for userId:", userId);
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        console.log("GET /me - Invalid ObjectId format:", userId);
        return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
        console.log("GET /me - User not found in DB for id:", userId);
        return res.status(404).json({ message: "User not found" });
    }
    
    console.log("GET /me - User found:", user.name, user.email);
    res.json({ user });
  } catch (err) {
    console.error("GET /me - Server error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { name, email },
      { new: true }
    ).select("-password");
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
