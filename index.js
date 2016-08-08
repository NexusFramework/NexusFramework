var consolidate = require("consolidate");
var argwrap = require("argwrap");
var express = require("express");
var async = require("async");
var path = require("path");
var _ = require("lodash");
var nhp = require("nhp");
var url = require("url");
var fs = require("fs");

// Inject NHP into possible page engines
consolidate.nhp = nhp.__express;

var first = true;
var skip = /^clearCache$/;
var view = "^([^\.]+)\.(";
// Map engine names onto view file regex
for (var key in consolidate) {
	if (skip.test(key))
		continue; // Skip

	if (first)
		first = false;
	else
		view += "|";
	view += key;
}
view = new RegExp(view + ")$", "i");

var disableExposure = !!process.env.NO_EXPOSURE;
var disableRequestType = disableExposure || !!process.env.NO_REQUEST_TYPE;
var disableTemplateSource = disableExposure || !!process.env.NO_TEMPLATE_SOURCE;

// model detection, defaults to get
var staticmodel = /^([^\.]+)\.json$/;
var model = /^([^\.]+)(?:\.(get|put|post|delete))?\.js$/;
module.exports = function (config, service, logger, next) {
	var root = path.resolve(config.root || process.cwd());

	var constants = config.constants || {};
	if (config.body)
		constants.body = path.resolve(root, config.body);
	else
		constants.body = path.resolve(__dirname, "resources", "body.nhp");

	var errordoc = config.errordoc;
	var nhpi = nhp = new nhp(constants);

	var skeleton;
	if (config.skeleton)
		skeleton = nhpi.template(path.resolve(root, config.skeleton));
	else
		skeleton = nhpi.template(path.resolve(__dirname, "resources", "skeleton.nhp"));

	var pages;
	if (config.pages)
		pages = path.resolve(root, config.pages);
	else {
		if (config.root)
			pages = root;
		else
			pages = path.resolve(root, "src");
	}
	// TODO: Register other layout engines into custom NHP <?render?> method

	var scanPages = function () {
		var genRoute = function (dir, next) {
			fs.readdir(dir, function (err, files) {
				if (err)
					return next(err);

				var mapping = {};
				var map = function (key) {
					if (!(key in mapping))
						return mapping[key] = {
							models: {}
						};

					return mapping[key];
				}

				async.each(files, function (file, next) {
					var full = path.resolve(dir, file);
					fs.stat(full, function (err, stat) {
						if (err)
							return next(err);

						if (stat.isDirectory()) {
							genRoute(full, function (err, router) {
								if (err)
									return next(err);

								mapping[file] = {
									router: router
								}
								next();
							});

							return;
						}

						var match = file.match(model);
						if (match) {
							map(match[1]).models[match[2] || "get"] = full;
							return next();
						}
						match = file.match(staticmodel);
						if (match) {
							map(match[1]).constants = require(full);
							return next();
						}
						match = file.match(view);
						if (match) // file, renderer
							map(match[1]).view = [full, match[2]];
						next();
					});
				}, function (err) {
					if (err)
						return next(err);

					var exists;
					logger.debug("Mapping", mapping);
					var router = express.Router();
					if ("__route" in mapping) {
						// Dynamic route specific middleware!
						var middleware = require(mapping.__route.models.get);
						middleware = argwrap(middleware, ["req", "res", "next", "service", "logger"]);
						router.use(function (req, res, next) {
							middleware({
								req: req,
								res: res,
								next: next,
								service: service,
								logger: logger
							});
						});
						delete mapping.__route;
					}
					if ("__exists" in mapping) {
						// Dynamic existance check, adds another layer...
						exists = require(mapping.__exists.models.get);
						exists = argwrap(exists, ["req", "res", "next", "skip", "service", "logger"]);
						delete mapping.__exists;
					}

					for (var key in mapping) {
						var map = mapping[key];
						if (key == "index")
							key = "";

						if (map.constants && !map.models.get)
							map.models.get = true;

						key = "/" + key;
						if ("router" in map)
							router.use(key, map.router);
						else {
							(function (statics) {
								for (var method in map.models) {
									(function (view, model, method) {
										logger.debug("Mounting", method, key, model, view);
										if (model === true) {
											router[method](key, function (req, res, next) {
												if (err)
													return next(err);

												var jsonResponse = !disableRequestType && /^(text\/)?json$/i.test(req.get("request-type"));

												var context = {};
												if (!jsonResponse)
													_.merge(context, req);
												if (statics)
													_.merge(context, statics);
												if (jsonResponse)
													context.page = path.relative(root, view[0]);
												else
													context.page = view[0];

												if (jsonResponse)
													res.json(context);
												else {
													res.type("html");
													skeleton.run(context, res, function (err) {
														if (err)
															return next(err);

														try {
															res.end();
														} catch (e) {
														}
													});
												}
											});

											return;
										}

										try {
											var modelInst;
											try {
												modelInst = require(model);
												if (!_.isFunction(modelInst))
													throw new Error("Not a function: " + model);
											} catch (e) {
												if (!statics)
													throw e;

												logger.warn(e);
												modelInst = function (req, res, next) {
													next();
												};
											}
											modelInst = argwrap(modelInst, ["req", "res", "callback", "render",
												"next", "constants", "service", "logger"]);

											router[method](key, function (req, res, next) {
												try {
													var cont = function (err, pagecontext) {
														if (err)
															return next(err);
														if (!_.isObject(pagecontext))
															return next(); // Skip if no context was passed

														var jsonResponse = !disableRequestType && /^(text\/)?json$/i.test(req.get("request-type"));

														var context = {};
														if (!jsonResponse)
															_.merge(context, req);
														if (statics)
															_.merge(context, statics);
														if (context)
															_.merge(context, pagecontext);
														if (jsonResponse)
															context.page = path.relative(root, view[0]);
														else
															context.page = view[0];

														if (jsonResponse)
															res.json(context);
														else {
															res.type("html");
															skeleton.run(context, res, function (err) {
																if (err)
																	return next(err);

																try {
																	res.end();
																} catch (e) {
																}
															});
														}
													};

													modelInst({
														req: req,
														res: res,
														next: cont,
														callback: cont,
														render: function (context) {
															next(null, context || {});
														},
														constants: constants,
														service: service,
														logger: logger
													});
												} catch (e) {
													next(e);
												}
											});
										} catch (e) {
											next(e);
										}
									})(map.view, map.models[method], method);
								}
							})(map.constants);
						}
					}

					if (exists)
						next(null, function (req, res, next) {
							exists({
								req: req,
								res: res,
								next: function next_exists(err) {
									if (err)
										return next(err);
									router(req, res, next);
								},
								skip: next,
								service: service,
								logger: logger
							});
						});
					else
						next(null, router);
				});
			});
		};
		genRoute(pages, function (err, router) {
			if (err)
				return next(err);

			logger.info("Test", disableTemplateSource);
			if (disableTemplateSource) {
				if (errordoc)
					next(null, function (req, res, next) {
						var oldSendStatus = res.sendStatus;
						res.sendStatus = function (status) {
							var errorPage = errordoc["" + status];
							if (errorPage) {
								var purl = url.parse(req.url);
								purl.pathname = "/" + errorPage;
								purl.search = "";
								purl.query = "";
								req.originalUrl = req.url = url.format(purl);
								
								res.status(status);
								router.call(this, req, res, next);
							} else
								oldSendStatus.call(res, status);
						};
						router.apply(this, arguments);
					});
				else
					next(null, router);
			} else if (errordoc)
				next(null, function (req, res, next) {
					var oldSendStatus = res.sendStatus;
					res.sendStatus = function (status) {
						var errorPage = errordoc["" + status];
						if (errorPage) {
							var purl = url.parse(req.url);
							purl.pathname = "/" + errorPage;
							purl.search = "";
							purl.query = "";
							req.originalUrl = req.url = url.format(purl);
							
							res.status(status);
							router.call(this, req, res, next);
						} else
							oldSendStatus.call(res, status);
					};

					var template, resolved;
					if (req.path === "/:tmpl" && (template = req.get("template"))) {
						if (!/\.nhp$/i.test(template) || (resolved = path.resolve(root, template)).indexOf(root) !== 0) {
							res.sendStatus(403);
							return;
						}

						var template = nhpi.template(resolved);
						if (template.isCompiled() && template._source) {
							res.type("javascript");
							res.send(template._source);
						} else {
							template.once("compiled", function () {
								res.type("javascript");
								res.send(template._source);
							});
						}
						return;
					}

					router.apply(this, arguments);
				});
			else
				next(null, function (req, res) {
					var template, resolved;
					if (req.path === "/:tmpl" && (template = req.get("template"))) {
						if (!/\.nhp$/i.test(template) || (resolved = path.resolve(root, template)).indexOf(root) !== 0) {
							res.sendStatus(403);
							return;
						}

						var template = nhpi.template(resolved);
						if (template.isCompiled() && template._source) {
							res.type("javascript");
							res.send(template._source);
						} else {
							template.once("compiled", function () {
								res.type("javascript");
								res.send(template._source);
							});
						}
						return;
					}

					router.apply(this, arguments);
				});
		});
	};

	// Wait for skeleton to compile if it isn't before generating the routes
	if (skeleton.isCompiled())
		scanPages();
	else {
		// FIX: Its possible for compiled to be called after error if the file changes after the first error...
		skeleton.once("error", next);
		skeleton.once("compiled", scanPages);
	}
};

