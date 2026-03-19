const repo = require('./repository');
const isSuperAdmin = require('../../middleware/isSuperAdmin');

class AdminController {
    async getPermissions(req, res) {
        try {
            const roles = await repo.getAllRoles();
            const rolePerms = await repo.getPermissions();
            const accounts = await repo.getAccountsWithRoles();

            const response = roles.map(r => ({
                id: r.id,
                name: r.name,
                description: r.description,
                permissions: rolePerms.filter(p => p.role_name === r.name).map(p => p.permission_key)
            }));

            res.json({ success: true, roles: response, accounts });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async saveRolePermissions(req, res) {
        try {
            const { role_id, permissions } = req.body;
            await repo.saveRolePermissions(role_id, permissions);
            res.json({ success: true, message: 'Rollen-Berechtigungen gespeichert.' });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async assignAccountRole(req, res) {
        try {
            const { account_id, role_id } = req.body;
            await repo.assignAccountRole(account_id, role_id);
            res.json({ success: true, message: 'Rolle erfolgreich zugewiesen.' });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async getActivity(req, res) {
        try {
            const activity = await repo.getRecentActivity();
            res.json({ success: true, activity });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async getDashboardStats(req, res) {
        try {
            const stats = await repo.getStats();
            res.json({ success: true, stats });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

module.exports = new AdminController();
