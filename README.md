# Finish.js
======

Finish is a node utility module that provides a simple straight-forward way to catch the completion of multiple asynchronous tasks. 

## Installation
You can install using Node Package Manager (npm):

    npm install finish

## Quick Examples
```javascript
var Finish = require("finish");
var finish = new Finish();
finish.async(function(spawn) { // Open an asynchronous region
  // Now you can make any asynchronous calls
  // Just wrap each asynchronous call with function 'spawn'
  ['file1', 'file2', 'file3'].forEach(function(file) {
    spawn(function(done) { 
      // Your async function should use 'done' as callback, or call 'done' in its callback
      // 'result' passed into 'done' will be collected in the final callback
      fs.readFile(file, done); // done accepts two arguments: err and result
    });
  });
}, function(err, results) {
  // This callback is fired after all asynchronous calls finish
  // results now equals an array of results received from by each 'done'
});
```

## Use __finish__ within recursive functions

Finish can be used within recursive function calls. Just be sure to create a new __finish__ instance in every recursive call. 
Check out the example: [size.js](http://github.com/chaoran/finish/blob/master/examples/size.js) to find out how to use finish to calculate size of a directory.

## Why not use Async.parallel?

[Async.parallel](http://github.com/caolan/async#parallel) accepts an array of continuation functions and runs them in parallel. It also provides a callback function which is fired after all functions finish. 
Finish differs from async.parallel because it does not require asynchronous calls to be collected as an array to be able to run them in parallel and track their completion. After you open an asynchronous region with:
```javascript
finish.async(funciton(spawn){
    // You can write any node code here; just wrap your asynchronous calls with 'spawn'
}, function(err, results){
    
})
```
This gives you more flexiblity. Finish is more expressive.

### Performance: finish vs. async.parallel

Examples folder contains an example which calculates a size of a directory, implemented in both finish and async.parallel.
Here's how they perform on my macbook:

    $ time node size.js
    /Users/chaorany: 89544.774 MB

    real	0m13.756s
    user	0m13.680s
    sys	0m18.190s
    
    $ time node size-async.js 
    /Users/chaorany: 89549.233 MB

    real	0m17.328s
    user	0m17.396s
    sys	0m19.156s