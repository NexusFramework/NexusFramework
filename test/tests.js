var testCase = require('mocha').describe
var pre = require('mocha').before
var assertions = require('mocha').assertions
var path = require('path')
var assert = require('assert')

suite('typeinclude', function() {
	var nexusframework;
	test('index.js', function(){
		nexusframework = require(path.dirname(__dirname) + path.sep + "index");
	});
});
