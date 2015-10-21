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
  var inputs = ['2015-06-12 09:13', '2016-10-01', null];
  _.each(inputs, function (element, index, list) {
    try {
      var age = exports.calculateAge(element);
      console.log(age);
    } catch (e) {
      console.error(e, 'An invalid date was provided', element);
    }
  });
};

//exports.test();
