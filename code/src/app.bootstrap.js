import express from "express";
import { authRouter, messageRouter, userRouter } from "./modules/index.js";
import { ORIGINS, PORT } from "../config/config.js";
import { authenticateDB, connectRedis, redisClient } from "./DB/index.js";
import { globalErrorHandling } from "./common/utils/index.js";
import { resolve } from "node:path";
import cors from "cors";
import helmet from "helmet";
import geoip from "geoip-lite"
import {ipKeyGenerator, rateLimit} from "express-rate-limit"
import axios from "axios"
import morgan from 'morgan'
const NODE_ENV = "development";
async function bootstrap() {
  const app = express();
  //convert buffer data
  const fromWhere = async(ip)=>{
    try {
      const response = await axios.get(`https://ipapi.co/${ip}/json`);
      console.log(response.data);
      return response.data
    } catch (error) {
      console.error(error);
    }
  }

  const limiter = rateLimit({
    windowMs:2*60*1000,
    limit: async function(req){
      //  const {country_code} = await fromWhere(req.ip) || {}
      //  return country_code == "EG" ? 5 : 3
      const {country} = geoip.lookup(req.ip)
      console.log(geoip.lookup(req.ip));
       return country == "EG" ? 5 : 0
    }  ,
    requestPropertyName:"ratelimit",
    skipFailedRequests:true,
    // skipSuccessfulRequests:true,
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

  app.set("trust proxy",true)
  app.use(cors(),helmet(), express.json());
  app.use(morgan("common"))
  // app.use(cors(),helmet(),limiter, express.json());
  app.use("/uploads", express.static(resolve("../uploads")));
  //DB
  await authenticateDB();
  await connectRedis();



  //handle application routing
  app.get("/", async(req, res, next) => {
    // console.log(req.ratelimit);
    console.log(await fromWhere(req.ip));
    
    res.send("hello");
  });
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/message", messageRouter);

  //express has bulit in handle middle ware
  app.use(globalErrorHandling);

  //invalid routing
  app.use("{/*dummy}", (req, res) => {
    return res.status(404).json({ message: "invalid application routing" });
  });
  app.listen(PORT, () => {
    console.log(`server is running in port ${PORT} ❤️`);
  });
}

export default bootstrap;

