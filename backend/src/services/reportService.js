const { VoucherEntry, Voucher, Account, sequelize } = require('../models');
const { Op } = require('sequelize');

const getLedgerReport = async (accountId, startDate, endDate) => {
    const entries = await VoucherEntry.findAll({
        where: { accountId },
        include: [{
            model: Voucher,
            where: {
                date: { [Op.between]: [startDate, endDate] }
            },
            attributes: ['voucherNumber', 'voucherType', 'date', 'narration']
        }],
        order: [[Voucher, 'date', 'ASC']]
    });

    return entries;
};

const getTrialBalance = async () => {
    const accounts = await Account.findAll({
        attributes: [
            'id',
            'name',
            [sequelize.fn('SUM', sequelize.col('VoucherEntries.debitAmount')), 'totalDebit'],
            [sequelize.fn('SUM', sequelize.col('VoucherEntries.creditAmount')), 'totalCredit']
        ],
        include: [{
            model: VoucherEntry,
            attributes: []
        }],
        group: ['Account.id', 'Account.name']
    });

    return accounts;
};

module.exports = { getLedgerReport, getTrialBalance };
