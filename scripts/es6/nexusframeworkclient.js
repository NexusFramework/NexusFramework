/// <reference path="../index.d.ts" />
(function (window) {
    const BSON = new window['bson'];
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
                    class NexusFrameworkXMLHttpRequestResponse {
                        constructor(request, url, hadData, abResponse) {
                            this._url = url;
                            this.request = request;
                            this.hadData = hadData;
                            this.abResponse = abResponse;
                        }
                        get url() {
                            return this.request.responseURL || this._url;
                        }
                        get code() {
                            return this.request.status;
                        }
                        get contentLength() {
                            return parseInt(this.request.getResponseHeader("content-length")) || this.request.responseText.length;
                        }
                        get contentFromJSON() {
                            if (!this.parsedJson)
                                this.parsedJson = JSON.parse(this.request.responseText);
                            return this.parsedJson;
                        }
                        get contentFromBSON() {
                            if (!this.parsedBson) {
                                var response = this.request.response;
                                if (typeof response === "string")
                                    response = Buffer.from(response, "utf8");
                                else
                                    response = new Buffer(response);
                                this.parsedBson = BSON.deserialize(response, { promoteValues: true });
                            }
                            return this.parsedBson;
                        }
                        get contentAsString() {
                            return this.request.responseText;
                        }
                        get contentAsArrayBuffer() {
                            return this.request.response;
                        }
                        get headers() {
                            if (!this.processedHeaders) {
                                const headers = this.processedHeaders = {};
                                this.request.getAllResponseHeaders().split(/\r?\n/g).forEach(function (header) {
                                    const index = header.indexOf(":");
                                    var key, val;
                                    if (index > 0) {
                                        key = header.substring(0, index).trim().toLowerCase();
                                        val = header.substring(index + 1).trim();
                                    }
                                    else
                                        key = header.trim().toLowerCase();
                                    var list = headers[key];
                                    if (!list)
                                        list = headers[key] = [];
                                    if (val)
                                        list.push(val);
                                });
                            }
                            return this.processedHeaders;
                        }
                    }
                    const execute = function (method, url, data, cb, extraHeaders, progcb, wantsBinary) {
                        const request = new XMLHttpRequest();
                        var responseIsArrayBuffer;
                        try {
                            if (!wantsBinary)
                                throw false;
                            request.responseType = "arraybuffer";
                            if (request.responseType !== "arraybuffer") {
                                console.error("Could not request arraybuffer");
                                throw false;
                            }
                            responseIsArrayBuffer = true;
                        }
                        catch (e) {
                            responseIsArrayBuffer = false;
                        }
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
                            if (request.readyState === XMLHttpRequest.DONE)
                                cb(new NexusFrameworkXMLHttpRequestResponse(request, url, !!data, responseIsArrayBuffer));
                        };
                        const type = data && data.type;
                        if (type)
                            switch (type) {
                                case "":
                                case "text/urlencoded":
                                    var dat = "";
                                    for (var entry of data.data) {
                                        if (dat)
                                            dat += "&";
                                        dat += encodeURIComponent(entry[0]);
                                        dat += "=";
                                        dat += encodeURIComponent(entry[1]);
                                    }
                                    request.setRequestHeader("Content-Type", "text/urlencoded");
                                    request.send(dat);
                                    break;
                                case "text/json":
                                    request.setRequestHeader("Content-Type", "text/json");
                                    request.send(JSON.stringify(data.data));
                                    break;
                                case "application/bson":
                                    request.setRequestHeader("Content-Type", "application/bson");
                                    request.send(BSON.serialize(data.data));
                                    break;
                                case "multipart/form-data":
                                    request.send(data.data);
                                    break;
                                default:
                                    request.send(data);
                            }
                        else
                            request.send(data);
                    };
                    impl = {
                        get: function (url, cb, extraHeaders, progcb, wantsBinary) {
                            execute("GET", url, undefined, cb, extraHeaders, progcb, wantsBinary);
                        },
                        head: function (url, cb, extraHeaders, progcb, wantsBinary) {
                            execute("HEAD", url, undefined, cb, extraHeaders, progcb, wantsBinary);
                        },
                        post: function (url, data, cb, extraHeaders, progcb, wantsBinary) {
                            execute("POST", url, data, cb, extraHeaders, progcb, wantsBinary);
                        },
                        put: function (url, data, cb, extraHeaders, progcb, wantsBinary) {
                            execute("PUT", url, data, cb, extraHeaders, progcb, wantsBinary);
                        },
                        execute,
                        del: function (url, cb, extraHeaders, progcb, wantsBinary) {
                            execute("DELETE", url, undefined, cb, extraHeaders, progcb, wantsBinary);
                        }
                    };
                }
                else
                    throw new Error("No transport implementations");
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
                const loader = window.NexusFrameworkLoader;
                const showError = loader.showError;
                const debug = /*function(...args: any[]){};*/ console.log.bind(console);
                const GA_ANALYTICS = {
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
                const r = document.createElement("a");
                const protocol = location.href.match(/^\w+:/)[0];
                const resolveUrl = function (url) {
                    r.setAttribute("href", url);
                    var href = r.href;
                    if (/^\/\//.test(href))
                        href = protocol + href;
                    return href;
                };
                const convertResponse = function (res, url = location.href) {
                    var storage;
                    return (typeof res.data === "string") ? {
                        url,
                        code: res.code,
                        contentAsString: res.data,
                        get contentLength() {
                            return parseInt(res.headers['content-length'] && res.headers['content-length'][0]) || res.data.length;
                        },
                        get contentAsArrayBuffer() {
                            throw new Error("Not implemented");
                        },
                        get contentFromBSON() {
                            if (!storage)
                                storage = JSON.parse(res.data);
                            return storage;
                        },
                        get contentFromJSON() {
                            if (!storage)
                                storage = JSON.parse(res.data);
                            return storage;
                        },
                        headers: res.headers
                    } : {
                        url,
                        code: res.code,
                        get contentAsString() {
                            if (!storage)
                                storage = JSON.stringify(res.data);
                            return storage;
                        },
                        get contentAsArrayBuffer() {
                            throw new Error("Not implemented");
                        },
                        contentFromJSON: res.data,
                        contentFromBSON: res.data,
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
                const loaderContainerRegex = /(^|\s)loader\-(progress|error)\-container(\s|$)/;
                class NexusFrameworkBase {
                    constructor(url = "/", io) {
                        this.activerid = 0;
                        this.components = {};
                        this.currentUserID = undefined;
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
                    resolveUrl(url) {
                        if (/^\w+\:/.test(url))
                            return url;
                        return resolveUrl(this.url + url);
                    }
                    disableAll(root = document.body) {
                        const focusable = root.querySelectorAll("a, input, select, textarea, iframe, button, *[focusable], *[tabindex]");
                        for (var i = 0; i < focusable.length; i++) {
                            const child = focusable[i];
                            const tabindex = child.getAttribute("tabindex");
                            if (tabindex == "-1")
                                return;
                            child.setAttribute("data-tabindex", tabindex ? tabindex : "");
                            child.setAttribute("data-tabindex", "-1");
                        }
                    }
                    enableAll(root = document.body) {
                        const focusable = root.querySelectorAll("*[data-tabindex]");
                        for (var i = 0; i < focusable.length; i++) {
                            const child = focusable[i];
                            child.setAttribute("tabindex", child.getAttribute("data-tabindex"));
                            child.removeAttribute("data-tabindex");
                        }
                    }
                    get analytics() {
                        return this._analytics;
                    }
                    set analytics(value) {
                        this._analytics = value ? value : GA_ANALYTICS;
                    }
                    reportError(err, fatal) {
                        console[fatal ? "error" : "warn"](err.stack);
                        if (this.errorreporter)
                            this.errorreporter(err, fatal);
                    }
                    installErrorReporter(errorreporter) {
                        this.errorreporter = errorreporter;
                    }
                    registerComponent(selector, impl) {
                        if (impl) {
                            this.components[selector] = impl;
                            this.createComponents(document.head);
                            this.createComponents(document.body);
                        }
                        else {
                            delete this.components[selector];
                            var destroy = (root) => {
                                const elements = root.querySelectorAll(selector);
                                if (!elements.length)
                                    return;
                                for (var i = 0; i < elements.length; i++) {
                                    const element = elements[i];
                                    var components = element['__nf_cmapping__'];
                                    if (!components)
                                        components = element['__nf_cmapping__'] = {};
                                    const component = components[selector];
                                    if (component) {
                                        try {
                                            component.destroy();
                                        }
                                        catch (e) {
                                            this.reportError(e);
                                        }
                                    }
                                }
                            };
                            destroy(document.head);
                            destroy(document.body);
                        }
                    }
                    unregisterComponent(selector, impl) {
                    }
                    createComponents(root) {
                        Object.keys(this.components).forEach((selector) => {
                            const elements = root.querySelectorAll(selector);
                            if (!elements.length)
                                return;
                            for (var i = 0; i < elements.length; i++) {
                                const element = elements[i];
                                var components = element['__nf_cmapping__'];
                                if (!components)
                                    components = element['__nf_cmapping__'] = {};
                                if (components[selector])
                                    continue;
                                const componentFactory = this.components[selector];
                                try {
                                    (components[selector] = new componentFactory()).create(element);
                                }
                                catch (e) {
                                    this.reportError(e);
                                }
                            }
                        });
                    }
                    destroyComponents(root) {
                        Object.keys(this.components).forEach((selector) => {
                            const elements = root.querySelectorAll(selector);
                            if (!elements.length)
                                return;
                            for (var i = 0; i < elements.length; i++) {
                                const element = elements[i];
                                var components = element['__nf_cmapping__'];
                                if (!components)
                                    components = element['__nf_cmapping__'] = {};
                                const component = components[selector];
                                if (component) {
                                    try {
                                        component.destroy();
                                    }
                                    catch (e) {
                                        this.reportError(e);
                                    }
                                }
                            }
                        });
                    }
                    restoreComponents(root, state) {
                        Object.keys(this.components).forEach((selector) => {
                            const states = state[selector];
                            if (!states)
                                return;
                            const elements = root.querySelectorAll(selector);
                            if (!elements.length)
                                return;
                            for (var i = 0; i < elements.length; i++) {
                                const element = elements[i];
                                if (states.length) {
                                    const _state = states.shift();
                                    if (_state) {
                                        var components = element['__nf_cmapping__'];
                                        if (!components)
                                            components = element['__nf_cmapping__'] = {};
                                        var component = components[selector];
                                        if (!component) {
                                            const componentFactory = this.components[selector];
                                            try {
                                                (component = components[selector] = new componentFactory()).create(element);
                                            }
                                            catch (e) {
                                                this.reportError(e);
                                                console.warn(e);
                                                continue;
                                            }
                                        }
                                        try {
                                            component.restore(_state);
                                        }
                                        catch (e) {
                                            this.reportError(e);
                                            console.warn(e);
                                        }
                                    }
                                }
                                else
                                    break;
                            }
                        });
                    }
                    saveComponents(root) {
                        var state = {};
                        Object.keys(this.components).forEach((selector) => {
                            const states = state[selector] = [];
                            const elements = root.querySelectorAll(selector);
                            if (!elements.length)
                                return;
                            for (var i = 0; i < elements.length; i++) {
                                const element = elements[i];
                                var components = element['__nf_cmapping__'];
                                if (!components)
                                    components = element['__nf_cmapping__'] = {};
                                var component = components[selector];
                                if (!component) {
                                    const componentFactory = this.components[selector];
                                    try {
                                        (component = components[selector] = new componentFactory).create(element);
                                    }
                                    catch (e) {
                                        states.push(undefined);
                                        this.reportError(e);
                                        console.warn(e);
                                        continue;
                                    }
                                }
                                try {
                                    states.push(component.save());
                                }
                                catch (e) {
                                    states.push(undefined);
                                    this.reportError(e);
                                    console.warn(e);
                                }
                            }
                        });
                        return state;
                    }
                    initPageSystem(opts) {
                        if (!loader)
                            return console.error("The NexusFramework Loader is required for the dynamic Page System to work correctly.");
                        if (!history.pushState || !history.replaceState)
                            return console.warn("This browser is missing an essential feature required for the dynamic Page System.");
                        if (this.pagesyshandler)
                            return console.warn("Page System already initialized, ignoring additional requests to initialize.");
                        opts = opts || {};
                        const self = this;
                        var pageStatesSize = 0;
                        const pageStates = [];
                        this.animationTiming = opts.animationTiming || 500;
                        const pageStateCacheSize = opts.pageHistoryCacheSize || 25000000;
                        const wrapCB = (cb) => {
                            return (res) => {
                                const user = res.headers['x-logged-user'];
                                if (user)
                                    self.currentUserID = user[0];
                                else
                                    self.currentUserID = undefined;
                                debug("Current UID", self.currentUserID);
                                cb(res);
                                if (res.code === 200)
                                    setTimeout(() => {
                                        self._analytics.reportPage();
                                    });
                            };
                        };
                        loader.showError = function (error) {
                            const match = location.href.match(beforeHash);
                            const baseurl = match && match[1] || location.href;
                            const length = error.stack.length;
                            const tooBig = pageStateCacheSize <= length;
                            try {
                                const cPageStates = pageStates.length;
                                for (var i = 0; i < cPageStates; i++) {
                                    const state = pageStates[i];
                                    if (state.url === baseurl) {
                                        if (tooBig) {
                                            pageStates.splice(i, 1);
                                            pageStatesSize -= state.size;
                                        }
                                        else {
                                            state.data = { error };
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
                                    data: { error },
                                    updated: +new Date,
                                    size: length
                                });
                                pageStatesSize += length;
                            }
                            catch (e) {
                                if (e !== true)
                                    throw e;
                            }
                            return showError(error);
                        };
                        const transportPageSystem = {
                            requestPage(path, cb, post, rid) {
                                if (self.pagesysprerequest && !self.pagesysprerequest(path)) {
                                    self.defaultRequestPage(path, post);
                                    return;
                                }
                                if (!opts.noprogress) {
                                    self.disableAll();
                                    loader.showProgress();
                                }
                                const url = self.resolveUrl(":pagesys/" + path);
                                const _cb = opts.noprogress ? cb : function (res) {
                                    if (opts.noprogress)
                                        cb(res);
                                    else
                                        loader.showProgress(() => {
                                            cb(res);
                                            self.enableAll();
                                        });
                                };
                                if (post)
                                    window.NexusFrameworkTransport.post(url, post, wrapCB(_cb), undefined, undefined, true);
                                else
                                    window.NexusFrameworkTransport.get(url, wrapCB(_cb), undefined, undefined, true);
                            }
                        };
                        if (!opts.noio && this.io) {
                            const io = this.io;
                            this.pagesysimpl = {
                                requestPage(path, cb, post, rid) {
                                    if (io.connected) {
                                        if (self.pagesysprerequest && !self.pagesysprerequest(path)) {
                                            self.defaultRequestPage(path, post);
                                            return;
                                        }
                                        if (!opts.noprogress) {
                                            self.disableAll();
                                            loader.showProgress();
                                        }
                                        const headers = {
                                            "referrer": location.href
                                        };
                                        var val = document.cookie;
                                        if (val)
                                            headers['cookie'] = val;
                                        io.emit("page", post ? "POST" : "GET", path, post, headers, function (res) {
                                            if (rid != self.activerid)
                                                return;
                                            const cookies = res.headers['set-cookie'];
                                            if (cookies) {
                                                cookies.forEach(function (cookie) {
                                                    document.cookie = cookie;
                                                });
                                            }
                                            const _cb = opts.noprogress ? cb : function (res) {
                                                if (!opts.noprogress)
                                                    cb(res);
                                                else
                                                    loader.showProgress(() => {
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
                        this.pagesyshandler = opts.handler || ((res, pageReady) => {
                            try {
                                const contentType = res.headers['content-type'][0];
                                if (!/\/html(;.+)?$/.test(contentType.toLowerCase())) {
                                    throw new Error("Content type is not html");
                                }
                            }
                            catch (e) { }
                            const content = res.contentAsString;
                            const bodyindex = content.indexOf("<body");
                            if (bodyindex == -1)
                                throw new Error("Could not find start of body tag");
                            const endbodyindex = content.indexOf("</body>") || content.indexOf("</ body>");
                            if (endbodyindex == -1)
                                throw new Error("Could not find end of body tag");
                            const title = content.match(/<title>([^<]+)<\/\s*title>/);
                            document.title = title && title[1] || "Title Not Set";
                            const mockhtml = document.createElement("html");
                            mockhtml.innerHTML = content.substring(bodyindex, endbodyindex) + "</body>";
                            var loaderScript;
                            var childs = mockhtml.children;
                            const toAdd = [];
                            for (var i = 0; i < childs.length; i++) {
                                const child = childs[i];
                                switch (child.nodeName.toUpperCase()) {
                                    case "HEAD":
                                        break;
                                    case "BODY":
                                        i = -1;
                                        childs = child.children;
                                        break;
                                    case "SCRIPT":
                                        const match = child.innerHTML.match(/^NexusFrameworkLoader\.load\((.+)\);?$/);
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
                                const child = childs[i];
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
                            const fragment = document.createDocumentFragment();
                            toAdd.forEach((el) => {
                                fragment.appendChild(el);
                                this.createComponents(el);
                            });
                            document.body.appendChild(fragment);
                            loader.load(loaderScript, function () {
                                self.progressVisible = true;
                                loader.resetProgress();
                                pageReady();
                            });
                            return true;
                        });
                        var forwardPopState;
                        const beforeHash = /^([^#]+)(#.*)?$/;
                        var chash = location.href.match(beforeHash)[1];
                        const startsWith = new RegExp("^" + this.url.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + "(.*)$", "i");
                        class AnchorElementComponent {
                            constructor() {
                                this.handler = (e) => {
                                    if (this.element.hasAttribute("data-nopagesys") || this.element.hasAttribute("data-nodynamic"))
                                        return;
                                    const href = this.element.getAttribute("href");
                                    if (!href || !href.length)
                                        return;
                                    var url = this.element.href;
                                    const bhash = url.match(beforeHash);
                                    if (bhash[2] && chash === bhash[1])
                                        return;
                                    if (startsWith.test(url))
                                        try {
                                            const match = url.match(/^(.+)#.*$/);
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
                            create(element) {
                                element.addEventListener("click", this.handler);
                                this.element = element;
                            }
                            destroy() {
                                this.element.removeEventListener("click", this.handler);
                            }
                            restore(data) { }
                            save() { }
                        }
                        class FormElementComponent {
                            constructor() {
                                this.handler = (e) => {
                                    if (this.element.hasAttribute("data-nopagesys") || this.element.hasAttribute("data-nodynamic"))
                                        return;
                                    const method = this.element.getAttribute("method") || "get";
                                    const enctype = this.element.getAttribute("enctype") || "text/urlencoded";
                                    const action = this.element.getAttribute("action") || "";
                                    var url = resolveUrl(action);
                                    if (startsWith.test(url)) {
                                        try {
                                            const match = url.match(/^(.+)#.*$/);
                                            if (match)
                                                url = match[1];
                                            const formData = new FormData(this.element);
                                            loader.showProgress(undefined, "Submitting Form", "Your form data is being processed");
                                            if (method.trim().toLowerCase() === "post")
                                                self.requestPage(url.substring(self.url.length), { type: enctype, data: formData });
                                            else {
                                                var first = true;
                                                var reqUrl = url.substring(self.url.length) + "?";
                                                for (var entry of formData) {
                                                    if (first)
                                                        first = false;
                                                    else
                                                        reqUrl += "&";
                                                    reqUrl += encodeURIComponent(entry[0]);
                                                    reqUrl += "=";
                                                    reqUrl += encodeURIComponent(entry[1]);
                                                }
                                                self.requestPage(reqUrl);
                                            }
                                            try {
                                                e.stopPropagation();
                                            }
                                            catch (e) { }
                                            try {
                                                e.preventDefault();
                                            }
                                            catch (e) { }
                                            Array.prototype.forEach.call(this.element.querySelectorAll("a, input, select, textarea, iframe, button, *[name]"), function (el) {
                                                el.setAttribute("disabled", "disabled");
                                                el.className += " disabled";
                                            });
                                            Array.prototype.forEach.call(this.element.querySelectorAll("button:not([type]), button[type=submit]"), function (button) {
                                                button.innerHTML = "Processing Request";
                                            });
                                            Array.prototype.forEach.call(this.element.querySelectorAll("input[type=submit]"), function (input) {
                                                input.value = "Processing Request";
                                            });
                                            return;
                                        }
                                        catch (e) {
                                            debug(e);
                                        }
                                    }
                                    debug("Submitting", url);
                                };
                            }
                            create(element) {
                                element.addEventListener("submit", this.handler);
                                this.element = element;
                            }
                            destroy() {
                                this.element.removeEventListener("submit", this.handler);
                            }
                            restore(data) { }
                            save() { }
                        }
                        const requestPage = this.requestPage = (path, post, replace = false) => {
                            const match = path.match(/\.([^\/]+)([\?#].*)?$/);
                            if (match && match[0] !== "htm" && match[0] !== "html") {
                                this.defaultRequestPage(path, post);
                                debug("Ignoring navigation", path, match);
                            }
                            else {
                                debug("requestPage", path);
                                const rid = ++self.activerid;
                                const baseurl = this.resolveUrl(path);
                                const fullurl = baseurl + (match && match[2] || "");
                                if (replace)
                                    history.replaceState(!!post, "Loading...", fullurl);
                                else {
                                    history.pushState(!!post, "Loading...", fullurl);
                                    chash = fullurl.match(beforeHash)[1];
                                    window.scrollTo(0, 0);
                                }
                                loader.resetError();
                                loader.resetProgress();
                                this.pagesysimpl.requestPage(path, (res) => {
                                    try {
                                        if (rid !== self.activerid)
                                            return;
                                        if (!res.code) {
                                            loader.showProgress(undefined, "Connection Issue", "Check your network and try again");
                                            document.title = "Connection Issue";
                                            history.replaceState(res.hadData, "Connection Issue", fullurl);
                                            setTimeout(function () {
                                                if (rid !== self.activerid)
                                                    return;
                                                requestPage(path, post, true);
                                            }, 900000);
                                            return;
                                        }
                                        else if (res.code === 502 || res.code === 503) {
                                            loader.showProgress(undefined, "Scheduled Maintenance", "Sorry but this website is undergoing scheduled maintenance");
                                            document.title = "Scheduled Maintenance";
                                            history.replaceState(res.hadData, "Scheduled Maintenance", fullurl);
                                            setTimeout(function () {
                                                if (rid !== self.activerid)
                                                    return;
                                                requestPage(path, post, true);
                                            }, 900000);
                                            return;
                                        }
                                        const location = res.headers['x-location'] || res.headers['location'];
                                        if (location) {
                                            const url = resolveUrl(location[0]);
                                            if (startsWith.test(url)) {
                                                this.requestPage(url.substring(this.url.length), undefined, true);
                                                return;
                                            }
                                            console.warn("Requested redirect to external url:", url);
                                            window.location.href = url;
                                            return;
                                        }
                                        const contentDisposition = res.headers['content-disposition'];
                                        if (contentDisposition && contentDisposition[0].toLowerCase() == "attachment")
                                            throw new Error("Attachment disposition");
                                        this.pagesyshandler(res, function () {
                                            if (rid !== self.activerid)
                                                return;
                                            try {
                                                const title = document.title;
                                                const length = res.contentLength;
                                                const tooBig = pageStateCacheSize <= length;
                                                const stateData = tooBig ? undefined : {
                                                    title: title,
                                                    user: self.currentUserID,
                                                    scroll: [window.scrollX, window.scrollY],
                                                    body: self.saveComponents(document.body),
                                                    basehref: base ? base['href'] : undefined,
                                                    response: res
                                                };
                                                var i;
                                                const cPageStates = pageStates.length;
                                                try {
                                                    for (i = 0; i < cPageStates; i++) {
                                                        const state = pageStates[i];
                                                        if (state.url === baseurl) {
                                                            if (tooBig) {
                                                                pageStates.splice(i, 1);
                                                                pageStatesSize -= state.size;
                                                            }
                                                            else {
                                                                state.data = stateData;
                                                                state.updated = +new Date;
                                                                pageStatesSize += length - state.size;
                                                            }
                                                            throw true;
                                                        }
                                                    }
                                                    if (!tooBig) {
                                                        pageStates.push({
                                                            url: baseurl,
                                                            data: stateData,
                                                            updated: +new Date,
                                                            size: length
                                                        });
                                                        pageStatesSize += length;
                                                        throw true;
                                                    }
                                                    else
                                                        debug("Response too big to store", baseurl, length);
                                                }
                                                catch (e) {
                                                    if (e === true) {
                                                        const over = pageStatesSize - pageStateCacheSize;
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
                                                history.replaceState(res.hadData, document.title, fullurl);
                                                self.emit("page", baseurl, path);
                                            }
                                            catch (e) {
                                                debug(e);
                                                if (replace)
                                                    window.location.reload(true);
                                                else
                                                    try {
                                                        chash = undefined;
                                                        forwardPopState = [path, post];
                                                        debug("Going backwards");
                                                        history.go(-1);
                                                    }
                                                    catch (e) { }
                                            }
                                        });
                                    }
                                    catch (e) {
                                        debug(e);
                                        if (replace)
                                            window.location.reload(true);
                                        else
                                            try {
                                                chash = undefined;
                                                forwardPopState = [path, post];
                                                debug("Going backwards");
                                                history.go(-1);
                                            }
                                            catch (e) { }
                                    }
                                }, post, rid);
                            }
                        };
                        this.registerComponent("a", AnchorElementComponent);
                        this.registerComponent("form", FormElementComponent);
                        window.addEventListener('popstate', (e) => {
                            try {
                                var state;
                                const bhash = location.href.match(beforeHash);
                                const cStates = pageStates.length;
                                const baseurl = bhash[1];
                                for (var i = 0; i < cStates; i++) {
                                    const _state = pageStates[i];
                                    if (_state.url === baseurl) {
                                        state = _state;
                                        break;
                                    }
                                }
                                const hasState = !!state;
                                const rid = ++self.activerid;
                                const error = hasState && state.data.error;
                                if (error) {
                                    showError(error);
                                    return;
                                }
                                if (forwardPopState) {
                                    debug("forwardPopState", forwardPopState);
                                    const forward = forwardPopState;
                                    setTimeout(() => {
                                        if (rid === self.activerid)
                                            self.defaultRequestPage(forward[0], forward[1]);
                                    });
                                    forwardPopState = undefined;
                                    return;
                                }
                                if (chash === baseurl) {
                                    debug("Only hash has changed...", baseurl);
                                    return;
                                }
                                chash = bhash[1];
                                if (e.state)
                                    alert("You submitted data to this page, which cannot be re-sent. Because of this, what you're viewing may not be the same now.");
                                if (!hasState)
                                    throw new Error("No state for: " + baseurl + ", reloading...");
                                if (state.data.user != self.currentUserID)
                                    throw new Error("User has changed since state was created, reloading...");
                                document.title = state.data.title;
                                loader.resetProgress();
                                loader.resetError();
                                self.pagesyshandler(state.data.response, function (err) {
                                    if (rid !== self.activerid)
                                        return;
                                    try {
                                        if (err)
                                            throw err;
                                        if (state.data.body)
                                            self.restoreComponents(document.body, state.data.body);
                                        if (state.data.scroll)
                                            window.scrollTo.apply(window, state.data.scroll);
                                        debug("Used stored page state!", state);
                                    }
                                    catch (err) {
                                        debug(err);
                                        var url = location.href;
                                        if (startsWith.test(url)) {
                                            try {
                                                if (/reloading\.\.\.$/.test(err.message)) {
                                                    self.requestPage(url.substring(self.url.length), undefined, true);
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
                            }
                            catch (err) {
                                debug(err);
                                var url = location.href;
                                if (startsWith.test(url)) {
                                    try {
                                        if (/reloading\.\.\.$/.test(err.message)) {
                                            self.requestPage(url.substring(self.url.length), undefined, true);
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
                    }
                    get currentUser() {
                        return this.currentUserID;
                    }
                    defaultRequestPage(path, post) {
                        if (post)
                            throw new Error("Posting is not supported without an initialized page system, yet");
                        else
                            location.href = this.resolveUrl(path);
                    }
                    on(event, cb) {
                        var listeners = this._listeners[event];
                        if (listeners)
                            listeners.push(cb);
                        else
                            this._listeners[event] = listeners = [cb];
                    }
                    off(event, cb) {
                        var index;
                        var listeners = this._listeners[event];
                        if (listeners && (index = listeners.indexOf(cb)) > -1)
                            listeners.splice(index, 1);
                    }
                    emit(event, ...args) {
                        const self = this;
                        const listeners = this._listeners[event];
                        if (listeners)
                            listeners.forEach(function (cb) {
                                cb.apply(self, args);
                            });
                    }
                }
                var impl;
                if (window.io)
                    impl = class NexusFrameworkWithIO extends NexusFrameworkBase {
                        constructor(url) {
                            super(url, window.io({
                                path: "/:io"
                            }));
                            const io = this.io;
                            io.on("connect", function () {
                                io.emit("init", loader.requestedResources());
                            });
                        }
                    };
                else
                    impl = class NexusFrameworkNoIO extends NexusFrameworkBase {
                        constructor(url) {
                            super(url);
                        }
                    };
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
                const instance = new window.NexusFrameworkImpl();
                Object.defineProperty(window, "NexusFrameworkClient", {
                    value: instance
                });
                return instance;
            }
        }
    });
})(window);
//# sourceMappingURL=nexusframeworkclient.js.map