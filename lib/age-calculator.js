"use strict";

var moment = require('moment');
var suppressSuffix = true;

exports.calculateAge = function calculateAge(date) {
  var birthDate = moment(date);
  var isValid = birthDate.isValid();
  if (!isValid) {
    throw new Error('invalid date');
  }
  return birthDate.fromNow(suppressSuffix);
};

exports.text = function test() {
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

