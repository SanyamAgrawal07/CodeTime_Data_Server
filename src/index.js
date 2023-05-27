require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const redisClient = require('./redis.js')
const {setRemindersInitial,setReminderRepeated} = require('./utils/reminders.js')
const db = require('./models/index.model.js');
const {getData,getApiData} = require('./utils/getData.js')
const {userStats} = require('./controllers/users.controller.js')
const axios = require('axios')
const {getContestsMessage,
    getRecentContests,
    getWeekendContests,
    sendCommandsMessage} = require('./utils/commandTexts.js');

const url = process.env.TELE_URL
const apiToken = process.env.API_TOKEN
    
const app = express()

const port = process.env.PORT || 8000

const min30 = 1800000
const hrs24 = 86400000
app.use(cors())
app.use(bodyParser.json())

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
        setRemindersInitial()
        setInterval(()=>{
            setReminderRepeated()
        },hrs24)
    })
    .catch((e)=>{
        console.log('Failed in the first attempt itself')
        console.log(e)
    })
    setInterval(getData,min30)
    redisClient.connect()
    .then(res=>{
        console.log('Redis connected')
    })
    .catch(err=>{
        console.log('Redis connection error',err)
    })
})

app.get('/',async (req,res)=>{
    try{
        // let myData = await db.apidata.findAll()
        // myData=myData[0].dataValues
        let myData = await getApiData()
        res.status(200).send(myData)
    }
    catch(e){
        res.status(500).send(e)
    }
})

app.get('/totalusers',userStats)


app.post('/webhook',async (req,res)=>{
    console.log(req.body)
    const body = req.body
    try{
        if(body.my_chat_member){
            const chat_id=body.my_chat_member.chat.id
            // console.log(body.my_chat_member.chat.new_chat_member)
            if(body.my_chat_member.chat.type==='private' && body.my_chat_member.new_chat_member.status==='kicked'){
                await db.user.destroy({
                    where: { chat_id },
                });
            }
            return res.sendStatus(200)
        }
        let message = body.message.text
        const chat_id= body.message.chat.id
        let firstname= body.message.from.first_name
        let lastname= body.message.from.last_name
        let user_id=null
        let user_firstname=null
        let user_lastname=null
        let is_group=false
        if(body.message.chat.type==='group' || body.message.chat.type==='supergroup'){
            is_group=true
            user_firstname=firstname
            user_lastname=lastname
            firstname=body.message.chat.title
            lastname=process.env.LASTNAME_SECRET
            user_id=body.message.from.id
            // console.log(body.message.entities)
        }
        if(!message){
            if(body.message.left_chat_member && body.message.left_chat_member.username===process.env.BOT_USERNAME){
                await db.user.destroy({
                    where: { chat_id },
                });
            }
            if(body.message.new_chat_member && body.message.new_chat_member.username===process.env.BOT_USERNAME){
                await db.user.findOrCreate({
                    where: { chat_id: chat_id },
                    defaults: {
                      firstname:firstname,
                      lastname:lastname,
                      at_coder: true
                    }
                });
            }
            return res.sendStatus(200)
        }
        // console.log(chat_id)
        const groupReference=`@${process.env.BOT_USERNAME}`
        if(message.endsWith(groupReference)){
            message=message.substring(0,message.length-groupReference.length)
        }
        console.log(message,chat_id)
        if(is_group){
            await db.user.findOrCreate({
                raw:true,
                where: { chat_id: user_id },
                defaults: {
                  firstname:user_firstname,
                  lastname:user_lastname
                }
            });
        }
        let [currentUser, created] = await db.user.findOrCreate({
            raw:true,
            where: { chat_id: chat_id },
            defaults: {
              firstname:firstname,
              lastname:lastname,
              at_coder: is_group? true : false
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
                text: await getRecentContests(date,currentUser)
            }
            axios.post(`${url}${apiToken}/sendMessage`,options)
            .then((response) => {
                // console.log(response)
                res.sendStatus(200);
            }).catch((error) => {
                // res.status(500).send(error);
                console.log(error)
                res.sendStatus(200)
            });
        }
        else if(message==='/weekend'){
            const options = {
                chat_id: chat_id,
                parse_mode:'Markdown',
                text: await getWeekendContests(currentUser),
            }
            console.log('sending request')
            axios.post(`${url}${apiToken}/sendMessage`,options)
            .then((response) => {
                // console.log(response)
                res.sendStatus(200);
            }).catch((error) => {
                // res.status(500).send(error);
                console.log(error)
                res.sendStatus(200)
            });
            // axios.post(`${url}${apiToken}/sendMessage`,options)
            // .then((response) => {
            //     res.sendStatus(200);
            // }).catch((error) => {
            //     // res.status(500).send(error);
            //     console.log(error)
            //     res.sendStatus(200)
            // });
        }
        else if(message==='/codeforces' || message==='/leetcode' || message==='/atcoder' || message==='/codechef' || message==='/hackerrank'){
            const options = {
                chat_id: chat_id,
                parse_mode:'Markdown',
                text: await getContestsMessage(message)
            }
            axios.post(`${url}${apiToken}/sendMessage`,options)
            .then((response) => {
                res.sendStatus(200);
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
                res.sendStatus(200);
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
                res.sendStatus(200)
            }).catch((error) => {
                res.sendStatus(200)
            });
        }
        else if(message==='/start' || message==='/help'){
            console.log('inside extra')
            sendCommandsMessage(res,chat_id,currentUser)
        }
        else{
            if(!is_group){
                const options = {
                    chat_id: chat_id,
                    parse_mode:'Markdown',
                    text: `Unrecognized command! Say what?`
                }
                axios.post(`${url}${apiToken}/sendMessage`,options)
                .then((response) => {
                    res.sendStatus(200)
                }).catch((error) => {
                    res.sendStatus(200)
                });
            }
            else{
                res.sendStatus(200)
            }
        }
    }
    catch(e){
        console.log(e)
        res.sendStatus(200)
    }
})