const { PurchaseOrder, Invoice, Account, FinancialYear, Unit } = require('./src/models');
const { createBalancedVoucher } = require('./src/services/voucherService');
const { Op } = require('sequelize');

const fix = async () => {
    try {
        const pos = await PurchaseOrder.findAll({
            where: { status: 'READY_FOR_EXPORT' }
        });

        for (const po of pos) {
            const existing = await Invoice.findOne({ where: { purchaseOrderId: po.id } });
            if (!existing) {
                console.log(`Generating missing invoice for PO #${po.id}...`);

                const buyerAccount = await Account.findOne({
                    where: { name: { [Op.iLike]: `%Accounts Receivable%${po.buyerName.split(' ')[0]}%` } }
                });
                const salesAccount = await Account.findOne({
                    where: { name: ['Sales Revenue', 'Export Sales Account'] }
                });
                const activeYear = await FinancialYear.findOne({ where: { isActive: true } });
                const defaultUnit = await Unit.findOne();

                if (buyerAccount && salesAccount && activeYear && defaultUnit) {
                    const invoiceNumber = `INV-PO-${po.id}-FIX-${Date.now().toString().slice(-4)}`;
                    await Invoice.create({
                        invoiceNumber,
                        purchaseOrderId: po.id,
                        invoiceDate: new Date(),
                        totalAmount: po.totalValue,
                        currency: 'USD',
                        status: 'PENDING'
                    });
                    console.log(`SUCCESS: Generated ${invoiceNumber}`);
                } else {
                    console.log(`FAILED: Missing accounts for PO #${po.id}`);
                }
            }
        }
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
fix();
