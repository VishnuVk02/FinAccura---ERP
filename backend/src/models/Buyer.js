const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Buyer = sequelize.define('Buyer', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    country: {
        type: DataTypes.STRING,
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING, // e.g., USD, EUR
        allowNull: false
    },
    contactPerson: {
        type: DataTypes.STRING
    },
    email: {
        type: DataTypes.STRING,
        validate: { isEmail: true }
    },
    paymentTerms: {
        type: DataTypes.STRING // e.g., "30 days"
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

module.exports = Buyer;
