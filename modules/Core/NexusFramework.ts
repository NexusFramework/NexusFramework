@nodereq fs
@nodereq path
@nodereq events
@nodereq express
@nodereq websocket
@nodereq underscore:_
@nodereq async
@nodereq util
@nodereq url

@include ThemeRegistry
@include PageModule
@include Theme

var dirpath = path.dirname(path.dirname(__dirname));
var pkg:Object = require(path.resolve(dirpath, "package.json"));
var resPath = path.resolve(dirpath, "Resources");

class NexusFramework extends events.EventEmitter {
	public static version:number = pkg.version;
    private static defaults:any = {
        // Site name
        Name: "Untitled",
        // Add compression to express
        Compression: false,
        // Site theme
        Theme: "Simple Light",
        // Whether or not to trust proxies
        BehindProxy: "HTTP_PROXIED" in process.env,
        // A list of trusted IPs or URLs to lists of trusted IPs.
        TrustedIPs: [],
        // Extensions to load and optionally configuration
        Extensions: {
            /*
            CloudFlare: {
                "apikey": "" // Your API key
            }
            GoogleAnalytics: {
                "code": "UA-XXXXXX-X",
                "domain": "somewhere.com"
            }
            */
        },
        PageModule: {
            // Whether to show 404 pages or just call next() when available
            ShowNotFound: true,
            // Whether or not to pretend 403 errors are actually 404
            InvisiblePermissions: false,
            // Title format for pages
            TitleFormat: "{{PageModule.Title}} | {{Config.Name}}",
            // Page title when non has been set
            DefaultPageTitle: " -- Title not set -- "
        }
    };
    private static _resourceThemes:ThemeRegistry = new ThemeRegistry(resPath);
    private _themes:ThemeRegistry;
    private _theme:Theme;
    
    private _wsServer;
    private _configFile:String;
    private _config:Object;
    
    private _root:String;
    private _opts:Object;
    private _router:Function;
    
    constructor(rootDirectory, opts:Object = {}) {
        super();
        this._wsServer = new websocket.server();
        this._wsServer.on('request', function(request) {
            /*if (!originIsAllowed(request.origin)) {
              // Make sure we only accept requests from an allowed origin
              request.reject();
              console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
              return;
            }*/

            var connection = request.accept('echo-protocol', request.origin);
            console.log((new Date()) + ' Connection accepted.');
            connection.on('message', function(message) {
                if (message.type === 'utf8') {
                    console.log('Received Message: ' + message.utf8Data);
                    connection.sendUTF(message.utf8Data);
                }
                else if (message.type === 'binary') {
                    console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
                    connection.sendBytes(message.binaryData);
                }
            });
            connection.on('close', function(reasonCode, description) {
                console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
            });
        });
        
        this._opts = opts;
        this._root = path.normalize(rootDirectory);
        this._themes = new ThemeRegistry(this._root, NexusFramework._resourceThemes);
        this._configFile = path.resolve(this._root, "config.json");
        
        var self = this;
        if(!this._opts.noConfigWatch && !process.env.STATIC_HTTP_ROOT)
            fs.watchFile(this._configFile, function() {
                self.reloadConfig();
            });
        this.reloadConfig();
    }
    
    public get(key:String) {
        var value = this._config;
        key.split("/").forEach(function(part) {
            value = value[part];
        });
        return value;
    }
    
    public set(key:String, value:any) {
        var node = this._opts;
        var parts = key.split("/");
        key = parts.splice(key.length-1, 1)[0];
        parts.forEach(function(part) {
            var next = node[part];
            if(next === undefined || next === null)
                next = node[part] = {};
            node = next;
        });
        node[key] = value;
        if(this._config) { // Quick patch the config
            _.extend(this._config, this._opts);
            self._router = undefined;
            self.emit("configupdate");
        }
    }
    
    public router() {
        if(!("__router" in this))
            this.__router = this.createRouter();
        
        return this.__router;
    }
    
