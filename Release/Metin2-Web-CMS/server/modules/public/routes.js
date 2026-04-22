const express = require('express');
const router = express.Router();
const db = require('../../config/database');

// Ranking is now handled by the dedicated ranking module (/api/ranking)

router.get('/downloads', async (req, res) => {
    try {
        const { s } = db;
        const [downloads] = await db.query(`
            SELECT * FROM ${s('website')}.downloads 
            ORDER BY display_order ASC
        `);
        return res.json({ success: true, downloads });
    } catch (error) {
        console.error('Error fetching downloads:', error);
        return res.status(500).json({ success: false, message: 'Interner Serverfehler' });
    }
});

const net = require('net');

async function checkPort(host, port, timeout = 1000) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(timeout);
        socket.once('connect', () => {
            socket.destroy();
            resolve(true);
        });
        socket.once('timeout', () => {
            socket.destroy();
            resolve(false);
        });
        socket.once('error', () => {
            socket.destroy();
            resolve(false);
        });
        socket.connect(port, host);
    });
}

router.get('/status', async (req, res) => {
    try {
        const { s } = db;
        const serverIp = process.env.GAME_HOST || process.env.DB_HOST || '127.0.0.1';
        
        // Pinging Metin2 ports (Configurable with Defaults)
        const portAuth = parseInt(process.env.PORT_AUTH || '11002');
        const portCh1 = parseInt(process.env.PORT_CH1 || '13000');
        
        const authOnline = await checkPort(serverIp, portAuth, 500);
        const ch1Online = await checkPort(serverIp, portCh1, 500);
        
        // Fetch stats if database is available
        let playersOnline = 0;
        let accountsTotal = 0;
        let charactersTotal = 0;
        let guildsTotal = 0;

        try {
            const [accRows] = await db.query(`SELECT COUNT(*) as count FROM ${s('account')}.account`);
            accountsTotal = accRows[0].count;

            const [charRows] = await db.query(`SELECT COUNT(*) as count FROM ${s('player')}.player`);
            charactersTotal = charRows[0].count;

            const [guildRows] = await db.query(`SELECT COUNT(*) as count FROM ${s('player')}.guild`);
            guildsTotal = guildRows[0].count;
            
            // Try to get online players (last 24h active if last_play exists)
            try {
                const [onlineRows] = await db.query(`SELECT COUNT(*) as count FROM ${s('player')}.player WHERE last_play >= NOW() - INTERVAL 1 DAY`);
                playersOnline = onlineRows[0].count;
            } catch(e) { }
            
        } catch (dbErr) {
            console.error('DB Error in status:', dbErr);
        }

        return res.json({ 
            success: true, 
            status: {
                online: authOnline || ch1Online,
                auth: authOnline,
                ch1: ch1Online,
                players_active_24h: playersOnline,
                accounts: accountsTotal,
                characters: charactersTotal,
                guilds: guildsTotal
            }
        });
    } catch (error) {
        console.error('Error fetching server status:', error);
        return res.status(500).json({ success: false, message: 'Interner Serverfehler' });
    }
});

module.exports = router;
