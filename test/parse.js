/*
 * Copyright 2015 Henrik Paul
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
