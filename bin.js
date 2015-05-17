#!/usr/bin/env node

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

var argv = require('minimist')(process.argv.slice(2));
var pkg = require('./package.json');
var hyde = require('./index.js');

var versionLine = 'hyde: Blog compiler, version ' + pkg.version;

var help = [
  versionLine,
  '',
  'Usage: hyde [options] [SOURCEPATH] [TARGETPATH]',
  '',
  '-s PATH, --sourcepath=PATH',
  '\tSets a SOURCEPATH. Default: .',
  '',
  '-t PATH, --targetpath=PATH',
  '\tSets a TARGETPATH. Default: ./_site',
  '',
  '-v, --version',
  '\tThe version of Hyde that you\'re using',
  '',
  '-h, -?, --help',
  '\tThis help text',
];

var arg = function() {
  var value = null;
  for (var i = 0; i < arguments.length; i++) {
    var arg = arguments[i];
    if (!value) { value = argv.hasOwnProperty(arg) ? argv[arg] : null; }
    delete argv[arg];
  }
  return value;
};

var checkUnprocessedArguments = function() {
  var unprocessed = [];
  for (var prop in argv) {
    if (argv.hasOwnProperty(prop) && prop !== '_') {
      unprocessed.push(prop);
    }
  }
  if (unprocessed.length > 0) {
    console.log('Unrecognized option ' + (unprocessed.length > 1 ? 's' : '') +
        ': ' + unprocessed.join(', ') + '\n');
    process.exit(1);
  }
};

var sourcePath = arg('s', 'sourcepath') || argv._[0];
var targetPath = arg('t', 'targetpath') || argv._[1];
var showHelp = arg('h', '?', 'help');
var showVersion = arg('v', 'version');
checkUnprocessedArguments();

if (showVersion) {
  console.log(versionLine);
} else if (showHelp) {
  console.log(help.join('\n'));
} else {
  hyde(sourcePath, targetPath);
}
