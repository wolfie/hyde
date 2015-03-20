"use strict";
var fs = require("fs");
var path = require("path");
var parse = require("./hyde-parse");

var context = {
    "site": {
        "targetroot": "",
        "sourceroot": "",
        "time": new Date()
    }
};

var endsWith = function(haystack, needle) {
    if (typeof haystack !== 'string') throw ('Haystack needs to be a string: '+haystack);
    if (typeof needle !== 'string') throw ('Needle needs to be a string: '+needle);
    haystack = haystack.toLocaleLowerCase();
    needle = needle.toLocaleLowerCase();
    return haystack.indexOf(needle, haystack.length - needle.length) !== -1;
};

var consoleWrite = function(string) {
    process.stdout.write(string);
};

var consoleWriteln = function(string) {
    process.stdout.write(string+'\n');
};

// http://stackoverflow.com/revisions/5827895/6
var walk = function(dir, done) {
    var results = [];
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
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

// http://stackoverflow.com/revisions/12761924/4
var deleteFolderRecursive = function(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.statSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};

var processFile = function(file) {
    var suffix = /(\.html|\.css|\.md|\.markdown)$/i;
    if (!suffix.test(file)) return;

    var relativeFile = file.substr(context.site.sourceroot.length);
    var targetAbsoluteFile = context.site.targetroot+relativeFile;
    var targetDir = path.dirname(targetAbsoluteFile);

    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir);
    }

    var text = fs.readFileSync(file, {"encoding": "utf-8"});
    var parsed = parse(text, context);

    fs.writeFileSync(targetAbsoluteFile, parsed);
};

var entry = function(sourcePath, targetPath) {
    if (typeof sourcePath === 'undefined' || sourcePath === null)
        sourcePath = process.cwd();
    else if (typeof sourcePath !== 'string') {
        console.error("Source path must be a string");
        process.exit(1);
    }

    if (typeof targetPath === 'undefined' || targetPath === null)
        targetPath = path.resolve(sourcePath,"_site");
    else if (typeof targetPath !== 'string') {
        console.error("Target path must be a string");
        process.exit(1);
    }

    context.site.sourceroot = sourcePath;
    context.site.targetroot = targetPath;

    deleteFolderRecursive(targetPath);

    walk(sourcePath, function(err, files) {
        if (err) throw err;
        files.forEach(processFile);
    });
};

module.exports = entry;