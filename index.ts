/// <reference types="nulllogger" />

import compileScripts = require("./src/compileScripts");
import { NexusFramework } from "./src/nexusframework";
import { nexusfork } from "nexusfork/types";
import { Application } from "express";
import { Config } from "./types";
import { Server } from "http";
import path = require("path");
import _ = require("lodash");

const _export: {
    (config: Config, logger: nulllogger.INullLogger, server: Server, app: Application): nexusfork.WebRequestHandler;
    NexusFramework: typeof NexusFramework,
    CompileScripts: typeof compileScripts
} = function (config: Config, logger: nulllogger.INullLogger, server: Server, app: Application) {
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
    if (!config.noapi) {
      const blacklist = config.apiblacklist;
      var apis = Object.keys(NexusFramework.apiencoders);
      if (blacklist)
        apis = apis.filter(function(api) {
          return blacklist.indexOf(api as any) === -1;
        });
      if (apis.length)
        instance.enableAPIs(apis);
    }
    if(config.root)
      instance.mount("/", config.pages || "pages", config);
    if(config.skeleton)
      instance.setSkeleton(config.skeleton);
    if(config.legacyskeleton)
      instance.setLegacySkeleton(config.legacyskeleton);
    if(config.pagesysskeleton)
      instance.setPageSystemSkeleton(config.pagesysskeleton);
    if (!config.noio) {
      if (server) {
        instance.setupIO(config.iopath || ":io", !config.nopagesys && config.iopagesys, config.guestio);
        if (!config.nopagesys && !config.iopagesys)
          instance.setupPageSystem();
      } else if(!config.nopagesys) {
        instance.setupPageSystem();
        logger.warn("No server provided, Socket.IO will not be available. If using nexusfork, please upgrade.");
      }
    } else if(!config.nopagesys)
      instance.setupPageSystem();
    if (!config.noloader)
      instance.enableLoader();
    if (!config.noscripts)
      instance.mountScripts();
    if (!config.noabout)
      instance.mountAbout(":about", config);
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
      const resolveModule = function(_path: string) {
        if (/^\.\//.test(_path))
          return path.resolve(path.dirname(require.main.filename), _path);
        return _path;
      }
      if (!Array.isArray(config.modules))
        config.modules = [config.modules];
      config.modules.forEach(function(modConfig: string | {module: string, [key: string]: any}) {
        if (_.isString(modConfig))
          require(resolveModule(modConfig))(instance);
        else
          require(resolveModule(modConfig.module))(instance, modConfig);
      });
    }
    return instance.handle.bind(instance);
} as any;
_export.NexusFramework = NexusFramework;
Object.defineProperty(_export, "CompileScripts", {
    configurable: true,
    get: function() {
        const compileScripts = require("./src/compileScripts");
        Object.defineProperty(_export, "CompileScripts", {
            value: compileScripts
        });
        return compileScripts;
    }
});
export = _export;
