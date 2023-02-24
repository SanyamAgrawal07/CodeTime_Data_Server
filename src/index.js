const express = require('express')
const axios = require('axios')
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()
const { format } = require('date-fns')

const app = express()
const url = process.env.TELE_URL
const apiToken = process.env.API_TOKEN
const port = process.env.PORT || 8000

const min30 = 1800000
const min15 = 900000
const hrs1 = 3600000
const hrs12 = 43200000
const hrs24 = 86400000
const hrs36 = 129600000

app.use(cors())
app.use(bodyParser.json())

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

function getTime(duration){
    const min = duration/60
    if(min%60===0){
        return (`${min/60} hr`)
    }
    else{
        return (`${Math.floor(min/60)} hr ${min%60} min`)
    }
}

function sendMessage(contest,hours){
    contest.duration = getTime(contest.duration)
    contest.start_time = format(new Date(contest.start_time),'h:mm a')
    allUsers.forEach((user)=>{
        const options = {
            chat_id: user,
            parse_mode:'Markdown',
            text: 
            `*Contest Reminder!*
${contest.name} is about to start in ${hours} hours!
Duration: ${contest.duration}
Time: ${contest.start_time}
_Don't forget to register!_
[Contest URL](${contest.url})`
        }
        axios.post(`${url}${apiToken}/sendMessage`,options)
        .then((response) => { 
            console.log(response)
        }).catch((error) => {
            console.log(error)
        });
    })
}

function sendReminder(contest,hours){
    const arr = ['codeforces','code_chef','leet_code','at_coder']
    const totalData = myData
    arr.forEach((platform)=>{
        const contestData = totalData[platform]
        const requiredData = contestData.filter((ele)=>{
            ele.name===contest.name
        })
        if(requiredData.length===1){
            contest=requiredData[0]
        }
        else{
            return
        }
    })
    let timestamp = new Date(contest.start_time).getTime();
    timestamp = (Math.floor(timestamp))
    let timestampNow = Date.now()
    const ideal = hours*hrs1
    if((timestamp-timestampNow)>=(ideal-min15) && (timestamp-timestampNow)<=(ideal+min15)){
        console.log(`${contest.name} starting in ${hours} hours!`)
        sendMessage(contest,hours)
    }
    else{
        if((timestamp-timestampNow)>hrs12) return
        if((timestamp-hrs12-timestampNow)>0){
            const timeDelay = timestamp-hrs12-timestampNow
            setTimeout(()=>{
                sendReminder(contest,12)
            },timeDelay)
        }
        if((timestamp-hrs1-timestampNow)>0){
            const timeDelay = timestamp-hrs1-timestampNow
            setTimeout(()=>{
                sendReminder(contest,1)
            },timeDelay)
        }
    }
}

function setReminderRepeated(){
    const arr = ['codeforces','code_chef','leet_code','at_coder']
    const totalData=myData
    arr.forEach((platform)=>{
        let contestData = totalData[platform]
        contestData.forEach((contest)=>{
            let timestamp = new Date(contest.start_time).getTime();
            timestamp = (Math.floor(timestamp))
            let timestampNow = Date.now();
            if((timestamp-timestampNow)>hrs36) return
            if((timestamp-timestampNow)<hrs12) return
            if((timestamp-hrs12-timestampNow)>0){
                const timeDelay = timestamp-hrs12-timestampNow
                setTimeout(()=>{
                    sendReminder(contest,12)
                },timeDelay)
            }
            if((timestamp-hrs1-timestampNow)>0){
                const timeDelay = timestamp-hrs1-timestampNow
                setTimeout(()=>{
                    sendReminder(contest,1)
                },timeDelay)
            }
        })
    })
}

function setRemindersInitial(){
    const arr = ['codeforces','code_chef','leet_code','at_coder']
    const totalData = myData
    arr.forEach((platform)=>{
        let contestData = totalData[platform]
        contestData.forEach((contest)=>{
            let timestamp = new Date(contest.start_time).getTime();
            timestamp = (Math.floor(timestamp))
            let timestampNow = Date.now();
            if((timestamp-timestampNow)>hrs36) return
            if((timestamp-hrs12-timestampNow)>0){
                const timeDelay = timestamp-hrs12-timestampNow
                console.log(`${contest.name} in 12`)
                setTimeout(()=>{
                    sendReminder(contest,12)
                },timeDelay)
            }
            if((timestamp-hrs1-timestampNow)>0){
                console.log(`${contest.name} in 1`)
                const timeDelay = timestamp-hrs1-timestampNow
                setTimeout(()=>{
                    sendReminder(contest,1)
                },timeDelay)
            }
        })
    })
}

app.listen(port, ()=>{
    getData()
    .then(response=>{
        console.log('app is running on '+port)
        api_calls=1
        // myData.codeforces.push({
        //     name: "Codeforces Round Meri marzi",
        //     url: "https://codeforces.com/contestRegistration/1789",
        //     start_time: "2023-02-22T20:30:00.000Z",
        //     end_time: "2023-02-22T22:30:00.000Z",
        //     duration: "7200",
        //     in_24_hours: "Yes",
        //     status: "BEFORE"
        // })
        setRemindersInitial()
        setInterval(setReminderRepeated,hrs24)
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
    const message = req.body.message.text
    const chat_id= body.message.chat.id
    const firstName = body.message.chat.first_name
    if(message==='/start'){
        console.log('inside start')
        if(!allUsers.includes(chat_id)){
            allUsers.push(chat_id)
            const options = {
                chat_id: chat_id,
                parse_mode:'Markdown',
                text: `*Welcome* ${firstName}⭐
You will be receiving reminders for contests happening on Codeforces,Codechef,Leetcode and Atcoder here!`
            }
            axios.post(`${url}${apiToken}/sendMessage`,options)
            .then((response) => {
                res.status(200).send(response);
            }).catch((error) => {
                res.status(500).send(error);
            });
        }
        else{
            res.sendStatus(200)
        }
    }
    else{
        res.sendStatus(200)
    }
})