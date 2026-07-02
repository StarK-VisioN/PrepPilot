import { LuFilter } from "react-icons/lu";

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];

const ChallengeFilters = ({ difficulty, onDifficultyChange, tag, onTagChange, allTags = [] }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
      <div className="flex items-center gap-2 flex-wrap">
        <LuFilter size={16} className="text-gray-500 shrink-0" />
        {DIFFICULTIES.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onDifficultyChange(level === "All" ? "" : level)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              (level === "All" && !difficulty) || difficulty === level
                ? "bg-blue-600 text-white"
                : "bg-white/80 text-gray-700 hover:bg-white border border-gray-200"
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      {allTags.length > 0 && (
        <select
          value={tag}
          onChange={(e) => onTagChange(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white/80 text-gray-700 max-w-xs"
        >
          <option value="">All tags</option>
          {allTags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default ChallengeFilters;
