module.exports = function(req, res) {
  res.cookie("user", "true");
  res.redirect('/');
}
