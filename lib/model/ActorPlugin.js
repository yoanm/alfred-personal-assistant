"use strict";

const Plugin = require('./Plugin');

/**
 * Represent the leprechaun responsible of doing an action
 */
class ActorPlugin extends Plugin {
    act() {
        throw new Error("ActorPlugin::act() must be overridden !");
    }
}

module.exports = ActorPlugin;
