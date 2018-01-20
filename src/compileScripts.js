"use strict";
const child_process = require("child_process");
const uglifyJs = require("uglify-js");
const uglifyEs = require("uglify-es");
const async = require("async");
const path = require("path");
const _ = require("lodash");
const fs = require("fs");
const os = require("os");
const cpus = os.cpus().length;
const tsc = require.resolve("typescript/bin/tsc");
const typeOptions = {
    "es5": ["--target", "ES5"],
    "es6": ["--target", "ES6"]
};
const compile = function (indir, outdir, cb, types = ["es5", "es6"]) {
    const sourcemap = indir === outdir;
    const options = {
        mangle: true,
        compress: true
    };
    if (sourcemap)
        indir = path.resolve(indir, "src");
    fs.readdir(indir, function (err, files) {
        if (err)
            return cb(err);
        const compileAll = function (typeOutDir, cb) {
            async.eachLimit(files, cpus, function (tsRaw, cb) {
                if (!/\.ts$/.test(tsRaw)) {
                    console.log("Skipping", tsRaw);
                    return cb();
                }
                const base = path.basename(tsRaw, ".ts");
                const minOut = base + ".min.js";
                const minOutJs = path.resolve(typeOutDir, minOut);
                const jsOut = path.resolve(typeOutDir, base + ".js");
                const tsIn = path.resolve(indir, tsRaw);
                var inmtime, outmtime;
                async.series([
                    function (cb) {
                        fs.stat(tsIn, function (err, stat) {
                            if (err)
                                return cb(err);
                            inmtime = stat.mtimeMs;
                            cb();
                        });
                    },
                    function (cb) {
                        fs.stat(minOutJs, function (err, stat) {
                            if (err) {
                                if (err.code === "ENOENT") {
                                    outmtime = 0;
                                    return cb();
                                }
                                return cb(err);
                            }
                            outmtime = stat.mtimeMs;
                            cb();
                        });
                    }
                ], function (err) {
                    if (err)
                        return cb(err);
                    if (outmtime >= inmtime)
                        return cb();
                    const args = ["--module", "AMD", "--out", jsOut];
                    const opts = typeOptions[_type];
                    if (sourcemap)
                        args.push("--sourceMap", "true");
                    if (opts)
                        args.push.apply(args, opts);
                    args.push(tsIn);
                    console.log("Compiling", tsIn);
                    const child = child_process.fork(tsc, args, { stdio: "inherit" });
                    child.on("exit", function (code, signal) {
                        if (signal)
                            return cb(new Error("Exited with signal " + signal));
                        if (code)
                            return cb(new Error("Exited with code " + code));
                        const uglify = _type === "es6" ? uglifyEs : uglifyJs;
                        console.log("uglify-js ", jsOut, minOut);
                        fs.readFile(jsOut, "utf8", function (err, code) {
                            if (err)
                                return cb(err);
                            const data = {};
                            data["../src/" + tsRaw] = code;
                            const _opts = sourcemap ? _.clone(options) : options;
                            const next = function () {
                                const output = uglify.minify(data, _opts);
                                err = output['error'];
                                if (err)
                                    return cb(err instanceof Error ? err : new Error(err));
                                if (sourcemap)
                                    output.code += "\n//# sourceMappingURL=" + base + ".min.js.map";
                                fs.writeFile(minOutJs, output.code, "utf8", function (err) {
                                    if (err)
                                        return cb(err);
                                    if (sourcemap)
                                        fs.writeFile(path.resolve(typeOutDir, base + ".min.js.map"), output.map, "utf8", cb);
                                    else
                                        cb();
                                });
                            };
                            if (sourcemap)
                                fs.readFile(path.resolve(typeOutDir, base + ".js.map"), "utf8", function (err, smap) {
                                    if (err)
                                        return cb(err);
                                    _opts.sourceMap = {
                                        content: smap,
                                        filename: base + ".min.js"
                                    };
                                    next();
                                });
                            else
                                fs.unlink(jsOut, function (err) {
                                    if (err)
                                        return cb(err);
                                    next();
                                });
                        });
                    });
                });
            }, cb);
        };
        if (types.length === 1)
            compileAll(outdir, cb);
        else
            async.eachSeries(types, function (_type, cb) {
                compileAll(path.resolve(outdir, _type), cb);
            }, cb);
    });
};
if (require.main === module) {
    const scriptsDir = path.resolve(__dirname, "../scripts");
    compile(scriptsDir, scriptsDir, function (err) {
        if (err)
            throw err;
        else
            process.exit(0);
    });
}
module.exports = compile;
//# sourceMappingURL=compileScripts.js.map