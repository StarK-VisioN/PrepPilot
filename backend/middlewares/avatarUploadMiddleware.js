const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { isCloudinaryConfigured } = require("../services/cloudinaryService");

const ALLOWED_MIMES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ALLOWED_EXTS = [".jpeg", ".jpg", ".png", ".webp"];
const MAX_SIZE = 2 * 1024 * 1024;
const AVATAR_DIR = path.join(__dirname, "..", "uploads", "avatars");

const useMemoryStorage =
    isCloudinaryConfigured() ||
    process.env.VERCEL === "1" ||
    process.env.NODE_ENV === "production";

const diskStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        if (!fs.existsSync(AVATAR_DIR)) {
            fs.mkdirSync(AVATAR_DIR, { recursive: true });
        }
        cb(null, AVATAR_DIR);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `temp_${Date.now()}${ext}`);
    },
});

const storage = useMemoryStorage ? multer.memoryStorage() : diskStorage;

const fileFilter = (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (ALLOWED_EXTS.includes(ext) && ALLOWED_MIMES.includes(file.mimetype)) {
        cb(null, true);
        return;
    }

    cb(new Error("Only JPG, JPEG, PNG, and WEBP images are allowed"), false);
};

const avatarUpload = multer({
    storage,
    fileFilter,
    limits: { fileSize: MAX_SIZE },
});

module.exports = avatarUpload;
