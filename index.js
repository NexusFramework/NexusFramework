"use strict";
/// <reference types="nulllogger" />
const nexusframework_1 = require("./src/nexusframework");
const _ = require("lodash");
const _export = function (config, logger, server, app) {
    if (config.prefix) {
        if (config.prefix[0] != "/")
            config.prefix = "/" + config.prefix;
        if (!/\\?\/$/.test(config.prefix))
            config.prefix += "/";
    }
    else
        config.prefix = "/";
    const instance = new nexusframework_1.NexusFramework(app, server, logger, config.prefix);
    if (!config.nologging)
        instance.enableLogging();
    if (config.root) {
        instance.setupTemplate(config.root);
        instance.mount("/", config);
    }
    if (config.skeleton)
        instance.setSkeleton(config.skeleton);
    if (config.legacyskeleton)
        instance.setLegacySkeleton(config.legacyskeleton);
    if (config.pagesysskeleton)
        instance.setPageSystemSkeleton(config.pagesysskeleton);
    if (!config.noio) {
        if (server)
            instance.setupIO();
        else
            logger.warn("No server provided, Socket.IO will not be available. If using nexusfork, please upgrade.");
    }
    if (!config.noloader)
        instance.enableLoader();
    if (!config.noscripts)
        instance.mountScripts();
    if (!config.noabout)
        instance.mountAbout();
    if (config.errordoc)
        Object.keys(config.errordoc).forEach(function (key) {
            instance.setErrorDocument(key, config.errordoc[key]);
        });
    if (config.mounts) {
        if (!Array.isArray(config.mounts))
            config.mounts = [config.mounts];
        config.mounts.forEach(function (mount) {
            instance.mount(mount.webpath, mount.fspath, mount);
        });
    }
    if (config.modules) {
        if (!Array.isArray(config.modules))
            config.modules = [config.modules];
        config.modules.forEach(function (modConfig) {
            if (_.isString(modConfig))
                require(modConfig)(instance);
            else
                require(modConfig.module)(instance, modConfig);
        });
    }
    return instance.handle.bind(instance);
};
_export.NexusFramework = nexusframework_1.NexusFramework;
module.exports = _export;
//# sourceMappingURL=index.js.map