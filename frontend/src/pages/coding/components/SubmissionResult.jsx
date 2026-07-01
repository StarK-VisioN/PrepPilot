import { LuCircleCheck, LuCircleX, LuTriangleAlert } from "react-icons/lu";

const STATUS_CONFIG = {
  Accepted: {
    icon: LuCircleCheck,
    className: "bg-emerald-50 border-emerald-200 text-emerald-800",
    label: "Accepted",
  },
  Failed: {
    icon: LuCircleX,
    className: "bg-rose-50 border-rose-200 text-rose-800",
    label: "Failed",
  },
  Error: {
    icon: LuTriangleAlert,
    className: "bg-amber-50 border-amber-200 text-amber-800",
    label: "Error",
  },
};

const SubmissionResult = ({ submission }) => {
  if (!submission) return null;

  const config = STATUS_CONFIG[submission.status] || STATUS_CONFIG.Error;
  const Icon = config.icon;

  return (
    <div className={`border rounded-xl p-4 ${config.className}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={20} />
        <span className="font-semibold">{config.label}</span>
      </div>
      <p className="text-sm">
        {submission.passedCount}/{submission.totalCount} test cases passed
        {submission.runtimeMs != null && ` · ${submission.runtimeMs}ms total`}
        {submission.language && ` · ${submission.language}`}
      </p>
    </div>
  );
};

export default SubmissionResult;
