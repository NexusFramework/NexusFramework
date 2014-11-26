var consolidate = require("consolidate");
var express = require("express");
var lodash = require("lodash");
var async = require("async");
var path = require("path");
var nhp = require("nhp");
var fs = require("fs");

// Inject NHP into possible page engines
consolidate.nhp = nhp.__express;

var first = true;
var skip = /^clearCache$/;
var view = "^([^\.]+)\.(";
// Map engine names onto view file regex
for(var key in consolidate) {
    if(skip.test(key))
        continue; // Skip
    
    if(first)
        first = false;
    else
        view += "|";
    view += key;
}
view = new RegExp(view + ")$", "i");

// model detection, defaults to get
var staticmodel = /^([^\.]+)\.json$/;
var model = /^([^\.]+)(?:\.(get|put|post|delete))?\.js$/;
module.exports = function(config, next, service) {
    var root = path.resolve(config.root || process.cwd());
    
    var constants = config.constants || {};
    if(config.body)
        constants.body = path.resolve(root, config.body);
    else
        constants.body = path.resolve(__dirname, "resources", "body.nhp");
    
    var nhpi = nhp = new nhp(constants);
    
    var skeleton;
    if(config.skeleton)
        skeleton = nhpi.template(root, config.skeleton);
    else
        skeleton = nhpi.template(path.resolve(__dirname, "resources", "skeleton.nhp"));
    
    var pages;
    if(config.pages)
        pages = path.resolve(root, config.pages);
    else {
        if(config.root)
            pages = root;
        else
            pages = path.resolve(root, "src");
    }
    // TODO: Register other layout engines into custom NHP <?render?> method
    
    var scanPages = function() {
        var genRoute = function(dir, next) {
            fs.readdir(dir, function(err, files) {
                if(err)
                    return next(err);

                var mapping = {};
                var map = function(key) {
                    if(!(key in mapping))
                        return mapping[key] = {
                            models: {}
                        };
                    
                    return mapping[key];
                }
                
                async.each(files, function(file, next) {
                    var full = path.resolve(dir, file);
                    fs.stat(full, function(err, stat) {
                        if(err)
                            return next(err);
                        
                        if(stat.isDirectory()) {
                            genRoute(full, function(err, router) {
                                if(err)
                                    return next(err);
                                
                                mapping[file] = {
                                    router: router
                                }
                                next();
                            });
                            
                            return;
                        }
                        
                        var match = file.match(model);
                        if(match) {
                            map(match[1]).models[match[2] || "get"] = full;
                            return next();
                        }
                        match = file.match(staticmodel);
                        if(match) {
                            map(match[1]).constants = require(full);
                            return next();
                        }
                        match = file.match(view);
                        if(match) // file, renderer
                            map(match[1]).view = [full, match[2]];
                        next();
                    });
                }, function(err) {
                    if(err)
                        return next(err);
                    
                    var router = express.Router();
                    for(var key in mapping) {
                        var map = mapping[key];
                        if(key == "index")
                            key = "";
                        
                        key = "/" + key;
                        if("router" in map)
                            router.use(key, map.router);
                        else {
                            (function(statics) {
                                for(var method in map.models) {
                                    (function(view, model, method) {
                                        try {
                                            var modelInst = require(model);
                                            router[method](key, function(req, res, next) {
                                                try {
                                                    modelInst(req, res, function(err, context) {
                                                        if(err)
                                                            return next(err);

                                                        if(statics) {
                                                            console.log("Adding statics");
                                                            var pageconsts = {};
                                                            lodash.extend(pageconsts, statics);
                                                            if(context)
                                                                lodash.extend(pageconsts, context);
                                                            context = pageconsts;
                                                        } else
                                                            context = context || {};
                                                        context.page = view[0];

                                                        console.dir(context);
                                                        skeleton.run(context, res, function(err) {
                                                            if(err) 
                                                                return next(err);

                                                            try {
                                                               res.end();
                                                            } catch(e) {}
                                                        });
                                                    }, constants, service);
                                                } catch(e) {
                                                    next(e);
                                                }
                                            });
                                        } catch(e) {
                                            next(e);
                                        }
                                    })(map.view, map.models[method], method);
                                }
                            })(map.constants);
                        }
                    }
                    
                    next(null, router);
                });
            });
        };
        genRoute(pages, next);
    };
    
    // Wait for skeleton to compile if it isn't before generating the routes
    if(skeleton.isCompiled)
        scanPages();
    else {
        // FIX: Its possible for compiled to be called after error if the file changes after the first error...
        skeleton.once("error", next);
        skeleton.once("compiled", scanPages);
    }
}