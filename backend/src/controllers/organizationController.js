const { FinancialYear, Unit, Organization } = require('../models');

// Organization Info
const getOrganization = async (req, res) => {
    try {
        const [org] = await Organization.findOrCreate({
            where: { id: 1 },
            defaults: { name: 'Garment ERP System' }
        });
        res.json(org);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateOrganization = async (req, res) => {
    try {
        const org = await Organization.findByPk(1);
        if (!org) return res.status(404).json({ message: 'Organization info not found' });
        await org.update(req.body);
        res.json(org);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Financial Year Controllers
const createFinancialYear = async (req, res) => {
    try {
        const fy = await FinancialYear.create(req.body);
        res.status(201).json(fy);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getFinancialYears = async (req, res) => {
    try {
        const years = await FinancialYear.findAll({ order: [['startDate', 'DESC']] });
        res.json(years);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateFinancialYear = async (req, res) => {
    try {
        const fy = await FinancialYear.findByPk(req.params.id);
        if (!fy) return res.status(404).json({ message: 'Financial Year not found' });
        await fy.update(req.body);
        res.json(fy);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteFinancialYear = async (req, res) => {
    try {
        const fy = await FinancialYear.findByPk(req.params.id);
        if (!fy) return res.status(404).json({ message: 'Financial Year not found' });
        await fy.destroy();
        res.json({ message: 'Financial Year deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Unit Controllers
const createUnit = async (req, res) => {
    try {
        const unit = await Unit.create(req.body);
        res.status(201).json(unit);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getUnits = async (req, res) => {
    try {
        const units = await Unit.findAll();
        res.json(units);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateUnit = async (req, res) => {
    try {
        const unit = await Unit.findByPk(req.params.id);
        if (!unit) return res.status(404).json({ message: 'Unit not found' });
        await unit.update(req.body);
        res.json(unit);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteUnit = async (req, res) => {
    try {
        const unit = await Unit.findByPk(req.params.id);
        if (!unit) return res.status(404).json({ message: 'Unit not found' });
        await unit.destroy();
        res.json({ message: 'Unit deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getOrganization,
    updateOrganization,
    createFinancialYear,
    getFinancialYears,
    updateFinancialYear,
    deleteFinancialYear,
    createUnit,
    getUnits,
    updateUnit,
    deleteUnit
};
