@nodereq ws
@nodereq fs
@nodereq path
@nodereq events
@nodereq express
@nodereq underscore:_
@nodereq util

@target ES5

var dirpath = path.dirname(path.dirname(__dirname));
var pkgInfo:Object = require(path.resolve(dirpath, "package.json"));
var resPath = path.resolve(dirpath, "Resources");

class NexusFramework extends events.EventEmitter {
	public static version:number = pkgInfo.version;
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
    private _configFile;
    private _config;
    private _router;
    private _root;
    private _opts;
    
    constructor(rootDirectory, opts:Object = {}) {
        super();
        
        this._opts = opts;
        this._root = path.normalize(rootDirectory);
        this._configFile = path.resolve(this._root, "config.json");
        
        var self = this;
        if(!this._opts.noConfigWatch && !process.env.STATIC_HTTP_ROOT)
            fs.watchFile(this._configFile, function() {
                self.reloadConfig();
            });
        this.reloadConfig();
    }
    
    get config() {
        return this._config;
    }
    
    get router() {
        if(!("__router" in this))
            this.__router = this.createRouter();
        
        return this.__router;
    }
    
    public createRouter() {
        var self = this;
        return function(req) {
            if(!self._router) {// Postpone serving page until fully ready
                var paused;
                try {
                    paused = util.pause(req);
                } catch(e) {}
                self.on("routerinit", function() {
                    try {
                        paused.resume();
                    } catch(e) {}
                    self._router.apply(undefined, arguments);
                });
            } else
                self._router.apply(undefined, arguments);
        };
    }
    
    private _initRouter() {
        this._router = express();
        if(this._config.compression)
            this._router.use(require("compression")());
    }
    
    public reloadConfig() {
        var self = this;
        fs.readFile(this._configFile, function(err, data) {
            if(!self._router)
                self.emit("routerinit");
            self.emit("configupdate");
            
            try {
                if(err)
                    throw err;
                if(!data)
                    throw "No configuration file.";
            
                _.extend(self._config = {}, NexusFramework.defaults,
                            JSON.parse(data.toString()), self._opts);
            
                self._initRouter();
                self._router.use(function(req, res) {
                    throw new Error("404");
                });
                console.dir(self._config);
            } catch(e) {
                _.extend(self._config = {},
                    NexusFramework.defaults, self._opts);
                self._initRouter();
                
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