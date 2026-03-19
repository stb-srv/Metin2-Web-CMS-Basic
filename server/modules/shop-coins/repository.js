const db = require('../../config/database');

class ShopCoinRepository {
    // PUBLIC: Get active packages
    async getActivePackages() {
        const { s } = db;
        const [rows] = await db.query(
            `SELECT id, name, dr_amount, price FROM ${s('website')}.shop_coin_packages 
             WHERE is_active = 1 ORDER BY sort_order ASC, dr_amount ASC`
        );
        return rows;
    }

    // PUBLIC: Get current bonus status
    async getActiveBonus() {
        const { s } = db;
        const [rows] = await db.query(
            `SELECT setting_value as percentage, expires_at 
             FROM ${s('website')}.shop_coin_settings 
             WHERE setting_key = 'bonus_percentage'`
        );
        
        if (rows.length === 0) return { percentage: 0, expires_at: null };
        
        const bonus = rows[0];
        // Check expiry if set
        if (bonus.expires_at && new Date(bonus.expires_at) < new Date()) {
            return { percentage: 0, expires_at: null };
        }
        
        return { percentage: parseInt(bonus.percentage) || 0, expires_at: bonus.expires_at };
    }

    // ADMIN: CRUD for Packages
    async getAllPackages() {
        const { s } = db;
        const [rows] = await db.query(`SELECT * FROM ${s('website')}.shop_coin_packages ORDER BY sort_order ASC`);
        return rows;
    }

    async createPackage(data) {
        const { s } = db;
        const { name, dr_amount, price, is_active, sort_order } = data;
        const [result] = await db.query(
            `INSERT INTO ${s('website')}.shop_coin_packages (name, dr_amount, price, is_active, sort_order) VALUES (?, ?, ?, ?, ?)`,
            [name, dr_amount, price, is_active ? 1 : 0, sort_order || 0]
        );
        return result.insertId;
    }

    async updatePackage(id, data) {
        const { s } = db;
        const { name, dr_amount, price, is_active, sort_order } = data;
        const [result] = await db.query(
            `UPDATE ${s('website')}.shop_coin_packages SET name = ?, dr_amount = ?, price = ?, is_active = ?, sort_order = ? WHERE id = ?`,
            [name, dr_amount, price, is_active ? 1 : 0, sort_order || 0, id]
        );
        return result.affectedRows > 0;
    }

    async deletePackage(id) {
        const { s } = db;
        const [result] = await db.query(`DELETE FROM ${s('website')}.shop_coin_packages WHERE id = ?`, [id]);
        return result.affectedRows > 0;
    }

    // ADMIN: Settings Management
    async updateBonus(percentage, expiresAt = null) {
        const { s } = db;
        const [result] = await db.query(
            `UPDATE ${s('website')}.shop_coin_settings 
             SET setting_value = ?, expires_at = ? 
             WHERE setting_key = 'bonus_percentage'`,
            [percentage.toString(), expiresAt]
        );
        return result.affectedRows > 0;
    }

    async getSetting(key) {
        const { s } = db;
        const [rows] = await db.query(
            `SELECT setting_value FROM ${s('website')}.shop_coin_settings WHERE setting_key = ?`,
            [key]
        );
        return rows[0]?.setting_value || null;
    }

    async updateSetting(key, value) {
        const { s } = db;
        const [result] = await db.query(
            `INSERT INTO ${s('website')}.shop_coin_settings (setting_key, setting_value) 
             VALUES (?, ?) 
             ON DUPLICATE KEY UPDATE setting_value = ?`,
            [key, value, value]
        );
        return result.affectedRows > 0;
    }
}

module.exports = new ShopCoinRepository();
