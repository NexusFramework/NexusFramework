var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
/// <reference path="../index.d.ts" />
Object.defineProperties(window, {
    NexusFrameworkTransport: {
        configurable: true,
        set: function (instance) {
            Object.defineProperty(window, "NexusFrameworkTransport", {
                value: instance
            });
        },
        get: function () {
            var impl;
            if ("XMLHttpRequest" in window) {
                var NexusFrameworkXMLHttpRequestResponse_1 = /** @class */ (function () {
                    function NexusFrameworkXMLHttpRequestResponse(request, url) {
                        this._url = url;
                        this.request = request;
                    }
                    Object.defineProperty(NexusFrameworkXMLHttpRequestResponse.prototype, "url", {
                        get: function () {
                            return this.request.responseURL || this._url;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(NexusFrameworkXMLHttpRequestResponse.prototype, "code", {
                        get: function () {
                            return this.request.status;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(NexusFrameworkXMLHttpRequestResponse.prototype, "contentLength", {
                        get: function () {
                            return parseInt(this.request.getResponseHeader("content-length")) || this.request.responseText.length;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(NexusFrameworkXMLHttpRequestResponse.prototype, "contentFromJSON", {
                        get: function () {
                            if (!this.parsedJson)
                                this.parsedJson = JSON.parse(this.request.responseText);
                            return this.parsedJson;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(NexusFrameworkXMLHttpRequestResponse.prototype, "contentAsString", {
                        get: function () {
                            return this.request.responseText;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    Object.defineProperty(NexusFrameworkXMLHttpRequestResponse.prototype, "headers", {
                        get: function () {
                            if (!this.processedHeaders) {
                                var headers_1 = this.processedHeaders = {};
                                this.request.getAllResponseHeaders().split(/\r?\n/g).forEach(function (header) {
                                    var index = header.indexOf(":");
                                    var key, val;
                                    if (index > 0) {
                                        key = header.substring(0, index).trim().toLowerCase();
                                        val = header.substring(index + 1).trim();
                                    }
                                    else
                                        key = header.trim().toLowerCase();
                                    var list = headers_1[key];
                                    if (!list)
                                        list = headers_1[key] = [];
                                    if (val)
                                        list.push(val);
                                });
                            }
                            return this.processedHeaders;
                        },
                        enumerable: true,
                        configurable: true
                    });
                    return NexusFrameworkXMLHttpRequestResponse;
                }());
                var execute_1 = function (method, url, data, cb, extraHeaders, progcb) {
                    var request = new XMLHttpRequest();
                    request.open(method, url, true);
                    if (extraHeaders)
                        Object.keys(extraHeaders).forEach(function (key) {
                            request.setRequestHeader(key, extraHeaders[key]);
                        });
                    if (progcb)
                        request.onprogress = function (ev) {
                            if (ev.lengthComputable && ev.total)
                                progcb(ev.loaded, ev.total);
                        };
                    request.onreadystatechange = function (e) {
                        if (request.readyState === XMLHttpRequest.DONE) {
                            cb(new NexusFrameworkXMLHttpRequestResponse_1(request, url));
                        }
                    };
                    request.send(data);
                };
                impl = {
                    get: function (url, cb, extraHeaders, progcb) {
                        execute_1("GET", url, undefined, cb, extraHeaders, progcb);
                    },
                    head: function (url, cb, extraHeaders, progcb) {
                        execute_1("HEAD", url, undefined, cb, extraHeaders, progcb);
                    },
                    post: function (url, data, cb, extraHeaders, progcb) {
                        execute_1("POST", url, data, cb, extraHeaders, progcb);
                    },
                    put: function (url, data, cb, extraHeaders, progcb) {
                        execute_1("PUT", url, data, cb, extraHeaders, progcb);
                    },
                    execute: execute_1,
                    del: function (url, cb, extraHeaders, progcb) {
                        execute_1("DELETE", url, undefined, cb, extraHeaders, progcb);
                    }
                };
            }
            else {
                impl = {
                    get: function (url, cb, extraHeaders) {
                        cb({
                            url: url,
                            code: 503,
                            get contentFromJSON() {
                                throw new Error("No response to parse.");
                            },
                            contentAsString: "",
                            contentLength: 0,
                            headers: {}
                        });
                    },
                    head: function (url, cb, extraHeaders) {
                        cb({
                            url: url,
                            code: 503,
                            get contentFromJSON() {
                                throw new Error("No response to parse.");
                            },
                            contentAsString: "",
                            contentLength: 0,
                            headers: {}
                        });
                    },
                    put: function (url, data, cb, extraHeaders) {
                        cb({
                            url: url,
                            code: 503,
                            get contentFromJSON() {
                                throw new Error("No response to parse.");
                            },
                            contentAsString: "",
                            contentLength: 0,
                            headers: {}
                        });
                    },
                    post: function (url, data, cb, extraHeaders) {
                        cb({
                            url: url,
                            code: 503,
                            get contentFromJSON() {
                                throw new Error("No response to parse.");
                            },
                            contentAsString: "",
                            contentLength: 0,
                            headers: {}
                        });
                    },
                    execute: function (method, url, data, cb, extraHeaders) {
                        cb({
                            url: url,
                            code: 503,
                            get contentFromJSON() {
                                throw new Error("No response to parse.");
                            },
                            contentAsString: "",
                            contentLength: 0,
                            headers: {}
                        });
                    },
                    del: function (url, cb, extraHeaders) {
                        cb({
                            url: url,
                            code: 503,
                            get contentFromJSON() {
                                throw new Error("No response to parse.");
                            },
                            contentAsString: "",
                            contentLength: 0,
                            headers: {}
                        });
                    }
                };
            }
            Object.defineProperty(window, "NexusFrameworkTransport", {
                value: impl
            });
            return impl;
        }
    },
    NexusFrameworkImpl: {
        configurable: true,
        set: function (instance) {
            Object.defineProperty(window, "NexusFrameworkImpl", {
                value: instance
            });
        },
        get: function () {
            var loader = window.NexusFrameworkLoader;
            var showError = loader.showError;
            var debug = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
            }; //console.log.bind(console);
            var GA_ANALYTICS = {
                reportError: function (err, fatal) {
                    if (window.ga)
                        try {
                            window.ga('send', 'exception', {
                                'exDescription': (err.stack || "" + err).replace(/\n/g, "\n\t"),
                                'exFatal': fatal
                            });
                        }
                        catch (e) {
                            console.warn(e);
                        }
                },
                reportEvent: function (category, action, label, value) {
                    if (window.ga)
                        try {
                            window.ga('send', 'event', category, action, label, value);
                        }
                        catch (e) {
                            console.warn(e);
                        }
                },
                reportPage: function (path) {
                    if (window.ga)
                        try {
                            if (!path)
                                path = location.pathname;
                            window.ga('set', 'page', path);
                            window.ga('send', 'pageview');
                        }
                        catch (e) {
                            console.warn(e);
                        }
                }
            };
            var r = document.createElement("a");
            var protocol = location.href.match(/^\w+:/)[0];
            var resolveUrl = function (url) {
                r.setAttribute("href", url);
                var href = r.href;
                if (/^\/\//.test(href))
                    href = protocol + href;
                return href;
            };
            var convertResponse = function (res, url) {
                if (url === void 0) { url = location.href; }
                var storage;
                return (typeof res.data === "string" || res.data instanceof String) ? {
                    url: url,
                    code: res.code,
                    contentAsString: res.data,
                    get contentLength() {
                        return parseInt(res.headers['content-length'] && res.headers['content-length'][0]) || res.data.length;
                    },
                    get contentFromJSON() {
                        if (!storage)
                            storage = JSON.parse(res.data);
                        return storage;
                    },
                    headers: res.headers
                } : {
                    url: url,
                    code: res.code,
                    get contentAsString() {
                        if (!storage)
                            storage = JSON.stringify(res.data);
                        return storage;
                    },
                    contentFromJSON: res.data,
                    headers: res.headers,
                    get contentLength() {
                        var length = parseInt(res.headers['content-length'] && res.headers['content-length'][0]);
                        if (length)
                            return length;
                        if (!storage)
                            storage = JSON.stringify(res.data);
                        return storage.length;
                    }
                };
            };
            var loaderContainerRegex = /(^|\s)loader\-(progress|error)\-container(\s|$)/;
            var NexusFrameworkBase = /** @class */ (function () {
                function NexusFrameworkBase(url, io) {
                    if (url === void 0) { url = "/"; }
                    this.activerid = 0;
                    this.components = {};
                    this.currentUserID = undefined;
                    this.progressBar = document.getElementsByClassName("loader-progress-bar");
                    this.progressBarContainer = document.getElementsByClassName("loader-progress-container");
                    this.progressVisible = false;
                    this.animationTiming = 500;
                    this.requestPage = this.defaultRequestPage;
                    this._listeners = {};
                    url = resolveUrl(url);
                    if (!/\/$/.test(url))
                        url += "/";
                    Object.defineProperties(this, {
                        io: {
                            value: io
                        },
                        url: {
                            value: url
                        }
                    });
                    this._analytics = GA_ANALYTICS;
                }
                NexusFrameworkBase.prototype.resolveUrl = function (url) {
                    if (/^\w+\:/.test(url))
                        return url;
                    return resolveUrl(this.url + url);
                };
                NexusFrameworkBase.prototype.disableAll = function (root) {
                    if (root === void 0) { root = document.body; }
                    var focusable = root.querySelectorAll("a, input, select, textarea, iframe, button, *[focusable], *[tabindex]");
                    for (var i = 0; i < focusable.length; i++) {
                        var child = focusable[i];
                        var tabindex = child.getAttribute("tabindex");
                        if (tabindex == "-1")
                            return;
                        child.setAttribute("data-tabindex", tabindex ? tabindex : "");
                        child.setAttribute("data-tabindex", "-1");
                    }
                };
                NexusFrameworkBase.prototype.enableAll = function (root) {
                    if (root === void 0) { root = document.body; }
                    var focusable = root.querySelectorAll("*[data-tabindex]");
                    for (var i = 0; i < focusable.length; i++) {
                        var child = focusable[i];
                        child.setAttribute("tabindex", child.getAttribute("data-tabindex"));
                        child.removeAttribute("data-tabindex");
                    }
                };
                NexusFrameworkBase.prototype.fadeInProgress = function (cb) {
                    var _this = this;
                    if (this.progressVisible) {
                        if (cb)
                            cb();
                        return;
                    }
                    if (this.progressFadeCallbacks) {
                        if (cb)
                            this.progressFadeCallbacks.push(cb);
                        return;
                    }
                    var _loop_1 = function () {
                        try {
                            var progbar_1 = this_1.progressBar[i];
                            var origClassName_1 = progbar_1.className;
                            progbar_1.className += " noani";
                            progbar_1['style'].width = '0%';
                            setTimeout(function () {
                                progbar_1.className = origClassName_1;
                            });
                        }
                        catch (e) { }
                    };
                    var this_1 = this;
                    for (var i = 0; i < this.progressBar.length; i++) {
                        _loop_1();
                    }
                    if (this.progressBarContainer.length) {
                        var timer;
                        this.progressFadeCallbacks = [];
                        if (cb)
                            this.progressFadeCallbacks.push(cb);
                        var el = this.progressBarContainer[0];
                        var onAnimationEnd = function () {
                            try {
                                clearTimeout(timer);
                            }
                            catch (e) { }
                            _this.progressVisible = true;
                            var callbacks = _this.progressFadeCallbacks;
                            delete _this.progressFadeCallbacks;
                            callbacks.forEach(function (cb) {
                                cb();
                            });
                        };
                        timer = setTimeout(onAnimationEnd, this.animationTiming);
                        setTimeout(function () {
                            for (var i = 0; i < _this.progressBarContainer.length; i++) {
                                var container = _this.progressBarContainer[i];
                                if (!/(^|\s)loader\-progress\-visible(\s|$)/.test(container.className))
                                    container.className = (container.className + " loader-progress-visible").trim();
                            }
                        });
                    }
                    else {
                        this.progressVisible = true;
                        if (cb)
                            cb();
                    }
                };
                NexusFrameworkBase.prototype.fadeOutProgress = function (cb) {
                    var _this = this;
                    if (!this.progressVisible) {
                        if (cb)
                            cb();
                        return;
                    }
                    if (this.progressFadeCallbacks) {
                        if (cb)
                            this.progressFadeCallbacks.push(cb);
                        return;
                    }
                    for (var i = 0; i < this.progressBar.length; i++)
                        this.progressBar[i]['style'].width = '100%';
                    if (this.progressBarContainer.length) {
                        var timer;
                        this.progressFadeCallbacks = [];
                        if (cb)
                            this.progressFadeCallbacks.push(cb);
                        var el = this.progressBarContainer[0];
                        var onAnimationEnd = function () {
                            try {
                                clearTimeout(timer);
                            }
                            catch (e) { }
                            _this.progressVisible = false;
                            var callbacks = _this.progressFadeCallbacks;
                            delete _this.progressFadeCallbacks;
                            callbacks.forEach(function (cb) {
                                cb();
                            });
                        };
                        timer = setTimeout(onAnimationEnd, this.animationTiming);
                        for (var i = 0; i < this.progressBarContainer.length; i++) {
                            var container = this.progressBarContainer[i];
                            container.className = container.className.replace(/(^|\s)loader\-progress\-visible(\s|$)/g, function (match) {
                                return /^\s.+\s$/.test(match) ? " " : "";
                            });
                        }
                    }
                    else {
                        this.progressVisible = false;
                        if (cb)
                            cb();
                    }
                };
                Object.defineProperty(NexusFrameworkBase.prototype, "analytics", {
                    get: function () {
                        return this._analytics;
                    },
                    set: function (value) {
                        this._analytics = value ? value : GA_ANALYTICS;
                    },
                    enumerable: true,
                    configurable: true
                });
                NexusFrameworkBase.prototype.reportError = function (err, fatal) {
                    console[fatal ? "error" : "warn"](err.stack);
                    if (this.errorreporter)
                        this.errorreporter(err, fatal);
                };
                NexusFrameworkBase.prototype.installErrorReporter = function (errorreporter) {
                    this.errorreporter = errorreporter;
                };
                NexusFrameworkBase.prototype.registerComponent = function (selector, impl) {
                    var _this = this;
                    if (impl) {
                        this.components[selector] = impl;
                        this.createComponents(document.head);
                        this.createComponents(document.body);
                    }
                    else {
                        delete this.components[selector];
                        var destroy = function (root) {
                            var elements = root.querySelectorAll(selector);
                            if (!elements.length)
                                return;
                            for (var i = 0; i < elements.length; i++) {
                                var element = elements[i];
                                var components = element['__nf_cmapping__'];
                                if (!components)
                                    components = element['__nf_cmapping__'] = {};
                                var component = components[selector];
                                if (component) {
                                    try {
                                        component.destroy();
                                    }
                                    catch (e) {
                                        _this.reportError(e);
                                    }
                                }
                            }
                        };
                        destroy(document.head);
                        destroy(document.body);
                    }
                };
                NexusFrameworkBase.prototype.unregisterComponent = function (selector, impl) {
                };
                NexusFrameworkBase.prototype.createComponents = function (root) {
                    var _this = this;
                    Object.keys(this.components).forEach(function (selector) {
                        var elements = root.querySelectorAll(selector);
                        if (!elements.length)
                            return;
                        for (var i = 0; i < elements.length; i++) {
                            var element = elements[i];
                            var components = element['__nf_cmapping__'];
                            if (!components)
                                components = element['__nf_cmapping__'] = {};
                            if (components[selector])
                                continue;
                            var componentFactory = _this.components[selector];
                            try {
                                (components[selector] = new componentFactory()).create(element);
                            }
                            catch (e) {
                                _this.reportError(e);
                            }
                        }
                    });
                };
                NexusFrameworkBase.prototype.destroyComponents = function (root) {
                    var _this = this;
                    Object.keys(this.components).forEach(function (selector) {
                        var elements = root.querySelectorAll(selector);
                        if (!elements.length)
                            return;
                        for (var i = 0; i < elements.length; i++) {
                            var element = elements[i];
                            var components = element['__nf_cmapping__'];
                            if (!components)
                                components = element['__nf_cmapping__'] = {};
                            var component = components[selector];
                            if (component) {
                                try {
                                    component.destroy();
                                }
                                catch (e) {
                                    _this.reportError(e);
                                }
                            }
                        }
                    });
                };
                NexusFrameworkBase.prototype.restoreComponents = function (root, state) {
                    var _this = this;
                    Object.keys(this.components).forEach(function (selector) {
                        var states = state[selector];
                        if (!states)
                            return;
                        var elements = root.querySelectorAll(selector);
                        if (!elements.length)
                            return;
                        for (var i = 0; i < elements.length; i++) {
                            var element = elements[i];
                            if (states.length) {
                                var _state = states.shift();
                                if (_state) {
                                    var components = element['__nf_cmapping__'];
                                    if (!components)
                                        components = element['__nf_cmapping__'] = {};
                                    var component = components[selector];
                                    if (!component) {
                                        var componentFactory = _this.components[selector];
                                        try {
                                            (component = components[selector] = new componentFactory()).create(element);
                                        }
                                        catch (e) {
                                            _this.reportError(e);
                                            console.warn(e);
                                            continue;
                                        }
                                    }
                                    try {
                                        component.restore(_state);
                                    }
                                    catch (e) {
                                        _this.reportError(e);
                                        console.warn(e);
                                    }
                                }
                            }
                            else
                                break;
                        }
                    });
                };
                NexusFrameworkBase.prototype.saveComponents = function (root) {
                    var _this = this;
                    var state = {};
                    Object.keys(this.components).forEach(function (selector) {
                        var states = state[selector] = [];
                        var elements = root.querySelectorAll(selector);
                        if (!elements.length)
                            return;
                        for (var i = 0; i < elements.length; i++) {
                            var element = elements[i];
                            var components = element['__nf_cmapping__'];
                            if (!components)
                                components = element['__nf_cmapping__'] = {};
                            var component = components[selector];
                            if (!component) {
                                var componentFactory = _this.components[selector];
                                try {
                                    (component = components[selector] = new componentFactory()).create(element);
                                }
                                catch (e) {
                                    states.push(undefined);
                                    _this.reportError(e);
                                    console.warn(e);
                                    continue;
                                }
                            }
                            try {
                                states.push(component.save());
                            }
                            catch (e) {
                                states.push(undefined);
                                _this.reportError(e);
                                console.warn(e);
                            }
                        }
                    });
                    return state;
                };
                NexusFrameworkBase.prototype.initPageSystem = function (opts) {
                    var _this = this;
                    if (!loader)
                        return console.error("The NexusFramework Loader is required for the dynamic Page System to work correctly.");
                    if (!history.pushState || !history.replaceState)
                        return console.warn("This browser is missing an essential feature required for the dynamic Page System.");
                    opts = opts || {};
                    var self = this;
                    var pageStatesSize = 0;
                    var pageStates = [];
                    this.animationTiming = opts.animationTiming || 500;
                    var pageStateCacheSize = opts.pageHistoryCacheSize || 25000000;
                    var wrapCB = function (cb) {
                        return function (res) {
                            var user = res.headers['x-logged-user'];
                            if (user)
                                _this.currentUserID = user[0];
                            else
                                _this.currentUserID = undefined;
                            debug("Current UID", _this.currentUserID);
                            cb(res);
                            if (res.code === 200)
                                setTimeout(function () {
                                    _this._analytics.reportPage();
                                });
                        };
                    };
                    loader.showError = function (error) {
                        var match = location.href.match(beforeHash);
                        var baseurl = match && match[1] || location.href;
                        var length = error.stack.length;
                        var tooBig = pageStateCacheSize <= length;
                        try {
                            var cPageStates = pageStates.length;
                            for (var i = 0; i < cPageStates; i++) {
                                var state = pageStates[i];
                                if (state.url === baseurl) {
                                    if (tooBig) {
                                        pageStates.splice(i, 1);
                                        pageStatesSize -= state.size;
                                    }
                                    else {
                                        state.data = { error: error };
                                        state.updated = +new Date;
                                        pageStatesSize += length - state.size;
                                    }
                                    throw true;
                                }
                            }
                            if (tooBig)
                                throw true;
                            pageStates.push({
                                url: baseurl,
                                data: { error: error },
                                updated: +new Date,
                                size: length
                            });
                            pageStatesSize += length;
                        }
                        catch (e) {
                            if (e !== true)
                                throw e;
                        }
                        showError(error);
                    };
                    var transportPageSystem = {
                        requestPage: function (path, cb, post, rid) {
                            if (self.pagesysprerequest && !self.pagesysprerequest(path)) {
                                self.defaultRequestPage(path, post);
                                return;
                            }
                            if (!opts.noprogress) {
                                self.disableAll();
                                self.fadeInProgress();
                            }
                            var url = self.resolveUrl(":pagesys/" + path);
                            var _cb = opts.noprogress ? cb : function (res) {
                                self.fadeInProgress(function () {
                                    cb(res);
                                    self.enableAll();
                                });
                            };
                            if (post)
                                window.NexusFrameworkTransport.post(url, post, wrapCB(_cb));
                            else
                                window.NexusFrameworkTransport.get(url, wrapCB(_cb));
                        }
                    };
                    if (!opts.noio && !opts.nopagesysio && this.io) {
                        var io_1 = this.io;
                        this.pagesysimpl = {
                            requestPage: function (path, cb, post, rid) {
                                if (io_1.connected) {
                                    if (self.pagesysprerequest && !self.pagesysprerequest(path)) {
                                        self.defaultRequestPage(path, post);
                                        return;
                                    }
                                    if (!opts.noprogress) {
                                        self.disableAll();
                                        self.fadeInProgress();
                                    }
                                    var headers = {
                                        "referrer": location.href
                                    };
                                    var val = document.cookie;
                                    if (val)
                                        headers['cookie'] = val;
                                    io_1.emit("page", post ? "POST" : "GET", path, post, headers, function (res) {
                                        if (rid != self.activerid)
                                            return;
                                        var cookies = res.headers['set-cookie'];
                                        if (cookies) {
                                            cookies.forEach(function (cookie) {
                                                document.cookie = cookie;
                                            });
                                        }
                                        var _cb = opts.noprogress ? cb : function (res) {
                                            self.fadeInProgress(function () {
                                                cb(res);
                                                self.enableAll();
                                            });
                                        };
                                        wrapCB(_cb)(convertResponse(res, self.resolveUrl(path)));
                                    });
                                }
                                else
                                    transportPageSystem.requestPage(path, cb, post, rid);
                            }
                        };
                    }
                    else
                        this.pagesysimpl = transportPageSystem;
                    var base = document.getElementsByTagName("base");
                    base = base && base[0];
                    this.pagesysprerequest = opts.prerequest;
                    this.pagesyshandler = opts.handler || (function (res) {
                        try {
                            var contentType = res.headers['content-type'][0];
                            if (!/\/html(;.+)?$/.test(contentType.toLowerCase())) {
                                throw new Error("Content type is not html");
                            }
                        }
                        catch (e) { }
                        var content = res.contentAsString;
                        var bodyindex = content.indexOf("<body");
                        if (bodyindex == -1)
                            throw new Error("Could not find start of body tag");
                        var endbodyindex = content.indexOf("</body>") || content.indexOf("</ body>");
                        if (endbodyindex == -1)
                            throw new Error("Could not find end of body tag");
                        var title = content.match(/<title>([^<]+)<\/\s*title>/);
                        document.title = title && title[1] || "Title Not Set";
                        var mockhtml = document.createElement("html");
                        mockhtml.innerHTML = content.substring(bodyindex, endbodyindex) + "</body>";
                        var loaderScript;
                        var childs = mockhtml.children;
                        var toAdd = [];
                        for (var i = 0; i < childs.length; i++) {
                            var child = childs[i];
                            switch (child.nodeName.toUpperCase()) {
                                case "HEAD":
                                    break;
                                case "BODY":
                                    i = -1;
                                    childs = child.children;
                                    break;
                                case "SCRIPT":
                                    var match = child.innerHTML.match(/^NexusFrameworkLoader\.load\((.+)\);?$/);
                                    if (match)
                                        loaderScript = JSON.parse(match[1]);
                                    break;
                                default:
                                    if (loaderContainerRegex.test(child.className))
                                        break;
                                    toAdd.push(child);
                            }
                        }
                        if (!toAdd.length)
                            throw new Error("Nothing found in response to add to page");
                        if (!loaderScript)
                            throw new Error("NexusFrameworkLoader script not found...");
                        childs = document.body.children;
                        for (var i = childs.length - 1; i >= 0; i--) {
                            var child = childs[i];
                            switch (child.nodeName.toUpperCase()) {
                                case "LINK":
                                case "SCRIPT":
                                    break;
                                default:
                                    if (loaderContainerRegex.test(child.className))
                                        break;
                                    document.body.removeChild(child);
                            }
                        }
                        var fragment = document.createDocumentFragment();
                        toAdd.forEach(function (el) {
                            fragment.appendChild(el);
                            _this.createComponents(el);
                        });
                        document.body.appendChild(fragment);
                        loader.load(loaderScript, function () {
                            self.progressVisible = true;
                            self.fadeOutProgress();
                        });
                        return true;
                    });
                    var forwardPopState;
                    var beforeHash = /^([^#]+)(#.*)?$/;
                    var chash = location.href.match(beforeHash);
                    var startsWith = new RegExp("^" + this.url.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + "(.*)$", "i");
                    var AnchorElementComponent = /** @class */ (function () {
                        function AnchorElementComponent() {
                            var _this = this;
                            this.handler = function (e) {
                                if (_this.element.hasAttribute("data-nopagesys") || _this.element.hasAttribute("data-nodynamic"))
                                    return;
                                var href = _this.element.getAttribute("href");
                                if (!href || !href.length)
                                    return;
                                var url = _this.element.href;
                                var bhash = url.match(beforeHash);
                                if (bhash && chash && bhash[2] && chash[1] === bhash[1])
                                    return;
                                chash = bhash;
                                if (startsWith.test(url))
                                    try {
                                        var match = url.match(/^(.+)#.*$/);
                                        if (match)
                                            url = match[1];
                                        self.requestPage(url.substring(self.url.length));
                                        try {
                                            e.stopPropagation();
                                        }
                                        catch (e) { }
                                        try {
                                            e.preventDefault();
                                        }
                                        catch (e) { }
                                    }
                                    catch (e) {
                                        console.warn(e);
                                    }
                                else
                                    debug("Navigating", url);
                            };
                        }
                        AnchorElementComponent.prototype.create = function (element) {
                            element.addEventListener("click", this.handler);
                            this.element = element;
                        };
                        AnchorElementComponent.prototype.destroy = function () {
                            this.element.removeEventListener("click", this.handler);
                        };
                        AnchorElementComponent.prototype.restore = function (data) { };
                        AnchorElementComponent.prototype.save = function () { };
                        return AnchorElementComponent;
                    }());
                    this.requestPage = function (path, post, replace) {
                        if (replace === void 0) { replace = false; }
                        var match = path.match(/\.([^\/]+)([\?#].*)?$/);
                        if (match && match[0] !== "htm" && match[0] !== "html") {
                            _this.defaultRequestPage(path, post);
                            debug("Ignoring navigation", path, match);
                        }
                        else {
                            var rid_1 = ++_this.activerid;
                            var baseurl_1 = _this.resolveUrl(path);
                            var fullurl_1 = baseurl_1 + (match && match[2] || "");
                            if (replace)
                                history.replaceState(undefined, "Loading...", fullurl_1);
                            else {
                                history.replaceState(undefined, document.title, location.href);
                                history.pushState(undefined, "Loading...", fullurl_1);
                                window.scrollTo(0, 0);
                            }
                            loader.resetError();
                            chash = fullurl_1.match(beforeHash);
                            _this.pagesysimpl.requestPage(path, function (res) {
                                try {
                                    if (rid_1 != _this.activerid)
                                        return;
                                    var location_1 = res.headers['x-location'] || res.headers['location'];
                                    if (location_1) {
                                        var url = resolveUrl(location_1[0]);
                                        if (startsWith.test(url)) {
                                            _this.requestPage(url.substring(_this.url.length), undefined, true);
                                            return;
                                        }
                                        console.warn("Requested redirect to external url:", url);
                                        window.location.href = url;
                                        return;
                                    }
                                    var contentDisposition = res.headers['content-disposition'];
                                    if (contentDisposition && contentDisposition[0].toLowerCase() == "attachment")
                                        throw new Error("Attachment disposition");
                                    if (!_this.pagesyshandler(res))
                                        throw new Error("Could not handle response");
                                    var contentType = res.headers['content-type'];
                                    debug("history.replaceState", document.title);
                                    var length_1 = res.contentLength;
                                    var tooBig = pageStateCacheSize <= length_1;
                                    var stateData = tooBig ? undefined : {
                                        title: document.title,
                                        user: _this.currentUserID,
                                        scroll: [window.scrollX, window.scrollY],
                                        body: _this.saveComponents(document.body),
                                        basehref: base ? base['href'] : undefined,
                                        response: res
                                    };
                                    var i;
                                    var cPageStates = pageStates.length;
                                    try {
                                        for (i = 0; i < cPageStates; i++) {
                                            var state = pageStates[i];
                                            if (state.url === baseurl_1) {
                                                if (tooBig) {
                                                    pageStates.splice(i, 1);
                                                    pageStatesSize -= state.size;
                                                }
                                                else {
                                                    state.data = stateData;
                                                    state.updated = +new Date;
                                                    pageStatesSize += length_1 - state.size;
                                                }
                                                throw true;
                                            }
                                        }
                                        if (!tooBig) {
                                            pageStates.push({
                                                url: baseurl_1,
                                                data: stateData,
                                                updated: +new Date,
                                                size: length_1
                                            });
                                            pageStatesSize += length_1;
                                            throw true;
                                        }
                                        else
                                            debug("Response too big to store", baseurl_1, length_1);
                                    }
                                    catch (e) {
                                        if (e === true) {
                                            var over = pageStatesSize - pageStateCacheSize;
                                            if (over > 0) {
                                                pageStates.sort(function (a, b) {
                                                    return a.updated - b.updated;
                                                });
                                                var found = 0;
                                                for (i = 0; i < cPageStates; i++) {
                                                    found += pageStates[i].size;
                                                    if (found >= over)
                                                        break;
                                                }
                                                i++;
                                                pageStates.splice(0, i);
                                                debug("Trimmed", i, "items...");
                                            }
                                        }
                                        else
                                            throw e;
                                    }
                                    history.replaceState(undefined, document.title, fullurl_1);
                                    _this.emit("page", baseurl_1, path);
                                }
                                catch (e) {
                                    debug(e);
                                    forwardPopState = [path, post];
                                    try {
                                        history.go(-1);
                                    }
                                    catch (e) { }
                                }
                            }, post, rid_1);
                        }
                    };
                    this.registerComponent("a", AnchorElementComponent);
                    window.addEventListener('popstate', function (e) {
                        var state;
                        var bhash = location.href.match(beforeHash);
                        var baseurl = bhash[1] || location.href;
                        var cStates = pageStates.length;
                        for (var i = 0; i < cStates; i++) {
                            var _state = pageStates[i];
                            if (_state.url === baseurl) {
                                state = _state;
                                break;
                            }
                        }
                        var hasState = !!state;
                        if (chash && chash[1] === bhash[1]) {
                            debug("Only hash has changed...");
                            return;
                        }
                        chash = bhash;
                        self.activerid++;
                        var error = hasState && state.data.error;
                        if (error) {
                            showError(error);
                            return;
                        }
                        if (forwardPopState) {
                            debug("forwardPopState", forwardPopState);
                            var forward_1 = forwardPopState;
                            setTimeout(function () {
                                _this.defaultRequestPage(forward_1[0], forward_1[1]);
                            });
                            forwardPopState = undefined;
                            return;
                        }
                        try {
                            if (!hasState)
                                throw new Error("No state for: " + baseurl + ", reloading...");
                            if (state.data.user != _this.currentUserID)
                                throw new Error("User has changed since state was created, reloading...");
                            document.title = state.data.title;
                            _this.pagesyshandler(state.data.response);
                            if (state.data.body)
                                _this.restoreComponents(document.body, state.data.body);
                            if (state.data.scroll)
                                window.scrollTo.apply(window, state.data.scroll);
                            debug("Used stored page state!", state);
                            loader.resetError();
                        }
                        catch (err) {
                            debug(err);
                            var url = location.href;
                            if (startsWith.test(url)) {
                                try {
                                    if (/reloading\.\.\.$/.test(err.message)) {
                                        _this.requestPage(url.substring(self.url.length), undefined, true);
                                        return;
                                    }
                                    console.error("Unknown error occured, actually navigating to page...");
                                }
                                catch (e) {
                                    console.error(e);
                                }
                            }
                            location.reload(true);
                        }
                    });
                    return true;
                };
                NexusFrameworkBase.prototype.defaultRequestPage = function (path, post) {
                    if (post)
                        throw new Error("Posting is not supported without an initialized page system, yet");
                    else
                        location.href = this.resolveUrl(path);
                };
                NexusFrameworkBase.prototype.on = function (event, cb) {
                    var listeners = this._listeners[event];
                    if (listeners)
                        listeners.push(cb);
                    else
                        this._listeners[event] = listeners = [cb];
                };
                NexusFrameworkBase.prototype.off = function (event, cb) {
                    var index;
                    var listeners = this._listeners[event];
                    if (listeners && (index = listeners.indexOf(cb)) > -1)
                        listeners.splice(index, 1);
                };
                NexusFrameworkBase.prototype.emit = function (event) {
                    var args = [];
                    for (var _i = 1; _i < arguments.length; _i++) {
                        args[_i - 1] = arguments[_i];
                    }
                    var self = this;
                    var listeners = this._listeners[event];
                    if (listeners)
                        listeners.forEach(function (cb) {
                            cb.apply(self, args);
                        });
                };
                return NexusFrameworkBase;
            }());
            var impl;
            if (window.io)
                impl = /** @class */ (function (_super) {
                    __extends(NexusFrameworkWithIO, _super);
                    function NexusFrameworkWithIO(url) {
                        var _this = _super.call(this, url, window.io({
                            path: "/:io"
                        })) || this;
                        var io = _this.io;
                        io.on("connect", function () {
                            io.emit("init", loader.requestedResources());
                        });
                        return _this;
                    }
                    return NexusFrameworkWithIO;
                }(NexusFrameworkBase));
            else
                impl = /** @class */ (function (_super) {
                    __extends(NexusFrameworkNoIO, _super);
                    function NexusFrameworkNoIO(url) {
                        return _super.call(this, url) || this;
                    }
                    return NexusFrameworkNoIO;
                }(NexusFrameworkBase));
            Object.defineProperty(window, "NexusFrameworkImpl", {
                value: impl
            });
            return impl;
        }
    },
    NexusFrameworkClient: {
        configurable: true,
        set: function (instance) {
            Object.defineProperty(window, "NexusFrameworkClient", {
                value: instance
            });
        },
        get: function () {
            var instance = new window.NexusFrameworkImpl();
            Object.defineProperty(window, "NexusFrameworkClient", {
                value: instance
            });
            return instance;
        }
    }
});
//# sourceMappingURL=nexusframeworkclient.js.map