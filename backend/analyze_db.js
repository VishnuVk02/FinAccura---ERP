const { sequelize, User, Role, Unit, FinancialYear, Buyer, ExportOrder, Invoice, Payment, Voucher, VoucherEntry } = require('./src/models');

async function analyzeDB() {
    try {
        console.log("--- BUYERS ---");
        const buyers = await Buyer.findAll({ raw: true });
        console.log(buyers);

        console.log("\n--- EXPORT ORDERS ---");
        const orders = await ExportOrder.findAll({ raw: true });
        console.table(orders.map(o => ({ id: o.id, orderNumber: o.orderNumber, status: o.status, buyerId: o.buyerId, totalQuantity: o.totalQuantity, totalAmount: o.totalAmount })));

        console.log("\n--- INVOICES ---");
        const invoices = await Invoice.findAll({ raw: true });
        console.table(invoices.map(i => ({ id: i.id, invNo: i.invoiceNumber, exportOrderId: i.exportOrderId, total: i.totalAmount, status: i.status })));

        console.log("\n--- PAYMENTS ---");
        const payments = await Payment.findAll({ raw: true });
        console.table(payments.map(p => ({ id: p.id, invId: p.invoiceId, amount: p.amount })));

        console.log("\n--- VOUCHERS ---");
        const vouchers = await Voucher.findAll({ raw: true });
        console.table(vouchers.map(v => ({ id: v.id, vNo: v.voucherNumber, type: v.voucherType })));

        console.log("\n--- VOUCHER ENTRIES ---");
        const entries = await VoucherEntry.findAll({ raw: true });
        console.table(entries.map(e => ({ id: e.id, vId: e.voucherId, accId: e.accountId, debit: e.debitAmount, credit: e.creditAmount })));

        process.exit();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
analyzeDB();
