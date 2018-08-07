"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
process.env.VERBOSE = "gears";
const nexusframework_1 = require("../src/nexusframework");
const socketio_client = require("socket.io-client");
//import phantomjs = require("phantomjs-prebuilt");
//import webdriverio = require("webdriverio");
const querystring = require("querystring");
const express = require("express");
const request = require("request");
const assert = require("assert");
const path = require("path");
const fs = require("fs");
require("mocha");
// TODO: Determine what is keeping mocha from exiting so we can remove "--exit"
const app = express();
//const wdOpts = { desiredCapabilities: { browserName: 'phantomjs' } }
/*function phantomrun(path: string, cb: (err: Error, client?: WebdriverIO.Client<WebdriverIO.RawResult<null>>, phantomjs?: any) => void) {
    phantomjs.run('--webdriver=4444').then(program => {
        const browser = webdriverio.remote(wdOpts).init();
        const url = 'http://localhost:35438' + path;
        cb(undefined, browser.url(url), program);
    }).catch(cb);
}*/
const aboutHtml = 'NexusFramework is a NodeJS Server framework, and is powering this website!';
const indexHtml = '<h1>Test</h1> <p>This is a test page for <a href="/:about/">NexusFramework</a>.</p> <ul><li><a href="/error">error</a> </li><li><a href="/maintenance">maintenance</a> </li><li><a href="/test.ext/">test.ext</a> </li><li><a href="/:scripts/es6/loader.min.js">Minified loader script</a> </li></ul><form enctype="multipart/form-data" method="POST" action="/post"><div class="form-group"><label for="exampleInputEmail1" class="bmd-label-floating">Email address</label> <input name="exampleInputEmail1" type="email" class="form-control" id="exampleInputEmail1" /><span class="bmd-help">We\'ll never share your email with anyone else.</span> </div><div class="form-group"><label for="exampleInputPassword1" class="bmd-label-floating">Password</label> <input name="exampleInputPassword1" type="password" class="form-control" id="exampleInputPassword1" /></div><div class="form-group"><label for="exampleSelect1" class="bmd-label-floating">Example select</label> <select name="exampleSelect1" class="form-control" id="exampleSelect1"><option>1</option> <option>2</option> <option>3</option> <option>4</option> <option>5</option> </select></div><div class="form-group"><label for="exampleSelect2" class="bmd-label-floating">Example multiple select</label> <select name="exampleSelect2" multiple="" class="form-control" id="exampleSelect2"><option>1</option> <option>2</option> <option>3</option> <option>4</option> <option>5</option> </select></div><div class="form-group"><label for="exampleTextarea" class="bmd-label-floating">Example textarea</label> <textarea name="exampleTextarea" class="form-control" id="exampleTextarea" rows="3"></textarea></div><div class="form-group"><label for="exampleInputFile" class="bmd-label-floating">File input</label> <input name="exampleInputFile" type="file" class="form-control-file" id="exampleInputFile" /><small class="text-muted">This is some placeholder block-level help text for the above input. It\'s a bit lighter and easily wraps to a new line.</small> </div><div class="radio"><label><input type="radio" name="optionsRadios" id="optionsRadios1" value="option1" checked="" />Option one is this and that&mdash;be sure to include why it\'s great </label></div><div class="radio"><label><input type="radio" name="optionsRadios" id="optionsRadios2" value="option2" />Option two can be something else and selecting it will deselect option one </label></div><div class="radio disabled"><label><input type="radio" name="optionsRadios" id="optionsRadios3" value="option3" disabled="" />Option three is disabled </label></div><div class="checkbox"><label><input name="checkMeOut" type="checkbox" />Check me out </label></div><button class="btn btn-default">Cancel</button> <button type="submit" class="btn btn-primary btn-raised">Submit</button> </form>';
var iopath;
var framework;
it("create and configure", function (cb) {
    framework = new nexusframework_1.NexusFramework(app);
    framework.enableLoader();
    framework.enableLogging();
    framework.mount("/", path.resolve(__dirname, "pages"), {
        iconfile: path.resolve(__dirname, "../icon.png"),
        styles: [
            {
                source: "//unpkg.com/bootstrap-material-design@4.1.1/dist/css/bootstrap-material-design.min.css"
            },
            {
                inline: true,
                source: "body{font-family:\"Lato\"}"
            }
        ],
        scripts: [
            {
                source: "nexusframeworkclient"
            },
            {
                source: "//code.jquery.com/jquery-3.2.1.slim.min.js"
            },
            {
                source: "//unpkg.com/popper.js@1.12.6/dist/umd/popper.js",
                dependencies: ["jquery"]
            },
            {
                source: "//unpkg.com/bootstrap-material-design@4.1.1/dist/js/bootstrap-material-design.min.js",
                dependencies: ["popper"]
            },
            {
                inline: true,
                source: "NexusFrameworkClient.initPageSystem({nopagesysio:true});",
                dependencies: ["bootstrap-material-design", "nexusframeworkclient"]
            }
        ],
        fonts: [
            "Lato",
            {
                name: "Lato",
                weight: 700
            }
        ]
    });
    framework.mount("/mutable", path.resolve(__dirname, "mutable"), { mutable: true });
    framework.mountScripts();
    framework.mountAbout();
    framework.setErrorDocument("*", "errdoc");
    iopath = framework.setupIO();
    app.use(function (req, res, next) {
        framework.__express(req, res, function (err) {
            if (err) {
                console.error(err);
                next(err);
            }
            else
                res.sendStatus(404);
        });
    });
    framework.pushMiddleware(function (req, res, next) {
        if (req.cookies.user)
            req.user = {
                id: 23,
                level: 200,
                email: "testy@nexustools.com",
                name: "Testy Tester"
            };
        next();
    }, true);
    framework.listen(35438, cb);
});
describe("request", function () {
    it("/ connect", function (cb) {
        request("http://localhost:35438/", function (err, res, body) {
            if (err)
                return cb(err);
            assert.equal(res.statusCode, 200);
            assert.equal(indexHtml, body);
            cb();
        });
    });
    it("/secure 403", function (cb) {
        request("http://localhost:35438/secure/", function (err, res, body) {
            if (err)
                return cb(err);
            assert.equal(res.statusCode, 403);
            cb();
        });
    });
    it("/secure 200", function (cb) {
        request("http://localhost:35438/secure/?user=test&pass=test", function (err, res, body) {
            if (err)
                return cb(err);
            assert.equal(res.statusCode, 200);
            cb();
        });
    });
    it("/secure/toaster 200", function (cb) {
        request("http://localhost:35438/secure/toaster?user=test&pass=test", function (err, res, body) {
            if (err)
                return cb(err);
            assert.equal(res.statusCode, 200);
            assert.deepEqual(JSON.parse(body), {
                sweet: true
            });
            cb();
        });
    });
    it("/:scripts/es5/loader.js", function (cb) {
        request("http://localhost:35438/:scripts/es5/loader.js", function (err, res, body) {
            if (err)
                return cb(err);
            assert.equal(res.statusCode, 200);
            fs.readFile(path.resolve(__dirname, "../scripts/es5/loader.js"), "utf8", function (err, script) {
                if (err)
                    cb(err);
                else {
                    assert.equal(body, script);
                    cb();
                }
            });
        });
    });
    it("/:about", function (cb) {
        request("http://localhost:35438/:about/", function (err, res, body) {
            if (err)
                return cb(err);
            console.log(body);
            assert.equal(res.statusCode, 200);
            assert.ok(body.indexOf(aboutHtml) > -1);
            cb();
        });
    });
    it("/fb30cf8e2673c51ea6547f1704f71c93/", function (cb) {
        request("http://localhost:35438/fb30cf8e2673c51ea6547f1704f71c93/", function (err, res, body) {
            if (err)
                return cb(err);
            assert.equal(res.statusCode, 200);
            assert.ok(body.indexOf("Yahaha! You found me!") > -1);
            assert.ok(body.indexOf("fb30cf8e2673c51ea6547f1704f71c93") > -1);
            cb();
        });
    });
    it("post /fb30cf8e2673c51ea6547f1704f71c93/", function (cb) {
        request.post("http://localhost:35438/fb30cf8e2673c51ea6547f1704f71c93/?key=FAU%28HQE%28*3qt", {
            formData: {
                tuna: 123456,
                test: "abc123",
                hornet: {
                    value: new Buffer([0, 1, 2, 3, 4, 5]),
                    options: {
                        filename: "Farmer John.bin"
                    }
                }
            }
        }, function (err, res, body) {
            if (err)
                return cb(err);
            assert.equal(res.statusCode, 200);
            assert.ok(body.indexOf("Yahaha! You found me!") > -1);
            assert.ok(body.indexOf("Shh... its a secret... [\"hornet\"]") > -1);
            cb();
        });
    });
});
var client;
describe("socket.io", function () {
    it("/:io connect", function (cb) {
        client = socketio_client("http://localhost:35438", {
            path: iopath
        });
        client.on("connect", function () {
            cb();
        });
        client.on("connect_error", function (err) {
            client.close();
            cb(err);
        });
    });
    it("io.emit(\"GET\", \"page\", \"/\", undefined)", function (cb) {
        client.emit("page", "GET", "/", undefined, { "user-agent": "Testorola" }, function (res) {
            assert.equal(res.code, 200);
            assert.equal(indexHtml, res.data);
            cb();
        });
    });
    it("io.emit(\"GET\", \"page\", \"/cookie\", undefined)", function (cb) {
        client.emit("page", "GET", "/cookie", undefined, { "user-agent": "Testorola" }, function (res) {
            assert.equal(res.code, 200);
            assert.equal(true, res.data);
            cb();
        });
    });
    it("custom paths", function (cb) {
        const data = 4327123;
        framework.mountHandler("/tuna/fish/parade", function (req, res) {
            res.json(data);
        });
        client.emit("page", "GET", "/tuna/fish/parade", undefined, { "user-agent": "Testorola" }, function (res) {
            assert.equal(res.code, 200);
            assert.equal(data, res.data);
            cb();
        });
    });
});
describe("Skeleton", function () {
    it("skeleton", function (cb) {
        framework.setSkeleton(path.resolve(__dirname, "skeleton.nhp"));
        request("http://localhost:35438/", function (err, res, body) {
            if (err)
                return cb(err);
            console.log(body);
            assert.equal(res.statusCode, 200);
            assert.ok(body.indexOf("This is a test page for") > -1);
            assert.ok(body.indexOf("<title>Test</title>") > -1);
            cb();
        });
    });
    it("skeleton bodyclass", function (cb) {
        request("http://localhost:35438/404", function (err, res, body) {
            if (err)
                return cb(err);
            assert.equal(res.statusCode, 404);
            assert.ok(/<body[^>]+class=\"error-page error-404\"/.test(body));
            cb();
        });
    });
});
describe("Mutable", function () {
    it("request /mutable/", function (cb) {
        request("http://localhost:35438/mutable/", function (err, res, body) {
            if (err)
                return cb(err);
            assert.equal(res.statusCode, 404);
            cb();
        });
    });
    /*const data = JSON.stringify({
        tuna: 312,
        farmer: "Yellow"
    });
    it("create index.js and request /mutable/", function(cb) {
        fs.writeFile(path.resolve(__dirname, "mutable/index.js"), "module.exports = function(req, res){res.json(" + data + ");}", function(err) {
            if (err)
                cb(err);
            else
                setTimeout(function() {
                    request("http://localhost:35438/mutable/", function(err, res, body) {
                        if(err)
                            return cb(err);
                        assert.equal(res.statusCode, 200);
                        assert.equal(body, data);
                        cb();
                    });
                }, 500);
        });
    });*/
});
describe("Redirects", function () {
    it("request /:about", function (cb) {
        request("http://localhost:35438/:about", { followRedirect: false }, function (err, res, body) {
            if (err)
                return cb(err);
            assert.equal(res.statusCode, 302);
            assert.equal(res.headers['location'], "/:about/");
            cb();
        });
    });
    /*it("request /mutable", function(cb) {
        request("http://localhost:35438/mutable", {followRedirect:false}, function(err, res, body) {
            if(err)
                return cb(err);
            assert.equal(res.statusCode, 302);
            assert.equal(res.headers['location'], "/mutable/");
            cb();
        });
    });*/
});
describe("more socket.io", function () {
    it("pagesysskeleton", function (cb) {
        framework.setPageSystemSkeleton(function (template, options, req, res, next) {
            res.render(template, options, function (err, html) {
                if (err)
                    next(err);
                else {
                    next(undefined, {
                        title: res.locals.title,
                        page: html
                    });
                }
            });
        });
        client.emit("page", "GET", "/", undefined, { "user-agent": "Testorola" }, function (res) {
            assert.equal(res.code, 200);
            assert.equal(JSON.stringify(res.data), JSON.stringify({ title: "Test", page: indexHtml }));
            framework.setPageSystemSkeleton(undefined);
            cb();
        });
    });
});
describe("post", function () {
    const data = {
        test: true,
        farmers: [0, 1, 2, 3],
        cheese: "swiss"
    };
    it("request urlencoded", function (cb) {
        const query = querystring.stringify(data);
        request.post("http://localhost:35438/post", {
            headers: { 'content-type': 'application/x-www-form-urlencoded' },
            body: query
        }, function (err, res, body) {
            if (err)
                return cb(err);
            assert.equal(res.statusCode, 200);
            assert.ok(body.indexOf(JSON.stringify(querystring.parse(query))) > -1);
            cb();
        });
    });
    it("request json", function (cb) {
        const json = JSON.stringify(data);
        request.post("http://localhost:35438/post", {
            headers: { 'content-type': 'text/json' },
            body: json
        }, function (err, res, body) {
            if (err)
                return cb(err);
            assert.equal(res.statusCode, 200);
            assert.ok(body.indexOf(json) > -1);
            cb();
        });
    });
    it("request /", function (cb) {
        const json = JSON.stringify(data);
        request.post("http://localhost:35438/", {
            headers: { 'content-type': 'text/json' },
            body: json
        }, function (err, res, body) {
            if (err)
                return cb(err);
            assert.equal(res.statusCode, 403);
            cb();
        });
    });
});
//it("close()", function(cb) {
//    client.disconnect();
//    framework.close(cb);
//})
/*phantomrun("/secure/", function(err, client, phantomjs) {
    if(err)
        return cb(err);

    client.getSource().then(function(html) {
        console.log(html);
        phantomjs.kill();
    }).catch(function(err) {
        phantomjs.kill();
        cb(err);
    });
});*/
//# sourceMappingURL=tests.js.map