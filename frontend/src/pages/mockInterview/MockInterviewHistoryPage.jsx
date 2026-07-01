import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LuArrowLeft, LuMic, LuTrendingUp } from "react-icons/lu";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import MockInterviewCard from "./components/MockInterviewCard";

const MockInterviewHistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosInstance
            .get(API_PATHS.MOCK_INTERVIEW.HISTORY)
            .then((res) => {
                setHistory(res.data.history || []);
                setAnalytics(res.data.analytics || null);
            })
            .catch(() => toast.error("Failed to load interview history"))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="container mx-auto max-w-4xl px-4 py-6 sm:py-8">
            <Link
                to="/mock-interview"
                className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-6"
            >
                <LuArrowLeft size={16} />
                Back to Mock Interview
            </Link>

            <div className="flex items-center gap-3 mb-6">
                <span className="p-3 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 text-white">
                    <LuMic size={22} />
                </span>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Interview History</h1>
                    <p className="text-gray-600 text-sm">Track your progress over time</p>
                </div>
            </div>

            {analytics && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                    {[
                        { label: "Total", value: analytics.totalInterviews },
                        { label: "Avg Score", value: analytics.averageScore ?? "—" },
                        { label: "Best Score", value: analytics.bestScore ?? "—" },
                        { label: "Minutes", value: analytics.totalMinutes },
                    ].map(({ label, value }) => (
                        <div key={label} className="bg-white rounded-2xl border p-4">
                            <p className="text-xs text-gray-500">{label}</p>
                            <p className="text-xl font-bold text-gray-900">{value}</p>
                        </div>
                    ))}
                </div>
            )}

            {analytics?.improvementTrend?.length > 1 && (
                <div className="bg-white rounded-2xl border p-5 mb-8">
                    <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-1">
                        <LuTrendingUp size={16} />
                        Score Trend
                    </h3>
                    <div className="flex items-end gap-2 h-20">
                        {analytics.improvementTrend.map((point, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <span className="text-xs font-semibold">{point.score}</span>
                                <div
                                    className="w-full bg-gradient-to-t from-violet-500 to-purple-400 rounded-t"
                                    style={{ height: `${Math.max(point.score, 8)}%` }}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-24 bg-white/50 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : history.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p>No interviews yet.</p>
                    <Link to="/mock-interview" className="text-indigo-600 font-medium text-sm mt-2 inline-block">
                        Start your first mock interview
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {history.map((session) => (
                        <MockInterviewCard key={session._id} session={session} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MockInterviewHistoryPage;
