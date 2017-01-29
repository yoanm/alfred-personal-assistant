"use strict";

/**
 * @param {Array<callback>} callbackList
 *
 * @returns {Promise<value>} Return a promise resolved even if one or more callbacks have failed.
 *                           Callbacks will be called one by one in the order returned by callbackList.map
 *                           Resolved value is an object containing resolvedList and rejectedList
 *                            - resolvedList will contains successful callback returned value ordered by callback index
 *                            - rejectedList will contains rejected callback error ordered by callback index
 */
module.exports = (callbackList) => {
    const resolvedList = [];
    const rejectedList = [];

    return new Promise(resolve => {
        callbackList.map((callback, index) => {
            try {
                resolvedList[index] = callback();
            } catch (e) {
                rejectedList[index] = e;
            }
        });

        resolve({resolvedList, rejectedList});
    });
};
