module.exports = function(req, res, next) {
    res.locals.body = req.body;
    next(undefined, {});
};