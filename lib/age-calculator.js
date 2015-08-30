"use strict";

var moment = require('moment');
var _ = require('underscore');
var suppressSuffix = true;

var momentMeasurements = ['years', 'months', 'weeks', 'days'];

exports.calculateAge = function calculateAge(date) {
  var now = moment();
  var birthDate = moment(date);
  var isValid = birthDate.isValid();
  if (!isValid) {
    throw new Error('invalid date');
  }

  var differences = _.map(momentMeasurements, function (measurement) { //e.g., [0, 0, 1, 6]
    return now.diff(birthDate, measurement);
  });

  var measuredDifferences = _.zip(momentMeasurements, differences); //e.g., [['years', 0], ['months', 0], ['weeks', 1], ['days', 0]]

  return {'timeago': birthDate.fromNow(suppressSuffix), 'differences': measuredDifferences};
};

exports.test = function test() {
  var input = '2015-06-12 09:13';
  try {
    var age = exports.calculateAge(input);
    console.log(age);
  } catch (e) {
    if (e.message === 'invalid date') {
      console.log('An invalid date was provided. Try something like ' + input);
    }
  }
};

//exports.test();
