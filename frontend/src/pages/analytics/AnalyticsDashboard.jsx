import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LuArrowLeft, LuChartBar, LuLoader } from "react-icons/lu";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import AnalyticsCard from "./components/AnalyticsCard";
import WeakTopicCard from "./components/WeakTopicCard";
import RoadmapCard from "./components/RoadmapCard";
import ProgressChart from "./components/ProgressChart";
import SkillRadarChart from "./components/SkillRadarChart";
import HeatMap from "./components/HeatMap";
import RecommendationCard from "./components/RecommendationCard";
import GoalForm from "./components/GoalForm";

const AnalyticsDashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [roadmap, setRoadmap] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [goals, setGoals] = useState(null);
    const [loading, setLoading] = useState(true);
    const [savingGoals, setSavingGoals] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const [dashRes, roadmapRes, recRes, goalsRes] = await Promise.all([
                axiosInstance.get(API_PATHS.ANALYTICS.DASHBOARD),
                axiosInstance.get(API_PATHS.ANALYTICS.ROADMAP),
                axiosInstance.get(API_PATHS.ANALYTICS.RECOMMENDATIONS),
                axiosInstance.get(API_PATHS.ANALYTICS.GOALS),
            ]);
            setDashboard(dashRes.data.dashboard);
            setRoadmap(roadmapRes.data.roadmap);
            setRecommendations(recRes.data.recommendations);
            setGoals(goalsRes.data.goals);
        } catch (error) {
            console.error("Analytics load failed:", error);
            toast.error("Failed to load analytics");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleSaveGoals = async (form) => {
        try {
            setSavingGoals(true);
            const res = await axiosInstance.post(API_PATHS.ANALYTICS.GOALS, form);
            setGoals(res.data.goals);
            toast.success("Goals saved — roadmap will adapt");
            const [roadmapRes, recRes] = await Promise.all([
                axiosInstance.get(API_PATHS.ANALYTICS.ROADMAP),
                axiosInstance.get(API_PATHS.ANALYTICS.RECOMMENDATIONS),
            ]);
            setRoadmap(roadmapRes.data.roadmap);
            setRecommendations(recRes.data.recommendations);
        } catch {
            toast.error("Failed to save goals");
        } finally {
            setSavingGoals(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <LuLoader className="animate-spin text-indigo-500" size={32} />
            </div>
        );
    }

    const scores = dashboard?.scores || {};
    const totals = dashboard?.totals || {};

    return (
        <div className="container mx-auto max-w-7xl px-4 py-6 sm:py-8">
            <Link
                to="/dashboard"
                className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-6"
            >
                <LuArrowLeft size={16} />
                Back to Dashboard
            </Link>

            <div className="flex items-center gap-3 mb-8">
                <span className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-white shadow-md">
                    <LuChartBar size={24} />
                </span>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                        Weakness Analytics
                    </h1>
                    <p className="text-gray-600 text-sm">
                        Personalized insights across all interview prep modules
                    </p>
                </div>
            </div>

            {/* Readiness hero */}
            <div className="bg-gradient-to-br from-cyan-600 to-indigo-700 rounded-2xl p-6 text-white mb-6">
                <p className="text-sm opacity-80 mb-1">Interview Readiness</p>
                <div className="flex items-end gap-3">
                    <span className="text-5xl font-bold">{dashboard?.overallReadiness ?? 0}</span>
                    <span className="text-lg opacity-80 mb-1">/100</span>
                    <span className="ml-auto text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                        {dashboard?.readinessLabel || "Beginner"}
                    </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                    {[
                        { label: "Technical", val: scores.technicalScore },
                        { label: "Coding", val: scores.codingScore },
                        { label: "Behavioral", val: scores.behavioralScore },
                        { label: "Communication", val: scores.communicationScore },
                    ].map((s) => (
                        <div key={s.label} className="bg-white/10 rounded-xl p-3">
                            <p className="text-xs opacity-70">{s.label}</p>
                            <p className="text-xl font-bold">{s.val ?? 0}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Totals */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                <AnalyticsCard label="Phase 1 Questions" value={totals.phase1Questions ?? 0} accent="orange" />
                <AnalyticsCard label="Coding Solved" value={totals.codingChallengesSolved ?? 0} accent="emerald" />
                <AnalyticsCard label="Behavioral Attempts" value={totals.behavioralAttempts ?? 0} accent="violet" />
                <AnalyticsCard label="Mock Interviews" value={totals.mockInterviewsCompleted ?? 0} accent="indigo" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-gray-200 rounded-2xl p-5">
                        <h2 className="font-semibold text-gray-900 mb-4">Weekly Improvement</h2>
                        <ProgressChart data={dashboard?.improvementTrend} type="line" />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-5">
                        <h2 className="font-semibold text-gray-900 mb-4">Topic Accuracy</h2>
                        <ProgressChart data={dashboard?.topicAccuracy} type="bar" />
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-2xl p-5">
                        <h2 className="font-semibold text-gray-900 mb-4">Skill Radar</h2>
                        <SkillRadarChart data={dashboard?.radarData} />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl p-5">
                        <h2 className="font-semibold text-gray-900 mb-4">Activity Heatmap</h2>
                        <HeatMap data={dashboard?.activityHeatmap} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div>
                    <h2 className="font-semibold text-gray-900 mb-4">Weak Topics</h2>
                    <div className="space-y-3">
                        {dashboard?.weakTopics?.length ? (
                            dashboard.weakTopics.map((t) => (
                                <WeakTopicCard key={t.topic} topic={t} />
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">
                                Practice more to identify weak areas.
                            </p>
                        )}
                    </div>
                </div>
                <div>
                    <h2 className="font-semibold text-gray-900 mb-4">Strengths</h2>
                    <div className="space-y-2">
                        {dashboard?.strongTopics?.length ? (
                            dashboard.strongTopics.map((t) => (
                                <div
                                    key={t.topic}
                                    className="flex justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3"
                                >
                                    <span className="font-medium text-emerald-900">{t.topic}</span>
                                    <span className="text-emerald-700 font-semibold">{t.averageScore}%</span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">Keep practicing to build strengths.</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="mb-8">
                <GoalForm goals={goals} onSave={handleSaveGoals} saving={savingGoals} />
            </div>

            <div className="mb-8">
                <h2 className="font-semibold text-gray-900 mb-4">Personalized Learning Roadmap</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roadmap?.weeks?.map((week) => (
                        <RoadmapCard key={week.week} week={week} />
                    ))}
                </div>
            </div>

            <div>
                <h2 className="font-semibold text-gray-900 mb-4">Recommended Next Steps</h2>
                <RecommendationCard recommendations={recommendations} />
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
