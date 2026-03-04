const { sequelize } = require('./src/config/db');

async function fixDb() {
    try {
        console.log('Altering ProductionOrders table to allow NULL for exportOrderId...');
        await sequelize.query('ALTER TABLE "ProductionOrders" ALTER COLUMN "exportOrderId" DROP NOT NULL;');
        console.log('Column constraint updated successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Error altering table:', error);
        process.exit(1);
    }
}

fixDb();
