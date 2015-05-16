/* global it */
/* global describe */
var assert = require("assert");
var parse = require("../hyde-parse");
var util = require("../lib/util.js");
var assertIsString = util.assertIsString;

describe('A variable', function() {
	it('should be itself if in quoted format', function() {
		var result = parse("{{ \"foo\" }}");
		assert.equal("foo", result);
        assertIsString(result);
	});

    it('should take its value from the context', function() {
		var context = { 'number': 1 };
		var result = parse("{{ number }}", context);
		assert.equal("1", result);
	});
	
	describe('with lowercase filter', function() {
		it('should be lowercase', function() {
			assert.equal("foo", parse("{{ \"Foo\"|lowercase }}"));
		});
		
		it('should not accept numbers', function() {
			try {
				parse("{{ var|lowercase }}", {'var': 1});
				assert.fail();
			} catch (e) {
				// expected
			}
		});
		
		it('should not accept functions', function() {
			try {
				parse("{{ var|lowercase }}", {'var': function() {}});
				assert.fail();
			} catch (e) {
				// expected
			}
		});
	});
	
	describe('with uppercase filter', function() {
		it('should be uppercase', function() {
			assert.equal("FOO", parse("{{ \"Foo\"|uppercase }}"));
		});
		
		it('should not accept numbers', function() {
			try {
				parse("{{ var|uppercase }}", {'var': 1});
				assert.fail();
			} catch (e) {
				// expected
			}
		});
		
		it('should not accept functions', function() {
			try {
				parse("{{ var|uppercase }}", {'var': function() {}});
				assert.fail();
			} catch (e) {
				// expected
			}
		});
	});
	
	describe('with an filter that doesn\'t exist', function() {
		it('should fail', function() {
			try {
				parse("{{ \"foo\"|foobar }}");
				assert.fail();
			} catch (e) {
				// expected
			} 
		});
	});
});