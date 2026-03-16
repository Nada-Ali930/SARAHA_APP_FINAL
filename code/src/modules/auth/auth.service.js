import { userModel ,findOne,createOne, updateOne, findOneAndUpdate} from "../../DB/index.js"
import { compareHash, ConflictException, BadRequestException,generateEncryption, generateHash, NotFoundException, createLoginCredentials, sendEmail, emailTemplete, createRondomOtp, emailEvent } from "../../common/utils/index.js"
import { EmailEnum, providerEnum} from "../../common/enums/index.js"
import {OAuth2Client} from 'google-auth-library';
import { baseRevokeTokenKey, blockOtpKey, deletekeys, get, incr, keys, maxAttempsOtpKey, otpKey, set, ttl } from "../../common/services/index.js";

const sendEmailOtp = async({email,subject,title}={})=>{
  const isBlockedTTL = await ttl(blockOtpKey({email,subject}))
  
  if(isBlockedTTL>0){
    throw BadRequestException({message:`sorry we cannot request new otp while are blocked please try again after ${isBlockedTTL}`})
  }
  const remainingOtpTTL = await ttl(otpKey({email,subject}))
  if(remainingOtpTTL>0){
    throw BadRequestException({message:`sorry we cannot request new otp while current otp still active please try again after ${remainingOtpTTL}`})
  }
  const maxTrial = await get(maxAttempsOtpKey({email,subject}))
  if(maxTrial>=3){
    await set({
      key:blockOtpKey({email,subject}),
      value:1,
      ttl:7*60  //block 7 minit
    })
     throw BadRequestException({message:`you have reached max trial`})
  }
  const code = await createRondomOtp()
  await set({
    key:otpKey({email,subject}),   // `OTP::User::${email}`
    value:await generateHash({plaintext:`${code}`}),
    ttl:120
  })
  emailEvent.emit("sendEmail",async()=>{
     await sendEmail({
       to:email,
       subject,
       html:emailTemplete({code,title})
     })
     await incr(maxAttempsOtpKey({email,subject}))
  })
  
}


export const signup = async (inputs) =>{
  const {fullName,email,password,phone} = inputs
  const checkUserExist = await findOne({
    model:userModel,
    filter:{email}
  })
  if(checkUserExist){
    return ConflictException({message:"Email Exist"})
  }
  // const salt = await genSalt(SALT_ROUND,'a')  //2a
  const user = await createOne({
    model:userModel,
    data:{
      fullName,
      email,
      // password:await hash(password,SALT_ROUND),   //plaintext,salt
      // password:await hash(password,salt), 
      password:await generateHash({plaintext:password}), //bcrypt
      // password:await generateHash({plaintext:password, approach:HashApproachEnum.argon2}),  //argon2
      phone:await generateEncryption(phone)
    }
  })
  // const code = await createRondomOtp()
  // await set({
  //   key:otpKey({email}),   // `OTP::User::${email}`
  //   value:await generateHash({plaintext:`${code}`}),
  //   ttl:120
  // })
  // await sendEmail({
  //   to:email,
  //   subject:"Confirm-Email",
  //   html:emailTemplete({code,title:"Confirm-Email"})
  // })
  // await set({
  //   key:maxAttempsOtpKey({email}),
  //   value:1,
  //   ttl:360 //6*60 =>s
  // })
  await sendEmailOtp({email,subject:EmailEnum.confirmEmail,title:"varify Email"})
  return user

}

export const confirmEmail = async (inputs) =>{
  const {email,otp} = inputs
  const account = await findOne({
    model:userModel,
    filter:{email,confirmEmail:{$exists:false},provider:providerEnum.System}
  })
  if(!account){
    throw NotFoundException({message:"Fail to find matching account"})
  }
  const hashOtp = await get(otpKey({email,subject:EmailEnum.confirmEmail}))
  if(!hashOtp){
    throw NotFoundException({message:"Expired OTP"})
  }
  if(!await compareHash({plaintext:otp,ciphertext:hashOtp})){
    throw ConflictException({message:"Invalid otp"})
  }
  account.confirmEmail = new Date();
  await account.save()
  await deletekeys(await keys(otpKey({email})))  //prefix 
  return ;

}

export const resendConfirmEmail = async (inputs) =>{
  const {email} = inputs
  const account = await findOne({
    model:userModel,
    filter:{email,confirmEmail:{$exists:false},provider:providerEnum.System}
  })
  if(!account){
    throw NotFoundException({message:"Fail to find matching account"})
  }

  await sendEmailOtp({email,subject:EmailEnum.confirmEmail,title:"Verify Email"})
  return ;

}

