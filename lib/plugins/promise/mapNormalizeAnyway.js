"use strict";

const seqAnyway = require('./seqAnyway');
/**
 * @param {*}               initialValue
 * @param {Array<callback>} callbackList Each callback  will receive the result of previous one (or initialValue).
 *
 * @returns {Promise<string>} Return a promise resolved with normalized value
 */
module.exports = (initialValue, callbackList) => {
    let lastResult = initialValue;

    return seqAnyway(
        callbackList.map(callback => {
            return () => {
                lastResult = callback(lastResult);
            };
        })
    )
        .then(() => lastResult);
};
