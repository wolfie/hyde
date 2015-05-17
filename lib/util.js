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

/**
 * A utility library
 * @module hyde/util
 */

/**
 * @param {*} value
 * @param {string} type
 * @param {string} [errorMsg]
 */
var assertIsType = function(value, type, errorMsg) {
  if (typeof value !== type) {
    var message;
    if (errorMsg) {
      message = errorMsg + ' (value: ' + value + ')';
    } else {
      message = 'Expected type ' + type + '. Instead got type ' +
        typeof value + ' (value: ' + value + ')';
    }
    throw new Error(message);
  }
};

var assertIsArray = function(array, errorMsg) {
  if (array.constructor !== Array) {
    var message;
    if (errorMsg) {
      message = errorMsg + ' (value: ' + array + ')';
    } else {
      message = 'Expected type array. Instead got type ' +
        typeof array + ' (value: ' + array + ')';
    }
    throw new Error(message);
  }
};

var assertIsString = function(string, errorMsg) {
  assertIsType(string, 'string', errorMsg);
};

var assertIsFunction = function(f, errorMsg) {
  assertIsType(f, 'function', errorMsg);
};

var assertIsNumber = function(n, errorMsg) {
  assertIsType(n, 'number', errorMsg);
};

/**
 * Split a string according to a separator without splitting inside a quoted
 * string bit.
 *
 * @param {string} string the string to split
 * @param {string} separator the separator to split with.
 *    May not contain a quote.
 * @param {number} [limit=0] the maximum amount of parts to return.
 *    A non-positive number indicates no limit.
 * @returns {string[]} The parts of the split string
 */
module.exports.splitContainingQuotedStrings =
    function(string, separator, limit) {
  if (string === null || typeof string === 'undefined') { return []; }
  assertIsString(string, 'input must be a string');
  assertIsString(separator, 'separator must be a string');

  if (typeof limit !== 'number') {
    limit = 0;
  }

  if (limit === 1) {
    return [string];
  } else if (limit <= 0) {
    limit = Number.MAX_VALUE;
  }

  if (separator.indexOf('"') !== -1) {
    throw new Error('Separator may not contain a quote');
  }

  if (string.indexOf('"') === -1) {
    return string.split(separator);
  }

  var splits = [];
  var insideQuotes = false;
  var partStart = 0;
  for (var i = 0; i < string.length && splits.length < limit; i++) {
    if (string.charAt(i) === '\\' && string.charAt(i + 1) === '"') {
      string = string.substr(0, i) + string.substr(i + 1);
    } else if (string.charAt(i) === '"') {
      insideQuotes = !insideQuotes;
    } else if (!insideQuotes &&
          string.substr(i, separator.length) === separator) {
      splits.push(string.substring(partStart, i));
      partStart = i + 1;
    }
  }

  if (partStart !== string.length) {
    splits.push(string.substring(partStart, string.length));
  }

  return splits;
};

/**
 * Asserts that the parameter is a function.
 *
 * @param {function} f
 * @param {string} [errorMsg] A custom error message to display
 */
module.exports.assertIsFunction = assertIsFunction;

/**
 * Asserts that the parameter is a string
 *
 * @param {string} string
 * @param {string} [errorMsg] A custom error message to display
 */
module.exports.assertIsString = assertIsString;

/**
 * Asserts that the parameter is an array.
 *
 * @param {Array} array
 * @param {string} [errorMsg] A custom error message to display
 */
module.exports.assertIsArray = assertIsArray;

/**
 * Asserts that the parameter is a number.
 *
 * @param {number} n
 * @param {string} [errorMsg] A custom error message to display
 */
module.exports.assertIsNumber = assertIsNumber;
