import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LuArrowLeft, LuChartBar, LuLoader } from "react-icons/lu";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import AnalyticsCard from "./components/AnalyticsCard";
import RoadmapCard from "./components/RoadmapCard";
import ProgressChart from "./components/ProgressChart";
import SkillRadarChart from "./components/SkillRadarChart";
import RecommendationCard from "./components/RecommendationCard";
import ResumeAnalysisSection from "./components/ResumeAnalysisSection";

const AnalyticsDashboard = () => {
    const [dashboard, setDashboard] = useState(null);
    const [roadmap, setRoadmap] = useState(null);
    const [recommendations, setRecommendations] = useState(null);
    const [resumeAnalysis, setResumeAnalysis] = useState(null);
    const [resumeHistory, setResumeHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadingResume, setUploadingResume] = useState(false);
    const [deletingResumeId, setDeletingResumeId] = useState(null);

    const loadData = async () => {
        try {
            setLoading(true);
            const results = await Promise.allSettled([
                axiosInstance.get(API_PATHS.ANALYTICS.DASHBOARD),
                axiosInstance.get(API_PATHS.ANALYTICS.ROADMAP),
                axiosInstance.get(API_PATHS.ANALYTICS.RECOMMENDATIONS),
                axiosInstance.get(API_PATHS.ANALYTICS.RESUME_LATEST),
                axiosInstance.get(API_PATHS.ANALYTICS.RESUME_HISTORY),
            ]);

            const val = (i) => (results[i].status === "fulfilled" ? results[i].value : null);

            const dashRes = val(0);
            const roadmapRes = val(1);
            const recRes = val(2);
            const resumeRes = val(3);
            const historyRes = val(4);

            if (!dashRes) {
                toast.error("Failed to load analytics");
                return;
            }

            setDashboard(dashRes.data.dashboard);
            if (roadmapRes) setRoadmap(roadmapRes.data.roadmap);
            if (recRes) setRecommendations(recRes.data.recommendations);
            setResumeAnalysis(
                resumeRes?.data?.analysis ?? dashRes.data.dashboard?.resumeAnalysis ?? null
            );
            setResumeHistory(historyRes?.data?.history || []);
        } catch (error) {
            console.error("Analytics load failed:", error);
            toast.error("Failed to load analytics");
        } finally {
            setLoading(false);
        }
    };

    const refreshAfterResumeChange = async () => {
        const results = await Promise.allSettled([
            axiosInstance.get(API_PATHS.ANALYTICS.DASHBOARD),
            axiosInstance.get(API_PATHS.ANALYTICS.ROADMAP),
            axiosInstance.get(API_PATHS.ANALYTICS.RECOMMENDATIONS),
            axiosInstance.get(API_PATHS.ANALYTICS.RESUME_LATEST),
            axiosInstance.get(API_PATHS.ANALYTICS.RESUME_HISTORY),
        ]);

        const val = (i) => (results[i].status === "fulfilled" ? results[i].value : null);
        const dashRes = val(0);
        const roadmapRes = val(1);
        const recRes = val(2);
        const resumeRes = val(3);
        const historyRes = val(4);

        if (dashRes) setDashboard(dashRes.data.dashboard);
        if (roadmapRes) setRoadmap(roadmapRes.data.roadmap);
        if (recRes) setRecommendations(recRes.data.recommendations);
        if (resumeRes) setResumeAnalysis(resumeRes.data.analysis);
        if (historyRes) setResumeHistory(historyRes.data.history || []);
    };

    const handleResumeUploaded = async (analysis) => {
        setResumeAnalysis(analysis);
        await refreshAfterResumeChange();
    };

    const handleDeleteResume = async (id) => {
        try {
            setDeletingResumeId(id);
            await axiosInstance.delete(API_PATHS.ANALYTICS.RESUME_DELETE(id));
            toast.success("Resume analysis deleted");
            await refreshAfterResumeChange();
        } catch {
            toast.error("Failed to delete resume analysis");
        } finally {
            setDeletingResumeId(null);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <LuLoader className="animate-spin text-indigo-500" size={32} />
            </div>
        );
    }

    const scores = dashboard?.scores || {};
    const totals = dashboard?.totals || {};
    const foundation = dashboard?.weaknessFoundation;

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
                        Resume-first insights combined with coding, behavioral, and mock interview data
                    </p>
                </div>
            </div>

            <ResumeAnalysisSection
                analysis={resumeAnalysis}
                history={resumeHistory}
                foundation={foundation}
                onUpload={handleResumeUploaded}
                onDelete={handleDeleteResume}
                uploading={uploadingResume}
                setUploading={setUploadingResume}
                deletingId={deletingResumeId}
            />

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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                    <h2 className="font-semibold text-gray-900 mb-4">Weekly Improvement</h2>
                    <ProgressChart data={dashboard?.improvementTrend} type="line" />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-5">
                    <h2 className="font-semibold text-gray-900 mb-4">Skill Radar</h2>
                    <SkillRadarChart data={dashboard?.radarData} />
                </div>
            </div>

            <div className="mb-8">
                <h2 className="font-semibold text-gray-900 mb-4">
                    Personalized Learning Roadmap
                    {roadmap?.foundation === "resume" && (
                        <span className="ml-2 text-xs font-normal text-indigo-600">from resume analysis</span>
                    )}
                </h2>
                {roadmap?.resumeRoadmap?.length > 0 && roadmap?.foundation === "combined" && (
                    <div className="mb-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Resume-based plan</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            {roadmap.resumeRoadmap.map((week) => (
                                <RoadmapCard key={`resume-${week.week}`} week={week} />
                            ))}
                        </div>
                        <h3 className="text-sm font-medium text-gray-700 mb-3">Activity-based plan</h3>
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(roadmap?.foundation === "combined" ? roadmap.activityWeeks : roadmap?.weeks)?.map(
                        (week) => (
                            <RoadmapCard key={week.week} week={week} />
                        )
                    )}
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
