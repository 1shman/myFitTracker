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
    },
    access_token: {
        type: String, 
        required: true
    }, 
    refresh_token: {
        type: String, 
        required: true 
    }
})

const collection=new mongoose.model("logInCollection", LogInSchema)

async function updateTokens(userId, newAccessToken, newRefreshToken) {
    try {
        const result = await collection.findByIdAndUpdate(
            userId,
            {
                $set: {
                    access_token: newAccessToken,
                    refresh_token: newRefreshToken
                }
            },
            { new: true }
        );

        if (result) {
            console.log('User tokens updated:', result);
        } else {
            console.log('User not found');
        }
    } catch (error) {
        console.error('Error updating tokens:', error);
    }
}

module.exports={
    collection,
    updateTokens
};