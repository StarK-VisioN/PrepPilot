const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        "application/pdf",
        "application/x-pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "application/octet-stream",
    ];
    const allowedExts = [".pdf", ".docx", ".txt"];
    const ext = (file.originalname || "").slice((file.originalname || "").lastIndexOf(".")).toLowerCase();

    if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
        cb(null, true);
    } else {
        cb(new Error("Only PDF, DOCX, and TXT files are allowed"), false);
    }
};

const documentUpload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});

module.exports = documentUpload;
