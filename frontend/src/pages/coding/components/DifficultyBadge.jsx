const DIFFICULTY_STYLES = {
  Easy: "bg-emerald-100 text-emerald-800 border-emerald-200",
  Medium: "bg-amber-100 text-amber-800 border-amber-200",
  Hard: "bg-rose-100 text-rose-800 border-rose-200",
};

const DifficultyBadge = ({ difficulty }) => {
  const style = DIFFICULTY_STYLES[difficulty] || "bg-gray-100 text-gray-700 border-gray-200";

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${style}`}>
      {difficulty}
    </span>
  );
};

export default DifficultyBadge;
