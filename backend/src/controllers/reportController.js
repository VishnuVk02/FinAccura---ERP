const { getLedgerReport, getTrialBalance } = require('../services/reportService');

const getLedger = async (req, res) => {
    const { accountId, startDate, endDate } = req.query;
    try {
        const report = await getLedgerReport(accountId, startDate, endDate);
        res.json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getTrialBalanceReport = async (req, res) => {
    try {
        const report = await getTrialBalance();
        res.json(report);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getLedger, getTrialBalanceReport };
