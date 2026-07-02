const cloudinary = require("cloudinary").v2;

const isCloudinaryConfigured = () =>
    Boolean(
        process.env.CLOUDINARY_CLOUD_NAME &&
            process.env.CLOUDINARY_API_KEY &&
            process.env.CLOUDINARY_API_SECRET
    );

const configureCloudinary = () => {
    if (!isCloudinaryConfigured()) return false;

    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
    });

    return true;
};

const uploadAvatarBuffer = async (buffer, userId) => {
    if (!configureCloudinary()) {
        throw new Error("Cloudinary is not configured");
    }

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: "interview-prep-ai/avatars",
                public_id: `user_${userId}_${Date.now()}`,
                resource_type: "image",
                overwrite: true,
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve({
                    url: result.secure_url,
                    publicId: result.public_id,
                });
            }
        );

        uploadStream.end(buffer);
    });
};

const deleteAvatarByPublicId = async (publicId) => {
    if (!publicId || !configureCloudinary()) {
        return;
    }

    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    } catch (error) {
        console.warn("Failed to delete Cloudinary avatar:", publicId, error.message);
    }
};

module.exports = {
    isCloudinaryConfigured,
    uploadAvatarBuffer,
    deleteAvatarByPublicId,
};
