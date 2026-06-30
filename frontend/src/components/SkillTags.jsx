import React from 'react';
import { LuX } from 'react-icons/lu';
import { isCustomSkill } from '../utils/extractSkills';

const SkillTags = ({
  skills = [],
  customSkills = [],
  selectedSkill = null,
  loadingSkill = null,
  onSkillClick,
  onRemoveCustom,
  maxVisible,
  size = 'sm',
  className = '',
}) => {
  if (!skills.length) return null;

  const visible = maxVisible ? skills.slice(0, maxVisible) : skills;
  const overflow = maxVisible && skills.length > maxVisible ? skills.length - maxVisible : 0;
  const interactive = typeof onSkillClick === 'function';

  const sizeClasses =
    size === 'xs'
      ? 'text-[10px] px-2 py-0.5'
      : 'text-xs px-2.5 py-1';

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {visible.map((skill) => {
        const isSelected =
          selectedSkill && selectedSkill.toLowerCase() === skill.toLowerCase();
        const isLoading =
          loadingSkill && loadingSkill.toLowerCase() === skill.toLowerCase();
        const isCustom = isCustomSkill(skill, customSkills);

        const Tag = interactive ? 'button' : 'span';

        return (
          <span key={skill} className="inline-flex items-center">
            <Tag
              type={interactive ? 'button' : undefined}
              onClick={
                interactive
                  ? (e) => {
                      e.stopPropagation?.();
                      onSkillClick(skill);
                    }
                  : undefined
              }
              disabled={interactive && !!loadingSkill}
              className={`inline-flex items-center gap-1 rounded-full border font-medium transition-all ${sizeClasses} ${
                isSelected
                  ? 'bg-orange-100 text-orange-800 border-orange-300 shadow-sm ring-1 ring-orange-200'
                  : isCustom
                    ? 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100 hover:border-indigo-300'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200'
              } ${interactive ? 'cursor-pointer disabled:opacity-60 disabled:cursor-wait' : ''} ${
                isCustom && onRemoveCustom ? 'rounded-r-none border-r-0 pr-2' : ''
              }`}
            >
              {isLoading && (
                <span
                  className="inline-block w-3 h-3 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin shrink-0"
                  aria-hidden="true"
                />
              )}
              {isCustom && (
                <span className="text-[9px] font-bold uppercase tracking-wide opacity-70">
                  Custom
                </span>
              )}
              {skill}
            </Tag>
            {isCustom && onRemoveCustom && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveCustom(skill);
                }}
                className={`inline-flex items-center justify-center rounded-r-full border border-l-0 font-medium transition-colors ${sizeClasses} ${
                  isSelected
                    ? 'bg-orange-100 text-orange-700 border-orange-300 hover:bg-orange-200'
                    : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'
                } px-1.5`}
                aria-label={`Remove ${skill}`}
              >
                <LuX size={12} />
              </button>
            )}
          </span>
        );
      })}
      {overflow > 0 && (
        <span
          className={`inline-flex items-center rounded-full border border-gray-200 bg-white text-gray-500 font-medium ${sizeClasses}`}
        >
          +{overflow} more
        </span>
      )}
    </div>
  );
};

export default SkillTags;
