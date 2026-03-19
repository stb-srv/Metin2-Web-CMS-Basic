const db = require('../../config/database');

class ShopPaymentRepository {
    async createPayment(data) {
        const { s } = db;
        const { account_id, package_id, method, amount, coins, details } = data;
        const [result] = await db.query(
            `INSERT INTO ${s('website')}.shop_payments 
            (account_id, package_id, method, amount, coins, details, status) 
            VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
            [account_id, package_id, method, amount, coins, details]
        );
        return result.insertId;
    }

    async getPlayerPayments(accountId) {
        const { s } = db;
        const [rows] = await db.query(
            `SELECT p.*, pkg.name as package_name 
             FROM ${s('website')}.shop_payments p
             LEFT JOIN ${s('website')}.shop_coin_packages pkg ON p.package_id = pkg.id
             WHERE p.account_id = ? 
             ORDER BY p.created_at DESC`,
            [accountId]
        );
        return rows;
    }

    async getAllPayments() {
        const { s } = db;
        const [rows] = await db.query(
            `SELECT p.*, a.login as username, pkg.name as package_name 
             FROM ${s('website')}.shop_payments p
             JOIN ${s('account')}.account a ON p.account_id = a.id
             LEFT JOIN ${s('website')}.shop_coin_packages pkg ON p.package_id = pkg.id
             ORDER BY p.status = 'pending' DESC, p.created_at DESC`
        );
        return rows;
    }

    async getPaymentById(id) {
        const { s } = db;
        const [rows] = await db.query(
            `SELECT * FROM ${s('website')}.shop_payments WHERE id = ?`,
            [id]
        );
        return rows[0];
    }

    async updateStatus(id, status) {
        const { s } = db;
        const [result] = await db.query(
            `UPDATE ${s('website')}.shop_payments SET status = ? WHERE id = ?`,
            [status, id]
        );
        return result.affectedRows > 0;
    }

    async grantCoins(accountId, amount) {
        const { s } = db;
        // Use the configured column names from .env if available, otherwise default
        const column = process.env.DB_COLUMN_DR || 'coins';
        const [result] = await db.query(
            `UPDATE ${s('account')}.account SET ${column} = ${column} + ? WHERE id = ?`,
            [amount, accountId]
        );
        return result.affectedRows > 0;
    }
}

module.exports = new ShopPaymentRepository();
