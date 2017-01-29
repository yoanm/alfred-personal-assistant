"use strict";

if (['dev', 'prod'].indexOf(process.env.NODE_ENV)) {
    console.warn(`Undefined node environment "${process.env.NODE_ENV}", fallback to dev !`);
    process.env.NODE_ENV = 'dev';
}

const logger = require('./lib/logger');
const server = require('./lib/server');
const Alfred = require('./lib/Alfred');
const pkg = require('./package.json');

const appName = pkg.name;

const alfred = new Alfred([]);

logger.starting(appName);

server.start(alfred)
    .then(() => logger.started(appName))
    .catch(error => {
        logger.error(`Exit ${appName} after an error => ${error.stack || error}`);

        process.exit(1);
    });
