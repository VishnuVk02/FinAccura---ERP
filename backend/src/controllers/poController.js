const { PurchaseOrder, PurchaseOrderStyle, User, ProductionOrder, ProductionLine } = require('../models');
const { triggerAutoInvoice } = require('./invoiceController');

exports.createPO = async (req, res) => {
    try {
        const {
            buyerName,
            orderDate,
            exportDate,
            styleNumbers,
            quantity,
            fabricType,
            fitType,
            pricePerUnit
        } = req.body;

        const totalValue = quantity * pricePerUnit;

        const po = await PurchaseOrder.create({
            buyerName,
            orderDate,
            exportDate,
            quantity,
            fabricType,
            fitType,
            pricePerUnit,
            totalValue,
            createdBy: req.user.id,
            status: 'CREATED'
        });

        if (styleNumbers && styleNumbers.length > 0) {
            const styles = styleNumbers.slice(0, 5).map(style => ({
                purchaseOrderId: po.id,
                styleNumber: style
            }));
            await PurchaseOrderStyle.bulkCreate(styles);
        }

        const fullPO = await PurchaseOrder.findByPk(po.id, {
            include: [{ model: PurchaseOrderStyle, as: 'styles' }]
        });

        res.status(201).json(fullPO);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getMyOrders = async (req, res) => {
    try {
        const orders = await PurchaseOrder.findAll({
            where: { createdBy: req.user.id },
            include: [{ model: PurchaseOrderStyle, as: 'styles' }],
            order: [['createdAt', 'DESC']]
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getPOById = async (req, res) => {
    try {
        const po = await PurchaseOrder.findByPk(req.params.id, {
            include: [
                { model: PurchaseOrderStyle, as: 'styles' },
                { model: User, as: 'creator', attributes: ['username', 'email'] }
            ]
        });
        if (!po) return res.status(404).json({ message: 'Purchase Order not found' });
        res.json(po);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateStatus = async (req, res) => {
    const t = await PurchaseOrder.sequelize.transaction();
    try {
        const { id } = req.params;
        const { status } = req.body;

        const po = await PurchaseOrder.findByPk(id, { transaction: t });
        if (!po) {
            await t.rollback();
            return res.status(404).json({ message: 'Purchase Order not found' });
        }

        const oldStatus = po.status;
        await po.update({ status }, { transaction: t });

        // Trigger automatic invoice generation on EXPORTED status
        if (status === 'EXPORTED') {
            await triggerAutoInvoice(id, t);
        }

        await t.commit();
        res.json(po);
    } catch (error) {
        await t.rollback();
        res.status(400).json({ message: error.message });
    }
};

exports.getOrdersByStatus = async (req, res) => {
    try {
        const { statuses } = req.query; // Expecting comma separated or array
        const statusList = Array.isArray(statuses) ? statuses : (statuses ? statuses.split(',') : []);

        const whereClause = statusList.length > 0 ? { status: statusList } : {};

        const orders = await PurchaseOrder.findAll({
            where: whereClause,
            include: [{ model: PurchaseOrderStyle, as: 'styles' }],
            order: [['exportDate', 'ASC']]
        });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getNotificationCount = async (req, res) => {
    try {
        const count = await PurchaseOrder.count({
            where: {
                status: 'CREATED',
                isSeenByProduction: false
            }
        });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.markSeenByProduction = async (req, res) => {
    try {
        await PurchaseOrder.update(
            { isSeenByProduction: true },
            { where: { status: 'CREATED', isSeenByProduction: false } }
        );
        res.json({ message: 'Marked as seen' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getFinanceNotificationCount = async (req, res) => {
    try {
        const count = await PurchaseOrder.count({
            where: {
                status: 'READY_FOR_EXPORT',
                isSeenByFinance: false
            }
        });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.markSeenByFinance = async (req, res) => {
    try {
        await PurchaseOrder.update(
            { isSeenByFinance: true },
            { where: { status: 'READY_FOR_EXPORT', isSeenByFinance: false } }
        );
        res.json({ message: 'Marked as seen' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.startProduction = async (req, res) => {
    try {
        const { id } = req.params;
        const { lineId, assignedDate, targetQuantity } = req.body;

        console.log('[DEBUG] startProduction hit. PO ID:', id, 'Payload:', req.body);

        const po = await PurchaseOrder.findByPk(id);
        if (!po) {
            console.log('[DEBUG] PO not found');
            return res.status(404).json({ message: 'Purchase Order not found' });
        }

        console.log('[DEBUG] PO found:', po.id);

        // Verify line exists
        const allLines = await ProductionLine.findAll();
        console.log('[DEBUG] Available lines:', allLines.map(l => ({ id: l.id, name: l.lineName })));

        const line = await ProductionLine.findByPk(lineId);
        if (!line) {
            console.log('[DEBUG] Line not found:', lineId);
            return res.status(400).json({
                message: 'Production line not found.',
                debug: {
                    requestedLineId: lineId,
                    availableLines: allLines.map(l => ({ id: l.id, name: l.lineName }))
                }
            });
        }

        console.log('[DEBUG] Line found:', line.lineName);

        // Create Production Order
        const productionOrder = await ProductionOrder.create({
            purchaseOrderId: po.id,
            lineId: parseInt(lineId),
            assignedDate,
            targetQuantity: parseInt(targetQuantity),
            isProductionStarted: true,
            status: 'IN_PROGRESS'
        });

        console.log('[DEBUG] ProductionOrder created:', productionOrder.id);

        // Update PO Status
        await po.update({ status: 'IN_PRODUCTION' });
        console.log('[DEBUG] PO status updated to IN_PRODUCTION');

        res.status(201).json({ po, productionOrder });
    } catch (error) {
        console.error('[ERROR] startProduction failed:', error);
        res.status(400).json({
            message: error.message,
            error: error.errors ? error.errors.map(e => e.message) : error.message
        });
    }
};

exports.deletePO = async (req, res) => {
    try {
        const { id } = req.params;
        const po = await PurchaseOrder.findByPk(id);

        if (!po) {
            return res.status(404).json({ message: 'Purchase Order not found' });
        }


        await PurchaseOrderStyle.destroy({ where: { purchaseOrderId: id } });
        await ProductionOrder.destroy({ where: { purchaseOrderId: id } });


        await po.destroy();

        res.json({ message: 'Purchase Order and related records deleted successfully', id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
