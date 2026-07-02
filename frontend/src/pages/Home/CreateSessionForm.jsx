import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    LuTarget,
    LuFileText,
    LuUser,
    LuChevronDown,
    LuSparkles,
    LuBuilding2,
} from 'react-icons/lu';
import Input from '../../components/Input';
import SpinnerLoader from '../../components/SpinnerLoader';
import FileUploadField from '../../components/FileUploadField';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS, extractGeneratedQuestions, buildTopicsFromExtracted } from '../../utils/apiPaths';
import { extractSkills } from '../../utils/extractSkills';
import {
    QUESTION_GENERATION_ERROR_MESSAGE,
    resolveQuestionGenerationErrorMessage,
    resolveRateLimitErrorMessage,
} from '../../utils/messages';

const GENERATION_MODES = [
    {
        id: 'manual',
        label: 'Manual',
        description: 'Enter role, experience & topics',
        icon: LuTarget,
        color: 'border-blue-400 bg-blue-50 text-blue-800',
        ring: 'ring-blue-400',
    },
    {
        id: 'jd',
        label: 'Job Description',
        description: 'Paste or upload a JD',
        icon: LuFileText,
        color: 'border-blue-400 bg-blue-50 text-blue-800',
        ring: 'ring-blue-400',
    },
    {
        id: 'resume',
        label: 'Resume',
        description: 'Upload your resume',
        icon: LuUser,
        color: 'border-emerald-400 bg-emerald-50 text-emerald-800',
        ring: 'ring-emerald-400',
    },
];


