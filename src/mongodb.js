const mongoose = require("mongoose")

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

const collection=new mongoose.model("Collection1", LogInSchema)

module.exports=collection