var path = require('path')
var assert = require('assert')

describe('typeinclude', function() {
	var nexusframework;
	it('index.js', function(){
		nexusframework = require(path.dirname(__dirname) + path.sep + "index");
	});
});
