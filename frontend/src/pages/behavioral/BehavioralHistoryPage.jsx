import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LuArrowLeft, LuHistory, LuTrendingUp } from "react-icons/lu";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import BehavioralHistoryList from "./components/BehavioralHistoryList";

const BehavioralHistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const params = {};
                if (category) params.category = category;

                const [historyRes, statsRes] = await Promise.all([
                    axiosInstance.get(API_PATHS.BEHAVIORAL.HISTORY, { params }),
                    axiosInstance.get(API_PATHS.BEHAVIORAL.STATS),
                ]);

                setHistory(historyRes.data.history || []);
                setStats(statsRes.data.stats || null);
            } catch (error) {
                console.error("Failed to load history:", error);
                toast.error("Failed to load behavioral history");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [category]);

    return (
        <div className="container mx-auto max-w-4xl px-4 py-6 sm:py-8">
            <Link
                to="/behavioral"
                className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-6"
            >
                <LuArrowLeft size={16} />
                Back to Behavioral Practice
            </Link>

            <div className="flex items-center gap-3 mb-6">
                <span className="p-3 rounded-2xl bg-blue-600 text-white shadow-md">
                    <LuHistory size={22} />
                </span>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Answer History</h1>
                    <p className="text-gray-600 text-sm">Review past submissions and scores</p>
                </div>
            </div>

            {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="bg-white/90 rounded-2xl border p-4">
                        <p className="text-xs text-gray-500">Avg Score</p>
                        <p className="text-xl font-bold">
                            {stats.averageScore !== null ? `${stats.averageScore}/100` : "—"}
                        </p>
                    </div>
                    <div className="bg-white/90 rounded-2xl border p-4">
                        <p className="text-xs text-gray-500">Attempted</p>
                        <p className="text-xl font-bold">{stats.questionsAttempted}</p>
                    </div>
                    <div className="bg-white/90 rounded-2xl border p-4">
                        <p className="text-xs text-gray-500">Strongest</p>
                        <p className="text-sm font-semibold truncate">
                            {stats.strongestCategory || "—"}
                        </p>
                    </div>
                    <div className="bg-white/90 rounded-2xl border p-4">
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                            <LuTrendingUp size={12} /> Weakest
                        </p>
                        <p className="text-sm font-semibold truncate">
                            {stats.weakestCategory || "—"}
                        </p>
                    </div>
                </div>
            )}

            {stats?.categories?.length > 0 && (
                <div className="mb-4">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-white"
                    >
                        <option value="">All categories</option>
                        {stats.categories.map((c) => (
                            <option key={c.category} value={c.category}>
                                {c.category}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <BehavioralHistoryList history={history} loading={loading} />
        </div>
    );
};

export default BehavioralHistoryPage;
