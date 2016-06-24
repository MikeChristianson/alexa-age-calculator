var APP_ID = 'amzn1.echo-sdk-ams.app.ae05c636-fcc3-4895-a645-37d46c9adcb2';

var AlexaSkill = require('./AlexaSkill');
var agecalc = require('./age-calculator');
var _ = require('underscore');

var AgeCalculator = function () {
  AlexaSkill.call(this, APP_ID);
};

AgeCalculator.prototype = Object.create(AlexaSkill.prototype);
AgeCalculator.prototype.constructor = AgeCalculator;

AgeCalculator.prototype.DEFAULT_HELP_PROMPT = "Age Calculator. You can ask to calculate the time between now and a specific date. What date would you like to use?";
AgeCalculator.prototype.DEFAULT_SUPPORTIVE_PROMPT = 'I can only calculate based on exact dates, like June twelfth, 2015. What date would you like to use?.';
AgeCalculator.prototype.DEFAULT_STOP_RESPONSE = "Good-bye";

AgeCalculator.prototype.eventHandlers.onSessionStarted = function (sessionStartedRequest, session) {
  console.log("AgeCalculator onSessionStarted requestId: " + sessionStartedRequest.requestId
    + ", sessionId: " + session.sessionId);
};

AgeCalculator.prototype.eventHandlers.onLaunch = function (launchRequest, session, response) {
  console.log("AgeCalculator onLaunch requestId: " + launchRequest.requestId + ", sessionId: " + session.sessionId);
  var speechOutput = this.DEFAULT_HELP_PROMPT;
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
    var speechOutput = this.DEFAULT_SUPPORTIVE_PROMPT;
    var cardTitle = 'Date not understood.';
    var cardContent = speechOutput;

    var dateSlot = intent.slots.Date;
    if (dateSlot && dateSlot.value) {
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
    if (speechOutput == this.DEFAULT_SUPPORTIVE_PROMPT) {
      response.ask(speechOutput);
    } else {
      response.tellWithCard(speechOutput, cardTitle, cardContent);
    }
  },
  HelpIntent: function (intent, session, response) {
    response.ask(this.DEFAULT_HELP_PROMPT);
  },
  StopIntent: function(intent, session, response) {
    response.tell(this.DEFAULT_STOP_RESPONSE);
  }
};

exports.handler = function (event, context) {
  var ageCalculator = new AgeCalculator();
  ageCalculator.execute(event, context);
};

var test = function test() {
  var inputs = [
    {
      "name":  "CalculateAgeIntent",
      "slots": {
        "Date": {
          "name":  "Date",
          "value": "2016-10-01"
        }
      }
    },
    {
      "name":  "CalculateAgeIntent",
      "slots": {
        "Date": {
          "name": "Date"
        }
      }
    }
  ];

  var response = {
    ask: function (speechOutput, repromptSpeech) {
      console.log('Speech output', speechOutput, 'Reprompt speech', repromptSpeech);
    },
    tellWithCard: function (speechOutput, cardTitle, cardContent) {
      console.log('Speech output', speechOutput, 'Card title', cardTitle, 'Card content', cardContent);
    }
  };
  _.each(inputs, function(element, index, list) {
    AgeCalculator.prototype.intentHandlers.CalculateAgeIntent(element, undefined, response);
  });
};

// test();