const repo = require('./repository');
const isSuperAdmin = require('../../middleware/isSuperAdmin');

class AdminController {
    async getPermissions(req, res) {
        try {
            const roles = await repo.getAllRoles();
            const rolePerms = await repo.getPermissions();
            const accounts = await repo.getAccountsWithRoles();
            const adminPermissions = await repo.getAdminPermissions();

            const rolesResponse = roles.map(r => ({
                id: r.id,
                name: r.name,
                description: r.description,
                permissions: rolePerms.filter(p => p.role_name === r.name).map(p => p.permission_key)
            }));

            res.json({ 
                success: true, 
                roles: rolesResponse, 
                accounts, 
                permissions: adminPermissions // For legacy TeamPage compat
            });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }

    async saveTeamPermissions(req, res) {
        try {
            const { role_name, ...perms } = req.body;
            await repo.updateAdminPermission(role_name, perms);
            res.json({ success: true, message: 'Team-Berechtigungen gespeichert.' });
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

    async toggleMaintenance(req, res) {
        try {
            const newState = await repo.toggleMaintenanceMode();
            const cache = require('../../utils/cache');
            cache.invalidate('site_settings'); // Ensure frontend settings cache is invalidated
            
            res.json({ success: true, maintenance_mode: newState, message: newState ? 'Wartungsmodus aktiviert' : 'Wartungsmodus deaktiviert' });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    }
}

module.exports = new AdminController();
