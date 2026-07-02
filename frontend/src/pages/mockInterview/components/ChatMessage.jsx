const ChatMessage = ({ message }) => {
    const isAi = message.sender === "ai";

    return (
        <div className={`flex ${isAi ? "justify-start" : "justify-end"} mb-4`}>
            <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 ${
                    isAi
                        ? "bg-white border border-gray-200 text-gray-800 rounded-tl-sm"
                        : "bg-blue-600 text-white rounded-tr-sm"
                }`}
            >
                {isAi && (
                    <p className="text-xs font-semibold text-indigo-600 mb-1">Interviewer</p>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
                {message.questionType && isAi && message.questionType !== "followup" && (
                    <span className="inline-block mt-2 text-[10px] uppercase tracking-wide opacity-60">
                        {message.questionType}
                    </span>
                )}
            </div>
        </div>
    );
};

export default ChatMessage;
