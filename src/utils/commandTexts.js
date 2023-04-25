// const { format } = require('date-fns')
const { utcToZonedTime,format } = require('date-fns-tz')
const getTime = require('./durationTime.js')
const axios = require('axios')
const db = require('../models/index.model.js');

const url = process.env.TELE_URL
const apiToken = process.env.API_TOKEN
const istTimezone = 'Asia/Kolkata'
// const hr5min30 = 19800000

function getCommandsMessage(currentUser){
    let s = `Hello ${currentUser.firstname}✌️

The following commands are supported at this moment for the upcoming contests:

*/recent* - Contests on upcoming two days
*/weekend* - Contests on upcoming weekend
*/codeforces* - Codeforces
*/codechef* - Codechef
*/leetcode* - Leetcode
*/atcoder* - Atcoder
*/hackerrank* - HackerRank
*/help* - To get this list of commands


In some commands you will only receive information for the platforms you select,modify them by:

`

const arr = ['codeforces','code_chef','leet_code','at_coder','hacker_rank']
arr.forEach((sh)=>{
    let label
    let platform
    if(sh==='codeforces'){ 
        platform='codeforces'
        label='Codeforces'
    }
    if(sh==='code_chef'){ 
        platform='codechef'
        label='CodeChef'
    }
    if(sh==='leet_code'){ 
        platform='leetcode'
        label='LeetCode'
    }
    if(sh==='at_coder'){ 
        platform='atcoder'
        label='AtCoder'
    }
    if(sh==='hacker_rank'){ 
        platform='hackerrank'
        label='HackerRank'
    }
    if(!currentUser[sh]) s+=`/add${platform} - *Add* ${label}
`
    else{
        s+=`/remove${platform} - *Remove* ${label}
`
    }
})

return s
}

async function getWeekendContests(currentUser){
    let arr = ['codeforces','code_chef','leet_code','at_coder','hacker_rank']
    arr = arr.filter((plat)=> currentUser[plat])
    let overall = false
    const hrs24 = 86400
    let s=`Upcoming contests on this weekend🔥
    
`

    let myData = await db.apidata.findAll()
    myData=myData[0].dataValues
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
                    if(plat=='hacker_rank') label='HackerRank'
                    let s1 = `*${label}*
`
                    s+=s1
                }
                let zonedTime = utcToZonedTime(timestamp,istTimezone)
                let s1 = `
[${con.name}](${con.url})
Date: ${format(zonedTime,'dd MMM',{ timeZone: istTimezone })}
Time: ${format(zonedTime,'h:mm a',{ timeZone: istTimezone })}
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

async function getRecentContests(date,currentUser){
    try{
        let arr = ['codeforces','code_chef','leet_code','at_coder','hacker_rank']
        arr = arr.filter((plat)=> currentUser[plat])
        // console.log(arr)
        const hrs24 = 86400
        const startOfDay = date-(date%hrs24)+hrs24
        const endTime = startOfDay+hrs24+hrs24
        console.log(startOfDay,endTime)
        let overall = false
        let s=`Upcoming latest contests🔥
        
    `
    
        let myData = await db.apidata.findAll()
        myData=myData[0].dataValues
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
                        if(plat=='hacker_rank') label='HackerRank'
                        let s1 = `*${label}*
    `
                        s+=s1
                    }
                    let timestamp2 = new Date(con.start_time)
                    timestamp2=utcToZonedTime(timestamp2,istTimezone)
                    let s1 = `
    [${con.name}](${con.url})
    Date: ${format(timestamp2,'dd MMM',{ timeZone: istTimezone })}
    Time: ${format(timestamp2,'h:mm a',{ timeZone: istTimezone })}
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
        // console.log(s)
        return s
    }
    catch(err){
        console.log(err)
    }
}

async function getContestsMessage(sh){
    let platform
    let label
    if(sh==='/codeforces'){ 
        platform='codeforces'
        label='Codeforces'
    }
    if(sh==='/codechef'){ 
        platform='code_chef'
        label='CodeChef'
    }
    if(sh==='/leetcode'){ 
        platform='leet_code'
        label='LeetCode'
    }
    if(sh==='/atcoder'){ 
        platform='at_coder'
        label='AtCoder'
    }
    if(sh==='/hackerrank'){ 
        platform='hacker_rank'
        label='HackerRank'
    }
    let myData = await db.apidata.findAll()
    myData=myData[0].dataValues
    let contestData = myData[platform]
    contestData = contestData.filter((ele)=>ele.status==="BEFORE")
    contestData.sort((a, b) => (a.start_time > b.start_time) ? 1 : -1)
    const end = Math.min(contestData.length,3)
    contestData=contestData.slice(0,end)
    let s=`*Upcoming contests on ${label}*

`
    contestData.forEach((con)=>{
        let timestamp = new Date(con.start_time)
        let zonedTime = utcToZonedTime(timestamp,istTimezone)
        // console.log(timestamp)
        let s1 = `
[${con.name}](${con.url})
Date: ${format(zonedTime,'dd MMM',{ timeZone: istTimezone })}
Time: ${format(zonedTime,'h:mm a',{ timeZone: istTimezone })}
Duration: ${getTime(con.duration)}
`
        s+=s1
    })
    s+=`
_Don't forget to register!_`
    return s
}

function sendCommandsMessage(res,chat_id,currentUser){
    const options = {
        chat_id: chat_id,
        parse_mode:'Markdown',
        text: getCommandsMessage(currentUser)
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