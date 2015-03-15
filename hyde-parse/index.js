"use strict";
var openTagRegex = /\\{|({{[\s]*(.+?)[\s]*}})|({%[\s]*(.+?)[\s]*%})/g;
var _filters = {};

var parse = function(input, context) {
	if (typeof context !== 'object') {
		context = {};
	}

	var m;
	var replacements = [];
	while ((m = openTagRegex.exec(input)) !== null) {
		if (m.index === openTagRegex.lastIndex) {
			openTagRegex.lastIndex++;
		}

		var result;
		if (typeof m[2] !== 'undefined') {
			result = parseVariable(m[2], m[1], m.index, input, context);
		} else if (typeof m[4] !== 'undefined') {
			result = parseTag(m[4], m[3], m.index, input, context);
		} else {
			result = {
				result: "{",
				end: m.index+2
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
	replacements.forEach(function(replacement) {
		parsed += input.substring(cursor, replacement.start);
		parsed += replacement.result;
		cursor = replacement.end;
	});
	parsed += input.substring(cursor, input.length);

	return parsed;
};

var parseVariable = function(innerTag, outerTag, index, complete, context) {
	assertIsString(innerTag);

	if (typeof outerTag === 'undefined')
		outerTag = "{{"+innerTag+"}}";
	if (typeof index === 'undefined')
		index = 0;
	if (typeof complete === 'undefined')
		complete = innerTag;

	var splits = splitContainingQuotedStrings(innerTag, '|');
	var variableBase = splits.shift().trim();

	var filters = splits.map(function(e,i,a) {
		var argParts = e.match(/^([^:]+)(?::(.*))?$/);
		var filterName = argParts[1].trim();
		var filterArgs = splitContainingQuotedStrings(argParts[2], ',');
		filterArgs = filterArgs
			.map(String.prototype.trim)
			.map(function(e) {parseValue(e, context);});

		return {
            name: filterName,
            args: filterArgs
        };
	});

	var accumulator = parseValue(variableBase, context);
	for (var i=0; i<filters.length; i++) {
		var filter = filters[i];
		accumulator = executeFilter(filter.name, accumulator, filter.args);
	}

	if (accumulator === null || typeof accumulator === 'undefined') {
		accumulator = "";
	}

	return {
		endIndex: index+outerTag.length,
		result: accumulator
	};
};

var splitContainingQuotedStrings = function(string, separator) {
	if (string === null || typeof string === "undefined") return [];
	assertIsString(string);
	assertIsString(separator);
	if (separator.length !== 1) {
		throw "separator must be one character long: was "+separator.length+
			" (value: "+separator+")";
	}

	if (string.indexOf('"') === -1) {
		return string.split(separator);
	}

	var splits = [];
	var insideQuotes = false;
	var partStart = 0;
	for (var i=0; i<string.length; i++) {

		var c = string.charAt(i);
		var c2 = string.charAt(i+1);
		if (c === '\\' && (c2 === '"' || c2 === separator)) {
			i++;
		}

		else if (c === '"') {
			insideQuotes = !insideQuotes;
		}

		else if (!insideQuotes && c === separator) {
			splits.push(string.substring(partStart, i));
			partStart = i+1;
		}
	}

	if (partStart != string.length) {
		splits.push(string.substring(partStart,string.length));
	}

	return splits;
};

var assertIsString = function(string) {
	if (typeof string !== "string") {
		throw "Expected type string. Instead got type "+typeof(string)+" (value: "+string+")";
	}
};
var assertIsArray = function(array) { 
	if (array.constructor !== Array) {
		throw "Expected type array. Instead got type "+typeof(array)+" (value: "+array+")";
	}
 };

var parseValue = function(input, context) {
	if (input.charAt(0) === '"' && input.charAt(input.length-1) === '"') {
		return input.substring(1,input.length-1).replace("\\\"", "\"");
	}

	if (input.match(/^[0-9]/)) {
		return parseFloat(input);
	}

	var getProperty = function(object, property) {
		if (!object.hasOwnProperty(property)) {
			throw "No such variable: "+input;
		}
		return object[property];
	};

	var parts = input.split('.');
	var value = getProperty(context, parts[0]);
	for (var i=1; i<parts.length && typeof value !== 'undefined'; i++) {
		value = getProperty(value, parts[i]);
	}

	return value;
};

var executeFilter = function(filterName, input, filterArgs) {
	assertIsString(filterName);
	assertIsArray(filterArgs);
	if (filterName === "") return input;

	var filter = _filters[filterName];
	if (typeof filter !== 'function') {
		throw "No filter by the name "+filterName;
	}

	return filter(input, filterArgs);
};

var parseTag = function(innerTag, outerTag, index, complete, context) {
	console.warn("unimplemented parseTag");
	return {
		result: "parseTag("+innerTag+")",
		endIndex: index + outerTag.length
	};
};

var addFilter = function(name, f) {
	_filters[name] = f;
};

addFilter("uppercase", function(e, args) { return e.toLocaleUpperCase(); });
addFilter("lowercase", function(e, args) { return e.toLocaleLowerCase(); });

module.exports = parse;