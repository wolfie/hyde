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
	
	it('should cope with an escaped quote', function() {
		assert.equal("\"", parse("{{ \"\\\"\" }}"));
	});

    it('should take its value from the context', function() {
		assert.equal("1", parse("{{ number }}", { 'number': 1 }));
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

var acceptsOnly = function(accepted, f) {
	util.assertIsFunction(f);
	util.assertIsString(accepted);
	
	var only = function(accepted, trying, f, arg) {
		var _it = function(desc, f, arg) {
			it(desc, function(done) {
				f(arg);
				done();
			});
		};
		
		var _but = function(desc, f, arg) {
			it(desc, function(done) {
				try {
					f(arg);
					assert.fail();
				} catch (e) {
					// expected
					done();
				}
			});
		};
		
		if (accepted === trying) {
			_it("accepts "+trying, f, arg);
		} else {
			_but("doesn't accept "+trying, f, arg);
		}
	};
	
	only(accepted, "strings", f, "string");
	only(accepted, "functions", f, function() {});
	only(accepted, "numbers", f, 1);
	only(accepted, "objects", f, {});
	only(accepted, "booleans", f, true);
	only(accepted, "nulls", f, null);
	only(accepted, "undefineds", f);
	only(accepted, "arrays", f, []);
	only(accepted, "array-likes", f, {0: true, 1:true});
};

describe("Util", function() {
	describe(".assertIsFunction", function() {
		acceptsOnly("functions", util.assertIsFunction);
	});
	describe(".assertIsString", function() {
		acceptsOnly("strings", util.assertIsString);
	});
	describe(".assertIsArray", function() {
		acceptsOnly("arrays", util.assertIsArray);
	});
	describe(".assertIsNumber", function() {
		acceptsOnly("numbers", util.assertIsNumber);
	});
});