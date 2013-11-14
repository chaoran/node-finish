var noop = function() {};

var Finish = function(args, flavor, array) {
  switch (args.length) {
    case 2: {
      this.results = flavor === "keyed" ? Object.create(null) : [];
      this._callback = args[1];
      this.listener = this.getDefaultListener(flavor);
    }; break;
    case 4: this.results = args[2];
    case 3: {
      this._callback = args[args.length - 1];
      this.listener = flavor === "ordered" ?
          this.getOrderedListener(args[1], array) :
          this.getUnorderedListener(args[1], array);
    }; break;
    default: throw new Error("Wrong number of arguments");
  }

  this.callback = noop;
  this.count = 0;
};

Finish.prototype.kickoff = function() {
  this.callback = this._callback;

  if (this.count === 0) {
    this.callback(null, this.results);
    this.callback = noop;
  }
};

Finish.prototype.done = function(index) {
  var self = this;

  return function(err, result) {
    if (err) {
      self.kickoff = noop;
      self._callback(err);
    } else {
      if (arguments.length > 1) self.listener(result, index);
      if (--self.count === 0) {
        self.callback(null, self.results);
        self.callback = noop;
      }
    }
  };
};

Finish.prototype.getDefaultListener = function(flavor) {
  var self = this;

  return flavor !== undefined ?
    function(value, index) { self.results[index] = value; } :
    function(value, index) { self.results.push(value); };
};

Finish.prototype.getUnorderedListener = function(func, array) {
  var self = this;

  function listener(value, index) {
    self.results = func(self.results, value, index, array);
  }

  if (this.results !== undefined) return listener;

  return function(value) {
    self.results = value;
    self.listener = listener;
  }
};

Finish.prototype.getOrderedListener = function(func, array) {
  var pending = [];
  var next = 0;
  var self = this;

  function listener(value, index) {
    if (next !== index) {
      for (var i = 0, l = pending.length; i < l; ++i) {
        if (pending[i].index > index) {
          pending.splice(i, 0, { index: index, value: value }); break;
        }
      }
      return;
    }

    self.results = func(self.results, value, index, array);
    ++next;

    while (pending.length > 0 && pending[0].index === next) {
      var result = pending.shift();
      self.results = func(self.results, result.value, result.index, array);
      ++next;
    }
  }

  if (self.results !== undefined) return listener;

  return function(value, index) {
    if (index === 0) {
      self.results = value;
      next = 1;
      self.listener = listener;
    } else {
      for (var i = 0, l = pending.length; i < l; ++i) {
        if (pending[i].index > index) {
          pending.splice(i, 0, { index: index, value: value }); break;
        }
      }
    }
  };
};

module.exports = function(func) {
  var finish, done, args = arguments;

  func(function(key, async) {
    if (async === undefined) {
      if (finish === undefined) {
        finish = new Finish(args);
        done = finish.done();
      }
      async = key;
    } else {
      if (finish === undefined) finish = new Finish(args, "keyed");
      done = finish.done(key);
    }

    ++finish.count;
    async(done);
  });

  finish.kickoff();
};

module.exports.ordered = function(func) {
  var finish = new Finish(arguments, "ordered");
  var i = 0;

  func(function(async) {
    ++finish.count;
    async(finish.done(i++));
  });

  finish.kickoff();
};

module.exports.map = function(array, async) {
  var args = Array.prototype.slice.apply(arguments);

  if (array instanceof Array === false) {
    var keys = Object.keys(array);
    var finish = new Finish(args.slice(1), "keyed", array);

    finish.count = keys.length;

    switch (async.length) {
      case 2: keys.forEach(function(key) {
        async(array[key], finish.done(key));
      }); break;
      case 3: keys.forEach(function(key) {
        async(array[key], key, finish.done(key));
      }); break;
      case 4: keys.forEach(function(key) {
        async(array[key], key, array, finish.done(key));
      }); break;
      default: throw new Error("Wrong number of arguments");
    }
  } else {
    var finish = new Finish(args.slice(1), undefined, array);
    var done = finish.done();

    finish.count = array.length;

    switch (async.length) {
      case 2: array.forEach(function(item) {
        async(item, done);
      }); break;
      case 3: array.forEach(function(item, index) {
        async(item, index, done);
      }); break;
      case 4: array.forEach(function(item, index) {
        async(item, index, array, done);
      }); break;
      default: throw new Error("Wrong number of arguments");
    }
  }

  finish.kickoff();
};

module.exports.ordered.map = function(array, async) {
  var args = Array.prototype.slice.apply(arguments);
  var finish = new Finish(args.slice(1), "ordered", array);

  finish.count = array.length;

  switch (async.length) {
    case 2: array.forEach(function(item, index) {
      async(item, finish.done(index));
    }); break;
    case 3: array.forEach(function(item, index) {
      async(item, index, finish.done(index));
    }); break;
    case 4: array.forEach(function(item, index) {
      async(item, index, array, finish.done(index));
    }); break;
    default: throw new Error("Wrong number of arguments");
  }

  finish.kickoff();
};

