module.exports = function(req, res, next) {
  res.addScript("fred.js");
  next(undefined, {});
}
