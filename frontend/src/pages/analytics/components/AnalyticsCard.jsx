const AnalyticsCard = ({ label, value, sub, accent = "indigo" }) => {
    const accents = {
        indigo: "from-blue-500 to-blue-600",
        emerald: "from-emerald-500 to-teal-600",
        orange: "from-blue-500 to-blue-600",
        violet: "from-violet-500 to-purple-700",
    };

    return (
        <div className="bg-white/90 border border-white/60 rounded-2xl p-4 shadow-sm">
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold bg-gradient-to-r ${accents[accent] || accents.indigo} bg-clip-text text-transparent`}>
                {value}
            </p>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
    );
};

export default AnalyticsCard;
