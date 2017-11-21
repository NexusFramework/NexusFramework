"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cookieParser = require("cookie-parser");
const querystring = require("querystring");
const nulllogger = require("nulllogger");
const socket_io = require("socket.io");
const useragent = require("useragent");
const lrucache = require("lru-cache");
const statuses = require("statuses");
const chokidar = require("chokidar");
const express = require("express");
const events = require("events");
const stream = require("stream");
const multer = require("multer");
const isbot = require("isbot");
const upath = require("upath");
const async = require("async");
const http = require("http");
const path = require("path");
const _ = require("lodash");
const url = require("url");
const nhp = require("nhp");
const fs = require("fs");
const uacache = lrucache();
const namecache = lrucache();
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
        return cached;
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
    namecache.set(rawname, name);
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
const multerInstance = multer().any();
const pkgjson = require(path.resolve(__dirname, "../package.json"));
const sckclpkgjson = require("socket.io/package.json");
const overlayCss = fs.readFileSync(path.resolve(__dirname, "../loader/overlay.css"), "utf8").replace(/\s*\/\*# sourceMappingURL=overlay.css.map \*\/\s*/, "");
const overlayHtml = fs.readFileSync(path.resolve(__dirname, "../loader/overlay.html"), "utf8");
const loaderScriptEs5 = fs.readFileSync(path.resolve(__dirname, "../scripts/es5/loader.min.js"), "utf8").replace(/\s*\/\/# sourceMappingURL=.+\s*/, "");
const loaderScriptEs6 = fs.readFileSync(path.resolve(__dirname, "../scripts/es6/loader.min.js"), "utf8").replace(/\s*\/\/# sourceMappingURL=.+\s*/, "");
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
function encodeHTML(html, attr = false) {
    html = html.replace(/</g, "&lt;");
    html = html.replace(/>/g, "&gt;");
    if (attr)
        return html.replace(/"/g, "&quot;");
    return html;
}
class SocketIORequest extends events.EventEmitter {
    constructor(upgradedRequest, method, path, body, headers) {
        super();
        this.pagesys = true;
        this.fresh = false;
        this.stale = true;
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
    get rawHeaders() {
        var rawHeaders = [];
        Object.keys(this.headers).forEach((key) => {
            rawHeaders.push(key + ": " + this.headers[key]);
        });
        return rawHeaders;
    }
    get accepted() {
        throw new Error("Not supported");
    }
    get query() {
        return url.parse(this.url, true).query || {};
    }
    get path() {
        return url.parse(this.url).path;
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
        this.locals = {};
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
    json(data) {
        this.response = data;
        this.end();
        return this;
    }
    assignSocket(...args) { return undefined; }
    detachSocket(...args) { return undefined; }
    writeContinue(...args) { return undefined; }
    setTimeout(...args) { return this; }
    _write(data, encoding, cb) {
        const dat = data.toString("utf8");
        if (dat.length)
            this.response += dat;
        cb();
    }
    end(...args) {
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
function decodePath(path) {
    return path.replace(/\$/g, "\\$").replace(/\^/g, "\\^").replace(/%([a-z0-9]{2}|%)/g, function (match, p1, offset) {
        if (p1 === "%")
            return "%";
        return String.fromCharCode(parseInt(p1, 16));
    });
}
function stripPath(path) {
    return path.replace(/^\/|\/$/g, "");
}
function cleanPath(path) {
    return upath.join("/", path).replace(/^\/|\/$/g, "");
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
                            return res.redirect(urlpath);
                        }
                        this['_index'].handle(req, res, (err, locals) => {
                            if (err)
                                next(err);
                            else {
                                locals = locals || {};
                                const view = this['views'][res.app.get("view engine")];
                                if (view)
                                    res.sendRender(view, locals);
                                else
                                    next(new Error("No view to render"));
                            }
                        });
                    }
                    else
                        next();
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
        };
        if (this.route)
            this.route(req, res, function (err, route) {
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
            const slash = path.lastIndexOf("/");
            const toFind = slash > -1 ? path.substring(slash + 1) : path;
            if (toFind !== handler.rawPattern)
                throw new Error("rawPattern must match path when setting a child. " + toFind + " !== " + handler.rawPattern);
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
    constructor(handler) {
        this.handle = handler;
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
class LeafRequestChildHandler extends LeafRequestHandler {
    constructor(handler, pattern) {
        super(handler);
        this.rawPattern = pattern;
        this.pattern = new RegExp("^" + pattern + "$", "i");
    }
}
class NHPRequestHandler extends LeafRequestHandler {
    constructor(impl, skeleton, pagesysskeleton, legacyskeleton, redirect = false) {
        super((req, res, next) => {
            req.skeleton = skeleton || req.nexusframework['skeleton'];
            req.legacyskeleton = legacyskeleton || req.nexusframework['legacyskeleton'];
            req.pagesysskeleton = pagesysskeleton || req.nexusframework['pagesysskeleton'];
            const _next = () => {
                const _next = () => {
                    var urlpath;
                    if (redirect && req.method.toUpperCase() === "GET" && /\/(\?.*)?$/.test(urlpath = url.parse(req.originalUrl).path)) {
                        const q = urlpath.indexOf("?");
                        if (q == -1)
                            urlpath = urlpath.substring(0, urlpath.length - 1);
                        else
                            urlpath = urlpath.substring(0, q - 1) + urlpath.substring(q);
                        return res.redirect(urlpath);
                    }
                    this.impl(req, res, (err, locals) => {
                        if (err)
                            next(err);
                        else if (locals) {
                            const view = this['views'][res.app.get("view engine")];
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
        this.skeleton = skeleton;
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
class NHPRequestChildHandler extends NHPRequestHandler {
    constructor(impl, skeleton, pagesysskeleton, legacyskeleton, pattern, redirect = true) {
        super(impl, skeleton, pagesysskeleton, legacyskeleton, redirect);
        this.rawPattern = pattern;
        this.pattern = new RegExp("^" + pattern + "$", "i");
    }
}
function resolveHandler(mapping, req) {
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
    return handler || mapping.use;
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
function lazyLoadMapping(filename, method, mapping) {
    if (filename instanceof Function)
        return filename;
    return function (req, res, next, broken) {
        try {
            const handler = require(filename);
            if (!(handler instanceof Function))
                throw new Error("Handler is not a Function: " + filename);
            req.mapping = mapping;
            handler(req, res, next, broken);
            mapping[method] = handler;
        }
        catch (e) {
            mapping[method] = function (a, b, next) {
                next(e);
            };
            next(e);
        }
    };
}
function processMapping(mapping, mapped = {}) {
    const use = mapping['use'] || mapping['__use'] || mapping['all'] || mapping['__all'] || mapping['*'];
    if (use)
        mapped.use = lazyLoadMapping(use, "use", mapped);
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
        else if (get)
            mapped.put = function (req, res, next) {
                res.sendStatus.call(res, 403);
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
        else if (get)
            mapped.post = function (req, res, next) {
                express_res.sendStatus.call(res, 403);
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
        else if (get)
            mapped.patch = function (req, res, next) {
                express_res.sendStatus.call(res, 403);
            };
    }
    const head = mapping['head'] || mapping['__head'];
    if (head)
        mapped.head = lazyLoadMapping(head, "head", mapped);
    const del = mapping['del'] || mapping['__del'] || mapping['delete'] || mapping['__delete'];
    if (del)
        mapped.del = lazyLoadMapping(del, "del", mapped);
    return mapped;
}
class LazyLoadingRequestHandler extends RequestHandlerWithChildren {
    constructor(fspath, logger, skeleton, pagesysskeleton, legacyskeleton) {
        super();
        this.fspath = fspath;
        this.skeleton = skeleton;
        this.legacyskeleton = legacyskeleton;
        this.pagesysskeleton = pagesysskeleton;
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
                    const filename = path.resolve(this.fspath, file);
                    const match = file.match(/([^.]+)(\.([^.]+))?\.([^.]+)/);
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
                        else
                            method = "get";
                        cmapping[method] = filename;
                    }
                    else if (/^([^.]+$)/.test(file)) {
                        const pattern = decodePath(file);
                        this.setChild(pattern, new LazyLoadingRequestChildHandler(filename, logger, this.skeleton, this.pagesysskeleton, this.legacyskeleton, pattern));
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
                                    throw new Error("No JavaScript files found for `" + path.resolve(this.fspath, key + ".*") + "`");
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
                                    throw new Error("No JavaScript files found for `" + path.resolve(this.fspath, key + ".*") + "`");
                                const mapping = processMapping(methods);
                                const handler = function (req, res, exists, doesntExist) {
                                    const handler = resolveHandler(mapping, req);
                                    if (handler)
                                        handler(req, res, exists, doesntExist);
                                    else
                                        next();
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
                                    throw new Error("No JavaScript files found for `" + path.resolve(this.fspath, key + ".*") + "`");
                                const mapping = processMapping(methods);
                                const handler = function (req, res, allowed, denied) {
                                    const handler = resolveHandler(mapping, req);
                                    if (handler)
                                        handler(req, res, allowed, denied);
                                    else
                                        next();
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
                        const handler = createExtendedRequestHandler();
                        const methods = extensions['js'] || {};
                        const json = extensions['json'];
                        if (json)
                            Object.keys(json).forEach((method) => {
                                try {
                                    const data = require(json[method]) || {};
                                    methods[method] = (req, res, next) => {
                                        next(undefined, data, this.skeleton, this.pagesysskeleton, this.legacyskeleton);
                                    };
                                }
                                catch (e) {
                                    methods[method] = function (req, res, next) {
                                        next(e);
                                    };
                                }
                            });
                        if (!methods)
                            throw new Error("No JavaScript files found for `" + path.resolve(this.fspath, key + ".*") + "`");
                        processMapping(methods, handler);
                        var leaf;
                        if (key === "index")
                            this.setIndex(leaf = new NHPRequestHandler(handler, this.skeleton, this.pagesysskeleton, this.legacyskeleton));
                        else {
                            const child = this.childAt(key);
                            if (child)
                                child.setIndex(leaf = new NHPRequestHandler(handler, this.skeleton, this.pagesysskeleton, this.legacyskeleton));
                            else
                                this.setChild(key, leaf = new NHPRequestChildHandler(handler, this.skeleton, this.pagesysskeleton, this.legacyskeleton, key));
                        }
                        try {
                            leaf.setView(extensions['nhp']['get']);
                        }
                        catch (e) { }
                    }
                });
                this.handle = (req, res, next) => {
                    req.skeleton = this.skeleton || req.nexusframework['skeleton'];
                    super.handle(req, res, next);
                };
                delete this.childPaths;
                next();
            }
        });
    }
}
class LazyLoadingRequestChildHandler extends LazyLoadingRequestHandler {
    constructor(fspath, logger, skeleton, pagesysskeleton, legacyskeleton, pattern) {
        super(fspath, logger, skeleton, pagesysskeleton, legacyskeleton);
        this.rawPattern = pattern;
        this.pattern = new RegExp("^" + pattern + "$", "i");
    }
}
class FSWatcherRequestHandler extends RequestHandlerWithChildren {
    constructor(fspath, logger, skeleton, pagesysskeleton, legacyskeleton) {
        super();
        this.skeleton = skeleton;
        this.legacyskeleton = legacyskeleton;
        this.pagesysskeleton = pagesysskeleton;
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
    constructor(fspath, logger, skeleton, pagesysskeleton, legacyskeleton, pattern) {
        super(fspath, logger, skeleton, pagesysskeleton, legacyskeleton);
        this.rawPattern = pattern;
        this.pattern = new RegExp("^" + pattern + "$", "i");
    }
}
class NexusFramework extends events.EventEmitter {
    constructor(app = express(), server, logger = new nulllogger("NexusFramework"), prefix = "/") {
        super();
        this.root = new RequestHandlerWithChildren();
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
        const genFooterInstruction = new Custom(undefined, function () {
            return "try{__writefooter(__out);}catch(e){__out.write(__error(e));};__next();";
        });
        this.nhp.installProcessor("footer", function () {
            return genFooterInstruction;
        });
        const genHeaderInstruction = new Custom(undefined, function () {
            return "try{__writeheader(__out);}catch(e){__out.write(__error(e));};__next();";
        });
        this.nhp.installProcessor("header", function () {
            return genHeaderInstruction;
        });
        const genAfterBodyInstruction = new Custom(undefined, function () {
            return "try{__writeafterbody(__out);}catch(e){__out.write(__error(e));};__next();";
        });
        this.nhp.installProcessor("afterbody", function () {
            return genAfterBodyInstruction;
        });
        app.set("view engine", "nhp");
        app.engine("nhp", (filename, options, callback) => {
            const skeleton = this.skeleton;
            if (skeleton) {
                if (options)
                    options.page = filename;
                else
                    options = {
                        page: filename
                    };
                skeleton.render(options, callback);
            }
            else
                this.nhp.render(filename, options, callback);
        });
    }
    setupTemplate(root) {
        const Include = nhp.Instructions.Include;
        this.nhp.installProcessor("template", function (file) {
            return new Include(file, root);
        });
    }
    enableLoader() {
        this.loaderEnabled = true;
    }
    disableLoader() {
        this.loaderEnabled = false;
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
            this.legacyskeleton = this.nhp.template(val);
        else
            this.legacyskeleton = val;
    }
    setSkeleton(val) {
        if (_.isString(val))
            this.skeleton = this.nhp.template(val);
        else
            this.skeleton = val;
    }
    setPageSystemSkeleton(val) {
        if (_.isString(val))
            this.pagesysskeleton = require(val);
        else
            this.pagesysskeleton = val;
    }
    setErrorDocument(code, page) {
        if (!page) {
            if (code === "*")
                page = "errdoc";
            else
                page = "errdoc/" + code;
        }
        else
            page = upath.join("/", page).substring(1);
        this.errordoc[code] = page;
    }
    mountScripts(mpath = ":scripts") {
        this.mountStatic(mpath, path.resolve(__dirname, "../scripts/"), {
            directoryListing: true
        });
    }
    mountAbout(mpath = ":about") {
        this.mount(mpath, path.resolve(__dirname, "../about/"));
    }
    dumpRoot() {
        this.root.childPaths(this.logger.info.bind(this.logger), true);
    }
    setupIO(path = ":io") {
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
            client.on("init", function (sentResources) {
                const sent = (client['__sent_resources'] || (client['__sent_resources'] = []));
                sentResources.forEach(function (res) {
                    if (sent.indexOf(res) == -1)
                        sent.push(res);
                });
            });
            client.on("page", (method, path, post, headers, cb) => {
                try {
                    const req = new SocketIORequest(client.conn.request, method, upath.join(this.prefix, path), post, headers);
                    Object.defineProperty(req, "io", {
                        value: client
                    });
                    const res = new SocketIOResponse(cb);
                    this.expressUpgrade(req, res);
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
        return iopath;
    }
    /**
     * Mount a filesystem path onto a web path.
     *
     * @param wwwpath The web path
     * @param fspath The filesystem path
     * @param lazyAndImmutable When true, changes to the filesystem are not honoured and path scanning is done lazily, defaults to true
     */
    mount(webpath, fspath, lazyAndImmutable = true, skeleton, pagesysskeleton, legacyskeleton) {
        webpath = upath.join("/", webpath);
        fspath = path.resolve(process.cwd(), fspath);
        if (_.isString(skeleton))
            skeleton = this.nhp.template(skeleton);
        if (_.isString(pagesysskeleton))
            pagesysskeleton = require(pagesysskeleton);
        if (_.isString(legacyskeleton))
            legacyskeleton = this.nhp.template(legacyskeleton);
        if (webpath == "/")
            this.setIndex(lazyAndImmutable ? new LazyLoadingRequestHandler(fspath, this.logger, skeleton, pagesysskeleton, legacyskeleton) : new FSWatcherRequestHandler(fspath, this.logger, skeleton, pagesysskeleton, legacyskeleton));
        else {
            const cpath = stripPath(webpath);
            const last = cpath.lastIndexOf("/");
            const end = cpath.substring(last + 1);
            this.root.setChild(webpath, lazyAndImmutable ? new LazyLoadingRequestChildHandler(fspath, this.logger, skeleton, pagesysskeleton, legacyskeleton, end) : new FSWatcherRequestChildHandler(fspath, this.logger, skeleton, pagesysskeleton, legacyskeleton, end), true);
        }
    }
    mountStatic(webpath, fspath, options) {
        webpath = upath.join("/", webpath);
        fspath = path.resolve(process.cwd(), fspath);
        const startsWith = new RegExp("^" + fspath.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + "(.*)$");
        const handler = function (req, res, next) {
            const filename = path.resolve(fspath, req.path.substring(1));
            if (startsWith.test(filename))
                fs.stat(filename, function (err, stats) {
                    if (err)
                        next(err);
                    else if (stats) {
                        var urlpath = url.parse(req.originalUrl).path;
                        if (stats.isDirectory()) {
                            if (options.directoryListing) {
                                if (req.method.toUpperCase() === "GET" && !/\/(\?.*)?$/.test(urlpath)) {
                                    const q = urlpath.indexOf("?");
                                    if (q == -1)
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
                                }
                                else
                                    fs.readdir(filename, function (err, files) {
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
                                        files.forEach(function (file) {
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
                            }
                            else
                                res.sendStatus(403);
                        }
                        else if (req.method.toUpperCase() === "GET" && /\/(\?.*)?$/.test(urlpath)) {
                            const q = urlpath.indexOf("?");
                            if (q == -1)
                                urlpath = urlpath.substring(0, urlpath.length - 1);
                            else
                                urlpath = urlpath.substring(0, q - 1) + urlpath.substring(q);
                            return res.redirect(urlpath);
                        }
                        else if (req.pagesys) {
                            res.writeHead(200, {
                                "content-disposition": "attachment",
                                "content-type": "text/plain"
                            });
                            res.end("Cannot be served through page system.");
                        }
                        else
                            res.sendFile(filename, function (err) {
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
        if (webpath == "/")
            this.setIndex(new LeafRequestHandler(handler));
        else {
            const cpath = stripPath(webpath);
            const end = cpath.substring(cpath.lastIndexOf("/") + 1);
            this.root.setChild(webpath, new LeafRequestChildHandler(handler, end), true);
        }
    }
    setIndex(handler) {
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
    setHandlerEntry(path, handler, createIfNotExists = true) {
        this.root.setChild(path, handler, createIfNotExists);
    }
    /**
     * Set a request handler for the specified path.
     * Replaces any existing request handler.
     *
     * @param path The path
     * @param handler The request handler
     */
    setHandler(webpath, handler, createIfNotExists = true) {
        webpath = upath.join("/", webpath);
        if (webpath == "/")
            this.setIndex(new LeafRequestHandler(handler));
        else {
            const cpath = stripPath(webpath);
            const last = cpath.lastIndexOf("/");
            const end = cpath.substring(last + 1);
            this.root.setChild(webpath, new LeafRequestChildHandler(handler, end), true);
        }
    }
    handlerAt(path, createIfNotExists = false) {
        path = upath.join("/", path);
        if (path === "/")
            return this.root;
        else
            return this.root.childAt(path, createIfNotExists);
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
                const errordoc = this.errordoc;
                try {
                    Object.defineProperty(req, "logger", {
                        configurable: true,
                        value: this.logger.extend(req.path)
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
                try {
                    if (req.io)
                        Object.defineProperty(req, "readBody", {
                            configurable: true,
                            value: function (cb, ...processors) {
                                cb(undefined, "");
                            }
                        });
                    else
                        Object.defineProperty(req, "readBody", {
                            configurable: true,
                            value: function (cb, limit = 8192) {
                                var buffer = "";
                                req.setEncoding("utf8");
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
                                    buffer += chunk;
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
                    if (req.io)
                        Object.defineProperty(req, "processBody", {
                            configurable: true,
                            value: function (cb, ...processors) {
                                cb();
                            }
                        });
                    else
                        Object.defineProperty(req, "processBody", {
                            configurable: true,
                            value: function (cb, ...processors) {
                                const contentType = req.get("content-type");
                                if (!processors.length)
                                    processors = [0 /* URLEncoded */, 2 /* JSONBody */, 1 /* MultipartFormData */];
                                req.body = {};
                                try {
                                    processors.forEach(function (processor) {
                                        switch (processor) {
                                            case 2 /* JSONBody */:
                                                if (/\/(x\-)?json$/.test(contentType)) {
                                                    req.readBody(function (err, data) {
                                                        if (err)
                                                            return cb(err);
                                                        try {
                                                            req.body = JSON.parse(data);
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
                                                            req.body = querystring.parse(data);
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
                                                    multerInstance(req, res, cb);
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
                var pagesys;
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
                    if (req.accepts("json")) {
                        pagesys = true;
                        try {
                            res.locals.pagesys = true;
                        }
                        catch (e) { }
                        try {
                            Object.defineProperty(req, "pagesys", {
                                configurable: true,
                                value: true
                            });
                        }
                        catch (e) { }
                    }
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
                    if (isbot(rua))
                        ua.bot = true;
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
                const scriptDir = legacy ? "legacy" : (es6 ? "es6" : "es5");
                if (useLoader && !pagesys && legacy)
                    useLoader = false;
                var meta = { generator };
                var footerRenderers = this.footer.slice(0);
                var headerRenderers = this.header.slice(0);
                var afterbodyRenderers = this.afterbody.slice(0);
                var gfonts = {};
                var scripts = [];
                var styles = [];
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
                    Object.defineProperty(res, "addGoogleFont", {
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
                const addScript = function (source, version, ...deps) {
                    for (var i = 0; i < scripts.length; i++) {
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
                };
                const addSocketIOClient = () => {
                    addScript(upath.join(this.prefix, ":io/socket.io.js"), sckclpkgjson.version);
                };
                try {
                    Object.defineProperty(res, "addSocketIOClient", {
                        configurable: true,
                        value: addSocketIOClient
                    });
                }
                catch (e) { }
                const addInlineScript = function (source, ...deps) {
                    scripts.push({
                        name: "inline-" + stringHash(source),
                        source,
                        inline: true,
                        deps
                    });
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
                        value: (includeSocketIO = true, autoEnabledPageSystem = false) => {
                            const path = upath.join(this.prefix, ":scripts/" + scriptDir + "/nexusframework.min.js");
                            if (includeSocketIO) {
                                addSocketIOClient();
                                addScript(path, pkgjson.version, "socket.io");
                                if (autoEnabledPageSystem)
                                    addInlineScript("NexusFramework.initPageSystem()", "nexusframework");
                            }
                            else
                                addScript(path, pkgjson.version);
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
                        value: function (source, version, ...deps) {
                            for (var i = 0; i < styles.length; i++) {
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
                }
                catch (e) { }
                try {
                    Object.defineProperty(res, "addInlineStyle", {
                        configurable: true,
                        value: function (source, ...deps) {
                            styles.push({
                                name: "inline-" + stringHash(source),
                                source,
                                inline: true,
                                deps
                            });
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
                var servedLoader;
                var servedAfterBody;
                try {
                    const writeafterbody = res.locals.__writeafterbody = (out) => {
                        afterbodyRenderers.forEach(function (renderer) {
                            renderer(out);
                        });
                        if (useLoader) {
                            const locals = res.locals;
                            locals.progressContainerHead = locals.progressContainerHead || "";
                            locals.progressContainerFoot = locals.progressContainerFoot || "";
                            locals.loaderJSRequiredTitle = locals.loaderJSRequiredTitle || "JavaScript Required";
                            locals.loaderJSRequiredMessage = locals.loaderJSRequiredMessage || "Sorry but, this website requires scripts!";
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
                const getLoaderData = function () {
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
                            version: "1.0",
                            deps: []
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
                    return resarray;
                };
                try {
                    Object.defineProperty(res, "getLoaderData", {
                        value: getLoaderData
                    });
                }
                catch (e) { }
                try {
                    const writefooter = res.locals.__writefooter = (out) => {
                        if (!servedAfterBody)
                            afterbodyRenderers.forEach(function (renderer) {
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
                                        out.write(script.source);
                                        out.write("</script>");
                                    }
                                    else {
                                        out.write("<script type=\"text/javascript\" src=\"");
                                        if (script.version) {
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
                        footerRenderers.forEach(function (renderer) {
                            renderer(out);
                        });
                        if (useLoader) {
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
                        value: function (out) {
                            writefooter(out || res);
                        }
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
                                out.write(encodeHTML(url.format(_url), true));
                                out.write('\'" /></noscript>');
                            }
                        }
                        Object.keys(meta).forEach(function (key) {
                            out.write("<meta name=\"");
                            out.write(encodeHTML(key, true));
                            out.write("\" content=\"");
                            out.write(encodeHTML(meta[key]));
                            out.write("\" />");
                        });
                        if (useLoader) {
                            if (!pagesys) {
                                out.write("<style>");
                                out.write(overlayCss);
                                out.write("</style>");
                            }
                        }
                        else {
                            const gfontkeys = Object.keys(gfonts);
                            if (gfontkeys.length) {
                                out.write("<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css?family=");
                                // Barlow|Barlow+Condensed:100i|Lato:100,900|Slabo+27px
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
                                    out.write(style.source);
                                    out.write("</style>");
                                }
                                else {
                                    out.write("<link rel=\"stylesheet\" href=\"");
                                    if (style.version) {
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
                    res.locals.title = "Title Not Set";
                }
                catch (e) { }
                try {
                    const render = res.render;
                    Object.defineProperty(res, "render", {
                        value: (filename, options, callback) => {
                            if (options instanceof Function)
                                callback = options;
                            if (this.app.get("view engine") == "nhp") {
                                var vars = {};
                                _.extend(vars, res.app.locals);
                                _.extend(vars, res.locals);
                                if (options)
                                    _.extend(vars, options);
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
                                var vars = {};
                                _.extend(vars, res.app.locals);
                                _.extend(vars, res.locals);
                                if (options)
                                    _.extend(vars, options);
                                if (pagesys) {
                                    const pagesysskeleton = req.pagesysskeleton || this.pagesysskeleton;
                                    if (pagesysskeleton) {
                                        pagesysskeleton(filename, vars, req, res, function (err, data) {
                                            if (err)
                                                next(err);
                                            else if (data)
                                                res.json(data);
                                            else
                                                next(new Error("Server Error: No data passed"));
                                        });
                                        return;
                                    }
                                }
                                const out = req.io ? res : new BufferingWritable(res);
                                const callback = function (err) {
                                    if (err)
                                        next(err);
                                    else
                                        out.end();
                                };
                                const skeleton = (legacy && (req.legacyskeleton || this.legacyskeleton)) || req.skeleton || this.skeleton;
                                if (!res.get("content-type"))
                                    res.type("text/html; charset=utf-8"); // Default to utf8 html
                                if (skeleton) {
                                    vars['page'] = filename;
                                    skeleton.renderToStream(vars, out, callback);
                                }
                                else
                                    this.nhp.renderToStream(filename, vars, out, callback);
                            }
                            else
                                res.render(filename, options, function (err, html) {
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
                }
                catch (e) { }
                if (errordoc && Object.keys(errordoc).length) {
                    const builtInSendStatus = res.sendStatus.bind(req);
                    const used = {};
                    try {
                        Object.defineProperty(res, "sendStatus", {
                            configurable: true,
                            value: (code, _err) => {
                                var st = "" + code;
                                var handler;
                                if (!used[st] && (handler = (errordoc[st] || errordoc["*"]))) {
                                    used[st] = true;
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
                                    this.root.handle(req, res, function (err) {
                                        if (err)
                                            next(err);
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
                    if ("500" in errordoc || "*" in errordoc) {
                        const builtInSendFailure = res.sendFailure && res.sendFailure.bind(req);
                        try {
                            const used = {};
                            Object.defineProperty(res, "sendFailure", {
                                configurable: true,
                                value: (_err) => {
                                    var handler;
                                    if (!used["500"] && (handler = (errordoc["500"] || errordoc["*"]))) {
                                        used["500"] = true;
                                        handler = upath.join("/", handler);
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
                                        this.root.handle(req, res, function (err) {
                                            if (err)
                                                next(err);
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
                    }
                }
                async.eachSeries(this.stack, function (entry, cb) {
                    entry(req, res, cb);
                }, (err) => {
                    const user = req.user;
                    const userName = user ? ("`" + (user.displayName || user.email || user.id || "Logged") + "`") : "Guest";
                    const type = pagesys ? "PageSystem" : (req.io ? "Socket.IO" : (req.xhr ? "XHR" : "Standard"));
                    if (err) {
                        if (this.logging)
                            req.logger.warn(req.method, req.ip || "`Unknown IP`", userName, "`" + (req.get("user-agent") || "User-Agent Not Set") + "`", req.get("content-length") || 0, type, err);
                        next(err);
                    }
                    else {
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
        }
        else
            next();
    }
    use(middleware) {
        this.stack.push(middleware);
    }
    nexusforkUpgrade(req, res) {
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
        this.nexusforkUpgrade(req, res);
        this.handle(req, res, next);
    }
    expressUpgrade(req, res) {
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
    __http(req, res, next) {
        this.expressUpgrade(req, res);
        this.__express(req, res, next);
    }
    close(cb) {
        this.server.close(cb);
    }
}
exports.NexusFramework = NexusFramework;
//# sourceMappingURL=nexusframework.js.map