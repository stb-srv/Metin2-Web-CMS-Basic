/**
 * Utility for Server-Sent Events (SSE) admin notifications.
 * Manages connected admin clients and broadcasts events in real-time.
 */

class AdminNotifier {
    constructor() {
        // Map of accountId -> response object
        this.clients = new Map();
    }

    /**
     * Registers a new connected admin client
     */
    addClient(req, res, accountId) {
        // Essential SSE headers
        res.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive'
        });

        // Send an initial handshake comment to keep the connection open immediately
        res.write(`: Connected to real-time notifications\n\n`);

        // Handle disconnects
        req.on('close', () => {
            if (this.clients.has(accountId) && this.clients.get(accountId) === res) {
                this.removeClient(accountId);
            }
        });

        this.clients.set(accountId, res);
        console.log(`[AdminNotifier] Client connected. Total admins listening: ${this.clients.size}`);
    }

    /**
     * Removes an admin client
     */
    removeClient(accountId) {
        if (this.clients.has(accountId)) {
            this.clients.delete(accountId);
            console.log(`[AdminNotifier] Client disconnected. Total admins listening: ${this.clients.size}`);
        }
    }

    /**
     * Broadcasts an event to all connected admin clients
     * @param {string} eventName The name of the event (e.g., 'payment_request')
     * @param {Object} data Any JSON data to send
     */
    broadcast(eventName, data) {
        const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;

        this.clients.forEach((res, accountId) => {
            try {
                res.write(payload);
            } catch (err) {
                console.error(`[AdminNotifier] Failed to send to account ${accountId}:`, err);
                this.removeClient(accountId);
            }
        });
    }
}

module.exports = new AdminNotifier();
