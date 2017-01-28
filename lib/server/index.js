"use strict";

const server = new Hapi.Server();
const config = require('config');
const Hapi = require('hapi');

const wrapper = {};

wrapper.init = () => {
    server.connection({
        host: config.server.host,
        port: config.server.port
    });
};

/**
 * @param {string}   method
 * @param {string}   path
 * @param {callback} handler
 */
wrapper.addRoute = (method, path, handler) => {
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
 * @returns {Promise}
 */
wrapper.start = () => {
    return server.start();
};

module.exports = () => {

// Add the route


    server.route({
        method: 'GET',
        path:'/hello2',
        handler: function (request, reply) {

            return reply('hello world2');
        }
    });
};
