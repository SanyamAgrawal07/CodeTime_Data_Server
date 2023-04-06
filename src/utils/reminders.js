const axios = require('axios')
const { utcToZonedTime,format } = require('date-fns-tz')
const getTime = require('./durationTime.js')
const db = require('../models/index.model.js');

const url = process.env.TELE_URL
const apiToken = process.env.API_TOKEN
const istTimezone = 'Asia/Kolkata'
const min15 = 900000
const hrs1 = 3600000
const hrs12 = 43200000
const hrs36 = 129600000

async function sendMessage(contest,hours){
    console.log(contest.name,hours)
    const timestamp = new Date(contest.start_time)
    let zonedTime = utcToZonedTime(timestamp,istTimezone)
    const allUsers =await db.user.findAll({raw:true,attributes: ['chat_id']})
    console.log(allUsers)
    allUsers.forEach((user)=>{
        const options = {
            chat_id: user.chat_id,
            parse_mode:'Markdown',
            text: 
            `*Contest Reminder!*
${contest.name} is about to start in ${hours} hours!
Date: ${format(zonedTime,'dd MMM',{ timeZone: istTimezone })}
Time: ${format(zonedTime,'h:mm a',{ timeZone: istTimezone })}
Duration: ${getTime(contest.duration)}
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

async function sendReminder(contest,hours){
    console.log(`${contest.name} reminder of ${hours} hours`)
    const arr = ['codeforces','code_chef','leet_code','at_coder']
    let myData = await db.apidata.findAll()
    myData=myData[0].dataValues
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
        .then((res)=>{
            console.log('Message sent to all users')
        })
        .catch((e)=>{
            console.log('SendMessage promise error:',e)
        })
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

async function setReminderRepeated(){
    const arr = ['codeforces','code_chef','leet_code','at_coder']
    let myData = await db.apidata.findAll()
    myData=myData[0].dataValues
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

async function setRemindersInitial(){
    const arr = ['codeforces','code_chef','leet_code','at_coder']
    let myData = await db.apidata.findAll()
    myData=myData[0].dataValues
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
                console.log(`${contest.name} in 12`,timeDelay)
                setTimeout(()=>{
                    sendReminder(contest,12)
                },timeDelay)
            }
            if((timestamp-hrs1-timestampNow)>0){
                const timeDelay = timestamp-hrs1-timestampNow
                console.log(`${contest.name} in 1`,timeDelay)
                setTimeout(()=>{
                    sendReminder(contest,1)
                },timeDelay)
            }
        })
    })
}

module.exports = {
    setReminderRepeated,
    setRemindersInitial
}