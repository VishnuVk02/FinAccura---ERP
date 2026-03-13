const express = require('express');
const router = express.Router();
const poController = require('../controllers/poController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// PO Manager specific routes
router.post('/create', authorize('PO_MANAGER', 'ADMIN'), poController.createPO);
router.get('/my-orders', authorize('PO_MANAGER', 'ADMIN'), poController.getMyOrders);
router.get('/orders-by-status', protect, poController.getOrdersByStatus);
router.get('/notification-count', protect, authorize('PRODUCTION_MANAGER', 'ADMIN'), poController.getNotificationCount);
router.get('/finance-notification-count', protect, authorize('FINANCE_MANAGER', 'ADMIN'), poController.getFinanceNotificationCount);
router.put('/mark-seen-production', protect, authorize('PRODUCTION_MANAGER', 'ADMIN'), poController.markSeenByProduction);
router.put('/mark-seen-finance', protect, authorize('FINANCE_MANAGER', 'ADMIN'), poController.markSeenByFinance);
router.post('/start-production/:id', protect, authorize('PRODUCTION_MANAGER', 'ADMIN'), poController.startProduction);
router.put('/update-status/:id', protect, poController.updateStatus);
router.get('/fabric-stock', protect, poController.getFabricStock);
router.delete('/:id', authorize('ADMIN'), poController.deletePO);
router.get('/:id', poController.getPOById);

module.exports = router;
