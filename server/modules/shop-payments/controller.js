const repo = require('./repository');
const coinRepo = require('../shop-coins/repository');
const notifier = require('../../utils/adminNotifier');

class ShopPaymentController {
    // USER: Submit a payment
    async submitPayment(req, res) {
        try {
            const { packageId, method, details } = req.body;
            const accountId = req.accountId;

            if (!accountId) {
                return res.status(401).json({ success: false, message: 'Nicht eingeloggt.' });
            }

            if (!packageId || !method || !details) {
                return res.status(400).json({ success: false, message: 'Unvollständige Daten.' });
            }

            // Verify package exists and get coins & price
            const packages = await coinRepo.getAllPackages();
            const pkg = packages.find(p => p.id === parseInt(packageId));
            
            if (!pkg) {
                return res.status(404).json({ success: false, message: 'Paket nicht gefunden.' });
            }

            // Calculate total coins (including bonus)
            const bonus = await coinRepo.getActiveBonus();
            const bonusAmount = Math.floor(pkg.dr_amount * (bonus.percentage / 100));
            const totalCoins = pkg.dr_amount + bonusAmount;

            const paymentId = await repo.createPayment({
                account_id: accountId,
                package_id: packageId,
                method,
                amount: pkg.price,
                coins: totalCoins,
                details
            });

            // Notify admins in real-time
            notifier.broadcast('payment_request', {
                paymentId,
                method,
                amount: pkg.price,
                coins: totalCoins,
                username: req.username || 'Benutzer'
            });

            res.json({ 
                success: true, 
                message: 'Zahlungsanfrage erfolgreich gesendet. Ein Administrator wird diese in Kürze prüfen.',
                paymentId 
            });

        } catch (err) {
            console.error('[ShopPayments] Error submitting payment:', err);
            res.status(500).json({ success: false, message: 'Interner Serverfehler' });
        }
    }

    // USER: Get own payment history
    async getOwnPayments(req, res) {
        try {
            const accountId = req.accountId;
            const payments = await repo.getPlayerPayments(accountId);
            res.json({ success: true, payments });
        } catch (err) {
            console.error('[ShopPayments] Error fetching own payments:', err);
            res.status(500).json({ success: false, message: 'Interner Serverfehler' });
        }
    }

    // ADMIN: Get all payments
    async getAllPayments(req, res) {
        try {
            const payments = await repo.getAllPayments();
            res.json({ success: true, payments });
        } catch (err) {
            console.error('[ShopPayments] Error fetching all payments:', err);
            res.status(500).json({ success: false, message: 'Interner Serverfehler' });
        }
    }

    // ADMIN: Approve payment
    async approvePayment(req, res) {
        try {
            const { id } = req.params;
            const result = await repo.approvePaymentTransaction(id);

            if (!result.success && result.code === 'NOT_FOUND') {
                return res.status(404).json({ success: false, message: 'Zahlung nicht gefunden.' });
            }
            if (!result.success && result.code === 'ALREADY_PROCESSED') {
                return res.status(400).json({ success: false, message: 'Zahlung wurde bereits bearbeitet.' });
            }

            res.json({ success: true, message: 'Zahlung genehmigt und Coins gutgeschrieben.' });
        } catch (err) {
            console.error('[ShopPayments] Error approving payment:', err);
            res.status(500).json({ success: false, message: 'Interner Serverfehler' });
        }
    }

    // ADMIN: Decline payment
    async declinePayment(req, res) {
        try {
            const { id } = req.params;
            const payment = await repo.getPaymentById(id);

            if (!payment) {
                return res.status(404).json({ success: false, message: 'Zahlung nicht gefunden.' });
            }

            if (payment.status !== 'pending') {
                return res.status(400).json({ success: false, message: 'Zahlung wurde bereits bearbeitet.' });
            }

            await repo.updateStatus(id, 'declined');
            res.json({ success: true, message: 'Zahlung abgelehnt.' });

        } catch (err) {
            console.error('[ShopPayments] Error declining payment:', err);
            res.status(500).json({ success: false, message: 'Interner Serverfehler' });
        }
    }
}

module.exports = new ShopPaymentController();
