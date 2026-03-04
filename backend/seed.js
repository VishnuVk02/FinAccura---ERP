const {
    sequelize, User, Role, Unit, FinancialYear, Buyer, ExportOrder,
    ProductionLine, ProductionOrder, DailyProductionReport, WorkerAllocation,
    MainGroup, Group, SubGroup, Account, Invoice, Payment, Voucher, VoucherEntry
} = require('./src/models');

const seedData = async () => {
    try {
        await sequelize.sync({ force: true });
        console.log('Database synced for production operations rework.');

        // 1. Roles
        const roles = await Role.bulkCreate([
            { name: 'ADMIN' },
            { name: 'FINANCE_MANAGER' },
            { name: 'PRODUCTION_MANAGER' },
            { name: 'EXPORT_MANAGER' },
            { name: 'VIEWER' }
        ]);

        // 2. Users
        const adminRole = roles.find(r => r.name === 'ADMIN');
        const prodRole = roles.find(r => r.name === 'PRODUCTION_MANAGER');
        const finRole = roles.find(r => r.name === 'FINANCE_MANAGER');
        const expRole = roles.find(r => r.name === 'EXPORT_MANAGER');

        await User.create({ username: 'admin', email: 'admin@erp.com', password: 'admin123', roleId: adminRole.id });
        await User.create({ username: 'production_manager', email: 'production@erp.com', password: 'production123', roleId: prodRole.id });
        await User.create({ username: 'finance_manager', email: 'finance_manager@erp.com', password: 'finance123', roleId: finRole.id });
        await User.create({ username: 'export_manager', email: 'export_manager@erp.com', password: 'export123', roleId: expRole.id });

        // 3. Organization & Finance
        const fy = await FinancialYear.create({ name: '2026-27', startDate: '2026-04-01', endDate: '2027-03-31', isActive: true });
        const unit = await Unit.create({ name: 'Chennai Unit', location: 'Guindy Industrial Estate, Chennai' });
        const buyer = await Buyer.create({ name: 'Global Apparel Inc.', country: 'USA', currency: 'USD' });
        const buyerMango = await Buyer.create({ name: 'Mango', country: 'Spain', currency: 'EUR' });
        const buyerZara = await Buyer.create({ name: 'Zara', country: 'Spain', currency: 'EUR' });

        // 4. Chart of Accounts (Minimal for Dashboard)
        const mgExpense = await MainGroup.create({ name: 'Expense', nature: 'DEBIT' });
        const mgIncome = await MainGroup.create({ name: 'Income', nature: 'CREDIT' });
        const mgAsset = await MainGroup.create({ name: 'Asset', nature: 'DEBIT' });

        const gOpExpense = await Group.create({ name: 'Operating Expenses', mainGroupId: mgExpense.id });
        const sgFactory = await SubGroup.create({ name: 'Factory Expenses', groupId: gOpExpense.id });
        const accElectricity = await Account.create({ name: 'Electricity Bill', subGroupId: sgFactory.id });

        const gCurrentAssets = await Group.create({ name: 'Current Assets', mainGroupId: mgAsset.id });
        const sgBank = await SubGroup.create({ name: 'Bank Accounts', groupId: gCurrentAssets.id });
        const accBank = await Account.create({ name: 'HDFC Bank', subGroupId: sgBank.id, isBankAccount: true });

        const sgSundryDebtors = await SubGroup.create({ name: 'Sundry Debtors', groupId: gCurrentAssets.id });
        const accDebtor = await Account.create({ name: 'Accounts Receivable - Global Apparel', subGroupId: sgSundryDebtors.id });
        await Account.create({ name: 'Accounts Receivable - Mango', subGroupId: sgSundryDebtors.id });
        await Account.create({ name: 'Accounts Receivable - Zara', subGroupId: sgSundryDebtors.id });
        await Account.create({ name: 'Accounts Receivable - T&T', subGroupId: sgSundryDebtors.id });
        await Account.create({ name: 'Accounts Receivable - Gap', subGroupId: sgSundryDebtors.id });
        await Account.create({ name: 'Accounts Receivable - Nano', subGroupId: sgSundryDebtors.id });
        await Account.create({ name: 'Accounts Receivable - Chissle', subGroupId: sgSundryDebtors.id });
        await Account.create({ name: 'Accounts Receivable - American Eagle', subGroupId: sgSundryDebtors.id });

        const gDirectIncome = await Group.create({ name: 'Direct Income', mainGroupId: mgIncome.id });
        const sgExportSales = await SubGroup.create({ name: 'Export Sales', groupId: gDirectIncome.id });
        const accSales = await Account.create({ name: 'Export Sales Account', subGroupId: sgExportSales.id });


        // 5. Export Orders
        const order1001 = await ExportOrder.create({
            orderNumber: '1001', buyerId: buyer.id, financialYearId: fy.id, unitId: unit.id,
            orderDate: '2024-08-01', styleName: 'Slim Fit Shirt', totalQuantity: 5000,
            pricePerUnit: 12.50, totalAmount: 62500, currency: 'USD', deliveryDate: '2024-10-15', status: 'COMPLETED'
        });

        const order1002 = await ExportOrder.create({
            orderNumber: '1002', buyerId: buyer.id, financialYearId: fy.id, unitId: unit.id,
            orderDate: '2024-08-05', styleName: 'Chino Trousers', totalQuantity: 3000,
            pricePerUnit: 18.00, totalAmount: 54000, currency: 'USD', deliveryDate: '2024-11-20', status: 'CREATED'
        });

        // 5.5 Invoicing, Payments and Accounting Vouchers
        const invoiceRate = 83.50;

        // Invoice for Order 1001
        const invoice1001 = await Invoice.create({
            invoiceNumber: 'INV-1001', exportOrderId: order1001.id, invoiceDate: '2024-10-10',
            totalAmount: 62500, currency: 'USD', dueDate: '2024-11-10', status: 'PAID'
        });

        const salesVoucher = await Voucher.create({
            voucherNumber: 'SV-001', voucherType: 'SALES', date: '2024-10-10',
            financialYearId: fy.id, unitId: unit.id, createdBy: adminRole.id, narration: 'Sales Invoice INV-1001 for Order 1001'
        });
        await invoice1001.update({ voucherId: salesVoucher.id });

        await VoucherEntry.create({ voucherId: salesVoucher.id, accountId: accDebtor.id, debitAmount: 62500 * invoiceRate });
        await VoucherEntry.create({ voucherId: salesVoucher.id, accountId: accSales.id, creditAmount: 62500 * invoiceRate });

        // Payment for Invoice 1001
        const payment1001 = await Payment.create({
            invoiceId: invoice1001.id, paymentDate: '2024-10-25', amount: 62500, currency: 'USD',
            exchangeRate: invoiceRate, receivedAmountInINR: 62500 * invoiceRate, bankAccountId: accBank.id
        });

        const receiptVoucher = await Voucher.create({
            voucherNumber: 'RV-001', voucherType: 'RECEIPT', date: '2024-10-25',
            financialYearId: fy.id, unitId: unit.id, createdBy: adminRole.id, narration: 'Payment Received for INV-1001'
        });
        await payment1001.update({ voucherId: receiptVoucher.id });

        await VoucherEntry.create({ voucherId: receiptVoucher.id, accountId: accBank.id, debitAmount: payment1001.receivedAmountInINR });
        await VoucherEntry.create({ voucherId: receiptVoucher.id, accountId: accDebtor.id, creditAmount: payment1001.receivedAmountInINR });

        // Invoice for Order 1002 (Partial/Pending)
        const invoice1002 = await Invoice.create({
            invoiceNumber: 'INV-1002', exportOrderId: order1002.id, invoiceDate: '2024-11-05',
            totalAmount: 20000, currency: 'USD', dueDate: '2024-12-05', status: 'PENDING'
        });

        const salesVoucher2 = await Voucher.create({
            voucherNumber: 'SV-002', voucherType: 'SALES', date: '2024-11-05',
            financialYearId: fy.id, unitId: unit.id, createdBy: adminRole.id, narration: 'Advance Invoice INV-1002 for Order 1002'
        });
        await invoice1002.update({ voucherId: salesVoucher2.id });

        await VoucherEntry.create({ voucherId: salesVoucher2.id, accountId: accDebtor.id, debitAmount: 20000 * invoiceRate });
        await VoucherEntry.create({ voucherId: salesVoucher2.id, accountId: accSales.id, creditAmount: 20000 * invoiceRate });


        // 6. Production Lines
        const lineA = await ProductionLine.create({ lineName: 'Line A', unitId: unit.id, totalWorkers: 40, supervisorName: 'Murugan', isActive: true });
        const lineB = await ProductionLine.create({ lineName: 'Line B', unitId: unit.id, totalWorkers: 35, supervisorName: 'Samantha', isActive: true });
        const lineC = await ProductionLine.create({ lineName: 'Line C', unitId: unit.id, totalWorkers: 30, supervisorName: 'Rajesh', isActive: true });

        // 7. Worker Allocations
        await WorkerAllocation.create({ lineId: lineA.id, shiftType: 'DAY', totalWorkers: 40, allocationDate: new Date().toISOString().split('T')[0] });
        await WorkerAllocation.create({ lineId: lineB.id, shiftType: 'DAY', totalWorkers: 35, allocationDate: new Date().toISOString().split('T')[0] });

        // 8. Production Orders
        const po1 = await ProductionOrder.create({ exportOrderId: order1001.id, lineId: lineA.id, assignedDate: '2024-09-01', targetQuantity: 5000, status: 'IN_PROGRESS' });
        const po2 = await ProductionOrder.create({ exportOrderId: order1002.id, lineId: lineB.id, assignedDate: '2024-09-02', targetQuantity: 3000, status: 'IN_PROGRESS' });

        // 9. Daily Production Reports
        const today = new Date().toISOString().split('T')[0];
        const r1 = await createReportHelper({ productionOrderId: po1.id, productionDate: today, totalProduced: 800, totalDefects: 20, workingHours: 8, remarks: 'Shift Target Met' }, 40);
        const r2 = await createReportHelper({ productionOrderId: po1.id, productionDate: today, totalProduced: 450, totalDefects: 10, workingHours: 4, remarks: 'Half day progress' }, 40);
        const r3 = await createReportHelper({ productionOrderId: po2.id, productionDate: today, totalProduced: 500, totalDefects: 15, workingHours: 8, remarks: 'Normal production' }, 35);

        // Update totals
        await updatePOHelper(po1, [r1, r2]);
        await updatePOHelper(po2, [r3]);

        console.log('Final Seed Data Created Successfully (with COA).');
        process.exit();
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

async function createReportHelper(data, workers) {
    const stdOutput = 8;
    const efficiency = (data.totalProduced / (workers * stdOutput * data.workingHours)) * 100;
    data.efficiencyPercentage = parseFloat(efficiency.toFixed(2));
    return await DailyProductionReport.create(data);
}

async function updatePOHelper(po, reports) {
    const totalProduced = reports.reduce((s, r) => s + r.totalProduced, 0);
    const totalDefects = reports.reduce((s, r) => s + r.totalDefects, 0);
    const status = totalProduced >= po.targetQuantity ? 'COMPLETED' : 'IN_PROGRESS';
    await po.update({ producedQuantity: totalProduced, defectQuantity: totalDefects, status });
}

seedData();
