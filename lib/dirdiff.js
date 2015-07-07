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

var path = require('path');
var walk = require('./util.js').walk;
var assertIsString = require('./util.js').assertIsString;
var assertIsFunction = require('./util.js').assertIsFunction;
var diff = require('diff');
var fs = require('fs');
var isBinaryFile = require('isbinaryfile');
var crypto = require('crypto');

/**
 * Callback for dir diff.
 * @callback DiffCallback
 * @param {!DiffResult} result
 */

/**
 * @typedef {object} DiffResult
 * @property {PathDiffResult} pathnames
 * @property {ContentDiffResult[]} contents
 */

/**
 * Results of the dir diff
 * @typedef {object} PathDiffResult
 * @property {!string[]} common The pathnames that were found in both the source
 *    and the target
 * @property {!string[]} missing The pathnames that were in source, but not in
 *    target
 * @property {!string[]} extra The pathnames that were not in source, but were
 *    in target
 */

/**
 * @typedef {object} ContentDiffResult
 * @property {string} pathname The relative pathname of the differing file
 * @property {boolean} isBinary Whether the file is binary or not.
 * @property {?ContentDiff[]} diffs The diff data found in the text.
 *    Null if isBinary.
 */

/**
 * @typedef {object} ContentDiff
 * @property {string} value The text that has changed (maybe)
 * @property {boolean} added Was this text added?
 * @property {boolean} removed Was this text removed?
 */

/**
 * Result data structure
 * @typedef {object} _DiffResult
 * @property {!string} sourcePath
 * @property {!string} targetPath
 * @property {string[]} source
 * @property {string[]} target
 */

/**
 * @param {_DiffResult} results
 * @param {DiffCallback} done
 */
var inspectResults = function(results, done) {
  if (!results.hasOwnProperty('source') || !results.hasOwnProperty('target')) {
    return;
  }

  var common = [];
  var missing = [];
  results.source.forEach(function(e) {
    var index = results.target.indexOf(e);
    if (index !== -1) {
      common.push(e);
      results.target.splice(index, 1);
    } else {
      missing.push(e);
    }
  });
  var extra = results.target;

  var contents = [];

  common.forEach(function(filePath) {
    var sourcePath = results.sourcePath + path.sep + filePath;
    var targetPath = results.targetPath + path.sep + filePath;

    if (isBinaryFile(targetPath)) {
      var aBinary = fs.readFileSync(sourcePath);
      var bBinary = fs.readFileSync(targetPath);
      var aHash = crypto.createHash('md5').update(aBinary).digest('hex');
      var bHash = crypto.createHash('md5').update(bBinary).digest('hex');

      if (aHash !== bHash) {
        contents.push({
          pathname: filePath,
          isBinary: true,
          diffs: null,
        });
      }
    } else {
      var aText = fs.readFileSync(sourcePath, {encoding: 'utf8'});
      var bText = fs.readFileSync(targetPath, {encoding: 'utf8'});
      var diffs = diff.diffLines(aText, bText);

      if (diffs.length > 1) {
        contents.push({
          pathname: filePath,
          isBinary: false,
          diffs: diffs,
        });
      }
    }
  });

  done({
    pathnames: {
      common: common,
      missing: missing,
      extra: extra,
    },
    contents: contents,
  });
};

/**
 * @param {!string} sourcePath
 * @param {!string} targetPath
 * @param {!DiffCallback} done
 */
var dirdiff = function(sourcePath, targetPath, done) {
  assertIsString(sourcePath, 'source path needs to be a string');
  assertIsString(targetPath, 'target path needs to be a string');
  assertIsFunction(done, 'a callback function needs to be given');

  var paths = {
    sourcePath: sourcePath,
    targetPath: targetPath,
  };

  walk(sourcePath, function(err, results) {
    if (err) {
      throw err;
    }

    results = results.map(function(e) {
      return path.relative(sourcePath, e);
    });

    paths.source = results;
    inspectResults(paths, done);
  });

  walk(targetPath, function(err, results) {
    if (err) {
      throw err;
    }

    results = results.map(function(e) {
      return path.relative(targetPath, e);
    });

    paths.target = results;
    inspectResults(paths, done);
  });
};

module.exports = dirdiff;
