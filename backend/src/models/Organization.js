const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Organization = sequelize.define('Organization', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    address: {
        type: DataTypes.TEXT
    },
    email: {
        type: DataTypes.STRING
    },
    phone: {
        type: DataTypes.STRING
    },
    website: {
        type: DataTypes.STRING
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'USD'
    },
    taxId: {
        type: DataTypes.STRING
    }
});

module.exports = Organization;
