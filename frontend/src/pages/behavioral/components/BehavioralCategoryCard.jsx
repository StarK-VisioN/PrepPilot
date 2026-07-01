import { LuArrowLeft, LuMessageSquare, LuHistory, LuTrendingUp } from "react-icons/lu";
import { Link } from "react-router-dom";

const CATEGORY_COLORS = {
    Leadership: "from-violet-500 to-purple-600",
    "Conflict Resolution": "from-rose-500 to-pink-600",
    Teamwork: "from-blue-500 to-cyan-600",
    Ownership: "from-orange-500 to-amber-600",
    "Failure & Learning": "from-red-500 to-orange-600",
    Communication: "from-indigo-500 to-blue-600",
    "Problem Solving": "from-emerald-500 to-teal-600",
    "Time Management": "from-yellow-500 to-orange-500",
    Adaptability: "from-fuchsia-500 to-purple-600",
    "Customer Obsession": "from-sky-500 to-blue-600",
    "Project Management": "from-slate-600 to-slate-800",
    "Decision Making": "from-teal-500 to-emerald-600",
};

function getStatusLabel(status) {
    if (status === "completed") return "Completed";
    if (status === "in_progress") return "In Progress";
    return "Not Started";
}

function getStatusColor(status) {
    if (status === "completed") return "bg-emerald-100 text-emerald-700 border-emerald-200";
    if (status === "in_progress") return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-gray-100 text-gray-600 border-gray-200";
}

const BehavioralCategoryCard = ({ category }) => {
    const gradient = CATEGORY_COLORS[category.category] || "from-indigo-500 to-purple-600";

    return (
        <Link
            to={`/behavioral?category=${encodeURIComponent(category.category)}`}
            className="group block bg-white/90 backdrop-blur-sm border border-white/60 rounded-2xl shadow-sm hover:shadow-lg transition-all p-5"
        >
            <div className="flex items-start justify-between gap-3 mb-4">
                <span
                    className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm`}
                >
                    <LuMessageSquare size={18} />
                </span>
                <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${getStatusColor(category.status)}`}
                >
                    {getStatusLabel(category.status)}
                </span>
            </div>

            <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-indigo-700 transition-colors">
                {category.category}
            </h3>

            <p className="text-sm text-gray-500 mb-4">
                {category.questionCount} questions
                {category.attemptedCount > 0 && ` · ${category.attemptedCount} attempted`}
            </p>

            <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                    <span>Completion</span>
                    <span>{category.completionPercent}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all`}
                        style={{ width: `${category.completionPercent}%` }}
                    />
                </div>
            </div>

            {category.averageScore !== null && (
                <p className="mt-3 text-sm text-gray-600">
                    Avg score:{" "}
                    <span className="font-semibold text-gray-900">{category.averageScore}</span>
                    /100
                </p>
            )}
        </Link>
    );
};

export default BehavioralCategoryCard;
