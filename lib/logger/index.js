"use strict";

const winston = require('winston');
const config = require('config');
const path = require('path');
const moment = require('moment');
const Logger = require('./Logger');

const loggerConfig = config.logger;

const format = (options) => {
    return ' [' + options.level.toUpperCase() + ']'
        + '[' + moment(new Date()).format('YYYY-MM-DD HH:mm:ss') + ']'
        + (options.message ? ' ' + options.message : '')
        + (
            options.meta && Object.keys(options.meta).length
                ? ' ' + JSON.stringify(options.meta)
                : ''
        );
};

/**
 * @type {Logger} Default logger for the app. Use console output and a log file
 */
module.exports = new Logger(new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: config.debug === true ? 'debug' : loggerConfig.level,
            name: 'console',
            json: false,
            colorize: true
        }),
        new  winston.transports.File({
            name: 'default',
            level: config.debug === true ? 'debug' : loggerConfig.level,
            filename: path.resolve(loggerConfig.path, './server.log'),
            maxsize: 1024,
            maxFiles: 4,
            json: false,
            formatter: format
        })
    ]
}));
