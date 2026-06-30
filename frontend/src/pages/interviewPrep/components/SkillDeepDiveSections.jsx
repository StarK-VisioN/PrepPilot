import React, { useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LuChevronDown,
  LuCircleAlert,
  LuLayers,
  LuPlus,
  LuTrash2,
} from 'react-icons/lu';
import QuestionCard from '../../../components/QuestionCard';
import SpinnerLoader from '../../../components/SpinnerLoader';

const SkillDeepDiveSection = ({
  skill,
  questions = [],
  isExpanded = false,
  onToggleSection,
  expandedQuestionId,
  onToggleQuestion,
  onLearnMore,
  onGenerateMore,
  onDelete,
  onRetry,
  isLoadingInitial = false,
  isLoadingMore = false,
  isDeleting = false,
  error = '',
  scrollIntoView = false,
}) => {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (scrollIntoView && sectionRef.current) {
      sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [scrollIntoView]);

  return (
    <article
      ref={sectionRef}
      className="rounded-2xl border border-violet-100 bg-white shadow-sm overflow-hidden scroll-mt-24"
    >
      <div className="flex items-center gap-2 px-4 sm:px-5 py-4 bg-gradient-to-r from-violet-50/80 to-white">
        <button
          type="button"
          onClick={onToggleSection}
          className="flex flex-1 items-center gap-3 min-w-0 text-left hover:opacity-90 transition-opacity"
          aria-expanded={isExpanded}
        >
          <div className="p-1.5 rounded-lg bg-violet-100 text-violet-700 shrink-0">
            <LuLayers size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-gray-900">{skill}</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {questions.length} question{questions.length !== 1 ? 's' : ''}
              {isLoadingInitial && ' · generating…'}
              {isLoadingMore && ' · loading more…'}
            </p>
          </div>
          <LuChevronDown
            size={18}
            className={`shrink-0 text-gray-400 transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`}
            aria-hidden
          />
        </button>

        <div className="flex items-center gap-1 shrink-0">
          {onDelete && questions.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                const confirmed = window.confirm(
                  `Are you sure you want to remove questions for ${skill}?`
                );
                if (confirmed) onDelete();
              }}
              disabled={isDeleting || isLoadingInitial || isLoadingMore}
              className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors disabled:opacity-50"
              aria-label={`Remove ${skill} questions`}
              title="Remove this skill block"
            >
              <LuTrash2 size={16} />
            </button>
          )}
        </div>
      </div>

      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
          isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-violet-50">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 mt-3">
                <p className="text-red-600 text-sm flex items-center gap-2">
                  <LuCircleAlert size={16} />
                  {error}
                </p>
                {onRetry && questions.length > 0 && (
                  <button
                    type="button"
                    onClick={onRetry}
                    disabled={isLoadingInitial || isLoadingMore}
                    className="mt-3 text-sm font-semibold text-violet-800 hover:text-violet-900 underline disabled:opacity-60"
                  >
                    Try again
                  </button>
                )}
              </div>
            )}

            {isLoadingInitial && questions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 gap-3">
                <SpinnerLoader />
                <p className="text-sm text-gray-500">
                  Generating {skill} interview questions…
                </p>
              </div>
            )}

            {questions.length > 0 && (
              <div className="space-y-3 mt-3">
                <AnimatePresence initial={false}>
                  {questions.map((data, index) => {
                    const cardId = `skill-${skill}-${index}`;
                    return (
                      <motion.div
                        key={`${skill}-${index}-${data.question?.slice(0, 24)}`}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <QuestionCard
                          index={index + 1}
                          question={data?.question}
                          answer={data?.answer}
                          isExpanded={expandedQuestionId === cardId}
                          onToggle={() => onToggleQuestion(cardId)}
                          onLearnMore={() => onLearnMore?.(data.question, data?.answer)}
                          showPin={false}
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            {questions.length > 0 && (
              <div className="flex justify-center mt-6 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onGenerateMore}
                  disabled={isLoadingInitial || isLoadingMore}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-violet-800 bg-violet-50 hover:bg-violet-100 border border-violet-200 px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60"
                >
                  {isLoadingMore ? (
                    <SpinnerLoader size="sm" color="purple" />
                  ) : (
                    <LuPlus size={16} />
                  )}
                  Generate more questions
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};

const SkillDeepDiveSections = ({
  sectionOrder = [],
  skillSections = {},
  expandedSkills = {},
  loadingMoreSkill = null,
  scrollToSkill = null,
  expandedQuestionIds = {},
  onToggleSection,
  onToggleQuestion,
  onLearnMore,
  onGenerateMore,
  onDeleteSection,
  deletingSkill = null,
}) => {
  const visibleKeys = sectionOrder.filter(
    (key) => (skillSections[key]?.questions?.length ?? 0) > 0
  );

  if (!visibleKeys.length) return null;

  return (
    <section className="mt-12 pt-8 border-t border-gray-200">
      <div className="flex items-start gap-3 mb-5">
        <div className="p-2 rounded-lg bg-violet-100 text-violet-700 shrink-0">
          <LuLayers size={18} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Skill Deep Dive</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Topic-specific questions · each skill keeps its own section
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {visibleKeys.map((key) => {
          const section = skillSections[key];
          if (!section?.questions?.length) return null;

          return (
            <SkillDeepDiveSection
              key={key}
              skill={section.topic}
              questions={section.questions}
              isExpanded={!!expandedSkills[key]}
              onToggleSection={() => onToggleSection(key)}
              expandedQuestionId={expandedQuestionIds[key]}
              onToggleQuestion={(cardId) => onToggleQuestion(key, cardId)}
              onLearnMore={onLearnMore}
              onGenerateMore={() => onGenerateMore(section.topic)}
              isLoadingInitial={false}
              isLoadingMore={loadingMoreSkill?.toLowerCase() === key}
              error={section.error}
              scrollIntoView={scrollToSkill?.toLowerCase() === key}
              onDelete={() => onDeleteSection?.(section.topic, key)}
              onRetry={() => onGenerateMore(section.topic)}
              isDeleting={deletingSkill?.toLowerCase() === key}
            />
          );
        })}
      </div>
    </section>
  );
};

export default SkillDeepDiveSections;
