var finish = function(finish, callback) {
  var count = 0 
    , end = false
    , results = []
    , error
  
  finish(function(func) {
    if (error) return;
    ++count
    func(function(err, result) {
      if (error) return
      if (err) { error = err; return callback(err, results) }
      
      results.push(result)
      
      if (--count === 0 && end) {
        callback(err, results)
      }
    })
  })
  end = true
}

finish.hashed = function(finish, callback) {
  var count = 0
    , end = false
    , results = {}
    , error 
  
  function keyedDone(key) {
    return function(err, result) {
      if (error) return;
      if (err) { error = err; return callback(err, results) }
      results[key] = result
      if (--count === 0 && end) callback(err, results)
    }
  }

  finish(function(key, func) {
    if (error) return;
    ++count
    func(keyedDone(key))
  })
  end = true
}

finish.ordered = function(finish, callback) {
  var count = 0
    , end = false
    , results = []
    , error
  
  function orderedDone(index) {
    return function(err, result) {
      if (error) return
      if (err) { error = err; return callback(err, results) }
      results[index] = result
      if (--count === 0 && end) callback(err, results)
    }
  }
  
  finish(function(func) {
    if (error) return;
    func(orderedDone(count++))
  })
  end = true
}

finish.reduce = function(finish, reducer, callback) {
  var count = 0
    , end = false
    , result
    , error

  finish(function(func) {
    if (error) return;
    ++count
    func(function(err, res) {
      if (error) return
      if (err) { 
        error = err 
        return callback(err, result) 
      }

      result = result === undefined? res : reducer(result, res)

      if (--count === 0 && end) callback(err, result)
    })
  })
  end = true
}

module.exports = finish
