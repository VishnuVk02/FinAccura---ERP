const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const DailyProductionReport = sequelize.define('DailyProductionReport', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    productionOrderId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    productionDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    totalProduced: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    totalDefects: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    workingHours: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 8
    },
    efficiencyPercentage: {
        type: DataTypes.FLOAT,
        defaultValue: 0
    },
    remarks: {
        type: DataTypes.TEXT
    }
}, {
    timestamps: true
});

module.exports = DailyProductionReport;
