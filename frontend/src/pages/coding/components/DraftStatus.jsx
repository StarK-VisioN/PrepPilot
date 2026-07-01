import { LuCloud, LuCloudOff, LuCheck } from "react-icons/lu";

const DraftStatus = ({ status }) => {
  if (!status) return null;

  const config = {
    saving: {
      icon: LuCloud,
      text: "Saving draft...",
      className: "text-gray-500",
    },
    saved: {
      icon: LuCheck,
      text: "Draft saved",
      className: "text-emerald-600",
    },
    restored: {
      icon: LuCloud,
      text: "Draft restored",
      className: "text-blue-600",
    },
    error: {
      icon: LuCloudOff,
      text: "Draft save unavailable",
      className: "text-gray-400",
    },
  }[status];

  if (!config) return null;

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 text-xs ${config.className}`}>
      <Icon size={14} />
      {config.text}
    </span>
  );
};

export default DraftStatus;
