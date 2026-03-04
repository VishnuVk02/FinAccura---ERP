const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Invoice = sequelize.define('Invoice', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    invoiceNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    invoiceDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    totalAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: false
    },
    exchangeRate: {
        type: DataTypes.DECIMAL(15, 6),
        defaultValue: 1.0
    },
    totalAmountInINR: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    dueDate: {
        type: DataTypes.DATEONLY
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'PARTIAL', 'PAID'),
        defaultValue: 'PENDING'
    },
    purchaseOrderId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    exportOrderId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
});

module.exports = Invoice;
