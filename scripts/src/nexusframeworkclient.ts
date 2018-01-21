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
            var impl: NexusFrameworkTransport;
            if ("XMLHttpRequest" in window) {
                class NexusFrameworkXMLHttpRequestResponse implements NexusFrameworkTransportResponse {
                    private _url: string;
                    private parsedJson: any;
                    private request: XMLHttpRequest;
                    private processedHeaders: {[index: string]: string[]};
                    constructor(request: XMLHttpRequest, url: string) {
                        this._url = url;
                        this.request = request;
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
                    get contentAsString() {
                        return this.request.responseText;
                    }
                    get headers(): {[index: string]: string[]} {
                        if (!this.processedHeaders) {
                            const headers: {[index: string]: string[]} = this.processedHeaders = {};
                            this.request.getAllResponseHeaders().split(/\r?\n/g).forEach(function (header) {
                                const index = header.indexOf(":");
                                var key: string, val: string;
                                if (index > 0) {
                                    key = header.substring(0, index).trim().toLowerCase();
                                    val = header.substring(index + 1).trim();
                                } else
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
                const execute = function (method: string, url: string, data: any, cb: (res: NexusFrameworkTransportResponse) => void, extraHeaders?: {[index: string]: string}, progcb?: (complete: number, total: number) => void) {
                    const request = new XMLHttpRequest();
                    request.open(method, url, true);
                    if (extraHeaders)
                        Object.keys(extraHeaders).forEach(function (key) {
                            request.setRequestHeader(key, extraHeaders[key]);
                        });
                    if (progcb)
                        request.onprogress = function (ev) {
                            if (ev.lengthComputable && ev.total)
                                progcb(ev.loaded, ev.total);
                        }
                    request.onreadystatechange = function (e) {
                        if (request.readyState === XMLHttpRequest.DONE) {
                            cb(new NexusFrameworkXMLHttpRequestResponse(request, url));
                        }
                    }
                    request.send(data);
                }
                impl = {
                    get: function (url: string, cb: (res?: NexusFrameworkTransportResponse) => void, extraHeaders?: {[index: string]: string}, progcb?: (complete: number, total: number) => void) {
                        execute("GET", url, undefined, cb, extraHeaders, progcb);
                    },
                    head: function (url: string, cb: (res?: NexusFrameworkTransportResponse) => void, extraHeaders?: {[index: string]: string}, progcb?: (complete: number, total: number) => void) {
                        execute("HEAD", url, undefined, cb, extraHeaders, progcb);
                    },
                    post: function (url: string, data: any, cb: (res?: NexusFrameworkTransportResponse) => void, extraHeaders?: {[index: string]: string}, progcb?: (complete: number, total: number) => void) {
                        execute("POST", url, data, cb, extraHeaders, progcb);
                    },
                    put: function (url: string, data: any, cb: (res?: NexusFrameworkTransportResponse) => void, extraHeaders?: {[index: string]: string}, progcb?: (complete: number, total: number) => void) {
                        execute("PUT", url, data, cb, extraHeaders, progcb);
                    },
                    execute,
                    del: function (url: string, cb: (res?: NexusFrameworkTransportResponse) => void, extraHeaders?: {[index: string]: string}, progcb?: (complete: number, total: number) => void) {
                        execute("DELETE", url, undefined, cb, extraHeaders, progcb);
                    }
                };
            } else {
                impl = {
                    get(url: string, cb: (res: NexusFrameworkTransportResponse) => void, extraHeaders?: {[index: string]: string}): void {
                        cb({
                            url,
                            code: 503,
                            get contentFromJSON() {
                                throw new Error("No response to parse.");
                            },
                            contentAsString: "",
                            headers: {}
                        });
                    },
                    head(url: string, cb: (res: NexusFrameworkTransportResponse) => void, extraHeaders?: {[index: string]: string}): void {
                        cb({
                            url,
                            code: 503,
                            get contentFromJSON() {
                                throw new Error("No response to parse.");
                            },
                            contentAsString: "",
                            headers: {}
                        });
                    },
                    put(url: string, data: any, cb: (res: NexusFrameworkTransportResponse) => void, extraHeaders?: {[index: string]: string}): void {
                        cb({
                            url,
                            code: 503,
                            get contentFromJSON() {
                                throw new Error("No response to parse.");
                            },
                            contentAsString: "",
                            headers: {}
                        });
                    },
                    post(url: string, data: any, cb: (res: NexusFrameworkTransportResponse) => void, extraHeaders?: {[index: string]: string}): void {
                        cb({
                            url,
                            code: 503,
                            get contentFromJSON() {
                                throw new Error("No response to parse.");
                            },
                            contentAsString: "",
                            headers: {}
                        });
                    },
                    execute(method: string, url: string, data: any, cb: (res: NexusFrameworkTransportResponse) => void, extraHeaders?: {[index: string]: string}): void {
                        cb({
                            url,
                            code: 503,
                            get contentFromJSON() {
                                throw new Error("No response to parse.");
                            },
                            contentAsString: "",
                            headers: {}
                        });
                    },
                    del(url: string, cb: (res: NexusFrameworkTransportResponse) => void, extraHeaders?: {[index: string]: string}): void {
                        cb({
                            url,
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
            const GA_ANALYTICS: NexusFrameworkAnalyticsAdapter = {
                reportError: function (err: Error, fatal?: boolean) {
                    if (window.ga)
                        try {
                            window.ga('send', 'exception', {
                                'exDescription': (err.stack || "" + err).replace(/\n/g, "\n\t"),
                                'exFatal': fatal
                            });
                        } catch (e) {
                            console.warn(e);
                        }
                },
                reportEvent: function (category: string, action: string, label?: string, value?: number) {
                    if (window.ga)
                        try {
                            window.ga('send', 'event', category, action, label, value);
                        } catch (e) {
                            console.warn(e);
                        }
                },
                reportPage: function (path?: string) {
                    if (window.ga)
                        try {
                            if (!path)
                                path = location.pathname;
                            window.ga('set', 'page', path);
                            window.ga('send', 'pageview');
                        } catch (e) {
                            console.warn(e);
                        }
                }
            };
            const r = document.createElement("a");
            const protocol = location.href.match(/^\w+:/)[0];
            const resolveUrl = function (url: string) {
                r.setAttribute("href", url);
                var href = r.href;
                if (/^\/\//.test(href))
                    href = protocol + href;
                return href;
            }
            interface PageSystemImpl {
                requestPage(path: string, cb: (res: NexusFrameworkTransportResponse) => void, post?: any, rid?: number): void;
            }
            const addAnimationEnd = function (el: Element, handler: Function) {
                el.addEventListener("transitionend", handler as any);
                el.addEventListener("transitionEnd", handler as any);
                el.addEventListener("webkitTransitionEnd", handler as any);
                el.addEventListener("mozTransitionEnd", handler as any);
                el.addEventListener("oTransitionEnd", handler as any);
            }
            const removeAnimationEnd = function (el: Element, handler: Function) {
                el.removeEventListener("transitionend", handler as any);
                el.removeEventListener("transitionEnd", handler as any);
                el.removeEventListener("webkitTransitionEnd", handler as any);
                el.removeEventListener("mozTransitionEnd", handler as any);
                el.removeEventListener("oTransitionEnd", handler as any);
            }
            const convertResponse = function (res: NexusFrameworkPageSystemResponse, url = location.href) {
                var storage: any;
                return (typeof res.data === "string" || res.data instanceof String) ? {
                    url,
                    code: res.code,
                    contentAsString: res.data,
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
                        contentFromJSON: res.data,
                        headers: res.headers
                    };
            }
            const loaderContainerRegex = /(^|\s)loader\-(progress|error)\-container(\s|$)/;
            class NexusFrameworkBase implements NexusFrameworkClient {
                public readonly url: string;
                public readonly io: SocketIOClient.Socket;
                private activerid = 0;
                private _analytics: NexusFrameworkAnalyticsAdapter;
                private errorreporter: (err: Error, fatal?: boolean) => void;
                private components: {[index: string]: NexusFrameworkComponentFactory} = {};
                private pagesyshandler: (res: NexusFrameworkTransportResponse) => boolean;
                private pagesysprerequest: (path: string) => boolean;
                private pagesysimpl: PageSystemImpl;
                private currentUserID: string = undefined;
                private progressBar = document.getElementsByClassName("loader-progress-bar");
                private progressBarContainer = document.getElementsByClassName("loader-progress-container");
                private progressFadeCallbacks: Function[];
                private progressVisible = false;
                public constructor(url = "/", io?: SocketIOClient.Socket) {
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

                resolveUrl(url: string) {
                    if (/^\w+\:/.test(url))
                        return url;
                    return resolveUrl(this.url + url);
                }

                disableAll(root: HTMLElement = document.body) {
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
                enableAll(root: HTMLElement = document.body) {
                    const focusable = root.querySelectorAll("*[data-tabindex]");
                    for (var i = 0; i < focusable.length; i++) {
                        const child = focusable[i];
                        child.setAttribute("tabindex", child.getAttribute("data-tabindex"));
                        child.removeAttribute("data-tabindex");
                    }
                }

                fadeInProgress(cb?: () => void) {
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
                    for (var i = 0; i < this.progressBar.length; i++) {
                        try {
                            const progbar = this.progressBar[i];
                            const origClassName = progbar.className;
                            progbar.className += " noani";
                            progbar['style'].width = '0%';
                            setTimeout(function() {
                                progbar.className = origClassName;
                            });
                        } catch(e) {}
                    }
                    if (this.progressBarContainer.length) {
                        var timer;
                        this.progressFadeCallbacks = [];
                        if (cb)
                            this.progressFadeCallbacks.push(cb);
                        const el = this.progressBarContainer[0];
                        const onAnimationEnd = () => {
                            try {clearTimeout(timer);} catch (e) {}
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
                        setTimeout(() => {
                            for (var i = 0; i < this.progressBarContainer.length; i++) {
                                const container = this.progressBarContainer[i];
                                if (!/(^|\s)loader\-progress\-visible(\s|$)/.test(container.className))
                                    container.className = (container.className + " loader-progress-visible").trim();
                            }
                        })
                    } else {
                        this.progressVisible = true;
                        if (cb)
                            cb();
                    }
                }

                fadeOutProgress(cb?: () => void) {
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
                            try {clearTimeout(timer);} catch (e) {}
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
                    } else {
                        this.progressVisible = false;
                        if (cb)
                            cb();
                    }
                }

                get analytics() {
                    return this._analytics;
                }
                set analytics(value) {
                    this._analytics = value ? value : GA_ANALYTICS;
                }

                reportError(err: Error, fatal?: boolean) {
                    console[fatal ? "error" : "warn"](err.stack);
                    if (this.errorreporter)
                        this.errorreporter(err, fatal);
                }
                installErrorReporter(errorreporter: (err: Error, fatal?: boolean) => void) {
                    this.errorreporter = errorreporter;
                }

                registerComponent(selector: string, impl: NexusFrameworkComponentFactory) {
                    if (impl) {
                        this.components[selector] = impl;
                        this.createComponents(document.head);
                        this.createComponents(document.body);
                    } else {
                        delete this.components[selector];
                        var destroy = (root: HTMLElement) => {
                            const elements = root.querySelectorAll(selector);
                            if (!elements.length)
                                return;

                            for (var i = 0; i < elements.length; i++) {
                                const element = elements[i];
                                var components = element['__nf_cmapping__'];
                                if (!components)
                                    components = element['__nf_cmapping__'] = {};
                                const component: NexusFrameworkComponent = components[selector];
                                if (component) {
                                    try {
                                        component.destroy();
                                    } catch (e) {
                                        this.reportError(e);
                                    }
                                }
                            }
                        }
                        destroy(document.head);
                        destroy(document.body);
                    }
                }
                unregisterComponent(selector: string, impl: NexusFrameworkComponentFactory) {

                }
                createComponents(root: Element): void {
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
                                (components[selector] = new componentFactory()).create(element as HTMLElement);
                            } catch (e) {
                                this.reportError(e);
                            }
                        }
                    });
                }
                destroyComponents(root: HTMLElement): void {
                    Object.keys(this.components).forEach((selector) => {
                        const elements = root.querySelectorAll(selector);
                        if (!elements.length)
                            return;

                        for (var i = 0; i < elements.length; i++) {
                            const element = elements[i];
                            var components = element['__nf_cmapping__'];
                            if (!components)
                                components = element['__nf_cmapping__'] = {};
                            const component: NexusFrameworkComponent = components[selector];
                            if (component) {
                                try {
                                    component.destroy();
                                } catch (e) {
                                    this.reportError(e);
                                }
                            }
                        }
                    });
                }
                restoreComponents(root: HTMLElement, state: Object): void {
                    Object.keys(this.components).forEach((selector) => {
                        const states: any[] = state[selector];
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
                                    var component: NexusFrameworkComponent = components[selector];
                                    if (!component) {
                                        const componentFactory = this.components[selector];
                                        try {
                                            (component = components[selector] = new componentFactory()).create(element as HTMLElement);
                                        } catch (e) {
                                            this.reportError(e);
                                            console.warn(e);
                                            continue;
                                        }
                                    }
                                    try {
                                        component.restore(_state);
                                    } catch (e) {
                                        this.reportError(e);
                                        console.warn(e);
                                    }
                                }
                            } else
                                break;
                        }
                    });
                }
                saveComponents(root: HTMLElement): Object {
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
                            var component: NexusFrameworkComponent = components[selector];
                            if (!component) {
                                const componentFactory = this.components[selector];
                                try {
                                    (component = components[selector] = new componentFactory()).create(element as HTMLElement);
                                } catch (e) {
                                    states.push(undefined);
                                    this.reportError(e);
                                    console.warn(e);
                                    continue;
                                }
                            }
                            try {
                                states.push(component.save());
                            } catch (e) {
                                states.push(undefined);
                                this.reportError(e);
                                console.warn(e);
                            }
                        }
                    });
                    return state;
                }

                initPageSystem(opts?: NexusFrameworkPageSystemOptions) {
                    if (!window.NexusFrameworkLoader)
                        return console.warn("The NexusFramework Loader is required for the dynamic Page System to work correctly.");
                    if (!history.pushState || !history.replaceState)
                        return console.warn("This browser is missing an essential feature required for the dynamic Page System.")

                    opts = opts || {};
                    const self = this;
                    var currentResponse: NexusFrameworkPageSystemResponse;
                    const wrapCB = (cb: (res: NexusFrameworkTransportResponse) => void) => {
                        return (res: NexusFrameworkTransportResponse) => {
                            const user = res.headers['x-user'];
                            if (user)
                                this.currentUserID = user[0];
                            else
                                this.currentUserID = undefined;
                            cb(res);
                            if (res.code === 200)
                                setTimeout(() => {
                                    this._analytics.reportPage();
                                });
                        }
                    }
                    const transportPageSystem = {
                        requestPage(path: string, cb: (res: NexusFrameworkTransportResponse) => void, post?: any, rid?: number): void {
                            if (self.pagesysprerequest && !self.pagesysprerequest(path)) {
                                self.defaultRequestPage(path, post);
                                return;
                            }
                            if (!opts.noprogress) {
                                self.disableAll();
                                self.fadeInProgress();
                            }
                            const url = self.resolveUrl(":pagesys/" + path);
                            const _cb = opts.noprogress ? cb : function (res: NexusFrameworkTransportResponse) {
                                self.fadeInProgress(() => {
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
                        const io = this.io;
                        this.pagesysimpl = {
                            requestPage(path: string, cb: (res: NexusFrameworkTransportResponse) => void, post?: any, rid?: number): void {
                                if (io.connected) {
                                    if (self.pagesysprerequest && !self.pagesysprerequest(path)) {
                                        self.defaultRequestPage(path, post);
                                        return;
                                    }
                                    if (!opts.noprogress) {
                                        self.disableAll();
                                        self.fadeInProgress();
                                    }
                                    const headers: any = {
                                        "referrer": location.href
                                    };
                                    var val = document.cookie;
                                    if (val)
                                        headers['cookie'] = val;
                                    io.emit("page", post ? "POST" : "GET", path, post, headers, function (res: NexusFrameworkPageSystemResponse) {
                                        if (rid != self.activerid)
                                            return;

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
                                        wrapCB(_cb)(convertResponse(res, self.resolveUrl(path)));
                                    });
                                } else
                                    transportPageSystem.requestPage(path, cb, post, rid);
                            }
                        }
                    } else
                        this.pagesysimpl = transportPageSystem;
                    var base: HTMLBaseElement | NodeListOf<HTMLBaseElement> = document.getElementsByTagName("base");
                    base = base && base[0];
                    this.pagesysprerequest = opts.prerequest;
                    this.pagesyshandler = opts.handler || ((res: NexusFrameworkTransportResponse) => {
                        try {
                            const contentType = res.headers['content-type'][0];
                            if (!/\/html(;.+)?$/.test(contentType.toLowerCase())) {
                                throw new Error("Content type is not html");
                            }
                        } catch (e) {}
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
                        var loaderScript: any;
                        var childs = mockhtml.children;
                        const toAdd: Element[] = [];
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
                        toAdd.forEach((el) => {
                            document.body.appendChild(el);
                            this.createComponents(el);
                        });
                        window.NexusFrameworkLoader.load(loaderScript, this.fadeOutProgress.bind(this));
                        return true;
                    });
                    var forwardPopState: any[];
                    const beforeHash = /^([^#]+)(#.+)?$/;
                    var chash = location.href.match(beforeHash);
                    const startsWith = new RegExp("^" + this.url.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + "(.*)$", "i");
                    class AnchorElementComponent implements NexusFrameworkComponent {
                        private readonly handler = (e: Event) => {
                            if (this.element.hasAttribute("data-nopagesys") || this.element.hasAttribute("data-nodynamic"))
                                return;
                            var url = this.element.href;
                            const bhash = url.match(beforeHash);
                            if (bhash && chash && bhash[2] && chash[1] === bhash[1])
                                return;
                            chash = bhash;
                            if (startsWith.test(url))
                                try {
                                    const match = url.match(/^(.+)#.*$/);
                                    if (match)
                                        url = match[1];
                                    self.requestPage(url.substring(self.url.length));
                                    try {
                                        e.stopPropagation();
                                    } catch (e) {}
                                    try {
                                        e.preventDefault();
                                    } catch (e) {}
                                } catch (e) {
                                    console.warn(e);
                                }
                            else
                                console.log("Navigating", url);
                        };
                        private element: HTMLAnchorElement;
                        create(element: HTMLAnchorElement): void {
                            element.addEventListener("click", this.handler);
                            this.element = element;
                        }
                        destroy(): void {
                            this.element.removeEventListener("click", this.handler);
                        }
                        restore(data: any): void {}
                        save() {}
                    }
                    const genState = (withPageState?: NexusFrameworkPageSystemResponse) => {
                        if (withPageState) {
                            return {
                                title: document.title,
                                user: this.currentUserID,
                                scroll: [window.scrollX, window.scrollY],
                                body: this.saveComponents(document.body),
                                basehref: base ? base['href'] : undefined,
                                page: withPageState
                            }
                        }
                        return undefined;
                    }
                    this.requestPage = (path: string, post?: any, replace = false) => {
                        if (/\..+$/.test(path))
                            this.defaultRequestPage(path, post);
                        else {
                            const rid = ++this.activerid;
                            const url = this.resolveUrl(path);
                            if (replace)
                                history.replaceState(genState(currentResponse), "Loading...", url);
                            else {
                                history.replaceState(genState(currentResponse), document.title, location.href);
                                history.pushState(genState(), "Loading...", url);
                                currentResponse = undefined;
                                window.scrollTo(0, 0);
                            }
                            this.pagesysimpl.requestPage(path, (res) => {
                                try {
                                    if (rid != this.activerid)
                                        return;

                                    const location = res.headers['x-location'] || res.headers['location'];
                                    if (location) {
                                        const url = resolveUrl(location[0]);
                                        if (startsWith.test(url)) {
                                            (this.requestPage as any)(url.substring(this.url.length), undefined, true);
                                            return;
                                        }

                                        console.warn("Requested redirect to external url:", url);
                                        window.location.href = url;
                                        return;
                                    }

                                    const contentDisposition = res.headers['content-disposition'];
                                    if (contentDisposition && contentDisposition[0].toLowerCase() == "attachment")
                                        throw new Error("Attachment disposition");
                                    if (!this.pagesyshandler(res))
                                        throw new Error("Could not handle response");

                                    const contentType = res.headers['content-type'];
                                    history.replaceState(genState(currentResponse = {
                                        code: res.code,
                                        headers: res.headers,
                                        data: (contentType && /\/json(;.+)?$/.test(contentType[0])) ? res.contentFromJSON : res.contentAsString
                                    }), document.title, url);
                                    this.emit("page", path);
                                } catch (e) {
                                    console.warn(e);
                                    forwardPopState = [path, post];
                                    try {
                                        history.go(-1);
                                    } catch (e) {}
                                }
                            }, post, rid);
                        }
                    };
                    this.registerComponent("a", AnchorElementComponent);
                    window.addEventListener('popstate', (e) => {
                        const bhash = location.href.match(beforeHash);
                        if (bhash && chash && chash[1] === bhash[1])
                            return;
                        chash = bhash;
                        
                        if (forwardPopState) {
                            const forward = forwardPopState;
                            setTimeout(() => {
                                this.defaultRequestPage(forward[0], forward[1]);
                            });
                            forwardPopState = undefined;
                            return;
                        }

                        try {
                            if (!e.state)
                                throw new Error("No state, reloading...");
                            if (e.state.user != this.currentUserID)
                                throw new Error("User has changed since state was created, reloading...");
                            const page = e.state.page;
                            if (!page)
                                throw new Error("Page was never loaded or page data is corrupt, reloading...");
                            document.title = e.state.title;
                            this.pagesyshandler(convertResponse(page));
                            this.restoreComponents(document.body, e.state.body);
                            window.scrollTo.apply(window, e.state.scroll);
                        } catch (err) {
                            console.warn(err);
                            var url = location.href;
                            if (startsWith.test(url)) {
                                try {
                                    if (/reloading\.\.\.$/.test(err.message)) {
                                        (this.requestPage as any)(url.substring(self.url.length), undefined, true);
                                        return;
                                    }
                                    console.error("Unknown error occured, actually navigating to page...");
                                } catch (e) {
                                    console.error(e);
                                }
                            }
                            location.reload(true);
                        }
                    });
                    return true;
                }
                defaultRequestPage(path: string, post?: any) {
                    if (post)
                        throw new Error("Posting is not supported without an initialized page system, yet");
                    else
                        location.href = this.resolveUrl(path);
                }
                requestPage = this.defaultRequestPage;
                private _listeners: {[index: string]: Function[]} = {};
                on(event: string, cb: (...args: any[]) => void) {
                    var listeners = this._listeners[event];
                    if (listeners)
                        listeners.push(cb);
                    else
                        this._listeners[event] = listeners = [cb];

                }
                off(event: string, cb: (...args: any[]) => void) {
                    var index: number;
                    var listeners = this._listeners[event];
                    if (listeners && (index = listeners.indexOf(cb)) > -1)
                        listeners.splice(index, 1);
                }
                emit(event: string, ...args: any[]) {
                    const self = this;
                    const listeners = this._listeners[event];
                    if (listeners)
                        listeners.forEach(function (cb) {
                            cb.apply(self, args);
                        })
                }
            }
            var impl;
            if (window.io)
                impl = class NexusFrameworkWithIO extends NexusFrameworkBase {
                    public constructor(url?: string) {
                        super(url, window.io({ // TODO: Parse the root URL and give a path and hostname properly
                            path: "/:io"
                        }));
                        const io = this.io;
                        io.on("connect", function () {
                            io.emit("init", window.NexusFrameworkLoader.requestedResources());
                        });
                    }
                }
            else
                impl = class NexusFrameworkNoIO extends NexusFrameworkBase {
                    public constructor(url?: string) {
                        super(url);
                    }
                }
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