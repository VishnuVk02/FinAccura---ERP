const { Invoice, ExportOrder, sequelize, Account, InvoiceExtra, PurchaseOrder, Buyer, Unit, FinancialYear } = require('../models');
const { createBalancedVoucher } = require('../services/voucherService');
const { Op } = require('sequelize');

const generateNextInvoiceNumber = async (transaction = null) => {
    const currentYear = new Date().getFullYear().toString();
    const lastInvoice = await Invoice.findOne({
        where: {
            invoiceNumber: {
                [Op.like]: `INV-${currentYear}-%`
            }
        },
        order: [['invoiceNumber', 'DESC']],
        transaction
    });

    let nextNumber = 1;
    if (lastInvoice) {
        const parts = lastInvoice.invoiceNumber.split('-');
        const lastSeq = parseInt(parts[2]);
        if (!isNaN(lastSeq)) {
            nextNumber = lastSeq + 1;
        }
    }

    return `INV-${currentYear}-${nextNumber.toString().padStart(3, '0')}`;
};


// @desc    Create Invoice and auto-generate accounting entry
const createInvoice = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        let {
            invoiceNumber: providedNumber,
            exportOrderId,
            purchaseOrderId,
            invoiceDate = new Date(),
            totalAmount,
            currency,
            exchangeRate = 1.0,
            dueDate,
            buyerAccountId,
            salesAccountId,
            financialYearId,
            unitId,
            shipmentDetails // Object: { portOfLoading, portOfDestination, shipmentMethod, shippingDate, notes }
        } = req.body;

        // PostgreSQL rejects empty strings for Integer columns
        if (exportOrderId === '') exportOrderId = null;
        if (purchaseOrderId === '') purchaseOrderId = null;

        const invoiceNumber = providedNumber || await generateNextInvoiceNumber(t);


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
        if (purchaseOrderId) invoice.purchaseOrderId = purchaseOrderId;
        await invoice.save({ transaction: t });

        // 4. Create InvoiceExtra if shipment details provided
        if (shipmentDetails) {
            await InvoiceExtra.create({
                invoiceId: invoice.id,
                ...shipmentDetails
            }, { transaction: t });
        }


        await t.commit();
        res.status(201).json(invoice);
    } catch (error) {
        await t.rollback();
        console.error('Invoice Creation Error:', error);
        res.status(400).json({ message: error.message });
    }
};

const getReadyToInvoice = async (req, res) => {
    try {
        const { PurchaseOrder, ExportOrder, Invoice } = require('../models');
        const { Op } = require('sequelize');

        // 1. Fetch Purchase Orders that are READY_FOR_EXPORT or EXPORTED and NOT invoiced
        const uninvoicedPOs = await PurchaseOrder.findAll({
            where: {
                status: { [Op.in]: ['READY_FOR_EXPORT', 'EXPORTED'] }
            },
            include: [{
                model: Invoice,
                required: false
            }]
        }).then(pos => pos.filter(po => !po.Invoices || po.Invoices.length === 0));

        // 2. Fetch Export Orders that are NOT invoiced
        const uninvoicedEOs = await ExportOrder.findAll({
            include: [{
                model: Invoice,
                required: false
            }]
        }).then(eos => eos.filter(eo => !eo.Invoices || eo.Invoices.length === 0));

        res.json({
            purchaseOrders: uninvoicedPOs,
            exportOrders: uninvoicedEOs
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getInvoices = async (req, res) => {
    try {
        const { PurchaseOrder, InvoiceExtra, ExportOrder, Buyer } = require('../models');
        const invoices = await Invoice.findAll({
            include: [
                { model: ExportOrder, include: [{ model: Buyer }] },
                { model: PurchaseOrder },
                { model: InvoiceExtra, as: 'extraDetails' }
            ],
            order: [['invoiceDate', 'DESC']]
        });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const triggerAutoInvoice = async (poId, transaction) => {
    try {
        const po = await PurchaseOrder.findByPk(poId, { transaction });
        if (!po) return null;

        // Check if invoice already exists
        const existing = await Invoice.findOne({ where: { purchaseOrderId: poId }, transaction });
        if (existing) return existing;

        const invoiceNumber = await generateNextInvoiceNumber(transaction);

        // Find Buyer for account mapping
        const buyer = await Buyer.findOne({ where: { name: po.buyerName }, transaction });

        // Attempt to find accounts (fallback to generic if not found)
        const buyerAccount = await Account.findOne({
            where: { name: { [Op.iLike]: `%${po.buyerName}%` } },
            transaction
        });
        const salesAccount = await Account.findOne({
            where: { name: { [Op.iLike]: '%Sales%' } },
            transaction
        });

        const activeYear = await FinancialYear.findOne({ where: { isActive: true }, transaction });
        const defaultUnit = await Unit.findOne({ transaction });

        if (!activeYear || !defaultUnit || !salesAccount || !buyerAccount) {
            console.warn(`[AutoInvoice] Missing critical data for PO #${poId}. Manual invoicing required.`);
            return null;
        }

        const invoiceDate = new Date();
        const totalAmount = po.totalValue;
        const totalAmountInINR = totalAmount * 83.5; // Using a default/current market rate placeholder

        const invoice = await Invoice.create({
            invoiceNumber,
            purchaseOrderId: poId,
            invoiceDate,
            totalAmount,
            currency: 'USD',
            exchangeRate: 83.5,
            totalAmountInINR,
            status: 'PENDING'
        }, { transaction });

        const voucher = await createBalancedVoucher({
            voucherNumber: `AUTO-SALES-${invoiceNumber}`,
            voucherType: 'SALES',
            date: invoiceDate,
            financialYearId: activeYear.id,
            unitId: defaultUnit.id,
            createdBy: po.createdBy,
            narration: `Automated Invoice for PO #${poId}`,
            entries: [
                { accountId: buyerAccount.id, debitAmount: totalAmountInINR, creditAmount: 0 },
                { accountId: salesAccount.id, debitAmount: 0, creditAmount: totalAmountInINR }
            ]
        }, transaction);

        invoice.voucherId = voucher.id;
        await invoice.save({ transaction });

        return invoice;
    } catch (error) {
        console.error(`[AutoInvoice] Failed for PO #${poId}:`, error);
        return null;
    }
};

module.exports = { createInvoice, getInvoices, getReadyToInvoice, triggerAutoInvoice };

