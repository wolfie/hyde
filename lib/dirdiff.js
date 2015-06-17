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

/**
 * Callback for dir diff.
 * @callback DiffCallback
 * @param {!DiffResult} result
 */

/**
 * Results of the dir diff
 * @typedef {object} DiffResult
 * @property {!string[]} common The pathnames that were found in both the source
 *    and the target
 * @property {!string[]} missing The pathnames that were in source, but not in
 *    target
 * @property {!string[]} extra The pathnames that were not in source, but were
 *    in target
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

  done({
    common: common,
    missing: missing,
    extra: extra,
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