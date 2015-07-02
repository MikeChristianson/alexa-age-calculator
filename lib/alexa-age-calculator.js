var agecalc = require('./age-calculator');

exports.handler = function (event, context) {
  try {
    console.log("event.session.application.applicationId=" + event.session.application.applicationId);

    if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.ae05c636-fcc3-4895-a645-37d46c9adcb2") {
      context.fail("Invalid Application ID");
    }

    if (event.session.new) {
      onSessionStarted({requestId: event.request.requestId}, event.session);
    }

    if (event.request.type === "LaunchRequest") {
      onLaunch(event.request,
        event.session,
        function callback(sessionAttributes, speechletResponse) {
          context.succeed(buildResponse(sessionAttributes, speechletResponse));
        });
    }  else if (event.request.type === "IntentRequest") {
      onIntent(event.request,
        event.session,
        function callback(sessionAttributes, speechletResponse) {
          context.succeed(buildResponse(sessionAttributes, speechletResponse));
        });
    } else if (event.request.type === "SessionEndedRequest") {
      onSessionEnded(event.request, event.session);
      context.succeed();
    }
  } catch (e) {
    context.fail("Exception: " + e);
  }
};

function onSessionStarted(sessionStartedRequest, session) {
  console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
    + ", sessionId=" + session.sessionId);
}

function onLaunch(launchRequest, session, callback) {
  console.log("onLaunch requestId=" + launchRequest.requestId
    + ", sessionId=" + session.sessionId);

  getWelcomeResponse(callback);
}

function onIntent(intentRequest, session, callback) {
  console.log("onIntent requestId=" + intentRequest.requestId
    + ", sessionId=" + session.sessionId);

  var intent = intentRequest.intent,
    intentName = intentRequest.intent.name;

  if ("CalculateAgeIntent" === intentName) {
    calculateAge(intent, session, callback);
  } else if ("HelpIntent" === intentName) {
    getWelcomeResponse(callback);
  } else {
    throw "Invalid intent";
  }
}

function getWelcomeResponse(callback) {
  var sessionAttributes = {};
  var cardTitle = "Welcome";
  var speechOutput = "Please ask me to calculate the age of something by saying how long has it been since a specific date.";
  var repromptText = speechOutput;
  var shouldEndSession = false;

  callback(sessionAttributes,
    buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

function calculateAge(intent, session, callback) {
  var sessionAttributes = {};
  var cardTitle = intent.name;
  var speechOutput = "Please try again.";
  var repromptText = "Please try again.";
  var shouldEndSession = false;

  var dateSlot = intent.slots.Date;
  if (dateSlot) {
    var date = dateSlot.value;
    console.log('Date provided ' + date);
    try {
      var age = agecalc.calculateAge(date);
      cardTitle = 'How long since ' + date + '?';
      speechOutput = age;
      shouldEndSession = true;
    } catch (e) {
      console.warn('Problem calculating age: ', e.message);
    }
  }

  callback(sessionAttributes,
    buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));

}

function onSessionEnded(sessionEndedRequest, session) {
  console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
    + ", sessionId=" + session.sessionId);
}

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
  return {
    outputSpeech: {
      type: "PlainText",
      text: output
    },
    card: {
      type: "Simple",
      title: title,
      content: output
    },
    reprompt: {
      outputSpeech: {
        type: "PlainText",
        text: repromptText
      }
    },
    shouldEndSession: shouldEndSession
  }
}

function buildResponse(sessionAttributes, speechletResponse) {
  return {
    version: "1.0",
    sessionAttributes: sessionAttributes,
    response: speechletResponse
  }
}