var fs = require('fs')
  , path = require('path')
  , finish = require('../lib/finish')

// This function computes total size of a directory
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
          finish(function(async) {
            files.forEach(function(file) {
              // Spawn an asynchronous task
              async(function(done) {
                sizeOfDir(path.join(dir, file), function(err, result) {
                  done(err, result, function(a, b) {
                    return a + b;
                  });
                });
              })
            })
          }, 
          // This will be called after all spawned asynchronous tasks finished
          callback)
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

