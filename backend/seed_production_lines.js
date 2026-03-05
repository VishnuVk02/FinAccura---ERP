const { ProductionLine, BusinessUnit, sequelize } = require('./src/models');

async function seedLines() {
    console.log('Seeding 10 production lines...');
    try {
        const unit = await BusinessUnit.findOne();
        if (!unit) {
            console.error('No business unit found. Please create one first.');
            return;
        }

        const lines = [];
        for (let i = 1; i <= 10; i++) {
            lines.push({
                lineName: `TA Line ${i}`,
                unitId: unit.id,
                totalWorkers: 0,
                supervisorName: 'Default Supervisor',
                isActive: true
            });
        }

        for (const lineData of lines) {
            const [line, created] = await ProductionLine.findOrCreate({
                where: { lineName: lineData.lineName },
                defaults: lineData
            });
            if (created) {
                console.log(`Created: ${line.lineName}`);
            } else {
                console.log(`Exists: ${line.lineName}`);
            }
        }

        console.log('Seeding completed.');
    } catch (error) {
        console.error('Error seeding lines:', error);
    } finally {
        process.exit();
    }
}

seedLines();
