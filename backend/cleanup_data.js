const {
    DailyProductionReport,
    WorkerAllocation,
    ProductionOrder,
    Payment,
    Invoice,
    VoucherEntry,
    Voucher,
    ProductionLine,
    PurchaseOrderStyle,
    PurchaseOrder,
    ExportOrder,
    sequelize
} = require('./src/models');

async function cleanupData() {
    console.log('Starting data cleanup...');
    const t = await sequelize.transaction();

    try {
        // Order matters due to foreign key constraints
        console.log('Clearing Daily Production Reports...');
        await DailyProductionReport.destroy({ where: {}, transaction: t });

        console.log('Clearing Worker Allocations...');
        await WorkerAllocation.destroy({ where: {}, transaction: t });

        console.log('Clearing Production Orders...');
        await ProductionOrder.destroy({ where: {}, transaction: t });

        console.log('Clearing Payments...');
        await Payment.destroy({ where: {}, transaction: t });

        console.log('Clearing Invoices...');
        await Invoice.destroy({ where: {}, transaction: t });

        console.log('Clearing Voucher Entries...');
        await VoucherEntry.destroy({ where: {}, transaction: t });

        console.log('Clearing Vouchers...');
        await Voucher.destroy({ where: {}, transaction: t });

        console.log('Clearing Production Lines...');
        await ProductionLine.destroy({ where: {}, transaction: t });

        console.log('Clearing Purchase Order Styles...');
        await PurchaseOrderStyle.destroy({ where: {}, transaction: t });

        console.log('Clearing Purchase Orders...');
        await PurchaseOrder.destroy({ where: {}, transaction: t });

        console.log('Clearing Export Orders...');
        await ExportOrder.destroy({ where: {}, transaction: t });

        await t.commit();
        console.log('Cleanup completed successfully! Buyers were kept unchanged.');
    } catch (error) {
        await t.rollback();
        console.error('Cleanup failed:', error);
    } finally {
        process.exit();
    }
}

cleanupData();
