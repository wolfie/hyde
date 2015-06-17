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
var diff = require('../lib/dirdiff.js');
var path = require('path');

var pathDirdff = __dirname + path.sep + 'dirdiff';
var pathA = pathDirdff + path.sep + 'a';
var pathB = pathDirdff + path.sep + 'b';
var pathC = pathDirdff + path.sep + 'c';

describe('dirdiff', function() {
  var assertNoDifferences = function(done) {
    return function(result) {
      assert.ok(result.common.length > 0);
      assert.ok(result.missing.length === 0);
      assert.ok(result.extra.length === 0);
      done();
    };
  };

  it('works when source and target are the same', function(done) {
    diff(pathA, pathA, assertNoDifferences(done));
  });

  it('correctly detects no file-level differences', function(done) {
    diff(pathA, pathB, assertNoDifferences(done));
  });

  it('notices a missing file', function(done) {
    diff(pathA, pathC, function(result) {
      assert.ok(result.common.indexOf('somefile.txt') === -1);
      assert.ok(result.missing.indexOf('somefile.txt') !== -1);
      done();
    });
  });

  it('notices an extra file', function(done) {
    diff(pathC, pathA, function(result) {
      assert.ok(result.common.indexOf('somefile.txt') === -1);
      assert.ok(result.extra.indexOf('somefile.txt') !== -1);
      done();
    });
  });
});