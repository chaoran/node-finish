var finish = require('./finish');

function fib(n, callback) {
  if (n < 2) return callback(null, 1);

  finish(function(async) {
    async(function(done) {
      fib(n - 2, done);
    });
    async(function(done) {
      fib(n - 1, done);
    });
  }, function(err, results) {
    callback(null, results[0] + results[1]);
  });
}

function fib2(n, callback) {
  if (n < 2) return callback(null, 1);

  finish.ordered(function(async) {
    async(function(done) {
      fib2(n - 2, done);
    });
    async(function(done) {
      fib2(n - 1, done);
    });
  }, function(err, results) {
    callback(null, results[0] + results[1]);
  });
}

var n = parseInt(process.argv[2]) || 25;
console.log("Comuting fib(%d)...", n);

function benchmark(name, func, callback) {
  var time = process.hrtime();
  func(n, function(err, result) {
    var diff = process.hrtime(time)
      , display = (diff[0] + diff[1] / 1e9).toFixed(2);

    console.log( "%s fib(%d) = %d [%ds]", name, n, result, display);
    callback(null);
  });
}

benchmark("finish:", fib, function() {
  benchmark("finish:", fib2, function() {
  });
});

