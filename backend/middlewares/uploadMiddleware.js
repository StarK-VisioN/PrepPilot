const multer = require("multer");
const path = require("path");

// configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}${ext}`);
  },
});

// updated file filter using extension
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = [".jpeg", ".jpg", ".png"];

//   console.log("File extension is:", ext);

  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error("Only .jpeg, .jpg, and .png extensions are allowed"), false);
  }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
