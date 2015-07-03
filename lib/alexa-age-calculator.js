var APP_ID = 'amzn1.echo-sdk-ams.app.ae05c636-fcc3-4895-a645-37d46c9adcb2';

var AlexaSkill = require('./AlexaSkill');
var agecalc = require('./age-calculator');

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
        var age = agecalc.calculateAge(date);
        speechOutput = age;
        cardTitle = 'How long since ' + date + '?';
        cardContent = age;
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
  var AgeCalculator = new AgeCalculator();
  AgeCalculator.execute(event, context);
};

