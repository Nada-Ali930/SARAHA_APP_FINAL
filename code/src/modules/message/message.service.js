import { NotFoundException } from "../../common/utils/index.js"
import { createOne, find, findOne, findOneAndDelete, messageModel, userModel } from "../../DB/index.js"


export const sendMessage =async(receiverId,{content=undefined}={},files,user)=>{
   const account = await findOne({     //check account exist
      model:userModel,
      filter:{ _id:receiverId , confirmEmail:{ $exists:true } }
   })
   if(!account){
      throw NotFoundException({message:"Fail to find matching reciever ccount"})
   }
   const message = await createOne({
      model:messageModel,
      data:{
         content,
         attachments:files.map((file)=>file.finalPath),
         receiverId,
         senderId: user ? user._id :undefined
      }
   })
   return message
}


export const getMessage =async(messageId,user)=>{
   const message = await findOne({    
      model:messageModel,
      filter:{ _id:messageId , $or:[{senderId:user._id},{receiverId:user._id}] },
      select:"-senderId"
   })
   if(!message){
      throw NotFoundException({message:"Invalid message or not authorized action"})
   }
   
   return message
}


export const getMessages =async(user)=>{
   const messages = await find({    
      model:messageModel,
      filter:{ $or:[{senderId:user._id},{receiverId:user._id}] },
      select:"-senderId"
   })
   
   return messages
}


export const deleteMessage =async(messageId,user)=>{
   const message = await findOneAndDelete({    
      model:messageModel,
      filter:{ _id:messageId,receiverId:user._id },
      select:"-senderId"
   })
   if(!message){
      throw NotFoundException({message:"Invalid message or not authorized action"})
   }
   return message
}