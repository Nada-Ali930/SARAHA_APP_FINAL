
import mongoose from "mongoose";
import { genderEnum, providerEnum, RoleEnum} from "../../common/enums/index.js";
import { type } from "os";
const userSchema = new mongoose.Schema({
  firstName:{
    type:String,
    required:true,
    minLength:[2,`firstName cannot be less than 2 char but you have entered a {VALUE}`],
    maxLength:25,
    trim:true  //remove any space
},
  lastName:{
    type:String,
    required:true,
    minLength:[2,"lastName cannot be less than 2 char but uou have entered a {VALUE}"],
    maxLength:25,
    trim:true 
  },
  email:{
    type:String,
    required:[true,"email is mandatory"],
    unique:true  
  },
  password:{type:String,required:function(){
    return this.provider == providerEnum.System
  }},
  phone:String,
  gender:{
    type:Number,
    enum:{values:Object.values(genderEnum)},
    default:genderEnum.Male
  },
  provider:{
    type:Number,
    enum:{values:Object.values(providerEnum)},
    default:providerEnum.System
  },
  profilePicture:String,
  coverProfilePictures:[String],
  gallery:[String], 
  visitCount:{
    type:Number,
    default:0
  },
  confirmEmail:Date,
  changeCredentialsTime:Date,
  oldPassword:[String],
  role:{
    type:Number,
    enum:{values:Object.values(RoleEnum)},
    default:RoleEnum.User
  }
},{
    collection:"Route_Users",
    strict:false,
    timestamps:true,
    autoIndex:true,
    validateBeforeSave:true,
    strictQuery:true, 
    optimisticConcurrency:true,
    toJSON:{virtuals:true} , 
    toObject:{virtuals:true}, 
    // lean:true 
})

userSchema.virtual("fullName").set(function(value){
  const [firstName,lastName] = value?.split(" ") || [] 
  this.set({firstName,lastName})
}).get(function(){
  return this.firstName+" "+this.lastName
})

export const userModel =mongoose.models.User || mongoose.model('User',userSchema); 
