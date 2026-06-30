const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const documentUpload = require("../middlewares/documentUploadMiddleware");
const {
    uploadResume,
    uploadJobDescription,
    pasteJobDescription,
    getDocument,
} = require("../controllers/documentController");

const router = express.Router();

function handleUpload(fieldName) {
    return (req, res, next) => {
        documentUpload.single(fieldName)(req, res, (err) => {
            if (err) return next(err);
            next();
        });
    };
}

router.post("/resume/upload", protect, handleUpload("file"), uploadResume);
router.post("/jd/upload", protect, handleUpload("file"), uploadJobDescription);
router.post("/jd/paste", protect, pasteJobDescription);
router.get("/:id", protect, getDocument);

module.exports = router;
