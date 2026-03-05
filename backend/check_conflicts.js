const { Buyer, Account, sequelize } = require('./src/models');

async function checkData() {
    try {
        const buyers = await Buyer.findAll();
        const accounts = await Account.findAll();

        console.log('--- BUYERS ---');
        buyers.forEach(b => console.log(`- ${b.name} (ID: ${b.id})`));

        console.log('\n--- ACCOUNTS ---');
        accounts.forEach(a => console.log(`- ${a.name} (ID: ${a.id})`));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        process.exit();
    }
}

checkData();
