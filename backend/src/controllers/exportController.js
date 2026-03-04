const { Buyer, ExportOrder, Unit, FinancialYear, Account, SubGroup } = require('../models');

// Buyer Controllers
const createBuyer = async (req, res) => {
    const t = await Buyer.sequelize.transaction();
    try {
        const buyer = await Buyer.create(req.body, { transaction: t });

        // Find Sundry Debtors subgroup
        const sundryDebtors = await SubGroup.findOne({ where: { name: 'Sundry Debtors' } });
        if (sundryDebtors) {
            await Account.create({
                name: `Accounts Receivable - ${buyer.name}`,
                subGroupId: sundryDebtors.id,
                isBankAccount: false,
                isActive: true
            }, { transaction: t });
        }

        await t.commit();
        res.status(201).json(buyer);
    } catch (error) {
        await t.rollback();
        res.status(400).json({ message: error.message });
    }
};

const getBuyers = async (req, res) => {
    try {
        const buyers = await Buyer.findAll({ where: { isActive: true } });
        res.json(buyers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Export Order Controllers
const createExportOrder = async (req, res) => {
    try {
        const { totalAmount, exchangeRate = 1.0 } = req.body;
        const totalAmountInINR = parseFloat(totalAmount) * parseFloat(exchangeRate);

        const order = await ExportOrder.create({
            ...req.body,
            totalAmountInINR,
            status: 'CREATED'
        });
        res.status(201).json(order);
    } catch (error) {
        console.error('Create Export/Import Order Error:', error);
        res.status(400).json({ message: error.message });
    }
};

const getExportOrders = async (req, res) => {
    try {
        const orders = await ExportOrder.findAll({
            include: [
                { model: Buyer, attributes: ['name', 'country', 'currency'] },
                { model: Unit, attributes: ['name'] },
                { model: FinancialYear, attributes: ['name'] }
            ],
            order: [['orderDate', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateBuyer = async (req, res) => {
    try {
        const buyer = await Buyer.findByPk(req.params.id);
        if (!buyer) return res.status(404).json({ message: 'Buyer not found' });

        await buyer.update(req.body);
        res.json(buyer);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteBuyer = async (req, res) => {
    try {
        const buyer = await Buyer.findByPk(req.params.id);
        if (!buyer) return res.status(404).json({ message: 'Buyer not found' });

        // Also could delete associated ledger, but keeping it simple
        await buyer.destroy();
        res.json({ message: 'Buyer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createBuyer,
    getBuyers,
    updateBuyer,
    deleteBuyer,
    createExportOrder,
    getExportOrders
};
