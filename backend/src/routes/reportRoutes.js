const express = require('express');
const router = express.Router();
const { getLedger, getTrialBalanceReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/ledger', protect, authorize('ADMIN', 'FINANCE_MANAGER'), getLedger);
router.get('/trial-balance', protect, authorize('ADMIN', 'FINANCE_MANAGER'), getTrialBalanceReport);

module.exports = router;
