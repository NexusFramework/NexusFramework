(function (w) {
    var d = window.document;
    var r = d.createElement("a");
    var protocol = location.href.match(/^\w+:/)[0];
    var resolveUrl = function (url) {
        r.setAttribute("href", url);
        var href = r.href;
        if (/^\/\//.test(href))
            href = protocol + href;
        return href;
    };
    var n = function () { };
    var rmClass = function (elements, visibleClass) {
        var element;
        var classRegex = new RegExp("(^|\\s+)" + visibleClass.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + "(\\s+|$)", "g");
        for (var i = 0; i < elements.length; i++) {
            element = elements[i];
            element.className = element.className.replace(classRegex, function (match, p1) {
                return /^\s.+\s$/.test(match) ? " " : "";
            });
        }
    };
    var addClass = function (elements, visibleClass) {
        var element;
        var classRegex = new RegExp("(^|\\s+)" + visibleClass.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + "(\\s+|$)", "g");
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
        var errorFade = "loader-error-visible";
        var errorContainerArray = errorFade ? d.getElementsByClassName("loader-error-container") : undefined;
        var errorMessageArray = d.getElementsByClassName("loader-error-message");
        if (errorMessageArray.length) {
            var messageAndStack = "" + (err.stack || err);
            var replacements_1 = {
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
            var html = messageAndStack.replace(/([&<>"'`=\/\n]|    )/g, function (s) {
                return replacements_1[s];
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
            var totalScripts_1 = 0, loadedScripts_1 = 0;
            incrementProgress = function (oncomplete) {
                var prog;
                if (++loadedScripts_1 >= totalScripts_1) {
                    if (oncomplete)
                        oncomplete();
                    else if (progressBarContainer)
                        rmClass(progressBarContainer, "loader-progress-visible");
                    prog = 1;
                }
                else
                    prog = 1 - Math.pow(5, 1 - (loadedScripts_1 / totalScripts_1)) / 5;
                prog = (prog * 100) + "%";
                for (var i = 0; i < progressBar.length; i++)
                    progressBar[i]['style'] && (progressBar[i]['style'].width = prog);
            };
            resetProgress = function (by) {
                if (by === void 0) { by = 1; }
                totalScripts_1 = by;
                loadedScripts_1 = 0;
            };
        }
        else if (progressBarContainer.length) {
            var totalScripts_2 = 0, loadedScripts_2 = 0;
            incrementProgress = function (oncomplete) {
                if (++loadedScripts_2 >= totalScripts_2) {
                    if (oncomplete)
                        oncomplete();
                    else
                        rmClass(progressBarContainer, "loader-progress-visible");
                }
            };
            resetProgress = function (by) {
                if (by === void 0) { by = 1; }
                totalScripts_2 = by;
                loadedScripts_2 = 0;
            };
        }
        else {
            var totalScripts_3 = 0, loadedScripts_3 = 0;
            incrementProgress = function (oncomplete) {
                if (++loadedScripts_3 >= totalScripts_3 && oncomplete)
                    oncomplete();
            };
            resetProgress = function (by) {
                if (by === void 0) { by = 1; }
                totalScripts_3 = by;
                loadedScripts_3 = 0;
            };
        }
        if (progressBarContainer)
            addClass(progressBarContainer, "loader-progress-visible");
        var base64_1 = function (data) {
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
        var padLeft_1 = function (data, count, using) {
            if (count === void 0) { count = 8; }
            if (using === void 0) { using = "0"; }
            while (data.length < count)
                data = using + data;
            return data;
        };
        var stringHash_1 = function (data) {
            if (data.length === 0)
                return "00000000";
            var hash = 0;
            for (var i = 0; i < data.length; i++)
                hash = (((hash << 5) - hash) + data.charCodeAt(i)) | 0;
            return padLeft_1(hash.toString(16));
        };
        var loadCallbacks_1 = {};
        var NexusFrameworkLoaderImpl_1 = {
            load: function (resources, oncomplete) {
                if (resources.length) {
                    resetProgress(resources.length);
                    resources.forEach(function (resource) {
                        NexusFrameworkLoaderImpl_1.loadResource(resource.type, resource.source, function (err) {
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
            requestedResources: function () {
                return Object.keys(loadCallbacks_1);
            },
            loadResource: function (type, source, cb, deps, inlineOrVersion, name) {
                if (deps === void 0) { deps = []; }
                var processResource, callCallbacks;
                if (type == "script")
                    processResource = function (data) {
                        try {
                            var scriptel = d.createElement('script');
                            scriptel.src = 'data:application/javascript;base64,' + base64_1(data);
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
                        var linkel = d.createElement('link');
                        linkel.type = "text/css";
                        linkel.rel = "stylesheet";
                        linkel.href = 'data:text/css;base64,' + base64_1(data);
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
                    var onLoad = function (err) {
                        if (errored)
                            return;
                        if (err) {
                            errored = true;
                            cb(err);
                        }
                        else
                            cb();
                    };
                    var url;
                    if (name) {
                        if (inlineOrVersion !== true) {
                            url = source = resolveUrl(source);
                            var q = url.indexOf("?");
                            if (q == -1)
                                url += "?";
                            else
                                url += "&";
                            url += "v=" + inlineOrVersion;
                        }
                    }
                    else {
                        if (inlineOrVersion === true) {
                            name = "inline-" + stringHash_1(source);
                        }
                        else {
                            url = source = resolveUrl(source);
                            var q = url.indexOf("?");
                            if (q == -1)
                                url += "?";
                            else
                                url += "&";
                            url += "v=" + inlineOrVersion;
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
                            if (/\.slim$/.test(name))
                                name = name.substring(0, name.length - 5);
                            if (/\.umd$/.test(name))
                                name = name.substring(0, name.length - 4);
                            match = name.match(/^(.+)\-\d+([\.\-]\d)*$/);
                            if (match)
                                name = match[1];
                        }
                    }
                    var key_1 = type + ":" + name;
                    var callbacks = loadCallbacks_1[key_1];
                    if (callbacks)
                        return callbacks.push(onLoad);
                    callCallbacks = function (err) {
                        callbacks.forEach(function (cb) {
                            cb(err);
                        });
                        (loadCallbacks_1[key_1] = []).push = function () {
                            var items = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                items[_i] = arguments[_i];
                            }
                            items.forEach(function (cb) {
                                cb(err);
                            });
                            return 0;
                        };
                    };
                    if (!name.indexOf("/"))
                        return callCallbacks(new Error("`" + name + "` is required but was not included before this script."));
                    var parseResource_1 = function (data) {
                        var next = function () {
                            if (url)
                                data += "\n//# sourceURL=" + url;
                            processResource(data);
                        };
                        if (deps.length) {
                            var toLoad = deps.length;
                            deps.forEach(function (dep) {
                                NexusFrameworkLoaderImpl_1.loadResource(type, dep, function (err) {
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
                    callbacks = loadCallbacks_1[key_1] = [onLoad];
                    if (inlineOrVersion === true)
                        parseResource_1(source);
                    else {
                        var request = new XMLHttpRequest();
                        request.open("GET", url);
                        request.onreadystatechange = function () {
                            if (request.readyState === XMLHttpRequest.DONE) {
                                if (request.status === 200)
                                    parseResource_1(request.responseText);
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
            value: NexusFrameworkLoaderImpl_1
        });
    }
    catch (e) {
        showError(e);
    }
})(window);
//# sourceMappingURL=loader.js.map