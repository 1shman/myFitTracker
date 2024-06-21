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
    },
    access_token: {
        type: String, 
        required: false
    }, 
    refresh_token: {
        type: String, 
        required: false 
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

async function getTokensByName(name) {
    try {
      const user = await collection.findOne({ name: name });
      if (!user) {
        throw new Error('User not found');
      }
      return {
        accessToken: user.access_token,
        refreshToken: user.refresh_token
      };
    } catch (error) {
      console.error('Error retrieving tokens:', error);
      throw error;
    }
  }

module.exports={
    collection,
    updateTokens, 
    getTokensByName
};