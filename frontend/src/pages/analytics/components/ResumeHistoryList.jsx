import { LuTrash2 } from "react-icons/lu";

const ResumeHistoryList = ({ history, onDelete, deletingId }) => {
    if (!history?.length) {
        return (
            <p className="text-sm text-gray-500">No previous resume analyses yet.</p>
        );
    }

    return (
        <div className="space-y-2">
            {history.map((item) => (
                <div
                    key={item._id}
                    className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl px-4 py-3"
                >
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.fileName}</p>
                        <p className="text-xs text-gray-500">
                            {new Date(item.createdAt).toLocaleDateString()} · ATS {item.atsScore}/100
                            {item.analysisStatus === "text_only" && " · AI pending"}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => onDelete(item._id)}
                        disabled={deletingId === item._id}
                        className="p-2 text-gray-400 hover:text-rose-600 disabled:opacity-50"
                        title="Delete"
                    >
                        <LuTrash2 size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ResumeHistoryList;
