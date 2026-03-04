const express = require('express');
const router = express.Router();
const poController = require('../controllers/poController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('FINANCE_MANAGER', 'ADMIN'));

router.get('/orders', (req, res, next) => {
    req.query.statuses = 'EXPORTED,PAYMENT_PENDING,PAYMENT_COMPLETED';
    next();
}, poController.getOrdersByStatus);

router.put('/update-payment-status/:id', poController.updateStatus);

module.exports = router;
