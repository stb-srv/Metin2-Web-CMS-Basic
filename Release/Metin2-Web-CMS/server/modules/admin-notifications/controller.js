const notifier = require('../../utils/adminNotifier');

class AdminNotificationsController {
    /**
     * Initializes the SSE stream for an admin client
     */
    streamNotifications(req, res) {
        const accountId = req.accountId;
        if (!accountId) {
            return res.status(401).end();
        }

        // Add this request/response to our notifier
        notifier.addClient(req, res, accountId);
    }
}

module.exports = new AdminNotificationsController();
