const {
    Invoice, Payment, ExportOrder, Buyer, Voucher, VoucherEntry,
    Account, SubGroup, Group, MainGroup,
    ProductionOrder, DailyProductionReport, ProductionLine,
    PurchaseOrder,
    sequelize
} = require('../models');
const { Op } = require('sequelize');

/**
 * Helper to get all account IDs belonging to a specific Main Group nature/name
 */
const getAccountIdsByMainGroup = async (nature, name) => {
    const accounts = await Account.findAll({
        attributes: ['id'],
        include: [{
            model: SubGroup,
            required: true,
            attributes: [],
            include: [{
                model: Group,
                required: true,
                attributes: [],
                include: [{
                    model: MainGroup,
                    required: true,
                    where: {
                        ...(nature && { nature }),
                        ...(name && { name })
                    },
                    attributes: []
                }]
            }]
        }],
        raw: true
    });
    return accounts.map(a => a.id);
};

const getDashboardStats = async () => {
    try {
        const totalRevenue = await ExportOrder.sum('totalAmountInINR') || 0;
        const pendingInvoices = await Invoice.count({ where: { status: ['PENDING', 'PARTIAL'] } });
        const totalReceived = await Payment.sum('receivedAmountInINR') || 0;

        // 1. Get Expense Account IDs
        const expenseAccountIds = await getAccountIdsByMainGroup(null, 'Expense');

        // 2. Sum debitAmount from voucher entries for these accounts
        const totalExpense = await VoucherEntry.sum('debitAmount', {
            where: { accountId: { [Op.in]: expenseAccountIds } }
        }) || 0;

        const netProfit = parseFloat(totalRevenue) - parseFloat(totalExpense);
        const totalOrders = await ExportOrder.count();
        const completedOrders = await ExportOrder.count({ where: { status: 'COMPLETED' } });

        return {
            totalRevenue: parseFloat(totalRevenue),
            totalExpense: parseFloat(totalExpense),
            netProfit: parseFloat(netProfit.toFixed(2)),
            pendingInvoices,
            totalReceived: parseFloat(totalReceived),
            totalOrders,
            completedOrders,
            outstandingAmount: parseFloat((totalRevenue - totalReceived).toFixed(2))
        };
    } catch (error) {
        console.error('getDashboardStats Error:', error);
        throw new Error('Error fetching dashboard stats: ' + error.message);
    }
};

const getFinanceStats = async () => {
    try {
        // Monthly revenue from invoices
        const monthlyRevenue = await Invoice.findAll({
            attributes: [
                [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('invoiceDate')), 'month'],
                [sequelize.fn('SUM', sequelize.col('totalAmountInINR')), 'revenue']
            ],
            group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('invoiceDate'))],
            order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('invoiceDate')), 'ASC']],
            raw: true
        });

        // Monthly payments received
        const monthlyPayments = await Payment.findAll({
            attributes: [
                [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('paymentDate')), 'month'],
                [sequelize.fn('SUM', sequelize.col('receivedAmountInINR')), 'received']
            ],
            group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('paymentDate'))],
            order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('paymentDate')), 'ASC']],
            raw: true
        });

        // Buyer-wise revenue
        const buyerRevenue = await ExportOrder.findAll({
            attributes: [
                [sequelize.fn('SUM', sequelize.col('Invoice.totalAmountInINR')), 'totalAmount']
            ],
            include: [{ model: Invoice, attributes: [] }, { model: Buyer, attributes: ['name'] }],
            group: ['Buyer.id', 'Buyer.name'],
            raw: true
        });

        // Invoice status distribution
        const invoiceStatus = await Invoice.findAll({
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalAmount']
            ],
            group: ['status'],
            raw: true
        });

        // Get Expense Account IDs for filtered summary
        const expenseAccountIds = await getAccountIdsByMainGroup(null, 'Expense');

        // Expense category breakdown from voucher entries
        const expenseCategories = await VoucherEntry.findAll({
            attributes: [
                [sequelize.fn('SUM', sequelize.col('debitAmount')), 'amount']
            ],
            include: [{
                model: Account,
                attributes: ['name'],
                include: [{
                    model: SubGroup,
                    attributes: ['name']
                }]
            }],
            where: {
                debitAmount: { [Op.gt]: 0 },
                accountId: { [Op.in]: expenseAccountIds }
            },
            group: ['Account.id', 'Account.name', 'Account.SubGroup.id', 'Account.SubGroup.name'],
            raw: true
        });

        // Order status distribution
        const orderStatus = await ExportOrder.findAll({
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['status'],
            raw: true
        });

        // Amount received by buyer
        const buyerPayments = await Payment.findAll({
            attributes: [
                [sequelize.col('Invoice.ExportOrder.Buyer.name'), 'buyerName'],
                [sequelize.fn('SUM', sequelize.col('receivedAmountInINR')), 'totalReceived']
            ],
            include: [{
                model: Invoice,
                attributes: [],
                include: [{
                    model: ExportOrder,
                    attributes: [],
                    include: [{ model: Buyer, attributes: [] }]
                }]
            }],
            group: ['Invoice.ExportOrder.Buyer.id', 'Invoice.ExportOrder.Buyer.name'],
            raw: true
        });

        return {
            monthlyRevenue,
            monthlyPayments,
            buyerRevenue,
            buyerPayments,
            invoiceStatus,
            expenseCategories,
            orderStatus
        };
    } catch (error) {
        throw new Error('Error fetching finance stats: ' + error.message);
    }
};

