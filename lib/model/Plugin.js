"use strict";

const Loggger = require('../logger/SpeakerLogger');

/**
 * Represent the leprechaun with it's name
 */
class Plugin {

    /**
     * @param {string} name
     */
    constructor(name) {
        this.name = name;
        this.logger = new Loggger(name);
    }

    /**
     * @public
     * @returns {string}
     */
    getName() {
        return this.name;
    }

    /**
     * @public
     * When Alfred wakes up, he awakens all these leprechauns
     *
     * @param {Alfred} alfred
     *
     * @return {Promise}
     */
    init(alfred) {
        this.logger.info('Woken up');

        return Promise.resolve();
    }
}

module.exports = Plugin;
