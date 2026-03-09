const express = require('express');
const router = express.Router();
const { createInvoice, getInvoices, getReadyToInvoice } = require('../controllers/invoiceController');
const { createPayment, getPayments, createExpense } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/invoices', protect, authorize('ADMIN', 'FINANCE_MANAGER', 'EXPORT_MANAGER'), createInvoice);
router.get('/invoices', protect, getInvoices);
router.get('/ready-to-invoice', protect, authorize('ADMIN', 'FINANCE_MANAGER', 'EXPORT_MANAGER'), getReadyToInvoice);

router.post('/payments', protect, authorize('ADMIN', 'FINANCE_MANAGER'), createPayment);
router.get('/payments', protect, getPayments);

router.post('/expenses', protect, authorize('ADMIN', 'FINANCE_MANAGER'), createExpense);

module.exports = router;
