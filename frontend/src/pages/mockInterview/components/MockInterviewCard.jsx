import { Link } from "react-router-dom";
import { LuMic, LuArrowRight } from "react-icons/lu";

const PERSONALITY_LABELS = {
    friendly: "Friendly",
    strict: "Strict",
    faang: "FAANG Interviewer",
    "startup-founder": "Startup Founder",
    "senior-engineer": "Senior Engineer",
};

const MockInterviewCard = ({ session }) => {
    const statusColors = {
        active: "bg-amber-100 text-amber-700",
        completed: "bg-emerald-100 text-emerald-700",
        abandoned: "bg-gray-100 text-gray-600",
    };

    return (
        <Link
            to={
                session.status === "completed"
                    ? `/mock-interview/report/${session._id}`
                    : `/mock-interview/session/${session._id}`
            }
            className="block bg-white/90 border border-white/60 rounded-2xl p-5 hover:shadow-lg transition-all"
        >
            <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-semibold text-gray-900">{session.role}</h3>
                <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[session.status] || statusColors.active}`}
                >
                    {session.status}
                </span>
            </div>
            <p className="text-sm text-gray-500 mb-3">
                {session.interviewType} · {session.difficulty} · {session.duration} min
            </p>
            {session.score !== null && session.score > 0 && (
                <p className="text-2xl font-bold text-indigo-600 mb-2">{session.score}/100</p>
            )}
            <span className="inline-flex items-center gap-1 text-sm text-indigo-600 font-medium">
                {session.status === "completed" ? "View report" : "Resume"}
                <LuArrowRight size={14} />
            </span>
        </Link>
    );
};

export { PERSONALITY_LABELS };
export default MockInterviewCard;
