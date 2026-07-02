import { useRef, useState } from "react";
import { LuFileUp, LuLoader } from "react-icons/lu";
import { toast } from "react-toastify";
import axiosInstance from "../../../utils/axiosInstance";
import { API_PATHS } from "../../../utils/apiPaths";

const ResumeUploadButton = ({ onUploaded, uploading, setUploading }) => {
    const inputRef = useRef(null);

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith(".pdf")) {
            toast.error("Please upload a PDF resume.");
            e.target.value = "";
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            setUploading(true);
            const res = await axiosInstance.post(API_PATHS.ANALYTICS.RESUME_UPLOAD, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success("Resume analyzed successfully");
            onUploaded?.(res.data.analysis);
        } catch (error) {
            const msg = error.response?.data?.message || "Failed to upload resume";
            toast.error(msg);
        } finally {
            setUploading(false);
            e.target.value = "";
        }
    };

    return (
        <>
            <input
                ref={inputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileChange}
            />
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors"
            >
                {uploading ? (
                    <LuLoader className="animate-spin" size={18} />
                ) : (
                    <LuFileUp size={18} />
                )}
                {uploading ? "Analyzing..." : "Upload New Resume"}
            </button>
        </>
    );
};

export default ResumeUploadButton;
