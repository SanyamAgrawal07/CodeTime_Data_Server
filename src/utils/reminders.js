const axios = require('axios')
const { format } = require('date-fns')
const getTime = require('./durationTime.js')

const url = process.env.TELE_URL
const apiToken = process.env.API_TOKEN
const min15 = 900000
const hrs1 = 3600000
const hrs12 = 43200000
const hrs36 = 129600000

function sendMessage(contest,hours){
    contest.duration = getTime(contest.duration)
    contest.start_time = format(new Date(contest.start_time),'h:mm a')
    const allUsers = require('../index.js')
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

function sendReminder(contest,hours,myData){
    console.log(`${contest.name} reminder of ${hours} hours`)
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
                sendReminder(contest,12,myData)
            },timeDelay)
        }
        if((timestamp-hrs1-timestampNow)>0){
            const timeDelay = timestamp-hrs1-timestampNow
            setTimeout(()=>{
                sendReminder(contest,1,myData)
            },timeDelay)
        }
    }
}

function setReminderRepeated(myData){
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
                    sendReminder(contest,12,myData)
                },timeDelay)
            }
            if((timestamp-hrs1-timestampNow)>0){
                const timeDelay = timestamp-hrs1-timestampNow
                setTimeout(()=>{
                    sendReminder(contest,1,myData)
                },timeDelay)
            }
        })
    })
}

function setRemindersInitial(myData){
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
                console.log(`${contest.name} in 12`,timeDelay)
                setTimeout(()=>{
                    sendReminder(contest,12,myData)
                },timeDelay)
            }
            if((timestamp-hrs1-timestampNow)>0){
                const timeDelay = timestamp-hrs1-timestampNow
                console.log(`${contest.name} in 1`,timeDelay)
                setTimeout(()=>{
                    sendReminder(contest,1,myData)
                },timeDelay)
            }
        })
    })
}

module.exports = {
    setReminderRepeated,
    setRemindersInitial
}