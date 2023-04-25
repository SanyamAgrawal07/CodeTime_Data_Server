require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const {setRemindersInitial,setReminderRepeated} = require('./utils/reminders.js')
const db = require('./models/index.model.js');
const getData = require('./utils/getData.js')
const {userStats} = require('./controllers/users.controller.js')
const webhookController = require('./controllers/webhook.controller.js')
    
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
})

app.get('/',async (req,res)=>{
    try{
        res.status(200).send(myData)
    }
    catch(e){
        res.status(500).send(e)
    }
})

app.get('/totalusers',userStats)
app.post('/webhook',webhookController)