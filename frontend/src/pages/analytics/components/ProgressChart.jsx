import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
} from "recharts";

export const ProgressChart = ({ data, type = "bar" }) => {
    if (!data?.length) {
        return <p className="text-sm text-gray-500 text-center py-8">No data yet</p>;
    }

    if (type === "line") {
        return (
            <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot />
                </LineChart>
            </ResponsiveContainer>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="topic" width={90} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="accuracy" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default ProgressChart;
