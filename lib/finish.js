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
        callback(err, 0);
      } else {
        if (typeof result === 'array') {
          for (var i = 0, l = result.length; i < l; ++i) {
            self.results.push(result[i]);
          }
        } else {
          self.results.push(result);
        }
        if (--self.count === 0) callback(err, self.results);
      }
    });
  });
}

module.exports = Finish;

