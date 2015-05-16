var assert = require("assert");
var util = require("../lib/util.js");

var itAcceptsOnly = function (accepted, f) {
    util.assertIsFunction(f);
    util.assertIsString(accepted);

    var _it = function (desc, f, arg) {
        it(desc, function () {
            f(arg);
        });
    };

    var _but = function (desc, f, arg) {
        it(desc, function () {
            assert.throws(function () {
                f(arg);
            });
        });
    };

    var only = function (accepted, trying, f, arg) {
        if (accepted === trying) {
            _it("accepts " + trying, f, arg);
        } else {
            _but("doesn't accept " + trying, f, arg);
        }
    };

    only(accepted, "strings", f, "string");
    only(accepted, "functions", f, function () {});
    only(accepted, "numbers", f, 1);
    only(accepted, "objects", f, {});
    only(accepted, "booleans", f, true);
    only(accepted, "nulls", f, null);
    only(accepted, "undefineds", f);
    only(accepted, "arrays", f, []);
    only(accepted, "array-likes", f, {0: true, 1: true});
};

describe("Util", function () {
    describe(".assertIsFunction", function () {
        itAcceptsOnly("functions", util.assertIsFunction);
    });
    describe(".assertIsString", function () {
        itAcceptsOnly("strings", util.assertIsString);
    });
    describe(".assertIsArray", function () {
        itAcceptsOnly("arrays", util.assertIsArray);
    });
    describe(".assertIsNumber", function () {
        itAcceptsOnly("numbers", util.assertIsNumber);
    });

    describe(".splitContainingQuotedStrings", function () {
        var split = util.splitContainingQuotedStrings;
        it("returns itself arrayed if nothing is split", function () {
            assert.deepEqual(split("string", "."), ["string"]);
        });

        it("splits as expected without quotes", function () {
            assert.deepEqual(split("hello world", " "), ["hello", "world"]);

        });

        it("doesn't choke on quotes without a split", function () {
            assert.deepEqual(
                split("hello \"world\"", " "),
                ["hello", "\"world\""]
            );
        });

        it("keeps quoted sections togehter", function () {
            assert.deepEqual(
                split("hello \"Hello World\" world", " "),
                ["hello", "\"Hello World\"", "world"]
            );
        });

        it("works with two quoted sections", function () {
            assert.deepEqual(
                split("\"hello world\" \"hello world\"", " "),
                ["\"hello world\"", "\"hello world\""]
            );
        });
    });
});