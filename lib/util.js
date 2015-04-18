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
module.exports.assertIsArray = function (array, errorMsg) {
    if (array.constructor !== Array) {
        var message = errorMsg ? errorMsg : "Expected type array. Instead got type " + typeof(array) + " (value: " + array + ")";
        throw new Error(message);
    }
};

/**
 * @param {string} string
 * @param {string} [errorMsg] A custom error message to display
 */
module.exports.assertIsString = function (string, errorMsg) {
    assertIsType(string, "string", errorMsg);
};

/**
 * @param {function} f
 * @param {string} [errorMsg] A custom error message to display
 */
module.exports.assertIsFunction = function (f, errorMsg) {
    assertIsType(f, 'function', errorMsg);
};