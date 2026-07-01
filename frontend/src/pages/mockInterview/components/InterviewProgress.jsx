const InterviewProgress = ({ questionCount, duration, startedAt }) => {
    const elapsedMins = startedAt
        ? Math.floor((Date.now() - new Date(startedAt).getTime()) / 60000)
        : 0;
    const timeProgress = Math.min(100, Math.round((elapsedMins / duration) * 100));
    const expectedQuestions = Math.max(3, Math.floor(duration / 5));

    return (
        <div className="space-y-3">
            <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Time elapsed</span>
                    <span>{timeProgress}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                        style={{ width: `${timeProgress}%` }}
                    />
                </div>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-gray-500">Questions asked</span>
                <span className="font-semibold text-gray-900">
                    {questionCount} / ~{expectedQuestions}
                </span>
            </div>
        </div>
    );
};

export default InterviewProgress;
