var Finish = function() {
  this.count = 0;
  this.results = [];
};

Finish.prototype.async = function(task, callback) {
  var self = this;
  
  this.count = 0;
  this.results = [];
  
  task(function(perform) {
    ++self.count;
    perform(function(err, result) {
      if (err) {
        callback(err, self.results);
      } else {
        if (result instanceof Array) {
          for (var i = 0, l = result.length; i < l; ++i) {
            if (result[i]) self.results.push(result[i]);
          }
        } else {
          if (result) self.results.push(result);
        }
        if (--self.count === 0) {
          callback(err, self.results);
        }
      }
    });
  });
}

module.exports = Finish;
