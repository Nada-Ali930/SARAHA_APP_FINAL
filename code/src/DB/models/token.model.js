import mongoose from "mongoose";


const tokenSchema = new mongoose.Schema({
  userId:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true},
  jti:{type:String,required:true},
  expiresIn:{type:Date,required:true}

},{
    timestamps:true
})

tokenSchema.index("expiresIn",{expireAfterSeconds:0}); //اول ما توصل الوقت بتاعها تتمسحtimeto live
export const tokenModel = mongoose.model.Token || mongoose.model("Token",tokenSchema)