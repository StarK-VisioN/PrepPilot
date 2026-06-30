const express = require("express");
const { registerUser, loginUser, getUserProfile, testDBConnection } = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");

const router = express.Router();

if (process.env.NODE_ENV !== "production") {
    router.get("/test-db", protect, testDBConnection);
}

// Auth Routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/profile", protect, getUserProfile);

// Image upload route
router.post("/upload-image", protect, upload.single("image"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }
        
        const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        res.status(200).json({ 
            success: true, 
            imageUrl 
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ 
            message: "File upload failed", 
            error: error.message 
        });
    }
});

module.exports = router;