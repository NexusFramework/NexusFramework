module.exports = function(req, res, next) {
    next(undefined, {
        title: "Whoa there...",
        match: "Shh... its a secret..."
    });
}