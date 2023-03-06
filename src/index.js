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
const db = require('./models/index.model.js');
    
const app = express()
const url = process.env.TELE_URL
const apiToken = process.env.API_TOKEN
const port = process.env.PORT || 8000

const min30 = 1800000
const hrs24 = 86400000

app.use(cors())
app.use(bodyParser.json())

let api_calls
let myData={
    code_chef:{},
    codeforces:{},
    leet_code:{},
    at_coder:{}
}

// let allUsers = [665198762,1873008929]

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

        response = await axios.get('https://kontests.net/api/v1/hacker_rank');
        // data = response
        myData.hacker_rank = response.data
    }
    catch(e){
        console.log('Failed to fetch data from the api')
        console.log(e)
    }
}

app.listen(port, ()=>{
    db.sequelize.sync()
    .then(() => {
        console.log("Synced db.");
    })
    .catch((err) => {
        console.log("Failed to sync db: " + err.message);
    });
    getData()
    .then(response=>{
        console.log('app is running on '+port)
        // myData.codeforces.push({
        //     name: "Codeforces Round Sample",
        //     url: "https://codeforces.com/contestRegistration/1789",
        //     start_time: "2023-03-06T11:53:00.000Z",
        //     end_time: "2023-03-06T04:55:00.000Z",
        //     duration: "7700",
        //     in_24_hours: "Yes",
        //     status: "BEFORE"
        // })
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

app.post('/webhook',async (req,res)=>{
    console.log(req.body)
    const body = req.body
    const message = req.body.message.text.toLowerCase().trim()
    const chat_id= body.message.chat.id
    const firstname= body.message.chat.first_name
    const lastname= body.message.chat.last_name
    // if(!allUsers.includes(chat_id)) allUsers.push(chat_id)
    try{
        // console.log(chat_id)
        let [currentUser, created] = await db.user.findOrCreate({
            raw:true,
            where: { chat_id: chat_id },
            defaults: {
              firstname:firstname,
              lastname:lastname
            }
        });
        if(created) currentUser=currentUser.dataValues
        console.log(currentUser,created)
        // const currentUser = await db.user.findOne({where: { chat_id: chat_id } })
        // if (currentUser === null) {
        //     console.log('Not found!');
        // }
        // else{
        //     console.log('user found')
        // }
        // const firstName = body.message.chat.first_name
        if(message==='/recent'){
            const date= body.message.date
            const options = {
                chat_id: chat_id,
                parse_mode:'Markdown',
                text: getRecentContests(date,currentUser,myData)
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
                text: getWeekendContests(currentUser,myData)
            }
            axios.post(`${url}${apiToken}/sendMessage`,options)
            .then((response) => {
                res.status(200).send(response);
            }).catch((error) => {
                // res.status(500).send(error);
                res.sendStatus(200)
            });
        }
        else if(message==='/codeforces' || message==='/leetcode' || message==='/atcoder' || message==='/codechef' || message==='/hackerrank'){
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
        else if(message.startsWith('/add')){
            console.log(message)
            const plat = message.substring(4).toLowerCase().trim()
            let official
            let label
            if(plat==='codeforces') official='codeforces',label='Codeforces'
            else if(plat==='codechef') official='code_chef',label='CodeChef'
            else if(plat==='leetcode') official='leet_code',label='LeetCode'
            else if(plat==='atcoder') official='at_coder',label='AtCoder'
            else if(plat==='hackerrank') official='hacker_rank',label='HackerRank'
            else{
                res.sendStatus(200)
            }
            let updatedInfo = {
                firstname: firstname,
                lastname: lastname
            }
            updatedInfo[official]=true
            currentUser[official]=true
            await db.user.update(updatedInfo,{
                where:{ chat_id:chat_id }
            })
            const options = {
                chat_id: chat_id,
                parse_mode:'Markdown',
                text: `${label} has been succesfully added! */help*`
            }
            axios.post(`${url}${apiToken}/sendMessage`,options)
            .then((response) => {
                res.status(200).send(response);
            }).catch((error) => {
                res.sendStatus(200)
            });
        }
        else if(message.startsWith('/remove')){
            console.log(message)
            const plat = message.substring(7).toLowerCase().trim()
            let official
            let label
            if(plat==='codeforces') official='codeforces',label='Codeforces'
            else if(plat==='codechef') official='code_chef',label='CodeChef'
            else if(plat==='leetcode') official='leet_code',label='LeetCode'
            else if(plat==='atcoder') official='at_coder',label='AtCoder'
            else if(plat==='hackerrank') official='hacker_rank',label='HackerRank'
            else{
                res.sendStatus(200)
            }
            let updatedInfo = {
                firstname: firstname,
                lastname: lastname
            }
            updatedInfo[official]=false
            currentUser[official]=false
            await db.user.update(updatedInfo,{
                where:{ chat_id:chat_id }
            })
            const options = {
                chat_id: chat_id,
                parse_mode:'Markdown',
                text: `${label} has been succesfully removed! */help*`
            }
            axios.post(`${url}${apiToken}/sendMessage`,options)
            .then((response) => {
                res.status(200).send(response);
            }).catch((error) => {
                res.sendStatus(200)
            });
        }
        else if(message==='/start' || message==='/help'){
            console.log('inside extra')
            sendCommandsMessage(res,chat_id,currentUser)
        }
        else{
            res.sendStatus(200)
        }
    }
    catch(e){
        console.log(e)
        res.sendStatus(200)
    }
})

// module.exports = allUsers