const db = require('../models/index.model.js');

async function userStats(req,res){
    try{
        const username=req.body.username
        const password=req.body.password
        if(username!==process.env.STAT_USER || password!==process.env.STAT_PASS){
            res.status(403).send('👀😂😂')
            return
        }
        // console.log('statistics!')
        const { count, rows } = await db.user.findAndCountAll({attributes:['firstname','lastname']})
        let returnObj={
            count
        }
        let arr1=[]
        let arr2=[]
        rows.forEach((row)=>{
            const myUser=row.dataValues
            if(myUser.lastname===process.env.LASTNAME_SECRET){
                arr2.push(myUser.firstname)
            }
            else{
                arr1.push(myUser.firstname)
            }
        })
        returnObj.indivisuals=arr1
        returnObj.groups=arr2
        // console.log(rows)
        res.status(200).send(returnObj)
    }
    catch(e){
        res.status(500).send(e)
    }
}

module.exports = {
    userStats
}