    public createRouter() {
        var self = this;
        return function(req) {
            if(!self._config) {// Postpone serving page until fully ready
                var _this = this;
                self.once("configinit", function() {
                    if(!self._router)
                        self._initRouter();
                    self._router.apply(_this, arguments);
                });
            } else {
                if(!self._router)
                    self._initRouter();
                self._router.apply(this, arguments);
            }
        };
    }
    
    public resolvePage(path:String):PageModule {
    }
    
    public directoryRouter() {
        if(!this.__directoryRouter)
            this.__directoryRouter = this.createDirectoryRouter();
        return this.__directoryRouter;
    }

    public static parseUrl(_url:String) {
        var parsed = url.parse(_url);
        parsed.origpath = parsed.pathname;
        parsed.pathname = path.normalize(parsed.pathname);
        if(parsed.pathname.endsWith("/") && parsed.pathname.length > 1)
            parsed.pathname = parsed.pathname.substring(0, parsed.pathname.length-1);
        parsed.path = parsed.pathname + (parsed.search || "");
        return parsed;
    }

    public headers() {
        return function(req, res, next) {
            res.set("X-Framework", "NexusFramework/" + NexusFramework.version);
            next();
        }
    }
    
    public createDirectoryRouter(prefix:String = "/media", directory:String = "./media") {
        directory = path.resolve(this._root, directory);
        prefix = path.normalize(prefix);
        return function(req, res, next) {
            if(!req.url.startsWith(prefix)) {
                next();
                return;
            }
            if(!req._urlparts)
                req._urlparts = NexusFramework.parseUrl(req.url);
            var pathname = req._urlparts.pathname.substring(prefix.length+1);
            var _path = path.resolve(directory, pathname);
            fs.stat(_path, function(err, stat) {
                if(err || !stat) {
                    next();
                    return;
                } else if(stat.isDirectory())
                    fs.readdir(_path, function(err, files) {
                        var body = "<html><head><title>Directory Listing</title></head>";
                        body += "<body><h1>Directory Listing: ";
                        if(req._urlparts.pathname.endsWith("/"))
                            req._urlparts.pathname = req._urlparts.pathname.substring(0,
                                                        req._urlparts.pathname.length -1);
                        body += req._urlparts.pathname;
                        body += "</h1><table><tr><th></th><th align=\"left\">Filename</th><th align=\"left\">Mimetype</th>";
                        body += "<th align=\"left\">Last Modified</th><th align=\"left\">Size</th></tr>";
                        
                        var fileData = [{
                            icon: "folder",
                            mimetype: "inode/directory",
                            list: []
                        },{
                            list: []
                        },{
                            icon: "error",
                            list: []
                        }];
                        async.each(files, function(file, callback) {
                            var child = path.resolve(_path, file);
                            fs.stat(child, function(err, stat) {
                                try {
                                    if(err)
                                        throw err;
                                    if(stat.isDirectory())
                                        fileData[0].list.push({
                                            name: file,
                                            href: path.resolve(req._urlparts.pathname, file)
                                        });
                                    else {
                                        var icon = "unknown";
                                        var canPreview = false;
                                        var mimetype = "application/binary";
                                        // TODO: Obtain mimetype information
                                            
                                        fileData[1].list.push({
                                            name: file,
                                            "icon": icon,
                                            "mimetype": mimetype,
                                            href: path.resolve(req._urlparts.pathname, file)
                                        });
                                    }
                                } catch(e) {
                                    fileData[2].list.push({
                                        name: file,
                                        mimetype: String(e),
                                        href: path.resolve(req._urlparts.pathname, file)
                                    });
                                }
                                
                                callback();
                            });
                        }, function(err) {
                            fileData[0].list.sort();
                            fileData[1].list.sort();
                            fileData[2].list.sort();
                            fileData.forEach(function(files) {
                                files.list.forEach(function(file) {
                                    body += "<tr><td></td><td><a href=\"";
                                    body += file.href;
                                    body += "\">";
                                    body += file.name;
                                    body += "</td><td>";
                                    body += files.mimetype || file.mimetype;
                                    body += "</td></tr>";
                                });
                            });
                            body += "</table></body></html>";
                            
                            res.writeHead(200, {
                                "Content-Type": "text/html",
                                "Content-Length": body.length
                            });
                            res.end(body);
                        });
                    });
                else
                    res.render(_path);
                
            });
        };
    }
    
