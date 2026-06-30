const { COMPANIES } = require("../utils/companies");

const getCompanies = (req, res) => {
    res.status(200).json({ success: true, companies: COMPANIES });
};

module.exports = { getCompanies };
