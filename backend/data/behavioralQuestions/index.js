const { createBehavioralQuestion } = require("./helpers");

/**
 * 108 behavioral questions — 9 per category across 12 categories.
 * Add new questions by appending to the relevant category array.
 */
const CATEGORY_DEFINITIONS = {
    Leadership: [
        ["Lead a Team Through Crisis", "Tell me about a time you led a team through a difficult deadline or crisis.", "Hard", ["Amazon", "Meta"]],
        ["Motivate Disengaged Team", "Describe a situation where you motivated a disengaged or underperforming team.", "Medium", ["Google", "Microsoft"]],
        ["Lead Without Authority", "Tell me about a time you had to lead a project without formal authority.", "Medium", ["Startup", "Amazon"]],
        ["Mentor Junior Colleague", "Describe a time you mentored a junior colleague and helped them grow.", "Easy", ["Microsoft", "Google"]],
        ["Drive Organizational Change", "Tell me about a time you drove a significant change in your team or organization.", "Hard", ["Amazon", "Apple"]],
        ["Inspire During Uncertainty", "Describe how you kept your team motivated during a period of uncertainty.", "Medium", ["Meta", "Netflix"]],
        ["Delegate Effectively", "Tell me about a time you had to delegate critical work and ensure it was done well.", "Medium", ["Google", "Amazon"]],
        ["Lead Cross-Functional Initiative", "Describe a cross-functional initiative you led and how you aligned stakeholders.", "Hard", ["Amazon", "Microsoft"]],
        ["Leadership Lesson Learned", "Tell me about a leadership mistake you made and what you learned from it.", "Medium", ["Google", "Meta"]],
    ],
    "Conflict Resolution": [
        ["Teammate Disagreement", "Tell me about a conflict you had with a teammate and how you resolved it.", "Medium", ["Amazon", "Google"]],
        ["Disagree With Manager", "Describe a time you disagreed with your manager. How did you handle it?", "Hard", ["Meta", "Microsoft"]],
        ["Mediate Team Conflict", "Tell me about a time you mediated a conflict between two colleagues.", "Medium", ["Amazon", "Apple"]],
        ["Stakeholder Pushback", "Describe a situation where a stakeholder strongly disagreed with your approach.", "Medium", ["Google", "Amazon"]],
        ["Resolve Miscommunication", "Tell me about a miscommunication that caused conflict and how you fixed it.", "Easy", ["Microsoft", "Startup"]],
        ["Handle Difficult Coworker", "Describe a time you worked with a difficult coworker and maintained productivity.", "Medium", ["Amazon", "Meta"]],
        ["Negotiate Competing Priorities", "Tell me about a time two teams had competing priorities and you helped resolve it.", "Hard", ["Google", "Amazon"]],
        ["Customer Escalation Conflict", "Describe a heated customer or client situation you de-escalated.", "Medium", ["Amazon", "Salesforce"]],
        ["Conflict You Could Not Resolve", "Tell me about a conflict you could not fully resolve and what you learned.", "Hard", ["Google", "Meta"]],
    ],
    Teamwork: [
        ["Cross-Functional Project", "Tell me about a successful cross-functional project you contributed to.", "Medium", ["Google", "Amazon"]],
        ["Support Struggling Teammate", "Describe a time you went above and beyond to help a struggling teammate.", "Easy", ["Microsoft", "Google"]],
        ["Remote Collaboration", "Tell me about a challenge you faced collaborating remotely and how you overcame it.", "Medium", ["Meta", "Microsoft"]],
        ["Diverse Perspectives", "Describe a time your team had diverse opinions and how you reached alignment.", "Medium", ["Google", "Apple"]],
        ["Team Success Contribution", "Tell me about your specific contribution to a major team success.", "Easy", ["Amazon", "Startup"]],
        ["Build Trust Quickly", "Describe a situation where you had to build trust with a new team quickly.", "Medium", ["Amazon", "Microsoft"]],
        ["Share Credit", "Tell me about a time you shared credit for a success with your team.", "Easy", ["Google", "Meta"]],
        ["Team Failure Recovery", "Describe how your team recovered from a collective failure.", "Medium", ["Amazon", "Netflix"]],
        ["Onboard New Team Member", "Tell me about onboarding a new team member and helping them succeed.", "Easy", ["Microsoft", "Google"]],
    ],
    Ownership: [
        ["Take Initiative", "Tell me about a time you took ownership of a problem that was not officially yours.", "Medium", ["Amazon", "Startup"]],
        ["End-to-End Delivery", "Describe a project you owned end-to-end from idea to delivery.", "Hard", ["Amazon", "Google"]],
        ["Fix Broken Process", "Tell me about a broken process you identified and fixed without being asked.", "Medium", ["Amazon", "Microsoft"]],
        ["Go Beyond Job Description", "Describe a time you went beyond your job description to deliver results.", "Easy", ["Amazon", "Startup"]],
        ["Own a Production Incident", "Tell me about a production incident you owned and resolved.", "Hard", ["Amazon", "Google"]],
        ["Accountability for Mistake", "Describe a time you took full accountability for a team mistake.", "Medium", ["Amazon", "Meta"]],
        ["Drive Quality Standards", "Tell me about raising quality standards on a project you owned.", "Medium", ["Google", "Apple"]],
        ["Unblock Stalled Project", "Describe a stalled project you stepped in to unblock and deliver.", "Medium", ["Amazon", "Microsoft"]],
        ["Long-Term Ownership", "Tell me about something you owned over months and sustained momentum on.", "Hard", ["Amazon", "Google"]],
    ],
    "Failure & Learning": [
        ["Significant Failure", "Tell me about a time you failed. What did you learn?", "Medium", ["Amazon", "Google"]],
        ["Missed Deadline", "Describe a time you missed a deadline and how you handled it.", "Medium", ["Microsoft", "Startup"]],
        ["Wrong Technical Decision", "Tell me about a technical decision you made that turned out to be wrong.", "Hard", ["Google", "Amazon"]],
        ["Received Critical Feedback", "Describe the most difficult feedback you received and how you responded.", "Medium", ["Meta", "Google"]],
        ["Project Did Not Ship", "Tell me about a project that did not ship and what you learned.", "Medium", ["Startup", "Meta"]],
        ["Repeated Mistake", "Describe a mistake you made more than once and how you finally fixed it.", "Medium", ["Amazon", "Microsoft"]],
        ["Failed Experiment", "Tell me about an experiment or bet that failed and what you took away.", "Easy", ["Google", "Startup"]],
        ["Let Down a Stakeholder", "Describe a time you let down a stakeholder and how you rebuilt trust.", "Hard", ["Amazon", "Salesforce"]],
        ["Biggest Career Lesson", "What is the biggest lesson failure taught you in your career?", "Easy", ["Google", "Meta"]],
    ],
    Communication: [
        ["Explain Complex Topic", "Tell me about a time you explained a complex topic to a non-technical audience.", "Medium", ["Google", "Microsoft"]],
        ["Difficult Conversation", "Describe a difficult conversation you had to have with a colleague or manager.", "Medium", ["Amazon", "Meta"]],
        ["Persuade Skeptical Audience", "Tell me about a time you persuaded a skeptical audience to support your idea.", "Hard", ["Amazon", "Google"]],
        ["Written Communication Win", "Describe a situation where clear written communication prevented a problem.", "Easy", ["Microsoft", "Amazon"]],
        ["Present to Executives", "Tell me about presenting to executives or senior leadership.", "Hard", ["Amazon", "Apple"]],
        ["Active Listening", "Describe a time active listening helped you solve a problem.", "Easy", ["Google", "Microsoft"]],
        ["Communicate Bad News", "Tell me about delivering bad news to your team or stakeholders.", "Medium", ["Amazon", "Meta"]],
        ["Bridge Communication Gap", "Describe a communication gap between teams you helped bridge.", "Medium", ["Google", "Amazon"]],
        ["Tailor Message to Audience", "Tell me about tailoring the same message for different audiences.", "Medium", ["Microsoft", "Salesforce"]],
    ],
    "Problem Solving": [
        ["Ambiguous Problem", "Tell me about a time you solved an ambiguous problem with limited information.", "Hard", ["Google", "Amazon"]],
        ["Creative Solution", "Describe a creative solution you came up with when the obvious approach failed.", "Medium", ["Google", "Startup"]],
        ["Root Cause Analysis", "Tell me about using root cause analysis to fix a recurring issue.", "Medium", ["Amazon", "Microsoft"]],
        ["Data-Driven Decision", "Describe a problem you solved using data to guide your decision.", "Medium", ["Google", "Meta"]],
        ["Tight Resource Constraints", "Tell me about solving a problem with very limited time or resources.", "Hard", ["Startup", "Amazon"]],
        ["Debug Production Issue", "Describe a critical production issue you diagnosed and resolved.", "Hard", ["Amazon", "Google"]],
        ["Prioritize Competing Problems", "Tell me about prioritizing multiple urgent problems at once.", "Medium", ["Amazon", "Microsoft"]],
        ["Innovate Under Pressure", "Describe a time you innovated under pressure to meet a business need.", "Medium", ["Google", "Netflix"]],
        ["Prevent Future Problems", "Tell me about a problem you solved and how you prevented it from recurring.", "Medium", ["Amazon", "Google"]],
    ],
    "Time Management": [
        ["Multiple Deadlines", "Tell me about a time you managed multiple competing deadlines successfully.", "Medium", ["Amazon", "Microsoft"]],
        ["Prioritize Under Pressure", "Describe how you prioritized tasks when everything felt urgent.", "Medium", ["Google", "Amazon"]],
        ["Say No to Work", "Tell me about a time you had to say no to work to protect priorities.", "Hard", ["Google", "Meta"]],
        ["Recover From Falling Behind", "Describe a time you fell behind schedule and caught up.", "Medium", ["Microsoft", "Startup"]],
        ["Plan Long Project", "Tell me about planning and tracking a long-running project effectively.", "Easy", ["Amazon", "Google"]],
        ["Interrupt-Driven Day", "Describe managing an interrupt-driven day while still delivering key work.", "Medium", ["Amazon", "Microsoft"]],
        ["Delegate to Save Time", "Tell me about delegating to free time for higher-impact work.", "Medium", ["Amazon", "Google"]],
        ["Meet Aggressive Timeline", "Describe delivering on an aggressive timeline without burning out the team.", "Hard", ["Amazon", "Meta"]],
        ["Improve Personal Productivity", "Tell me about a system you built to improve your own productivity.", "Easy", ["Google", "Startup"]],
    ],
    Adaptability: [
        ["Major Change at Work", "Tell me about a major change at work and how you adapted.", "Medium", ["Amazon", "Google"]],
        ["New Technology Quickly", "Describe learning a new technology or domain quickly for a project.", "Medium", ["Google", "Startup"]],
        ["Shift Priorities Suddenly", "Tell me about a time priorities shifted suddenly and how you adjusted.", "Medium", ["Amazon", "Microsoft"]],
        ["Role Change", "Describe adapting when your role or responsibilities changed significantly.", "Medium", ["Meta", "Google"]],
        ["Work With New Team", "Tell me about joining a new team and adapting to their culture.", "Easy", ["Microsoft", "Amazon"]],
        ["Handle Ambiguity", "Describe working effectively when requirements were unclear or changing.", "Hard", ["Google", "Startup"]],
        ["Company Restructure", "Tell me about navigating a company restructure or layoffs.", "Hard", ["Amazon", "Meta"]],
        ["Pivot Strategy", "Describe a project where the strategy pivoted and how you adapted.", "Medium", ["Startup", "Netflix"]],
        ["Work Outside Comfort Zone", "Tell me about doing work outside your comfort zone successfully.", "Medium", ["Google", "Amazon"]],
    ],
    "Customer Obsession": [
        ["Exceeded Customer Expectations", "Tell me about a time you went above and beyond for a customer.", "Medium", ["Amazon", "Salesforce"]],
        ["Angry Customer Recovery", "Describe turning an angry customer into a satisfied one.", "Medium", ["Amazon", "Apple"]],
        ["Customer Feedback Changed Product", "Tell me about customer feedback that changed your product or approach.", "Medium", ["Amazon", "Google"]],
        ["Balance Customer vs Business", "Describe balancing customer needs with business constraints.", "Hard", ["Amazon", "Meta"]],
        ["User Research Insight", "Tell me about a user research insight that drove a key decision.", "Medium", ["Google", "Amazon"]],
        ["Long-Term Customer Relationship", "Describe building a long-term relationship with a key customer or user.", "Easy", ["Salesforce", "Amazon"]],
        ["Say No to Customer Request", "Tell me about saying no to a customer request and handling it well.", "Hard", ["Amazon", "Google"]],
        ["Customer-Centric Tradeoff", "Describe a tradeoff you made to prioritize the customer experience.", "Medium", ["Amazon", "Apple"]],
        ["Measure Customer Impact", "Tell me about measuring and improving customer satisfaction or NPS.", "Medium", ["Amazon", "Microsoft"]],
    ],
    "Project Management": [
        ["Plan Complex Project", "Tell me about planning and delivering a complex multi-phase project.", "Hard", ["Amazon", "Microsoft"]],
        ["Manage Project Risks", "Describe identifying and mitigating risks on a critical project.", "Medium", ["Amazon", "Google"]],
        ["Coordinate Dependencies", "Tell me about coordinating dependencies across multiple teams.", "Hard", ["Amazon", "Meta"]],
        ["Project Behind Schedule", "Describe a project that fell behind and how you got it back on track.", "Medium", ["Microsoft", "Amazon"]],
        ["Scope Creep", "Tell me about managing scope creep on a project.", "Medium", ["Google", "Startup"]],
        ["Launch Successful Release", "Describe leading a successful product or feature launch.", "Medium", ["Amazon", "Google"]],
        ["Resource Constraints", "Tell me about delivering a project with limited people or budget.", "Hard", ["Startup", "Amazon"]],
        ["Stakeholder Updates", "Describe keeping stakeholders informed throughout a long project.", "Easy", ["Microsoft", "Amazon"]],
        ["Post-Mortem Improvements", "Tell me about running a post-mortem and implementing improvements.", "Medium", ["Amazon", "Google"]],
    ],
    "Decision Making": [
        ["Difficult Tradeoff", "Tell me about a difficult tradeoff you had to make with incomplete data.", "Hard", ["Amazon", "Google"]],
        ["Unpopular Decision", "Describe making an unpopular decision that was right for the business.", "Hard", ["Amazon", "Meta"]],
        ["Fast Decision Under Pressure", "Tell me about a fast decision you made under pressure.", "Medium", ["Amazon", "Startup"]],
        ["Reversible vs Irreversible", "Describe how you decide between reversible and irreversible choices.", "Medium", ["Amazon", "Google"]],
        ["Data vs Intuition", "Tell me about a decision where data and intuition conflicted.", "Medium", ["Google", "Meta"]],
        ["Involve Others in Decision", "Describe a major decision you made with input from others.", "Easy", ["Microsoft", "Google"]],
        ["Wrong Decision Recovery", "Tell me about realizing a decision was wrong and correcting course.", "Medium", ["Amazon", "Google"]],
        ["Ethical Decision", "Describe an ethical dilemma you faced and how you decided.", "Hard", ["Amazon", "Apple"]],
        ["Prioritize Roadmap", "Tell me about prioritizing features or initiatives on a roadmap.", "Medium", ["Google", "Amazon"]],
    ],
};

