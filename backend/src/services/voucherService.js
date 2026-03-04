const { Voucher, VoucherEntry, sequelize } = require('../models');

/**
 * Automatically creates a balanced voucher with two entries.
 */
const createBalancedVoucher = async ({
    voucherNumber,
    voucherType,
    date,
    financialYearId,
    unitId,
    createdBy,
    narration,
    entries // Array of { accountId, debitAmount, creditAmount }
}, t) => {
    // Validate balance
    const totalDebit = entries.reduce((sum, e) => sum + parseFloat(e.debitAmount || 0), 0);
    const totalCredit = entries.reduce((sum, e) => sum + parseFloat(e.creditAmount || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error('Voucher is not balanced (Debit != Credit)');
    }

    const voucher = await Voucher.create({
        voucherNumber,
        voucherType,
        date,
        financialYearId,
        unitId,
        createdBy,
        narration
    }, { transaction: t });

    for (const entry of entries) {
        await VoucherEntry.create({
            ...entry,
            voucherId: voucher.id
        }, { transaction: t });
    }

    return voucher;
};

module.exports = { createBalancedVoucher };
