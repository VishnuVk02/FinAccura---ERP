const express = require('express');
const router = express.Router();
const {
    getOrganization,
    updateOrganization,
    createFinancialYear,
    getFinancialYears,
    updateFinancialYear,
    deleteFinancialYear,
    createUnit,
    getUnits,
    updateUnit,
    deleteUnit
} = require('../controllers/organizationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', protect, getOrganization);
router.put('/', protect, authorize('ADMIN'), updateOrganization);

router.post('/financial-years', protect, authorize('ADMIN'), createFinancialYear);
router.get('/financial-years', protect, getFinancialYears);
router.put('/financial-years/:id', protect, authorize('ADMIN'), updateFinancialYear);
router.delete('/financial-years/:id', protect, authorize('ADMIN'), deleteFinancialYear);

router.post('/units', protect, authorize('ADMIN'), createUnit);
router.get('/units', protect, getUnits);
router.put('/units/:id', protect, authorize('ADMIN'), updateUnit);
router.delete('/units/:id', protect, authorize('ADMIN'), deleteUnit);

module.exports = router;
