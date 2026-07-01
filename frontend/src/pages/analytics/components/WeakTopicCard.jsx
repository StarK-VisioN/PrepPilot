const WeakTopicCard = ({ topic }) => {
    const trendColors = {
        improving: "text-emerald-600",
        declining: "text-rose-600",
        stable: "text-gray-500",
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-semibold text-gray-900">{topic.topic}</h4>
                <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-100">
                    {topic.weakScore}% weak
                </span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-2">
                <span className="capitalize">{topic.category}</span>
                <span>·</span>
                <span>{topic.attempts} attempts</span>
                <span>·</span>
                <span className={trendColors[topic.trend] || trendColors.stable}>{topic.trend}</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-rose-400 to-orange-400 rounded-full"
                    style={{ width: `${topic.averageScore}%` }}
                />
            </div>
            <p className="text-xs text-gray-500 mt-1">Score: {topic.averageScore}%</p>
        </div>
    );
};

export default WeakTopicCard;
