import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuArrowLeft, LuMic, LuHistory, LuLoader } from "react-icons/lu";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { PERSONALITY_LABELS } from "./components/MockInterviewCard";

const SOURCE_OPTIONS = [
    { id: "preset", label: "Preset Role" },
    { id: "jd", label: "Custom Job Description" },
    { id: "resume", label: "Resume Based" },
];

const MockInterviewDashboard = () => {
    const navigate = useNavigate();
    const [config, setConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [starting, setStarting] = useState(false);

    const [role, setRole] = useState("Software Engineer");
    const [customRole, setCustomRole] = useState("");
    const [interviewType, setInterviewType] = useState("Mixed");
    const [difficulty, setDifficulty] = useState("Intermediate");
    const [duration, setDuration] = useState(30);
    const [personality, setPersonality] = useState("friendly");
    const [sourceType, setSourceType] = useState("preset");
    const [jobDescription, setJobDescription] = useState("");
    const [resumeText, setResumeText] = useState("");

    useEffect(() => {
        axiosInstance
            .get(API_PATHS.MOCK_INTERVIEW.CONFIG)
            .then((res) => setConfig(res.data))
            .catch(() => toast.error("Failed to load interview options"))
            .finally(() => setLoading(false));
    }, []);

    const handleStart = async () => {
        if (sourceType === "jd" && !jobDescription.trim()) {
            toast.error("Please paste a job description");
            return;
        }
        if (sourceType === "resume" && !resumeText.trim()) {
            toast.error("Please paste your resume text");
            return;
        }

        try {
            setStarting(true);
            const response = await axiosInstance.post(API_PATHS.MOCK_INTERVIEW.START, {
                role,
                customRole: role === "Custom Job Description" ? customRole : "",
                interviewType,
                difficulty,
                duration,
                personality,
                sourceType,
                jobDescription,
                resumeText,
            });

            const sessionId = response.data.session._id;
            toast.success("Interview started!");
            navigate(`/mock-interview/session/${sessionId}`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to start interview");
        } finally {
            setStarting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <LuLoader className="animate-spin text-indigo-500" size={32} />
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-3xl px-4 py-6 sm:py-8">
            <Link
                to="/dashboard"
                className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-6"
            >
                <LuArrowLeft size={16} />
                Back to Dashboard
            </Link>

            <div className="flex items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <span className="p-3 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-md">
                        <LuMic size={24} />
                    </span>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">AI Mock Interview</h1>
                        <p className="text-gray-600 text-sm">
                            Live chat interview with dynamic AI follow-ups
                        </p>
                    </div>
                </div>
                <Link
                    to="/mock-interview/history"
                    className="inline-flex items-center gap-1 text-sm text-indigo-600 font-medium hover:text-indigo-800"
                >
                    <LuHistory size={16} />
                    History
                </Link>
            </div>

            <div className="bg-white/90 border border-white/60 rounded-2xl p-6 shadow-sm space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Interview Source
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {SOURCE_OPTIONS.map((opt) => (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => setSourceType(opt.id)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                                    sourceType === opt.id
                                        ? "bg-gray-900 text-white border-gray-900"
                                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {sourceType === "preset" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
                        >
                            {config?.roles?.map((r) => (
                                <option key={r} value={r}>
                                    {r}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {(sourceType === "jd" || role === "Custom Job Description") && (
                    <div>
                        {role === "Custom Job Description" && (
                            <input
                                type="text"
                                value={customRole}
                                onChange={(e) => setCustomRole(e.target.value)}
                                placeholder="Custom role title"
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm mb-3"
                            />
                        )}
                        {sourceType === "jd" && (
                            <textarea
                                value={jobDescription}
                                onChange={(e) => setJobDescription(e.target.value)}
                                placeholder="Paste the job description here..."
                                rows={6}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none"
                            />
                        )}
                    </div>
                )}

                {sourceType === "resume" && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Resume</label>
                        <textarea
                            value={resumeText}
                            onChange={(e) => setResumeText(e.target.value)}
                            placeholder="Paste your resume text here..."
                            rows={8}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none"
                        />
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <select
                            value={interviewType}
                            onChange={(e) => setInterviewType(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
                        >
                            {config?.interviewTypes?.map((t) => (
                                <option key={t} value={t}>
                                    {t}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Difficulty
                        </label>
                        <select
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value)}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm"
                        >
                            {config?.difficulties?.map((d) => (
                                <option key={d} value={d}>
                                    {d}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <div className="flex flex-wrap gap-2">
                        {config?.durations?.map((d) => (
                            <button
                                key={d}
                                type="button"
                                onClick={() => setDuration(d)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium border ${
                                    duration === d
                                        ? "bg-indigo-600 text-white border-indigo-600"
                                        : "bg-white text-gray-600 border-gray-200"
                                }`}
                            >
                                {d} min
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Interviewer Personality
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {config?.personalities?.map((p) => (
                            <button
                                key={p.id}
                                type="button"
                                onClick={() => setPersonality(p.id)}
                                className={`px-3 py-1.5 rounded-full text-sm border ${
                                    personality === p.id
                                        ? "bg-violet-600 text-white border-violet-600"
                                        : "bg-white text-gray-600 border-gray-200"
                                }`}
                            >
                                {PERSONALITY_LABELS[p.id] || p.label}
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    type="button"
                    onClick={handleStart}
                    disabled={starting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 text-white font-semibold hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {starting ? (
                        <>
                            <LuLoader className="animate-spin" size={18} />
                            Starting interview...
                        </>
                    ) : (
                        "Start Mock Interview"
                    )}
                </button>
            </div>
        </div>
    );
};

export default MockInterviewDashboard;
