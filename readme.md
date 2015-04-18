# Hyde - A Website Compiler

Insert actual readme here.

## `_hyde`: Compile-time variable
* `time` - The time the compilation was started
* `sourceroot` - the source directory path 
* `targetoot` - the target directory path
* `currentfile` - the name of the file that is currently being compiled

## Finding a suitable `_template`

If `template` is undefined, use following logic for a file `foo/page.html`

1. foo/_template.html
1. _template.html

## Things