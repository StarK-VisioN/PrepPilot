const getPublicConfig = (_req, res) => {
    res.json({
        success: true,
        data: {
            googleClientId: process.env.GOOGLE_CLIENT_ID || null,
        },
    });
};

module.exports = { getPublicConfig };
