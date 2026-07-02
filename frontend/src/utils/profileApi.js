import axiosInstance from "./axiosInstance";
import { API_PATHS } from "./apiPaths";

export const updateProfileName = async (name) => {
    const response = await axiosInstance.put(API_PATHS.AUTH.UPDATE_PROFILE, { name });
    return response.data;
};

export const uploadProfileAvatar = async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await axiosInstance.post(API_PATHS.AUTH.UPLOAD_AVATAR, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const deleteProfileAvatar = async () => {
    const response = await axiosInstance.delete(API_PATHS.AUTH.DELETE_AVATAR);
    return response.data;
};

export const ALLOWED_AVATAR_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const MAX_AVATAR_SIZE_BYTES = 2 * 1024 * 1024;

export const validateAvatarFile = (file) => {
    if (!file) {
        return "Please select an image file";
    }

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
        return "Only JPG, JPEG, PNG, and WEBP images are allowed";
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
        return "Image must be 2MB or smaller";
    }

    return null;
};
