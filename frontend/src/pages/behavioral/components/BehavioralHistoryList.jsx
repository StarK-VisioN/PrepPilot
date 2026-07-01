import { Link } from "react-router-dom";
import { LuCalendar, LuArrowRight } from "react-icons/lu";

const RATING_COLORS = {
    Excellent: "text-emerald-600 bg-emerald-50",
    Good: "text-blue-600 bg-blue-50",
    Average: "text-amber-600 bg-amber-50",
    "Needs Improvement": "text-rose-600 bg-rose-50",
};

const BehavioralHistoryList = ({ history, loading }) => {
    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 bg-white/50 rounded-2xl animate-pulse" />
                ))}
            </div>
        );
    }

    if (!history?.length) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>No submissions yet. Start practicing to build your history.</p>
                <Link
                    to="/behavioral"
                    className="inline-flex items-center gap-1 mt-3 text-indigo-600 font-medium text-sm hover:text-indigo-800"
                >
                    Browse questions <LuArrowRight size={14} />
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {history.map((item) => (
                <Link
                    key={item._id}
                    to={`/behavioral/${item.questionId}`}
                    className="block bg-white/90 border border-white/60 rounded-2xl p-4 hover:shadow-md transition-all"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-gray-900 truncate">
                                {item.questionTitle}
                            </h3>
                            <p className="text-sm text-gray-500 mt-0.5">{item.category}</p>
                            {item.overallFeedback && (
                                <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                                    {item.overallFeedback}
                                </p>
                            )}
                        </div>

                        <div className="text-right shrink-0">
                            {item.aiAvailable !== false && item.score > 0 ? (
                                <p className="text-2xl font-bold text-gray-900">{item.score}</p>
                            ) : (
                                <p className="text-xs text-amber-600 font-medium">Pending AI</p>
                            )}
                            {item.ratingLabel && (
                                <span
                                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${RATING_COLORS[item.ratingLabel] || "text-gray-600 bg-gray-100"}`}
                                >
                                    {item.ratingLabel}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                        <span className="inline-flex items-center gap-1">
                            <LuCalendar size={12} />
                            {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                        {item.attemptNumber > 1 && (
                            <span>Attempt #{item.attemptNumber}</span>
                        )}
                    </div>
                </Link>
            ))}
        </div>
    );
};

export default BehavioralHistoryList;
