const RoadmapCard = ({ week }) => (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">{week.label}</h3>
            <span className="text-xs text-gray-500">{week.focus}</span>
        </div>
        <div className="space-y-3">
            {week.topics.map((topic) => (
                <div key={topic.topic} className="border border-gray-100 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-800">{topic.topic}</span>
                        <span
                            className={`text-xs px-2 py-0.5 rounded-full ${
                                topic.priority === "high"
                                    ? "bg-rose-50 text-rose-700"
                                    : "bg-amber-50 text-amber-700"
                            }`}
                        >
                            {topic.priority} priority
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{topic.estimatedTime}</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                        {topic.milestones?.slice(0, 2).map((m, i) => (
                            <li key={i}>• {m}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    </div>
);

export default RoadmapCard;
