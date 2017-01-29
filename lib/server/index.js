"use strict";

const config = require('config');
const Hapi = require('hapi');
const logger = require('../logger');
const server = new Hapi.Server();

const wrapper = {};

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
 * @params {Alfred} alfred
 * @returns {Promise}
 */
wrapper.start = (alfred) => {
    addRoute('GET', '/hello', () => {
        return Promise.resolve('hello world');
    });
    addRoute('GET', '/hello2', () => {
        return Promise.resolve('hello world2');
    });

    logger.starting('Alfred');
    return alfred.init()
        .then(() => logger.started('Alfred'))
        .then(() => {
            logger.starting('Server');
            return server.start()
                .then(() => {
                    logger.info('Server running ', {uri: server.info.uri});
                    logger.started('Server');
                })
            ;
        })
        .catch(error => {
            logger.error('Stopping server after an error');
            return server.stop()
                .then(() => {
                    throw error;
                })
            ;
        });
};

module.exports = wrapper;
