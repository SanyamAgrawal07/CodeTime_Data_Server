const { format } = require('date-fns')
const getTime = require('./durationTime.js')
const axios = require('axios')

const url = process.env.TELE_URL
const apiToken = process.env.API_TOKEN
// const hr5min30 = 19800000

function getCommandsMessage(){
    let s = `The following commands are supported at this moment for the upcoming contests:
*Cf* - Codeforces
*Cc* - Codechef
*Lc* - Leetcode
*Ac* - Atcoder
*Recent* - Contests on upcoming two days
*Weekend* - Contests on upcoming weekend
*Help* - To get this list of commands`
return s
}

function getWeekendContests(myData){
    const arr = ['codeforces','code_chef','leet_code','at_coder']
    let overall = false
    const hrs24 = 86400
    let s=`Upcoming contests on this weekend🔥
    
`
    arr.forEach((plat)=>{
        let contestData = myData[plat]
        contestData = contestData.filter((ele)=>ele.status==="BEFORE")
        contestData.sort((a, b) => (a.start_time > b.start_time) ? 1 : -1)
        let first = true
        contestData.forEach((con)=>{
            let timestamp = new Date(con.start_time)
            // timestamp = (Math.floor(timestamp/1000))
            // console.log(timestamp,endTime)
            const date1 = new Date()
            const time_difference = timestamp.getTime() - date1.getTime();  
            const days_difference = time_difference / (1000 * hrs24);  
            if((timestamp.getDay()===0 || timestamp.getDay()===6) && days_difference<7){
                overall=true
                if(first){
                    first=false
                    let label
                    if(plat=='codeforces') label='Codeforces'
                    if(plat=='code_chef') label='CodeChef'
                    if(plat=='leet_code') label='LeetCode'
                    if(plat=='at_coder') label='AtCoder'
                    let s1 = `*${label}*
`
                    s+=s1
                }
                let s1 = `
[${con.name}](${con.url})
Date: ${format(timestamp,'dd MMM',{ timeZone: 'Asia/Kolkata' })}
Time: ${format(timestamp,'h:mm a',{ timeZone: 'Asia/Kolkata' })}
Duration: ${getTime(con.duration)}
`
                s+=s1
            }
        })
        if(!first){
            s+=`
`
        }
    })
    if(!overall){
        s=`There are no upcoming contests on this weekend!☹️`
    }
    return s
}

function getRecentContests(date,myData){
    const arr = ['codeforces','code_chef','leet_code','at_coder']
    const hrs24 = 86400
    const startOfDay = date-(date%hrs24)+hrs24
    const endTime = startOfDay+hrs24+hrs24
    console.log(startOfDay,endTime)
    let overall = false
    let s=`Upcoming latest contests🔥
    
`
    arr.forEach((plat)=>{
        let contestData = myData[plat]
        contestData = contestData.filter((ele)=>ele.status==="BEFORE")
        contestData.sort((a, b) => (a.start_time > b.start_time) ? 1 : -1)
        let first = true
        contestData.forEach((con)=>{
            let timestamp = new Date(con.start_time).getTime();
            timestamp = (Math.floor(timestamp/1000))
            // console.log(timestamp,endTime)
            if(timestamp<endTime){
                overall=true
                if(first){
                    first=false
                    let label
                    if(plat=='codeforces') label='Codeforces'
                    if(plat=='code_chef') label='CodeChef'
                    if(plat=='leet_code') label='LeetCode'
                    if(plat=='at_coder') label='AtCoder'
                    let s1 = `*${label}*
`
                    s+=s1
                }
                let timestamp2 = new Date(con.start_time)
                let s1 = `
[${con.name}](${con.url})
Date: ${format(timestamp2,'dd MMM',{ timeZone: 'Asia/Kolkata' })}
Time: ${format(timestamp2,'h:mm a',{ timeZone: 'Asia/Kolkata' })}
Duration: ${getTime(con.duration)}
`
                s+=s1
            }
        })
        if(!first){
            s+=`
`
        }
    })
    if(!overall){
        s=`There are no upcoming contests in the next two days!☹️`
    }
    return s
}

function getContestsMessage(sh,myData){
    let platform
    let label
    if(sh==='cf'){ 
        platform='codeforces'
        label='Codeforces'
    }
    if(sh==='cc'){ 
        platform='code_chef'
        label='CodeChef'
    }
    if(sh==='lc'){ 
        platform='leet_code'
        label='LeetCode'
    }
    if(sh==='ac'){ 
        platform='at_coder'
        label='AtCoder'
    }
    let contestData = myData[platform]
    contestData = contestData.filter((ele)=>ele.status==="BEFORE")
    contestData.sort((a, b) => (a.start_time > b.start_time) ? 1 : -1)
    const end = Math.min(contestData.length,3)
    contestData=contestData.slice(0,end)
    let s=`*Upcoming contests on ${label}*

`
    contestData.forEach((con)=>{
        let timestamp = new Date(con.start_time)
        console.log(timestamp)
        let s1 = `
[${con.name}](${con.url})
Date: ${format(timestamp,'dd MMM',{ timeZone: 'Asia/Kolkata' })}
Time: ${format(timestamp,'h:mm a',{ timeZone: 'Asia/Kolkata' })}
Duration: ${getTime(con.duration)}
`
        s+=s1
    })
    s+=`
_Don't forget to register!_`
    return s
}

function sendCommandsMessage(res,chat_id){
    const options = {
        chat_id: chat_id,
        parse_mode:'Markdown',
        text: getCommandsMessage()
    }
    axios.post(`${url}${apiToken}/sendMessage`,options)
    .then((response) => {
        res.status(200).send(response);
    }).catch((error) => {
        // res.status(500).send(error);
        res.sendStatus(200)
    });
}

module.exports = {
    sendCommandsMessage,
    getContestsMessage,
    getRecentContests,
    getWeekendContests
}