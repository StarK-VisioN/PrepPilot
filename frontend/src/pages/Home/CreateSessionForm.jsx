import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Input';
import SpinnerLoader from '../../components/SpinnerLoader';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';

const CreateSessionForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        role: "",
        experience: "",
        topicsToFocus: "",
        description: "",
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);
    const [isRetrying, setIsRetrying] = useState(false);

    const navigate = useNavigate();

    const handleChange = (key, value) => {
        setFormData((prevData) => ({
            ...prevData, [key]: value,
        }));
        // Clear error when user starts typing again
        if (error) setError(null);
    };

    const handleCreateSession = async(e) => {
        e.preventDefault();

        const {role, experience, topicsToFocus, description} = formData;

        // Validate required fields
        if(!role || !experience || !topicsToFocus) {
            setError("Please fill all the required fields");
            return;
        }

        // Validate experience is a positive number
        if (isNaN(experience) || parseFloat(experience) < 0) {
            setError("Please enter a valid number for years of experience");
            return;
        }

        setError("");
        setIsLoading(true);
        setRetryCount(0);
        
        try {
            console.log("🤖 Calling AI API to generate questions...");
            // Call AI API to generate questions
            const aiResponse = await axiosInstance.post(
                API_PATHS.AI.GENERATE_QUESTIONS, 
                {
                    role,
                    experience,
                    topicsToFocus,
                    numberOfQuestions: 10,
                }
            );

            console.log("✅ AI response received");
            
            // Validate the AI response format
            const generatedQuestions = aiResponse.data;
            if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
                throw new Error("Invalid response from AI service");
            }

            console.log("📝 Creating session with generated questions...");
            // Create session with generated questions
            const response = await axiosInstance.post(API_PATHS.SESSION.CREATE, {
                ...formData,
                questions: generatedQuestions,
            });

            console.log("✅ Session created successfully");

            if(response.data?.session?._id) {
                // Call onSuccess callback if provided
                if (onSuccess) onSuccess();
                // Navigate to the interview prep page
                navigate(`/interview-prep/${response.data.session._id}`);
            } else {
                throw new Error("Session creation failed - invalid response");
            }
        } catch(error) {
            console.error("❌ Error in handleCreateSession:", error);
            
            // Handle different types of errors
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error("Error response data:", error.response.data);
                console.error("Error response status:", error.response.status);
                
                // Handle specific error messages from the server
                const serverMessage = error.response.data?.message || error.response.data?.error;
                const isRetryable = error.response.data?.isRetryable !== false;
                const maxRetriesReached = error.response.data?.maxRetriesReached;
                
                if (serverMessage) {
                    if (isRetryable && !maxRetriesReached) {
                        // For retryable errors, show a message with retry option
                        setError(`${serverMessage}`);
                    } else {
                        setError(serverMessage);
                    }
                } else if (error.response.status === 500) {
                    setError("Server error occurred while generating questions. Please try again later.");
                } else {
                    setError("Something went wrong. Please try again!");
                }
            } else if (error.request) {
                // The request was made but no response was received
                console.error("Error request:", error.request);
                setError("Network error. Please check your internet connection and try again.");
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error("Error message:", error.message);
                setError(error.message || "Something went wrong. Please try again!");
            }
        } finally {
            setIsLoading(false);
            setIsRetrying(false);
        }
    };

    const handleRetry = () => {
        setIsRetrying(true);
        setError(null);
        handleCreateSession(new Event('submit'));
    };

    return (
        <div className='w-full max-w-[400px] px-4 py-6 sm:p-7 flex flex-col mx-auto'>
            <h3 className='text-xl sm:text-2xl font-semibold text-black mb-1'>
                Start a New Interview Journey
            </h3>
            <p className='text-xs text-slate-700 mt-[5px] mb-3'>
                Fill out a few quick details & unlock your personalized set of Interview Questions!
            </p>

            <form onSubmit={handleCreateSession} className='flex flex-col gap-2'>
                <Input
                    value={formData.role}
                    onChange={({target}) => handleChange("role", target.value)}
                    label="Target Role"
                    placeholder="(e.g. Frontend Developer, Backend Developer, UI/UX Designer, etc.)"
                    type="text"
                    disabled={isLoading}
                />
                
                <Input
                    value={formData.experience}
                    onChange={({target}) => handleChange("experience", target.value)}
                    label="Years of Experience"
                    placeholder="(e.g. 1, 2, 5+)"
                    type="number"
                    min="0"
                    step="0.5"
                    disabled={isLoading}
                />
                
                <Input
                    value={formData.topicsToFocus}
                    onChange={({target}) => handleChange("topicsToFocus", target.value)}
                    label="Topics to be Focus On"
                    placeholder="(Comma-separated, e.g. React, Node.js, MongoDB)"
                    type="text"
                    disabled={isLoading}
                />
                
                <Input
                    value={formData.description}
                    onChange={({target}) => handleChange("description", target.value)}
                    label="Description"
                    placeholder="(Any specific goals or notes for this session)"
                    type="text"
                    disabled={isLoading}
                />

                {error && (
                    <div className='bg-red-50 border border-red-200 rounded-md p-3 mt-2'>
                        <p className='text-red-600 text-sm'>{error}</p>
                        {isRetrying ? (
                            <div className="mt-2 flex items-center">
                                <SpinnerLoader size="sm" color="red" />
                                <span className="ml-2 text-xs text-red-500">Retrying...</span>
                            </div>
                        ) : (
                            <button 
                                type="button"
                                onClick={handleRetry}
                                className="mt-2 text-sm text-red-700 hover:text-red-900 font-medium flex items-center"
                            >
                                Try Again
                            </button>
                        )}
                    </div>
                )}

                <button 
                    type='submit'
                    className='w-full bg-black hover:bg-gray-600 text-white font-semibold py-3 rounded-md text-sm sm:text-base transition min-h-[44px] mt-2 flex items-center justify-center'
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <SpinnerLoader size="lg" color="white" />
                            <span className="ml-2">Creating...</span>
                        </>
                    ) : (
                        "Create Session"
                    )}
                </button>
            </form>
        </div>
    )
}

export default CreateSessionForm;