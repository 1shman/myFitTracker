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

async function getFitbitData() {
    const access_token = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyM1BKVlYiLCJzdWIiOiI4WTY1WU4iLCJpc3MiOiJGaXRiaXQiLCJ0eXAiOiJhY2Nlc3NfdG9rZW4iLCJzY29wZXMiOiJyc29jIHJlY2cgcnNldCByb3h5IHJwcm8gcm51dCByc2xlIHJjZiByYWN0IHJyZXMgcmxvYyByd2VpIHJociBydGVtIiwiZXhwIjoxNzE4MzMyNzkzLCJpYXQiOjE3MTgzMDM5OTN9.lxv3hyPX8vNxAPHywwu8IKfdUsLo2P6KnXukM_dZccs"
    const response = await fetch('https://api.fitbit.com/1/user/-/profile.json', {
        method: 'GET',
        headers: {'Authorization': 'Bearer ' + access_token }
    })

    if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
    }

    const data = await response.json();
    return data;
}

module.exports = getFitbitData;