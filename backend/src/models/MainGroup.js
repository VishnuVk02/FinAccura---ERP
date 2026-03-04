const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const MainGroup = sequelize.define('MainGroup', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false, // Assets, Liabilities, Income, Expense
        unique: true
    },
    nature: {
        type: DataTypes.ENUM('DEBIT', 'CREDIT'),
        allowNull: false
    }
}, {
    timestamps: false
});

module.exports = MainGroup;
