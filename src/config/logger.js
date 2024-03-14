import winston from 'winston';
import config from './config.js';

const customLevelsOptions = {
    levels: {
        debug: 5,
        http: 4,
        info: 3,
        warn: 2,
        error: 1,
        fatal: 0,
    },
    colors: {
        debug: 'white',
        http: 'blue',
        info: 'green',
        warn: 'yellow',
        error: 'red',
        fatal: 'magenta',
    }
};

const loggerDev = winston.createLogger({
    levels: customLevelsOptions.levels,
    format: winston.format.combine(
        winston.format.colorize({ colors: customLevelsOptions.colors }),
        winston.format.simple()
    ),
    transports: [
        new winston.transports.Console({ level: 'debug' }),
    ],
});

const loggerProd = winston.createLogger({
    levels: customLevelsOptions.levels,
    format: winston.format.combine(
        winston.format.simple()
    ),
    transports: [
        new winston.transports.Console({ level: 'info' }),
        new winston.transports.File({ filename: 'errors.log', level: 'error' }), 
    ],
});

export const logger = config.ENV === 'production' ? loggerProd : loggerDev;

export const addLogger = (req, res, next) => {
    req.logger = logger;
    next();
};