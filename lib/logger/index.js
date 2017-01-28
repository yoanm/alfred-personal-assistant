"use strict";

const winston = require('winston');
const config = require('config');
const path = require('path');
const Logger = winston.Logger;
const FileTransport = winston.transports.File;
const ConsoleTransport = winston.transports.Console;

const defaultTransportConfig = {};
const loggerConfig = {
    transports: []
};
if (config.debug === true) {

    loggerConfig.transports.push(
        new ConsoleTransport({
            handleExceptions: true,
            humanReadableUnhandledException: true
        })
    );
} else {
    loggerConfig.transports.push(new FileTransport({
        filename: path.resolve(config.logger.path, './server.log')
    }));
    loggerConfig.transports.push(new FileTransport({
        filename: path.resolve(config.logger.path, './exception.log'),
        handleExceptions: true,
        humanReadableUnhandledException: true
    }));
}



if (config.debug === true) {
    loggerConfig.transports.push(new ConsoleTransport(defaultTransportConfig));
}

const logger = new Logger(loggerConfig);

const wrapper = {};

/**
 * @param {string} message
 * @param {Object} meta
 */
wrapper.debug = (message, meta = {}) => {
    logger.debug(message, {}, meta);
};

/**
 * @param {string} message
 * @param {Object} meta
 */
wrapper.info = (message, meta = {}) => {
    logger.info(message, {}, meta);
};

/**
 * @param {string} message
 * @param {Object} meta
 */
wrapper.warning = (message, meta = {}) => {
    logger.warning(message, {}, meta);
};

/**
 * @param {string} message
 * @param {Object} meta
 */
wrapper.error = (message, meta = {}) => {
    logger.error(message, {}, meta);
};


module.exports = wrapper;
