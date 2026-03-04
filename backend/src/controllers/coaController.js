const { MainGroup, Group, SubGroup, Account } = require('../models');

// Hierarchical fetch
const getChartOfAccounts = async (req, res) => {
    try {
        const coa = await MainGroup.findAll({
            include: [{
                model: Group,
                include: [{
                    model: SubGroup,
                    include: [Account]
                }]
            }]
        });
        res.json(coa);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Generic Creation for Groups
const createGroup = async (req, res) => {
    try {
        const group = await Group.create(req.body);
        res.status(201).json(group);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const createSubGroup = async (req, res) => {
    try {
        const subGroup = await SubGroup.create(req.body);
        res.status(201).json(subGroup);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const createAccount = async (req, res) => {
    try {
        const account = await Account.create(req.body);
        res.status(201).json(account);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = {
    getChartOfAccounts,
    createGroup,
    createSubGroup,
    createAccount
};
