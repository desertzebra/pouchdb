'use strict';

var PouchDB = require('../..');
var pre = document && document.getElementById('output');

var ua = new window.UAParser();
var userAgent = {
  browser: ua.getBrowser(),
  device: ua.getDevice(),
  engine: ua.getEngine(),
  cpu: ua.getCPU(),
  os : ua.getOS(),
  userAgent: window.navigator.userAgent
};

function Reporter() {
  this.results = {};
}

function log(msg) {
  if (pre) {
    pre.innerHTML = pre.innerHTML + msg;
  }
}

Reporter.prototype.log = function (msg) {
  log('<br/>' + msg + '<br/>');
};
Reporter.prototype.start = function (testCase) {
  var key = testCase.name;
  log('Starting test: ' + key + ' with ' + testCase.assertions +
    ' assertions and ' + testCase.iterations + ' iterations... ');
  this.results[key] = {
    start: Date.now()
  };
};

Reporter.prototype.end = function (testCase) {
  var key = testCase.name;
  var obj = this.results[key];
  obj.end = Date.now();
  obj.duration = obj.end - obj.start;
  log('done in ' + obj.duration + 'ms\n');
};

Reporter.prototype.complete = function () {
  var self = this;
  this.results.completed = true;
  console.log(this.results);
  console.log(userAgent);
  var url = require('./constants').reportsUrl;
  new PouchDB(url).then(function (db) {
    var date = new Date();
    return db.put({
      _id : date.toJSON() + '-' + Math.random(),
      date : date.toJSON(),
      ts : date.getTime(),
      userAgent : userAgent,
      results : self.results
    });
  }).catch(function (err) {
    console.log(err);
  });
  log('\nTests Complete!\n\n');
};

module.exports = Reporter;