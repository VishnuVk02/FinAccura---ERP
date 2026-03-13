const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const fs = require('fs');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const logMsg = `[AUTH DEBUG] Verifying token: ${token.substring(0, 10)}...\n`;
            fs.appendFileSync('http_requests.log', logMsg);

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            fs.appendFileSync('http_requests.log', `[AUTH DEBUG] Token decoded. User ID: ${decoded.id}\n`);

            req.user = await User.findByPk(decoded.id, {
                include: [{ model: Role, attributes: ['name'] }]
            });

            if (!req.user) {
                fs.appendFileSync('http_requests.log', `[AUTH DEBUG] User with ID ${decoded.id} not found in DB\n`);
                return res.status(401).json({ message: 'User not found' });
            }

            fs.appendFileSync('http_requests.log', `[AUTH DEBUG] User authorized: ${req.user.username} (${req.user.Role.name})\n`);
            next();
        } catch (error) {
            fs.appendFileSync('http_requests.log', `[AUTH DEBUG] Token verification failed: ${error.message}\n`);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.Role.name)) {
            return res.status(403).json({
                message: `User role ${req.user.Role.name} is not authorized to access this route`
            });
        }
        next();
    };
};

module.exports = { protect, authorize };
