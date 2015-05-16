var assert = require('assert');
var parse = require('../lib/parser.js');
var util = require('../lib/util.js');
var assertIsString = util.assertIsString;

describe('A variable', function() {
  it('should be itself if in quoted format', function() {
    var result = parse('{{ "foo" }}');
    assert.equal(result, 'foo');
    assertIsString(result);
  });

  it('should cope with an escaped quote', function() {
    assert.equal(parse('{{ "\\"" }}'), '"');
  });

  it('should take its value from the context', function() {
    assert.equal(parse('{{ number }}', { number: 1 }), '1');
  });

  it('should fail variable is not in context', function() {
    assert.throws(function() {
      parse('{{ foo }}');
    });
  });

  describe('with lowercase filter', function() {
    it('should be lowercase', function() {
      assert.equal(parse('{{ "Foo"|lowercase }}'), 'foo');
    });
  });

  describe('with uppercase filter', function() {
    it('should be uppercase', function() {
      assert.equal(parse('{{ "Foo"|uppercase }}'), 'FOO');
    });
  });

  describe('with a filter that doesn\'t exist', function() {
    it('should fail', function() {
      assert.throws(function() {
        parse('{{ "foo"|foobar }}');
      });
    });
  });
});
