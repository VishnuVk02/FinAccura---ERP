const { Buyer, Account, SubGroup, sequelize } = require('./src/models');

async function testCreate() {
    console.log('Testing Buyer Creation...');
    const t = await sequelize.transaction();
    try {
        const buyerData = {
            name: 'Test Buyer ' + Date.now(),
            country: 'USA',
            currency: 'USD',
            email: 'test@example.com'
        };

        const buyer = await Buyer.create(buyerData, { transaction: t });
        console.log('Buyer created:', buyer.name);

        const sundryDebtors = await SubGroup.findOne({ where: { name: 'Sundry Debtors' } });
        if (sundryDebtors) {
            console.log('Found Sundry Debtors subgroup.');
            await Account.create({
                name: `Accounts Receivable - ${buyer.name}`,
                subGroupId: sundryDebtors.id,
                isBankAccount: false,
                isActive: true
            }, { transaction: t });
            console.log('Account created.');
        } else {
            console.log('Sundry Debtors subgroup NOT FOUND');
        }

        await t.commit();
        console.log('Test successful!');
    } catch (error) {
        await t.rollback();
        console.error('Test failed with error:');
        if (error.errors) {
            error.errors.forEach(e => console.log(`- ${e.message} (${e.path})`));
        } else {
            console.error(error.message);
        }
    } finally {
        process.exit();
    }
}

testCreate();
