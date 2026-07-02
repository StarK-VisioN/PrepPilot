import React, { useState } from "react";
import {
  LuChevronDown,
  LuPin,
  LuPinOff,
  LuSparkles,
  LuBookOpen,
} from "react-icons/lu";
import AIResponsePreview from "../pages/interviewPrep/components/AIResponsePreview";

const QuestionCard = ({
  index,
  question,
  answer,
  isExpanded,
  onToggle,
  onLearnMore,
  isPinned,
  onTogglePin,
  showPin = true,
}) => {
  const handleHeaderClick = () => onToggle();

  const stopProp = (e) => e.stopPropagation();

  return (
    <article
      className={`rounded-2xl border bg-white transition-all duration-300 overflow-hidden ${
        isExpanded
          ? "border-blue-200 shadow-lg shadow-blue-100/40 ring-1 ring-blue-100"
          : "border-gray-200/80 shadow-sm hover:border-gray-300 hover:shadow-md"
      } ${isPinned ? "border-l-4 border-l-blue-500" : ""}`}
    >
      {/* Header — tap to expand/collapse */}
      <button
        type="button"
        onClick={handleHeaderClick}
        className="w-full text-left px-4 sm:px-5 py-4 flex items-start gap-3 sm:gap-4 group"
        aria-expanded={isExpanded}
      >
        <span
          className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-colors ${
            isExpanded
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-700"
          }`}
        >
          {index}
        </span>

        <div className="flex-1 min-w-0 pr-2">
          <p
            className={`text-sm sm:text-[15px] font-medium text-gray-900 leading-snug ${
              isExpanded ? "" : "line-clamp-2"
            }`}
          >
            {question}
          </p>
          {!isExpanded && (
            <p className="text-xs text-gray-400 mt-1.5">Tap to view answer</p>
          )}
        </div>

        <LuChevronDown
          size={20}
          className={`flex-shrink-0 text-gray-400 transition-transform duration-300 mt-0.5 ${
            isExpanded ? "rotate-180 text-blue-600" : ""
          }`}
        />
      </button>

      {/* Answer panel — CSS grid accordion */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 sm:px-5 pb-5 pt-0">
            <div className="border-t border-gray-100 pt-4">
              <div className="flex items-center gap-2 mb-3">
                <LuBookOpen size={14} className="text-blue-600" />
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Model Answer
                </span>
              </div>

              <div className="bg-gradient-to-b from-gray-50 to-white border border-gray-100 rounded-xl px-4 py-4 max-h-[min(60vh,520px)] overflow-y-auto">
                <AIResponsePreview content={answer} />
              </div>

              {/* Deep dive CTA */}
              <div className="mt-4 rounded-xl border border-cyan-100 bg-gradient-to-r from-cyan-50/80 to-white px-4 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-cyan-900">
                    Want the complete picture?
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
                    Get a full deep-dive guide — concepts, examples, interview tips, and follow-ups.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    stopProp(e);
                    onLearnMore();
                  }}
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 shadow-sm transition-colors shrink-0"
                >
                  <LuSparkles size={14} />
                  Deep dive
                </button>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 mt-4">
                {showPin && (
                  <button
                    type="button"
                    onClick={(e) => {
                      stopProp(e);
                      onTogglePin();
                    }}
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-colors ${
                      isPinned
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-white text-gray-600 border-gray-200 hover:border-blue-200 hover:text-blue-700"
                    }`}
                  >
                    {isPinned ? <LuPinOff size={14} /> : <LuPin size={14} />}
                    {isPinned ? "Unpin" : "Pin question"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    stopProp(e);
                    onToggle();
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors ml-auto"
                >
                  Collapse
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default QuestionCard;
