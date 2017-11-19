/// <reference types="nulllogger" />
/// <reference types="node" />
import { NexusFramework } from "./src/nexusframework";
import { nexusfork } from "nexusfork/types";
import { nexusframework } from "./types";
import { Application } from "express";
import { Server } from "http";
declare const _export: {
    (config: nexusframework.Config, logger: nulllogger.INullLogger, server: Server, app: Application): nexusfork.WebRequestHandler;
    NexusFramework: typeof NexusFramework;
};
export = _export;
