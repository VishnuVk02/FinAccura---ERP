const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const InvoiceExtra = sequelize.define('InvoiceExtra', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    invoiceId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    portOfLoading: {
        type: DataTypes.STRING,
        allowNull: true
    },
    portOfDestination: {
        type: DataTypes.STRING,
        allowNull: true
    },
    shipmentMethod: {
        type: DataTypes.ENUM('SEA', 'AIR'),
        defaultValue: 'SEA'
    },
    shippingDate: {
        type: DataTypes.DATEONLY,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    timestamps: false
});

module.exports = InvoiceExtra;
