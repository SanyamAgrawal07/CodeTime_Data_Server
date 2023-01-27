const express = require('express')
const axios = require('axios')
const cors = require('cors')

const app = express()
const port = process.env.PORT || 8000

app.use(cors())

let api_calls
let myData={
    code_chef:{},
    codeforces:{},
    leet_code:{},
    at_coder:{}
}

async function getData(){
    api_calls=api_calls+1
    try{
        let response = await axios.get('https://kontests.net/api/v1/codeforces');
        myData.codeforces = response.data

        response = await axios.get('https://kontests.net/api/v1/code_chef');
        // data = response
        myData.code_chef = response.data

        response = await axios.get('https://kontests.net/api/v1/leet_code');
        // data = response
        myData.leet_code = response.data

        response = await axios.get('https://kontests.net/api/v1/at_coder');
        // data = response
        myData.at_coder = response.data
    }
    catch(e){
        console.log('Failed to fetch data from the api')
        console.log(e)
    }
}

app.listen(port, ()=>{
    getData()
    .then(response=>{
        console.log('app is running on '+port)
        // console.log(myData)
        api_calls=1
    })
    .catch((e)=>{
        console.log('Failed in the first attempt itself')
        console.log(e)
    })
    setInterval(getData,1800000)
})

app.get('/',async (req,res)=>{
    try{
        res.status(200).send(myData)
    }
    catch(e){
        res.status(500).send(e)
    }
})