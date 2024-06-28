// index.js
const express = require("express")
const path = require("path")
const ejs = require("ejs")
const session = require('express-session');
const {collection, updateTokens, getTokensByName} = require("./mongodb")
const {getFitbitData, getHeartRate} = require('./getFitbitData');
const axios = require('axios');
require('dotenv').config();

const templatePath = path.join(__dirname, "../templates")

const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.set('view engine', 'ejs')
app.set("views", templatePath)
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if HTTPS
}))
app.use(express.static(path.join(__dirname, '../public')))

const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = 'http://localhost:3000/fitbit/callback';

app.get("/", (req, res) => {
  res.render("login")
})

app.get("/signup", (req, res) => {
  res.render("signup")
})

app.post("/signup", async(req, res) => {

  const data={
    name: req.body.name, 
    password: req.body.password,
    access_token: null,
    refresh_token: null
  }

  result = await collection.insertMany([data])
  const user = result[0]
  req.session.userId = user._id
  console.log(req.session.userId)

  res.redirect('/connect-fitbit')
  // res.render("home")
})

app.get('/connect-fitbit', (req, res) => {
  const scopes = encodeURIComponent('profile heartrate');
  const authUrl = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&expires_in=604800`;
  res.redirect(authUrl);
});


app.get('/fitbit/callback', async (req, res) => {
  const { code } = req.query;

  try {
      const response = await axios.post('https://api.fitbit.com/oauth2/token', null, {
          params: {
              client_id: clientID,
              grant_type: 'authorization_code',
              redirect_uri: redirectUri,
              code
          },
          auth: {
              username: clientID,
              password: clientSecret
          },
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
          }
      });

      const tokenData = response
      let accessToken = tokenData.data.access_token;
      let refreshToken = tokenData.data.refresh_token;
      const fitbitData = await getFitbitData(accessToken, refreshToken)
      req.session.accessToken = accessToken
      // await updateTokens(req.session.userId, accessToken, refreshToken)
      //tokens no longer needed because we do a oauth2 sign in upon login

      req.session.user = fitbitData.user;
      console.log(req.session.user)

      res.redirect('/home');
  } catch (error) {
      console.error('Error exchanging code for token:', error);
      res.status(500).send('Authentication failed');
  }
});

app.post("/login", async(req, res) => {

  try {
    const check = await collection.findOne({name: req.body.name})
    
    if (check.password===req.body.password){
      try{
        // const getTokens = await getTokensByName(req.body.name)
        // console.log(getTokens)
        // const fitbitData = await getFitbitData(getTokens.accessToken, getTokens.refreshToken);
        // const user = fitbitData.user
        // req.session.user = user
        res.redirect('/connect-fitbit')
        // res.redirect("/home")
      }catch (error) {
        console.error('Error fetching Fitbit data:', error);
        res.status(500).send('Internal Server Error');
      }
    }
    else{
      res.send("Wrong Password")
    }
  }
  catch{
    res.send("Wrong Username and/or Password")
  }
})

app.get("/home", async(req, res) => {
    if (req.session.user && req.session.accessToken){
      let heartRateValue = await getHeartRate(req.session.accessToken)
      const dateTimes = heartRateValue.map(item => item.dateTime)
      const restingHeartRates = heartRateValue.map(item => item.value.restingHeartRate || null)
      res.render("home", {user: req.session.user, dateTimes: dateTimes, restingHeartRates: restingHeartRates})
    }else{
      res.redirect("/")
    }
})

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err){
      return res.status(500).send('Could not log out.')
    }
    res.clearCookie('connect.sid')
    res.redirect("/")
  })
})

app.listen(3000, ()=>{
  console.log("port connected")
})