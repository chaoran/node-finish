var fs = require('fs')
  , path = require('path')
  , finish = require('../lib/finish')

// This function computes total size of a directory
function sizeOfDir(dir, callback) {
  fs.lstat(dir, function(err, stat) {
    if (err) return callback(null, 0);
    if (stat.isFile()) return callback(null, stat.size);
    if (!stat.isDirectory()) return callback(null, 0);

    fs.readdir(dir, function(err, files) {
      if (err || files.length === 0) return callback(null, 0);

      finish(function(async) {
        files.forEach(function(file) {
          async(function(done) {
            sizeOfDir(path.join(dir, file), done)
          })
        })
      }, function(err, sizes) {
        var sum = 0
        for (var i = 0, l = sizes.length; i < l; ++i) {
          sum += sizes[i]
        }
        callback(null, sum)
      })
    })
  })
}

var dir = '/Users/chaorany'
sizeOfDir(dir, function(err, size) {
  total_kb = size / 1024.0;
  total_mb = total_kb / 1024.0;
  console.log("%s: %d MB", dir, total_mb.toFixed(3));
})

