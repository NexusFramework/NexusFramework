"use strict";
/// <reference types="nulllogger" />
const nexusframework_1 = require("./src/nexusframework");
const path = require("path");
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
    if (config.root)
        instance.mount("/", config.pages || "pages", config);
    if (config.skeleton)
        instance.setSkeleton(config.skeleton);
    if (config.legacyskeleton)
        instance.setLegacySkeleton(config.legacyskeleton);
    if (config.pagesysskeleton)
        instance.setPageSystemSkeleton(config.pagesysskeleton);
    if (!config.noio) {
        if (server)
            instance.setupIO();
        else {
            instance.setupPageSystem();
            logger.warn("No server provided, Socket.IO will not be available. If using nexusfork, please upgrade.");
        }
    }
    else
        instance.setupPageSystem();
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
        const resolveModule = function (_path) {
            if (/^\.\//.test(_path))
                return path.resolve(path.dirname(require.main.filename), _path);
            return _path;
        };
        if (!Array.isArray(config.modules))
            config.modules = [config.modules];
        config.modules.forEach(function (modConfig) {
            if (_.isString(modConfig))
                require(resolveModule(modConfig))(instance);
            else
                require(resolveModule(modConfig.module))(instance, modConfig);
        });
    }
    return instance.handle.bind(instance);
};
_export.NexusFramework = nexusframework_1.NexusFramework;
Object.defineProperty(_export, "CompileScripts", {
    configurable: true,
    get: function () {
        const compileScripts = require("./src/compileScripts");
        Object.defineProperty(_export, "CompileScripts", {
            value: compileScripts
        });
        return compileScripts;
    }
});
module.exports = _export;
//# sourceMappingURL=index.js.map