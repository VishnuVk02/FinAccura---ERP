const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ExportOrder = sequelize.define('ExportOrder', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    orderNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    styleName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    orderDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    deliveryDate: {
        type: DataTypes.DATEONLY
    },
    totalQuantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    pricePerUnit: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    totalAmount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    currency: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'USD'
    },
    exchangeRate: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 1.0
    },
    totalAmountInINR: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
    },
    status: {
        type: DataTypes.ENUM('CREATED', 'SHIPPED', 'COMPLETED'),
        defaultValue: 'CREATED'
    },
    buyerId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    unitId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    financialYearId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
});

module.exports = ExportOrder;
