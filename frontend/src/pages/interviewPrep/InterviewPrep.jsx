// pages/interviewPrep/InterviewPrep.jsx
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import moment from 'moment'
import {AnimatePresence, motion} from "framer-motion"
import { LuCircleAlert, LuListCollapse } from 'react-icons/lu'
import SpinnerLoader from '../../components/SpinnerLoader'
import { toast, ToastContainer } from 'react-toastify'
import RoleInfoHeader from './components/RoleInfoHeader'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import QuestionCard from '../../components/QuestionCard'
import AIResponsePreview from './components/AIResponsePreview'
import Drawer from '../../components/Drawer'
import SkeletonLoader from '../../components/SkeletonLoader'


const InterviewPrep = () => {
  const {sessionId} = useParams();

  const [sessionData, setSessionData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdateLoader, setIsUpdateLoader] = useState(false);
  const [openLeanMoreDrawer, setOpenLeanMoreDrawer] = useState(false);
  const [explanation, setExplanation] = useState(null);
  const [isFallbackExplanation, setIsFallbackExplanation] = useState(false);

  // Helper function to check for duplicate questions
  const isDuplicateQuestion = (newQuestion, existingQuestions) => {
    return existingQuestions.some(q => 
      q.question.toLowerCase().trim() === newQuestion.question.toLowerCase().trim()
    );
  };

  // fetch session data by session id
  const fetchSessionDetailsById = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.SESSION.GET_ONE(sessionId)
      );

      if(response.data && response.data.session) {
        setSessionData(response.data.session);
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMsg("Failed to fetch session details");
    }
  };

  // generate concept explanation
  const generateConceptExplanation = async(question) => {
    try {
      setErrorMsg("");
      setExplanation(null);
      setIsFallbackExplanation(false);

      setIsLoading(true);
      setOpenLeanMoreDrawer(true);

      const response = await axiosInstance.post(
        API_PATHS.AI.GENERATE_EXPLANATION,
        {
          question,
        }
      );

      if(response.data) {
        setExplanation(response.data);
        setIsFallbackExplanation(false);
      }
    } catch (error) {
      setExplanation({
        title: "Concept Explanation",
        explanation: `We're sorry, but our AI service is currently unavailable to provide an explanation for the question: "${question}". Please try again later or search for resources online to learn more about this topic.`
      });
      setIsFallbackExplanation(true);
      setErrorMsg("Failed to generate explanation, using fallback content.");
      console.error("Error", error);
    } finally {
      setIsLoading(false);
    }
  };

  // pin questions
  const toggleQuestionPinStatus = async(questionId) => {
    try {
      const response = await axiosInstance.post(
        API_PATHS.QUESTION.PIN(questionId)
      );

      console.log(response);

      if(response.data && response.data.question) {
        // toast.success("Question Pinned Successfully!!")
        fetchSessionDetailsById();
      }
    } catch(error) {
      console.error("Error:", error);
      setErrorMsg("Failed to pin question");
    }
  };

  // add more questions to a session
  const uploadMoreQuestions = async() => {
    try {
      setIsUpdateLoader(true);
      setErrorMsg("");

      // call AI api to generate questions
      const aiResponse = await axiosInstance.post(
        API_PATHS.AI.GENERATE_QUESTIONS,
        {
          role: sessionData?.role,
          experience: sessionData?.experience,
          topicsToFocus: sessionData?.topicsToFocus,
          numberOfQuestions: 10,
        }
      );

      // should be array like [{question, answer}, {question, answer}, ... ]
      let generatedQuestions = aiResponse.data;

      // Filter out duplicate questions
      const existingQuestions = sessionData?.questions || [];
      const uniqueQuestions = generatedQuestions.filter(q => 
        !isDuplicateQuestion(q, existingQuestions)
      );

      if (uniqueQuestions.length === 0) {
        setErrorMsg("No new unique questions could be generated. Try a different topic or role.");
        setIsUpdateLoader(false);
        return;
      }

      const response = await axiosInstance.post(
        API_PATHS.QUESTION.ADD_TO_SESSION, 
        {
          sessionId,
          questions: uniqueQuestions,
        }
      );

      if(response.data) {
        toast.success(`Added ${uniqueQuestions.length} new Q&A`);
        fetchSessionDetailsById();
      }
    } catch (error) {
      if(error.response && error.response.data.message) {
        setErrorMsg(error.response.data.message);
      } else {
        setErrorMsg("Something went wrong. Please try again!!");
      } 
      console.error("Error:", error);
    } finally {
      setIsUpdateLoader(false);
    }
  };

  useEffect(() => {
    if(sessionId) {
      fetchSessionDetailsById();
    }

    return ()=> {};
  }, []);

  return (
    <>
    <RoleInfoHeader
      role={sessionData?.role || ""}
      topicsToFocus={sessionData?.topicsToFocus || ""}
      experience={sessionData?.experience || "-"}
      questions={sessionData?.questions?.length || "-"}
      description={sessionData?.description || ""}
      lastUpdated={
        sessionData?.updatedAt
          ? moment(sessionData.updatedAt).format("Do MMM YYYY")
          : ""
      }
    />
    
    <div className='container mx-auto pt-4 pb-4 px-4 md:px-0'>
      <h2 className='ml-3 text-lg font-semibold color-black'>Interview Q & A</h2>

      {/* Display error message if any */}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 m-3">
          <p className="text-red-600 text-sm flex items-center">
            <LuCircleAlert className="mr-2" />
            {errorMsg}
          </p>
        </div>
      )}

      <div className='grid grid-cols-12 gap-4 mt-5 mb-10'>
        <div 
          className={`col-span-12 ${
            openLeanMoreDrawer ? "md:col-span-7" : "md:col-span-8"
          }`}>
            <AnimatePresence>
              {sessionData?.questions?.map((data, index) => {
                return (
                  <motion.div 
                    key={data._id || index}
                    initial={{opacity: 0, y: -20}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, scale: 0.95}}
                    transition={{
                      duration: 0.4,
                      type: "spring",
                      stiffness: 100,
                      delay: index *0.1,
                      damping: 15,
                    }}
                    layout
                    layoutId={`question-${data._id || index}`}
                    >
                      <>
                        <QuestionCard
                          question={data?.question}
                          answer={data?.answer}
                          onLearnMore={()=>
                            generateConceptExplanation(data.question)
                          }
                          isPinned={data?.isPinned}
                          onTogglePin={()=> toggleQuestionPinStatus(data._id)}
                        ></QuestionCard>
                     
                      {!isLoading &&
                        sessionData?.questions?.length == index +1 && (
                          <div className='flex items-center justify-center mt-5'>
                            <button
                              className='flex items-center gap-3 text-sm text-white font-medium bg-black px-5 py-2 mr-2 rounded text-nowrap cursor-pointer'
                              disabled={isLoading || isUpdateLoader}
                              onClick={uploadMoreQuestions}
                            >
                              {isUpdateLoader ? (
                                <SpinnerLoader />
                              ) : (
                                <LuListCollapse  className='text-lg'/>
                              )}{" "}
                              Load More
                            </button>
                          </div>
                        )
                      }
                       </>
                    </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
      </div>

      <div>
        <Drawer
          isOpen={openLeanMoreDrawer}
          onClose={() => setOpenLeanMoreDrawer(false)}
          title={!isLoading && explanation?.title}
        >
          {errorMsg && (
            <p className='flex gap-2 text-sm text-amber-600 font-medium mb-4'>
              <LuCircleAlert className='mt-1'/> {errorMsg}
            </p>
          )}

          {isLoading && <SkeletonLoader />}

          {!isLoading && explanation && (
            <>
              {isFallbackExplanation && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
                  <p className="text-yellow-700 text-sm flex items-center">
                    <LuCircleAlert className="mr-2" />
                    Using fallback explanation due to AI service unavailability.
                  </p>
                </div>
              )}
              <AIResponsePreview content={explanation?.explanation} />
            </>
          )}
        </Drawer>
      </div>

    </div>

  
      <ToastContainer />
    </>
  )
}

export default InterviewPrep;