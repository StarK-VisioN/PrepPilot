import { useEffect, useState } from "react";
import { LuClock } from "react-icons/lu";

const InterviewTimer = ({ startedAt, durationMinutes, onTimeUp }) => {
    const [remaining, setRemaining] = useState(durationMinutes * 60);

    useEffect(() => {
        if (!startedAt) return;

        const start = new Date(startedAt).getTime();
        const totalMs = durationMinutes * 60 * 1000;

        const tick = () => {
            const elapsed = Date.now() - start;
            const left = Math.max(0, Math.floor((totalMs - elapsed) / 1000));
            setRemaining(left);
            if (left === 0 && onTimeUp) onTimeUp();
        };

        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [startedAt, durationMinutes, onTimeUp]);

    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    const urgent = remaining < 300;

    return (
        <div
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
                urgent ? "border-rose-200 bg-rose-50 text-rose-700" : "border-gray-200 bg-white text-gray-700"
            }`}
        >
            <LuClock size={16} />
            <span className="font-mono font-semibold text-sm">
                {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
            </span>
        </div>
    );
};

export default InterviewTimer;