const CreateSessionForm = ({ onSuccess, initialMode = 'manual', initialCompany = 'generic' }) => {
    const [generationMode, setGenerationMode] = useState(initialMode);
    const [jdInputMode, setJdInputMode] = useState('paste');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [formData, setFormData] = useState({
        role: '',
        experience: '',
        topicsToFocus: '',
        description: '',
    });
    const [company, setCompany] = useState(initialCompany);
    const [customCompanyName, setCustomCompanyName] = useState('');
    const [companies, setCompanies] = useState([]);
    const [jdText, setJdText] = useState('');
    const [jdFile, setJdFile] = useState(null);
    const [resumeFile, setResumeFile] = useState(null);
    const [jdDocumentId, setJdDocumentId] = useState(null);
    const [resumeDocumentId, setResumeDocumentId] = useState(null);
    const [extractedPreview, setExtractedPreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingStep, setLoadingStep] = useState('');
    const [loadingStepIndex, setLoadingStepIndex] = useState(0);
    const [error, setError] = useState(null);
    const [isRetrying, setIsRetrying] = useState(false);

    const navigate = useNavigate();
    const selectedMode = GENERATION_MODES.find((m) => m.id === generationMode);
    const selectedCompany = companies.find((c) => c.id === company);

    useEffect(() => {
        axiosInstance
            .get(API_PATHS.COMPANIES.GET_ALL)
            .then((res) => setCompanies(res.data?.companies || []))
            .catch(() =>
                setCompanies([
                    { id: 'generic', name: 'Generic', description: 'Balanced technical and behavioral mix.' },
                    { id: 'google', name: 'Google', description: 'Deep technical & system design focus.' },
                    { id: 'amazon', name: 'Amazon', description: 'Leadership Principles & behavioral.' },
                    { id: 'microsoft', name: 'Microsoft', description: 'Technical depth & collaboration.' },
                    { id: 'netflix', name: 'Netflix', description: 'Ownership & senior judgment.' },
                    { id: 'uber', name: 'Uber', description: 'Practical engineering & scale.' },
                    { id: 'startup', name: 'Startup', description: 'Hands-on full-stack questions.' },
                    { id: 'custom', name: 'Other (enter your own)', description: 'Type any company name.' },
                ])
            );
    }, []);

    const handleChange = (key, value) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
        if (error) setError(null);
    };

    const resetDocumentState = () => {
        setJdDocumentId(null);
        setResumeDocumentId(null);
        setExtractedPreview(null);
        setJdText('');
        setJdFile(null);
        setResumeFile(null);
    };

    const applyExtractedToForm = (extractedData) => {
        if (!extractedData) return;
        setFormData((prev) => ({
            ...prev,
            role: prev.role || extractedData.role || '',
            experience: prev.experience || extractedData.experience || '',
            topicsToFocus: prev.topicsToFocus || buildTopicsFromExtracted(extractedData),
        }));
        setExtractedPreview(extractedData);
    };

    const uploadDocument = async (file, type) => {
        const formPayload = new FormData();
        formPayload.append('file', file);
        const endpoint =
            type === 'resume'
                ? API_PATHS.DOCUMENTS.UPLOAD_RESUME
                : API_PATHS.DOCUMENTS.UPLOAD_JD;
        const response = await axiosInstance.post(endpoint, formPayload);
        return response.data;
    };

    const pasteJobDescription = async (text) => {
        const response = await axiosInstance.post(API_PATHS.DOCUMENTS.PASTE_JD, { text });
        return response.data;
    };

    const resolveDocuments = async () => {
        let resolvedJdId = jdDocumentId;
        let resolvedResumeId = resumeDocumentId;
        let lastExtracted = extractedPreview;

        if (generationMode === 'jd') {
            setLoadingStepIndex(0);
            setLoadingStep('Parsing job description...');
            if (jdFile) {
                try {
                    const result = await uploadDocument(jdFile, 'jd');
                    resolvedJdId = result.documentId;
                    setJdDocumentId(result.documentId);
                    applyExtractedToForm(result.extractedData);
                    lastExtracted = result.extractedData;
                } catch (uploadErr) {
                    if (jdText.trim()) {
                        const result = await pasteJobDescription(jdText.trim());
                        resolvedJdId = result.documentId;
                        setJdDocumentId(result.documentId);
                        applyExtractedToForm(result.extractedData);
                        lastExtracted = result.extractedData;
                    } else {
                        throw uploadErr;
                    }
                }
            } else if (jdText.trim() && !resolvedJdId) {
                const result = await pasteJobDescription(jdText.trim());
                resolvedJdId = result.documentId;
                setJdDocumentId(result.documentId);
                applyExtractedToForm(result.extractedData);
                lastExtracted = result.extractedData;
            }
        }

        if (generationMode === 'resume' && resumeFile && !resolvedResumeId) {
            setLoadingStepIndex(0);
            setLoadingStep('Parsing resume...');
            const result = await uploadDocument(resumeFile, 'resume');
            resolvedResumeId = result.documentId;
            setResumeDocumentId(result.documentId);
            applyExtractedToForm(result.extractedData);
            lastExtracted = result.extractedData;
        }

        return { resolvedJdId, resolvedResumeId, lastExtracted };
    };

    const validateForm = () => {
        if (generationMode === 'manual') {
            const { role, experience, topicsToFocus } = formData;
            if (!role || !experience || !topicsToFocus) {
                return 'Please fill in role, experience, and topics.';
            }
            if (isNaN(experience) || parseFloat(experience) < 0) {
                return 'Please enter a valid number for years of experience.';
            }
        }
        if (generationMode === 'jd') {
            if (jdInputMode === 'paste' && !jdText.trim() && !jdDocumentId && !jdFile) {
                return 'Please paste your job description.';
            }
            if (jdInputMode === 'upload' && !jdFile && !jdDocumentId && !jdText.trim()) {
                return 'Please upload a job description file.';
            }
        }
        if (generationMode === 'resume' && !resumeFile && !resumeDocumentId) {
            return 'Please upload your resume.';
        }
        if (company === 'custom' && !customCompanyName.trim()) {
            return 'Please enter your company name.';
        }
        return null;
    };

    const handleCreateSession = async (e) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setError('');
        setIsLoading(true);
        setLoadingStep('Preparing...');
        setLoadingStepIndex(0);

        try {
            const { resolvedJdId, resolvedResumeId, lastExtracted } = await resolveDocuments();

            const role = formData.role || lastExtracted?.role || 'Software Engineer';
            const experience = formData.experience || lastExtracted?.experience || '1';
            const topicsToFocus =
                formData.topicsToFocus ||
                buildTopicsFromExtracted(lastExtracted) ||
                'General software engineering';

            if (generationMode === 'manual') {
                if (!formData.role || !formData.experience || !formData.topicsToFocus) {
                    throw new Error('Please fill all required fields.');
                }
            }

            setLoadingStepIndex(1);
            setLoadingStep('Generating 10 interview questions...');

            const aiPayload = {
                role,
                experience,
                topicsToFocus,
                numberOfQuestions: 10,
                company,
                customCompanyName: company === 'custom' ? customCompanyName.trim() : '',
                generationMode,
            };
            if (resolvedResumeId) aiPayload.resumeDocumentId = resolvedResumeId;
            if (resolvedJdId) aiPayload.jdDocumentId = resolvedJdId;

            const aiResponse = await axiosInstance.post(API_PATHS.AI.GENERATE_QUESTIONS, aiPayload);
            const { questions: generatedQuestions, meta } = extractGeneratedQuestions(aiResponse.data);

            if (!Array.isArray(generatedQuestions) || generatedQuestions.length === 0) {
                throw new Error('Invalid response from AI service');
            }

            setLoadingStepIndex(2);
            setLoadingStep('Saving your session...');

            const response = await axiosInstance.post(API_PATHS.SESSION.CREATE, {
                role: meta?.role || role,
                experience: meta?.experience || experience,
                topicsToFocus: meta?.topicsToFocus || topicsToFocus,
                description: formData.description,
                skills: extractSkills(topicsToFocus || formData.description || '', {
                    topicsToFocus: meta?.topicsToFocus || topicsToFocus,
                    description: formData.description,
                }),
                questions: generatedQuestions,
                sourceType: meta?.generationMode || generationMode,
                company: meta?.company || company,
                customCompanyName:
                    meta?.customCompanyName ||
                    (company === 'custom' ? customCompanyName.trim() : ''),
                resumeDocumentId: meta?.resumeDocumentId || resolvedResumeId || null,
                jdDocumentId: meta?.jdDocumentId || resolvedJdId || null,
            });

            if (response.data?.session?._id) {
                if (onSuccess) onSuccess();
                navigate(`/interview-prep/${response.data.session._id}`);
            } else {
                throw new Error('Session creation failed');
            }
        } catch (err) {
            console.error('Error in handleCreateSession:', err);
            if (err.response) {
                setError(
                    resolveRateLimitErrorMessage(err) ||
                        resolveQuestionGenerationErrorMessage(
                            err,
                            err.response.data?.message || err.response.data?.error || 'Something went wrong.'
                        )
                );
            } else if (err.request) {
                setError('Network error. Check your connection and try again.');
            } else {
                setError(
                    err.message === 'Invalid response from AI service'
                        ? QUESTION_GENERATION_ERROR_MESSAGE
                        : err.message || 'Something went wrong.'
                );
            }
        } finally {
            setIsLoading(false);
            setLoadingStep('');
            setLoadingStepIndex(0);
            setIsRetrying(false);
        }
    };

    const handleModeChange = (mode) => {
        setGenerationMode(mode);
        resetDocumentState();
        setShowAdvanced(false);
        setError(null);
    };

    return (
        <div className="flex flex-col min-h-0">
            {/* Header */}
            <div className="px-5 pt-5 pb-4 border-b border-gray-100 bg-gradient-to-b from-gray-50 to-white shrink-0">
                <div className="flex items-center gap-2 pr-8">
                    {/* <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                        <LuSparkles size={18} />
                    </div> */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">
                            New Prep Session
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            AI generates 10 tailored Q&amp;A pairs
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleCreateSession} className="flex flex-col flex-1 min-h-0">
                <div className="px-5 py-4 space-y-5 flex-1">
                    {/* Step 1 — Prep mode */}
                    <section>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                            Step 1 · Prep mode
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                            {GENERATION_MODES.map((mode) => {
                                const Icon = mode.icon;
                                const isActive = generationMode === mode.id;
                                return (
                                    <button
                                        key={mode.id}
                                        type="button"
                                        disabled={isLoading}
                                        onClick={() => handleModeChange(mode.id)}
                                        className={`flex flex-col items-center text-center p-3 rounded-xl border-2 transition-all ${
                                            isActive
                                                ? `${mode.color} ring-2 ${mode.ring} ring-offset-1`
                                                : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600'
                                        }`}
                                    >
                                        <Icon size={20} className="mb-1.5" />
                                        <span className="text-xs font-semibold leading-tight">{mode.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                        {selectedMode && (
                            <p className="text-xs text-gray-500 mt-2 text-center">
                                {selectedMode.description}
                            </p>
                        )}
                    </section>

                    {/* Step 2 — Mode-specific input */}
                    <section>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                            Step 2 · Your details
                        </p>

                        {generationMode === 'manual' && (
                            <div className="space-y-1">
                                <Input
                                    value={formData.role}
                                    onChange={({ target }) => handleChange('role', target.value)}
                                    label="Target Role"
                                    placeholder="e.g. Frontend Developer"
                                    type="text"
                                    disabled={isLoading}
                                    required
                                />
                                <Input
                                    value={formData.experience}
                                    onChange={({ target }) => handleChange('experience', target.value)}
                                    label="Years of Experience"
                                    placeholder="e.g. 2"
                                    type="number"
                                    disabled={isLoading}
                                    required
                                />
                                <Input
                                    value={formData.topicsToFocus}
                                    onChange={({ target }) => handleChange('topicsToFocus', target.value)}
                                    label="Topics to Focus On"
                                    placeholder="React, Node.js, MongoDB"
                                    type="text"
                                    disabled={isLoading}
                                    required
                                />
                            </div>
                        )}

                        {generationMode === 'jd' && (
                            <div className="space-y-3">
                                <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
                                    {['paste', 'upload'].map((mode) => (
                                        <button
                                            key={mode}
                                            type="button"
                                            disabled={isLoading}
                                            onClick={() => setJdInputMode(mode)}
                                            className={`flex-1 text-xs py-2 rounded-md font-medium capitalize transition ${
                                                jdInputMode === mode
                                                    ? 'bg-white shadow-sm text-gray-900'
                                                    : 'text-gray-500'
                                            }`}
                                        >
                                            {mode === 'paste' ? 'Paste text' : 'Upload file'}
                                        </button>
                                    ))}
                                </div>

                                {jdInputMode === 'paste' ? (
                                    <div className="flex flex-col gap-1">
                                        <label className="text-sm font-medium text-gray-700">
                                            Job Description <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={jdText}
                                            onChange={(e) => {
                                                setJdText(e.target.value);
                                                setJdDocumentId(null);
                                                if (error) setError(null);
                                            }}
                                            disabled={isLoading}
                                            placeholder="Paste the full job description here..."
                                            rows={6}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400"
                                        />
                                    </div>
                                ) : (
                                    <FileUploadField
                                        label="Job Description File"
                                        file={jdFile}
                                        onFileChange={(f) => {
                                            setJdFile(f);
                                            setJdDocumentId(null);
                                            if (error) setError(null);
                                        }}
                                        disabled={isLoading}
                                        helperText="PDF, DOCX, or TXT · max 5MB"
                                    />
                                )}
                            </div>
                        )}

                        {generationMode === 'resume' && (
                            <FileUploadField
                                label="Resume"
                                file={resumeFile}
                                onFileChange={(f) => {
                                    setResumeFile(f);
                                    setResumeDocumentId(null);
                                    if (error) setError(null);
                                }}
                                disabled={isLoading}
                                helperText="PDF, DOCX, or TXT · max 5MB"
                            />
                        )}

                        {extractedPreview && generationMode !== 'manual' && (
                            <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-900">
                                <p className="font-semibold mb-1.5 flex items-center gap-1">
                                    <LuSparkles size={12} /> Detected from document
                                </p>
                                <div className="space-y-0.5 text-blue-800">
                                    {extractedPreview.role && <p>Role: {extractedPreview.role}</p>}
                                    {extractedPreview.experience && (
                                        <p>Experience: {extractedPreview.experience} yrs</p>
                                    )}
                                    {buildTopicsFromExtracted(extractedPreview) && (
                                        <p className="line-clamp-2">
                                            Skills: {buildTopicsFromExtracted(extractedPreview)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {(generationMode === 'jd' || generationMode === 'resume') && (
                            <button
                                type="button"
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="mt-3 flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 transition"
                            >
                                <LuChevronDown
                                    size={14}
                                    className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                                />
                                {showAdvanced ? 'Hide' : 'Show'} optional overrides
                            </button>
                        )}

                        {showAdvanced && generationMode !== 'manual' && (
                            <div className="mt-2 space-y-1 pt-2 border-t border-gray-100">
                                <Input
                                    value={formData.role}
                                    onChange={({ target }) => handleChange('role', target.value)}
                                    label="Override Role"
                                    placeholder="Leave blank to use detected role"
                                    type="text"
                                    disabled={isLoading}
                                />
                                <Input
                                    value={formData.experience}
                                    onChange={({ target }) => handleChange('experience', target.value)}
                                    label="Override Experience"
                                    placeholder="Leave blank to use detected value"
                                    type="number"
                                    disabled={isLoading}
                                />
                                <Input
                                    value={formData.topicsToFocus}
                                    onChange={({ target }) => handleChange('topicsToFocus', target.value)}
                                    label="Override Topics"
                                    placeholder="Leave blank to use detected skills"
                                    type="text"
                                    disabled={isLoading}
                                />
                            </div>
                        )}
                    </section>

                    {/* Step 3 — Preferences */}
                    <section>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                            Step 3 · Preferences
                        </p>

                        <div className="flex flex-col gap-1 mb-3">
                            <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                                {/* <LuBuilding2 size={14} /> */}
                                Company interview style
                            </label>
                            <select
                                value={company}
                                onChange={(e) => {
                                    setCompany(e.target.value);
                                    if (e.target.value !== 'custom') {
                                        setCustomCompanyName('');
                                    }
                                    if (error) setError(null);
                                }}
                                disabled={isLoading}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 bg-white"
                            >
                                {companies.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name}
                                    </option>
                                ))}
                            </select>
                            {company === 'custom' && (
                                <Input
                                    value={customCompanyName}
                                    onChange={({ target }) => {
                                        setCustomCompanyName(target.value);
                                        if (error) setError(null);
                                    }}
                                    label="Your company name"
                                    placeholder="e.g. TCF, Infosys, Flipkart"
                                    type="text"
                                    disabled={isLoading}
                                    required
                                />
                            )}
                            {selectedCompany?.description && company !== 'custom' && (
                                <p className="text-xs text-gray-500 mt-1">{selectedCompany.description}</p>
                            )}
                            {company === 'custom' && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Questions will be tailored to your company&apos;s interview style.
                                </p>
                            )}
                        </div>

                        <Input
                            value={formData.description}
                            onChange={({ target }) => handleChange('description', target.value)}
                            label="Session note (optional)"
                            placeholder="e.g. TCF interview prep"
                            type="text"
                            disabled={isLoading}
                        />
                    </section>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-red-600 text-sm">{error}</p>
                            {!isRetrying && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsRetrying(true);
                                        setError(null);
                                        handleCreateSession(new Event('submit'));
                                    }}
                                    className="mt-2 text-sm text-red-700 font-medium hover:underline"
                                >
                                    Try again
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Sticky footer */}
                <div className="sticky bottom-0 px-5 py-4 border-t border-gray-100 bg-white/95 backdrop-blur-sm shrink-0">
                    {isLoading && (
                        <div className="mb-3">
                            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                                <span>{loadingStep}</span>
                                <span>Step {Math.min(loadingStepIndex + 1, 3)}/3</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                                    style={{ width: `${((loadingStepIndex + 1) / 3) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2 min-h-[48px]"
                    >
                        {isLoading ? (
                            <>
                                <SpinnerLoader size="lg" color="white" />
                                <span>{loadingStep || 'Creating...'}</span>
                            </>
                        ) : (
                            <>
                                <LuSparkles size={16} />
                                Generate &amp; Start Session
                            </>
                        )}
                    </button>
                    {!isLoading && (
                        <p className="text-center text-[11px] text-gray-400 mt-2">
                            Takes about 15–30 seconds depending on AI response
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
};

export default CreateSessionForm;
