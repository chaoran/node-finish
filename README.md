# Finish.js
======

Finish is a node utility module that provides a simple straight-forward way to catch the completion of multiple asynchronous tasks. 

## Installation
You can install using Node Package Manager (npm):

    npm install finish

## Quick Examples
```javascript
var finish = require("finish");
finish(function(async) { 
  // Any asynchronous calls within this function will be captured
  // Just wrap each asynchronous call with function 'async'
  ['file1', 'file2', 'file3'].forEach(function(file) {
    async(function(done) { 
      // Your async function should use 'done' as callback, or call 'done' in its callback
      fs.readFile(file, done); 
    });
  });
}, function(err, results) {
  // This callback is fired after all asynchronous calls finish or as soon as an error occurs
  console.log(results[0]);console.log(results[1]);console.log(results[2]);
});
```

## Callback: done

Every asynchronous function within finish should use 'done' as their callback, or call 'done' in their callback. It accepts three arguments: __error__, __result__, __reduce__.

If you omit the third argument: __reduce__, __result__ passed to 'done' are collected into an array: __results__ which is passed to the final callback. If you use a reduce function as the third argument, it is used to reduce results.

For example,
```javascript
finish(function(async) { 
  ['file1', 'file2', 'file3'].forEach(function(file) {
    async(function(done) { 
      fs.lstat(file, function(err, stat) {
        done(err, stat.size, function(a, b){return a+b});
      }); 
    });
  });
}, function(err, result) {
  //result equals the total size of 'file1', 'file2', and 'file3'.
});
```


## Why not use Async.parallel?

[Async.parallel](http://github.com/caolan/async#parallel) accepts an array of continuation functions and runs them in parallel. It also provides a callback function which is fired after all functions finish. 
Finish differs from async.parallel because it does not require user to pack asynchronous calls into an array to run them in parallel and track their completion. This gives you more flexibility and greatly reduce the lines of plateboiler code you need to write when using Async.parallel.

Finish can also be used within a recursive call. 

## Performance: finish vs. async.parallel

Examples folder contains an example which calculates a size of a directory, implemented in both finish and async.parallel.
Here's how they perform on my macbook:

    $ time node size.js 
    /Users/chaorany: 91597.68 MB

    real	0m13.238s
    user	0m13.148s
    sys	0m17.396s
    
    $ time node size-async.js 
    /Users/chaorany: 91598.601 MB

    real	0m15.793s
    user	0m15.861s
    sys	0m17.968s
