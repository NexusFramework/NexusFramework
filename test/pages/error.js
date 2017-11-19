module.exports = function(req, res) {
    res.sendFailure(new Error("Test"));
};