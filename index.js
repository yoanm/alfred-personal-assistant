"use strict";

const logger = require('./lib/logger');
const server = require('./lib/server');

logger.debug('Starting alfred');

// Start the server
server.start((err) => {

    if (err) {
        throw err;
    }
    logger.info('Server running ', {uri: server.info.uri});
});
