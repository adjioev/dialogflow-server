var dfff = require('dialogflow-fulfillment');
const querystring = require('querystring');
var { fetchEvents, fetchAuthToken, postReservation } = require('../api/spbcApi');
const { curly } = require('node-libcurl');
var express = require('express');
const { query } = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', async function(req, res, next) {
    // const authTokenHeader = await fetchAuthToken();
    // const response = postReservation(authTokenHeader, {} );
    res.send('Booking requests');
});

router.post('/', express.json(), function(req, res, next) {
    const agent = new dfff.WebhookClient({ request: req, response: res });

    async function postUserReservation(agent) {
        console.log("params", agent.context.get('session_vars'));
        sessionParams = agent.context.get('session_vars').parameters;
        const numberOfGuests = sessionParams['guest-number'].reduce((a, b) => a + b, 0); // guest number summaup
        console.log("Number fo guests", numberOfGuests);
        const authTokenHeader = await fetchAuthToken();
        const response = await postReservation(authTokenHeader, {
            partySize: numberOfGuests,
            numberOfAdults: numberOfGuests,
            customerDetail: {
              "firstName": sessionParams['reservation-name'].name,
              "phoneNumber": sessionParams['phone-number'],
              "email": sessionParams['reservation-email'],
            //   "surname": "Dzhioev",
              "mailingListIds": [],
              "uncheckedMailingLists": [],
              "doNotUseCEForMarketingPreferences": false
            }
        });
        console.log("Data", response)
        agent.add(`Your reservation has been made.`);
    }




    async function reservatonDemo1(agent) {
        const { statusCode, data, headers } = await curly.post('https://fe2-harvester.caci.co.uk/cborms/pub/brands/login/anonymous', {
            postFields: JSON.stringify({}),
            httpHeader: [ 
                'Content-Type: application/json', 
            ]
        });
        console.log(data);
        console.log(headers[0]['Set-Cookie']);
        const cookies = headers[0]['Set-Cookie'];
        console.log(statusCode);
    }

    async function reservationSessions(agent) {
        console.log("params", agent.context.get('session_vars'));
        sessionParams = agent.context.get('session_vars').parameters;
        const numberOfGuests = sessionParams['guest-number'].reduce((a, b) => a + b, 0); // guest number summaup
        console.log("Number fo guests", numberOfGuests);
        const response = await fetch(`https://fe2-harvester.caci.co.uk/cborms/pub/brands/9/outlets/555045/reservations/sessions/2022-08-23?partySize=7`);
        const data = await response.json();
        const sessionsSet = new Set();
        data.forEach(function(item) {
            sessionsSet.add(item.session);
        } );
        var sessions = Array.from(sessionsSet); 

        console.log("data", data);
        console.log("sessions", sessions);



        // agent.context.set('context_name_1', 10, {'param1' : 'abc'});
        agent.add("At what time would you like to book? We have several meal sessions on the day.");
        sessions.forEach(function(item) {
            agent.add(item);
        } );
    }

    async function demo(agent) {
        agent.add("Sending response from Webhook server, version 1.1");
    }

    async function specialEventsInformation(agent) {
        const response = await fetch("https://fe2-harvester.caci.co.uk/cborms/pub/brands/9/outlets/555045/events");
        const data = await response.json();
        console.log("Data", data)
        agent.add("Let me fetch data: " + data);
    }

    async function NumberOfGuests(agent) {
        agent.add("Number of guests: " + agent.parameters.numberOfGuests);
    }

    var intentMap = new Map();
    intentMap.set('webhookDemo', demo);
    // intentMap.set('customPayloadDemo', customPayloadDemo);
    // intentMap.set('CollectBookingDetails', collectBookingDetails);
    // intentMap.set('special_events_information', specialEventsInformation);
    // intentMap.set('tablebooking.reservation_date', reservationSessions);
    // intentMap.set('tablebooking.reservation_demo', reservatonDemo);
    intentMap.set('tablebooking.user_details - yes', postUserReservation);
    agent.handleRequest(intentMap);


  // res.send('respond with a resource');
  console.log("Boooking requst", req.body);
});

module.exports = router;
