const express = require('express');
const router = express.Router();
const productionController = require('../controllers/productionController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All production routes require PRODUCTION_MANAGER or ADMIN role
router.use(protect);
router.use(authorize('PRODUCTION_MANAGER', 'ADMIN'));

// Production Lines
router.post('/production-lines', productionController.createLine);
router.get('/production-lines', productionController.getLines);
router.put('/production-lines/:id', productionController.updateLine);
router.delete('/production-lines/:id', productionController.deleteLine);

// Production Orders
router.post('/production-orders', productionController.createOrder);
router.get('/production-orders', productionController.getOrders);
router.put('/production-orders/:id', productionController.updateOrder);
router.put('/production-orders/:id/status', productionController.updateOrderStatus);

// Daily Production Reports
router.post('/daily-production', productionController.createDailyReport);
router.get('/daily-production/:orderId', productionController.getDailyReports);
router.get('/daily-reports', productionController.getReportsByDate);

// Worker Allocation
router.post('/worker-allocation', productionController.allocateWorkers);
router.get('/worker-allocation', productionController.getWorkerAllocations);
router.get('/worker-allocation/last/:lineId', productionController.getLastAllocation);

// Production Reports & Stats
router.get('/reports/production-summary', productionController.getOrders);
router.get('/reports/efficiency', productionController.getReports);
router.get('/reports/defects', productionController.getReports);
router.get('/stats', productionController.getStats);

// New PO Integration Routes
const poController = require('../controllers/poController');
router.get('/orders', authorize('PRODUCTION_MANAGER', 'ADMIN'), (req, res, next) => {
    req.query.statuses = 'CREATED,IN_PRODUCTION';
    next();
}, poController.getOrdersByStatus);

router.put('/update-status/:id', authorize('PRODUCTION_MANAGER', 'ADMIN'), poController.updateStatus);

module.exports = router;
