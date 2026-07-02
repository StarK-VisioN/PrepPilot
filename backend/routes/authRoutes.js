const express = require("express");
const {
    registerUser,
    loginUser,
    getUserProfile,
    logoutUser,
    googleAuth,
    linkGoogleAccount,
    googleAuthRedirect,
    googleAuthCallback,
    testDBConnection,
} = require("../controllers/authController");
const {
    updateProfile,
    uploadProfileAvatar,
    deleteProfileAvatar,
} = require("../controllers/profileController");
const {
    forgotPassword,
    resetPassword,
} = require("../controllers/passwordResetController");
const { protect } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/uploadMiddleware");
const avatarUpload = require("../middlewares/avatarUploadMiddleware");

const router = express.Router();

if (process.env.NODE_ENV !== "production") {
    router.get("/test-db", protect, testDBConnection);
}

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
router.post("/google", googleAuth);
router.get("/google", googleAuthRedirect);
router.get("/google/callback", googleAuthCallback);
router.post("/logout", logoutUser);
router.get("/me", protect, getUserProfile);
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateProfile);
router.post(
    "/profile/avatar",
    protect,
    avatarUpload.single("avatar"),
    uploadProfileAvatar
);
router.delete("/profile/avatar", protect, deleteProfileAvatar);
router.post("/link-google", protect, linkGoogleAccount);

router.post("/upload-image", protect, upload.single("image"), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
        res.status(200).json({
            success: true,
            imageUrl,
        });
    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({
            message: "File upload failed",
            error: error.message,
        });
    }
});

module.exports = router;
