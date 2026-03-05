const { ProductionLine, ProductionOrder, DailyProductionReport, WorkerAllocation, ExportOrder, PurchaseOrder, sequelize } = require('../models');

class ProductionService {
    // 1. Production Lines
    async createProductionLine(data) {
        return await ProductionLine.create(data);
    }

    async getAllProductionLines() {
        return await ProductionLine.findAll({ include: ['Unit'] });
    }

    async updateProductionLine(id, data) {
        const line = await ProductionLine.findByPk(id);
        if (!line) throw new Error('Production Line not found');
        return await line.update(data);
    }

    async deleteProductionLine(id) {
        const line = await ProductionLine.findByPk(id);
        if (!line) throw new Error('Production Line not found');
        return await line.destroy();
    }

    // 2. Production Orders
    async createProductionOrder(data) {
        // Business Rule: Cannot assign completed ExportOrder
        const exportOrder = await ExportOrder.findByPk(data.exportOrderId);
        if (!exportOrder) throw new Error('Export Order not found');
        if (exportOrder.status === 'COMPLETED') {
            throw new Error('Cannot assign a completed Export Order to production');
        }

        // Business Rule: Cannot assign same order to same line twice (if active)
        const existing = await ProductionOrder.findOne({
            where: {
                exportOrderId: data.exportOrderId,
                lineId: data.lineId,
                status: 'IN_PROGRESS'
            }
        });
        if (existing) throw new Error('This order is already assigned and in progress on this line');

        return await ProductionOrder.create({
            ...data,
            isProductionStarted: true,
            status: 'IN_PROGRESS'
        });
    }

    async updateProductionOrder(id, data) {
        const order = await ProductionOrder.findByPk(id);
        if (!order) throw new Error('Production Order not found');
        return await order.update(data);
    }

    // 3. Daily Production Report
    async createDailyReport(data) {
        const transaction = await sequelize.transaction();
        try {
            data.totalProduced = Number(data.totalProduced) || 0;
            data.totalDefects = Number(data.totalDefects) || 0;

            const prodOrder = await ProductionOrder.findByPk(data.productionOrderId, {
                include: [{ model: ProductionLine, as: 'ProductionLine' }],
                transaction
            });

            if (!prodOrder) throw new Error('Production Order not found');

            // Business Rule: Defects must not exceed totalProduced
            if (data.totalDefects > data.totalProduced) {
                throw new Error('Defects cannot exceed total produced quantity');
            }

            // Fetch Worker Allocation for efficiency calculation
            // Fallback: If no allocation for today, look for the most recent one for this line
            let allocation = await WorkerAllocation.findOne({
                where: {
                    lineId: prodOrder.lineId,
                    allocationDate: data.productionDate
                },
                transaction
            });

            if (!allocation) {
                allocation = await WorkerAllocation.findOne({
                    where: { lineId: prodOrder.lineId },
                    order: [['allocationDate', 'DESC']],
                    transaction
                });
            }

            let efficiency = 0;
            if (allocation) {
                const { presentWorkers, standardOutputPerWorker, workingHours } = allocation;
                const expectedOutput = presentWorkers * standardOutputPerWorker * workingHours;

                if (expectedOutput > 0) {
                    efficiency = (data.totalProduced / expectedOutput) * 100;
                }
                // Sync workingHours if needed
                data.workingHours = workingHours;
            } else {
                // Fallback or handle missing allocation
                console.warn(`No worker allocation found for line ${prodOrder.lineId} on ${data.productionDate}`);
            }

            data.efficiencyPercentage = parseFloat(efficiency.toFixed(2));

            const report = await DailyProductionReport.create(data, { transaction });

            // Update Production Order Totals
            const newProduced = prodOrder.producedQuantity + data.totalProduced;
            const newDefects = prodOrder.defectQuantity + data.totalDefects;

            let status = prodOrder.status;
            if (newProduced >= prodOrder.targetQuantity) {
                status = 'COMPLETED';
            }

            await prodOrder.update({
                producedQuantity: newProduced,
                defectQuantity: newDefects,
                status: status
            }, { transaction });

            await transaction.commit();
            return report;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    // 4. Worker Allocation
    async createWorkerAllocation(data) {
        // Validation: presentWorkers cannot exceed plannedWorkers
        if (Number(data.presentWorkers) > Number(data.plannedWorkers)) {
            throw new Error('Present workers cannot exceed planned workers');
        }
        if (Number(data.workingHours) <= 0) {
            throw new Error('Working hours must be greater than 0');
        }
        return await WorkerAllocation.create(data);
    }

    async getWorkerAllocations() {
        return await WorkerAllocation.findAll({
            include: [{ model: ProductionLine }]
        });
    }

    async getLatestAllocationForLine(lineId) {
        return await WorkerAllocation.findOne({
            where: { lineId },
            order: [['allocationDate', 'DESC']]
        });
    }

    // 5. Reports & Summary
    async getProductionSummary() {
        return await ProductionOrder.findAll({
            include: [
                { model: ExportOrder },
                { model: PurchaseOrder },
                { model: ProductionLine }
            ],
            order: [['createdAt', 'DESC']]
        });
    }

    async getEfficiencyReport() {
        return await DailyProductionReport.findAll({
            include: [
                {
                    model: ProductionOrder,
                    include: [{ model: ProductionLine }]
                }
            ],
            order: [['productionDate', 'DESC']]
        });
    }

    async getDefectReport() {
        return await DailyProductionReport.findAll({
            attributes: ['productionDate', 'totalProduced', 'totalDefects', 'efficiencyPercentage'],
            include: [{
                model: ProductionOrder,
                include: [{ model: ProductionLine }]
            }]
        });
    }

    async getDailyReportsByDate(date) {
        return await DailyProductionReport.findAll({
            where: { productionDate: date }
        });
    }

    async getDashboardChartData() {
        const today = new Date().toISOString().split('T')[0];
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            last7Days.push(d.toISOString().split('T')[0]);
        }

        // 1. Line-wise Efficiency Comparison (Today)
        const lines = await ProductionLine.findAll({ where: { isActive: true } });
        const lineEfficiency = await Promise.all(lines.map(async (line) => {
            const reports = await DailyProductionReport.findAll({
                where: { productionDate: today },
                include: [{
                    model: ProductionOrder,
                    where: { lineId: line.id },
                    required: true
                }]
            });

            const output = reports.reduce((s, r) => s + r.totalProduced, 0);
            const defects = reports.reduce((s, r) => s + r.totalDefects, 0);
            const avgEff = reports.length > 0
                ? reports.reduce((s, r) => s + r.efficiencyPercentage, 0) / reports.length
                : 0;

            const eff = parseFloat(avgEff.toFixed(2));
            let performance = 'Normal';
            if (eff > 90) performance = 'High';
            else if (eff < 70) performance = 'Underperforming';

            return {
                name: line.lineName,
                efficiency: eff,
                output,
                defects,
                performance
            };
        }));

        // 2. 7-Day Production Trend
        const trendData = await Promise.all(last7Days.map(async (date) => {
            const total = await DailyProductionReport.sum('totalProduced', { where: { productionDate: date } }) || 0;
            const defects = await DailyProductionReport.sum('totalDefects', { where: { productionDate: date } }) || 0;
            return {
                date: new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
                output: total,
                defects: defects
            };
        }));

        // 3. Defect Stats (Today)
        const defectStats = lineEfficiency.map(l => ({
            name: l.name,
            defects: l.defects,
            produced: l.output
        }));

        return {
            lineEfficiency,
            productionTrend: trendData,
            defectStats
        };
    }
}

module.exports = new ProductionService();
