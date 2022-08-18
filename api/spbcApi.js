const { curly } = require('node-libcurl');
var cookie = require('cookie');

const CBORMS_URL = "https://fe2-harvester.caci.co.uk/cborms/";

exports.fetchEvents = function() {
    fetch("https://fe2-harvester.caci.co.uk/cborms/pub/brands/9/outlets/555045/events")
  .then((response) => {
    console.log("we have response");
    // Do something with response
  })
  .catch(function (err) {
    console.log("Unable to fetch -", err);
  });
}

/**
 * Fetch ahtoroization token from CBORMS
 */
exports.fetchAuthToken = async function() {
  const { statusCode, data, headers } = await curly.post(`${CBORMS_URL}/pub/brands/login/anonymous`, {
      postFields: JSON.stringify({}),
      httpHeader: [ 
          'Content-Type: application/json', 
      ]
  });
  console.log(data);
  console.log(headers[0]['Set-Cookie']);
  const cookies = headers[0]['Set-Cookie'];
  var parsedSecToken = cookie.parse(cookies[0]);
  var parsedCsrfToken = cookie.parse(cookies[1]);
  console.log(parsedSecToken);
  console.log(parsedCsrfToken);
  return {
    'X-CSRF-TOKEN': parsedCsrfToken['X-CSRF-TOKEN'],
    'X-SEC-TOKEN': parsedSecToken['X-SEC-TOKEN']
  };
}

exports.postReservation = async function(tokens, parameters) {
      const postData  = {
          "session": "Dinner",
          "alias": null,
          "customMealSession": true,
          "reservationDateTime": "2022-09-01T21:45",
          "partySize": "3",
          "numberOfChildren": "0",
          "numberOfAdults": "3",
          "returnUrl": "https://test-harvester.go.mbplc.com/restaurants/eastandwestmidlands/pct-test-lab-555045/tablebooking",
          "specialInstructions": "",
          "selectedMenu": "",
          "menuPath": "",
          "usingEventsApi": false,
          "utmSource": null,
          "utmMedium": null,
          "utmCampaign": null,
          "utmContent": null
          };
  const mergedData = { ...postData, ...parameters };
  console.log("mergedData", JSON.stringify(mergedData));
  const { statusCode, data, headers } = await curly.post(`${CBORMS_URL}/pub/brands/9/outlets/555045/reservations/reserve`, {
      postFields: JSON.stringify(mergedData),
      httpHeader: [ 
          `Cookie: X-CSRF-TOKEN=${tokens['X-CSRF-TOKEN']}; X-SEC-TOKEN=${tokens['X-SEC-TOKEN']}`,
          `X-CSRF-TOKEN: ${tokens['X-CSRF-TOKEN']}`,
          'Accept: application/json', 
          'Content-Type: application/json', 
      ]
  });
  return data;
}