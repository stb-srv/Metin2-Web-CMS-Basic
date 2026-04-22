const rateLimit = require('express-rate-limit');

// Simple limiter for general API usage
const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // limit each IP to 100 requests per minute
    message: { success: false, message: 'Zu viele Anfragen. Bitte versuche es später erneut.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter limiter for sensitive auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 attempts per 15 minutes
    message: { success: false, message: 'Zu viele Versuche. Bitte warte 15 Minuten, bevor du es erneut versuchst.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // max 5 registrations per IP per hour
    message: { success: false, message: 'Zu viele Registrierungsversuche. Bitte warte eine Stunde.' },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { apiLimiter, authLimiter, registerLimiter };
