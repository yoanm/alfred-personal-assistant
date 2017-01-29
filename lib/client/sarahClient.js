"use strict";

const config = require('config').sarah.client;
const NestedError = require('nested-error-stacks');
const request = require('request-promise-native');

const defaultOptionList = {
    uri: `${config.scheme}://${config.host}:${config.port}`,
    headers: {'User-Agent': 'Alfred-server'},
    qs: {}, // <-- to override before call
    json: true,
    simple: true,
    resolveWithFullResponse: true
};

/**
 * @param {Object} attributeList
 * @param {string} httpMethod
 *
 * @returns {Promise<null|Error>}
 */
module.exports = (attributeList, httpMethod = 'GET') => {
    // Append queryString to default options
    const optionList = Object.assign(
        defaultOptionList,
        {
            method: httpMethod,
            qs: attributeList
        });

    return request(optionList)
        .then(data => {
            console.log(`data ${JSON.stringify(data)}`);
        })
        .catch(error => {
            return Promise.reject(new NestedError('sarahClient error', error));
        });
};
