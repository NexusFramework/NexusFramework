(function (w) {
    const d = window.document;
    const r = d.createElement("a");
    const resolveUrl = function (url) {
        r.setAttribute("href", url);
        return r.href;
    };
    const n = function () { };
    const rmClass = function (elements, visibleClass) {
        var element;
        const classRegex = new RegExp("(^|\\s+)" + visibleClass.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + "(\\s+|$)", "g");
        for (var i = 0; i < elements.length; i++) {
            element = elements[i];
            element.className = element.className.replace(classRegex, function (match, p1) {
                return /^\s.+\s$/.test(match) ? " " : "";
            });
        }
    };
    const addClass = function (elements, visibleClass) {
        var element;
        const classRegex = new RegExp("(^|\\s+)" + visibleClass.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + "(\\s+|$)", "g");
        for (var i = 0; i < elements.length; i++) {
            element = elements[i];
            if (!classRegex.test(element.className))
                element.className = (element.className ? element.className + " " : "") + visibleClass;
        }
    };
    var errorShowed = false;
    var showError = function (err) {
        console.warn(err);
        if (errorShowed)
            return;
        errorShowed = true;
        const errorFade = "loader-error-visible";
        const errorContainerArray = errorFade ? d.getElementsByClassName("loader-error-container") : undefined;
        const errorMessageArray = d.getElementsByClassName("loader-error-message");
        if (errorMessageArray.length) {
            const messageAndStack = "" + (err.stack || err);
            const replacements = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
                '`': '&#x60;',
                '/': '&#x2F;',
                '=': '&#x3D;',
                '    ': "&nbsp;&nbsp;",
                '\n': "<br />"
            };
            const html = messageAndStack.replace(/([&<>"'`=\/\n]|    )/g, function (s) {
                return replacements[s];
            });
            for (var i = 0; i < errorMessageArray.length; i++)
                errorMessageArray[i].innerHTML = html;
            if (w.ga)
                try {
                    w.ga('send', 'exception', {
                        'exDescription': messageAndStack,
                        'exFatal': true
                    });
                }
                catch (e) {
                    console.warn(e);
                }
            if (errorFade && errorContainerArray.length)
                addClass(errorContainerArray, errorFade);
        }
    };
    try {
        var resetProgress, incrementProgress;
        var progressBar = d.getElementsByClassName("loader-progress-bar");
        var progressBarContainer = d.getElementsByClassName("loader-progress-container");
        if (progressBar.length) {
            let totalScripts = 0, loadedScripts = 0;
            incrementProgress = function (oncomplete) {
                var prog;
                if (++loadedScripts >= totalScripts) {
                    if (oncomplete)
                        oncomplete();
                    else if (progressBarContainer)
                        rmClass(progressBarContainer, "loader-progress-visible");
                    prog = 1;
                }
                else
                    prog = 1 - Math.pow(5, 1 - (loadedScripts / totalScripts)) / 5;
                prog = (prog * 100) + "%";
                for (var i = 0; i < progressBar.length; i++)
                    progressBar[i]['style'] && (progressBar[i]['style'].width = prog);
            };
            resetProgress = function (by = 1) {
                totalScripts = by;
                loadedScripts = 0;
            };
        }
        else if (progressBarContainer.length) {
            let totalScripts = 0, loadedScripts = 0;
            incrementProgress = function (oncomplete) {
                if (++loadedScripts >= totalScripts) {
                    if (oncomplete)
                        oncomplete();
                    else
                        rmClass(progressBarContainer, "loader-progress-visible");
                }
            };
            resetProgress = function (by = 1) {
                totalScripts = by;
                loadedScripts = 0;
            };
        }
        else {
            let totalScripts = 0, loadedScripts = 0;
            incrementProgress = function (oncomplete) {
                if (++loadedScripts >= totalScripts && oncomplete)
                    oncomplete();
            };
            resetProgress = function (by = 1) {
                totalScripts = by;
                loadedScripts = 0;
            };
        }
        if (progressBarContainer)
            addClass(progressBarContainer, "loader-progress-visible");
        const base64 = function (data) {
            try {
                return btoa(data);
            }
            catch (e) {
                var symbols = data.split('');
                for (var i = 0, l = symbols.length; i < l; i++) {
                    var symbol = symbols[i];
                    try {
                        btoa(symbol);
                    }
                    catch (e) {
                        var code = symbol.charCodeAt(0).toString(16);
                        while (code.length < 4) {
                            code = '0' + code;
                        }
                        symbols[i] = '\\u' + code;
                    }
                }
                return btoa(symbols.join(''));
            }
        };
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
        const loadCallbacks = {};
        const NexusFrameworkLoaderImpl = {
            __load(resources, oncomplete) {
                if (resources.length) {
                    resetProgress(resources.length);
                    resources.forEach(function (resource) {
                        NexusFrameworkLoaderImpl.loadResource(resource.type, resource.source, function (err) {
                            if (err)
                                showError(err);
                            else
                                incrementProgress(oncomplete);
                        }, resource.deps, resource.inline || resource.version, resource.name);
                    });
                }
                else if (oncomplete)
                    oncomplete();
                else {
                    resetProgress();
                    incrementProgress(oncomplete);
                }
            },
            requestedResources() {
                return Object.keys(loadCallbacks);
            },
            loadResource(type, source, cb, deps = [], inlineOrVersion, name) {
                var processResource, callCallbacks;
                if (type == "script")
                    processResource = function (data) {
                        try {
                            const scriptel = d.createElement('script');
                            scriptel.src = 'data:application/javascript;base64,' + base64(data);
                            scriptel.onload = function () {
                                callCallbacks();
                            };
                            scriptel.onerror = function () {
                                callCallbacks(new Error("Failed to load " + source));
                            };
                            d.body.appendChild(scriptel);
                        }
                        catch (e) {
                            (function () {
                                try {
                                    eval(data);
                                    callCallbacks();
                                }
                                catch (e) {
                                    console.warn(e);
                                    callCallbacks(e);
                                }
                            }).call(w);
                        }
                    };
                else if (type == "style")
                    processResource = function (data) {
                        const linkel = d.createElement('link');
                        linkel.type = "text/css";
                        linkel.rel = "stylesheet";
                        linkel.href = 'data:text/css;base64,' + base64(data);
                        linkel.onload = function () {
                            callCallbacks();
                        };
                        linkel.onerror = function () {
                            callCallbacks(new Error("Failed to load " + source));
                        };
                        d.head.appendChild(linkel);
                    };
                else
                    throw new Error("Unknown type: " + type);
                try {
                    var errored = false;
                    const onLoad = function (err) {
                        if (errored)
                            return;
                        if (err) {
                            errored = true;
                            cb(err);
                        }
                        else
                            cb();
                    };
                    if (!name) {
                        if (inlineOrVersion === true)
                            name = "inline-" + stringHash(source);
                        else {
                            source = resolveUrl(source);
                            var name = source;
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
                        }
                    }
                    const key = type + ":" + name;
                    var callbacks = loadCallbacks[key];
                    if (callbacks)
                        return callbacks.push(onLoad);
                    callCallbacks = function (err) {
                        callbacks.forEach(function (cb) {
                            cb(err);
                        });
                        (loadCallbacks[key] = []).push = function (...items) {
                            items.forEach(function (cb) {
                                cb(err);
                            });
                            return 0;
                        };
                    };
                    if (!name.indexOf("/"))
                        return callCallbacks(new Error("`" + name + "` is required but was not included before this script."));
                    const parseResource = function (data) {
                        const next = function () {
                            data += "\n//# sourceURL=" + source;
                            processResource(data);
                        };
                        if (deps.length) {
                            var toLoad = deps.length;
                            deps.forEach(function (dep) {
                                NexusFrameworkLoaderImpl.loadResource(type, dep, function (err) {
                                    if (err)
                                        callCallbacks(err);
                                    else if (!--toLoad)
                                        next();
                                });
                            });
                        }
                        else
                            next();
                    };
                    callbacks = loadCallbacks[key] = [onLoad];
                    if (inlineOrVersion === true)
                        parseResource(source);
                    else {
                        var url = source;
                        if (inlineOrVersion) {
                            const q = url.indexOf("?");
                            if (q == -1)
                                url += "?";
                            else
                                url += "&";
                            url += "v=" + inlineOrVersion;
                        }
                        var request = new XMLHttpRequest();
                        request.open("GET", url);
                        request.onreadystatechange = function () {
                            if (request.readyState === XMLHttpRequest.DONE) {
                                if (request.status === 200)
                                    parseResource(request.responseText);
                                else
                                    callCallbacks(new Error("Server returned bad status: " + request.statusText + " (" + request.status + ")"));
                            }
                        };
                        try {
                            request.send();
                        }
                        catch (e) {
                            callCallbacks(e);
                        }
                    }
                }
                catch (e) {
                    console.warn(e);
                    cb(e);
                }
            }
        };
        Object.defineProperty(w, "NexusFrameworkLoader", {
            value: NexusFrameworkLoaderImpl
        });
    }
    catch (e) {
        showError(e);
    }
})(window);
//# sourceMappingURL=loader.js.map