const Document = require("../models/Document");
const {
    parseDocumentBuffer,
    validateDocumentFile,
    normalizeParsedText,
    isPdfBuffer,
    MIN_EXTRACTED_TEXT_LENGTH,
} = require("./documentParserService");
const { extractResumeData, extractJdData } = require("./documentExtractService");

async function saveDocument({ userId, type, originalName, mimeType, parsedText, extractedData }) {
    return Document.create({
        user: userId,
        type,
        originalName,
        mimeType,
        parsedText,
        extractedData,
    });
}

async function parseAndExtractFromFile({ file, userId, type }) {
    validateDocumentFile(file);

    const rawText = await parseDocumentBuffer(file.buffer, file.mimetype, file.originalname);
    const parsedText = normalizeParsedText(rawText);

    if (!parsedText || parsedText.length < MIN_EXTRACTED_TEXT_LENGTH) {
        if (isPdfBuffer(file.buffer)) {
            throw new Error(
                "This PDF has little or no readable text (it may be a scanned image). Export a text-based PDF or paste the content instead."
            );
        }
        throw new Error(
            "Could not extract enough text from the document. Try a different file or paste the text instead."
        );
    }

    const extractedData =
        type === "resume"
            ? await extractResumeData(parsedText)
            : await extractJdData(parsedText);

    const document = await saveDocument({
        userId,
        type,
        originalName: file.originalname,
        mimeType: file.mimetype,
        parsedText,
        extractedData,
    });

    return { document, extractedData, parsedText };
}

async function parseAndExtractFromText({ text, userId, type, originalName = "pasted-text.txt" }) {
    const parsedText = normalizeParsedText(text);

    if (!parsedText || parsedText.length < 50) {
        throw new Error("Please provide at least 50 characters of job description text.");
    }

    const extractedData =
        type === "resume"
            ? await extractResumeData(parsedText)
            : await extractJdData(parsedText);

    const document = await saveDocument({
        userId,
        type,
        originalName,
        mimeType: "text/plain",
        parsedText,
        extractedData,
    });

    return { document, extractedData, parsedText };
}

async function getDocumentForUser(documentId, userId) {
    const document = await Document.findOne({ _id: documentId, user: userId });
    if (!document) {
        throw new Error("Document not found");
    }
    return document;
}

module.exports = {
    parseAndExtractFromFile,
    parseAndExtractFromText,
    getDocumentForUser,
};
