const { ROADMAP_WEEKS } = require("../utils/analyticsTopics");
const UserLearningGoal = require("../models/UserLearningGoal");

const COMPANY_PRIORITIES = {
    amazon: ["Ownership", "Leadership", "Arrays", "System Design", "STAR Responses"],
    google: ["Problem Solving", "Dynamic Programming", "Trees", "Graphs", "Technical Depth"],
    meta: ["React", "System Design", "Communication", "Arrays", "JavaScript"],
    microsoft: ["OOP", "Arrays", "Problem Solving", "Communication", "SQL"],
    startup: ["JavaScript", "Node.js", "Problem Solving", "Ownership", "System Design"],
};

function getCompanyPriorities(company) {
    if (!company) return [];
    const key = company.toLowerCase().replace(/[^a-z]/g, "");
    for (const [name, topics] of Object.entries(COMPANY_PRIORITIES)) {
        if (key.includes(name)) return topics;
    }
    return [];
}

function estimateTime(weaknessLevel) {
    if (weaknessLevel === "high") return "2-3 hours/day";
    if (weaknessLevel === "medium") return "1-2 hours/day";
    return "30-60 min/day";
}

function weaknessLevel(weakScore) {
    if (weakScore >= 60) return "high";
    if (weakScore >= 35) return "medium";
    return "low";
}

async function generateRoadmap(userId, topics, goals = null) {
    const userGoals =
        goals || (await UserLearningGoal.findOne({ user: userId })) || {};
    const companyTopics = getCompanyPriorities(userGoals.targetCompany);

    const weakSorted = [...topics]
        .filter((t) => t.attempts > 0)
        .sort((a, b) => {
            const aPriority = companyTopics.includes(a.topic) ? 10 : 0;
            const bPriority = companyTopics.includes(b.topic) ? 10 : 0;
            return bPriority + b.weakScore - (aPriority + a.weakScore);
        });

    const weakTopicNames = weakSorted.map((t) => t.topic);
    const allRoadmapTopics = [
        ...new Set([...companyTopics, ...weakTopicNames, ...ROADMAP_WEEKS.flatMap((w) => w.topics)]),
    ].slice(0, 16);

    const level = userGoals.skillLevel || "Intermediate";
    const weeks = ROADMAP_WEEKS.map((template, idx) => {
        const weekTopics = template.topics.map((topic) => {
            const analytics = topics.find((t) => t.topic === topic);
            const ws = analytics?.weakScore ?? 50;
            return {
                topic,
                weaknessLevel: weaknessLevel(ws),
                estimatedTime: estimateTime(weaknessLevel(ws)),
                priority: companyTopics.includes(topic) ? "high" : ws >= 50 ? "high" : "medium",
                recommendedResources: [
                    `Review ${topic} fundamentals`,
                    `Practice 3-5 ${topic} problems`,
                    level === "Beginner" ? `Watch intro ${topic} tutorial` : `Solve medium ${topic} challenges`,
                ],
                recommendedQuestions: [
                    `Solve 5 ${topic} coding challenges`,
                    `Review ${topic} interview questions`,
                ],
                milestones: [
                    `Complete 3 ${topic} exercises`,
                    `Score 70%+ on ${topic} practice`,
                ],
                currentScore: analytics?.averageScore ?? null,
                attempts: analytics?.attempts ?? 0,
            };
        });

        const extraWeak = weakSorted
            .filter((t) => !template.topics.includes(t.topic))
            .slice(idx, idx + 1)
            .map((t) => ({
                topic: t.topic,
                weaknessLevel: weaknessLevel(t.weakScore),
                estimatedTime: estimateTime(weaknessLevel(t.weakScore)),
                priority: "high",
                recommendedResources: [`Focus on improving ${t.topic}`, "Review weak areas from analytics"],
                recommendedQuestions: [`Practice ${t.topic} questions`],
                milestones: [`Raise ${t.topic} score above 70%`],
                currentScore: t.averageScore,
                attempts: t.attempts,
            }));

        return {
            week: template.week,
            label: `Week ${template.week}`,
            topics: [...weekTopics, ...extraWeak],
            focus: template.topics.join(", "),
        };
    });

    return {
        skillLevel: level,
        targetCompany: userGoals.targetCompany || "",
        targetRole: userGoals.targetRole || "Software Engineer",
        targetInterviewDate: userGoals.targetInterviewDate || null,
        weeks,
        prioritizedTopics: allRoadmapTopics.slice(0, 10),
        generatedAt: new Date().toISOString(),
    };
}

module.exports = { generateRoadmap, getCompanyPriorities };
