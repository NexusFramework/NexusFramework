/// <reference types="nulllogger" />

import { NexusFramework } from "./src/nexusframework";
import { nexusfork } from "nexusfork/types";
import { nexusframework } from "./types";
import { Application } from "express";
import { Server } from "http";
import _ = require("lodash");

const _export: {
    (config: nexusframework.Config, logger: nulllogger.INullLogger, server: Server, app: Application): nexusfork.WebRequestHandler;
    NexusFramework: typeof NexusFramework
} = function (config: nexusframework.Config, logger: nulllogger.INullLogger, server: Server, app: Application) {
    if (config.prefix) {
        if(config.prefix[0] != "/")
            config.prefix = "/" + config.prefix;
        if(!/\\?\/$/.test(config.prefix))
            config.prefix += "/";
    } else
        config.prefix = "/";
    const instance = new NexusFramework(app, server, logger, config.prefix);
    if (!config.nologging)
        instance.enableLogging();
    if(config.root)
        instance.mount("/", config.pages || "pages", config);
    if(config.skeleton)
        instance.setSkeleton(config.skeleton);
    if(config.legacyskeleton)
        instance.setLegacySkeleton(config.legacyskeleton);
    if(config.pagesysskeleton)
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
        Object.keys(config.errordoc).forEach(function(key) {
            instance.setErrorDocument(key as any, config.errordoc[key]);
        })
    if (config.mounts) {
        if (!Array.isArray(config.mounts))
            config.mounts = [config.mounts];
        config.mounts.forEach(function(mount) {
            instance.mount(mount.webpath, mount.fspath, mount);
        });
    }
    if (config.modules) {
        if (!Array.isArray(config.modules))
            config.modules = [config.modules];
        config.modules.forEach(function(modConfig: string | {module: string, [key: string]: any}) {
            if (_.isString(modConfig))
                require(modConfig)(instance);
            else
                require(modConfig.module)(instance, modConfig);
        });
    }
    return instance.handle.bind(instance);
} as any;
_export.NexusFramework = NexusFramework;
export = _export;