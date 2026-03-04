const { ProductionLine, ProductionOrder, DailyProductionReport } = require('./src/models');
const { sequelize } = require('./src/config/db');

async function resetProduction() {
    try {
        const lines = await ProductionLine.findAll({
            where: { lineName: ['Line B', 'Line C', 'B', 'C'] }
        });
        const lineIds = lines.map(l => l.id);

        if (lineIds.length === 0) {
            console.log('No lines found matching B or C');
            return;
        }

        const orders = await ProductionOrder.findAll({
            where: { lineId: lineIds }
        });
        const orderIds = orders.map(o => o.id);

        if (orderIds.length > 0) {
            // Delete daily reports
            const reportCount = await DailyProductionReport.destroy({
                where: { productionOrderId: orderIds }
            });
            console.log(`Deleted ${reportCount} daily reports.`);

            // Reset orders
            await ProductionOrder.update(
                { producedQuantity: 0, defectQuantity: 0 },
                { where: { id: orderIds } }
            );
            console.log(`Reset ${orderIds.length} production orders for Lines B and C`);
        } else {
            console.log('No production orders found for Lines B and C');
        }

    } catch (error) {
        console.error('Error resetting production:', error);
    } finally {
        process.exit(0);
    }
}

resetProduction();
