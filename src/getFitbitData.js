// src/getFitbitData.js

const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

async function refreshToken(refreshTokenValue, clientID, clientSecret){
  const response = await fetch('https://api.fitbit.com/oauth2/token', {
    method: 'POST',
    headers: {
        'Authorization': 'Basic ' + Buffer.from(clientID + ':' + clientSecret).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshTokenValue
    })
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token: ' + response.statusText);
  }

  const data = await response.json();
  console.log("returned data: " + JSON.stringify(data))
  return data;
}

async function getFitbitData(accessToken, refreshTokenValue) {
    let response = await fetch('https://api.fitbit.com/1/user/-/profile.json', {
        method: 'GET',
        headers: {'Authorization': 'Bearer ' + accessToken }
    })

    if (response.status === 401){
      const tokenData = await refreshToken(refreshTokenValue, clientID, clientSecret)
      console.log("New refresh token: " + tokenData.accessToken)
      accessToken = tokenData.access_token
      refreshTokenValue = tokenData.refresh_token

      response = await fetch("https://api.fitbit.com/1/user/-/profile.json", {
        method: 'GET', 
        headers: {
          'Authorization': 'Bearer ' + accessToken
        }
      });
    }
      
    if (!response.ok) {
      console.log(response)
      throw new Error('FitBit Network response was not ok: ' + response.statusText);
    }

    const data = await response.json();
    // console.log(data)
    return data;
}

async function getHeartRate(accessToken){
  const response = await fetch('https://api.fitbit.com/1/user/-/activities/heart/date/today/1w.json', {
    method: 'GET',
    headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch heart rate data: ' + response.statusText);
  }

  const data = await response.json();
  // console.log(data['activities-heart'][0]["value"]["restingHeartRate"])
  console.log(data['activities-heart'])
  // return data['activities-heart'][0]["value"]["restingHeartRate"];
  return data['activities-heart']
}

module.exports = {getFitbitData, getHeartRate};