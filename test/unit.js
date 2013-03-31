var finish = require('../finish')
  , assert = require('assert')

function echo(value, callback) {
  process.nextTick(function() {
    callback(null, value)
  })
}

describe('finish', function() {
  it('should finish all async tasks', function(done) {
    finish(function(async) {
      for (var i = 0; i < 1000; ++i) {
        async(function(done) {
          echo(i, done) 
        })
      }
    }, function(err, results) {
      assert.equal(results.length, 1000)
      results.sort(function(a, b) {
        return a - b
      })
      for (var i = 0; i < 1000; ++i) {
        assert.equal(results[i], i) 
      }
      done()
    })
  })

  describe('.ordered()', function() {
    it('should collect results in order', function(done) {
      finish(function(async) {
        for (var i = 0; i < 1000; ++i) {
          async(function(done) {
            echo(i, done) 
          })
        }
      }, function(err, results) {
        assert.equal(results.length, 1000)
        for (var i = 0; i < 1000; ++i) {
          assert.equal(results[i], i) 
        }
        done()
      })
    })
  })

  describe('.hashed()', function() {
    it('should collect results in a object', function(done) {
      finish.hashed(function(async) {
        for (var i = 0; i < 1000; ++i) {
          async(i, function(done) {
            echo(i, done)
          })
        }
      }, function(err, results) {
        for (var i = 0; i < 1000; ++i) {
          assert.equal(results[i], i) 
        }
        done()
      })
    })
  })

  describe('.reduce()', function() {
    it('should reduce results', function(done) {
      finish.reduce(function(async) {
        for (var i = 0; i < 1000; ++i) {
          async(function(done) {
            echo(i, done)
          })
        }
      }, function(a, b) {
        return a + b
      }, function(err, result) {
        assert.equal(result, 999 * 500)
        done()
      })
    })
  })
})