const getProductionSummary = async () => {
    try {
        const totalLines = await ProductionLine.count();
        const activeLines = await ProductionLine.count({ where: { isActive: true } });
        const totalWorkers = await ProductionLine.sum('totalWorkers') || 0;

        const avgEffResult = await DailyProductionReport.findOne({
            attributes: [[sequelize.fn('AVG', sequelize.col('efficiencyPercentage')), 'avgEfficiency']],
        });
        const avgEfficiency = avgEffResult?.dataValues?.avgEfficiency
            ? Math.round(parseFloat(avgEffResult.dataValues.avgEfficiency) * 100) / 100
            : 0;

        const inProgressOrders = await ProductionOrder.count({ where: { status: 'IN_PROGRESS' } });

        return {
            totalLines,
            activeLines,
            totalWorkers,
            avgEfficiency,
            inProgressOrders
        };
    } catch (error) {
        throw new Error('Error fetching production summary: ' + error.message);
    }
};

const getExportStats = async () => {
    try {
        // Order volume / total amount per buyer
        const buyerVolume = await ExportOrder.findAll({
            attributes: [
                [sequelize.col('Buyer.name'), 'buyerName'],
                [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalVolume'],
                [sequelize.fn('SUM', sequelize.col('totalQuantity')), 'totalQuantity']
            ],
            include: [{ model: Buyer, attributes: [] }],
            group: ['Buyer.id', 'Buyer.name'],
            raw: true
        });

        // Order status breakdown
        const orderStatus = await ExportOrder.findAll({
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            group: ['status'],
            raw: true
        });

        // Monthly order trend
        const monthlyOrders = await ExportOrder.findAll({
            attributes: [
                [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('orderDate')), 'month'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount'],
                [sequelize.fn('SUM', sequelize.col('totalAmount')), 'totalValue']
            ],
            group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('orderDate'))],
            order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('orderDate')), 'ASC']],
            raw: true
        });

        const totalOrders = await ExportOrder.count();
        const pendingOrders = await ExportOrder.count({ where: { status: ['CREATED'] } });
        const shippedOrders = await ExportOrder.count({ where: { status: 'SHIPPED' } });
        const completedOrders = await ExportOrder.count({ where: { status: 'COMPLETED' } });

        return {
            buyerVolume,
            orderStatus,
            monthlyOrders,
            summary: {
                totalOrders,
                pendingOrders,
                shippedOrders,
                completedOrders
            }
        };
    } catch (error) {
        throw new Error('Error fetching export stats: ' + error.message);
    }
};

const getPOStats = async () => {
    try {
        // 1. PO Status breakdown
        const poStatus = await PurchaseOrder.findAll({
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                [sequelize.fn('SUM', sequelize.col('totalValue')), 'totalValue']
            ],
            group: ['status'],
            raw: true
        });

        // 2. Buyer performance (Value per buyer)
        const buyerValue = await PurchaseOrder.findAll({
            attributes: [
                'buyerName',
                [sequelize.fn('SUM', sequelize.col('totalValue')), 'totalValue'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'orderCount']
            ],
            group: ['buyerName'],
            order: [[sequelize.fn('SUM', sequelize.col('totalValue')), 'DESC']],
            raw: true
        });

        // 3. Monthly PO trend
        const monthlyPOs = await PurchaseOrder.findAll({
            attributes: [
                [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('orderDate')), 'month'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                [sequelize.fn('SUM', sequelize.col('totalValue')), 'totalValue']
            ],
            group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('orderDate'))],
            order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('orderDate')), 'ASC']],
            raw: true
        });

        const totalPOs = await PurchaseOrder.count();
        const inProduction = await PurchaseOrder.count({ where: { status: 'IN_PRODUCTION' } });
        const completed = await PurchaseOrder.count({ where: { status: 'PRODUCTION_COMPLETED' } });

        return {
            poStatus,
            buyerValue,
            monthlyPOs,
            summary: {
                totalPOs,
                inProduction,
                completed
            }
        };
    } catch (error) {
        throw new Error('Error fetching PO stats: ' + error.message);
    }
};

module.exports = {
    getDashboardStats,
    getFinanceStats,
    getProductionSummary,
    getExportStats,
    getPOStats
};
