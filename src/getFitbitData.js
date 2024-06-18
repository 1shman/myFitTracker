// src/getFitbitData.js
// module.exports = function() {
//   const access_token = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyM1BKVlYiLCJzdWIiOiI4WTY1WU4iLCJpc3MiOiJGaXRiaXQiLCJ0eXAiOiJhY2Nlc3NfdG9rZW4iLCJzY29wZXMiOiJyc29jIHJlY2cgcnNldCByb3h5IHJwcm8gcm51dCByc2xlIHJjZiByYWN0IHJyZXMgcmxvYyByd2VpIHJociBydGVtIiwiZXhwIjoxNzE4MzMyNzkzLCJpYXQiOjE3MTgzMDM5OTN9.lxv3hyPX8vNxAPHywwu8IKfdUsLo2P6KnXukM_dZccs"
//   fetch("https://api.fitbit.com/1/user/-/profile.json", {
//       method: "GET", 
//       headers: {"Authorization": "Bearer " + access_token}
//     })
//     .then(response => response.json())
//     .then(json => console.log(json)); 
// };

// src/getFitbitData.js

//TODO: store access token and refresk token in mongodb
let accessToken = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyM1BKVlYiLCJzdWIiOiI4WTY1WU4iLCJpc3MiOiJGaXRiaXQiLCJ0eXAiOiJhY2Nlc3NfdG9rZW4iLCJzY29wZXMiOiJyc29jIHJlY2cgcnNldCByb3h5IHJwcm8gcm51dCByc2xlIHJjZiByYWN0IHJyZXMgcmxvYyByd2VpIHJociBydGVtIiwiZXhwIjoxNzE4NzU5NjQ0LCJpYXQiOjE3MTg3MzA4NDR9.UkfoHoiegiuChlHPUSr41GQVH0xrySBpXUMuZs3Y9es"
let refreshTokenValue = "a872f8e7a16f1a2cb1441551c1c828e94cd3d08e7118baecaebf0688d0f2164e"
const clientID = "23PJVV"
const clientSecret = "3b6ffef79eb778b0723b95deae687708"


async function refreshToken(refreshToken, clientID, clientSecret){
  const response = await fetch('https://api.fitbit.com/oauth2/token', {
    method: 'POST',
    headers: {
        'Authorization': 'Basic ' + Buffer.from(clientID + ':' + clientSecret).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    })
  });

  if (!response.ok) {
    throw new Error('Failed to refresh token: ' + response.statusText);
  }

  const data = await response.json();
  console.log("returned data: " + JSON.stringify(data))
  return data;
}

async function getFitbitData() {
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
    console.log(data)
    return data;
}

module.exports = getFitbitData;