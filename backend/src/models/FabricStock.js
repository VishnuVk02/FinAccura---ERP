const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const FabricStock = sequelize.define('FabricStock', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    fabricName: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    },
    unit: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Meters'
    }
});

module.exports = FabricStock;
