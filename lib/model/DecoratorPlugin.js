"use strict";

const Plugin = require('./Plugin');

/**
 * Represent a leprechaun responsible of formatting sentences
 */
class DecoratorPlugin extends Plugin {
    decorate(tts) {
        throw new Error("DecoratorPlugin::decorate() must be overridden !");
    }
}

module.exports = DecoratorPlugin;