export const requestForgotPasswordOtp = async (inputs) =>{
  const {email} = inputs
  const account = await findOne({
    model:userModel,
    filter:{email,confirmEmail:{$exists:true},provider:providerEnum.System}
  })
  if(!account){
    throw NotFoundException({message:"Fail to find matching account"})
  }

  await sendEmailOtp({email,subject:EmailEnum.ForgotPassword,title:"Reset Code"})
  return ;

}

export const verifyForgotPasswordOtp = async (inputs) =>{
  const {email,otp} = inputs
  
  const hashOtp = await get(otpKey({email,subject:EmailEnum.ForgotPassword}))
  if(!hashOtp){
     throw NotFoundException({message:"Expired Otp"})
  }
  if(!await compareHash({plaintext:otp,ciphertext:hashOtp})){
    throw ConflictException({message:"Invalid otp"})
  }
  return ;

}

export const resetForgotPasswordOtp = async (inputs) =>{
  const {email,otp,password} = inputs
  
  await verifyForgotPasswordOtp({email,otp})
  const user = await findOneAndUpdate({
    model:userModel,
    filter:{email,confirmEmail:{$exists:true},provider:providerEnum.System},
    update:{
      password:await generateHash({plaintext:password}),
      changeCredentialsTime:new Date()
    }
  })
  
  if(!user){
    throw NotFoundException({message:"account not exist"})
  }
  const tokenkeys = await keys(baseRevokeTokenKey(user._id)) //logout from all devices
  
  const otpKeys = await keys(otpKey({email,subject:EmailEnum.ForgotPassword}))
  await deletekeys([...tokenkeys,...otpKeys])
  return ;

}


export const login = async (inputs,issuer) =>{
  const {email,password} = inputs
  const user = await findOne({
    model:userModel,
    filter:{
      email,
      provider:providerEnum.System,
      confirmEmail:{$exists:true}
    },
    // select:"-password",
    options:{
      // lean:true
    }
  })
  if(!user){
    return NotFoundException({message:"Invalid login credentials"})
  }

  if (!await compareHash({plaintext:password,ciphertext:user.password})){   //true,false   !await compare(password,user.password
    return NotFoundException({message:"Invalid login credentials"})  
  } //plain text , hash value database
  // user.phone=await generateDecryption(user.phone)

  return createLoginCredentials(user,issuer)
}
// {
//   iss: 'https://accounts.google.com',
//   azp: '574049646501-f6bfdh9fnlrfhd0nndcls14g574idod2.apps.googleusercontent.com',
//   aud: '574049646501-f6bfdh9fnlrfhd0nndcls14g574idod2.apps.googleusercontent.com',
//   sub: '117340449567199716529',
//   email: 'nhsn55988@gmail.com',
//   email_verified: true,
//   nbf: 1772312392,
//   name: 'ندى على عبد الفتاح',
//   picture: 'https://lh3.googleusercontent.com/a/ACg8ocK4XwDQGsvFBo7h-oDKOdC2B9DJflLzvN1OqhcWDBCjN0QgEA=s96-c',
//   given_name: 'ندى',
//   family_name: 'على عبد الفتاح',
//   iat: 1772312692,
//   exp: 1772316292,
//   jti: '5ca45a732bc26a8f06f03028dd744dcab9103972'
// }
const verifyGoogleAccount = async(idToken)=>{
     const client = new OAuth2Client();
      const ticket = await client.verifyIdToken({
        idToken,
        audience: "574049646501-f6bfdh9fnlrfhd0nndcls14g574idod2.apps.googleusercontent.com", 
      });
      const payload = ticket.getPayload();
      if(!payload?.email_verified){
        throw BadRequestException({message:"Fail to verify by google"})
        
      }
     return payload
}



export const LoginWithGmail = async(idToken,issuer)=>{

   const payload = await verifyGoogleAccount(idToken)
   const user = await findOne({
      model:userModel,
      filter:{email:payload.email , provider:providerEnum.Google}
   })
   if(!user){
      throw NotFoundException({message:"Not Register Account"})
   }

   return await createLoginCredentials(user,issuer); 
}

export const signupWithGmail = async(idToken,issuer)=>{

   const payload = await verifyGoogleAccount(idToken)
   console.log(payload);
   const checkUserExist = await findOne({
      model:userModel,
      filter:{email:payload.email}
   })
   if(checkUserExist){
    if(checkUserExist.provider != providerEnum.Google){
      throw ConflictException({message:"Invalid provider"})
    }
    return {status:200,credentials:await LoginWithGmail(idToken,issuer)};  //Login with gmail
   }

   const user = await createOne({
    model:userModel,
    data:{
      firstName:payload.given_name,
      lastName:payload.family_name,
      email:payload.email,
      profilePicture:payload.picture,
      confirmEmail:new Date(),
      provider:providerEnum.Google
    }
   })
   return {status:201,credentials:await createLoginCredentials(user,issuer)};   
}

