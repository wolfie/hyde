var fs = require("fs");
var path = require("path");
var parse = require("./hyde-parse");
var assertIsString = require("./lib/util.js").assertIsString;

/**
 * Hyde's predefined constants in a Context
 *
 * @typedef {object} HydeContext
 * @param {string} targetroot
 * @param {string} sourceroot
 * @param {string} currentfile
 * @param {Date} time
 */

/**
 * The context for Hyde processing
 *
 * @typedef {object} Context
 * @param {HydeContext} _hyde
 */

/** @type Context */
var context = {
    "_hyde": {
        "targetroot": "",
        "sourceroot": "",
        "currentfile": "",
        "time": new Date()
    }
};

/**
 * The walk function's callback
 *
 * @callback walk~callback
 * @param {Error} err error object
 * @param {string[]} results the paths of all files that were found
 */

/**
 * Walk a directory and its subdirectories, and call a method on each of the files within
 * <p>
 * Found at http://stackoverflow.com/revisions/5827895/6
 * @param {string} dir the directory to walk
 * @param {walk~callback} done The function to call on each file
 */
var walk = function (dir, done) {
    var results = [];
    fs.readdir(dir, function (err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function (file) {
            file = path.resolve(dir, file);
            fs.stat(file, function (err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function (err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    results.push(file);
                    if (!--pending) done(null, results);
                }
            });
        });
    });
};

/**
 * Deletes a path and all its contents.
 * <p>
 * Found at http://stackoverflow.com/revisions/12761924/4
 *
 * @param {string} path the path to be deleted
 */
var deleteFolderRecursive = function (path) {
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (file) {
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

/**
 * Processes a single file through Hyde.
 *
 * @param {string} file the path of the file to compile
 */
var processFile = function (file) {
    var suffix = /(\.html|\.css|\.md|\.markdown)$/i;
    if (!suffix.test(file)) return;

    var relativeFile = file.substr(context._hyde.sourceroot.length);
    var targetAbsoluteFile = context._hyde.targetroot + relativeFile;
    var targetDir = path.dirname(targetAbsoluteFile);

    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir);
    }

    var text = fs.readFileSync(file, {"encoding": "utf-8"});

    context._hyde.currentfile = relativeFile;
    var parsed = parse(text, context);

    fs.writeFileSync(targetAbsoluteFile, parsed);
};

/**
 * Entry point for starting to compile files.
 *
 * @param {string} sourcePath the source path. By default current work directory.
 * @param {string} targetPath the target path. By default sourcePath+"/_site".
 */
var entry = function (sourcePath, targetPath) {
    if (typeof sourcePath === 'undefined' || sourcePath === null)
        sourcePath = process.cwd();
    else
        assertIsString(sourcePath, "Source path must be a string");

    if (typeof targetPath === 'undefined' || targetPath === null)
        targetPath = path.resolve(sourcePath, "_site");
    else if (typeof targetPath !== 'string') {
        console.error("Target path must be a string");
        process.exit(1);
    }

    context._hyde.sourceroot = sourcePath;
    context._hyde.targetroot = targetPath;

    deleteFolderRecursive(targetPath);

    walk(sourcePath, function (err, files) {
        if (err) throw err;
        files.forEach(processFile);
    });
};

module.exports = entry;