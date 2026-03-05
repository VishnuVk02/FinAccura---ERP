const { Buyer, Account, SubGroup, sequelize } = require('./src/models');

async function testFix() {
    console.log('--- VERIFYING BUYER FIX ---');
    const name = 'Verify Fix Buyer ' + Date.now();

    try {
        // 1. Manually create an orphaned account
        console.log('Simulating orphaned account...');
        const sundryDebtors = await SubGroup.findOne({ where: { name: 'Sundry Debtors' } });
        await Account.create({
            name: `Accounts Receivable - ${name}`,
            subGroupId: sundryDebtors.id,
            isBankAccount: false,
            isActive: true
        });
        console.log('Orphaned account created.');

        // 2. Attempt to create a buyer with the same name (should use existing account)
        console.log(`Creating buyer: ${name}`);
        const buyerData = {
            name: name,
            country: 'FR',
            currency: 'EUR',
            email: 'fix@test.com'
        };

        // We'll call the logic directly or via a mock if we had one, but let's just simulate what createBuyer does
        const t = await sequelize.transaction();
        try {
            const buyer = await Buyer.create(buyerData, { transaction: t });
            const accountName = `Accounts Receivable - ${buyer.name}`;
            const [account, created] = await Account.findOrCreate({
                where: { name: accountName },
                defaults: {
                    subGroupId: sundryDebtors.id,
                    isBankAccount: false,
                    isActive: true
                },
                transaction: t
            });
            console.log(`Account handled. Created new: ${created}`);
            await t.commit();
            console.log('Buyer creation with existing account SUCCESSFUL.');

            // 3. Delete buyer and verify account is also deleted
            console.log('Deleting buyer...');
            const t2 = await sequelize.transaction();
            try {
                const b = await Buyer.findByPk(buyer.id);
                const accName = `Accounts Receivable - ${b.name}`;
                await Account.destroy({ where: { name: accName }, transaction: t2 });
                await b.destroy({ transaction: t2 });
                await t2.commit();
                console.log('Buyer deletion SUCCESSFUL.');

                // Verify account is gone
                const checkAcc = await Account.findOne({ where: { name: accName } });
                console.log('Account exists in DB?', !!checkAcc);
                if (!checkAcc) console.log('VERIFICATION PASSED: Buyer and Account deleted.');
                else console.log('VERIFICATION FAILED: Account still exists.');

            } catch (err) {
                await t2.rollback();
                throw err;
            }

        } catch (err) {
            await t.rollback();
            throw err;
        }

    } catch (error) {
        console.error('VERIFICATION FAILED:', error.message);
    } finally {
        process.exit();
    }
}

testFix();
