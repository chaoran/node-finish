var finish = require('./finish')
  , assert = require('assert')

function echo(value, callback) {
  setTimeout(function() {
    if (value === undefined) {
      callback(new Error('an error occured'));
    } else {
      callback(null, value)
    }
  }, Math.random() * 10);
}

describe('finish', function() {
  var list = [];

  before(function() {
    for (var i = 0; i < 1000; ++i) { list[i] = i; };
  });

  it('should finish all async tasks', function(done) {
    finish(function(async) {
      list.forEach(function(i) {
        async(function(done) { echo(i, done); });
      });
    }, function(err, results) {
      assert.equal(results.length, list.length);
      results.sort(function(a, b) { return a - b; });
      list.forEach(function(i) { assert.equal(results[i], i); });
      done();
    });
  });

  describe('when spawning with keys', function() {
    it('should return an object', function(done) {
      finish(function(async) {
        list.forEach(function(i) {
          async(i, function(done) { echo(i, done); });
        });
      }, function(err, results) {
        assert.equal(typeof results, 'object');
        assert.equal(results instanceof Array, false);
        for (var key in results) {
          assert.equal(key, results[key]);
        }
        done();
      });
    });
  });

  describe('.map()', function() {
    it('should finish async tasks on each element', function(done) {
      finish.map(list, function(i, done) {
        echo(i, done);
      }, function(err, results) {
        assert.equal(results.length, list.length);
        results.sort(function(a, b) { return a - b; });
        list.forEach(function(i) { assert.equal(results[i], i); });
        done();
      });
    });

    describe('when mapping an object', function() {
      it('should map async tasks to each property', function(done) {
        var obj = Object.create(null);

        list.forEach(function(i) { obj[i] = i; });

        finish.map(obj, function(i, done) {
          echo(i, done);
        }, function(err, results) {
          assert.equal(typeof results, 'object');
          assert.equal(results instanceof Array, false);
          for (var key in results) {
            assert.equal(key, results[key]);
          }
          done();
        });
      });
    });
  });

  describe('.ordered()', function() {
    it('should finish async tasks in order', function(done) {
      finish.ordered(function(async) {
        list.forEach(function(i) {
          async(function(done) { echo(i, done); });
        });
      }, function(err, results) {
        assert.equal(results.length, list.length);
        list.forEach(function(i) { assert.equal(results[i], i); });
        done();
      });
    });
  });

  describe('.ordered.map()', function() {
    it('should finish async tasks on each element in order', function(done) {
      finish.ordered.map(list, function(i, done) {
        echo(i, done);
      }, function(err, results) {
        assert.equal(results.length, list.length);
        list.forEach(function(i) { assert.equal(results[i], i); });
        done();
      });
    });
  });

  describe('when invoked with a reducer', function() {
    it('should reduce results before callback', function(done) {
      finish(function(async) {
        list.forEach(function(i) {
          async(function(done) { echo(i, done); });
        });
      }, function(prev, curr) {
        return prev += curr;
      }, 0, function(err, results) {
        assert.equal(results, list.reduce(function(prev, curr) {
          return prev += curr;
        }, 0));
        done();
      });
    });
  });

  describe('when an error occurs', function() {
    it('should invoke callback with an error', function(done) {
      finish(function(async) {
        list.forEach(function(i) {
          async(function(done) { echo(i == 9 ? undefined : i, done); });
        });
      }, function(err, results) {
        assert(err);
        assert.equal(err.message, 'an error occured');
        done();
      });
    });
  });
});

