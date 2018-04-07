/// <reference types="nulllogger" />
/// <reference types="node" />
/// <reference types="express" />
import compileScripts = require("./src/compileScripts");
import { NexusFramework } from "./src/nexusframework";
import { nexusfork } from "nexusfork/types";
import { Application } from "express";
import { Config } from "./types";
import { Server } from "http";
declare const _export: {
    (config: Config, logger: nulllogger.INullLogger, server: Server, app: Application): nexusfork.WebRequestHandler;
    NexusFramework: typeof NexusFramework;
    CompileScripts: typeof compileScripts;
};
export = _export;
