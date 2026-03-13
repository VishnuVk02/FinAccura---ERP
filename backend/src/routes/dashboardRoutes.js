const express = require('express');
const router = express.Router();
const { getStats, getFinanceStats, getProductionSummary, getExportStats, getPOStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/stats', protect, getStats);
router.get('/finance-stats', protect, authorize('ADMIN', 'FINANCE_MANAGER'), getFinanceStats);
router.get('/production-summary', protect, authorize('ADMIN', 'PRODUCTION_MANAGER'), getProductionSummary);
router.get('/export-stats', protect, authorize('ADMIN', 'EXPORT_MANAGER'), getExportStats);
router.get('/po-stats', protect, authorize('ADMIN', 'PO_MANAGER', 'EXPORT_MANAGER'), getPOStats);

module.exports = router;
