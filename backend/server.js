const express = require('express');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');
const { sequelize, connectDB } = require('./src/config/db');

const app = express();

// Request Logger
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const logEntry = `${new Date().toISOString()} - ${req.method} ${req.url} - Status: ${res.statusCode} - Origin: ${req.headers.origin} - Duration: ${duration}ms\n`;
        if (req.method === 'POST' && req.url.includes('login')) {
            const safeBody = { ...req.body };
            const passLen = safeBody.password ? safeBody.password.length : 0;
            if (safeBody.password) safeBody.password = '***';
            fs.appendFileSync('http_requests.log', `[LOGIN DEBUG] Body: ${JSON.stringify(safeBody)}, passLen: ${passLen}\n`);
        }
        fs.appendFileSync('http_requests.log', logEntry);
        console.log(logEntry);
    });
    next();
});

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001', 'http://localhost:5173', 'http://127.0.0.1:5173'];
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Database Connection & Sync
const startServer = async () => {
    await connectDB();

    if (process.env.NODE_ENV === 'development') {
        await sequelize.sync();
        console.log('Database synced.');
    }

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
};

startServer();

// Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/organization', require('./src/routes/organizationRoutes'));
app.use('/api/coa', require('./src/routes/coaRoutes'));
app.use('/api/export', require('./src/routes/exportRoutes'));
app.use('/api/transactions', require('./src/routes/transactionRoutes'));
app.use('/api/reports', require('./src/routes/reportRoutes'));
app.use('/api/dashboard', require('./src/routes/dashboardRoutes'));
app.use('/api/production', require('./src/routes/productionRoutes'));
app.use('/api/po', require('./src/routes/poRoutes'));
app.use('/api/finance', require('./src/routes/financeRoutes'));

// Basic Route
app.get('/', (req, res) => {
    res.send('ERP Garment API is running...');
});
