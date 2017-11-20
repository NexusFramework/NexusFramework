import cookieParser = require("cookie-parser");
import querystring = require("querystring");
import {Template} from "nhp/lib/Template";
import nulllogger = require("nulllogger");
import { nexusframework } from "../types";
import socket_io = require("socket.io");
import useragent = require("useragent");
import statuses = require('statuses');
import chokidar = require("chokidar");
import {Application} from "express";
import express = require("express");
import events = require("events");
import stream = require("stream");
import multer = require("multer");
import upath = require("upath");
import async = require("async");
import http = require("http");
import path = require("path");
import _ = require("lodash");
import url = require("url");
import nhp = require("nhp");
import fs = require("fs");

const padLeft = function(data: string, count = 8, using = "0") {
    while (data.length < count)
        data = using + data;
    return data;
}
const stringHash = function(data: string) {
    if (data.length === 0) return "00000000";
    var hash = 0;
    for (var i = 0; i < data.length; i++)
        hash = (((hash << 5) - hash) + data.charCodeAt(i)) | 0;
    return padLeft(hash.toString(16));
};
const determineName = function(name: string) {
    var index = name.lastIndexOf("/");
    if(index > -1)
        name = name.substring(index+1);
    var match = name.match(/^(([a-z][a-z0-9]*[\-_\.]?)+)\.(css|js)(\?.*)?$/i);
    if(match)
        name = match[1];
    else
        name = name.replace(/\.(css|js)(\?.*)?$/i, "");
    if(/\.min$/.test(name))
        name = name.substring(0, name.length-4);
    if(/\.slim$/.test(name))
        name = name.substring(0, name.length-5);
    if(/\.umd$/.test(name))
        name = name.substring(0, name.length-4);
    match = name.match(/^(.+)\-\d+([\.\-]\d)*$/);
    if (match)
        name = match[1];
    return name;
}

const isUnsupportedBrowser = function(browser: useragent.Agent & useragent.Details) {
    const major = parseInt(browser.major);
    return (browser.ie && major < 10) ||
            (browser.chrome && major < 4) ||
            (browser.firefox && major < 3) ||
            (browser.safari && major < 3 && parseInt(browser.minor) < 1) ||
            (browser.opera && major < 3 && parseInt(browser.minor) < 5);
}
const isES6Browser = function(browser: useragent.Agent & useragent.Details) {
    const major = parseInt(browser.major);
    return (browser.chrome && major >= 49) ||
            (browser.firefox && major >= 45) ||
            (browser.safari && major >= 9) ||
            (browser.opera && major >= 43);
}

const multerInstance = multer().any();

const pkgjson = require(path.resolve(__dirname, "../package.json"));
const sckclpkgjson = require("socket.io/package.json");

