module.exports = function(req, res) {
  res.writeHead(503);
  res.end("Maintenance");
}
