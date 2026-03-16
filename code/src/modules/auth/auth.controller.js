//routing

import { Router } from "express";
import { confirmEmail, login, requestForgotPasswordOtp, resendConfirmEmail, resetForgotPasswordOtp, signup, signupWithGmail, verifyForgotPasswordOtp } from "./auth.service.js";
import {
  successResponse
} from "../../common/utils/index.js";
import * as validators from "./auth.validation.js"
import { validation } from "../../middleware/validation.middleware.js";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import geoip from "geoip-lite"
import { redisClient } from "../../DB/redis.connection.db.js";
import { deletekeys } from "../../common/services/redis.service.js";
const router = Router(); // = app

  const loginlimiter = rateLimit({
    windowMs:2*60*1000,
    limit: async function(req){
      const {country} = geoip.lookup(req.ip)
      console.log(geoip.lookup(req.ip));
       return country == "EG" ? 5 : 0
    }  ,
    requestPropertyName:"ratelimit",
    // skipFailedRequests:true,
    skipSuccessfulRequests:true,
    standardHeaders:'draft-8',
    keyGenerator:(req,res,next)=>{
      // console.log(req.headers['x-forwarded-for']);
      const ip = ipKeyGenerator(req.ip,56)
      console.log(`${ip}-${req.path}`);
      return `${ip}-${req.path}`
    },
    store:{
      async incr(key,cb){ //get called by keyGenerator
        try {
          const count = await redisClient.incr(key)
          if(count === 1) await redisClient.expire(key,60)
          cb(null,count)
        } catch (error) {
          cb(error)
        }
      },
      async decrement(key){ //  called by skipFailedRequests:true , skipSuccessfulRequests:true
        if(await redisClient.exists(key)){
          await redisClient.decr(key)
        }
      }
    }
  })


//http://127.0.0.1:3000
//https://127.0.0.1:3000
router.post("/login",loginlimiter, validation(validators.loginSchema), async (req, res, next) => {
  const credentials = await login(req.body, `${req.protocol}//${req.host}`);
  await deletekeys(`${req.ip}-${req.path}`)
  return successResponse({ res, data: { ...credentials } });
});

router.post("/signup", validation(validators.signupSchema),async (req, res, next) => {
    const account = await signup(req.body)
    return successResponse({ res, status: 201, data: { account } });
  
});

router.patch("/confirm-email", validation(validators.confirmEmailSchema),async (req, res, next) => {
    await confirmEmail(req.body)
    return successResponse({ res });
  
});

router.patch("/resend-confirm-email", validation(validators.resendConfirmEmailSchema),async (req, res, next) => {
    await resendConfirmEmail(req.body)
    return successResponse({ res });
  
});

router.post("/request-forget-password-code", validation(validators.resendConfirmEmailSchema),async (req, res, next) => {
    await requestForgotPasswordOtp(req.body)
    return successResponse({ res });
  
});

router.patch("/verify-forget-password-code", validation(validators.confirmEmailSchema),async (req, res, next) => {
    await verifyForgotPasswordOtp(req.body)
    return successResponse({ res });
  
});

router.patch("/reset-forget-password-code", validation(validators.resetForgotPasswordSchema),async (req, res, next) => {
    await resetForgotPasswordOtp(req.body)
    return successResponse({ res });
  
});

router.post("/signup/gmail", async (req, res, next) => {
  const { status, credentials } = await signupWithGmail(
    req.body.idToken,
    `${req.protocol}//${req.host}`,
  );
  return successResponse({ res, status, data: { ...credentials } });
});

export default router;




