import React, { useRef } from 'react';
import { LuUpload, LuFileText, LuX } from 'react-icons/lu';

const FileUploadField = ({
    label,
    accept = '.pdf,.docx,.txt',
    file,
    onFileChange,
    disabled,
    helperText,
}) => {
    const inputRef = useRef(null);

    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">{label}</label>
            {file ? (
                <div className="flex items-center justify-between gap-2 rounded-md border border-gray-200 bg-gray-50 px-3 py-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <LuFileText className="text-gray-500 shrink-0" />
                        <span className="text-sm text-gray-700 truncate">{file.name}</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => onFileChange(null)}
                        disabled={disabled}
                        className="text-gray-400 hover:text-red-500 shrink-0"
                    >
                        <LuX size={16} />
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    disabled={disabled}
                    onClick={() => inputRef.current?.click()}
                    className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-300 rounded-md py-4 text-sm text-gray-600 hover:border-gray-400 hover:bg-gray-50 transition disabled:opacity-50"
                >
                    <LuUpload size={16} />
                    Upload PDF, DOCX, or TXT
                </button>
            )}
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                disabled={disabled}
                onChange={(e) => onFileChange(e.target.files?.[0] || null)}
            />
            {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
        </div>
    );
};

export default FileUploadField;
