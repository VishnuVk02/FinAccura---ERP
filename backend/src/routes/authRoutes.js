const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, getUsers, deleteUser, refreshToken } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.post('/refresh', refreshToken);
router.get('/users', protect, authorize('ADMIN'), getUsers);
router.delete('/users/:id', protect, authorize('ADMIN'), deleteUser);

module.exports = router;
