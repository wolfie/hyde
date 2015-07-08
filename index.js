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

var fs = require('fs');
var path = require('path');
var parse = require('./lib/parser.js');
var assertIsString = require('./lib/util.js').assertIsString;
var walk = require('./lib/util.js').walk;

/**
 * Hyde's predefined constants in a Context
 *
 * @typedef {object} HydeContext
 * @property {string} targetroot
 * @property {string} sourceroot
 * @property {string} currentfile
 * @property {Date} time
 */

/**
 * The context for Hyde processing
 *
 * @typedef {object} ParseContext
 * @property {HydeContext} _hyde
 */

/** @type ParseContext */
var parseContext = {
  _hyde: {
    targetroot: '',
    sourceroot: '',
    currentfile: '',
    time: new Date(),
  },
};

/**
 * Deletes a path and all its contents.
 * <p>
 * Found at http://stackoverflow.com/revisions/12761924/4
 *
 * @param {string} dir the directory to be deleted
 */
var deleteDirectoryRecursive = function(dir) {
  var files = [];
  if (fs.existsSync(dir)) {
    files = fs.readdirSync(dir);
    files.forEach(function(file) {
      var curPath = dir + path.sep + file;
      if (fs.statSync(curPath).isDirectory()) { // Recurse
        deleteDirectoryRecursive(curPath);
      } else { // Delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dir);
  }
};

/**
 * Processes a single file through Hyde.
 *
 * @param {string} file the path of the file to compile
 */
var processFile = function(file) {
  var suffix = /(\.html|\.css|\.md|\.markdown)$/i;
  if (!suffix.test(file)) {
    return;
  }

  var relativeFile = file.substr(parseContext._hyde.sourceroot.length);
  var targetAbsoluteFile = parseContext._hyde.targetroot + relativeFile;
  var targetDir = path.dirname(targetAbsoluteFile);

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir);
  }

  var text = fs.readFileSync(file, {encoding: 'utf-8'});

  parseContext._hyde.currentfile = relativeFile;
  var parsed = parse(text, parseContext);

  fs.writeFileSync(targetAbsoluteFile, parsed, {encoding: 'utf-8'});
};

/**
 * @callback HydeCallback
 * @param  {?Error} err an Error object, or undefined if no error was found.
 */

/**
 * Entry point for starting to compile files.
 *
 * @param {string} sourcePath the source path. By default current work
 *    directory.
 * @param {string} targetPath the target path. By default sourcePath+'/_site'.
 * @param {HydeCallback} callback a function called when the execution for Hyde
 *    is done. Has an error parameter if an error was encountered during
 *    execution
 */
var entry = function(sourcePath, targetPath, callback) {
  if (typeof sourcePath === 'undefined' || sourcePath === null) {
    sourcePath = process.cwd();
  } else {
    assertIsString(sourcePath, 'Source path must be a string');
  }

  if (typeof targetPath === 'undefined' || targetPath === null) {
    targetPath = path.resolve(sourcePath, '_site');
  } else if (typeof targetPath !== 'string') {
    console.error('Target path must be a string');
    process.exit(1);
  }

  parseContext._hyde.sourceroot = sourcePath;
  parseContext._hyde.targetroot = targetPath;

  // TODO this could be async'd
  deleteDirectoryRecursive(targetPath);

  walk(sourcePath, function(err, files) {
    if (err) { callback(err); }
    files.forEach(function(file) {
      if (path.basename(file).indexOf('_') !== 0) {
        processFile(file);
      }
    });
    callback();
  });
};

module.exports = entry;
