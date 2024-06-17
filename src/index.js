// index.js
const express = require("express")
const app = express()
const path = require("path")
const ejs = require("ejs")
const collection = require("./mongodb")
const getFitbitData = require('./getFitbitData');

const templatePath = path.join(__dirname, "../templates")

app.use(express.json())
app.set('view engine', 'ejs')
app.set("views", templatePath)
app.use(express.urlencoded({extended:false}))

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
      res.redirect("/home")
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
  try {
    const fitbitData = await getFitbitData();
    const user = fitbitData.user;
    res.render("home", {user: user})
  }
  catch (error) {
    console.error('Error fetching Fitbit data:', error);
    console.log(error)
    res.status(500).send('Internal Server Error');
  }
})

app.listen(3000, ()=>{
  console.log("port connected")
})