// pages/interviewPrep/InterviewPrep.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import moment from 'moment';
import { AnimatePresence, motion } from 'framer-motion';
import { LuCircleAlert, LuListCollapse, LuChevronsDownUp } from 'react-icons/lu';
import SpinnerLoader from '../../components/SpinnerLoader';
import { toast } from 'react-toastify';
import RoleInfoHeader from './components/RoleInfoHeader';
import SkillDeepDiveSections from './components/SkillDeepDiveSections';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS, extractGeneratedQuestions } from '../../utils/apiPaths';
import {
  QUESTION_GENERATION_ERROR_MESSAGE,
  resolveQuestionGenerationErrorMessage,
  resolveRateLimitErrorMessage,
} from '../../utils/messages';
import { extractSkills } from '../../utils/extractSkills';
import QuestionCard from '../../components/QuestionCard';
import AIResponsePreview from './components/AIResponsePreview';
import Drawer from '../../components/Drawer';
import SkeletonLoader from '../../components/SkeletonLoader';

const InterviewPrep = () => {
  const { sessionId } = useParams();

  const [sessionData, setSessionData] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [deepDiveError, setDeepDiveError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdateLoader, setIsUpdateLoader] = useState(false);
  const [openLeanMoreDrawer, setOpenLeanMoreDrawer] = useState(false);
  const [deepDiveQuestion, setDeepDiveQuestion] = useState('');
  const [explanation, setExplanation] = useState(null);
  const [isFallbackExplanation, setIsFallbackExplanation] = useState(false);

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [skillSections, setSkillSections] = useState({});
  const [sectionOrder, setSectionOrder] = useState([]);
  const [expandedSkills, setExpandedSkills] = useState({});
  const [loadingSkill, setLoadingSkill] = useState(null);
  const [loadingMoreSkill, setLoadingMoreSkill] = useState(null);
  const [deletingSkill, setDeletingSkill] = useState(null);
  const [scrollToSkill, setScrollToSkill] = useState(null);
  const [skillExpandedQuestionIds, setSkillExpandedQuestionIds] = useState({});

  const scrollResetTimer = useRef(null);
  const [isSavingCustomSkill, setIsSavingCustomSkill] = useState(false);

  const sessionSkills = useMemo(() => {
    if (sessionData?.skills?.length) return sessionData.skills;
    return extractSkills(sessionData?.topicsToFocus || sessionData?.description || '', {
      topicsToFocus: sessionData?.topicsToFocus,
      description: sessionData?.description,
    });
  }, [sessionData]);

  const customSkills = sessionData?.customSkills || [];

  const normalizeSkillKey = (skill) => skill?.toLowerCase().trim();

  const clearSkillSectionLocal = (key) => {
    setSkillSections((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setSectionOrder((prev) => prev.filter((k) => k !== key));
    setSkillExpandedQuestionIds((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setExpandedSkills((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    if (selectedTopic && normalizeSkillKey(selectedTopic) === key) {
      setSelectedTopic(null);
    }
    setSessionData((prev) =>
      prev
        ? {
            ...prev,
            topicQuestionCache: (prev.topicQuestionCache || []).filter(
              (entry) => normalizeSkillKey(entry.topic) !== key
            ),
          }
        : prev
    );
  };

  const isDeleteAlreadyGoneError = (error) => {
    const status = error.response?.status;
    const message = (error.response?.data?.message || '').toLowerCase();
    return status === 404 || message.includes('no question block found');
  };

  const getApiErrorMessage = (error, fallback) => {
    const rateLimit = resolveRateLimitErrorMessage(error);
    if (rateLimit) return rateLimit;

    const data = error.response?.data;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (error.response?.status === 404) return 'Session not found. Try refreshing the page.';
    if (error.message === 'Network Error') {
      return 'Network error — ensure the backend is running and restart it after updates.';
    }
    return fallback;
  };

  const persistCustomSkills = async (nextCustomSkills) => {
    if (!sessionId) {
      throw new Error('Session ID is missing');
    }

    const response = await axiosInstance.patch(
      API_PATHS.SESSION.UPDATE_CUSTOM_SKILLS(sessionId),
      { customSkills: nextCustomSkills }
    );

    // Only merge customSkills — do not replace the full session (PATCH returns
    // unpopulated question IDs and would wipe the main Q&A + deep-dive UI state).
    const saved = response.data?.session?.customSkills ?? response.data?.customSkills;
    if (saved) {
      setSessionData((prev) => (prev ? { ...prev, customSkills: saved } : prev));
    } else {
      setSessionData((prev) =>
        prev ? { ...prev, customSkills: nextCustomSkills } : prev
      );
    }

    return saved ?? nextCustomSkills;
  };

  const handleAddCustomSkill = async (skillName) => {
    const trimmed = skillName.trim();
    if (!trimmed) return;

    const next = [...customSkills, trimmed];
    setIsSavingCustomSkill(true);
    try {
      await persistCustomSkills(next);
      toast.success(`Added "${trimmed}"`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to save custom skill'));
      console.error('Add custom skill error:', error.response?.data || error);
    } finally {
      setIsSavingCustomSkill(false);
    }
  };

  const handleRemoveCustomSkill = async (skillName) => {
    const next = customSkills.filter(
      (s) => s.toLowerCase() !== skillName.toLowerCase()
    );
    setIsSavingCustomSkill(true);
    try {
      await persistCustomSkills(next);
      if (selectedTopic?.toLowerCase() === skillName.toLowerCase()) {
        setSelectedTopic(null);
      }
      toast.info(`Removed "${skillName}"`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to remove custom skill'));
      console.error('Remove custom skill error:', error.response?.data || error);
    } finally {
      setIsSavingCustomSkill(false);
    }
  };

  const hydrateTopicCache = (session) => {
    if (!session?.topicQuestionCache?.length) return;

    setSkillSections((prev) => {
      const map = { ...prev };
      session.topicQuestionCache.forEach(({ topic, questions }) => {
        if (topic && questions?.length) {
          const key = normalizeSkillKey(topic);
          if (!map[key]) {
            map[key] = { topic, questions, error: '' };
          }
        }
      });
      return map;
    });

    setSectionOrder((prev) => {
      const next = [...prev];
      session.topicQuestionCache.forEach(({ topic, questions }) => {
        if (topic && questions?.length) {
          const key = normalizeSkillKey(topic);
          if (!next.includes(key)) next.push(key);
        }
      });
      return next;
    });
  };

  const updateSkillSection = (key, patch) => {
    setSkillSections((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...patch },
    }));
  };

  const scrollToSkillSection = (skill) => {
    setScrollToSkill(skill);
    if (scrollResetTimer.current) clearTimeout(scrollResetTimer.current);
    scrollResetTimer.current = setTimeout(() => setScrollToSkill(null), 800);
  };

  const fetchTopicQuestions = async (skill, { append = false } = {}) => {
    const key = normalizeSkillKey(skill);
    const existing = skillSections[key]?.questions || [];
    const excludeQuestions = append ? existing.map((q) => q.question) : [];

    const response = await axiosInstance.post(API_PATHS.AI.GENERATE_TOPIC_QUESTIONS, {
      topic: skill,
      role: sessionData?.role,
      experience: sessionData?.experience,
      sessionId,
      company: sessionData?.company || 'generic',
      customCompanyName: sessionData?.customCompanyName || '',
      numberOfQuestions: 10,
      excludeQuestions,
    });

    return response.data;
  };
  const isDuplicateQuestion = (newQuestion, existingQuestions) =>
    existingQuestions.some(
      (q) => q.question.toLowerCase().trim() === newQuestion.question.toLowerCase().trim()
    );

  const fetchSessionDetailsById = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.SESSION.GET_ONE(sessionId));
      if (response.data?.session) {
        setSessionData(response.data.session);
        hydrateTopicCache(response.data.session);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMsg('Failed to fetch session details');
    }
  };

  const toggleQuestion = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const collapseAll = () => setExpandedId(null);

  const handleTopicClick = async (skill) => {
    const key = normalizeSkillKey(skill);
    setSelectedTopic(skill);

    if (skillSections[key]?.questions?.length) {
      if (!sectionOrder.includes(key)) {
        setSectionOrder((prev) => [...prev, key]);
      }
      scrollToSkillSection(skill);
      return;
    }

    setLoadingSkill(skill);

    try {
      const { topic, questions, cached } = await fetchTopicQuestions(skill);

      if (!questions?.length) {
        clearSkillSectionLocal(key);
        toast.error(QUESTION_GENERATION_ERROR_MESSAGE);
        return;
      }

      const displayTopic = topic || skill;

      setSkillSections((prev) => ({
        ...prev,
        [key]: {
          topic: displayTopic,
          questions,
          error: '',
        },
      }));

      if (!sectionOrder.includes(key)) {
        setSectionOrder((prev) => [...prev, key]);
      }

      scrollToSkillSection(displayTopic);

      if (cached) {
        toast.info(`Loaded saved ${displayTopic} questions`);
      } else {
        toast.success(`Generated ${questions.length} ${displayTopic} questions`);
      }
    } catch (error) {
      clearSkillSectionLocal(key);
      toast.error(resolveQuestionGenerationErrorMessage(error, QUESTION_GENERATION_ERROR_MESSAGE));
      console.error('Topic questions error:', error);
    } finally {
      setLoadingSkill(null);
    }
  };

  const handleGenerateMoreForSkill = async (skill) => {
    const key = normalizeSkillKey(skill);
    const existing = skillSections[key]?.questions || [];

    if (!existing.length) return;

    setLoadingMoreSkill(skill);
    updateSkillSection(key, { error: '' });

    try {
      const { questions: newQuestions, appended } = await fetchTopicQuestions(skill, {
        append: true,
      });

      if (!newQuestions?.length) {
        updateSkillSection(key, {
          error: QUESTION_GENERATION_ERROR_MESSAGE,
        });
        return;
      }

      setSkillSections((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          questions: [...(prev[key]?.questions || []), ...newQuestions],
          error: '',
        },
      }));

      scrollToSkillSection(skill);
      toast.success(
        appended
          ? `Added ${newQuestions.length} more ${skill} questions`
          : `Added ${newQuestions.length} ${skill} questions`
      );
    } catch (error) {
      updateSkillSection(key, {
        error: resolveQuestionGenerationErrorMessage(error, QUESTION_GENERATION_ERROR_MESSAGE),
      });
      console.error('Generate more topic questions error:', error);
    } finally {
      setLoadingMoreSkill(null);
    }
  };

  const handleToggleSkillSection = (key) => {
    setExpandedSkills((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleToggleSkillQuestion = (key, cardId) => {
    setSkillExpandedQuestionIds((prev) => ({
      ...prev,
      [key]: prev[key] === cardId ? null : cardId,
    }));
  };

  const handleDeleteSkillSection = async (skill, key) => {
    setDeletingSkill(skill);

    const sectionTopic = skillSections[key]?.topic || skill;
    const deleteUrl = API_PATHS.SESSION.DELETE_TOPIC_QUESTIONS(sessionId, sectionTopic);
    console.log('Deleting topic', sessionId, sectionTopic, deleteUrl);

    clearSkillSectionLocal(key);

    try {
      await axiosInstance.delete(deleteUrl);
    } catch (error) {
      if (!isDeleteAlreadyGoneError(error)) {
        console.error('Delete skill section error:', error.response?.data || error);
      }
    }

    toast.success(`Removed ${sectionTopic} questions`);
    setDeletingSkill(null);
  };

  const generateConceptExplanation = async (question, answer) => {
    try {
      setDeepDiveError('');
      setExplanation(null);
      setIsFallbackExplanation(false);
      setDeepDiveQuestion(question);
      setIsLoading(true);
      setOpenLeanMoreDrawer(true);

      const response = await axiosInstance.post(API_PATHS.AI.GENERATE_EXPLANATION, {
        question,
        answer,
        role: sessionData?.role || '',
      });

      if (response.data) {
        setExplanation(response.data);
      }
    } catch (error) {
      setExplanation({
        title: 'Deep Dive Guide',
        explanation: `We're sorry, but our AI service is currently unavailable for this question. Please try again in a moment.`,
      });
      setIsFallbackExplanation(true);
      setDeepDiveError(
        resolveRateLimitErrorMessage(error) ||
          'Sorry, we could not load the study guide right now. Please try again.'
      );
      console.error('Error', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleQuestionPinStatus = async (questionId) => {
    try {
      const response = await axiosInstance.post(API_PATHS.QUESTION.PIN(questionId));
      if (response.data?.question) {
        fetchSessionDetailsById();
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMsg('Failed to pin question');
    }
  };

  const uploadMoreQuestions = async () => {
    try {
      setIsUpdateLoader(true);
      setErrorMsg('');

      const aiResponse = await axiosInstance.post(API_PATHS.AI.GENERATE_QUESTIONS, {
        role: sessionData?.role,
        experience: sessionData?.experience,
        topicsToFocus: sessionData?.topicsToFocus,
        numberOfQuestions: 10,
        company: sessionData?.company || 'generic',
        customCompanyName: sessionData?.customCompanyName || '',
        generationMode: sessionData?.sourceType || 'manual',
        resumeDocumentId: sessionData?.resumeDocumentId || undefined,
        jdDocumentId: sessionData?.jdDocumentId || undefined,
      });

      const { questions: generatedQuestions } = extractGeneratedQuestions(aiResponse.data);
      const existingQuestions = sessionData?.questions || [];
      const uniqueQuestions = generatedQuestions.filter(
        (q) => !isDuplicateQuestion(q, existingQuestions)
      );

      if (uniqueQuestions.length === 0) {
        setErrorMsg('No new unique questions could be generated. Try a different topic or role.');
        return;
      }

      const response = await axiosInstance.post(API_PATHS.QUESTION.ADD_TO_SESSION, {
        sessionId,
        questions: uniqueQuestions,
      });

      if (response.data) {
        toast.success(`Added ${uniqueQuestions.length} new Q&A`);
        fetchSessionDetailsById();
      }
    } catch (error) {
      setErrorMsg(resolveQuestionGenerationErrorMessage(error, 'Something went wrong. Please try again!'));
      console.error('Error:', error);
    } finally {
      setIsUpdateLoader(false);
    }
  };

  useEffect(() => {
    if (sessionId) fetchSessionDetailsById();
    return () => {
      if (scrollResetTimer.current) clearTimeout(scrollResetTimer.current);
    };
  }, [sessionId]);

  const questionCount = sessionData?.questions?.length || 0;
  return (
    <>
      <RoleInfoHeader
        role={sessionData?.role || ''}
        topicsToFocus={sessionData?.topicsToFocus || ''}
        experience={sessionData?.experience || '-'}
        questions={questionCount || '-'}
        description={sessionData?.description || ''}
        company={sessionData?.company}
        customCompanyName={sessionData?.customCompanyName}
        sourceType={sessionData?.sourceType}
        skills={sessionSkills}
        customSkills={customSkills}
        selectedSkill={selectedTopic}
        loadingSkill={loadingSkill}
        onSkillClick={handleTopicClick}
        onAddCustomSkill={handleAddCustomSkill}
        onRemoveCustomSkill={handleRemoveCustomSkill}
        isSavingCustomSkill={isSavingCustomSkill}
        lastUpdated={
          sessionData?.updatedAt ? moment(sessionData.updatedAt).format('Do MMM YYYY') : ''
        }
      />

      <div
        className={`max-w-7xl mx-auto px-6 sm:px-8 md:px-10 lg:px-14 py-8 pb-24 transition-[padding] ${
          openLeanMoreDrawer ? 'lg:pr-[36vw]' : ''
        }`}
      >
        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Interview Q &amp; A</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Tap a question to expand · one at a time
            </p>
          </div>
          {expandedId && (
            <button
              type="button"
              onClick={collapseAll}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors self-start"
            >
              <LuChevronsDownUp size={14} />
              Collapse all
            </button>
          )}
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-600 text-sm flex items-center gap-2">
              <LuCircleAlert size={16} />
              {errorMsg}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {sessionData?.questions?.map((data, index) => {
              const cardId = data._id || `q-${index}`;
              return (
                <motion.div
                  key={cardId}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25, delay: index * 0.04 }}
                >
                  <QuestionCard
                    index={index + 1}
                    question={data?.question}
                    answer={data?.answer}
                    isExpanded={expandedId === cardId}
                    onToggle={() => toggleQuestion(cardId)}
                    onLearnMore={() => generateConceptExplanation(data.question, data?.answer)}
                    isPinned={data?.isPinned}
                    onTogglePin={() => toggleQuestionPinStatus(data._id)}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {questionCount > 0 && (
          <div className="flex justify-center mt-10 pt-6 border-t border-gray-100">
            <button
              type="button"
              className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 px-6 py-3 rounded-xl shadow-md transition-colors disabled:opacity-60"
              disabled={isLoading || isUpdateLoader}
              onClick={uploadMoreQuestions}
            >
              {isUpdateLoader ? (
                <SpinnerLoader />
              ) : (
                <LuListCollapse className="text-lg" />
              )}
              Load 10 more questions
            </button>
          </div>
        )}

        <SkillDeepDiveSections
          sectionOrder={sectionOrder}
          skillSections={skillSections}
          expandedSkills={expandedSkills}
          loadingSkill={loadingSkill}
          loadingMoreSkill={loadingMoreSkill}
          scrollToSkill={scrollToSkill}
          expandedQuestionIds={skillExpandedQuestionIds}
          onToggleSection={handleToggleSkillSection}
          onToggleQuestion={handleToggleSkillQuestion}
          onLearnMore={generateConceptExplanation}
          onGenerateMore={handleGenerateMoreForSkill}
          onDeleteSection={handleDeleteSkillSection}
          deletingSkill={deletingSkill}
        />
      </div>

      <Drawer
        isOpen={openLeanMoreDrawer}
        onClose={() => setOpenLeanMoreDrawer(false)}
        title={!isLoading && explanation?.title ? explanation.title : 'Deep Dive'}
        subtitle={deepDiveQuestion}
      >
        {isLoading && (
          <div>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Building a complete study guide — overview, concepts, examples, and interview tips…
            </p>
            <SkeletonLoader />
          </div>
        )}

        {deepDiveError && openLeanMoreDrawer && !isLoading && (
          <p className="flex gap-2 text-sm text-amber-600 font-medium mb-4">
            <LuCircleAlert className="mt-1 shrink-0" />
            {deepDiveError}
          </p>
        )}

        {!isLoading && explanation && (
          <>
            {isFallbackExplanation && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-yellow-700 text-sm flex items-center gap-2">
                  <LuCircleAlert size={16} />
                  AI service unavailable — showing fallback content.
                </p>
              </div>
            )}
            <AIResponsePreview content={explanation?.explanation} />
          </>
        )}
      </Drawer>
    </>
  );
};

export default InterviewPrep;
