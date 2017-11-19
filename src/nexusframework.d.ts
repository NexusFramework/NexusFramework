/// <reference types="node" />
/// <reference types="nulllogger" />
import { Template } from "nhp/lib/Template";
import { nexusframework } from "../types";
import { Application } from "express";
import express = require("express");
import events = require("events");
import http = require("http");
import nhp = require("nhp");
export declare function createExtendedRequestHandler(): nexusframework.MappedRequestHandler;
export interface StaticMountOptions {
    directoryListing?: boolean;
}
export declare class NexusFramework extends events.EventEmitter {
    readonly nhp: nhp;
    readonly prefix: string;
    readonly app: Application;
    readonly server: http.Server;
    readonly io?: SocketIO.Server;
    readonly logger: nulllogger.INullLogger;
    private cookieParser;
    private stack;
    private root;
    private pagesysskeleton;
    private errordoc;
    private afterbody;
    private footer;
    private header;
    private loaderEnabled;
    private legacyskeleton;
    private skeleton;
    private logging;
    constructor(app?: Application, server?: http.Server, logger?: nulllogger.INullLogger, prefix?: string);
    enableLoader(): void;
    disableLoader(): void;
    enableSignedCookies(secret: any): void;
    installAfterBodyRenderer(renderer: nexusframework.Renderer): void;
    installFooterRenderer(renderer: nexusframework.Renderer): void;
    installHeaderRenderer(renderer: nexusframework.Renderer): void;
    enableLogging(): void;
    /**
     * Set the skeleton to use for legacy browsers.
     * By default NexusFramework displays a Not Supported message.
     *
     * This includes IE below version 10,
     * Chrome below version 4,
     * Firefox below version 3,
     * Safari below version 3.1 and
     * Opera below version 3.5.
     */
    setLegacySkeleton(val: string | Template): void;
    setSkeleton(val: string | Template): void;
    setPageSystemSkeleton(val: string | nexusframework.PageSystemSkeleton): void;
    setErrorDocument(code: number | "*", page?: string): void;
    mountScripts(mpath?: string): void;
    mountAbout(mpath?: string): void;
    dumpRoot(): void;
    setupIO(path?: string): string;
    /**
     * Mount a filesystem path onto a web path.
     *
     * @param wwwpath The web path
     * @param fspath The filesystem path
     * @param lazyAndImmutable When true, changes to the filesystem are not honoured and path scanning is done lazily, defaults to true
     */
    mount(webpath: string, fspath: string, lazyAndImmutable?: boolean, skeleton?: string | Template, pagesysskeleton?: string | nexusframework.PageSystemSkeleton, legacyskeleton?: string | Template): void;
    mountStatic(webpath: string, fspath: string, options?: StaticMountOptions): void;
    setIndex(handler: nexusframework.RequestHandlerEntry): void;
    /**
     * Set a request handler for the specified path.
     * Replaces any existing request handler.
     *
     * @param path The path
     * @param handler The request handler
     */
    setHandlerEntry(path: string, handler: nexusframework.RequestHandlerChildEntry, createIfNotExists?: boolean): void;
    /**
     * Set a request handler for the specified path.
     * Replaces any existing request handler.
     *
     * @param path The path
     * @param handler The request handler
     */
    setHandler(webpath: string, handler: nexusframework.RequestHandler, createIfNotExists?: boolean): void;
    handlerAt(path: string, createIfNotExists?: boolean): nexusframework.RequestHandlerEntry;
    /**
     * Start listening on a specific port.
     */
    listen(port: number, callbackOrHost?: string | Function, callback?: Function): void;
    /**
     * NexusFork compatible handler.
     */
    handle(req: nexusframework.Request, res: nexusframework.Response, next: (err?: Error) => void): void;
    use(middleware: nexusframework.RequestHandler): void;
    /**
     * Express compatible handler
     */
    __express(req: express.Request, res: express.Response, next: express.NextFunction): void;
    /**
     * HTTP compatible handler
     */
    __http(req: http.IncomingMessage, res: http.ServerResponse, next: express.NextFunction): void;
    close(cb?: Function): void;
}
