[![Build status for master branch](https://travis-ci.org/wolfie/hyde.svg?branch=master)](https://travis-ci.org/wolfie/hyde)

# Hyde - A Website Compiler

Insert actual readme here.

## Parsing priority

* Tags
* Variables (filters, left to right)

## Compile-time variables: `_hyde`

* `time` - The time the compilation was started
* `sourceroot` - the source directory path 
* `targetoot` - the target directory path
* `currentfile` - the name of the file that is currently being compiled

## Variable filters

* `touppercase` - `[any -> string]` Converts the input into an uppercase string
* `tolowercase` - `[any -> string]` Converts the input into an lowercase string
