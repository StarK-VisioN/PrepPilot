import { Link } from "react-router-dom";
import { LuArrowRight, LuMessageSquare } from "react-icons/lu";

const DIFFICULTY_COLORS = {
    Easy: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Medium: "bg-amber-100 text-amber-700 border-amber-200",
    Hard: "bg-rose-100 text-rose-700 border-rose-200",
};

const BehavioralQuestionCard = ({ question }) => {
    return (
        <Link
            to={`/behavioral/${question._id}`}
            className="group block bg-white/90 backdrop-blur-sm border border-white/60 rounded-2xl shadow-sm hover:shadow-lg transition-all p-5"
        >
            <div className="flex items-start justify-between gap-3 mb-3">
                <span className="p-2 rounded-xl bg-blue-600 text-white">
                    <LuMessageSquare size={16} />
                </span>
                <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${DIFFICULTY_COLORS[question.difficulty] || DIFFICULTY_COLORS.Medium}`}
                >
                    {question.difficulty}
                </span>
            </div>

            <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors line-clamp-2">
                {question.title}
            </h3>

            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{question.question}</p>

            <div className="flex flex-wrap gap-1.5 mb-3">
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {question.category}
                </span>
                {question.tags?.slice(0, 2).map((tag) => (
                    <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600"
                    >
                        {tag}
                    </span>
                ))}
            </div>

            <span className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 group-hover:text-indigo-800">
                Practice answer
                <LuArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </span>
        </Link>
    );
};

export default BehavioralQuestionCard;
