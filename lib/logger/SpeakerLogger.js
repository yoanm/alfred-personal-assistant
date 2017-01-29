"use strict";

const winston = require('winston');
const WinstonLogger = winston.Logger;
const ConsoleTransport = winston.transports.Console;
const Logger = require('./Logger');

const globalLogger = new WinstonLogger({
    transports: [
        new ConsoleTransport({
            level: 'debug',
            colorize: true,
            json: false
        })
    ]
});

/**
 * Logger for a speaking stuff
 */
class SpeakerLogger extends Logger {
    constructor(name) {
        super(globalLogger);

        this.name = name;
    }

    normalizeMessage(message, meta) {
        return `${this.name} says "${message}"`;
    }
}

module.exports = SpeakerLogger;
