import { redisClient } from "../../DB/index.js";
import { EmailEnum } from "../enums/email.enum.js";

// `RevokeToken::${userId}::${jti}`
export const baseRevokeTokenKey = (userId)=>{
    return `RevokeToken::${userId.toString()}`
}
// export const otpKey = (email)=>{
//     return  `OTP::User::${email}`
// }
export const otpKey = ({email,subject=EmailEnum.confirmEmail}={})=>{
    return  `OTP::User::${email}::${subject}`
}
export const maxAttempsOtpKey = ({email,subject=EmailEnum.confirmEmail}={})=>{
    return  `${otpKey({email,subject})}::MaxTrial`
}
export const blockOtpKey = ({email,subject=EmailEnum.confirmEmail}={})=>{
    return  `${otpKey({email,subject})}::Block`
}

export const revokeTokenKey = ({userId,jti}={})=>{
    return `${baseRevokeTokenKey(userId)}::${jti}`
}

export const set = async({
    key,
    value,
    ttl
}={})=>{
   try {
     let data = typeof value === "string" ? value : JSON.stringify(value)
     return ttl ? await redisClient.set(key,data,{EX:ttl}) : await redisClient.set(key,data)
   } catch (error) {
     console.log(`fail in redis set operation 🤦‍♂️ ${error}`); 
   }
}

export const update = async({
    key,
    value,
    ttl
}={})=>{
   try {
    if(!await redisClient.exists(key)){ return 0; }
     return await set({key,value,ttl})
   } catch (error) {
     console.log(`fail in redis update operation 🤦‍♂️ ${error}`); 
   }
}


export const get = async(key)=>{
   try {
    try {
        return JSON.parse(await redisClient.get(key))
    } catch (error) {
        return await redisClient.get(key)  // return string
    }
   } catch (error) {
     console.log(`fail in redis get operation 🤦‍♂️ ${error}`); 
   }
}

export const ttl = async(key)=>{
    try {
        return await redisClient.ttl(key)
    } catch (error) {
        console.log(`fail in redis ttl operation 🤦‍♂️ ${error}`); 
    }
}

export const exists = async(key)=>{
    try {
        return await redisClient.exists(key)
    } catch (error) {
        console.log(`fail in redis exists operation 🤦‍♂️ ${error}`); 
    }
}
export const incr = async(key)=>{   //key+1
    try {
        return await redisClient.incr(key)
    } catch (error) {
        console.log(`fail in redis incr operation 🤦‍♂️ ${error}`); 
    }
}

export const expire = async({key,ttl}={})=>{
    try {
        return await redisClient.expire(key)
    } catch (error) {
        console.log(`fail in redis add-expire operation 🤦‍♂️ ${error}`); 
    }
}

export const mGet = async(keys=[])=>{
    try {
        if(!keys.length) return 0;
        return await redisClient.mGet(keys)
    } catch (error) {
        console.log(`fail in redis mGet operation 🤦‍♂️ ${error}`); 
    }
}

export const keys = async(prefix)=>{   //keys user* start with user
     try {
        return await redisClient.keys(`${prefix}*`)
    } catch (error) {
        console.log(`fail in redis keys operation 🤦‍♂️ ${error}`); 
    }
}

export const deletekeys = async(keys)=>{
     try {
        if(!keys.length) return 0;
        return await redisClient.del(keys)
    } catch (error) {
        console.log(`fail in redis del operation 🤦‍♂️ ${error}`); 
    }
}

