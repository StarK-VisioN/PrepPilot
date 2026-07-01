import AtsScoreCard from "./AtsScoreCard";
import ResumeUploadButton from "./ResumeUploadButton";
import ResumeHistoryList from "./ResumeHistoryList";

const ListSection = ({ title, items, variant = "default" }) => {
    if (!items?.length) return null;

    const styles = {
        default: "bg-gray-50 border-gray-100 text-gray-800",
        strength: "bg-emerald-50 border-emerald-100 text-emerald-900",
        weakness: "bg-rose-50 border-rose-100 text-rose-900",
        missing: "bg-amber-50 border-amber-100 text-amber-900",
    };

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
            <ul className="space-y-2">
                {items.map((item, i) => (
                    <li
                        key={i}
                        className={`text-sm border rounded-xl px-3 py-2 ${styles[variant]}`}
                    >
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const ResumeAnalysisSection = ({
    analysis,
    history,
    foundation,
    onUpload,
    onDelete,
    uploading,
    setUploading,
    deletingId,
}) => {
    const hasAnalysis = analysis && analysis.analysisStatus !== undefined;

    return (
        <section className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Resume ATS Analysis</h2>
                    <p className="text-sm text-gray-600">
                        Upload your resume to anchor weakness insights before platform activity builds up
                    </p>
                </div>
                <ResumeUploadButton
                    onUploaded={onUpload}
                    uploading={uploading}
                    setUploading={setUploading}
                />
            </div>

            {!hasAnalysis ? (
                <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 border border-indigo-100 rounded-2xl p-8 text-center">
                    <p className="text-gray-700 mb-2 font-medium">No resume analyzed yet</p>
                    <p className="text-sm text-gray-600 max-w-md mx-auto">
                        Upload a PDF resume to get ATS score, skill gaps, role fit, and a personalized
                        learning roadmap as your starting point.
                    </p>
                </div>
            ) : (
                <>
                    {analysis.analysisStatus === "text_only" && (
                        <div className="mb-4 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-xl px-4 py-3">
                            {analysis.message ||
                                "AI resume analysis is temporarily unavailable. Your resume text was saved."}
                        </div>
                    )}

                    {analysis.summary && (
                        <div className="mb-4 bg-white border border-gray-200 rounded-2xl p-5">
                            <h3 className="font-semibold text-gray-900 mb-2">Summary</h3>
                            <p className="text-sm text-gray-700">{analysis.summary}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                        <AtsScoreCard
                            score={analysis.atsScore}
                            roleFitScore={analysis.roleFit?.score}
                            foundation={foundation}
                        />

                        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5">
                            <h3 className="font-semibold text-gray-900 mb-3">Best Fit Roles</h3>
                            {analysis.roleFit?.bestFitRoles?.length ? (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {analysis.roleFit.bestFitRoles.map((role) => (
                                        <span
                                            key={role}
                                            className="text-sm bg-indigo-50 text-indigo-800 px-3 py-1 rounded-full"
                                        >
                                            {role}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 mb-4">No role recommendations yet.</p>
                            )}

                            {analysis.keywordMatch && (
                                <>
                                    <h4 className="text-sm font-medium text-gray-800 mb-2">Keyword Match</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <p className="text-xs text-emerald-700 font-medium mb-1">Matched</p>
                                            <p className="text-gray-600">
                                                {(analysis.keywordMatch.matched || []).join(", ") || "—"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-rose-700 font-medium mb-1">Missing</p>
                                            <p className="text-gray-600">
                                                {(analysis.keywordMatch.missing || []).join(", ") || "—"}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <ListSection title="Resume Strengths" items={analysis.strengths} variant="strength" />
                        <ListSection title="Resume Weaknesses" items={analysis.weaknesses} variant="weakness" />
                        <ListSection title="Missing Skills" items={analysis.missingSkills} variant="missing" />
                        <ListSection
                            title="Recommended Improvements"
                            items={analysis.improvementSuggestions}
                        />
                    </div>

                    {analysis.formattingFeedback?.length > 0 && (
                        <div className="mb-4 bg-white border border-gray-200 rounded-2xl p-5">
                            <h3 className="font-semibold text-gray-900 mb-3">Formatting Feedback</h3>
                            <ul className="text-sm text-gray-700 space-y-1">
                                {analysis.formattingFeedback.map((tip, i) => (
                                    <li key={i}>• {tip}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </>
            )}

            <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-5">
                <h3 className="font-semibold text-gray-900 mb-3">Resume Analysis History</h3>
                <ResumeHistoryList
                    history={history}
                    onDelete={onDelete}
                    deletingId={deletingId}
                />
            </div>
        </section>
    );
};

export default ResumeAnalysisSection;
