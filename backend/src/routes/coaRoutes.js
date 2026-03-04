const express = require('express');
const router = express.Router();
const { getChartOfAccounts, createGroup, createSubGroup, createAccount } = require('../controllers/coaController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getChartOfAccounts);
router.post('/groups', protect, authorize('ADMIN', 'FINANCE_MANAGER'), createGroup);
router.post('/sub-groups', protect, authorize('ADMIN', 'FINANCE_MANAGER'), createSubGroup);
router.post('/accounts', protect, authorize('ADMIN', 'FINANCE_MANAGER'), createAccount);

module.exports = router;
