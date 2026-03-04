const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const VoucherEntry = sequelize.define('VoucherEntry', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    debitAmount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0
    },
    creditAmount: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0
    }
});

module.exports = VoucherEntry;
