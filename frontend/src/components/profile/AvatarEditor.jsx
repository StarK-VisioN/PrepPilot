import React, { useContext, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { LuCamera, LuTrash2 } from "react-icons/lu";
import { UserContext } from "../../context/userContext";
import { getUserAvatar, getUserInitials } from "../../utils/userAvatar";
import {
    deleteProfileAvatar,
    uploadProfileAvatar,
    validateAvatarFile,
} from "../../utils/profileApi";

const AvatarEditor = ({ disabled = false }) => {
    const { user, updateUser } = useContext(UserContext);
    const inputRef = useRef(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [removing, setRemoving] = useState(false);

    const currentAvatar = previewUrl || getUserAvatar(user);
    const busy = uploading || removing || disabled;

    useEffect(() => {
        return () => {
            if (previewUrl?.startsWith("blob:")) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";

        const validationError = validateAvatarFile(file);
        if (validationError) {
            toast.error(validationError);
            return;
        }

        const localPreview = URL.createObjectURL(file);
        setPreviewUrl(localPreview);
        setUploading(true);

        try {
            const response = await uploadProfileAvatar(file);
            if (response?.data) {
                updateUser({ data: response.data });
                toast.success("Profile image updated");
            }
        } catch (error) {
            setPreviewUrl(null);
            toast.error(error.response?.data?.message || "Failed to upload profile image");
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = async () => {
        if (!getUserAvatar(user) && !previewUrl) {
            return;
        }

        setRemoving(true);

        try {
            const response = await deleteProfileAvatar();
            if (response?.data) {
                updateUser({ data: response.data });
            }
            setPreviewUrl(null);
            toast.success("Profile image removed");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to remove profile image");
        } finally {
            setRemoving(false);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="relative shrink-0">
                {currentAvatar ? (
                    <img
                        src={currentAvatar}
                        alt={user?.name}
                        className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-md"
                    />
                ) : (
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-3xl font-bold shadow-md ring-4 ring-white">
                        {getUserInitials(user)}
                    </div>
                )}

                {uploading && (
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-white" />
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2 w-full sm:w-auto">
                <input
                    ref={inputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={busy}
                />

                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={busy}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <LuCamera size={16} />
                    {uploading ? "Uploading..." : "Upload new image"}
                </button>

                {getUserAvatar(user) && (
                    <button
                        type="button"
                        onClick={handleRemove}
                        disabled={busy}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <LuTrash2 size={16} />
                        {removing ? "Removing..." : "Remove image"}
                    </button>
                )}

                <p className="text-xs text-gray-500">JPG, PNG, or WEBP. Max 2MB.</p>
            </div>
        </div>
    );
};

export default AvatarEditor;
