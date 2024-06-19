// index.js
const express = require("express")
const path = require("path")
const ejs = require("ejs")
const session = require('express-session');
const collection = require("./mongodb")
const getFitbitData = require('./getFitbitData');
const axios = require('axios');

const templatePath = path.join(__dirname, "../templates")

const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.set('view engine', 'ejs')
app.set("views", templatePath)
app.use(session({
  secret: 'mumbojumbo', //secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if HTTPS
}))
app.use(express.static(path.join(__dirname, '../public')))

const clientID = "23PJVV"
const clientSecret = "3b6ffef79eb778b0723b95deae687708"
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
    password: req.body.password
  }

  await collection.insertMany([data])

  res.redirect('/connect-fitbit')
  // res.render("home")

})

app.get('/connect-fitbit', (req, res) => {
  const authUrl = `https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=profile&expires_in=604800`;
  res.redirect(authUrl);
});


app.get('/fitbit/callback', async (req, res) => {
  const { code } = req.query;
  console.log(code)

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

      console.log(response)
      const fitbitData = response
      const user = fitbitData.user
      req.session.user = user;
      //TODO LEFT OFF HERE 
      //GET ACCESS/REFRESH TOKENS THEN CALL GETFITBITDATA TO USE TO CREATE REQ.SESSION.USER
      // user.fitbitAccessToken = fitbitData.data.access_token;
      // user.fitbitRefreshToken = fitbitData.data.refresh_token;

      req.session.user = "undefined"
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
        const fitbitData = await getFitbitData();
        const user = fitbitData.user
        req.session.user = user;
        res.redirect("/home")
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
    if (req.session.user){
      res.render("home", {user: req.session.user})
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