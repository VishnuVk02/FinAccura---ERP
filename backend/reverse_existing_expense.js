const { Voucher, VoucherEntry, Account, sequelize } = require('./src/models');
const { Op } = require('sequelize');

async function reverseExpense() {
    console.log('Searching for 80000 expense voucher...');
    try {
        // Find voucher entries with 80000 amount
        const entries = await VoucherEntry.findAll({
            where: {
                [Op.or]: [
                    { debitAmount: 80000 },
                    { creditAmount: 80000 }
                ]
            },
            include: [{ model: Voucher }]
        });

        if (entries.length === 0) {
            console.log('No entries with 80000 found.');
            return;
        }

        console.log(`Found ${entries.length} entries.`);

        // Group by voucher
        const vouchers = {};
        entries.forEach(e => {
            if (!vouchers[e.voucherId]) vouchers[e.voucherId] = e.Voucher;
        });

        const t = await sequelize.transaction();
        try {
            for (const vId in vouchers) {
                const voucher = vouchers[vId];
                console.log(`Processing Voucher: ${voucher.voucherNumber} (${voucher.narration})`);

                const vEntries = await VoucherEntry.findAll({ where: { voucherId: vId } });

                for (const entry of vEntries) {
                    const oldDr = entry.debitAmount;
                    const oldCr = entry.creditAmount;
                    console.log(`Reversing entry for Account ID ${entry.accountId}: Dr ${oldDr}, Cr ${oldCr} -> Dr ${oldCr}, Cr ${oldDr}`);
                    await entry.update({
                        debitAmount: oldCr,
                        creditAmount: oldDr
                    }, { transaction: t });
                }
            }
            await t.commit();
            console.log('Successfully reversed existing expense entries.');
        } catch (err) {
            await t.rollback();
            throw err;
        }

    } catch (error) {
        console.error('Error reversing expense:', error);
    } finally {
        process.exit();
    }
}

reverseExpense();
