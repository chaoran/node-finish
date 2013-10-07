var fs = require('fs')
  , async = require('async')

function sizeOfDir(dir, callback) {
  fs.lstat(dir, function(err, stat) {
    if (err) return callback(err);
    if (!stat.isDirectory()) return callback(null, stat.size);

    fs.readdir(dir, function(err, files) {
      if (err) return callback(err.code === 'EACCES' ? null : err, 0);

      async.parallel(files.map(function(file) {
        return async.apply(sizeOfDir, dir + '/' + file);
      }), function(err, results) {
        if (err) return callback(err);
        return callback(null, results.reduce(function(sum, value) {
          return sum + value;
        }, 0));
      });
    });
  });
}

var dir = process.argv[2] || process.cwd();

sizeOfDir(dir, function(err, size) {
  if (err) throw err;
  total_mb = size / 1024 / 1024;
  console.log("%s: %d MB", dir, total_mb.toFixed(3));
});

