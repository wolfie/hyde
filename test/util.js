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
var util = require('../lib/util.js');

var itAcceptsOnly = function(accepted, f) {
  util.assertIsFunction(f);
  util.assertIsString(accepted);

  var _it = function(desc, f, arg) {
    it(desc, function() {
      f(arg);
    });
  };

  var _but = function(desc, f, arg) {
    it(desc, function() {
      assert.throws(function() {
        f(arg);
      });
    });
  };

  var only = function(accepted, trying, f, arg) {
    if (accepted === trying) {
      _it('accepts ' + trying, f, arg);
    } else {
      _but('doesn\'t accept ' + trying, f, arg);
    }
  };

  only(accepted, 'strings', f, 'string');
  only(accepted, 'functions', f, function() {});
  only(accepted, 'numbers', f, 1);
  only(accepted, 'objects', f, {});
  only(accepted, 'booleans', f, true);
  only(accepted, 'nulls', f, null);
  only(accepted, 'undefineds', f);
  only(accepted, 'arrays', f, []);
  only(accepted, 'array-likes', f, {0: true, 1: true});
};

describe('Util', function() {
  describe('.assertIsFunction', function() {
    itAcceptsOnly('functions', util.assertIsFunction);
  });
  describe('.assertIsString', function() {
    itAcceptsOnly('strings', util.assertIsString);
  });
  describe('.assertIsArray', function() {
    itAcceptsOnly('arrays', util.assertIsArray);
  });
  describe('.assertIsNumber', function() {
    itAcceptsOnly('numbers', util.assertIsNumber);
  });

  describe('.splitContainingQuotedStrings', function() {
    var split = util.splitContainingQuotedStrings;
    it('rejects a splitter containing a quote', function() {
      assert.throws(function() {
        split('', '"');
      });
    });

    it('returns itself arrayed if nothing is split', function() {
      assert.deepEqual(split('string', '.'), ['string']);
    });

    it('returns itself arrayed if nothing is split even with a quote',
        function() {assert.deepEqual(split('str"ing', '.'), ['str"ing']);});

    it('returns itself arrayed if nothing is split even with a quote',
        function() {assert.deepEqual(split('str\\"ing', '.'), ['str"ing']);});

    it('splits as expected without quotes', function() {
      assert.deepEqual(split('hello world', ' '), ['hello', 'world']);
    });

    it('escapes quotes properly', function() {
      assert.deepEqual(split('\\"hello world\\"', ' '),
          ['"hello', 'world"']);
    });

    it('doesn\'t allow for escaping the splitter', function() {
      assert.deepEqual(split('hello\\ world', ' '), ['hello\\', 'world']);
    });

    it('doesn\'t choke on quotes without a split', function() {
      assert.deepEqual(
        split('hello "world"', ' '),
        ['hello', '"world"']
      );
    });

    it('keeps quoted sections togehter', function() {
      assert.deepEqual(
        split('hello "Hello World" world', ' '),
        ['hello', '"Hello World"', 'world']
      );
    });

    it('works with two quoted sections', function() {
      assert.deepEqual(
        split('"hello world" "hello world"', ' '),
        ['"hello world"', '"hello world"']
      );
    });

    it('works with longer split points', function() {
      assert.deepEqual(
          split('hello || world', '||'),
          ['hello ', ' world']
      );
    });
  });
});