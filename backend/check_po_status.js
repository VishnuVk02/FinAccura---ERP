const { PurchaseOrder } = require('./src/models');
const check = async () => {
    try {
        const pos = await PurchaseOrder.findAll();
        pos.forEach(po => {
            console.log(`PO ID: ${po.id}, Status: ${po.status}, Buyer: ${po.buyerName}`);
        });
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};
check();
