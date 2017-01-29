"use strict";

const logger = require('./logger');
const NestedError = require('nested-error-stacks');


/**
 * Represent the bot which can speak and listen to you
 */
class Alfred {
    /**
     * @public
     *
     * @param {Client}        client
     * @param {PluginManager} pluginManager
     */
    constructor(client, pluginManager) {
        this.logger = logger;
        this.client = client;
        this.pluginManager = pluginManager;
        this.initialized = false;
    }

    /**
     * @public
     *
     * @param {string} textToSpeech
     *
     * @returns {Promise.<null|Error>}
     */
    speak(textToSpeech) {
        if (this.initialized === false) {
            return Promise.reject(new Error('Alfred not initialized'));
        }

        return this.pluginManager.decorateTts(textToSpeech)
            .then(textToSpeech => this.client.speak(textToSpeech))
            .then(() => null)
            .catch(error => {
                const newError = new NestedError('Alfred::speak error', error);
                this.logError(newError);

                return Promise.reject(newError);
            })
        ;
    }

    /**
     * @public
     * Politely wake up Alfred before asking him something.
     *
     * He will wake up each of his leprechauns
     *
     * @returns {Promise.<null|Error>}
     */
    wakeUp() {
        logger.starting('Alfred');
        let haveInvalidPlugins = false;
        return this.pluginManager.init()
            .then(() => this.client.listen())
            .then(() => {
                this.initialized = true;
            })
            .then(() => this.speak('A votre écoute'))
            .then(() => logger.started('Alfred'))
            .then(() => null)
            .catch(error => {
                const newError = new NestedError('Alfred::wakeUp error', error);
                this.logError(newError);

                return Promise.reject(newError);
            })
        ;
    }

    sleep() {
        if (this.initialized === false) {
            return Promise.resolve();
        }

        const updateState = () => {
            this.initialized = false;
        };
        logger.stopping('Alfred');

        return this.speak('A votre service')
            .then(() => this.pluginManager.dispose())
            .then(() => this.client.stopListening())
            .then(updateState)
            .then(() => logger.stopped('Alfred'))
            .catch(error => {
                const newError = new NestedError('Alfred::sleep error', error);

                this.logError(newError);
                updateState();

                return Promise.reject(newError);
            })
        ;
    }

    /**
     * @private
     * @param {Error} error
     *
     * @returns {Error}
     */
    logError(error) {
        this.logger.error(`${error.message}`);
    }
}

module.exports = Alfred;
