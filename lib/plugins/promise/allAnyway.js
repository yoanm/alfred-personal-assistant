"use strict";

/**
 * @param {Array<callback>} callbackList
 *
 * @returns {Promise<Object>} Return a promise resolved even if one or more callbacks have failed
 *                            Resolved value is an object containing resolvedList and rejectedList
 *                            - resolvedList will contains successful callback returned value ordered by callback index
 *                            - rejectedList will contains rejected callback error ordered by callback index
 */
module.exports = (callbackList) => {
    const final = {
        resolvedList: [],
        rejectedList: []
    };

    if (callbackList.length === 0) {
        return Promise.resolve(final);
    }

    const mapCallback = (callback, index) => {
        return new Promise(resolve => {
            try {
                final.resolvedList[index] = callback();
                resolve();
            } catch (e) {
                final.rejectedList[index] = e;
                resolve();
            }
        });
    };

    return Promise.all(callbackList.map(mapCallback))
        .then(() => final);
};
