const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ProductionLine = sequelize.define('ProductionLine', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    lineName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    unitId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    totalWorkers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    supervisorName: {
        type: DataTypes.STRING
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    timestamps: true
});

module.exports = ProductionLine;
