// Backward-compatible re-export — existing imports keep working
const {
    questionAnswerPrompt,
    resumeQuestionPrompt,
    jdQuestionPrompt,
    combinedQuestionPrompt,
    conceptExplainPrompt,
    topicQuestionPrompt,
} = require("./prompts/questions");

module.exports = {
    questionAnswerPrompt,
    resumeQuestionPrompt,
    jdQuestionPrompt,
    combinedQuestionPrompt,
    conceptExplainPrompt,
    topicQuestionPrompt,
};
