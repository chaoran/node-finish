// You need to `npm install async` at current directory to run this example
// This example serves as an performance test to compare async.parallel and finish

var fs = require('fs')
  , path = require('path')
  , async = require('async')

function sizeOfDir(dir, callback) {
  fs.lstat(dir, function(err, stat) {
    if (err) return callback(null, 0);
    if (stat.isFile()) {
      callback(null, stat.size);
    } else if (stat.isDirectory()) {
      fs.readdir(dir, function(err, files) {
        if (err || files.length === 0) {
          callback(err, 0)
        } else {
          var tasks = [];
          files.forEach(function(file) {
            tasks.push(async.apply(sizeOfDir, path.join(dir,file)))
          });
          async.parallel(tasks, function(err, results) {
            if (results.length > 0) {
              callback(err, results.reduce(function(a,b) {
                return a + b;
              }));
            } else {
              callback(err, results);
            }
          })
        }
      })
    } else {
      callback(null, 0)
    }
  });
}
var dir = '/Users/chaorany';
sizeOfDir(dir, function(err, size) {
  if (err) {
    console.error("ERROR:" + err);
  } else {
    total_kb = size / 1024.0;
    total_mb = total_kb / 1024.0;
    console.log("%s: %d MB", dir, total_mb.toFixed(3));
  }
});

