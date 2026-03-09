const express = require('express');
const router = express.Router();
const { createBuyer, getBuyers, updateBuyer, deleteBuyer, createExportOrder, getExportOrders, updateExportOrderStatus } = require('../controllers/exportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/buyers', protect, authorize('ADMIN', 'EXPORT_MANAGER'), createBuyer);
router.get('/buyers', protect, getBuyers);
router.put('/buyers/:id', protect, authorize('ADMIN', 'EXPORT_MANAGER'), updateBuyer);
router.delete('/buyers/:id', protect, authorize('ADMIN', 'EXPORT_MANAGER'), deleteBuyer);

router.post('/orders', protect, authorize('ADMIN', 'EXPORT_MANAGER'), createExportOrder);
router.get('/orders', protect, getExportOrders);
router.put('/orders/:id/status', protect, authorize('EXPORT_MANAGER', 'ADMIN'), updateExportOrderStatus);

// New PO Integration Routes
const poController = require('../controllers/poController');
router.get('/orders-ready', protect, authorize('EXPORT_MANAGER', 'ADMIN'), (req, res, next) => {
    req.query.statuses = 'PRODUCTION_COMPLETED,READY_FOR_EXPORT,EXPORTED,PAYMENT_COMPLETED';
    next();
}, poController.getOrdersByStatus);

router.put('/update-status/:id', protect, authorize('EXPORT_MANAGER', 'ADMIN'), poController.updateStatus);

module.exports = router;
