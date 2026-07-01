import { Link } from "react-router-dom";
import { LuArrowRight, LuLightbulb } from "react-icons/lu";

const RecommendationCard = ({ recommendations }) => {
    if (!recommendations) return null;

    const sections = [
        { title: "Recommended Next Steps", items: recommendations.nextSteps, link: null },
        { title: "Study Recommendations", items: recommendations.studyRecommendations, link: null },
        {
            title: "Coding Practice",
            items: recommendations.suggestedCodingChallenges,
            link: "/coding",
        },
        {
            title: "Mock Interviews",
            items: recommendations.suggestedMockInterviews,
            link: "/mock-interview",
        },
        {
            title: "Behavioral Practice",
            items: recommendations.suggestedBehavioralQuestions,
            link: "/behavioral",
        },
    ];

    return (
        <div className="space-y-4">
            {recommendations.aiAvailable === false && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    Using rule-based recommendations. AI suggestions will appear when available.
                </p>
            )}
            {sections.map(
                (section) =>
                    section.items?.length > 0 && (
                        <div
                            key={section.title}
                            className="bg-white border border-gray-200 rounded-2xl p-4"
                        >
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
                                <LuLightbulb size={16} className="text-indigo-500" />
                                {section.title}
                            </h3>
                            <ul className="space-y-2">
                                {section.items.map((item, i) => (
                                    <li key={i} className="text-sm text-gray-700 flex gap-2">
                                        <span className="text-indigo-500 font-bold">{i + 1}.</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            {section.link && (
                                <Link
                                    to={section.link}
                                    className="inline-flex items-center gap-1 text-sm text-indigo-600 font-medium mt-3 hover:text-indigo-800"
                                >
                                    Go practice <LuArrowRight size={14} />
                                </Link>
                            )}
                        </div>
                    )
            )}
        </div>
    );
};

export default RecommendationCard;
