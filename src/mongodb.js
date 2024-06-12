const mongoose = require("mongoose")
// const uri ='mongodb+srv:ishman:xtOUXLxAkBGZhrAi@myfittracker.o3zgybv.mongodb.net/?retryWrites=true&w=majority&appName=myFitTracker'

mongoose.connect("mongodb://localhost:27017/myFitTracker")
.then(()=> {
    console.log("Mongodb connected"); 
})
.catch(()=> {
    console.log("Failed to connect to mongodb")
})

const LogInSchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true
    },
    password: {
        type: String, 
        required: true
    }
})

const collection=new mongoose.model("logInCollection", LogInSchema)

module.exports=collection