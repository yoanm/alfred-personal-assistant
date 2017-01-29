"use strict";

const config = require('config');
const Hapi = require('hapi');
const logger = require('../logger');
const server = new Hapi.Server();

const wrapper = {};
let serverStarted = false;

server.connection({
    host: config.server.host,
    port: config.server.port
});

/**
 * @param {string}   method
 * @param {string}   path
 * @param {callback} handler
 */
const addRoute = (method, path, handler) => {
    server.route({
        method: method,
        path:path,
        handler: function (request, reply) {
            const response = new Promise((resolve, reject) => {
                try {
                    resolve(handler(request));
                } catch (e) {
                    reject(e);
                }
            });

            return reply(response).type('application/json');
        }
    });
};

/**
 * @returns {Promise<null|Error>}
 */
wrapper.start = () => {
    addRoute('GET', '/hello', () => {
        return Promise.resolve('hello world');
    });
    addRoute('GET', '/hello2', () => {
        return Promise.resolve('hello world2');
    });

    logger.starting('Server');

    return server.start()
        .then(() => {
            serverStarted = true;
            logger.started('Server');
            logger.info('Server running ', {uri: server.info.uri});
        })
        .catch(error => {
            logger.error('Stopping server after an error');
            return wrapper.stop()
                .then(() => {
                    throw error;
                })
            ;
        });
};

/**
 * @returns {Promise<null|Error>}
 */
wrapper.stop = () => {
    if (serverStarted === false) {
        return Promise.resolve(null);
    }
    logger.stopping('Server');

    return server.stop()
        .then(() => logger.stopped('Server'))
        .then(() => null)
    ;
};

module.exports = wrapper;
