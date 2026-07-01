import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LuArrowLeft, LuLoader, LuSquare } from "react-icons/lu";
import { toast } from "react-toastify";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import ChatMessage from "./components/ChatMessage";
import InterviewTimer from "./components/InterviewTimer";
import InterviewProgress from "./components/InterviewProgress";
import InterviewInput from "./components/InterviewInput";

const MockInterviewSessionPage = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const chatEndRef = useRef(null);
    const notesKey = `mockInterviewNotes:${sessionId}`;

    const [session, setSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [notes, setNotes] = useState(() => localStorage.getItem(notesKey) || "");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [ending, setEnding] = useState(false);

    const loadSession = useCallback(async () => {
        try {
            const response = await axiosInstance.get(
                API_PATHS.MOCK_INTERVIEW.SESSION(sessionId)
            );
            setSession(response.data.session);
            setMessages(response.data.messages || []);

            if (response.data.session.status === "completed") {
                navigate(`/mock-interview/report/${sessionId}`, { replace: true });
            }
        } catch (error) {
            toast.error("Failed to load interview session");
        } finally {
            setLoading(false);
        }
    }, [sessionId, navigate]);

    useEffect(() => {
        loadSession();
    }, [loadSession]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        localStorage.setItem(notesKey, notes);
    }, [notes, notesKey]);

    const handleSend = async () => {
        if (!input.trim() || sending) return;

        const userText = input.trim();
        setInput("");
        setSending(true);

        const optimisticUser = {
            _id: `temp-${Date.now()}`,
            sender: "user",
            message: userText,
            sequence: messages.length + 1,
        };
        setMessages((prev) => [...prev, optimisticUser]);

        try {
            const response = await axiosInstance.post(API_PATHS.MOCK_INTERVIEW.MESSAGE, {
                sessionId,
                message: userText,
            });

            setSession(response.data.session);
            setMessages((prev) => {
                const withoutTemp = prev.filter((m) => !String(m._id).startsWith("temp-"));
                return [...withoutTemp, ...response.data.messages];
            });

            if (response.data.aiAvailable === false) {
                toast.warn("AI is temporarily unavailable. A fallback question was used.");
            }
        } catch (error) {
            setMessages((prev) => prev.filter((m) => !String(m._id).startsWith("temp-")));
            setInput(userText);
            toast.error(error.response?.data?.message || "Failed to send message");
        } finally {
            setSending(false);
        }
    };

    const handleEnd = async () => {
        if (ending) return;
        if (!window.confirm("End this interview and generate your feedback report?")) return;

        try {
            setEnding(true);
            await axiosInstance.post(API_PATHS.MOCK_INTERVIEW.END, { sessionId });
            toast.success("Interview completed!");
            navigate(`/mock-interview/report/${sessionId}`);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to end interview");
        } finally {
            setEnding(false);
        }
    };

    const handleTimeUp = useCallback(() => {
        toast.info("Time is up! Consider ending the interview for your report.");
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <LuLoader className="animate-spin text-indigo-500" size={32} />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-600 mb-4">Session not found</p>
                <Link to="/mock-interview" className="text-indigo-600">
                    Back to dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            <div className="border-b border-gray-200 bg-white/90 px-4 py-3 flex items-center justify-between gap-3">
                <Link
                    to="/mock-interview"
                    className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                >
                    <LuArrowLeft size={16} />
                    Exit
                </Link>
                <div className="text-center min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{session.role}</p>
                    <p className="text-xs text-gray-500">
                        {session.interviewType} · {session.difficulty}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={handleEnd}
                    disabled={ending}
                    className="inline-flex items-center gap-1 text-sm text-rose-600 hover:text-rose-800 font-medium disabled:opacity-50"
                >
                    <LuSquare size={14} />
                    {ending ? "Ending..." : "End"}
                </button>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row min-h-0">
                <div className="flex-1 flex flex-col min-h-0 lg:border-r border-gray-200">
                    <div className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50/80">
                        {messages.map((msg) => (
                            <ChatMessage key={msg._id || msg.sequence} message={msg} />
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                    <div className="border-t border-gray-200 bg-white p-4">
                        <InterviewInput
                            value={input}
                            onChange={setInput}
                            onSend={handleSend}
                            disabled={session.status !== "active"}
                            sending={sending}
                        />
                    </div>
                </div>

                <div className="w-full lg:w-80 shrink-0 bg-white p-4 space-y-4 overflow-y-auto border-t lg:border-t-0 border-gray-200">
                    <InterviewTimer
                        startedAt={session.startedAt}
                        durationMinutes={session.duration}
                        onTimeUp={handleTimeUp}
                    />
                    <InterviewProgress
                        questionCount={session.questionCount}
                        duration={session.duration}
                        startedAt={session.startedAt}
                    />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Notes
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Private notes (saved locally)..."
                            rows={6}
                            className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MockInterviewSessionPage;
