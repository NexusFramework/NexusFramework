module.exports = function(req, res) {
    res.cookie("test", "test");
    res.cookie("tuna", "fish");
    res.json(true);
};