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
    perform(function(err, result, key) {
      if (err) {
        callback(err, 0);
      } else {
        self.results.push(result);
        if (--self.count === 0) callback(null, self.results);
      }
    });
  });
}

module.exports = Finish;

