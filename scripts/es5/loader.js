/// <reference path="../index.d.ts" />
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
    var errorFade = "loader-error-visible";
    var errorContainerArray = errorFade ? d.getElementsByClassName("loader-error-container") : undefined;
    var errorMessageArray = d.getElementsByClassName("loader-error-message");
    var showError = function (err) {
        var messageAndStack = "" + (err.stack || err);
        console.warn(messageAndStack);
        if (errorShowed)
            return errorContainerArray;
        errorShowed = true;
        if (errorMessageArray.length) {
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
        return errorContainerArray;
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
        /**
         * https://stackoverflow.com/questions/3728798/running-javascript-downloaded-with-xmlhttprequest/35247060#answer-31275143
         */
        var base64_1 = function (data) {
            try {
                return btoa(data);
            }
            catch (e) {
                // script file may contain characters that not included in Latin1
                var symbols = data.split('');
                for (var i = 0, l = symbols.length; i < l; i++) {
                    var symbol = symbols[i];
                    // here we are trying to find these symbols in catch branch
                    try {
                        btoa(symbol);
                    }
                    catch (e) {
                        var code = symbol.charCodeAt(0).toString(16);
                        while (code.length < 4) {
                            code = '0' + code;
                        }
                        // replace original symbol to unicode character
                        symbols[i] = '\\u' + code;
                    }
                }
                // create new base64 string from string with replaced characters
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
        var initialVersions;
        var loadCallbacks_1 = {};
        var resourceSources_1 = {};
        var NexusFrameworkLoaderImpl_1 = {
            load: function (data, oncomplete) {
                if (initialVersions) {
                    var versions = data[0];
                    var len = versions.length;
                    if (len !== initialVersions.length)
                        return location.reload(true);
                    for (var i = 0; i < len; i++)
                        if (versions[i] !== initialVersions[i])
                            return location.reload(true);
                }
                else
                    initialVersions = data[0];
                var resources = data[1];
                if (resources.length) {
                    resetProgress(resources.length);
                    resources.forEach(function (resource) {
                        NexusFrameworkLoaderImpl_1.loadResource(resource.type, resource.source, function (err) {
                            if (err) {
                                console.log(err);
                                NexusFrameworkLoaderImpl_1.showError(err);
                            }
                            else
                                incrementProgress(oncomplete);
                        }, resource.dependencies, resource.inline || resource.integrity, resource.name);
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
                return Object.keys(resourceSources_1);
            },
            resourceSource: function (key) {
                return resourceSources_1[key];
            },
            loadResource: function (type, source, cb, deps, inlineOrIntegrity, name) {
                if (deps === void 0) { deps = []; }
                try {
                    var processResource, callCallbacks;
                    var contentType;
                    if (type == "script") {
                        contentType = "text/javascript";
                        processResource = function (url) {
                            var scriptel = d.createElement('script');
                            scriptel.type = "text/javascript";
                            if (inlineOrIntegrity && inlineOrIntegrity !== true)
                                scriptel.integrity = inlineOrIntegrity;
                            scriptel.async = true;
                            scriptel.onload = function () {
                                callCallbacks();
                            };
                            scriptel.onerror = function () {
                                callCallbacks(new Error("Failed to load resource: " + source));
                            };
                            scriptel.src = url;
                            d.body.appendChild(scriptel);
                        };
                    }
                    else if (type == "style") {
                        contentType = "text/css";
                        processResource = function (url) {
                            var linkel = d.createElement('link');
                            linkel.type = "text/css";
                            linkel.rel = "stylesheet";
                            if (inlineOrIntegrity && inlineOrIntegrity !== true)
                                linkel.integrity = inlineOrIntegrity;
                            linkel.onload = function () {
                                callCallbacks();
                            };
                            linkel.onerror = function () {
                                callCallbacks(new Error("Failed to load resource: " + source));
                            };
                            linkel.href = url;
                            d.body.appendChild(linkel);
                        };
                    }
                    else
                        throw new Error("Unknown type: " + type);
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
                    if (inlineOrIntegrity !== true)
                        url = source = resolveUrl(source);
                    if (!name) {
                        if (inlineOrIntegrity === true) {
                            name = "inline-" + stringHash_1(source);
                        }
                        else {
                            name = source;
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
                        if (inlineOrIntegrity === true && type === "script")
                            delete loadCallbacks_1[key_1];
                        else
                            loadCallbacks_1[key_1] = { push: function (cb) {
                                    cb(err);
                                } };
                    };
                    callbacks = loadCallbacks_1[key_1] = [onLoad];
                    if (inlineOrIntegrity !== true && source.indexOf("/") == -1)
                        return callCallbacks(new Error(type[0].toUpperCase() + type.substring(1) + " `" + name + "` is required, but not included."));
                    if (deps.length) {
                        var toLoad = deps.length;
                        deps.forEach(function (dep) {
                            NexusFrameworkLoaderImpl_1.loadResource(type, dep, function (err) {
                                if (err)
                                    callCallbacks(err);
                                else if (!--toLoad) {
                                    resourceSources_1[key_1] = source;
                                    if (inlineOrIntegrity === true)
                                        processResource('data:' + contentType + ';base64,' + base64_1(source));
                                    else
                                        processResource(source);
                                }
                            });
                        });
                    }
                    else if (inlineOrIntegrity === true)
                        processResource('data:' + contentType + ';base64,' + base64_1(source));
                    else
                        processResource(source);
                }
                catch (e) {
                    console.warn(e);
                    cb(e);
                }
            }
        };
        NexusFrameworkLoaderImpl_1.resetError = function () {
            if (errorFade && errorContainerArray.length)
                rmClass(errorContainerArray, errorFade);
            errorShowed = false;
        };
        NexusFrameworkLoaderImpl_1.showError = function (err) {
            errorShowed = false;
            return showError(err);
        };
        var maintenanceOpen, progressTimeout;
        NexusFrameworkLoaderImpl_1.showProgress = function (maintenance, cb) {
            if (progressBarContainer) {
                addClass(progressBarContainer, "loader-progress-visible");
                if (maintenance) {
                    Array.prototype.forEach.call(progressBarContainer, function (container) {
                        container.querySelector(".loader-progress-maintenance").style.display = "";
                    });
                    addClass(progressBarContainer, "loader-progress-working");
                    maintenanceOpen = true;
                }
                else if (maintenanceOpen) {
                    Array.prototype.forEach.call(progressBarContainer, function (container) {
                        container.querySelector(".loader-progress-maintenance").style.display = "none";
                    });
                    rmClass(progressBarContainer, "loader-progress-working");
                    maintenanceOpen = undefined;
                }
                if (cb) {
                    try {
                        clearTimeout(progressTimeout);
                    }
                    catch (e) { }
                    progressTimeout = setTimeout(cb, 200);
                }
            }
            else if (cb)
                cb();
            return progressBarContainer;
        };
        NexusFrameworkLoaderImpl_1.resetProgress = function () {
            if (progressBarContainer) {
                try {
                    clearTimeout(progressTimeout);
                }
                catch (e) { }
                rmClass(progressBarContainer, "loader-progress-visible");
                if (maintenanceOpen) {
                    Array.prototype.forEach.call(progressBarContainer, function (container) {
                        container.querySelector(".loader-progress-maintenance").style.display = "none";
                    });
                    rmClass(progressBarContainer, "loader-progress-working");
                    maintenanceOpen = undefined;
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