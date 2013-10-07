# Finish

*Finish* is a *high performance* nodejs flow control utility that captures
completion of multiple asynchronous calls with a single callback.

## Installation
You can install using Node Package Manager (npm):

    npm install finish

## Quick Examples
```javascript
var finish = require("finish");
finish(function(async) {
  // Any asynchronous calls within this function will be captured
  // Just wrap each asynchronous call with function 'async'.
  // Each asynchronous call should invoke 'done' as its callback.
  // 'done' tasks two arguments: error and result.
  async(function(done) { fs.readFile('hello.txt', done); }
  async(function(done) { fs.readFile('world.txt', done); }
}, function(err, results) {
  // This callback is invoked after all asynchronous calls finish or as soon as an error occurs
  // results is an array that contains result of each asynchronous call
  console.log(results[0], results[1]);
});
```

## `finish(func[, reducer[, initialValue]], callback)`
### Parameters
* `func` -- function that makes asynchronous calls, taking one argument:
  * `async([key, ]done)` -- wrapper function that wraps an asynchronous call.
    * `key` -- If provided, result of this call will be added as a property
      __key__ of the final __results__ object. (See below.)
    * `done` -- callback function for individual asynchronous calls, taking two
      arguments:
      * `err` -- any truthy value of __err__ indicates an error.
      * `result` -- return value of the asynchronous call; it is captured by the
        final __results__.
* `reducer` (optional) -- reduction function to execute on each result, taking
  two arguments:
  * `previousValue` -- The value previously returned in the last invocation of
    the `reducer`, or `initialValue`, if supplied.
  * `currentValue` -- The current result returned by an asynchronous call.
* `initialValue` (optional) -- Object to use as the first argument to the first
  call of the `reducer`. This argument should only be used when an `reducer` is
  presented.
* `callback` -- The final callback that is invoked when all asynchronous calls
  completes or an error occured, taking two arguments:
  * `err` -- If an error occured, `err` is the error. Otherwise, __null__.
  * `results` -- An array of `result` objects returned by all asynchronous
    calls. The order of elements of `results` are not guaranteed. (See
    `finish.ordered` if order guarantee is needed.) `results` is an object
    returned by `Object.create(null)` if `key` argument is used in the first
    `async` call.

## `finish.map`

If you are executing the same function on every item in an array, and want a
callback after all is done? use `finish.forEach`:

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

