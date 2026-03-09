const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middlewares/auth");
const upload = require("../middlewares/upload");
const pdfParse = require("pdf-parse");
const User = require("../models/User");
const fs = require('fs');
const path = require("path");

const uploadDir = path.join(__dirname, "../../public/uploads");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/me", auth, userController.getProfile);
router.put("/me", auth, userController.updateProfile);

router.post("/resume", auth, upload.single("file"), async (req, res) => {
  try {
    console.log("POST /resume - Received file upload request");

    if (!req.file) {
      console.log("POST /resume - No file provided");
      return res.status(400).json({ message: "No file uploaded" });
    }

    if (req.file) {
      console.log("POST /resume - File received:", req.file.originalname, req.file.mimetype);
      console.log("POST /resume - Absolute disk path:", path.resolve(req.file.path));
    }

    // Defensive check for pdfParse
    const parseFunction = pdfParse;
    console.log("POST /resume - Type of parseFunction:", typeof parseFunction);

    if (typeof parseFunction !== 'function') {
      throw new Error("pdf-parse is not a function after import. Type: " + typeof parseFunction);
    }

    let extractedText = "";
    if (req.file.mimetype === "application/pdf") {
      console.log("POST /resume - Parsing PDF from disk...", req.file.path);
      try {
        const fileBuffer = fs.readFileSync(req.file.path);
        const data = await parseFunction(fileBuffer);
        extractedText = data.text;
      } catch (pdfErr) {
        console.error("POST /resume - PDF Parse Error details:", pdfErr);
        throw pdfErr;
      }
    } else {
      console.log("POST /resume - Reading text from disk...");
      extractedText = fs.readFileSync(req.file.path, "utf-8");
    }

    // MANUAL BACKUP: Explicitly write to the public/uploads folder as well
    try {
      const backupPath = path.join(uploadDir, req.file.filename);
      console.log("POST /resume - Manual backup write to:", backupPath);
      fs.writeFileSync(backupPath, fs.readFileSync(req.file.path));
      console.log("POST /resume - Manual backup write successful");
    } catch (writeErr) {
      console.error("POST /resume - Manual backup write failed:", writeErr.message);
    }

    console.log("POST /resume - Extraction successful. Length:", extractedText.length);

    const relativePath = `/uploads/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        resume: relativePath,
        resumeText: extractedText
      },
      { new: true }
    );

    if (!user) {
      console.log("POST /resume - User not found in DB:", req.user.userId);
      return res.status(404).json({ message: "User not found" });
    }

    console.log("POST /resume - User profile updated with resume text");
    res.json({
      message: "Resume uploaded and saved successfully",
      resumeText: extractedText,
      user
    });
  } catch (err) {
    console.error("POST /resume - Error:", err);
    // Write detailed error to a file
    const logMsg = `${new Date().toISOString()} - ${err.message}\n${err.stack}\n\n`;
    fs.appendFileSync('upload_errors.txt', logMsg);
    res.status(500).json({ message: "Server error during upload", error: err.message });
  }
});

module.exports = router;
