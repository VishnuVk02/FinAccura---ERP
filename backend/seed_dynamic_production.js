const { ProductionLine, ProductionOrder, DailyProductionReport, WorkerAllocation, ExportOrder, sequelize } = require('./src/models');

async function seed() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');

        // 1. Get Lines
        const lineA = await ProductionLine.findOne({ where: { lineName: 'Line A' } });
        const lineB = await ProductionLine.findOne({ where: { lineName: 'Line B' } });

        if (!lineA || !lineB) {
            console.error('Lines not found. Please ensure seed script or rectify_db has run.');
            process.exit(1);
        }

        const today = new Date().toISOString().split('T')[0];

        // 2. Create Worker Allocations
        console.log('Seeding Worker Allocations...');
        await WorkerAllocation.destroy({ where: { allocationDate: today } });

        const allocA = await WorkerAllocation.create({
            lineId: lineA.id,
            allocationDate: today,
            shiftType: 'DAY',
            plannedWorkers: 40,
            presentWorkers: 38,
            standardOutputPerWorker: 8,
            workingHours: 8,
            supervisorName: 'Supervisor A'
        });

        const allocB = await WorkerAllocation.create({
            lineId: lineB.id,
            allocationDate: today,
            shiftType: 'DAY',
            plannedWorkers: 35,
            presentWorkers: 30,
            standardOutputPerWorker: 7,
            workingHours: 8,
            supervisorName: 'Supervisor B'
        });

        // 3. Clear existing daily reports for today to avoid duplicates
        const orderA = await ProductionOrder.findOne({ where: { lineId: lineA.id } });
        const orderB = await ProductionOrder.findOne({ where: { lineId: lineB.id } });

        if (orderA) await DailyProductionReport.destroy({ where: { productionOrderId: orderA.id, productionDate: today } });
        if (orderB) await DailyProductionReport.destroy({ where: { productionOrderId: orderB.id, productionDate: today } });

        // 4. Create Daily Production Reports (Efficiency will be calculated in service if we used the service, but here we do it manually or call service)
        // Since we want to test the service logic, let's just use the models directly for seeding but follow the formula.

        const calcEff = (produced, present, std, hours) => {
            const expected = present * std * hours;
            return expected > 0 ? parseFloat(((produced / expected) * 100).toFixed(2)) : 0;
        };

        console.log('Seeding Daily Production Reports...');
        if (orderA) {
            await DailyProductionReport.create({
                productionOrderId: orderA.id,
                productionDate: today,
                totalProduced: 2200,
                totalDefects: 50,
                workingHours: 8,
                efficiencyPercentage: calcEff(2200, allocA.presentWorkers, allocA.standardOutputPerWorker, allocA.workingHours)
            });
        }

        if (orderB) {
            await DailyProductionReport.create({
                productionOrderId: orderB.id,
                productionDate: today,
                totalProduced: 1500,
                totalDefects: 40,
                workingHours: 8,
                efficiencyPercentage: calcEff(1500, allocB.presentWorkers, allocB.standardOutputPerWorker, allocB.workingHours)
            });
        }

        console.log('Seeding complete.');
    } catch (error) {
        console.error('Seed failed:', error);
    } finally {
        process.exit(0);
    }
}

seed();
