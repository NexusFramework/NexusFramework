module.exports = function(req, res, next) {
    next(undefined, {
        title: "Error " + req.errorCode
    });
}