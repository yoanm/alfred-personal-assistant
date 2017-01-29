"use strict";

const sarahClient = require('./client/sarahClient');
const pMapNormalizeAnyway = require('./plugins/promise/mapNormalizeAnyway');
const pAllAnyway = require('./plugins/promise/allAnyway');
const logger = require('./logger');
const DecoratorPlugin = require('./model/DecoratorPlugin');
const NestedError = require('nested-error-stacks');
const ActorPlugin = require('./model/ActorPlugin');


/**
 * Allow plugins management
 */
class PluginManager {
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
        this.initialized = false;
    }

    /**
     * @public
     *
     * @param {Promise<string|Error>} textToSpeech
     */
    decorateTts(textToSpeech) {
        if (this.initialized === false) {
            return Promise.reject(new Error('PluginManager not initialized'));
        }

        return pMapNormalizeAnyway(
            textToSpeech,
            this.decoratorList
                // Return a callback that accept the value to normalize
                .map(decorator => decorator.normalizeTts)
        )
    }

    /**
     * @public
     *
     * @return {Promise<null|Error>}
     */
    init() {
        return pAllAnyway(
            this.pluginList.map(plugin => plugin.dispose(this))
        )
            .then(({resolvedList, rejectedList}) => {
                if (rejectedList.length > 0) {
                    this.logger.warning('Some plugin are rejected : ');
                    resolvedList
                        .forEach((error, pluginKey) => {
                            const plugin = this.pluginList[pluginKey];
                            this.logger.warning(`${plugin.getName()} : ${error}`);
                        })
                }

                return this.cleanPluginList(resolvedList.length ? resolvedList.keys() : []);
            })
            .then(() => this.splitPluginListByRole())
            .then(() => {this.initialized = true;})
            .then(() => null)
        ;
    }

    /**
     * @public
     *
     * @returns {Promise.<null|Error>}
     */
    dispose() {
        if (this.initialized === false) {
            return Promise.resolve(null);
        }

        return pAllAnyway(this.pluginList.map(plugin => plugin.dispose(this)))
            .then(() => null);
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
}

module.exports = PluginManager;
