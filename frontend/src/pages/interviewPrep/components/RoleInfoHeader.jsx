import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LuArrowLeft, LuPlus } from "react-icons/lu";
import { getSessionSourceConfig, getCompanyDisplayName } from "../../../utils/data";
import { extractSkills, mergeSessionSkills } from "../../../utils/extractSkills";
import SkillTags from "../../../components/SkillTags";

const RoleInfoHeader = ({
  role,
  topicsToFocus,
  experience,
  questions,
  description,
  company,
  customCompanyName,
  sourceType,
  lastUpdated,
  skills: persistedSkills,
  customSkills = [],
  selectedSkill,
  loadingSkill,
  onSkillClick,
  onAddCustomSkill,
  onRemoveCustomSkill,
  isSavingCustomSkill = false,
}) => {
  const navigate = useNavigate();
  const [showTopics, setShowTopics] = useState(false);
  const [customSkillInput, setCustomSkillInput] = useState("");
  const [addError, setAddError] = useState("");

  const source = getSessionSourceConfig(sourceType || "manual");
  const companyLabel = getCompanyDisplayName(company, customCompanyName);

  const extractedSkills = useMemo(() => {
    if (persistedSkills?.length) return persistedSkills;
    return extractSkills(topicsToFocus || description || "", {
      topicsToFocus,
      description,
    });
  }, [persistedSkills, topicsToFocus, description]);

  const mergedSkills = useMemo(
    () => mergeSessionSkills(extractedSkills, customSkills),
    [extractedSkills, customSkills]
  );

  const handleAddSkill = (e) => {
    e.preventDefault();
    const trimmed = customSkillInput.trim();
    if (!trimmed) {
      setAddError("Enter a skill or topic name.");
      return;
    }
    const isDuplicate = mergedSkills.some(
      (s) => s.toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      setAddError("This skill is already in the list.");
      return;
    }
    setAddError("");
    onAddCustomSkill?.(trimmed);
    setCustomSkillInput("");
  };

  const showSkillSection = onSkillClick || onAddCustomSkill;

  return (
    <div className="relative overflow-hidden border-b border-gray-200/60 bg-gradient-to-br from-slate-50 via-white to-orange-50/30">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-teal-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-200/30 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 md:px-10 lg:px-14 py-8 sm:py-10">
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 mb-4 -ml-1 px-2 py-1.5 rounded-lg hover:bg-white/60 transition-colors"
        >
          <LuArrowLeft size={16} />
          All sessions
        </button>

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span
            className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${source.badgeClass}`}
          >
            {source.label} Prep
          </span>
          {company && company !== "generic" && (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
              {companyLabel}
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          {role || "Interview Session"}
        </h1>

        {description && (
          <p className="text-sm text-gray-600 mt-2 max-w-2xl">{description}</p>
        )}

        {topicsToFocus && (
          <div className="mt-3">
            <p
              className={`text-sm text-gray-600 leading-relaxed ${
                showTopics ? "" : "line-clamp-2"
              }`}
            >
              {topicsToFocus}
            </p>
            {topicsToFocus.length > 120 && (
              <button
                type="button"
                onClick={() => setShowTopics(!showTopics)}
                className="text-xs font-medium text-orange-600 hover:text-orange-700 mt-1"
              >
                {showTopics ? "Show less" : "Show full topics"}
              </button>
            )}
          </div>
        )}

        {showSkillSection && (
          <div className="mt-4">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Skill tags · click to deep dive
            </p>

            {onAddCustomSkill && (
              <form
                onSubmit={handleAddSkill}
                className="flex flex-col sm:flex-row gap-2 mb-3 max-w-xl"
              >
                <input
                  type="text"
                  value={customSkillInput}
                  onChange={(e) => {
                    setCustomSkillInput(e.target.value);
                    if (addError) setAddError("");
                  }}
                  placeholder="Add a skill or topic..."
                  disabled={isSavingCustomSkill}
                  className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 disabled:opacity-60"
                />
                <button
                  type="submit"
                  disabled={isSavingCustomSkill}
                  className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-lg transition-colors disabled:opacity-60 shrink-0"
                >
                  <LuPlus size={16} />
                  Add
                </button>
              </form>
            )}

            {addError && (
              <p className="text-xs text-red-600 mb-2">{addError}</p>
            )}

            {mergedSkills.length > 0 ? (
              <SkillTags
                skills={mergedSkills}
                customSkills={customSkills}
                selectedSkill={selectedSkill}
                loadingSkill={loadingSkill}
                onSkillClick={onSkillClick}
                onRemoveCustom={onRemoveCustomSkill}
              />
            ) : (
              <p className="text-xs text-gray-500">
                No skills detected yet — add a custom topic above to start a deep dive.
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mt-5">
          <span className="text-[11px] font-medium text-gray-700 bg-white/80 border border-gray-200 px-3 py-1 rounded-full">
            {experience} {String(experience) === "1" ? "yr" : "yrs"} exp
          </span>
          <span className="text-[11px] font-medium text-gray-700 bg-white/80 border border-gray-200 px-3 py-1 rounded-full">
            {questions} Q&amp;A
          </span>
          <span className="text-[11px] font-medium text-gray-500 bg-white/60 border border-gray-100 px-3 py-1 rounded-full">
            Updated {lastUpdated}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RoleInfoHeader;
