import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { LuArrowLeft, LuLoader } from "react-icons/lu";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import BehavioralAnswerForm from "./components/BehavioralAnswerForm";
import StarScoreCard from "./components/StarScoreCard";
import StarBreakdown from "./components/StarBreakdown";
import ImprovementSuggestions from "./components/ImprovementSuggestions";

const BehavioralPracticePage = () => {
    const { questionId } = useParams();
    const [question, setQuestion] = useState(null);
    const [userProgress, setUserProgress] = useState(null);
    const [answer, setAnswer] = useState("");
    const [evaluation, setEvaluation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get(
                    API_PATHS.BEHAVIORAL.QUESTION_BY_ID(questionId)
                );
                setQuestion(response.data.question);
                setUserProgress(response.data.userProgress);

                const last = response.data.userProgress?.lastSubmission;
                if (last?.answer) {
                    setAnswer(last.answer);
                }
                if (last?.evaluation) {
                    setEvaluation(last.evaluation);
                }
            } catch (error) {
                console.error("Failed to load question:", error);
                toast.error("Failed to load behavioral question");
            } finally {
                setLoading(false);
            }
        };

        if (questionId) fetchQuestion();
    }, [questionId]);

    const handleSubmit = async () => {
        if (!answer.trim()) return;

        try {
            setSubmitting(true);
            const response = await axiosInstance.post(API_PATHS.BEHAVIORAL.SUBMIT, {
                questionId,
                answer: answer.trim(),
            });

            const submission = response.data.submission;
            setEvaluation(submission.evaluation);

            if (response.data.aiAvailable === false) {
                toast.warn("Answer saved. AI feedback is temporarily unavailable.");
            } else {
                toast.success(`Score: ${submission.score}/100`);
            }

            setUserProgress((prev) => ({
                ...prev,
                attemptCount: (prev?.attemptCount || 0) + 1,
                bestScore: Math.max(prev?.bestScore || 0, submission.score),
                lastSubmission: submission,
                history: [submission, ...(prev?.history || [])],
            }));
        } catch (error) {
            console.error("Submit failed:", error);
            toast.error(error.response?.data?.message || "Failed to submit answer");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <LuLoader className="animate-spin text-indigo-500" size={32} />
            </div>
        );
    }

    if (!question) {
        return (
            <div className="container mx-auto max-w-3xl px-4 py-16 text-center">
                <p className="text-gray-600 mb-4">Question not found.</p>
                <Link to="/behavioral" className="text-indigo-600 font-medium">
                    Back to behavioral practice
                </Link>
            </div>
        );
    }

    const scoreHistory = (userProgress?.history || [])
        .filter((h) => h.score > 0)
        .map((h) => ({ score: h.score, date: h.createdAt }))
        .reverse();

    return (
        <div className="container mx-auto max-w-7xl px-4 py-6 sm:py-8">
            <Link
                to={`/behavioral?category=${encodeURIComponent(question.category)}`}
                className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 mb-6"
            >
                <LuArrowLeft size={16} />
                Back to {question.category}
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white/90 border border-white/60 rounded-2xl p-6 shadow-sm">
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
                            {question.category}
                        </span>
                        <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                            {question.difficulty}
                        </span>
                    </div>

                    <h1 className="text-xl font-bold text-gray-900 mb-4">{question.title}</h1>
                    <p className="text-gray-700 leading-relaxed mb-6">{question.question}</p>

                    {question.hints?.length > 0 && (
                        <div className="rounded-xl bg-indigo-50/80 border border-indigo-100 p-4">
                            <h3 className="text-sm font-semibold text-indigo-900 mb-2">
                                Tips for answering
                            </h3>
                            <ul className="space-y-1.5">
                                {question.hints.map((hint, i) => (
                                    <li key={i} className="text-sm text-indigo-800 flex gap-2">
                                        <span className="font-bold text-indigo-500">{i + 1}.</span>
                                        {hint}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="bg-white/90 border border-white/60 rounded-2xl p-6 shadow-sm min-h-[420px] flex flex-col">
                    <BehavioralAnswerForm
                        answer={answer}
                        onChange={setAnswer}
                        onSubmit={handleSubmit}
                        submitting={submitting}
                        attemptCount={userProgress?.attemptCount || 0}
                        bestScore={userProgress?.bestScore}
                    />
                </div>
            </div>

            {evaluation && (
                <section className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900">STAR Evaluation Results</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <StarScoreCard
                            score={evaluation.score}
                            ratingLabel={evaluation.ratingLabel}
                            aiAvailable={evaluation.aiAvailable !== false}
                        />

                        {scoreHistory.length > 1 && (
                            <div className="lg:col-span-2 bg-white/90 border border-white/60 rounded-2xl p-5">
                                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                                    Score Improvement History
                                </h3>
                                <div className="flex items-end gap-2 h-24">
                                    {scoreHistory.map((point, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                            <span className="text-xs font-semibold text-gray-700">
                                                {point.score}
                                            </span>
                                            <div
                                                className="w-full bg-gradient-to-t from-indigo-500 to-purple-400 rounded-t-md"
                                                style={{ height: `${Math.max(point.score, 5)}%` }}
                                            />
                                            <span className="text-[10px] text-gray-400">
                                                #{i + 1}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {evaluation.aiAvailable !== false && (
                        <>
                            <StarBreakdown evaluation={evaluation} />
                            <ImprovementSuggestions
                                suggestions={evaluation.improvementSuggestions}
                                overallFeedback={evaluation.overallFeedback}
                            />
                        </>
                    )}
                </section>
            )}
        </div>
    );
};

export default BehavioralPracticePage;
