const ScoreCard = ({ label, score, max = 100 }) => {
    const pct = Math.round((score / max) * 100);

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">{label}</span>
                <span className="text-sm font-bold text-gray-900">
                    {score}/{max}
                </span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
};

export default ScoreCard;
