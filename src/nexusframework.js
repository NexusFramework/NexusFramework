"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cookieParser = require("cookie-parser");
const querystring = require("querystring");
const lrucache = require("lru-weak-cache");
const Template_1 = require("nhp/lib/Template");
const nulllogger = require("nulllogger");
const socket_io = require("socket.io");
const useragent = require("useragent");
const statuses = require("statuses");
const chokidar = require("chokidar");
const express = require("express");
const mime = require("mime-magic");
const events = require("events");
const stream = require("stream");
const multer = require("multer");
const moment = require("moment");
const async = require("async");
const sharp = require("sharp");
const http = require("http");
const _path = require("path");
const bson = require("bson");
const _ = require("lodash");
const url = require("url");
const nhp = require("nhp");
const fs = require("fs");
const os = require("os");
const BSON = new bson;
const noop = function () { };
const mainpkgversion = (function () {
    try {
        return require(_path.resolve(_path.dirname(require.main.filename), "package.json")).version;
    }
    catch (e) {
        return "Unknown";
    }
})();
const iconSizes = [310, 196, 152, 150, 144, 128, 120, 114, 96, 76, 72, 70, 64, 60, 57, 48, 24, 16, 32];
const socket_io_slim_js = require.resolve("socket.io-client/dist/socket.io.slim.js");
const has_slim_io_js = fs.existsSync(socket_io_slim_js);
var socket_io_slim_path;
var socket_io_slim_integrity;
const sckclpkgjson = require("socket.io-client/package.json");
if (has_slim_io_js) {
    socket_io_slim_path = ":scripts/socket.io.slim.js?v=" + sckclpkgjson.version;
    // try {
    //     const hash = crypto.createHash("sha512");
    //     hash.update(fs.readFileSync(socket_io_slim_js, "utf8"));
    //     socket_io_slim_integrity = "sha512-" + hash.digest("base64");
    // } catch(e) {
    //     console.warn(e);
    // }
}
else
    socket_io_slim_path = ":io/socket.io.js";
var bson_path;
const bson_js = require.resolve("bson/dist/bson.js");
const bsonpkgjson = require("bson/package.json");
if (bson_js) {
    bson_path = ":scripts/bson.js?v=" + bsonpkgjson.version;
    // try {
    //     const hash = crypto.createHash("sha512");
    //     hash.update(fs.readFileSync(socket_io_slim_js, "utf8"));
    //     socket_io_slim_integrity = "sha512-" + hash.digest("base64");
    // } catch(e) {
    //     console.warn(e);
    // }
}
else
    throw new Error("Could not resolve bson.js");
