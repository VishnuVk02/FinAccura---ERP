const { FabricStock } = require('./src/models');
const { sequelize } = require('./src/config/db');

const seedFabric = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // Sync the FabricStock model to create the table if it doesn't exist
        await FabricStock.sync();
        console.log('FabricStock table synced.');

        const fabrics = [
            { fabricName: 'Cotton Denim', quantity: 1500, unit: 'Meters' },
            { fabricName: 'Linen', quantity: 0, unit: 'Meters' },
            { fabricName: 'Organic Cotton', quantity: 500, unit: 'Meters' },
            { fabricName: 'Polyester', quantity: 2000, unit: 'Meters' },
            { fabricName: 'Silk', quantity: 50, unit: 'Meters' },
            { fabricName: 'Wool', quantity: 0, unit: 'Meters' }
        ];

        for (const fabric of fabrics) {
            await FabricStock.upsert(fabric);
        }

        console.log('Fabric stock seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Unable to seed fabric stock:', error);
        process.exit(1);
    }
};

seedFabric();
