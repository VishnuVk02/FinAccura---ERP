const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const WorkerAllocation = sequelize.define('WorkerAllocation', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    lineId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    allocationDate: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    shiftType: {
        type: DataTypes.ENUM('DAY', 'NIGHT'),
        allowNull: false,
        defaultValue: 'DAY'
    },
    plannedWorkers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    presentWorkers: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    standardOutputPerWorker: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 8
    },
    workingHours: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 8
    },
    supervisorName: {
        type: DataTypes.STRING
    }
}, {
    timestamps: true
});

module.exports = WorkerAllocation;
