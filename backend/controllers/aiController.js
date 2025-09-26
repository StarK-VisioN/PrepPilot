// controllers/aiController.js
const { GoogleGenAI } = require("@google/genai");
const { conceptExplainPrompt, questionAnswerPrompt } = require("../utils/prompts");

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Retry function with exponential backoff
async function callGeminiWithRetry(prompt, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Gemini attempt ${attempt}/${maxRetries}`);
            const response = await ai.models.generateContent({
                model: "gemini-2.0-flash-lite",
                contents: prompt,
            });
            return response.text;
        } catch (error) {
            // Check if it's a retryable error
            if ((error.status === 503 || error.status === 429) && attempt < maxRetries) {
                const delay = Math.min(1000 * Math.pow(2, attempt), 10000); // Max 10s delay
                console.log(`Gemini overloaded. Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
                continue;
            }
            throw error;
        }
    }
}

// Validate and clean Gemini response
function cleanAndParseGeminiResponse(rawText) {
    if (!rawText || typeof rawText !== 'string') {
        throw new Error('Invalid response from Gemini API');
    }

    let cleanedText = rawText.trim();
    
    // Remove JSON code blocks if present
    cleanedText = cleanedText
        .replace(/^```json\s*/i, '')
        .replace(/```$/i, '')
        .trim();

    // Basic validation - check if it looks like JSON
    if (!cleanedText.startsWith('[') && !cleanedText.startsWith('{')) {
        console.error('Response does not appear to be JSON:', cleanedText.substring(0, 100));
        throw new Error('Invalid response format from Gemini');
    }

    try {
        return JSON.parse(cleanedText);
    } catch (parseError) {
        console.error('JSON parsing failed. Raw text:', cleanedText);
        throw new Error(`Failed to parse Gemini response: ${parseError.message}`);
    }
}

// Generate interview questions and answers using Gemini
const generateInterviewQuestions = async (req, res) => {
    try {
        const { role, experience, topicsToFocus, numberOfQuestions } = req.body;

        if (!role || !experience || !topicsToFocus || !numberOfQuestions) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const prompt = questionAnswerPrompt(role, experience, topicsToFocus, numberOfQuestions);
        console.log("Sending prompt to Gemini");

        const rawText = await callGeminiWithRetry(prompt);
        console.log("Raw response from Gemini");

        const data = cleanAndParseGeminiResponse(rawText);
        console.log("Successfully parsed response");

        res.status(200).json(data);
    } catch (error) {
        console.error("Error in generateInterviewQuestions:", error);
        
        if (error.status === 503) {
            return res.status(503).json({ 
                message: "The AI service is currently overloaded. Please try again in a few moments.",
                isRetryable: true,
                retryAfter: 30
            });
        }
        
        if (error.status === 429) {
            return res.status(429).json({ 
                message: "Too many requests. Please wait a minute before trying again.",
                isRetryable: true,
                retryAfter: 60
            });
        }

        if (error.message.includes('JSON') || error.message.includes('parse')) {
            return res.status(422).json({ 
                message: "The AI service returned an invalid response. Please try again.",
                isRetryable: true
            });
        }
        
        res.status(500).json({ 
            message: "Failed to generate questions", 
            error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message 
        });
    }
};

// Generate explanation for an interview question
const generateConceptExplanation = async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({ message: "Missing required field: question" });
        }

        const prompt = conceptExplainPrompt(question);
        console.log("Sending explanation prompt to Gemini");

        const rawText = await callGeminiWithRetry(prompt);
        console.log("Raw explanation response");

        const data = cleanAndParseGeminiResponse(rawText);
        console.log("Successfully parsed explanation");

        res.status(200).json(data);
    } catch (error) {
        console.error("Error in generateConceptExplanation:", error);
        
        if (error.status === 503) {
            return res.status(503).json({ 
                message: "The AI service is currently overloaded. Please try again in a few moments.",
                isRetryable: true,
                retryAfter: 30
            });
        }
        
        if (error.status === 429) {
            return res.status(429).json({ 
                message: "Too many requests. Please wait a minute before trying again.",
                isRetryable: true,
                retryAfter: 60
            });
        }

        if (error.message.includes('JSON') || error.message.includes('parse')) {
            return res.status(422).json({ 
                message: "The AI service returned an invalid response. Please try again.",
                isRetryable: true
            });
        }
        
        res.status(500).json({ 
            message: "Failed to generate explanation", 
            error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message 
        });
    }
};

module.exports = { generateInterviewQuestions, generateConceptExplanation };