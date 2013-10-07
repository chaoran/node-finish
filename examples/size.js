var fs = require('fs')
  , finish = require('../finish')

function sizeOfDir(dir, callback) {
  fs.lstat(dir, function(err, stat) {
    if (err) return callback(err);
    if (!stat.isDirectory()) return callback(null, stat.size);

    fs.readdir(dir, function(err, files) {
      if (err) return callback(err.code === 'EACCES' ? null : err, 0);

      finish.map(files, function(file, done) {
        sizeOfDir(dir + '/' + file, done);
      }, function(sum, value) {
        return sum + value;
      }, 0, callback);
    });
  });
}

var dir = process.argv[2] || process.cwd();

sizeOfDir(dir, function(err, size) {
  if (err) throw err;
  var total_mb = size / 1024 / 1024;
  console.log("%s: %d MB", dir, total_mb.toFixed(3));
})

