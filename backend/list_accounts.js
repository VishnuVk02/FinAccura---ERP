const { Account } = require('./src/models');
const check = async () => {
    try {
        const accs = await Account.findAll();
        console.log(JSON.stringify(accs.map(a => a.name), null, 2));
        process.exit();
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};
check();
