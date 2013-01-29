module.exports = function(finish, callback) {
  var count = 0;
  var results;
  
  finish(function(func) {
    ++count;
    func(function(err, result, reduce) {
      if (err) {
        callback(err, results);
      } else {
        if (results === undefined) results = result;
        else {
          if (reduce) {
            results = reduce(results, result);
          } else {
            if (results instanceof Array) {
              results = results.concat(result);
            } else if (result instanceof Array) {
              results = result.concat(results);
            } else {
              results = new Array(results, result);
            }
          }
        } 

        if (--count === 0) callback(err, results);
      }
    })
  });
};
