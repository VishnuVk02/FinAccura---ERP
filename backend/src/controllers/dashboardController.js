const dashboardService = require('../services/dashboardService');

const getStats = async (req, res) => {
    try {
        const stats = await dashboardService.getDashboardStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getFinanceStats = async (req, res) => {
    try {
        const stats = await dashboardService.getFinanceStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProductionSummary = async (req, res) => {
    try {
        const stats = await dashboardService.getProductionSummary();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getExportStats = async (req, res) => {
    try {
        const stats = await dashboardService.getExportStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPOStats = async (req, res) => {
    try {
        const stats = await dashboardService.getPOStats();
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getStats,
    getFinanceStats,
    getProductionSummary,
    getExportStats,
    getPOStats
};
