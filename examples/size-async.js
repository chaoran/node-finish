// You need to `npm install async` at current directory to run this example
// This example serves as an performance test to compare async.parallel and finish

var fs = require('fs')
  , path = require('path')
  , async = require('async')

function sizeOfDir(dir, callback) {
  fs.lstat(dir, function(err, stat) {
    if (err) return callback(null, 0);
    if (stat.isFile()) return callback(null, stat.size);
    if (!stat.isDirectory()) return callback(null, 0);

    fs.readdir(dir, function(err, files) {
      if (err || files.length === 0) return callback(null, 0)

      var tasks = [];
      files.forEach(function(file) {
        tasks.push(async.apply(sizeOfDir, path.join(dir,file)))
      })
      async.parallel(tasks, function(err, results) {
        var sum = 0
        for (var i = 0, l = results.length; i < l; ++i) {
          sum += results[i]
        }
        callback(null, sum)
      })
    })
  })
}

var dir = '/Users/chaorany';
sizeOfDir(dir, function(err, size) {
  total_kb = size / 1024.0;
  total_mb = total_kb / 1024.0;
  console.log("%s: %d MB", dir, total_mb.toFixed(3));
});

