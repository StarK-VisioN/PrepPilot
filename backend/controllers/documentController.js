const {
    parseAndExtractFromFile,
    parseAndExtractFromText,
    getDocumentForUser,
} = require("../services/documentService");

const uploadResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file received. Ensure the upload is sent as multipart/form-data with field name 'file'.",
            });
        }

        const { document, extractedData } = await parseAndExtractFromFile({
            file: req.file,
            userId: req.user._id,
            type: "resume",
        });

        res.status(201).json({
            success: true,
            documentId: document._id,
            extractedData,
            message: "Resume parsed successfully",
        });
    } catch (error) {
        console.error("Resume upload error:", error);
        res.status(error.message.includes("upload") || error.message.includes("file") || error.message.includes("PDF") || error.message.includes("text") ? 400 : 500).json({
            success: false,
            message: error.message || "Failed to parse resume",
        });
    }
};

const uploadJobDescription = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No file received. Ensure the upload is sent as multipart/form-data with field name 'file'.",
            });
        }

        const { document, extractedData } = await parseAndExtractFromFile({
            file: req.file,
            userId: req.user._id,
            type: "jd",
        });

        res.status(201).json({
            success: true,
            documentId: document._id,
            extractedData,
            message: "Job description parsed successfully",
        });
    } catch (error) {
        console.error("JD upload error:", error);
        res.status(error.message.includes("upload") || error.message.includes("file") || error.message.includes("PDF") || error.message.includes("text") ? 400 : 500).json({
            success: false,
            message: error.message || "Failed to parse job description",
        });
    }
};

const pasteJobDescription = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ success: false, message: "Job description text is required" });
        }

        const { document, extractedData } = await parseAndExtractFromText({
            text,
            userId: req.user._id,
            type: "jd",
        });

        res.status(201).json({
            success: true,
            documentId: document._id,
            extractedData,
            message: "Job description processed successfully",
        });
    } catch (error) {
        console.error("JD paste error:", error);
        res.status(400).json({
            success: false,
            message: error.message || "Failed to process job description",
        });
    }
};

const getDocument = async (req, res) => {
    try {
        const document = await getDocumentForUser(req.params.id, req.user._id);
        res.status(200).json({ success: true, document });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};

module.exports = {
    uploadResume,
    uploadJobDescription,
    pasteJobDescription,
    getDocument,
};
