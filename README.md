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
  // This callback is invoked after all asynchronous calls finish
  // or as soon as an error occurs
  // results is an array that contains result of each asynchronous call
  console.log(results[0], results[1]);
});
```

## API
###`finish(func[, reducer[, initialValue]], callback)`
#### Parameters
* `func`: function that makes asynchronous calls, taking one argument:
  * `async([key, ]done)`: wrapper function that wraps an asynchronous call.
    * `key`(__optional__): If provided, result of this call will be added as a
      property `key` of the final `results` object. (See below.)
    * `done`: callback function for individual asynchronous calls, taking two
      arguments:
      * `err`: any truthy value of __err__ will cause the final `callback` to
        be invoked immediately.
      * `result`: return value of the asynchronous call; it is captured by the
        final `results`.
* `reducer`(__optional__): reduction function to execute on each result, taking
  two arguments:
  * `previousValue`: The value previously returned in the last invocation of
    the `reducer`, or `initialValue`, if supplied.
  * `currentValue`: The current result returned by an asynchronous call.
* `initialValue`(__optional__): Object to use as the first argument to the first
  call of the `reducer`. It omitted, the first `result` returned by any
asynchronous call will be used as `initialValue`. This argument should only be
used when an `reducer` is presented.
* `callback`: The final callback that will be invoked when all asynchronous
  calls complete or an error occured, taking two arguments:
  * `err`: If an error occured, `err` is the error. Otherwise, __null__.
  * `results`: An array of `result` objects returned by all asynchronous
    calls. The order of elements of `results` are not guaranteed (See
`finish.ordered` if order guarantee is needed). If the optional `key` argument
is used in the first `async` call, `results` will be an object with __null__ as
prototype; `result` will be properties of `results`.

#### Description
`finish` is the free form of finish utility. One should wrap each asynchronous
call with `async` and the asynchronous call should invoke `done` as callback.
Note that it is safe to pass an function to `async` that executes synchronous.
`result` objects passed to `done` is collected into an array if the optional
`key` parameter of `async` is not used. The order of `result` objects in
`results` are not guaranteed. When `key` parameter is used in `async`, `results`
will be an object that has __null__ as prototype; each `result` will be an
property in `results` at the associated `key`.

#### Examples
```javascript
finish(function(async) {
  async(function(done) {
    setTimeout(function() { done(null, 1); }, 100);
  });
  async(function(done) {
    setTimeout(function() { done(null, 2); }, 100);
  });
}, function(err, results) {
  assert.equal(results, [ 1, 2 ]);
});

// "keyed" finish
finish(function(async) {
  async("one", function(done) {
    setTimeout(function() { done(null, 1); }, 100);
  });
  async("two", function(done) {
    setTimeout(function() { done(null, 2); }, 200);
  });
}, function(err, results) {
  assert.equal(results, { one: 1, two: 2 });
});

// with a reducer
finish(
  function(async) {
    async(function(done) {
      setTimeout(function() { done(null, 1); }, 100);
    });
    async(function(done) {
      setTimeout(function() { done(null, 2); }, 200);
    });
  },
  // reduction operator
  function(prev, curr) { return prev + curr; },
  // initial value
  0,
  // callback
  function(err, results) { assert.equal(results, 3); }
);
```

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

