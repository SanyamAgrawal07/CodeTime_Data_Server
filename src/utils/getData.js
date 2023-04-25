const axios = require('axios')
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
    }
    catch(e){
        console.log('Failed to fetch data from the api')
        console.log(e)
    }
}

module.exports = getData