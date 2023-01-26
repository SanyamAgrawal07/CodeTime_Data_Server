// import express from 'express'
const express = require('express')

const app = express()
const port = process.env.PORT || 8000

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
        let response = await fetch('https://kontests.net/api/v1/codeforces');
        var data = await response.json();
        myData.codeforces = data

        response = await fetch('https://kontests.net/api/v1/code_chef');
        data = await response.json();
        myData.code_chef = data

        response = await fetch('https://kontests.net/api/v1/leet_code');
        data = await response.json();
        myData.leet_code = data

        response = await fetch('https://kontests.net/api/v1/at_coder');
        data = await response.json();
        myData.at_coder = data
    }
    catch(e){
        // res.status(500).send('Failed to fetch data from the api')
        console.log('Failed to fetch data from the api')
        console.log(e)
    }
}

app.listen(port, ()=>{
    getData()
    .then(response=>{
        console.log('app is running on '+port)
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