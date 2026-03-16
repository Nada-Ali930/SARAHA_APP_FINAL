import { createClient } from "redis"
import { REDIS_URI } from "../../config/config.js"

export const redisClient = createClient({
    url:REDIS_URI
})

export const connectRedis = async()=>{
    try {
        await redisClient.connect();
        console.log(`REDIS_DB Connected successfuly 💖`);
    } catch (error) {
        console.log(`fail to connect on redis db ❌ ${error}`); 
    }
}