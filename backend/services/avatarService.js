const fs = require("fs");
const path = require("path");
const {
    isCloudinaryConfigured,
    uploadAvatarBuffer,
    deleteAvatarByPublicId,
} = require("./cloudinaryService");

const AVATAR_DIR = path.join(__dirname, "..", "uploads", "avatars");

const ensureAvatarDir = () => {
    if (!fs.existsSync(AVATAR_DIR)) {
        fs.mkdirSync(AVATAR_DIR, { recursive: true });
    }
};

const saveAvatarLocally = (file, userId) => {
    ensureAvatarDir();
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const filename = `avatar_${userId}_${Date.now()}${ext}`;
    const filePath = path.join(AVATAR_DIR, filename);

    if (file.buffer) {
        fs.writeFileSync(filePath, file.buffer);
    } else if (file.path) {
        fs.renameSync(file.path, filePath);
    } else {
        throw new Error("Invalid file upload");
    }

    return {
        url: `/uploads/avatars/${filename}`,
        publicId: null,
        localPath: filePath,
    };
};

const deleteLocalAvatarFile = (profileImageUrl) => {
    if (!profileImageUrl || !profileImageUrl.includes("/uploads/avatars/")) {
        return;
    }

    const filename = path.basename(profileImageUrl);
    const filePath = path.join(AVATAR_DIR, filename);

    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
};

const uploadUserAvatar = async (file, userId, req) => {
    if (isCloudinaryConfigured()) {
        const buffer = file.buffer || fs.readFileSync(file.path);
        return uploadAvatarBuffer(buffer, userId);
    }

    if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
        throw new Error(
            "Avatar uploads require Cloudinary in production. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."
        );
    }

    const localResult = saveAvatarLocally(file, userId);
    const host = req.get("host");
    const protocol = req.protocol;

    return {
        url: `${protocol}://${host}${localResult.url}`,
        publicId: null,
        localPath: localResult.localPath,
    };
};

const removeStoredAvatar = async (user) => {
    if (user.avatarCloudinaryPublicId) {
        await deleteAvatarByPublicId(user.avatarCloudinaryPublicId);
        return;
    }

    deleteLocalAvatarFile(user.profileImageUrl);
};

module.exports = {
    uploadUserAvatar,
    removeStoredAvatar,
};
