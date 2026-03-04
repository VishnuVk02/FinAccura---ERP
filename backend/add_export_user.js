const { User, Role } = require('./src/models');
const bcrypt = require('bcryptjs');

async function addExportManager() {
    try {
        console.log("Setting up export_manager user account...");

        let exportRole = await Role.findOne({ where: { name: 'EXPORT_MANAGER' } });
        if (!exportRole) {
            exportRole = await Role.create({ name: 'EXPORT_MANAGER' });
            console.log("Created missing EXPORT_MANAGER role.");
        }

        const existingEM = await User.findOne({ where: { username: 'export_manager' } });
        if (!existingEM) {
            await User.create({
                username: 'export_manager',
                email: 'export_manager@erp.com',
                password: 'export123', // hooks will auto hash
                roleId: exportRole.id
            });
            console.log("Created export_manager account successfully.");
        } else {
            console.log("export_manager already exists.");
        }

        console.log("\n--- USERS ---");
        const users = await User.findAll({ include: Role });
        console.table(users.map(u => ({ id: u.id, username: u.username, role: u.Role?.name })));

        process.exit(0);
    } catch (e) {
        console.error("Error creating export manager:", e);
        process.exit(1);
    }
}
addExportManager();
