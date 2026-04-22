const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const logger = require('./logger');

class ModuleManager extends EventEmitter {
    constructor() {
        super();
        this.modules = new Map();
        this.moduleDir = path.join(__dirname, '../modules');
    }

    /**
     * Load all modules from the modules directory
     * @param {import('express').Application} app 
     */
    async loadModules(app) {
        logger.info('[ModuleManager] Starting module discovery...');
        
        try {
            const entries = fs.readdirSync(this.moduleDir, { withFileTypes: true });
            
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    await this.loadModule(app, entry.name);
                }
            }
            
            logger.info(`[ModuleManager] Discovery complete. Loaded ${this.modules.size} modules.`);
            this.emit('modulesLoaded', Array.from(this.modules.keys()));
        } catch (err) {
            logger.error('[ModuleManager] Error during module discovery:', err);
            throw err;
        }
    }

    /**
     * Load a single module by name
     */
    async loadModule(app, moduleName) {
        const modulePath = path.join(this.moduleDir, moduleName);
        const manifestPath = path.join(modulePath, 'module.json');
        
        if (!fs.existsSync(manifestPath)) {
            // logger.warn(`[ModuleManager] Module "${moduleName}" has no module.json. Skipping...`);
            return;
        }

        try {
            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
            
            if (manifest.active === false) {
                logger.info(`[ModuleManager] Module "${moduleName}" is disabled. skipping.`);
                return;
            }

            // Load routes if they exist
            const routesPath = path.join(modulePath, 'routes.js');
            if (fs.existsSync(routesPath)) {
                const router = require(routesPath);
                const prefix = manifest.prefix || `/api/${moduleName}`;
                app.use(prefix, router);
                logger.debug(`[ModuleManager] Mounted routes for "${moduleName}" at ${prefix}`);
            }

            this.modules.set(moduleName, manifest);
            logger.info(`[ModuleManager] Loaded module: ${moduleName} (v${manifest.version || '1.0.0'})`);
            
        } catch (err) {
            logger.error(`[ModuleManager] Failed to load module "${moduleName}":`, err);
        }
    }

    /**
     * Get a loaded module's manifest
     */
    getModule(name) {
        return this.modules.get(name);
    }

    /**
     * Check if a module is loaded
     */
    hasModule(name) {
        return this.modules.has(name);
    }

    /**
     * Hook system: execute a hook and return the results
     */
    async callHook(hookName, context = {}) {
        logger.debug(`[ModuleManager] Calling hook: ${hookName}`);
        // This is a placeholder for a more advanced hook system
        // For now, it just emits an event that modules could technically listen to
        this.emit(`hook:${hookName}`, context);
        return context;
    }
}

module.exports = new ModuleManager();
