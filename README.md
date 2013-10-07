# Finish
======

*Finish* is a high performance nodejs flow control utility that captures completion of multiple asynchronous calls with a single callback.

## Installation
You can install using Node Package Manager (npm):

    npm install finish

## Quick Examples
```javascript
var finish = require("finish");
finish(function(async) {
  // Any asynchronous calls within this function will be captured
  // Just wrap each asynchronous call with function 'async'
  async(function(done) { fs.readFile('hello.txt', done); }
  async(function(done) { fs.readFile('world.txt', done); }
}, function(err, results) {
  // This callback is invoked after all asynchronous calls finish or as soon as an error occurs
  // results is an array that contains result of each asynchronous call
  console.log(results[0], results[1]);
});
```

## Callback: done

Every asynchronous function within finish should use 'done' as their callback, or call 'done' in their callback. It accepts three arguments: __error__, __result__, __key__.

If you omit the third argument: __key__, __result__ passed to 'done' are collected into an array: __results__ which is passed as an argument to the final callback. If you specify the third argument __key__, __result__ will be collected into an object; each with __key__ as its key. 

For example,
```javascript
finish(function(async) { 
  ['file1', 'file2', 'file3'].forEach(function(file) {
    async(function(done) { 
      fs.lstat(file, function(err, stat) {
        done(err, stat.size, file);
      }); 
    });
  });
}, function(err, results) {
  // results is an object, not an array
  console.log(results)
});
```

## `finish.forEach`

If you are executing the same function on every item in an array, and want a callback after all is done? use `finish.forEach`:

```javascript
finish.forEach(['file1', 'file2', 'file3'], function(file, done) { 
  fs.readFile(file, done)
}, function(err, results) {
  console.log(results)
})
```

## Why not use Async.parallel?

[Async.parallel](http://github.com/caolan/async#parallel) accepts an array of continuation functions and runs them in parallel. It also provides a callback function which is fired after all functions finish. 
Finish differs from async.parallel because it does not require user to pack asynchronous calls into an array to run them in parallel and track their completion. This gives you more flexibility and greatly reduce the lines of plateboiler code you need to write when using Async.parallel.
Moreover, it increase parallelism, which gives you better performance.

## Performance: finish vs. async.parallel

Examples folder contains an example which calculates a size of a directory, implemented in both finish and async.parallel.
Here's how they perform on my macbook:

    $ time node size.js 
    /Users/chaorany: 118740.345 MB

    real  0m14.965s
    user  0m15.224s
    sys 0m20.381s
    
    $ time node size-async.js 
    /Users/chaorany: 118738.366 MB

    real  0m20.036s
    user  0m20.080s
    sys 0m20.458s

(I don't know why returned size is different on my machine. It would be great if you can send me a message if you might know the reason...)

