const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PurchaseOrder = sequelize.define('PurchaseOrder', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    buyerName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    orderDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    exportDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    fabricType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fitType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    pricePerUnit: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    totalValue: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM(
            'CREATED',
            'IN_PRODUCTION',
            'PRODUCTION_COMPLETED',
            'READY_FOR_EXPORT',
            'EXPORTED',
            'PAYMENT_PENDING',
            'PAYMENT_COMPLETED'
        ),
        defaultValue: 'CREATED'
    },
    createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    isSeenByProduction: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    isSeenByFinance: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
});

module.exports = PurchaseOrder;
