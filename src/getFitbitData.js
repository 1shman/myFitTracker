// src/getFitbitData.js
//filler testing

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
  console.log(data['activities-heart'])
  return data['activities-heart']
}

async function getSleep(accessToken) {
  // Calculate the start and end dates for the past week
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 6);

  // Format the dates to 'yyyy-MM-dd'
  const formatDate = (date) => date.toISOString().split('T')[0];
  const start = formatDate(startDate);
  const end = formatDate(endDate);

  // Construct the URL with start and end dates
  const url = `https://api.fitbit.com/1.2/user/-/sleep/date/${start}/${end}.json`;
  const headers = {
    'Authorization': 'Bearer ' + accessToken,
    'Content-Type': 'application/json'
  };

  const response = await fetch(url, {
    method: 'GET',
    headers: headers
  });

  if (!response.ok) {
    console.error('Failed to fetch sleep data:', response.status, response.statusText);
    const errorData = await response.text();
    console.error('Error response data:', errorData);
    throw new Error('Failed to fetch sleep data: ' + response.statusText);
  }

  const data = await response.json();
  console.log('Fetched sleep data:', data);
  return data['sleep'];
}

async function getWeeklySteps(accessToken) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 6);

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  }

  const start = formatDate(startDate);
  const end = formatDate(endDate);

  const url = `https://api.fitbit.com/1/user/-/activities/steps/date/${start}/${end}.json`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch steps data: ' + response.statusText);
  }

  const data = await response.json();
  console.log(data['activities-steps'])
  return data['activities-steps'];
}

module.exports = {getFitbitData, getHeartRate, getSleep, getWeeklySteps};