module.exports = async function(db, ensureTable) {
    const { s } = db;

    // 1. admin_permissions
    await ensureTable(s('website'), 'admin_permissions', `
        CREATE TABLE ${s('website')}.admin_permissions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            role_name VARCHAR(50) NOT NULL UNIQUE,
            can_manage_shop BOOLEAN DEFAULT 0,
            can_give_gifts BOOLEAN DEFAULT 0,
            can_manage_players BOOLEAN DEFAULT 0,
            can_manage_team BOOLEAN DEFAULT 0,
            can_edit_rules BOOLEAN DEFAULT 0
        );
    `);
    try { await db.query(`ALTER TABLE ${s('website')}.admin_permissions ADD COLUMN can_edit_rules BOOLEAN DEFAULT 0 AFTER can_manage_team`); } catch (e) { }
    try { await db.query(`ALTER TABLE ${s('website')}.admin_permissions ADD COLUMN can_manage_votes BOOLEAN DEFAULT 0;`); } catch (e) { }

    const [permsRows] = await db.query(`SELECT COUNT(*) as count FROM ${s('website')}.admin_permissions`);
    if (permsRows[0].count === 0) {
        await db.query(`
            INSERT INTO ${s('website')}.admin_permissions (role_name, can_manage_shop, can_give_gifts, can_manage_players, can_manage_team, can_edit_rules) 
            VALUES ('IMPLEMENTOR', 1, 1, 1, 1, 1), ('HIGH_WIZARD', 1, 0, 1, 0, 1), ('GOD', 0, 0, 1, 0, 1), ('LOW_WIZARD', 0, 0, 0, 0, 0)
        `);
    }

    // 2. roles (RBAC)
    await ensureTable(s('website'), 'roles', `
        CREATE TABLE ${s('website')}.roles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50) NOT NULL UNIQUE,
            description VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. role_permissions (RBAC)
    await ensureTable(s('website'), 'role_permissions', `
        CREATE TABLE ${s('website')}.role_permissions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            role_id INT NOT NULL,
            permission_key VARCHAR(100) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. account_roles (RBAC)
    await ensureTable(s('website'), 'account_roles', `
        CREATE TABLE ${s('website')}.account_roles (
            account_id INT PRIMARY KEY,
            role_id INT NOT NULL,
            assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // Seeds for RBAC
    const [rolesCheck] = await db.query(`SELECT COUNT(*) as count FROM ${s('website')}.roles`);
    if (rolesCheck[0].count === 0) {
        await db.query(`
            INSERT INTO ${s('website')}.roles (name, description) VALUES 
            ('SuperAdmin', 'Voller Zugriff auf das gesamte System'),
            ('Moderator', 'Kann News und Kommentare verwalten'),
            ('Support', 'Eingeschränkter Zugriff auf Spieler-Daten')
        `);
    }

    // 5. admin_audit_logs
    await ensureTable(s('website'), 'admin_audit_logs', `
        CREATE TABLE ${s('website')}.admin_audit_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            account_id INT NOT NULL,
            admin_username VARCHAR(255) NOT NULL,
            action VARCHAR(100) NOT NULL,
            target_type VARCHAR(50),
            target_id VARCHAR(100),
            details TEXT,
            ip_address VARCHAR(45),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
};
