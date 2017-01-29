"use strict";

if (['dev', 'prod'].indexOf(process.env.NODE_ENV)) {
    console.warn(`Undefined node environment "${process.env.NODE_ENV}", fallback to dev !`);
    process.env.NODE_ENV = 'dev';
}

const logger = require('./lib/logger');
const server = require('./lib/server');
const Alfred = require('./lib/Alfred');
const Client = require('./lib/Client');
const PluginManager = require('./lib/PluginManager');
const pkg = require('./package.json');
const NestedError = require('nested-error-stacks');

const appName = pkg.name;

const alfred = new Alfred(
    new Client(),
    new PluginManager([])
);

const cleanAndExit = (exitCode = 0) => {
    let canExit = false;
    const waitAndExit = arg => {

        if (arg instanceof Error) {
            exitCode = 1;
        }

        if (canExit === false) {
            setTimeout(waitAndExit, 1000);
        } else {
            process.exit();
        }
    };

    const stopAlfred = arg => {

        if (arg instanceof Error) {
            exitCode = 1;
        }
        return alfred.sleep()
    };
    const updateCleanState = arg => {
        if (arg instanceof Error) {
            exitCode = 1;
        }
        canExit = true;
    };
    server.stop()
        .then(stopAlfred, stopAlfred)
        .then(updateCleanState, updateCleanState)
};

process.on('SIGINT', cleanAndExit);

logger.starting(appName);
return alfred.wakeUp()
    .then(() => server.start())
    .then(() => logger.started(appName))
    .catch(error => {
        const newError = new NestedError(`Exit ${appName} after an error at initialisation`, error);
        logger.error(error.stack);
        cleanAndExit(1);
    });
