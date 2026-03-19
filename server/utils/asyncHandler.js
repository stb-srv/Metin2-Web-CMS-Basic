const logger = require('./logger');

/**
 * Async Wrapper to handle Promise rejections in Express routes
 * Passes errors automatically to the global error handler (next)
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {
        logger.error(`[Async Error] ${req.method} ${req.originalUrl}`, err);
        next(err);
    });
};

module.exports = asyncHandler;
