const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Voucher = sequelize.define('Voucher', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    voucherNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    voucherType: {
        type: DataTypes.ENUM('PAYMENT', 'RECEIPT', 'JOURNAL', 'SALES', 'PURCHASE'),
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    narration: {
        type: DataTypes.TEXT
    }
});

module.exports = Voucher;
