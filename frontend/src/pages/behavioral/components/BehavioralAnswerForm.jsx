const MAX_CHARS = 5000;

const BehavioralAnswerForm = ({
    answer,
    onChange,
    onSubmit,
    submitting,
    disabled,
    attemptCount = 0,
    bestScore = null,
}) => {
    const charCount = answer.length;
    const nearLimit = charCount > MAX_CHARS * 0.9;

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">Your Answer</h2>
                {attemptCount > 0 && (
                    <span className="text-xs text-gray-500">
                        Attempt {attemptCount + 1}
                        {bestScore !== null && ` · Best: ${bestScore}/100`}
                    </span>
                )}
            </div>

            <textarea
                value={answer}
                onChange={(e) => onChange(e.target.value.slice(0, MAX_CHARS))}
                disabled={disabled || submitting}
                placeholder="Structure your answer using STAR: Situation, Task, Action, Result..."
                className="flex-1 min-h-[280px] w-full resize-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 disabled:opacity-60"
            />

            <div className="flex items-center justify-between mt-3 gap-3">
                <span className={`text-xs ${nearLimit ? "text-amber-600" : "text-gray-400"}`}>
                    {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
                </span>

                <button
                    type="button"
                    disabled
                    title="Coming soon"
                    className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed"
                >
                    Record answer (soon)
                </button>
            </div>

            <button
                type="button"
                onClick={onSubmit}
                disabled={submitting || disabled || !answer.trim()}
                className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-sm hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                {submitting ? "Evaluating with STAR..." : "Submit for STAR Evaluation"}
            </button>
        </div>
    );
};

export default BehavioralAnswerForm;
