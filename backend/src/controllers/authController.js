const { User, Role } = require('../models');
const { generateToken } = require('../utils/jwtUtils');
const bcrypt = require('bcryptjs');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { username, email, password, roleName } = req.body;

    try {
        const userExists = await User.findOne({ where: { email } });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const role = await Role.findOne({ where: { name: roleName || 'VIEWER' } });

        if (!role) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const user = await User.create({
            username,
            email,
            password,
            roleId: role.id
        });

        if (user) {
            res.status(201).json({
                id: user.id,
                username: user.username,
                email: user.email,
                role: role.name,
                token: generateToken(user.id)
            });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({
            where: { email },
            include: [{ model: Role, attributes: ['name'] }]
        });

        console.log(`[LOGIN DEBUG] email: ${email}, passLength: ${password?.length}`);

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.Role.name,
                token: generateToken(user.id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
    try {
        const user = req.user;
        if (user) {
            res.json({
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.Role?.name || 'VIEWER'
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error('getUserProfile error:', error);
        res.status(500).json({ message: 'Server error retrieving profile' });
    }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            include: [{ model: Role, attributes: ['name'] }],
            attributes: { exclude: ['password'] }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a user (Admin only)
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (user) {
            await user.destroy();
            res.json({ message: 'User removed successfully' });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Refresh token (Dummy)
// @route   POST /api/auth/refresh
// @access  Public
const refreshToken = async (req, res) => {
    res.json({ message: 'Token refresh successful (dummy)' });
};

module.exports = { registerUser, loginUser, getUserProfile, getUsers, deleteUser, refreshToken };
