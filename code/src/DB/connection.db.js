import mongoose from "mongoose"
import { DB_URI } from "../../config/config.js"
import { userModel } from "./models/user.model.js";


export const authenticateDB = async()=>{
  try {
    const result = await mongoose.connect(DB_URI,{serverSelectionTimeoutMS:30000}) 
    await userModel.syncIndexes()
    console.log(`DB connected successfully 👌`);  
  } catch (error) {
    console.log(`Error to connect on DB ❌`);
    console.log(error);
  }
}