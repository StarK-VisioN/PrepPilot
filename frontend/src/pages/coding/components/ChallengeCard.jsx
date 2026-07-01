import { Link } from "react-router-dom";
import DifficultyBadge from "./DifficultyBadge";
import { LuCode, LuArrowRight } from "react-icons/lu";

const ChallengeCard = ({ challenge }) => {
  return (
    <Link
      to={`/coding/${challenge.slug}`}
      className="group block bg-white/90 backdrop-blur-sm border border-white/60 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-orange-200 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="p-2 rounded-lg bg-orange-50 text-orange-600 shrink-0">
            <LuCode size={18} />
          </span>
          <h3 className="font-semibold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
            {challenge.title}
          </h3>
        </div>
        <DifficultyBadge difficulty={challenge.difficulty} />
      </div>

      <p className="text-sm text-gray-600 line-clamp-2 mb-4 min-h-[2.5rem]">
        {challenge.description}
      </p>

      {challenge.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {challenge.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-md bg-gray-100 text-gray-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center text-sm font-medium text-orange-600 group-hover:gap-2 transition-all">
        Solve challenge
        <LuArrowRight size={16} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
};

export default ChallengeCard;
