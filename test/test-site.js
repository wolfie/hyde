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

var hyde = require('../index.js');
var path = require('path');
var dirdiff = require('../lib/dirdiff.js');
var assert = require('assert');

var testSite = __dirname + path.sep + 'test-site';
var sourcePath = testSite + path.sep + 'source';
var targetPath = sourcePath + path.sep + '_site';
var precompiledPath = testSite + path.sep + 'target';

describe('Hyde', function() {
  it('should compile the source to match the target', function(done) {
    hyde(sourcePath, targetPath);
    dirdiff(targetPath, precompiledPath, function(result) {

      /*
       * This error reporting definitely could use some more detailed error
       * reporting. This is a minimal implementation that should do for now...
       */

      assert.ok(result.pathnames.extra.length === 0,
          'some extra files were found');
      assert.ok(result.pathnames.missing.length === 0,
          'some files were missing');
      result.contents.forEach(function(file) {
        file.diffs.forEach(function(contentDiff) {
          assert.ok(!contentDiff.added, 'something was added in ' + file);
          assert.ok(!contentDiff.removed, 'something was removed in ' + file);
        });
      });
      done();
    });
  });
});
