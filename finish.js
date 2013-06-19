var Finish = function(callback) {
  this.count = 0;
  this.end = false;
  this.results = [];
  this.callback = callback;
}

Finish.prototype.done = function(err, result) {
  if (this.error) return;
  if (err) { this.error = err; return this.callback(err); }
  this.results.push(result);
  if (--this.count === 0 && this.end) this.callback(null, this.results);
}

module.exports = function(body, callback) {
  var finish = new Finish(callback);
  var done = finish.done.bind(finish);

  body(function(async) {
    if (finish.error) return;
    finish.count++;
    async(done);
  });
  
  finish.end = true
}

module.exports.forEach = function(list, async, callback) {
  var finish = new Finish(callback);
  var done = finish.done.bind(finish);

  finish.count = list.length;

  switch (async.length) {
    case 2: list.forEach(function(item) {
      async(item, done);
    }); break;
    case 3: list.forEach(function(item, index) {
      async(item, index, done);
    }); break;
    case 4: list.forEach(function(item, index, list) {
      async(item, index, list, done);
    }); break;
    default: throw new Error('wrong number of arguments');
  }

  finish.end = true;
}
