import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LuArrowLeft, LuDownload, LuLoader } from "react-icons/lu";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import ScoreCard from "./components/ScoreCard";

const MockInterviewReportPage = () => {
    const { sessionId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosInstance
            .get(API_PATHS.MOCK_INTERVIEW.REPORT(sessionId))
            .then((res) => setData(res.data))
            .catch(() => toast.error("Failed to load report"))
            .finally(() => setLoading(false));
    }, [sessionId]);

    const handleDownload = () => {
        if (!data) return;
        const text = [
            `Mock Interview Report`,
            `Role: ${data.report.role}`,
            `Score: ${data.report.score}/100`,
            ``,
            `Summary: ${data.report.summary}`,
            ``,
            `Strengths: ${data.report.feedback?.strengths?.join(", ")}`,
            `Weaknesses: ${data.report.feedback?.weaknesses?.join(", ")}`,
            ``,
            `Q&A:`,
            ...data.qaPairs.map(
                (qa, i) => `\nQ${i + 1}: ${qa.question}\nA: ${qa.answer}`
            ),
        ].join("\n");

        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `interview-report-${sessionId}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <LuLoader className="animate-spin text-indigo-500" size={32} />
            </div>
        );
    }

    if (!data) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-600">Report not found</p>
            </div>
        );
    }

    const { report, qaPairs, session } = data;
    const fb = report.feedback || {};

    return (
        <div className="container mx-auto max-w-4xl px-4 py-6 sm:py-8">
            <div className="flex items-center justify-between mb-6">
                <Link
                    to="/mock-interview/history"
                    className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                >
                    <LuArrowLeft size={16} />
                    Back to history
                </Link>
                <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"
                >
                    <LuDownload size={16} />
                    Download Report
                </button>
            </div>

            <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-6 text-white mb-6">
                <p className="text-sm opacity-80 mb-1">Overall Score</p>
                <p className="text-5xl font-bold">{report.score ?? "—"}/100</p>
                <p className="mt-2 text-sm opacity-90">
                    {session.role} · {session.interviewType} · {session.difficulty}
                </p>
            </div>

            {report.summary && (
                <div className="bg-white rounded-2xl border p-5 mb-6">
                    <h2 className="font-semibold text-gray-900 mb-2">Interview Summary</h2>
                    <p className="text-gray-700 text-sm leading-relaxed">{report.summary}</p>
                </div>
            )}

            {fb.aiAvailable !== false && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    <ScoreCard label="Communication" score={fb.communication || 0} />
                    <ScoreCard label="Technical Knowledge" score={fb.technicalKnowledge || 0} />
                    <ScoreCard label="Problem Solving" score={fb.problemSolving || 0} />
                    <ScoreCard label="Confidence" score={fb.confidence || 0} />
                    <ScoreCard label="Clarity" score={fb.clarity || 0} />
                    <ScoreCard label="Depth" score={fb.depth || 0} />
                    {(session.interviewType === "Technical" ||
                        session.interviewType === "Mixed") && (
                        <>
                            <ScoreCard label="Correctness" score={fb.correctness || 0} />
                            <ScoreCard label="System Design" score={fb.systemDesign || 0} />
                            <ScoreCard label="Tradeoff Thinking" score={fb.tradeoffThinking || 0} />
                            <ScoreCard
                                label="Scalability"
                                score={fb.scalabilityUnderstanding || 0}
                            />
                        </>
                    )}
                    {(session.interviewType === "Behavioral" ||
                        session.interviewType === "Mixed") && (
                        <>
                            <ScoreCard label="STAR: Situation" score={fb.starSituation || 0} max={25} />
                            <ScoreCard label="STAR: Task" score={fb.starTask || 0} max={25} />
                            <ScoreCard label="STAR: Action" score={fb.starAction || 0} max={25} />
                            <ScoreCard label="STAR: Result" score={fb.starResult || 0} max={25} />
                        </>
                    )}
                </div>
            )}

            {fb.strengths?.length > 0 && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 mb-4">
                    <h3 className="font-semibold text-emerald-800 mb-2">Strengths</h3>
                    <ul className="list-disc list-inside text-sm text-emerald-900 space-y-1">
                        {fb.strengths.map((s, i) => (
                            <li key={i}>{s}</li>
                        ))}
                    </ul>
                </div>
            )}

            {fb.weaknesses?.length > 0 && (
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 mb-4">
                    <h3 className="font-semibold text-amber-800 mb-2">Areas to Improve</h3>
                    <ul className="list-disc list-inside text-sm text-amber-900 space-y-1">
                        {fb.weaknesses.map((w, i) => (
                            <li key={i}>{w}</li>
                        ))}
                    </ul>
                </div>
            )}

            {fb.recommendations?.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 mb-6">
                    <h3 className="font-semibold text-indigo-800 mb-2">Recommendations</h3>
                    <ul className="list-disc list-inside text-sm text-indigo-900 space-y-1">
                        {fb.recommendations.map((r, i) => (
                            <li key={i}>{r}</li>
                        ))}
                    </ul>
                </div>
            )}

            <h2 className="font-semibold text-gray-900 mb-4">Questions & Answers</h2>
            <div className="space-y-4">
                {qaPairs.map((qa, i) => (
                    <div key={i} className="bg-white rounded-2xl border p-4">
                        <p className="text-xs text-indigo-600 font-semibold mb-1">
                            Q{i + 1} · {qa.questionType}
                        </p>
                        <p className="font-medium text-gray-900 mb-2">{qa.question}</p>
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{qa.answer}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MockInterviewReportPage;
