import React from "react";
import { LuTrash2, LuFileText, LuUser, LuLayers, LuTarget } from "react-icons/lu";
import { getInitials } from "../utils/helper";
import { getSessionSourceConfig, getCompanyDisplayName } from "../utils/data";
const SOURCE_ICONS = {
  jd: LuFileText,
  resume: LuUser,
  combined: LuLayers,
  manual: LuTarget,
};

const SummaryCard = ({
  role,
  topicsToFocus,
  experience,
  questions,
  description,
  company,
  customCompanyName,
  sourceType,
  lastUpdated,
  onSelect,
  onDelete,
}) => {
  const type = sourceType || "manual";
  const source = getSessionSourceConfig(type);
  const SourceIcon = SOURCE_ICONS[type] || LuTarget;

  const companyLabel = getCompanyDisplayName(company, customCompanyName);
  return (
    <div
      className={`bg-white border border-gray-300/40 border-l-4 ${source.borderClass} rounded-xl overflow-hidden cursor-pointer hover:shadow-xl shadow-gray-100 relative group h-[280px] flex flex-col`}
      onClick={onSelect}
    >
      {/* Prep mode ribbon */}
      <div
        className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold ${source.ribbonClass}`}
      >
        <SourceIcon size={13} />
        <span>{source.label} Prep</span>
        {company && company !== "generic" && (
          <span className="ml-auto opacity-90 text-[10px] font-medium">
            · {companyLabel}
          </span>
        )}
      </div>

      <div className="p-2 flex flex-col flex-1 min-h-0">
        <div
          className="rounded-lg p-4 relative flex-shrink-0 h-[96px]"
          style={{ background: source.headerBg }}
        >
          <div className="flex items-start gap-3 min-w-0 pr-8">
            <div className="flex-shrink-0 w-11 h-11 bg-white rounded-md flex items-center justify-center shadow-sm">
              <span className="text-base font-semibold text-black">{getInitials(role)}</span>
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-[16px] font-medium text-gray-900 truncate" title={role}>
                {role || "Untitled Session"}
              </h2>
              <p
                className="text-xs text-gray-700 mt-1 line-clamp-2 leading-relaxed"
                title={topicsToFocus}
              >
                {topicsToFocus || "No topics listed"}
              </p>
            </div>
          </div>

          <button
            className="hidden group-hover:flex items-center gap-2 text-xs text-rose-500 font-medium bg-rose-50 px-3 py-1 rounded text-nowrap border border-rose-100 hover:border-rose-200 cursor-pointer absolute top-2 right-2"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <LuTrash2 />
          </button>
        </div>

        <div className="px-1 pb-1 pt-3 flex flex-col flex-1 min-h-0">
          <div className="flex items-center gap-2 flex-wrap min-h-[44px] content-start">
            <span
              className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${source.badgeClass}`}
            >
              {source.label}
            </span>

            <div className="text-[10px] font-medium text-black px-2.5 py-1 border border-gray-300 rounded-full whitespace-nowrap">
              {experience} {experience == 1 ? "yr" : "yrs"}
            </div>

            <div className="text-[10px] font-medium text-black px-2.5 py-1 border border-gray-300 rounded-full whitespace-nowrap">
              {questions?.length || 0} Q&A
            </div>

            <div className="text-[10px] font-medium text-gray-500 px-2.5 py-1 whitespace-nowrap">
              {lastUpdated}
            </div>
          </div>

          <p
            className="text-[13px] text-gray-500 font-medium mt-auto line-clamp-2 leading-snug px-1"
            title={description}
          >
            {description || "No description"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
