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

const allowedImageMimes = ["image/jpeg", "image/jpg", "image/png"];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = [".jpeg", ".jpg", ".png"];

  if (allowedExts.includes(ext) && allowedImageMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG and PNG images are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = upload;
