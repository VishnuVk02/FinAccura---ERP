const { Payment, Invoice, sequelize } = require('../models');
const { createBalancedVoucher } = require('../services/voucherService');

// @desc    Create Payment and auto-generate accounting entry
const createPayment = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {
            invoiceId,
            paymentDate,
            amount, // Foreign currency amount
            currency,
            exchangeRate,
            receivedAmountInINR, // Local currency amount
            bankAccountId, // The Bank Account ID in COA
            buyerAccountId, // The Buyer Account ID in COA
            financialYearId,
            unitId
        } = req.body;

        // 1. Create Payment
        const payment = await Payment.create({
            invoiceId,
            paymentDate,
            amount,
            currency,
            exchangeRate,
            receivedAmountInINR,
            bankAccountId
        }, { transaction: t });

        // 2. Create Accounting Entry (Voucher)
        // Debit: Bank Account
        // Credit: Buyer Account
        const voucher = await createBalancedVoucher({
            voucherNumber: `RCPT-${payment.id}`,
            voucherType: 'RECEIPT',
            date: paymentDate,
            financialYearId,
            unitId,
            createdBy: req.user.id,
            narration: `Payment received for Invoice ID: ${invoiceId}`,
            entries: [
                { accountId: bankAccountId, debitAmount: receivedAmountInINR, creditAmount: 0 },
                { accountId: buyerAccountId, debitAmount: 0, creditAmount: receivedAmountInINR }
            ]
        }, t);

        // 3. Link Voucher to Payment
        payment.voucherId = voucher.id;
        await payment.save({ transaction: t });

        // 4. Update Invoice Status
        const invoice = await Invoice.findByPk(invoiceId, { transaction: t });
        const payments = await Payment.findAll({ where: { invoiceId }, transaction: t });
        const totalPaid = payments.reduce((sum, p) => sum + parseFloat(p.amount), 0);

        if (totalPaid >= parseFloat(invoice.totalAmount)) {
            invoice.status = 'PAID';
        } else if (totalPaid > 0) {
            invoice.status = 'PARTIAL';
        }
        await invoice.save({ transaction: t });

        await t.commit();
        res.status(201).json(payment);
    } catch (error) {
        await t.rollback();
        res.status(400).json({ message: error.message });
    }
};

const getPayments = async (req, res) => {
    try {
        const payments = await Payment.findAll({
            include: [{ model: Invoice, attributes: ['invoiceNumber'] }],
            order: [['paymentDate', 'DESC']]
        });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createExpense = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const {
            expenseAccountId,
            bankAccountId,
            amount,
            expenseDate,
            financialYearId,
            unitId,
            narration
        } = req.body;

        const voucher = await createBalancedVoucher({
            voucherNumber: `EXP-${Date.now()}`,
            voucherType: 'PAYMENT',
            date: expenseDate,
            financialYearId,
            unitId,
            createdBy: req.user.id,
            narration: narration || `Company Expense Record`,
            entries: [
                { accountId: expenseAccountId, debitAmount: amount, creditAmount: 0 },
                { accountId: bankAccountId, debitAmount: 0, creditAmount: amount }
            ]
        }, t);

        await t.commit();
        res.status(201).json({ message: 'Expense tracked successfully', voucher });
    } catch (error) {
        await t.rollback();
        res.status(400).json({ message: error.message });
    }
};

module.exports = { createPayment, getPayments, createExpense };
