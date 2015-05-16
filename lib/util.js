/**
 * @param {*} value
 * @param {string} type
 * @param {string} [errorMsg]
 */
var assertIsType = function (value, type, errorMsg) {
    if (typeof value !== type) {
        var message = errorMsg ? errorMsg : "Expected type " + type + ". Instead got type " + typeof(value) + " (value: " + value + ")";
        throw new Error(message);
    }
};

/**
 * @param {Array} array
 * @param {string} [errorMsg] A custom error message to display
 */
var assertIsArray = function (array, errorMsg) {
    if (array.constructor !== Array) {
        var message = errorMsg ? errorMsg : "Expected type array. Instead got type " + typeof(array) + " (value: " + array + ")";
        throw new Error(message);
    }
};

/**
 * @param {string} string
 * @param {string} [errorMsg] A custom error message to display
 */
var assertIsString = function (string, errorMsg) {
    assertIsType(string, "string", errorMsg);
};

/**
 * @param {function} f
 * @param {string} [errorMsg] A custom error message to display
 */
var assertIsFunction = function (f, errorMsg) {
    assertIsType(f, 'function', errorMsg);
};

/**
 * @param {number} n
 * *param {string} [errorMsg] A custom error message to display
 */
var assertIsNumber = function (n, errorMsg) {
    assertIsType(n, 'number', errorMsg);
};

/**
 * Split a string according to a separator without splitting inside a quoted string bit
 * @param {string} string the string to split
 * @param {string} separator the separator to split with. Its length must be 1
 * @returns {string[]} The parts of the split string
 * @throws {Error} if separator is not one character long.
 */
var splitContainingQuotedStrings = function (string, separator) {
    if (string === null || typeof string === "undefined") { return []; }
    assertIsString(string);
    assertIsString(separator);
    if (separator.length !== 1) {
        throw new Error("separator must be one character long: was " + separator.length +
            " (value: " + separator + ")");
    }

    if (string.indexOf('"') === -1) {
        return string.split(separator);
    }

    var splits = [];
    var insideQuotes = false;
    var partStart = 0;
    for (var i = 0; i < string.length; i++) {

        var c = string.charAt(i);
        var c2 = string.charAt(i + 1);
        if (c === '\\' && (c2 === '"' || c2 === separator)) {
            i++;
        }

        else if (c === '"') {
            insideQuotes = !insideQuotes;
        }

        else if (!insideQuotes && c === separator) {
            splits.push(string.substring(partStart, i));
            partStart = i + 1;
        }
    }

    if (partStart != string.length) {
        splits.push(string.substring(partStart, string.length));
    }

    return splits;
};

module.exports.assertIsFunction = assertIsFunction;
module.exports.assertIsString = assertIsString;
module.exports.assertIsArray = assertIsArray;
module.exports.assertIsNumber = assertIsNumber;
module.exports.splitContainingQuotedStrings = splitContainingQuotedStrings;