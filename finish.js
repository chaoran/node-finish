var util = require("util");
var EventEmitter = require("events").EventEmitter;

var Finish = function(args, ordered, array) {
  switch (args.length) {
    case 2: {
      this.results = [];
      this.callback = args[1];
      this.on('result', this.getDefaultListener(ordered));
    }; break;
    case 4: this.results = args[2];
    case 3: {
      this.callback = args[args.length - 1];
      this.on(
        'result',
        ordered ?
          this.getOrderedListener(args[1], array) :
          this.getUnorderedListener(args[1], array)
      );
    }; break;
    default: throw new Error("Wrong number of arguments");
  }

  var self = this;
  this.count = array === undefined ? 0 : array.length;

  this.once('error', function(err) {
    self.removeAllListeners();
    return self.callback(err);
  });
};

util.inherits(Finish, EventEmitter);

Finish.prototype.kickoff = function() {
  var self = this;

  /** An error occured before kickoff, do nothing. */
  if (EventEmitter.listenerCount(this, "error") === 0) return;

  this.once('end', function() {
    self.removeAllListeners();
    return self.callback(null, self.results);
  });

  if (this.count === 0) this.emit('end');
};

Finish.prototype.done = function(index) {
  var self = this;

  return function(err, result) {
    if (err) self.emit('error', err);
    self.emit('result', result, index);
    if (--self.count === 0) self.emit('end');
  };
};

Finish.prototype.getDefaultListener = function(ordered) {
  var self = this;

  return ordered ?
    function(value, index) { self.results[index] = value; } :
    function(value, index) { self.results.push(value); };
};

Finish.prototype.getUnorderedListener = function(func, array) {
  var self = this;

  function listener(value) {
    self.results = func(self.results, value, array);
  }

  if (this.results !== undefined) return listener;

  return function(value) {
    self.results = value;
    self.removeAllListeners('result');
    self.on('result', listener);
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
      self.removeAllListeners('result');
      self.on('result', listener);
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
  var finish = new Finish(arguments, false);

  func(function(async) {
    finish.count++;
    async(finish.done());
  });

  finish.kickoff();
};

module.exports.ordered = function(func) {
  var finish = new Finish(arguments, true);
  var i = 0;

  func(function(async) {
    finish.count++;
    async(finish.done(i++));
  });

  finish.kickoff();
};

module.exports.map = function(array, async) {
  var args = Array.prototype.slice.apply(arguments);
  var finish = new Finish(args.slice(1), false, array);

  switch (async.length) {
    case 2: array.forEach(function(item) {
      async(item, finish.done());
    }); break;
    case 3: array.forEach(function(item, index) {
      async(item, index, finish.done());
    }); break;
    case 4: array.forEach(function(item, index) {
      async(item, index, array, finish.done());
    }); break;
    default: throw new Error("Wrong number of arguments");
  }

  finish.kickoff();
};

module.exports.ordered.map = function(array, async) {
  var args = Array.prototype.slice.apply(arguments);
  var finish = new Finish(args.slice(1), true, array);

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

