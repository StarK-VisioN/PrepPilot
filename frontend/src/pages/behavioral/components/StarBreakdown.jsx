import { LuCheck, LuX } from "react-icons/lu";

const STAR_SECTIONS = [
    { key: "situation", label: "Situation", letter: "S" },
    { key: "task", label: "Task", letter: "T" },
    { key: "action", label: "Action", letter: "A" },
    { key: "result", label: "Result", letter: "R" },
];

const StarBreakdown = ({ evaluation }) => {
    if (!evaluation) return null;

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                STAR Breakdown
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {STAR_SECTIONS.map(({ key, label, letter }) => {
                    const section = evaluation[key] || {};
                    const present = section.present;
                    const score = section.score ?? 0;

                    return (
                        <div
                            key={key}
                            className="rounded-xl border border-gray-200 bg-white p-4"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">
                                        {letter}
                                    </span>
                                    <span className="font-medium text-gray-900">{label}</span>
                                </div>
                                <span
                                    className={`inline-flex items-center gap-1 text-xs font-semibold ${
                                        present ? "text-emerald-600" : "text-rose-600"
                                    }`}
                                >
                                    {present ? (
                                        <>
                                            <LuCheck size={14} /> Present
                                        </>
                                    ) : (
                                        <>
                                            <LuX size={14} /> Missing
                                        </>
                                    )}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 mb-2">
                                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                                        style={{ width: `${(score / 25) * 100}%` }}
                                    />
                                </div>
                                <span className="text-xs font-semibold text-gray-600 w-12 text-right">
                                    {score}/25
                                </span>
                            </div>

                            {section.feedback && (
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    {section.feedback}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StarBreakdown;
