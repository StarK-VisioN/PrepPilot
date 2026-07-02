import { useCallback, useEffect, useRef, useState } from "react";

import { Link, useParams } from "react-router-dom";

import { toast } from "react-toastify";

import { LuArrowLeft, LuPlay, LuSend, LuLoader } from "react-icons/lu";

import axiosInstance from "../../utils/axiosInstance";

import { API_PATHS } from "../../utils/apiPaths";

import {

  DEFAULT_CODING_LANGUAGE,

  getStarterForLanguage,

  resolveCodingRunError,

} from "../../utils/codingLanguages";

import { useCodingLanguage } from "../../context/CodingLanguageContext";

import DifficultyBadge from "./components/DifficultyBadge";

import ProblemStatement from "./components/ProblemStatement";

import CodeEditor from "./components/CodeEditor";

import TestCasePanel from "./components/TestCasePanel";

import SubmissionResult from "./components/SubmissionResult";

import DraftStatus from "./components/DraftStatus";



const DRAFT_SAVE_DELAY_MS = 1500;



const CodingChallengePage = () => {

  const { slug } = useParams();

  const { ready: languageReady } = useCodingLanguage();



  const [challenge, setChallenge] = useState(null);

  const [code, setCode] = useState("");

  const [loading, setLoading] = useState(true);

  const [running, setRunning] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [runResult, setRunResult] = useState(null);

  const [submission, setSubmission] = useState(null);

  const [draftStatus, setDraftStatus] = useState(null);

  const [activeTab, setActiveTab] = useState("tests");



  const draftTimerRef = useRef(null);

  const challengeIdRef = useRef(null);



  const resolveStarterCode = useCallback((challengeData) => {

    return getStarterForLanguage(challengeData?.starterCode);

  }, []);



  const loadDraft = useCallback(async (challengeId, challengeData) => {

    try {

      const response = await axiosInstance.get(API_PATHS.CODING.GET_DRAFT(challengeId));

      const draft = response.data.draft;

      const savedCode = draft?.codes?.javascript;



      if (savedCode) {

        setCode(savedCode);

        setDraftStatus("restored");

        setTimeout(() => setDraftStatus(null), 3000);

        return true;

      }



      setCode(resolveStarterCode(challengeData));

      return false;

    } catch {

      setCode(resolveStarterCode(challengeData));

      return false;

    }

  }, [resolveStarterCode]);



  useEffect(() => {

    if (!slug || !languageReady) return;



    const fetchChallenge = async () => {

      try {

        setLoading(true);

        const response = await axiosInstance.get(API_PATHS.CODING.CHALLENGE_BY_SLUG(slug));

        const data = response.data.challenge;

        setChallenge(data);

        challengeIdRef.current = data._id;

        await loadDraft(data._id, data);

      } catch (error) {

        console.error("Failed to load challenge:", error);

        toast.error("Challenge not found");

      } finally {

        setLoading(false);

      }

    };



    fetchChallenge();

  }, [slug, languageReady, loadDraft]);



  const saveDraft = useCallback(async (challengeId, draftCode) => {

    if (!challengeId) return;

    setDraftStatus("saving");

    try {

      await axiosInstance.put(API_PATHS.CODING.SAVE_DRAFT(challengeId), {

        language: DEFAULT_CODING_LANGUAGE,

        code: draftCode,

      });

      setDraftStatus("saved");

      setTimeout(() => setDraftStatus(null), 2000);

    } catch {

      setDraftStatus("error");

      setTimeout(() => setDraftStatus(null), 3000);

    }

  }, []);



  const handleCodeChange = (value) => {

    setCode(value);

    if (!challengeIdRef.current) return;

    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);

    draftTimerRef.current = setTimeout(() => {

      saveDraft(challengeIdRef.current, value);

    }, DRAFT_SAVE_DELAY_MS);

  };



  const handleReset = () => {

    if (!challenge) return;

    const starter = resolveStarterCode(challenge);

    setCode(starter);

    setRunResult(null);

    setSubmission(null);

  };



  useEffect(() => {

    return () => {

      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);

    };

  }, []);



  const handleRun = async () => {

    if (!challenge) return;



    try {

      setRunning(true);

      setRunResult(null);

      setActiveTab("tests");

      const response = await axiosInstance.post(API_PATHS.CODING.RUN, {

        challengeId: challenge._id,

        code,

        language: DEFAULT_CODING_LANGUAGE,

      });

      setRunResult(response.data);

    } catch (error) {

      toast.error(resolveCodingRunError(error));

    } finally {

      setRunning(false);

    }

  };



  const handleSubmit = async () => {

    if (!challenge) return;



    try {

      setSubmitting(true);

      setActiveTab("submission");

      const response = await axiosInstance.post(API_PATHS.CODING.SUBMIT, {

        challengeId: challenge._id,

        code,

        language: DEFAULT_CODING_LANGUAGE,

      });

      setSubmission({ ...response.data.submission, language: DEFAULT_CODING_LANGUAGE });

      setRunResult({

        passedCount: response.data.submission.passedCount,

        totalCount: response.data.submission.totalCount,

        results: response.data.submission.results,

        mode: "submit",

      });

      setActiveTab("tests");

      if (response.data.submission.status === "Accepted") {

        toast.success("Accepted!");

      } else {

        toast.info(

          `${response.data.submission.passedCount}/${response.data.submission.totalCount} tests passed`

        );

      }

    } catch (error) {

      toast.error(resolveCodingRunError(error));

    } finally {

      setSubmitting(false);

    }

  };



  if (loading || !languageReady) {

    return (

      <div className="flex items-center justify-center min-h-[60vh]">

        <LuLoader size={32} className="animate-spin text-blue-600" />

      </div>

    );

  }



  if (!challenge) {

    return (

      <div className="container mx-auto px-4 py-16 text-center">

        <p className="text-gray-600 mb-4">Challenge not found.</p>

        <Link to="/coding" className="text-blue-600 hover:underline">

          Back to challenges

        </Link>

      </div>

    );

  }



  return (

    <div className="flex flex-col h-[calc(100vh-4rem)] min-h-0">

      <div className="shrink-0 border-b border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-3">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-[100vw]">

          <div className="flex items-center gap-3 min-w-0">

            <Link

              to="/coding"

              className="shrink-0 p-2 rounded-lg hover:bg-gray-100 text-gray-600"

              title="Back to challenges"

            >

              <LuArrowLeft size={18} />

            </Link>

            <div className="min-w-0">

              <div className="flex items-center gap-2 flex-wrap">

                <h1 className="font-semibold text-gray-900 truncate">{challenge.title}</h1>

                <DifficultyBadge difficulty={challenge.difficulty} />

                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">

                  JavaScript

                </span>

              </div>

              <DraftStatus status={draftStatus} />

            </div>

          </div>



          <div className="flex items-center gap-2 flex-wrap">

            <button

              type="button"

              onClick={handleRun}

              disabled={running || submitting}

              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50"

            >

              {running ? <LuLoader size={16} className="animate-spin" /> : <LuPlay size={16} />}

              Run Code

            </button>

            <button

              type="button"

              onClick={handleSubmit}

              disabled={running || submitting}

              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"

            >

              {submitting ? <LuLoader size={16} className="animate-spin" /> : <LuSend size={16} />}

              Submit

            </button>

          </div>

        </div>

      </div>



      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 overflow-hidden">

        <div className="border-b lg:border-b-0 lg:border-r border-gray-200 bg-white overflow-hidden min-h-[40vh] lg:min-h-0">

          <ProblemStatement challenge={challenge} />

        </div>



        <div className="flex flex-col min-h-0 overflow-hidden">

          <div className="flex-1 min-h-[240px] p-3 sm:p-4">

            <CodeEditor code={code} onChange={handleCodeChange} onReset={handleReset} />

          </div>



          <div className="shrink-0 border-t border-gray-200 bg-white max-h-[40vh] overflow-hidden flex flex-col">

            <div className="flex border-b border-gray-200">

              {[

                { id: "tests", label: "Test Results" },

                { id: "submission", label: "Submission" },

              ].map((tab) => (

                <button

                  key={tab.id}

                  type="button"

                  onClick={() => setActiveTab(tab.id)}

                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${

                    activeTab === tab.id

                      ? "border-blue-600 text-blue-600"

                      : "border-transparent text-gray-500 hover:text-gray-700"

                  }`}

                >

                  {tab.label}

                </button>

              ))}

            </div>



            <div className="flex-1 overflow-y-auto p-4">

              {activeTab === "tests" && (

                <TestCasePanel

                  testCases={challenge.testCases}

                  runResult={runResult}

                  loading={running || submitting}

                  mode={runResult?.mode || "run"}

                />

              )}

              {activeTab === "submission" && <SubmissionResult submission={submission} />}

            </div>

          </div>

        </div>

      </div>

    </div>

  );

};



export default CodingChallengePage;

