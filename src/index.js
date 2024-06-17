// index.js
const express = require("express")
const path = require("path")
const ejs = require("ejs")
const collection = require("./mongodb")
const getFitbitData = require('./getFitbitData');
const session = require('express-session');

const templatePath = path.join(__dirname, "../templates")
const app = express()

app.use(express.json())
app.set('view engine', 'ejs')
app.set("views", templatePath)
app.use(express.urlencoded({extended:false}))

app.use(session({
  secret: 'mumbojumbo', // Replace with a strong secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if you are using HTTPS
}))

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

  res.render("home")

})

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
    res.clearCookie('connect.sid'); // Clear the session cookie
    res.redirect("/")
  })
})

app.listen(3000, ()=>{
  console.log("port connected")
})