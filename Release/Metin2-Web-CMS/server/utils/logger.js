const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

const logDir = 'logs';

const fileFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
);

const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...args }) => {
        const extra = Object.keys(args).length ? JSON.stringify(args) : '';
        return `[${timestamp}] ${level}: ${message} ${extra}`;
    })
);

const dailyRotateTransport = new winston.transports.DailyRotateFile({
    filename: path.join(logDir, 'application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    level: 'info',
    format: fileFormat
});

const errorRotateTransport = new winston.transports.DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '30d',
    level: 'error',
    format: fileFormat
});

const winstonLogger = winston.createLogger({
    level: process.env.NODE_ENV === 'debug' ? 'debug' : 'info',
    transports: [
        dailyRotateTransport,
        errorRotateTransport,
        new winston.transports.Console({
            format: consoleFormat
        })
    ]
});

// Wrapper to match existing logger API
const logger = {
    info: (message, meta = {}) => winstonLogger.info(message, meta),
    error: (message, meta = {}) => {
        if (message instanceof Error) {
            winstonLogger.error(message.message, { stack: message.stack, ...meta });
        } else {
            winstonLogger.error(message, meta);
        }
    },
    warn: (message, meta = {}) => winstonLogger.warn(message, meta),
    debug: (message, meta = {}) => winstonLogger.debug(message, meta)
};

module.exports = logger;
