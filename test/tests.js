"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
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
const aboutHtml = 'NexusFramework is a NodeJS Server framework compatible with ExpressJS, and is powering this website!</p> <p>It uses TypeScript, ExpressJS and Socket.IO to provide a rich API and deep control,<br /> and a page loading system that uses ajax or socket.io (when available) to dynamically load content!</p> <p>Check it out <a href="https://nexustools.com/projects/nexusframework/nodejs">on NexusTools</a> or <a href="https://github.com/NexusTools/NexusFrameworkJS">on GitHub</a>.';
const indexHtml = "<h1>Test</h1> <p>This is a test page for <a href=\"/:about/\">NexusFramework</a>.<br /> <a href=\"/:scripts/es6/loader.min.js\">Minified loader script</a>.</p>";
var iopath;
var framework;
it("create and configure", function (cb) {
    framework = new nexusframework_1.NexusFramework(app);
    framework.enableLoader();
    framework.enableLogging();
    framework.mount("/", path.resolve(__dirname, "pages"));
    framework.mount("/mutable", path.resolve(__dirname, "mutable"), false);
    framework.mountScripts();
    framework.mountAbout();
    framework.dumpRoot();
    framework.use(function (req, res, next) {
        res.addNexusFrameworkClient();
        res.addGoogleFont("Lato", 400);
        res.addGoogleFont("Lato", 700);
        res.addScript("https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.min.js", "3.2.1");
        res.addScript("https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.12.9/umd/popper.min.js", "1.12.9", "jquery");
        res.addStyle("https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0-beta.2/css/bootstrap.min.css", "4.0.0-beta.2");
        res.addScript("https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0-beta/js/bootstrap.min.js", "4.0.0-beta.2", "jquery", "popper");
        res.addInlineStyle("body{font-family:\"Lato\"}");
        res.addInlineScript("$(\".modal\").modal();NexusFramework.initPageSystem();", "bootstrap");
        res.locals.progressContainerHead = '<div class="loader-progress-heading">NexusFramework Test<br /><small>Loading Please Wait</small></div>';
        next();
    });
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
            assert.equal(res.statusCode, 200);
            assert.ok(body.indexOf(aboutHtml));
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
        framework.setHandler("/tuna/fish/parade", function (req, res) {
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
            assert.equal(res.statusCode, 200);
            assert.ok(/This is a test page for .+NexusFramework\./.test(body));
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
            assert.equal(JSON.stringify(res.data), '{"title":"Title Not Set","page":"<h1>Test</h1> <p>This is a test page for <a href=\\"/:about/\\">NexusFramework</a>.<br /> <a href=\\"/:scripts/es6/loader.min.js\\">Minified loader script</a>.</p>"}');
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