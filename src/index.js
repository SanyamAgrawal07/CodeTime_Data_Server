const express = require('express')
const axios = require('axios')
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()
const {getContestsMessage,
    getRecentContests,
    getWeekendContests,
    sendCommandsMessage} = require('./utils/commandTexts.js');
const {setRemindersInitial,setReminderRepeated} = require('./utils/reminders.js')

const app = express()
const url = process.env.TELE_URL
const apiToken = process.env.API_TOKEN
const port = process.env.PORT || 8000

const min30 = 1800000
const hrs24 = 86400000

app.use(cors())
app.use(bodyParser.json())
// app.use(commandsRouter)

let api_calls
let myData={
    code_chef:{},
    codeforces:{},
    leet_code:{},
    at_coder:{}
}

let allUsers = [665198762,1873008929]

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
        api_calls=1
        setRemindersInitial(myData)
        setInterval(()=>{
            setReminderRepeated(myData)
        },hrs24)
    })
    .catch((e)=>{
        console.log('Failed in the first attempt itself')
        console.log(e)
    })
    setInterval(getData,min30)
})

app.get('/',async (req,res)=>{
    try{
        res.status(200).send(myData)
    }
    catch(e){
        res.status(500).send(e)
    }
})

app.post('/webhook',(req,res)=>{
    console.log(req.body)
    const body = req.body
    const message = req.body.message.text.toLowerCase().trim()
    const chat_id= body.message.chat.id
    if(!allUsers.includes(chat_id)) allUsers.push(chat_id)
    // const firstName = body.message.chat.first_name
    if(message==='/recent'){
        const date= body.message.date
        const options = {
            chat_id: chat_id,
            parse_mode:'Markdown',
            text: getRecentContests(date,myData)
        }
        axios.post(`${url}${apiToken}/sendMessage`,options)
        .then((response) => {
            res.status(200).send(response);
        }).catch((error) => {
            // res.status(500).send(error);
            res.sendStatus(200)
        });
    }
    else if(message==='/weekend'){
        const options = {
            chat_id: chat_id,
            parse_mode:'Markdown',
            text: getWeekendContests(myData)
        }
        axios.post(`${url}${apiToken}/sendMessage`,options)
        .then((response) => {
            res.status(200).send(response);
        }).catch((error) => {
            // res.status(500).send(error);
            res.sendStatus(200)
        });
    }
    else if(message==='/codeforces' || message==='/leetcode' || message==='/atcoder' || message==='/codechef'){
        const options = {
            chat_id: chat_id,
            parse_mode:'Markdown',
            text: getContestsMessage(message,myData)
        }
        axios.post(`${url}${apiToken}/sendMessage`,options)
        .then((response) => {
            res.status(200).send(response);
        }).catch((error) => {
            // res.status(500).send(error);
            res.sendStatus(200)
        });
    }
    else if(message==='/start' || message==='/help'){
        console.log('inside extra')
        sendCommandsMessage(res,chat_id)
    }
    else{
        res.sendStatus(200)
    }
})

module.exports = allUsers