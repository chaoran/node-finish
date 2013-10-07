# Finish

__Finish__ is a __high performance__ nodejs flow control utility that captures
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

Finish provides four APIs:

```javascript
finish(func[, reducer[, initialValue]], callback);
finish.map(array, async[, reducer[, initialValue]], callback);
finish.ordered(func[, reducer[, initialValue]], callback);
finish.ordered.map(array, async[, reducer[, initialValue]], callback);
```

### finish
#### Syntax
```javascript
finish(func[, reducer[, initialValue]], callback)
```

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
  * `currentValue`: The current `result` returned by an asynchronous call.
  * `key`: the `key` associated with the `async` call if provided.
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
Note that it is __safe__ to pass an function to `async` that executes
__synchronous__. `result` objects passed to `done` is collected into an array if
the optional `key` parameter of `async` is not used. The order of `result`
objects in `results` are not guaranteed. When `key` parameter is used in
`async`, `results` will be an object that has __null__ as prototype; each
`result` will be an property in `results` at the associated `key`.

When using an reducer, the reducer is invoked at every `done` callback with
(`results`, `result`) as arguments. The final `results` is the return value of
the last invocation of reducer. The order of reducer invocation is __not__
guaranteed. One should not use a reducer if `key` argument of `async` is used.

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
  function(prev, curr) { return prev + curr; }, // reduction operator
  0, // initial value (can be omitted in this case)
  function(err, results) { assert.equal(results, 3); }
);
```

### finish.map
#### Syntax
```javascript
finish.map(array, async[, reducer[, initialValue]], callback)
```

#### Parameters
* `array`: An array of elements or an object.
* `async`: If `array` is an instance of Array, `async` will be invoked on every
  element of `array`. Otherwise, `async` will be invoked on `array`'s own
enumerable properties. Depends on how many arguments `async` expects, `async` is
invoked with: `(value, done)`, `(value, index, done)`, and `(value, index,
array, done)`.
  * `element`: the value of the element or property;
  * `index`: the index of the element or the key of the property;
  * `array`: the array or object being traversed;
  * `done`: the callback function for the asynchronous call (Same as in
    `finish`).
* `reducer`(__optional__): Same reduce function as in `finish`. It takes four
  arguments:
  * `previousValue`: Same as in `finish`.
  * `currentValue`: Same as in `finish`.
  * `index`: The index of the corresponding element in `array`, or the
    property name of the corresponding property in `array` object.
  * `array`: The same `array` passed to `finish.map`.
* `initialValue`(__optional__): Same as in `finish`.
* `callback`: Same as in `finish`.

#### Descriptions
This is an syntactic sugar for `finish`. It maps the `async` function onto each
element (or property, if `array` is not an instance of Array) of `array`. Like
`finish`, the order of execution is __not__ guaranteed either.

#### Examples
```javascript
// map an array
finish.map([1, 2, 3], function(value, done) {
  setTimeout(function() { done(null, value); });
}, function(err, results) {
  assert.equal(results, [1, 2, 3]);
});

// map an object
finish.map({ one: 1, two: 2, three: 3}, function(value, done) {
  setTimeout(function() { done(null, value); });
}, function(err, results) {
  assert.equal(results, { one: 1, two: 2, three: 3 });
});
```

### finish.ordered
#### Syntax
```javascript
finish.ordered(func[, reducer[, initialValue]], callback)
finish.ordered.map(array, async[, reducer[, initialValue]], callback)
```

#### Description
These two functions is the same as `finish` and `finish.map` with the addition
of order guarantee. The order of `result` objects in `results` are guaranteed to
be the same as the order of invocation of asynchronous calls. If using a
reducer, the reducer is invoked in the same order as the asynchronous calls
spawned.

## Why not use Async.parallel?

[Async.parallel](http://github.com/caolan/async#parallel) accepts an array of
continuation functions and runs them in parallel. It also provides a callback
function which is fired after all functions finish.  Finish differs from
async.parallel because it does not require user to pack asynchronous calls into
an array to run them in parallel and track their completion. This gives you more
flexibility and greatly reduce the lines of plateboiler code you need to write
when using Async.parallel.  Moreover, it increase parallelism, which gives you
better performance.

## Performance: finish vs. async.parallel

Examples folder contains an example which calculates a size of a directory,
implemented in both finish and async.parallel.
Here's how they perform on my macbook:

    $ time node size.js $HOME
    /Users/chaorany: 109295.691 MB

    real  0m11.690s
    user  0m11.956s
    sys 0m20.838s

    $ time node size-async.js $HOME
    /Users/chaorany: 109295.691 MB

    real  0m14.348s
    user  0m14.679s
    sys 0m21.068s

