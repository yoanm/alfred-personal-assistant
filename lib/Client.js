"use strict";

const sarahClient = require('./client/sarahClient');
const logger = require('./logger');

/**
 * Allow call to S.A.R.A.H. client
 */
class Client {
    /**
     * @public
     */
    constructor() {
        this.logger = logger;
    }

    /**
     * @public
     *
     * @param {string} textToSpeech
     *
     * @returns {Promise<null|Error>}
     */
    speak(textToSpeech) {
        if (!textToSpeech) {
            return Promise.resolve();
        }

        this.logger.debug(`Alfred will say "${textToSpeech}"`);

        return sarahClient({
            tts: textToSpeech,
            sync: true
        })
            .then(() => null)
        ;
    }

    /**
     * @public
     *
     * @returns {Promise<null|Error>}
     */
    listen() {
        return sarahClient({'listen': true})
            .then(() => null);
    }

    /**
     * @public
     *
     * @returns {Promise<null|Error>}
     */
    stopListening() {
        return sarahClient({'listen': false})
            .then(() => null);
    }
}

module.exports = Client;
