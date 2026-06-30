const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const ALLOWED_MIME_TYPES = {
    "application/pdf": "pdf",
    "application/x-pdf": "pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "text/plain": "txt",
};

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt"];

const MIN_EXTRACTED_TEXT_LENGTH = 50;

function getExtension(filename) {
    const dot = filename.lastIndexOf(".");
    return dot >= 0 ? filename.slice(dot).toLowerCase() : "";
}

function isPdfBuffer(buffer) {
    if (!buffer || buffer.length < 4) return false;
    return buffer.slice(0, 4).toString("ascii") === "%PDF";
}

function isDocxBuffer(buffer) {
    if (!buffer || buffer.length < 4) return false;
    return buffer[0] === 0x50 && buffer[1] === 0x4b;
}

async function parsePdfWithPdfParse(buffer) {
    const data = await pdfParse(buffer, { max: 0 });
    return data.text || "";
}

async function parsePdfWithPdfJs(buffer) {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    const doc = await pdfjs.getDocument({
        data: new Uint8Array(buffer),
        useSystemFonts: true,
        standardFontDataUrl: undefined,
    }).promise;

    const parts = [];

    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
        const page = await doc.getPage(pageNum);
        const content = await page.getTextContent();
        let lastY = null;
        let pageText = "";

        for (const item of content.items) {
            if (!item.str) continue;
            const y = item.transform?.[5];

            if (lastY !== null && y !== null && Math.abs(y - lastY) > 4) {
                pageText += "\n";
            } else if (pageText && !pageText.endsWith("\n") && !pageText.endsWith(" ")) {
                pageText += " ";
            }

            pageText += item.str;
            if (y !== null) lastY = y;
        }

        parts.push(pageText);
    }

    await doc.destroy();
    return parts.join("\n\n");
}

async function parsePdfBuffer(buffer) {
    if (!isPdfBuffer(buffer)) {
        throw new Error("The uploaded file does not appear to be a valid PDF.");
    }

    let text = "";

    try {
        text = await parsePdfWithPdfParse(buffer);
    } catch (error) {
        console.warn("pdf-parse failed, trying pdfjs-dist:", error.message);
    }

    const normalized = normalizeParsedText(text);
    if (normalized.length >= MIN_EXTRACTED_TEXT_LENGTH) {
        return normalized;
    }

    try {
        const fallbackText = await parsePdfWithPdfJs(buffer);
        const normalizedFallback = normalizeParsedText(fallbackText);
        if (normalizedFallback.length > normalized.length) {
            console.log(
                `PDF fallback extractor improved text length: ${normalized.length} -> ${normalizedFallback.length}`
            );
            return normalizedFallback;
        }
    } catch (error) {
        console.warn("pdfjs-dist extraction failed:", error.message);
    }

    return normalized;
}

async function parseDocxBuffer(buffer) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || "";
}

async function parseDocumentBuffer(buffer, mimeType, originalName) {
    if (!buffer || !buffer.length) {
        throw new Error("Uploaded file is empty.");
    }

    const ext = getExtension(originalName || "");
    const normalizedMime = (mimeType || "").toLowerCase();

    if (
        normalizedMime === "application/pdf" ||
        normalizedMime === "application/x-pdf" ||
        ext === ".pdf" ||
        isPdfBuffer(buffer)
    ) {
        return parsePdfBuffer(buffer);
    }

    if (
        normalizedMime ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        ext === ".docx" ||
        isDocxBuffer(buffer)
    ) {
        return parseDocxBuffer(buffer);
    }

    if (normalizedMime === "text/plain" || ext === ".txt") {
        return buffer.toString("utf-8");
    }

    throw new Error("Unsupported file type. Please upload PDF, DOCX, or TXT.");
}

function validateDocumentFile(file) {
    if (!file) {
        throw new Error("No file uploaded");
    }

    const ext = getExtension(file.originalname);
    const mimeOk = ALLOWED_MIME_TYPES[(file.mimetype || "").toLowerCase()];
    const extOk = ALLOWED_EXTENSIONS.includes(ext);
    const bufferOk =
        (file.buffer && isPdfBuffer(file.buffer)) ||
        (file.buffer && isDocxBuffer(file.buffer));

    if (!mimeOk && !extOk && !bufferOk) {
        throw new Error("Only PDF, DOCX, and TXT files are allowed");
    }

    if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size must be under 5MB");
    }
}

function normalizeParsedText(text) {
    return text
        .replace(/\u0000/g, "")
        .replace(/\r\n/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
}

module.exports = {
    parseDocumentBuffer,
    validateDocumentFile,
    normalizeParsedText,
    isPdfBuffer,
    MIN_EXTRACTED_TEXT_LENGTH,
    ALLOWED_MIME_TYPES,
    ALLOWED_EXTENSIONS,
};
