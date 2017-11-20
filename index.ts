/// <reference types="nulllogger" />

import { NexusFramework } from "./src/nexusframework";
import { nexusfork } from "nexusfork/types";
import { nexusframework } from "./types";
import { Application } from "express";
import { Server } from "http";
import path = require("path");

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
    if(config.root) {
        config.root = path.resolve(process.cwd(), config.root);
        config.pages = path.resolve(config.root, config.pages || "pages");
        config.skeleton = path.resolve(config.root, config.skeleton || "theme/skeleton.nhp");
        config.legacyskeleton = config.legacyskeleton ? path.resolve(config.root, config.legacyskeleton) : undefined;
        config.pagesysskeleton = config.pagesysskeleton ? path.resolve(config.root, config.pagesysskeleton) : undefined;
        instance.setupTemplate(config.root);
        instance.mount("/", config.pages);
    }
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
            instance.mount(mount.webpath, mount.fspath, !mount.mutable, mount.skeleton, mount.legacyskeleton);
        });
    }
    if (config.modules) {
        if (!Array.isArray(config.modules))
            config.modules = [config.modules];
        config.modules.forEach(function(mod) {
            require(mod)(instance);
        });
    }
    return instance.handle.bind(instance);
} as any;
_export.NexusFramework = NexusFramework;
export = _export;