const { Buyer, Account, sequelize } = require('./src/models');
const { Op } = require('sequelize');

async function checkOrphans() {
    try {
        const arAccounts = await Account.findAll({
            where: {
                name: { [Op.like]: 'Accounts Receivable - %' }
            }
        });

        const buyers = await Buyer.findAll();
        const buyerNames = buyers.map(b => b.name);

        console.log(`Found ${arAccounts.length} AR accounts.`);
        console.log(`Found ${buyers.length} buyers.`);

        arAccounts.forEach(acc => {
            const buyerName = acc.name.replace('Accounts Receivable - ', '');
            if (!buyerNames.includes(buyerName)) {
                console.log(`ORPHANED ACCOUNT: ${acc.name}`);
            }
        });

    } catch (error) {
        console.error(error);
    } finally {
        process.exit();
    }
}

checkOrphans();
