var finish = require('./lib/finish')
  , array = []

// a async function which does nothing useful
function async_print(value, callback) {
  process.nextTick(function() {
    callback(null, value)
  })
}

finish.ordered(function(async) { 
  for (var i = 0; i< 99; ++i) {
    async(function(done) { async_print(i, done) })
  }
}, function(err, results) {
  console.log(results)
  // output: [0, 1, 2, ..., 99]
})

