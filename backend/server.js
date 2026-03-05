const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB, sequelize } = require('./src/config/db');
const db = require('./src/models'); // Load all models and associations

dotenv.config();

const app = express();

// Middleware
app.use(cors());
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
