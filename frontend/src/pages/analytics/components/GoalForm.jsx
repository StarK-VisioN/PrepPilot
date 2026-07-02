import { useState } from "react";
import { LuTarget, LuSave } from "react-icons/lu";

const GoalForm = ({ goals, onSave, saving }) => {
    const [form, setForm] = useState({
        targetCompany: goals?.targetCompany || "",
        targetRole: goals?.targetRole || "Software Engineer",
        targetInterviewDate: goals?.targetInterviewDate
            ? new Date(goals.targetInterviewDate).toISOString().slice(0, 10)
            : "",
        skillLevel: goals?.skillLevel || "Intermediate",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(form);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <LuTarget size={18} className="text-indigo-600" />
                Learning Goals
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Target Company</label>
                    <input
                        type="text"
                        value={form.targetCompany}
                        onChange={(e) => setForm({ ...form, targetCompany: e.target.value })}
                        placeholder="e.g. Amazon, Google"
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Target Role</label>
                    <input
                        type="text"
                        value={form.targetRole}
                        onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Interview Date</label>
                    <input
                        type="date"
                        value={form.targetInterviewDate}
                        onChange={(e) =>
                            setForm({ ...form, targetInterviewDate: e.target.value })
                        }
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500 block mb-1">Skill Level</label>
                    <select
                        value={form.skillLevel}
                        onChange={(e) => setForm({ ...form, skillLevel: e.target.value })}
                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
                    >
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                    </select>
                </div>
            </div>

            <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
                <LuSave size={16} />
                {saving ? "Saving..." : "Save Goals"}
            </button>
        </form>
    );
};

export default GoalForm;
