import React from "react";
import { LuTrash2, LuFileText, LuUser, LuLayers, LuTarget, LuArrowRight } from "react-icons/lu";
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
  const showCompany = company && company !== "generic";

  return (
    <div
      className="group relative bg-white border border-slate-200/80 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="shrink-0 w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center">
            <span className="text-sm font-bold text-slate-700">{getInitials(role)}</span>
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-900 truncate" title={role}>
              {role || "Untitled Session"}
            </h3>
            <p className="text-xs text-slate-500 truncate mt-0.5" title={topicsToFocus}>
              {topicsToFocus || "No topics listed"}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="shrink-0 opacity-0 group-hover:opacity-100 p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Delete session"
        >
          <LuTrash2 size={16} />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span
          className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border ${source.badgeClass}`}
        >
          <SourceIcon size={11} />
          {source.label}
        </span>
        {showCompany && (
          <span className="text-[11px] font-medium text-slate-600 px-2.5 py-1 rounded-full bg-slate-100">
            {companyLabel}
          </span>
        )}
        <span className="text-[11px] font-medium text-slate-500 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100">
          {experience} {experience == 1 ? "yr" : "yrs"}
        </span>
        <span className="text-[11px] font-medium text-slate-500 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100">
          {questions?.length || 0} questions
        </span>
      </div>

      {description && (
        <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed mb-4" title={description}>
          {description}
        </p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <span className="text-xs text-slate-400">{lastUpdated}</span>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity">
          Open
          <LuArrowRight size={14} />
        </span>
      </div>
    </div>
  );
};

export default SummaryCard;
