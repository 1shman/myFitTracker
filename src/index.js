// index.js
const express = require("express")
const app = express()
const path = require("path")
const ejs = require("ejs")

const templatePath = path.join(__dirname, "../templates")

app.use(express.json())
app.set("view engine", "ejs")
app.set("views", templatePath)

app.get("/", (req, res) => {
  res.render("login")
})

app.get("/signup", (req, res) => {
  res.render("signup")
})

app.listen(3000, ()=>{
  console.log("port connected")
})