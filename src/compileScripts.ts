import child_process = require("child_process");
import uglifyJs = require("uglify-js");
import uglifyEs = require("uglify-es");
import async = require("async");
import path = require("path");
import _ = require("lodash");
import fs = require("fs");
import os = require("os");

const cpus = os.cpus().length;
const tsc = require.resolve("typescript/bin/tsc");

const typeOptions = {
    "es5": ["--target", "ES5"],
    "es6": ["--target", "ES6"]
};

const compile = function(indir: string, outdir: string, cb: (err?: Error) => void, types = ["es5", "es6"]) {
    const sourcemap = indir === outdir;
    const options: any = {
        mangle: true,
        compress: true
    };
    if (sourcemap)
        indir = path.resolve(indir, "src");
    fs.readdir(indir, function(err: Error, files?: string[]) {
        if (err)
            return cb(err);
        const compileDir = function(typeOutDir: string, _type: string, cb: (err?: Error) => void) {
            async.eachLimit(files, cpus, function(tsRaw, cb) {
                if (!/\.ts$/.test(tsRaw)) {
                    console.log("Skipping", tsRaw);
                    return cb();
                }
                    
                const base = path.basename(tsRaw, ".ts");
                const minOut = base + ".min.js";
                const minOutJs = path.resolve(typeOutDir, minOut);
                const jsOut = path.resolve(typeOutDir, base + ".js");
                const tsIn = path.resolve(indir, tsRaw);
                
                var inmtime: number, outmtime: number;
                async.series([
                    function(cb) {
                        fs.stat(tsIn, function(err, stat) {
                            if (err)
                                return cb(err);
                            inmtime = stat.mtimeMs;
                            cb();
                        })
                    },
                    function(cb) {
                        fs.stat(minOutJs, function(err, stat) {
                            if (err) {
                                if (err.code === "ENOENT") {
                                    outmtime = 0;
                                    return cb();
                                }
                                return cb(err);
                            }
                            outmtime = stat.mtimeMs;
                            cb();
                        })
                    }
                ], function(err: Error) {
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
                    const child = child_process.fork(tsc, args, {stdio:"inherit"} as any);
                    child.on("exit", function(code, signal) {
                        if(signal)
                            return cb(new Error("Exited with signal " + signal));
                        if(code)
                            return cb(new Error("Exited with code " + code));

                        const uglify = _type === "es6" ? uglifyEs : uglifyJs;
                        console.log("uglify-js ", jsOut, minOut);
                        fs.readFile(jsOut, "utf8", function(err, code) {
                            if(err)
                                return cb(err);
                            const data: any = {};
                            data["../src/" + tsRaw] = code;
                            const _opts: any = sourcemap ? _.clone(options) : options;
                            const next = function() {
                                const output = uglify.minify(data as any, _opts);
                                err = output['error'];
                                if(err)
                                    return cb(err instanceof Error ? err : new Error(err));
                                if (sourcemap)
                                    output.code += "\n//# sourceMappingURL=" + base + ".min.js.map";
                                fs.writeFile(minOutJs, output.code, "utf8", function(err) {
                                    if(err)
                                        return cb(err);
                                    if (sourcemap)
                                        fs.writeFile(path.resolve(typeOutDir, base + ".min.js.map"), output.map, "utf8", cb);
                                    else
                                        cb();
                                });
                            }
                            if (sourcemap)
                                fs.readFile(path.resolve(typeOutDir, base + ".js.map"), "utf8", function(err, smap) {
                                    if (err)
                                        return cb(err);
                                    _opts.sourceMap = {
                                        content: smap,
                                        filename: base + ".min.js"
                                    };
                                    next(); 
                                });
                            else
                                fs.unlink(jsOut, function(err) {
                                    if (err)
                                        return cb(err);
                                    next();
                                });
                        });
                    });
                });
            }, cb);
        }
        if(types.length === 1)
            compileDir(outdir, types[0], cb);
        else
            async.eachSeries(types, function(_type, cb) {
                compileDir(path.resolve(outdir, _type), _type, cb);
            }, cb);
    });
}
export = compile;

if (require.main === module) {
    const scriptsDir = path.resolve(__dirname, "../scripts");
    compile(scriptsDir, scriptsDir, function(err?: Error) {
        if (err)
            throw err;
        else
            process.exit(0);
    });
}