const winston = require('winston');

const logger = winston.createLogger({
    level: 'info', // Log all messages of level 'info' and above (info, warn, error)
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json() // Log messages in JSON format
    ),
    transports: [
        // Write error logs to a file
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),

        // Write all logs to the console
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(), // Add colors for console output
                winston.format.simple()   // Make console output simple
            ),
        }),
    ],
});

module.exports = logger;
