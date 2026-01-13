import { ENV } from "./env";
import { createClient } from 'redis';
const redisClient = createClient({
    url: ENV.REDIS_URL,
});

redisClient.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

(async()=>{
    try {
        await redisClient.connect();
        console.log("REDIS IS READY");
    } catch (error) {
        console.log("Failed to connect to Redis: ERROR", error);
    }
})();

export {redisClient};