const COMMON_QUESTIONS = [
    ["Tell Me About Yourself", "Tell me about yourself.", "Communication", "Easy", ["All"], ["General", "Introduction"]],
    ["Why This Company", "Why do you want to work at this company?", "Communication", "Easy", ["All"], ["General", "Motivation"]],
    ["Greatest Strength", "What is your greatest strength? Give an example.", "Communication", "Easy", ["All"], ["General"]],
    ["Greatest Weakness", "What is your greatest weakness and how are you working on it?", "Failure & Learning", "Easy", ["All"], ["General"]],
    ["Difficult Project", "Describe the most difficult project you have worked on.", "Problem Solving", "Hard", ["Google", "Amazon"]],
    ["Work Under Pressure", "Tell me about a time you had to work under pressure.", "Time Management", "Medium", ["Amazon", "Microsoft"]],
    ["Made a Mistake", "Tell me about a time you made a mistake at work.", "Failure & Learning", "Medium", ["Amazon", "Google"]],
    ["Difficult Customer", "Tell me about a difficult customer or user you handled.", "Customer Obsession", "Medium", ["Amazon", "Salesforce"]],
    ["Leadership Experience", "Tell me about a leadership experience you are proud of.", "Leadership", "Medium", ["Amazon", "Meta"]],
    ["Proud Achievement", "What achievement are you most proud of and why?", "Ownership", "Easy", ["All"], ["General"]],
    ["Handle Criticism", "Tell me about a time you received criticism and how you handled it.", "Failure & Learning", "Medium", ["Google", "Meta"]],
    ["Influence Without Authority", "Describe influencing an outcome without formal authority.", "Leadership", "Medium", ["Amazon", "Google"]],
];

function buildFromCategory(category, entries) {
    return entries.map(([title, question, difficulty, companyTags], index) =>
        createBehavioralQuestion({
            title,
            question,
            category,
            difficulty,
            companyTags,
            tags: [category.split(" ")[0]],
            order: index + 1,
        })
    );
}

function buildCommonQuestions(entries) {
    return entries.map(([title, question, category, difficulty, companyTags, tags], index) =>
        createBehavioralQuestion({
            title,
            question,
            category,
            difficulty,
            companyTags,
            tags,
            order: index + 1,
        })
    );
}

const allQuestions = [
    ...buildCommonQuestions(COMMON_QUESTIONS),
    ...Object.entries(CATEGORY_DEFINITIONS).flatMap(([category, entries]) =>
        buildFromCategory(category, entries)
    ),
];

module.exports = allQuestions;