var nexusframeworkclient_es5_integrity;
var nexusframeworkclient_es6_integrity;
try {
    // let hash = crypto.createHash("sha512");
    // hash.update(fs.readFileSync(_path.resolve(__dirname, "../scripts/es5/nexusframeworkclient.min.js"), "utf8"));
    // nexusframeworkclient_es5_integrity = "sha512-" + hash.digest("base64");
    // hash = crypto.createHash("sha512");
    // hash.update(fs.readFileSync(_path.resolve(__dirname, "../scripts/es6/nexusframeworkclient.min.js"), "utf8"));
    // nexusframeworkclient_es6_integrity = "sha512-" + hash.digest("base64");
}
catch (e) {
    console.warn(e);
}
const cacheAge = parseInt(process.env.NEXUSFRAMEWORK_CACHE_MIN_AGE) || 600000;
const cacheCapacity = parseInt(process.env.NEXUSFRAMEWORK_CACHE_CAPACITY) || 800;
const cacheOpts = { capacity: cacheCapacity, minAge: cacheAge, resetTimersOnAccess: true };
const uacache = new lrucache(cacheOpts);
const namecache = new lrucache(cacheOpts);
const padLeft = function (data, count = 8, using = "0") {
    while (data.length < count)
        data = using + data;
    return data;
};
const stringHash = function (data) {
    if (data.length === 0)
        return "00000000";
    var hash = 0;
    for (var i = 0; i < data.length; i++)
        hash = (((hash << 5) - hash) + data.charCodeAt(i)) | 0;
    return padLeft(hash.toString(16));
};
const determineName = function (rawname) {
    const cached = namecache.get(rawname);
    if (cached)
        return cached[0];
    var name = rawname;
    var index = name.lastIndexOf("/");
    if (index > -1)
        name = name.substring(index + 1);
    var match = name.match(/^(([a-z][a-z0-9]*[\-_\.]?)+)\.(css|js)(\?.*)?$/i);
    if (match)
        name = match[1];
    else
        name = name.replace(/\.(css|js)(\?.*)?$/i, "");
    if (/\.min$/.test(name))
        name = name.substring(0, name.length - 4);
    if (/\.slim$/.test(name))
        name = name.substring(0, name.length - 5);
    if (/\.umd$/.test(name))
        name = name.substring(0, name.length - 4);
    match = name.match(/^(.+)\-\d+([\.\-]\d)*$/);
    if (match)
        name = match[1];
    namecache.set(rawname, [name]);
    return name;
};
const isUnsupportedBrowser = function (browser) {
    const major = parseInt(browser.major);
    return (browser.ie && major < 10) ||
        (browser.chrome && major < 4) ||
        (browser.firefox && major < 3) ||
        (browser.safari && major < 3 && parseInt(browser.minor) < 1) ||
        (browser.opera && major < 3 && parseInt(browser.minor) < 5);
};
const isES6Browser = function (browser) {
    const major = parseInt(browser.major);
    return (browser.chrome && major >= 49) ||
        (browser.firefox && major >= 45) ||
        (browser.safari && major >= 9) ||
        (browser.opera && major >= 43);
};
const regexp_escape = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;
const pkgjson = require(_path.resolve(__dirname, "../package.json"));
const overlayCss = fs.readFileSync(_path.resolve(__dirname, "../loader/overlay.css"), "utf8").replace(/\s*\/\*# sourceMappingURL=overlay.css.map \*\/\s*/, "");
const overlayHtml = fs.readFileSync(_path.resolve(__dirname, "../loader/overlay.html"), "utf8");
const loaderScriptEs5 = fs.readFileSync(_path.resolve(__dirname, "../scripts/es5/loader.min.js"), "utf8").replace(/\s+\/\/# sourceMappingURL=.+\s*/, "");
const loaderScriptEs6 = fs.readFileSync(_path.resolve(__dirname, "../scripts/es6/loader.min.js"), "utf8").replace(/\s+\/\/# sourceMappingURL=.+\s*/, "");
const overlayHtmlParts = [];
(function (html) {
    var next;
    while ((next = html.indexOf("{{")) > -1) {
        const left = html.substring(0, next);
        overlayHtmlParts.push(function (out) {
            out.write(left);
        });
        const end = html.indexOf("}}");
        const key = html.substring(next + 2, end);
        overlayHtmlParts.push(function (out, vars) {
            out.write(vars[key]);
        });
        html = html.substring(end + 2);
    }
    overlayHtmlParts.push(function (out) {
        out.write(html);
    });
})(overlayHtml);
const express_req = express['request'];
const express_res = express['response'];
const createInstall = function (proto) {
    const names = Object.getOwnPropertyNames(proto);
    const queue = [];
    names.forEach(function (key) {
        try {
            const descriptor = Object.getOwnPropertyDescriptor(proto, key);
            queue.push(function (target) {
                if (!(key in target))
                    Object.defineProperty(target, key, descriptor);
            });
        }
        catch (e) {
            const val = proto[key];
            queue.push(function (target) {
                if (!(key in target))
                    target[key] = val;
            });
        }
    });
    return function (target) {
        queue.forEach(function (copy) {
            copy(target);
        });
    };
};
const express_req_install = createInstall(express_req);
const express_res_install = createInstall(express_res);
class SocketIORequest extends events.EventEmitter {
    constructor(upgradedRequest, method, path, body, headers) {
        super();
        this.readableHighWaterMark = 0;
        this.pagesys = true;
        this.method = method;
        this.originalUrl = this.url = _path.posix.join("/", path);
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
        if (!this.headers['accepts']) {
            this.headers['accepts'] = "application/json,text/json,text/html;q=0.95,application/xhtml+xml,application/xml;q=0.8,text/*;q=0.7";
            const accepts = upgradedRequest.headers['accepts'];
            if (accepts && /\Wimage\/webp\W/.test(Array.isArray(accepts) ? accepts[0] : accepts))
                this.headers['accepts'] += ",image/webp";
        }
        this.body = body;
    }
    push(...args) { throw new Error("Not supported"); }
    wrap() { throw new Error("Not supported"); }
    pipe(...args) { throw new Error("Not supported"); }
    unshift() { throw new Error("Not supported"); }
    unpipe() { throw new Error("Not supported"); }
    isPaused() { return false; }
    read(...args) { throw new Error("Not supported"); }
    _read(...args) { throw new Error("Not supported"); }
    pause(...args) { }
    resume(...args) { }
    setTimeout(...args) { return this; }
    setEncoding(...args) { return this; }
    addListener(event, listener) {
        super.addListener(event, listener);
        if (event == "end" || event == "done")
            listener();
        return this;
    }
    [Symbol.asyncIterator]() {
        throw new Error("Not supported");
    }
    get rawHeaders() {
        var rawHeaders = [];
        Object.keys(this.headers).forEach((key) => {
            rawHeaders.push(key + ": " + this.headers[key]);
        });
        return rawHeaders;
    }
    _destroy() { }
    destroy() { }
}
class BufferingWritable extends stream.Writable {
    constructor(stream) {
        super();
        this.buffer = "";
        this.stream = stream;
    }
    _write(chunk, encoding, callback) {
        chunk = chunk.toString("utf8");
        if (this.buffer.length + chunk.length >= 4096)
            this.flush();
        this.buffer += chunk;
        callback();
    }
    _final(callback) {
        this.stream.end(this.buffer);
        delete this.buffer;
        callback();
    }
    flush() {
        this.stream.write(this.buffer);
        this.buffer = "";
    }
}
function notSupported(...args) {
    var cb = function (err) {
        throw err;
    };
    args.forEach(function (arg) {
        if (arg instanceof Function)
            cb = arg;
    });
    cb(new Error("Not supported"));
    return this;
}
class SocketIOResponse extends stream.Writable {
    constructor(cb) {
        super();
        this.headers = {};
        this.useChunkedEncodingByDefault = false;
        this.statusMessage = statuses[200];
        this.chunkedEncoding = false;
        this.shouldKeepAlive = true;
        this.headersSent = false;
        this.response = "";
        this.upgrading = false;
        this.statusCode = 200;
        this.charset = "utf8";
        this.sendDate = false;
        this.finished = false;
        // Express
        this.locals = {
            pagesys: true
        };
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
    hasHeader(key) {
        return key.toLowerCase() in this.headers;
    }
    removeHeader(key) {
        delete this.headers[key.toLowerCase()];
    }
    addTrailers(...args) {
        return this;
    }
    getHeader(key) {
        return this.headers[key.toLowerCase()];
    }
    setHeader(key, val) {
        this.headers[key.toLowerCase()] = val || "";
    }
    append(key, val) {
        key = key.toLowerCase();
        var list = this.headers[key];
        if (list) {
            if (Array.isArray(list))
                list.push(val);
            else
                this.headers[key] = [list, val];
        }
        else
            this.headers[key] = [val];
        return this;
    }
    writeHead(statusCode, reasonPhraseOrHeaders, headers) {
        this.statusCode = statusCode;
        this.statusMessage = statuses[statusCode] || String(statusCode);
        if (headers) {
            this.statusMessage = reasonPhraseOrHeaders;
        }
        else {
            headers = reasonPhraseOrHeaders;
        }
        if (headers)
            Object.keys(headers).forEach((key) => {
                this.setHeader(key, headers[key]);
            });
    }
    setTimeout(...args) { return this; }
    _write(data, encoding, cb) {
        const dat = data.toString("utf8");
        if (dat.length)
            this.response += dat;
        cb();
    }
    _final(callback) {
        const headers = {};
        Object.keys(this.headers).forEach((key) => {
            const val = this.headers[key];
            headers[key] = Array.isArray(val) ? val : [val];
        });
        this.cb({
            code: this.statusCode,
            message: this.statusMessage,
            data: this.response,
            headers
        });
        callback();
    }
    json(data) {
        this.response = data;
        this.end();
        return this;
    }
}
SocketIOResponse.prototype.writeContinue = notSupported;
SocketIOResponse.prototype.assignSocket = notSupported;
SocketIOResponse.prototype.detachSocket = notSupported;
function decodePath(path) {
    return path.replace(regexp_escape, "\\$&").replace(/%([a-z0-9]{2}|%)/g, function (match, p1, offset) {
        if (p1 === "%")
            return "%";
        return String.fromCharCode(parseInt(p1, 16));
    });
}
function stripPath(path) {
    return path.replace(/^\/|\/$/g, "");
}
function cleanPath(path) {
    return _path.posix.join("/", path).replace(/^\/|\/$/g, "");
}
function currentPath(req) {
    const path = stripPath(url.parse(req.url).pathname);
    const slash = path.indexOf('/');
    return slash > -1 ? path.substring(0, slash) : path;
}
function cutPath(req) {
    const path = req.url;
    const slash = path.indexOf('/', 1);
    return slash > -1 ? (path.substring(slash) || "/") : "/";
}
class RequestHandlerWithChildren {
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
    setRouteHandler(route) {
        this.route = route;
    }
    setAccessHandler(access) {
        this.access = access;
    }
    setExistsHandler(exists) {
        this.exists = exists;
    }
    index() {
        return this._index;
    }
    setIndex(index) {
        this._index = index;
    }
    handle(req, res, next) {
        const _next = () => {
            const _next = () => {
                const _next = () => {
                    const currentpath = currentPath(req);
                    if (currentpath)
                        async.eachSeries(this._children, function (handler, cb) {
                            var match = currentpath.match(handler.pattern);
                            if (match) {
                                req.logger.gears("Matched", handler.pattern, match);
                                const cmatch = req.match;
                                try {
                                    Object.defineProperty(req, "match", {
                                        configurable: true,
                                        value: match
                                    });
                                }
                                catch (e) { }
                                try {
                                    req.matches.push(match);
                                }
                                catch (e) { }
                                const curl = req.url;
                                req.url = cutPath(req);
                                handler.handle(req, res, function (err) {
                                    req.url = curl;
                                    try {
                                        req.matches.pop();
                                    }
                                    catch (e) { }
                                    try {
                                        Object.defineProperty(req, "match", {
                                            configurable: true,
                                            value: cmatch
                                        });
                                    }
                                    catch (e) { }
                                    cb(err);
                                });
                            }
                            else
                                cb();
                        }, next);
                    else if (this['_index']) {
                        var urlpath;
                        if (req.method.toUpperCase() === "GET" && !/\/(\?.*)?$/.test(urlpath = url.parse(req.originalUrl).path)) {
                            const q = urlpath.indexOf("?");
                            if (q == -1)
                                urlpath += "/";
                            else
                                urlpath = urlpath.substring(0, q) + "/" + urlpath.substring(q);
                            if (req.pagesys && /^\/:pagesys\//.test(urlpath))
                                urlpath = urlpath.substring(9);
                            return res.redirect(urlpath);
                        }
                        this['_index'].handle(req, res, (err, locals) => {
                            if (err)
                                res.sendFailure(err);
                            else if (locals) {
                                const view = this['views']["nhp"];
                                if (view)
                                    res.sendRender(view, locals);
                                else
                                    res.sendFailure(new Error("No view to render"));
                            }
                            else
                                next();
                        });
                    }
                    else
                        next();
                };
                if (this.access)
                    this.access(req, res, function (err) {
                        if (err)
                            res.sendFailure(err);
                        else
                            _next();
                    }, function () {
                        res.sendStatus(403);
                    });
                else
                    _next();
            };
            if (this.exists)
                this.exists(req, res, function (err) {
                    if (err)
                        res.sendFailure(err);
                    else
                        _next();
                }, next);
            else
                _next();
        };
        if (this.route)
            this.route(req, res, function (err, route) {
                if (err)
                    res.sendFailure(err);
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
    setView(filename, type = "nhp") {
        this.views[type] = filename;
    }
    children() {
        return this._children;
    }
    childPaths(cb, recursive) {
        var paths = [];
        if (recursive)
            async.eachSeries(this._children, function (child, cb) {
                try {
                    child.childPaths(function (_paths) {
                        _paths['unshift'](child.rawPattern);
                        paths.push(_paths);
                        cb();
                    }, true);
                }
                catch (e) {
                    paths.push(child.rawPattern);
                    cb();
                }
            }, function () {
                cb(paths);
            });
        else {
            this._children.forEach(function (child) {
                paths.push(child.rawPattern);
            });
            cb(paths);
        }
    }
    childAt(path, createIfNotExists) {
        path = cleanPath(path);
        if (path) {
            const slash = path.indexOf("/");
            const toFind = slash > -1 ? path.substring(0, slash) : path;
            try {
                this._children.forEach(function (child) {
                    if (child.rawPattern === toFind) {
                        throw child;
                    }
                });
            }
            catch (child) {
                if (slash > -1)
                    return child.childAt(path.substring(slash + 1), createIfNotExists);
                else
                    return child;
            }
            if (createIfNotExists) {
                const child = new RequestHandlerChildWithChildren(toFind);
                this._children.push(child);
                if (slash > -1)
                    return child.childAt(path.substring(slash + 1), createIfNotExists);
                else
                    return child;
            }
        }
        else
            throw new Error("path must be a valid path");
        return undefined;
    }
    setChild(path, handler, createIfNotExists) {
        path = cleanPath(path);
        if (path) {
            var slash = path.lastIndexOf("/");
            var toFind = slash > -1 ? path.substring(slash + 1) : path;
            if (toFind !== handler.rawPattern) {
                toFind = path;
                slash = -1;
            }
            if (slash > -1) {
                const child = this.childAt(path.substring(0, slash), createIfNotExists);
                if (child)
                    child.setChild(toFind, handler, createIfNotExists);
                else
                    throw new Error("Cannot resolve path, and createIfNotExists is false");
            }
            else {
                const childCount = this._children.length;
                for (var i = 0; i < childCount; i++) {
                    const child = this._children[i];
                    if (child.rawPattern === toFind) {
                        this._children[i] = handler;
                        child.destroy();
                        return;
                    }
                }
                this._children.push(handler);
            }
        }
        else
            throw new Error("path must be a valid path");
    }
    destroy() {
        this._children.forEach(function (child) {
            child.destroy();
        });
        if (this._index) {
            this._index.destroy();
            this._index = undefined;
        }
    }
}
class RequestHandlerChildWithChildren extends RequestHandlerWithChildren {
    constructor(pattern) {
        super();
        this.rawPattern = pattern;
        this.pattern = new RegExp("^" + pattern + "$", "i");
    }
}
class LeafRequestHandler {
    constructor(handler, actuallyLeaf = true) {
        this.handle = handler;
        this.leaf = actuallyLeaf;
    }
    children() {
        throw new Error("Leaf has no children.");
    }
    childPaths() {
        throw new Error("Leaf has no children.");
    }
    childAt(path, createIfNotExists) {
        throw new Error("Leaf has no children.");
    }
    setChild(path, handler, createIfNotExists) {
        throw new Error("Leaf has no children.");
    }
    view(type = "nhp") {
        return undefined;
    }
    setView(filename, type = "nhp") {
        throw new Error("Not supported.");
    }
    index() {
        return this;
    }
    setIndex(index) {
        throw new Error("Cannot change Leaf index.");
    }
    routeHandler() {
        return undefined;
    }
    accessHandler() {
        return undefined;
    }
    existsHandler() {
        return undefined;
    }
    setRouteHandler(index) {
        throw new Error("Cannot route Leafs.");
    }
    setAccessHandler(index) {
        throw new Error("Not supported.");
    }
    setExistsHandler(index) {
        throw new Error("Not supported.");
    }
    destroy() { }
}
exports.LeafRequestHandler = LeafRequestHandler;
class LeafRequestChildHandler extends LeafRequestHandler {
    constructor(handler, pattern, actuallyLeaf = true) {
        super(handler, actuallyLeaf);
        this.rawPattern = pattern;
        this.pattern = new RegExp("^" + pattern + "$", "i");
    }
}
class NHPRequestHandler extends LeafRequestHandler {
    constructor(impl, redirect = false) {
        super((req, res, next) => {
            const _next = () => {
                const _next = () => {
                    var urlpath;
                    if (redirect && !res.locals.errorCode && req.method.toUpperCase() === "GET" && /\/(\?.*)?$/.test(urlpath = url.parse(req.originalUrl).path)) {
                        const q = urlpath.indexOf("?");
                        if (q == -1)
                            urlpath = urlpath.substring(0, urlpath.length - 1);
                        else
                            urlpath = urlpath.substring(0, q - 1) + urlpath.substring(q);
                        if (req.pagesys && /^\/:pagesys\//.test(urlpath))
                            urlpath = urlpath.substring(9);
                        if (urlpath.length > req.sitePrefix.length)
                            return res.redirect(urlpath);
                    }
                    this.impl(req, res, (err, locals) => {
                        if (err)
                            next(err);
                        else if (locals) {
                            const view = this['views']["nhp"];
                            if (view)
                                res.sendRender(view, locals);
                            else
                                next(new Error("No view to render"));
                        }
                        else
                            next();
                    });
                };
                if (this.access)
                    this.access(req, res, function (err) {
                        if (err)
                            next(err);
                        else
                            _next();
                    }, function () {
                        res.sendStatus(403);
                    });
                else
                    _next();
            };
            if (this.exists)
                this.exists(req, res, function (err) {
                    if (err)
                        next(err);
                    else
                        _next();
                }, next);
            else
                _next();
        });
        this.views = {};
        this.impl = impl;
    }
    view(type = "nhp") {
        return this.views[type];
    }
    setView(filename, type = "nhp") {
        this.views[type] = filename;
    }
    accessHandler() {
        return this.access;
    }
    existsHandler() {
        return this.exists;
    }
    setAccessHandler(index) {
        this.access = index;
    }
    setExistsHandler(index) {
        this.exists = index;
    }
}
exports.NHPRequestHandler = NHPRequestHandler;
class NHPRequestChildHandler extends NHPRequestHandler {
    constructor(impl, pattern, redirect = true) {
        super(impl, redirect);
        this.rawPattern = pattern;
        this.pattern = new RegExp("^" + pattern + "$", "i");
    }
}
function resolveHandler(mapping, req, getAsFallback = false) {
    var handler;
    const method = req.method.toLowerCase();
    const isHead = method === "head";
    (isHead && (handler = mapping.head)) ||
        ((isHead || method === "get") && (handler = mapping.get)) ||
        (method === "post" && (handler = mapping.post)) ||
        (method === "patch" && (handler = mapping.patch)) ||
        (method === "patch" && (handler = mapping.patch)) ||
        (method === "put" && (handler = mapping.put)) ||
        (method === "delete" && (handler = mapping.del));
    return handler || mapping.use || (getAsFallback && mapping.get);
}
function createExtendedRequestHandler() {
    const requestHandler = function (req, res, next) {
        var handler = resolveHandler(requestHandler, req);
        if (handler)
            handler(req, res, next);
        else
            next();
    };
    return requestHandler;
}
exports.createExtendedRequestHandler = createExtendedRequestHandler;
function lazyLoadMapping(impl, method, mapping) {
    if (impl instanceof Function)
        return impl;
    if (_.isString(impl))
        return function (req, res, next, negative) {
            try {
                const handler = require(impl);
                if (!(handler instanceof Function))
                    throw new Error("Handler is not a Function: " + impl);
                req.mapping = mapping;
                handler(req, res, next, negative);
                mapping[method] = handler;
            }
            catch (e) {
                mapping[method] = function (a, b, next) {
                    next(e);
                };
                next(e);
            }
        };
    const data = impl.data;
    const key = "lazy" + method;
    mapping[key] = lazyLoadMapping(impl.impl, key, mapping);
    return function (req, res, next, negative) {
        const clocals = _.cloneDeep(res.locals);
        _.merge(res.locals, data);
        req.mapping = mapping;
        mapping[key](req, res, function (err, data) {
            if (!data)
                res.locals = clocals;
            next(err, data);
        }, negative);
    };
}
function processMapping(mapping, mapped) {
    var no403 = !mapped;
    if (no403)
        mapped = {};
    const use = mapping['use'] || mapping['__use'] || mapping['all'] || mapping['__all'] || mapping['*'];
    if (use)
        mapped.use = lazyLoadMapping(use, "use", mapped);
    no403 = no403 || !!use;
    const get = mapping['get'] || mapping['__get'];
    if (get)
        mapped.get = lazyLoadMapping(get, "get", mapped);
    const put = mapping['put'] || mapping['__put'];
    if (put)
        mapped.put = lazyLoadMapping(put, "put", mapped);
    else {
        const autoput = mapping['autoput'] || mapping['__autoput'] || mapping['decodedput'] || mapping['__decodedput'];
        if (autoput) {
            mapped['autoput'] = lazyLoadMapping(autoput, "autoput", mapped);
            mapped.put = function (req, res, next) {
                req.processBody(function () {
                    mapped['autoput'](req, res, next);
                });
            };
        }
        else if (get && !no403)
            mapped.put = function (req, res) {
                res.sendStatus(403);
            };
    }
    const post = mapping['post'] || mapping['__post'];
    if (post)
        mapped.post = lazyLoadMapping(post, "post", mapped);
    else {
        const autopost = mapping['autopost'] || mapping['__autopost'] || mapping['decodedpost'] || mapping['__decodedpost'];
        if (autopost) {
            mapped['autopost'] = lazyLoadMapping(autopost, "autopost", mapped);
            mapped.post = function (req, res, next) {
                req.processBody(function () {
                    mapped['autopost'](req, res, next);
                });
            };
        }
        else if (get && !no403)
            mapped.post = function (req, res) {
                res.sendStatus(403);
            };
    }
    const patch = mapping['patch'] || mapping['__patch'];
    if (patch)
        mapped.patch = lazyLoadMapping(patch, "patch", mapped);
    else {
        const autopatch = mapping['autopatch'] || mapping['__autopatch'] || mapping['decodedpatch'] || mapping['__decodedpatch'];
        if (autopatch) {
            mapped['autopatch'] = lazyLoadMapping(autopatch, "autopatch", mapped);
            mapped.patch = function (req, res, next) {
                req.processBody(function () {
                    mapped['autopatch'](req, res, next);
                });
            };
        }
        else if (get && !no403)
            mapped.patch = function (req, res) {
                res.sendStatus(403);
            };
    }
    const head = mapping['head'] || mapping['__head'];
    if (head)
        mapped.head = lazyLoadMapping(head, "head", mapped);
    const del = mapping['del'] || mapping['__del'] || mapping['delete'] || mapping['__delete'];
    if (del)
        mapped.del = lazyLoadMapping(del, "del", mapped);
    else if (get && !no403)
        mapped.del = function (req, res) {
            res.sendStatus(403);
        };
    return mapped;
}
const imageBufferThreshold = 200 * 200;
const squareImagePathWebpOrPng = /^\/(\d+)\.(webp|png)$/;
const squareImagePathWebpOrJpeg = /^\/(\d+)\.(webp|jpg)$/;
const squareImagePathJpeg = /^\/(\d+)\.(jpg)$/;
const squareImagePathPng = /^\/(\d+)\.(png)$/;
const imagePathWebpOrPng = /^\/(\d+)x(\d+)\.(webp|png)$/;
const imagePathWebpOrJpeg = /^\/(\d+)x(\d+)\.(webp|jpg)$/;
const imagePathJpeg = /^\/(\d+)x(\d+)\.(jpg)$/;
const imagePathPng = /^\/(\d+)x(\d+)\.(png)$/;
class SharpResizerRequestHandler extends LeafRequestHandler {
    constructor(imagefile, options) {
        super(options.square ? (options.notransparency ? (req, res, next) => {
            this.handle0square(req.webp ? squareImagePathWebpOrJpeg : squareImagePathJpeg, req, res, next);
        } : (req, res, next) => {
            this.handle0square(req.webp ? squareImagePathWebpOrPng : squareImagePathPng, req, res, next);
        }) : (options.notransparency ? (req, res, next) => {
            this.handle0(req.webp ? imagePathWebpOrJpeg : imagePathJpeg, req, res, next);
        } : (req, res, next) => {
            this.handle0(req.webp ? imagePathWebpOrPng : imagePathPng, req, res, next);
        }), false);
        this.queue = {};
        var _cacheOpts = options.cache;
        if (_cacheOpts === undefined)
            _cacheOpts = cacheOpts;
        if (_cacheOpts === false)
            this.cache = {
                generate: function (key, generator, cb) {
                    generator(key, cb);
                }
            };
        else
            this.cache = new lrucache(_cacheOpts);
        const source = this.image = sharp(imagefile);
        this.square = options.square;
        this.sizes = options.sizes;
        this.cacheGenerator = function (key, cb) {
            const opts = JSON.parse(key);
            if (opts[0] * opts[1] > imageBufferThreshold)
                cb(undefined, function (res) {
                    var contentType;
                    var image = source.clone().resize(opts[0], opts[1]);
                    switch (opts[2]) {
                        case "png":
                            image = image.png({ compressionLevel: 9 });
                            contentType = "image/png";
                            break;
                        case "jpg":
                            image = image.jpeg({ quality: 85 });
                            contentType = "image/jpeg";
                            break;
                        case "webp":
                            image = image.webp();
                            contentType = "image/webp";
                            break;
                        default:
                            cb(new Error("Unknown format: " + opts[2]));
                            return;
                    }
                    res.writeHead(200, {
                        "Content-Type": contentType,
                        "Cache-Control": "public, max-age=30672000",
                        "Expires": new Date(+new Date + 30672000000).toUTCString()
                    });
                    image.clone().pipe(res);
                });
            else {
                var contentType;
                var image = source.clone().resize(opts[0], opts[1]);
                switch (opts[2]) {
                    case "png":
                        image = image.png({ compressionLevel: 9 });
                        contentType = "image/png";
                        break;
                    case "jpg":
                        image = image.jpeg({ quality: 85 });
                        contentType = "image/jpeg";
                        break;
                    case "webp":
                        image = image.webp();
                        contentType = "image/webp";
                        break;
                    default:
                        cb(new Error("Unknown format: " + opts[2]));
                        return;
                }
                image.toBuffer((err, data) => {
                    if (err)
                        cb(err);
                    else
                        cb(undefined, function (res) {
                            res.writeHead(200, {
                                "Content-Type": contentType,
                                "Content-Length": data.length,
                                "Cache-Control": "public, max-age=30672000",
                                "Expires": new Date(+new Date + 30672000000).toUTCString()
                            });
                            res.end(data);
                        });
                });
            }
        };
    }
    canHandleSize(width, height = width) {
        if (this.sizes && this.sizes.length) {
            if (this.square)
                return this.sizes.indexOf(width) > -1;
            const length = this.sizes.length;
            for (var i = 0; i < length; i++) {
                const size = this.sizes[i];
                if (size[0] === width && size[1] === height)
                    return true;
            }
            return false;
        }
        else
            return true;
    }
    handle0square(reg, req, res, next) {
        var match = req.path.match(reg);
        if (match) {
            const size = parseInt(match[1]);
            if (this.canHandleSize(size))
                this.serve(size, size, match[2], res);
            else
                next();
        }
        else
            next();
    }
    handle0(reg, req, res, next) {
        var match = req.path.match(reg);
        if (match) {
            const width = parseInt(match[1]);
            const height = parseInt(match[2]);
            if (this.canHandleSize(width, height))
                this.serve(width, height, match[3], res);
            else
                next();
        }
        else
            next();
    }
    serve(width, height, format, res) {
        if (res['req'] && res['req'].io) {
            res.writeHead(200, {
                "content-disposition": "attachment",
                "content-type": "text/plain"
            });
            res.end("Cannot be served through page system.");
            return;
        }
        this.cache.generate(JSON.stringify([width, height, format]), this.cacheGenerator, function (err, writer) {
            writer(res);
        });
    }
}
class SharpResizerRequestChildHandler extends SharpResizerRequestHandler {
    constructor(imagefile, options, pattern) {
        super(imagefile, options);
        this.rawPattern = pattern;
        this.pattern = new RegExp("^" + pattern + "$", "i");
    }
}
class LazyLoadingNHPRequestHandler extends RequestHandlerWithChildren {
    constructor(fspath, logger, options) {
        super();
        this.fspath = fspath;
        this.options = options;
        this.handle = (req, res, next) => {
            this.load((err) => {
                if (err)
                    next(err);
                else
                    this.handle(req, res, next);
            }, logger);
        };
        this.childPaths = (cb, recursive) => {
            this.load((err) => {
                if (err)
                    cb([]);
                else
                    this.childPaths(cb, recursive);
            }, logger);
        };
    }
    load(next, logger) {
        fs.readdir(this.fspath, (err, files) => {
            if (err)
                next(err);
            else {
                var mapping = {};
                files.forEach((file) => {
                    const filename = _path.resolve(this.fspath, file);
                    const match = file.match(/^([^.]+)(\.([^.]+))?\.([^.]+)$/);
                    if (match) {
                        const route = decodePath(match[1].toLowerCase());
                        var fmapping = mapping[route];
                        if (!fmapping)
                            mapping[route] = fmapping = {};
                        const type = match[4].toLowerCase();
                        var cmapping = fmapping[type];
                        if (!cmapping)
                            cmapping = fmapping[type] = {};
                        var method = match[3];
                        if (method)
                            method = method.toLowerCase();
                        else if (/^__(exists|route|access)$/.test(route))
                            method = "use";
                        else
                            method = "get";
                        cmapping[method] = filename;
                    }
                    else if (/^([^.]+$)/.test(file)) {
                        const pattern = decodePath(file);
                        logger.gears("Found", pattern);
                        this.setChild(pattern, new LazyLoadingNHPRequestChildHandler(filename, logger, undefined, pattern), true);
                    }
                    else
                        logger.warn("Ignoring", filename);
                });
                Object.keys(mapping).forEach((key) => {
                    const extensions = mapping[key];
                    if (key === "__route") {
                        this.setRouteHandler((req, res, next, skip) => {
                            try {
                                const methods = extensions['js'];
                                if (!methods)
                                    throw new Error("No JavaScript files found for `" + _path.resolve(this.fspath, key + ".*") + "`");
                                const mapping = processMapping(methods);
                                const handler = function (req, res, next, skip) {
                                    const handler = resolveHandler(mapping, req);
                                    if (handler)
                                        handler(req, res, next, skip);
                                    else
                                        next();
                                };
                                this.setRouteHandler(handler);
                                handler(req, res, next, skip);
                            }
                            catch (e) {
                                req.logger.warn(e);
                                this.setRouteHandler(function (req, res, next, skip) {
                                    skip();
                                });
                                skip();
                            }
                        });
                    }
                    else if (key === "__exists")
                        this.setExistsHandler((req, res, exists, doesntExist) => {
                            try {
                                const methods = extensions['js'];
                                if (!methods)
                                    throw new Error("No JavaScript files found for `" + _path.resolve(this.fspath, key + ".*") + "`");
                                const mapping = processMapping(methods);
                                const handler = function (req, res, exists, doesntExist) {
                                    const handler = resolveHandler(mapping, req);
                                    if (handler)
                                        handler(req, res, exists, doesntExist);
                                    else
                                        exists();
                                };
                                this.setRouteHandler(handler);
                                handler(req, res, exists, doesntExist);
                            }
                            catch (e) {
                                req.logger.warn(e);
                                this.setExistsHandler(function (req, res, next, doesntExist) {
                                    doesntExist();
                                });
                                doesntExist();
                            }
                        });
                    else if (key === "__access")
                        this.setAccessHandler((req, res, allowed, denied) => {
                            try {
                                const methods = extensions['js'];
                                if (!methods)
                                    throw new Error("No JavaScript files found for `" + _path.resolve(this.fspath, key + ".*") + "`");
                                const mapping = processMapping(methods);
                                const handler = function (req, res, allowed, denied) {
                                    const handler = resolveHandler(mapping, req);
                                    if (handler)
                                        handler(req, res, allowed, denied);
                                    else
                                        allowed();
                                };
                                this.setAccessHandler(handler);
                                handler(req, res, allowed, denied);
                            }
                            catch (e) {
                                req.logger.warn(e);
                                this.setAccessHandler(function (req, res, allowed, denied) {
                                    denied();
                                });
                                denied();
                            }
                        });
                    else {
                        try {
                            const handler = createExtendedRequestHandler();
                            const methods = extensions['js'] || {};
                            const json = extensions['json'];
                            if (json) {
                                var getdata;
                                const get = json['get'];
                                if (get && (getdata = require(get))) {
                                    Object.keys(methods).forEach((method) => {
                                        const jsmethod = methods[method];
                                        var data = getdata;
                                        if (method !== "get") {
                                            const methoddata = json[method];
                                            if (methoddata) {
                                                data = _.clone(data);
                                                _.extend(data, require(methoddata));
                                            }
                                        }
                                        methods[method] = {
                                            impl: jsmethod,
                                            data
                                        };
                                    });
                                    if (!methods['get'])
                                        methods['get'] = (req, res, next) => {
                                            next(undefined, getdata);
                                        };
                                }
                                else
                                    Object.keys(json).forEach((method) => {
                                        if (method === 'get')
                                            return;
                                        const jsmethod = methods[method];
                                        const data = require(json[method]);
                                        if (jsmethod)
                                            methods[method] = {
                                                impl: jsmethod,
                                                data
                                            };
                                        else
                                            methods[method] = (req, res, next) => {
                                                next(undefined, data);
                                            };
                                    });
                            }
                            if (!Object.keys(methods))
                                throw new Error("No JavaScript files found for `" + _path.posix.join(this.fspath, key + ".*") + "`");
                            processMapping(methods, handler);
                            var leaf;
                            if (key === "index")
                                this.setIndex(leaf = new NHPRequestHandler(handler));
                            else {
                                const child = this.childAt(key);
                                if (child)
                                    child.setIndex(leaf = new NHPRequestHandler(handler));
                                else
                                    this.setChild(key, leaf = new NHPRequestChildHandler(handler, key));
                            }
                            try {
                                leaf.setView(extensions['nhp']['get']);
                            }
                            catch (e) { }
                        }
                        catch (e) {
                            logger.error(e);
                        }
                    }
                });
                delete this.childPaths;
                if (this.options) {
                    this.handle = (req, res, next) => {
                        const renderoptions = res.renderoptions = {};
                        _.extend(renderoptions, req.nexusframework['renderoptions']);
                        _.extend(renderoptions, this.options);
                        res.locals.__includeroot = renderoptions.root;
                        if (renderoptions.locals) {
                            const _next = next;
                            const clocals = _.cloneDeep(res.locals);
                            next = function (err) {
                                res.locals = clocals;
                                if (err)
                                    res.sendFailure(err);
                                else
                                    _next();
                            };
                            _.merge(res.locals, renderoptions.locals);
                        }
                        const hasResources = renderoptions.scripts || renderoptions.styles || renderoptions.fonts;
                        if (hasResources) {
                            const _next = next;
                            next = function (err) {
                                res.popResourceQueues();
                                if (err)
                                    res.sendFailure(err);
                                else
                                    _next();
                            };
                            res.pushResourceQueues();
                            if (renderoptions.fonts)
                                renderoptions.fonts.forEach(function (font) {
                                    if (_.isString(font))
                                        res.addFont(font);
                                    else
                                        res.addFont(font.name, font.weight || 400, font.italic);
                                });
                            if (renderoptions.scripts)
                                renderoptions.scripts.forEach(function (script) {
                                    if (script.inline) {
                                        const args = [script.source];
                                        if (script.dependencies)
                                            script.dependencies.forEach(function (dep) {
                                                args.push(dep.toString());
                                            });
                                        res.addInlineScript.apply(res, args);
                                    }
                                    else {
                                        if (script.source == "nexusframeworkclient")
                                            res.addNexusFrameworkClient();
                                        else {
                                            const args = [script.source, script.integrity];
                                            if (script.dependencies)
                                                script.dependencies.forEach(function (dep) {
                                                    args.push(dep.toString());
                                                });
                                            res.addScript.apply(res, args);
                                        }
                                    }
                                });
                            if (renderoptions.styles)
                                renderoptions.styles.forEach(function (style) {
                                    if (style.inline) {
                                        const args = [style.source];
                                        if (style.dependencies)
                                            style.dependencies.forEach(function (dep) {
                                                args.push(dep.toString());
                                            });
                                        res.addInlineStyle.apply(res, args);
                                    }
                                    else {
                                        const args = [style.source, style.integrity];
                                        if (style.dependencies)
                                            style.dependencies.forEach(function (dep) {
                                                args.push(dep.toString());
                                            });
                                        res.addStyle.apply(res, args);
                                    }
                                });
                        }
                        super.handle(req, res, next);
                    };
                }
                else
                    delete this.handle;
                next();
            }
        });
    }
}
class LazyLoadingNHPRequestChildHandler extends LazyLoadingNHPRequestHandler {
    constructor(fspath, logger, options, pattern) {
        super(fspath, logger, options);
        this.rawPattern = pattern;
        this.pattern = new RegExp("^" + pattern + "$", "i");
    }
}
class FSWatcherRequestHandler extends RequestHandlerWithChildren {
    constructor(fspath, logger, options) {
        super();
        this.skeleton = options.skeleton;
        this.legacyskeleton = options.legacyskeleton;
        this.pagesysskeleton = options.pagesysskeleton;
        this.autoindexskeleton = options.autoindexskeleton;
        var onready = [];
        const fswatcher = this.fswatcher = chokidar.watch(fspath, {
            ignorePermissionErrors: true
        });
        const self = this;
        fswatcher.on("ready", function () {
            delete self.handle;
            onready.forEach(function (cb) {
                cb();
            });
        });
        fswatcher.on("add", function (file) {
            console.log("add", file);
        });
        fswatcher.on("remove", function (file) {
            console.log("remove", file);
        });
        this.handle = function (req, res, next) {
            onready.push(function () {
                self.handle(req, res, next);
            });
        };
    }
    destroy() {
        this.fswatcher.close();
        super.destroy();
    }
}
class FSWatcherRequestChildHandler extends FSWatcherRequestHandler {
    constructor(fspath, logger, options, pattern) {
        super(fspath, logger, options);
        this.rawPattern = pattern;
        this.pattern = new RegExp("^" + pattern + "$", "i");
    }
}
class DEBUG {
    static encode(str) {
        return str.replace(/\n/g, "\\n");
    }
    static stringify0(vars, indent = "", inline = false) {
        if (vars === true)
            return (inline ? "" : indent) + "1";
        if (vars === false)
            return (inline ? "" : indent) + "0";
        var data;
        const varstype = typeof vars;
        if (varstype === "string" || varstype === "number" || vars instanceof String || vars instanceof Number)
            data = (inline ? "" : indent) + DEBUG.encode("" + vars);
        else if (vars instanceof Date)
            data = (inline ? "" : indent) + DEBUG.encode("" + (+vars));
        else if (Array.isArray(vars)) {
            var i = 0;
            data = "";
            const iindent = indent + "  ";
            vars.forEach(function (entry) {
                const t = i.toString();
                data += "\n" + indent + "[" + t + "] " + DEBUG.stringify0(entry, iindent, true);
                i++;
            });
        }
        else {
            if (!vars)
                return "";
            data = "";
            var obj;
            try {
                obj = (vars.toAPI || vars.toObject || vars.toJSON).call(vars);
            }
            catch (e) {
                obj = vars;
            }
            const iindent = indent + "  ";
            Object.keys(obj).forEach(function (key) {
                var k = DEBUG.encode("" + key);
                if (/^\d+/.test(k))
                    k = "_" + k;
                data += "\n" + indent + "[" + DEBUG.encode(key) + "] " + DEBUG.stringify0(obj[key], iindent, true);
            });
        }
        return data;
    }
    static stringify(vars) {
        return "Root" + DEBUG.stringify0(vars, "  ");
    }
}
class XML {
    static encode(str) {
        return str.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    static stringify0(vars) {
        if (vars === true)
            return "1";
        if (vars === false)
            return "0";
        var data;
        const varstype = typeof vars;
        if (varstype === "string" || varstype === "number" || vars instanceof String || vars instanceof Number)
            data = "" + XML.encode("" + vars);
        else if (vars instanceof Date)
            data = "" + XML.encode("" + (+vars));
        else if (Array.isArray(vars)) {
            var i = 0;
            data = "";
            vars.forEach(function (entry) {
                const t = i.toString();
                data += "<entry" + t + ">" + XML.stringify0(entry) + "</entry" + t + ">";
                i++;
            });
        }
        else {
            if (!vars)
                return "";
            data = "";
            var obj;
            try {
                obj = (vars.toAPI || vars.toObject || vars.toJSON).call(vars);
            }
            catch (e) {
                obj = vars;
            }
            Object.keys(obj).forEach(function (key) {
                var k = XML.encode("" + key);
                if (/^\d+/.test(k))
                    k = "_" + k;
                data += "<" + k + ">" + XML.stringify0(obj[key]) + "</" + k + ">";
            });
        }
        return data;
    }
    static stringify(vars) {
        return "<api>" + XML.stringify0(vars) + "</api>";
    }
}
class NexusFramework extends events.EventEmitter {
    constructor(app = express(), server, logger = new nulllogger("NexusFramework"), prefix = "/", nhpoptions = {}) {
        super();
        this.replacements = [
            [
                /{{version}}/,
                pkgjson.version
            ],
            [
                /{{version_main}}/,
                mainpkgversion
            ]
        ];
        this.apis = {};
        this.versions = [pkgjson.version, mainpkgversion];
        if (!server)
            server = new http.Server(app);
        const _nhp = new nhp({}, nhpoptions);
        Object.defineProperties(this, {
            app: {
                value: app
            },
            nhp: {
                value: _nhp
            },
            prestack: {
                value: [this.upgrade.bind(this)]
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
            mounts: {
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
                value: _path.posix.join("/", prefix, "/")
            },
            cookieParser: {
                configurable: true,
                value: cookieParser()
            },
            renderoptions: {
                value: {
                    legacyskeleton: _nhp.template(_path.resolve(__dirname, "../legacySkeleton.nhp")),
                    autoindexskeleton: _nhp.template(_path.resolve(__dirname, "../indexOfSkeleton.nhp")),
                    errordoc: {}
                }
            }
        });
        const Custom = nhp.Instructions.Custom;
        const genFooterInstruction = new Custom(function () {
            return "try{__writefooter(__out)}catch(e){__out.write(__error(e))}";
        });
        this.nhp.installProcessor("footer", function () {
            return genFooterInstruction;
        });
        const genHeaderInstruction = new Custom(function () {
            return "try{__writeheader(__out)}catch(e){__out.write(__error(e))}";
        });
        this.nhp.installProcessor("header", function () {
            return genHeaderInstruction;
        });
        const genAfterBodyInstruction = new Custom(function () {
            return "try{__writeafterbody(__out)}catch(e){__out.write(__error(e))}";
        });
        this.nhp.installProcessor("afterbody", function () {
            return genAfterBodyInstruction;
        });
        const Include = nhp.Instructions.Include;
        this.nhp.installProcessor("template", function (file) {
            return new Include(file, "__includeroot");
        });
        app.set("view engine", "nhp");
        app.engine("nhp", this.nhp.render.bind(this.nhp));
        const destination = _path.resolve(os.tmpdir(), "nexusframework-" + +(new Date));
        fs.mkdirSync(destination);
        const multerStorage = multer.diskStorage({
            destination,
            filename: function (req, file, cb) {
                cb(null, stringHash(file.fieldname) + '-' + stringHash("" + +(new Date)) + _path.extname(file.originalname));
            }
        });
        process.on("exit", function () {
            const destroyDir = function (dir) {
                fs.readdirSync(dir).forEach(function (dest) {
                    dest = _path.resolve(dir, dest);
                    if (!fs.realpathSync(dest).startsWith(destination)) {
                        console.warn(dest, "is outside", destination);
                        return; // Outside somehow...
                    }
                    if (fs.statSync(dest).isDirectory())
                        destroyDir(dest);
                    try {
                        fs.unlinkSync(dest);
                    }
                    catch (e) {
                        console.warn(e);
                    }
                });
            };
            destroyDir(destination);
        });
        this.multerInstance = multer({
            limits: {
                fieldNameSize: 100,
                fieldSize: 1024 * 1024,
                fileSize: 1024 * 1024 * 100
            },
            storage: multerStorage
        }).any({
            storage: multerStorage
        });
    }
    enableLoader() {
        this.loaderEnabled = true;
    }
    disableLoader() {
        this.loaderEnabled = false;
    }
    /**
     * Push a named version into the array of versions and add a new resource replacement.
     * The resource replacer can be accessed via `version_{{name}}`
     */
    addVersion(version, name) {
        this.versions.push(version);
        this.replacements.push([
            new RegExp("{{version_" + name.toLowerCase().replace(regexp_escape, "\\$&").replace(/\s+/g, "_") + "}}"),
            version
        ]);
    }
    addReplacement(regex, replacement) {
        this.replacements.push([regex, replacement]);
    }
    enableSignedCookies(secret) {
        Object.defineProperty(this, "cookieParser", {
            configurable: true,
            value: cookieParser(secret)
        });
    }
    installAfterBodyRenderer(renderer) {
        this.afterbody.push(renderer);
    }
    installFooterRenderer(renderer) {
        this.footer.push(renderer);
    }
    installHeaderRenderer(renderer) {
        this.header.push(renderer);
    }
    installAPI(ext, encoder) {
        this.apis[ext] = encoder;
    }
    enableAPIs(encoders) {
        encoders.forEach((ext) => this.installAPI(ext, NexusFramework.apiencoders[ext]));
    }
    enableLogging() {
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
    setLegacySkeleton(val) {
        if (_.isString(val))
            this.renderoptions.legacyskeleton = this.nhp.template(val);
        else
            this.renderoptions.legacyskeleton = val;
    }
    setIndexOfSkeleton(val) {
        if (_.isString(val))
            this.renderoptions.autoindexskeleton = this.nhp.template(val);
        else
            this.renderoptions.autoindexskeleton = val;
    }
    setSkeleton(val) {
        if (_.isString(val))
            this.renderoptions.skeleton = this.nhp.template(val);
        else
            this.renderoptions.skeleton = val;
    }
    setPageSystemSkeleton(val) {
        if (_.isString(val))
            this.renderoptions.pagesysskeleton = require(val);
        else
            this.renderoptions.pagesysskeleton = val;
    }
    setErrorDocument(code, page) {
        if (!page) {
            if (code === "*")
                page = "errdoc";
            else
                page = "errdoc/" + code;
        }
        else
            page = _path.posix.join("/", page).substring(1);
        this.renderoptions.errordoc[code] = page;
    }
    mountScripts(mpath = ":scripts") {
        this.mountStatic(mpath, _path.resolve(__dirname, "../scripts/"), {
            autoIndex: true
        });
    }
    mountAbout(mpath = ":about", opts) {
        this.mount(mpath, _path.resolve(__dirname, "../about/"), opts);
    }
    setupPageSystem() {
        const pagesyspath = /^\/\:pagesys(\/.*)$/;
        this.unshiftMiddleware(function (req, res, next) {
            if (!req.io) {
                var match = req.url.match(pagesyspath);
                if (match) {
                    req.url = match[1];
                    try {
                        Object.defineProperty(req, "pagesys", {
                            value: true
                        });
                    }
                    catch (e) { }
                    try {
                        const origwriteHead = res.writeHead;
                        res.writeHead = function (statusCode, reasonPhraseOrHeaders, headers) {
                            const location = res.getHeader("location");
                            if (location) {
                                if (headers) {
                                    delete headers['location'];
                                    delete headers['Location'];
                                    headers['X-Location'] = location;
                                }
                                res.setHeader("X-Location", location);
                                res.removeHeader("location");
                                if (typeof reasonPhraseOrHeaders === "string")
                                    origwriteHead.call(this, 200, "OK", headers);
                                else
                                    origwriteHead.call(this, 200, "OK", reasonPhraseOrHeaders);
                            }
                            else
                                origwriteHead.call(this, statusCode, reasonPhraseOrHeaders, headers);
                        };
                    }
                    catch (e) { }
                    res.locals.pagesys = true;
                }
            }
            next();
        }, true);
    }
    setupIO(path = ":io", withPageSystem = true, guestsToo = false) {
        if (!this.server)
            throw new Error("No server passed in constructor, cannot setup Socket.IO");
        const iopath = _path.posix.join(this.prefix, path);
        const io = socket_io(this.server, {
            serveClient: !has_slim_io_js,
            path: iopath
        });
        io.on("connection", (client) => {
            client.on("init", function (sentResources) {
                if (!_.isArray(sentResources)) {
                    client.emit("401", "");
                    client.disconnect(true);
                }
                const sent = (client['__sent_resources'] || (client['__sent_resources'] = []));
                sentResources.forEach(function (res) {
                    if (sent.indexOf(res) == -1)
                        sent.push(res);
                });
            });
            if (withPageSystem)
                client.on("page", (method, path, post, headers, cb) => {
                    try {
                        const req = new SocketIORequest(client.conn.request, method, _path.posix.join(this.prefix, path), post, headers);
                        Object.defineProperty(req, "io", {
                            value: client
                        });
                        const res = new SocketIOResponse(cb);
                        res['app'] = this.app;
                        req['app'] = this.app;
                        res['req'] = req;
                        req['res'] = res;
                        try {
                            const next = (err) => {
                                if (err) {
                                    (req.logger || this.logger).warn(err);
                                    if (res.sendFailure)
                                        res.sendFailure(err);
                                    else
                                        res.sendStatus(500);
                                }
                                else
                                    res.sendStatus(404);
                            };
                            if (this.app) {
                                const stack = this.app._router.stack;
                                async.eachSeries(stack, function (layer, next) {
                                    if (layer.name === "expressInit")
                                        next();
                                    else
                                        layer.handle(req, res, next);
                                }, next);
                            }
                            else
                                this.handle(req, res, next);
                        }
                        catch (e) {
                            (req.logger || this.logger).warn(e);
                            res.sendStatus(500);
                        }
                    }
                    catch (e) {
                        console.warn(e);
                        client.disconnect(true);
                    }
                });
        });
        Object.defineProperty(this, "io", {
            value: io
        });
        this.mountHandler("/:scripts/bson.js", function (req, res, next) {
            res.sendFile(bson_js, {
                maxAge: 3.154e+10,
                immutable: true
            }, function (err) {
                if (err)
                    next(err);
            });
        });
        if (has_slim_io_js)
            this.mountHandler("/:scripts/socket.io.slim.js", function (req, res, next) {
                res.sendFile(socket_io_slim_js, {
                    maxAge: 3.154e+10,
                    immutable: true
                }, function (err) {
                    if (err)
                        next(err);
                });
            });
        if (withPageSystem)
            this.setupPageSystem();
        this.socketIOSetup = true;
        this.socketIOGuests = guestsToo;
        return iopath;
    }
    /**
     * Mount a NHP page system.
     *
     * @param wwwpath The web path
     * @param fspath The filesystem path
     * @param options The optional mount options
     */
    mount(webpath, fspath, options = {}) {
        webpath = _path.posix.join("/", stripPath(webpath));
        options.root = options.root || process.cwd();
        fspath = _path.resolve(options.root, fspath);
        if (options.iconfile) {
            options.iconfile = _path.resolve(options.root, options.iconfile);
            const iconpath = _path.posix.join(webpath, ":icon");
            this.mountImageResizer(iconpath, options.iconfile, {
                sizes: iconSizes,
                square: true
            });
            options.icons = _path.posix.join(this.prefix, iconpath, "/");
        }
        fspath = _path.resolve(options.root, fspath);
        if (_.isString(options.skeleton))
            options.skeleton = this.nhp.template(_path.resolve(options.root, options.skeleton));
        if (_.isString(options.pagesysskeleton))
            options.pagesysskeleton = require(_path.resolve(options.root, options.pagesysskeleton));
        if (_.isString(options.legacyskeleton))
            options.legacyskeleton = this.nhp.template(_path.resolve(options.root, options.legacyskeleton));
        if (_.isString(options.autoindexskeleton))
            options.autoindexskeleton = this.nhp.template(_path.resolve(options.root, options.autoindexskeleton));
        if (webpath == "/") {
            _.assign(this.renderoptions, options);
            const newHandler = options.mutable ? new FSWatcherRequestHandler(fspath, this.logger, options) : new LazyLoadingNHPRequestHandler(fspath, this.logger, options);
            this.setDefaultHandler(newHandler);
            return newHandler;
        }
        else {
            const newHandler = options.mutable ? new FSWatcherRequestChildHandler(fspath, this.logger, options, webpath) : new LazyLoadingNHPRequestChildHandler(fspath, this.logger, options, webpath);
            for (var i = 0; i < this.mounts.length; i++) {
                const mount = this.mounts[i];
                if (mount.rawPattern === webpath) {
                    mount.destroy();
                    this.mounts[i] = newHandler;
                    return;
                }
            }
            this.mounts.push(newHandler);
            return newHandler;
        }
    }
    mountImageResizer(webpath, imagefile, options = {}) {
        webpath = _path.posix.join("/", stripPath(webpath));
        if (webpath == "/") {
            const newHandler = new SharpResizerRequestHandler(imagefile, options);
            this.setDefaultHandler(newHandler);
            return newHandler;
        }
        else {
            const newHandler = new SharpResizerRequestChildHandler(imagefile, options, webpath);
            for (var i = 0; i < this.mounts.length; i++) {
                const mount = this.mounts[i];
                if (mount.rawPattern === webpath) {
                    mount.destroy();
                    this.mounts[i] = newHandler;
                    return;
                }
            }
            this.mounts.push(newHandler);
            return newHandler;
        }
    }
    /**
     * Mount a directory.
     *
     * @param webpath The web path
     * @param fspath The filesystem path
     * @param options The mount options
     */
    mountStatic(webpath, fspath, options = { autoIndex: true }) {
        var serveOptions = options.mutable ? {} : {
            maxAge: 3.154e+10,
            immutable: true
        };
        var template = options.autoIndexSkeleton;
        if (_.isString(template))
            template = this.nhp.template(template);
        const self = this;
        fspath = _path.resolve(process.cwd(), fspath);
        const startsWith = new RegExp("^" + fspath.replace(regexp_escape, "\\$&") + "(.*)$");
        const handler = function (req, res, next) {
            const filename = _path.resolve(fspath, decodeURIComponent(req.path.substring(1)));
            if (startsWith.test(filename))
                fs.stat(filename, function (err, stats) {
                    if (err && err.code != "ENOENT")
                        next(err);
                    else if (stats) {
                        const __path = _path;
                        var urlpath = url.parse(req.originalUrl).path;
                        if (stats.isDirectory()) {
                            if (options.autoIndex) {
                                if (req.method.toUpperCase() === "GET" && !/\/(\?.*)?$/.test(urlpath)) {
                                    const q = urlpath.indexOf("?");
                                    if (q == -1)
                                        urlpath += "/";
                                    else
                                        urlpath = urlpath.substring(0, q) + "/" + urlpath.substring(q);
                                    if (req.pagesys && /^\/:pagesys\//.test(urlpath))
                                        urlpath = urlpath.substring(9);
                                    return res.redirect(urlpath);
                                }
                                if (req.pagesys) {
                                    res.writeHead(200, {
                                        "content-disposition": "attachment",
                                        "content-type": "text/plain"
                                    });
                                    res.end("Cannot be served through page system.");
                                }
                                else
                                    fs.readdir(filename, function (err, files) {
                                        if (err)
                                            return next(err);
                                        const _files = res.locals.files = [];
                                        const _path = url.parse(req.originalUrl).pathname;
                                        res.locals.encodeURIComponent = encodeURIComponent;
                                        res.locals.path = decodeURIComponent(_path);
                                        res.locals.filepath = filename;
                                        var tmpl = template;
                                        if (!tmpl) {
                                            const renderoptions = res.renderoptions || self.renderoptions;
                                            tmpl = renderoptions.autoindexskeleton;
                                        }
                                        if (!tmpl)
                                            tmpl = self.nhp.template(__path.resolve(__dirname, "../indexOfSkeleton.nhp"));
                                        async.each(files, function (file, cb) {
                                            const full = __path.resolve(filename, file);
                                            fs.stat(full, function (err, stat) {
                                                if (err || !stat)
                                                    _files.push([file, "application/octet-stream", 0, new Date(0)]);
                                                else if (stat.isDirectory())
                                                    fs.readdir(full, function (err, files) {
                                                        _files.push([file, "directory", files && files.length || 0, stat.mtime]);
                                                        cb();
                                                    });
                                                else
                                                    mime(full, function (err, type = "application/octet-stream") {
                                                        _files.push([file, type, stat.size, stat.mtime]);
                                                        cb();
                                                    });
                                            });
                                        }, function (err) {
                                            _files.sort(function (a, b) {
                                                const adir = a[1] == "directory";
                                                const bdir = b[1] == "directory";
                                                if ((adir || bdir) && !(adir && bdir)) {
                                                    if (adir)
                                                        return -1;
                                                    return 1;
                                                }
                                                if (a[0] < b[0])
                                                    return -1;
                                                if (a[0] > b[0])
                                                    return 1;
                                                return 0;
                                            });
                                            res.locals.ceil = Math.ceil.bind(Math);
                                            res.locals.round = Math.round.bind(Math);
                                            res.locals.floor = Math.floor.bind(Math);
                                            res.locals.moment = moment;
                                            if (_path.length > 1)
                                                _files.unshift(["Parent", "parent", 0, 0]);
                                            tmpl.renderToStream(res.locals, res, function (err) {
                                                if (err)
                                                    res.sendFailure(err);
                                                else
                                                    res.end();
                                            });
                                        });
                                    });
                            }
                            else
                                next();
                            return;
                        }
                        else if (req.method.toUpperCase() === "GET" && /\/(\?.*)?$/.test(urlpath)) {
                            const q = urlpath.indexOf("?");
                            if (q == -1)
                                urlpath = urlpath.substring(0, urlpath.length - 1);
                            else
                                urlpath = urlpath.substring(0, q - 1) + urlpath.substring(q);
                            if (urlpath.length > req.sitePrefix.length)
                                return res.redirect(urlpath);
                        }
                        if (req.pagesys) {
                            res.writeHead(200, {
                                "content-disposition": "attachment",
                                "content-type": "text/plain"
                            });
                            res.end("Cannot be served through page system.");
                        }
                        else
                            res.sendFile(filename, serveOptions, function (err) {
                                if (err)
                                    next(err);
                            });
                    }
                    else
                        next();
                });
            else
                res.sendStatus(403);
        };
        return this.mountHandler(webpath, handler, false);
    }
    /**
     * Set a request handler for the specified path.
     * Replaces any existing request handler.
     *
     * @param path The path
     * @param handler The request handler
     * @param leaf Whether or not this handler is a leaf, or branch
     */
    mountHandler(webpath, handler, leaf = true) {
        webpath = _path.posix.join("/", stripPath(webpath));
        if (webpath == "/") {
            const newHandler = new LeafRequestHandler(handler, leaf);
            this.setDefaultHandler(newHandler);
            return newHandler;
        }
        else {
            const newHandler = new LeafRequestChildHandler(handler, webpath, leaf);
            for (var i = 0; i < this.mounts.length; i++) {
                const mount = this.mounts[i];
                if (mount.rawPattern === webpath) {
                    mount.destroy();
                    this.mounts[i] = newHandler;
                    return;
                }
            }
            this.mounts.push(newHandler);
            return newHandler;
        }
    }
    /**
     * Set the default handler, its the handler that gets used when no mounts take the request.
     */
    setDefaultHandler(handler) {
        if (this.default)
            this.default.destroy();
        this.default = handler;
    }
    /**
     * Start listening on a specific port.
     */
    listen(port, callbackOrHost, callback) {
        this.server.listen.apply(this.server, arguments);
    }
    /**
     * NexusFork compatible handler.
     */
    handle(req, res, next) {
        const fullpath = req.path;
        const prefix = this.prefix;
        const len = prefix.length;
        if (fullpath.length >= len && fullpath.substring(0, len) == prefix) {
            this.cookieParser(req, res, (err) => {
                if (err)
                    return next(err);
                const logger = (req.logger || this.logger).extend(req.path);
                try {
                    Object.defineProperty(req, "logger", {
                        configurable: true,
                        value: logger.extend("Guest")
                    });
                }
                catch (e) { }
                const updateUser = function () {
                    var userName;
                    const user = req.user;
                    if (user && !user.isGuest)
                        userName = (user.isOwner || user.isAdmin ? "red" : (user.isDeveloper ? "purple" : (user.isEditor || user.isModerator ? "green" : "blue"))) + ":" + (user.displayName || user.name || user.email || user.id || "Logged");
                    else
                        userName = "Guest";
                    Object.defineProperty(req, "logger", {
                        configurable: true,
                        value: logger.extend(userName)
                    });
                    res.locals.user = user;
                };
                const self = this;
                var cuser;
                async.eachSeries(this.prestack, function (entry, cb) {
                    entry(req, res, function (err) {
                        if (err)
                            cb(err);
                        else {
                            const user = req.user && (req.user.id || req.user.email || req.user.name || req.user.displayName);
                            if (user !== cuser) {
                                updateUser();
                                cuser = user;
                            }
                            cb();
                        }
                    });
                }, function (err) {
                    if (err)
                        next(err);
                    else
                        async.eachSeries(self.stack, function (entry, cb) {
                            entry(req, res, function (err) {
                                if (err)
                                    cb(err);
                                else {
                                    const user = req.user && (req.user.id || req.user.email || req.user.name || req.user.displayName);
                                    if (user !== cuser) {
                                        updateUser();
                                        cuser = user;
                                    }
                                    cb();
                                }
                            });
                        }, (err) => {
                            const type = req.pagesys ? "PageSystem" : (req.io ? "Socket.IO" : (req.xhr ? "XHR" : "Standard"));
                            if (err) {
                                if (self.logging)
                                    req.logger.warn(req.method, req.ip || "`Unknown IP`", "`" + (req.get("user-agent") || "User-Agent Not Set") + "`", req.get("content-length") || 0, type, err);
                                next(err);
                            }
                            else {
                                if (self.logging)
                                    req.logger.info(req.method, req.ip || "`Unknown IP`", "`" + (req.get("user-agent") || "User-Agent Not Set") + "`", req.get("content-length") || 0, type);
                                const user = req.user;
                                if (user) {
                                    const id = user.id || user.email || user.displayName || "Logged";
                                    res.set("X-Logged-User", "" + id);
                                }
                                self.process(req, res, next);
                            }
                        });
                });
            });
        }
        else
            next();
    }
    /**
     * Push middleware to the end of the stack.
     */
    pushMiddleware(middleware, pre) {
        this[pre ? "prestack" : "stack"].push(middleware);
    }
    /**
     * Unshift middleware onto the beginning of the stack.
     */
    unshiftMiddleware(middleware, pre) {
        this[pre ? "prestack" : "stack"].unshift(middleware);
    }
    runMiddleware(req, res, next) {
        async.eachSeries(this.stack, function (middleware, cb) {
            middleware(req, res, cb);
        }, next);
    }
    /**
     * Process the incoming request
     */
    process(req, res, next) {
        const path = _path.posix.normalize(req.path);
        async.eachSeries(this.mounts, (mount, cb) => {
            const targetPath = mount.rawPattern;
            if (path === targetPath || (!mount.leaf && path.length >= targetPath.length + 1 && path.substring(0, mount.rawPattern.length) === targetPath && path[mount.rawPattern.length] == '/')) {
                const curl = req.url;
                req.mount = mount;
                req.url = req.url.substring(targetPath.length) || "/";
                mount.handle(req, res, function (err) {
                    req.url = curl;
                    cb(err);
                });
            }
            else
                cb();
        }, (err) => {
            if (err)
                next(err);
            else
                this.default.handle(req, res, next);
        });
    }
    upgrade(req, res, next) {
        const prefix = _path.posix.join("/", req.originalUrl.substring(0, req.originalUrl.length - req.url.length), "/");
        try {
            Object.defineProperty(req, "sitePrefix", {
                configurable: true,
                value: prefix
            });
        }
        catch (e) { }
        try {
            Object.defineProperty(req, "matches", {
                configurable: true,
                value: []
            });
        }
        catch (e) { }
        try {
            Object.defineProperty(req, "matches", {
                configurable: true,
                value: []
            });
        }
        catch (e) { }
        try {
            Object.defineProperty(req, "nexusframework", {
                value: this
            });
        }
        catch (e) { }
        const siteUrl = req.protocol + "://" + req.hostname + prefix;
        try {
            Object.defineProperty(req, "siteUrl", {
                configurable: true,
                value: siteUrl
            });
        }
        catch (e) { }
        const buildUrl = function (uri) {
            if (uri) {
                if (/^\//.test(uri))
                    uri = uri.substring(1);
                return url.resolve(siteUrl, uri);
            }
            return siteUrl;
        };
        try {
            Object.defineProperty(req, "buildUrl", {
                configurable: true,
                value: buildUrl
            });
        }
        catch (e) { }
        try {
            if (req.io)
                Object.defineProperty(req, "readBody", {
                    configurable: true,
                    value: function (cb) {
                        cb(undefined, Buffer.from(BSON.serialize(req.body) || ""));
                    }
                });
            else
                Object.defineProperty(req, "readBody", {
                    configurable: true,
                    value: function (cb, limit = 8192) {
                        var buffer = Buffer.from([]);
                        var onError, onData, onEnd;
                        req.on("error", onError = function (error) {
                            req.removeListener("error", onError);
                            req.removeListener("data", onData);
                            req.removeListener("end", onEnd);
                            return cb(error);
                        });
                        req.on("data", onData = function (chunk) {
                            if (buffer.length + chunk.length >= limit) {
                                req.removeListener("error", onError);
                                req.removeListener("data", onData);
                                req.removeListener("end", onEnd);
                                return cb(new Error("Too much data, limit is " + limit + "bytes"));
                            }
                            buffer = Buffer.concat([buffer, chunk]);
                        });
                        req.on("end", onEnd = function () {
                            req.removeListener("error", onError);
                            req.removeListener("data", onData);
                            req.removeListener("end", onEnd);
                            cb(undefined, buffer);
                        });
                    }
                });
        }
        catch (e) { }
        try {
            if (req.io) {
                Object.defineProperty(req, "processBody", {
                    configurable: true,
                    value: function (cb, ...processors) {
                        cb();
                    }
                });
                try {
                    res.locals.post = req.body;
                }
                catch (e) { }
            }
            else
                Object.defineProperty(req, "processBody", {
                    configurable: true,
                    value: (_cb, ...processors) => {
                        const cb = function (err) {
                            if (err)
                                _cb(err);
                            else {
                                try {
                                    res.locals.post = req.body;
                                }
                                catch (e) { }
                                try {
                                    res.locals.files = req.files;
                                }
                                catch (e) { }
                                _cb();
                            }
                        };
                        const contentType = req.get("content-type");
                        if (!processors.length)
                            processors = [0 /* URLEncoded */, 2 /* JSONBody */, 1 /* MultipartFormData */];
                        req.body = {};
                        req.files = {};
                        try {
                            processors.forEach((processor) => {
                                switch (processor) {
                                    case 2 /* JSONBody */:
                                        if (/\/(x\-)?json$/.test(contentType)) {
                                            req.readBody(function (err, data) {
                                                if (err)
                                                    return cb(err);
                                                try {
                                                    req.body = JSON.parse(data.toString("utf8"));
                                                    cb();
                                                }
                                                catch (e) {
                                                    cb(e);
                                                }
                                            });
                                            throw true;
                                        }
                                        break;
                                    case 0 /* URLEncoded */:
                                        if (/\/(((x\-)?www\-)?form\-)?urlencoded$/.test(contentType)) {
                                            req.readBody(function (err, data) {
                                                if (err)
                                                    return cb(err);
                                                try {
                                                    req.body = querystring.parse(data.toString("utf8"));
                                                    cb();
                                                }
                                                catch (e) {
                                                    cb(e);
                                                }
                                            });
                                            throw true;
                                        }
                                        break;
                                    case 1 /* MultipartFormData */:
                                        if (/multipart\/form\-data(;.+)?$/.test(contentType)) {
                                            this.multerInstance(req, res, function (err) {
                                                if (err)
                                                    cb(err);
                                                else {
                                                    const files = req.files;
                                                    if (Array.isArray(files)) {
                                                        res.on('finish', function () {
                                                            files.forEach(function (file) {
                                                                fs.unlink(file.path, noop);
                                                            });
                                                        });
                                                        const _files = req.files = {};
                                                        files.forEach(function (file) {
                                                            const fieldname = file.fieldname;
                                                            var f = _files[fieldname];
                                                            if (f) {
                                                                if (Array.isArray(f))
                                                                    f.push(file);
                                                                else
                                                                    f = _files[fieldname] = [f, file];
                                                            }
                                                            else
                                                                _files[fieldname] = file;
                                                        });
                                                    }
                                                    cb();
                                                }
                                            });
                                            throw true;
                                        }
                                        break;
                                }
                            });
                            cb(new Error("Unsupported content submitted"));
                        }
                        catch (e) {
                            if (e !== true)
                                throw e;
                        }
                    }
                });
        }
        catch (e) { }
        try {
            res.locals.get = req.query;
        }
        catch (e) { }
        try {
            res.locals.sitePrefix = prefix;
        }
        catch (e) { }
        try {
            res.locals.buildUrl = buildUrl;
        }
        catch (e) { }
        const accept = req.get('accept') || "";
        const webp = /(^|\W)image\/webp(\W|$)/.test(accept);
        if (webp) {
            try {
                res.locals.webp = true;
            }
            catch (e) { }
            try {
                Object.defineProperty(req, "webp", {
                    value: true
                });
            }
            catch (e) { }
            try {
                Object.defineProperty(req, "webpOrPng", {
                    value: "webp"
                });
            }
            catch (e) { }
            try {
                Object.defineProperty(req, "webpOrJpg", {
                    value: "webp"
                });
            }
            catch (e) { }
            try {
                Object.defineProperty(req, "webpOrGif", {
                    value: "webp"
                });
            }
            catch (e) { }
            res.locals.webpOrPng = "webp";
            res.locals.webpOrJpg = "webp";
            res.locals.webpOrGif = "webp";
            res.locals.webp = true;
        }
        else {
            try {
                Object.defineProperty(req, "webpOrPng", {
                    value: "png"
                });
            }
            catch (e) { }
            try {
                Object.defineProperty(req, "webpOrJpg", {
                    value: "jpg"
                });
            }
            catch (e) { }
            try {
                Object.defineProperty(req, "webpOrGif", {
                    value: "gif"
                });
            }
            catch (e) { }
            res.locals.webpOrPng = "png";
            res.locals.webpOrJpg = "jpg";
            res.locals.webpOrGif = "gif";
        }
        const pagesys = req.pagesys;
        if (req.xhr || req.io) {
            try {
                res.locals.xhrOrIO = true;
            }
            catch (e) { }
            try {
                Object.defineProperty(req, "xhrOrIO", {
                    value: true
                });
            }
            catch (e) { }
        }
        try {
            res.locals.basehref = this.prefix;
        }
        catch (e) { }
        const generator = "NexusFramework " + pkgjson.version;
        if (!req.io)
            try {
                res.header("X-Generator", generator);
            }
            catch (e) { }
        try {
            res.locals.generator = generator;
        }
        catch (e) { }
        try {
            res.locals.frameworkVersion = pkgjson.version;
        }
        catch (e) { }
        var noScript = !pagesys && ((req.cookies && req.cookies.noscript) || (req.body && req.body.noscript) || req.query.noscript);
        var useLoader = pagesys || (this.loaderEnabled && !noScript);
        const rua = req.get("user-agent");
        var ua = uacache.get(rua);
        var legacy, es6;
        if (ua) {
            legacy = ua.legacy;
            es6 = ua.es6;
        }
        else {
            ua = useragent.parse(rua);
            _.extend(ua, useragent.is(rua));
            ua.legacy = legacy = isUnsupportedBrowser(ua);
            ua.es6 = es6 = !legacy && isES6Browser(ua);
            uacache.set(rua, ua);
        }
        try {
            Object.defineProperty(res, "useragent", {
                configurable: true,
                value: ua
            });
        }
        catch (e) { }
        try {
            res.locals.useragent = ua;
        }
        catch (e) { }
        const scriptType = legacy ? "legacy" : (es6 ? "es6" : "es5");
        if (useLoader && !pagesys && legacy)
            useLoader = false;
        const meta = { generator };
        const footerRenderers = this.footer.slice(0);
        const headerRenderers = this.header.slice(0);
        const afterbodyRenderers = this.afterbody.slice(0);
        var gfonts = {};
        var scripts = [];
        var styles = [];
        try {
            Object.defineProperty(res, "setRenderOptions", {
                configurable: true,
                value: function (options) {
                    res.renderoptions = options;
                }
            });
        }
        catch (e) { }
        try {
            Object.defineProperty(res, "applyRenderOptions", {
                configurable: true,
                value: function (options) {
                    _.extend(res.renderoptions || (res.renderoptions = {}), options);
                }
            });
        }
        catch (e) { }
        try {
            Object.defineProperty(res, "enableLoader", {
                configurable: true,
                value: function () {
                    useLoader = true;
                }
            });
        }
        catch (e) { }
        try {
            Object.defineProperty(res, "addFont", {
                configurable: true,
                value: (family, weight, italic) => {
                    var font = gfonts[family];
                    if (!font)
                        font = gfonts[family] = [];
                    var style = "" + (weight || 400);
                    if (italic)
                        style += "i";
                    if (font.indexOf(style) == -1)
                        font.push(style);
                }
            });
        }
        catch (e) { }
        const addResource = function (queue, source, integrity, inline, dependencies) {
            const name = inline ? "inline-" + stringHash(source) : determineName(source);
            for (var i = 0; i < queue.length; i++) {
                const resource = queue[i];
                if (resource.name === name) {
                    //req.logger.warn("Re-adding " + type + " " + name);
                    if (dependencies.length) {
                        Array.prototype.push.apply(resource.dependencies, dependencies);
                        resource.dependencies = _.uniq(resource.dependencies);
                    }
                    resource.integrity = integrity;
                    resource.source = source;
                    return;
                }
            }
            queue.push({
                name,
                integrity,
                source,
                dependencies,
                inline
            });
        };
        const resourceQueueStack = [];
        const addScript = function (source, integrity, ...deps) {
            addResource(scripts, source, integrity, false, deps);
        };
        const addSocketIOClient = has_slim_io_js ? () => {
            addScript(_path.posix.join(this.prefix, socket_io_slim_path), socket_io_slim_integrity);
        } : () => {
            addScript(_path.posix.join(this.prefix, ":io/socket.io.js"));
        };
        try {
            Object.defineProperty(res, "pushResourceQueues", {
                configurable: true,
                value: function (andClear) {
                    resourceQueueStack.push([_.clone(gfonts), scripts.slice(0), styles.slice(0)]);
                    if (andClear) {
                        gfonts = {};
                        scripts = [];
                        styles = [];
                    }
                }
            });
            Object.defineProperty(res, "popResourceQueues", {
                configurable: true,
                value: function () {
                    const queue = resourceQueueStack.pop();
                    gfonts = queue[0];
                    scripts = queue[1];
                    styles = queue[2];
                }
            });
        }
        catch (e) { }
        try {
            Object.defineProperty(res, "clearFonts", {
                configurable: true,
                value: function () {
                    gfonts = {};
                }
            });
        }
        catch (e) { }
        try {
            Object.defineProperty(res, "clearScripts", {
                configurable: true,
                value: function () {
                    scripts = [];
                }
            });
        }
        catch (e) { }
        try {
            Object.defineProperty(res, "clearStyles", {
                configurable: true,
                value: function () {
                    styles = [];
                }
            });
        }
        catch (e) { }
        try {
            Object.defineProperty(res, "clearFonts", {
                configurable: true,
                value: function () {
                    styles = [];
                }
            });
        }
        catch (e) { }
        try {
            Object.defineProperty(res, "addSocketIOClient", {
                configurable: true,
                value: addSocketIOClient
            });
        }
        catch (e) { }
        const addInlineScript = function (source, ...deps) {
            addResource(scripts, source, undefined, true, deps);
        };
        try {
            Object.defineProperty(res, "addInlineScript", {
                configurable: true,
                value: addInlineScript
            });
        }
        catch (e) { }
        try {
            Object.defineProperty(res, "addNexusFrameworkClient", {
                configurable: true,
                value: (includeSocketIO = this.socketIOGuests, autoEnabledPageSystem = false) => {
                    const integrity = legacy ? undefined : (es6 ? nexusframeworkclient_es6_integrity : nexusframeworkclient_es5_integrity);
                    const path = _path.posix.join(this.prefix, ":scripts/{{type}}/nexusframeworkclient.min.js?v=" + pkgjson.version);
                    addScript(_path.posix.join(this.prefix, ":scripts/{{type}}/compat.min.js?v=" + pkgjson.version));
                    addScript(_path.posix.join(this.prefix, bson_path), undefined, "compat");
                    if (includeSocketIO) {
                        addSocketIOClient();
                        addScript(path, integrity, "bson", "socket.io");
                    }
                    else
                        addScript(path, integrity, "bson");
                    if (autoEnabledPageSystem)
                        addInlineScript("NexusFrameworkClient.initPageSystem()", "nexusframeworkclient");
                }
            });
        }
        catch (e) { }
        try {
            Object.defineProperty(res, "addScript", {
                configurable: true,
                value: addScript
            });
        }
        catch (e) { }
        try {
            Object.defineProperty(res, "addFooterRenderer", {
                configurable: true,
                value: function (renderer) {
                    footerRenderers.push(renderer instanceof Function ? renderer : function (out) {
                        out.write("" + renderer);
                    });
                }
            });
        }
        catch (e) { }
        try {
            Object.defineProperty(res, "addBodyClassName", {
                configurable: true,
                value: function (name) {
                    const classRegex = new RegExp("(^|\\s+)" + name.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + "(\\s+|$)", "g");
                    if (!classRegex.test(res.locals.bodyclass))
                        res.locals.bodyclass = (res.locals.bodyclass + " " + name).trim();
                }
            });
        }
        catch (e) { }
        try {
            Object.defineProperty(res, "removeBodyClassName", {
                configurable: true,
                value: function (name) {
                    const classRegex = new RegExp("(^|\\s+)" + name.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + "(\\s+|$)", "g");
                    res.locals.bodyclass = res.locals.bodyclass.replace(classRegex, function (match, p1) {
                        return /^\s.+\s$/.test(match) ? " " : "";
                    });
                }
            });
        }
        catch (e) { }
        try {
            Object.defineProperty(res, "addAfterBodyRenderer", {
                configurable: true,
                value: function (renderer) {
                    afterbodyRenderers.push(renderer instanceof Function ? renderer : function (out) {
                        out.write("" + renderer);
                    });
                }
            });
        }
        catch (e) { }
        try {
            Object.defineProperty(res, "addStyle", {
                configurable: true,
                value: function (source, integrity, ...deps) {
                    addResource(styles, source, integrity, false, deps);
                }
            });
        }
        catch (e) { }
        try {
            Object.defineProperty(res, "addInlineStyle", {
                configurable: true,
                value: function (source, ...deps) {
                    addResource(styles, source, undefined, true, deps);
                }
            });
        }
        catch (e) { }
        try {
            Object.defineProperty(res, "addHeaderRenderer", {
                configurable: true,
                value: function (renderer) {
                    headerRenderers.push(renderer instanceof Function ? renderer : function (out) {
                        out.write("" + renderer);
                    });
                }
            });
        }
        catch (e) { }
        try {
            Object.defineProperty(res, "setMetaTag", {
                configurable: true,
                value: function (name, content) {
                    name = name.toLowerCase();
                    if (content)
                        meta[name] = content;
                    else
                        delete meta[name];
                }
            });
        }
        catch (e) { }
        const replacements = this.replacements;
        const processResources = function () {
            styles.forEach(function (style) {
                if (style.inline)
                    return;
                replacements.forEach(function (replacement) {
                    style.source = style.source.toString().replace(replacement[0], replacement[1]);
                });
            });
            scripts.forEach(function (script) {
                if (script.inline)
                    return;
                replacements.forEach(function (replacement) {
                    script.source = script.source.toString().replace(replacement[0], replacement[1]);
                });
                script.source = script.source.toString().replace(/{{type}}/, scriptType);
            });
        };
        var servedLoader;
        var servedAfterBody;
        try {
            const writeafterbody = res.locals.__writeafterbody = (out) => {
                afterbodyRenderers.forEach(function (renderer) {
                    renderer(out);
                });
                if (useLoader) {
                    const locals = {
                        errorContainerHead: res.locals.errorContainerHead || "",
                        errorContainerFoot: res.locals.errorContainerFoot || "",
                        progressContainerHead: res.locals.progressContainerHead,
                        progressContainerFoot: res.locals.progressContainerFoot || ""
                    };
                    locals.errorContainerHead = locals.errorContainerHead || "";
                    locals.errorContainerFoot = locals.errorContainerFoot || "";
                    if (!locals.progressContainerHead) {
                        const icons = (res.renderoptions || this.renderoptions).icons;
                        if (icons) {
                            if (_.isString(icons))
                                locals.progressContainerHead = "<div class=\"loader-progress-heading\"><img src=\"" + icons + "152." + req.webpOrPng + "\" srcset=\"" + icons + "152." + req.webpOrPng + " 1x, " + icons + "310." + req.webpOrPng + " 2x\" /></div>";
                            else {
                                var icon;
                                var distance = Number.MAX_VALUE;
                                Object.keys(icons).forEach(function (rsize) {
                                    const size = parseInt(rsize);
                                    var dist = size - 152;
                                    if (dist >= 0 && dist < distance) {
                                        icon = icons[rsize].toString();
                                        distance = dist;
                                    }
                                });
                                if (icon)
                                    locals.progressContainerHead = "<div class=\"loader-progress-heading\"><img width=\"152\" src=\"" + Template_1.Template.encodeHTML(icon, true) + "\" /></div>";
                                else
                                    locals.progressContainerHead = "";
                            }
                        }
                        else
                            locals.progressContainerHead = "";
                    }
                    locals.progressContainerFoot = locals.progressContainerFoot || "";
                    overlayHtmlParts.forEach(function (step) {
                        step(out, locals);
                    });
                    servedLoader = true;
                }
                servedAfterBody = true;
                try {
                    out['flush']();
                }
                catch (e) { }
            };
            Object.defineProperty(res, "writeAfterBodyHtml", {
                value: function (out) {
                    writeafterbody(out || res);
                }
            });
        }
        catch (e) { }
        const getLoaderData = () => {
            processResources();
            const resarray = [];
            const gfontkeys = Object.keys(gfonts);
            if (gfontkeys.length) {
                var gfonturl = "https://fonts.googleapis.com/css?family=";
                // Barlow|Barlow+Condensed:100i|Lato:100,900|Slabo+27px
                var first = true;
                gfontkeys.forEach(function (font) {
                    if (first)
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
                    dependencies: []
                });
            }
            const alreadySent = req.io && (req.io['__sent_resources'] || (req.io['__sent_resources'] = []));
            const skip = alreadySent ? function (resource) {
                const key = resource.type + ":" + resource.name;
                if (alreadySent.indexOf(key) > -1)
                    return true;
                alreadySent.push(key);
                return false;
            } : function () { return false; };
            styles.forEach(function (style) {
                style['type'] = "style";
                if (skip(style))
                    return;
                resarray.push(style);
            });
            scripts.forEach(function (script) {
                script['type'] = "script";
                if (skip(script))
                    return;
                resarray.push(script);
            });
            return [this.versions, resarray, siteUrl];
        };
        try {
            Object.defineProperty(res, "getLoaderData", {
                value: getLoaderData
            });
        }
        catch (e) { }
        try {
            const self = this;
            const writefooter = res.locals.__writefooter = (out) => {
                if (!servedAfterBody)
                    afterbodyRenderers.forEach(function (renderer) {
                        renderer(out);
                    });
                if (!noScript) {
                    const user = req.user;
                    if (user)
                        addInlineScript("window.NexusFrameworkClient['currentUserID']=" + JSON.stringify("" + (user.id || user.email || user.displayName || "Logged")), "nexusframeworkclient");
                    if (useLoader) {
                        if (!servedLoader) {
                            const locals = res.locals;
                            locals.progressContainerHead = locals.progressContainerHead || "";
                            locals.progressContainerFoot = locals.progressContainerFoot || "";
                            locals.loaderJSRequiredTitle = locals.loaderJSRequiredTitle || "JavaScript Required";
                            locals.loaderJSRequiredMessage = locals.loaderJSRequiredMessage || "Sorry but, this website requires scripts!";
                            overlayHtmlParts.forEach(function (step) {
                                step(out, locals);
                            });
                        }
                    }
                    else {
                        // TODO: Sort dependencies
                        scripts.forEach(function (script) {
                            if (script.inline) {
                                out.write("<script type=\"text/javascript\">");
                                out.write(script.source.toString());
                                out.write("</script>");
                            }
                            else {
                                out.write("<script type=\"text/javascript\" src=\"");
                                out.write(Template_1.Template.encodeHTML(url.format(script.source), true));
                                out.write("\"></script>");
                            }
                        });
                    }
                }
                footerRenderers.forEach(function (renderer) {
                    renderer(out);
                });
                if (useLoader) {
                    if (!pagesys) {
                        out.write("<script type=\"text/javascript\">");
                        out.write(es6 ? loaderScriptEs6 : loaderScriptEs5);
                        out.write("//# sourceMappingURL=" + req.protocol + "://" + req.hostname + _path.posix.join("/", self.prefix, ":scripts/" + (es6 ? "es6" : "es5") + "/loader.min.js.map") + "</script>");
                    }
                    out.write("<script type=\"text/javascript\">NexusFrameworkLoader.load(");
                    out.write(JSON.stringify(getLoaderData()));
                    out.write(")</script>");
                }
            };
            Object.defineProperty(res, "writeFooterHtml", {
                value: function (out) {
                    writefooter(out || res);
                }
            });
        }
        catch (e) { }
        var socialTagsSet = false;
        const setSocialTags = function (socialTags) {
            socialTagsSet = true;
            if (socialTags.url) {
                const url = socialTags.url.toString();
                meta['og:url'] = url;
                meta['twitter:url'] = url;
            }
            if (socialTags.title) {
                const title = socialTags.title;
                meta['g+:name'] = title;
                meta['og:title'] = title;
                meta['twitter:title'] = title;
            }
            if (socialTags.twitterCard)
                meta['twitter:card'] = socialTags.twitterCard;
            if (socialTags.siteTitle)
                meta['og:site_name'] = socialTags.siteTitle;
            if (socialTags.seeAlso)
                meta['og:see_also'] = socialTags.seeAlso.toString();
            if (socialTags.image) {
                const image = socialTags.image.toString();
                meta['g+:image'] = image;
                meta['og:image'] = image;
                meta['twitter:image'] = image;
            }
            const description = socialTags.description;
            meta['g+:description'] = description;
            meta['og:description'] = description;
            meta['twitter:description'] = description;
        };
        try {
            Object.defineProperty(res, "setSocialTags", {
                value: setSocialTags
            });
        }
        catch (e) { }
        try {
            const writeheader = res.locals.__writeheader = (out) => {
                if (req.method.toUpperCase() === "GET") {
                    if (noScript) {
                        try {
                            res.cookie("noscript", "true", { expires: new Date(+(new Date) + 3.154e+10) });
                        }
                        catch (e) { }
                        const _url = url.parse(req.originalUrl, true);
                        _url.query = _url.query || {};
                        out.write('<script>document.cookie=\"noscript=; Path=/; Expires=Thu, 1 Nov 1970 00:00:00 GMT\";location.href = ');
                        delete _url.query.noscript;
                        _url.search = "?" + querystring.stringify(_url.query);
                        if (_url.search == "?") {
                            _url.search = undefined;
                            _url.path = _url.pathname;
                        }
                        else
                            _url.path = _url.pathname + _url.search;
                        delete _url.href;
                        out.write(JSON.stringify(url.format(_url)));
                        out.write('</script>');
                    }
                    else {
                        out.write('<noscript><meta http-equiv="refresh" content="0; url=\'');
                        const _url = url.parse(req.originalUrl, true);
                        _url.query = _url.query || {};
                        _url.query.noscript = "1";
                        out.write(Template_1.Template.encodeHTML(url.format(_url), true));
                        out.write('\'" /></noscript>');
                    }
                }
                const renderoptions = (res.renderoptions || this.renderoptions);
                const icons = renderoptions.icons;
                if (icons) {
                    if (_.isString(icons)) {
                        const type = webp ? "webp" : "png";
                        iconSizes.forEach(function (size) {
                            out.write("<link rel=\"icon\" sizes=\"");
                            out.write("" + size);
                            out.write("\" type=\"image/");
                            out.write(type);
                            out.write("\" href=\"");
                            out.write(Template_1.Template.encodeHTML(icons + size + "." + type, true));
                            out.write("\">");
                        });
                    }
                    else
                        Object.keys(icons).forEach(function (size) {
                            const path = icons[size].toString();
                            out.write("<link rel=\"icon\" sizes=\"");
                            out.write(size);
                            out.write("\" type=\"image/");
                            const _path = url.parse(path).pathname;
                            if (/\.png$/i.test(_path))
                                out.write("png");
                            else if (/\.jpe?g$/i.test(_path))
                                out.write("jpeg");
                            else if (/\.webp$/i.test(_path))
                                out.write("webp");
                            else if (/\.gif$/i.test(_path))
                                out.write("gif");
                            else
                                out.write("unknown");
                            out.write("\" href=\"");
                            out.write(Template_1.Template.encodeHTML(path, true));
                            out.write("\">");
                        });
                }
                const extraMeta = res.locals.meta;
                if (_.isObject(extraMeta))
                    _.extend(meta, extraMeta);
                if (meta.description && !socialTagsSet)
                    setSocialTags(meta);
                Object.keys(meta).forEach(function (key) {
                    out.write("<meta ");
                    if (/^og:/.test(key))
                        out.write("property");
                    else if (/^g+:/.test(key)) {
                        key = key.substring(2);
                        out.write("itemprop");
                    }
                    else
                        out.write("name");
                    out.write("=\"");
                    out.write(Template_1.Template.encodeHTML(key, true));
                    out.write("\" content=\"");
                    out.write(Template_1.Template.encodeHTML(meta[key]));
                    out.write("\" />");
                });
                const links = res.locals.links;
                if (_.isObject(links)) {
                    try {
                        res.links(links);
                    }
                    catch (e) { }
                    Object.keys(links).forEach(function (link) {
                        out.write("<link rel=\"");
                        out.write(Template_1.Template.encodeHTML(link, true));
                        out.write("\" href=\"");
                        out.write(Template_1.Template.encodeHTML(links[link], true));
                        out.write("\" />");
                    });
                }
                if (useLoader) {
                    if (!pagesys) {
                        out.write("<style>");
                        out.write(overlayCss);
                        out.write("</style>");
                    }
                }
                else {
                    processResources();
                    const gfontkeys = Object.keys(gfonts);
                    if (gfontkeys.length) {
                        out.write("<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css?family=");
                        var first = true;
                        gfontkeys.forEach(function (font) {
                            if (first)
                                first = false;
                            else
                                out.write("|");
                            const styles = gfonts[font];
                            out.write(encodeURIComponent(font));
                            if (styles.length == 1 && styles[0] == "400")
                                return;
                            out.write(":");
                            out.write(styles.join(","));
                        });
                        out.write("\">");
                    }
                    // TODO: Sort dependencies
                    styles.forEach(function (style) {
                        if (style.inline) {
                            out.write("<style>");
                            out.write(style.source.toString());
                            out.write("</style>");
                        }
                        else {
                            out.write("<link rel=\"stylesheet\" href=\"");
                            out.write(Template_1.Template.encodeHTML(url.format(style.source), true));
                            out.write("\">");
                        }
                    });
                }
                headerRenderers.forEach(function (renderer) {
                    renderer(out);
                });
            };
            Object.defineProperty(res, "writeFooterHtml", {
                value: function (out) {
                    writeheader(out || res);
                }
            });
        }
        catch (e) { }
        try {
            res.locals.bodyclass = "";
        }
        catch (e) { }
        try {
            const render = res.render;
            Object.defineProperty(res, "render", {
                value: (filename, options, callback) => {
                    if (options instanceof Function)
                        callback = options;
                    if (this.app.get("view engine") == "nhp") {
                        var vars = _.cloneDeep(res.app.locals);
                        _.merge(vars, res.locals);
                        if (options)
                            _.merge(vars, options);
                        this.nhp.render(filename, vars, callback);
                    }
                    else
                        render.call(res, filename, options, callback);
                }
            });
        }
        catch (e) { }
        try {
            Object.defineProperty(res, "sendRender", {
                configurable: true,
                value: (filename, options) => {
                    if (req.app.get("view engine") == "nhp") {
                        var vars = _.clone(res.app.locals) || {};
                        _.merge(vars, res.locals);
                        if (options)
                            _.merge(vars, options);
                        const meta = vars['meta'];
                        if (_.isObject(meta))
                            Object.keys(meta).forEach(function (key) {
                                res.setMetaTag(key, meta[key]);
                            });
                        const icons = vars['icons'];
                        if (_.isArray(icons))
                            Object.keys(icons).forEach(function (key) {
                                res.setMetaTag(key, icons[key]);
                            });
                        const renderoptions = res.renderoptions || this.renderoptions;
                        if (pagesys) {
                            var pagesysskeleton = renderoptions.pagesysskeleton;
                            if (pagesysskeleton) {
                                if (_.isString(pagesysskeleton))
                                    pagesysskeleton = require(pagesysskeleton);
                                pagesysskeleton(filename, vars, req, res, function (err, data) {
                                    if (err)
                                        res.sendFailure(err);
                                    else if (data)
                                        res.type("application/bson").end(BSON.serialize(data));
                                    else
                                        res.sendFailure(new Error("Server Error: No data passed"));
                                });
                                return;
                            }
                        }
                        const out = req.io ? res : new BufferingWritable(res);
                        const callback = function (err) {
                            if (err)
                                res.sendFailure(err);
                            else
                                out.end();
                        };
                        var skeleton = (legacy && renderoptions.legacyskeleton) || renderoptions.skeleton;
                        if (!res.get("content-type"))
                            try {
                                res.type("text/html; charset=utf-8"); // Default to utf8 html
                            }
                            catch (e) { }
                        if (skeleton) {
                            vars['page'] = filename;
                            if (_.isString(skeleton))
                                skeleton = this.nhp.template(skeleton);
                            skeleton.renderToStream(vars, out, callback);
                        }
                        else
                            this.nhp.renderToStream(filename, vars, out, callback);
                    }
                    else
                        res.render(filename, options, function (err, html) {
                            if (err)
                                res.sendFailure(err);
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
        }
        catch (e) { }
        const builtInSendStatus = res.sendStatus.bind(res);
        const used = {};
        try {
            Object.defineProperty(res, "sendStatus", {
                configurable: true,
                value: (code, _err) => {
                    var st = "" + code;
                    var handler;
                    const errordoc = (res.renderoptions || this.renderoptions).errordoc || {};
                    if ((handler = (errordoc[st] || errordoc["*"])) && used[st] != handler) {
                        used[st] = handler;
                        try {
                            res.locals.errorCode = code;
                        }
                        catch (e) { }
                        try {
                            Object.defineProperty(req, "errorCode", {
                                configurable: true,
                                value: code
                            });
                        }
                        catch (e) { }
                        try {
                            res.locals.error = _err;
                        }
                        catch (e) { }
                        try {
                            Object.defineProperty(req, "error", {
                                configurable: true,
                                value: _err
                            });
                        }
                        catch (e) { }
                        res.status(code);
                        res.addBodyClassName("error-page");
                        res.addBodyClassName("error-" + code);
                        req.url = url.resolve("/", handler);
                        this.process(req, res, function (err) {
                            if (err) {
                                console.warn(err);
                                builtInSendStatus(500, new Error("Error with error page script"));
                            }
                            else
                                builtInSendStatus(code, _err);
                        });
                    }
                    else
                        builtInSendStatus(code, _err);
                }
            });
        }
        catch (e) { }
        const builtInSendFailure = res.sendFailure && res.sendFailure.bind(req);
        try {
            Object.defineProperty(res, "sendFailure", {
                configurable: true,
                value: (_err) => {
                    var handler;
                    const errordoc = (res.renderoptions || this.renderoptions).errordoc;
                    if ((handler = (errordoc["500"] || errordoc["*"])) && used["500"] != handler) {
                        req.logger.warn(_err);
                        used["500"] = handler;
                        handler = _path.posix.join("/", handler);
                        try {
                            Object.defineProperty(req, "errorCode", {
                                configurable: true,
                                value: 500
                            });
                        }
                        catch (e) { }
                        try {
                            res.locals.errorCode = 500;
                        }
                        catch (e) { }
                        try {
                            Object.defineProperty(req, "error", {
                                configurable: true,
                                value: _err
                            });
                        }
                        catch (e) { }
                        try {
                            res.locals.error = _err;
                        }
                        catch (e) { }
                        res.status(500);
                        res.addBodyClassName("error-page");
                        res.addBodyClassName("error-500");
                        req.url = url.resolve("/", handler);
                        this.process(req, res, function (err) {
                            if (err) {
                                console.warn(err);
                                builtInSendStatus(500, new Error("Error with error page script"));
                            }
                            else
                                builtInSendFailure(_err);
                        });
                    }
                    else
                        builtInSendStatus(_err);
                }
            });
        }
        catch (e) { }
        next();
    }
    static nexusforkUpgrade(req, res) {
        try {
            Object.defineProperty(req, "services", {
                value: {
                    open(service, cb) {
                        cb(new Error("Not running through NexusFork"));
                    },
                    emitWithErrorHandler(service, event, onerror, ...args) {
                        onerror(new Error("Not running through NexusFork"));
                    },
                    emit(service, event, ...args) { }
                }
            });
        }
        catch (e) { }
    }
    /**
     * Express compatible handler
     */
    __express(req, res, next) {
        NexusFramework.nexusforkUpgrade(req, res);
        this.handle(req, res, next);
    }
    static expressUpgradeRequest(req, onPrototype = false) {
        if (!onPrototype)
            req['originalUrl'] = req['originalUrl'] || req.url;
        express_req_install(req);
    }
    static expressUpgradeResponse(res, onPrototype = false) {
        if (!onPrototype)
            res['locals'] = res['locals'] || {};
        express_res_install(res);
    }
    static expressUpgrade(req, res, onPrototype = false) {
        NexusFramework.expressUpgradeRequest(req, onPrototype);
        NexusFramework.expressUpgradeResponse(res, onPrototype);
    }
    /**
     * HTTP compatible handler
     */
    __http(req, res, next) {
        NexusFramework.expressUpgrade(req, res);
        res['app'] = this.app;
        req['app'] = this.app;
        res['req'] = req;
        req['res'] = res;
        this.__express(req, res, next);
    }
    close(cb) {
        this.server.close(cb);
    }
    isIOSetup() {
        return !!this.io;
    }
}
NexusFramework.apiencoders = {
    "json": function (locals, req, res) {
        res.type("text/json").end(JSON.stringify(locals));
    },
    "bson": function (locals, req, res) {
        res.type("application/bson").end(BSON.serialize(locals));
    },
    "debug": function (locals, req, res) {
        res.type("text/plain").end(DEBUG.stringify(locals));
    },
    "xml": function (locals, req, res) {
        res.type("text/xml").end(XML.stringify(locals));
    }
};
exports.NexusFramework = NexusFramework;
NexusFramework.prototype.use = NexusFramework.prototype.pushMiddleware;
const json = SocketIOResponse.prototype.json;
NexusFramework.expressUpgrade(SocketIORequest.prototype, SocketIOResponse.prototype, true);
SocketIOResponse.prototype.json = json;
//# sourceMappingURL=nexusframework.js.map