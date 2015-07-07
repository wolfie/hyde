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
var assertIsString =  require('../lib/util.js').assertIsString;

var assertParse = function(input, expected, context) {
  assertIsString(input);
  assertIsString(expected);
  assert.equal(parse(input, context), expected);
};

var assertParseThrows = function(input, context) {
  //noinspection JSCheckFunctionSignatures
  assert.throws(function() {
    assertParse(input, '', context);
  });
};

describe('A variable', function() {
  it('should be itself if in quoted format', function() {
    var result = parse('{{ "foo" }}');
    assert.equal(result, 'foo');
    assertIsString(result);
  });

  it('should cope with an escaped quote', function() {
    assertParse('{{ "\\"" }}', '"');
  });

  it('should cope with closing braces in string', function() {
    assertParse('{{ "}}" }}', '}}');
  });

  it('should take its value from the context', function() {
    assertParse('{{ number }}', '1', { number: 1 });
  });

  it('should fail variable is not in context', function() {
    assertParseThrows('{{ foo }}');
  });

  it('should be escaped with a backslash', function() {
    assertParse('\\{{ "foo" }}', '{{ "foo" }}');
  });

  describe('with lowercase filter', function() {
    it('should be lowercase', function() {
      assertParse('{{ "Foo"|lowercase }}', 'foo');
    });
    it('should accept non-strings', function() {
      assertParse('{{ var|lowercase }}', '1', {var: 1});
    });
  });

  describe('with uppercase filter', function() {
    it('should be uppercase', function() {
      assertParse('{{ "Foo"|uppercase }}', 'FOO');
    });
    it('should accept non-strings', function() {
      assertParse('{{ var|uppercase }}', '1', {var: 1});
    });
  });

  describe('with a filter that doesn\'t exist', function() {
    it('should fail', function() {
      assertParseThrows('{{ "foo"|foobar }}');
    });
  });
});
