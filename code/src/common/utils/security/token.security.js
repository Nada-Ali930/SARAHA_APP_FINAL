import { ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN, SYSTEM_ACCESS_TOKEN_SECRET_KEY, SYSTEM_REFRESH_TOKEN_SECRET_KEY, USER_ACCESS_TOKEN_SECRET_KEY, USER_REFRESH_TOKEN_SECRET_KEY } from "../../../../config/config.js"
import jwt from "jsonwebtoken"
import {randomUUID} from 'node:crypto'
import { findById ,findOne,tokenModel,userModel } from "../../../DB/index.js"
import { BadRequestException, ConflictException, NotFoundException, UnauthorizedException } from "../response/error.response.js"
import { tokenTypeEnum } from "../../enums/security.enum.js"
import { RoleEnum } from "../../enums/user.enum.js"
import { get, revokeTokenKey } from "../../services/index.js"

export const generateToken = async({payload={},secretKey=USER_ACCESS_TOKEN_SECRET_KEY,options={}}={})=>{ //named params
  return jwt.sign(payload,secretKey,options)
}

export const verifyToken = async({token={},secretKey=USER_ACCESS_TOKEN_SECRET_KEY}={})=>{ 
  return jwt.verify(token,secretKey)
}

export const detectSignturesLevel = async(level)=>{
   let signatures = {accessSignture:undefined,refreshSignture:undefined};
   switch (level) {
    case RoleEnum.Admin:
      signatures={accessSignture:SYSTEM_ACCESS_TOKEN_SECRET_KEY,refreshSignture:SYSTEM_REFRESH_TOKEN_SECRET_KEY}
      break;
    default:
      signatures={accessSignture:USER_ACCESS_TOKEN_SECRET_KEY,refreshSignture:USER_REFRESH_TOKEN_SECRET_KEY}
      break;
   }
   return signatures
}

export const getTokenSignture = async({tokenType=tokenTypeEnum.Access,level}={})=>{
  const{accessSignture,refreshSignture}=await detectSignturesLevel(level)
   let signature = undefined;
   switch (tokenType) {
    case tokenTypeEnum.Refresh:
      signature=refreshSignture
      break;
    default:
      signature=accessSignture
      break;
   }
   return signature
}

export const decodeToken = async({token,tokenType=tokenTypeEnum.Access}={})=>{
  const decodedToken = jwt.decode(token) 
  if(!decodedToken?.aud?.length){
     throw BadRequestException({message:"Missing token audience"})
  }
  const [tokenApproach,level] = decodedToken.aud || []
  if(tokenType!==tokenApproach){
    throw ConflictException({message:`unexpected token mechanism we expected ${tokenType} while have used ${tokenApproach}`})
  }

  // if(decodedToken.jti && await findOne({model:tokenModel,filter:{jti:decodedToken.jti}})){
  //   throw UnauthorizedException({message:"Invalid login session"})
  // }
  if(decodedToken.jti && await get(revokeTokenKey({userId:decodedToken.sub,jti:decodedToken.jti}))){
    throw UnauthorizedException({message:"Invalid login session"})
  }
  const secret = await getTokenSignture({tokenType:tokenApproach,level})
  
  const verifiyData= jwt.verify(token,secret)
  const user = await findById({
        model:userModel,
        id:verifiyData.sub
    }) 
    if(!user){
        throw NotFoundException({message:"Not Register Account"})
    }
    // console.log({changeCredentialsTime:user.changeCredentialsTime?.getTime(),iat:decodedToken.iat*1000}); //ms
    if(user.changeCredentialsTime && user.changeCredentialsTime?.getTime()>= decodedToken.iat*1000){
      throw UnauthorizedException({message:"Invalid Login Session"})
    }
    return {user,decodedToken}
}

export const createLoginCredentials = async(user,issuer)=>{
  const {accessSignture,refreshSignture}=await detectSignturesLevel(user.role)
  const jwtid = randomUUID()
  const access_token = await generateToken({
    payload:{sub:user._id,extra:250},
    secretKey:accessSignture,
    options:{
      issuer,
      audience:[tokenTypeEnum.Access,user.role],
      expiresIn:ACCESS_TOKEN_EXPIRES_IN, //1800
      jwtid
    }
  })  
  const refresh_token = await generateToken({
    payload:{sub:user._id,extra:250},
    secretKey:refreshSignture,
    options:{
      issuer,
      audience:[tokenTypeEnum.Refresh,user.role],
      expiresIn:REFRESH_TOKEN_EXPIRES_IN,  //60*60*24*365
      jwtid
    }
  }) 

  return {access_token,refresh_token}
}









// export const createLoginCredentials = async(user,issuer)=>{
//   const {accessSignture,refreshSignture}=await detectSignturesLevel(user.role)
  
//   const access_token = await generateToken({
//     payload:{sub:user._id,extra:250},
//     secretKey:accessSignture,
//     options:{
//       issuer,
//       audience:[tokenTypeEnum.Access,user.role],
//       expiresIn:ACCESS_TOKEN_EXPIRES_IN, //1800
//     }
//   })  
//   const refresh_token = await generateToken({
//     payload:{sub:user._id,extra:250},
//     secretKey:refreshSignture,
//     options:{
//       issuer,
//       audience:[tokenTypeEnum.Refresh,user.role],
//       expiresIn:REFRESH_TOKEN_EXPIRES_IN,  //60*60*24*365
//     }
//   }) 

//   return {access_token,refresh_token}
// }




// const access_token = jwt.sign(
//     {sub:user._id,extra:250},
//     USER_ACCESS_TOKEN_SECRET_KEY ,
//     {
//       subject:user.id,
//       issuer,
//       audience:['web','mobile'],
//       noTimestamp:true,
//       notBefore:60,
//       expiresIn:1800,
//        jwtid
//     }
//   )  //payload secretkey