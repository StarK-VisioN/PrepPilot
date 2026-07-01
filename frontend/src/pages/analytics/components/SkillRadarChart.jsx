import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
} from "recharts";

const SkillRadarChart = ({ data }) => {
    if (!data?.length) {
        return <p className="text-sm text-gray-500 text-center py-8">No skill data yet</p>;
    }

    return (
        <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={data}>
                <PolarGrid />
                <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#6366f1"
                    fill="#8b5cf6"
                    fillOpacity={0.4}
                />
            </RadarChart>
        </ResponsiveContainer>
    );
};

export default SkillRadarChart;
