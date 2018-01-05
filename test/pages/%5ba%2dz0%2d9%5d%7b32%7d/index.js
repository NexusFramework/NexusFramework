module.exports = function(req, res, next) {
    console.log(req.match);
    next(undefined, {
        match: req.match[0]
    });
}