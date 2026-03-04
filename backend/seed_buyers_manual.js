const { Buyer, SubGroup, Account, sequelize } = require('./src/models');

const buyers = [
    { name: 'T&T', country: 'Germany', currency: 'EUR' },
    { name: 'gap', country: 'USA', currency: 'USD' },
    { name: 'Nano', country: 'UK', currency: 'GBP' },
    { name: 'chissle', country: 'France', currency: 'EUR' },
    { name: 'American eagle', country: 'USA', currency: 'USD' }
];

async function seedBuyers() {
    const t = await sequelize.transaction();
    try {
        const sundryDebtors = await SubGroup.findOne({ where: { name: 'Sundry Debtors' } });

        for (const buyerData of buyers) {
            const [buyer, created] = await Buyer.findOrCreate({
                where: { name: buyerData.name },
                defaults: { ...buyerData, isActive: true },
                transaction: t
            });

            if (created && sundryDebtors) {
                console.log(`Created buyer: ${buyerData.name}`);
                await Account.findOrCreate({
                    where: { name: `Accounts Receivable - ${buyer.name}` },
                    defaults: {
                        subGroupId: sundryDebtors.id,
                        isBankAccount: false,
                        isActive: true
                    },
                    transaction: t
                });
            } else {
                console.log(`Buyer ${buyerData.name} already exists or Sundry Debtors subgroup not found.`);
            }
        }

        await t.commit();
        console.log('Seeding completed successfully.');
        process.exit(0);
    } catch (error) {
        await t.rollback();
        console.error('Seeding failed:', error);
        process.exit(1);
    }
}

seedBuyers();
