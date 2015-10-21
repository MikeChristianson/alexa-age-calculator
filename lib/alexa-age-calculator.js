var APP_ID = 'amzn1.echo-sdk-ams.app.ae05c636-fcc3-4895-a645-37d46c9adcb2';

var AlexaSkill = require('./AlexaSkill');
var agecalc = require('./age-calculator');
var _ = require('underscore');

var AgeCalculator = function () {
  AlexaSkill.call(this, APP_ID);
};

AgeCalculator.prototype = Object.create(AlexaSkill.prototype);
AgeCalculator.prototype.constructor = AgeCalculator;

AgeCalculator.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
  console.log("AgeCalculator onSessionStarted requestId: " + sessionStartedRequest.requestId
    + ", sessionId: " + session.sessionId);
};

AgeCalculator.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
  console.log("AgeCalculator onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
  var speechOutput = "Please ask me to calculate the age of something by saying how long has it been since a specific date.";
  var repromptSpeech = speechOutput;
  var cardTitle = "Welcome";
  var cardContent = speechOutput;
  response.askWithCard(speechOutput, repromptSpeech, cardTitle, cardContent);
};

AgeCalculator.prototype.eventHandlers.onSessionEnded = function (sessionEndedRequest, session) {
  console.log("AgeCalculator onSessionEnded requestId: " + sessionEndedRequest.requestId
    + ", sessionId: " + session.sessionId);
};

AgeCalculator.prototype.intentHandlers = {
  CalculateAgeIntent: function (intent, session, response) {
    var speechOutput = 'Sorry, I couldn\'t understand the date you provided.';
    var cardTitle = 'Date not understood.';
    var cardContent = speechOutput;

    var dateSlot = intent.slots.Date;
    if (dateSlot) {
      var date = dateSlot.value;
      console.log('Date provided ' + date);
      try {
        var result = agecalc.calculateAge(date); //e.g., { timeago: '3 months',
        var measuredDifferences = result['differences'];
        //differences:
        //  [ [ 'years', 0 ],
        //    [ 'months', 2 ],
        //    [ 'weeks', 11 ],
        //    [ 'days', 78 ] ] }

        measuredDifferences = _.map(measuredDifferences, function (elem) { //e.g., ['days', -78] --> ['days', 78]
          return [_.first(elem), Math.abs(_.last(elem))];
        });

        var measurements = _.filter(measuredDifferences, function (elem) { //e.g., ['weeks', 1]
          return _.last(elem) > 0;
        });
        var bestMeasurement = measurements.shift();

        //TODO check whether date requested is in the future and, if so, change speech output accordingly
        speechOutput = 'The length of time between now and ' + date + ' is about ' + _.last(bestMeasurement) + ' ' + _.first(bestMeasurement);

        var nextMeasurement = measurements.shift();
        if (nextMeasurement) {
          speechOutput += ' or ' + _.last(nextMeasurement) + ' ' + _.first(nextMeasurement);
        }
        speechOutput += '.';

        cardTitle = 'How long since ' + date + '?';
        cardContent = speechOutput;
      } catch (e) {
        console.warn('Problem calculating age: ', e.message);
      }
    }
    response.tellWithCard(speechOutput, cardTitle, cardContent);
  },
  HelpIntent: function (intent, session, response) {
    response.ask("Please ask me to calculate the age of something by saying how long has it been since a specific date.");
  }
};

exports.handler = function (event, context) {
  var ageCalculator = new AgeCalculator();
  ageCalculator.execute(event, context);
};

var test = function test() {
  var intent = {
    "name": "CalculateAgeIntent",
    "slots": {
      "Date": {
        "name": "Date",
        "value": "2016-10-01"
      }
    }
  };
  var response = {
    tellWithCard: function (speechOutput, cardTitle, cardContent) {
      console.log('Speech output', speechOutput, 'Card title', cardTitle, 'Card content', cardContent);
    }
  };
  AgeCalculator.prototype.intentHandlers.CalculateAgeIntent(intent, undefined, response);
};

//test();