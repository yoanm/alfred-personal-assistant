"use strict";

const wrapWinston = (winstonLogger, level, message, meta) => {
    const argList = [];

    argList.push(message);
    if (meta = {}) {
        argList.push(meta);
    }
    winstonLogger[level].apply(winstonLogger, argList);
};

class Logger {
    /**
     *
     * @param {winston.Logger} logger
     */
    constructor(logger) {
        this.logger = logger;
    }

    starting(taskName) {
        this.info(`Starting ${taskName} ...`);
    }

    stopping(taskName) {
        this.info(`Stopping ${taskName} ...`);
    }

    started(taskName) {
        this.info(`${taskName} started`);
    }

    stopped(taskName) {
        this.info(`Stopped ${taskName} ...`);
    }

    /**
     * @public
     *
     * @param {string} message
     * @param {Object} meta
     */
    debug(message, meta = {}) {
        this.log('debug', message, meta);
    };

    /**
     * @public
     *
     * @param {string} message
     * @param {Object} meta
     */
    info(message, meta = {}) {
        this.log('info', message, meta);
    };

    /**
     * @public
     *
     * @param {string} message
     * @param {Object} meta
     */
    warning(message, meta = {}) {
        this.log('warn', message, meta);
    };

    /**
     * @public
     *
     * @param {string} message
     * @param {Object} meta
     */
    error(message, meta = {}) {
        this.log('error', message, meta);
    };

    /**
     * @protected
     * Could be overridden by child class
     *
     * @param {string} message
     * @param {Object} meta
     *
     * @returns {string}
     */
    normalizeMessage(message, meta = {}) {
        return message;
    }

    /**
     * @protected
     *
     * @param {string} level
     * @param {string} message
     * @param {Object} meta
     */
    log(level, message, meta = {}) {
        return wrapWinston(
            this.logger,
            level,
            this.normalizeMessage(message, meta),
            meta
        );
    }
}


module.exports = Logger;
