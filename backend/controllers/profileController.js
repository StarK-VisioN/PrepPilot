const User = require("../models/User");
const formatUserResponse = require("../utils/formatUserResponse");
const { validateName } = require("../utils/validateProfile");
const { uploadUserAvatar, removeStoredAvatar } = require("../services/avatarService");

const updateProfile = async (req, res) => {
    try {
        const validation = validateName(req.body?.name);

        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.message,
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        user.name = validation.name;
        await user.save();

        res.json({
            success: true,
            data: formatUserResponse(user),
            message: "Profile updated successfully",
        });
    } catch (error) {
        console.error("Update profile error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update profile",
            error: process.env.NODE_ENV === "production" ? {} : error.message,
        });
    }
};

const uploadProfileAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image file provided",
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (user.profileImageUrl || user.avatarCloudinaryPublicId) {
            await removeStoredAvatar(user);
        }

        const uploadResult = await uploadUserAvatar(req.file, user._id, req);

        user.profileImageUrl = uploadResult.url;
        user.avatarCloudinaryPublicId = uploadResult.publicId || null;
        await user.save();

        res.json({
            success: true,
            data: formatUserResponse(user),
            message: "Profile image updated successfully",
        });
    } catch (error) {
        console.error("Upload avatar error:", error);

        if (error.message?.includes("Cloudinary")) {
            return res.status(503).json({
                success: false,
                message: error.message,
            });
        }

        res.status(500).json({
            success: false,
            message: error.message || "Failed to upload profile image",
        });
    }
};

const deleteProfileAvatar = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (!user.profileImageUrl && !user.avatarCloudinaryPublicId) {
            return res.status(400).json({
                success: false,
                message: "No profile image to remove",
            });
        }

        await removeStoredAvatar(user);

        user.profileImageUrl = null;
        user.avatarCloudinaryPublicId = null;
        await user.save();

        res.json({
            success: true,
            data: formatUserResponse(user),
            message: "Profile image removed successfully",
        });
    } catch (error) {
        console.error("Delete avatar error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to remove profile image",
            error: process.env.NODE_ENV === "production" ? {} : error.message,
        });
    }
};

module.exports = {
    updateProfile,
    uploadProfileAvatar,
    deleteProfileAvatar,
};
