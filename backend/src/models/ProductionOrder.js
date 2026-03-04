const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ProductionOrder = sequelize.define('ProductionOrder', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    exportOrderId: {
        type: DataTypes.INTEGER,
        allowNull: true // Explicitly allowing null for PO-based orders
    },
    purchaseOrderId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    isProductionStarted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    lineId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    assignedDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    targetQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    producedQuantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    defectQuantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('IN_PROGRESS', 'COMPLETED', 'HOLD'),
        defaultValue: 'IN_PROGRESS'
    }
}, {
    timestamps: true
});

module.exports = ProductionOrder;
