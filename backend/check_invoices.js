const { Invoice, PurchaseOrder } = require('./src/models');
const check = async () => {
    try {
        const invoices = await Invoice.findAll({
            include: [{ model: PurchaseOrder }]
        });
        console.log('Invoices Count:', invoices.length);
        invoices.forEach(inv => {
            console.log(`Invoice: ${inv.invoiceNumber}, PO ID: ${inv.purchaseOrderId}, PO Status: ${inv.PurchaseOrder?.status}`);
        });
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
check();
