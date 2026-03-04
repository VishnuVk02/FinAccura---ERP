const { sequelize, DailyProductionReport, ProductionOrder, Buyer, ExportOrder, Invoice, Payment, MainGroup, Group, SubGroup, Account, Voucher, VoucherEntry, Unit, FinancialYear } = require('./src/models');
const { Op } = require('sequelize');

async function run() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB');

        // Fetch defaults needed for ExportOrders
        let defaultUnit = await Unit.findOne();
        if (!defaultUnit) defaultUnit = await Unit.create({ unitName: 'Main Unit', unitCode: 'MU01', address: 'HQ' });

        let targetYear = new Date().getFullYear();
        let defaultFY = await FinancialYear.findOne({ where: { name: `${targetYear}-${targetYear + 1}` } });
        if (!defaultFY) defaultFY = await FinancialYear.create({ name: `${targetYear}-${targetYear + 1}`, startDate: `${targetYear}-04-01`, endDate: `${targetYear + 1}-03-31`, isActive: true });

        // 1. Clear negative daily production entries
        console.log('Finding negative daily production entries...');
        const negativeReports = await DailyProductionReport.findAll({
            where: {
                [Op.or]: [
                    { totalProduced: { [Op.lt]: 0 } },
                    { totalDefects: { [Op.lt]: 0 } }
                ]
            }
        });

        if (negativeReports.length > 0) {
            console.log(`Found ${negativeReports.length} negative entries. Deleting...`);
            for (const report of negativeReports) {
                await report.destroy();
            }

            // Recalculate production orders
            console.log('Recalculating production order totals...');
            const orders = await ProductionOrder.findAll();
            for (const order of orders) {
                const reports = await DailyProductionReport.findAll({ where: { productionOrderId: order.id } });
                const totalProduced = reports.reduce((sum, r) => sum + r.totalProduced, 0);
                const totalDefects = reports.reduce((sum, r) => sum + r.totalDefects, 0);

                await order.update({ producedQuantity: totalProduced, defectQuantity: totalDefects });
            }
            console.log('Recalculation complete.');
        } else {
            console.log('No negative production entries found.');
        }

        // 2. Add sample buyers and export orders (Revenue by Buyer)
        console.log('Adding sample buyers, orders, and expenses...');

        const buyersData = [
            { name: 'Zara', email: 'contact@zara.com', phone: '1234567890', address: 'Spain', country: 'Spain', currency: 'EUR' },
            { name: 'H&M', email: 'contact@hm.com', phone: '0987654321', address: 'Sweden', country: 'Sweden', currency: 'EUR' },
            { name: 'Levi Strauss', email: 'contact@levis.com', phone: '1122334455', address: 'USA', country: 'USA', currency: 'USD' }
        ];

        let i = 1;
        for (const bData of buyersData) {
            let buyer = await Buyer.findOne({ where: { name: bData.name } });
            if (!buyer) {
                buyer = await Buyer.create(bData);
            }

            // Create Export Order
            const orderNumber = `EXP-2026-${String(i).padStart(3, '0')}`;
            let order = await ExportOrder.findOne({ where: { orderNumber } });
            if (!order) {
                order = await ExportOrder.create({
                    orderNumber,
                    buyerId: buyer.id,
                    unitId: defaultUnit.id,
                    financialYearId: defaultFY.id,
                    orderDate: new Date(),
                    deliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
                    styleName: `Style ${i}`,
                    totalQuantity: 5000 * i,
                    pricePerUnit: 30,
                    totalAmount: 150000 * i,
                    status: 'COMPLETED'
                });

                // Create Invoice for finance stats
                const invoiceParams = {
                    invoiceNumber: `INV-${orderNumber}`,
                    exportOrderId: order.id,
                    invoiceDate: new Date(),
                    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
                    totalAmount: order.totalAmount,
                    currency: order.currency || 'USD',
                    status: 'PAID'
                };
                let invoice = await Invoice.findOne({ where: { invoiceNumber: invoiceParams.invoiceNumber } });
                if (!invoice) {
                    invoice = await Invoice.create(invoiceParams);

                    // Create payment for the invoice
                    await Payment.create({
                        paymentNumber: `PAY-${invoice.invoiceNumber}`,
                        invoiceId: invoice.id,
                        paymentDate: new Date(),
                        amount: invoice.totalAmount,
                        currency: invoice.currency,
                        exchangeRate: 85,
                        receivedAmountInINR: invoice.totalAmount * 85,
                        paymentMethod: 'BANK_TRANSFER',
                        status: 'COMPLETED'
                    });
                }
            }
            i++;
        }

        // 3. Add Expense (EB Bill)
        // Clean out any old Electricity accounts
        const oldEbAccounts = await Account.findAll({ where: { name: 'Electricity Bill' } });
        for (const act of oldEbAccounts) {
            const relatedVoucherEntries = await VoucherEntry.findAll({ where: { accountId: act.id } });
            const voucherIdsToRemove = [...new Set(relatedVoucherEntries.map(ve => ve.voucherId))];
            await VoucherEntry.destroy({ where: { accountId: act.id } });
            if (voucherIdsToRemove.length > 0) {
                await Voucher.destroy({ where: { id: { [Op.in]: voucherIdsToRemove } } });
            }
            await act.destroy();
        }

        // Ensure MainGroup "Expense" exists
        let expenseMainGroup = await MainGroup.findOne({ where: { name: 'Expense' } });
        if (!expenseMainGroup) {
            expenseMainGroup = await MainGroup.create({ name: 'Expense', nature: 'Expense' });
        }

        let indirectExpenseGroup = await Group.findOne({ where: { name: 'Indirect Expenses', mainGroupId: expenseMainGroup.id } });
        if (!indirectExpenseGroup) {
            indirectExpenseGroup = await Group.create({ name: 'Indirect Expenses', mainGroupId: expenseMainGroup.id });
        }

        let utilitySubGroup = await SubGroup.findOne({ where: { name: 'Utilities', groupId: indirectExpenseGroup.id } });
        if (!utilitySubGroup) {
            utilitySubGroup = await SubGroup.create({ name: 'Utilities', groupId: indirectExpenseGroup.id });
        }

        let ebAccount = await Account.create({
            name: 'Electricity Bill',
            subGroupId: utilitySubGroup.id,
            openingBalance: 0
        });

        // Cash/Bank account for the credit side
        let assetMainGroup = await MainGroup.findOne({ where: { name: 'Asset' } });
        if (!assetMainGroup) {
            assetMainGroup = await MainGroup.create({ name: 'Asset', nature: 'Asset' });
        }
        let currentAssetGroup = await Group.findOne({ where: { name: 'Current Assets', mainGroupId: assetMainGroup.id } });
        if (!currentAssetGroup) {
            currentAssetGroup = await Group.create({ name: 'Current Assets', mainGroupId: assetMainGroup.id });
        }
        let bankSubGroup = await SubGroup.findOne({ where: { name: 'Bank Accounts', groupId: currentAssetGroup.id } });
        if (!bankSubGroup) {
            bankSubGroup = await SubGroup.create({ name: 'Bank Accounts', groupId: currentAssetGroup.id });
        }
        let bankAccount = await Account.findOne({ where: { name: 'Main Bank Account' } });
        if (!bankAccount) {
            bankAccount = await Account.create({
                name: 'Main Bank Account',
                subGroupId: bankSubGroup.id,
                openingBalance: 1000000,
                isBankAccount: true
            });
        }


        // Add a voucher for the EB Bill
        const voucherData = {
            voucherNumber: `VCH-EB-${Date.now()}`,
            date: new Date(),
            voucherType: 'PAYMENT',
            referenceNumber: 'REF-EB-001',
            totalAmount: 45000,
            unitId: defaultUnit.id,
            financialYearId: defaultFY.id,
            narration: 'Paid electricity bill for the month'
        };
        const voucher = await Voucher.create(voucherData);

        // Debit EB Account
        await VoucherEntry.create({
            voucherId: voucher.id,
            accountId: ebAccount.id,
            debitAmount: 45000,
            creditAmount: 0,
            narration: 'Electricity Bill'
        });

        // Credit Bank Account
        await VoucherEntry.create({
            voucherId: voucher.id,
            accountId: bankAccount.id,
            debitAmount: 0,
            creditAmount: 45000,
            narration: 'Paid via Bank'
        });

        console.log('Sample data insertion complete.');
        process.exit(0);

    } catch (err) {
        const errorDetails = err.stack + '\nSQL: ' + (err.sql || 'N/A') + '\nOriginal: ' + (err.original ? err.original.message : 'N/A');
        require('fs').writeFileSync('fix_log.txt', errorDetails, 'utf8');
        console.error('Error during execution:', err);
        process.exit(1);
    }
}

run();
