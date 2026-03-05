const productionService = require('../services/productionService');

exports.createLine = async (req, res) => {
    try {
        const line = await productionService.createProductionLine(req.body);
        res.status(201).json(line);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getLines = async (req, res) => {
    try {
        const lines = await productionService.getAllProductionLines();
        res.json(lines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateLine = async (req, res) => {
    try {
        const line = await productionService.updateProductionLine(req.params.id, req.body);
        res.json(line);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.deleteLine = async (req, res) => {
    try {
        await productionService.deleteProductionLine(req.params.id);
        res.json({ message: 'Production Line deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.createOrder = async (req, res) => {
    try {
        const order = await productionService.createProductionOrder(req.body);
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const orders = await productionService.getProductionSummary();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const order = await productionService.updateProductionOrder(req.params.id, req.body);
        res.json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const { ProductionOrder } = require('../models');
        const order = await ProductionOrder.findByPk(id);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        await order.update({ status });
        res.json(order);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.createDailyReport = async (req, res) => {
    try {
        const report = await productionService.createDailyReport(req.body);
        res.status(201).json(report);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getDailyReports = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { DailyProductionReport } = require('../models');
        const reports = await DailyProductionReport.findAll({
            where: { productionOrderId: orderId },
            order: [['productionDate', 'DESC']]
        });
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getReportsByDate = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) return res.status(400).json({ message: 'Date is required' });
        const reports = await productionService.getDailyReportsByDate(date);
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.allocateWorkers = async (req, res) => {
    try {
        const allocation = await productionService.createWorkerAllocation(req.body);
        res.status(201).json(allocation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getWorkerAllocations = async (req, res) => {
    try {
        const allocations = await productionService.getWorkerAllocations();
        res.json(allocations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getLastAllocation = async (req, res) => {
    try {
        const { lineId } = req.params;
        const allocation = await productionService.getLatestAllocationForLine(lineId);
        res.json(allocation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getReports = async (req, res) => {
    try {
        const summary = await productionService.getProductionSummary();
        const efficiency = await productionService.getEfficiencyReport();
        const defects = await productionService.getDefectReport();

        res.json({ summary, efficiency, defects });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getStats = async (req, res) => {
    try {
        const { ProductionLine, ProductionOrder, DailyProductionReport } = require('../models');
        const today = new Date().toISOString().split('T')[0];

        const totalLines = await ProductionLine.count();
        const activeLines = await ProductionLine.count({ where: { isActive: true } });
        const totalWorkers = await ProductionLine.sum('totalWorkers') || 0;
        const inProgressOrders = await ProductionOrder.count({ where: { status: 'IN_PROGRESS' } });
        const completedOrders = await ProductionOrder.count({ where: { status: 'COMPLETED' } });

        const todayReports = await DailyProductionReport.findAll({
            where: { productionDate: today }
        });

        const todayProduction = todayReports.reduce((s, r) => s + r.totalProduced, 0);
        const todayDefects = todayReports.reduce((s, r) => s + r.totalDefects, 0);
        const avgEfficiency = todayReports.length > 0
            ? todayReports.reduce((s, r) => s + r.efficiencyPercentage, 0) / todayReports.length
            : 0;

        const charts = await productionService.getDashboardChartData();

        const underperformingLines = charts.lineEfficiency.filter(l => l.performance === 'Underperforming').length;
        const highPerformingLines = charts.lineEfficiency.filter(l => l.performance === 'High').length;

        res.json({
            summary: {
                totalLines, activeLines, totalWorkers,
                inProgressOrders, completedOrders,
                todayProduction, todayDefects,
                avgEfficiency: parseFloat(avgEfficiency.toFixed(2)),
                underperformingLines,
                highPerformingLines
            },
            ...charts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
