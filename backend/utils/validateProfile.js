const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 80;

const sanitizeName = (value) => {
    if (typeof value !== "string") {
        return "";
    }

    return value
        .replace(/<[^>]*>/g, "")
        .replace(/[^\p{L}\p{N}\s'.-]/gu, "")
        .replace(/\s+/g, " ")
        .trim();
};

const validateName = (rawName) => {
    const name = sanitizeName(rawName);

    if (!name) {
        return { valid: false, message: "Name is required" };
    }

    if (name.length < MIN_NAME_LENGTH) {
        return { valid: false, message: `Name must be at least ${MIN_NAME_LENGTH} characters` };
    }

    if (name.length > MAX_NAME_LENGTH) {
        return { valid: false, message: `Name must be at most ${MAX_NAME_LENGTH} characters` };
    }

    return { valid: true, name };
};

module.exports = {
    sanitizeName,
    validateName,
    MIN_NAME_LENGTH,
    MAX_NAME_LENGTH,
};
