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
finish.async(
  function(spawn) {
   // spawn any number of asynchronous tasks here
   ['file1', 'file2', 'file3'].forEach(function(file) {
     // You need to wrap each asynchronous call with 'spawn'
     spawn(function(done) { 
       path.exists(function(err, result) {
         // You need to call 'done' in your async task's callback
         done(err, result);
       });
     });
   });
  }, 
  // This is called after all asynchronous tasks finish
  function(err, results) {
    // results now equals an array of result
  }
);