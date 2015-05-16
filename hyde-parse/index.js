var assertIsString = require('../lib/util.js').assertIsString;
var assertIsArray = require('../lib/util.js').assertIsArray;
var assertIsFunction = require('../lib/util.js').assertIsFunction;
var splitContainingQuotedStrings = require('../lib/util.js').splitContainingQuotedStrings;

var openTagRegex = /\\{|({{[\s]*(.+?)[\s]*}})|({%[\s]*(.+?)[\s]*%})/g;

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
var parseValue = function (input, context) {
    if (input.charAt(0) === '"' && input.charAt(input.length - 1) === '"') {
        return input.substring(1, input.length - 1).replace("\\\"", "\"");
    }

    if (input.match(/^[0-9]/)) {
        return parseFloat(input);
    }

    var getProperty = function (object, property) {
        if (!object.hasOwnProperty(property)) {
            throw new Error("No such variable: " + input);
        }
        return object[property];
    };

    var parts = input.split('.');
    var value = getProperty(context, parts[0]);
    for (var i = 1; i < parts.length && typeof value !== 'undefined'; i++) {
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
var executeFilter = function (filterName, input, filterArgs) {
    assertIsString(filterName);
    assertIsArray(filterArgs);
    if (filterName === "") {
        return input;
    }

    var filter = _filters[filterName];
    if (typeof filter !== 'function') {
        throw new Error("No filter by the name " + filterName);
    }

    return filter(input, filterArgs);
};

/**
 * Parses and processes the contents of a tag
 *
 * @param {string} innerTag
 * @param {string} outerTag
 * @param {number} index
 * @param {string} complete
 * @param {Context} context
 * @returns {Result}
 */
var parseTag = function (innerTag, outerTag, index, complete, context) {
    console.warn("unimplemented parseTag");
    return {
        result: "parseTag(" + innerTag + ")",
        endIndex: index + outerTag.length
    };
};

/**
 *
 * @param {string} innerTag
 * @param {string} outerTag
 * @param {Number} index
 * @param {string} complete
 * @param {Context} context
 * @returns {Result}
 */
var parseVariable = function (innerTag, outerTag, index, complete, context) {
    assertIsString(innerTag);

    if (typeof outerTag === 'undefined') {
        outerTag = "{{" + innerTag + "}}";
    }

    if (typeof index === 'undefined') {
        index = 0;
    }

    if (typeof complete === 'undefined') {
        complete = innerTag;
    }

    var splits = splitContainingQuotedStrings(innerTag, '|');
    var variableBase = splits.shift().trim();

    /** @type {{name:string, args:string[]}[]} */
    var filters = splits.map(function (e) {
        var argParts = e.match(/^([^:]+)(?::(.*))?$/);
        var filterName = argParts[1].trim();
        var filterArgs = splitContainingQuotedStrings(argParts[2], ',');
        filterArgs = filterArgs
            .map(String.prototype.trim)
            .map(function (e) {
                parseValue(e, context);
            });

        return {
            name: filterName,
            args: filterArgs
        };
    });

    var accumulator = parseValue(variableBase, context);
    for (var i = 0; i < filters.length; i++) {
        var filter = filters[i];
        accumulator = executeFilter(filter.name, accumulator, filter.args);
    }

    if (accumulator === null || typeof accumulator === 'undefined') {
        accumulator = "";
    }

    return {
        endIndex: index + outerTag.length,
        result: accumulator
    };
};

/**
 * Compiles a given string.
 *
 * @param {string} [input=] the string to compile
 * @param {object} [context={}] the context variables for this file
 * @returns {string} the resulting file
 */
var parse = function (input, context) {
    if (typeof context !== 'object') {
        context = {};
    }

    if (typeof input !== 'string') {
        input = "";
    }

    /** @type {{index:number}} */
    var m;

    /** @type Replacement[] */
    var replacements = [];
    while ((m = openTagRegex.exec(input)) !== null) {
        if (m.index === openTagRegex.lastIndex) {
            openTagRegex.lastIndex++;
        }

        var outerVariable = m[1];
        var innerVariable = m[2];
        var outerTag = m[3];
        var innerTag = m[4];

        /** @type {Result} */
        var result;
        if (typeof innerVariable !== 'undefined') {
            result = parseVariable(innerVariable, outerVariable, m.index, input, context);
        } else if (typeof innerTag !== 'undefined') {
            result = parseTag(innerTag, outerTag, m.index, input, context);
        } else {
            result = {
                result: "{",
                endIndex: m.index + 2
            };
        }

        replacements.push({
            result: result.result,
            start: m.index,
            end: result.endIndex
        });
        openTagRegex.lastIndex = result.endIndex;
    }

    var cursor = 0;
    var parsed = "";
    replacements.forEach(
        /** @param {Replacement} replacement */
        function (replacement) {
            parsed += input.substring(cursor, replacement.start);
            parsed += replacement.result;
            cursor = replacement.end;
        });
    parsed += input.substring(cursor, input.length);

    return parsed;
};

/**
 * Registers a variable filter with Hyde
 *
 * @param {string} name
 * @param {FilterCallback} f
 */
var addFilter = function (name, f) {
    assertIsString(name);
    assertIsFunction(f);
    _filters[name] = f;
};

addFilter("uppercase", function (e) {
    assertIsString(e);
    return e.toLocaleUpperCase();
});
addFilter("lowercase", function (e) {
    assertIsString(e);
    return e.toLocaleLowerCase();
});

module.exports = parse;