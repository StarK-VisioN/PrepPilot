const RATING_STYLES = {
    Excellent: "from-emerald-500 to-teal-600",
    Good: "from-blue-500 to-indigo-600",
    Average: "from-amber-500 to-orange-500",
    "Needs Improvement": "from-rose-500 to-red-600",
};

const StarScoreCard = ({ score, ratingLabel, aiAvailable }) => {
    if (!aiAvailable) {
        return (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <p className="text-sm font-medium text-amber-800">
                    AI feedback is temporarily unavailable.
                </p>
                <p className="text-xs text-amber-700 mt-1">Your answer has been saved.</p>
            </div>
        );
    }

    const gradient = RATING_STYLES[ratingLabel] || "from-gray-500 to-gray-600";

    return (
        <div className={`rounded-2xl bg-gradient-to-br ${gradient} p-5 text-white shadow-md`}>
            <p className="text-sm font-medium opacity-90 mb-1">Overall STAR Score</p>
            <div className="flex items-end gap-2">
                <span className="text-4xl font-bold">{score}</span>
                <span className="text-lg opacity-80 mb-1">/100</span>
            </div>
            {ratingLabel && (
                <p className="mt-2 text-sm font-semibold bg-white/20 inline-block px-3 py-1 rounded-full">
                    {ratingLabel}
                </p>
            )}
        </div>
    );
};

export default StarScoreCard;
