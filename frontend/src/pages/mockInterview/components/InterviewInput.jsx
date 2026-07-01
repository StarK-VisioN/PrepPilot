import { LuSend, LuLoader } from "react-icons/lu";

const InterviewInput = ({ value, onChange, onSend, disabled, sending }) => {
    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!disabled && !sending && value.trim()) onSend();
        }
    };

    return (
        <div className="flex gap-2 items-end">
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={disabled || sending}
                placeholder="Type your answer... (Enter to send, Shift+Enter for new line)"
                rows={2}
                className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50"
            />
            <button
                type="button"
                onClick={onSend}
                disabled={disabled || sending || !value.trim()}
                className="p-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
                {sending ? <LuLoader className="animate-spin" size={20} /> : <LuSend size={20} />}
            </button>
        </div>
    );
};

export default InterviewInput;
