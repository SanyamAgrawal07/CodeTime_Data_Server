const axios = require('axios')
const redisClient = require('../redis.js')
const db = require('../models/index.model.js');

async function getData(){
    try{
        let myData={
            code_chef:{},
            codeforces:{},
            leet_code:{},
            at_coder:{}
        }

        let response = await axios.get(process.env.CODEFORCES_URL);
        myData.codeforces = response.data

        response = await axios.get(process.env.CODECHEF_URL);
        // data = response
        myData.code_chef = response.data

        response = await axios.get(process.env.LEETCODE_URL);
        // data = response
        myData.leet_code = response.data

        response = await axios.get(process.env.ATCODER_URL);
        // data = response
        myData.at_coder = response.data

        response = await axios.get(process.env.HACKERRANK_URL);
        // data = response
        myData.hacker_rank = response.data

        // console.log(myData)
        await db.apidata.destroy({where:{}})
        await db.apidata.create(myData)
        console.log('Api data set in table')
        await redisClient.set('apidata', JSON.stringify(myData))
        console.log('Redis data set')
    }
    catch(e){
        console.log('Failed to fetch data from the api')
        console.log(e)
    }
}

async function getApiData(){
    let myData = await redisClient.get('apidata')
    if(myData){ 
        myData = JSON.parse(myData)
        console.log('Got my data from redis')
        return myData
    }
    myData = await db.apidata.findAll()
    myData=myData[0].dataValues
    await redisClient.set('apidata', JSON.stringify(myData),{
        EX: 1800
    })
    console.log('Not from redis')
    return myData
}

module.exports = {
    getData,
    getApiData
}