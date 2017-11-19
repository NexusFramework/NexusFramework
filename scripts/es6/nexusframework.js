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
                    constructor(request, url) {
                        this._url = url;
                        this.request = request;
                        request.responseType = "arraybuffer";
                    }
                    get url() {
                        return this.request.responseURL || this._url;
                    }
                    get code() {
                        return this.request.status;
                    }
                    get contentFromJSON() {
                        if (!this.parsedJson)
                            this.parsedJson = JSON.parse(this.request.responseText);
                        return this.parsedJson;
                    }
                    get contentAsArrayBuffer() {
                        return this.request.response;
                    }
                    get contentAsString() {
                        return this.request.responseText;
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
                const execute = function (method, url, data, cb, extraHeaders, progcb) {
                    const request = new XMLHttpRequest();
                    request.open(method, url, true);
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
                            cb(new NexusFrameworkXMLHttpRequestResponse(request, url));
                        }
                    };
                    request.send(data);
                };
                impl = {
                    get: function (url, cb, extraHeaders, progcb) {
                        execute("GET", url, undefined, cb, extraHeaders, progcb);
                    },
                    head: function (url, cb, extraHeaders, progcb) {
                        execute("HEAD", url, undefined, cb, extraHeaders, progcb);
                    },
                    post: function (url, data, cb, extraHeaders, progcb) {
                        execute("POST", url, data, cb, extraHeaders, progcb);
                    },
                    put: function (url, data, cb, extraHeaders, progcb) {
                        execute("PUT", url, data, cb, extraHeaders, progcb);
                    },
                    execute,
                    del: function (url, cb, extraHeaders, progcb) {
                        execute("DELETE", url, undefined, cb, extraHeaders, progcb);
                    }
                };
            }
            else {
                impl = {
                    get(url, cb, extraHeaders) {
                        cb({
                            url,
                            code: 503,
                            get contentFromJSON() {
                                throw new Error("No response to parse.");
                            },
                            contentAsArrayBuffer: new ArrayBuffer(0),
                            contentAsString: "",
                            headers: {}
                        });
                    },
                    head(url, cb, extraHeaders) {
                        cb({
                            url,
                            code: 503,
                            get contentFromJSON() {
                                throw new Error("No response to parse.");
                            },
                            contentAsArrayBuffer: new ArrayBuffer(0),
                            contentAsString: "",
                            headers: {}
                        });
                    },
                    put(url, data, cb, extraHeaders) {
                        cb({
                            url,
                            code: 503,
                            get contentFromJSON() {
                                throw new Error("No response to parse.");
                            },
                            contentAsArrayBuffer: new ArrayBuffer(0),
                            contentAsString: "",
                            headers: {}
                        });
                    },
                    post(url, data, cb, extraHeaders) {
                        cb({
                            url,
                            code: 503,
                            get contentFromJSON() {
                                throw new Error("No response to parse.");
                            },
                            contentAsArrayBuffer: new ArrayBuffer(0),
                            contentAsString: "",
                            headers: {}
                        });
                    },
                    execute(method, url, data, cb, extraHeaders) {
                        cb({
                            url,
                            code: 503,
                            get contentFromJSON() {
                                throw new Error("No response to parse.");
                            },
                            contentAsArrayBuffer: new ArrayBuffer(0),
                            contentAsString: "",
                            headers: {}
                        });
                    },
                    del(url, cb, extraHeaders) {
                        cb({
                            url,
                            code: 503,
                            get contentFromJSON() {
                                throw new Error("No response to parse.");
                            },
                            contentAsArrayBuffer: new ArrayBuffer(0),
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
            const NOOP = function () { };
            const NULL_ANALYTICS = {
                reportError: NOOP,
                reportEvent: NOOP,
                reportPage: NOOP
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
            const addAnimationEnd = function (el, handler) {
                el.addEventListener("transitionend", handler);
                el.addEventListener("transitionEnd", handler);
                el.addEventListener("webkitTransitionEnd", handler);
                el.addEventListener("mozTransitionEnd", handler);
                el.addEventListener("oTransitionEnd", handler);
            };
            const removeAnimationEnd = function (el, handler) {
                el.removeEventListener("transitionend", handler);
                el.removeEventListener("transitionEnd", handler);
                el.removeEventListener("webkitTransitionEnd", handler);
                el.removeEventListener("mozTransitionEnd", handler);
                el.removeEventListener("oTransitionEnd", handler);
            };
            const convertResponse = function (res, url = location.href) {
                var storage, arrstorage;
                return (typeof res.data === "string" || res.data instanceof String) ? {
                    url,
                    code: res.code,
                    contentAsString: res.data,
                    get contentAsArrayBuffer() {
                        if (!arrstorage) {
                            arrstorage = new ArrayBuffer(res.data.length);
                            var bufView = new Uint8Array(arrstorage);
                            for (var i = 0, strLen = res.data.length; i < strLen; i++) {
                                bufView[i] = res.data.charCodeAt(i);
                            }
                        }
                        return arrstorage;
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
                        if (!arrstorage) {
                            if (!storage)
                                storage = JSON.stringify(res.data);
                            arrstorage = new ArrayBuffer(storage);
                            var bufView = new Uint8Array(arrstorage);
                            for (var i = 0, strLen = storage.length; i < strLen; i++) {
                                bufView[i] = storage.charCodeAt(i);
                            }
                        }
                        return arrstorage;
                    },
                    contentFromJSON: res.data,
                    headers: res.headers
                };
            };
            const loaderContainerRegex = /(^|\s)loader\-(progress|error)\-container(\s|$)/;
            class NexusFrameworkBase {
                constructor(url = "/", io) {
                    this.activerid = 0;
                    this.components = {};
                    this.currentUserID = undefined;
                    this.progressBar = document.getElementsByClassName("loader-progress-bar");
                    this.progressBarContainer = document.getElementsByClassName("loader-progress-container");
                    this.progressVisible = false;
                    this.requestPage = this.defaultRequestPage;
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
                    if (window.ga)
                        this._analytics = {
                            reportError: function (err, fatal) {
                                try {
                                    window.ga('send', 'exception', {
                                        'exDescription': "" + err + "\n\t" + (err.stack || "Stack trace not available").replace(/\n/g, "\n\t"),
                                        'exFatal': true
                                    });
                                }
                                catch (e) {
                                    console.warn(e);
                                }
                            },
                            reportEvent: function (category, action, label, value) {
                                try {
                                    window.ga('send', 'event', category, action, label, value);
                                }
                                catch (e) {
                                    console.warn(e);
                                }
                            },
                            reportPage: function (path, title) {
                                try {
                                    window.ga('send', 'pageview', path, {
                                        page: path,
                                        title
                                    });
                                }
                                catch (e) {
                                    console.warn(e);
                                }
                            }
                        };
                    else
                        this._analytics = NULL_ANALYTICS;
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
                fadeInProgress(cb) {
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
                        const el = this.progressBarContainer[0];
                        const onAnimationEnd = () => {
                            try {
                                clearTimeout(timer);
                            }
                            catch (e) { }
                            removeAnimationEnd(el, onAnimationEnd);
                            this.progressVisible = true;
                            const callbacks = this.progressFadeCallbacks;
                            delete this.progressFadeCallbacks;
                            callbacks.forEach(function (cb) {
                                cb();
                            });
                        };
                        addAnimationEnd(el, onAnimationEnd);
                        timer = setTimeout(onAnimationEnd, 500);
                        for (var i = 0; i < this.progressBarContainer.length; i++) {
                            const container = this.progressBarContainer[i];
                            if (!/(^|\s)loader\-progress\-visible(\s|$)/.test(container.className))
                                container.className = (container.className + " loader-progress-visible").trim();
                        }
                    }
                    else {
                        this.progressVisible = true;
                        if (cb)
                            cb();
                    }
                }
                fadeOutProgress(cb) {
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
                        const el = this.progressBarContainer[0];
                        const onAnimationEnd = () => {
                            try {
                                clearTimeout(timer);
                            }
                            catch (e) { }
                            removeAnimationEnd(el, onAnimationEnd);
                            this.progressVisible = false;
                            const callbacks = this.progressFadeCallbacks;
                            delete this.progressFadeCallbacks;
                            callbacks.forEach(function (cb) {
                                cb();
                            });
                        };
                        addAnimationEnd(el, onAnimationEnd);
                        timer = setTimeout(onAnimationEnd, 500);
                        for (var i = 0; i < this.progressBarContainer.length; i++) {
                            const container = this.progressBarContainer[i];
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
                }
                get analytics() {
                    return this._analytics;
                }
                set analytics(value) {
                    this._analytics = value ? value : NULL_ANALYTICS;
                }
                reportError(err, fatal) {
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
                                    (component = components[selector] = new componentFactory()).create(element);
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
                    if (!window.NexusFrameworkLoader)
                        return console.warn("The NexusFramework Loader is required for the dynamic Page System to work correctly.");
                    if (!history.pushState || !history.replaceState)
                        return console.warn("This browser is missing an essential feature required for the dynamic Page System.");
                    opts = opts || {};
                    const self = this;
                    const wrapCBUserExtract = (cb) => {
                        return (res) => {
                            const user = res.headers['x-user'];
                            if (user)
                                this.currentUserID = user[0];
                            else
                                this.currentUserID = undefined;
                            cb(res);
                        };
                    };
                    const transportPageSystem = {
                        requestPage(path, cb, post) {
                            if (self.pagesysprerequest && self.pagesysprerequest(path)) {
                                self.defaultRequestPage(path, post);
                                return;
                            }
                            if (!opts.noprogress) {
                                self.disableAll();
                                self.fadeInProgress();
                            }
                            const url = self.resolveUrl(path);
                            const extraHeaders = {
                                accepts: "text/json"
                            };
                            const _cb = opts.noprogress ? cb : function (res) {
                                self.fadeInProgress(() => {
                                    cb(res);
                                    self.enableAll();
                                });
                            };
                            if (post)
                                window.NexusFrameworkTransport.post(url, post, wrapCBUserExtract(_cb), extraHeaders);
                            else
                                window.NexusFrameworkTransport.get(url, wrapCBUserExtract(_cb), extraHeaders);
                        }
                    };
                    if (!opts.noio && this.io) {
                        const io = this.io;
                        this.pagesysimpl = {
                            requestPage(path, cb, post) {
                                if (io.connected) {
                                    if (self.pagesysprerequest && self.pagesysprerequest(path)) {
                                        self.defaultRequestPage(path, post);
                                        return;
                                    }
                                    if (!opts.noprogress) {
                                        self.disableAll();
                                        self.fadeInProgress();
                                    }
                                    const headers = {
                                        "referrer": location.href
                                    };
                                    var val = document.cookie;
                                    if (val)
                                        headers['cookie'] = val;
                                    io.emit("page", post ? "POST" : "GET", path, post, headers, function (res) {
                                        const cookies = res.headers['set-cookie'];
                                        if (cookies) {
                                            cookies.forEach(function (cookie) {
                                                document.cookie = cookie;
                                            });
                                        }
                                        const _cb = opts.noprogress ? cb : function (res) {
                                            self.fadeInProgress(() => {
                                                cb(res);
                                                self.enableAll();
                                            });
                                        };
                                        wrapCBUserExtract(_cb)(convertResponse(res, self.resolveUrl(path)));
                                    });
                                }
                                else
                                    transportPageSystem.requestPage(path, cb, post);
                            }
                        };
                    }
                    else
                        this.pagesysimpl = transportPageSystem;
                    var base = document.getElementsByTagName("base");
                    base = base && base[0];
                    this.pagesysprerequest = opts.prerequest;
                    this.pagesyshandler = opts.handler || ((res) => {
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
                        window.NexusFrameworkLoader.load(loaderScript, this.fadeOutProgress.bind(this));
                        return true;
                    });
                    var forwardPopState;
                    const startsWith = new RegExp("^" + this.url.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + "(.*)$", "i");
                    class AnchorElementComponent {
                        constructor() {
                            this.handler = (e) => {
                                if (this.element.hasAttribute("data-nopagesys") || this.element.hasAttribute("data-nodynamic"))
                                    return;
                                var url = this.element.href;
                                if (startsWith.test(url)) {
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
                                    catch (e) { }
                                }
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
                    const genState = (withPageState) => {
                        var data = {
                            user: this.currentUserID
                        };
                        if (withPageState) {
                            data.title = document.title,
                                data.body = this.saveComponents(document.body);
                            data.basehref = base ? base['href'] : undefined;
                            data.page = withPageState;
                        }
                        return data;
                    };
                    this.requestPage = (path, post, replace = false) => {
                        if (/\..+$/.test(path))
                            this.defaultRequestPage(path, post);
                        else {
                            const rid = ++this.activerid;
                            document.title = "Loading...";
                            const url = this.resolveUrl(path);
                            console.log(url, replace, rid);
                            history[replace ? "replaceState" : "pushState"](genState(), "Loading...", url);
                            this.pagesysimpl.requestPage(path, (res) => {
                                try {
                                    if (rid != this.activerid)
                                        return;
                                    const location = res.headers['location'];
                                    if (location) {
                                        const url = resolveUrl(location[0]);
                                        if (startsWith.test(url)) {
                                            this.requestPage(url.substring(this.url.length), undefined, true);
                                            return;
                                        }
                                        console.warn("Requested redirect to url outside of website:", url);
                                        window.location.href = url;
                                        return;
                                    }
                                    const contentDisposition = res.headers['content-disposition'];
                                    if (contentDisposition && contentDisposition[0].toLowerCase() == "attachment")
                                        throw new Error("Attachment disposition");
                                    if (!this.pagesyshandler(res))
                                        throw new Error("Could not handle response");
                                    const contentType = res.headers['content-type'];
                                    history.replaceState(genState({
                                        code: res.code,
                                        headers: res.headers,
                                        data: (contentType && /\/json(;.+)?$/.test(contentType[0])) ? res.contentFromJSON : res.contentAsString
                                    }), document.title, url);
                                }
                                catch (e) {
                                    console.warn(e);
                                    forwardPopState = [path, post];
                                    try {
                                        history.go(-1);
                                    }
                                    catch (e) { }
                                }
                            }, post);
                        }
                    };
                    this.registerComponent("a", AnchorElementComponent);
                    window.addEventListener('popstate', (e) => {
                        if (forwardPopState) {
                            const forward = forwardPopState;
                            setTimeout(() => {
                                this.defaultRequestPage(forward[0], forward[1]);
                            });
                            forwardPopState = undefined;
                            return;
                        }
                        try {
                            if (e.state.user != this.currentUserID)
                                throw new Error("User has changed since state was created, reloading...");
                            const page = e.state.page;
                            if (!page)
                                throw new Error("Page was never loaded or page data is corrupt, reloading...");
                            document.title = e.state.title;
                            this.pagesyshandler(convertResponse(page));
                            this.restoreComponents(document.body, e.state.body);
                        }
                        catch (err) {
                            console.warn(err);
                            var url = location.href;
                            if (startsWith.test(url)) {
                                try {
                                    if (/reloading\.\.\.$/.test(err.message)) {
                                        this.requestPage(url.substring(self.url.length), undefined, true);
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
                    history.replaceState(genState(), document.title, location.href);
                    return true;
                }
                defaultRequestPage(path, post) {
                    if (post)
                        throw new Error("Posting is not supported without an initialized page system, yet");
                    else
                        location.href = this.resolveUrl(path);
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
                            io.emit("init", window.NexusFrameworkLoader.requestedResources());
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
    NexusFramework: {
        configurable: true,
        set: function (instance) {
            Object.defineProperty(window, "NexusFramework", {
                value: instance
            });
        },
        get: function () {
            const instance = new window.NexusFrameworkImpl();
            Object.defineProperty(window, "NexusFramework", {
                value: instance
            });
            return instance;
        }
    }
});
//# sourceMappingURL=nexusframework.js.map