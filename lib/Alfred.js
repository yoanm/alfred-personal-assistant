"use strict";

const sarahClient = require('./client/sarahClient');
const pMapNormalizeAnyway = require('./plugins/promise/mapNormalizeAnyway');
const pAllAnyway = require('./plugins/promise/allAnyway');
const logger = require('./logger');
const DecoratorPlugin = require('./model/DecoratorPlugin');
const NestedError = require('nested-error-stacks');
const ActorPlugin = require('./model/ActorPlugin');


/**
 * Represent the bot which can speak and listen to you
 */
class Alfred {
    /**
     * @public
     *
     * @param {string} textToSpeech
     *
     * @returns {Promise<null|Error>}
     */
    speak(textToSpeech) {

        return this.decorateTts(textToSpeech)
            .then(textToSpeech => {
                if (!textToSpeech) {
                    return Promise.resolve();
                }

                this.logger.debug(`Alfred will say "${textToSpeech}"`);

                return sarahClient({
                    tts: textToSpeech,
                    sync: true
                })
                    .then(() => null)
                    .catch(error => {
                        const newError = new NestedError('Alfred::speak error', error);
                        this.logError(newError);

                        return Promise.reject(newError);
                    });
            })
        ;
    }

    /**
     * @public
     *
     * @returns {Promise<null|Error>}
     */
    listen() {
        return sarahClient({'listen': true})
            .catch(error => {
                const newError = new NestedError('Alfred::listen error', error);
                this.logError(newError);

                const throwError = () => {
                    return Promise.reject(newError);
                };

                const tts = 'Impossible de vous écouter';
                return this.speak(tts)
                    .catch(error => {
                        logger.warning(`skip previous speak("${tts}") error !`);

                        return throwError();
                    })
                    .then(throwError);
            })
        ;
    }

    /**
     * @public
     *
     * @returns {Promise<null|Error>}
     */
    stopListening() {
        return sarahClient({'listen': false})
            .catch(error => {
                const newError = new NestedError('Alfred::stopListening error', error);
                this.logError(newError);

                const throwError = () => {
                    return Promise.reject(newError);
                };
                const tts = 'je n\'arrive pas à ne rien faire ! J\'ai besoin de votre aide !';

                return this.speak(tts)
                    .catch(error => {
                        logger.warning(`skip previous speak("${tts}") error !`);

                        return throwError();
                    })
                    .then(throwError);
            })
            .then(() => this.speak('A votre service !'))
        ;
    }

    /**
     * @public
     * Politely wake up Alfred before asking him something.
     *
     * He will wake up each of his leprechauns
     *
     * @return {Promise}
     */
    init() {
        let haveInvalidPlugins = false;
        return pAllAnyway(
            this.pluginList.map(plugin => plugin.init(this))
        )
            .then(({resolvedList, rejectedList}) => {
                haveInvalidPlugins = rejectedList.length > 0;

                return this.cleanPluginList(resolvedList.length ? resolvedList.keys() : []);
            })
            .then(() => this.splitPluginListByRole())
            .then(() => {this.initialized = true;})
            .then(() => {
                if (haveInvalidPlugins) {
                    return this.speak('Certain lutins semble malades. Ils sont au repos pour le moment.');
                }
            })
            .then(() => this.listen())
            .then(() => this.speak('A votre écoute'))
        ;
    }

    /**
     * @public
     *
     * @param {Plugin[]} pluginList
     */
    constructor(pluginList = []) {
        this.logger = logger;
        /** @type {Plugin[]} */
        this.pluginList = pluginList;
        /** @type {DecoratorPlugin[]} */
        this.decoratorList = [];
        /** @type {ActorPlugin[]} */
        this.actorList = [];
        /** @type {Plugin[]} */
        this.invalidPluginList = [];
    }

    /**
     * @private
     *
     * @param {Promise<string>} textToSpeech
     */
    decorateTts(textToSpeech) {
        return pMapNormalizeAnyway(
            textToSpeech,
            this.decoratorList
                // Return a callback that accept the value to normalize
                .map(decorator => decorator.normalizeTts)
        )
    }

    /**
     * @private
     *
     * @return {Promise<undefined|Error>}
     */
    cleanPluginList(validPluginIdList) {
        // Override plugins list with only valid ones
        const backupPluginList = this.pluginList;
        this.pluginList = [];

        return new Promise((resolve, reject) => {
            try {
                this.pluginList = validPluginIdList.map(index => {
                    return backupPluginList[index];
                });
                resolve();
            } catch (e) {
                reject(new NestedError('Error during plugins validity split', error));
            }
        });
    }

    /**
     * @private
     *
     * @return {Promise<undefined|Error>}
     */
    splitPluginListByRole() {
        return Promise.all([
            () => {
                this.decoratorList = this.pluginList
                    .map(plugin => plugin instanceof DecoratorPlugin);
            },
            () => {
                this.actorList = this.pluginList
                    .map(plugin => plugin instanceof ActorPlugin);
            }
        ])
            .catch(error => Promise.reject(new NestedError('Error during plugins roles split', error)));
    }

    /**
     * @private
     * @param {Error} error
     *
     * @returns {Error}
     */
    logError(error) {
        this.logger.error(`Alfred error => ${error.message}`);

        return error;
    }
}

module.exports = Alfred;
