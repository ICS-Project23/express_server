import redis from "redis"

const redis_client = redis.createClient({
    host: "127.0.0.1",
    port: 6379
});
console.log("Redis client created");

redis_client.on("error", (err) => {
    console.error("Redis error:", err);
});

redis_client.on("connect", () => {
    console.log("Connected to Redis");
});

await redis_client.connect()

export default redis_client;
