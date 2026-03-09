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
        // 1. Get Account IDs for Income and Expense
        const incomeAccountIds = await getAccountIdsByMainGroup(null, 'Income');
        const expenseAccountIds = await getAccountIdsByMainGroup(null, 'Expense');

        // 2. Sum revenue from Ledger where the origin is a SALES invoice voucher
        const revenueResult = await VoucherEntry.findAll({
            attributes: [
                [
                    sequelize.literal(`SUM(
                        CASE 
                            WHEN "Voucher->salesInvoice"."currency" IS NOT NULL AND "Voucher->salesInvoice"."currency" != 'INR'
                            THEN "VoucherEntry"."creditAmount" * "Voucher->salesInvoice"."exchangeRate"
                            ELSE "VoucherEntry"."creditAmount"
                        END
                    )`), 'total'
                ]
            ],
            include: [{
                model: Voucher,
                where: { voucherType: 'SALES' },
                attributes: [],
                include: [{
                    model: Invoice,
                    as: 'salesInvoice',
                    attributes: []
                }]
            }],
            raw: true
        });
        const totalRevenue = revenueResult[0]?.total || 0;

        // 3. Sum expense from Ledger (simplified as usually in INR, but keeping logic for consistency)
        const expenseResult = await VoucherEntry.findAll({
            attributes: [
                [
                    sequelize.literal(`SUM(
                        CASE 
                            WHEN "Voucher->salesInvoice"."currency" IS NOT NULL AND "Voucher->salesInvoice"."currency" != 'INR'
                            THEN "VoucherEntry"."creditAmount" * "Voucher->salesInvoice"."exchangeRate"
                            ELSE "VoucherEntry"."creditAmount"
                        END
                    )`), 'total'
                ]
            ],
            include: [{
                model: Voucher,
                attributes: [],
                include: [{
                    model: Invoice,
                    as: 'salesInvoice',
                    attributes: []
                }]
            }],
            where: { accountId: { [Op.in]: expenseAccountIds } },
            raw: true
        });
        const totalExpense = expenseResult[0]?.total || 0;

        // 4. Sum total received (Credits to Bank Accounts in Receipt Vouchers)
        const bankAccountIds = await Account.findAll({
            where: { isBankAccount: true },
            attributes: ['id'],
            raw: true
        }).then(accounts => accounts.map(a => a.id));

        const totalReceived = await VoucherEntry.sum('creditAmount', {
            include: [{
                model: Voucher,
                where: { voucherType: 'RECEIPT' },
                attributes: []
            }],
            where: { accountId: { [Op.in]: bankAccountIds } }
        }) || 0;

        const pendingInvoices = await Invoice.count({ where: { status: ['PENDING', 'PARTIAL'] } });
        const netProfit = parseFloat(totalRevenue) - parseFloat(totalExpense);

        // Unify Counts (PO + EO)
        const eoCount = await ExportOrder.count();
        const poCount = await PurchaseOrder.count();
        const totalOrders = eoCount + poCount;

        const completedEo = await ExportOrder.count({ where: { status: 'COMPLETED' } });
        const completedPo = await PurchaseOrder.count({
            where: { status: { [Op.in]: ['EXPORTED', 'PAYMENT_PENDING', 'PAYMENT_COMPLETED'] } }
        });
        const completedOrders = completedEo + completedPo;

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
                [
                    sequelize.literal(`SUM(COALESCE(NULLIF("totalAmountInINR", 0), "totalAmount" * "exchangeRate"))`),
                    'revenue'
                ]
            ],
            group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('invoiceDate'))],
            order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('invoiceDate')), 'ASC']],
            raw: true
        });

        // Monthly payments received
        const monthlyPayments = await Payment.findAll({
            attributes: [
                [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('paymentDate')), 'month'],
                [
                    sequelize.literal(`SUM(COALESCE(NULLIF("receivedAmountInINR", 0), "amount" * "exchangeRate"))`),
                    'received'
                ]
            ],
            group: [sequelize.fn('DATE_TRUNC', 'month', sequelize.col('paymentDate'))],
            order: [[sequelize.fn('DATE_TRUNC', 'month', sequelize.col('paymentDate')), 'ASC']],
            raw: true
        });

        // Buyer-wise revenue (Inclusive of all order types)
        const buyerRevenue = await Invoice.findAll({
            attributes: [
                [
                    sequelize.literal(`COALESCE("ExportOrder->Buyer"."name", "PurchaseOrder"."buyerName")`),
                    'Buyer.name'
                ],
                [
                    sequelize.literal(`SUM(COALESCE(NULLIF("Invoice"."totalAmountInINR", 0), "Invoice"."totalAmount" * "Invoice"."exchangeRate"))`),
                    'totalAmount'
                ]
            ],
            include: [
                {
                    model: ExportOrder,
                    attributes: [],
                    include: [{ model: Buyer, attributes: [] }]
                },
                {
                    model: PurchaseOrder,
                    attributes: []
                }
            ],
            group: [sequelize.literal(`COALESCE("ExportOrder->Buyer"."name", "PurchaseOrder"."buyerName")`)],
            raw: true
        });

        // Invoice status distribution
        const invoiceStatus = await Invoice.findAll({
            attributes: [
                'status',
                [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
                [
                    sequelize.literal(`SUM(COALESCE(NULLIF("totalAmountInINR", 0), "totalAmount" * "exchangeRate"))`),
                    'totalAmount'
                ]
            ],
            group: ['status'],
            raw: true
        });

        // Get Expense Account IDs for filtered summary
        const expenseAccountIds = await getAccountIdsByMainGroup(null, 'Expense');

        // Expense category breakdown from voucher entries (Logic Reversed)
        const expenseCategories = await VoucherEntry.findAll({
            attributes: [
                [sequelize.fn('SUM', sequelize.col('creditAmount')), 'amount']
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
                creditAmount: { [Op.gt]: 0 },
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
        // Amount received by buyer (Inclusive of all order types)
        const buyerPayments = await Payment.findAll({
            attributes: [
                [
                    sequelize.literal(`COALESCE("Invoice->ExportOrder->Buyer"."name", "Invoice->PurchaseOrder"."buyerName")`),
                    'buyerName'
                ],
                [
                    sequelize.literal(`SUM(COALESCE(NULLIF("Payment"."receivedAmountInINR", 0), "Payment"."amount" * "Payment"."exchangeRate"))`),
                    'totalReceived'
                ]
            ],
            include: [{
                model: Invoice,
                attributes: [],
                include: [
                    {
                        model: ExportOrder,
                        attributes: [],
                        include: [{ model: Buyer, attributes: [] }]
                    },
                    {
                        model: PurchaseOrder,
                        attributes: []
                    }
                ]
            }],
            group: [sequelize.literal(`COALESCE("Invoice->ExportOrder->Buyer"."name", "Invoice->PurchaseOrder"."buyerName")`)],
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
        // Order volume / total amount per buyer - Consolidated from ExportOrder and PurchaseOrder
        const manualExportVolumes = await ExportOrder.findAll({
            attributes: [
                [sequelize.col('Buyer.name'), 'buyerName'],
                [
                    sequelize.literal(`SUM("ExportOrder"."totalAmount" * "ExportOrder"."exchangeRate")`),
                    'totalVolume'
                ],
                [sequelize.fn('SUM', sequelize.col('totalQuantity')), 'totalQuantity']
            ],
            include: [{ model: Buyer, attributes: [] }],
            group: ['Buyer.id', 'Buyer.name'],
            raw: true
        });

        const poVolumes = await PurchaseOrder.findAll({
            attributes: [
                'buyerName',
                [sequelize.fn('SUM', sequelize.col('totalValue')), 'totalVolume'],
                [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity']
            ],
            group: ['buyerName'],
            raw: true
        });

        const volumeMap = {};
        const mergeVolumes = (sourceArray) => {
            sourceArray.forEach(item => {
                const name = item.buyerName || 'Unknown';
                if (!volumeMap[name]) volumeMap[name] = { buyerName: name, totalVolume: 0, totalQuantity: 0 };
                volumeMap[name].totalVolume += Number(item.totalVolume) || 0;
                volumeMap[name].totalQuantity += Number(item.totalQuantity) || 0;
            });
        };
        mergeVolumes(manualExportVolumes);
        mergeVolumes(poVolumes);

        const buyerVolume = Object.values(volumeMap).sort((a, b) => b.totalVolume - a.totalVolume).slice(0, 10);

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
                [
                    sequelize.literal(`SUM("ExportOrder"."totalAmount" * "ExportOrder"."exchangeRate")`),
                    'totalValue'
                ]
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

        // 4. Recent POs
        const recentPOs = await PurchaseOrder.findAll({
            limit: 10,
            order: [['createdAt', 'DESC']]
        });

        return {
            poStatus,
            buyerValue,
            monthlyPOs,
            recentPOs,
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
