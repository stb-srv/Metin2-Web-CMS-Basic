const jwt = require('jsonwebtoken');

module.exports = function isAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const cookieToken = req.cookies?.m2token;

    let token = null;

    if (cookieToken) {
        token = cookieToken;
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.accountId = decoded.id;
            req.username = decoded.username;
            return next();
        } catch (err) {
            return res.status(401).json({ success: false, message: 'Sitzung abgelaufen oder Token ungültig.' });
        }
    }

    res.status(401).json({ success: false, message: 'Nicht eingeloggt. Bitte neu anmelden.' });
};
