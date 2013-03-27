var finish = module.exports = function(finish, callback) {
  var count = 0 
    , end = false
    , error
    , results
  
  finish(
    // async 
    function(func) {
      if (error) return;

      ++count
      // exec
      func(
        // done
        function(err, result, key) {
          --count
          if (error) return
          if (err) { error = err; return callback(err, results) }
          
          if (result !== undefined) {
            if (results === undefined) {
              results = key === undefined? [] : {}
            }
            
            key = key || results.length
            results[key] = result
          }
          
          if (end && count === 0) {
            callback(err, results)
          }
        }
      )
    }
  )
  end = true
}

finish.ordered = function(finish, callback) {
  var count = 0
    , end = false
    , error
    , results = []
  
  function done(index) {
    return function(err, result) {
      --count
      if (error) return
      if (err) { error = err; return callback(err, results) }

      if (result !== undefined) results[index] = result
      if (end && count === 0) callback(err, results)
    }
  }
  
  finish(
    // async 
    function(func) {
      ++count
      // exec
      func(done(count - 1))
    }
  )
  end = true
}

