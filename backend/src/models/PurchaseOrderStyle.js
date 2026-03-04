const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PurchaseOrderStyle = sequelize.define('PurchaseOrderStyle', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    purchaseOrderId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    styleNumber: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: false
});

module.exports = PurchaseOrderStyle;
