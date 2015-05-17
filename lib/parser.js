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

var assertIsString = require('../lib/util.js').assertIsString;
var assertIsArray = require('../lib/util.js').assertIsArray;
var assertIsFunction = require('../lib/util.js').assertIsFunction;
var splitContainingQuotedStrings = require('../lib/util.js')
      .splitContainingQuotedStrings;

/**
 * @constant
 * @type {string}
 */
var VARIABLE_OPENING_SYMBOL = '{{';

/**
 * @constant
 * @type {string}
 */
var VARIABLE_CLOSING_SYMBOL = '}}';

/** @type {Object.<string, FilterCallback>} */
var _filters = {};

/**
 * A filter function
 * @callback FilterCallback
 * @property {*} argument
 * @returns {*} processed result
 */

/**
 * A result of a template replacement.
 *
 * @typedef {object} Result
 * @property {*} result The resulting thing (usually string)
 * @property {number} endIndex The end index of the source string
 */

/**
 * Replacement information.
 *
 * @typedef {object} Replacement
 * @property {string} result The text that should be inserted
 * @property {Number} start The start index of the text that should be replaced
 * @property {Number] end The end index of the text that should be replaced
 */

/**
 * @param {string} input
 * @param {Context} context
 * @returns {*}
 */
var parseValue = function(input, context) {
  if (input.charAt(0) === '"' && input.charAt(input.length - 1) === '"') {
    return input.substring(1, input.length - 1).replace('\\"', '"');
  }

  if (input.match(/^[0-9]/)) {
    return parseFloat(input);
  }

  var getProperty = function(object, property) {
    if (!object.hasOwnProperty(property)) {
      throw new Error('No such variable: ' + input);
    }
    return object[property];
  };

  var parts = input.split('.');
  var value = getProperty(context, parts[0]);
  for (var i = 1;
         i < parts.length &&
         value !== null &&
         typeof value !== 'undefined';
       i++) {
    value = getProperty(value, parts[i]);
  }

  return value;
};

/**
 *
 * @param {string} filterName
 * @param {*} input
 * @param {string[]} filterArgs
 * @returns {*}
 */
var executeFilter = function(filterName, input, filterArgs) {
  assertIsString(filterName);
  assertIsArray(filterArgs);
  if (filterName === '') {
    return input;
  }

  var filter = _filters[filterName];
  if (typeof filter !== 'function') {
    throw new Error('No filter by the name ' + filterName);
  }

  return filter(input, filterArgs);
};

/**
 * @param input {string}
 * @param context {ParseContext}
 * @returns {string}
 */
var parseTags = function(input, context) {
  return input;
};

/**
 * @param {string} innerTag
 * @param {Context} context
 * @returns {string}
 */
var parseVariable = function(innerTag, context) {
  assertIsString(innerTag);

  var splits = splitContainingQuotedStrings(innerTag, '|');
  var variableBase = splits.shift().trim();

  /** @type {{name:string, args:string[]}[]} */
  var filters = splits.map(function(e) {
    var argParts = e.match(/^([^:]+)(?::(.*))?$/);
    var filterName = argParts[1].trim();
    var filterArgs = splitContainingQuotedStrings(argParts[2], ',');
    filterArgs = filterArgs
      .map(String.prototype.trim)
      .map(function(e) {
        parseValue(e, context);
      });

    return {
      name: filterName,
      args: filterArgs,
    };
  });

  var accumulator = parseValue(variableBase, context);
  for (var i = 0; i < filters.length; i++) {
    var filter = filters[i];
    accumulator = executeFilter(filter.name, accumulator, filter.args);
  }

  if (accumulator === null || typeof accumulator === 'undefined') {
    accumulator = '';
  }

  return accumulator;
};

/**
 * @param input {string}
 * @param context {ParseContext}
 * @returns {string}
 */
var parseVariables = function(input, context) {

  var lastIndex = -1;
  var keepLooping = true;
  do {
    var index = input.indexOf(VARIABLE_OPENING_SYMBOL, lastIndex);

    if (index !== -1) {
      if (input[index - 1] === '\\') {
        lastIndex = index + VARIABLE_OPENING_SYMBOL.length - 1;
        input = input.substr(0, index - 1) + input.substr(index);
        continue;
      }

      /**@type {string[]}*/
      var splits = splitContainingQuotedStrings(
          input.substr(index + VARIABLE_OPENING_SYMBOL.length),
          VARIABLE_CLOSING_SYMBOL,
          2);

      /**@type {string}*/
      var value = '' + parseVariable(splits[0], context);

      var start = input.substr(0, lastIndex);
      var endIndex = index +
          splits[0].length +
          VARIABLE_OPENING_SYMBOL.length +
          VARIABLE_CLOSING_SYMBOL.length +
          1;
      var end = input.substr(endIndex);
      input = start + value + end;

      lastIndex = index + value.length;
    }
    keepLooping = index > -1 && lastIndex < input.length;
  } while (keepLooping);

  return input;
};

/**
 * Compiles a given string.
 *
 * @param {string} [input=] the string to compile
 * @param {object} [context={}] the context variables for this file
 * @returns {string} the resulting file
 */
var parse = function(input, context) {
  var tagsParsed = parseTags(input, context);
  var variablesParsed = parseVariables(tagsParsed, context);
  return variablesParsed;
};

/**
 * Registers a variable filter with Hyde
 *
 * @param {string} name
 * @param {FilterCallback} f
 */
var addFilter = function(name, f) {
  assertIsString(name);
  assertIsFunction(f);
  _filters[name] = f;
};

addFilter('uppercase', function(e) {
  return String(e).toLocaleUpperCase();
});
addFilter('lowercase', function(e) {
  return String(e).toLocaleLowerCase();
});

/**
 * Compiles a given string.
 *
 * @param {string} [input=] the string to compile
 * @param {object} [context={}] the context variables for this file
 * @returns {string} the resulting file
 */
module.exports = parse;
