"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process = require("child_process");
const uglifyJs = require("uglify-js");
const uglifyEs = require("uglify-es");
const async = require("async");
const path = require("path");
const fs = require("fs");
const scriptsDir = path.resolve(__dirname, "scripts");
async.eachSeries(['es5', 'es6'], function (dir, cb) {
    const scripts = path.resolve(scriptsDir, dir);
    console.log("tsc -p ", scripts);
    const child = child_process.fork(path.resolve(__dirname, "node_modules/ntypescript/bin/tsc"), ['-p', scripts]);
    child.on("exit", function (code, signal) {
        if (signal)
            return cb(new Error("Exited with signal " + signal));
        if (code)
            return cb(new Error("Exited with code " + code));
        fs.readdir(scripts, function (err, files) {
            if (err)
                return cb(err);
            async.eachSeries(files, function (file, cb) {
                if (!/\.js$/.test(file) || /\.min\.js$/.test(file))
                    return cb();
                const filename = path.resolve(scripts, file);
                const base = path.basename(file, ".js");
                const sourceMapFile = base + ".min.js.map";
                const outFile = base + ".min.js";
                const options = {
                    mangle: true,
                    compress: true,
                    sourceMap: {
                        filename: outFile,
                        content: "inline",
                        url: sourceMapFile
                    }
                };
                const uglify = dir === "es6" ? uglifyEs : uglifyJs;
                console.log("uglify-js ", filename, outFile);
                fs.readFile(filename, "utf8", function (err, code) {
                    if (err)
                        return cb(err);
                    var input = {};
                    input[file] = code;
                    const output = uglify.minify(input, options);
                    if (output['error'])
                        return cb(output['error']);
                    fs.writeFile(path.resolve(scripts, outFile), output.code, "utf8", function (err) {
                        if (err)
                            return cb(err);
                        fs.writeFile(path.resolve(scripts, sourceMapFile), output.map, "utf8", cb);
                    });
                });
            }, cb);
        });
    });
}, function (err) {
    if (err)
        console.error(err);
});
//# sourceMappingURL=compileScripts.js.map