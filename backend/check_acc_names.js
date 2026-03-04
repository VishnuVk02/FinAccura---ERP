const { Account } = require('./src/models');
const check = async () => {
    try {
        const accs = await Account.findAll();
        accs.forEach(a => console.log(a.name));
        process.exit();
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};
check();
