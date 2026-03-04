const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Payment = sequelize.define('Payment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    paymentDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    amount: {
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
    receivedAmountInINR: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false
    }
});

module.exports = Payment;
