const {
    sequelize, User, Role, Unit, FinancialYear, Buyer, ExportOrder,
    ProductionLine, ProductionOrder, DailyProductionReport, WorkerAllocation,
    MainGroup, Group, SubGroup, Account, Invoice, Payment, Voucher, VoucherEntry,
    PurchaseOrder, PurchaseOrderStyle
} = require('./src/models');
const bcrypt = require('bcryptjs');

const seedAll = async () => {
    try {
        await sequelize.sync({ force: true });
        console.log('Database synced for final unify.');

        // 1. Roles
        const roles = await Role.bulkCreate([
            { name: 'ADMIN' },
            { name: 'FINANCE_MANAGER' },
            { name: 'PRODUCTION_MANAGER' },
            { name: 'EXPORT_MANAGER' },
            { name: 'PO_MANAGER' },
            { name: 'VIEWER' }
        ]);

        const adminRole = roles.find(r => r.name === 'ADMIN');
        const prodRole = roles.find(r => r.name === 'PRODUCTION_MANAGER');
        const finRole = roles.find(r => r.name === 'FINANCE_MANAGER');
        const expRole = roles.find(r => r.name === 'EXPORT_MANAGER');
        const poRole = roles.find(r => r.name === 'PO_MANAGER');

        // 2. Users (Hook handles hashing)
        const users = [
            { username: 'admin', email: 'admin@erp.com', password: 'admin123', roleId: adminRole.id },
            { username: 'production_manager', email: 'production@erp.com', password: 'production123', roleId: prodRole.id },
            { username: 'finance_manager', email: 'finance_manager@erp.com', password: 'finance123', roleId: finRole.id },
            { username: 'export_manager', email: 'export_manager@erp.com', password: 'export123', roleId: expRole.id },
            { username: 'po_manager', email: 'po@erp.com', password: 'po123', roleId: poRole.id }
        ];

        for (const u of users) {
            await User.create(u);
        }

        // 3. Organization & Finance
        const fy = await FinancialYear.create({ name: '2026-27', startDate: '2026-04-01', endDate: '2027-03-31', isActive: true });
        const unit = await Unit.create({ name: 'Chennai Unit', location: 'Guindy Industrial Estate, Chennai' });
        const buyer = await Buyer.create({ name: 'Global Apparel Inc.', country: 'USA', currency: 'USD' });

        // 4. Accounts
        const mgAsset = await MainGroup.create({ name: 'Asset', nature: 'DEBIT' });
        const gCurrentAssets = await Group.create({ name: 'Current Assets', mainGroupId: mgAsset.id });
        const sgBank = await SubGroup.create({ name: 'Bank Accounts', groupId: gCurrentAssets.id });
        const accBank = await Account.create({ name: 'HDFC Bank', subGroupId: sgBank.id, isBankAccount: true });

        // 5. Line & Production
        const lineA = await ProductionLine.create({ lineName: 'Line A', unitId: unit.id, totalWorkers: 40, supervisorName: 'Murugan', isActive: true });

        // 6. Sample Purchase Order (New Module)
        const poData = {
            buyerName: 'Mango',
            orderDate: '2026-03-01',
            exportDate: '2026-04-15',
            quantity: 5000,
            fabricType: 'Cotton Denim',
            fitType: 'Slim Fit',
            pricePerUnit: 8.5,
            totalValue: 42500,
            status: 'CREATED',
            createdBy: (await User.findOne({ where: { username: 'po_manager' } })).id
        };
        const po = await PurchaseOrder.create(poData);
        await PurchaseOrderStyle.create({ purchaseOrderId: po.id, styleNumber: 'MG-ST101' });

        console.log('Seeding completed successfully.');
        process.exit();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedAll();
