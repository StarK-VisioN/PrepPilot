import { LuLightbulb } from "react-icons/lu";

const ImprovementSuggestions = ({ suggestions = [], overallFeedback }) => {
    if (!overallFeedback && suggestions.length === 0) return null;

    return (
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 space-y-4">
            {overallFeedback && (
                <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2">Overall Feedback</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{overallFeedback}</p>
                </div>
            )}

            {suggestions.length > 0 && (
                <div>
                    <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
                        <LuLightbulb size={16} className="text-indigo-600" />
                        Improvement Suggestions
                    </h3>
                    <ul className="space-y-2">
                        {suggestions.map((item, i) => (
                            <li
                                key={i}
                                className="text-sm text-gray-700 flex gap-2 leading-relaxed"
                            >
                                <span className="text-indigo-500 font-bold shrink-0">{i + 1}.</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default ImprovementSuggestions;
