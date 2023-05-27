const redis = require('redis')

let redisClient
async function redisInit(){
    try{
        redisClient = redis.createClient({
            host: process.env.REDIS_HOSTNAME,
            port: process.env.REDIS_PORT,
            // password: process.env.REDIS_PASSWORD
        })
        redisClient.on("error", (error) => console.error(`Error : ${error}`));
    }
    catch(err){
        console.log('redis init error',err)
    }
}

function returnClient(){
    if(!redisClient){
        let done = false
        redisInit()
        .then(res=>{
            done=true
        })
    }
    return redisClient
}

module.exports = returnClient()