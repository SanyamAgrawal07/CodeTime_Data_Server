const redis = require('redis')

let redisClient
async function redisInit(){
    try{
        const host = process.env.REDIS_HOSTNAME
        const port = process.env.REDIS_PORT
        redisClient = redis.createClient({
            password: process.env.REDIS_PASSWORD,
            socket: {
                host,
                port
            }
        })
        // console.log(host,port)
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