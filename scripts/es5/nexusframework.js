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
                var NexusFrameworkXMLHttpRequestResponse_1 = (function () {
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
            var addAnimationEnd = function (el, handler) {
                el.addEventListener("transitionend", handler);
                el.addEventListener("transitionEnd", handler);
                el.addEventListener("webkitTransitionEnd", handler);
                el.addEventListener("mozTransitionEnd", handler);
                el.addEventListener("oTransitionEnd", handler);
            };
            var removeAnimationEnd = function (el, handler) {
                el.removeEventListener("transitionend", handler);
                el.removeEventListener("transitionEnd", handler);
                el.removeEventListener("webkitTransitionEnd", handler);
                el.removeEventListener("mozTransitionEnd", handler);
                el.removeEventListener("oTransitionEnd", handler);
            };
            var convertResponse = function (res, url) {
                if (url === void 0) { url = location.href; }
                var storage;
                return (typeof res.data === "string" || res.data instanceof String) ? {
                    url: url,
                    code: res.code,
                    contentAsString: res.data,
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
                    headers: res.headers
                };
            };
            var loaderContainerRegex = /(^|\s)loader\-(progress|error)\-container(\s|$)/;
            var NexusFrameworkBase = (function () {
                function NexusFrameworkBase(url, io) {
                    if (url === void 0) { url = "/"; }
                    this.activerid = 0;
                    this.components = {};
                    this.currentUserID = undefined;
                    this.progressBar = document.getElementsByClassName("loader-progress-bar");
                    this.progressBarContainer = document.getElementsByClassName("loader-progress-container");
                    this.progressVisible = false;
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
                    for (var i = 0; i < this.progressBar.length; i++)
                        this.progressBar[i]['style'].width = '0%';
                    if (this.progressBarContainer.length) {
                        var timer;
                        this.progressFadeCallbacks = [];
                        if (cb)
                            this.progressFadeCallbacks.push(cb);
                        var el_1 = this.progressBarContainer[0];
                        var onAnimationEnd_1 = function () {
                            try {
                                clearTimeout(timer);
                            }
                            catch (e) { }
                            removeAnimationEnd(el_1, onAnimationEnd_1);
                            _this.progressVisible = true;
                            var callbacks = _this.progressFadeCallbacks;
                            delete _this.progressFadeCallbacks;
                            callbacks.forEach(function (cb) {
                                cb();
                            });
                        };
                        addAnimationEnd(el_1, onAnimationEnd_1);
                        timer = setTimeout(onAnimationEnd_1, 500);
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
                        var el_2 = this.progressBarContainer[0];
                        var onAnimationEnd_2 = function () {
                            try {
                                clearTimeout(timer);
                            }
                            catch (e) { }
                            removeAnimationEnd(el_2, onAnimationEnd_2);
                            _this.progressVisible = false;
                            var callbacks = _this.progressFadeCallbacks;
                            delete _this.progressFadeCallbacks;
                            callbacks.forEach(function (cb) {
                                cb();
                            });
                        };
                        addAnimationEnd(el_2, onAnimationEnd_2);
                        timer = setTimeout(onAnimationEnd_2, 500);
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
                    if (!window.NexusFrameworkLoader)
                        return console.warn("The NexusFramework Loader is required for the dynamic Page System to work correctly.");
                    if (!history.pushState || !history.replaceState)
                        return console.warn("This browser is missing an essential feature required for the dynamic Page System.");
                    opts = opts || {};
                    var self = this;
                    var currentResponse;
                    var wrapCB = function (cb) {
                        return function (res) {
                            var user = res.headers['x-user'];
                            if (user)
                                _this.currentUserID = user[0];
                            else
                                _this.currentUserID = undefined;
                            cb(res);
                            if (res.code === 200)
                                setTimeout(function () {
                                    _this._analytics.reportPage();
                                });
                        };
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
                        toAdd.forEach(function (el) {
                            document.body.appendChild(el);
                        });
                        window.NexusFrameworkLoader.load(loaderScript, _this.fadeOutProgress.bind(_this));
                        return true;
                    });
                    var forwardPopState;
                    var hashOrNothing = /^(#.*)?$/;
                    var startsWith = new RegExp("^" + this.url.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + "(.*)$", "i");
                    var AnchorElementComponent = (function () {
                        function AnchorElementComponent() {
                            var _this = this;
                            this.handler = function (e) {
                                if (_this.element.hasAttribute("data-nopagesys") || _this.element.hasAttribute("data-nodynamic"))
                                    return;
                                var url = _this.element.getAttribute("href");
                                if (hashOrNothing.test(url))
                                    return;
                                url = _this.element.href;
                                if (startsWith.test(url)) {
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
                                }
                                else
                                    console.log("Navigating", url);
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
                    var genState = function (withPageState) {
                        if (withPageState) {
                            return {
                                title: document.title,
                                user: _this.currentUserID,
                                scroll: [window.scrollX, window.scrollY],
                                body: _this.saveComponents(document.body),
                                basehref: base ? base['href'] : undefined,
                                page: withPageState
                            };
                        }
                        return undefined;
                    };
                    this.requestPage = function (path, post, replace) {
                        if (replace === void 0) { replace = false; }
                        if (/\..+$/.test(path))
                            _this.defaultRequestPage(path, post);
                        else {
                            var rid_1 = ++_this.activerid;
                            var url_1 = _this.resolveUrl(path);
                            if (replace)
                                history.replaceState(genState(currentResponse), "Loading...", url_1);
                            else {
                                history.replaceState(genState(currentResponse), document.title, location.href);
                                history.pushState(genState(), "Loading...", url_1);
                                currentResponse = undefined;
                                window.scrollTo(0, 0);
                            }
                            _this.pagesysimpl.requestPage(path, function (res) {
                                try {
                                    if (rid_1 != _this.activerid)
                                        return;
                                    var location_1 = res.headers['location'];
                                    if (location_1) {
                                        var url_2 = resolveUrl(location_1[0]);
                                        if (startsWith.test(url_2)) {
                                            _this.requestPage(url_2.substring(_this.url.length), undefined, true);
                                            return;
                                        }
                                        console.warn("Requested redirect to url outside of website:", url_2);
                                        window.location.href = url_2;
                                        return;
                                    }
                                    var contentDisposition = res.headers['content-disposition'];
                                    if (contentDisposition && contentDisposition[0].toLowerCase() == "attachment")
                                        throw new Error("Attachment disposition");
                                    if (!_this.pagesyshandler(res))
                                        throw new Error("Could not handle response");
                                    var contentType = res.headers['content-type'];
                                    history.replaceState(genState(currentResponse = {
                                        code: res.code,
                                        headers: res.headers,
                                        data: (contentType && /\/json(;.+)?$/.test(contentType[0])) ? res.contentFromJSON : res.contentAsString
                                    }), document.title, url_1);
                                    _this.emit("page", path);
                                }
                                catch (e) {
                                    console.warn(e);
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
                        if (forwardPopState) {
                            var forward_1 = forwardPopState;
                            setTimeout(function () {
                                _this.defaultRequestPage(forward_1[0], forward_1[1]);
                            });
                            forwardPopState = undefined;
                            return;
                        }
                        try {
                            if (!e.state)
                                throw new Error("No state, reloading...");
                            if (e.state.user != _this.currentUserID)
                                throw new Error("User has changed since state was created, reloading...");
                            var page = e.state.page;
                            if (!page)
                                throw new Error("Page was never loaded or page data is corrupt, reloading...");
                            document.title = e.state.title;
                            _this.pagesyshandler(convertResponse(page));
                            _this.restoreComponents(document.body, e.state.body);
                            window.scrollTo.apply(window, e.state.scroll);
                        }
                        catch (err) {
                            console.warn(err);
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
                impl = (function (_super) {
                    __extends(NexusFrameworkWithIO, _super);
                    function NexusFrameworkWithIO(url) {
                        var _this = _super.call(this, url, window.io({
                            path: "/:io"
                        })) || this;
                        var io = _this.io;
                        io.on("connect", function () {
                            io.emit("init", window.NexusFrameworkLoader.requestedResources());
                        });
                        return _this;
                    }
                    return NexusFrameworkWithIO;
                }(NexusFrameworkBase));
            else
                impl = (function (_super) {
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
    NexusFramework: {
        configurable: true,
        set: function (instance) {
            Object.defineProperty(window, "NexusFramework", {
                value: instance
            });
        },
        get: function () {
            var instance = new window.NexusFrameworkImpl();
            Object.defineProperty(window, "NexusFramework", {
                value: instance
            });
            return instance;
        }
    }
});
//# sourceMappingURL=nexusframework.js.map