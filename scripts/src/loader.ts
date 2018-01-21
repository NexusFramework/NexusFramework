/// <reference path="../index.d.ts" />
(function(w) {
    const d = window.document;
    const r = d.createElement("a");
    const protocol = location.href.match(/^\w+:/)[0];
    const resolveUrl = function(url: string) {
        r.setAttribute("href", url);
        var href = r.href;
        if (/^\/\//.test(href))
            href = protocol + href;
        return href;
    }
    const rmClass = function(elements: HTMLCollection, visibleClass: string) {
        var element: Element;
        const classRegex = new RegExp("(^|\\s+)" + (visibleClass as string).replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + "(\\s+|$)", "g");
        for(var i=0; i<elements.length; i++) {
            element = elements[i];
            element.className = element.className.replace(classRegex, function(match, p1) {
                return /^\s.+\s$/.test(match) ? " " : "";
            });
        }
    }
    const addClass = function(elements: HTMLCollection, visibleClass: boolean | string) {
        var element: Element;
        const classRegex = new RegExp("(^|\\s+)" + (visibleClass as string).replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&") + "(\\s+|$)", "g");
        for(var i=0; i<elements.length; i++) {
            element = elements[i];
            if (!classRegex.test(element.className))
                element.className = (element.className ? element.className + " " : "") + visibleClass;
        }
    }
    
    var errorShowed = false;
    var showError = function(err: Error) {
        console.warn(err);
        if(errorShowed)
            return;
        errorShowed = true;
        const errorFade = "loader-error-visible";
        const errorContainerArray: HTMLElement | HTMLCollection = errorFade ? d.getElementsByClassName("loader-error-container") : undefined;
        const errorMessageArray: HTMLElement | HTMLCollection = d.getElementsByClassName("loader-error-message");
        if (errorMessageArray.length) {
            const messageAndStack = "" + (err.stack || err);
            const replacements: {[index: string]: string} = {
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
            for(var i=0; i<errorMessageArray.length; i++)
                errorMessageArray[i].innerHTML = html;
            
            if(w.ga)
                try {
                    w.ga('send', 'exception', {
                        'exDescription': messageAndStack,
                        'exFatal': true
                    });
                } catch(e) {
                    console.warn(e);
                }
            
            if(errorFade && errorContainerArray.length)
                addClass(errorContainerArray, errorFade);
        }
    };
    try {
        var resetProgress: Function, incrementProgress: Function;
        var progressBar = d.getElementsByClassName("loader-progress-bar");
        var progressBarContainer = d.getElementsByClassName("loader-progress-container");
        if(progressBar.length) {
            let totalScripts = 0, loadedScripts = 0;
            incrementProgress = function(oncomplete?) {
                var prog: number | string;
                if(++loadedScripts >= totalScripts) {
                    if (oncomplete)
                        oncomplete();
                    else if (progressBarContainer)
                        rmClass(progressBarContainer, "loader-progress-visible");
                    prog = 1;
                } else
                    prog = 1-Math.pow(5, 1-(loadedScripts / totalScripts))/5;
                prog = (prog*100) + "%";
                for (var i = 0; i < progressBar.length; i++)
                    progressBar[i]['style'] && (progressBar[i]['style'].width = prog);
            };
            resetProgress = function(by = 1) {
                totalScripts = by;
                loadedScripts = 0;
            }
        } else if(progressBarContainer.length) {
            let totalScripts = 0, loadedScripts = 0;
            incrementProgress = function(oncomplete?) {
                if(++loadedScripts >= totalScripts) {
                    if (oncomplete)
                        oncomplete();
                    else
                        rmClass(progressBarContainer, "loader-progress-visible");
                }
            };
            resetProgress = function(by = 1) {
                totalScripts = by;
                loadedScripts = 0;
            }
        } else {
            let totalScripts = 0, loadedScripts = 0;
            incrementProgress = function(oncomplete?) {
                if(++loadedScripts >= totalScripts && oncomplete)
                    oncomplete();
            };
            resetProgress = function(by = 1) {
                totalScripts = by;
                loadedScripts = 0;
            }
        }
        if (progressBarContainer)
            addClass(progressBarContainer, "loader-progress-visible");
        const base64 = function(data: string) {
            try {
                return btoa(data);
            } catch (e) {
                // script file may contain characters that not included in Latin1
                var symbols = data.split('');
                for (var i = 0, l = symbols.length; i < l; i++) {
                    var symbol = symbols[i];
                    // here we are trying to find these symbols in catch branch
                    try {
                        btoa(symbol);
                    } catch (e) {
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
        }
        const padLeft = function(data: string, count = 8, using = "0") {
            while (data.length < count)
                data = using + data;
            return data;
        }
        const stringHash = function(data: string) {
            if (data.length === 0) return "00000000";
            var hash = 0;
            for (var i = 0; i < data.length; i++)
                hash = (((hash << 5) - hash) + data.charCodeAt(i)) | 0;
            return padLeft(hash.toString(16));
        };
        var initialVersions: string[];
        const loadCallbacks: {[index: string]: Function[]} = {};
        const NexusFrameworkLoaderImpl = {
            load(data: NexusFrameworkLoaderData, oncomplete?: Function) {
                if (initialVersions) {
                    const versions = data[0];
                    const len = versions.length;
                    if (len !== initialVersions.length)
                        return location.reload(true);
                    for (var i=0; i<len; i++)
                        if (versions[i] !== initialVersions[i])
                            return location.reload(true);
                } else
                    initialVersions = data[0];
                const resources = data[1];
                if (resources.length) {
                    resetProgress(resources.length);
                    resources.forEach(function(resource) {
                        NexusFrameworkLoaderImpl.loadResource(resource.type, resource.source, function(err) {
                            if(err)
                                showError(err);
                            else
                                incrementProgress(oncomplete);
                        }, resource.dependencies, resource.inline || resource.integrity, resource.name);
                    });
                } else if(oncomplete)
                    oncomplete();
                else {
                    resetProgress();
                    incrementProgress(oncomplete);
                }
            },
            requestedResources() {
                return Object.keys(loadCallbacks);
            },
            loadResource(type: string, source: string, cb: (err?: Error) => void, deps: string[] = [], inlineOrIntegrity?: boolean | string, name?: string) {
                var processResource: (data: string) => void, callCallbacks: (err?: Error) => void;
                var contentType: string;
                if(type == "script") {
                    contentType = "text/javascript";
                    processResource = function(url) {
                        const scriptel = d.createElement('script');
                        scriptel.type = "text/javascript";
                        if (inlineOrIntegrity && inlineOrIntegrity !== true)
                            scriptel.integrity = inlineOrIntegrity;
                        scriptel.async = true;
                        scriptel.onload = function() {
                            callCallbacks();
                        };
                        scriptel.onerror = function() {
                            callCallbacks(new Error("Failed to load resource: " + source));
                        };
                        scriptel.src = url;
                        d.body.appendChild(scriptel);
                    }
                } else if(type == "style") {
                    contentType = "text/css";
                    processResource = function(url) {
                        const linkel = d.createElement('link');
                        linkel.type = "text/css";
                        linkel.rel = "stylesheet";
                        if (inlineOrIntegrity && inlineOrIntegrity !== true)
                            linkel.integrity = inlineOrIntegrity;
                        linkel.onload = function() {
                            callCallbacks();
                        };
                        linkel.onerror = function() {
                            callCallbacks(new Error("Failed to load resource: " + source));
                        };
                        linkel.href = url;
                        d.body.appendChild(linkel);
                    }
                } else
                    throw new Error("Unknown type: " + type);
                
                try {
                    var errored = false;
                    const onLoad = function(err?: Error) {
                        if(errored)
                            return;
                        if(err) {
                            errored = true;
                            cb(err);
                        } else
                            cb();
                    };
                    var url: string;
                    if (inlineOrIntegrity !== true)
                        url = source = resolveUrl(source);
                    if (!name) {
                        if(inlineOrIntegrity === true) {
                            name = "inline-" + stringHash(source);
                        } else {
                            var name = source;
                            var index = name.lastIndexOf("/");
                            if(index > -1)
                                name = name.substring(index+1);
                            var match = name.match(/^(([a-z][a-z0-9]*[\-_\.]?)+)\.(css|js)(\?.*)?$/i);
                            if(match)
                                name = match[1];
                            else
                                name = name.replace(/\.(css|js)(\?.*)?$/i, "");
                            if(/\.min$/.test(name))
                                name = name.substring(0, name.length-4);
                            if(/\.slim$/.test(name))
                                name = name.substring(0, name.length-5);
                            if(/\.umd$/.test(name))
                                name = name.substring(0, name.length-4);
                            match = name.match(/^(.+)\-\d+([\.\-]\d)*$/);
                            if (match)
                                name = match[1];
                        }
                    }
                    const key = type + ":" + name;
                    
                    var callbacks = loadCallbacks[key];
                    if(callbacks)
                        return callbacks.push(onLoad);

                    callCallbacks = function(err?: Error) {
                        callbacks.forEach(function(cb) {
                            cb(err);
                        });
                        (loadCallbacks[key] = []).push = function(...items: Function[]) {
                            Array.prototype.forEach.call(items, function(cb) {
                                cb(err);
                            });
                            return 0;
                        };
                    }

                    callbacks = loadCallbacks[key] = [onLoad];
                    if(inlineOrIntegrity !== true && source.indexOf("/") == -1) 
                        return callCallbacks(new Error(type[0].toUpperCase() + type.substring(1) + " `" + name + "` is required, but not included."));
                    
                    if (deps.length) {
                        var toLoad = deps.length;
                        deps.forEach(function(dep) {
                            NexusFrameworkLoaderImpl.loadResource(type, dep, function(err?: Error) {
                                if(err)
                                    callCallbacks(err);
                                else if(!--toLoad) {
                                    if(inlineOrIntegrity === true)
                                        processResource('data:'+contentType+';base64,' + base64(source));
                                    else
                                        processResource(source);
                                }
                            });
                        });
                    } else if(inlineOrIntegrity === true)
                        processResource('data:'+contentType+';base64,' + base64(source));
                    else
                        processResource(source);
                } catch(e) {
                    console.warn(e);
                    cb(e);
                }
            }
        } as NexusFrameworkLoader;
        Object.defineProperty(w, "NexusFrameworkLoader", {
            value: NexusFrameworkLoaderImpl
        });
    } catch(e) {
        showError(e);
    }
})(window);