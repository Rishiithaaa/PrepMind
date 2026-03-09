const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists in the root public folder
const uploadDir = path.join(__dirname, "../../public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
console.log("==================================================");
console.log("MULTER DISK STORAGE STARTUP");
console.log("Absolute Target Path:", uploadDir);
console.log("Directory Exists:", fs.existsSync(uploadDir));
console.log("==================================================");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("DEBUG: Multer saving file to:", uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    const cleanName = file.originalname.replace(/\s+/g, '_');
    cb(null, uniqueSuffix + '_' + cleanName);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const filetypes = /pdf|doc|docx|txt|wav|mp3|ogg|m4a|webm|audio/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Error: File upload only supports the following filetypes - " + filetypes));
  },
});

module.exports = upload;
