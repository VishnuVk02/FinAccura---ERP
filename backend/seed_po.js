const { sequelize, Role, User, PurchaseOrder, PurchaseOrderStyle } = require('./src/models');
const bcrypt = require('bcryptjs');

const seedPO = async () => {
    try {
        // 1. Ensure PO_MANAGER role exists
        let poRole = await Role.findOne({ where: { name: 'PO_MANAGER' } });
        if (!poRole) {
            poRole = await Role.create({ name: 'PO_MANAGER' });
            console.log('PO_MANAGER role created.');
        }

        // 2. Create PO Manager user
        let poManager = await User.findOne({ where: { username: 'po_manager' } });
        if (!poManager) {
            const hashedPassword = await bcrypt.hash('po123', 10);
            poManager = await User.create({
                username: 'po_manager',
                email: 'po@erp.com',
                password: 'po123', // Model hook handles hashing usually, but being explicit or checking hook
                roleId: poRole.id
            });
            console.log('PO Manager user created (username: po_manager, password: po123).');
        }

        // 3. Sample Orders
        const sampleOrders = [
            {
                buyerName: 'American Eagle',
                orderDate: '2026-03-01',
                exportDate: '2026-04-15',
                quantity: 5000,
                fabricType: 'Cotton Denim',
                fitType: 'Slim Fit',
                pricePerUnit: 8.5,
                totalValue: 42500,
                status: 'CREATED',
                createdBy: poManager.id,
                styles: ['AE-ST101', 'AE-ST102', 'AE-ST103']
            },
            {
                buyerName: 'Mango',
                orderDate: '2026-03-02',
                exportDate: '2026-04-20',
                quantity: 3500,
                fabricType: 'Linen',
                fitType: 'Regular Fit',
                pricePerUnit: 9.2,
                totalValue: 32200,
                status: 'CREATED',
                createdBy: poManager.id,
                styles: ['MG-ST201', 'MG-ST202']
            },
            {
                buyerName: 'Banana Republic',
                orderDate: '2026-03-03',
                exportDate: '2026-04-30',
                quantity: 7200,
                fabricType: 'Organic Cotton',
                fitType: 'Relaxed Fit',
                pricePerUnit: 10,
                totalValue: 72000,
                status: 'CREATED',
                createdBy: poManager.id,
                styles: ['BR-ST301', 'BR-ST302', 'BR-ST303', 'BR-ST304']
            }
        ];

        for (const orderData of sampleOrders) {
            const { styles, ...poData } = orderData;
            const existingPO = await PurchaseOrder.findOne({ where: { buyerName: poData.buyerName, orderDate: poData.orderDate } });
            if (!existingPO) {
                const po = await PurchaseOrder.create(poData);
                for (const styleNumber of styles) {
                    await PurchaseOrderStyle.create({ purchaseOrderId: po.id, styleNumber });
                }
                console.log(`Sample Order for ${poData.buyerName} created.`);
            }
        }

        console.log('PO Seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedPO();
