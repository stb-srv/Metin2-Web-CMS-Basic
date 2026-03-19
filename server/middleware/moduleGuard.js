const repository = require('../modules/cms/repository');

/**
 * Module Guard Middleware
 * Blocks access to routes if the corresponding module is disabled.
 * @param {string} moduleKey - The key of the module (e.g. 'vouchers', 'events')
 */
const moduleGuard = (moduleKey) => {
    return async (req, res, next) => {
        try {
            const settings = await repository.getSettings();
            const isEnabled = settings[`module_${moduleKey}`] !== 'false'; // Default to true if missing

            if (!isEnabled) {
                return res.status(403).json({ 
                    success: false, 
                    message: `Das Modul '${moduleKey}' ist aktuell deaktiviert.` 
                });
            }
            next();
        } catch (err) {
            console.error(`[ModuleGuard] Error checking ${moduleKey}:`, err);
            next(); // Allow on error to avoid breaking things, or return 500? Let's allow for now.
        }
    };
};

module.exports = moduleGuard;
