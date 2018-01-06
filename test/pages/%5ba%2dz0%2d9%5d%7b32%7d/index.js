module.exports = function(req, res, next) {
    console.log(req.match);
    next(undefined, {
        title: "Yahaha!",
        match: req.match[0]
    });
}