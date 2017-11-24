/// <reference types="node" />
/// <reference types="nulllogger" />
import { Template } from "nhp/lib/Template";
import { nexusframework } from "../types";
import { Application } from "express";
import express = require("express");
import events = require("events");
import http = require("http");
import nhp = require("nhp");
export declare class LeafRequestHandler implements nexusframework.RequestHandlerEntry {
    leaf: boolean;
    handle: nexusframework.RequestHandler;
    constructor(handler: nexusframework.RequestHandler, actuallyLeaf?: boolean);
    children(): nexusframework.RequestHandlerChildEntry[];
    childPaths(): any;
    childAt(path: string, createIfNotExists?: boolean): nexusframework.RequestHandlerChildEntry;
    setChild(path: string, handler: nexusframework.RequestHandlerChildEntry, createIfNotExists?: boolean): void;
    view(type?: string): string;
    setView(filename: string, type?: string): void;
    index(): nexusframework.RequestHandlerEntry;
    setIndex(index: nexusframework.RequestHandlerEntry): void;
    routeHandler(): nexusframework.RouteRequestHandler;
    accessHandler(): nexusframework.AccessRequestHandler;
    existsHandler(): nexusframework.ExistsRequestHandler;
    setRouteHandler(index: nexusframework.RouteRequestHandler): void;
    setAccessHandler(index: nexusframework.AccessRequestHandler): void;
    setExistsHandler(index: nexusframework.ExistsRequestHandler): void;
    destroy(): void;
}
export declare class NHPRequestHandler extends LeafRequestHandler {
    private impl;
    private views;
    private exists;
    private access;
    constructor(impl: nexusframework.RequestHandler, redirect?: boolean);
    view(type?: string): string;
    setView(filename: string, type?: string): void;
    accessHandler(): nexusframework.AccessRequestHandler;
    existsHandler(): nexusframework.ExistsRequestHandler;
    setAccessHandler(index: nexusframework.AccessRequestHandler): void;
    setExistsHandler(index: nexusframework.ExistsRequestHandler): void;
}
export declare function createExtendedRequestHandler(): nexusframework.MappedRequestHandler;
export declare class NexusFramework extends events.EventEmitter {
    readonly nhp: nhp;
    readonly prefix: string;
    readonly app: Application;
    readonly server: http.Server;
    readonly io?: SocketIO.Server;
    readonly logger: nulllogger.INullLogger;
    private cookieParser;
    private stack;
    private default;
    private mounts;
    private renderoptions;
    private afterbody;
    private footer;
    private header;
    private loaderEnabled;
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
    setupIO(path?: string): string;
    /**
     * Mount a NHP page system.
     *
     * @param wwwpath The web path
     * @param fspath The filesystem path
     * @param options The optional mount options
     */
    mount(webpath: string, fspath: string, options?: nexusframework.MountOptions): nexusframework.RequestHandlerEntry;
    mountImageResizer(webpath: string, imagefile: string, options?: nexusframework.ImageResizerOptions): nexusframework.RequestHandlerEntry;
    /**
     * Mount a directory.
     *
     * @param webpath The web path
     * @param fspath The filesystem path
     * @param options The mount options
     */
    mountStatic(webpath: string, fspath: string, options?: nexusframework.StaticMountOptions): nexusframework.RequestHandlerEntry;
    /**
     * Set a request handler for the specified path.
     * Replaces any existing request handler.
     *
     * @param path The path
     * @param handler The request handler
     * @param leaf Whether or not this handler is a leaf, or branch
     */
    mountHandler(webpath: string, handler: nexusframework.RequestHandler, leaf?: boolean): nexusframework.RequestHandlerEntry;
    /**
     * Set the default handler, its the handler that gets used when no mounts take the request.
     */
    setDefaultHandler(handler: nexusframework.RequestHandlerEntry): void;
    /**
     * Start listening on a specific port.
     */
    listen(port: number, callbackOrHost?: string | Function, callback?: Function): void;
    /**
     * NexusFork compatible handler.
     */
    handle(req: nexusframework.Request, res: nexusframework.Response, next: (err?: Error) => void): void;
    /**
     * Push middleware to the end of the stack.
     * At this point any user calculations have concluded and a logger should be available.
     */
    pushMiddleware(middleware: nexusframework.RequestHandler): void;
    /**
     * Unshift middleware onto the beginning of the stack.
     * At this point none of the nexusframework extensions will be available.
     */
    unshiftMiddleware(middleware: nexusframework.RequestHandler): void;
    /**
     * Alias for pushMiddleware
     */
    use: (middleware: nexusframework.RequestHandler) => void;
    useio(middleware: nexusframework.IORequestHandler): void;
    runMiddleware(req: nexusframework.Request, res: nexusframework.Response, next: (err?: Error) => void): void;
    private handle0(req, res, next);
    upgrade(req: nexusframework.Request, res: nexusframework.Response, next: (err?: Error) => void): void;
    static nexusforkUpgrade(req: express.Request, res: express.Response): void;
    /**
     * Express compatible handler
     */
    __express(req: express.Request, res: express.Response, next: express.NextFunction): void;
    static expressUpgradeRequest(req: http.IncomingMessage, onPrototype?: boolean): void;
    static expressUpgradeResponse(res: http.ServerResponse, onPrototype?: boolean): void;
    static expressUpgrade(req: http.IncomingMessage, res: http.ServerResponse, onPrototype?: boolean): void;
    /**
     * HTTP compatible handler
     */
    __http(req: http.IncomingMessage, res: http.ServerResponse, next: express.NextFunction): void;
    close(cb?: Function): void;
    isIOSetup(): boolean;
}
