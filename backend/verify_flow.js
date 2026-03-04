const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

const verify = async () => {
    try {
        // 1. Login as Admin
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@erp.com',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        const auth = { headers: { Authorization: `Bearer ${token}` } };

        console.log('Logged in as Admin.');

        // 2. Create PO for Mango (Account exists)
        const poRes = await axios.post(`${API_URL}/po/create`, {
            buyerName: 'Mango',
            orderDate: '2026-03-04',
            exportDate: '2026-04-04',
            quantity: 1000,
            fabricType: 'Denim',
            fitType: 'Regular',
            pricePerUnit: 10,
            styleNumbers: ['M-001']
        }, auth);
        const poId = poRes.data.id;
        console.log(`Created PO #${poId} for Mango.`);

        // 3. Mark as READY_FOR_EXPORT (Export Manager usually does this)
        // Login as Export Manager
        const expLogin = await axios.post(`${API_URL}/auth/login`, {
            email: 'export_manager@erp.com',
            password: 'export123'
        });
        const expToken = expLogin.data.token;
        const expAuth = { headers: { Authorization: `Bearer ${expToken}` } };

        await axios.put(`${API_URL}/po/update-status/${poId}`, { status: 'READY_FOR_EXPORT' }, expAuth);
        console.log(`Updated PO #${poId} to READY_FOR_EXPORT.`);

        // 4. Check if Invoice was generated
        const invoicesRes = await axios.get(`${API_URL}/transactions/invoices`, auth);
        const invoice = invoicesRes.data.find(inv => inv.purchaseOrderId === poId);

        if (invoice) {
            console.log(`SUCCESS: Invoice generated: ${invoice.invoiceNumber}`);
            console.log('Invoice details:', JSON.stringify(invoice, null, 2));
        } else {
            console.log('FAILURE: Invoice not generated.');
        }

        process.exit();
    } catch (err) {
        console.error('API Verification error:', err.response?.data || err.message);
        process.exit(1);
    }
};
verify();