    public pagePreprocessor() {
        if(!this.__pagePreprocessor)
            this.__pagePreprocessor = this.createPagePreprocessor();
        return this.__pagePreprocessor;
    }
    
    public createPagePreprocessor(prefix:String = "/") {
        return function(req, res, next) {
            var _url = req._urlparts || NexusFramework.parseUrl(req.url);
            req.pagemodule = {
                title: "Resource not Found",
                url: _url,
                error: {
                    code: 404,
                    message: "Resource not Found",
                    description: "The resource `" + _url.pathname + "` does not exist or could not be found at this time."
                }
            };
            next();
        };
    }
    
    public pageRouter() {
        if(!this.__pageRouter)
            this.__pageRouter = this.createPageRouter();
        return this.__pageRouter;
    }
    
    public createPageRouter(prefix:String = "/") {
        var self = this;
        var __preprocessor;
        return function(req, res, next) {
            if(!("pagemodule" in req)) {
                if(!__preprocessor)
                    __preprocessor = self.createPagePreprocessor(prefix);
                __preprocessor.apply(this, arguments);
            }
            next();
        };
    }
    
    public errorRouter() {
        if(!this.__errorRouter)
            this.__errorRouter = this.createErrorRouter();
        return this.__errorRouter;
    }
    
    public createErrorRouter() {
        return function(req, res, next) {
            if(req.pagemodule.error) {
                var body = "<h1>" + req.pagemodule.error.message + "</h1><p>";
                body += req.pagemodule.error.description + "</p>";
                
                res.writeHead(req.pagemodule.error.code, req.pagemodule.error.message, {
                    "Content-Type": "text/html",
                    "Content-Length": body.length
                });
                res.end(body);
            } else
                next();
        };
    }
    
    private _initRouter() {
        try {
            this._wsServer.unmount({
                httpServer: this._router
            });
        } catch(e) {}
        this._router = express();
        try {
            this._wsServer.mount({
                httpServer: this._router
            });
        } catch(e) {}
        
        if(this._config.compression)
            this._router.use(require("compression")());
        
        this._router.use(this.headers());
        this._router.use(this.directoryRouter());
        this._router.use(this.pagePreprocessor());
        this._router.use(this.pageRouter());
        this._router.use(this.errorRouter());
    }
    
    public reloadConfig() {
        var self = this;
        this._apiRouter = undefined;
        this._mediaRouter = undefined;
        fs.readFile(this._configFile, function(err, data) {
            if(!self._config)
                self.emit("configinit");
            self.emit("configupdate");
            
            try {
                if(err)
                    throw err;
                if(!data)
                    throw "No configuration file.";
                
                _.extend(self._config = {}, NexusFramework.defaults,
                            JSON.parse(data.toString()), self._opts);
            
                self._router = undefined;
            } catch(e) {
                _.extend(self._config = {},
                    NexusFramework.defaults, self._opts);
                
                self._router = express();
                if(e.code == "ENOENT")
                    self._router.use(function(req, res, next) {
                        throw new Error("Installer not done yet.");
                    });
                else
                    self._router.use(function(req, res, next) {
                        throw e;
                    });
            }
        });
    }
    
    public listen(port, opts = {}) {
        var httpServer = require("http").createServer(app);
        httpServer.listen(port, opts.hostname);
        return httpServer;
    }
    
}

@main NexusFramework