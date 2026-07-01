import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { LuArrowLeft, LuMessageSquare, LuHistory, LuTrendingUp } from "react-icons/lu";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import BehavioralCategoryCard from "./components/BehavioralCategoryCard";
import BehavioralQuestionCard from "./components/BehavioralQuestionCard";

const BehavioralDashboard = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryFilter = searchParams.get("category") || "";

    const [questions, setQuestions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const params = {};
                if (categoryFilter) params.category = categoryFilter;

                const response = await axiosInstance.get(API_PATHS.BEHAVIORAL.QUESTIONS, {
                    params,
                });

                setQuestions(response.data.questions || []);
                setCategories(response.data.categories || []);
                setStats(response.data.stats || null);
            } catch (error) {
                console.error("Failed to load behavioral data:", error);
                toast.error("Failed to load behavioral questions");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [categoryFilter]);

    const filteredQuestions = useMemo(() => {
        if (!categoryFilter) return questions;
        return questions.filter((q) => q.category === categoryFilter);
    }, [questions, categoryFilter]);

    const clearCategory = () => setSearchParams({});

    return (
        <div className="container mx-auto max-w-7xl px-4 py-6 sm:py-8">
            <div className="mb-8">
                <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-4"
                >
                    <LuArrowLeft size={16} />
                    Back to Dashboard
                </Link>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <span className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md">
                            <LuMessageSquare size={24} />
                        </span>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                STAR Behavioral Practice
                            </h1>
                            <p className="text-gray-600 text-sm sm:text-base">
                                Practice behavioral answers and get AI feedback on Situation, Task,
                                Action, and Result.
                            </p>
                        </div>
                    </div>

                    <Link
                        to="/behavioral/history"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                        <LuHistory size={16} />
                        View History
                    </Link>
                </div>
            </div>

            {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                    {[
                        {
                            label: "Questions",
                            value: stats.totalQuestions,
                            icon: LuMessageSquare,
                        },
                        {
                            label: "Attempted",
                            value: stats.questionsAttempted,
                            icon: LuTrendingUp,
                        },
                        {
                            label: "Evaluations",
                            value: stats.totalEvaluations,
                            icon: LuHistory,
                        },
                        {
                            label: "Avg Score",
                            value: stats.averageScore !== null ? `${stats.averageScore}/100` : "—",
                            icon: LuTrendingUp,
                        },
                    ].map(({ label, value, icon: Icon }) => (
                        <div
                            key={label}
                            className="bg-white/90 border border-white/60 rounded-2xl p-4 shadow-sm"
                        >
                            <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                                <Icon size={14} />
                                {label}
                            </div>
                            <p className="text-xl font-bold text-gray-900">{value}</p>
                        </div>
                    ))}
                </div>
            )}

            {!categoryFilter ? (
                <section className="mb-10">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Categories</h2>
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div
                                    key={i}
                                    className="h-40 bg-white/50 rounded-2xl animate-pulse"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {categories.map((cat) => (
                                <BehavioralCategoryCard key={cat.category} category={cat} />
                            ))}
                        </div>
                    )}
                </section>
            ) : (
                <section>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">{categoryFilter}</h2>
                        <button
                            type="button"
                            onClick={clearCategory}
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                        >
                            View all categories
                        </button>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (
                                <div
                                    key={i}
                                    className="h-48 bg-white/50 rounded-2xl animate-pulse"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredQuestions.map((q) => (
                                <BehavioralQuestionCard key={q._id} question={q} />
                            ))}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
};

export default BehavioralDashboard;
