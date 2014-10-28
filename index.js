var typeinclude = require("typeinclude")(__dirname);
var express = require("express");
var path = require("path");
var fs = require("fs");

var classPath = [];
function scanPath(basepath) {
    fs.readdirSync(basepath).forEach(function(child) {
        var cPath = path.resolve(basepath, child);
        if(fs.lstatSync(cPath).isDirectory()) {
            scanPath(cPath);
            classPath.push(cPath);
        }
    });
}
scanPath(__dirname + path.sep + "modules");

var nexusframework = typeinclude("NexusFramework", classPath);
module.exports = function(rootDirectory, opts) {
    // Initialize a NexusFramework instance
    var frameworkInstance = new nexusframework(rootDirectory, opts);
    var router = frameworkInstance.router();
    
    // Map instance functions onto the router method
    for(var key in frameworkInstance) {
        var val = frameworkInstance[key];
        if(val instanceof Function) {
            router[key] = function() {
                return val.apply(frameworkInstance, arguments);
            };
        }
    };
    
    // Expose the underlying implementation
    router.impl = function() {
        return frameworkInstance;
    };
    return router;
};
module.exports.Framework = nexusframework;