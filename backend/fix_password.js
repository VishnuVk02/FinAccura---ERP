const { sequelize, User } = require('./src/models');

async function fixPassword() {
    try {
        const financeUser = await User.findOne({ where: { username: 'finance_manager' } });
        if (financeUser) {
            financeUser.password = 'finance123'; // The beforeSave hook in User model will hash this automatically
            await financeUser.save();
            console.log("Finance manager password updated successfully.");
        }
        process.exit(0);
    } catch (error) {
        console.error("Error updating password:", error);
        process.exit(1);
    }
}
fixPassword();
