module.exports = function(req, res, allowed, denied) {
    if(req.query.user === "test" && req.query.pass === "test")
        allowed();
    else
        denied();
};