const overlayCss = fs.readFileSync(path.resolve(__dirname, "../loader/overlay.css"), "utf8").replace(/\s*\/\*# sourceMappingURL=overlay.css.map \*\/\s*/, "");
const overlayHtml = fs.readFileSync(path.resolve(__dirname, "../loader/overlay.html"), "utf8");
const loaderScriptEs5 = fs.readFileSync(path.resolve(__dirname, "../scripts/es5/loader.min.js"), "utf8").replace(/\s*\/\/# sourceMappingURL=.+\s*/, "");
const loaderScriptEs6 = fs.readFileSync(path.resolve(__dirname, "../scripts/es6/loader.min.js"), "utf8").replace(/\s*\/\/# sourceMappingURL=.+\s*/, "");

const overlayHtmlParts: Function[] = [];
(function(html) {
    var next: number;
    while((next = html.indexOf("{{")) > -1) {
        const left = html.substring(0, next);
        overlayHtmlParts.push(function(out) {
            out.write(left);
        });
        const end = html.indexOf("}}");
        const key = html.substring(next+2, end);
        overlayHtmlParts.push(function(out, vars) {
            out.write(vars[key]);
        });
        html = html.substring(end+2);
    }
    overlayHtmlParts.push(function(out) {
        out.write(html);
    });
})(overlayHtml);

const express_req: express.Request = express['request'];
const express_res: express.Response = express['response'];

function encodeHTML(html: string, attr: boolean = false) {
    html = html.replace(/</g, "&lt;");
    html = html.replace(/>/g, "&gt;");
    if (attr)
        return html.replace(/"/g, "&quot;");
    return html;
}

class SocketIORequest extends events.EventEmitter implements http.IncomingMessage{
    socket: any;
    cookies: any;
    trailers: any;
    method: string;
    readable: false;
    rawTrailers: any;
    headers: {[index: string]: string[]|string};
    httpVersionMinor: number;
    httpVersionMajor: number;
    httpVersion: string;
    subdomains: string[];
    signedCookies: any;
    connection: any;
    secure: boolean;
    pagesys = true;
    fresh = false;
    stale = true;
    body: any;
    route: any;
    ip: string;
    url: string;
    constructor(upgradedRequest: http.IncomingMessage, method: string, path: string, body: any, headers: {[index: string]: string[]}) {
        super();
        this.method = method;
        this.url = upath.join("/", path);
        this.connection = upgradedRequest.connection;
        this.httpVersionMinor = upgradedRequest.httpVersionMinor;
        this.httpVersionMajor = upgradedRequest.httpVersionMajor;
        this.httpVersion = upgradedRequest.httpVersion;
        this.headers = headers;
        this.headers['host'] = this.headers['host'] || upgradedRequest.headers['host'];
        this.headers['user-agent'] = this.headers['user-agent'] || upgradedRequest.headers['user-agent'];
        const acceptsLanguage = this.headers['accepts-language'] || upgradedRequest.headers['accepts-language'];
        if (acceptsLanguage)
            this.headers['accepts-language'] = acceptsLanguage;
        this.headers['accepts'] = this.headers['accepts'] || "application/json, text/json, text/html;q=0.95, application/xhtml+xml;q=0.9, application/xml;q=0.8, text/*;q=0.7";
        this.body = body;
    }
    push(...args: any[]): any{throw new Error("Not supported");}
    wrap(): this{throw new Error("Not supported");}
    pipe<T>(...args: any[]): T{throw new Error("Not supported");}
    unshift(): this{throw new Error("Not supported");}
    unpipe(): this{throw new Error("Not supported");}
    isPaused() {return false;}
    read(...args: any[]): any{throw new Error("Not supported");}
    _read(...args: any[]): any{throw new Error("Not supported");}
    pause(...args: any[]): any{}
    resume(...args: any[]): any{}
    setTimeout(...args: any[]): any{return this;}
    setEncoding(...args: any[]): any{return this;}
    addListener(event: string | symbol, listener: (...args: any[]) => void): this{
        super.addListener(event, listener);
        if(event == "end" || event == "done")
            listener();
        return this;
    }
    get rawHeaders() {
        var rawHeaders: string[] = [];
        Object.keys(this.headers).forEach((key) => {
            rawHeaders.push(key + ": " + this.headers[key]);
        });
        return rawHeaders;
    }
    get accepted(): express.MediaType[]{
        throw new Error("Not supported");
    }
    get query() {
        return url.parse(this.url, true).query || {};
    }
    get path() {
        return url.parse(this.url).path;
    }
    _destroy() {}
    destroy() {}
}

class BufferingWritable extends stream.Writable {
    private buffer = "";
    private stream: NodeJS.WritableStream;
    constructor(stream: NodeJS.WritableStream) {
        super();
        this.stream = stream;
    }
    _write(chunk: any, encoding: string, callback: Function) {
        chunk = chunk.toString("utf8");
        if (this.buffer.length + chunk.length >= 4096)
            this.flush();
        this.buffer += chunk;
        callback();
    }
    _final(callback: Function) {
        this.stream.end(this.buffer);
        delete this.buffer;
        callback();
    }
    flush() {
        this.stream.write(this.buffer);
        this.buffer = "";
    }
}

function notSupported(this: http.IncomingMessage, ...args: any[]): any{
    var cb = function(err: Error) {
        throw err;
    };
    args.forEach(function(arg) {
        if(arg instanceof Function)
            cb = arg;
    });
    cb(new Error("Not supported"));
    return this;
}
class SocketIOResponse extends stream.Writable implements http.ServerResponse {
    connection: any;
    cb: (res: any) => void;
    headers: {[index: string]: string | string[]} = {};
    useChunkedEncodingByDefault = false;
    statusMessage: string = statuses[200];
    chunkedEncoding = false;
    shouldKeepAlive = true;
    headersSent = false;
    response: any = "";
    upgrading = false;
    statusCode = 200;
    charset = "utf8";
    sendDate = false;
    finished = false;
    locals = {};
    constructor(cb: (res: any) => void) {
        super();
        this.cb = cb;
    }
    flushHeaders() {
        return this;
    }
    getHeaders() {
        return this.headers;
    }
    getHeaderNames() {
        return Object.keys(this.headers);
    }
    hasHeader(key: string) {
        return key.toLowerCase() in this.headers;
    }
    removeHeader(key: string) {
        delete this.headers[key.toLowerCase()];
    }
    addTrailers(...args: any[]) {
        return this;
    }
    getHeader(key: string) {
        return this.headers[key.toLowerCase()];
    }
    setHeader(key: string, val?: string) {
        this.headers[key.toLowerCase()] = val || "";
    }
    writeHead(statusCode: number, reasonPhraseOrHeaders?: any, headers?: any) {
        this.statusCode = statusCode;
        this.statusMessage = statuses[statusCode] || String(statusCode);
        if(headers) {
            this.statusMessage = reasonPhraseOrHeaders;
        } else {
            headers = reasonPhraseOrHeaders;
        }
        if(headers)
            Object.keys(headers).forEach((key) => {
                this.setHeader(key, headers[key]);
            });
    }
    json(data: any) {
        this.response = data;
        this.end();
        return this;
    }
    assignSocket(...args: any[]): express.Response{return undefined;}
    detachSocket(...args: any[]): express.Response{return undefined;}
    writeContinue(...args: any[]): express.Response{return undefined;}
    setTimeout(...args: any[]): any{return this;}
    _write(data, encoding: string, cb: Function) {
        const dat = data.toString("utf8");
        if(dat.length)
            this.response += dat;
        cb();
    }
    end(...args: any[]) {
        super.end.apply(this, args);
        const headers = {};
        Object.keys(this.headers).forEach((key) => {
            var val = this.headers[key];
            if (!Array.isArray(val))
                val = [val];
            headers[key] = val;
        });
        this.cb({
            code: this.statusCode,
            message: this.statusMessage,
            data: this.response,
            headers
        });
    }
}
SocketIOResponse.prototype.writeContinue = notSupported;
SocketIOResponse.prototype.assignSocket = notSupported;
SocketIOResponse.prototype.detachSocket = notSupported;

function decodePath(path: string) {
    return path.replace(/\$/g, "\\$").replace(/\^/g, "\\^").replace(/%([a-z0-9]{2}|%)/g, function (match, p1, offset) {
        if (p1 === "%")
            return "%";
        return String.fromCharCode(parseInt(p1, 16));
    });
}
function stripPath(path: string) {
    return path.replace(/^\/|\/$/g, "");
}
function cleanPath(path: string) {
    return upath.join("/", path).replace(/^\/|\/$/g, "");
}
function currentPath(req: http.IncomingMessage) {
    const path = stripPath(url.parse(req.url).pathname);
    const slash = path.indexOf('/');
    return slash > -1 ? path.substring(0, slash) : path;
}
function cutPath(req: http.IncomingMessage) {
    const path = req.url;
    const slash = path.indexOf('/', 1);
    return slash > -1 ? (path.substring(slash) || "/") : "/";
}

class RequestHandlerWithChildren implements nexusframework.RequestHandlerEntry {
    private views: {[index: string]: string};
    private _index: nexusframework.RequestHandlerEntry;
    private route: nexusframework.RouteRequestHandler;
    private exists: nexusframework.ExistsRequestHandler;
    private access: nexusframework.AccessRequestHandler;
    private _children: nexusframework.RequestHandlerChildEntry[];
    constructor() {
        Object.defineProperties(this, {
            _children: {
                value: []
            },
            views: {
                value: {}
            }
        });
    }
    
    routeHandler() {
        return this.route;
    }
    accessHandler() {
        return this.access;
    }
    existsHandler() {
        return this.exists;
    }
    setRouteHandler(route: nexusframework.RouteRequestHandler) {
        this.route = route;
    }
    setAccessHandler(access: nexusframework.AccessRequestHandler) {
        this.access = access;
    }
    setExistsHandler(exists: nexusframework.ExistsRequestHandler) {
        this.exists = exists;
    }
    
    index() {
        return this._index;
    }
    setIndex(index: nexusframework.RequestHandlerEntry) {
        this._index = index;
    }
    
    handle(req: nexusframework.Request, res: nexusframework.Response, next: (err?: Error) => void) {
        const _next = () => {
            const _next = () => {
                const _next = () => {
                    const currentpath = currentPath(req);
                    if(currentpath) 
                        async.eachSeries(this._children, function(handler, cb) {
                            var match = currentpath.match(handler.pattern);
                            if(match) {
                                try {
                                    Object.defineProperty(req, "match", {
                                        configurable: true,
                                        value: match
                                    })
                                } catch(e) {}
                                try {
                                    req.matches.push(match);
                                } catch(e) {}
                                const curl = req.url;
                                req.url = cutPath(req);
                                handler.handle(req, res, function(err?: Error) {
                                    req.url = curl;
                                    cb(err);
                                });
                            } else
                                cb();
                        }, next);
                    else if(this['_index']) {
                        var urlpath: string;
                        if (req.method.toUpperCase() === "GET" && !/\/(\?.*)?$/.test(urlpath = url.parse(req.originalUrl).path)) {
                            const q = urlpath.indexOf("?");
                            if(q == -1)
                                urlpath += "/";
                            else
                                urlpath = urlpath.substring(0, q) + "/" + urlpath.substring(q);
                            return res.redirect(urlpath);
                        }
                        this['_index'].handle(req, res, (err, locals?) => {
                            if(err)
                                next(err);
                            else {
                                locals = locals || {};
                                const view = this['views'][res.app.get("view engine")];
                                if(view)
                                    res.sendRender(view, locals);
                                else
                                    next(new Error("No view to render"));
                            }
                        });
                    } else
                        next();
                }
                if (this.access)
                    this.access(req, res, function(err?: Error) {
                        if (err)
                            next(err);
                        else
                            _next();
                    }, function() {
                        res.sendStatus(403);
                    });
                else
                    _next();
            }
            if (this.exists)
                this.exists(req, res, function(err?: Error) {
                    if (err)
                        next(err);
                    else
                        _next();
                }, next);
            else
                _next();
        }
        if (this.route)
            this.route(req, res, function(err?: Error, route?: string) {
                if (err)
                    next(err);
                else {
                    if (route)
                        req.url = url.resolve("/", route);
                    _next();
                }
            }, next);
        else
            _next();
    }
    
    view(type = "nhp") {
        return this.views[type];
    }
    setView(filename: string, type = "nhp") {
        this.views[type] = filename;
    }
    
    children(): nexusframework.RequestHandlerChildEntry[]{
        return this._children;
    }
    childPaths(cb, recursive?: boolean): void{
        var paths: (nexusframework.RecursivePath | string)[] = [];
        if (recursive)
            async.eachSeries(this._children, function(child, cb) {
                try {
                    child.childPaths(function(_paths) {
                        _paths['unshift'](child.rawPattern);
                        paths.push(_paths as any);
                        cb();
                    }, true);
                } catch(e) {
                    paths.push(child.rawPattern);
                    cb();
                }
            }, function() {
                cb(paths);
            });
        else {
            this._children.forEach(function(child) {
                paths.push(child.rawPattern);
            });
            cb(paths);
        }
    }
    childAt(path: string, createIfNotExists?: boolean): nexusframework.RequestHandlerChildEntry{
        path = cleanPath(path);
        if(path) {
            const slash = path.indexOf("/");
            const toFind = slash > -1 ? path.substring(0, slash) : path;
            try {
                this._children.forEach(function(child) {
                    if (child.rawPattern === toFind) {
                        throw child;
                    }
                });
            } catch(child) {
                if (slash > -1)
                    return (child as nexusframework.RequestHandlerChildEntry).childAt(path.substring(slash+1), createIfNotExists);
                else
                    return child;
            }
            if(createIfNotExists) {
                const child = new RequestHandlerChildWithChildren(toFind);
                this._children.push(child);
                if (slash > -1)
                    return (child as nexusframework.RequestHandlerChildEntry).childAt(path.substring(slash+1), createIfNotExists);
                else
                    return child;
            }
        } else
            throw new Error("path must be a valid path");
        return undefined;
    }
    setChild(path: string, handler: nexusframework.RequestHandlerChildEntry, createIfNotExists?: boolean): void{
        path = cleanPath(path);
        if(path) {
            const slash = path.lastIndexOf("/");
            const toFind = slash > -1 ? path.substring(slash+1) : path;
            if (toFind !== handler.rawPattern)
                throw new Error("rawPattern must match path when setting a child. " + toFind + " !== " + handler.rawPattern);
            if (slash > -1) {
                const child = this.childAt(path.substring(0, slash), createIfNotExists);
                if(child)
                    child.setChild(toFind, handler, createIfNotExists);
                else
                    throw new Error("Cannot resolve path, and createIfNotExists is false");
            } else {
                const childCount = this._children.length;
                for(var i=0; i<childCount; i++) {
                    const child = this._children[i];
                    if (child.rawPattern === toFind) {
                        this._children[i] = handler;
                        child.destroy();
                        return;
                    }
                }
                this._children.push(handler);
            }
        } else
            throw new Error("path must be a valid path");
    }
    destroy() {
        this._children.forEach(function(child) {
            child.destroy();
        });
        if (this._index) {
            this._index.destroy();
            this._index = undefined;
        }
    }
}
class RequestHandlerChildWithChildren extends RequestHandlerWithChildren implements nexusframework.RequestHandlerChildEntry {
    pattern: RegExp;
    rawPattern: string;
    constructor(pattern: string) {
        super();
        this.rawPattern = pattern;
        this.pattern = new RegExp("^" + pattern + "$", "i");
    }
}

class LeafRequestHandler implements nexusframework.RequestHandlerEntry {
    handle: nexusframework.RequestHandler;
    constructor(handler: nexusframework.RequestHandler) {
        this.handle = handler;
    }
    children(): nexusframework.RequestHandlerChildEntry[] {
        throw new Error("Leaf has no children.");
    }
    childPaths(): any{
        throw new Error("Leaf has no children.");
    }
    childAt(path: string, createIfNotExists?: boolean): nexusframework.RequestHandlerChildEntry {
        throw new Error("Leaf has no children.");
    }
    setChild(path: string, handler: nexusframework.RequestHandlerChildEntry, createIfNotExists?: boolean): void {
        throw new Error("Leaf has no children.");
    }
    view(type = "nhp"): string {
        return undefined;
    }
    setView(filename: string, type = "nhp"): void {
        throw new Error("Not supported.");
    }
    index(): nexusframework.RequestHandlerEntry {
        return this;
    }
    setIndex(index: nexusframework.RequestHandlerEntry): void {
        throw new Error("Cannot change Leaf index.");
    }
    routeHandler(): nexusframework.RouteRequestHandler {
        return undefined;
    }
    accessHandler(): nexusframework.AccessRequestHandler {
        return undefined;
    }
    existsHandler(): nexusframework.ExistsRequestHandler {
        return undefined;
    }
    setRouteHandler(index: nexusframework.RouteRequestHandler): void {
        throw new Error("Cannot route Leafs.");
    }
    setAccessHandler(index: nexusframework.AccessRequestHandler): void {
        throw new Error("Not supported.");
    }
    setExistsHandler(index: nexusframework.ExistsRequestHandler): void {
        throw new Error("Not supported.");
    }
    destroy() {}
}
class LeafRequestChildHandler extends LeafRequestHandler implements nexusframework.RequestHandlerChildEntry {
    pattern: RegExp;
    rawPattern: string;
    constructor(handler: nexusframework.RequestHandler, pattern: string) {
        super(handler);
        this.rawPattern = pattern;
        this.pattern = new RegExp("^" + pattern + "$", "i");
    }
}

class NHPRequestHandler extends LeafRequestHandler {
    protected skeleton: Template;
    protected legacyskeleton: Template;
    private impl: nexusframework.RequestHandler;
    private views: {[index: string]: string} = {};
    private exists: nexusframework.ExistsRequestHandler;
    private access: nexusframework.AccessRequestHandler;
    constructor(impl: nexusframework.RequestHandler, skeleton: Template, pagesysskeleton: nexusframework.PageSystemSkeleton, legacyskeleton: Template, redirect = false) {
        super((req: nexusframework.Request, res: nexusframework.Response, next: (err?: Error) => void) => {
            req.skeleton = skeleton || req.nexusframework['skeleton'];
            req.legacyskeleton = legacyskeleton || req.nexusframework['legacyskeleton'];
            req.pagesysskeleton = pagesysskeleton || req.nexusframework['pagesysskeleton'];
            const _next = () => {
                const _next = () => {
                    var urlpath: string;
                    if (redirect && req.method.toUpperCase() === "GET" && /\/(\?.*)?$/.test(urlpath = url.parse(req.originalUrl).path)) {
                        const q = urlpath.indexOf("?");
                        if(q == -1)
                            urlpath = urlpath.substring(0, urlpath.length-1);
                        else
                            urlpath = urlpath.substring(0, q-1) + urlpath.substring(q);
                        return res.redirect(urlpath);
                    }
                    
                    this.impl(req, res, (err?: Error, locals?: any) => {
                        if(err)
                            next(err);
                        else if(locals) {
                            const view = this['views'][res.app.get("view engine")];
                            if(view)
                                res.sendRender(view, locals);
                            else
                                next(new Error("No view to render"));
                        } else
                            next();
                    });
                }
                if (this.access)
                    this.access(req, res, function(err) {
                        if(err)
                            next(err);
                        else
                            _next();
                    }, function() {
                        res.sendStatus(403);
                    });
                else
                    _next();
            }
            if (this.exists)
                this.exists(req, res, function(err) {
                    if(err)
                        next(err);
                    else
                        _next();
                }, next);
            else
                _next();
        });
        this.skeleton = skeleton;
        this.impl = impl;
    }
    view(type = "nhp"): string {
        return this.views[type];
    }
    setView(filename: string, type = "nhp"): void {
        this.views[type] = filename;
    }
    accessHandler(): nexusframework.AccessRequestHandler {
        return this.access;
    }
    existsHandler(): nexusframework.ExistsRequestHandler {
        return this.exists;
    }
    setAccessHandler(index: nexusframework.AccessRequestHandler): void {
        this.access = index;
    }
    setExistsHandler(index: nexusframework.ExistsRequestHandler): void {
        this.exists = index;
    }
}
class NHPRequestChildHandler extends NHPRequestHandler implements nexusframework.RequestHandlerChildEntry {
    rawPattern: string;
    pattern: RegExp;
    constructor(impl: nexusframework.RequestHandler, skeleton: Template, pagesysskeleton: nexusframework.PageSystemSkeleton, legacyskeleton: Template, pattern: string, redirect = true) {
        super(impl, skeleton, pagesysskeleton, legacyskeleton, redirect);
        this.rawPattern = pattern;
        this.pattern = new RegExp("^" + pattern + "$", "i");
    }
}

function resolveHandler(mapping: nexusframework.RequestHandlerMethodMapping, req: nexusframework.Request) {
    var handler: nexusframework.RequestHandler;
    const method = req.method.toLowerCase();
    const isHead = method === "head";
    
    (isHead && (handler = mapping.head)) ||
    ((isHead || method === "get") && (handler = mapping.get)) ||
    (method === "post" && (handler = mapping.post)) ||
    (method === "patch" && (handler = mapping.patch)) ||
    (method === "patch" && (handler = mapping.patch)) ||
    (method === "put" && (handler = mapping.put)) ||
    (method === "delete" && (handler = mapping.del));
    
    return handler || mapping.use;
}
export function createExtendedRequestHandler() {
    const requestHandler: nexusframework.MappedRequestHandler = function(req: nexusframework.Request, res: nexusframework.Response, next: (err?: Error) => void) {
        var handler = resolveHandler(requestHandler, req);
        if(handler)
            handler(req, res, next);
        else
            next();
    } as any;
    return requestHandler;
}

function lazyLoadMapping(filename: string | Function, method: string, mapping: nexusframework.RequestHandlerMethodMapping): nexusframework.NHPRequestHandler{
    if (filename instanceof Function)
        return filename as any;
    return function(req: nexusframework.Request, res: nexusframework.Response, next: (err?: Error, renderLocals?: any) => void, broken?) {
        try {
            const handler = require(filename);
            if(!(handler instanceof Function))
                throw new Error("Handler is not a Function: " + filename);
            req.mapping = mapping;
            handler(req, res, next, broken);
            mapping[method] = handler;
        } catch(e) {
            mapping[method] = function(a, b, next) {
                next(e);
            };
            next(e);
        }
    };
}
function processMapping(mapping: {[index: string]: string | Function}, mapped: nexusframework.RequestHandlerMethodMapping = {}): nexusframework.RequestHandlerMethodMapping{
    const use = mapping['use'] || mapping['__use'] || mapping['all'] || mapping['__all'] || mapping['*'];
    if(use)
        mapped.use = lazyLoadMapping(use, "use", mapped);
    const get = mapping['get'] || mapping['__get'];
    if(get)
        mapped.get = lazyLoadMapping(get, "get", mapped);
    const put = mapping['put'] || mapping['__put'];
    if(put)
        mapped.put = lazyLoadMapping(put, "put", mapped);
    else {
        const autoput = mapping['autoput'] || mapping['__autoput'] || mapping['decodedput'] || mapping['__decodedput'];
        if(autoput) {
            mapped['autoput'] = lazyLoadMapping(autoput, "autoput", mapped);
            mapped.put = function(req, res, next) {
                req.processBody(function() {
                    mapped['autoput'](req, res, next);
                });
            }
        } else if(get)
            mapped.put = function(req, res, next) {
                res.sendStatus.call(res, 403);
            }
    }
    const post = mapping['post'] || mapping['__post'];
    if(post)
        mapped.post = lazyLoadMapping(post, "post", mapped);
    else {
        const autopost = mapping['autopost'] || mapping['__autopost'] || mapping['decodedpost'] || mapping['__decodedpost'];
        if(autopost) {
            mapped['autopost'] = lazyLoadMapping(autopost, "autopost", mapped);
            mapped.post = function(req, res, next) {
                req.processBody(function() {
                    mapped['autopost'](req, res, next);
                });
            }
        } else if(get)
            mapped.post = function(req, res, next) {
                express_res.sendStatus.call(res, 403);
            };
    }
    const patch = mapping['patch'] || mapping['__patch'];
    if(patch)
        mapped.patch = lazyLoadMapping(patch, "patch", mapped);
    else {
        const autopatch = mapping['autopatch'] || mapping['__autopatch'] || mapping['decodedpatch'] || mapping['__decodedpatch'];
        if(autopatch) {
            mapped['autopatch'] = lazyLoadMapping(autopatch, "autopatch", mapped);
            mapped.patch = function(req, res, next) {
                req.processBody(function() {
                    mapped['autopatch'](req, res, next);
                });
            }
        } else if(get)
            mapped.patch = function(req, res, next) {
                express_res.sendStatus.call(res, 403);
            };
    }
    const head = mapping['head'] || mapping['__head'];
    if(head)
        mapped.head = lazyLoadMapping(head, "head", mapped);
    const del = mapping['del'] || mapping['__del'] || mapping['delete'] || mapping['__delete'];
    if(del)
        mapped.del = lazyLoadMapping(del, "del", mapped);
    return mapped;
}

class LazyLoadingRequestHandler extends RequestHandlerWithChildren {
    private fspath: string;
    private skeleton: Template;
    private legacyskeleton: Template;
    private pagesysskeleton: nexusframework.PageSystemSkeleton;
    constructor(fspath: string, logger: nulllogger.INullLogger, skeleton: Template, pagesysskeleton: nexusframework.PageSystemSkeleton, legacyskeleton: Template) {
        super();
        this.fspath = fspath;
        this.skeleton = skeleton;
        this.legacyskeleton = legacyskeleton;
        this.pagesysskeleton = pagesysskeleton;
        this.handle = (req: nexusframework.Request, res: nexusframework.Response, next: (err?: Error) => void) => {
            this.load((err) => {
                if(err)
                    next(err);
                else
                    this.handle(req, res, next)
            }, logger);
        }
        this.childPaths = (cb, recursive) => {
            this.load((err) => {
                if(err)
                    cb([]);
                else
                    this.childPaths(cb, recursive);
            }, logger);
        };
    }
    protected load(next: (err?: Error) => void, logger: nulllogger.INullLogger) {
        fs.readdir(this.fspath, (err, files) => {
            if(err)
                next(err);
            else {
                var mapping: {[index: string]: {[index: string]:{[index: string]: string | Function}}} = {};
                files.forEach((file) => {
                    const filename = path.resolve(this.fspath, file);
                    const match = file.match(/([^.]+)(\.([^.]+))?\.([^.]+)/);
                    if(match) {
                        const route = decodePath(match[1].toLowerCase());
                        var fmapping = mapping[route];
                        if (!fmapping)
                            mapping[route] = fmapping = {};
                        const type = match[4].toLowerCase();
                        var cmapping = fmapping[type];
                        if (!cmapping)
                            cmapping = fmapping[type] = {};
                        var method = match[3];
                        if(method)
                            method = method.toLowerCase();
                        else
                            method = "get";
                        cmapping[method] = filename;
                    } else if(/^([^.]+$)/.test(file)) {
                        const pattern = decodePath(file);
                        this.setChild(pattern, new LazyLoadingRequestChildHandler(filename, logger, this.skeleton, this.pagesysskeleton, this.legacyskeleton, pattern));
                    } else
                        logger.warn("Ignoring", filename);
                });
                Object.keys(mapping).forEach((key) => {
                    const extensions = mapping[key];
                    if(key === "__route") {
                        this.setRouteHandler((req, res, next, skip) => {
                            try {
                                const methods = extensions['js'];
                                if (!methods)
                                    throw new Error("No JavaScript files found for `" + path.resolve(this.fspath, key + ".*") + "`");
                                const mapping = processMapping(methods);
                                const handler = function(req, res, next, skip) {
                                    const handler = resolveHandler(mapping, req);
                                    if(handler)
                                        (handler as nexusframework.RouteRequestHandler)(req, res, next, skip);
                                    else
                                        next();
                                }
                                this.setRouteHandler(handler);
                                handler(req, res, next, skip);
                            } catch(e) {
                                req.logger.warn(e);
                                this.setRouteHandler(function(req, res, next, skip) {
                                    skip();
                                });
                                skip();
                            }
                        });
                    } else if(key === "__exists")
                        this.setExistsHandler((req, res, exists, doesntExist) => {
                            try {
                                const methods = extensions['js'];
                                if (!methods)
                                    throw new Error("No JavaScript files found for `" + path.resolve(this.fspath, key + ".*") + "`");
                                const mapping = processMapping(methods);
                                const handler = function(req, res, exists, doesntExist) {
                                    const handler = resolveHandler(mapping, req);
                                    if(handler)
                                        (handler as nexusframework.RouteRequestHandler)(req, res, exists, doesntExist);
                                    else
                                        next();
                                }
                                this.setRouteHandler(handler);
                                handler(req, res, exists, doesntExist);
                            } catch(e) {
                                req.logger.warn(e);
                                this.setExistsHandler(function(req, res, next, doesntExist) {
                                    doesntExist();
                                });
                                doesntExist();
                            }
                        });
                    else if(key === "__access")
                        this.setAccessHandler((req, res, allowed, denied) => {
                            try {
                                const methods = extensions['js'];
                                if (!methods)
                                    throw new Error("No JavaScript files found for `" + path.resolve(this.fspath, key + ".*") + "`");
                                const mapping = processMapping(methods);
                                const handler = function(req, res, allowed, denied) {
                                    const handler = resolveHandler(mapping, req);
                                    if(handler)
                                        (handler as nexusframework.RouteRequestHandler)(req, res, allowed, denied);
                                    else
                                        next();
                                }
                                this.setAccessHandler(handler);
                                handler(req, res, allowed, denied);
                            } catch(e) {
                                req.logger.warn(e);
                                this.setAccessHandler(function(req, res, allowed, denied) {
                                    denied();
                                });
                                denied();
                            }
                        });
                    else {
                        const handler = createExtendedRequestHandler();
                        const methods = extensions['js'] || {};
                        const json = extensions['json'];
                        if (json)
                            Object.keys(json).forEach((method) => {
                                try {
                                    const data = require(json[method] as string) || {};
                                    methods[method] = (req, res, next) => {
                                        next(undefined, data, this.skeleton, this.pagesysskeleton, this.legacyskeleton);
                                    };
                                } catch(e) {
                                    methods[method] = function(req, res, next) {
                                        next(e);
                                    };
                                }
                            });
                        if (!methods)
                            throw new Error("No JavaScript files found for `" + path.resolve(this.fspath, key + ".*") + "`");
                        processMapping(methods, handler);
                        var leaf: NHPRequestHandler;
                        if(key === "index")
                            this.setIndex(leaf = new NHPRequestHandler(handler, this.skeleton, this.pagesysskeleton, this.legacyskeleton));
                        else {
                            const child = this.childAt(key);
                            if (child)
                                child.setIndex(leaf = new NHPRequestHandler(handler, this.skeleton, this.pagesysskeleton, this.legacyskeleton));
                            else
                                this.setChild(key, leaf = new NHPRequestChildHandler(handler, this.skeleton, this.pagesysskeleton, this.legacyskeleton, key));
                        }
                        try {
                            leaf.setView(extensions['nhp']['get'] as string);
                        } catch(e) {}
                    }
                });
                this.handle = (req, res, next) => {
                    req.skeleton = this.skeleton || req.nexusframework['skeleton'];
                    super.handle(req, res, next);
                }
                delete this.childPaths;
                next();
            }
        });
    }
}
class LazyLoadingRequestChildHandler extends LazyLoadingRequestHandler {
    pattern: RegExp;
    rawPattern: string;
    constructor(fspath: string, logger: nulllogger.INullLogger, skeleton: Template, pagesysskeleton: nexusframework.PageSystemSkeleton, legacyskeleton: Template, pattern: string) {
        super(fspath, logger, skeleton, pagesysskeleton, legacyskeleton);
        this.rawPattern = pattern;
        this.pattern = new RegExp("^" + pattern + "$", "i");
    }
}

class FSWatcherRequestHandler extends RequestHandlerWithChildren {
    private skeleton: Template;
    private legacyskeleton: Template;
    private fswatcher: chokidar.FSWatcher;
    private pagesysskeleton: nexusframework.PageSystemSkeleton;
    constructor(fspath: string, logger: nulllogger.INullLogger, skeleton: Template, pagesysskeleton: nexusframework.PageSystemSkeleton, legacyskeleton: Template) {
        super();
        this.skeleton = skeleton;
        this.legacyskeleton = legacyskeleton;
        this.pagesysskeleton = pagesysskeleton;
        var onready: Function[] = [];
        const fswatcher = this.fswatcher = chokidar.watch(fspath, {
            ignorePermissionErrors: true
        });
        const self = this;
        fswatcher.on("ready", function() {
            delete self.handle;
            onready.forEach(function(cb) {
                cb();
            });
        });
        fswatcher.on("add", function(file) {
            console.log("add", file);
        });
        fswatcher.on("remove", function(file) {
            console.log("remove", file);
        });
        this.handle = function(req, res, next) {
            onready.push(function() {
                self.handle(req, res, next);
            });
        };
    }
    destroy() {
        this.fswatcher.close();
        super.destroy();
    }
}
class FSWatcherRequestChildHandler extends FSWatcherRequestHandler implements nexusframework.RequestHandlerChildEntry {
    pattern: RegExp;
    rawPattern: string;
    constructor(fspath: string, logger: nulllogger.INullLogger, skeleton: Template, pagesysskeleton: nexusframework.PageSystemSkeleton, legacyskeleton: Template, pattern: string) {
        super(fspath, logger, skeleton, pagesysskeleton, legacyskeleton);
        this.rawPattern = pattern;
        this.pattern = new RegExp("^" + pattern + "$", "i");
    }
}

interface Resource {
    name: string;
    source: string;
    inline?: boolean;
    version?: string;
    deps: string[];
}

export interface StaticMountOptions {
    directoryListing?: boolean;
}

export class NexusFramework extends events.EventEmitter {
    public readonly nhp: nhp;
    public readonly prefix: string;
    public readonly app: Application;
    public readonly server: http.Server;
    public readonly io?: SocketIO.Server;
    public readonly logger: nulllogger.INullLogger;
    private cookieParser: express.RequestHandler;
    private stack: nexusframework.RequestHandler[];
    private root: nexusframework.RequestHandlerEntry = new RequestHandlerWithChildren();
    private pagesysskeleton: nexusframework.PageSystemSkeleton;
    private errordoc: {[index: string]: string};
    private afterbody: nexusframework.Renderer[];
    private footer: nexusframework.Renderer[];
    private header: nexusframework.Renderer[];
    private loaderEnabled: boolean;
    private legacyskeleton: Template;
    private skeleton: Template;
    private logging: boolean;
    public constructor(app: Application = express(), server?: http.Server, logger: nulllogger.INullLogger = new nulllogger("NexusFramework"), prefix = "/") {
        super();
        if (!server)
            server = new http.Server(app);
        Object.defineProperties(this, {
            app: {
                value: app
            },
            nhp: {
                value: new nhp()
            },
            stack: {
                value: []
            },
            footer: {
                value: []
            },
            header: {
                value: []
            },
            afterbody: {
                value: []
            },
            errordoc: {
                value: {}
            },
            server: {
                value: server
            },
            logger: {
                value: logger
            },
            prefix: {
                value: upath.join("/", prefix, "/")
            },
            cookieParser: {
                configurable: true,
                value: cookieParser()
            }
        });
        this.legacyskeleton = this.nhp.template(path.resolve(__dirname, "../legacy/skeleton.nhp"));
        const Custom = nhp.Instructions.Custom;
        const genFooterInstruction = new Custom(undefined, function() {
            return "try{__writefooter(__out);}catch(e){__out.write(__error(e));};__next();";
        });
        this.nhp.installProcessor("footer", function() {
            return genFooterInstruction;
        });
        const genHeaderInstruction = new Custom(undefined, function() {
            return "try{__writeheader(__out);}catch(e){__out.write(__error(e));};__next();";
        });
        this.nhp.installProcessor("header", function() {
            return genHeaderInstruction;
        });
        const genAfterBodyInstruction = new Custom(undefined, function() {
            return "try{__writeafterbody(__out);}catch(e){__out.write(__error(e));};__next();";
        });
        this.nhp.installProcessor("afterbody", function() {
            return genAfterBodyInstruction;
        });
        app.set("view engine", "nhp");
        app.engine("nhp", (filename: string, options: any, callback: (err?: Error, html?: string) => void) => {
            const skeleton = this.skeleton;
            if (skeleton) {
                if (options)
                    options.page = filename;
                else
                    options = {
                        page: filename
                    };
                skeleton.render(options, callback);
            } else
                this.nhp.render(filename, options, callback);
        });
    }
    public setupTemplate(root: string) {
        const Include = nhp.Instructions.Include;
        this.nhp.installProcessor("template", function(file) {
            return new Include(file, root);
        });
    }
    public enableLoader() {
        this.loaderEnabled = true;
    }
    public disableLoader() {
        this.loaderEnabled = false;
    }
    public enableSignedCookies(secret: any) {
        Object.defineProperty(this, "cookieParser", {
            configurable: true,
            value: cookieParser(secret)
        });
    }
    public installAfterBodyRenderer(renderer: nexusframework.Renderer) {
        this.afterbody.push(renderer);
    }
    public installFooterRenderer(renderer: nexusframework.Renderer) {
        this.footer.push(renderer);
    }
    public installHeaderRenderer(renderer: nexusframework.Renderer) {
        this.header.push(renderer);
    }
    public enableLogging() {
        this.logging = true;
    }
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
    public setLegacySkeleton(val: string | Template) {
        if (_.isString(val))
            this.legacyskeleton = this.nhp.template(val);
        else
            this.legacyskeleton = val;
    }
    public setSkeleton(val: string | Template) {
        if (_.isString(val))
            this.skeleton = this.nhp.template(val);
        else
            this.skeleton = val;
    }
    public setPageSystemSkeleton(val: string | nexusframework.PageSystemSkeleton) {
        if (_.isString(val))
            this.pagesysskeleton = require(val);
        else
            this.pagesysskeleton = val;
    }
    public setErrorDocument(code: number | "*", page?: string) {
        if (!page) {
            if (code === "*")
                page = "errdoc";
            else
                page = "errdoc/" + code;
        } else
            page = upath.join("/", page).substring(1);
        this.errordoc[code] = page;
    }
    public mountScripts(mpath=":scripts") {
        this.mountStatic(mpath, path.resolve(__dirname, "../scripts/"), {
            directoryListing: true
        });
    }
    public mountAbout(mpath=":about") {
        this.mount(mpath, path.resolve(__dirname, "../about/"));
    }
    public dumpRoot() {
        this.root.childPaths(this.logger.info.bind(this.logger), true);
    }
    public setupIO(path = ":io") {
        if (!this.server)
            throw new Error("No server passed in constructor, cannot setup Socket.IO");
        const iopath = upath.join(this.prefix, path);
        const io = socket_io(this.server, {
            path: iopath
        });
        Object.defineProperty(this, "io", {
            value: io
        });
        io.on("connection", (client) => {
            client.on("init", function(sentResources: string[]) {
                const sent: string[] = (client['__sent_resources'] || (client['__sent_resources'] = []));
                sentResources.forEach(function(res) {
                    if (sent.indexOf(res) == -1)
                        sent.push(res);
                });
            });
            client.on("page", (method: string, path: string, post: any, headers: {[index: string]: string[]}, cb: (res: any) => void) => {
                try {
                    const req: nexusframework.Request = new SocketIORequest(client.conn.request, method, upath.join(this.prefix, path), post, headers) as any;
                    Object.defineProperty(req, "io", {
                        value: client
                    });
                    const res: nexusframework.Response = new SocketIOResponse(cb) as any;
                    this.expressUpgrade(req, res);
                    try {
                        const next = (err?) => {
                            if (err) {
                                (req.logger||this.logger).warn(err);
                                if(res.sendFailure)
                                    res.sendFailure(err);
                                else
                                    res.sendStatus(500);
                            } else
                                res.sendStatus(404);
                        };
                        if (this.app) {
                            const stack: ({name: string, handle: express.RequestHandler})[] = this.app._router.stack;
                            async.eachSeries(stack, function(layer, next) {
                                if(layer.name === "expressInit")
                                    next();
                                else
                                    layer.handle(req, res, next);
                            }, next);
                        } else
                            this.handle(req, res, next);
                    } catch(e) {
                        (req.logger||this.logger).warn(e);
                        res.sendStatus(500);
                    }
                } catch(e) {
                    console.warn(e);
                    client.disconnect(true);
                }
            });
        });
        return iopath;
    }

    /**
     * Mount a filesystem path onto a web path.
     * 
     * @param wwwpath The web path
     * @param fspath The filesystem path
     * @param lazyAndImmutable When true, changes to the filesystem are not honoured and path scanning is done lazily, defaults to true
     */
    public mount(webpath: string, fspath: string, lazyAndImmutable = true, skeleton?: string | Template, pagesysskeleton?: string | nexusframework.PageSystemSkeleton, legacyskeleton?: string | Template) {
        webpath = upath.join("/", webpath);
        fspath = path.resolve(process.cwd(), fspath);
        if (_.isString(skeleton))
            skeleton = this.nhp.template(skeleton);
        if (_.isString(pagesysskeleton))
            pagesysskeleton = require(pagesysskeleton) as nexusframework.PageSystemSkeleton;
        if (_.isString(legacyskeleton))
            legacyskeleton = this.nhp.template(legacyskeleton);
        if(webpath == "/")
            this.setIndex(lazyAndImmutable ? new LazyLoadingRequestHandler(fspath, this.logger, skeleton, pagesysskeleton, legacyskeleton) : new FSWatcherRequestHandler(fspath, this.logger, skeleton, pagesysskeleton, legacyskeleton));
        else {
            const cpath = stripPath(webpath);
            const last = cpath.lastIndexOf("/");
            const end = cpath.substring(last+1);
            this.root.setChild(webpath, lazyAndImmutable ? new LazyLoadingRequestChildHandler(fspath, this.logger, skeleton, pagesysskeleton, legacyskeleton, end) : new FSWatcherRequestChildHandler(fspath, this.logger, skeleton, pagesysskeleton, legacyskeleton, end), true);
        }
    }
    
    public mountStatic(webpath: string, fspath: string, options?: StaticMountOptions) {
        webpath = upath.join("/", webpath);
        fspath = path.resolve(process.cwd(), fspath);
        const startsWith = new RegExp("^" + fspath.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + "(.*)$");
        const handler = function(req: nexusframework.Request, res: nexusframework.Response, next: (err?: Error) => void) {
            const filename = path.resolve(fspath, req.path.substring(1));
            if (startsWith.test(filename))
                fs.stat(filename, function(err, stats) {
                    if (err)
                        next(err);
                    else if(stats) {
                        var urlpath = url.parse(req.originalUrl).path;
                        if (stats.isDirectory()) {
                            if (options.directoryListing) {
                                if (req.method.toUpperCase() === "GET" && !/\/(\?.*)?$/.test(urlpath)) {
                                    const q = urlpath.indexOf("?");
                                    if(q == -1)
                                        urlpath += "/";
                                    else
                                        urlpath = urlpath.substring(0, q) + "/" + urlpath.substring(q);
                                    return res.redirect(urlpath);
                                }
                                if (req.pagesys) {
                                    res.writeHead(200, {
                                        "content-disposition": "attachment",
                                        "content-type": "text/plain"
                                    });
                                    res.end("Cannot be served through page system.");
                                } else
                                    fs.readdir(filename, function(err, files) {
                                        if (err)
                                            return next(err);

                                        const path = url.parse(req.originalUrl).pathname;
                                        res.write("<html><head><title>Directory: ");
                                        res.write(path);
                                        res.write("</title></head><body><h1>Directory listing for ");
                                        res.write(path);
                                        res.write("</h1><ul>");
                                        if (path !== "/") {
                                            res.write("<li><a href=\"");
                                            res.write(upath.join(path, "../"));
                                            res.write("\">..</a></li>");
                                        }
                                        files.forEach(function(file) {
                                            res.write("<li><a href=\"");
                                            res.write(upath.join(path, file));
                                            res.write("\">");
                                            res.write(file);
                                            res.write("</a></li>");
                                        });
                                        res.write("</ul><hr /><small>Listing generated by NexusFramework ");
                                        res.write(pkgjson.version);
                                        res.end("</small></body></html>");
                                    });
                            } else
                                res.sendStatus(403);
                        } else if (req.method.toUpperCase() === "GET" && /\/(\?.*)?$/.test(urlpath)) {
                            const q = urlpath.indexOf("?");
                            if(q == -1)
                                urlpath = urlpath.substring(0, urlpath.length-1);
                            else
                                urlpath = urlpath.substring(0, q-1) + urlpath.substring(q);
                            return res.redirect(urlpath);
                        } else if (req.pagesys) {
                            res.writeHead(200, {
                                "content-disposition": "attachment",
                                "content-type": "text/plain"
                            });
                            res.end("Cannot be served through page system.");
                        } else {
                            console.log(urlpath);
                            res.sendFile(filename, function(err) {
                                if (err)
                                    next(err);
                            });
                        }
                    } else
                        next();
                });
            else
                res.sendStatus(403);
        };
        if(webpath == "/")
            this.setIndex(new LeafRequestHandler(handler));
        else {
            const cpath = stripPath(webpath);
            const end = cpath.substring(cpath.lastIndexOf("/")+1);
            this.root.setChild(webpath, new LeafRequestChildHandler(handler, end), true);
        }
    }
    
    public setIndex(handler: nexusframework.RequestHandlerEntry) {
        if (this.root)
            this.root.destroy();
        this.root = handler;
    }
    
    /**
     * Set a request handler for the specified path.
     * Replaces any existing request handler.
     * 
     * @param path The path
     * @param handler The request handler
     */
    public setHandlerEntry(path: string, handler: nexusframework.RequestHandlerChildEntry, createIfNotExists = true) {
        this.root.setChild(path, handler, createIfNotExists);
    }
    
    /**
     * Set a request handler for the specified path.
     * Replaces any existing request handler.
     * 
     * @param path The path
     * @param handler The request handler
     */
    public setHandler(webpath: string, handler: nexusframework.RequestHandler, createIfNotExists = true) {
        webpath = upath.join("/", webpath);
        if(webpath == "/")
            this.setIndex(new LeafRequestHandler(handler));
        else {
            const cpath = stripPath(webpath);
            const last = cpath.lastIndexOf("/");
            const end = cpath.substring(last+1);
            this.root.setChild(webpath, new LeafRequestChildHandler(handler, end), true);
        }
    }
    
    public handlerAt(path: string, createIfNotExists = false) {
        path = upath.join("/", path);
        if(path === "/")
            return this.root;
        else
            return this.root.childAt(path, createIfNotExists);
    }

    /**
     * Start listening on a specific port.
     */
    public listen(port: number, callbackOrHost?: string | Function, callback?: Function) {
        this.server.listen.apply(this.server, arguments);
    }
    
    /**
     * NexusFork compatible handler.
     */
    public handle(req: nexusframework.Request, res: nexusframework.Response, next: (err?: Error) => void) {
        const fullpath = req.path;
        const prefix = this.prefix;
        const len = prefix.length;
        if (fullpath.length >= len && fullpath.substring(0, len) == prefix) {
            this.cookieParser(req, res, (err?: Error) => {
                if (err)
                    return next(err);
                    
                const errordoc = this.errordoc;
                try {
                    Object.defineProperty(req, "logger", {
                        configurable: true,
                        value: this.logger.extend(req.path)
                    });
                } catch (e) {}
                try {
                    Object.defineProperty(req, "matches", {
                        configurable: true,
                        value: []
                    });
                } catch(e) {}
                try {
                    Object.defineProperty(req, "nexusframework", {
                        value: this
                    });
                } catch (e) {}
                try {
                    if(req.io)
                        Object.defineProperty(req, "readBody", {
                            configurable: true,
                            value: function(cb: (err?: Error, data?: string) => void, ...processors: nexusframework.BodyProcessor[]) {
                                cb(undefined, "");
                            }
                        });
                    else
                        Object.defineProperty(req, "readBody", {
                            configurable: true,
                            value: function(cb: (err: Error, data?: string) => void, limit = 8192) {
                                var buffer = "";
                                req.setEncoding("utf8");
                                var onError: Function, onData: Function, onEnd: Function;
                                req.on("error", onError = function(error) {
                                    req.removeListener("error", onError as any);
                                    req.removeListener("data", onData as any);
                                    req.removeListener("end", onEnd as any);
                                    return cb(error);
                                });
                                req.on("data", onData = function(chunk) {
                                    if (buffer.length + chunk.length >= limit) {
                                        req.removeListener("error", onError as any);
                                        req.removeListener("data", onData as any);
                                        req.removeListener("end", onEnd as any);
                                        return cb(new Error("Too much data, limit is " + limit + "bytes"));
                                    }
                                    buffer += chunk;
                                });
                                req.on("end", onEnd = function() {
                                    req.removeListener("error", onError as any)
                                    req.removeListener("data", onData as any);
                                    req.removeListener("end", onEnd as any);
                                    cb(undefined, buffer);
                                });
                            }
                        });
                } catch(e) {}
                try {
                    if(req.io)
                        Object.defineProperty(req, "processBody", {
                            configurable: true,
                            value: function(cb: (err?: Error) => void, ...processors: nexusframework.BodyProcessor[]) {
                                cb();
                            }
                        });
                    else
                        Object.defineProperty(req, "processBody", {
                            configurable: true,
                            value: function(cb: (err?: Error) => void, ...processors: nexusframework.BodyProcessor[]) {
                                const contentType = req.get("content-type");
                                if (!processors.length)
                                    processors = [nexusframework.BodyProcessor.URLEncoded, nexusframework.BodyProcessor.JSONBody, nexusframework.BodyProcessor.MultipartFormData];
                                req.body = {};
                                try {
                                    processors.forEach(function(processor) {
                                        switch(processor) {
                                            case nexusframework.BodyProcessor.JSONBody:
                                                if (/\/(x\-)?json$/.test(contentType)) {
                                                    req.readBody(function(err, data) {
                                                        if(err)
                                                            return cb(err);
                                                        try {
                                                            req.body = JSON.parse(data);
                                                            cb();
                                                        } catch(e) {
                                                            cb(e);
                                                        }
                                                    });
                                                    throw true;
                                                }
                                                break;
                                            case nexusframework.BodyProcessor.URLEncoded:
                                                if (/\/(((x\-)?www\-)?form\-)?urlencoded$/.test(contentType)) {
                                                    req.readBody(function(err, data) {
                                                        if(err)
                                                            return cb(err);
                                                        try {
                                                            req.body = querystring.parse(data);
                                                            cb();
                                                        } catch(e) {
                                                            cb(e);
                                                        }
                                                    });
                                                    throw true;
                                                }
                                                break;
                                            case nexusframework.BodyProcessor.MultipartFormData:
                                                if (/multipart\/form\-data(;.+)?$/.test(contentType)) {
                                                    multerInstance(req, res, cb);
                                                    throw true;
                                                }
                                                break;
                                        }
                                    });
                                    cb(new Error("Unsupported content submitted"));
                                } catch(e) {
                                    if(e !== true)
                                        throw e;
                                }
                            }
                        });
                } catch(e) {}
                var pagesys: boolean;
                if(req.xhr || req.io) {
                    try {
                        res.locals.xhrOrIO = true;
                    } catch(e) {}
                    try {
                        Object.defineProperty(req, "xhrOrIO", {
                            value: true
                        });
                    } catch(e) {}
                    if (req.accepts("json")) {
                        pagesys = true;
                        try {
                            res.locals.pagesys = true;
                        } catch (e) {}
                        try {
                            Object.defineProperty(req, "pagesys", {
                                configurable: true,
                                value: true
                            });
                        } catch (e) {}
                    }
                }
                try {
                    res.locals.basehref = this.prefix;
                } catch (e) {}
                const generator = "NexusFramework " + pkgjson.version;
                try {
                    res.header("X-Generator", generator);
                } catch(e) {}
                try {
                    res.locals.generator = generator;
                } catch(e) {}
                try {
                    res.locals.frameworkVersion = pkgjson.version;
                } catch(e) {}
                var noScript = !pagesys && ((req.cookies && req.cookies.noscript) || (req.body && req.body.noscript) || req.query.noscript);
                var useLoader = pagesys || (this.loaderEnabled && !noScript);
                var ua: useragent.Details & useragent.Agent & {es6?:boolean,legacy?:boolean} = useragent.parse(req.get("user-agent")) as any;
                _.extend(ua, useragent.is(req.get("user-agent")));
                try {
                    Object.defineProperty(res, "useragent", {
                        configurable: true,
                        value: ua
                    });
                } catch(e) {}
                try {
                    res.locals.useragent = ua;
                } catch(e) {}
                const legacy = isUnsupportedBrowser(ua);
                const es6 = !legacy && isES6Browser(ua);
                const scriptDir = legacy ? "legacy" : (es6 ? "es6" : "es5");
                if (legacy) {
                    if(this.logging)
                        req.logger.warn("Legacy browser detected");
                    ua.legacy = true;
                } else if(es6)
                    ua.es6 = true;
                if (useLoader && !pagesys && legacy)
                    useLoader = false;
                var meta: {[index: string]: string} = {generator};
                var footerRenderers: Function[] = this.footer.slice(0);
                var headerRenderers: Function[] = this.header.slice(0);
                var afterbodyRenderers: Function[] = this.afterbody.slice(0);
                var gfonts: {[index: string]: string[]} = {};
                var scripts: Resource[] = [];
                var styles: Resource[] = [];
                try {
                    Object.defineProperty(res, "enableLoader", {
                        configurable: true,
                        value: function() {
                            useLoader = true;
                        }
                    });
                } catch(e) {}
                try {
                    Object.defineProperty(res, "addGoogleFont", {
                        configurable: true,
                        value: (family: string, weight?: number, italic?: boolean) => {
                            var font = gfonts[family];
                            if (!font)
                                font = gfonts[family] = [];
                            var style: string = "" + (weight || 400);
                            if(italic)
                                style += "i";
                            if(font.indexOf(style) == -1)
                                font.push(style);
                        }
                    });
                } catch(e) {}
                
                const addScript = function(source: string, version?: string, ...deps: string[]) {
                    for(var i=0; i<scripts.length; i++) {
                        const script = scripts[i];
                        if (script.source === source) {
                            if (deps.length) {
                                Array.prototype.push.apply(script, deps);
                                script.deps = _.uniq(script.deps);
                            }
                            script.version = version;
                            return;
                        }
                    }
                    scripts.push({
                        name: determineName(source),
                        source,
                        version,
                        deps
                    });
                }
                const addSocketIOClient = () => {
                    addScript(upath.join(this.prefix, ":io/socket.io.js"), sckclpkgjson.version);
                };
                try {
                    Object.defineProperty(res, "addSocketIOClient", {
                        configurable: true,
                        value: addSocketIOClient
                    });
                } catch(e) {}
                const addInlineScript = function(source: string, ...deps: string[]) {
                    scripts.push({
                        name: "inline-" + stringHash(source),
                        source,
                        inline: true,
                        deps
                    })
                };
                try {
                    Object.defineProperty(res, "addInlineScript", {
                        configurable: true,
                        value: addInlineScript
                    });
                } catch(e) {}
                try {
                    Object.defineProperty(res, "addNexusFrameworkClient", {
                        configurable: true,
                        value: (includeSocketIO = true) => {
                            const path = upath.join(this.prefix, ":scripts/" + scriptDir + "/nexusframework.min.js");
                            if(includeSocketIO) {
                                addSocketIOClient();
                                addScript(path, pkgjson.version, "socket.io");
                            } else
                                addScript(path, pkgjson.version);
                        }
                    });
                } catch(e) {}
                try {
                    Object.defineProperty(res, "addScript", {
                        configurable: true,
                        value: addScript
                    });
                } catch(e) {}
                try {
                    Object.defineProperty(res, "addFooterRenderer", {
                        configurable: true,
                        value: function(renderer) {
                            footerRenderers.push(renderer instanceof Function ? renderer : function(out) {
                                out.write("" + renderer);
                            });
                        }
                    });
                } catch(e) {}
                try {
                    Object.defineProperty(res, "addBodyClassName", {
                        configurable: true,
                        value: function(name: string) {
                            const classRegex = new RegExp("(^|\\s+)" + name.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + "(\\s+|$)", "g");
                            if(!classRegex.test(res.locals.bodyclass))
                                res.locals.bodyclass = (res.locals.bodyclass + " " + name).trim();
                        }
                    });
                } catch(e) {}
                try {
                    Object.defineProperty(res, "removeBodyClassName", {
                        configurable: true,
                        value: function(name: string) {
                            const classRegex = new RegExp("(^|\\s+)" + name.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + "(\\s+|$)", "g");
                            res.locals.bodyclass = res.locals.bodyclass.replace(classRegex, function(match, p1) {
                                return /^\s.+\s$/.test(match) ? " " : "";
                            });
                        }
                    });
                } catch(e) {}
                try {
                    Object.defineProperty(res, "addAfterBodyRenderer", {
                        configurable: true,
                        value: function(renderer) {
                            afterbodyRenderers.push(renderer instanceof Function ? renderer : function(out) {
                                out.write("" + renderer);
                            });
                        }
                    });
                } catch(e) {}
                try {
                    Object.defineProperty(res, "addStyle", {
                        configurable: true,
                        value: function(source: string, version?: string, ...deps: string[]) {
                            for(var i=0; i<styles.length; i++) {
                                const style = styles[i];
                                if (style.source === source) {
                                    style.version = version;
                                    return;
                                }
                            }
                            styles.push({
                                name: determineName(source),
                                source,
                                version,
                                deps
                            });
                        }
                    });
                } catch(e) {}
                try {
                    Object.defineProperty(res, "addInlineStyle", {
                        configurable: true,
                        value: function(source: string, ...deps: string[]) {
                            styles.push({
                                name: "inline-" + stringHash(source),
                                source,
                                inline: true,
                                deps
                            })
                        }
                    });
                } catch(e) {}
                try {
                    Object.defineProperty(res, "addHeaderRenderer", {
                        configurable: true,
                        value: function(renderer) {
                            headerRenderers.push(renderer instanceof Function ? renderer : function(out) {
                                out.write("" + renderer);
                            });
                        }
                    });
                } catch(e) {}
                try {
                    Object.defineProperty(res, "setMetaTag", {
                        configurable: true,
                        value: function(name: string, value: string) {
                            name = name.toLowerCase();
                            if (value)
                                meta[name] = value;
                            else
                                delete meta[name];
                        }
                    });
                } catch(e) {}
                var servedLoader: boolean;
                var servedAfterBody: boolean;
                try {
                    const writeafterbody = res.locals.__writeafterbody = (out: NodeJS.WritableStream) => {
                        afterbodyRenderers.forEach(function(renderer) {
                            renderer(out);
                        });
                        if (useLoader) {
                            const locals = res.locals;
                            locals.progressContainerHead = locals.progressContainerHead || "";
                            locals.progressContainerFoot = locals.progressContainerFoot || "";
                            locals.loaderJSRequiredTitle = locals.loaderJSRequiredTitle || "JavaScript Required";
                            locals.loaderJSRequiredMessage = locals.loaderJSRequiredMessage || "Sorry but, this website requires scripts!";

                            overlayHtmlParts.forEach(function(step) {
                                step(out, locals);
                            });
                            servedLoader = true;
                        }
                        servedAfterBody = true;
                        try {
                            out['flush']();
                        } catch(e) {}
                    };
                    Object.defineProperty(res, "writeAfterBodyHtml", {
                        value: function(out?) {
                            writeafterbody(out || res);
                        }
                    });
                } catch(e) {}
                const getLoaderData = function() {
                    const resarray: (Resource & {type: string})[] = [];
                    const gfontkeys = Object.keys(gfonts);
                    if(gfontkeys.length) {
                        var gfonturl = "https://fonts.googleapis.com/css?family=";
                        // Barlow|Barlow+Condensed:100i|Lato:100,900|Slabo+27px
                        var first = true;
                        gfontkeys.forEach(function(font) {
                            if(first)
                                first = false;
                            else
                                gfonturl += "|";
                            const styles = gfonts[font];
                            gfonturl += encodeURIComponent(font);

                            if (styles.length == 1 && styles[0] == "400")
                                return;

                            gfonturl += ":";
                            gfonturl += styles.join(",");
                        });
                        styles.unshift({
                            name: "google-fonts",
                            source: gfonturl,
                            version: "1.0",
                            deps: []
                        })
                    }

                    const alreadySent: string[] = req.io && (req.io['__sent_resources'] || (req.io['__sent_resources'] = []));
                    const skip = alreadySent ? function(resource: (Resource & {type: string})) {
                        const key = resource.type + ":" + resource.name;
                        if (alreadySent.indexOf(key) > -1)
                            return true;
                        alreadySent.push(key);
                        return false;
                    } : function() {return false;};
                    styles.forEach(function(style) {
                        style['type'] = "style";
                        if (skip(style as any))
                            return;
                        resarray.push(style as any);
                    });
                    scripts.forEach(function(script) {
                        script['type'] = "script";
                        if (skip(script as any))
                            return;
                        resarray.push(script as any);
                    });

                    return resarray;
                };
                try {
                    Object.defineProperty(res, "getLoaderData", {
                        value: getLoaderData
                    });
                } catch(e) {}
                try {
                    const writefooter = res.locals.__writefooter = (out: NodeJS.WritableStream) => {
                        if (!servedAfterBody)
                            afterbodyRenderers.forEach(function(renderer) {
                                renderer(out);
                            });
                        if (!noScript) {
                            const user = req.user;
                            if (user)
                                addInlineScript("NexusFramework['currentUserID'] = " + JSON.stringify("" + (user.id || user.email || user.displayName || "Logged")), "nexusframework");
                            if (useLoader) {
                                if (!servedLoader) {
                                    const locals = res.locals;
                                    locals.progressContainerHead = locals.progressContainerHead || "";
                                    locals.progressContainerFoot = locals.progressContainerFoot || "";
                                    locals.loaderJSRequiredTitle = locals.loaderJSRequiredTitle || "JavaScript Required";
                                    locals.loaderJSRequiredMessage = locals.loaderJSRequiredMessage || "Sorry but, this website requires scripts!";

                                    overlayHtmlParts.forEach(function(step) {
                                        step(out, locals);
                                    });
                                }
                            } else {
                                // TODO: Sort dependencies
                                scripts.forEach(function(script) {
                                    if(script.inline) {
                                        out.write("<script type=\"text/javascript\">");
                                        out.write(script.source);
                                        out.write("</script>");
                                    } else {
                                        out.write("<script type=\"text/javascript\" src=\"");
                                        if(script.version) {
                                            var _url = url.parse(script.source, true);
                                            _url.query = _url.query || {};
                                            _url.query.v = script.version;
                                            script.source = url.format(_url);
                                        }
                                        out.write(encodeHTML(url.format(script.source), true));
                                        out.write("\"></script>");
                                    }
                                });
                            }
                        }
                        footerRenderers.forEach(function(renderer) {
                            renderer(out);
                        });
                        if(useLoader) {
                            if (!pagesys) {
                                out.write("<script type=\"text/javascript\">");
                                out.write(es6 ? loaderScriptEs6 : loaderScriptEs5);
                                out.write("</script>");
                            }
                            out.write("<script type=\"text/javascript\">NexusFrameworkLoader.load(");
                            out.write(JSON.stringify(getLoaderData()));
                            out.write(")</script>");
                        }
                    };
                    Object.defineProperty(res, "writeFooterHtml", {
                        value: function(out?) {
                            writefooter(out || res);
                        }
                    });
                } catch(e) {}
                try {
                    const writeheader = res.locals.__writeheader = (out: NodeJS.WritableStream) => {
                        if (req.method.toUpperCase() === "GET") {
                            if (noScript) {
                                try {
                                    res.cookie("noscript", "true", {expires:new Date(+(new Date) + 3.154e+10)});
                                } catch(e) {}
                                const _url = url.parse(req.originalUrl, true);
                                _url.query = _url.query || {};
                                out.write('<script>document.cookie=\"noscript=; Path=/; Expires=Thu, 1 Nov 1970 00:00:00 GMT\";location.href = ');
                                delete _url.query.noscript;
                                _url.search = "?" + querystring.stringify(_url.query);
                                if (_url.search == "?") {
                                    _url.search = undefined;
                                    _url.path = _url.pathname;
                                } else
                                    _url.path = _url.pathname + _url.search;
                                delete _url.href;
                                out.write(JSON.stringify(url.format(_url)));
                                out.write('</script>');
                            } else {
                                out.write('<noscript><meta http-equiv="refresh" content="0; url=\'');
                                const _url = url.parse(req.originalUrl, true);
                                _url.query = _url.query || {};
                                _url.query.noscript = "1";
                                out.write(encodeHTML(url.format(_url), true));
                                out.write('\'" /></noscript>');
                            }
                        }

                        Object.keys(meta).forEach(function(key) {
                            out.write("<meta name=\"");
                            out.write(encodeHTML(key, true));
                            out.write("\" value=\"");
                            out.write(encodeHTML(meta[key]));
                            out.write("\" />");
                        })

                        if(useLoader) {
                            if (!pagesys) {
                                out.write("<style>");
                                out.write(overlayCss);
                                out.write("</style>");
                            }
                        } else {
                            const gfontkeys = Object.keys(gfonts);
                            if(gfontkeys.length) {
                                out.write("<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css?family=");
                                // Barlow|Barlow+Condensed:100i|Lato:100,900|Slabo+27px
                                var first = true;
                                gfontkeys.forEach(function(font) {
                                    if(first)
                                        first = false;
                                    else
                                        out.write("|");
                                    const styles = gfonts[font];
                                    out.write(encodeURIComponent(font));

                                    if (styles.length == 1 && styles[0] == "400")
                                        return;

                                    out.write(":");
                                    out.write(styles.join(","));
                                })
                                out.write("\">");
                            }
                            // TODO: Sort dependencies
                            styles.forEach(function(style) {
                                if (style.inline) {
                                    out.write("<style>");
                                    out.write(style.source);
                                    out.write("</style>");
                                } else {
                                    out.write("<link rel=\"stylesheet\" href=\"");
                                    if(style.version) {
                                        var _url = url.parse(style.source, true);
                                        _url.query = _url.query || {};
                                        _url.query.v = style.version;
                                        style.source = url.format(_url);
                                    }
                                    out.write(encodeHTML(url.format(style.source), true));
                                    out.write("\">");
                                }
                            });
                        }
                        headerRenderers.forEach(function(renderer) {
                            renderer(out);
                        });
                    };
                    Object.defineProperty(res, "writeFooterHtml", {
                        value: function(out?) {
                            writeheader(out || res);
                        }
                    });
                } catch(e) {}
                try {
                    res.locals.bodyclass = "";
                } catch(e) {}
                try {
                    res.locals.title = "Title Not Set";
                } catch(e) {}
                try {
                    const render = res.render;
                    Object.defineProperty(res, "render", {
                        value: (filename: string, options: any, callback?: (err: Error, html?: string) => void) => {
                            if (options instanceof Function)
                                callback = options;
                            if (this.app.get("view engine") == "nhp") {
                                var vars = {};
                                _.extend(vars, res.app.locals);
                                _.extend(vars, res.locals);
                                if (options)
                                    _.extend(vars, options);
                                this.nhp.render(filename, vars, callback);
                            } else
                                render.call(res, filename, options, callback);
                        }
                    })
                } catch(e) {}
                try {
                    Object.defineProperty(res, "sendRender", {
                        configurable: true,
                        value: (filename: string, options: any) => {
                            if (req.app.get("view engine") == "nhp") {
                                var vars = {};
                                _.extend(vars, res.app.locals);
                                _.extend(vars, res.locals);
                                if (options)
                                    _.extend(vars, options);
                                if (pagesys) {
                                    const pagesysskeleton = req.pagesysskeleton || this.pagesysskeleton;
                                    if(pagesysskeleton) {
                                        pagesysskeleton(filename, vars, req, res, function(err, data) {
                                            if (err)
                                                next(err);
                                            else if(data)
                                                res.json(data);
                                            else
                                                next(new Error("Server Error: No data passed"));
                                        });
                                        return;
                                    }
                                }

                                const out = req.io ? res : new BufferingWritable(res);
                                const callback = function (err?: Error) {
                                    if (err)
                                        next(err);
                                    else
                                        out.end();
                                };
                                const skeleton = (legacy && (req.legacyskeleton || this.legacyskeleton)) || req.skeleton || this.skeleton;
                                if (!res.get("content-type"))
                                    res.type("text/html; charset=utf-8"); // Default to utf8 html
                                if(skeleton) {
                                    vars['page'] = filename;
                                    skeleton.renderToStream(vars, out, callback);
                                } else
                                    this.nhp.renderToStream(filename, vars, out, callback);
                            } else
                                res.render(filename, options, function (err?: Error, html?: string) {
                                    if (err)
                                        next(err);
                                    else {
                                        var buff = Buffer.from(html, "utf8");
                                        res.writeHead(200, {
                                            "Content-Length": buff.length
                                        });
                                        if (req.method == "HEAD")
                                            res.end();
                                        else
                                            res.end(buff);
                                    }
                                });
                        }
                    });
                } catch (e) {}
                if (errordoc && Object.keys(errordoc).length) {
                    const builtInSendStatus = res.sendStatus.bind(req);
                    const used: {[index: string]: boolean} = {};
                    try {
                        Object.defineProperty(res, "sendStatus", {
                            configurable: true,
                            value: (code: number, _err?: Error) => {
                                var st = "" + code;
                                var handler: string;
                                if (!used[st] && (handler = (errordoc[st] || errordoc["*"]))) {
                                    used[st] = true;
                                    try {
                                        res.locals.errorCode = code;
                                    } catch (e) {}
                                    try {
                                        Object.defineProperty(req, "errorCode", {
                                            configurable: true,
                                            value: code
                                        });
                                    } catch (e) {}
                                    try {
                                        res.locals.error = _err;
                                    } catch (e) {}
                                    try {
                                        Object.defineProperty(req, "error", {
                                            configurable: true,
                                            value: _err
                                        });
                                    } catch (e) {}
                                    res.status(code);
                                    res.addBodyClassName("error-page");
                                    res.addBodyClassName("error-" + code);
                                    req.url = url.resolve("/", handler);
                                    this.root.handle(req, res, function (err?: Error) {
                                        if (err)
                                            next(err);
                                        else
                                            builtInSendStatus(code, _err);
                                    });
                                } else
                                    builtInSendStatus(code, _err);
                            }
                        });
                    } catch (e) {}
                    if ("500" in errordoc || "*" in errordoc) {
                        const builtInSendFailure = res.sendFailure && res.sendFailure.bind(req);
                        try {
                            const used: {[index: string]: boolean} = {};
                            Object.defineProperty(res, "sendFailure", {
                                configurable: true,
                                value: (_err?: Error) => {
                                    var handler: string;
                                    if (!used["500"] && (handler = (errordoc["500"] || errordoc["*"]))) {
                                        used["500"] = true;
                                        handler = upath.join("/", handler);
                                        try {
                                            Object.defineProperty(req, "errorCode", {
                                                configurable: true,
                                                value: 500
                                            });
                                        } catch (e) {}
                                        try {
                                            res.locals.errorCode = 500;
                                        } catch (e) {}
                                        try {
                                            Object.defineProperty(req, "error", {
                                                configurable: true,
                                                value: _err
                                            });
                                        } catch (e) {}
                                        try {
                                            res.locals.error = _err;
                                        } catch (e) {}
                                        res.status(500);
                                        res.addBodyClassName("error-page");
                                        res.addBodyClassName("error-500");
                                        req.url = url.resolve("/", handler);
                                        this.root.handle(req, res, function (err?: Error) {
                                            if (err)
                                                next(err);
                                            else
                                                builtInSendFailure(_err);
                                        });
                                    } else
                                        builtInSendStatus(_err);
                                }
                            });
                        } catch (e) {}
                    }
                }
                async.eachSeries(this.stack, function(entry, cb) {
                    entry(req, res, cb);
                }, (err: Error) => {
                    const user = req.user;
                    const userName = user ? ("`" + (user.displayName || user.email || user.id || "Logged") + "`") : "Guest";
                    const type = pagesys ? "PageSystem" : (req.io ? "Socket.IO" : (req.xhr ? "XHR" : "Standard"));
                    if(err) {
                        if (this.logging)
                            req.logger.warn(req.method, req.ip || "`Unknown IP`", userName, "`" + (req.get("user-agent") || "User-Agent Not Set") + "`", req.get("content-length") || 0, type, err);
                        next(err);
                    } else {
                        if (this.logging) 
                            req.logger.info(req.method, req.ip || "`Unknown IP`", userName, "`" + (req.get("user-agent") || "User-Agent Not Set") + "`", req.get("content-length") || 0, type);
                        if (user) {
                            const id = user.id || user.email || user.displayName || "Logged";
                            res.set("X-User", "" + id);
                        }
                        this.root.handle(req, res, next);
                    }
                });
            });
        } else
            next();
    }
    
    public use(middleware: nexusframework.RequestHandler) {
        this.stack.push(middleware);
    }
   
    private nexusforkUpgrade(req: express.Request, res: express.Response) {
        try {
            Object.defineProperty(req, "services", {
                value: {
                    open(service: string, cb: (err: Error, comm?: any) => void): void {
                        cb(new Error("Not running through NexusFork"));
                    },
                    emitWithErrorHandler(service: string, event: string, onerror: (err: Error) => void, ...args: any[]): void {
                        onerror(new Error("Not running through NexusFork"));
                    },
                    emit(service: string, event: string, ...args: any[]): void {}
                }
            });
        } catch (e) {}
    }
    /**
     * Express compatible handler
     */
    public __express(req: express.Request, res: express.Response, next: express.NextFunction) {
        this.nexusforkUpgrade(req, res);
        this.handle(req as any, res as any, next);
    }
    private expressUpgrade(req: http.IncomingMessage, res: http.ServerResponse) {
        req['res'] = res;
        req['app'] = this.app;
        req['is'] = express_req.is;
        req['get'] = express_req.get;
        req['originalUrl'] = req.url;
        req['range'] = express_req.range;
        req['param'] = express_req.param;
        req['header'] = express_req.header;
        req['accepts'] = express_req.accepts;
        req['acceptsCharsets'] = express_req.acceptsCharsets;
        req['acceptsEncodings'] = express_req.acceptsEncodings;
        req['acceptsLanguages'] = express_req.acceptsLanguages;
        Object.defineProperty(req, "ip", Object.getOwnPropertyDescriptor(express_req, "ip"));
        Object.defineProperty(req, "ips", Object.getOwnPropertyDescriptor(express_req, "ips"));
        Object.defineProperty(req, "host", Object.getOwnPropertyDescriptor(express_req, "host"));
        Object.defineProperty(req, "hostname", Object.getOwnPropertyDescriptor(express_req, "hostname"));
        Object.defineProperty(req, "subdomains", Object.getOwnPropertyDescriptor(express_req, "subdomains"));
        res['req'] = req;
        res['app'] = this.app;
        res['vary'] = express_res.vary;
        res['status'] = express_res.status;
        res['sendStatus'] = express_res.sendStatus;
        res['contentType'] = express_res.contentType;
        res['clearCookie'] = express_res.clearCookie;
        res['redirect'] = express_res.redirect;
        res['location'] = express_res.location;
        res['cookie'] = express_res.cookie;
        res['format'] = express_res.format;
        res['header'] = express_res.header;
        res['jsonp'] = express_res.jsonp;
        res['links'] = express_res.links;
        res['send'] = express_res.send;
        res['type'] = express_res.type;
        res['append'] = express_res['append'];
        res['set'] = express_res.set;
        res['get'] = express_res.get;
        res['attachment'] = notSupported;
        res['sendfile'] = notSupported;
        res['sendFile'] = notSupported;
        res['download'] = notSupported;
    }
    /**
     * HTTP compatible handler
     */
    public __http(req: http.IncomingMessage, res: http.ServerResponse, next: express.NextFunction) {
        this.expressUpgrade(req, res);
        this.__express(req as any, res as any, next);
    }
    
    public close(cb?: Function) {
        this.server.close(cb);
    }
}