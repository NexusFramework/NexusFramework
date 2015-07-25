[![Package Version](https://img.shields.io/npm/v/nexusframework.svg)](https://www.npmjs.org/package/nexusframework) [![Build Status](https://travis-ci.org/NexusTools/NexusFrameworkJS.svg)](https://travis-ci.org/NexusTools/NexusFrameworkJS) [![Coverage Status](https://img.shields.io/coveralls/NexusTools/NexusFrameworkJS.svg)](https://coveralls.io/r/NexusTools/NexusFrameworkJS) [![Apache License 2.0](https://img.shields.io/badge/license-APACHE2-blue.svg)](https://www.apache.org/licenses/LICENSE-2.0.html) [![Gratipay Tips](https://img.shields.io/gratipay/NexusTools.svg)](https://gratipay.com/NexusTools/)

NexusFrameworkJS
================
NetGate handler which uses a NHP skeleton system to provide a website templating system, compatible with other express rendering engines for the page content.
Scans the page structure and generates very efficient routes.

Explanation
-----------
The page structure:
```
 - pages
   - index.nhp
   - index.json
   - login.nhp
   - login.post.js
   - login.js
   - profile
     - *.js
     - *.nhp
```

translates into something like

``` javascript
app.get("/", /* nhp skeleton renderer using req and index.json for constants */);
app.get("/login", /* nhp skeleton renderer using req and login.json for constants */);

var loginPost = require("login.post.js");
app.post("/login", function(req, res, next) {
  var constants = loginPost(req, res, function(err, pagecontext) {
    if(err) return next(err);
    if(!pagecontext) return next();
    /* nhp skeleton renderer using pagecontext merged with constants and req */
  }, constants /* constants from config of handler */, service /* NetGate service controller */);
});

var profileRouter = express.Router();
var profileAstrixGet = require("*.js");
profileRouter.post("/*", function(req, res, next) {
  var constants = profileAstrixGet(req, res, function(err, pagecontext) {
    if(err) return next(err);
    if(!pagecontext) return next();
    /* nhp skeleton renderer using pagecontext merged with constants and req */
  }, constants /* constants from config of handler */, service /* NetGate service controller */);
});
app.use("/profile", profileRouter);
```

This makes the process of configuring express's routes extremely simply by allowing a page structure to generate them for you, and uses express' routers to allow migrating the code between folders very easy since /profile/someuser would have the req.url set to /someuser in *.js

Other Renderers
---------------
Support for using other rendering engines for the page content is being worked on.
Any engines provided by consolidatejs will be supported, and detected automatically by the file extension of the view for any page.
In other words, index.jade instead of index.nhp will use jade instead of nhp to render the page content!

Legal
=====
NexusFrameworkJS is licensed under [Apache License V2](LICENSE.md)
