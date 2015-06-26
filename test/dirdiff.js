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
  var assertNoFilenameDifferences = function(done) {
    return function(result) {
      assert.ok(result.pathnames.common.length > 0);
      assert.ok(result.pathnames.missing.length === 0);
      assert.ok(result.pathnames.extra.length === 0);
      done();
    };
  };

  /**
   * @param {string} needle
   * @param {DiffResult} haystack
   */
  var getContentDiff = function(needle, haystack) {
    var diffs = haystack.contents;
    for (var i = 0; i < diffs.length; i++) {
      var diff = diffs[i];
      if (diff.pathname === needle) {
        return diff;
      }
    }
    return null;
  };

  it('works when source and target are the same', function(done) {
    diff(pathA, pathA, assertNoFilenameDifferences(done));
  });

  it('correctly detects no filename differences', function(done) {
    diff(pathA, pathB, assertNoFilenameDifferences(done));
  });

  it('notices a missing file', function(done) {
    diff(pathA, pathC, function(result) {
      assert.ok(result.pathnames.common.indexOf('ab-same.txt') === -1);
      assert.ok(result.pathnames.missing.indexOf('ab-same.txt') !== -1);
      done();
    });
  });

  it('notices an extra file', function(done) {
    diff(pathC, pathA, function(result) {
      assert.ok(result.pathnames.common.indexOf('ab-same.txt') === -1);
      assert.ok(result.pathnames.extra.indexOf('ab-same.txt') !== -1);
      done();
    });
  });

  it('notices a modified text file', function(done) {
    diff(pathB, pathC, function(result) {
      var diffedFile = 'ab-same-c-differ.txt';
      var diff = getContentDiff(diffedFile, result);
      assert.ok(diff !== null,
          diffedFile + ' should\'ve been identified as modified');
      assert.ok(!diff.isBinary,
          diffedFile + ' should\'ve not been identified as binary');
      assert.ok(diff.diffs !== null,
          'Text differences were expected, but not found.');
      done();
    });
  });

  it('ignores an unmodified text file', function(done) {
    diff(pathA, pathB, function(result) {
      var diffedFile = 'ab-same-c-differ.txt';
      var diff = getContentDiff(diffedFile, result);
      assert.ok(diff === null, diffedFile + ' was found to be different');
      done();
    });
  });

  it('notices a modified binary file', function(done) {
    diff(pathB, pathC, function(result) {
      var diffedFile = 'pixel.gif';
      var diff = getContentDiff(diffedFile, result);
      assert.ok(diff !== null,
          diffedFile + ' should\'ve been identified as modified');
      assert.ok(diff.isBinary,
          diffedFile + ' was not recognized as a binary file');
      assert.ok(diff.diffs === null,
          'content diff was found even though it is a binary file');
      done();
    });
  });

  it('ignores an unmodified binary file', function(done) {
    diff(pathA, pathB, function(result) {
      var diffedFile = 'pixel.gif';
      var diff = getContentDiff(diffedFile, result);
      assert.ok(diff === null,
          diffedFile + ' is wrongly claimed to have differences');
    });
  });
});