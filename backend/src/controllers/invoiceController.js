const { Invoice, ExportOrder, sequelize, Account } = require('../models');
const { createBalancedVoucher } = require('../services/voucherService');

// @desc    Create Invoice and auto-generate accounting entry
const createInvoice = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {
            invoiceNumber,
            exportOrderId,
            invoiceDate,
            totalAmount,
            currency,
            exchangeRate = 1.0,
            dueDate,
            buyerAccountId, // The Account ID for the Buyer in COA
            salesAccountId, // The Sales Revenue Account ID in COA
            financialYearId,
            unitId
        } = req.body;

        const totalAmountInINR = parseFloat(totalAmount) * parseFloat(exchangeRate);

        // 1. Create Invoice
        const invoice = await Invoice.create({
            invoiceNumber,
            exportOrderId,
            invoiceDate,
            totalAmount,
            currency,
            exchangeRate,
            totalAmountInINR,
            dueDate: dueDate || null,
            status: 'PENDING'
        }, { transaction: t });

        // 2. Create Accounting Entry (Voucher)
        // Debit: Buyer (Accounts Receivable)
        // Credit: Sales Revenue
        // Standardizing on INR for Ledgers
        const voucher = await createBalancedVoucher({
            voucherNumber: `SALES-${invoiceNumber}`,
            voucherType: 'SALES',
            date: invoiceDate,
            financialYearId,
            unitId,
            createdBy: req.user.id,
            narration: `Invoice issued for Order ID: ${exportOrderId} (${totalAmount} ${currency} @ ${exchangeRate})`,
            entries: [
                { accountId: buyerAccountId, debitAmount: totalAmountInINR, creditAmount: 0 },
                { accountId: salesAccountId, debitAmount: 0, creditAmount: totalAmountInINR }
            ]
        }, t);

        // 3. Link Voucher to Invoice
        invoice.voucherId = voucher.id;
        await invoice.save({ transaction: t });

        await t.commit();
        res.status(201).json(invoice);
    } catch (error) {
        await t.rollback();
        console.error('Invoice Creation Error:', error);
        res.status(400).json({ message: error.message });
    }
};

const getInvoices = async (req, res) => {
    try {
        const { PurchaseOrder } = require('../models');
        const invoices = await Invoice.findAll({
            include: [
                { model: ExportOrder, attributes: ['orderNumber'] },
                { model: PurchaseOrder, attributes: ['id', 'buyerName'] }
            ],
            order: [['invoiceDate', 'DESC']]
        });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createInvoice, getInvoices };
