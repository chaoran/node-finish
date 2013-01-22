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
      path.exists(function(err, result) {
        // Your async function should call done in its callback
        // 'result' passed into 'done' will be collected in the final callback
        done(err, result);
      });
    });
  });
}, function(err, results) {
  // This callback is fired after all asynchronous calls finish
  // results now equals an array of results received from by each 'done'
});
```

There are more detailed examples in the [examples](http://github.com/chaoran/finish/tree/master/examples) directory.

### Use __finish__ within recursive functions

Finish can be used within recursive function calls. Just be sure to create a new __finish__ instance in every recursive call. 
Check out the example: [size.js](https://github.com/chaoran/finish/blob/master/examples/size.js) to find out how to use finish to calculate size of a directory.
