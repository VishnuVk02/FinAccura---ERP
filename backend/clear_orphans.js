const { Buyer, Account, sequelize } = require('./src/models');
const { Op } = require('sequelize');

async function clearOrphans() {
    console.log('Clearing orphaned Accounts Receivable accounts...');
    try {
        const buyers = await Buyer.findAll();
        const buyerNames = buyers.map(b => b.name);

        const arAccounts = await Account.findAll({
            where: {
                name: { [Op.like]: 'Accounts Receivable - %' }
            }
        });

        let deletedCount = 0;
        for (const acc of arAccounts) {
            const buyerName = acc.name.replace('Accounts Receivable - ', '');
            if (!buyerNames.includes(buyerName)) {
                console.log(`Deleting orphan: ${acc.name}`);
                await acc.destroy();
                deletedCount++;
            }
        }

        console.log(`Successfully deleted ${deletedCount} orphaned accounts.`);

    } catch (error) {
        console.error('Cleanup failed:', error);
    } finally {
        process.exit();
    }
}

clearOrphans();
