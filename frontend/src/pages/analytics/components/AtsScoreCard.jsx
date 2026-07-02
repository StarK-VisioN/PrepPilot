const AtsScoreCard = ({ score, roleFitScore, foundation }) => {
    const ats = score ?? 0;
    const roleFit = roleFitScore ?? 0;

    const scoreColor = (val) => {
        if (val >= 75) return "text-emerald-600";
        if (val >= 50) return "text-amber-600";
        return "text-rose-600";
    };

    const ringColor = (val) => {
        if (val >= 75) return "from-emerald-500 to-teal-600";
        if (val >= 50) return "from-blue-400 to-blue-600";
        return "from-rose-500 to-red-600";
    };

    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900">ATS Resume Score</h2>
                {foundation && (
                    <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full capitalize">
                        {foundation}-based insights
                    </span>
                )}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                    <div
                        className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br ${ringColor(ats)} text-white shadow-md mb-2`}
                    >
                        <div className="text-center">
                            <span className="text-3xl font-bold">{ats}</span>
                            <p className="text-xs opacity-80">/100</p>
                        </div>
                    </div>
                    <p className={`text-sm font-medium ${scoreColor(ats)}`}>ATS Compatibility</p>
                </div>
                <div className="text-center">
                    <div
                        className={`inline-flex items-center justify-center w-24 h-24 rounded-full bg-blue-600 text-white shadow-md mb-2`}
                    >
                        <div className="text-center">
                            <span className="text-3xl font-bold">{roleFit}</span>
                            <p className="text-xs opacity-80">/100</p>
                        </div>
                    </div>
                    <p className={`text-sm font-medium ${scoreColor(roleFit)}`}>Role Fit</p>
                </div>
            </div>
        </div>
    );
};

export default AtsScoreCard;
